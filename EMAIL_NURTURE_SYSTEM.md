# 📧 Email Nurture System - Complete Documentation

## 🎯 Overview

The email nurture system automatically sends a sequence of follow-up emails to leads who request quotes but don't book a consultation. The sequence stops immediately when a lead books through Cal.com.

---

## 📊 System Flow

```
User fills "Get 3 Offers" form
         ↓
    Lead created in Supabase
         ↓
    Welcome Email sent immediately
         ↓
    [24 hours later, no booking?]
         ↓
    Day 1 Follow-up Email
         ↓
    [72 hours later, no booking?]
         ↓
    Day 3 Final Email
         ↓
    [User books anytime]
         ↓
    🛑 STOP: Email sequence stops via webhook
```

---

## 🔧 Components

### 1. **Backend API** (FastAPI)
**Deployed on:** Fly.io
**Base URL:** `https://expat-savvy-api.fly.dev`

#### Key Endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/lead` | POST | Create lead & send welcome email |
| `/api/webhooks/calcom` | POST | Handle Cal.com booking webhooks |
| `/api/email/process-nurture` | GET/POST | Cron job to send Day 1 & Day 3 emails |
| `/api/email/test-all-emails` | POST | Test all 3 emails |
| `/api/test/simulate-booking` | POST | Simulate a booking webhook |

### 2. **Database** (Supabase)

#### Tables:

**`leads`**
- Stores all lead information
- Fields: `email_welcome_sent_at`, `email_day1_sent_at`, `email_day3_sent_at`
- `email_sequence_status`: 'active' or 'stopped'
- `stage`: 'new', 'booked', etc.

**`appointments`**
- Stores Cal.com booking details
- Linked to leads via `lead_id`

**`events`**
- Tracks all email and booking events
- Events: `email_sent_welcome`, `email_sent_day1`, `email_sent_day3`, `consultation_booked`

**`leads_with_appointments`** (VIEW)
- Combines leads and appointments for easy reporting

### 3. **Email Service** (Resend)

**Provider:** Resend
**API Key:** Stored in Fly.io secrets as `EMAIL_API_KEY`
**Rate Limit:** 2 requests per second

#### Email Templates:

1. **Welcome Email** - Sent immediately after form submission
   - Subject: "Your Swiss Insurance Quote Request - Expat Savvy"
   - CTA: Book free consultation
   - Design: Professional HTML with logo and brand colors

2. **Day 1 Email** - Sent 24 hours after lead creation (if no booking)
   - Subject: "Still Looking for the Right Swiss Health Insurance?"
   - CTA: Book consultation
   - Reminds about personalized service

3. **Day 3 Email** - Sent 72 hours after lead creation (if no booking)
   - Subject: "Last Chance: Your Swiss Insurance Analysis is Ready"
   - CTA: Grab your consultation spot
   - Final touchpoint with urgency

### 4. **Cal.com Webhook**

**Webhook URL:** `https://expat-savvy-api.fly.dev/api/webhooks/calcom`

**Configuration:**
- Event Trigger: ✅ Booking Created
- Applied to: All event types
- Active: ✅ Yes

**What it does:**
- Receives booking notifications from Cal.com
- Finds the lead by email
- Creates new lead if doesn't exist (direct bookings)
- Stops email sequence (sets `email_sequence_status` to 'stopped')
- Updates lead stage to 'booked'
- Creates appointment record
- Sends Plausible event: `consultation_booked`

### 5. **Cron Job** (cron-job.org)

**URL:** `https://expat-savvy-api.fly.dev/api/email/process-nurture`
**Method:** GET (or POST)
**Schedule:** `0 9,15,21 * * *` (runs at 9 AM, 3 PM, 9 PM daily)

**What it does:**
- Queries all leads with `email_sequence_status = 'active'` and `stage = 'new'`
- Only processes leads created after October 9, 2025 (to avoid spamming old leads)
- Checks time since lead creation
- Sends Day 1 email if 24+ hours and `email_day1_sent_at` is null
- Sends Day 3 email if 72+ hours and `email_day3_sent_at` is null
- Updates database with email timestamps

---

## 🚀 Frontend Integration

### Forms that trigger the email sequence:

All forms that use the "Get 3 Offers" flow should call the backend API.

#### Implementation in `public/scripts/offers-modal.js`:

```javascript
async submitToBackendAPI(formData) {
    try {
        const leadData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            city: formData.get('city'),
            consent_marketing: formData.get('consent_marketing') === 'on',
            stage: 'new',
            flow: 'quote',
            channel: this.attributionData.channel || 'organic',
            // ... other fields
        };

        const response = await fetch('https://expat-savvy-api.fly.dev/api/lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leadData)
        });

        if (response.ok) {
            console.log('✅ Lead created and welcome email sent');
        }
    } catch (error) {
        console.error('❌ Error creating lead:', error);
    }
}
```

---

## 🧪 Testing

### 1. Test Welcome Email
```bash
curl -X POST https://expat-savvy-api.fly.dev/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "consent_marketing": true,
    "stage": "new",
    "flow": "quote"
  }'
```

### 2. Test All 3 Emails
```bash
curl -X POST https://expat-savvy-api.fly.dev/api/email/test-all-emails
```
*This sends all 3 emails to bw@expat-savvy.ch with 1-second delays*

### 3. Test Booking Webhook
```bash
curl -X POST https://expat-savvy-api.fly.dev/api/test/simulate-booking
```
*This simulates a Cal.com booking for bw@expat-savvy.ch*

### 4. Test Cron Job
```bash
curl https://expat-savvy-api.fly.dev/api/email/process-nurture
```
*Manually trigger the nurture email processor*

---

## 📊 Monitoring

### Check System Status:

1. **View logs:**
   ```bash
   cd backend
   fly logs
   ```

2. **Check lead status in Supabase:**
   ```sql
   SELECT * FROM leads_with_appointments 
   WHERE email = 'test@example.com';
   ```

3. **Check email sent timestamps:**
   ```sql
   SELECT email, name, stage, 
          email_welcome_sent_at,
          email_day1_sent_at,
          email_day3_sent_at,
          email_sequence_status
   FROM leads 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

4. **Check appointments:**
   ```sql
   SELECT * FROM appointments 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

### Key Metrics to Track:

- **Welcome Email Delivery Rate**: Check `email_welcome_sent_at` is not null
- **Day 1 Email Send Rate**: Leads with 24+ hours and `email_day1_sent_at` set
- **Day 3 Email Send Rate**: Leads with 72+ hours and `email_day3_sent_at` set
- **Booking Conversion Rate**: Leads with `stage = 'booked'`
- **Email Stop Rate**: Leads with `email_sequence_status = 'stopped'`

---

## 🔒 Security & Configuration

### Environment Variables (Fly.io Secrets):

```bash
EMAIL_API_KEY=re_...              # Resend API key
EMAIL_PROVIDER=resend             # Email service provider
FROM_EMAIL=hello@expat-savvy.ch  # From email address
CAL_LINK=https://cal.com/robertkolar/expat-savvy  # Cal.com booking link
SUPABASE_URL=https://...         # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=...    # Supabase service role key
```

### Update Secrets:
```bash
fly secrets set EMAIL_API_KEY="your-new-key"
```

---

## 🐛 Troubleshooting

### Problem: Welcome email not sent
**Check:**
1. Is the form calling the backend API? (Check browser console)
2. Is the API responding? Test with curl
3. Check Fly.io logs: `fly logs | grep "Welcome"`
4. Verify Resend API key: `fly secrets list`

### Problem: Day 1/Day 3 emails not sent
**Check:**
1. Is the cron job running? Check cron-job.org dashboard
2. Are leads in the queue? Check Supabase: `SELECT * FROM leads WHERE email_sequence_status = 'active'`
3. Check if leads are old (before Oct 9, 2025) - they are intentionally skipped
4. Check logs: `fly logs | grep "Processing.*leads"`

### Problem: Webhook not stopping email sequence
**Check:**
1. Is webhook configured in Cal.com? Settings → Developer → Webhooks
2. Test webhook: Use Cal.com ping test
3. Check logs: `fly logs | grep "calcom"`
4. Verify lead was found: Check for "Stopped nurture sequence" in logs

### Problem: Emails going to spam
**Solutions:**
1. Add SPF/DKIM records for your domain in Resend
2. Warm up your sending domain
3. Ask recipients to whitelist hello@expat-savvy.ch

---

## 🔄 Deployment

### Deploy Backend Changes:
```bash
cd backend
fly deploy
```

### Update Frontend:
1. Edit `public/scripts/offers-modal.js`
2. Commit and push to GitHub
3. Changes go live immediately (static site)

---

## 📈 Future Enhancements

### Potential Improvements:
- [ ] A/B test email subject lines
- [ ] Add email open tracking
- [ ] Add click tracking on CTAs
- [ ] Personalize emails based on city/insurance type
- [ ] Add SMS notifications for high-value leads
- [ ] Create admin dashboard for email stats
- [ ] Add email preference center (unsubscribe options)
- [ ] Integrate with CRM for lead scoring

---

## 📞 Support

**Questions?** Contact the development team or check:
- Backend code: `/backend/services/email.py`
- API endpoints: `/backend/main.py`
- Frontend integration: `/public/scripts/offers-modal.js`

---

## 🎯 Quick Reference

### Important URLs:
- **API Base:** https://expat-savvy-api.fly.dev
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Fly.io Dashboard:** https://fly.io/dashboard
- **Resend Dashboard:** https://resend.com/emails
- **Cal.com Webhooks:** https://app.cal.com/settings/developer/webhooks
- **Cron Job:** https://cron-job.org

### Key Files:
- `backend/services/email.py` - Email service and templates
- `backend/main.py` - API endpoints
- `public/scripts/offers-modal.js` - Frontend form integration
- `EMAIL_NURTURE_SYSTEM.md` - This documentation

---

**Last Updated:** October 10, 2025
**System Status:** ✅ Fully Operational

