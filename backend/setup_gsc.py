#!/usr/bin/env python3
"""
Google Search Console Setup Script for Phase A
Helps configure GSC service account and test connection
"""

import os
import json
import sys
from google.oauth2 import service_account
from googleapiclient.discovery import build

def main():
    print("🔧 Google Search Console Setup for Expat-Savvy Phase A")
    print("=" * 60)
    
    # Check if GSC credentials are already set
    gsc_creds_json = os.getenv("GSC_SERVICE_ACCOUNT_JSON")
    
    if not gsc_creds_json:
        print("❌ GSC_SERVICE_ACCOUNT_JSON environment variable not found")
        print("\nTo set up Google Search Console integration:")
        print("1. Go to https://console.cloud.google.com/")
        print("2. Create new project or select existing project")
        print("3. Enable Search Console API")
        print("4. Create service account with 'Viewer' role")
        print("5. Download JSON credentials")
        print("6. Add service account email to Search Console property")
        print("7. Set environment variable:")
        print("   export GSC_SERVICE_ACCOUNT_JSON='$(cat path/to/credentials.json)'")
        return False
    
    try:
        # Parse credentials JSON
        creds_info = json.loads(gsc_creds_json)
        print(f"✅ Found service account: {creds_info.get('client_email', 'Unknown')}")
        print(f"✅ Project ID: {creds_info.get('project_id', 'Unknown')}")
        
        # Initialize credentials
        credentials = service_account.Credentials.from_service_account_info(
            creds_info,
            scopes=['https://www.googleapis.com/auth/webmasters.readonly']
        )
        
        # Build service
        service = build('webmasters', 'v3', credentials=credentials)
        
        # Test connection by listing sites
        print("\n🔍 Testing Search Console connection...")
        sites = service.sites().list().execute()
        
        if 'siteEntry' in sites:
            print("✅ Successfully connected to Google Search Console!")
            print("\nAvailable properties:")
            for site in sites['siteEntry']:
                site_url = site['siteUrl']
                permission_level = site.get('permissionLevel', 'Unknown')
                print(f"  - {site_url} (Permission: {permission_level})")
                
                # Check if our target property is available
                target_property = os.getenv("GSC_PROPERTY_URL", "https://expat-savvy.ch/")
                if site_url == target_property:
                    print(f"  ✅ Target property found: {target_property}")
        else:
            print("⚠️ No properties found. Make sure to:")
            print("1. Add the service account email to Search Console")
            print("2. Grant at least 'Restricted' access")
        
        # Test data retrieval
        property_url = os.getenv("GSC_PROPERTY_URL", "https://expat-savvy.ch/")
        print(f"\n📊 Testing data retrieval for {property_url}...")
        
        # Test query for last 7 days
        from datetime import datetime, timedelta
        end_date = datetime.now().strftime('%Y-%m-%d')
        start_date = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
        
        request = {
            'startDate': start_date,
            'endDate': end_date,
            'dimensions': ['query'],
            'rowLimit': 5
        }
        
        try:
            response = service.searchanalytics().query(
                siteUrl=property_url,
                body=request
            ).execute()
            
            if 'rows' in response:
                print(f"✅ Successfully retrieved {len(response['rows'])} rows of data")
                print("Sample queries:")
                for row in response['rows'][:3]:
                    query = row['keys'][0]
                    clicks = row.get('clicks', 0)
                    impressions = row.get('impressions', 0)
                    print(f"  - '{query}': {clicks} clicks, {impressions} impressions")
            else:
                print("ℹ️ No data available for the test period (this is normal for new setups)")
                
        except Exception as e:
            print(f"⚠️ Data retrieval test failed: {str(e)}")
            print("This might be normal if the service account was just added")
        
        print("\n🎉 Google Search Console setup completed!")
        print("\nYou can now run ETL jobs with GSC data:")
        print("curl -X POST https://expat-savvy-api.fly.dev/api/etl/gsc \\")
        print("  -H \"Content-Type: application/json\" \\")
        print("  -d '{}' \\")
        print("  -u admin:changeme123")
        
        return True
        
    except json.JSONDecodeError:
        print("❌ Invalid JSON in GSC_SERVICE_ACCOUNT_JSON")
        return False
    except Exception as e:
        print(f"❌ Error setting up GSC: {str(e)}")
        return False

def validate_environment():
    """Validate all required environment variables for Phase A"""
    print("\n🔍 Validating Phase A Environment Variables")
    print("-" * 50)
    
    required_vars = {
        'SUPABASE_URL': 'Database connection',
        'SUPABASE_SERVICE_ROLE_KEY': 'Database authentication',
        'PLAUSIBLE_API_KEY': 'Analytics data',
        'PLAUSIBLE_DOMAIN': 'Analytics configuration'
    }
    
    optional_vars = {
        'GSC_SERVICE_ACCOUNT_JSON': 'Search Console data',
        'GSC_PROPERTY_URL': 'Search Console property',
        'ETL_ENABLED': 'ETL job control',
        'EMAIL_API_KEY': 'Email notifications'
    }
    
    all_good = True
    
    print("Required variables:")
    for var, description in required_vars.items():
        value = os.getenv(var)
        if value:
            # Mask sensitive values
            if 'KEY' in var or 'URL' in var:
                masked_value = value[:8] + "..." if len(value) > 8 else "***"
                print(f"  ✅ {var}: {masked_value} ({description})")
            else:
                print(f"  ✅ {var}: {value} ({description})")
        else:
            print(f"  ❌ {var}: Missing ({description})")
            all_good = False
    
    print("\nOptional variables:")
    for var, description in optional_vars.items():
        value = os.getenv(var)
        if value:
            if 'KEY' in var or 'JSON' in var:
                print(f"  ✅ {var}: Set ({description})")
            else:
                print(f"  ✅ {var}: {value} ({description})")
        else:
            print(f"  ⚠️ {var}: Not set ({description})")
    
    return all_good

if __name__ == "__main__":
    print("Phase A - Data Foundation Setup")
    print("=" * 60)
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    if len(sys.argv) > 1 and sys.argv[1] == "--validate-env":
        success = validate_environment()
        sys.exit(0 if success else 1)
    
    # Validate environment first
    env_ok = validate_environment()
    
    if not env_ok:
        print("\n❌ Please fix missing required environment variables before proceeding")
        sys.exit(1)
    
    # Setup GSC if credentials are available
    gsc_ok = main()
    
    print(f"\n📋 Setup Summary:")
    print(f"  Environment: {'✅ Ready' if env_ok else '❌ Issues'}")
    print(f"  Google Search Console: {'✅ Configured' if gsc_ok else '⚠️ Optional'}")
    
    if env_ok:
        print("\n🚀 Phase A is ready for deployment!")
        print("Next steps:")
        print("1. Run database migration: backend/migrations/001_phase_a_schema.sql")
        print("2. Deploy backend with updated dependencies")
        print("3. Run attribution migration: POST /api/attribution/migrate")
        print("4. Test ETL jobs: POST /api/etl/full")
    else:
        print("\n⚠️ Please fix environment issues before deploying Phase A")

