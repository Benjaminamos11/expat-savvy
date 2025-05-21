/**
 * LinkedIn Insight Tag Implementation
 * You'll need to replace YOUR_PARTNER_ID with your actual LinkedIn Partner ID
 */

_linkedin_partner_id = "YOUR_PARTNER_ID"; // Replace with your LinkedIn Partner ID
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);

(function() {
  var s = document.getElementsByTagName("script")[0];
  var b = document.createElement("script");
  b.type = "text/javascript";
  b.async = true;
  b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
  s.parentNode.insertBefore(b, s);
})();

// Event tracking for LinkedIn
window.trackLinkedInEvent = function(conversionId, event_name) {
  if (typeof window.lintrk === 'function') {
    window.lintrk('track', { conversion_id: conversionId });
    console.log('LinkedIn conversion tracked:', conversionId, event_name);
  } else {
    console.error('LinkedIn tracking not available');
  }
}; 