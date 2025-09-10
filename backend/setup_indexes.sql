-- Add indexes for performance
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_channel ON leads(channel);
CREATE INDEX idx_leads_stage ON leads(stage);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_events_lead_id ON events(lead_id);
CREATE INDEX idx_events_name ON events(name);
CREATE INDEX idx_ad_costs_date ON ad_costs(date);
CREATE INDEX idx_ad_costs_source ON ad_costs(source);
CREATE INDEX idx_ad_costs_campaign ON ad_costs(campaign);

-- Insert test lead
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

-- Verify setup
SELECT COUNT(*) as total_leads FROM leads;
SELECT * FROM leads LIMIT 1;