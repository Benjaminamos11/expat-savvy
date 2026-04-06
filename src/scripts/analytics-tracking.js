/**
 * Analytics tracking for Expat Savvy website
 * Tracks Cal.com meeting scheduling and schedule button clicks
 * Pushes events to dataLayer for GA4/Google Ads pickup
 */

// Initialize dataLayer if it doesn't exist
window.dataLayer = window.dataLayer || [];

document.addEventListener('DOMContentLoaded', function() {
  trackCalBookingClicks();
  trackScheduleButtonClicks();
});

/**
 * Tracks clicks on Cal.com booking button inside the consultation modal
 */
function trackCalBookingClicks() {
  var calBookingButton = document.getElementById('cal-booking-button');
  if (calBookingButton) {
    calBookingButton.addEventListener('click', function() {
      window.dataLayer.push({
        'event': 'cal_booking_click',
        'event_category': 'Meeting',
        'event_action': 'Cal Booking Button Click',
        'event_label': 'Modal Booking',
        'event_source': window.location.pathname,
        'event_value': 1
      });
    });
  }
}

/**
 * Tracks clicks on all "Schedule Meeting" buttons across the site
 */
function trackScheduleButtonClicks() {
  var scheduleButtons = document.querySelectorAll('[onclick*="showConsultationModal"]');

  scheduleButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      var sectionName = getSectionName(button);

      window.dataLayer.push({
        'event': 'schedule_meeting_click',
        'event_category': 'Meeting',
        'event_action': 'Schedule Meeting Button Click',
        'event_label': sectionName || 'Generic Button',
        'event_source': window.location.pathname,
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
  var parent = element.closest('section') || element.closest('div[id]');
  if (parent && parent.id) {
    return parent.id;
  }

  var container = element.closest('div');
  if (container) {
    var heading = container.querySelector('h1, h2, h3');
    if (heading) {
      return heading.textContent.trim();
    }
  }

  return null;
}

// Capture Cal.com booking completion events via postMessage
window.addEventListener('message', function(e) {
  if (!e.data) return;

  // Cal.com embed sends various message formats
  var isCalBooking = (
    (e.data.type === 'CAL' && e.data.action === 'bookingSuccessful') ||
    (e.data.type === 'CAL:BOOKING_COMPLETED')
  );

  if (isCalBooking) {
    // Push to dataLayer for GA4
    window.dataLayer.push({
      'event': 'booking_complete',
      'booking_source': 'cal_com',
      'page_url': window.location.pathname,
      'event_type_id': e.data.eventTypeId || ''
    });

    // GA4 event → Google Ads conversion (linked via GA4 property)
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'expat_savvy_booking', {
        'value': 50.0,
        'currency': 'USD'
      });
    }

    // Fire Meta conversion
    if (typeof window.trackMetaEvent === 'function') {
      window.trackMetaEvent('Schedule', {
        content_name: 'Appointment Booking',
        currency: 'CHF',
        value: 80.00
      });
    }
  }
});
