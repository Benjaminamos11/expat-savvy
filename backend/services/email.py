"""
Email automation service for lead nurturing
"""

import httpx
import os
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import asyncio

class EmailService:
    def __init__(self):
        self.provider = os.getenv("EMAIL_PROVIDER", "resend")  # resend|postmark|mailgun
        self.api_key = os.getenv("EMAIL_API_KEY")
        self.from_email = os.getenv("FROM_EMAIL", "hello@expat-savvy.ch")
        self.cal_link = os.getenv("CAL_LINK", "https://cal.com/expat-savvy")
        
    async def start_nurture_sequence(self, lead_id: str, email: str, name: Optional[str] = None):
        """Start the 4-step nurture email sequence"""
        if not self.api_key:
            print("⚠️  No email API key configured - skipping email automation")
            return
            
        try:
            # Schedule emails (in a real implementation, you'd use a task queue like Celery)
            # For now, we'll just send the first email immediately
            await self.send_email_step_1(email, name or "there")
            
            # In production, you would schedule the other emails:
            # - T+24h: Step 2
            # - T+72h: Step 3  
            # - T+7d: Step 4
            
            print(f"✅ Started nurture sequence for {email}")
            
        except Exception as e:
            print(f"❌ Email sequence error: {str(e)}")
    
    async def stop_nurture_sequence(self, lead_id: str):
        """Stop nurture sequence when lead books consultation"""
        # In a real implementation, you'd cancel scheduled emails
        print(f"🛑 Stopped nurture sequence for lead {lead_id}")
        
    async def send_email_step_1(self, email: str, name: str):
        """T+0: Welcome email with Cal.com link"""
        subject = "Thanks for your interest - here's what happens next"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Hi {name},</h2>
            
            <p>Thank you for your interest in Swiss health insurance guidance!</p>
            
            <p>Here's what happens next:</p>
            
            <ul>
                <li><strong>✅ Personalized Analysis:</strong> We'll review your specific situation and requirements</li>
                <li><strong>📊 3 Best Options:</strong> You'll receive tailored recommendations from top Swiss insurers</li>
                <li><strong>💰 Savings Guarantee:</strong> We ensure you get the best value for your needs</li>
            </ul>
            
            <p>Want to skip the queue and get immediate expert advice?</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{self.cal_link}" 
                   style="background-color: #0066cc; color: white; padding: 15px 30px; 
                          text-decoration: none; border-radius: 5px; display: inline-block;">
                    📞 Book Free 15-Minute Consultation
                </a>
            </div>
            
            <p>Our Swiss insurance experts are standing by to help you navigate the system and save money.</p>
            
            <p>Best regards,<br>
            The Expat Savvy Team</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="font-size: 12px; color: #666;">
                Expat Savvy Switzerland - Your trusted guide for Swiss insurance
            </p>
        </div>
        """
        
        await self.send_email(email, subject, html_content)
        
    async def send_email(self, to_email: str, subject: str, html_content: str):
        """Send email via configured provider"""
        if self.provider == "resend":
            await self._send_via_resend(to_email, subject, html_content)
        elif self.provider == "postmark":
            await self._send_via_postmark(to_email, subject, html_content)
        else:
            print(f"⚠️  Email provider '{self.provider}' not implemented")
            
    async def _send_via_resend(self, to_email: str, subject: str, html_content: str):
        """Send email via Resend"""
        try:
            payload = {
                "from": self.from_email,
                "to": [to_email],
                "subject": subject,
                "html": html_content
            }
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.resend.com/emails",
                    json=payload,
                    headers=headers,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    print(f"✅ Email sent via Resend to {to_email}")
                else:
                    print(f"⚠️  Resend error: {response.status_code} - {response.text}")
                    
        except Exception as e:
            print(f"❌ Resend email error: {str(e)}")
            
    async def _send_via_postmark(self, to_email: str, subject: str, html_content: str):
        """Send email via Postmark"""
        try:
            payload = {
                "From": self.from_email,
                "To": to_email,
                "Subject": subject,
                "HtmlBody": html_content
            }
            
            headers = {
                "X-Postmark-Server-Token": self.api_key,
                "Content-Type": "application/json"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.postmarkapp.com/email",
                    json=payload,
                    headers=headers,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    print(f"✅ Email sent via Postmark to {to_email}")
                else:
                    print(f"⚠️  Postmark error: {response.status_code} - {response.text}")
                    
        except Exception as e:
            print(f"❌ Postmark email error: {str(e)}")