#!/usr/bin/env python3
"""
Quick script to add Alicia to email flow and send welcome email
Uses the backend API directly
"""

import requests
import json
from datetime import datetime

# Backend API URL
API_BASE = "https://expat-savvy-api.fly.dev"

def main():
    alicia_email = "rojocoloret.alicia@gmail.com"
    
    print(f"🔍 Looking for Alicia's lead ({alicia_email})...")
    
    # First, let's create a properly formatted lead for Alicia
    # This will trigger the email automation
    lead_data = {
        "email": alicia_email,
        "name": "Alicia Rojo Coloret",
        "phone": "+41774781635",
        
        # CRITICAL: Enable email automation
        "consent_marketing": True,
        "stage": "new",
        
        # Flow and context
        "flow": "self_service",
        "page_type": "home",
        "city": "Lugano",
        
        # Attribution
        "utm_source": "direct",
        "utm_medium": "organic",
        "referrer": None,
        "landing_path": "/",
        "channel": "organic",
        
        # Lead metadata
        "type": "health insurance",
        
        # Additional metadata from the original form
        "notes": {
            "source": "self_service_form",
            "situation": "new",
            "dob": "1996-01-20",
            "household": 1,
            "current_insurer": "none",
            "address": "Via Morello 3",
            "postcode": "6900",
            "canton": "Schwyz",
            "works": "yes",
            "deductible": "2500",
            "model": "telmed",
            "supplementary": "basic",
            "start_date": "2025-10-21",
            "special_requirements": "",
            "page_intent": "home",
            "ip_address": "178.197.210.244",
            "country": "Switzerland",
            "region": "Schwyz",
            "timestamp": datetime.now().isoformat(),
            "original_form_data": {
                "form_name": "health-insurance",
                "source": "self_service_form"
            }
        }
    }
    
    print(f"📤 Creating/updating lead for Alicia...")
    print(f"   Email: {lead_data['email']}")
    print(f"   Name: {lead_data['name']}")
    print(f"   Consent: {lead_data['consent_marketing']}")
    print(f"   Stage: {lead_data['stage']}")
    
    try:
        # Send to backend API
        response = requests.post(
            f"{API_BASE}/api/lead",
            json=lead_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Lead created/updated successfully!")
            print(f"   Lead ID: {result.get('lead_id')}")
            print(f"   Response: {result}")
            
            # The backend should automatically:
            # 1. Set email_sequence_status to 'active'
            # 2. Send welcome email immediately
            # 3. Set up follow-up emails (6h, 24h)
            
            print(f"\n📧 Email automation should now be active!")
            print(f"   - Welcome email sent immediately")
            print(f"   - 6h follow-up email scheduled")
            print(f"   - 24h final email scheduled")
            print(f"   - Sequence stops if she books a consultation")
            
        else:
            print(f"❌ Error creating lead: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    main()

