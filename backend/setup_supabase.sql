-- Expat Savvy Lead Platform - Supabase Setup
-- Run these commands one by one in your Supabase SQL Editor
-- https://gwvfppnwmlggjofdfzdu.supabase.co

-- 1. Create leads table
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

-- 2. Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Event data
    name TEXT NOT NULL,
    props JSONB
);

-- 3. Create ad_costs table
CREATE TABLE IF NOT EXISTS ad_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    source TEXT NOT NULL,
    campaign TEXT NOT NULL,
    adset_adgroup TEXT,
    cost DECIMAL(10,2) NOT NULL
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_channel ON leads(channel);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_events_lead_id ON events(lead_id);
CREATE INDEX IF NOT EXISTS idx_events_name ON events(name);
CREATE INDEX IF NOT EXISTS idx_ad_costs_date ON ad_costs(date);
CREATE INDEX IF NOT EXISTS idx_ad_costs_source ON ad_costs(source);
CREATE INDEX IF NOT EXISTS idx_ad_costs_campaign ON ad_costs(campaign);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_costs ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies (allow service_role to do everything)
CREATE POLICY "Enable all operations for service role on leads" ON leads FOR ALL USING (true);
CREATE POLICY "Enable all operations for service role on events" ON events FOR ALL USING (true);
CREATE POLICY "Enable all operations for service role on ad_costs" ON ad_costs FOR ALL USING (true);

-- 7. Create function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create trigger for leads table
CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Insert some test data (optional)
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
) ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Database setup completed successfully!' as message;