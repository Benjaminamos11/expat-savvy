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
    
    sendPlausibleEvent('quote_flow_started', {
      ...context,
      ...attribution,
      flow_type: props.flowType || 'quote',
      form_type: props.formType || 'smart_insurance',
      ...props
    });
  };

  /**
   * Track quote form submission
   */
  window.trackQuoteSubmission = function(props = {}) {
    const context = getPageContext();
    const attribution = getAttributionData();
    
    sendPlausibleEvent('quote_submitted', {
      ...context,
      ...attribution,
      form_type: props.formType || 'smart_insurance',
      insurance_type: props.insuranceType || '',
      provider: props.provider || '',
      ...props
    });
  };

  /**
   * Track lead creation (main conversion event)
   */
  window.trackLeadCreation = function(props = {}) {
    const context = getPageContext();
    const attribution = getAttributionData();
    
    sendPlausibleEvent('lead_created', {
      ...context,
      ...attribution,
      flow: props.flow || 'quote',
      leadId: props.leadId || '',
      stage: props.stage || 'new',
      ...props
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
    
    sendPlausibleEvent('consultation_booked', {
      ...context,
      ...attribution,
      calendar_type: props.calendarType || 'cal_com',
      topic: props.topic || '',
      ...props
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

  // AUTO-INITIALIZATION
  waitForPlausible(() => {
    console.log('✅ Plausible tracking system initialized');
    
    // Store attribution data on page load
    storeAttribution();
    
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
