# 🚀 Phase C Implementation Guide: Ad Connectors & Retargeting

**Status**: Ready to Deploy  
**Estimated Time**: 5-7 days  
**Prerequisites**: Phase A & B completed, Claude Sonnet 4 active

---

## 🎯 **PHASE C OVERVIEW**

**Goal**: Transform your AI assistant into a complete campaign creation machine that can draft ads across all major platforms while maintaining human oversight.

**Key Features**:
- **Multi-platform ad creation** (Google, Meta, LinkedIn, Reddit)
- **Smart retargeting segments** based on user behavior
- **AI campaign optimization** with budget recommendations
- **Complete approval workflow** for all AI-generated content
- **Swiss market expertise** built into targeting and copy

---

## 📋 **PHASE C CHECKLIST**

### **Backend Infrastructure**
- [ ] **Ad Platform APIs**: Google Ads, Meta, LinkedIn, Reddit connections
- [ ] **Retargeting Engine**: Dynamic audience segment builder
- [ ] **Campaign Templates**: Multi-format ad creative system
- [ ] **Budget Optimizer**: Cross-platform spend allocation
- [ ] **Enhanced Approval Queue**: Campaign preview and approval system

### **Database Extensions**
- [ ] **`ad_platforms`**: Store API credentials and platform configs
- [ ] **`retargeting_segments`**: Define and manage audience segments
- [ ] **`campaign_drafts`**: Store AI-generated campaigns before approval
- [ ] **`ad_creatives`**: Manage ad copy, images, and variations
- [ ] **`budget_allocations`**: Track spend across platforms

### **AI Capabilities**
- [ ] **Campaign Generation**: Full campaign structure creation
- [ ] **Creative Variations**: A/B test copy and creative generation  
- [ ] **Audience Analysis**: Behavior-based segment recommendations
- [ ] **Performance Prediction**: ROI forecasting based on historical data
- [ ] **Budget Optimization**: Spend allocation recommendations

---

## 🛠 **IMPLEMENTATION STEPS**

### **STEP 1: Database Schema Extensions**

**Create Phase C Tables**:
```sql
-- Ad Platforms Configuration
CREATE TABLE ad_platforms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    platform_name VARCHAR(50) NOT NULL, -- 'google_ads', 'meta', 'linkedin', 'reddit'
    api_credentials JSONB NOT NULL, -- encrypted credentials
    account_id VARCHAR(100) NOT NULL,
    daily_budget_limit DECIMAL(10,2) DEFAULT 500.00,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'paused', 'error'
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Retargeting Segments
CREATE TABLE retargeting_segments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    segment_name VARCHAR(100) NOT NULL,
    description TEXT,
    conditions JSONB NOT NULL, -- behavior rules and filters
    estimated_size INTEGER DEFAULT 0,
    platforms TEXT[] DEFAULT ARRAY['google_ads', 'meta'], -- which platforms support this segment
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign Drafts
CREATE TABLE campaign_drafts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    platform VARCHAR(50) NOT NULL,
    campaign_type VARCHAR(50) NOT NULL, -- 'search', 'display', 'video', 'social'
    campaign_name VARCHAR(200) NOT NULL,
    target_segment_id UUID REFERENCES retargeting_segments(id),
    budget_daily DECIMAL(10,2),
    budget_total DECIMAL(10,2),
    targeting_config JSONB NOT NULL,
    ad_creatives JSONB NOT NULL, -- headlines, descriptions, images
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'approved', 'live', 'paused'
    approval_id UUID REFERENCES approvals(id),
    created_by VARCHAR(100) DEFAULT 'ai_assistant',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad Creatives Library
CREATE TABLE ad_creatives (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creative_type VARCHAR(50) NOT NULL, -- 'headline', 'description', 'image', 'video'
    content TEXT NOT NULL,
    format_specs JSONB, -- dimensions, character limits, etc.
    platform_compatibility TEXT[] DEFAULT ARRAY['google_ads', 'meta', 'linkedin'],
    performance_score DECIMAL(3,2), -- AI-predicted performance 0.00-1.00
    a_b_test_group VARCHAR(10), -- 'A', 'B', 'C', etc.
    created_by VARCHAR(100) DEFAULT 'ai_assistant',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budget Allocations
CREATE TABLE budget_allocations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date_period DATE NOT NULL,
    platform VARCHAR(50) NOT NULL,
    allocated_budget DECIMAL(10,2) NOT NULL,
    spent_budget DECIMAL(10,2) DEFAULT 0.00,
    leads_generated INTEGER DEFAULT 0,
    cost_per_lead DECIMAL(10,2),
    roi_estimate DECIMAL(5,4), -- return on investment
    ai_recommendation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_campaign_drafts_platform ON campaign_drafts(platform);
CREATE INDEX idx_campaign_drafts_status ON campaign_drafts(status);
CREATE INDEX idx_retargeting_segments_status ON retargeting_segments(status);
CREATE INDEX idx_budget_allocations_date ON budget_allocations(date_period);

-- Row Level Security
ALTER TABLE ad_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE retargeting_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_allocations ENABLE ROW LEVEL SECURITY;

-- Policies (admin only for now)
CREATE POLICY "Admin access ad_platforms" ON ad_platforms FOR ALL USING (true);
CREATE POLICY "Admin access retargeting_segments" ON retargeting_segments FOR ALL USING (true);
CREATE POLICY "Admin access campaign_drafts" ON campaign_drafts FOR ALL USING (true);
CREATE POLICY "Admin access ad_creatives" ON ad_creatives FOR ALL USING (true);
CREATE POLICY "Admin access budget_allocations" ON budget_allocations FOR ALL USING (true);
```

### **STEP 2: Ad Platform Integrations**

**Create API Integration Services**:

```python
# backend/services/ad_platforms.py
import asyncio
from typing import Dict, List, Any, Optional
from abc import ABC, abstractmethod

class AdPlatformConnector(ABC):
    """Abstract base class for ad platform connectors"""
    
    @abstractmethod
    async def create_campaign_draft(self, campaign_spec: Dict[str, Any]) -> Dict[str, Any]:
        """Create campaign draft on platform"""
        pass
    
    @abstractmethod
    async def get_audience_size(self, targeting_spec: Dict[str, Any]) -> int:
        """Get estimated audience size for targeting parameters"""
        pass
    
    @abstractmethod
    async def validate_creative(self, creative: Dict[str, Any]) -> Dict[str, Any]:
        """Validate creative meets platform requirements"""
        pass

class GoogleAdsConnector(AdPlatformConnector):
    """Google Ads API integration - DRAFT ONLY MODE"""
    
    def __init__(self):
        self.customer_id = os.getenv("GOOGLE_ADS_CUSTOMER_ID")
        self.developer_token = os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN")
        # Initialize Google Ads client
    
    async def create_campaign_draft(self, campaign_spec: Dict[str, Any]) -> Dict[str, Any]:
        """Create Google Ads campaign draft"""
        try:
            # Swiss geo-targeting by default
            campaign_spec['geo_targeting'] = campaign_spec.get('geo_targeting', ['Switzerland'])
            
            # Campaign structure for health insurance
            campaign = {
                'name': campaign_spec['name'],
                'budget': campaign_spec['daily_budget'],
                'bidding_strategy': 'TARGET_CPA',  # Focus on lead generation
                'target_cpa': campaign_spec.get('target_cpl', 45.00),  # Swiss market average
                'ad_groups': []
            }
            
            # Generate ad groups by city for local targeting
            swiss_cities = ['Zurich', 'Geneva', 'Basel', 'Bern', 'Lausanne', 'Zug']
            for city in swiss_cities:
                ad_group = {
                    'name': f"Health Insurance {city}",
                    'keywords': [
                        f"health insurance {city}",
                        f"krankenversicherung {city}",  # German
                        f"assurance maladie {city}",   # French
                    ],
                    'ads': campaign_spec.get('ad_creatives', [])
                }
                campaign['ad_groups'].append(ad_group)
            
            # Store as DRAFT in campaign_drafts table
            draft_id = await self._store_campaign_draft('google_ads', campaign)
            
            return {
                'platform': 'google_ads',
                'draft_id': draft_id,
                'status': 'draft_created',
                'estimated_reach': await self.get_audience_size(campaign_spec),
                'estimated_cpl': campaign_spec.get('target_cpl', 45.00),
                'campaign_structure': campaign
            }
            
        except Exception as e:
            return {'error': f"Google Ads draft creation failed: {str(e)}"}

class MetaAdsConnector(AdPlatformConnector):
    """Meta (Facebook/Instagram) Ads integration"""
    
    async def create_campaign_draft(self, campaign_spec: Dict[str, Any]) -> Dict[str, Any]:
        """Create Meta campaign draft"""
        # Facebook/Instagram campaign for health insurance
        campaign = {
            'name': campaign_spec['name'],
            'objective': 'LEAD_GENERATION',
            'placements': ['facebook_feed', 'instagram_feed', 'instagram_stories'],
            'audience': {
                'age_min': 25,
                'age_max': 65,
                'countries': ['CH'],  # Switzerland
                'languages': ['en', 'de', 'fr', 'it'],  # Swiss languages
                'interests': ['Health Insurance', 'Expat Life', 'Financial Planning'],
                'behaviors': ['Expats', 'Recent Movers']
            },
            'budget': campaign_spec['daily_budget'],
            'creatives': campaign_spec.get('ad_creatives', [])
        }
        
        draft_id = await self._store_campaign_draft('meta', campaign)
        
        return {
            'platform': 'meta',
            'draft_id': draft_id,
            'status': 'draft_created',
            'campaign_structure': campaign
        }

class LinkedInAdsConnector(AdPlatformConnector):
    """LinkedIn Ads for B2B expat professionals"""
    
    async def create_campaign_draft(self, campaign_spec: Dict[str, Any]) -> Dict[str, Any]:
        """Create LinkedIn campaign draft targeting expat professionals"""
        campaign = {
            'name': campaign_spec['name'],
            'objective': 'LEAD_GENERATION',
            'audience': {
                'locations': ['Switzerland'],
                'job_titles': [
                    'Software Engineer', 'Data Scientist', 'Product Manager',
                    'Financial Analyst', 'Consultant', 'Research Scientist'
                ],
                'company_sizes': ['51-200', '201-500', '501-1000', '1001-5000'],
                'languages': ['English'],
                'skills': ['International Experience', 'Multilingual']
            },
            'budget': campaign_spec['daily_budget'],
            'creatives': campaign_spec.get('ad_creatives', [])
        }
        
        draft_id = await self._store_campaign_draft('linkedin', campaign)
        
        return {
            'platform': 'linkedin',  
            'draft_id': draft_id,
            'status': 'draft_created',
            'campaign_structure': campaign
        }

# Multi-platform campaign orchestrator
class CampaignOrchestrator:
    """Manages campaigns across all platforms"""
    
    def __init__(self):
        self.connectors = {
            'google_ads': GoogleAdsConnector(),
            'meta': MetaAdsConnector(),
            'linkedin': LinkedInAdsConnector()
        }
    
    async def create_multi_platform_campaign(
        self, 
        campaign_brief: str, 
        budget_total: float,
        target_segment: str
    ) -> Dict[str, Any]:
        """Create campaign drafts across multiple platforms"""
        
        # AI-powered budget allocation
        budget_allocation = {
            'google_ads': budget_total * 0.5,  # 50% for search intent
            'meta': budget_total * 0.3,        # 30% for social reach  
            'linkedin': budget_total * 0.2     # 20% for B2B targeting
        }
        
        campaign_drafts = {}
        
        for platform, daily_budget in budget_allocation.items():
            if daily_budget > 10:  # Minimum viable budget
                campaign_spec = {
                    'name': f"{campaign_brief} - {platform.title()}",
                    'daily_budget': daily_budget,
                    'target_segment': target_segment,
                    'ad_creatives': await self._generate_platform_creatives(platform, campaign_brief)
                }
                
                draft = await self.connectors[platform].create_campaign_draft(campaign_spec)
                campaign_drafts[platform] = draft
        
        return {
            'total_budget': budget_total,
            'budget_allocation': budget_allocation,
            'platform_drafts': campaign_drafts,
            'requires_approval': True
        }
```

### **STEP 3: Retargeting Segments Engine**

**Create Dynamic Audience Builder**:

```python
# backend/services/retargeting.py
from datetime import datetime, timedelta
from typing import Dict, List, Any

class RetargetingEngine:
    """Build dynamic audience segments for retargeting campaigns"""
    
    def __init__(self):
        self.segments = self._define_segments()
    
    def _define_segments(self) -> Dict[str, Dict]:
        """Define all available retargeting segments"""
        return {
            'quote_started_no_submit_7d': {
                'name': 'Quote Started - No Submit (7 days)',
                'description': 'Visitors who started quote process but didn\'t complete in last 7 days',
                'conditions': {
                    'events_include': ['quote_start'],
                    'events_exclude': ['quote_submit', 'consultation_book'],
                    'timeframe_days': 7,
                    'min_audience_size': 100
                },
                'messaging_angle': 'completion_urgency',
                'estimated_conversion_lift': 0.15
            },
            
            'consultation_booked_no_show': {
                'name': 'Consultation Booked - No Show',
                'description': 'Users who booked consultations but didn\'t attend',
                'conditions': {
                    'events_include': ['consultation_book'],
                    'events_exclude': ['consultation_attended'],
                    'timeframe_days': 14,
                    'min_audience_size': 50
                },
                'messaging_angle': 'reschedule_offer',
                'estimated_conversion_lift': 0.25
            },
            
            'homepage_visitors_no_engagement': {
                'name': 'Homepage Visitors - No Engagement',
                'description': 'Homepage visitors who didn\'t engage with any content',
                'conditions': {
                    'page_views': ['/'],
                    'session_duration_min': 30,  # Less than 30 seconds
                    'events_exclude': ['quote_start', 'guide_download', 'newsletter_signup'],
                    'timeframe_days': 3,
                    'min_audience_size': 200
                },
                'messaging_angle': 'education_value',
                'estimated_conversion_lift': 0.08
            },
            
            'guide_readers_ready_convert': {
                'name': 'Guide Readers - Ready to Convert',
                'description': 'Users who read multiple guides but haven\'t taken action',
                'conditions': {
                    'page_views_count': 3,  # Viewed 3+ guide pages
                    'page_type': 'guide',
                    'events_exclude': ['quote_start', 'consultation_book'],
                    'timeframe_days': 14,
                    'engagement_score_min': 0.7
                },
                'messaging_angle': 'expert_consultation',
                'estimated_conversion_lift': 0.20
            },
            
            'city_specific_interest': {
                'name': 'City-Specific Interest',
                'description': 'Visitors interested in specific Swiss cities',
                'conditions': {
                    'cities': ['zurich', 'geneva', 'basel', 'zug'],
                    'page_views_city': True,
                    'timeframe_days': 30
                },
                'messaging_angle': 'local_expertise',
                'estimated_conversion_lift': 0.12
            },
            
            'insurance_deadline_urgent': {
                'name': 'Insurance Deadline Urgent',
                'description': 'Users in period when insurance changes are urgent',
                'conditions': {
                    'seasonal': True,
                    'months': [10, 11, 12],  # October-December deadline period
                    'page_views': ['/insurance-change-2025-2026'],
                    'timeframe_days': 60
                },
                'messaging_angle': 'deadline_urgency',
                'estimated_conversion_lift': 0.30
            }
        }
    
    async def build_segment(self, segment_key: str) -> Dict[str, Any]:
        """Build a specific retargeting segment with current data"""
        if segment_key not in self.segments:
            raise ValueError(f"Unknown segment: {segment_key}")
        
        segment_config = self.segments[segment_key]
        conditions = segment_config['conditions']
        
        # Query Supabase for matching users
        query = self._build_segment_query(conditions)
        audience_data = await self._execute_segment_query(query)
        
        # Calculate segment metrics
        segment_metrics = {
            'segment_key': segment_key,
            'audience_size': len(audience_data),
            'estimated_reach': len(audience_data) * 1.5,  # Platform expansion
            'avg_time_since_interaction': self._calculate_avg_time(audience_data),
            'top_cities': self._get_top_cities(audience_data),
            'estimated_conversion_rate': segment_config['estimated_conversion_lift'],
            'recommended_budget': len(audience_data) * 0.50,  # CHF 0.50 per person
            'messaging_recommendations': self._get_messaging_recs(segment_config),
            'platform_compatibility': ['google_ads', 'meta', 'linkedin']
        }
        
        # Store segment in database for future use
        await self._store_segment(segment_key, segment_config, segment_metrics)
        
        return segment_metrics
    
    def _build_segment_query(self, conditions: Dict) -> str:
        """Build SQL query for segment conditions"""
        # This would build complex SQL based on conditions
        # Simplified version here
        base_query = """
            SELECT DISTINCT l.id, l.email, l.city, l.created_at, ls.first_utm_source, ls.last_utm_source
            FROM leads l
            LEFT JOIN lead_sources ls ON l.id = ls.lead_id
            LEFT JOIN events_daily ed ON l.city = ed.city
            WHERE l.created_at >= NOW() - INTERVAL '{timeframe} days'
        """.format(timeframe=conditions.get('timeframe_days', 7))
        
        return base_query
    
    async def generate_segment_campaigns(self, segment_key: str) -> List[Dict[str, Any]]:
        """Generate campaign recommendations for a segment"""
        segment_metrics = await self.build_segment(segment_key)
        segment_config = self.segments[segment_key]
        
        campaigns = []
        
        # Google Ads Search Campaign
        campaigns.append({
            'platform': 'google_ads',
            'campaign_type': 'search',
            'name': f"Retargeting: {segment_config['name']} - Search",
            'daily_budget': segment_metrics['recommended_budget'] * 0.5,
            'targeting': {
                'audience_list': segment_key,
                'keywords': await self._generate_keywords(segment_config),
                'geo_targeting': segment_metrics['top_cities']
            },
            'ads': await self._generate_search_ads(segment_config)
        })
        
        # Meta Social Campaign  
        campaigns.append({
            'platform': 'meta',
            'campaign_type': 'social',
            'name': f"Retargeting: {segment_config['name']} - Social",
            'daily_budget': segment_metrics['recommended_budget'] * 0.3,
            'targeting': {
                'custom_audience': segment_key,
                'lookalike_percentage': 2,  # 2% lookalike
                'interests': ['Health Insurance', 'Expat Life'],
                'age_range': [25, 65]
            },
            'ads': await self._generate_social_ads(segment_config)
        })
        
        return campaigns
```

### **STEP 4: Enhanced AI Commands for Phase C**

**Add to LLM Service**:

```python
# Add to backend/services/llm.py

async def _cmd_build_campaign(self, brief: str, budget: float = 1000.0) -> Dict[str, Any]:
    """Build complete multi-platform campaign from brief"""
    system_prompt = """You are a Swiss health insurance marketing expert creating comprehensive ad campaigns.
    
    Create campaigns that:
    - Target Swiss residents and expats effectively
    - Comply with Swiss advertising regulations
    - Include geo-targeting for major Swiss cities
    - Use compelling, trustworthy messaging
    - Consider seasonal factors (insurance deadlines)
    - Generate A/B test variations
    """
    
    user_prompt = f"""
    Create a complete advertising campaign for: {brief}
    Budget: CHF {budget} (daily)
    
    Include:
    1. Campaign strategy and positioning
    2. Target audience definitions
    3. Platform-specific ad variations (Google, Facebook, LinkedIn)
    4. Budget allocation recommendations
    5. Success metrics and KPIs
    6. Swiss market specific considerations
    
    Generate everything needed for immediate deployment across platforms.
    """
    
    messages = [{"role": "user", "content": user_prompt}]
    response = await self.chat_completion(messages, system_prompt, use_tools=True)
    
    # Create approval item for the campaign
    approval_payload = {
        'campaign_brief': brief,
        'recommended_budget': budget,
        'ai_generated_strategy': response['text'],
        'platforms': ['google_ads', 'meta', 'linkedin'],
        'requires_creative_assets': True
    }
    
    # Create approval item
    approval_response = await self._create_approval_item(
        'multi_platform_campaign',
        f"AI Campaign: {brief}",
        f"Complete multi-platform campaign for {brief} with CHF {budget} daily budget",
        approval_payload
    )
    
    return {
        'command': 'build_campaign',
        'brief': brief,
        'budget': budget,
        'strategy': response,
        'approval_id': approval_response.get('approval_id'),
        'next_steps': 'Review in approval queue and approve to create campaign drafts',
        'created_at': datetime.now().isoformat()
    }

async def _cmd_analyze_segments(self, days: int = 30) -> Dict[str, Any]:
    """Analyze all retargeting segments and recommend campaigns"""
    system_prompt = """You are analyzing user behavior segments for retargeting campaign opportunities."""
    
    user_prompt = f"""
    Analyze our retargeting segments from the last {days} days and provide:
    
    1. Segment performance ranking by conversion potential
    2. Budget allocation recommendations across segments
    3. Messaging strategies for each high-value segment
    4. Cross-platform campaign opportunities
    5. Seasonal timing considerations
    
    Focus on segments with highest ROI potential for Swiss health insurance market.
    """
    
    messages = [{"role": "user", "content": user_prompt}]
    response = await self.chat_completion(messages, system_prompt, use_tools=True)
    
    return {
        'command': 'analyze_segments',
        'period_days': days,
        'analysis': response,
        'created_at': datetime.now().isoformat()
    }
```

### **STEP 5: Enhanced Admin Interface**

**Update Admin Dashboard for Phase C**:

```html
<!-- Add to templates/admin_ai.html -->

<!-- Phase C Campaign Builder Tab -->
<div id="campaigns-tab" class="tab-content">
    <div class="card">
        <h2>🚀 AI Campaign Builder</h2>
        
        <!-- Campaign Brief Input -->
        <div style="margin-bottom: 20px;">
            <label for="campaign-brief" style="display: block; margin-bottom: 5px; font-weight: 500;">Campaign Brief:</label>
            <textarea id="campaign-brief" 
                     placeholder="E.g., Target expats in Zurich who are comparing health insurance options for 2026..."
                     style="width: 100%; height: 100px; padding: 10px; border: 1px solid #ddd; border-radius: 6px;"></textarea>
        </div>
        
        <!-- Budget Input -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <div>
                <label for="daily-budget" style="display: block; margin-bottom: 5px; font-weight: 500;">Daily Budget (CHF):</label>
                <input type="number" id="daily-budget" value="500" min="50" max="5000" 
                       style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
            </div>
            <div>
                <label for="platform-selection" style="display: block; margin-bottom: 5px; font-weight: 500;">Platforms:</label>
                <div style="display: flex; gap: 10px; align-items: center; padding-top: 5px;">
                    <label><input type="checkbox" checked> Google Ads</label>
                    <label><input type="checkbox" checked> Meta</label>
                    <label><input type="checkbox"> LinkedIn</label>
                </div>
            </div>
        </div>
        
        <!-- Quick Campaign Templates -->
        <div style="margin-bottom: 20px;">
            <strong>🎯 Quick Templates:</strong>
            <div style="display: flex; gap: 10px; margin-top: 8px; flex-wrap: wrap;">
                <button class="chip" onclick="loadCampaignTemplate('quote_abandonment')">Quote Abandonment</button>
                <button class="chip" onclick="loadCampaignTemplate('consultation_followup')">Consultation Follow-up</button>
                <button class="chip" onclick="loadCampaignTemplate('seasonal_deadline')">Insurance Deadline</button>
                <button class="chip" onclick="loadCampaignTemplate('new_expat')">New Expat Welcome</button>
            </div>
        </div>
        
        <!-- Generate Campaign Button -->
        <button onclick="generateCampaign()" 
                style="background: #667eea; color: white; border: none; padding: 12px 30px; border-radius: 8px; font-weight: 500; cursor: pointer; width: 100%;">
            🤖 Generate Multi-Platform Campaign
        </button>
        
        <!-- Campaign Preview Area -->
        <div id="campaign-preview" style="margin-top: 30px; display: none;">
            <h3>📋 Campaign Preview</h3>
            <div id="campaign-details"></div>
        </div>
    </div>
    
    <!-- Active Campaigns Overview -->
    <div class="card" style="margin-top: 30px;">
        <h2>📊 Campaign Performance</h2>
        <div id="campaign-performance" class="loading">Loading campaign data...</div>
    </div>
</div>

<!-- Retargeting Segments Tab -->  
<div id="segments-tab" class="tab-content">
    <div class="card">
        <h2>🎯 Retargeting Segments</h2>
        <p style="color: #666; margin-bottom: 20px;">
            AI-powered audience segments based on user behavior for targeted campaigns.
        </p>
        
        <div id="segments-list" class="loading">Loading segments...</div>
        
        <!-- Segment Builder -->
        <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <h3>🛠️ Custom Segment Builder</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                    <label>Behavior Conditions:</label>
                    <select style="width: 100%; padding: 8px; border-radius: 4px; margin-top: 5px;">
                        <option>Visited quote page</option>
                        <option>Downloaded guide</option>
                        <option>Booked consultation</option>
                        <option>Homepage visitors</option>
                    </select>
                </div>
                <div>
                    <label>Timeframe (days):</label>
                    <input type="number" value="7" min="1" max="90" 
                           style="width: 100%; padding: 8px; border-radius: 4px; margin-top: 5px;">
                </div>
            </div>
            <button onclick="buildCustomSegment()" 
                    style="margin-top: 15px; background: #48bb78; color: white; border: none; padding: 8px 16px; border-radius: 4px;">
                Build Segment
            </button>
        </div>
    </div>
</div>

<script>
// Phase C JavaScript functions
function loadCampaignTemplate(templateType) {
    const templates = {
        'quote_abandonment': {
            brief: "Retarget users who started health insurance quotes but didn't complete them. Focus on completion urgency and simplified process.",
            budget: 300
        },
        'consultation_followup': {
            brief: "Re-engage users who booked consultations but didn't attend. Offer rescheduling and emphasize personalized advice value.",
            budget: 200
        },
        'seasonal_deadline': {
            brief: "Target users during insurance change period (Oct-Dec) with deadline urgency messaging for 2026 policies.",
            budget: 800
        },
        'new_expat': {
            brief: "Welcome campaign for new expats in Switzerland, introducing health insurance requirements and our services.",
            budget: 400
        }
    };
    
    const template = templates[templateType];
    if (template) {
        document.getElementById('campaign-brief').value = template.brief;
        document.getElementById('daily-budget').value = template.budget;
    }
}

async function generateCampaign() {
    const brief = document.getElementById('campaign-brief').value.trim();
    const budget = document.getElementById('daily-budget').value;
    
    if (!brief) {
        alert('Please enter a campaign brief');
        return;
    }
    
    // Show loading state
    const button = event.target;
    button.disabled = true;
    button.innerHTML = '🤖 Generating Campaign...';
    
    try {
        const response = await fetch('/tools/builtin_command', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa('admin:phase_a_2025')
            },
            body: JSON.stringify({
                command: 'build_campaign',
                args: { brief: brief, budget: parseFloat(budget) }
            })
        });
        
        const result = await response.json();
        
        // Show campaign preview
        document.getElementById('campaign-preview').style.display = 'block';
        document.getElementById('campaign-details').innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0;">
                <h4>✅ Campaign Generated Successfully!</h4>
                <p><strong>Approval ID:</strong> ${result.approval_id}</p>
                <p><strong>Budget:</strong> CHF ${budget}/day</p>
                <div style="margin-top: 15px;">
                    <strong>AI Strategy Preview:</strong>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-top: 10px; max-height: 200px; overflow-y: auto;">
                        ${result.strategy?.text || 'Strategy generated - check approval queue for details'}
                    </div>
                </div>
                <div style="margin-top: 15px;">
                    <a href="#" onclick="showTab('approvals')" style="background: #667eea; color: white; padding: 8px 16px; border-radius: 4px; text-decoration: none;">
                        Review in Approval Queue →
                    </a>
                </div>
            </div>
        `;
        
    } catch (error) {
        alert('Error generating campaign: ' + error.message);
    } finally {
        button.disabled = false;
        button.innerHTML = '🤖 Generate Multi-Platform Campaign';
    }
}

async function loadSegments() {
    try {
        // This would load actual retargeting segments
        const mockSegments = [
            { name: 'Quote Started - No Submit (7d)', size: 342, conversion_potential: 'High', budget_rec: 'CHF 150/day' },
            { name: 'Consultation Booked - No Show', size: 89, conversion_potential: 'Very High', budget_rec: 'CHF 80/day' },
            { name: 'Guide Readers - Ready to Convert', size: 156, conversion_potential: 'Medium', budget_rec: 'CHF 120/day' },
            { name: 'Homepage Visitors - No Engagement', size: 1247, conversion_potential: 'Low', budget_rec: 'CHF 200/day' }
        ];
        
        let html = '';
        mockSegments.forEach(segment => {
            html += `
                <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: between; align-items: center;">
                        <div style="flex: 1;">
                            <strong>${segment.name}</strong><br>
                            <small style="color: #666;">Audience Size: ${segment.size} | Potential: ${segment.conversion_potential}</small>
                        </div>
                        <div style="text-align: right;">
                            <div style="margin-bottom: 5px;">${segment.budget_rec}</div>
                            <button onclick="createSegmentCampaign('${segment.name}')" 
                                    style="background: #48bb78; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                                Create Campaign
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        document.getElementById('segments-list').innerHTML = html;
        
    } catch (error) {
        document.getElementById('segments-list').innerHTML = '<div class="error">Error loading segments: ' + error.message + '</div>';
    }
}

// Load segments when tab is shown
function showTab(tabName) {
    // ... existing showTab code ...
    if (tabName === 'segments') loadSegments();
}
</script>
```

---

## 🚀 **DEPLOYMENT TIMELINE**

### **Week 1: Core Infrastructure**
- **Day 1-2**: Database schema migration and API endpoint creation
- **Day 3-4**: Google Ads and Meta connectors (draft mode)
- **Day 5-7**: Retargeting engine and segment builder

### **Week 2: AI Integration & UI** 
- **Day 1-3**: Enhanced AI commands and campaign builder
- **Day 4-5**: Admin interface updates and approval workflow
- **Day 6-7**: Testing, debugging, and documentation

### **Phase C Go-Live**: Day 14
- **Full campaign creation capability**
- **Multi-platform ad drafting**
- **Smart retargeting segments**
- **Complete human oversight**

---

## ✅ **SUCCESS CRITERIA**

1. **AI can create complete campaign drafts** across Google Ads, Meta, and LinkedIn
2. **Retargeting segments automatically build** based on user behavior  
3. **All campaigns require human approval** before going live
4. **Budget allocation optimizes** based on performance data
5. **Swiss market targeting** works correctly across all platforms
6. **Admin interface provides** full campaign management capability

---

**🎯 Phase C will transform your AI assistant into a complete campaign creation machine while maintaining full human control and Swiss market expertise!**

*Ready to start Phase C implementation?*

