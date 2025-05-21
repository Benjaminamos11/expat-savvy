/**
 * Page Type Detection - Pushes page information to data layer
 * This automatically detects insurance page types and user intent
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize dataLayer if not exists
  window.dataLayer = window.dataLayer || [];
  
  // Detect page type based on URL and content
  function detectPageType() {
    const url = window.location.pathname;
    let insuranceType = 'unknown';
    let userIntent = 'browse';
    
    // Detect insurance type from URL and page content
    if (url.includes('health') || document.querySelector('h1,h2,h3')?.textContent.toLowerCase().includes('health')) {
      insuranceType = 'health';
    } else if (url.includes('home') || document.querySelector('h1,h2,h3')?.textContent.toLowerCase().includes('home')) {
      insuranceType = 'home';
    } else if (url.includes('auto') || document.querySelector('h1,h2,h3')?.textContent.toLowerCase().includes('car')) {
      insuranceType = 'auto';
    } else if (url.includes('liability') || document.querySelector('h1,h2,h3')?.textContent.toLowerCase().includes('liability')) {
      insuranceType = 'liability';
    }
    
    // Detect user intent based on URL and page elements
    if (url.includes('switch') || url.includes('changing') || document.querySelector('h1,h2,h3')?.textContent.toLowerCase().includes('switch')) {
      userIntent = 'change';
    } else if (url.includes('compare') || document.querySelector('h1,h2,h3')?.textContent.toLowerCase().includes('compare')) {
      userIntent = 'compare';
    } else if (url.includes('setup') || url.includes('new') || document.querySelector('h1,h2,h3')?.textContent.toLowerCase().includes('new')) {
      userIntent = 'setup';
    }
    
    return {
      insuranceType: insuranceType,
      userIntent: userIntent
    };
  }
  
  // Get user's location if possible (simplified)
  function getUserLocation() {
    // You could use a proper geo IP service here
    // This is a simplistic example using language as a proxy
    const lang = navigator.language || navigator.userLanguage;
    if (lang.includes('de-CH')) return 'zurich';
    if (lang.includes('fr-CH')) return 'geneva';
    return 'switzerland';
  }
  
  // Detect page information
  const pageInfo = detectPageType();
  const userLocation = getUserLocation();
  
  // Push to dataLayer
  window.dataLayer.push({
    'event': 'insurance_page_view',
    'insuranceType': pageInfo.insuranceType,
    'userIntent': pageInfo.userIntent,
    'userLocation': userLocation,
    'pageCategory': 'insurance'
  });
  
  console.log('Data layer updated with page information:', pageInfo);
}); 