"""
Plausible Analytics server-side event tracking
"""

import httpx
import os
from typing import Dict, Any, Optional
import asyncio

class PlausibleService:
    def __init__(self):
        self.event_api_url = "https://plausible.io/api/event"
        self.stats_api_url = "https://plausible.io/api/v1/stats"
        self.domain = os.getenv("PLAUSIBLE_DOMAIN", "expat-savvy.ch")
        self.api_key = os.getenv("PLAUSIBLE_API_KEY")
        
    async def track_event(
        self, 
        event_name: str, 
        url: str, 
        props: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Send server-side event to Plausible"""
        try:
            payload = {
                "name": event_name,
                "url": url,
                "domain": self.domain
            }
            
            if props:
                # Filter out None values and ensure all values are strings
                clean_props = {
                    k: str(v) for k, v in props.items() 
                    if v is not None
                }
                if clean_props:
                    payload["props"] = clean_props
            
            headers = {
                "Content-Type": "application/json",
                "User-Agent": "Expat Savvy Backend/1.0"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.event_api_url,
                    json=payload,
                    headers=headers,
                    timeout=10.0
                )
                
                if response.status_code == 202:
                    print(f"✅ Plausible event sent: {event_name}")
                    return True
                else:
                    print(f"⚠️  Plausible event failed: {response.status_code} - {response.text}")
                    return False
                    
        except Exception as e:
            print(f"❌ Plausible event error: {str(e)}")
            return False

    async def get_aggregate_stats(
        self, 
        period: str = "30d",
        metrics: str = "visitors,pageviews,bounce_rate,visit_duration"
    ) -> Optional[Dict[str, Any]]:
        """Get aggregate stats from Plausible"""
        if not self.api_key:
            print("❌ Plausible API key not configured")
            return None
            
        try:
            url = f"{self.stats_api_url}/aggregate"
            params = {
                "site_id": self.domain,
                "period": period,
                "metrics": metrics
            }
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    url,
                    params=params,
                    headers=headers,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    print(f"⚠️  Plausible stats failed: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            print(f"❌ Plausible stats error: {str(e)}")
            return None

    async def get_goal_conversions(
        self,
        period: str = "30d",
        goal: str = "lead_created"
    ) -> Optional[Dict[str, Any]]:
        """Get goal conversion stats from Plausible"""
        if not self.api_key:
            print("❌ Plausible API key not configured")
            return None
            
        try:
            url = f"{self.stats_api_url}/aggregate"
            params = {
                "site_id": self.domain,
                "period": period,
                "metrics": "visitors,events,conversion_rate",
                "filters": f"event:goal=={goal}"
            }
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    url,
                    params=params,
                    headers=headers,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    print(f"⚠️  Plausible goal stats failed: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            print(f"❌ Plausible goal stats error: {str(e)}")
            return None

    async def get_funnel_data(self, period: str = "30d") -> Optional[Dict[str, Any]]:
        """Get funnel conversion data for all goals"""
        try:
            goals = [
                "quote_flow_started",
                "quote_submitted", 
                "lead_created",
                "consultation_booked",
                "consultation_started"
            ]
            
            funnel_data = {}
            for goal in goals:
                stats = await self.get_goal_conversions(period, goal)
                if stats and stats.get("results"):
                    # Extract events count from the response
                    events_data = next((item for item in stats["results"] if item["metric"] == "events"), None)
                    if events_data:
                        funnel_data[goal] = events_data.get("value", 0)
                    else:
                        funnel_data[goal] = 0
                else:
                    funnel_data[goal] = 0
            
            return funnel_data
            
        except Exception as e:
            print(f"❌ Plausible funnel data error: {str(e)}")
            return None