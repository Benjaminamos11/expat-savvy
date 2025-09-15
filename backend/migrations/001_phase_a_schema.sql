-- Phase A Database Schema Extensions
-- AI Growth Ops: Data Foundation & ETL Tables
-- Run these commands in Supabase SQL Editor

-- 1. Daily event aggregation table (ETL destination)
CREATE TABLE IF NOT EXISTS events_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    page_path TEXT,
    page_type TEXT,
    city TEXT,
    channel TEXT,
    source TEXT,
    campaign TEXT,
    flow TEXT,
    -- Metrics from Plausible aggregation
    pageviews INTEGER DEFAULT 0,
    quote_starts INTEGER DEFAULT 0,
    quote_submits INTEGER DEFAULT 0,
    consultation_starts INTEGER DEFAULT 0,
    bookings INTEGER DEFAULT 0,
    leads INTEGER DEFAULT 0,
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. First/Last touch attribution (1:1 with leads) 
CREATE TABLE IF NOT EXISTS lead_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE UNIQUE,
    
    -- First touch attribution
    first_utm_source TEXT,
    first_utm_medium TEXT,
    first_utm_campaign TEXT,
    first_utm_term TEXT,
    first_utm_content TEXT,
    first_referrer TEXT,
    first_landing_path TEXT,
    first_touch_at TIMESTAMP WITH TIME ZONE,
    
    -- Last touch attribution  
    last_utm_source TEXT,
    last_utm_medium TEXT,
    last_utm_campaign TEXT,
    last_utm_term TEXT,
    last_utm_content TEXT,
    last_referrer TEXT,
    last_landing_path TEXT,
    last_touch_at TIMESTAMP WITH TIME ZONE,
    
    -- Derived attribution
    channel_derived TEXT,
    city TEXT,
    page_type TEXT,
    flow TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Google Search Console performance data
CREATE TABLE IF NOT EXISTS gsc_perf (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    page TEXT NOT NULL,
    query TEXT NOT NULL,
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    ctr DECIMAL(5,4) DEFAULT 0,
    position DECIMAL(4,1) DEFAULT 0,
    device TEXT,
    country TEXT DEFAULT 'che',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Email drips management (for Phase D)
CREATE TABLE IF NOT EXISTS email_drips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
    audience_sql TEXT NOT NULL,
    schedule_json JSONB NOT NULL,  -- [{"step": 1, "delay_hours": 0}, ...]
    email_templates_json JSONB NOT NULL,
    pause_conditions_json JSONB DEFAULT '{"on_booking": true, "on_unsubscribe": true}'::jsonb,
    performance_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. AI audit log (for Phase B)
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'ai')),
    actor_id TEXT,  -- user_id or ai_session_id
    action TEXT NOT NULL,
    payload_json JSONB,
    result_json JSONB
);

-- 6. AI approval workflow (for Phase B)
CREATE TABLE IF NOT EXISTS approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    item_type TEXT NOT NULL CHECK (item_type IN (
        'ad_campaign', 'ad_set', 'ad', 'email_drip', 'content_test'
    )),
    title TEXT NOT NULL,
    description TEXT,
    draft_payload_json JSONB NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'rejected', 'cancelled'
    )),
    created_by TEXT, -- ai_session_id
    reviewer_id TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT
);

-- 7. Users table (for Phase E - RBAC)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'advisor', 'viewer')) DEFAULT 'viewer',
    permissions_json JSONB DEFAULT '{}'::jsonb,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_daily_date ON events_daily(date);
CREATE INDEX IF NOT EXISTS idx_events_daily_channel ON events_daily(channel);
CREATE INDEX IF NOT EXISTS idx_events_daily_page_type ON events_daily(page_type);
CREATE INDEX IF NOT EXISTS idx_events_daily_city ON events_daily(city);

CREATE INDEX IF NOT EXISTS idx_lead_sources_lead_id ON lead_sources(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_sources_channel_derived ON lead_sources(channel_derived);
CREATE INDEX IF NOT EXISTS idx_lead_sources_first_touch_at ON lead_sources(first_touch_at);

CREATE INDEX IF NOT EXISTS idx_gsc_perf_date ON gsc_perf(date);
CREATE INDEX IF NOT EXISTS idx_gsc_perf_page ON gsc_perf(page);
CREATE INDEX IF NOT EXISTS idx_gsc_perf_query ON gsc_perf(query);
CREATE INDEX IF NOT EXISTS idx_gsc_perf_clicks ON gsc_perf(clicks);

CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor_type ON audit_log(actor_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);

CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_item_type ON approvals(item_type);
CREATE INDEX IF NOT EXISTS idx_approvals_created_at ON approvals(created_at);

-- Enable Row Level Security
ALTER TABLE events_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsc_perf ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_drips ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow service_role to do everything)
CREATE POLICY "Enable all operations for service role on events_daily" ON events_daily FOR ALL USING (true);
CREATE POLICY "Enable all operations for service role on lead_sources" ON lead_sources FOR ALL USING (true);
CREATE POLICY "Enable all operations for service role on gsc_perf" ON gsc_perf FOR ALL USING (true);
CREATE POLICY "Enable all operations for service role on email_drips" ON email_drips FOR ALL USING (true);
CREATE POLICY "Enable all operations for service role on audit_log" ON audit_log FOR ALL USING (true);
CREATE POLICY "Enable all operations for service role on approvals" ON approvals FOR ALL USING (true);
CREATE POLICY "Enable all operations for service role on users" ON users FOR ALL USING (true);

-- Create function for updating updated_at timestamp (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create update triggers for updated_at columns
CREATE TRIGGER update_events_daily_updated_at 
    BEFORE UPDATE ON events_daily
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_sources_updated_at 
    BEFORE UPDATE ON lead_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_drips_updated_at 
    BEFORE UPDATE ON email_drips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create composite unique constraint for gsc_perf to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_gsc_perf_unique 
    ON gsc_perf(date, page, query, device, country);

-- Create composite unique constraint for events_daily to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_daily_unique 
    ON events_daily(date, page_path, page_type, city, channel, source, campaign, flow);

-- Success message
SELECT 'Phase A schema extensions completed successfully!' as message,
       'Tables created: events_daily, lead_sources, gsc_perf, email_drips, audit_log, approvals, users' as details;
