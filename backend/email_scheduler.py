"""
Background email scheduler for nurture sequences
This should be run as a separate background worker

Usage:
    python email_scheduler.py
"""

import asyncio
import os
from datetime import datetime, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv
from services.email import EmailService

load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
email_service = EmailService()


async def process_scheduled_emails():
    """Check for leads that need emails and send them"""
    
    print(f"\n⏰ [{datetime.now()}] Checking for scheduled emails...")
    
    try:
        # Get all leads in 'new' or 'nurture' stage with marketing consent
        leads_result = supabase.table("leads")\
            .select("*")\
            .in_("stage", ["new", "nurture"])\
            .eq("consent_marketing", True)\
            .execute()
        
        if not leads_result.data:
            print("   No leads to process")
            return
        
        leads = leads_result.data
        print(f"   Found {len(leads)} leads to check")
        
        for lead in leads:
            lead_id = lead["id"]
            email = lead["email"]
            name = lead.get("name", "there")
            created_at = datetime.fromisoformat(lead["created_at"].replace("Z", "+00:00"))
            
            # Check which emails have been sent
            events_result = supabase.table("events")\
                .select("*")\
                .eq("lead_id", lead_id)\
                .in_("name", ["email_welcome", "email_followup_1", "email_followup_2"])\
                .execute()
            
            sent_emails = [event["name"] for event in (events_result.data or [])]
            
            # Calculate time since lead creation
            time_since_creation = datetime.utcnow() - created_at.replace(tzinfo=None)
            
            # Determine which email to send
            email_to_send = None
            email_name = None
            
            if "email_welcome" not in sent_emails:
                # Send welcome email immediately if not sent
                email_to_send = "welcome"
                email_name = "email_welcome"
                print(f"   📧 Sending welcome email to {email}")
                
            elif "email_followup_1" not in sent_emails and time_since_creation > timedelta(hours=24):
                # Send first follow-up after 24 hours
                email_to_send = "followup_1"
                email_name = "email_followup_1"
                print(f"   📧 Sending 24h follow-up to {email}")
                
            elif "email_followup_2" not in sent_emails and time_since_creation > timedelta(days=3):
                # Send second follow-up after 3 days
                email_to_send = "followup_2"
                email_name = "email_followup_2"
                print(f"   📧 Sending 3-day follow-up to {email}")
            
            # Send email if needed
            if email_to_send:
                try:
                    if email_to_send == "welcome":
                        await email_service.send_email_step_1(email, name)
                    elif email_to_send == "followup_1":
                        await email_service.send_email_step_2(email, name)
                    elif email_to_send == "followup_2":
                        await email_service.send_email_step_3(email, name)
                    
                    # Track email sent event
                    supabase.table("events").insert({
                        "lead_id": lead_id,
                        "name": email_name,
                        "props": {"email_type": email_to_send}
                    }).execute()
                    
                    # Update stage to nurture after first email
                    if lead["stage"] == "new":
                        supabase.table("leads").update({
                            "stage": "nurture"
                        }).eq("id", lead_id).execute()
                    
                    print(f"   ✅ Email sent and tracked")
                    
                except Exception as e:
                    print(f"   ❌ Error sending email: {str(e)}")
        
        print(f"   ✅ Email processing complete\n")
        
    except Exception as e:
        print(f"   ❌ Error in email scheduler: {str(e)}\n")


async def main():
    """Main scheduler loop"""
    print("="*60)
    print("📧 EMAIL SCHEDULER STARTED")
    print("="*60)
    print(f"Checking every 5 minutes for scheduled emails...")
    print(f"Press Ctrl+C to stop\n")
    
    while True:
        try:
            await process_scheduled_emails()
            # Wait 5 minutes before next check
            await asyncio.sleep(300)
            
        except KeyboardInterrupt:
            print("\n\n🛑 Scheduler stopped by user")
            break
        except Exception as e:
            print(f"\n❌ Unexpected error: {str(e)}")
            print("Waiting 5 minutes before retry...\n")
            await asyncio.sleep(300)


if __name__ == "__main__":
    asyncio.run(main())

