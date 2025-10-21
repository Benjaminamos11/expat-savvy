-- Comprehensive Email Tracking Analysis
-- Run this in Supabase SQL Editor to see exactly what we have

-- 1. Check if email columns exist and their structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'leads' 
  AND column_name LIKE '%email%'
ORDER BY column_name;

-- 2. Check current email sequence status distribution
SELECT 
    email_sequence_status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM leads 
GROUP BY email_sequence_status
ORDER BY count DESC;

-- 3. Check leads with email timestamps (who got emails)
SELECT 
    name,
    email,
    stage,
    email_sequence_status,
    email_welcome_sent_at,
    email_6h_sent_at,
    email_24h_sent_at,
    created_at,
    CASE 
        WHEN email_welcome_sent_at IS NOT NULL THEN '✅ Welcome'
        ELSE '❌ No Welcome'
    END as welcome_status,
    CASE 
        WHEN email_6h_sent_at IS NOT NULL THEN '✅ Day 1'
        ELSE '❌ No Day 1'
    END as day1_status,
    CASE 
        WHEN email_24h_sent_at IS NOT NULL THEN '✅ Day 3'
        ELSE '❌ No Day 3'
    END as day3_status
FROM leads 
WHERE email_welcome_sent_at IS NOT NULL 
   OR email_6h_sent_at IS NOT NULL 
   OR email_24h_sent_at IS NOT NULL
ORDER BY created_at DESC;

-- 4. Check problematic leads (Selena, Simona, Nicole)
SELECT 
    name,
    email,
    stage,
    email_sequence_status,
    email_welcome_sent_at,
    email_6h_sent_at,
    email_24h_sent_at,
    created_at,
    notes
FROM leads 
WHERE 
    email LIKE '%privaterelay.appleid.com%' 
    OR name ILIKE '%selena%' 
    OR name ILIKE '%moloney%'
    OR name ILIKE '%simona%'
    OR name ILIKE '%bercea%'
    OR name ILIKE '%nicole%'
    OR name ILIKE '%barbosa%'
    OR email LIKE '%tgsnrfvbz7%'
    OR email LIKE '%berceas2005%'
    OR email LIKE '%nekybarbosa%'
ORDER BY created_at DESC;

-- 5. Check recent leads (last 7 days)
SELECT 
    name,
    email,
    stage,
    email_sequence_status,
    email_welcome_sent_at,
    email_6h_sent_at,
    email_24h_sent_at,
    created_at,
    type,
    flow
FROM leads 
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- 6. Check email events table
SELECT 
    name as event_name,
    COUNT(*) as count,
    MAX(created_at) as last_occurrence
FROM events 
WHERE name LIKE '%email%'
GROUP BY name
ORDER BY count DESC;

-- 7. Summary statistics
SELECT 
    'Total Leads' as metric,
    COUNT(*) as value
FROM leads
UNION ALL
SELECT 
    'Leads with Welcome Email',
    COUNT(*)
FROM leads 
WHERE email_welcome_sent_at IS NOT NULL
UNION ALL
SELECT 
    'Leads with Day 1 Email',
    COUNT(*)
FROM leads 
WHERE email_6h_sent_at IS NOT NULL
UNION ALL
SELECT 
    'Leads with Day 3 Email',
    COUNT(*)
FROM leads 
WHERE email_24h_sent_at IS NOT NULL
UNION ALL
SELECT 
    'Active Email Sequences',
    COUNT(*)
FROM leads 
WHERE email_sequence_status = 'active'
UNION ALL
SELECT 
    'Stopped Email Sequences',
    COUNT(*)
FROM leads 
WHERE email_sequence_status = 'stopped'
UNION ALL
SELECT 
    'Completed Email Sequences',
    COUNT(*)
FROM leads 
WHERE email_sequence_status = 'completed';

-- 8. Check for leads that might be getting repeated emails
SELECT 
    email,
    COUNT(*) as duplicate_count,
    STRING_AGG(name, ', ') as names,
    STRING_AGG(id::text, ', ') as lead_ids
FROM leads 
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

