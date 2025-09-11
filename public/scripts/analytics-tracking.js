/**
 * Analytics tracking for Expat Savvy website
 * This script tracks key user interactions including Cal.com meeting scheduling
 * Integrates with Plausible (cookieless), Umami, and GTM
 */

// Initialize dataLayer if it doesn't exist
window.dataLayer = window.dataLayer || [];

// Attribution tracking system
class AttributionTracker {
  constructor() {
    this.attribution = {};
    this.init();
  }

  init() {
    this.captureAttribution();
    this.detectPageType();
    this.trackPageView();
  }

  captureAttribution() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const now = new Date().toISOString();
    
    // Check if this is first visit or new session
    const existingData = this.getStoredAttribution();
    const isNewSession = !existingData || this.isNewSession(existingData);
    
    this.attribution = {
      // UTM parameters
      utm_source: urlParams.get('utm_source') || existingData?.utm_source || null,
      utm_medium: urlParams.get('utm_medium') || existingData?.utm_medium || null,
      utm_campaign: urlParams.get('utm_campaign') || existingData?.utm_campaign || null,
      utm_term: urlParams.get('utm_term') || existingData?.utm_term || null,
      utm_content: urlParams.get('utm_content') || existingData?.utm_content || null,
      
      // Referrer and landing page
      referrer: isNewSession ? document.referrer : existingData?.referrer || document.referrer,
      landing_path: isNewSession ? window.location.pathname : existingData?.landing_path || window.location.pathname,
      
      // Timestamps
      first_touch_at: existingData?.first_touch_at || now,
      last_touch_at: now,
      
      // Page context
      city: this.detectCity(),
      page_type: this.getPageType(),
      
      // Derived channel
      channel: this.deriveChannel()
    };

    // Update stored attribution
    this.storeAttribution();
  }

  detectCity() {
    const path = window.location.pathname.toLowerCase();
    const cityMap = {
      '/health-insurance/zurich/': 'zurich',
      '/health-insurance/geneva/': 'geneva',
      '/health-insurance/basel/': 'basel',
      '/health-insurance/bern/': 'bern',
      '/health-insurance/lausanne/': 'lausanne',
      '/health-insurance/lugano/': 'lugano',
      '/health-insurance/zug/': 'zug'
    };

    for (const [pathPattern, city] of Object.entries(cityMap)) {
      if (path.includes(pathPattern)) return city;
    }

    return null;
  }

  getPageType() {
    const path = window.location.pathname.toLowerCase();
    
    if (path.includes('/providers/') || path.includes('/healthcare/all-insurances/')) return 'provider';
    if (path.includes('/compare-providers/')) return 'comparison';
    if (path.includes('/health-insurance/')) return 'city';
    if (path.includes('/guides/how-to/')) return 'how-to';
    if (path.includes('/blog/')) return 'blog';
    if (path === '/') return 'homepage';
    
    return 'other';
  }

  deriveChannel() {
    const { utm_source, referrer } = this.attribution;
    
    if (utm_source) {
      const paidSources = ['google', 'meta', 'facebook', 'instagram', 'linkedin', 'bing'];
      const emailSources = ['email', 'newsletter'];
      
      if (paidSources.includes(utm_source.toLowerCase())) return 'paid';
      if (emailSources.includes(utm_source.toLowerCase())) return 'email';
    }
    
    if (!referrer) return 'direct';
    
    const referrerLower = referrer.toLowerCase();
    if (referrerLower.includes('google') || referrerLower.includes('bing') || referrerLower.includes('duckduckgo')) {
      return 'organic';
    }
    
    return 'referral';
  }

  isNewSession(existingData) {
    if (!existingData?.last_touch_at) return true;
    const lastTouch = new Date(existingData.last_touch_at);
    const now = new Date();
    const sessionTimeout = 30 * 60 * 1000; // 30 minutes
    return (now - lastTouch) > sessionTimeout;
  }

  getStoredAttribution() {
    try {
      const stored = localStorage.getItem('expat_savvy_attribution');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  storeAttribution() {
    try {
      localStorage.setItem('expat_savvy_attribution', JSON.stringify(this.attribution));
    } catch (e) {
      console.warn('Could not store attribution data:', e);
    }
  }

  detectPageType() {
    // Add page type to dataLayer for other tracking systems
    window.dataLayer.push({
      'pageType': this.attribution.page_type,
      'city': this.attribution.city,
      'channel': this.attribution.channel,
      'utm_source': this.attribution.utm_source,
      'utm_campaign': this.attribution.utm_campaign
    });
  }

  trackPageView() {
    // Send page view with attribution to all analytics systems
    this.sendToPlausible('pageview', {
      channel: this.attribution.channel,
      city: this.attribution.city,
      page_type: this.attribution.page_type,
      campaign: this.attribution.utm_campaign,
      source: this.attribution.utm_source
    });
  }

  sendToPlausible(eventName, props = {}) {
    if (typeof plausible !== 'undefined') {
      console.log('Sending to Plausible:', eventName, props);
      plausible(eventName, { props });
    } else {
      console.warn('Plausible not available - event not sent:', eventName);
    }
  }

  sendToUmami(eventName, data = {}) {
    if (typeof umami !== 'undefined') {
      umami.track(eventName, data);
    }
  }

  getAttribution() {
    return this.attribution;
  }
}

// Initialize attribution tracking
const attributionTracker = new AttributionTracker();

document.addEventListener('DOMContentLoaded', function() {
  // Track Cal.com booking button clicks
  trackCalBookingClicks();
  
  // Track click-to-schedule buttons across the site
  trackScheduleButtonClicks();
  
  // Track consultation modal steps
  trackConsultationSteps();

  // Track quote form interactions
  trackQuoteFormInteractions();
});

/**
 * Tracks clicks on Cal.com booking button inside the consultation modal
 */
function trackCalBookingClicks() {
  const calBookingButton = document.getElementById('cal-booking-button');
  if (calBookingButton) {
    calBookingButton.addEventListener('click', function() {
      console.log('Cal booking button clicked - tracking event');
      const attribution = attributionTracker.getAttribution();
      
      // Send to all analytics platforms
      const eventProps = {
        channel: attribution.channel,
        city: attribution.city,
        page_type: attribution.page_type,
        campaign: attribution.utm_campaign,
        source: attribution.utm_source
      };

      // Plausible
      attributionTracker.sendToPlausible('consultation_started', eventProps);
      
      // Umami
      attributionTracker.sendToUmami('consultation_started', eventProps);
      
      // GTM dataLayer
      window.dataLayer.push({
        'event': 'cal_booking_click',
        'event_category': 'Meeting',
        'event_action': 'Cal Booking Button Click',
        'event_label': 'Modal Booking',
        'event_source': getCurrentPagePath(),
        'event_value': 1,
        'insuranceType': getDataLayerValue('insuranceType') || 'unknown',
        'userIntent': getDataLayerValue('userIntent') || 'unknown',
        ...eventProps
      });
    });
  }
}

/**
 * Tracks clicks on all "Schedule Meeting" buttons across the site
 */
function trackScheduleButtonClicks() {
  // Get all buttons that trigger the consultation modal
  const scheduleButtons = document.querySelectorAll('[onclick*="showConsultationModal"]');
  
  scheduleButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      // Get the page section or container name if possible
      const sectionName = getSectionName(button);
      
      console.log('Schedule meeting button clicked - tracking event');
      // Send event to dataLayer
      window.dataLayer.push({
        'event': 'schedule_meeting_click',
        'event_category': 'Meeting',
        'event_action': 'Schedule Meeting Button Click',
        'event_label': sectionName || 'Generic Button',
        'event_source': getCurrentPagePath(),
        'event_value': 1,
        'insuranceType': getDataLayerValue('insuranceType') || 'unknown',
        'userIntent': getDataLayerValue('userIntent') || 'unknown'
      });
    });
  });
}

/**
 * Track steps in the consultation modal process
 */
function trackConsultationSteps() {
  // Listen for modal open
  document.addEventListener('modalOpened', function(e) {
    if (e.detail && e.detail.modalId === 'consultation-modal') {
      console.log('Consultation modal opened - tracking event');
      window.dataLayer.push({
        'event': 'consultation_start',
        'event_category': 'Consultation',
        'event_action': 'Modal Open',
        'event_source': getCurrentPagePath(),
        'insuranceType': getDataLayerValue('insuranceType') || 'unknown',
        'userIntent': getDataLayerValue('userIntent') || 'unknown'
      });
    }
  });
  
  // Track modal step progression
  const modalStepButtons = document.querySelectorAll('.modal-step button[data-step]');
  modalStepButtons.forEach(button => {
    button.addEventListener('click', function() {
      const stepNumber = button.getAttribute('data-step');
      console.log('Consultation step ' + stepNumber + ' - tracking event');
      window.dataLayer.push({
        'event': 'consultation_step',
        'event_category': 'Consultation',
        'event_action': 'Step Progress',
        'event_label': 'Step ' + stepNumber,
        'event_source': getCurrentPagePath(),
        'consultationStep': stepNumber
      });
    });
  });
}

/**
 * Gets the current page path for source attribution
 */
function getCurrentPagePath() {
  return window.location.pathname;
}

/**
 * Get a value from the dataLayer
 */
function getDataLayerValue(key) {
  if (!window.dataLayer || !Array.isArray(window.dataLayer)) return null;
  
  for (let i = window.dataLayer.length - 1; i >= 0; i--) {
    if (window.dataLayer[i] && window.dataLayer[i][key] !== undefined) {
      return window.dataLayer[i][key];
    }
  }
  return null;
}

/**
 * Attempts to identify the section/container where the button is located
 */
function getSectionName(element) {
  // Try to find a parent section with an ID
  let parent = element.closest('section') || element.closest('div[id]');
  if (parent && parent.id) {
    return parent.id;
  }
  
  // Try to find a heading nearby
  let heading = element.closest('div').querySelector('h1, h2, h3');
  if (heading) {
    return heading.textContent.trim();
  }
  
  // If all else fails, return null
  return null;
}

/**
 * Track quote form interactions (Get 3 Best Offers forms)
 */
function trackQuoteFormInteractions() {
  // Track when quote flow starts (modal opens or form page loads)
  const quoteButtons = document.querySelectorAll('[data-modal-target="offers-modal"], .quote-form-trigger');
  quoteButtons.forEach(button => {
    button.addEventListener('click', function() {
      console.log('Quote flow started - tracking event');
      const attribution = attributionTracker.getAttribution();
      
      const eventProps = {
        channel: attribution.channel,
        city: attribution.city,
        page_type: attribution.page_type,
        campaign: attribution.utm_campaign,
        source: attribution.utm_source,
        flow: 'quote'
      };

      // Send to all platforms
      attributionTracker.sendToPlausible('quote_flow_started', eventProps);
      attributionTracker.sendToUmami('quote_flow_started', eventProps);
      
      window.dataLayer.push({
        'event': 'quote_flow_started',
        'event_category': 'Lead Generation',
        'event_action': 'Quote Flow Started',
        'event_source': getCurrentPagePath(),
        ...eventProps
      });
    });
  });

  // Track quote form submissions
  const quoteForms = document.querySelectorAll('form[data-quote-form], .quote-form');
  quoteForms.forEach(form => {
    form.addEventListener('submit', function(e) {
      console.log('Quote submitted - tracking event');
      const attribution = attributionTracker.getAttribution();
      
      const eventProps = {
        channel: attribution.channel,
        city: attribution.city,
        page_type: attribution.page_type,
        campaign: attribution.utm_campaign,
        source: attribution.utm_source,
        flow: 'quote'
      };

      // Send to all platforms
      attributionTracker.sendToPlausible('quote_submitted', eventProps);
      attributionTracker.sendToUmami('quote_submitted', eventProps);
      
      window.dataLayer.push({
        'event': 'quote_submitted',
        'event_category': 'Lead Generation',
        'event_action': 'Quote Submitted',
        'event_source': getCurrentPagePath(),
        'conversion': true,
        ...eventProps
      });
    });
  });
}

// Capture Cal.com booking completion events
// This requires a custom event from Cal.com when booking is completed
window.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'CAL:BOOKING_COMPLETED') {
    console.log('Cal.com booking completed - tracking event');
    const attribution = attributionTracker.getAttribution();
    
    const eventProps = {
      channel: attribution.channel,
      city: attribution.city,
      page_type: attribution.page_type,
      campaign: attribution.utm_campaign,
      source: attribution.utm_source,
      flow: 'consult'
    };

    // Send to all platforms
    attributionTracker.sendToPlausible('consultation_booked', eventProps);
    attributionTracker.sendToUmami('consultation_booked', eventProps);
    
    window.dataLayer.push({
      'event': 'cal_booking_completed',
      'event_category': 'Meeting',
      'event_action': 'Booking Completed',
      'event_label': e.data.eventTypeId || 'Unknown Event Type',
      'event_source': getCurrentPagePath(),
      'insuranceType': getDataLayerValue('insuranceType') || 'unknown',
      'userIntent': getDataLayerValue('userIntent') || 'unknown',
      'conversion': true,
      ...eventProps
    });
  }
});

// Global function to track lead creation (to be called from forms)
window.trackLeadCreation = function(leadData) {
  console.log('Lead created - tracking event');
  const attribution = attributionTracker.getAttribution();
  
  const eventProps = {
    channel: attribution.channel,
    city: attribution.city,
    page_type: attribution.page_type,
    campaign: attribution.utm_campaign,
    source: attribution.utm_source,
    flow: leadData.flow || 'unknown'
  };

  // Send to all platforms
  attributionTracker.sendToPlausible('lead_created', eventProps);
  attributionTracker.sendToUmami('lead_created', eventProps);
  
  window.dataLayer.push({
    'event': 'lead_created',
    'event_category': 'Lead Generation',
    'event_action': 'Lead Created',
    'event_source': getCurrentPagePath(),
    'conversion': true,
    'leadId': leadData.leadId,
    ...eventProps
  });
};

// Global function to get attribution data for forms
window.getAttributionData = function() {
  return attributionTracker.getAttribution();
}; 