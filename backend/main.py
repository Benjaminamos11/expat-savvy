"""
FastAPI Lead Platform for Expat Savvy
Handles lead collection, attribution tracking, and full-funnel analytics
"""

from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import secrets
import os
from typing import Optional, List
import httpx
from datetime import datetime, timedelta
import json
import uuid
import asyncio
from supabase import Client

from database import get_supabase
from supabase_models import LeadModel, EventModel, AdCostModel, EventsDailyModel, LeadSourcesModel
from schemas import (
    LeadCreate, LeadResponse, EventCreate, PlausibleEvent, 
    ETLRequest, ETLResponse, DailyReportResponse, CPLReportResponse, 
    AttributionResponse, LeadSourceCreate
)
from services.plausible import PlausibleService
from services.email import EmailService
from services.etl import ETLService
from services.llm import get_llm_service
from services.attribution import AttributionService
from auth import verify_admin
from api.tools import router as tools_router

app = FastAPI(
    title="Expat Savvy Lead Platform",
    description="Lead collection and attribution tracking platform",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://expat-savvy.ch", "http://localhost:3000", "http://localhost:4321"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files and templates
templates = Jinja2Templates(directory="templates")
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialize services
plausible_service = PlausibleService()
email_service = EmailService()
etl_service = ETLService()
llm_service = get_llm_service()

# Include AI tools router
app.include_router(tools_router)

@app.get("/")
async def root():
    return {"message": "Expat Savvy Lead Platform API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

@app.get("/test-db")
async def test_db_connection(supabase: Client = Depends(get_supabase)):
    """Test database connection"""
    try:
        # Simple test query to verify connection
        result = supabase.table("leads").select("count").eq("id", "test").execute()
        return {"status": "db_connected", "message": "Database connection successful"}
    except Exception as e:
        return {"status": "db_error", "message": str(e)}

# Lead endpoints
@app.post("/api/lead", response_model=LeadResponse)
async def create_lead(lead_data: LeadCreate, supabase: Client = Depends(get_supabase)):
    """Create a new lead with attribution tracking"""
    try:
        # Check if lead already exists for this email
        existing_result = supabase.table("leads").select("*").eq("email", lead_data.email).execute()
        
        if existing_result.data:
            # Lead exists - update instead of creating duplicate
            existing_lead = existing_result.data[0]
            lead_id = existing_lead["id"]
            
            # Prepare update data
            update_data = lead_data.dict()
            
            # 🎯 ENHANCED ATTRIBUTION: Enrich with platform detection
            update_data = AttributionService.enrich_lead_data(update_data)
            
            # Smart update logic:
            # - If existing is 'new' and new is 'booked', upgrade to 'booked'
            # - If existing is 'booked', keep as 'booked'
            # - Always stop email sequence if user is booking
            if lead_data.stage == "booked" or existing_lead.get("stage") == "booked":
                update_data["stage"] = "booked"
                update_data["email_sequence_status"] = "stopped"
                update_data["flow"] = "self_service_to_booking" if existing_lead.get("flow") == "self_service" else "booking"
            else:
                # Keep existing email sequence status
                update_data["email_sequence_status"] = existing_lead.get("email_sequence_status", "active")
            
            # Update existing lead
            result = supabase.table("leads").update(update_data).eq("id", lead_id).execute()
            
            if not result.data:
                raise HTTPException(status_code=500, detail="Failed to update existing lead")
            
            created_lead = result.data[0]
            print(f"🔄 Updated existing lead {lead_id} for {lead_data.email}")
            
        else:
            # New lead - create as before
            lead_id = str(uuid.uuid4())
            
            # Prepare lead data
            lead_dict = lead_data.dict()
            lead_dict["id"] = lead_id
            
            # 🎯 ENHANCED ATTRIBUTION: Enrich with platform detection
            lead_dict = AttributionService.enrich_lead_data(lead_dict)
            
            # Set email sequence status to 'active' for new leads with consent
            if lead_dict.get("consent_marketing") and lead_dict.get("stage") == "new":
                lead_dict["email_sequence_status"] = "active"
            else:
                lead_dict["email_sequence_status"] = "stopped"
            
            # Insert lead into Supabase
            result = supabase.table("leads").insert(lead_dict).execute()
            
            if not result.data:
                raise HTTPException(status_code=500, detail="Failed to create lead")
            
            created_lead = result.data[0]
            print(f"✅ Created new lead {lead_id} for {lead_data.email}")
        
        # Create lead_sources entry for first/last touch attribution
        lead_source_data = {
            "id": str(uuid.uuid4()),
            "lead_id": lead_id,
            # First touch
            "first_utm_source": created_lead.get("utm_source"),
            "first_utm_medium": created_lead.get("utm_medium"),
            "first_utm_campaign": created_lead.get("utm_campaign"),
            "first_utm_term": created_lead.get("utm_term"),
            "first_utm_content": created_lead.get("utm_content"),
            "first_referrer": created_lead.get("referrer"),
            "first_landing_path": created_lead.get("landing_path"),
            "first_touch_at": created_lead.get("first_touch_at") or datetime.utcnow().isoformat(),
            # Last touch (same as first for new leads)
            "last_utm_source": created_lead.get("utm_source"),
            "last_utm_medium": created_lead.get("utm_medium"),
            "last_utm_campaign": created_lead.get("utm_campaign"),
            "last_utm_term": created_lead.get("utm_term"),
            "last_utm_content": created_lead.get("utm_content"),
            "last_referrer": created_lead.get("referrer"),
            "last_landing_path": created_lead.get("landing_path"),
            "last_touch_at": created_lead.get("last_touch_at") or datetime.utcnow().isoformat(),
            # Derived
            "channel_derived": created_lead.get("channel"),
            "city": created_lead.get("city"),
            "page_type": created_lead.get("page_type"),
            "flow": created_lead.get("flow")
        }
        
        supabase.table("lead_sources").insert(lead_source_data).execute()

        # Create lead_created event
        event_data = {
            "id": str(uuid.uuid4()),
            "lead_id": lead_id,
            "name": "lead_created",
            "props": {
                "channel": created_lead.get("channel"),
                "city": created_lead.get("city"),
                "flow": created_lead.get("flow"),
                "page_type": created_lead.get("page_type")
            }
        }
        
        supabase.table("events").insert(event_data).execute()
        
        # Send server-side Plausible event
        await plausible_service.track_event(
            event_name="lead_created",
            url=f"https://expat-savvy.ch{created_lead.get('landing_path', '')}",
            props={
                "channel": created_lead.get("channel"),
                "city": created_lead.get("city"),
                "campaign": created_lead.get("utm_campaign"),
                "source": created_lead.get("utm_source"),
                "page_type": created_lead.get("page_type"),
                "flow": created_lead.get("flow")
            }
        )
        
        # Start email automation if consent given and not already booked
        if created_lead.get("consent_marketing") and created_lead.get("stage") == "new":
            await email_service.start_nurture_sequence(
                lead_id, 
                created_lead.get("email"), 
                created_lead.get("name"),
                created_lead.get("type", "health insurance"),
                supabase
            )
        
        return LeadResponse(ok=True, lead_id=lead_id)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating lead: {str(e)}")

@app.post("/api/webhooks/calcom")
async def calcom_webhook(webhook_data: dict, supabase: Client = Depends(get_supabase)):
    """Handle Cal.com booking webhooks"""
    try:
        # Log the webhook data for debugging
        print(f"🔔 Cal.com webhook received: {json.dumps(webhook_data, indent=2)}")
        
        # Extract data from webhook
        payload = webhook_data.get("payload", {})
        attendee_email = None
        attendee_name = None
        attendee_phone = None
        
        attendees = payload.get("attendees", [])
        if attendees:
            attendee_email = attendees[0].get("email")
            attendee_name = attendees[0].get("name")
            # Phone might be in responses or metadata
        
        if not attendee_email:
            raise HTTPException(status_code=400, detail="No attendee email found")
        
        # Extract appointment details
        booking_id = payload.get("uid") or payload.get("id")
        event_type_id = payload.get("eventTypeId")
        event_type_name = payload.get("eventType", {}).get("title") if "eventType" in payload else None
        scheduled_at = payload.get("startTime")
        duration = payload.get("eventType", {}).get("length") if "eventType" in payload else 30
        timezone = payload.get("attendees", [{}])[0].get("timeZone") if attendees else None
        meeting_url = payload.get("metadata", {}).get("videoCallUrl") or payload.get("location")
        
        # Find or create lead
        lead_result = supabase.table("leads").select("*").eq("email", attendee_email).execute()
        
        lead_id = None
        if lead_result.data:
            lead = lead_result.data[0]
            lead_id = lead["id"]
        else:
            # Create lead if doesn't exist (direct booking without form fill)
            lead_id = str(uuid.uuid4())
            supabase.table("leads").insert({
                "id": lead_id,
                "email": attendee_email,
                "name": attendee_name,
                "stage": "booked",
                "flow": "consultation",
                "email_sequence_status": "stopped",
                "consent_marketing": False
            }).execute()
            lead = {"id": lead_id, "email": attendee_email}
        
        # Create appointment record
        appointment_data = {
            "id": str(uuid.uuid4()),
            "lead_id": lead_id,
            "attendee_name": attendee_name,
            "attendee_email": attendee_email,
            "attendee_phone": attendee_phone,
            "booking_id": booking_id,
            "event_type_id": str(event_type_id) if event_type_id else None,
            "event_type_name": event_type_name,
            "scheduled_at": scheduled_at,
            "duration_minutes": duration,
            "timezone": timezone,
            "status": "scheduled",
            "meeting_url": meeting_url,
            "webhook_payload": payload
        }
        
        supabase.table("appointments").insert(appointment_data).execute()
        
        # Update lead stage to booked
        supabase.table("leads").update({
            "stage": "booked",
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", lead_id).execute()
        
        # Create booking event
        event_data = {
            "id": str(uuid.uuid4()),
            "lead_id": lead_id,
            "name": "consultation_booked",
            "props": {
                "event_type_id": event_type_id,
                "booking_id": booking_id,
                "scheduled_at": scheduled_at
            }
        }
        
        supabase.table("events").insert(event_data).execute()
        
        # Send server-side Plausible event
        await plausible_service.track_event(
            event_name="consultation_booked",
            url=f"https://expat-savvy.ch{lead.get('landing_path', '')}",
            props={
                "channel": lead.get("channel"),
                "city": lead.get("city"),
                "campaign": lead.get("utm_campaign"),
                "source": lead.get("utm_source"),
                "page_type": lead.get("page_type"),
                "flow": "consult"
            }
        )
        
        # Stop nurture email sequence
        await email_service.stop_nurture_sequence(lead_id, supabase)
        
        return {"ok": True, "message": "Booking processed successfully", "appointment_id": appointment_data["id"]}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing webhook: {str(e)}")

@app.post("/api/events")
async def track_event(event_data: EventCreate, supabase: Client = Depends(get_supabase)):
    """Generic event tracking endpoint"""
    try:
        event_dict = event_data.dict()
        event_dict["id"] = str(uuid.uuid4())
        
        result = supabase.table("events").insert(event_dict).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create event")
        
        return {"ok": True, "event_id": result.data[0]["id"]}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error tracking event: {str(e)}")

# Email Nurture Endpoints

@app.api_route("/api/email/process-nurture", methods=["GET", "POST"])
async def process_nurture_emails(supabase: Client = Depends(get_supabase)):
    """
    Process nurture email queue - sends Day 1 and Day 3 emails
    Called by external cron job every 6 hours
    Accepts both GET and POST for cron job compatibility
    """
    try:
        stats = await email_service.process_nurture_queue(supabase)
        
        return {
            "ok": True,
            "message": "Nurture queue processed successfully",
            "stats": stats,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing nurture queue: {str(e)}")

@app.post("/api/test/simulate-booking")
async def simulate_booking(supabase: Client = Depends(get_supabase)):
    """
    Test endpoint to simulate a Cal.com booking for bw@expat-savvy.ch
    This tests the entire webhook flow
    """
    test_webhook_data = {
        "triggerEvent": "BOOKING_CREATED",
        "createdAt": datetime.utcnow().isoformat(),
        "payload": {
            "uid": f"test-booking-{uuid.uuid4()}",
            "id": 12345,
            "eventTypeId": 67890,
            "eventType": {
                "title": "15min Consultation Call",
                "length": 15
            },
            "startTime": (datetime.utcnow() + timedelta(days=1)).isoformat(),
            "endTime": (datetime.utcnow() + timedelta(days=1, minutes=15)).isoformat(),
            "attendees": [
                {
                    "email": "bw@expat-savvy.ch",
                    "name": "Benjamin Wagner",
                    "timeZone": "Europe/Zurich"
                }
            ],
            "location": "https://meet.google.com/test-link",
            "metadata": {
                "videoCallUrl": "https://meet.google.com/test-link"
            }
        }
    }
    
    # Call the webhook handler
    response = await calcom_webhook(test_webhook_data, supabase)
    return response

@app.post("/api/email/test-all-emails")
async def test_all_emails():
    """
    Test endpoint to send all 3 nurture emails to bw@expat-savvy.ch
    """
    try:
        test_email = "bw@expat-savvy.ch"
        test_name = "Benjamin"
        test_lead_id = "test-" + test_email.replace("@", "-").replace(".", "-")
        
        results = {}
        
        # Send Welcome Email
        print("📧 Sending Welcome email...")
        results["welcome"] = await email_service.send_welcome_email(test_lead_id, test_email, test_name, supabase=None)
        
        # Wait to avoid rate limit (Resend: 2 requests/second)
        await asyncio.sleep(1)
        
        # Send Day 1 Email
        print("📧 Sending Day 1 email...")
        results["day1"] = await email_service.send_day1_email(test_lead_id, test_email, test_name, supabase=None)
        
        # Wait to avoid rate limit
        await asyncio.sleep(1)
        
        # Send Day 3 Email
        print("📧 Sending Day 3 email...")
        results["day3"] = await email_service.send_day3_email(test_lead_id, test_email, test_name, supabase=None)
        
        return {
            "ok": True,
            "message": f"Test emails sent to {test_email}",
            "results": results,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending test emails: {str(e)}")

@app.get("/api/email/status")
async def get_email_status(admin: dict = Depends(verify_admin), supabase: Client = Depends(get_supabase)):
    """Get email funnel status and statistics"""
    try:
        # Count leads by email sequence status
        active_result = supabase.table("leads").select("id", count="exact").eq("email_sequence_status", "active").execute()
        stopped_result = supabase.table("leads").select("id", count="exact").eq("email_sequence_status", "stopped").execute()
        completed_result = supabase.table("leads").select("id", count="exact").eq("email_sequence_status", "completed").execute()
        
        # Count emails sent
        welcome_sent = supabase.table("leads").select("id", count="exact").not_.is_("email_welcome_sent_at", "null").execute()
        day1_sent = supabase.table("leads").select("id", count="exact").not_.is_("email_day1_sent_at", "null").execute()
        day3_sent = supabase.table("leads").select("id", count="exact").not_.is_("email_day3_sent_at", "null").execute()
        
        # Get recent email events
        events_result = supabase.table("events").select("*").in_("name", ["email_sent_welcome", "email_sent_day1", "email_sent_day3"]).order("created_at", desc=True).limit(20).execute()
        
        return {
            "sequences": {
                "active": active_result.count if hasattr(active_result, 'count') else 0,
                "stopped": stopped_result.count if hasattr(stopped_result, 'count') else 0,
                "completed": completed_result.count if hasattr(completed_result, 'count') else 0
            },
            "emails_sent": {
                "welcome": welcome_sent.count if hasattr(welcome_sent, 'count') else 0,
                "day1": day1_sent.count if hasattr(day1_sent, 'count') else 0,
                "day3": day3_sent.count if hasattr(day3_sent, 'count') else 0
            },
            "recent_events": events_result.data if events_result.data else []
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting email status: {str(e)}")

@app.post("/api/email/send-test")
async def send_test_email(
    email_type: str,
    test_data: dict = {},
    admin: dict = Depends(verify_admin),
    supabase: Client = Depends(get_supabase)
):
    """
    Send test email to bw@expat-savvy.ch
    
    Args:
        email_type: "welcome", "6h", or "24h"
        test_data: Optional dict with name, insurance_type, situation
    """
    try:
        test_email = "bw@expat-savvy.ch"
        test_name = test_data.get('name', 'Test User')
        insurance_type = test_data.get('insurance_type', 'health insurance')
        
        print(f"📧 Sending test {email_type} email to {test_email}")
        
        if email_type == "welcome":
            success = await email_service.send_welcome_email(
                "test-lead-id", test_email, test_name, insurance_type, None
            )
        elif email_type == "6h":
            success = await email_service.send_6h_email(
                "test-lead-id", test_email, test_name, insurance_type, None
            )
        elif email_type == "24h":
            success = await email_service.send_24h_email(
                "test-lead-id", test_email, test_name, insurance_type, None
            )
        else:
            raise HTTPException(400, "Invalid email_type. Must be 'welcome', '6h', or '24h'")
        
        if success:
            return {
                "success": True,
                "sent_to": test_email,
                "email_type": email_type,
                "test_data": test_data
            }
        else:
            raise HTTPException(500, "Failed to send test email")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending test email: {str(e)}")

# Admin endpoints (protected)
@app.get("/api/leads")
async def get_leads(
    page: int = 1,
    limit: int = 50,
    channel: Optional[str] = None,
    campaign: Optional[str] = None,
    city: Optional[str] = None,
    stage: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    admin: dict = Depends(verify_admin),
    supabase: Client = Depends(get_supabase)
):
    """Get paginated leads with filters"""
    try:
        # Build query
        query = supabase.table("leads").select("*")
        
        # Apply filters
        if channel:
            query = query.eq("channel", channel)
        if campaign:
            query = query.eq("utm_campaign", campaign)
        if city:
            query = query.eq("city", city)
        if stage:
            query = query.eq("stage", stage)
        if start_date:
            query = query.gte("created_at", start_date)
        if end_date:
            query = query.lte("created_at", end_date)
        
        # Get total count first using proper Supabase syntax
        count_query = supabase.table("leads").select("id", count="exact")
        
        # Apply same filters to count query
        if channel:
            count_query = count_query.eq("channel", channel)
        if campaign:
            count_query = count_query.eq("utm_campaign", campaign)
        if city:
            count_query = count_query.eq("city", city)
        if stage:
            count_query = count_query.eq("stage", stage)
        if start_date:
            count_query = count_query.gte("created_at", start_date)
        if end_date:
            count_query = count_query.lte("created_at", end_date)
            
        count_result = count_query.execute()
        total = count_result.count if hasattr(count_result, 'count') else 0
        
        # Apply pagination and get results
        offset = (page - 1) * limit
        result = query.range(offset, offset + limit - 1).order("created_at", desc=True).execute()
        
        return {
            "leads": result.data if result.data else [],
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching leads: {str(e)}")

@app.get("/api/funnels")
async def get_funnels(
    channel: Optional[str] = None,
    campaign: Optional[str] = None,
    city: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    period: str = "30d",
    admin: dict = Depends(verify_admin),
    supabase: Client = Depends(get_supabase)
):
    """Get funnel metrics from Plausible"""
    try:
        # Get funnel data from Plausible
        funnel_data = await plausible_service.get_funnel_data(period)
        
        if not funnel_data:
            # Fallback to mock data if Plausible API fails
            funnel_data = {
                "quote_flow_started": 0,
                "quote_submitted": 0,
                "lead_created": 0,
                "consultation_booked": 0,
                "consultation_started": 0
            }
        
        # Get overall site stats
        aggregate_stats = await plausible_service.get_aggregate_stats(period)
        total_visitors = 0
        if aggregate_stats and aggregate_stats.get("results"):
            visitors_data = next((item for item in aggregate_stats["results"] if item["metric"] == "visitors"), None)
            if visitors_data:
                total_visitors = visitors_data.get("value", 0)
        
        # Calculate conversion rates
        quote_started = funnel_data.get("quote_flow_started", 0)
        quote_submitted = funnel_data.get("quote_submitted", 0)
        leads_created = funnel_data.get("lead_created", 0)
        consultations_booked = funnel_data.get("consultation_booked", 0)
        consultations_started = funnel_data.get("consultation_started", 0)
        
        return {
            "total_visitors": total_visitors,
            "quote_started": quote_started,
            "quote_submitted": quote_submitted,
            "leads_created": leads_created,
            "consultation_booked": consultations_booked,
            "consultation_started": consultations_started,
            "conversion_rates": {
                "visitor_to_quote": (quote_started / total_visitors) if total_visitors > 0 else 0,
                "quote_to_submit": (quote_submitted / quote_started) if quote_started > 0 else 0,
                "submit_to_lead": (leads_created / quote_submitted) if quote_submitted > 0 else 0,
                "lead_to_consultation": (consultations_booked / leads_created) if leads_created > 0 else 0,
                "book_to_attend": (consultations_started / consultations_booked) if consultations_booked > 0 else 0
            },
            "period": period,
            "last_updated": "real-time"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching funnels: {str(e)}")

@app.post("/api/adcosts/upload")
async def upload_ad_costs(
    file: UploadFile = File(...),
    admin: dict = Depends(verify_admin),
    supabase: Client = Depends(get_supabase)
):
    """Upload ad costs CSV"""
    try:
        # Process CSV file (implementation needed)
        content = await file.read()
        # Parse CSV and create AdCost records
        
        return {"ok": True, "message": "Ad costs uploaded successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading ad costs: {str(e)}")

@app.post("/api/notes/{lead_id}")
async def add_note(
    lead_id: str,
    note_data: dict,
    admin: dict = Depends(verify_admin),
    supabase: Client = Depends(get_supabase)
):
    """Add note to lead"""
    try:
        # Get current lead
        lead_result = supabase.table("leads").select("*").eq("id", lead_id).execute()
        
        if not lead_result.data:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        lead = lead_result.data[0]
        
        # Add note to lead.notes JSON field
        notes = lead.get("notes", {})
        if "notes" not in notes:
            notes["notes"] = []
        
        notes["notes"].append({
            "content": note_data.get("content", ""),
            "added_at": datetime.utcnow().isoformat(),
            "added_by": admin["username"]
        })
        
        # Update lead with new notes
        supabase.table("leads").update({
            "notes": notes,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", lead_id).execute()
        
        return {"ok": True, "message": "Note added successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding note: {str(e)}")

# Phase A Endpoints - Data Foundation & ETL

@app.post("/api/etl/plausible", response_model=ETLResponse)
async def run_plausible_etl(
    etl_request: ETLRequest,
    admin: dict = Depends(verify_admin)
):
    """Run Plausible ETL for a specific date"""
    try:
        success = await etl_service.run_daily_plausible_etl(etl_request.target_date)
        date_str = etl_request.target_date or (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        
        return ETLResponse(
            success=success,
            message=f"Plausible ETL {'completed successfully' if success else 'failed'} for {date_str}",
            date=date_str
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error running Plausible ETL: {str(e)}")

@app.post("/api/etl/gsc", response_model=ETLResponse)
async def run_gsc_etl(
    etl_request: ETLRequest,
    admin: dict = Depends(verify_admin)
):
    """Run Google Search Console ETL for a specific date"""
    try:
        success = await etl_service.run_gsc_etl(etl_request.target_date)
        date_str = etl_request.target_date or (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        
        return ETLResponse(
            success=success,
            message=f"GSC ETL {'completed successfully' if success else 'failed'} for {date_str}",
            date=date_str
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error running GSC ETL: {str(e)}")

@app.post("/api/etl/full", response_model=ETLResponse)
async def run_full_etl(
    etl_request: ETLRequest,
    admin: dict = Depends(verify_admin)
):
    """Run all ETL processes for a specific date"""
    try:
        results = await etl_service.run_full_etl(etl_request.target_date)
        date_str = etl_request.target_date or (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        
        success_count = sum(1 for success in results.values() if success)
        total_count = len(results)
        
        return ETLResponse(
            success=success_count == total_count,
            message=f"ETL processes completed: {success_count}/{total_count} successful for {date_str}",
            date=date_str,
            details=results
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error running full ETL: {str(e)}")

@app.post("/api/attribution/migrate")
async def migrate_lead_sources(admin: dict = Depends(verify_admin)):
    """Migrate existing leads to lead_sources table"""
    try:
        success = await etl_service.migrate_lead_sources()
        
        return {
            "ok": success,
            "message": "Lead sources migration completed successfully" if success else "Migration failed"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error migrating lead sources: {str(e)}")

@app.get("/api/attribution/status")
async def get_attribution_status(
    admin: dict = Depends(verify_admin),
    supabase: Client = Depends(get_supabase)
):
    """Get attribution tracking status and summary stats"""
    try:
        # Count leads
        leads_result = supabase.table("leads").select("id", count="exact").execute()
        total_leads = leads_result.count if leads_result.count else 0
        
        # Count lead_sources (attribution records)
        sources_result = supabase.table("lead_sources").select("id", count="exact").execute()
        total_attributed = sources_result.count if sources_result.count else 0
        
        # Get recent events
        events_result = supabase.table("events_daily").select("*").order("date", desc=True).limit(7).execute()
        recent_events = events_result.data if events_result.data else []
        
        return {
            "total_leads": total_leads,
            "total_attributed": total_attributed,
            "attribution_coverage": f"{(total_attributed/total_leads)*100:.1f}%" if total_leads > 0 else "0%",
            "recent_etl_data": recent_events,
            "last_etl_run": recent_events[0]["date"] if recent_events else "Never"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting attribution status: {str(e)}")

@app.get("/api/reports/daily")
async def get_daily_report(
    date: Optional[str] = None,
    admin: dict = Depends(verify_admin),
    supabase: Client = Depends(get_supabase)
):
    """Get daily performance report"""
    try:
        if not date:
            date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        
        # Get events_daily data
        events_result = supabase.table("events_daily").select("*").eq("date", date).execute()
        events_data = events_result.data if events_result.data else []
        
        # Get ad_costs data
        ad_costs_result = supabase.table("ad_costs").select("*").eq("date", date).execute()
        ad_costs_data = ad_costs_result.data if ad_costs_result.data else []
        
        # Aggregate events summary
        events_summary = {
            "total_pageviews": sum(event.get("pageviews", 0) for event in events_data),
            "total_quote_starts": sum(event.get("quote_starts", 0) for event in events_data),
            "total_quote_submits": sum(event.get("quote_submits", 0) for event in events_data),
            "total_bookings": sum(event.get("bookings", 0) for event in events_data),
            "total_leads": sum(event.get("leads", 0) for event in events_data)
        }
        
        # Aggregate ad costs summary
        ad_costs_summary = {
            "total_spend": sum(float(cost.get("cost", 0)) for cost in ad_costs_data),
            "campaigns_count": len(set(cost.get("campaign") for cost in ad_costs_data)),
            "sources": list(set(cost.get("source") for cost in ad_costs_data))
        }
        
        # Calculate CPL
        cpl_summary = {}
        if events_summary["total_leads"] > 0 and ad_costs_summary["total_spend"] > 0:
            cpl_summary["overall_cpl"] = ad_costs_summary["total_spend"] / events_summary["total_leads"]
        else:
            cpl_summary["overall_cpl"] = 0
        
        # Top pages by performance
        top_pages = sorted(events_data, key=lambda x: x.get("pageviews", 0), reverse=True)[:10]
        
        return {
            "date": date,
            "events_summary": events_summary,
            "ad_costs_summary": ad_costs_summary,
            "cpl_summary": cpl_summary,
            "top_pages": top_pages
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating daily report: {str(e)}")

@app.get("/api/reports/cpl")
async def get_cpl_report(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    channel: Optional[str] = None,
    admin: dict = Depends(verify_admin),
    supabase: Client = Depends(get_supabase)
):
    """Get Cost Per Lead analysis"""
    try:
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")
        
        # Get leads in date range
        leads_query = supabase.table("leads").select("*").gte("created_at", start_date).lte("created_at", end_date)
        if channel:
            leads_query = leads_query.eq("channel", channel)
        
        leads_result = leads_query.execute()
        leads = leads_result.data if leads_result.data else []
        
        # Get ad costs in date range
        ad_costs_result = supabase.table("ad_costs").select("*").gte("date", start_date).lte("date", end_date).execute()
        ad_costs = ad_costs_result.data if ad_costs_result.data else []
        
        # Calculate metrics
        total_spend = sum(float(cost.get("cost", 0)) for cost in ad_costs)
        paid_leads = [lead for lead in leads if lead.get("channel") == "paid"]
        total_leads = len(paid_leads)
        
        overall_cpl = total_spend / total_leads if total_leads > 0 else 0
        
        # Group by channel
        by_channel = {}
        for lead in leads:
            ch = lead.get("channel", "unknown")
            if ch not in by_channel:
                by_channel[ch] = {"leads": 0, "spend": 0, "cpl": 0}
            by_channel[ch]["leads"] += 1
        
        # Add spend to channels
        for cost in ad_costs:
            source = cost.get("source", "unknown")
            # Map source to channel (simplified)
            if source in ["google", "meta", "linkedin"]:
                if "paid" not in by_channel:
                    by_channel["paid"] = {"leads": 0, "spend": 0, "cpl": 0}
                by_channel["paid"]["spend"] += float(cost.get("cost", 0))
        
        # Calculate CPL by channel
        for ch, data in by_channel.items():
            if data["leads"] > 0 and data["spend"] > 0:
                data["cpl"] = data["spend"] / data["leads"]
        
        # Group by campaign
        by_campaign = {}
        for lead in paid_leads:
            campaign = lead.get("utm_campaign", "unknown")
            if campaign not in by_campaign:
                by_campaign[campaign] = {"leads": 0, "spend": 0, "cpl": 0}
            by_campaign[campaign]["leads"] += 1
        
        for cost in ad_costs:
            campaign = cost.get("campaign", "unknown")
            if campaign not in by_campaign:
                by_campaign[campaign] = {"leads": 0, "spend": 0, "cpl": 0}
            by_campaign[campaign]["spend"] += float(cost.get("cost", 0))
        
        # Calculate CPL by campaign
        for campaign, data in by_campaign.items():
            if data["leads"] > 0:
                data["cpl"] = data["spend"] / data["leads"]
        
        return {
            "period": f"{start_date} to {end_date}",
            "total_spend": total_spend,
            "total_leads": total_leads,
            "overall_cpl": overall_cpl,
            "by_channel": by_channel,
            "by_campaign": by_campaign
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating CPL report: {str(e)}")

@app.get("/api/attribution/{lead_id}")
async def get_lead_attribution(
    lead_id: str,
    admin: dict = Depends(verify_admin),
    supabase: Client = Depends(get_supabase)
):
    """Get full attribution data for a specific lead"""
    try:
        # Get lead
        lead_result = supabase.table("leads").select("*").eq("id", lead_id).execute()
        if not lead_result.data:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        lead = lead_result.data[0]
        
        # Get lead_sources
        lead_source_result = supabase.table("lead_sources").select("*").eq("lead_id", lead_id).execute()
        
        first_touch = {}
        last_touch = {}
        
        if lead_source_result.data:
            lead_source = lead_source_result.data[0]
            first_touch = {
                "utm_source": lead_source.get("first_utm_source"),
                "utm_medium": lead_source.get("first_utm_medium"),
                "utm_campaign": lead_source.get("first_utm_campaign"),
                "utm_term": lead_source.get("first_utm_term"),
                "utm_content": lead_source.get("first_utm_content"),
                "referrer": lead_source.get("first_referrer"),
                "landing_path": lead_source.get("first_landing_path"),
                "timestamp": lead_source.get("first_touch_at")
            }
            
            last_touch = {
                "utm_source": lead_source.get("last_utm_source"),
                "utm_medium": lead_source.get("last_utm_medium"),
                "utm_campaign": lead_source.get("last_utm_campaign"),
                "utm_term": lead_source.get("last_utm_term"),
                "utm_content": lead_source.get("last_utm_content"),
                "referrer": lead_source.get("last_referrer"),
                "landing_path": lead_source.get("last_landing_path"),
                "timestamp": lead_source.get("last_touch_at")
            }
        
        # Get events for this lead
        events_result = supabase.table("events").select("*").eq("lead_id", lead_id).order("created_at", desc=False).execute()
        events = events_result.data if events_result.data else []
        
        return {
            "lead_id": lead_id,
            "first_touch": first_touch,
            "last_touch": last_touch,
            "channel_derived": lead.get("channel"),
            "full_attribution_chain": events
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting attribution: {str(e)}")

# Admin Dashboard Endpoints

@app.get("/api/admin/leads/detailed")
async def get_detailed_leads(
    page: int = 1,
    limit: int = 50,
    search: Optional[str] = None,
    stage: Optional[str] = None,
    channel: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    admin: dict = Depends(verify_admin),
    supabase: Client = Depends(get_supabase)
):
    """Get leads with full attribution, email tracking, and appointment data"""
    try:
        # Build base query
        query = supabase.table("leads").select("*")
        
        # Apply filters
        if search:
            query = query.or_(f"name.ilike.%{search}%,email.ilike.%{search}%")
        if stage:
            query = query.eq("stage", stage)
        if channel:
            query = query.eq("channel", channel)
        if date_from:
            query = query.gte("created_at", date_from)
        if date_to:
            query = query.lte("created_at", date_to)
        
        # Get total count
        count_query = supabase.table("leads").select("id", count="exact")
        if search:
            count_query = count_query.or_(f"name.ilike.%{search}%,email.ilike.%{search}%")
        if stage:
            count_query = count_query.eq("stage", stage)
        if channel:
            count_query = count_query.eq("channel", channel)
        if date_from:
            count_query = count_query.gte("created_at", date_from)
        if date_to:
            count_query = count_query.lte("created_at", date_to)
            
        count_result = count_query.execute()
        total = count_result.count if hasattr(count_result, 'count') else 0
        
        # Apply pagination
        offset = (page - 1) * limit
        result = query.range(offset, offset + limit - 1).order("created_at", desc=True).execute()
        
        leads = result.data if result.data else []
        
        # Enhance each lead with additional data
        enhanced_leads = []
        for lead in leads:
            lead_id = lead["id"]
            
            # Get lead_sources for attribution
            lead_source_result = supabase.table("lead_sources").select("*").eq("lead_id", lead_id).execute()
            lead_source = lead_source_result.data[0] if lead_source_result.data else {}
            
            # Get appointments for booking status
            appointments_result = supabase.table("appointments").select("*").eq("lead_id", lead_id).execute()
            appointments = appointments_result.data if appointments_result.data else []
            
            # Get email events
            email_events_result = supabase.table("events").select("*").eq("lead_id", lead_id).in_("name", ["email_sent_welcome", "email_sent_day1", "email_sent_day3"]).execute()
            email_events = email_events_result.data if email_events_result.data else []
            
            # Parse notes for additional data
            notes = lead.get("notes", {})
            
            enhanced_lead = {
                **lead,
                "attribution": {
                    "first_touch": {
                        "utm_source": lead_source.get("first_utm_source"),
                        "utm_medium": lead_source.get("first_utm_medium"),
                        "utm_campaign": lead_source.get("first_utm_campaign"),
                        "utm_term": lead_source.get("first_utm_term"),
                        "referrer": lead_source.get("first_referrer"),
                        "landing_path": lead_source.get("first_landing_path"),
                        "timestamp": lead_source.get("first_touch_at")
                    },
                    "last_touch": {
                        "utm_source": lead_source.get("last_utm_source"),
                        "utm_medium": lead_source.get("last_utm_medium"),
                        "utm_campaign": lead_source.get("last_utm_campaign"),
                        "utm_term": lead_source.get("last_utm_term"),
                        "referrer": lead_source.get("last_referrer"),
                        "landing_path": lead_source.get("last_landing_path"),
                        "timestamp": lead_source.get("last_touch_at")
                    }
                },
                "email_tracking": {
                    "welcome_sent": lead.get("email_welcome_sent_at") is not None,
                    "welcome_sent_at": lead.get("email_welcome_sent_at"),
                    "day1_sent": lead.get("email_6h_sent_at") is not None,
                    "day1_sent_at": lead.get("email_6h_sent_at"),
                    "day3_sent": lead.get("email_24h_sent_at") is not None,
                    "day3_sent_at": lead.get("email_24h_sent_at"),
                    "sequence_status": lead.get("email_sequence_status", "stopped")
                },
                "booking_status": {
                    "has_booking": len(appointments) > 0,
                    "appointments": appointments,
                    "next_appointment": appointments[0] if appointments else None
                },
                "location": {
                    "ip_address": notes.get("ip_address"),
                    "country": notes.get("country"),
                    "city": notes.get("city") or lead.get("city"),
                    "region": notes.get("region")
                },
                "form_data": {
                    "situation": notes.get("situation"),
                    "page_intent": notes.get("page_intent"),
                    "source": notes.get("source"),
                    "form_type": notes.get("form_type")
                }
            }
            
            enhanced_leads.append(enhanced_lead)
        
        return {
            "leads": enhanced_leads,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching detailed leads: {str(e)}")

@app.get("/api/admin/stats/overview")
async def get_dashboard_stats(
    period: str = "30d",
    admin: dict = Depends(verify_admin),
    supabase: Client = Depends(get_supabase)
):
    """Get dashboard overview statistics"""
    try:
        # Calculate date range
        from datetime import datetime, timedelta
        if period == "7d":
            days = 7
        elif period == "30d":
            days = 30
        elif period == "90d":
            days = 90
        else:
            days = 30
            
        start_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
        today = datetime.utcnow().date().isoformat()
        
        # Total leads
        total_leads_result = supabase.table("leads").select("id", count="exact").execute()
        total_leads = total_leads_result.count if hasattr(total_leads_result, 'count') else 0
        
        # New leads today
        today_leads_result = supabase.table("leads").select("id", count="exact").gte("created_at", today).execute()
        today_leads = today_leads_result.count if hasattr(today_leads_result, 'count') else 0
        
        # Booked consultations
        booked_result = supabase.table("leads").select("id", count="exact").eq("stage", "booked").execute()
        booked_consultations = booked_result.count if hasattr(booked_result, 'count') else 0
        
        # Email statistics
        welcome_sent_result = supabase.table("leads").select("id", count="exact").not_.is_("email_welcome_sent_at", "null").execute()
        welcome_sent = welcome_sent_result.count if hasattr(welcome_sent_result, 'count') else 0
        
        day1_sent_result = supabase.table("leads").select("id", count="exact").not_.is_("email_6h_sent_at", "null").execute()
        day1_sent = day1_sent_result.count if hasattr(day1_sent_result, 'count') else 0
        
        day3_sent_result = supabase.table("leads").select("id", count="exact").not_.is_("email_24h_sent_at", "null").execute()
        day3_sent = day3_sent_result.count if hasattr(day3_sent_result, 'count') else 0
        
        # Calculate email open rate (simplified - using sent emails as proxy)
        email_open_rate = (welcome_sent + day1_sent + day3_sent) / max(total_leads, 1) * 100
        
        # Top channels
        channels_result = supabase.table("leads").select("channel").execute()
        channels = channels_result.data if channels_result.data else []
        channel_counts = {}
        for lead in channels:
            channel = lead.get("channel", "unknown")
            channel_counts[channel] = channel_counts.get(channel, 0) + 1
        
        top_channels = [{"channel": k, "count": v} for k, v in sorted(channel_counts.items(), key=lambda x: x[1], reverse=True)[:5]]
        
        # Top pages (from landing_path)
        pages_result = supabase.table("leads").select("landing_path").execute()
        pages = pages_result.data if pages_result.data else []
        page_counts = {}
        for lead in pages:
            page = lead.get("landing_path", "/")
            page_counts[page] = page_counts.get(page, 0) + 1
        
        top_pages = [{"page": k, "count": v} for k, v in sorted(page_counts.items(), key=lambda x: x[1], reverse=True)[:5]]
        
        # Recent activity (last 10 leads)
        recent_leads_result = supabase.table("leads").select("name", "email", "stage", "created_at").order("created_at", desc=True).limit(10).execute()
        recent_activity = recent_leads_result.data if recent_leads_result.data else []
        
        # Convert recent activity to more readable format
        formatted_activity = []
        for lead in recent_activity:
            created_at = lead.get("created_at", "")
            if created_at:
                try:
                    dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                    time_ago = datetime.utcnow() - dt.replace(tzinfo=None)
                    if time_ago.days > 0:
                        time_str = f"{time_ago.days}d ago"
                    elif time_ago.seconds > 3600:
                        time_str = f"{time_ago.seconds // 3600}h ago"
                    else:
                        time_str = f"{time_ago.seconds // 60}m ago"
                except:
                    time_str = "recently"
            else:
                time_str = "recently"
                
            formatted_activity.append({
                "name": lead.get("name", "Unknown"),
                "email": lead.get("email", ""),
                "stage": lead.get("stage", "new"),
                "time_ago": time_str
            })
        
        return {
            "total_leads": total_leads,
            "new_leads_today": today_leads,
            "booked_consultations": booked_consultations,
            "email_open_rate": round(email_open_rate, 1),
            "email_stats": {
                "welcome_sent": welcome_sent,
                "day1_sent": day1_sent,
                "day3_sent": day3_sent
            },
            "top_channels": top_channels,
            "top_pages": top_pages,
            "recent_activity": formatted_activity,
            "period": period,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating dashboard stats: {str(e)}")

@app.get("/api/admin/export/leads")
async def export_leads_csv(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    admin: dict = Depends(verify_admin),
    supabase: Client = Depends(get_supabase)
):
    """Export all leads to CSV with full attribution data"""
    try:
        import csv
        import io
        
        # Build query
        query = supabase.table("leads").select("*")
        if date_from:
            query = query.gte("created_at", date_from)
        if date_to:
            query = query.lte("created_at", date_to)
            
        result = query.order("created_at", desc=True).execute()
        leads = result.data if result.data else []
        
        # Create CSV content
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        headers = [
            "ID", "Name", "Email", "Phone", "City", "Stage", "Type", "Channel",
            "UTM Source", "UTM Medium", "UTM Campaign", "UTM Term", "UTM Content",
            "Referrer", "Landing Path", "First Touch At", "Last Touch At",
            "Email Sequence Status", "Welcome Email Sent", "6h Email Sent", "24h Email Sent",
            "Consent Marketing", "Created At", "Updated At",
            "IP Address", "Country", "Region", "Page Intent", "Situation", "Form Type"
        ]
        writer.writerow(headers)
        
        # Write data rows
        for lead in leads:
            # Get lead_sources for attribution
            lead_source_result = supabase.table("lead_sources").select("*").eq("lead_id", lead["id"]).execute()
            lead_source = lead_source_result.data[0] if lead_source_result.data else {}
            
            # Parse notes
            notes = lead.get("notes", {})
            
            row = [
                lead.get("id", ""),
                lead.get("name", ""),
                lead.get("email", ""),
                lead.get("phone", ""),
                lead.get("city", ""),
                lead.get("stage", ""),
                lead.get("type", ""),
                lead.get("channel", ""),
                lead_source.get("first_utm_source", ""),
                lead_source.get("first_utm_medium", ""),
                lead_source.get("first_utm_campaign", ""),
                lead_source.get("first_utm_term", ""),
                lead_source.get("first_utm_content", ""),
                lead_source.get("first_referrer", ""),
                lead_source.get("first_landing_path", ""),
                lead_source.get("first_touch_at", ""),
                lead_source.get("last_touch_at", ""),
                lead.get("email_sequence_status", ""),
                lead.get("email_welcome_sent_at", ""),
                lead.get("email_6h_sent_at", ""),
                lead.get("email_24h_sent_at", ""),
                lead.get("consent_marketing", False),
                lead.get("created_at", ""),
                lead.get("updated_at", ""),
                notes.get("ip_address", ""),
                notes.get("country", ""),
                notes.get("region", ""),
                notes.get("page_intent", ""),
                notes.get("situation", ""),
                notes.get("form_type", "")
            ]
            writer.writerow(row)
        
        # Get CSV content
        csv_content = output.getvalue()
        output.close()
        
        # Generate filename
        from datetime import datetime
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        filename = f"leads_export_{timestamp}.csv"
        
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting leads: {str(e)}")

# Enhanced AI-powered admin dashboard
@app.get("/admin/ai", response_class=HTMLResponse)
async def ai_admin_dashboard(admin: dict = Depends(verify_admin)):
    """AI-powered admin dashboard with chat and approval queue"""
    return templates.TemplateResponse("admin_ai.html", {"request": {}})

# Legacy admin dashboard (simple HTML interface)
@app.get("/admin", response_class=HTMLResponse)
async def admin_dashboard(admin: dict = Depends(verify_admin)):
    """Simple admin dashboard"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Expat Savvy Lead Platform - Admin</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .container { max-width: 1200px; margin: 0 auto; }
            .nav { background: #f0f0f0; padding: 10px; margin-bottom: 20px; }
            .nav a { margin-right: 20px; text-decoration: none; }
            .card { background: white; border: 1px solid #ddd; padding: 20px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f0f0f0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Expat Savvy Lead Platform</h1>
            <div class="nav">
                <a href="#leads">Leads</a>
                <a href="#funnels">Funnels</a>
                <a href="#costs">Ad Costs</a>
            </div>
            
            <div class="card">
                <h2>Quick Stats</h2>
                <div id="stats">Loading...</div>
            </div>
            
            <div class="card">
                <h2>Recent Leads</h2>
                <div id="leads">Loading...</div>
            </div>
        </div>
        
        <script>
            // Simple JavaScript to load data
            fetch('/api/leads')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('leads').innerHTML = 
                        '<p>Total Leads: ' + data.total + '</p>';
                })
                .catch(error => {
                    document.getElementById('leads').innerHTML = 
                        '<p>Please authenticate to view data</p>';
                });
        </script>
    </body>
    </html>
    """

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)