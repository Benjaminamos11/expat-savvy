"""
Quick script to check latest lead and Cal.com booking
"""

from supabase import create_client, Client
import os
from dotenv import load_dotenv
from datetime import datetime
import json

load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

print("\n" + "="*70)
print("📊 LATEST LEADS AND CAL.COM BOOKINGS")
print("="*70)

# Get latest lead
print("\n📝 LATEST LEAD:")
print("-" * 70)
try:
    leads_result = supabase.table("leads")\
        .select("*")\
        .order("created_at", desc=True)\
        .limit(1)\
        .execute()
    
    if leads_result.data:
        lead = leads_result.data[0]
        print(f"ID:           {lead.get('id')}")
        print(f"Name:         {lead.get('name')}")
        print(f"Email:        {lead.get('email')}")
        print(f"Phone:        {lead.get('phone')}")
        print(f"City:         {lead.get('city')}")
        print(f"Stage:        {lead.get('stage')}")
        print(f"Flow:         {lead.get('flow')}")
        print(f"Channel:      {lead.get('channel')}")
        print(f"Consent:      {lead.get('consent_marketing')}")
        print(f"Created:      {lead.get('created_at')}")
        print(f"Updated:      {lead.get('updated_at')}")
    else:
        print("No leads found")
except Exception as e:
    print(f"❌ Error fetching leads: {str(e)}")

# Get latest Cal.com booking event
print("\n" + "-" * 70)
print("📞 LATEST CAL.COM BOOKING EVENT:")
print("-" * 70)
try:
    events_result = supabase.table("events")\
        .select("*, leads(name, email, stage)")\
        .eq("name", "consultation_booked")\
        .order("created_at", desc=True)\
        .limit(1)\
        .execute()
    
    if events_result.data:
        event = events_result.data[0]
        lead_info = event.get('leads', {})
        
        print(f"Event ID:     {event.get('id')}")
        print(f"Lead ID:      {event.get('lead_id')}")
        print(f"Event Name:   {event.get('name')}")
        print(f"Created:      {event.get('created_at')}")
        print(f"\nAssociated Lead:")
        print(f"  Name:       {lead_info.get('name')}")
        print(f"  Email:      {lead_info.get('email')}")
        print(f"  Stage:      {lead_info.get('stage')}")
        print(f"\nEvent Props:")
        props = event.get('props', {})
        for key, value in props.items():
            print(f"  {key}: {value}")
    else:
        print("No Cal.com booking events found")
except Exception as e:
    print(f"❌ Error fetching booking events: {str(e)}")

# Get all recent events for latest lead
if leads_result.data:
    latest_lead_id = leads_result.data[0].get('id')
    print("\n" + "-" * 70)
    print(f"📅 ALL EVENTS FOR LATEST LEAD ({latest_lead_id[:8]}...):")
    print("-" * 70)
    try:
        lead_events = supabase.table("events")\
            .select("*")\
            .eq("lead_id", latest_lead_id)\
            .order("created_at", desc=True)\
            .execute()
        
        if lead_events.data:
            for event in lead_events.data:
                print(f"\n  • {event.get('name')}")
                print(f"    Created: {event.get('created_at')}")
                if event.get('props'):
                    print(f"    Props: {json.dumps(event.get('props'), indent=4)}")
        else:
            print("  No events found for this lead")
    except Exception as e:
        print(f"  ❌ Error fetching lead events: {str(e)}")

# Summary statistics
print("\n" + "="*70)
print("📊 SUMMARY STATISTICS:")
print("="*70)
try:
    # Total leads
    total_leads = supabase.table("leads").select("id", count="exact").execute()
    print(f"Total Leads:              {len(total_leads.data)}")
    
    # Leads by stage
    for stage in ['new', 'nurture', 'booked', 'closed_won', 'closed_lost']:
        stage_count = supabase.table("leads").select("id", count="exact").eq("stage", stage).execute()
        if len(stage_count.data) > 0:
            print(f"  - {stage.capitalize():20} {len(stage_count.data)}")
    
    # Total bookings
    bookings = supabase.table("events").select("id", count="exact").eq("name", "consultation_booked").execute()
    print(f"\nTotal Cal.com Bookings:   {len(bookings.data)}")
    
except Exception as e:
    print(f"❌ Error fetching statistics: {str(e)}")

print("\n" + "="*70 + "\n")

