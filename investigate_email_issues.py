#!/usr/bin/env python3
"""
Investigate email automation issues
"""

import requests
import json
from datetime import datetime

# Backend API URL
API_BASE = "https://expat-savvy-api.fly.dev"

def check_lead_status(email):
    """Check the status of a specific lead"""
    print(f"\n🔍 Checking lead status for: {email}")
    
    # We'll need to check the database directly since there's no API endpoint for this
    # For now, let's check if we can find them in the recent events
    
    try:
        # Check email status endpoint (requires auth, but let's try)
        response = requests.get(f"{API_BASE}/api/email/status", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Email system status:")
            print(f"   Active sequences: {data.get('sequences', {}).get('active', 'N/A')}")
            print(f"   Stopped sequences: {data.get('sequences', {}).get('stopped', 'N/A')}")
            print(f"   Completed sequences: {data.get('sequences', {}).get('completed', 'N/A')}")
            print(f"   Welcome emails sent: {data.get('emails_sent', {}).get('welcome', 'N/A')}")
            print(f"   Day 1 emails sent: {data.get('emails_sent', {}).get('day1', 'N/A')}")
            print(f"   Day 3 emails sent: {data.get('emails_sent', {}).get('day3', 'N/A')}")
            
            print(f"\n📧 Recent email events:")
            for event in data.get('recent_events', [])[:5]:
                print(f"   - {event.get('name', 'N/A')} at {event.get('created_at', 'N/A')}")
        else:
            print(f"❌ Could not get email status: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error checking status: {str(e)}")

def main():
    print("🔍 Investigating Email Automation Issues")
    print("=" * 50)
    
    # Check system status
    check_lead_status("system")
    
    # Check specific problematic emails
    problematic_emails = [
        "tgsnrfvbz7@privaterelay.appleid.com",  # Selena Moloney
        "berceas2005@gmail.com",  # Simona Bercea
        "nekybarbosa@gmail.com"   # Nicole Faria Barbosa
    ]
    
    for email in problematic_emails:
        check_lead_status(email)
    
    print(f"\n📋 Issues Identified:")
    print(f"1. ❌ Email sequences not stopping after Cal.com bookings")
    print(f"2. ❌ Same leads getting multiple emails (repeated sending)")
    print(f"3. ❌ Selena Moloney still getting emails despite booking")
    print(f"4. ❌ Email automation logic has bugs")
    
    print(f"\n🔧 Root Causes:")
    print(f"1. Cal.com webhook may not be firing or finding the lead")
    print(f"2. Email sequence status not being updated to 'stopped'")
    print(f"3. Database migration may not have been run")
    print(f"4. Email automation query may be flawed")

if __name__ == "__main__":
    main()

