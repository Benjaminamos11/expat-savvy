"""
Supabase table schemas and helper functions for Expat Savvy Lead Platform
"""

from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
import uuid

class LeadModel(BaseModel):
    """Lead model for Supabase"""
    id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    # Contact information
    name: Optional[str] = None
    email: str
    phone: Optional[str] = None
    
    # Context
    city: Optional[str] = None
    page_type: Optional[str] = None
    flow: Optional[str] = None  # quote | consult
    
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
    channel: Optional[str] = None  # paid|organic|referral|direct|email
    
    # Status
    stage: str = "new"  # new → nurture → booked → no_show → closed_won → closed_lost
    
    # Additional data
    notes: Optional[Dict[str, Any]] = None
    consent_marketing: bool = False

class EventModel(BaseModel):
    """Event model for Supabase"""
    id: Optional[str] = None
    lead_id: str
    created_at: Optional[datetime] = None
    
    # Event data
    name: str  # consultation_started | quote_submitted | lead_created | etc.
    props: Optional[Dict[str, Any]] = None

class AdCostModel(BaseModel):
    """Ad cost model for Supabase"""
    id: Optional[str] = None
    date: datetime
    source: str  # google|meta|linkedin|bing
    campaign: str
    adset_adgroup: Optional[str] = None
    cost: float

# SQL for creating tables in Supabase
CREATE_TABLES_SQL = """
-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contact information
    name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    
    -- Context
    city TEXT,
    page_type TEXT,
    flow TEXT,
    
    -- Attribution (raw)
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    referrer TEXT,
    landing_path TEXT,
    first_touch_at TIMESTAMP WITH TIME ZONE,
    last_touch_at TIMESTAMP WITH TIME ZONE,
    
    -- Attribution (derived)
    channel TEXT,
    
    -- Status
    stage TEXT DEFAULT 'new',
    
    -- Additional data
    notes JSONB,
    consent_marketing BOOLEAN DEFAULT FALSE
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Event data
    name TEXT NOT NULL,
    props JSONB
);

-- Ad costs table
CREATE TABLE IF NOT EXISTS ad_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    source TEXT NOT NULL,
    campaign TEXT NOT NULL,
    adset_adgroup TEXT,
    cost DECIMAL(10,2) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_channel ON leads(channel);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_events_lead_id ON events(lead_id);
CREATE INDEX IF NOT EXISTS idx_events_name ON events(name);
CREATE INDEX IF NOT EXISTS idx_ad_costs_date ON ad_costs(date);
CREATE INDEX IF NOT EXISTS idx_ad_costs_source ON ad_costs(source);
CREATE INDEX IF NOT EXISTS idx_ad_costs_campaign ON ad_costs(campaign);

-- Row Level Security (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_costs ENABLE ROW LEVEL SECURITY;

-- Policies (allow service_role to do everything)
CREATE POLICY "Enable all operations for service role" ON leads FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all operations for service role" ON events FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all operations for service role" ON ad_costs FOR ALL USING (auth.role() = 'service_role');

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
"""