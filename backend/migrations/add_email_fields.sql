-- Migration: Add email nurture fields to leads table
-- Run this in Supabase SQL Editor

-- Add email sequence tracking fields
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_sequence_status TEXT DEFAULT 'active';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_welcome_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_6h_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_24h_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'health insurance';

-- Create index for email sequence queries
CREATE INDEX IF NOT EXISTS idx_leads_email_sequence_status ON leads(email_sequence_status);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);

-- Update existing leads to have active email sequence if they're new and have consent
UPDATE leads 
SET email_sequence_status = 'active' 
WHERE stage = 'new' 
  AND consent_marketing = true 
  AND email_sequence_status IS NULL;

SELECT 'Email fields added successfully!' as message;


