/**
 * Analytics tracking for Expat Savvy website
 * This script tracks key user interactions including Cal.com meeting scheduling
 */

// Initialize dataLayer if it doesn't exist
window.dataLayer = window.dataLayer || [];

document.addEventListener('DOMContentLoaded', function() {
  // Track Cal.com booking button clicks
  trackCalBookingClicks();
  
  // Track click-to-schedule buttons across the site
  trackScheduleButtonClicks();
  
  // Track consultation modal steps
  trackConsultationSteps();
});

/**
 * Tracks clicks on Cal.com booking button inside the consultation modal
 */
function trackCalBookingClicks() {
  const calBookingButton = document.getElementById('cal-booking-button');
  if (calBookingButton) {
    calBookingButton.addEventListener('click', function() {
      console.log('Cal booking button clicked - tracking event');
      // Send event to dataLayer
      window.dataLayer.push({
        'event': 'cal_booking_click',
        'event_category': 'Meeting',
        'event_action': 'Cal Booking Button Click',
        'event_label': 'Modal Booking',
        'event_source': getCurrentPagePath(),
        'event_value': 1,
        'insuranceType': getDataLayerValue('insuranceType') || 'unknown',
        'userIntent': getDataLayerValue('userIntent') || 'unknown'
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

// Capture Cal.com booking completion events
// This requires a custom event from Cal.com when booking is completed
window.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'CAL:BOOKING_COMPLETED') {
    console.log('Cal.com booking completed - tracking event');
    window.dataLayer.push({
      'event': 'cal_booking_completed',
      'event_category': 'Meeting',
      'event_action': 'Booking Completed',
      'event_label': e.data.eventTypeId || 'Unknown Event Type',
      'event_source': getCurrentPagePath(),
      'insuranceType': getDataLayerValue('insuranceType') || 'unknown',
      'userIntent': getDataLayerValue('userIntent') || 'unknown',
      'conversion': true
    });
  }
}); 