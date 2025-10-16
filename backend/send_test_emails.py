#!/usr/bin/env python3
"""
Script to send test emails directly using the email service
"""

import asyncio
import sys
sys.path.insert(0, '.')

from services.email import EmailService

async def main():
    email_service = EmailService()
    
    if not email_service.api_key:
        print("❌ No EMAIL_API_KEY found in environment")
        return
    
    test_email = "bw@expat-savvy.ch"
    test_name = "Benjamin"
    insurance_type = "health insurance"
    
    print(f"📧 Sending test emails to {test_email}...\n")
    
    # Test 1: Welcome Email (T+0)
    print("1️⃣ Sending Welcome Email (T+0)...")
    success1 = await email_service.send_welcome_email(
        "test-lead-id-1", 
        test_email, 
        test_name, 
        insurance_type, 
        None
    )
    if success1:
        print("   ✅ Welcome email sent successfully!\n")
    else:
        print("   ❌ Failed to send welcome email\n")
    
    # Test 2: 6h Follow-up Email
    print("2️⃣ Sending 6h Follow-up Email...")
    success2 = await email_service.send_6h_email(
        "test-lead-id-2", 
        test_email, 
        test_name, 
        insurance_type, 
        None
    )
    if success2:
        print("   ✅ 6h follow-up email sent successfully!\n")
    else:
        print("   ❌ Failed to send 6h follow-up email\n")
    
    # Test 3: 24h Final Email
    print("3️⃣ Sending 24h Final Email...")
    success3 = await email_service.send_24h_email(
        "test-lead-id-3", 
        test_email, 
        test_name, 
        insurance_type, 
        None
    )
    if success3:
        print("   ✅ 24h final email sent successfully!\n")
    else:
        print("   ❌ Failed to send 24h final email\n")
    
    # Summary
    print("=" * 50)
    if success1 and success2 and success3:
        print("🎉 All 3 test emails sent successfully!")
        print(f"📬 Check your inbox at {test_email}")
    else:
        print("⚠️  Some emails failed to send")
        print(f"   Welcome: {'✅' if success1 else '❌'}")
        print(f"   6h Follow-up: {'✅' if success2 else '❌'}")
        print(f"   24h Final: {'✅' if success3 else '❌'}")

if __name__ == "__main__":
    asyncio.run(main())

