"""
Pydantic schemas for API request/response models
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID

class LeadCreate(BaseModel):
    # Contact
    name: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    
    # Context
    city: Optional[str] = None
    page_type: Optional[str] = None
    flow: Optional[str] = None
    
    # Attribution (raw)
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    utm_term: Optional[str] = None
    utm_content: Optional[str] = None
    referrer: Optional[str] = None
    landing_path: Optional[str] = None
    first_touch_at: Optional[datetime] = None
    last_touch_at: Optional[datetime] = None
    
    # Attribution (derived)
    channel: Optional[str] = None
    
    # Consent
    consent_marketing: bool = False
    
    # Lead metadata
    stage: Optional[str] = "new"  # new, contacted, booked, closed
    type: Optional[str] = "health insurance"  # health insurance, life insurance, etc.
    notes: Optional[Dict[str, Any]] = None  # Additional metadata

class LeadResponse(BaseModel):
    ok: bool
    lead_id: str

class EventCreate(BaseModel):
    lead_id: Optional[UUID] = None
    name: str
    props: Optional[Dict[str, Any]] = None

class PlausibleEvent(BaseModel):
    name: str
    url: str
    domain: str = "expat-savvy.ch"
    props: Optional[Dict[str, Any]] = None

class AdCostCreate(BaseModel):
    date: datetime
    source: str
    campaign: str
    adset_adgroup: Optional[str] = None
    cost: float

# Phase A Schemas - Data Foundation

class ETLRequest(BaseModel):
    target_date: Optional[str] = None  # YYYY-MM-DD format

class ETLResponse(BaseModel):
    success: bool
    message: str
    date: str
    details: Optional[Dict[str, Any]] = None

class DailyReportResponse(BaseModel):
    date: str
    events_summary: Dict[str, int]
    ad_costs_summary: Dict[str, float]
    cpl_summary: Dict[str, float]
    top_pages: List[Dict[str, Any]]
    
class CPLReportResponse(BaseModel):
    period: str
    total_spend: float
    total_leads: int
    overall_cpl: float
    by_channel: Dict[str, Dict[str, Any]]
    by_campaign: Dict[str, Dict[str, Any]]

class AttributionResponse(BaseModel):
    lead_id: str
    first_touch: Dict[str, Any]
    last_touch: Dict[str, Any]
    channel_derived: str
    full_attribution_chain: List[Dict[str, Any]]

class LeadSourceCreate(BaseModel):
    lead_id: str
    # First touch
    first_utm_source: Optional[str] = None
    first_utm_medium: Optional[str] = None
    first_utm_campaign: Optional[str] = None
    first_utm_term: Optional[str] = None
    first_utm_content: Optional[str] = None
    first_referrer: Optional[str] = None
    first_landing_path: Optional[str] = None
    first_touch_at: Optional[datetime] = None
    # Last touch
    last_utm_source: Optional[str] = None
    last_utm_medium: Optional[str] = None
    last_utm_campaign: Optional[str] = None
    last_utm_term: Optional[str] = None
    last_utm_content: Optional[str] = None
    last_referrer: Optional[str] = None
    last_landing_path: Optional[str] = None
    last_touch_at: Optional[datetime] = None
    # Derived
    channel_derived: Optional[str] = None
    city: Optional[str] = None
    page_type: Optional[str] = None
    flow: Optional[str] = None