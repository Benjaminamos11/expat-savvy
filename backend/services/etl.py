"""
ETL Service for AI Growth Ops Data Foundation
Handles daily data aggregation from Plausible Analytics and Google Search Console
"""

import os
import asyncio
from datetime import datetime, timedelta, date
from typing import Dict, Any, Optional, List
import httpx
from google.oauth2 import service_account
from googleapiclient.discovery import build
import json
import uuid

from database import get_supabase
from services.plausible import PlausibleService

class ETLService:
    def __init__(self):
        self.plausible = PlausibleService()
        self.gsc_credentials = None
        self.gsc_service = None
        self.gsc_property_url = os.getenv("GSC_PROPERTY_URL", "https://expat-savvy.ch/")
        
        # Initialize GSC if credentials available
        self._init_gsc()
    
    def _init_gsc(self):
        """Initialize Google Search Console API service"""
        try:
            gsc_creds_json = os.getenv("GSC_SERVICE_ACCOUNT_JSON")
            if gsc_creds_json:
                creds_info = json.loads(gsc_creds_json)
                self.gsc_credentials = service_account.Credentials.from_service_account_info(
                    creds_info,
                    scopes=['https://www.googleapis.com/auth/webmasters.readonly']
                )
                self.gsc_service = build('webmasters', 'v3', credentials=self.gsc_credentials)
                print("✅ Google Search Console service initialized")
            else:
                print("⚠️ GSC_SERVICE_ACCOUNT_JSON not found - GSC ETL disabled")
        except Exception as e:
            print(f"❌ GSC initialization error: {str(e)}")
            self.gsc_service = None

    async def run_daily_plausible_etl(self, target_date: Optional[str] = None) -> bool:
        """
        Aggregate Plausible data by day/props to events_daily table
        
        Args:
            target_date: Date string in YYYY-MM-DD format, defaults to yesterday
        """
        try:
            if not target_date:
                target_date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
            
            print(f"🔄 Starting Plausible ETL for {target_date}")
            
            supabase = get_supabase()
            
            # Get breakdown data from Plausible by properties
            breakdown_data = await self._get_plausible_breakdown(target_date)
            
            if not breakdown_data:
                print(f"⚠️ No Plausible data for {target_date}")
                return False
            
            # Process and insert into events_daily
            rows_inserted = 0
            for entry in breakdown_data:
                daily_record = {
                    'id': str(uuid.uuid4()),
                    'date': target_date,
                    'page_path': entry.get('page_path'),
                    'page_type': entry.get('page_type'),
                    'city': entry.get('city'),
                    'channel': entry.get('channel'),
                    'source': entry.get('source'),
                    'campaign': entry.get('campaign'),
                    'flow': entry.get('flow'),
                    'pageviews': entry.get('pageviews', 0),
                    'quote_starts': entry.get('quote_flow_started', 0),
                    'quote_submits': entry.get('quote_submitted', 0),
                    'consultation_starts': entry.get('consultation_started', 0),
                    'bookings': entry.get('consultation_booked', 0),
                    'leads': entry.get('lead_created', 0)
                }
                
                # Upsert to handle duplicates
                result = supabase.table("events_daily").upsert(
                    daily_record,
                    on_conflict="date,page_path,page_type,city,channel,source,campaign,flow"
                ).execute()
                
                if result.data:
                    rows_inserted += 1
            
            print(f"✅ Plausible ETL completed: {rows_inserted} rows for {target_date}")
            return True
            
        except Exception as e:
            print(f"❌ Plausible ETL error: {str(e)}")
            return False

    async def _get_plausible_breakdown(self, date: str) -> List[Dict[str, Any]]:
        """Get breakdown data from Plausible API with properties"""
        if not self.plausible.api_key:
            print("❌ Plausible API key not configured")
            return []
        
        try:
            # Get breakdown by page and custom properties
            url = f"{self.plausible.stats_api_url}/breakdown"
            
            # Get page breakdown with custom properties
            params = {
                "site_id": self.plausible.domain,
                "period": "day",
                "date": date,
                "property": "event:page",
                "metrics": "visitors,pageviews,events",
                "limit": 1000
            }
            
            headers = {
                "Authorization": f"Bearer {self.plausible.api_key}",
                "Content-Type": "application/json"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params, headers=headers, timeout=30.0)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Transform Plausible data into our events_daily format
                    breakdown_entries = []
                    
                    if data.get("results"):
                        for result in data["results"]:
                            page_path = result.get("page", "/")
                            
                            # Derive page_type from path
                            page_type = self._classify_page_type(page_path)
                            
                            # Get city from path (if city page)
                            city = self._extract_city_from_path(page_path)
                            
                            entry = {
                                'page_path': page_path,
                                'page_type': page_type,
                                'city': city,
                                'channel': 'organic',  # Default - we'll enhance this with UTM data
                                'source': None,
                                'campaign': None,
                                'flow': None,
                                'pageviews': result.get("pageviews", 0),
                                # Event counts will be fetched separately
                                'quote_flow_started': 0,
                                'quote_submitted': 0,
                                'consultation_started': 0,
                                'consultation_booked': 0,
                                'lead_created': 0
                            }
                            breakdown_entries.append(entry)
                    
                    # Now get event counts for the same date
                    await self._enrich_with_event_counts(breakdown_entries, date)
                    
                    return breakdown_entries
                else:
                    print(f"⚠️ Plausible breakdown failed: {response.status_code}")
                    return []
                    
        except Exception as e:
            print(f"❌ Plausible breakdown error: {str(e)}")
            return []

    async def _enrich_with_event_counts(self, entries: List[Dict], date: str):
        """Enrich breakdown entries with event counts from Plausible"""
        try:
            event_names = [
                'quote_flow_started', 'quote_submitted', 'consultation_started', 
                'consultation_booked', 'lead_created'
            ]
            
            for event_name in event_names:
                event_data = await self.plausible.get_goal_conversions(
                    period="day",
                    goal=event_name
                )
                
                if event_data and event_data.get("results"):
                    events_count = next(
                        (item.get("value", 0) for item in event_data["results"] 
                         if item["metric"] == "events"), 0
                    )
                    
                    # Distribute events across entries (simple approach - could be more sophisticated)
                    if entries and events_count > 0:
                        entries[0][event_name] = events_count
                        
        except Exception as e:
            print(f"⚠️ Event enrichment error: {str(e)}")

    def _classify_page_type(self, path: str) -> str:
        """Classify page type from URL path"""
        if path == "/" or path == "":
            return "homepage"
        elif "/providers/" in path:
            return "provider"
        elif any(city in path.lower() for city in ["zurich", "geneva", "basel", "bern", "lausanne"]):
            return "city"
        elif "/blog/" in path:
            return "blog"
        elif "/guides/" in path or "/how-to/" in path:
            return "guide"
        elif "/insurance/" in path:
            return "insurance"
        elif "/compare/" in path:
            return "compare"
        else:
            return "other"

    def _extract_city_from_path(self, path: str) -> Optional[str]:
        """Extract city name from URL path"""
        path_lower = path.lower()
        cities = ["zurich", "geneva", "basel", "bern", "lausanne", "zug", "winterthur"]
        
        for city in cities:
            if city in path_lower:
                return city
        return None

    async def run_gsc_etl(self, target_date: Optional[str] = None) -> bool:
        """
        Pull Google Search Console data to gsc_perf table
        
        Args:
            target_date: Date string in YYYY-MM-DD format, defaults to yesterday
        """
        if not self.gsc_service:
            print("⚠️ GSC service not initialized - skipping GSC ETL")
            return False
            
        try:
            if not target_date:
                target_date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
            
            print(f"🔄 Starting GSC ETL for {target_date}")
            
            # GSC API request
            request = {
                'startDate': target_date,
                'endDate': target_date,
                'dimensions': ['page', 'query', 'device', 'country'],
                'rowLimit': 25000
            }
            
            response = self.gsc_service.searchanalytics().query(
                siteUrl=self.gsc_property_url,
                body=request
            ).execute()
            
            if 'rows' not in response:
                print(f"⚠️ No GSC data for {target_date}")
                return True
            
            supabase = get_supabase()
            rows_inserted = 0
            
            # Process GSC data
            for row in response['rows']:
                keys = row['keys']  # [page, query, device, country]
                
                gsc_record = {
                    'id': str(uuid.uuid4()),
                    'date': target_date,
                    'page': keys[0],
                    'query': keys[1],
                    'device': keys[2] if len(keys) > 2 else 'desktop',
                    'country': keys[3] if len(keys) > 3 else 'che',
                    'clicks': int(row.get('clicks', 0)),
                    'impressions': int(row.get('impressions', 0)),
                    'ctr': float(row.get('ctr', 0)),
                    'position': float(row.get('position', 0))
                }
                
                # Upsert to handle duplicates
                result = supabase.table("gsc_perf").upsert(
                    gsc_record,
                    on_conflict="date,page,query,device,country"
                ).execute()
                
                if result.data:
                    rows_inserted += 1
            
            print(f"✅ GSC ETL completed: {rows_inserted} rows for {target_date}")
            return True
            
        except Exception as e:
            print(f"❌ GSC ETL error: {str(e)}")
            return False

    async def migrate_lead_sources(self) -> bool:
        """
        Migrate existing leads to lead_sources table with first/last touch attribution
        """
        try:
            print("🔄 Starting lead_sources migration")
            
            supabase = get_supabase()
            
            # Get all leads that don't have lead_sources entries yet
            leads_result = supabase.table("leads").select("*").execute()
            
            if not leads_result.data:
                print("⚠️ No leads found for migration")
                return True
            
            leads = leads_result.data
            rows_migrated = 0
            
            for lead in leads:
                # Check if lead_sources entry already exists
                existing = supabase.table("lead_sources").select("id").eq("lead_id", lead["id"]).execute()
                
                if existing.data:
                    continue  # Skip if already migrated
                
                # Create lead_sources entry
                # For existing leads, first and last touch are the same (we only have one touch point)
                lead_source = {
                    'id': str(uuid.uuid4()),
                    'lead_id': lead["id"],
                    # First touch (copy from lead)
                    'first_utm_source': lead.get("utm_source"),
                    'first_utm_medium': lead.get("utm_medium"),
                    'first_utm_campaign': lead.get("utm_campaign"),
                    'first_utm_term': lead.get("utm_term"),
                    'first_utm_content': lead.get("utm_content"),
                    'first_referrer': lead.get("referrer"),
                    'first_landing_path': lead.get("landing_path"),
                    'first_touch_at': lead.get("first_touch_at") or lead.get("created_at"),
                    # Last touch (same as first for existing leads)
                    'last_utm_source': lead.get("utm_source"),
                    'last_utm_medium': lead.get("utm_medium"),
                    'last_utm_campaign': lead.get("utm_campaign"),
                    'last_utm_term': lead.get("utm_term"),
                    'last_utm_content': lead.get("utm_content"),
                    'last_referrer': lead.get("referrer"),
                    'last_landing_path': lead.get("landing_path"),
                    'last_touch_at': lead.get("last_touch_at") or lead.get("created_at"),
                    # Derived data
                    'channel_derived': lead.get("channel"),
                    'city': lead.get("city"),
                    'page_type': lead.get("page_type"),
                    'flow': lead.get("flow")
                }
                
                result = supabase.table("lead_sources").insert(lead_source).execute()
                
                if result.data:
                    rows_migrated += 1
            
            print(f"✅ Lead sources migration completed: {rows_migrated} entries created")
            return True
            
        except Exception as e:
            print(f"❌ Lead sources migration error: {str(e)}")
            return False

    async def reconcile_ad_spend(self, target_date: Optional[str] = None) -> Dict[str, Any]:
        """
        Match ad_costs with lead attribution to calculate CPL
        
        Args:
            target_date: Date string in YYYY-MM-DD format, defaults to yesterday
            
        Returns:
            Dict with CPL analysis by channel/campaign
        """
        try:
            if not target_date:
                target_date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
            
            print(f"🔄 Reconciling ad spend for {target_date}")
            
            supabase = get_supabase()
            
            # Get ad costs for the date
            ad_costs_result = supabase.table("ad_costs").select("*").eq("date", target_date).execute()
            
            # Get leads with attribution for the date
            leads_result = supabase.table("leads").select(
                "id, channel, utm_campaign, utm_source, created_at"
            ).gte("created_at", f"{target_date} 00:00:00").lt("created_at", f"{target_date} 23:59:59").execute()
            
            ad_costs = ad_costs_result.data if ad_costs_result.data else []
            leads = leads_result.data if leads_result.data else []
            
            # Calculate CPL by campaign/source
            reconciliation = {
                'date': target_date,
                'total_ad_spend': sum(float(cost.get('cost', 0)) for cost in ad_costs),
                'total_paid_leads': len([l for l in leads if l.get('channel') == 'paid']),
                'campaigns': {}
            }
            
            # Group by campaign
            for cost in ad_costs:
                campaign = cost.get('campaign', 'unknown')
                source = cost.get('source', 'unknown')
                
                if campaign not in reconciliation['campaigns']:
                    reconciliation['campaigns'][campaign] = {
                        'source': source,
                        'spend': 0,
                        'leads': 0,
                        'cpl': 0
                    }
                
                reconciliation['campaigns'][campaign]['spend'] += float(cost.get('cost', 0))
            
            # Count leads by campaign
            for lead in leads:
                if lead.get('channel') == 'paid':
                    campaign = lead.get('utm_campaign', 'unknown')
                    if campaign in reconciliation['campaigns']:
                        reconciliation['campaigns'][campaign]['leads'] += 1
            
            # Calculate CPL
            for campaign, data in reconciliation['campaigns'].items():
                if data['leads'] > 0:
                    data['cpl'] = data['spend'] / data['leads']
                else:
                    data['cpl'] = data['spend']  # All spend, no leads
            
            # Overall CPL
            if reconciliation['total_paid_leads'] > 0:
                reconciliation['overall_cpl'] = reconciliation['total_ad_spend'] / reconciliation['total_paid_leads']
            else:
                reconciliation['overall_cpl'] = reconciliation['total_ad_spend']
            
            print(f"✅ Ad spend reconciliation completed for {target_date}")
            print(f"   Total spend: CHF {reconciliation['total_ad_spend']:.2f}")
            print(f"   Paid leads: {reconciliation['total_paid_leads']}")
            print(f"   Overall CPL: CHF {reconciliation['overall_cpl']:.2f}")
            
            return reconciliation
            
        except Exception as e:
            print(f"❌ Ad spend reconciliation error: {str(e)}")
            return {'error': str(e), 'date': target_date}

    async def run_full_etl(self, target_date: Optional[str] = None) -> Dict[str, bool]:
        """
        Run all ETL processes for a given date
        
        Args:
            target_date: Date string in YYYY-MM-DD format, defaults to yesterday
            
        Returns:
            Dict with success status for each ETL process
        """
        if not target_date:
            target_date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        
        print(f"🚀 Starting full ETL for {target_date}")
        
        results = {
            'plausible_etl': await self.run_daily_plausible_etl(target_date),
            'gsc_etl': await self.run_gsc_etl(target_date),
            'ad_reconciliation': bool(await self.reconcile_ad_spend(target_date))
        }
        
        success_count = sum(1 for success in results.values() if success)
        total_count = len(results)
        
        print(f"🎯 ETL Summary for {target_date}: {success_count}/{total_count} processes completed successfully")
        
        return results

