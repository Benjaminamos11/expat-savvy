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
from datetime import datetime
import json
import uuid
from supabase import Client

from database import get_supabase
from supabase_models import LeadModel, EventModel, AdCostModel
from schemas import LeadCreate, LeadResponse, EventCreate, PlausibleEvent
from services.plausible import PlausibleService
from services.email import EmailService
from auth import verify_admin

app = FastAPI(
    title="Expat Savvy Lead Platform",
    description="Lead collection and attribution tracking platform",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://expat-savvy.ch", "http://localhost:3000"],
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
        # Generate UUID for the lead
        lead_id = str(uuid.uuid4())
        
        # Prepare lead data
        lead_dict = lead_data.dict()
        lead_dict["id"] = lead_id
        
        # Insert lead into Supabase
        result = supabase.table("leads").insert(lead_dict).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create lead")
        
        created_lead = result.data[0]
        
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
                created_lead.get("name")
            )
        
        return LeadResponse(ok=True, lead_id=lead_id)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating lead: {str(e)}")

@app.post("/api/webhooks/calcom")
async def calcom_webhook(webhook_data: dict, supabase: Client = Depends(get_supabase)):
    """Handle Cal.com booking webhooks"""
    try:
        # Extract email from webhook data
        attendee_email = None
        if "payload" in webhook_data:
            attendees = webhook_data["payload"].get("attendees", [])
            if attendees:
                attendee_email = attendees[0].get("email")
        
        if not attendee_email:
            raise HTTPException(status_code=400, detail="No attendee email found")
        
        # Find lead by email
        lead_result = supabase.table("leads").select("*").eq("email", attendee_email).execute()
        
        if not lead_result.data:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        lead = lead_result.data[0]
        
        # Update lead stage
        supabase.table("leads").update({
            "stage": "booked",
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", lead["id"]).execute()
        
        # Create booking event
        event_data = {
            "id": str(uuid.uuid4()),
            "lead_id": lead["id"],
            "name": "consultation_booked",
            "props": {
                "event_type_id": webhook_data.get("payload", {}).get("eventTypeId"),
                "booking_id": webhook_data.get("payload", {}).get("id")
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
        
        # Stop nurture sequence
        await email_service.stop_nurture_sequence(lead["id"])
        
        return {"ok": True, "message": "Booking processed successfully"}
        
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
    admin: dict = Depends(verify_admin),
    supabase: Client = Depends(get_supabase)
):
    """Get funnel metrics"""
    try:
        # This would be implemented with proper SQL queries
        # For now, return mock data structure
        return {
            "total_visitors": 10000,  # From analytics
            "quote_started": 500,
            "quote_submitted": 250,
            "consultation_booked": 125,
            "attended": 100,
            "won": 75,
            "conversion_rates": {
                "visitor_to_quote": 0.05,
                "quote_to_submit": 0.5,
                "submit_to_book": 0.5,
                "book_to_attend": 0.8,
                "attend_to_win": 0.75
            }
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

# Admin dashboard (simple HTML interface)
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