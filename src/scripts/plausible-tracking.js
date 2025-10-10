/**
 * Plausible Analytics Custom Event Tracking for Expat Savvy
 * This script provides comprehensive funnel tracking for the AI Growth Ops system
 */

// Initialize tracking system
(function() {
  'use strict';

  // Wait for Plausible to load
  function waitForPlausible(callback) {
    if (window.plausible) {
      callback();
    } else {
      setTimeout(() => waitForPlausible(callback), 100);
    }
  }

  // Send custom event to Plausible
  function sendPlausibleEvent(eventName, props = {}) {
    if (window.plausible) {
      console.log(`📊 Tracking: ${eventName}`, props);
      window.plausible(eventName, { props });
    } else {
      console.warn('⚠️ Plausible not loaded, queuing event:', eventName);
      // Queue for later if Plausible isn't loaded yet
      setTimeout(() => sendPlausibleEvent(eventName, props), 1000);
    }
  }

  // Send LinkedIn tracking event
  function sendLinkedInEvent(eventName, props = {}) {
    if (window.lintrk) {
      console.log(`🔗 LinkedIn Tracking: ${eventName}`, props);
      window.lintrk('track', eventName, props);
    } else {
      console.warn('⚠️ LinkedIn Insight Tag not loaded, queuing event:', eventName);
      // Queue for later if LinkedIn isn't loaded yet
      setTimeout(() => sendLinkedInEvent(eventName, props), 1000);
    }
  }

  // Send Facebook tracking event
  function sendFacebookEvent(eventName, props = {}) {
    if (window.fbq) {
      console.log(`📘 Facebook Tracking: ${eventName}`, props);
      window.fbq('track', eventName, props);
    } else {
      console.warn('⚠️ Facebook Pixel not loaded, queuing event:', eventName);
      // Queue for later if Facebook isn't loaded yet
      setTimeout(() => sendFacebookEvent(eventName, props), 1000);
    }
  }

  // Multi-platform event tracking
  function trackMultiPlatform(eventName, props = {}) {
    // Plausible (existing)
    sendPlausibleEvent(eventName, props);
    
    // LinkedIn
    sendLinkedInEvent(eventName, props);
    
    // Facebook (if pixel is loaded)
    sendFacebookEvent(eventName, props);
  }

  // Get current page context
  function getPageContext() {
    return {
      page_path: window.location.pathname,
      page_url: window.location.href,
      referrer: document.referrer || '',
      timestamp: new Date().toISOString()
    };
  }

  // Get attribution data from URL/session
  function getAttributionData() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      utm_source: urlParams.get('utm_source') || sessionStorage.getItem('utm_source') || null,
      utm_medium: urlParams.get('utm_medium') || sessionStorage.getItem('utm_medium') || null,
      utm_campaign: urlParams.get('utm_campaign') || sessionStorage.getItem('utm_campaign') || null,
      utm_term: urlParams.get('utm_term') || sessionStorage.getItem('utm_term') || null,
      utm_content: urlParams.get('utm_content') || sessionStorage.getItem('utm_content') || null
    };
  }

  // Store attribution data in session for later use
  function storeAttribution() {
    const attribution = getAttributionData();
    Object.keys(attribution).forEach(key => {
      if (attribution[key]) {
        sessionStorage.setItem(key, attribution[key]);
      }
    });
  }

  // FUNNEL TRACKING FUNCTIONS
  
  /**
   * Track when user starts the quote flow
   */
  window.trackQuoteFlowStart = function(props = {}) {
    const context = getPageContext();
    const attribution = getAttributionData();
    
    const eventData = {
      ...context,
      ...attribution,
      flow_type: props.flowType || 'quote',
      form_type: props.formType || 'smart_insurance',
      ...props
    };
    
    // Track on all platforms
    trackMultiPlatform('quote_flow_started', eventData);
    
    // LinkedIn-specific tracking for retargeting
    sendLinkedInEvent('QuoteStarted', {
      value: 1,
      currency: 'CHF',
      content_name: props.formType || 'smart_insurance'
    });
  };

  /**
   * Track quote form submission
   */
  window.trackQuoteSubmission = function(props = {}) {
    const context = getPageContext();
    const attribution = getAttributionData();
    
    const eventData = {
      ...context,
      ...attribution,
      form_type: props.formType || 'smart_insurance',
      insurance_type: props.insuranceType || '',
      provider: props.provider || '',
      ...props
    };
    
    // Track on all platforms
    trackMultiPlatform('quote_submitted', eventData);
    
    // LinkedIn conversion tracking
    sendLinkedInEvent('QuoteCompleted', {
      value: 50, // Estimated value of a quote
      currency: 'CHF',
      content_name: props.formType || 'smart_insurance',
      content_category: props.insuranceType || 'health_insurance'
    });
  };

  /**
   * Track lead creation (main conversion event)
   */
  window.trackLeadCreation = function(props = {}) {
    const context = getPageContext();
    const attribution = getAttributionData();
    
    const eventData = {
      ...context,
      ...attribution,
      flow: props.flow || 'quote',
      leadId: props.leadId || '',
      stage: props.stage || 'new',
      ...props
    };
    
    // Track on all platforms
    trackMultiPlatform('lead_created', eventData);
    
    // LinkedIn high-value conversion tracking
    sendLinkedInEvent('LeadCreated', {
      value: 200, // Estimated value of a lead
      currency: 'CHF',
      content_name: props.flow || 'quote',
      content_category: 'insurance_lead'
    });
  };

  /**
   * Track consultation booking start
   */
  window.trackConsultationStart = function(props = {}) {
    const context = getPageContext();
    const attribution = getAttributionData();
    
    sendPlausibleEvent('consultation_started', {
      ...context,
      ...attribution,
      modal_type: props.modalType || 'consultation',
      trigger_source: props.triggerSource || '',
      ...props
    });
  };

  /**
   * Track successful consultation booking
   */
  window.trackConsultationBooked = function(props = {}) {
    const context = getPageContext();
    const attribution = getAttributionData();
    
    const eventData = {
      ...context,
      ...attribution,
      calendar_type: props.calendarType || 'cal_com',
      topic: props.topic || '',
      ...props
    };
    
    // Track on all platforms
    trackMultiPlatform('consultation_booked', eventData);
    
    // LinkedIn premium conversion tracking
    sendLinkedInEvent('ConsultationBooked', {
      value: 300, // Estimated value of a consultation
      currency: 'CHF',
      content_name: 'consultation_booking',
      content_category: 'insurance_consultation'
    });
  };

  // CTA TRACKING
  
  /**
   * Track CTA button clicks
   */
  window.trackCTAClick = function(ctaText, ctaLocation, props = {}) {
    const context = getPageContext();
    
    sendPlausibleEvent('cta_clicked', {
      ...context,
      cta_text: ctaText,
      cta_location: ctaLocation,
      ...props
    });
  };

  // FORM INTERACTION TRACKING
  
  /**
   * Track form field interactions
   */
  window.trackFormInteraction = function(formType, fieldName, action = 'focus') {
    sendPlausibleEvent('form_interaction', {
      form_type: formType,
      field_name: fieldName,
      action: action,
      page_path: window.location.pathname
    });
  };

  // LinkedIn page view tracking
  function trackLinkedInPageView() {
    if (window.lintrk) {
      window.lintrk('track', 'PageView');
    }
  }

  // AUTO-INITIALIZATION
  waitForPlausible(() => {
    console.log('✅ Plausible tracking system initialized');
    
    // Store attribution data on page load
    storeAttribution();
    
    // Track LinkedIn page view
    setTimeout(() => {
      trackLinkedInPageView();
    }, 1000);
    
    // Override showConsultationModal function to add tracking
    if (typeof window.showConsultationModal === 'function') {
      const originalShowConsultation = window.showConsultationModal;
      window.showConsultationModal = function() {
        // Track consultation modal open
        window.trackConsultationStart({
          triggerSource: 'showConsultationModal',
          modalType: 'consultation'
        });
        return originalShowConsultation.apply(this, arguments);
      };
    }
    
    // Auto-track form interactions
    document.addEventListener('DOMContentLoaded', function() {
      // Track quote form start when user interacts with first field
      const quoteForm = document.getElementById('smart-insurance-form');
      if (quoteForm) {
        let hasStarted = false;
        const firstInputs = quoteForm.querySelectorAll('input, select, textarea');
        
        firstInputs.forEach(input => {
          input.addEventListener('focus', function() {
            if (!hasStarted) {
              hasStarted = true;
              window.trackQuoteFlowStart({
                formType: 'smart_insurance',
                flowType: 'quote'
              });
            }
          }, { once: true });
        });
      }
      
      // Track consultation modal opens via DOM manipulation and data attributes
      document.addEventListener('click', function(e) {
        const button = e.target.closest('button');
        if (button) {
          // Check for showConsultationModal calls
          const onclickAttr = button.getAttribute('onclick') || '';
          if (onclickAttr.includes('showConsultationModal') || 
              onclickAttr.includes('consultation-modal')) {
            window.trackConsultationStart({
              triggerSource: button.textContent.trim() || 'consultation_button',
              modalType: 'consultation'
            });
          }
          
          // Check for data-modal-trigger
          const modalTrigger = button.closest('[data-modal-trigger="consultation"]');
          if (modalTrigger) {
            window.trackConsultationStart({
              triggerSource: modalTrigger.textContent.trim(),
              modalType: 'consultation'
            });
          }
        }
      });
      
      // Track CTA clicks
      document.addEventListener('click', function(e) {
        const element = e.target.closest('[data-track-cta]');
        if (element) {
          const ctaText = element.textContent.trim();
          const ctaLocation = element.dataset.trackCta || 'unknown';
          window.trackCTAClick(ctaText, ctaLocation);
        }
      });
      
      // Track consultation modal step progression and form submission
      document.addEventListener('modalStepChange', function(e) {
        const stepNumber = e.detail.stepNumber;
        
        if (stepNumber === 2) {
          // User reached form step - track as quote flow start
          window.trackQuoteFlowStart({
            formType: 'consultation_modal',
            flowType: 'consultation'
          });
        } else if (stepNumber === 3) {
          // User completed form and reached calendar - track as quote submitted
          window.trackQuoteSubmission({
            formType: 'consultation_modal'
          });
        }
      });
    });
    
    // Listen for Cal.com booking events
    window.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'CAL:BOOKING_COMPLETED') {
        window.trackConsultationBooked({
          calendarType: 'cal_com',
          eventTypeId: e.data.eventTypeId || '',
          topic: e.data.eventType?.title || ''
        });
      }
    });
  });

})();
