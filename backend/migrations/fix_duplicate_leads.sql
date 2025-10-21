-- Fix Duplicate Leads Issue
-- Run this in Supabase SQL Editor

-- 1. First, let's see the full details of duplicate leads
SELECT 
    id,
    name,
    email,
    stage,
    email_sequence_status,
    email_welcome_sent_at,
    email_6h_sent_at,
    email_24h_sent_at,
    created_at,
    consent_marketing,
    flow,
    type
FROM leads 
WHERE email IN (
    SELECT email 
    FROM leads 
    GROUP BY email 
    HAVING COUNT(*) > 1
)
ORDER BY email, created_at DESC;

-- 2. Keep the MOST RECENT lead for each email, delete the older duplicates
-- For bw@expat-savvy.ch (keep the newest one, delete 7 older ones)
WITH duplicate_leads AS (
    SELECT 
        id,
        email,
        created_at,
        ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as rn
    FROM leads 
    WHERE email IN (
        SELECT email 
        FROM leads 
        GROUP BY email 
        HAVING COUNT(*) > 1
    )
)
DELETE FROM leads 
WHERE id IN (
    SELECT id 
    FROM duplicate_leads 
    WHERE rn > 1
);

-- 3. Verify duplicates are gone
SELECT 
    email,
    COUNT(*) as count,
    STRING_AGG(name, ', ') as names
FROM leads 
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 4. Check remaining leads
SELECT 
    COUNT(*) as total_leads,
    COUNT(DISTINCT email) as unique_emails
FROM leads;

-- 5. Update email sequences for remaining leads
-- Set all to 'stopped' to prevent any more emails
UPDATE leads 
SET email_sequence_status = 'stopped'
WHERE email_sequence_status = 'active';

-- 6. Final verification
SELECT 
    email_sequence_status,
    COUNT(*) as count
FROM leads 
GROUP BY email_sequence_status;

