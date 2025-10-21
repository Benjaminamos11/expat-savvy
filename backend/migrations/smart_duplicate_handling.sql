-- Smart Duplicate Handling for Self-Service + Booking Flow
-- Run this in Supabase SQL Editor

-- 1. First, let's see the pattern of duplicates
SELECT 
    email,
    COUNT(*) as duplicate_count,
    STRING_AGG(flow, ', ') as flows,
    STRING_AGG(stage, ', ') as stages,
    STRING_AGG(created_at::text, ', ') as created_times
FROM leads 
WHERE email IN (
    SELECT email 
    FROM leads 
    GROUP BY email 
    HAVING COUNT(*) > 1
)
GROUP BY email
ORDER BY duplicate_count DESC;

-- 2. Smart merge: Keep the lead with the most complete data
-- Priority: booked > new, and keep the most recent one
WITH ranked_leads AS (
    SELECT 
        id,
        email,
        name,
        stage,
        flow,
        email_sequence_status,
        email_welcome_sent_at,
        email_6h_sent_at,
        email_24h_sent_at,
        created_at,
        consent_marketing,
        type,
        notes,
        -- Priority: booked > new, then most recent
        ROW_NUMBER() OVER (
            PARTITION BY email 
            ORDER BY 
                CASE stage 
                    WHEN 'booked' THEN 1 
                    WHEN 'new' THEN 2 
                    ELSE 3 
                END,
                created_at DESC
        ) as priority
    FROM leads 
    WHERE email IN (
        SELECT email 
        FROM leads 
        GROUP BY email 
        HAVING COUNT(*) > 1
    )
)
-- Delete the lower priority duplicates
DELETE FROM leads 
WHERE id IN (
    SELECT id 
    FROM ranked_leads 
    WHERE priority > 1
);

-- 3. For the remaining leads, update them intelligently
-- If user went from self-service to booking, mark as booked and stop emails
UPDATE leads 
SET 
    stage = 'booked',
    email_sequence_status = 'stopped',
    flow = CASE 
        WHEN flow = 'self_service' THEN 'self_service_to_booking'
        ELSE flow 
    END
WHERE email IN (
    SELECT email 
    FROM leads 
    WHERE email IN ('bw@expat-savvy.ch', 'mikaela.krona@gmail.com')
);

-- 4. Verify the cleanup
SELECT 
    email,
    COUNT(*) as count,
    STRING_AGG(name, ', ') as names,
    STRING_AGG(stage, ', ') as stages,
    STRING_AGG(flow, ', ') as flows
FROM leads 
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 5. Check the final state
SELECT 
    email,
    name,
    stage,
    flow,
    email_sequence_status,
    created_at
FROM leads 
WHERE email IN ('bw@expat-savvy.ch', 'mikaela.krona@gmail.com')
ORDER BY email, created_at DESC;

