# 🔧 Complete Tool Connection Manual - Expat Savvy AI Growth Ops

**Status**: Current System + Phase C Preparation  
**Updated**: September 11, 2025  
**Claude Version**: Sonnet 4 (claude-sonnet-4-20250514)

---

## 📋 **CURRENT CONNECTED TOOLS (Phase A & B)**

### ✅ **1. SUPABASE DATABASE (Fully Connected)**

**Purpose**: Primary database for leads, analytics, and AI approval workflow

**Connection Steps**:
```bash
# 1. Database Tables Created:
- leads (existing)
- events_daily (Phase A ETL data)
- lead_sources (Phase A attribution)
- gsc_perf (Google Search Console data)
- approvals (Phase B AI approvals)
- audit_log (Phase B AI activity tracking)
- users (ready for RBAC)

# 2. Environment Variables Set:
SUPABASE_URL=https://gwvfppnwmlggjofdfzdu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (service_role key)

# 3. Connection Status: ✅ ACTIVE
```

**API Access Points**:
- `/api/leads` - Create/read leads with attribution
- `/api/etl/*` - ETL pipeline endpoints  
- `/api/reports/*` - Analytics reporting
- `/tools/*` - AI data access (secured)

---

### ✅ **2. PLAUSIBLE ANALYTICS (Fully Connected)**

**Purpose**: Privacy-friendly website analytics and event tracking

**Connection Steps**:
```bash
# 1. API Integration Complete:
- Daily ETL pulls aggregate data
- Goal events tracking (quote_start, quote_submit, etc.)
- Page performance metrics

# 2. Environment Variables Set:
PLAUSIBLE_API_KEY=[YOUR_KEY_HERE]
PLAUSIBLE_SITE_ID=expat-savvy.ch

# 3. AI Tools Connected:
- get_plausible_report (realtime analytics)
- query_analytics (aggregated data)

# 4. Connection Status: ✅ ACTIVE
```

**Available Metrics**:
- Visitors, pageviews, bounce rate
- Goal conversions by source/campaign
- Geographic breakdown by Swiss city
- UTM campaign tracking

---

### ✅ **3. GOOGLE SEARCH CONSOLE (Configured)**

**Purpose**: Search performance and keyword data

**Connection Steps**:
```bash
# 1. Service Account Created:
# Run: python3 setup_gsc.py
# Follow prompts to create service account JSON

# 2. Environment Variable Set:
GSC_SERVICE_ACCOUNT_JSON=[SERVICE_ACCOUNT_JSON_CONTENT]
GSC_PROPERTY_URL=https://expat-savvy.ch

# 3. Daily ETL Active:
- Queries, impressions, CTR, position data
- Device and country breakdowns
- Stored in gsc_perf table

# 4. Connection Status: ✅ ACTIVE
```

**AI Analysis Available**:
- Top performing search queries
- Content cannibalization detection
- SEO opportunity identification

---

### ✅ **4. CLAUDE SONNET 4 (Fully Connected)**

**Purpose**: Advanced AI analysis, campaign generation, and optimization recommendations

**Connection Steps**:
```bash
# 1. Latest Model Upgraded:
Model: claude-sonnet-4-20250514
Context: 1,000,000 tokens
Version: anthropic>=0.67.0

# 2. Environment Variables Set:
ANTHROPIC_API_KEY=sk-ant-api03-v6utrpdPMozSBzI7q5BK5ipbY3_5fUoTDswQAQhg6Cop_ADlmXbYmL...
LLM_PROVIDER=anthropic
LLM_MAX_TOKENS=8000

# 3. Tool Calling Enabled:
- query_analytics (6 named queries)
- get_plausible_report
- create_approval_item

# 4. Connection Status: ✅ ACTIVE
```

**AI Capabilities**:
- Intelligent marketing analysis
- Campaign optimization recommendations
- A/B test copy generation
- Automated waste detection
- SEO overlap analysis

---

### ✅ **5. CAL.COM WEBHOOKS (Configured)**

**Purpose**: Meeting booking and consultation tracking

**Connection Steps**:
```bash
# 1. Webhook Endpoints:
POST /webhooks/cal-booking (meeting booked)
POST /webhooks/cal-cancellation (meeting cancelled)

# 2. Attribution Integration:
- Links bookings to lead sources
- Tracks full customer journey
- Measures consultation conversion rates

# 3. Connection Status: ✅ ACTIVE
```

---

### ✅ **6. ADMIN AUTHENTICATION (Secured)**

**Purpose**: Secure access to AI tools and admin dashboard

**Connection Steps**:
```bash
# 1. Basic Auth Configured:
ADMIN_USER=admin
ADMIN_PASS=phase_a_2025

# 2. Protected Endpoints:
- /admin/ai (Enhanced AI dashboard)
- /tools/* (All AI tool endpoints)
- /api/etl/* (ETL pipeline)

# 3. Connection Status: ✅ ACTIVE
```

---

## 🚀 **PHASE C TOOLS (Ready to Connect)**

### 🔗 **1. GOOGLE ADS API (Draft-Only Mode)**

**Purpose**: Automated campaign creation and management

**Connection Steps**:
```bash
# 1. Setup Google Ads API Access:
# Go to: https://console.developers.google.com
# Enable Google Ads API
# Create OAuth 2.0 credentials

# 2. Environment Variables to Set:
GOOGLE_ADS_CUSTOMER_ID=1234567890
GOOGLE_ADS_DEVELOPER_TOKEN=your_dev_token
GOOGLE_ADS_CLIENT_ID=your_oauth_client_id.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=your_oauth_secret
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token

# 3. Install Dependencies:
pip install google-ads

# 4. Test Connection:
python3 test_google_ads_connection.py
```

**Draft Capabilities (Phase C)**:
- Search campaigns with Swiss geo-targeting
- Display campaigns for retargeting
- Keyword research and bid suggestions
- Budget allocation recommendations
- All campaigns created in DRAFT mode for approval

---

### 🔗 **2. META ADS API (Facebook/Instagram)**

**Purpose**: Social media advertising automation

**Connection Steps**:
```bash
# 1. Setup Facebook App:
# Go to: https://developers.facebook.com
# Create new app with Marketing API access
# Get long-lived access token

# 2. Environment Variables to Set:
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret
META_ACCESS_TOKEN=your_long_lived_token
META_AD_ACCOUNT_ID=act_1234567890

# 3. Install Dependencies:
pip install facebook-business

# 4. Permissions Required:
- ads_management
- ads_read
- business_management
```

**Draft Capabilities (Phase C)**:
- Facebook/Instagram campaign creation
- Audience targeting based on your data
- Creative variations for A/B testing
- Lookalike audiences from your leads
- Swiss market demographic targeting

---

### 🔗 **3. LINKEDIN ADS API**

**Purpose**: B2B professional targeting for expat audience

**Connection Steps**:
```bash
# 1. LinkedIn Marketing Developer Platform:
# Apply at: https://www.linkedin.com/developers/apps
# Create application with Marketing API access

# 2. Environment Variables to Set:
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_ACCESS_TOKEN=your_access_token
LINKEDIN_AD_ACCOUNT_ID=your_account_id

# 3. Install Dependencies:
pip install linkedin-api

# 4. Targeting Options:
- Job titles (Healthcare professionals, Finance, Tech)
- Company size and industry
- Geographic (Switzerland + neighboring countries)
- Language (English, German, French)
```

---

### 🔗 **4. REDDIT ADS API**

**Purpose**: Community-based targeting and engagement

**Connection Steps**:
```bash
# 1. Reddit Advertising Platform:
# Apply at: https://www.redditinc.com/advertising/api
# Get API credentials

# 2. Environment Variables to Set:
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_ACCESS_TOKEN=your_access_token
REDDIT_AD_ACCOUNT_ID=your_account_id

# 3. Subreddit Targeting:
- r/Switzerland
- r/expats  
- r/personalfinance
- r/insurance
- r/EuropeanExpats
```

---

### 🔗 **5. EMAIL AUTOMATION (Resend/Postmark)**

**Purpose**: Automated nurture sequences and lifecycle emails

**Connection Steps - Resend**:
```bash
# 1. Resend Setup:
# Sign up at: https://resend.com
# Create API key and verify domain

# 2. Environment Variables:
RESEND_API_KEY=re_your_api_key
FROM_EMAIL=noreply@expat-savvy.ch

# 3. Install Dependencies:
pip install resend

# 4. Email Templates Ready:
- Lead welcome sequence
- Quote abandoned (7 days)
- Consultation follow-up
- Insurance deadline reminders
```

**Connection Steps - Postmark** (Alternative):
```bash
# 1. Postmark Setup:
# Sign up at: https://postmarkapp.com
# Verify sending domain

# 2. Environment Variables:
POSTMARK_SERVER_TOKEN=your_server_token
POSTMARK_FROM_EMAIL=noreply@expat-savvy.ch
```

---

### 🔗 **6. CRM INTEGRATION (HubSpot/Pipedrive)**

**Purpose**: Advanced lead management and sales pipeline

**Connection Steps - HubSpot**:
```bash
# 1. HubSpot Private App:
# Go to Settings > Integrations > Private Apps
# Create app with Contacts, Deals, Companies access

# 2. Environment Variables:
HUBSPOT_ACCESS_TOKEN=pat-your-private-app-token
HUBSPOT_PORTAL_ID=your_portal_id

# 3. Integration Features:
- Automatic lead sync from Supabase
- Deal creation for consultations
- Attribution data sync
- Marketing email segmentation
```

---

### 🔗 **7. SMS AUTOMATION (Twilio)**

**Purpose**: SMS reminders and urgent notifications

**Connection Steps**:
```bash
# 1. Twilio Account:
# Sign up at: https://console.twilio.com
# Buy Swiss phone number (+41)

# 2. Environment Variables:
TWILIO_ACCOUNT_SID=ACyour_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+41xxxxxxxxx

# 3. Use Cases:
- Appointment reminders (24h before)
- Insurance deadline alerts
- Emergency policy updates
- Opt-in required for GDPR compliance
```

---

## 🎯 **STEP-BY-STEP PHASE C IMPLEMENTATION**

### **Week 1: Ad Platform Connections**

**Day 1-2: Google Ads Setup**
```bash
# 1. Create Google Ads API access
# 2. Set up draft-only campaign creation
# 3. Test Swiss geo-targeting
# 4. Implement approval workflow integration

# Commands to run:
cd /backend
python3 setup_google_ads.py
python3 test_google_ads_draft.py
```

**Day 3-4: Meta Ads Setup**
```bash
# 1. Facebook Marketing API setup
# 2. Creative template system
# 3. Audience sync from lead data
# 4. Campaign draft creation

# Commands to run:
python3 setup_meta_ads.py
python3 test_facebook_campaigns.py
```

**Day 5-7: LinkedIn & Reddit Setup**
```bash
# 1. LinkedIn B2B targeting setup
# 2. Reddit community advertising
# 3. Cross-platform budget allocation
# 4. Performance tracking integration
```

### **Week 2: Retargeting & Automation**

**Day 1-3: Retargeting Segments**
```bash
# 1. Define audience segments:
- quote_started_no_submit_7d
- consultation_booked_no_show  
- homepage_visitors_no_engagement
- guide_readers_ready_to_convert

# 2. Implement dynamic audience building
# 3. Cross-platform retargeting campaigns
# 4. Personalized messaging by segment
```

**Day 4-7: Email & SMS Automation**
```bash
# 1. Email sequence templates
# 2. Trigger-based automation
# 3. SMS appointment reminders
# 4. GDPR compliance integration
```

---

## 🔒 **SECURITY & COMPLIANCE CHECKLIST**

### **✅ Data Protection (GDPR)**
- [x] Lead data encrypted at rest
- [x] Attribution data anonymization
- [x] Cookie-free analytics (Plausible)
- [ ] Email opt-in tracking (Phase C)
- [ ] Right to deletion automated (Phase C)

### **✅ API Security**
- [x] Admin authentication required
- [x] Named queries prevent SQL injection  
- [x] Rate limiting on AI endpoints
- [ ] OAuth 2.0 for ad platforms (Phase C)
- [ ] API key rotation schedule (Phase C)

### **✅ Swiss Compliance**
- [x] Data stored in EU (Supabase EU region)
- [x] Privacy-first analytics
- [ ] Insurance advertising regulations compliance (Phase C)
- [ ] Multi-language legal notices (DE/FR/IT/EN)

---

## 🚀 **QUICK START COMMANDS**

### **Current System Test**:
```bash
# Test all current connections
curl https://expat-savvy-api.fly.dev/health
curl -u admin:phase_a_2025 "https://expat-savvy-api.fly.dev/tools/chat"

# Admin dashboard
open https://expat-savvy-api.fly.dev/admin/ai
```

### **Phase C Preparation**:
```bash
# Clone Phase C branch (when ready)
git checkout phase-c-dev

# Install Phase C dependencies  
pip install google-ads facebook-business linkedin-api resend

# Run Phase C setup wizard
python3 setup_phase_c.py
```

---

## 📞 **SUPPORT & TROUBLESHOOTING**

### **Connection Issues**:
1. **Database**: Check Supabase dashboard for connection health
2. **Analytics**: Verify Plausible API key in Settings > API
3. **AI**: Test Anthropic API key in console.anthropic.com
4. **Auth**: Ensure admin credentials match environment variables

### **Performance Monitoring**:
- **Response Times**: All AI endpoints < 5 seconds
- **Error Rates**: < 1% for all API calls  
- **Database Queries**: All named queries < 500ms
- **ETL Jobs**: Daily completion by 6 AM CET

---

**🎯 Your AI Growth Ops platform is now fully connected with Claude Sonnet 4 and ready for Phase C expansion!**

*This manual will be updated as new tools are connected and integrated.*

