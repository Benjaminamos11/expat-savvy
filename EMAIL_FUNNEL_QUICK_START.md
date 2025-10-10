# Email Funnel - Quick Start Guide

## 🚀 Quick Deployment (10 Minutes)

### 1. Set Up Resend (5 min)
```bash
# Get API key from resend.com
fly secrets set EMAIL_API_KEY="re_YOUR_KEY"
fly secrets set FROM_EMAIL="hello@expat-savvy.ch"
```

### 2. Deploy Backend (2 min)
```bash
cd backend
fly deploy
```

### 3. Deploy Frontend (2 min)
```bash
cd ..
npm run build
git add .
git commit -m "feat: Email nurture funnel"
git push
```

### 4. Set Up Cron (1 min)
- Go to: https://cron-job.org
- Create job:
  - URL: `https://expat-savvy-api.fly.dev/api/email/process-nurture`
  - Schedule: Every 6 hours

### 5. Configure Cal.com Webhook
- Go to: https://app.cal.com/settings/developer/webhooks
- Add webhook: `https://expat-savvy-api.fly.dev/api/webhooks/calcom`
- Trigger: Booking Created

## ✅ Test Immediately

```bash
# Test email processing
curl -X POST https://expat-savvy-api.fly.dev/api/email/process-nurture

# Fill out form on your website
# Check email arrives within 1 minute
```

## 📊 Monitor

View leads in Supabase:
```sql
SELECT * FROM leads_with_appointments ORDER BY lead_created_at DESC;
```

## 📧 Email Timeline

- **T+0**: Welcome email (immediate)
- **T+24h**: Day 1 follow-up
- **T+72h**: Day 3 final email
- **Booking**: Stops sequence automatically

---

**Full Documentation**: See `EMAIL_FUNNEL_DEPLOYMENT_GUIDE.md`

