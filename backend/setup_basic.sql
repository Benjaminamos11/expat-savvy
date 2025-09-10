-- Basic table setup - run this if the other file still has issues

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

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    props JSONB
);

CREATE TABLE ad_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    source TEXT NOT NULL,
    campaign TEXT NOT NULL,
    adset_adgroup TEXT,
    cost DECIMAL(10,2) NOT NULL
);