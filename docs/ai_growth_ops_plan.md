# AI-Driven Growth Ops — Implementation Plan

**Date:** September 11, 2025  
**Project:** Expat-Savvy AI Growth Operations  
**Audit Reference:** `docs/ai_growth_ops_audit.md`  

---

## Executive Summary

Based on the comprehensive codebase audit, this plan implements AI-driven growth operations in **5 phases** over **12-16 weeks**. The strong existing foundation (85% complete) allows us to focus on extensions rather than rebuilds.

**Key Insight:** The platform's comprehensive attribution system and real-time analytics provide an ideal foundation for AI-powered optimization.

---

## Implementation Phases Overview

| Phase | Focus | Duration | Effort | Dependencies |
|-------|-------|----------|--------|--------------|
| A | Data Foundation & ETL | 3 weeks | Medium | Plausible API ✅ |
| B | LLM Tooling & Chat | 4 weeks | High | Phase A complete |
| C | Ad Connectors (Draft) | 3 weeks | Medium | Phase B complete |
| D | Lifecycle Automation | 3 weeks | Medium | Phase B complete |
| E | Reporting & Governance | 3 weeks | Medium | All phases |

**Total Timeline:** 12-16 weeks (with parallel work in Phases C-E)

---

## Phase A — Data Foundation & Attribution (Weeks 1-3)

### Objective
Extend the existing strong analytics foundation with automated data aggregation and comprehensive attribution tracking.

### Acceptance Criteria
- [ ] Daily ETL jobs populate `events_daily` from Plausible
- [ ] Google Search Console data flowing to `gsc_perf` table
- [ ] First/last touch attribution in `lead_sources` table
- [ ] `/admin/reports/daily` shows yesterday's data
- [ ] CPL calculation: `ad_costs.spend / leads_from_paid`

### 1.1 Database Schema Extensions

**New Tables to Create:**
```sql
-- Daily event aggregation (ETL destination)
CREATE TABLE events_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    page_path TEXT,
    page_type TEXT,
    city TEXT,
    channel TEXT,
    source TEXT,
    campaign TEXT,
    flow TEXT,
    -- Metrics
    pageviews INTEGER DEFAULT 0,
    quote_starts INTEGER DEFAULT 0,
    quote_submits INTEGER DEFAULT 0,
    consultation_starts INTEGER DEFAULT 0,
    bookings INTEGER DEFAULT 0,
    leads INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- First/Last touch attribution (1:1 with leads)
CREATE TABLE lead_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    -- First touch
    first_utm_source TEXT,
    first_utm_medium TEXT,
    first_utm_campaign TEXT,
    first_utm_term TEXT,
    first_utm_content TEXT,
    first_referrer TEXT,
    first_landing_path TEXT,
    first_touch_at TIMESTAMP WITH TIME ZONE,
    -- Last touch  
    last_utm_source TEXT,
    last_utm_medium TEXT,
    last_utm_campaign TEXT,
    last_utm_term TEXT,
    last_utm_content TEXT,
    last_referrer TEXT,
    last_landing_path TEXT,
    last_touch_at TIMESTAMP WITH TIME ZONE,
    -- Derived
    channel_derived TEXT,
    city TEXT,
    page_type TEXT,
    flow TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Google Search Console data
CREATE TABLE gsc_perf (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    page TEXT NOT NULL,
    query TEXT NOT NULL,
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    ctr DECIMAL(5,4) DEFAULT 0,
    position DECIMAL(4,1) DEFAULT 0,
    device TEXT,
    country TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Implementation Files:**
- `backend/migrations/phase_a_schema.sql`
- Update `backend/supabase_models.py` with new models

### 1.2 Nightly ETL Jobs

**New Service:** `backend/services/etl.py`
```python
class ETLService:
    async def run_daily_plausible_etl(self, date: str):
        """Aggregate Plausible data by day/props to events_daily"""
        
    async def run_gsc_etl(self, date: str):
        """Pull GSC data to gsc_perf table"""
        
    async def reconcile_ad_spend(self, date: str):
        """Match ad_costs with lead attribution"""
```

**Scheduled Jobs:**
- Background task system (FastAPI Background Tasks or external cron)
- Daily at 6 AM UTC: Plausible ETL for yesterday
- Daily at 7 AM UTC: GSC ETL for yesterday
- Daily at 8 AM UTC: Ad spend reconciliation

### 1.3 Attribution QA System

**New Endpoint:** `POST /api/attribution/recompute`
```python
async def recompute_lead_attribution(lead_id: Optional[str] = None):
    """Recompute channel classification and create lead_sources"""
```

**Attribution Logic Enhancement:**
- Ensure every lead writes to both `leads` and `lead_sources` tables
- Retroactively fill `lead_sources` for existing leads
- Add utility for channel classification updates

### 1.4 Enhanced Reporting Endpoints

**New Endpoints:**
```python
GET /api/reports/daily?date=YYYY-MM-DD
    # Yesterday's events_daily + ad_costs summary
    
GET /api/reports/cpl?start_date&end_date&channel
    # Cost per lead by channel/campaign
    
GET /api/reports/attribution?lead_id
    # Full attribution chain for specific lead
```

### Environment Variables Required
```bash
# Google Search Console
GSC_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
GSC_PROPERTY_URL=https://expat-savvy.ch

# ETL Configuration  
ETL_ENABLED=true
ETL_HOUR_UTC=6
PLAUSIBLE_ETL_DAYS_HISTORY=90
```

### Phase A Risks & Mitigations
**Risk:** Google Search Console API quotas  
**Mitigation:** Implement exponential backoff, daily limits

**Risk:** ETL job failures  
**Mitigation:** Add retry logic, failure notifications, manual trigger endpoints

### Week-by-Week Breakdown
- **Week 1:** Database schema extensions, lead_sources migration
- **Week 2:** ETL service implementation, Plausible daily aggregation  
- **Week 3:** GSC integration, reporting endpoints, attribution QA

---

## Phase B — LLM Tooling & Chat Panel (Weeks 4-7)

### Objective
Create AI-powered insights and campaign drafting with human approval workflows.

### Acceptance Criteria
- [ ] Chat interface in admin panel with context chips
- [ ] AI can query metrics via safe tool endpoints
- [ ] Approval queue for AI-generated campaigns/emails
- [ ] Built-in commands: `/find_waste`, `/idea_copy`, `/build_retargeting`
- [ ] Comprehensive audit log of all AI actions

### 2.1 LLM Provider Service

**New Service:** `backend/services/llm.py`
```python
class LLMService:
    def __init__(self):
        self.provider = os.getenv("LLM_PROVIDER", "anthropic")
        
    async def chat_completion(self, messages: List[Dict], tools: Optional[List] = None):
        """Main LLM interface with tool calling"""
        
    async def generate_ad_copy(self, brief: str, context: Dict):
        """Generate ad copy variants"""
        
    async def analyze_funnel(self, metrics: Dict):
        """Analyze funnel data and recommend optimizations"""
```

**Provider Implementations:**
- Primary: Anthropic Claude 3.5 Sonnet
- Backup: OpenAI GPT-4
- Environment-driven switching

### 2.2 AI Tool Endpoints (Safe Query System)

**New Endpoints:** `backend/api/tools.py`
```python
# Named queries only - no raw SQL from AI
POST /tools/query_sql
    # Body: {"query_name": "funnel_by_channel", "params": {...}}
    
GET /tools/get_plausible_report?from&to&props
    # Returns aggregated Plausible metrics
    
GET /tools/get_gsc_report?from&to&path  
    # Returns GSC data for pages/queries
    
POST /tools/create_approval
    # Create approval item (draft only)
    
GET /tools/list_approvals
    # Fetch pending approvals
```

**Named Query Library:**
```python
NAMED_QUERIES = {
    "funnel_by_channel": """
        SELECT channel, COUNT(*) as leads, 
               AVG(stage_conversion) as conversion_rate
        FROM leads l JOIN events_daily e USING (date)
        WHERE date >= %s AND date <= %s
        GROUP BY channel
    """,
    "cpl_by_campaign": "...",
    "leads_by_city": "...",
    "query_overlap": "..."  # GSC cannibalization
}
```

### 2.3 Database Schema for AI Governance

**New Tables:**
```sql
-- AI action audit log
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'ai')),
    actor_id TEXT,  -- user_id or ai_session_id
    action TEXT NOT NULL,
    payload_json JSONB,
    result_json JSONB
);

-- Approval workflow
CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    item_type TEXT NOT NULL CHECK (item_type IN (
        'ad_campaign', 'ad_set', 'ad', 'email_drip', 'content_test'
    )),
    title TEXT NOT NULL,
    description TEXT,
    draft_payload_json JSONB NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'rejected', 'cancelled'
    )),
    created_by TEXT, -- ai_session_id
    reviewer_id TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT
);
```

### 2.4 Admin Panel Chat Interface

**Frontend Enhancement:** New chat dock in `/admin`
- **Context Chips:** "Leads", "Funnel", "City Pages", "Providers", "How-to"
- **Ask About This Chart:** Context-aware chart analysis
- **Approval Queue:** Pending AI items with diff view
- **Built-in Commands:**
  - `/find_waste <days>` - High spend/low conversion campaigns
  - `/idea_copy <page>` - A/B test copy variants  
  - `/build_retargeting <segment>` - Draft retargeting campaign
  - `/seo_overlap <keyword>` - Content cannibalization analysis

### 2.5 Built-in AI Commands Implementation

**Command Processors:**
```python
async def cmd_find_waste(days: int = 30):
    """Analyze campaigns with high spend/low conversion"""
    # Query ad_costs + leads + attribution
    # Return recommendations with draft optimizations
    
async def cmd_idea_copy(page_type: str):
    """Generate A/B test copy variants for page type"""  
    # Analyze current copy + performance
    # Generate variants with rationale
    
async def cmd_build_retargeting(segment: str):
    """Draft retargeting campaign for audience segment"""
    # Define audience from events/leads
    # Create campaign spec with creative variants
```

### Environment Variables Required
```bash
# LLM Configuration
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...  # backup

# AI Safety
AI_QUERY_TIMEOUT=30
AI_MAX_QUERIES_PER_HOUR=100
AI_REQUIRE_APPROVAL=true
```

### Phase B Risks & Mitigations
**Risk:** LLM API costs  
**Mitigation:** Usage monitoring, response caching, request rate limits

**Risk:** AI hallucination in recommendations  
**Mitigation:** All actions draft-only, human approval required, audit logging

### Week-by-Week Breakdown  
- **Week 4:** LLM service, basic chat interface
- **Week 5:** Tool endpoints, named query system
- **Week 6:** Approval workflow, audit logging
- **Week 7:** Built-in commands, chat polish

---

## Phase C — Ad Connectors (Draft-Only) (Weeks 8-10)

### Objective
Enable AI to draft ad campaigns across platforms with human approval workflow.

### Acceptance Criteria
- [ ] Google Ads draft campaign creation
- [ ] Meta Ads draft ad sets and creatives
- [ ] Retargeting audience specs defined
- [ ] All ad actions create approval items (no direct publish)
- [ ] Campaign performance monitoring endpoints

### 3.1 Ad Platform Connectors

**New Service:** `backend/services/ads.py`
```python
class AdPlatformService:
    async def google_ads_draft_campaign(self, campaign_spec: Dict):
        """Create Google Ads campaign JSON draft"""
        
    async def meta_ads_draft_campaign(self, campaign_spec: Dict):
        """Create Meta ads campaign JSON draft"""
        
    async def linkedin_ads_draft_campaign(self, campaign_spec: Dict):
        """Create LinkedIn campaign JSON draft"""
```

**Draft Endpoints:**
```python
POST /ads/google/draft_campaign
    # Body: campaigns, ad_groups, keywords, ads, budgets, UTMs
    # Result: Creates approval item with full payload
    
POST /ads/meta/draft_campaign  
    # Body: campaigns, ad_sets, audiences, creatives, budgets
    # Result: Creates approval item
    
POST /ads/linkedin/draft_campaign
POST /ads/reddit/draft_campaign
```

### 3.2 Retargeting Segment Definitions

**Audience Specs:** `backend/data/retargeting_segments.json`
```json
{
  "quote_started_no_submit_7d": {
    "platform_mapping": {
      "google": {"audience_type": "custom_audience", "rules": [...]},
      "meta": {"custom_audience_spec": {...}}
    },
    "description": "Users who started quote flow but didn't submit in last 7 days",
    "sql_definition": "SELECT DISTINCT user_id FROM events WHERE name='quote_flow_started' AND created_at >= NOW() - INTERVAL '7 days' AND user_id NOT IN (SELECT user_id FROM events WHERE name='quote_submitted')"
  },
  "lead_no_booking_7d": {...},
  "city_page_viewed_2x_14d": {...}
}
```

**Audience Export Endpoint:**
```python
GET /ads/segments/{segment_id}/export?platform=google|meta|linkedin
    # Returns platform-specific audience specification
```

### Environment Variables Required
```bash
# Google Ads (Draft mode - no publishing)
GOOGLE_ADS_CLIENT_ID=...
GOOGLE_ADS_CLIENT_SECRET=...  
GOOGLE_ADS_REFRESH_TOKEN=...
GOOGLE_ADS_DEVELOPER_TOKEN=...
GOOGLE_ADS_CUSTOMER_ID=...

# Meta Ads (Draft mode)
META_ACCESS_TOKEN=...
META_AD_ACCOUNT_ID=...

# LinkedIn Ads
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...

# Reddit Ads  
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...
```

### Week-by-Week Breakdown
- **Week 8:** Google Ads integration, draft campaign creation
- **Week 9:** Meta Ads integration, audience definitions
- **Week 10:** LinkedIn/Reddit stubs, integration testing

---

## Phase D — Lifecycle Automation (Weeks 11-13)

### Objective  
Implement sophisticated email nurturing with city/provider personalization and AI optimization.

### Acceptance Criteria
- [ ] 4-email drip sequence with city-aware content
- [ ] Provider-specific personalization
- [ ] Email content A/B testing via approvals
- [ ] Stop/start logic based on booking events
- [ ] Email performance tracking integration

### 4.1 Enhanced Email Service

**Extended Service:** `backend/services/email.py`
```python
async def start_nurture_sequence_v2(self, lead_id: str, email: str, name: str, city: str, provider_interest: List[str]):
    """Enhanced nurture with city/provider personalization"""
    
async def get_city_specific_content(self, city: str, template_type: str):
    """Dynamic city-aware email content"""
    
async def schedule_drip_email(self, lead_id: str, step: int, send_at: datetime):
    """Schedule individual email in sequence"""
```

**Enhanced Email Templates:**
```python
CITY_SPECIFIC_TEMPLATES = {
    "zurich": {
        "subject_variants": ["Zurich Health Insurance: 3 Money-Saving Tips", ...],
        "content_blocks": {"intro": "As Zurich's costs are among Switzerland's highest...", ...}
    },
    "geneva": {...},
    "basel": {...}
}
```

### 4.2 Email Drip Management

**New Table:**
```sql
CREATE TABLE email_drips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
    audience_sql TEXT NOT NULL,
    schedule_json JSONB NOT NULL,  -- [{"step": 1, "delay_hours": 0}, ...]
    email_templates_json JSONB NOT NULL,
    pause_conditions_json JSONB,  -- {"on_booking": true, "on_unsubscribe": true}
    performance_json JSONB  -- open_rates, click_rates by step
);
```

**Drip Management Endpoints:**
```python
POST /drips/draft  
    # Creates drip in approvals (AI-generated sequences)
    
POST /drips/activate/{drip_id}
    # Activate after approval
    
GET /drips/{drip_id}/performance
    # Email performance analytics
```

### Week-by-Week Breakdown
- **Week 11:** Enhanced email service, city-specific content
- **Week 12:** Drip management system, scheduling logic
- **Week 13:** Email performance tracking, A/B testing

---

## Phase E — Reporting & Governance (Weeks 14-16)

### Objective
Complete the AI growth ops platform with advanced reporting, audit systems, and governance.

### Acceptance Criteria
- [ ] Enhanced dashboard with CPL, funnel, city/provider widgets
- [ ] Complete audit log with AI action filtering
- [ ] Weekly digest email system
- [ ] RBAC with admin/advisor roles
- [ ] Performance monitoring and alerts

### 5.1 Enhanced Dashboard Widgets

**New Reporting Components:**
- Leads by channel & city (last 7/28 days) with trends
- CPL by campaign with spend attribution
- Funnel visualization with drop-off highlights  
- Best pages by conversion rate (city & provider)
- GSC top queries with CTR/position tracking
- AI recommendation activity feed

### 5.2 Governance System

**RBAC Implementation:**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'advisor', 'viewer')),
    permissions_json JSONB  -- {"approve_ads": true, "approve_emails": false}
);
```

**Audit Log Dashboard:**
- Filter by actor (AI vs user), action type, date range
- AI recommendation acceptance rate tracking
- Performance impact of approved AI suggestions

### 5.3 Weekly Digest System

**Automated Reporting:**
```python
async def generate_weekly_digest():
    """Create weekly performance summary"""
    # Leads summary (new, booked, conversion rates)
    # CPL analysis (paid channel performance) 
    # Top performing campaigns/pages
    # AI suggestions awaiting approval
    # Performance alerts (CPL spikes, funnel drop-offs)
```

### Week-by-Week Breakdown
- **Week 14:** Enhanced dashboard widgets, reporting UI
- **Week 15:** RBAC system, user management  
- **Week 16:** Weekly digest, performance monitoring

---

## Environment Variables Summary

```bash
# Existing (confirmed working)
SUPABASE_URL=https://gwvfppnwmlggjofdfzdu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
PLAUSIBLE_API_KEY=u1ed7dR6rh5ir2u3KxXOA8bmtr-0B1feIP-YL9QI8kvzikgZJMOCQtYttfrTRJXh
PLAUSIBLE_DOMAIN=expat-savvy.ch
EMAIL_API_KEY=re_...
ADMIN_USER=admin
ADMIN_PASS=changeme123

# Phase A - Data Foundation  
GSC_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
GSC_PROPERTY_URL=https://expat-savvy.ch
ETL_ENABLED=true
ETL_HOUR_UTC=6

# Phase B - LLM Integration
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
AI_REQUIRE_APPROVAL=true

# Phase C - Ad Platforms (Draft mode)
GOOGLE_ADS_CLIENT_ID=...
GOOGLE_ADS_CLIENT_SECRET=...
GOOGLE_ADS_REFRESH_TOKEN=...
META_ACCESS_TOKEN=...
LINKEDIN_CLIENT_ID=...

# Phase E - Advanced Features
WEEKLY_DIGEST_ENABLED=true
DIGEST_RECIPIENT_EMAILS=admin@expat-savvy.ch
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

---

## Success Metrics

### Phase A Success Criteria
- Daily ETL jobs running without failures (>95% success rate)
- Attribution data completeness >99% for new leads  
- GSC data flowing daily with <24h delay
- CPL calculation matching ad spend within 5% variance

### Phase B Success Criteria
- AI chat responds to queries within 10 seconds
- Approval workflow handles 100% of AI actions
- Named queries return results in <3 seconds
- Zero AI actions bypass human approval

### Overall Success Metrics
- **Lead Attribution:** 100% of leads have complete first/last touch data
- **AI Adoption:** >50% of campaign optimizations use AI recommendations
- **Approval Workflow:** >95% of AI suggestions reviewed within 24 hours
- **Performance Improvement:** 20% reduction in CPL within 3 months
- **Time Savings:** 10+ hours/week saved on manual campaign management

---

## Risk Mitigation Strategy

### Technical Risks
- **LLM API Outages:** Implement provider fallback (Anthropic → OpenAI)  
- **ETL Failures:** Add retry logic, manual trigger endpoints, failure alerts
- **Performance Impact:** Cache frequently requested data, optimize queries
- **Data Quality:** Implement data validation, reconciliation checks

### Business Risks  
- **AI Recommendation Quality:** All actions require human approval, track performance
- **Ad Spend Control:** Draft-only mode, explicit approval for any publishing
- **Data Privacy:** GDPR compliance review, consent management
- **Cost Management:** API usage monitoring, budget alerts

### Operational Risks
- **Single Point of Failure:** Document all systems, implement health checks
- **Knowledge Transfer:** Comprehensive documentation, code comments  
- **Testing Coverage:** Add integration tests for critical paths
- **Monitoring:** Implement alerts for ETL failures, API errors, funnel drops

---

## Post-Implementation Success Indicators

After full deployment, you should be able to:

1. **Ask the AI:** "Which campaigns are wasting spend?" → Get actionable recommendations with draft optimization campaigns ready for approval

2. **Daily Dashboard:** See exact paid vs organic performance, CPL trends, and funnel performance with AI insights highlighted

3. **Campaign Creation:** "Draft Google ads for health insurance switching season targeting Zurich residents" → AI creates complete campaign spec awaiting your approval  

4. **Attribution Clarity:** Track every lead back to first touch (organic search vs paid ads vs referral) and measure true ROI

5. **Lifecycle Automation:** New leads automatically enter city-specific nurture sequences that stop when they book consultations

6. **Performance Monitoring:** Weekly digest emails with AI-identified opportunities and performance alerts

The platform will transform from a static lead collection system into an intelligent growth machine that actively optimizes while keeping you in control of all publishing decisions.

---

*End of Implementation Plan*

**Next Steps:**
1. Review and approve this implementation plan  
2. Confirm environment variable access for required services
3. Begin Phase A implementation with database schema extensions
4. Set up development/staging environments for safe testing

**Estimated Total Delivery:** 12-16 weeks
**Estimated Total Effort:** 280-320 developer hours
**Risk Level:** Medium (strong foundation, clear requirements, proven architecture)

