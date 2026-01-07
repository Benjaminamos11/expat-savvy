# 🎯 Retargeting Strategy Plan for Expat Savvy

## 📊 Current Tracking Infrastructure Analysis

### ✅ **What's Already Implemented:**

#### 1. **Plausible Analytics** (Privacy-First)
- **Status**: ✅ Fully implemented
- **Events Tracked**:
  - `quote_flow_started` - User begins quote process
  - `quote_submitted` - Quote form submission
  - `lead_created` - Main conversion event
  - `consultation_started` - Consultation modal opened
  - `consultation_booked` - Cal.com booking completed
  - `cta_clicked` - CTA button interactions
  - `form_interaction` - Form field interactions

#### 2. **Meta Pixel (Facebook)**
- **Status**: ✅ Partially implemented
- **Pixel ID**: `1559068011804417`
- **Current Events**: Only `PageView`
- **Issues**: 
  - Not integrated with forms/leads
  - No custom events for retargeting
  - Component exists but not used in layouts

#### 3. **Google Tag Manager Setup**
- **Status**: ✅ Infrastructure ready
- **Consent Management**: ✅ GDPR-compliant consent mode v2
- **Current Issue**: No GTM container ID implemented

#### 4. **LinkedIn Tracking**
- **Status**: ❌ Not implemented
- **Only**: Social sharing links present

#### 5. **Google Analytics**
- **Status**: ❌ Not implemented
- **Only**: 404 error tracking references exist

---

## 🎯 Retargeting Strategy by Platform

### 1. **LINKEDIN RETARGETING** (Priority 1)

#### **Why LinkedIn First:**
- B2B focus matches your expat/insurance audience
- Higher conversion rates for professional services
- Better audience quality for insurance leads
- Lower competition compared to Facebook

#### **LinkedIn Campaign Manager Setup:**
1. **Create LinkedIn Insight Tag**
   - Generate pixel code from LinkedIn Campaign Manager
   - Install on all pages (similar to Meta Pixel)

2. **Audience Segments to Create:**
   ```
   🎯 Website Visitors (30 days)
   ├── All page visitors
   ├── Blog readers (insurance content)
   ├── Provider page visitors
   └── Guide page visitors

   🎯 Engagement Audiences
   ├── Quote flow starters (didn't complete)
   ├── Form abandoners (started, didn't submit)
   ├── Consultation modal opens (didn't book)
   └── CTA clickers (didn't convert)

   🎯 High-Intent Audiences
   ├── Completed quote forms
   ├── Viewed pricing pages
   ├── Spent 2+ minutes on site
   └── Visited multiple insurance pages
   ```

3. **Campaign Types:**
   - **Sponsored Content**: Blog articles, guides
   - **Message Ads**: Direct outreach to high-intent users
   - **Dynamic Ads**: Personalized based on viewed content
   - **Video Ads**: Explainer content, testimonials

4. **Content Strategy:**
   - Case studies from expats
   - Insurance comparison guides
   - Swiss insurance requirements
   - Cost-saving tips

#### **LinkedIn Events to Track:**
```javascript
// Add to plausible-tracking.js
window.trackLinkedInEvent = function(eventName, params = {}) {
  if (window.lintrk) {
    window.lintrk('track', eventName, params);
  }
};

// Track key events
- PageView
- QuoteStarted
- QuoteCompleted
- ConsultationBooked
- ContentEngagement
```

### 2. **FACEBOOK RETARGETING** (Priority 2)

#### **Current Issues to Fix:**
1. **Meta Pixel Not Integrated**: Component exists but not used
2. **No Custom Events**: Only PageView tracking
3. **No Conversion API**: Missing server-side tracking

#### **Facebook Campaign Manager Setup:**
1. **Fix Meta Pixel Integration**
   - Add MetaPixel component to all layouts
   - Implement custom events for retargeting

2. **Audience Segments:**
   ```
   🎯 Website Visitors
   ├── All visitors (30 days)
   ├── Insurance page visitors
   ├── Blog readers
   └── Provider comparison visitors

   🎯 Engagement Audiences
   ├── Quote form starters
   ├── Form abandoners
   ├── Consultation modal opens
   └── Email subscribers (if available)

   🎯 Lookalike Audiences
   ├── Based on consultation bookings
   ├── Based on quote completions
   └── Based on high-value visitors
   ```

3. **Campaign Types:**
   - **Traffic Campaigns**: Drive back to specific pages
   - **Conversion Campaigns**: Book consultations
   - **Lead Generation**: Direct form fills
   - **Video Views**: Educational content

#### **Facebook Events to Implement:**
```javascript
// Add to plausible-tracking.js
window.trackFacebookEvent = function(eventName, params = {}) {
  if (window.fbq) {
    window.fbq('track', eventName, params);
  }
};

// Key events for retargeting
- ViewContent
- InitiateCheckout (quote started)
- Lead (quote completed)
- Schedule (consultation booked)
- Subscribe (email signup)
```

### 3. **GOOGLE RETARGETING** (Priority 3)

#### **Google Ads Setup:**
1. **Google Analytics 4 Implementation**
   - Replace Plausible or run alongside
   - Enhanced ecommerce tracking
   - Custom conversion goals

2. **Google Ads Conversion Tracking**
   - Import GA4 conversions
   - Manual conversion actions
   - Call tracking integration

3. **Audience Segments:**
   ```
   🎯 Remarketing Lists
   ├── All website visitors
   ├── Insurance page visitors
   ├── Quote form abandoners
   └── Consultation page visitors

   🎯 Custom Audiences
   ├── High-intent users (3+ pages)
   ├── Returning visitors
   ├── Mobile vs desktop users
   └── Geographic segments (by canton)
   ```

4. **Campaign Types:**
   - **Search Remarketing**: Target users searching insurance
   - **Display Remarketing**: Banner ads across Google network
   - **YouTube Ads**: Educational video content
   - **Shopping Campaigns**: If you add insurance "products"

---

## 📈 Implementation Roadmap

### **Phase 1: LinkedIn Setup (Week 1-2)**
1. **LinkedIn Campaign Manager Account**
   - Create business account
   - Generate Insight Tag
   - Set up conversion tracking

2. **Technical Implementation**
   - Add LinkedIn pixel to all pages
   - Implement event tracking
   - Create custom audiences

3. **Content Creation**
   - LinkedIn-optimized content
   - Professional case studies
   - Insurance comparison guides

4. **Campaign Launch**
   - Start with website visitors audience
   - Test different ad formats
   - Optimize based on performance

### **Phase 2: Facebook Enhancement (Week 3-4)**
1. **Fix Meta Pixel Integration**
   - Add component to layouts
   - Implement custom events
   - Set up conversion tracking

2. **Audience Building**
   - Create retargeting audiences
   - Build lookalike audiences
   - Segment by behavior

3. **Campaign Testing**
   - Test different creative formats
   - A/B test audiences
   - Optimize for conversions

### **Phase 3: Google Integration (Week 5-6)**
1. **Google Analytics 4 Setup**
   - Implement GA4 tracking
   - Set up enhanced ecommerce
   - Create conversion goals

2. **Google Ads Integration**
   - Link GA4 to Google Ads
   - Import conversions
   - Set up remarketing campaigns

3. **Advanced Features**
   - Call tracking
   - Offline conversion tracking
   - Smart bidding strategies

---

## 🛠 Technical Implementation Plan

### **1. Enhanced Tracking System**

#### **Create Unified Tracking Component:**
```astro
// src/components/tracking/UnifiedTracker.astro
---
// LinkedIn Insight Tag
const linkedinPixelId = 'YOUR_PIXEL_ID';
// Meta Pixel (already exists)
const metaPixelId = '1559068011804417';
// Google Analytics 4
const ga4Id = 'G-XXXXXXXXXX';
---

<script>
  // LinkedIn Insight Tag
  window.lintrk = window.lintrk || function(){(window.lintrk.q=window.lintrk.q||[]).push(arguments)};
  window.lintrk('init', linkedinPixelId);
  window.lintrk('track', 'PageView');

  // Enhanced event tracking
  window.trackRetargetingEvent = function(platform, eventName, params = {}) {
    // LinkedIn
    if (platform === 'linkedin' && window.lintrk) {
      window.lintrk('track', eventName, params);
    }
    
    // Facebook
    if (platform === 'facebook' && window.fbq) {
      window.fbq('track', eventName, params);
    }
    
    // Google Analytics
    if (platform === 'google' && window.gtag) {
      window.gtag('event', eventName, params);
    }
    
    // Plausible (existing)
    if (window.plausible) {
      window.plausible(eventName, { props: params });
    }
  };
</script>
```

#### **Enhanced Plausible Tracking:**
```javascript
// Add to plausible-tracking.js
// Multi-platform event tracking
function trackMultiPlatform(eventName, params = {}) {
  // Existing Plausible tracking
  sendPlausibleEvent(eventName, params);
  
  // LinkedIn tracking
  if (window.lintrk) {
    window.lintrk('track', eventName, params);
  }
  
  // Facebook tracking
  if (window.fbq) {
    window.fbq('track', eventName, params);
  }
  
  // Google Analytics tracking
  if (window.gtag) {
    window.gtag('event', eventName, params);
  }
}

// Update existing functions to use multi-platform tracking
window.trackLeadCreation = function(props = {}) {
  trackMultiPlatform('lead_created', props);
};
```

### **2. Audience Segmentation Strategy**

#### **High-Value Audience Signals:**
```javascript
// Enhanced audience tracking
window.trackAudienceSignals = function() {
  const signals = {
    // Page engagement
    pagesViewed: sessionStorage.getItem('pagesViewed') || 0,
    timeOnSite: Date.now() - parseInt(sessionStorage.getItem('sessionStart')),
    
    // Form interactions
    quoteStarted: sessionStorage.getItem('quoteStarted') === 'true',
    consultationOpened: sessionStorage.getItem('consultationOpened') === 'true',
    
    // Content preferences
    insuranceType: sessionStorage.getItem('insuranceInterest'),
    providerInterest: sessionStorage.getItem('providerInterest'),
    
    // Geographic data
    canton: sessionStorage.getItem('canton'),
    language: navigator.language
  };
  
  // Send to all platforms
  trackMultiPlatform('audience_signals', signals);
};
```

### **3. Conversion Optimization**

#### **Enhanced Form Tracking:**
```javascript
// Track form abandonment with detailed data
window.trackFormAbandonment = function(formType, step, data = {}) {
  const abandonmentData = {
    form_type: formType,
    abandonment_step: step,
    form_data: data,
    timestamp: new Date().toISOString(),
    page_url: window.location.href
  };
  
  trackMultiPlatform('form_abandonment', abandonmentData);
  
  // Store for retargeting
  sessionStorage.setItem('formAbandonment', JSON.stringify(abandonmentData));
};
```

---

## 📊 Analytics & Measurement Plan

### **Key Metrics to Track:**

#### **1. Audience Quality Metrics:**
- **Audience Size**: Number of users in each segment
- **Engagement Rate**: Clicks, views, interactions
- **Conversion Rate**: Quote completions, consultations booked
- **Cost Per Acquisition**: Cost to acquire a lead
- **Return on Ad Spend (ROAS)**: Revenue generated per ad spend

#### **2. Platform Performance:**
- **LinkedIn**: Professional audience engagement
- **Facebook**: Broad reach and engagement
- **Google**: Search intent and conversion

#### **3. Funnel Analysis:**
- **Top of Funnel**: Website visitors, page views
- **Middle of Funnel**: Quote starters, form interactions
- **Bottom of Funnel**: Quote completions, consultations booked

### **Reporting Dashboard:**
```javascript
// Create unified reporting
window.generateRetargetingReport = function() {
  return {
    platform: {
      linkedin: {
        audiences: window.linkedinAudiences,
        conversions: window.linkedinConversions,
        spend: window.linkedinSpend
      },
      facebook: {
        audiences: window.facebookAudiences,
        conversions: window.facebookConversions,
        spend: window.facebookSpend
      },
      google: {
        audiences: window.googleAudiences,
        conversions: window.googleConversions,
        spend: window.googleSpend
      }
    },
    overall: {
      totalSpend: window.totalRetargetingSpend,
      totalConversions: window.totalRetargetingConversions,
      roas: window.totalROAS
    }
  };
};
```

---

## 💰 Budget Allocation Recommendations

### **Monthly Retargeting Budget:**
- **LinkedIn**: 60% (CHF 1,200/month)
- **Facebook**: 30% (CHF 600/month)
- **Google**: 10% (CHF 200/month)
- **Total**: CHF 2,000/month

### **Budget by Campaign Type:**
- **Traffic/Remarketing**: 40%
- **Conversion Campaigns**: 35%
- **Lookalike Audiences**: 25%

---

## 🚀 Next Steps & Implementation Order

### **Week 1: LinkedIn Foundation**
1. Set up LinkedIn Campaign Manager
2. Generate Insight Tag
3. Implement basic pixel tracking
4. Create first audience segment

### **Week 2: LinkedIn Campaigns**
1. Launch first retargeting campaign
2. Create content for LinkedIn
3. Test different ad formats
4. Monitor and optimize

### **Week 3: Facebook Enhancement**
1. Fix Meta Pixel integration
2. Implement custom events
3. Create retargeting audiences
4. Launch Facebook campaigns

### **Week 4: Google Integration**
1. Set up Google Analytics 4
2. Implement conversion tracking
3. Create Google Ads campaigns
4. Set up remarketing lists

### **Week 5-6: Optimization**
1. Analyze performance across platforms
2. Optimize audiences and creative
3. Scale successful campaigns
4. Implement advanced tracking features

---

## ⚠️ Important Considerations

### **Privacy & Compliance:**
- ✅ GDPR consent management already implemented
- ✅ Privacy-first analytics with Plausible
- ⚠️ Need to update privacy policy for retargeting
- ⚠️ Consider data retention policies

### **Technical Considerations:**
- Server-side tracking for iOS 14.5+ compatibility
- Cross-domain tracking for subdomains
- Mobile app tracking (if applicable)
- Attribution modeling for multi-touch journeys

### **Business Considerations:**
- Lead quality vs. quantity balance
- Cost per acquisition targets
- Seasonal insurance demand patterns
- Competition analysis and positioning

---

**This plan provides a comprehensive roadmap for implementing retargeting across LinkedIn, Facebook, and Google while leveraging your existing tracking infrastructure and maintaining privacy compliance.**
