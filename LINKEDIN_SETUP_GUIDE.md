# 🔗 LinkedIn Retargeting Setup Guide

## ✅ **Technical Implementation Complete!**

I've successfully implemented the LinkedIn Insight Tag and enhanced your tracking system. Here's what's been done:

### **1. LinkedIn Insight Tag Installed**
- ✅ Added to `src/layouts/BaseLayout.astro`
- ✅ Partner ID: `8084162` configured
- ✅ Page view tracking enabled
- ✅ Noscript fallback included

### **2. Enhanced Tracking System**
- ✅ Multi-platform event tracking (Plausible + LinkedIn + Facebook)
- ✅ LinkedIn-specific conversion events
- ✅ Facebook Pixel integration restored
- ✅ Event value tracking for ROI measurement

### **3. LinkedIn Events Configured**
```javascript
// Key events now tracked:
- PageView (automatic)
- QuoteStarted (value: 1 CHF)
- QuoteCompleted (value: 50 CHF)
- LeadCreated (value: 200 CHF)
- ConsultationBooked (value: 300 CHF)
```

---

## 🎯 **Next Steps in LinkedIn Campaign Manager**

### **Step 1: Verify Insight Tag Installation**
1. **Go to**: [linkedin.com/campaignmanager](https://linkedin.com/campaignmanager)
2. **Navigate to**: "Account Assets" → "Insight Tag"
3. **Check**: "Install the Insight Tag yourself"
4. **Verify**: Your website should show "Active" status
5. **Test**: Visit your website and check if LinkedIn shows traffic

### **Step 2: Set Up Conversion Tracking**
1. **Go to**: "Account Assets" → "Conversions"
2. **Click**: "Create Conversion"
3. **Set up these conversions**:

#### **Primary Conversions:**
```
Conversion Name: Quote Completed
Conversion Type: Website
Event: QuoteCompleted
Value: 50 CHF
Attribution Window: 30 days
```

```
Conversion Name: Lead Created
Conversion Type: Website  
Event: LeadCreated
Value: 200 CHF
Attribution Window: 30 days
```

```
Conversion Name: Consultation Booked
Conversion Type: Website
Event: ConsultationBooked
Value: 300 CHF
Attribution Window: 30 days
```

#### **Secondary Conversions:**
```
Conversion Name: Quote Started
Conversion Type: Website
Event: QuoteStarted
Value: 1 CHF
Attribution Window: 7 days
```

### **Step 3: Create Retargeting Audiences**

#### **Website Visitors (30 days)**
1. **Go to**: "Account Assets" → "Audience Manager"
2. **Click**: "Create Audience"
3. **Select**: "Website Visitors"
4. **Name**: "All Website Visitors"
5. **Duration**: 30 days
6. **Rules**: All visitors to expat-savvy.ch

#### **High-Intent Visitors**
1. **Create**: "Insurance Page Visitors"
2. **Rules**: 
   - Visited pages containing "insurance"
   - OR visited pages containing "health"
   - Duration: 30 days

3. **Create**: "Quote Form Starters"
4. **Rules**:
   - Triggered event: "QuoteStarted"
   - Duration: 30 days

5. **Create**: "Consultation Interest"
6. **Rules**:
   - Triggered event: "ConsultationStarted"
   - Duration: 14 days

### **Step 4: Launch Your First Campaign**

#### **Campaign Setup:**
1. **Go to**: "Campaign Manager"
2. **Click**: "Create Campaign"
3. **Objective**: "Website Visits" or "Lead Generation"

#### **Audience Targeting:**
- **Primary**: "All Website Visitors" (30 days)
- **Exclude**: Recent converters (if you have that data)
- **Location**: Switzerland + neighboring countries
- **Demographics**: 
  - Age: 25-65
  - Job titles: Manager, Director, Executive, Specialist
  - Industries: Technology, Finance, Consulting, Healthcare

#### **Budget & Bidding:**
- **Daily Budget**: Start with CHF 50-100
- **Bid Strategy**: "Cost per Click" (CPC)
- **Max CPC**: CHF 2-5 (adjust based on performance)

#### **Ad Creative:**
- **Format**: Sponsored Content
- **Headline**: "Swiss Insurance Made Simple for Expats"
- **Description**: "Get personalized quotes from top Swiss insurers. Free consultation with expat insurance experts."
- **Call-to-Action**: "Learn More" or "Get Quote"
- **Landing Page**: Your homepage or quote form

### **Step 5: Content Strategy**

#### **Create LinkedIn-Optimized Content:**

1. **Educational Articles:**
   - "5 Swiss Insurance Mistakes Expats Make"
   - "HMO vs Standard Model: What Expats Need to Know"
   - "Swiss Insurance Costs by Canton: 2025 Guide"

2. **Case Studies:**
   - "How Sarah Saved 40% on Swiss Insurance"
   - "From Confused to Confident: Mark's Insurance Journey"
   - "Why 500+ Expats Choose Our Service"

3. **Comparison Content:**
   - "Assura vs Sanitas: Which is Better for Expats?"
   - "Swiss Insurance Providers Compared"
   - "Best Insurance for Expats in Zurich vs Geneva"

### **Step 6: Campaign Optimization**

#### **Week 1-2: Initial Testing**
- Test different audiences
- Test different ad creatives
- Monitor click-through rates (CTR)
- Track conversion rates

#### **Week 3-4: Optimization**
- Scale successful audiences
- Pause underperforming ads
- Adjust bidding strategy
- A/B test landing pages

#### **Key Metrics to Monitor:**
- **Click-Through Rate (CTR)**: Aim for >0.5%
- **Cost Per Click (CPC)**: Target <CHF 5
- **Conversion Rate**: Aim for >2%
- **Cost Per Lead (CPL)**: Target <CHF 50
- **Return on Ad Spend (ROAS)**: Target >3:1

---

## 📊 **LinkedIn Campaign Manager Dashboard**

### **Set Up Your Dashboard:**
1. **Go to**: "Campaign Manager" → "Reporting"
2. **Create Custom Report** with these metrics:
   - Impressions
   - Clicks
   - CTR
   - CPC
   - Conversions
   - Cost per Conversion
   - Conversion Rate

### **Audience Insights:**
1. **Go to**: "Audience Manager"
2. **Click on each audience** to see:
   - Audience size
   - Growth rate
   - Demographics
   - Engagement metrics

---

## 🚀 **Advanced Features to Implement Later**

### **1. Dynamic Ads**
- Personalized ads based on viewed content
- Product recommendations
- Location-based offers

### **2. Message Ads**
- Direct outreach to high-intent users
- Personalized insurance offers
- Consultation invitations

### **3. Video Ads**
- Explainer videos about Swiss insurance
- Testimonial videos from expats
- Educational content

### **4. Lookalike Audiences**
- Based on your best customers
- Based on consultation bookers
- Based on quote completers

---

## ⚠️ **Important Notes**

### **Privacy & Compliance:**
- ✅ GDPR consent management already implemented
- ✅ Privacy-first analytics maintained
- ⚠️ Update privacy policy to mention LinkedIn retargeting
- ⚠️ Consider data retention policies

### **Technical Considerations:**
- LinkedIn Insight Tag loads asynchronously
- Events are queued if LinkedIn isn't loaded yet
- Multi-platform tracking ensures no data loss
- Server-side tracking recommended for iOS 14.5+

### **Budget Recommendations:**
- **Start Small**: CHF 50-100/day
- **Scale Gradually**: Increase by 20% weekly if profitable
- **Monitor ROI**: Target 3:1 return on ad spend
- **Test Continuously**: Always test new audiences and creatives

---

## 🎯 **Success Metrics & KPIs**

### **Week 1 Goals:**
- [ ] Insight Tag verified and active
- [ ] First audience created (500+ members)
- [ ] First campaign launched
- [ ] Initial traffic and engagement data

### **Week 2 Goals:**
- [ ] 1000+ website visitors in audience
- [ ] CTR >0.5%
- [ ] First conversions tracked
- [ ] Budget optimization started

### **Month 1 Goals:**
- [ ] 5+ conversion events per week
- [ ] CPL <CHF 50
- [ ] ROAS >2:1
- [ ] 3+ active audiences
- [ ] A/B testing implemented

---

## 📞 **Support & Troubleshooting**

### **Common Issues:**
1. **Insight Tag Not Working**: Check browser console for errors
2. **No Conversions**: Verify event names match exactly
3. **High CPC**: Refine audience targeting
4. **Low CTR**: Test different ad creatives

### **LinkedIn Support:**
- **Help Center**: [linkedin.com/help/linkedin](https://linkedin.com/help/linkedin)
- **Campaign Manager Help**: [linkedin.com/help/campaign-manager](https://linkedin.com/help/campaign-manager)
- **Community**: LinkedIn Marketing Solutions Community

---

**Your LinkedIn retargeting system is now technically ready! The next step is to verify the Insight Tag in LinkedIn Campaign Manager and start creating your first audiences and campaigns.**
