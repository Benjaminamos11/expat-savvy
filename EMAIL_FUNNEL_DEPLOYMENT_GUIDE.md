# Email Nurture Funnel - Deployment Guide

## ✅ What We've Built

Your email nurture funnel is now ready! Here's what's been implemented:

### Database Changes ✅
- Added email tracking columns to `leads` table
- Created `appointments` table for Cal.com bookings
- Created `leads_with_appointments` view for easy monitoring

### Backend Changes ✅
- Updated `EmailService` with 3 email templates (Welcome, Day 1, Day 3)
- Added email tracking to Supabase
- Added `/api/email/process-nurture` endpoint for cron job
- Updated Cal.com webhook to create appointments
- Added `/api/email/status` endpoint for monitoring

### Frontend Changes ✅
- Updated `offers-modal.js` to submit to backend API
- Emails will be sent immediately when lead is created

---

## 📋 Deployment Checklist

### Step 1: Set Up Resend Email Service

1. **Create Resend Account** (if you don't have one):
   - Go to: https://resend.com
   - Sign up for free account (3,000 emails/month free)

2. **Verify Your Domain**:
   - In Resend dashboard → Domains
   - Add `expat-savvy.ch`
   - Add the DNS records they provide (DKIM, SPF, DMARC)
   - Wait for verification (usually 5-30 minutes)

3. **Create API Key**:
   - In Resend dashboard → API Keys
   - Create new API key
   - Copy the key (you'll need it next)

4. **Set Environment Variables on Fly.io**:
   ```bash
   cd /Users/benjaminwagner/expat-savvy/backend
   
   # Set Resend API key
   fly secrets set EMAIL_API_KEY="re_YOUR_API_KEY_HERE"
   
   # Set FROM email (use your verified domain)
   fly secrets set FROM_EMAIL="hello@expat-savvy.ch"
   
   # Verify secrets are set
   fly secrets list
   ```

### Step 2: Deploy Backend Changes

```bash
cd /Users/benjaminwagner/expat-savvy/backend

# Deploy updated backend to Fly.io
fly deploy

# Monitor deployment
fly logs

# Test that it's running
curl https://expat-savvy-api.fly.dev/health
```

### Step 3: Deploy Frontend Changes

```bash
cd /Users/benjaminwagner/expat-savvy

# Build the site
npm run build

# Deploy to Netlify (if using Netlify CLI)
netlify deploy --prod

# OR push to git and let Netlify auto-deploy
git add public/scripts/offers-modal.js
git commit -m "feat: Connect offers form to backend API for email nurture funnel"
git push origin main
```

### Step 4: Configure Cal.com Webhook

1. **Go to Cal.com Settings**:
   - Visit: https://app.cal.com/settings/developer/webhooks
   - Click "New Webhook"

2. **Configure Webhook**:
   ```
   Subscriber URL: https://expat-savvy-api.fly.dev/api/webhooks/calcom
   Trigger Events: ✅ Booking Created
   ```

3. **Test the Webhook**:
   - Book a test appointment on your site
   - Check Fly.io logs: `fly logs`
   - Verify appointment appears in Supabase `appointments` table

### Step 5: Set Up Cron Job

We'll use cron-job.org (free service) to trigger email processing every 6 hours.

1. **Go to cron-job.org**:
   - Visit: https://cron-job.org/en/
   - Sign up for free account

2. **Create Cron Job**:
   ```
   Title: Expat Savvy - Email Nurture Processor
   URL: https://expat-savvy-api.fly.dev/api/email/process-nurture
   Method: POST
   Schedule: Every 6 hours
   Time: 00:00, 06:00, 12:00, 18:00 (UTC)
   ```

3. **Test Immediately**:
   - Click "Execute now" in cron-job.org
   - Or test manually:
   ```bash
   curl -X POST https://expat-savvy-api.fly.dev/api/email/process-nurture
   ```

---

## 🧪 Testing Checklist

### Test 1: New Lead Gets Welcome Email

1. **Fill out "Get 3 Offers" form** on your website
2. **Check your email** - you should receive welcome email within 1 minute
3. **Verify in Supabase**:
   ```sql
   SELECT 
     name, 
     email, 
     email_welcome_sent_at, 
     email_sequence_status 
   FROM leads 
   WHERE email = 'YOUR_TEST_EMAIL'
   ORDER BY created_at DESC 
   LIMIT 1;
   ```

### Test 2: Day 1 Email (Testing with Old Lead)

To test without waiting 24 hours, we'll temporarily modify a lead's creation date:

1. **In Supabase SQL Editor**, run:
   ```sql
   -- Create a test lead that's 25 hours old
   INSERT INTO leads (
     name, email, created_at, stage, 
     email_sequence_status, consent_marketing
   )
   VALUES (
     'Test Day 1', 
     'your-email@example.com', 
     NOW() - INTERVAL '25 hours',
     'new',
     'active',
     true
   );
   ```

2. **Trigger the cron manually**:
   ```bash
   curl -X POST https://expat-savvy-api.fly.dev/api/email/process-nurture
   ```

3. **Check your email** - you should receive Day 1 email
4. **Verify in Supabase**:
   ```sql
   SELECT 
     name, 
     email, 
     email_day1_sent_at 
   FROM leads 
   WHERE email = 'your-email@example.com';
   ```

### Test 3: Day 3 Email

Same as above, but use 73 hours:

```sql
INSERT INTO leads (
  name, email, created_at, stage, 
  email_sequence_status, consent_marketing
)
VALUES (
  'Test Day 3', 
  'your-email@example.com', 
  NOW() - INTERVAL '73 hours',
  'new',
  'active',
  true
);
```

### Test 4: Booking Stops Email Sequence

1. **Create a test lead** in Supabase
2. **Book a meeting** through Cal.com
3. **Verify in Supabase**:
   ```sql
   SELECT 
     l.name,
     l.email,
     l.stage,
     l.email_sequence_status,
     a.scheduled_at,
     a.status
   FROM leads l
   LEFT JOIN appointments a ON l.id = a.lead_id
   WHERE l.email = 'YOUR_TEST_EMAIL';
   ```
   
   Should show:
   - `stage` = 'booked'
   - `email_sequence_status` = 'stopped'
   - `appointment` record exists

### Test 5: Check Email Status Dashboard

```bash
# Get email funnel statistics
curl https://expat-savvy-api.fly.dev/api/email/status \
  -u admin:YOUR_ADMIN_PASSWORD
```

---

## 📊 Monitoring & Analytics

### View All Leads with Email Status

Go to Supabase → Table Editor → Run query:

```sql
SELECT * FROM leads_with_appointments 
ORDER BY lead_created_at DESC 
LIMIT 50;
```

### Track Email Performance

```sql
-- Count emails sent
SELECT 
  COUNT(*) FILTER (WHERE email_welcome_sent_at IS NOT NULL) as welcome_sent,
  COUNT(*) FILTER (WHERE email_day1_sent_at IS NOT NULL) as day1_sent,
  COUNT(*) FILTER (WHERE email_day3_sent_at IS NOT NULL) as day3_sent,
  COUNT(*) FILTER (WHERE stage = 'booked') as booked
FROM leads;
```

### Calculate Conversion Rates

```sql
-- Email to booking conversion
SELECT 
  COUNT(*) FILTER (WHERE email_welcome_sent_at IS NOT NULL) as leads_with_email,
  COUNT(*) FILTER (WHERE stage = 'booked') as booked_leads,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE stage = 'booked') / 
    NULLIF(COUNT(*) FILTER (WHERE email_welcome_sent_at IS NOT NULL), 0),
    2
  ) as conversion_rate_percent
FROM leads
WHERE created_at > NOW() - INTERVAL '30 days';
```

---

## 🔍 Troubleshooting

### Emails Not Sending?

1. **Check Resend API Key**:
   ```bash
   fly ssh console
   echo $EMAIL_API_KEY  # Should show your key
   ```

2. **Check Fly.io Logs**:
   ```bash
   fly logs --tail
   # Look for email sending messages
   ```

3. **Verify Domain in Resend**:
   - Domain must be verified (green checkmark)
   - DNS records properly configured

### Cron Not Working?

1. **Test manually first**:
   ```bash
   curl -X POST https://expat-savvy-api.fly.dev/api/email/process-nurture
   ```

2. **Check cron-job.org execution history**
   - Should show 200 OK responses

3. **Check Fly.io logs** during cron execution

### Webhook Not Triggering?

1. **Check Cal.com webhook logs**:
   - Cal.com → Settings → Webhooks → View logs

2. **Test webhook manually**:
   ```bash
   curl -X POST https://expat-savvy-api.fly.dev/api/webhooks/calcom \
     -H "Content-Type: application/json" \
     -d '{
       "payload": {
         "attendees": [{"email": "test@example.com", "name": "Test User"}],
         "startTime": "2025-10-10T10:00:00Z",
         "uid": "test-booking-123"
       }
     }'
   ```

---

## 📈 Next Steps & Optimization

After the funnel is running for 1-2 weeks:

1. **A/B Test Email Copy**
   - Try different subject lines
   - Test different CTA buttons
   - Experiment with email timing

2. **Add Email 4** (Optional)
   - Consider adding a final email at Day 7
   - Different approach: case study or testimonial

3. **Track Open Rates**
   - Resend provides open rate tracking
   - View in Resend dashboard

4. **Segment by Source**
   - Send different emails based on UTM source
   - Personalize for paid vs organic traffic

---

## 🎯 Success Metrics

Track these KPIs weekly:

- **Lead Creation Rate**: New leads per week
- **Email Delivery Rate**: % of emails successfully delivered
- **Open Rate**: % of emails opened (from Resend)
- **Click Rate**: % clicking Cal.com link
- **Booking Conversion**: % of leads that book consultation
- **Email Attribution**: Bookings that came after email vs direct

---

## 📞 Support

If you need help:

1. Check Fly.io logs: `fly logs`
2. Check Supabase logs: Supabase Dashboard → Logs
3. Check Resend delivery: Resend Dashboard → Emails
4. Check cron execution: cron-job.org → Execution History

---

## ✨ You're All Set!

Your email nurture funnel is ready to convert leads into booked consultations automatically! 

**Next:** Complete the deployment steps above and run the tests to verify everything works.

