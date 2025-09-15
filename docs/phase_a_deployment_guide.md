# Phase A Deployment Guide - Data Foundation & ETL

**Phase A Implementation Status:** ✅ READY FOR DEPLOYMENT

This guide walks through deploying the Phase A enhancements to your existing Expat-Savvy platform.

---

## Overview

Phase A extends your solid existing foundation with:
- **Daily ETL jobs** for Plausible Analytics and Google Search Console
- **Enhanced attribution tracking** with first/last touch
- **Comprehensive reporting endpoints** for daily performance analysis
- **Attribution QA system** for data quality

---

## Pre-Deployment Checklist

### 1. Environment Variables Required

Add these to your backend `.env` file:

```bash
# Google Search Console Integration
GSC_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
GSC_PROPERTY_URL=https://expat-savvy.ch/

# ETL Configuration
ETL_ENABLED=true
ETL_HOUR_UTC=6
PLAUSIBLE_ETL_DAYS_HISTORY=90

# Optional: Email notifications for ETL failures
ETL_NOTIFICATION_EMAIL=admin@expat-savvy.ch
```

### 2. Google Search Console Setup

1. **Create Service Account:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing project
   - Enable Search Console API
   - Create service account with "Viewer" role
   - Download JSON credentials

2. **Add Service Account to Search Console:**
   - Go to [Google Search Console](https://search.google.com/search-console/)
   - Select your property (`expat-savvy.ch`)
   - Go to Settings → Users and permissions
   - Add service account email as "Restricted" user

3. **Set Environment Variable:**
   ```bash
   GSC_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"your-project",...}'
   ```

---

## Deployment Steps

### Step 1: Database Schema Migration

Run the following SQL in your Supabase SQL Editor:

```bash
# Execute the migration file
cat backend/migrations/001_phase_a_schema.sql
```

**Expected Result:**
- 7 new tables created: `events_daily`, `lead_sources`, `gsc_perf`, `email_drips`, `audit_log`, `approvals`, `users`
- Indexes and RLS policies applied
- Success message displayed

### Step 2: Backend Dependencies Update

Install new Python dependencies:

```bash
cd backend
pip install -r requirements.txt
```

**New packages added:**
- `google-api-python-client==2.109.0`
- `google-auth==2.23.4`
- `google-auth-oauthlib==1.1.0`
- `google-auth-httplib2==0.1.1`

### Step 3: Deploy Backend

If using Fly.io (current setup):

```bash
cd backend
fly deploy
```

**Expected Result:**
- Backend deploys successfully
- ETL service initializes
- Google Search Console connection established (if credentials provided)

### Step 4: Initialize Attribution Data

Migrate existing leads to the new attribution system:

```bash
curl -X POST https://expat-savvy-api.fly.dev/api/attribution/migrate \
  -u admin:changeme123
```

**Expected Result:**
```json
{
  "ok": true,
  "message": "Lead sources migration completed successfully"
}
```

### Step 5: Test ETL Jobs

Run initial ETL for yesterday's data:

```bash
# Run Plausible ETL
curl -X POST https://expat-savvy-api.fly.dev/api/etl/plausible \
  -H "Content-Type: application/json" \
  -d '{"target_date": "2025-09-10"}' \
  -u admin:changeme123

# Run GSC ETL (if configured)
curl -X POST https://expat-savvy-api.fly.dev/api/etl/gsc \
  -H "Content-Type: application/json" \
  -d '{"target_date": "2025-09-10"}' \
  -u admin:changeme123

# Run full ETL
curl -X POST https://expat-savvy-api.fly.dev/api/etl/full \
  -H "Content-Type: application/json" \
  -d '{"target_date": "2025-09-10"}' \
  -u admin:changeme123
```

### Step 6: Verify Reporting Endpoints

Test the new reporting functionality:

```bash
# Daily report
curl https://expat-savvy-api.fly.dev/api/reports/daily?date=2025-09-10 \
  -u admin:changeme123

# CPL report
curl https://expat-savvy-api.fly.dev/api/reports/cpl?start_date=2025-08-10&end_date=2025-09-10 \
  -u admin:changeme123
```

---

## New API Endpoints Available

### ETL Management
- `POST /api/etl/plausible` - Run Plausible ETL for specific date
- `POST /api/etl/gsc` - Run Google Search Console ETL
- `POST /api/etl/full` - Run all ETL processes
- `POST /api/attribution/migrate` - Migrate existing leads to attribution system

### Enhanced Reporting
- `GET /api/reports/daily?date=YYYY-MM-DD` - Daily performance summary
- `GET /api/reports/cpl?start_date&end_date&channel` - Cost per lead analysis
- `GET /api/attribution/{lead_id}` - Full attribution chain for specific lead

---

## Setting Up Automated ETL (Production)

### Option 1: Cron Job (Recommended)

Add to your server crontab:

```bash
# Run full ETL daily at 6 AM UTC
0 6 * * * curl -X POST https://expat-savvy-api.fly.dev/api/etl/full \
  -H "Content-Type: application/json" \
  -d '{}' \
  -u admin:changeme123 >> /var/log/etl.log 2>&1
```

### Option 2: GitHub Actions (Alternative)

Create `.github/workflows/daily-etl.yml`:

```yaml
name: Daily ETL Job
on:
  schedule:
    - cron: '0 6 * * *'  # 6 AM UTC daily
  workflow_dispatch:

jobs:
  run-etl:
    runs-on: ubuntu-latest
    steps:
      - name: Run ETL
        run: |
          curl -X POST https://expat-savvy-api.fly.dev/api/etl/full \
            -H "Content-Type: application/json" \
            -d '{}' \
            -u ${{ secrets.ADMIN_USER }}:${{ secrets.ADMIN_PASS }}
```

---

## Verification & Testing

### Check Database Tables

Verify new tables exist in Supabase:

```sql
-- Check tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('events_daily', 'lead_sources', 'gsc_perf');

-- Check sample data
SELECT COUNT(*) FROM lead_sources;
SELECT COUNT(*) FROM events_daily;
SELECT COUNT(*) FROM gsc_perf;
```

### Test Attribution Chain

Create a test lead and verify attribution tracking:

```bash
# Create test lead
curl -X POST https://expat-savvy-api.fly.dev/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "city": "zurich",
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "test_campaign",
    "channel": "paid",
    "page_type": "homepage",
    "flow": "quote"
  }'

# Check attribution was created
curl https://expat-savvy-api.fly.dev/api/attribution/{lead_id} \
  -u admin:changeme123
```

---

## Troubleshooting

### ETL Jobs Failing

1. **Check Plausible API Key:**
   ```bash
   # Verify API key is set
   echo $PLAUSIBLE_API_KEY
   
   # Test API connection
   curl "https://plausible.io/api/v1/stats/aggregate?site_id=expat-savvy.ch&metrics=visitors" \
     -H "Authorization: Bearer $PLAUSIBLE_API_KEY"
   ```

2. **Check GSC Configuration:**
   ```bash
   # Verify service account JSON is valid
   echo $GSC_SERVICE_ACCOUNT_JSON | jq .
   
   # Check service account has access to Search Console property
   ```

3. **Check Database Connections:**
   ```bash
   # Test database connection
   curl https://expat-savvy-api.fly.dev/test-db
   ```

### Attribution Data Missing

1. **Run migration again:**
   ```bash
   curl -X POST https://expat-savvy-api.fly.dev/api/attribution/migrate \
     -u admin:changeme123
   ```

2. **Check new leads are creating attribution entries:**
   ```sql
   SELECT l.id, l.email, ls.id as lead_source_id 
   FROM leads l 
   LEFT JOIN lead_sources ls ON l.id = ls.lead_id 
   WHERE l.created_at > NOW() - INTERVAL '1 day';
   ```

---

## Performance Monitoring

### Daily ETL Health Check

Monitor ETL job success with these queries:

```sql
-- Check recent ETL activity in audit_log (when Phase B is deployed)
SELECT * FROM audit_log 
WHERE action LIKE '%etl%' 
ORDER BY created_at DESC 
LIMIT 10;

-- Check data freshness
SELECT date, COUNT(*) as records 
FROM events_daily 
WHERE date > CURRENT_DATE - INTERVAL '7 days'
GROUP BY date 
ORDER BY date DESC;
```

### API Performance

Monitor new endpoint response times:

```bash
# Time the daily report endpoint
time curl https://expat-savvy-api.fly.dev/api/reports/daily \
  -u admin:changeme123 -s > /dev/null
```

---

## Success Criteria

✅ **Phase A is successfully deployed when:**

1. **Database Schema:**
   - All 7 new tables exist and are accessible
   - Existing leads migrated to `lead_sources` table
   - New leads automatically create attribution entries

2. **ETL Jobs:**
   - Plausible ETL runs without errors
   - GSC ETL configured and operational (if credentials provided)
   - Daily aggregation populates `events_daily` table

3. **Reporting:**
   - `/api/reports/daily` returns yesterday's data
   - `/api/reports/cpl` calculates cost per lead accurately
   - Attribution endpoints show complete first/last touch data

4. **Integration:**
   - Existing lead creation flow unaffected
   - All existing analytics continue working
   - No performance degradation in current features

---

## Next Steps

After successful Phase A deployment:

1. **Monitor ETL jobs** for 3-7 days to ensure stability
2. **Verify data quality** in daily reports
3. **Set up automated ETL scheduling** (cron or GitHub Actions)
4. **Begin Phase B planning** (LLM integration & chat interface)

Phase A provides the solid data foundation needed for AI-driven insights in Phase B!

---

**Support:** For deployment issues, check the logs in Fly.io dashboard or contact the development team.

