/**
 * Google Tag Manager Consent Mode Initialization
 * This must be loaded BEFORE the GTM script
 */

// Initialize dataLayer if it doesn't exist
window.dataLayer = window.dataLayer || [];

// Set default consent to denied (according to Google's best practices)
window.dataLayer.push({
  'event': 'default_consent',
  'consent_settings': {
    'ad_storage': 'denied',
    'analytics_storage': 'denied',
    'functionality_storage': 'denied',
    'personalization_storage': 'denied',
    'security_storage': 'granted' // Security is always granted
  }
});

// Define each region and consent mode
window.dataLayer.push({
  'event': 'consent_init',
  'gtm_consent': {
    // Default for EU users (GDPR)
    'region': ['CH', 'DE', 'FR', 'IT', 'AT', 'ES', 'PT', 'BE', 'NL', 'DK', 'SE', 'NO', 'FI', 'GB', 'IE', 'PL'],
    'consent': {
      'ad_storage': 'denied',
      'analytics_storage': 'denied',
      'functionality_storage': 'denied',
      'personalization_storage': 'denied',
      'security_storage': 'granted'
    },
    'wait_for_update': 500 // Wait 500ms for consent update before firing tags
  }
});

// Helper function to update consent state (used by the consent banner)
window.updateGTMConsent = function(settings) {
  window.dataLayer.push({
    'event': 'consent_update',
    'consent_settings': settings
  });
};

// Helper to check if consent is required based on region
// This uses a simplistic approach - you might want to use a proper geo-IP service
window.isConsentRequired = function() {
  // Default to requiring consent (safer approach)
  return true;
}; 