"""
Pydantic schemas for API request/response models
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
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