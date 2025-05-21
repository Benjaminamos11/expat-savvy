/**
 * GTM Event Helper - Simplifies pushing events to dataLayer
 * For use with Google Tag Manager and other tracking systems
 */

window.ExpatSavvyTracking = window.ExpatSavvyTracking || {};

/**
 * Track page view event with enhanced data
 * @param {Object} additionalData - Any additional data to include
 */
ExpatSavvyTracking.trackPageView = function(additionalData) {
  const data = {
    event: 'enhanced_page_view',
    page_path: window.location.pathname,
    page_title: document.title,
    page_type: document.querySelector('meta[property="og:type"]')?.content || 'website',
    page_language: document.documentElement.lang || 'en',
    ...additionalData
  };
  
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
  console.log('Enhanced page view tracked:', data);
};

/**
 * Track insurance interaction
 * @param {string} action - The action type (e.g., 'view', 'click', 'submit')
 * @param {string} insuranceType - The type of insurance
 * @param {string} intent - User intent (setup, change, compare)
 */
ExpatSavvyTracking.trackInsurance = function(action, insuranceType, intent) {
  const data = {
    event: 'insurance_interaction',
    insurance_action: action,
    insuranceType: insuranceType || window.ExpatSavvyTracking.getDataLayerValue('insuranceType') || 'unknown',
    userIntent: intent || window.ExpatSavvyTracking.getDataLayerValue('userIntent') || 'unknown',
    page_path: window.location.pathname
  };
  
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
  console.log('Insurance interaction tracked:', data);
};

/**
 * Track consultation event
 * @param {string} step - The step in the consultation process
 */
ExpatSavvyTracking.trackConsultation = function(step) {
  const data = {
    event: 'consultation_event',
    consultation_step: step,
    insuranceType: window.ExpatSavvyTracking.getDataLayerValue('insuranceType') || 'unknown',
    userIntent: window.ExpatSavvyTracking.getDataLayerValue('userIntent') || 'unknown',
    page_path: window.location.pathname
  };
  
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
  console.log('Consultation event tracked:', data);
};

/**
 * Track conversion event
 * @param {string} type - The type of conversion
 * @param {Object} additionalData - Any additional data to include
 */
ExpatSavvyTracking.trackConversion = function(type, additionalData) {
  const data = {
    event: 'conversion',
    conversion_type: type,
    insuranceType: window.ExpatSavvyTracking.getDataLayerValue('insuranceType') || 'unknown',
    userIntent: window.ExpatSavvyTracking.getDataLayerValue('userIntent') || 'unknown',
    page_path: window.location.pathname,
    ...additionalData
  };
  
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
  console.log('Conversion tracked:', data);
};

/**
 * Helper to fetch values from dataLayer
 * @param {string} key - The key to look for in dataLayer
 * @returns {*} - The value or null if not found
 */
ExpatSavvyTracking.getDataLayerValue = function(key) {
  if (!window.dataLayer || !Array.isArray(window.dataLayer)) return null;
  
  for (let i = window.dataLayer.length - 1; i >= 0; i--) {
    if (window.dataLayer[i] && window.dataLayer[i][key] !== undefined) {
      return window.dataLayer[i][key];
    }
  }
  return null;
}; 