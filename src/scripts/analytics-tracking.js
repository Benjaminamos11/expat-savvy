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
});

/**
 * Tracks clicks on Cal.com booking button inside the consultation modal
 */
function trackCalBookingClicks() {
  const calBookingButton = document.getElementById('cal-booking-button');
  if (calBookingButton) {
    calBookingButton.addEventListener('click', function() {
      // Send event to dataLayer
      window.dataLayer.push({
        'event': 'cal_booking_click',
        'event_category': 'Meeting',
        'event_action': 'Cal Booking Button Click',
        'event_label': 'Modal Booking',
        'event_source': getCurrentPagePath(),
        'event_value': 1
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
      
      // Send event to dataLayer
      window.dataLayer.push({
        'event': 'schedule_meeting_click',
        'event_category': 'Meeting',
        'event_action': 'Schedule Meeting Button Click',
        'event_label': sectionName || 'Generic Button',
        'event_source': getCurrentPagePath(),
        'event_value': 1
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
  if (e.data.type === 'CAL:BOOKING_COMPLETED') {
    window.dataLayer.push({
      'event': 'cal_booking_completed',
      'event_category': 'Meeting',
      'event_action': 'Booking Completed',
      'event_label': e.data.eventTypeId || 'Unknown Event Type',
      'event_source': getCurrentPagePath()
    });
  }
}); 
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
});

/**
 * Tracks clicks on Cal.com booking button inside the consultation modal
 */
function trackCalBookingClicks() {
  const calBookingButton = document.getElementById('cal-booking-button');
  if (calBookingButton) {
    calBookingButton.addEventListener('click', function() {
      // Send event to dataLayer
      window.dataLayer.push({
        'event': 'cal_booking_click',
        'event_category': 'Meeting',
        'event_action': 'Cal Booking Button Click',
        'event_label': 'Modal Booking',
        'event_source': getCurrentPagePath(),
        'event_value': 1
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
      
      // Send event to dataLayer
      window.dataLayer.push({
        'event': 'schedule_meeting_click',
        'event_category': 'Meeting',
        'event_action': 'Schedule Meeting Button Click',
        'event_label': sectionName || 'Generic Button',
        'event_source': getCurrentPagePath(),
        'event_value': 1
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
  if (e.data.type === 'CAL:BOOKING_COMPLETED') {
    window.dataLayer.push({
      'event': 'cal_booking_completed',
      'event_category': 'Meeting',
      'event_action': 'Booking Completed',
      'event_label': e.data.eventTypeId || 'Unknown Event Type',
      'event_source': getCurrentPagePath()
    });
  }
}); 