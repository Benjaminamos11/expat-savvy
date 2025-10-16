"""
Email automation service for lead nurturing
"""

import httpx
import os
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import asyncio

def _get_user_segment(situation: str) -> str:
    """Determine if user is NEW or SWITCHING based on form data"""
    situation_lower = situation.lower() if situation else ''
    
    # NEW expats: new, setup, arriving
    if situation_lower in ['new', 'setup', 'arriving']:
        return 'NEW'
    
    # SWITCHING: switch, save, compare, review, change
    elif situation_lower in ['switch', 'save', 'compare', 'review', 'change']:
        return 'SWITCHING'
    
    # Default to SWITCHING for existing
    return 'SWITCHING'

class EmailService:
    def __init__(self):
        self.provider = os.getenv("EMAIL_PROVIDER", "resend")  # resend|postmark|mailgun
        self.api_key = os.getenv("EMAIL_API_KEY", "").strip()  # Strip whitespace/newlines
        self.from_email = os.getenv("FROM_EMAIL", "hello@expat-savvy.ch")
        self.cal_link = os.getenv("CAL_LINK", "https://cal.com/robertkolar/expat-savvy")
        
    async def start_nurture_sequence(self, lead_id: str, email: str, name: Optional[str] = None, insurance_type: Optional[str] = None, supabase = None):
        """
        Start the email nurture sequence - sends welcome email immediately
        6h and 24h emails are handled by the cron endpoint
        """
        if not self.api_key:
            print("⚠️  No email API key configured - skipping email automation")
            return False
            
        try:
            # Send welcome email immediately
            success = await self.send_welcome_email(lead_id, email, name or "there", insurance_type or "health insurance", supabase)
            
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
        
    async def send_welcome_email(self, lead_id: str, email: str, name: str, insurance_type: str = "health insurance", supabase = None):
        """T+0: Welcome email - sent immediately after form submission"""
        subject = f"✅ Got it! But we need to know you first..."
        
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
                                        Thanks for your {insurance_type} request!
                                    </p>
                                    
                                    <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                        Here's the thing:
                                    </p>
                                    
                                    <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                                        We CAN send you generic quotes... but you'd probably choose wrong and overpay.
                                    </p>
                                    
                                    <!-- Process explanation -->
                                    <div style="background-color: #ffffff; border: 2px solid #7a0025; padding: 25px; margin: 0 0 30px 0; border-radius: 8px;">
                                        <h2 style="color: #7a0025; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">
                                            Why? Because the "best" insurance depends on YOUR situation:
                                        </h2>
                                        <ul style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0; padding-left: 20px;">
                                            <li style="margin-bottom: 8px;">→ Do you go to the gym? (Some cover up to CHF 1,300/year)</li>
                                            <li style="margin-bottom: 8px;">→ Need glasses/contacts? (Coverage can offset your premium)</li>
                                            <li style="margin-bottom: 8px;">→ Any pre-existing conditions? (Affects which plans work)</li>
                                            <li style="margin-bottom: 8px;">→ Have access to group discounts? (20% off, not advertised)</li>
                                            <li style="margin-bottom: 8px;">→ What's your budget & priorities?</li>
                                            <li style="margin-bottom: 0;">→ Current policy? (We need to see what you have to compare properly)</li>
                                        </ul>
                                    </div>
                                    
                                    <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                                        Without knowing this = we're guessing. And guessing costs you money.
                                    </p>
                                    
                                    <h3 style="color: #333333; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">
                                        Two ways forward:
                                    </h3>
                                    
                                    <!-- Main CTA Button -->
                                    <div style="background-color: #f9f9f9; padding: 20px; margin: 0 0 20px 0; border-radius: 6px;">
                                        <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 10px 0;">
                                            <strong>✅ 15-60 min call (Recommended)</strong>
                                        </p>
                                        <ul style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 15px 0; padding-left: 20px;">
                                            <li style="margin-bottom: 5px;">→ We're happy to take time for you - no rush</li>
                                            <li style="margin-bottom: 5px;">→ Ask the right questions about YOUR situation</li>
                                            <li style="margin-bottom: 5px;">→ Show you options that actually fit YOUR life</li>
                                            <li style="margin-bottom: 0;">→ Find hidden savings (gym, glasses, group rates)</li>
                                        </ul>
                                        <div style="text-align: center; margin: 15px 0 0 0;">
                                            <!--[if mso]>
                                            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" 
                                                         style="height:50px;v-text-anchor:middle;width:280px;" 
                                                         arcsize="12%" stroke="f" fillcolor="#7a0025">
                                            <v:shadow on="t" color="rgba(0,0,0,0.15)" offset="2px,2px"/>
                                            <w:anchorlock/>
                                            <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">
                                                Book Free Consultation
                                            </center>
                                            </v:roundrect>
                                            <![endif]-->
                                            <!--[if !mso]><!-->
                                            <a href="{self.cal_link}" 
                                               style="display: inline-block; background-color: #7a0025; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 8px rgba(122, 0, 37, 0.3); transition: all 0.3s ease;">
                                                Book Free Consultation
                                            </a>
                                            <!--<![endif]-->
                                        </div>
                                    </div>
                                    
                                    <!-- Alternative Option -->
                                    <div style="background-color: #fff8e1; border-left: 4px solid #ffd54f; padding: 20px; margin: 0 0 30px 0;">
                                        <p style="color: #666666; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
                                            <strong>✅ Email back-and-forth</strong>
                                        </p>
                                        <ul style="color: #666666; font-size: 15px; line-height: 1.6; margin: 0; padding-left: 20px;">
                                            <li style="margin-bottom: 5px;">→ Takes 2-3 days</li>
                                            <li style="margin-bottom: 5px;">→ Multiple emails</li>
                                            <li style="margin-bottom: 0;">→ Still works, just slower</li>
                                        </ul>
                                    </div>
                                    
                                    <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                                        Your choice - either way, we'll get you sorted!
                                    </p>
                                    
                                    <!-- Signature -->
                                    <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #e0e0e0;">
                                        <p style="color: #333333; font-size: 16px; font-weight: 600; margin: 0 0 5px 0;">
                                            Robert & Team
                                        </p>
                                        <p style="color: #666666; font-size: 14px; margin: 0 0 15px 0;">
                                            Expat Savvy
                                        </p>
                                        <p style="color: #777777; font-size: 14px; font-style: italic; margin: 0;">
                                            P.S. Most common regret: "I wish I knew about the gym coverage earlier" (CHF 1,300/year = basically free gym)
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
    
    async def send_6h_email(self, lead_id: str, email: str, name: str, insurance_type: str = "health insurance", supabase = None):
        """T+6h: First follow-up email"""
        subject = f"⚠️ {name}, you might be leaving CHF 1,300/year on the table"
        
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
                                        Quick update on your {insurance_type} request...
                                    </p>
                                    
                                    <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                                        The problem with generic quotes:
                                    </p>
                                    
                                    <!-- Benefits Breakdown -->
                                    <div style="background-color: #ffffff; border: 2px solid #7a0025; padding: 25px; margin: 0 0 30px 0; border-radius: 8px;">
                                        <h2 style="color: #7a0025; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">
                                            They can't tell you about:
                                        </h2>
                                        <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 10px 0;">
                                            <strong>💰 Hidden money-back benefits:</strong>
                                        </p>
                                        <ul style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0; padding-left: 20px;">
                                            <li style="margin-bottom: 5px;">→ Gym membership: Up to CHF 1,300/year reimbursed</li>
                                            <li style="margin-bottom: 5px;">→ Glasses/contacts: CHF 200-300/year covered</li>
                                            <li style="margin-bottom: 0;">→ Preventive care: Extra CHF 500/year for checkups</li>
                                        </ul>
                                        <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 15px 0; font-style: italic;">
                                            These basically PAY for part of your premium!
                                        </p>
                                        
                                        <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 10px 0;">
                                            <strong>🎯 Group discounts you might qualify for:</strong>
                                        </p>
                                        <ul style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0; padding-left: 20px;">
                                            <li style="margin-bottom: 5px;">→ Employer partnerships (not public)</li>
                                            <li style="margin-bottom: 5px;">→ Association discounts (20% off)</li>
                                            <li style="margin-bottom: 0;">→ Multi-policy bundles</li>
                                        </ul>
                                        
                                        <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 10px 0;">
                                            <strong>🚫 Pre-existing condition issues:</strong>
                                        </p>
                                        <ul style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0; padding-left: 20px;">
                                            <li style="margin-bottom: 5px;">→ Some models won't accept certain conditions</li>
                                            <li style="margin-bottom: 5px;">→ Others charge extra</li>
                                            <li style="margin-bottom: 0;">→ Some have workarounds we know</li>
                                        </ul>
                                    </div>
                                    
                                    <!-- Real Example -->
                                    <div style="background-color: #f9f9f9; padding: 25px; margin: 0 0 30px 0; border-radius: 8px; border-left: 4px solid #7a0025;">
                                        <h3 style="color: #333333; font-size: 16px; font-weight: 600; margin: 0 0 15px 0;">
                                            Real example from last month:
                                        </h3>
                                        <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
                                            Maria (Spain, Zurich) got a "cheap" online quote for <strong>CHF 380/month</strong>.
                                        </p>
                                        <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
                                            On the call, we found:
                                        </p>
                                        <ul style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0; padding-left: 20px;">
                                            <li style="margin-bottom: 5px;">→ She goes to gym → Saves CHF 108/month (CHF 1,300/year back)</li>
                                            <li style="margin-bottom: 5px;">→ She needs glasses → Saves CHF 25/month (CHF 300/year back)</li>
                                            <li style="margin-bottom: 0;">→ Group discount available → Saves CHF 60/month</li>
                                        </ul>
                                        <p style="color: #7a0025; font-size: 16px; line-height: 1.6; margin: 0; font-weight: 600;">
                                            New effective cost: CHF 187/month (basically 50% off!)
                                        </p>
                                        <p style="color: #777777; font-size: 14px; line-height: 1.6; margin: 10px 0 0 0; font-style: italic;">
                                            But she would have NEVER known about this from a generic quote.
                                        </p>
                                    </div>
                                    
                                    <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                                        Want to see what YOU qualify for?
                                    </p>
                                    
                                    <!-- Main CTA Button -->
                                    <div style="text-align: center; margin: 0 0 30px 0;">
                                        <!--[if mso]>
                                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" 
                                                     style="height:50px;v-text-anchor:middle;width:320px;" 
                                                     arcsize="12%" stroke="f" fillcolor="#7a0025">
                                        <v:shadow on="t" color="rgba(0,0,0,0.15)" offset="2px,2px"/>
                                        <w:anchorlock/>
                                        <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">
                                            Book Free Consultation - 15-60 Minutes
                                        </center>
                                        </v:roundrect>
                                        <![endif]-->
                                        <!--[if !mso]><!-->
                                        <a href="{self.cal_link}" 
                                           style="display: inline-block; background-color: #7a0025; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 8px rgba(122, 0, 37, 0.3); transition: all 0.3s ease;">
                                            Book Free Consultation - 15-60 Minutes
                                        </a>
                                        <!--<![endif]-->
                                        <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 15px 0 0 0; font-style: italic;">
                                            We're happy to take the time to get this right for you. No rush, no pressure.
                                        </p>
                                    </div>
                                    
                                    <!-- Alternative Option -->
                                    <div style="background-color: #fff8e1; border-left: 4px solid #ffd54f; padding: 20px; margin: 0 0 30px 0;">
                                        <p style="color: #666666; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
                                            <strong>Or send us:</strong>
                                        </p>
                                        <ol style="color: #666666; font-size: 15px; line-height: 1.6; margin: 0; padding-left: 20px;">
                                            <li style="margin-bottom: 5px;">Current insurance policy (if you have one)</li>
                                            <li style="margin-bottom: 5px;">Do you use: Gym / Need glasses / Alternative medicine?</li>
                                            <li style="margin-bottom: 5px;">Any health conditions we should know about?</li>
                                            <li style="margin-bottom: 0;">Your monthly budget</li>
                                        </ol>
                                        <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 10px 0 0 0;">
                                            We'll find every discount and benefit you qualify for.
                                        </p>
                                    </div>
                                    
                                    <!-- Closing -->
                                    <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #e0e0e0;">
                                        <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 15px 0;">
                                            Best,
                                        </p>
                                        <p style="color: #333333; font-size: 16px; font-weight: 600; margin: 0 0 5px 0;">
                                            Robert
                                        </p>
                                        <p style="color: #777777; font-size: 14px; font-style: italic; margin: 15px 0 0 0;">
                                            P.S. The gym coverage alone pays for the "upgrade" to better insurance. Most people don't realize this 🏋️
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
                    "email_6h_sent_at": datetime.utcnow().isoformat()
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
    
    async def send_24h_email(self, lead_id: str, email: str, name: str, insurance_type: str = "health insurance", supabase = None):
        """T+24h: Final follow-up email"""
        subject = f"📊 {name}, here's what we need to find your best option"
        try:
            
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
                                        {name},
                                    </h1>
                                    
                                    <!-- Opening -->
                                    <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                        This is the last email (promise!), but I wanted to make sure I answered the KEY question:
                                    </p>
                                    
                                    <h2 style="color: #7a0025; font-size: 20px; font-weight: 600; margin: 0 0 20px 0;">
                                        "What do you need from me to find my best option?"
                                    </h2>
                                    
                                    <!-- What We Need Section -->
                                    <div style="background-color: #ffffff; border: 2px solid #7a0025; padding: 25px; margin: 0 0 30px 0; border-radius: 8px;">
                                        <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                                            <strong>If you go the email route, send us:</strong>
                                        </p>
                                        <ol style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; padding-left: 20px;">
                                            <li style="margin-bottom: 10px;"><strong>Current insurance policy</strong> (if you have one) - we need to see what you're comparing against</li>
                                            <li style="margin-bottom: 10px;"><strong>Lifestyle factors:</strong>
                                                <ul style="margin-top: 5px; padding-left: 20px;">
                                                    <li>Do you use a gym? (CHF 1,300/year benefit possible)</li>
                                                    <li>Need glasses/contacts? (CHF 300/year coverage)</li>
                                                    <li>Use alternative medicine? (Some cover, some don't)</li>
                                                </ul>
                                            </li>
                                            <li style="margin-bottom: 10px;"><strong>Any health conditions?</strong> - affects which models work for you</li>
                                            <li style="margin-bottom: 10px;"><strong>Your monthly budget</strong> - so we show realistic options</li>
                                            <li style="margin-bottom: 0;"><strong>Your priorities:</strong> Cheapest? Best coverage? Specific needs?</li>
                                        </ol>
                                        <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0; font-style: italic;">
                                            💡 With this info, we can find every discount and benefit you qualify for.
                                        </p>
                                    </div>
                                    
                                    <!-- OR Section -->
                                    <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; text-align: center; font-weight: 600;">
                                        OR (way faster)
                                    </p>
                                    
                                    <!-- Main CTA Button -->
                                    <div style="background-color: #f9f9f9; padding: 25px; margin: 0 0 30px 0; border-radius: 8px;">
                                        <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                                            <strong>📞 15-60 minute call:</strong>
                                        </p>
                                        <ul style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0; padding-left: 20px;">
                                            <li style="margin-bottom: 5px;">→ We ask all the right questions in 5 minutes</li>
                                            <li style="margin-bottom: 5px;">→ Screen share your current policy → instant comparison</li>
                                            <li style="margin-bottom: 5px;">→ Show you EXACTLY what you'd save & get</li>
                                            <li style="margin-bottom: 0;">→ Done. Clean. Simple.</li>
                                        </ul>
                                        <div style="text-align: center;">
                                            <!--[if mso]>
                                            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" 
                                                         style="height:50px;v-text-anchor:middle;width:280px;" 
                                                         arcsize="12%" stroke="f" fillcolor="#7a0025">
                                            <v:shadow on="t" color="rgba(0,0,0,0.15)" offset="2px,2px"/>
                                            <w:anchorlock/>
                                            <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">
                                                Book Free Call
                                            </center>
                                            </v:roundrect>
                                            <![endif]-->
                                            <!--[if !mso]><!-->
                                            <a href="{self.cal_link}" 
                                               style="display: inline-block; background-color: #7a0025; color: #ffffff; text-decoration: none; padding: 18px 40px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 8px rgba(122, 0, 37, 0.3); transition: all 0.3s ease;">
                                                Book Free Call
                                            </a>
                                            <!--<![endif]-->
                                        </div>
                                    </div>
                                    
                                    <!-- Bottom Note -->
                                    <div style="background-color: #fff8e1; border-left: 4px solid #ffd54f; padding: 20px; margin: 0 0 30px 0;">
                                        <p style="color: #666666; font-size: 15px; line-height: 1.6; margin: 0;">
                                            <strong>Not interested?</strong> No problem! Just ignore this email and I won't bug you again. But if you DO want to optimize your {insurance_type}, I'm here to help - either way works for me 👍
                                        </p>
                                    </div>
                                    
                                    <!-- Closing -->
                                    <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #e0e0e0;">
                                        <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 15px 0;">
                                            Either way, all the best!
                                        </p>
                                        <p style="color: #333333; font-size: 16px; font-weight: 600; margin: 0 0 5px 0;">
                                            Robert
                                        </p>
                                        <p style="color: #666666; font-size: 14px; margin: 0 0 15px 0;">
                                            Expat Savvy
                                        </p>
                                        <p style="color: #777777; font-size: 14px; font-style: italic; margin: 0;">
                                            P.S. The most common "aha" moment on calls: "Wait, they reimburse gym memberships?!" 😄
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
                        "email_24h_sent_at": datetime.utcnow().isoformat(),
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
        Sends T+6h and T+24h follow-up emails
        """
        if not self.api_key:
            print("⚠️  No email API key configured - skipping nurture processing")
            return {"processed": 0, "sent": 0}
        
        try:
            now = datetime.utcnow().replace(tzinfo=None)  # Make timezone-naive for comparison
            stats = {"processed": 0, "6h_sent": 0, "24h_sent": 0, "errors": 0}
            
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
                    
                    # Send 6h email (6 hours after creation)
                    if hours_since_creation >= 6 and not lead.get("email_6h_sent_at"):
                        print(f"  → Sending 6h email to {lead['email']}")
                        success = await self.send_6h_email(
                            lead["id"], 
                            lead["email"], 
                            lead.get("name", "there"),
                            lead.get("type", "health insurance"),
                            supabase
                        )
                        if success:
                            stats["6h_sent"] += 1
                    
                    # Send 24h email (24 hours after creation)
                    elif hours_since_creation >= 24 and not lead.get("email_24h_sent_at"):
                        print(f"  → Sending 24h email to {lead['email']}")
                        success = await self.send_24h_email(
                            lead["id"],
                            lead["email"],
                            lead.get("name", "there"),
                            lead.get("type", "health insurance"),
                            supabase
                        )
                        if success:
                            stats["24h_sent"] += 1
                
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