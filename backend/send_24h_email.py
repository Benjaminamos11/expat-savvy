#!/usr/bin/env python3
"""
Script to send just the 24h test email
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
    
    print(f"📧 Sending 24h test email to {test_email}...\n")
    
    # Test 3: 24h Final Email
    print("3️⃣ Sending 24h Final Email...")
    success = await email_service.send_24h_email(
        "test-lead-id-3", 
        test_email, 
        test_name, 
        insurance_type, 
        None
    )
    if success:
        print("   ✅ 24h final email sent successfully!\n")
        print("🎉 All test emails have been sent to bw@expat-savvy.ch")
    else:
        print("   ❌ Failed to send 24h final email\n")

if __name__ == "__main__":
    asyncio.run(main())

