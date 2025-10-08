#!/usr/bin/env python3
import os
import time
import re
import json
import ssl
import asyncio
import aiohttp
from datetime import datetime
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

print("🚀 Starting Expat-Savvy AI Backend...")

# Environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("❌ OPENAI_API_KEY environment variable is required")
    
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
PRIMAI_API_URL = "https://primai-okp-api.fly.dev/v1/compare"

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
if not RESEND_API_KEY:
    print("⚠️  RESEND_API_KEY not set - email functionality will be disabled")

# FastAPI app
app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Master AI Prompt
MASTER_PROMPT = """# 🧑‍💼 Expat-Savvy Insurance Assistant – Master Prompt

## 🎯 Role & Goal
You are the **Expat-Savvy Insurance Assistant**. Your mission: **qualify leads and generate consultation meetings with Robert** (insurance advisor). You should:
- Answer briefly about Swiss insurance (health, life, 3rd pillar, household, liability, etc.).
- Always guide users toward booking a meeting for **personalized advice and customized rates**.

## 📑 Conversation Rules
- Keep responses **short (30–50 words)**.
- Use a **professional, neutral, but friendly** tone (no emojis in body text).
- Show **empathy** where appropriate ("I understand moving can be overwhelming").
- Always **acknowledge** before asking a question.
- **Ask one specific question at a time** (progressive disclosure).
- After **2–3 exchanges**, suggest a free meeting with Robert.

## 📊 CARD-STYLE RESPONSES - REQUIRED FORMAT
**Use this exact structure for ALL responses:**

**{Bold Title with Emoji}**
- {Bullet point 1}
- {Bullet point 2} 
- {Bullet point 3}
- {Bullet point 4}

👉 **{Call-to-Action Question}**

## 🗂 Information Policy
- **Do provide** short, clear info about: Health insurance, Life insurance, 3rd pillar (retirement savings), Other Swiss insurances (accident, liability, household, etc.)
- **Always connect info back to user's needs** (customized offers available in consultation).
- **Never**: Give guarantees, Recommend a specific insurer, Discuss unrelated topics (politely decline)

## 🔢 PREMIUM CALCULATION - CRITICAL RULES

**ONLY call primai_get_premiums when you have ALL 5 parameters:**
1. **Age** (number or birth year)
2. **ZIP** (4-digit Swiss postal code)  
3. **Franchise/Deductible** (300/500/1000/1500/2000/2500)
4. **Accident coverage** (yes/no)
5. **Model** (standard/HMO/Telmed/family_doctor - defaults to "standard")

**ZERO FAKE NUMBERS** - Never estimate or fabricate premium amounts.
**If missing ANY parameter** - Ask for the missing one specifically.

## Tool Success Response Template
"**💡 Live Premiums for {ZIP} (age {age})**
- Franchise: {franchise} · Model: {model} · Accident: {yes/no}
- {insurer_1}: CHF {price_1}/month
- {insurer_2}: CHF {price_2}/month  
- {insurer_3}: CHF {price_3}/month
- Source: PrimAI live data

👉 **Would you like me to email you these premium quotes?** I can send you the comparison with detailed information, or **Book consultation**: https://cal.com/robertkolar/expat-savvy"

## Tool Failure Response Template
"I couldn't retrieve live premiums right now. Would you like to **book a consultation** so Robert can run this for you?

**Book via Cal.com**: https://cal.com/robertkolar/expat-savvy or **WhatsApp**: +41 79 155 25 70"

## Example Responses - CARD-STYLE FORMAT TO FOLLOW

User: "Tell me about supplementary insurance options."
Response: "**🛡️ Supplementary Insurance Benefits**
- Private / semi-private hospital stays
- Dental & orthodontic coverage  
- Alternative medicine (acupuncture, homeopathy)
- Faster specialist appointments
- International/expat coverage worldwide

👉 **Would you like me to email you detailed supplementary insurance information?** Just provide your email address and I'll send you a comprehensive guide with coverage options."

User: "What's the 3rd pillar?"
Response: "**💰 3rd Pillar Retirement Savings**
- Tax-deductible contributions up to CHF 7,056/year
- Flexible investment or savings options
- Use funds for home purchase or retirement
- Significant tax benefits for expats

👉 Are you **employed** or **self-employed**? This affects your contribution limits."

## Hand-Off Protocol
- After 2–3 messages or once qualified, say: **"This sounds like something Robert can help you with personally. You can book a free online consultation here: [Book via Cal.com](https://cal.com/robertkolar/expat-savvy). Or would you prefer to request a callback?"**
- Once hand-off is complete, **stop probing**. Only reply if the user asks follow-ups.

## PROACTIVE EMAIL OFFERS - CRITICAL
After providing premium quotes or detailed insurance information, ALWAYS offer to email:
- "Would you like me to email you these premium quotes for easy reference?"
- "I can send you this information via email if that would be helpful?"
- "Should I email you a summary of what we discussed?"

When user shows interest but hasn't booked yet:
- "I can email you the premium comparison and schedule a follow-up call?"
- "Want me to send you this info and have Robert reach out personally?"

ALWAYS be proactive about email offers - don't wait for users to ask!

Your goal: Qualify leads efficiently with scannable, structured responses that convert to Robert consultations, while proactively offering email support."""

# Tool definitions for OpenAI API - proper format
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "primai_get_premiums",
            "description": "Get live Swiss health insurance premium quotes from PrimAI API",
            "parameters": {
                "type": "object",
                "properties": {
                    "age": {
                        "type": "integer",
                        "description": "Age in years (convert birth year if needed)"
                    },
                    "zip": {
                        "type": "string", 
                        "description": "4-digit Swiss postal code"
                    },
                    "franchise": {
                        "type": "integer",
                        "description": "Deductible/franchise amount",
                        "enum": [300, 500, 1000, 1500, 2000, 2500]
                    },
                    "accident_included": {
                        "type": "boolean",
                        "description": "Whether accident coverage is included"
                    },
                    "model": {
                        "type": "string",
                        "description": "Insurance model type",
                        "enum": ["standard", "HMO", "Telmed", "family_doctor"],
                        "default": "standard"
                    }
                },
                "required": ["age", "zip", "franchise", "accident_included", "model"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "resend_send_lead_email",
            "description": "Email collected lead data and quote context to Robert via Resend API",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Lead's name"},
                    "email": {"type": "string", "description": "Lead's email address"},
                    "phone": {"type": "string", "description": "Lead's phone number"},
                    "context": {"type": "string", "description": "Quote details and conversation context"}
                },
                "required": ["email", "context"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "send_user_email",
            "description": "Send premium quotes or insurance information directly to the user's email address",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_email": {"type": "string", "description": "User's email address"},
                    "user_name": {"type": "string", "description": "User's name (optional)"},
                    "premium_data": {"type": "string", "description": "Premium quotes and calculation details"},
                    "message": {"type": "string", "description": "Additional information or summary"}
                },
                "required": ["user_email", "premium_data"]
            }
        }
    }
]

# Tool dispatch functions
async def primai_get_premiums(age: int, zip: str, franchise: int, accident_included: bool, model: str) -> str:
    """Tool function to get live premiums from PrimAI API"""
    print(f"🔍 Getting premiums for age {age}, ZIP {zip}, franchise {franchise}, accident {accident_included}, model {model}")
    
    try:
        # Create SSL context for HTTPS requests
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        connector = aiohttp.TCPConnector(ssl=ssl_context)
        timeout = aiohttp.ClientTimeout(total=30)
        
        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            # Use PrimAI's correct parameter names
            params = {
                "plz": zip,  # PrimAI uses 'plz' not 'zip'
                "age": age,
                "deductible": franchise,  # PrimAI uses 'deductible' not 'franchise'
                "accident": "true" if accident_included else "false",  # Must be string
                "model": model.lower(),  # Lowercase model name
                "limit": 5  # Get top 5 results
            }
            
            print(f"[PrimAI] Calling API with params: {params}")
            
            async with session.get(PRIMAI_API_URL, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # PrimAI returns {offers: [...]} format
                    offers = data.get('offers', [])
                    if offers and len(offers) > 0:
                        print(f"[PrimAI] ✅ Got {len(offers)} live offers")
                        
                        # Take top 3 results
                        top_offers = offers[:3]
                        
                        result = f"**💡 Your Live Health Insurance Quotes**\n\n"
                        result += f"📍 **Details:** ZIP {zip} · Age {age} · Deductible CHF {franchise}\n"
                        result += f"🏥 **Model:** {model.title()} · Accident: {'Included' if accident_included else 'Not included'}\n\n"
                        
                        for i, offer in enumerate(top_offers, 1):
                            insurer = offer.get('insurer', 'Unknown')
                            price_data = offer.get('price', {})
                            premium = price_data.get('total', 'N/A')
                            offer_model = offer.get('model', model)
                            
                            # Highlight expat-friendly insurers
                            star = " ⭐" if insurer in ["Helsana", "CSS", "Swica", "Sanitas"] else ""
                            
                            result += f"---\n\n"
                            result += f"**{i}. {insurer}**{star}\n\n"
                            result += f"🏥 Model: {offer_model}\n"
                            result += f"💰 Premium: **CHF {premium}/month**\n\n"
                            result += f"[Get Rate Button] [Get Consultation Button]\n\n"
                        
                        result += "---\n\n"
                        result += "📊 *Source: Official FOPH data via PrimAI*\n\n"
                        result += "💬 **Want these quotes by email?** Just let me know and I'll send you detailed information!\n\n"
                        result += "Book via Cal.com: https://cal.com/robertkolar/expat-savvy"
                        
                        return result
                    else:
                        print(f"[PrimAI] ❌ No offers in response")
                        return "API returned no offers"
                else:
                    print(f"[PrimAI] ❌ HTTP {response.status}")
                    return f"API error: {response.status}"
    
    except Exception as e:
        print(f"[PrimAI] ❌ Exception: {e}")
        return f"API connection failed: {e}"

async def resend_send_lead_email(name: str = "", email: str = "", phone: str = "", context: str = "") -> str:
    """Tool function to send lead notification emails via Resend API"""
    print(f"📧 Sending lead email for {email}")
    
    try:
        # Create professional email template
        email_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }}
                .header {{ background: white; padding: 20px; text-align: center; border-bottom: 3px solid #dc2626; }}
                .logo {{ height: 45px; }}
                .content {{ padding: 20px; background: #f9f9f9; }}
                .lead-info {{ background: white; padding: 15px; margin: 15px 0; border: 2px solid #dc2626; border-radius: 8px; }}
                .footer {{ background: #1f2937; color: white; padding: 15px; text-align: center; }}
                h2 {{ color: #dc2626; }}
            </style>
        </head>
        <body>
            <div class="header">
                <img src="https://expat-savvy.ch/images/logo-expat-savvy.svg" alt="Expat-Savvy" class="logo">
                <h1 style="color: #1f2937; margin: 10px 0 0 0;">New Lead from AI Assistant</h1>
            </div>
            
            <div class="content">
                <h2>📋 Lead Information</h2>
                <div class="lead-info">
                    <p><strong>📧 Email:</strong> {email or 'Not provided'}</p>
                    <p><strong>👤 Name:</strong> {name or 'Not provided'}</p>
                    <p><strong>📞 Phone:</strong> {phone or 'Not provided'}</p>
                    <p><strong>🕒 Time:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                </div>
                
                <h2>💬 Conversation Context</h2>
                <div class="lead-info">
                    <p>{context}</p>
                </div>
                
                <p><strong>⚡ Action Required:</strong> Follow up with this lead within 24 hours for best conversion rates.</p>
            </div>
            
            <div class="footer">
                <img src="https://expat-savvy.ch/images/logo-expat-savvy.svg" alt="Expat-Savvy" style="height: 24px; filter: brightness(0) invert(1);">
                <p style="margin: 5px 0 0 0; font-size: 12px;">Expat-Savvy AI Assistant</p>
            </div>
        </body>
        </html>
        """
        
        # Create SSL context for HTTPS requests
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        connector = aiohttp.TCPConnector(ssl=ssl_context)
        timeout = aiohttp.ClientTimeout(total=30)
        
        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            async with session.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {RESEND_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "from": "Expat-Savvy AI <ai@expat-savvy.ch>",
                    "to": ["bw@expat-savvy.ch"],
                    "cc": ["robert@expat-savvy.ch"],
                    "subject": f"🚨 New AI Lead: {email or 'Anonymous User'}",
                    "html": email_html
                }
            ) as response:
                if response.status == 200:
                    print("📧 ✅ Lead email sent successfully")
                    return "✅ Lead information sent to Robert successfully"
                else:
                    print(f"📧 ❌ Resend API error: {response.status}")
                    return f"❌ Email failed: HTTP {response.status}"
    
    except Exception as e:
        print(f"📧 ❌ Email exception: {e}")
        return f"❌ Email error: {e}"

async def send_user_email(user_email: str, premium_data: str, user_name: str = "", message: str = "") -> str:
    """Tool function to send premium quotes/info directly to user"""
    print(f"📧 Sending user email to {user_email}")
    
    try:
        subject = "Your Swiss Insurance Information from Expat-Savvy"
        
        # Pre-format data to avoid backslashes in f-strings
        formatted_premium = premium_data.replace('\n', '<br>')
        formatted_message = message.replace('\n', '<br>') if message else ''
        greeting = f" {user_name}" if user_name else ""
        message_box = f'<div class="premium-box">{formatted_message}</div>' if message else ''
        
        email_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }}
                .header {{ background: white; padding: 20px; text-align: center; border-bottom: 3px solid #dc2626; }}
                .logo {{ height: 45px; }}
                .content {{ padding: 20px; background: #f9f9f9; }}
                .premium-box {{ background: white; padding: 15px; margin: 15px 0; border: 2px solid #dc2626; border-radius: 8px; }}
                .footer {{ background: #1f2937; color: white; padding: 15px; text-align: center; }}
                h2 {{ color: #dc2626; }}
                .cta {{ background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 5px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <img src="https://expat-savvy.ch/images/logo-expat-savvy.svg" alt="Expat-Savvy" class="logo">
                <h1 style="color: #1f2937; margin: 10px 0 0 0;">Your Swiss Insurance Information</h1>
            </div>
            
            <div class="content">
                <p>Hello{greeting},</p>
                
                <p>Thank you for using our AI assistant! Here's the information you requested:</p>
                
                <div class="premium-box">
                    {formatted_premium}
                </div>
                
                {message_box}
                
                <h2>🤝 Ready for Personal Guidance?</h2>
                <p>While our AI provides excellent initial information, our human experts can offer personalized advice tailored to your specific situation.</p>
                
                <p style="text-align: center;">
                    <a href="https://cal.com/robertkolar/expat-savvy" class="cta">📅 Book Free Consultation</a>
                    <a href="https://wa.me/41791552570" class="cta">💬 WhatsApp Chat</a>
                </p>
                
                <p><strong>Questions?</strong> Reply to this email or contact us directly.</p>
                
                <p>Best regards,<br>
                The Expat-Savvy Team</p>
            </div>
            
            <div class="footer">
                <img src="https://expat-savvy.ch/images/logo-expat-savvy.svg" alt="Expat-Savvy" style="height: 24px; filter: brightness(0) invert(1);">
                <p style="margin: 5px 0 0 0; font-size: 12px;">Your trusted Swiss insurance experts</p>
            </div>
        </body>
        </html>
        """
        
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        connector = aiohttp.TCPConnector(ssl=ssl_context)
        timeout = aiohttp.ClientTimeout(total=30)
        
        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            async with session.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {RESEND_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "from": "Expat-Savvy AI <ai@expat-savvy.ch>",
                    "to": [user_email],
                    "subject": subject,
                    "html": email_html
                }
            ) as response:
                if response.status == 200:
                    print(f"📧 ✅ User email sent to {user_email}")
                    return f"✅ Information sent to {user_email} successfully!"
                else:
                    print(f"📧 ❌ User email failed: {response.status}")
                    return f"❌ Email failed: HTTP {response.status}"
    
    except Exception as e:
        print(f"📧 ❌ User email exception: {e}")
        return f"❌ Email error: {e}"

# Tool dispatcher
async def dispatch_tool(call_id: str, name: str, args: dict) -> dict:
    """Dispatch tool calls to appropriate functions"""
    print(f"🔧 Dispatching tool: {name} with call_id: {call_id}")
    
    try:
        if name == "primai_get_premiums":
            result = await primai_get_premiums(**args)
            return {"call_id": call_id, "result": result}
        elif name == "resend_send_lead_email":
            result = await resend_send_lead_email(**args)
            return {"call_id": call_id, "result": result}
        elif name == "send_user_email":
            result = await send_user_email(**args)
            return {"call_id": call_id, "result": result}
        else:
            return {"call_id": call_id, "error": f"Unknown tool: {name}"}
    except Exception as e:
        print(f"❌ Tool dispatch error: {e}")
        return {"call_id": call_id, "error": str(e)}

class ChatBody(BaseModel):
    userInput: str
    conversationId: str | None = None

# Simple in-memory conversation store
conversation_history: Dict[str, List[Dict[str, Any]]] = {}

@app.post("/api/agent_json")
async def chat_endpoint(body: ChatBody):
    """Main chat endpoint with tool calling support"""
    print(f"\n🗣️ User: {body.userInput}")
    print(f"🔄 Conversation ID: {body.conversationId}")
    
    start_time = time.time()
    
    try:
        # Import OpenAI here to avoid startup issues
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=OPENAI_API_KEY)
        
        # Get or create conversation ID
        conv_id = body.conversationId or f"conv_{int(time.time())}"
        
        # Get conversation history or create new one
        if conv_id not in conversation_history:
            conversation_history[conv_id] = [{"role": "system", "content": MASTER_PROMPT}]
        
        # Prepare messages with history
        messages = conversation_history[conv_id].copy()
        
        # Add current user message
        messages.append({"role": "user", "content": body.userInput})
        
        print("🤖 Calling OpenAI API...")
        api_start = time.time()
        
        # Call OpenAI with tools
        completion = await client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto"
        )
        
        api_time = time.time() - api_start
        print(f"⏱️ OpenAI API took {api_time:.2f}s")
        
        message = completion.choices[0].message
        
        # Handle tool calls
        if message.tool_calls:
            print(f"🔧 Processing {len(message.tool_calls)} tool calls")
            
            tool_results = []
            for tool_call in message.tool_calls:
                try:
                    args = json.loads(tool_call.function.arguments)
                    result = await dispatch_tool(tool_call.id, tool_call.function.name, args)
                    tool_results.append({
                        "tool_call_id": tool_call.id,
                        "output": result.get("result", result.get("error", "Unknown error"))
                    })
                except Exception as e:
                    print(f"❌ Tool call error: {e}")
                    tool_results.append({
                        "tool_call_id": tool_call.id,
                        "output": f"Error: {e}"
                    })
            
            # Send tool results back to OpenAI
            messages.append({"role": "assistant", "content": message.content, "tool_calls": message.tool_calls})
            
            for result in tool_results:
                messages.append({
                    "role": "tool",
                    "tool_call_id": result["tool_call_id"],
                    "content": result["output"]
                })
            
            # Get final response
            final_completion = await client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=messages
            )
            
            final_message = final_completion.choices[0].message.content
        else:
            final_message = message.content
        
        total_time = time.time() - start_time
        print(f"⏱️ Total response time: {total_time:.2f}s")
        print(f"🤖 Assistant: {final_message[:100]}...")
        
        # Save conversation history
        conversation_history[conv_id].append({"role": "user", "content": body.userInput})
        conversation_history[conv_id].append({"role": "assistant", "content": final_message})
        
        # Limit history to last 10 messages (+ system prompt)
        if len(conversation_history[conv_id]) > 21:  # system + 10 exchanges
            conversation_history[conv_id] = [conversation_history[conv_id][0]] + conversation_history[conv_id][-20:]
        
        return {
            "message": final_message,
            "conversationId": conv_id
        }
        
    except Exception as e:
        import traceback
        print(f"❌ Chat error: {e}")
        print(f"❌ Full traceback:")
        traceback.print_exc()
        return {
            "message": "I'm having trouble right now. Please try again in a moment, or contact us directly at +41 79 155 25 70.",
            "conversationId": None
        }

@app.post("/api/send_test_email")
async def send_test_email():
    """Test endpoint for email functionality"""
    result = await resend_send_lead_email(
        name="Test User",
        email="test@example.com", 
        phone="+41 79 123 45 67",
        context="Test email from API - checking logo visibility and red frame styling."
    )
    return {"result": result}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "expat-savvy-ai"}

if __name__ == "__main__":
    print("🏥 Expat-Savvy AI Backend Ready!")
    print("✅ PrimAI Integration: Live premium calculation")
    print("✅ Resend Integration: Professional email system") 
    print("✅ Proactive Email Offers: AI suggests emailing quotes")
    print("🌐 Starting server on http://localhost:8000")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)

