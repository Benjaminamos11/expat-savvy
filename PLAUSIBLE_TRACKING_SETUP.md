# 🎯 Comprehensive Plausible Analytics Setup Guide

## Overview
This guide sets up comprehensive tracking for full optimization insights on expat-savvy.ch.

## 🚀 What's Already Implemented

### 1. Enhanced Tracking Script (`/scripts/enhanced-plausible-tracking.js`)
- **Outgoing Link Tracking**: All external clicks with domain, text, and context
- **Modal Interaction Tracking**: Open, close, step progression, form submissions
- **Cal.com Booking Tracking**: Clicks and completion tracking
- **User Intent Tracking**: NEW vs SWITCHING expat identification
- **Form Interaction Tracking**: Field focus, submissions, completion rates
- **Page Interaction Tracking**: Scroll depth, time on page, CTA clicks

### 2. Modal System Integration
- All modals now track: type, intent, source, step progression
- Form submissions tracked with user data structure
- Cal.com interactions tracked with user context

## 📊 Plausible Goals to Set Up

### Core Conversion Goals (Already Working)
- ✅ `lead_created` - When someone submits a form
- ✅ `consultation_started` - When modal opens
- ✅ `quote_flow_started` - When user starts any flow
- ✅ `consultation_booked` - When Cal.com booking completes
- ✅ `quote_submitted` - When self-service form submitted

### New Detailed Goals to Add

#### 1. Modal Interaction Goals
```
Goal Name: modal_opened
Event: modal_opened
Properties: modal_type, page_location, user_intent, source

Goal Name: modal_step_completed
Event: modal_step
Properties: modal_type, step_number, step_name, user_intent

Goal Name: modal_form_submitted
Event: modal_form_submitted
Properties: modal_type, form_type, fields_completed, user_intent
```

#### 2. User Intent Goals
```
Goal Name: intent_new_expat
Event: intent_new_expat
Properties: page_location, source

Goal Name: intent_switching_insurance
Event: intent_switching_insurance
Properties: page_location, source

Goal Name: intent_relocation
Event: intent_relocation
Properties: page_location, source
```

#### 3. Cal.com Tracking Goals
```
Goal Name: cal_com_calendar_loaded
Event: cal_com_click
Properties: modal_type, user_intent, form_data

Goal Name: consultation_booking_completed
Event: consultation_booked
Properties: booking_id, attendee_email, modal_type, user_intent
```

#### 4. Outgoing Link Goals
```
Goal Name: external_link_click
Event: outgoing_link_click
Properties: link_domain, link_text, page_location

Goal Name: calendar_link_click
Event: calendar_link_click
Properties: calendar_url, page_location

Goal Name: contact_link_click
Event: email_link_click OR phone_link_click OR whatsapp_link_click
Properties: contact_type, page_location
```

#### 5. Engagement Goals
```
Goal Name: cta_button_clicked
Event: cta_clicked
Properties: cta_text, cta_id, page_location

Goal Name: form_field_interaction
Event: form_field_focus
Properties: field_name, form_id, page_location

Goal Name: scroll_depth_reached
Event: scroll_depth
Properties: scroll_percent, page_location
```

## 🔧 How to Set Up Goals in Plausible

### Step 1: Access Plausible Dashboard
1. Go to your Plausible dashboard
2. Select your site (expat-savvy.ch)
3. Click on "Goals" in the left sidebar

### Step 2: Add Custom Event Goals
For each goal above:
1. Click "Add Goal"
2. Choose "Custom Event"
3. Enter the event name (e.g., `modal_opened`)
4. Set conversion window (recommend 30 days)
5. Add description (e.g., "Modal opened with context")

### Step 3: Set Up Funnels (Optional but Recommended)
Create conversion funnels to track user journeys:

#### Funnel 1: Modal to Booking
```
Step 1: consultation_started
Step 2: modal_step (step 4 = calendar)
Step 3: consultation_booked
```

#### Funnel 2: Page to Lead
```
Step 1: page_view
Step 2: modal_opened
Step 3: lead_created
```

#### Funnel 3: Intent to Action
```
Step 1: intent_new_expat OR intent_switching_insurance
Step 2: modal_opened
Step 3: consultation_booked
```

## 📈 Key Metrics to Monitor

### 1. Conversion Rates
- **Modal Open Rate**: `modal_opened` / `page_view`
- **Form Completion Rate**: `modal_form_submitted` / `modal_opened`
- **Booking Rate**: `consultation_booked` / `cal_com_click`
- **Lead Conversion**: `lead_created` / `modal_opened`

### 2. User Intent Analysis
- **NEW vs SWITCHING**: Compare conversion rates by intent
- **Intent by Page**: Which pages drive which intents
- **Intent to Action**: How intent affects booking rates

### 3. Modal Performance
- **Modal Type Performance**: Which modals convert best
- **Step Drop-off**: Where users exit the modal flow
- **Form vs Calendar**: Self-service vs consultation preference

### 4. Page Performance
- **CTA Effectiveness**: Which CTAs drive most conversions
- **Scroll Depth Impact**: How engagement affects conversion
- **Outgoing Link Analysis**: Which external links are clicked most

## 🎯 Optimization Opportunities

### 1. A/B Testing Setup
Track different variants:
- **Modal Types**: Health vs Other vs Relocation performance
- **CTA Text**: "Book Consultation" vs "Get Free Quote"
- **Form Length**: Short vs detailed forms
- **Page Layout**: Different CTA placements

### 2. User Journey Optimization
- **Identify Drop-off Points**: Where users exit the funnel
- **Optimize Step Progression**: Reduce friction in modal flows
- **Personalize Content**: Use intent data for targeted messaging

### 3. Content Optimization
- **High-Converting Pages**: Identify pages with best conversion rates
- **Intent-Based Content**: Create content for specific user intents
- **CTA Placement**: Optimize button placement and text

## 🔍 Advanced Analysis

### 1. Cohort Analysis
Track user behavior over time:
- **New vs Returning**: Different conversion patterns
- **Intent Evolution**: How user intent changes over sessions
- **Booking Timing**: When users typically book consultations

### 2. Attribution Analysis
Track conversion sources:
- **UTM Parameters**: Which campaigns drive best conversions
- **Referral Sources**: Which external sites send best users
- **Page Entry Points**: Which pages are best entry points

### 3. Performance Analysis
Monitor technical performance impact:
- **Page Load Time**: How speed affects conversion
- **Device Performance**: Mobile vs desktop conversion rates
- **Browser Performance**: Cross-browser conversion analysis

## 🚀 Implementation Status

### ✅ Completed
- Enhanced tracking script with comprehensive event capture
- Modal system integration with step tracking
- Cal.com booking tracking setup
- Form interaction tracking
- Outgoing link tracking

### 📋 Next Steps
1. **Set up Plausible goals** (use the list above)
2. **Create conversion funnels** for key user journeys
3. **Set up custom dashboards** for key metrics
4. **Configure goal notifications** for important conversions
5. **Set up A/B testing** for optimization experiments

## 📞 Support

The enhanced tracking system is now live and will start collecting data immediately. All events are automatically tracked with rich context including:
- Page location and title
- User intent and source
- Modal type and step progression
- Form data structure (without sensitive information)
- Cal.com interaction details

Monitor your Plausible dashboard to see the new events and set up goals as described above for full optimization insights!
