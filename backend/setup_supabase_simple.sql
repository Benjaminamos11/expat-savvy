-- Expat Savvy Lead Platform - Supabase Setup (Simplified)
-- Run these commands one by one in your Supabase SQL Editor

-- 1. Create leads table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    
    city TEXT,
    page_type TEXT,
    flow TEXT,
    
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    referrer TEXT,
    landing_path TEXT,
    first_touch_at TIMESTAMP WITH TIME ZONE,
    last_touch_at TIMESTAMP WITH TIME ZONE,
    
    channel TEXT,
    stage TEXT DEFAULT 'new',
    
    notes JSONB,
    consent_marketing BOOLEAN DEFAULT FALSE
);

-- 2. Create events table  
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    name TEXT NOT NULL,
    props JSONB
);

-- 3. Create ad_costs table
CREATE TABLE ad_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    source TEXT NOT NULL,
    campaign TEXT NOT NULL,
    adset_adgroup TEXT,
    cost DECIMAL(10,2) NOT NULL
);

-- 4. Create indexes
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_channel ON leads(channel);
CREATE INDEX idx_leads_stage ON leads(stage);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_events_lead_id ON events(lead_id);
CREATE INDEX idx_events_name ON events(name);
CREATE INDEX idx_ad_costs_date ON ad_costs(date);
CREATE INDEX idx_ad_costs_source ON ad_costs(source);
CREATE INDEX idx_ad_costs_campaign ON ad_costs(campaign);

-- 5. Disable RLS for backend access
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE ad_costs DISABLE ROW LEVEL SECURITY;

-- 6. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Create trigger for leads table
CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Insert test data
INSERT INTO leads (
    name, email, city, page_type, flow, channel, stage, 
    utm_source, utm_campaign, consent_marketing
) VALUES 
(
    'Test User', 
    'test@example.com', 
    'zurich', 
    'homepage', 
    'quote', 
    'direct', 
    'new',
    NULL,
    NULL,
    true
);

-- Check if everything worked
SELECT 'Database setup completed! Test lead created.' as message;
SELECT COUNT(*) as total_leads FROM leads;