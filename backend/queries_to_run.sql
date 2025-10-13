-- ============================================================
-- RUN THESE QUERIES IN SUPABASE SQL EDITOR
-- ============================================================

-- 1. GET LATEST LEAD
-- ============================================================
SELECT 
    id,
    name,
    email,
    phone,
    city,
    stage,
    flow,
    channel,
    consent_marketing,
    created_at,
    updated_at
FROM leads
ORDER BY created_at DESC
LIMIT 1;


-- 2. GET LATEST CAL.COM BOOKING EVENT
-- ============================================================
SELECT 
    e.id as event_id,
    e.lead_id,
    e.name as event_name,
    e.created_at as booking_time,
    e.props,
    l.name as lead_name,
    l.email as lead_email,
    l.stage as lead_stage
FROM events e
LEFT JOIN leads l ON e.lead_id = l.id
WHERE e.name = 'consultation_booked'
ORDER BY e.created_at DESC
LIMIT 1;


-- 3. GET ALL EVENTS FOR LATEST LEAD
-- ============================================================
WITH latest_lead AS (
    SELECT id 
    FROM leads 
    ORDER BY created_at DESC 
    LIMIT 1
)
SELECT 
    e.name as event_name,
    e.created_at,
    e.props
FROM events e
WHERE e.lead_id = (SELECT id FROM latest_lead)
ORDER BY e.created_at DESC;


-- 4. SUMMARY STATISTICS
-- ============================================================
-- Total leads by stage
SELECT 
    stage,
    COUNT(*) as count
FROM leads
GROUP BY stage
ORDER BY count DESC;

-- Total bookings
SELECT COUNT(*) as total_bookings
FROM events
WHERE name = 'consultation_booked';


-- 5. GET LAST 5 LEADS
-- ============================================================
SELECT 
    id,
    name,
    email,
    stage,
    flow,
    consent_marketing,
    created_at
FROM leads
ORDER BY created_at DESC
LIMIT 5;


-- 6. CHECK IF LEAD BOOKED AFTER FORM SUBMISSION
-- ============================================================
-- This shows leads that booked a consultation
SELECT 
    l.id,
    l.name,
    l.email,
    l.created_at as lead_created,
    l.stage,
    e.created_at as booking_time,
    EXTRACT(EPOCH FROM (e.created_at - l.created_at))/3600 as hours_to_book
FROM leads l
LEFT JOIN events e ON l.id = e.lead_id AND e.name = 'consultation_booked'
WHERE l.stage = 'booked'
ORDER BY l.created_at DESC
LIMIT 10;


-- 7. FIND LEADS THAT SHOULD NOT RECEIVE MORE EMAILS
-- ============================================================
-- These are leads with stage 'booked' or beyond
SELECT 
    id,
    email,
    name,
    stage,
    created_at
FROM leads
WHERE stage IN ('booked', 'closed_won', 'closed_lost', 'no_show')
ORDER BY created_at DESC
LIMIT 10;

