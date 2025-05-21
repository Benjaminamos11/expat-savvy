// DataLayer Helper for GTM
// Initialize dataLayer with basic page information
window.dataLayer = window.dataLayer || [];
// Push basic information to dataLayer
window.dataLayer.push({
  'siteName': 'Expat Savvy',
  'pageType': document.querySelector('meta[property="og:type"]')?.content || 'website',
  'pagePath': window.location.pathname,
  'pageTitle': document.title,
  'pageLanguage': document.documentElement.lang || 'en',
  'visitorType': 'guest'
});
