/**
 * Performance Optimizations Script - Lightweight Version
 */

// Execute as early as possible but don't block rendering
(function() {
  // Add preconnects immediately
  addPreconnects();
  
  // Execute other optimizations when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOptimizations);
  } else {
    initOptimizations();
  }
  
  function initOptimizations() {
    // Execute only the most critical optimizations
    lazyLoadImages();
    deferThirdPartyResources();
    fixSvgPathErrors();
  }
  
  // Only lazy load images below the fold
  function lazyLoadImages() {
    if ('loading' in HTMLImageElement.prototype) {
      // If browser supports native lazy loading
      const images = document.querySelectorAll('img:not([loading])');
      
      let i = 0;
      while (i < images.length) {
        const img = images[i];
        if (!isAboveTheFold(img)) {
          img.loading = 'lazy';
        }
        i++;
      }
    }
  }
  
  // Simple check for above-the-fold content
  function isAboveTheFold(el) {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight * 1.2; // 20% buffer
  }
  
  // Optimize Cal.com loading
  function deferThirdPartyResources() {
    // Only target Cal.com iframes that aren't in our optimized containers
    const calElements = document.querySelectorAll('iframe[src*="cal.com"]:not([data-optimized="true"])');
    
    let i = 0;
    while (i < calElements.length) {
      const iframe = calElements[i];
      const src = iframe.src;
      
      // Skip if already handled by our lazy-loading implementation
      if (!iframe.closest('#cal-booking-placeholder, #my-cal-inline')) {
        iframe.dataset.src = src;
        iframe.removeAttribute('src');
        iframe.dataset.optimized = 'true';
      }
      i++;
    }
  }
  
  // Fix SVG path errors that cause console warnings
  function fixSvgPathErrors() {
    // Only run on pages with SVG path errors
    if (document.querySelector('path[d*=".."]') || document.querySelector('path[d*="-."]')) {
      const paths = document.querySelectorAll('path[d]');
      
      let i = 0;
      while (i < paths.length) {
        const path = paths[i];
        const d = path.getAttribute('d');
        
        if (d && (d.includes('..') || d.includes('-.'))) {
          // Fix common SVG syntax errors
          path.setAttribute('d', d
            .replace(/\.\./g, '.') // Double dots
            .replace(/\-\./g, '-0.') // Negative decimal
          );
        }
        i++;
      }
    }
  }
  
  // Add preconnect links for critical domains
  function addPreconnects() {
    const domains = [
      'https://app.cal.com',
      'https://res.cloudinary.com'
    ];
    
    for (let i = 0; i < domains.length; i++) {
      const domain = domains[i];
      if (!document.querySelector(`link[rel="preconnect"][href="${domain}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        link.crossOrigin = 'anonymous';
        
        // Add to head as early as possible
        if (document.head) {
          document.head.appendChild(link);
        } else {
          // If head isn't available yet, wait for it
          document.addEventListener('DOMContentLoaded', function() {
            document.head.appendChild(link);
          });
        }
      }
    }
  }
})(); 