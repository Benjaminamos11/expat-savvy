/**
 * Performance Optimizations Script
 * Implements various performance improvements to address issues identified in Lighthouse reports
 */

// Execute when DOM is fully loaded to not block rendering
document.addEventListener('DOMContentLoaded', function() {
  // Lazy load images that are below the fold
  lazyLoadImages();
  
  // Optimize third-party resource loading
  deferThirdPartyResources();
  
  // Fix SVG path errors
  fixSvgPathErrors();
});

/**
 * Lazy loads images that are below the fold
 */
function lazyLoadImages() {
  // Find all images without the loading attribute
  const images = document.querySelectorAll('img:not([loading])');
  
  images.forEach(img => {
    // Skip images that are in the viewport (above the fold)
    if (!isAboveTheFold(img)) {
      // Add loading="lazy" attribute
      img.setAttribute('loading', 'lazy');
      
      // Add explicit width and height if missing to prevent layout shifts
      if (!img.getAttribute('width') && !img.getAttribute('height')) {
        // Try to preserve aspect ratio if image is loaded
        if (img.complete && img.naturalWidth) {
          const aspectRatio = img.naturalHeight / img.naturalWidth;
          // Set a default width based on parent container width or use a reasonable default
          const containerWidth = img.parentElement ? img.parentElement.clientWidth : 300;
          const width = Math.min(containerWidth, 800); // Cap at 800px
          const height = Math.round(width * aspectRatio);
          
          img.setAttribute('width', width.toString());
          img.setAttribute('height', height.toString());
        } else {
          // If image isn't loaded yet, add event listener to set dimensions later
          img.addEventListener('load', function() {
            if (!img.getAttribute('width') && !img.getAttribute('height')) {
              const aspectRatio = img.naturalHeight / img.naturalWidth;
              const containerWidth = img.parentElement ? img.parentElement.clientWidth : 300;
              const width = Math.min(containerWidth, 800);
              const height = Math.round(width * aspectRatio);
              
              img.setAttribute('width', width.toString());
              img.setAttribute('height', height.toString());
            }
          });
        }
      }
    }
  });
}

/**
 * Checks if an element is likely above the fold
 * @param {HTMLElement} el - Element to check
 * @returns {boolean} - True if element is likely above the fold
 */
function isAboveTheFold(el) {
  const rect = el.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  
  // Consider elements in the top 1.5x viewport height as "above the fold"
  return rect.top < viewportHeight * 1.5;
}

/**
 * Defers loading of non-critical third-party resources
 */
function deferThirdPartyResources() {
  // Find any references to Cal.com that aren't using the lazy loading approach
  const calElements = document.querySelectorAll('iframe[src*="cal.com"], iframe[data-src*="cal.com"]');
  
  calElements.forEach(element => {
    // Don't modify iframes that are already properly loaded by our lazy approach
    if (!element.closest('#cal-booking-placeholder') && !element.closest('#my-cal-inline')) {
      // Store the original src
      const originalSrc = element.getAttribute('src');
      if (originalSrc) {
        // Remove the src to prevent loading
        element.removeAttribute('src');
        // Store the original src in a data attribute
        element.setAttribute('data-cal-src', originalSrc);
        
        // Create an intersection observer to load the resource when in viewport
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              // Restore the src attribute to load the resource
              entry.target.setAttribute('src', entry.target.getAttribute('data-cal-src'));
              // Stop observing
              observer.unobserve(entry.target);
            }
          });
        }, {
          rootMargin: '200px' // Load when within 200px of viewport
        });
        
        // Start observing the element
        observer.observe(element);
      }
    }
  });
}

/**
 * Fixes SVG path errors reported in console
 */
function fixSvgPathErrors() {
  // Find SVG elements with path problems
  const svgPaths = document.querySelectorAll('path[d]');
  
  svgPaths.forEach(path => {
    const dValue = path.getAttribute('d');
    if (dValue) {
      // Check for common SVG path errors
      if (dValue.includes('..') || dValue.includes('-.') || /[0-9]\.[0-9]+\.[0-9]/.test(dValue)) {
        console.warn('Found SVG path with potential syntax error:', dValue);
        // Try to fix the path by replacing problematic sequences
        let fixedPath = dValue
          .replace(/\.\./g, '.') // Replace double dots with single dot
          .replace(/\-\./g, '-0.') // Replace -. with -0.
          .replace(/([0-9])\.[0-9]+\.([0-9])/g, '$1.$2'); // Fix numbers with multiple decimal points
        
        // Apply the fixed path
        path.setAttribute('d', fixedPath);
      }
    }
  });
}

/**
 * Remove unused CSS by checking which classes are actually used in the DOM
 * This is a simplified approach and should be used with caution
 */
function removeUnusedCSS() {
  // This is a more advanced technique that would need to be implemented
  // with a build tool like PurgeCSS rather than at runtime
  console.log('CSS optimization should be done at build time');
}

/**
 * Preconnect to third-party domains to improve performance
 */
function addPreconnects() {
  const preconnectDomains = [
    'https://app.cal.com',
    'https://res.cloudinary.com',
    'https://cdn.prod.website-files.com'
  ];
  
  preconnectDomains.forEach(domain => {
    // Skip if preconnect already exists
    if (!document.querySelector(`link[rel="preconnect"][href="${domain}"]`)) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  });
}

// Call this function right away to add preconnects as early as possible
addPreconnects(); 