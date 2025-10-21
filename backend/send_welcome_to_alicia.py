"""
Quick script to send welcome email to Alicia Rojo Coloret
Run with: python send_welcome_to_alicia.py
"""

import asyncio
import os
from dotenv import load_dotenv
from services.email import EmailService
from database import get_supabase

load_dotenv()

async def main():
    # Initialize services
    email_service = EmailService()
    supabase = next(get_supabase())
    
    # Lead info
    email = "rojocoloret.alicia@gmail.com"
    name = "Alicia"
    
    print(f"🔍 Looking up lead for {email}...")
    
    # Find the lead in database
    result = supabase.table("leads").select("*").eq("email", email).execute()
    
    if not result.data:
        print(f"❌ Lead not found for {email}")
        return
    
    lead = result.data[0]
    lead_id = lead["id"]
    
    print(f"✅ Found lead: {lead_id}")
    print(f"   Name: {lead.get('name', 'N/A')}")
    print(f"   Stage: {lead.get('stage', 'N/A')}")
    print(f"   Created: {lead.get('created_at', 'N/A')}")
    print(f"   Email sequence status: {lead.get('email_sequence_status', 'N/A')}")
    print(f"   Welcome email sent: {lead.get('email_welcome_sent_at', 'N/A')}")
    
    # Update lead to enable email sequence
    print(f"\n📝 Updating lead to enable email sequence...")
    supabase.table("leads").update({
        "consent_marketing": True,
        "stage": "new",
        "email_sequence_status": "active",
        "email_welcome_sent_at": None,
        "email_6h_sent_at": None,
        "email_24h_sent_at": None
    }).eq("id", lead_id).execute()
    
    print(f"✅ Lead updated")
    
    # Send welcome email
    print(f"\n📧 Sending welcome email to {email}...")
    success = await email_service.send_welcome_email(
        lead_id=lead_id,
        email=email,
        name=name,
        insurance_type="health insurance",
        supabase=supabase
    )
    
    if success:
        print(f"✅ Welcome email sent successfully to {email}!")
        print(f"   The lead will now receive follow-up emails:")
        print(f"   - 6h email: ~6 hours from now")
        print(f"   - 24h email: ~24 hours from now")
        print(f"   (unless they book a consultation)")
    else:
        print(f"❌ Failed to send welcome email")
    
    # Check updated lead
    print(f"\n📊 Checking updated lead status...")
    result = supabase.table("leads").select("*").eq("id", lead_id).execute()
    if result.data:
        lead = result.data[0]
        print(f"   Email sequence status: {lead.get('email_sequence_status', 'N/A')}")
        print(f"   Welcome email sent: {lead.get('email_welcome_sent_at', 'N/A')}")

if __name__ == "__main__":
    asyncio.run(main())


