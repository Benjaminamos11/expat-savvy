/**
 * Enhanced Plausible Tracking System
 * Comprehensive event tracking for full optimization insights
 */

// Wait for Plausible to load
function waitForPlausible(callback) {
  if (window.plausible) {
    callback();
  } else {
    setTimeout(() => waitForPlausible(callback), 100);
  }
}

// Enhanced tracking function with better context
function track(eventName, props = {}) {
  waitForPlausible(() => {
    // Add automatic context
    const enhancedProps = {
      ...props,
      page: window.location.pathname,
      page_title: document.title,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      referrer: document.referrer || 'direct'
    };
    
    console.log(`📊 Enhanced Tracking: ${eventName}`, enhancedProps);
    window.plausible(eventName, { props: enhancedProps });
  });
}

// 1. OUTGOING LINK TRACKING
function trackOutgoingLinks() {
  document.addEventListener('click', function(event) {
    const link = event.target.closest('a');
    if (!link) return;
    
    const href = link.href;
    const text = link.textContent.trim();
    
    // Track all outgoing links
    if (href && (href.startsWith('http') || href.startsWith('https'))) {
      const isExternal = !href.includes(window.location.hostname);
      
      if (isExternal) {
        track('outgoing_link_click', {
          link_url: href,
          link_text: text,
          link_domain: new URL(href).hostname,
          page_location: window.location.pathname,
          click_position: getClickPosition(event)
        });
      }
    }
    
    // Track specific important links
    if (href.includes('cal.com') || href.includes('calendly')) {
      track('calendar_link_click', {
        calendar_url: href,
        link_text: text,
        page_location: window.location.pathname
      });
    }
    
    if (href.includes('mailto:')) {
      track('email_link_click', {
        email: href.replace('mailto:', ''),
        page_location: window.location.pathname
      });
    }
    
    if (href.includes('tel:')) {
      track('phone_link_click', {
        phone: href.replace('tel:', ''),
        page_location: window.location.pathname
      });
    }
    
    if (href.includes('wa.me') || href.includes('whatsapp')) {
      track('whatsapp_link_click', {
        whatsapp_url: href,
        page_location: window.location.pathname
      });
    }
  });
}

// 2. MODAL TRACKING SYSTEM
function trackModalInteractions() {
  // Track modal opens with context
  window.trackModalOpen = function(modalType, context = {}) {
    track('modal_opened', {
      modal_type: modalType,
      page_location: window.location.pathname,
      page_title: document.title,
      user_intent: context.intent || 'unknown',
      source: context.source || 'unknown',
      ...context
    });
  };
  
  // Track modal closes
  window.trackModalClose = function(modalType, context = {}) {
    track('modal_closed', {
      modal_type: modalType,
      page_location: window.location.pathname,
      exit_reason: context.reason || 'unknown',
      time_spent: context.timeSpent || 0,
      steps_completed: context.stepsCompleted || 0,
      ...context
    });
  };
  
  // Track modal step progression
  window.trackModalStep = function(modalType, step, context = {}) {
    track('modal_step', {
      modal_type: modalType,
      step_number: step,
      step_name: context.stepName || `step_${step}`,
      page_location: window.location.pathname,
      user_data: context.userData || {},
      ...context
    });
  };
  
  // Track modal form submissions
  window.trackModalSubmission = function(modalType, formData, context = {}) {
    track('modal_form_submitted', {
      modal_type: modalType,
      form_type: context.formType || 'unknown',
      page_location: window.location.pathname,
      fields_completed: Object.keys(formData).length,
      user_intent: context.intent || 'unknown',
      // Don't track sensitive data, just structure
      has_email: !!formData.email,
      has_phone: !!formData.phone,
      has_name: !!formData.name,
      ...context
    });
  };
}

// 3. CAL.COM BOOKING TRACKING
function trackCalComBookings() {
  // Track when user clicks to book
  window.trackCalComClick = function(context = {}) {
    track('cal_com_click', {
      page_location: window.location.pathname,
      modal_type: context.modalType || 'unknown',
      user_intent: context.intent || 'unknown',
      form_data: context.formData || {},
      ...context
    });
  };
  
  // Track booking completion (this will be called by webhook)
  window.trackCalComBooking = function(bookingData) {
    track('consultation_booked', {
      booking_id: bookingData.booking_id,
      attendee_email: bookingData.attendee_email,
      attendee_name: bookingData.attendee_name,
      event_type: bookingData.event_type,
      booking_url: bookingData.booking_url,
      page_location: window.location.pathname,
      modal_type: bookingData.modal_type || 'unknown',
      user_intent: bookingData.intent || 'unknown'
    });
  };
}

// 4. USER INTENT TRACKING
function trackUserIntent() {
  window.trackUserIntent = function(intent, context = {}) {
    track('user_intent_identified', {
      intent_type: intent,
      page_location: window.location.pathname,
      source: context.source || 'unknown',
      confidence: context.confidence || 'unknown',
      ...context
    });
  };
  
  // Track specific intents
  window.trackIntentNewExpat = function(context = {}) {
    track('intent_new_expat', {
      page_location: window.location.pathname,
      ...context
    });
  };
  
  window.trackIntentSwitchingInsurance = function(context = {}) {
    track('intent_switching_insurance', {
      page_location: window.location.pathname,
      ...context
    });
  };
  
  window.trackIntentRelocation = function(context = {}) {
    track('intent_relocation', {
      page_location: window.location.pathname,
      ...context
    });
  };
}

// 5. FORM INTERACTION TRACKING
function trackFormInteractions() {
  // Track form field interactions
  document.addEventListener('focus', function(event) {
    if (event.target.matches('input, textarea, select')) {
      track('form_field_focus', {
        field_name: event.target.name || event.target.id,
        field_type: event.target.type,
        form_id: event.target.closest('form')?.id || 'unknown',
        page_location: window.location.pathname
      });
    }
  });
  
  // Track form submissions
  document.addEventListener('submit', function(event) {
    const form = event.target;
    const formData = new FormData(form);
    const formFields = Array.from(formData.keys());
    
    track('form_submitted', {
      form_id: form.id || 'unknown',
      form_action: form.action,
      fields_completed: formFields.length,
      field_names: formFields,
      page_location: window.location.pathname
    });
  });
}

// 6. PAGE INTERACTION TRACKING
function trackPageInteractions() {
  // Track scroll depth
  let maxScroll = 0;
  window.addEventListener('scroll', function() {
    const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    if (scrollPercent > maxScroll && scrollPercent % 25 === 0) { // Track at 25%, 50%, 75%, 100%
      maxScroll = scrollPercent;
      track('scroll_depth', {
        scroll_percent: scrollPercent,
        page_location: window.location.pathname
      });
    }
  });
  
  // Track time on page
  let startTime = Date.now();
  window.addEventListener('beforeunload', function() {
    const timeOnPage = Math.round((Date.now() - startTime) / 1000);
    track('page_exit', {
      time_on_page: timeOnPage,
      page_location: window.location.pathname
    });
  });
  
  // Track CTA button clicks
  document.addEventListener('click', function(event) {
    const button = event.target.closest('button, a');
    if (button) {
      const text = button.textContent.trim();
      const isCTA = text.toLowerCase().includes('book') || 
                   text.toLowerCase().includes('consultation') ||
                   text.toLowerCase().includes('quote') ||
                   text.toLowerCase().includes('get') ||
                   button.classList.contains('cta') ||
                   button.id.includes('cta');
      
      if (isCTA) {
        track('cta_clicked', {
          cta_text: text,
          cta_id: button.id || 'unknown',
          cta_class: button.className,
          page_location: window.location.pathname,
          click_position: getClickPosition(event)
        });
      }
    }
  });
}

// 7. HELPER FUNCTIONS
function getClickPosition(event) {
  return {
    x: event.clientX,
    y: event.clientY,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight
  };
}

function getPageContext() {
  return {
    page: window.location.pathname,
    page_title: document.title,
    referrer: document.referrer || 'direct',
    utm_source: new URLSearchParams(window.location.search).get('utm_source'),
    utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
    utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign')
  };
}

// 8. ENHANCED LEAD TRACKING
window.trackLeadCreation = function(props = {}) {
  const context = getPageContext();
  track('lead_created', {
    ...context,
    ...props
  });
};

window.trackQuoteFlowStart = function(props = {}) {
  const context = getPageContext();
  track('quote_flow_started', {
    ...context,
    ...props
  });
};

// 9. INITIALIZATION
function initEnhancedTracking() {
  console.log('🚀 Enhanced Plausible Tracking initialized');
  
  trackOutgoingLinks();
  trackModalInteractions();
  trackCalComBookings();
  trackUserIntent();
  trackFormInteractions();
  trackPageInteractions();
  
  // Track page load
  track('page_view', {
    page_load_time: performance.timing.loadEventEnd - performance.timing.navigationStart,
    connection_type: navigator.connection?.effectiveType || 'unknown'
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEnhancedTracking);
} else {
  initEnhancedTracking();
}

// Export functions for global access
window.enhancedTracking = {
  track,
  trackModalOpen,
  trackModalClose,
  trackModalStep,
  trackModalSubmission,
  trackCalComClick,
  trackCalComBooking,
  trackUserIntent,
  trackIntentNewExpat,
  trackIntentSwitchingInsurance,
  trackIntentRelocation,
  trackLeadCreation,
  trackQuoteFlowStart
};
