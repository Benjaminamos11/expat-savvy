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
        self.api_key = os.getenv("EMAIL_API_KEY", "").strip()  # Strip whitespace/newlines
        self.from_email = os.getenv("FROM_EMAIL", "hello@expat-savvy.ch")
        self.cal_link = os.getenv("CAL_LINK", "https://cal.com/robertkolar/expat-savvy")
        
    async def start_nurture_sequence(self, lead_id: str, email: str, name: Optional[str] = None, supabase = None):
        """
        Start the email nurture sequence - sends welcome email immediately
        Day 1 and Day 3 emails are handled by the cron endpoint
        """
        if not self.api_key:
            print("⚠️  No email API key configured - skipping email automation")
            return False
            
        try:
            # Send welcome email immediately
            success = await self.send_welcome_email(lead_id, email, name or "there", supabase)
            
            if success:
                print(f"✅ Started nurture sequence for {email}")
                return True
            else:
                print(f"⚠️  Failed to start nurture sequence for {email}")
                return False
            
        except Exception as e:
            print(f"❌ Email sequence error: {str(e)}")
            return False
    
    async def stop_nurture_sequence(self, lead_id: str, supabase = None):
        """Stop nurture sequence when lead books consultation"""
        try:
            if supabase:
                supabase.table("leads").update({
                    "email_sequence_status": "stopped",
                    "stage": "booked",
                    "updated_at": datetime.utcnow().isoformat()
                }).eq("id", lead_id).execute()
                
            print(f"🛑 Stopped nurture sequence for lead {lead_id}")
            return True
        except Exception as e:
            print(f"❌ Error stopping nurture sequence: {str(e)}")
            return False
        
    async def send_welcome_email(self, lead_id: str, email: str, name: str, supabase = None):
        """T+0: Welcome email - sent immediately after form submission"""
        subject = "Your Swiss Insurance Quote Request - Next Steps"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <title>Your Swiss Insurance Quote Request - Expat Savvy</title>
            <!--[if mso]>
            <noscript>
                <xml>
                    <o:OfficeDocumentSettings>
                        <o:PixelsPerInch>96</o:PixelsPerInch>
                    </o:OfficeDocumentSettings>
                </xml>
            </noscript>
            <![endif]-->
            <style type="text/css">
                @media only screen and (max-width: 600px) {{
                    .container {{ width: 100% !important; }}
                    .content {{ padding: 20px !important; }}
                    .button {{ width: 100% !important; display: block !important; }}
                    .text {{ font-size: 16px !important; }}
                    .header-logo {{ padding: 30px 20px !important; }}
                    .main-content {{ padding: 30px 20px !important; }}
                    .footer-content {{ padding: 25px 20px !important; }}
                }}
                
                @media (prefers-color-scheme: dark) {{
                    .dark-mode-bg {{ background-color: #ffffff !important; }}
                    .dark-mode-text {{ color: #333333 !important; }}
                }}
            </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            
            <!-- Preview Text -->
            <div style="display: none; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: transparent;">
                Book free consultation or receive direct quotes by email
            </div>
            
            <!-- Main Container -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; margin: 0; padding: 0;">
                <tr>
                    <td align="center" style="padding: 20px 0;">
                        
                        <!-- Email Container -->
                        <table class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.08); overflow: hidden; margin: 0 auto;">
                            
                            <!-- Header with Logo -->
                            <tr>
                                <td class="header-logo" style="background-color: #ffffff; padding: 40px 30px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                                    <img src="https://res.cloudinary.com/dphbnwjtx/image/upload/v1760012978/logoexpatsavvy_ja4m1j.png" 
                                         alt="Expat Savvy" 
                                         style="height: 60px; width: auto; display: block; margin: 0 auto;" />
                                </td>
                            </tr>
                            
                            <!-- Main Content -->
                            <tr>
                                <td class="main-content" style="padding: 40px 30px; background-color: #ffffff;">
                                    
                                    <!-- Greeting -->
                                    <h1 style="color: #333333; font-size: 24px; font-weight: 600; margin: 0 0 25px 0; line-height: 1.3;">
                                        Hi {name},
                                    </h1>
                                    
                                    <!-- Thank you message -->
                                    <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                        Thank you for requesting your personalized Swiss insurance quotes! We're excited to help you find the perfect health insurance solution that matches your needs and budget.
                                    </p>
                                    
                                    <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                                        To provide you with the most accurate comparison and recommendations, we'd love to learn more about your specific situation through a brief consultation.
                                    </p>
                                    
                                    <!-- Process explanation -->
                                    <div style="background-color: #ffffff; border: 2px solid #7a0025; padding: 25px; margin: 0 0 30px 0; border-radius: 8px;">
                                        <h2 style="color: #7a0025; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">
                                            Why We Recommend a Quick Consultation:
                                        </h2>
                                        <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                                            A brief consultation is the most <strong>efficient and effective way</strong> to understand your unique needs and provide truly personalized recommendations.
                                        </p>
                                        <ul style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0; padding-left: 20px;">
                                            <li style="margin-bottom: 8px;"><strong>Swiss insurance expertise</strong> - we know all major providers and their plans inside out</li>
                                            <li style="margin-bottom: 8px;"><strong>Understand your needs</strong> - learn about your health situation and expectations</li>
                                            <li style="margin-bottom: 8px;"><strong>Personalized comparison</strong> - compare options based on YOUR priorities</li>
                                            <li style="margin-bottom: 8px;"><strong>Local insights</strong> - knowledge specific to your canton and situation</li>
                                            <li style="margin-bottom: 8px;"><strong>Maximize value</strong> - ensure you get the best coverage for your budget</li>
                                            <li style="margin-bottom: 8px;"><strong>Not sales-focused</strong> - purely informational and advisory</li>
                                            <li style="margin-bottom: 0;"><strong>No obligation</strong> and completely free of charge</li>
                                        </ul>
                                    </div>
                                    
                                    <!-- Main CTA Button -->
                                    <div style="text-align: center; margin: 0 0 30px 0;">
                                        <!--[if mso]>
                                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" 
                                                     style="height:50px;v-text-anchor:middle;width:280px;" 
                                                     arcsize="12%" stroke="f" fillcolor="#7a0025">
                                        <v:shadow on="t" color="rgba(0,0,0,0.15)" offset="2px,2px"/>
                                        <w:anchorlock/>
                                        <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">
                                            Book Your Free Consultation
                                        </center>
                                        </v:roundrect>
                                        <![endif]-->
                                        <!--[if !mso]><!-->
                                        <a href="{self.cal_link}" 
                                           style="display: inline-block; background-color: #7a0025; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 8px rgba(122, 0, 37, 0.3); transition: all 0.3s ease;">
                                            Book Your Free Consultation
                                        </a>
                                        <!--<![endif]-->
                                    </div>
                                    
                                    <!-- What to Expect -->
                                    <div style="background-color: #f9f9f9; padding: 20px; margin: 0 0 30px 0; border-radius: 6px;">
                                        <h3 style="color: #333333; font-size: 16px; font-weight: 600; margin: 0 0 15px 0;">
                                            What We'll Discuss in Your Consultation:
                                        </h3>
                                        <ul style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0; padding-left: 20px;">
                                            <li style="margin-bottom: 8px;">Your health needs and expectations from insurance</li>
                                            <li style="margin-bottom: 8px;">Detailed analysis of top Swiss insurance providers</li>
                                            <li style="margin-bottom: 8px;">Comprehensive comparison tailored to your situation</li>
                                            <li style="margin-bottom: 8px;">Cost-benefit analysis for your specific needs</li>
                                            <li style="margin-bottom: 0;">Clear recommendations and next steps</li>
            </ul>
                                    </div>
                                    
                                    <!-- Alternative Option -->
                                    <div style="background-color: #fff8e1; border-left: 4px solid #ffd54f; padding: 20px; margin: 0 0 30px 0;">
                                        <p style="color: #666666; font-size: 15px; line-height: 1.6; margin: 0;">
                                            <strong>Prefer to receive quotes directly?</strong><br>
                                            Simply reply to this email with details about your health situation and expectations, and we'll send you a personalized comparison. However, a consultation ensures we truly understand your needs and provide the most accurate recommendations.
                                        </p>
                                    </div>
                                    
                                    <!-- Signature -->
                                    <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #e0e0e0;">
                                        <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 15px 0;">
                                            Looking forward to learning about your situation and helping you find the perfect insurance solution!
                                        </p>
                                        <p style="color: #333333; font-size: 16px; font-weight: 600; margin: 0 0 5px 0;">
                                            The Expat Savvy Team
                                        </p>
                                        <p style="color: #666666; font-size: 14px; margin: 0;">
                                            Swiss Health Insurance Specialists
                                        </p>
                                    </div>
                                    
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td class="footer-content" style="background-color: #f5f5f5; padding: 30px; text-align: center;">
                                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;">
                                        <strong>Expat Savvy</strong><br>
                                        Talacker 41, 8001 Zurich, Switzerland
                                    </p>
                                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;">
                                        📧 <a href="mailto:bw@expat-savvy.ch" style="color: #7a0025; text-decoration: none;">bw@expat-savvy.ch</a><br>
                                        📞 <a href="tel:+41791552570" style="color: #7a0025; text-decoration: none;">+41 79 155 25 70</a><br>
                                        🌐 <a href="https://expat-savvy.ch" style="color: #7a0025; text-decoration: none;">expat-savvy.ch</a>
                                    </p>
                                    <p style="color: #999999; font-size: 12px; line-height: 1.5; margin: 0;">
                                        You're receiving this email because you requested health insurance information through our website.
                                    </p>
                                </td>
                            </tr>
                            
                        </table>
                        
                    </td>
                </tr>
            </table>
            
        </body>
        </html>
        """
        
        success = await self.send_email(email, subject, html_content)
        
        # Update database to track email sent
        if success and supabase:
            try:
                supabase.table("leads").update({
                    "email_welcome_sent_at": datetime.utcnow().isoformat()
                }).eq("id", lead_id).execute()
                
                # Track event
                import uuid
                supabase.table("events").insert({
                    "id": str(uuid.uuid4()),
                    "lead_id": lead_id,
                    "name": "email_sent_welcome",
                    "props": {"email": email, "subject": subject}
                }).execute()
            except Exception as e:
                print(f"⚠️  Could not update email tracking: {str(e)}")
        
        return success
    
    async def send_day1_email(self, lead_id: str, email: str, name: str, supabase = None):
        """T+24h: First follow-up email"""
        subject = "Quick Question About Your Swiss Insurance"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <title>Quick Question About Your Swiss Insurance - Expat Savvy</title>
            <!--[if mso]>
            <noscript>
                <xml>
                    <o:OfficeDocumentSettings>
                        <o:PixelsPerInch>96</o:PixelsPerInch>
                    </o:OfficeDocumentSettings>
                </xml>
            </noscript>
            <![endif]-->
            <style type="text/css">
                @media only screen and (max-width: 600px) {{
                    .container {{ width: 100% !important; }}
                    .content {{ padding: 20px !important; }}
                    .button {{ width: 100% !important; display: block !important; }}
                    .text {{ font-size: 16px !important; }}
                    .header-logo {{ padding: 30px 20px !important; }}
                    .main-content {{ padding: 30px 20px !important; }}
                    .footer-content {{ padding: 25px 20px !important; }}
                }}
                
                @media (prefers-color-scheme: dark) {{
                    .dark-mode-bg {{ background-color: #ffffff !important; }}
                    .dark-mode-text {{ color: #333333 !important; }}
                }}
            </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            
            <!-- Preview Text -->
            <div style="display: none; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: transparent;">
                Quick question about your Swiss insurance - 15 min consultation available
            </div>
            
            <!-- Main Container -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; margin: 0; padding: 0;">
                <tr>
                    <td align="center" style="padding: 20px 0;">
                        
                        <!-- Email Container -->
                        <table class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.08); overflow: hidden; margin: 0 auto;">
                            
                            <!-- Header with Logo -->
                            <tr>
                                <td class="header-logo" style="background-color: #ffffff; padding: 40px 30px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                                    <img src="https://res.cloudinary.com/dphbnwjtx/image/upload/v1760012978/logoexpatsavvy_ja4m1j.png" 
                                         alt="Expat Savvy" 
                                         style="height: 60px; width: auto; display: block; margin: 0 auto;" />
                                </td>
                            </tr>
                            
                            <!-- Main Content -->
                            <tr>
                                <td class="main-content" style="padding: 40px 30px; background-color: #ffffff;">
                                    
                                    <!-- Greeting -->
                                    <h1 style="color: #333333; font-size: 24px; font-weight: 600; margin: 0 0 25px 0; line-height: 1.3;">
                                        Hi {name},
                                    </h1>
                                    
                                    <!-- Thank you message -->
                                    <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                        I wanted to check in about your Swiss insurance quote request from yesterday. Have you had a chance to review your options yet?
                                    </p>
                                    
                                    <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                                        Many expats find Swiss insurance confusing - you're not alone! Here are the most common questions we get:
                                    </p>
                                    
                                    <!-- Common Questions -->
                                    <div style="background-color: #ffffff; border: 2px solid #7a0025; padding: 25px; margin: 0 0 30px 0; border-radius: 8px;">
                                        <h2 style="color: #7a0025; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">
                                            Common Swiss Insurance Questions:
                                        </h2>
                                        <ul style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0; padding-left: 20px;">
                                            <li style="margin-bottom: 8px;">❓ Which insurance model is right for me? (HMO vs Standard)</li>
                                            <li style="margin-bottom: 8px;">❓ How much can I actually save?</li>
                                            <li style="margin-bottom: 8px;">❓ What's covered and what's not?</li>
                                            <li style="margin-bottom: 8px;">❓ When can I switch insurers?</li>
                                            <li style="margin-bottom: 8px;">❓ How do deductibles work in Switzerland?</li>
                                            <li style="margin-bottom: 0;">❓ What about pre-existing conditions?</li>
                                        </ul>
                                    </div>
                                    
                                    <!-- Pro Tip -->
                                    <div style="background-color: #f3f4f6; padding: 20px; margin: 0 0 30px 0; border-left: 4px solid #7a0025; border-radius: 6px;">
                                        <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0;">
                                            <strong>💡 Pro Tip:</strong> Most expats overpay by CHF 1,200-2,400/year because they don't optimize their deductible and model choice. A quick consultation can save you significant money!
                                        </p>
                                    </div>
                                    
                                    <!-- Main CTA Button -->
                                    <div style="text-align: center; margin: 0 0 30px 0;">
                                        <!--[if mso]>
                                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" 
                                                     style="height:50px;v-text-anchor:middle;width:280px;" 
                                                     arcsize="12%" stroke="f" fillcolor="#7a0025">
                                        <v:shadow on="t" color="rgba(0,0,0,0.15)" offset="2px,2px"/>
                                        <w:anchorlock/>
                                        <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">
                                            Book Free Consultation (15 min)
                                        </center>
                                        </v:roundrect>
                                        <![endif]-->
                                        <!--[if !mso]><!-->
                                        <a href="{self.cal_link}" 
                                           style="display: inline-block; background-color: #7a0025; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 8px rgba(122, 0, 37, 0.3); transition: all 0.3s ease;">
                                            Book Free Consultation (15 min)
                                        </a>
                                        <!--<![endif]-->
                                    </div>
                                    
                                    <!-- What We'll Cover -->
                                    <div style="background-color: #f9f9f9; padding: 20px; margin: 0 0 30px 0; border-radius: 6px;">
                                        <h3 style="color: #333333; font-size: 16px; font-weight: 600; margin: 0 0 15px 0;">
                                            In 15 minutes, we'll cover:
                                        </h3>
                                        <ul style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0; padding-left: 20px;">
                                            <li style="margin-bottom: 8px;">Your specific health insurance needs</li>
                                            <li style="margin-bottom: 8px;">Best model choice for your situation</li>
                                            <li style="margin-bottom: 8px;">Optimal deductible selection</li>
                                            <li style="margin-bottom: 8px;">Provider comparison tailored to you</li>
                                            <li style="margin-bottom: 0;">Potential savings calculation</li>
                                        </ul>
                                    </div>
                                    
                                    <!-- Closing -->
                                    <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #e0e0e0;">
                                        <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 15px 0;">
                                            Talk soon?
                                        </p>
                                        <p style="color: #333333; font-size: 16px; font-weight: 600; margin: 0 0 5px 0;">
                                            The Expat Savvy Team
                                        </p>
                                        <p style="color: #666666; font-size: 14px; margin: 0;">
                                            Helping expats save on Swiss insurance since 2020
                                        </p>
                                    </div>
                                    
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td class="footer-content" style="background-color: #f5f5f5; padding: 30px; text-align: center;">
                                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;">
                                        <strong>Expat Savvy</strong><br>
                                        Talacker 41, 8001 Zurich, Switzerland
                                    </p>
                                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;">
                                        📧 <a href="mailto:bw@expat-savvy.ch" style="color: #7a0025; text-decoration: none;">bw@expat-savvy.ch</a><br>
                                        📞 <a href="tel:+41791552570" style="color: #7a0025; text-decoration: none;">+41 79 155 25 70</a><br>
                                        🌐 <a href="https://expat-savvy.ch" style="color: #7a0025; text-decoration: none;">expat-savvy.ch</a>
                                    </p>
                                    <p style="color: #999999; font-size: 12px; line-height: 1.5; margin: 0;">
                                        You're receiving this email because you requested health insurance information through our website.
                                    </p>
                                </td>
                            </tr>
                            
                        </table>
                        
                    </td>
                </tr>
            </table>
            
        </body>
        </html>
        """
        
        success = await self.send_email(email, subject, html_content)
        
        # Update database
        if success and supabase:
            try:
                supabase.table("leads").update({
                    "email_day1_sent_at": datetime.utcnow().isoformat()
                }).eq("id", lead_id).execute()
                
                import uuid
                supabase.table("events").insert({
                    "id": str(uuid.uuid4()),
                    "lead_id": lead_id,
                    "name": "email_sent_day1",
                    "props": {"email": email, "subject": subject}
                }).execute()
            except Exception as e:
                print(f"⚠️  Could not update email tracking: {str(e)}")
        
        return success
    
    async def send_day3_email(self, lead_id: str, email: str, name: str, supabase = None):
        """T+72h: Final follow-up email"""
        try:
            subject = "Last Chance: Your Swiss Insurance Analysis is Ready"
            
            html_content = f"""<!DOCTYPE html>
<html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <title>Last Chance: Your Swiss Insurance Analysis is Ready - Expat Savvy</title>
            <!--[if mso]>
            <noscript>
                <xml>
                    <o:OfficeDocumentSettings>
                        <o:PixelsPerInch>96</o:PixelsPerInch>
                    </o:OfficeDocumentSettings>
                </xml>
            </noscript>
            <![endif]-->
            <style type="text/css">
                @media only screen and (max-width: 600px) {{
                    .container {{ width: 100% !important; }}
                    .content {{ padding: 20px !important; }}
                    .button {{ width: 100% !important; display: block !important; }}
                    .text {{ font-size: 16px !important; }}
                    .header-logo {{ padding: 30px 20px !important; }}
                    .main-content {{ padding: 30px 20px !important; }}
                    .footer-content {{ padding: 25px 20px !important; }}
                }}
                
                @media (prefers-color-scheme: dark) {{
                    .dark-mode-bg {{ background-color: #ffffff !important; }}
                    .dark-mode-text {{ color: #333333 !important; }}
                }}
            </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            
            <!-- Preview Text -->
            <div style="display: none; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: transparent;">
                Last chance: Your Swiss insurance analysis is ready - book consultation now
            </div>
            
            <!-- Main Container -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; margin: 0; padding: 0;">
                <tr>
                    <td align="center" style="padding: 20px 0;">
                        
                        <!-- Email Container -->
                        <table class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.08); overflow: hidden; margin: 0 auto;">
                            
                            <!-- Header with Logo -->
                            <tr>
                                <td class="header-logo" style="background-color: #ffffff; padding: 40px 30px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                                    <img src="https://res.cloudinary.com/dphbnwjtx/image/upload/v1760012978/logoexpatsavvy_ja4m1j.png" 
                                         alt="Expat Savvy" 
                                         style="height: 60px; width: auto; display: block; margin: 0 auto;" />
                                </td>
                            </tr>
                            
                            <!-- Main Content -->
                            <tr>
                                <td class="main-content" style="padding: 40px 30px; background-color: #ffffff;">
                                    
                                    <!-- Greeting -->
                                    <h1 style="color: #333333; font-size: 24px; font-weight: 600; margin: 0 0 25px 0; line-height: 1.3;">
                                        Hi {name},
                                    </h1>
                                    
                                    <!-- Thank you message -->
                                    <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                        This is my last email - I don't want to spam you! 😊
                                    </p>
                                    
                                    <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                                        I've prepared your personalized Swiss insurance comparison, but I haven't heard back from you yet. Are you still looking for insurance guidance?
                                    </p>
                                    
                                    <!-- Urgency Box -->
                                    <div style="background-color: #fef2f2; border: 2px solid #7a0025; border-radius: 8px; padding: 25px; margin: 0 0 30px 0;">
                                        <h2 style="color: #7a0025; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">
                                            ⏰ Open Consultation Slots This Week:
                                        </h2>
                                        <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0;">
                                            I have a few spots available for free 15-minute consultations. We can review your situation and I'll show you exactly how much you can save.
                                        </p>
                                    </div>
                                    
                                    <!-- Main CTA Button -->
                                    <div style="text-align: center; margin: 0 0 30px 0;">
                                        <!--[if mso]>
                                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" 
                                                     style="height:50px;v-text-anchor:middle;width:280px;" 
                                                     arcsize="12%" stroke="f" fillcolor="#7a0025">
                                        <v:shadow on="t" color="rgba(0,0,0,0.15)" offset="2px,2px"/>
                                        <w:anchorlock/>
                                        <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">
                                            Grab Your Spot Now
                                        </center>
                                        </v:roundrect>
                                        <![endif]-->
                                        <!--[if !mso]><!-->
                                        <a href="{self.cal_link}" 
                                           style="display: inline-block; background-color: #7a0025; color: #ffffff; text-decoration: none; padding: 18px 35px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 8px rgba(122, 0, 37, 0.3); transition: all 0.3s ease;">
                                            Grab Your Spot Now
                                        </a>
                                        <!--<![endif]-->
                                    </div>
                                    
                                    <!-- Testimonial -->
                                    <div style="background-color: #f9fafb; padding: 20px; margin: 0 0 30px 0; border-radius: 6px;">
                                        <h3 style="color: #333333; font-size: 16px; font-weight: 600; margin: 0 0 15px 0;">
                                            What Past Clients Say:
                                        </h3>
                                        <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; border-left: 4px solid #7a0025;">
                                            <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0; font-style: italic;">
                                                "Robert helped me save CHF 1,800/year by switching to an HMO model. The consultation was incredibly helpful!"
                                            </p>
                                            <p style="color: #666666; font-size: 14px; margin: 0;">
                                                - Sarah M., Zurich
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <!-- What We'll Cover -->
                                    <div style="background-color: #f9f9f9; padding: 20px; margin: 0 0 30px 0; border-radius: 6px;">
                                        <h3 style="color: #333333; font-size: 16px; font-weight: 600; margin: 0 0 15px 0;">
                                            In Your Consultation, We'll Cover:
                                        </h3>
                                        <ul style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0; padding-left: 20px;">
                                            <li style="margin-bottom: 8px;">Your health needs and expectations</li>
                                            <li style="margin-bottom: 8px;">Detailed analysis of top Swiss providers</li>
                                            <li style="margin-bottom: 8px;">Comprehensive comparison tailored to you</li>
                                            <li style="margin-bottom: 8px;">Cost-benefit analysis for your situation</li>
                                            <li style="margin-bottom: 0;">Clear recommendations and next steps</li>
                                        </ul>
                                    </div>
                                    
                                    <!-- Final Message -->
                                    <div style="background-color: #fff8e1; border-left: 4px solid #ffd54f; padding: 20px; margin: 0 0 30px 0;">
                                        <p style="color: #666666; font-size: 15px; line-height: 1.6; margin: 0;">
                                            If you're no longer interested, no worries - just ignore this email and I won't reach out again. Otherwise, I'd love to help you navigate Swiss insurance! 🇨🇭
                                        </p>
                                    </div>
                                    
                                    <!-- Closing -->
                                    <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #e0e0e0;">
                                        <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 15px 0;">
                                            Looking forward to helping you find the perfect insurance solution!
                                        </p>
                                        <p style="color: #333333; font-size: 16px; font-weight: 600; margin: 0 0 5px 0;">
                                            The Expat Savvy Team
                                        </p>
                                        <p style="color: #666666; font-size: 14px; margin: 0;">
                                            Swiss Health Insurance Specialists
            </p>
        </div>
                                    
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td class="footer-content" style="background-color: #f5f5f5; padding: 30px; text-align: center;">
                                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;">
                                        <strong>Expat Savvy</strong><br>
                                        Talacker 41, 8001 Zurich, Switzerland
                                    </p>
                                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;">
                                        📧 <a href="mailto:bw@expat-savvy.ch" style="color: #7a0025; text-decoration: none;">bw@expat-savvy.ch</a><br>
                                        📞 <a href="tel:+41791552570" style="color: #7a0025; text-decoration: none;">+41 79 155 25 70</a><br>
                                        🌐 <a href="https://expat-savvy.ch" style="color: #7a0025; text-decoration: none;">expat-savvy.ch</a>
                                    </p>
                                    <p style="color: #999999; font-size: 12px; line-height: 1.5; margin: 0;">
                                        You're receiving this email because you requested health insurance information through our website.
                                    </p>
                                </td>
                            </tr>
                            
                        </table>
                        
                    </td>
                </tr>
            </table>
            
        </body>
        </html>
        """
            
            success = await self.send_email(email, subject, html_content)
            
            # Update database and mark sequence as completed
            if success and supabase:
                try:
                    supabase.table("leads").update({
                        "email_day3_sent_at": datetime.utcnow().isoformat(),
                        "email_sequence_status": "completed"
                    }).eq("id", lead_id).execute()
                    
                    import uuid
                    supabase.table("events").insert({
                        "id": str(uuid.uuid4()),
                        "lead_id": lead_id,
                        "name": "email_sent_day3",
                        "props": {"email": email, "subject": subject}
                    }).execute()
                except Exception as e:
                    print(f"⚠️  Could not update email tracking: {str(e)}")
            
            return success
        except Exception as e:
            print(f"❌ Error sending Day 3 email: {str(e)}")
            return False
        
    async def process_nurture_queue(self, supabase):
        """
        Process all leads that need nurture emails
        Called by cron job every 6 hours
        """
        if not self.api_key:
            print("⚠️  No email API key configured - skipping nurture processing")
            return {"processed": 0, "sent": 0}
        
        try:
            now = datetime.utcnow().replace(tzinfo=None)  # Make timezone-naive for comparison
            stats = {"processed": 0, "day1_sent": 0, "day3_sent": 0, "errors": 0}
            
            # Get all active leads that haven't booked AND were created after email system deployment
            # Only process leads created after October 9, 2025 (when we deployed the email system)
            cutoff_date = "2025-10-09T00:00:00Z"
            result = supabase.table("leads").select("*").eq("email_sequence_status", "active").eq("stage", "new").gte("created_at", cutoff_date).execute()
            
            leads = result.data if result.data else []
            stats["processed"] = len(leads)
            
            print(f"📧 Processing {len(leads)} leads in nurture queue...")
            
            for lead in leads:
                try:
                    created_at = datetime.fromisoformat(lead["created_at"].replace("Z", "+00:00")).replace(tzinfo=None)  # Make timezone-naive
                    hours_since_creation = (now - created_at).total_seconds() / 3600
                    
                    # Send Day 1 email (24 hours after creation)
                    if hours_since_creation >= 24 and not lead.get("email_day1_sent_at"):
                        print(f"  → Sending Day 1 email to {lead['email']}")
                        success = await self.send_day1_email(
                            lead["id"], 
                            lead["email"], 
                            lead.get("name", "there"),
                            supabase
                        )
                        if success:
                            stats["day1_sent"] += 1
                    
                    # Send Day 3 email (72 hours after creation)
                    elif hours_since_creation >= 72 and not lead.get("email_day3_sent_at"):
                        print(f"  → Sending Day 3 email to {lead['email']}")
                        success = await self.send_day3_email(
                            lead["id"], 
                            lead["email"], 
                            lead.get("name", "there"),
                            supabase
                        )
                        if success:
                            stats["day3_sent"] += 1
                
                except Exception as e:
                    print(f"  ❌ Error processing lead {lead.get('id')}: {str(e)}")
                    stats["errors"] += 1
            
            print(f"✅ Nurture queue processed: {stats['day1_sent']} Day 1 emails, {stats['day3_sent']} Day 3 emails")
            return stats
            
        except Exception as e:
            print(f"❌ Error processing nurture queue: {str(e)}")
            return {"error": str(e)}
        
    async def send_email(self, to_email: str, subject: str, html_content: str):
        """Send email via configured provider - returns True on success"""
        if self.provider == "resend":
            return await self._send_via_resend(to_email, subject, html_content)
        elif self.provider == "postmark":
            return await self._send_via_postmark(to_email, subject, html_content)
        else:
            print(f"⚠️  Email provider '{self.provider}' not implemented")
            return False
            
    async def _send_via_resend(self, to_email: str, subject: str, html_content: str):
        """Send email via Resend - returns True on success"""
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
                    return True
                else:
                    print(f"⚠️  Resend error: {response.status_code} - {response.text}")
                    return False
                    
        except Exception as e:
            print(f"❌ Resend email error: {str(e)}")
            return False
            
    async def _send_via_postmark(self, to_email: str, subject: str, html_content: str):
        """Send email via Postmark - returns True on success"""
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
                    return True
                else:
                    print(f"⚠️  Postmark error: {response.status_code} - {response.text}")
                    return False
                    
        except Exception as e:
            print(f"❌ Postmark email error: {str(e)}")
            return False