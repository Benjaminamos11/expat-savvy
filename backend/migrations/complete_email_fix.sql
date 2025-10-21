-- Complete Database Migration for Email Automation
-- Run this in Supabase SQL Editor

-- Step 1: Add email tracking columns
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_sequence_status TEXT DEFAULT 'active';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_welcome_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_6h_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_24h_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'health insurance';

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_email_sequence_status ON leads(email_sequence_status);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);

-- Step 3: Stop all existing sequences to prevent spam
UPDATE leads 
SET email_sequence_status = 'stopped' 
WHERE email_sequence_status IS NULL OR email_sequence_status = 'active';

-- Step 4: Check current status
SELECT 
    email_sequence_status,
    COUNT(*) as count
FROM leads 
GROUP BY email_sequence_status;

-- Step 5: Find Selena Moloney and stop her sequence
UPDATE leads 
SET 
    email_sequence_status = 'stopped',
    stage = 'booked'
WHERE 
    email LIKE '%privaterelay.appleid.com%' 
    OR name ILIKE '%selena%' 
    OR name ILIKE '%moloney%'
    OR email LIKE '%tgsnrfvbz7%';

-- Step 6: Verify Selena was found and updated
SELECT 
    name,
    email,
    stage,
    email_sequence_status,
    created_at
FROM leads 
WHERE 
    email LIKE '%privaterelay.appleid.com%' 
    OR name ILIKE '%selena%' 
    OR name ILIKE '%moloney%'
    OR email LIKE '%tgsnrfvbz7%';

SELECT 'Migration completed successfully!' as message;

