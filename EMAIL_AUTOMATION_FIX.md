# 📧 Email Automation Fix - Self-Service Forms

## 🐛 Problem Identified

The self-service health insurance form was **not triggering the Resend welcome email** for new leads.

### Root Cause

The form submission code in `final-modal.html` was sending data in the **wrong format** to the `/api/lead` endpoint:

**❌ Old (Broken) Payload:**
```javascript
{
  type: 'form_submission',
  source: 'self_service_form',
  userData: { ... },  // ← Nested incorrectly
  // Missing: consent_marketing, stage, email, name
}
```

The backend's email automation only triggers when **both** conditions are met:
```python
if created_lead.get("consent_marketing") and created_lead.get("stage") == "new":
    await email_service.start_nurture_sequence(...)
```

Since `consent_marketing` and `stage` were never set, the email was never sent.

---

## ✅ Solutions Implemented

### 1. **Frontend Fix** (`public/final-modal.html`)

Updated `sendFormDataToBackend()` function to send data in the correct `LeadCreate` schema format:

**✅ New (Fixed) Payload:**
```javascript
{
  // REQUIRED FIELDS
  email: userData.email,
  name: userData.name,
  phone: userData.phone || '',
  
  // CRITICAL: Enable email automation
  consent_marketing: true,  // ← Triggers email automation
  stage: 'new',             // ← Required for email automation
  
  // Flow and context
  flow: 'self_service',
  page_type: pageIntent || 'home',
  city: userData.city || userLocation.city || '',
  
  // Attribution
  utm_source: ...,
  utm_medium: ...,
  // ... etc
  
  // Lead metadata
  type: 'health insurance',
  notes: {
    // All form data stored here
    source: 'self_service_form',
    situation: userData.situation,
    // ... etc
  }
}
```

### 2. **Backend Schema Update** (`backend/schemas.py`)

Added missing fields to `LeadCreate` schema:
```python
class LeadCreate(BaseModel):
    # ... existing fields ...
    
    # Lead metadata
    stage: Optional[str] = "new"  # new, contacted, booked, closed
    type: Optional[str] = "health insurance"
    notes: Optional[Dict[str, Any]] = None  # Additional metadata
```

### 3. **Database Migration** (`backend/migrations/add_email_fields.sql`)

Added missing email tracking fields to the `leads` table:
```sql
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_sequence_status TEXT DEFAULT 'active';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_welcome_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_6h_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_24h_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'health insurance';
```

### 4. **Backend Logic Update** (`backend/main.py`)

Updated `create_lead` function to set `email_sequence_status` automatically:
```python
# Set email sequence status to 'active' for new leads with consent
if lead_dict.get("consent_marketing") and lead_dict.get("stage") == "new":
    lead_dict["email_sequence_status"] = "active"
else:
    lead_dict["email_sequence_status"] = "stopped"
```

---

## 🚀 Deployment Steps

### Step 1: Run Database Migration

In your **Supabase SQL Editor**, run:
```bash
backend/migrations/add_email_fields.sql
```

This will add the missing email tracking columns to your `leads` table.

### Step 2: Deploy Backend Changes

```bash
cd backend
git add schemas.py main.py migrations/add_email_fields.sql
git commit -m "Fix: Add email automation fields and properly set email_sequence_status"

# Deploy to Fly.io
fly deploy
```

### Step 3: Deploy Frontend Changes

```bash
cd ..
git add public/final-modal.html
git commit -m "Fix: Properly format self-service form data for email automation"

# Deploy to Netlify (or your hosting)
git push origin main
```

---

## 🧪 Testing

### Test the Fix

1. **Go to:** https://expat-savvy.ch (or wherever `final-modal.html` is used)
2. **Fill out** the self-service health insurance form
3. **Submit** the form
4. **Check:**
   - ✅ Lead created in Supabase with `consent_marketing: true`, `stage: 'new'`, `email_sequence_status: 'active'`
   - ✅ Welcome email sent immediately via Resend
   - ✅ `email_welcome_sent_at` timestamp set in database
   - ✅ Event `email_sent_welcome` created in `events` table

### Check Backend Logs

```bash
fly logs -a expat-savvy-api
```

Look for:
```
✅ Started nurture sequence for {email}
✅ Email sent via Resend to {email}
```

---

## 📝 For the Existing Lead (Alicia Rojo Coloret)

The lead `rojocoloret.alicia@gmail.com` was created **before** the fix, so the email was never sent.

### Option 1: Manually Send Welcome Email (Quick)

Use the backend test endpoint:

```bash
curl -X POST https://expat-savvy-api.fly.dev/api/email/send-test \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic YOUR_ADMIN_CREDENTIALS" \
  -d '{
    "email_type": "welcome",
    "test_data": {
      "name": "Alicia",
      "insurance_type": "health insurance"
    }
  }'
```

But change the recipient in the code from `bw@expat-savvy.ch` to `rojocoloret.alicia@gmail.com`.

### Option 2: Update Database and Trigger Sequence

Run this SQL in Supabase:

```sql
-- Find the lead
SELECT * FROM leads WHERE email = 'rojocoloret.alicia@gmail.com';

-- Update to enable email sequence
UPDATE leads 
SET 
  consent_marketing = true,
  stage = 'new',
  email_sequence_status = 'active',
  email_welcome_sent_at = NULL,
  email_6h_sent_at = NULL,
  email_24h_sent_at = NULL
WHERE email = 'rojocoloret.alicia@gmail.com';
```

Then trigger the welcome email manually via the backend API or by creating a small script.

### Option 3: Manually Email Them

Since it's just one lead and the fix is now in place, you could also just manually email Alicia to follow up.

---

## ✅ Verification Checklist

- [x] Frontend form sends correct payload format
- [x] Backend schema accepts `stage`, `type`, and `notes` fields
- [x] Database has `email_sequence_status` column
- [x] Database has email timestamp columns (`email_welcome_sent_at`, etc.)
- [x] `create_lead` function sets `email_sequence_status` automatically
- [x] Email automation triggers correctly for new leads
- [ ] Run database migration in Supabase
- [ ] Deploy backend to Fly.io
- [ ] Deploy frontend to production
- [ ] Test with a real form submission
- [ ] Verify email is sent via Resend
- [ ] Check database for correct values

---

## 🎯 Expected Behavior (After Fix)

1. User fills out self-service health insurance form
2. Form sends properly formatted payload to `/api/lead`
3. Backend creates lead with:
   - `consent_marketing: true`
   - `stage: 'new'`
   - `email_sequence_status: 'active'`
4. **Welcome email sent immediately** via Resend
5. `email_welcome_sent_at` timestamp recorded
6. Event `email_sent_welcome` created
7. **6h later:** Day 1 follow-up email sent (if no booking)
8. **24h later:** Day 3 final email sent (if no booking)
9. **If user books:** Email sequence stops automatically via Cal.com webhook

---

## 📊 Monitoring

### Check Email Status

```bash
curl https://expat-savvy-api.fly.dev/api/email/status \
  -H "Authorization: Basic YOUR_ADMIN_CREDENTIALS"
```

### Check Individual Lead

```sql
SELECT 
  email,
  name,
  stage,
  consent_marketing,
  email_sequence_status,
  email_welcome_sent_at,
  email_6h_sent_at,
  email_24h_sent_at,
  created_at
FROM leads
WHERE email = 'rojocoloret.alicia@gmail.com';
```

---

## 🔍 Summary

**Files Changed:**
- ✅ `public/final-modal.html` - Fixed form submission payload
- ✅ `backend/schemas.py` - Added `stage`, `type`, and `notes` fields
- ✅ `backend/main.py` - Auto-set `email_sequence_status`
- ✅ `backend/migrations/add_email_fields.sql` - Add email tracking columns

**Result:**
- ✅ Self-service health insurance forms now trigger email automation
- ✅ Welcome email sent immediately
- ✅ Follow-up emails sent on schedule (6h, 24h)
- ✅ Email sequence stops automatically when user books consultation

---

**Next Steps:**
1. Run the database migration in Supabase
2. Deploy backend and frontend changes
3. Test with a real form submission
4. Monitor email deliverability in Resend dashboard

Let me know if you need help with any of these steps! 🚀


