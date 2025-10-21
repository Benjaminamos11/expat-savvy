#!/usr/bin/env python3
"""
Emergency script to stop all email sequences
Run this immediately to prevent more spam emails
"""

import requests
import json

# Backend API URL
API_BASE = "https://expat-savvy-api.fly.dev"

def stop_all_email_sequences():
    """Stop all active email sequences"""
    print("🚨 EMERGENCY: Stopping all email sequences")
    print("=" * 50)
    
    # This will need to be done via database update since there's no API endpoint
    print("⚠️  Manual database update required:")
    print("Run this SQL in Supabase:")
    print()
    print("UPDATE leads SET email_sequence_status = 'stopped' WHERE email_sequence_status = 'active';")
    print()
    print("This will stop ALL email sequences immediately.")
    
    # Also check if we can trigger the nurture queue to see current status
    try:
        print("\n🔍 Checking current email system status...")
        response = requests.get(f"{API_BASE}/api/email/status", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Current status:")
            print(f"   Active sequences: {data.get('sequences', {}).get('active', 'N/A')}")
            print(f"   Stopped sequences: {data.get('sequences', {}).get('stopped', 'N/A')}")
            print(f"   Completed sequences: {data.get('sequences', {}).get('completed', 'N/A')}")
        else:
            print(f"❌ Could not get status: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def main():
    stop_all_email_sequences()
    
    print(f"\n📋 Next Steps:")
    print(f"1. 🚨 URGENT: Run the SQL update to stop all sequences")
    print(f"2. 🔧 Run the database migration to add email columns")
    print(f"3. 🚀 Deploy the fixed backend code")
    print(f"4. 🧪 Test with a new lead to ensure it works properly")

if __name__ == "__main__":
    main()

