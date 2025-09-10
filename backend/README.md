# Expat Savvy Lead Platform - FastAPI Backend

## 🚀 Quick Setup

### 1. Database Setup (Supabase)

1. **Go to your Supabase project**: https://gwvfppnwmlggjofdfzdu.supabase.co
2. **Open SQL Editor** 
3. **Run the SQL from `setup_supabase.sql`** (copy/paste each section)

The SQL will create:
- `leads` table - stores lead information with attribution
- `events` table - tracks user interactions  
- `ad_costs` table - for CPL calculations
- Indexes and RLS policies

### 2. Environment Variables

Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

The Supabase credentials are already filled in. You need to add:
- `EMAIL_API_KEY` - Get from Resend.com
- `ADMIN_PASS` - Change from default

### 3. Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --port 8000
```

API will be available at: http://localhost:8000

### 4. Deploy to Fly.io

```bash
# Install Fly CLI if needed
# curl -L https://fly.io/install.sh | sh

# Login and deploy
fly auth login
fly launch --no-deploy
fly secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
fly secrets set ADMIN_PASS="your-secure-password"  
fly secrets set EMAIL_API_KEY="your-resend-key"
fly deploy
```

## 🔗 API Endpoints

### Public Endpoints
- `POST /api/lead` - Create lead with attribution
- `POST /api/webhooks/calcom` - Cal.com booking webhook  
- `POST /api/events` - Generic event tracking

### Admin Endpoints (HTTP Basic Auth)
- `GET /admin` - Simple dashboard
- `GET /api/leads` - List leads with filters
- `GET /api/funnels` - Funnel metrics
- `POST /api/adcosts/upload` - Upload ad costs CSV
- `POST /api/notes/{lead_id}` - Add notes to lead

## 🔧 Integration

### Frontend Integration

```javascript
// Get attribution data
const attribution = window.getAttributionData();

// Submit lead with attribution
fetch('/api/lead', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ...formData,
    ...attribution
  })
});

// Track events  
window.trackLeadCreation({ leadId: 'xxx', flow: 'quote' });
```

### Cal.com Webhook Setup

1. Go to Cal.com → Settings → Webhooks
2. Add webhook: `https://your-domain.fly.dev/api/webhooks/calcom`
3. Subscribe to: `BOOKING_CREATED`

## 📊 Features

- ✅ **Cookieless attribution tracking** with Plausible
- ✅ **Full funnel analytics** (visitor → lead → booking)
- ✅ **Email automation** (4-step nurture sequence)
- ✅ **Admin dashboard** with lead management
- ✅ **Cal.com integration** with auto-stage updates
- ✅ **Multi-platform events** (Plausible + Umami + GTM)
- ✅ **Ad cost tracking** for CPL calculations

## 🔐 Security

- Row Level Security enabled on all tables
- Service role access only for backend
- HTTP Basic Auth for admin endpoints
- CORS configured for your domain only

## 📈 Analytics Flow

1. **User visits** expat-savvy.ch with UTMs
2. **Attribution captured** and stored in localStorage  
3. **Events tracked** on interactions (quote start, consultation start)
4. **Lead created** on form submission → server-side Plausible event
5. **Email sequence started** if consent given
6. **Booking webhook** updates stage → stops emails
7. **Admin dashboard** shows full funnel with attribution

## 🛠 Maintenance

- **View logs**: `fly logs`
- **Connect to app**: `fly ssh console`  
- **Update secrets**: `fly secrets set KEY=value`
- **Scale up**: `fly scale count 2`