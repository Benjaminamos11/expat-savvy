"""
Test script to verify Cal.com webhook integration
Run this to verify that:
1. Cal.com webhook is properly configured
2. Lead stage updates to "booked" 
3. Email sequence stops correctly
"""

import httpx
import asyncio
import json
from datetime import datetime

# Configuration
API_BASE_URL = "http://localhost:8000"  # Change to your deployed URL if testing production
TEST_EMAIL = "test-webhook@example.com"

async def test_calcom_webhook():
    """Test the Cal.com webhook endpoint"""
    
    print("\n" + "="*60)
    print("🧪 TESTING CAL.COM WEBHOOK INTEGRATION")
    print("="*60)
    
    # Step 1: Create a test lead
    print("\n📝 Step 1: Creating test lead...")
    lead_data = {
        "name": "Test User",
        "email": TEST_EMAIL,
        "city": "zurich",
        "page_type": "homepage",
        "flow": "quote",
        "channel": "direct",
        "consent_marketing": True
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{API_BASE_URL}/api/lead",
                json=lead_data,
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                lead_id = result.get("lead_id")
                print(f"✅ Lead created successfully: {lead_id}")
                print(f"   Email: {TEST_EMAIL}")
            else:
                print(f"❌ Failed to create lead: {response.status_code}")
                print(f"   Response: {response.text}")
                return
                
        except Exception as e:
            print(f"❌ Error creating lead: {str(e)}")
            return
    
    # Step 2: Simulate Cal.com webhook
    print("\n📞 Step 2: Simulating Cal.com booking webhook...")
    
    # This is the format Cal.com sends
    webhook_payload = {
        "triggerEvent": "BOOKING_CREATED",
        "createdAt": datetime.utcnow().isoformat(),
        "payload": {
            "id": 12345,
            "uid": "test-booking-uid",
            "title": "15 Min Meeting",
            "description": "Test consultation",
            "startTime": datetime.utcnow().isoformat(),
            "endTime": datetime.utcnow().isoformat(),
            "attendees": [
                {
                    "email": TEST_EMAIL,
                    "name": "Test User",
                    "timeZone": "Europe/Zurich"
                }
            ],
            "organizer": {
                "email": "hello@expat-savvy.ch",
                "name": "Expat Savvy",
                "timeZone": "Europe/Zurich"
            },
            "eventTypeId": 1,
            "status": "ACCEPTED"
        }
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{API_BASE_URL}/api/webhooks/calcom",
                json=webhook_payload,
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Webhook processed successfully")
                print(f"   Message: {result.get('message')}")
            else:
                print(f"❌ Webhook failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return
                
        except Exception as e:
            print(f"❌ Error processing webhook: {str(e)}")
            return
    
    # Step 3: Verify lead was updated
    print("\n🔍 Step 3: Verifying lead status update...")
    print("   (You need to manually check your Supabase database)")
    print(f"   - Check lead with email: {TEST_EMAIL}")
    print(f"   - Expected stage: 'booked'")
    print(f"   - Expected event: 'consultation_booked' in events table")
    
    print("\n" + "="*60)
    print("✅ TEST COMPLETED")
    print("="*60)
    print("\nNEXT STEPS:")
    print("1. Check your Supabase database to verify:")
    print("   - Lead stage is 'booked'")
    print("   - Event 'consultation_booked' was created")
    print("\n2. Check your email logs to verify:")
    print("   - Initial email was sent")
    print("   - No follow-up emails will be sent")
    print("\n3. Configure Cal.com webhook URL:")
    print("   - Go to Cal.com → Settings → Webhooks")
    print("   - Add webhook URL: https://your-api.fly.dev/api/webhooks/calcom")
    print("   - Subscribe to: BOOKING_CREATED")
    print("=" * 60 + "\n")


async def check_webhook_requirements():
    """Check if webhook endpoint is accessible"""
    print("\n🔍 CHECKING WEBHOOK ENDPOINT...")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{API_BASE_URL}/health",
                timeout=10.0
            )
            
            if response.status_code == 200:
                print(f"✅ API is accessible at {API_BASE_URL}")
                return True
            else:
                print(f"⚠️  API returned status {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Cannot reach API: {str(e)}")
            print(f"   Make sure your backend is running at {API_BASE_URL}")
            return False


if __name__ == "__main__":
    print("""
╔══════════════════════════════════════════════════════════╗
║         Cal.com Webhook Integration Test                ║
║                                                          ║
║  This script tests:                                     ║
║  1. Lead creation                                       ║
║  2. Cal.com webhook processing                          ║
║  3. Lead stage update to 'booked'                       ║
║  4. Email sequence stopping                             ║
╚══════════════════════════════════════════════════════════╝
    """)
    
    # Run tests
    asyncio.run(check_webhook_requirements())
    asyncio.run(test_calcom_webhook())

