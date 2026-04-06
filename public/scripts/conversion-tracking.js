/**
 * Conversion Tracking for Expat Savvy
 *
 * Handles dataLayer events for GA4/Google Ads conversions:
 * - Form submissions
 * - Cal.com booking completions
 * - Phone/email/CTA click tracking
 * - UTM parameter capture + persistence + hidden form fields
 * - Scroll depth 75% micro-conversion
 */

(function() {
  'use strict';

  window.dataLayer = window.dataLayer || [];

  // ─── 1. UTM CAPTURE & PERSISTENCE ───

  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

  function captureUTMs() {
    var params = new URLSearchParams(window.location.search);
    UTM_KEYS.forEach(function(key) {
      var value = params.get(key);
      if (value) {
        try { sessionStorage.setItem(key, value); } catch(e) {}
      }
    });
  }

  function getStoredUTMs() {
    var utms = {};
    UTM_KEYS.forEach(function(key) {
      try {
        var val = sessionStorage.getItem(key);
        if (val) utms[key] = val;
      } catch(e) {}
    });
    return utms;
  }

  function injectUTMFields() {
    var utms = getStoredUTMs();
    if (Object.keys(utms).length === 0) return;

    document.querySelectorAll('form').forEach(function(form) {
      // Skip hidden Netlify detection forms and forms that already have UTM fields
      if (form.hidden || form.querySelector('input[name="utm_source"]')) return;

      UTM_KEYS.forEach(function(key) {
        var value = utms[key];
        if (value) {
          var input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        }
      });
    });
  }

  // Capture UTMs immediately on load
  captureUTMs();

  // ─── 2. PHONE & EMAIL CLICK TRACKING ───

  function setupClickTracking() {
    document.addEventListener('click', function(e) {
      var link = e.target.closest('a');
      if (!link) return;
      var href = link.getAttribute('href') || '';

      // Phone clicks
      if (href.indexOf('tel:') === 0) {
        var phone = href.replace('tel:', '');
        window.dataLayer.push({
          'event': 'phone_click',
          'phone_number': phone,
          'click_location': window.location.pathname
        });
        // GA4 recommended event
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'click_to_call', {
            'phone_number': phone,
            'page_location': window.location.pathname
          });
        }
      }

      // Email clicks
      if (href.indexOf('mailto:') === 0) {
        var email = href.replace('mailto:', '').split('?')[0];
        window.dataLayer.push({
          'event': 'email_click',
          'email_address': email,
          'click_location': window.location.pathname
        });
      }
    });
  }

  // ─── 3. CTA BUTTON CLICK TRACKING ───

  function setupCTATracking() {
    document.addEventListener('click', function(e) {
      var btn = e.target.closest('button, a.btn, a[class*="cta"], [data-track-cta]');
      if (!btn) return;

      var text = (btn.textContent || '').trim();
      if (!text) return;

      var lower = text.toLowerCase();
      var isCTA = btn.hasAttribute('data-track-cta') ||
        lower.indexOf('book') !== -1 ||
        lower.indexOf('consult') !== -1 ||
        lower.indexOf('schedule') !== -1 ||
        lower.indexOf('get quote') !== -1 ||
        lower.indexOf('get started') !== -1 ||
        lower.indexOf('free') !== -1 ||
        lower.indexOf('contact') !== -1 ||
        lower.indexOf('buchen') !== -1 ||
        lower.indexOf('termin') !== -1 ||
        lower.indexOf('beratung') !== -1;

      if (isCTA) {
        window.dataLayer.push({
          'event': 'cta_click',
          'cta_text': text.substring(0, 100),
          'cta_location': window.location.pathname
        });
      }
    });
  }

  // ─── 4. SCROLL DEPTH 75% TRACKING ───

  function setupScrollTracking() {
    var fired75 = false;

    window.addEventListener('scroll', function() {
      if (fired75) return;

      var scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;

      if (scrollPercent >= 75) {
        fired75 = true;
        window.dataLayer.push({
          'event': 'scroll_depth_75',
          'page_url': window.location.pathname
        });
      }
    });
  }

  // ─── 5. CAL.COM BOOKING COMPLETION (postMessage) ───

  function setupCalComTracking() {
    window.addEventListener('message', function(e) {
      if (!e.data) return;

      var isCalBooking = (
        (e.data.type === 'CAL' && e.data.action === 'bookingSuccessful') ||
        (e.data.type === 'CAL:BOOKING_COMPLETED')
      );

      if (isCalBooking) {
        fireBookingConversion('cal_com_postmessage');
      }
    });
  }

  // Shared booking conversion function (called from postMessage and from modal code)
  window.fireBookingConversion = function(source) {
    // dataLayer for GA4
    window.dataLayer.push({
      'event': 'booking_complete',
      'booking_source': source || 'cal_com',
      'page_url': window.location.pathname
    });

    // GA4 event → Google Ads conversion (linked via GA4 property)
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'expat_savvy_booking', {
        'value': 50.0,
        'currency': 'USD'
      });
    }

    // Meta conversion
    if (typeof window.trackMetaEvent === 'function') {
      window.trackMetaEvent('Schedule', {
        content_name: 'Appointment Booking',
        currency: 'CHF',
        value: 80.00
      });
    }
  };

  // Shared form submit tracking function (called from modal code)
  window.fireFormSubmitConversion = function(formName, extraData) {
    var utms = getStoredUTMs();
    var eventData = {
      'event': 'form_submit',
      'form_name': formName,
      'form_location': window.location.pathname
    };

    // Merge UTMs
    for (var key in utms) {
      if (utms.hasOwnProperty(key)) {
        eventData[key] = utms[key];
      }
    }

    // Merge extra data
    if (extraData) {
      for (var k in extraData) {
        if (extraData.hasOwnProperty(k)) {
          eventData[k] = extraData[k];
        }
      }
    }

    window.dataLayer.push(eventData);

    // GA4 event → Google Ads conversion (linked via GA4 property)
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'expat_savvy_booking', {
        'value': 50.0,
        'currency': 'USD'
      });
    }

    // Meta Lead event
    if (typeof window.trackMetaEvent === 'function') {
      window.trackMetaEvent('Lead', {
        content_name: formName,
        currency: 'CHF',
        value: 50.00
      });
    }
  };

  // ─── 6. NATIVE FORM SUBMIT LISTENER (fallback for any standard forms) ───

  function setupFormSubmitTracking() {
    document.addEventListener('submit', function(e) {
      var form = e.target;
      if (!form || form.hidden) return;

      var formName = form.getAttribute('name') || form.id || 'unknown_form';
      window.dataLayer.push({
        'event': 'form_submit',
        'form_name': formName,
        'form_location': window.location.pathname
      });
    });
  }

  // ─── INIT ───

  function init() {
    injectUTMFields();
    setupClickTracking();
    setupCTATracking();
    setupScrollTracking();
    setupCalComTracking();
    setupFormSubmitTracking();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-inject UTM fields when new forms are added dynamically (modals)
  if (typeof MutationObserver !== 'undefined') {
    var observer = new MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].addedNodes.length > 0) {
          injectUTMFields();
          break;
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

})();
