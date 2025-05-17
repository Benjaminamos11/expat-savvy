/**
 * Performance Optimizations Script - Enhanced Version
 */

// Execute immediately
(function() {
  // Implement priority loading for critical resources
  prioritizeCriticalResources();
  
  // Add preconnects immediately
  addPreconnects();
  
  // Execute other optimizations when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOptimizations);
  } else {
    // DOM already loaded, run now
    initOptimizations();
  }
  
  // Prioritize critical resources to improve page load
  function prioritizeCriticalResources() {
    // Delay loading of non-critical scripts
    const nonCriticalScripts = document.querySelectorAll('script:not([type="application/ld+json"]):not([type="module"]):not([src*="performance"]):not([src*="init"])');
    nonCriticalScripts.forEach(script => {
      if (!script.hasAttribute('defer') && !script.hasAttribute('async')) {
        script.defer = true;
      }
    });
  }
  
  function initOptimizations() {
    // Execute optimizations
    lazyLoadImages();
    optimizeFonts();
    fixSvgPathErrors();
    deferThirdPartyEmbeds();
    addImageDimensions();
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
          
          // Set width and height if missing (to reduce layout shift)
          if ((!img.hasAttribute('width') || !img.hasAttribute('height')) && 
              img.hasAttribute('src') && !img.src.includes('data:image')) {
            img.style.aspectRatio = '16/9';
          }
        }
        i++;
      }
    }
  }
  
  // Simple check for above-the-fold content
  function isAboveTheFold(el) {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.8; // Only elements fully in viewport are not lazy loaded
  }
  
  // Add dimensions to images that are missing them
  function addImageDimensions() {
    const images = document.querySelectorAll('img:not([width]):not([height])');
    images.forEach(img => {
      // If the image is loaded, use its natural dimensions
      if (img.complete) {
        if (img.naturalWidth && img.naturalHeight) {
          img.setAttribute('width', img.naturalWidth);
          img.setAttribute('height', img.naturalHeight);
        } else {
          // Set a reasonable default aspect ratio
          img.style.aspectRatio = '16/9';
        }
      } else {
        // For unloaded images, add an onload handler
        img.onload = function() {
          if (this.naturalWidth && this.naturalHeight) {
            this.setAttribute('width', this.naturalWidth);
            this.setAttribute('height', this.naturalHeight);
          }
        };
        
        // Set a default aspect ratio while loading
        img.style.aspectRatio = '16/9';
      }
    });
  }
  
  // Optimize fonts loading
  function optimizeFonts() {
    // Add font-display: swap to any Google Fonts we're loading
    const fontStyles = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
    fontStyles.forEach(link => {
      // Modify link to add display=swap parameter if not present
      if (link.href.indexOf('display=swap') === -1) {
        link.href = link.href + (link.href.indexOf('?') === -1 ? '?' : '&') + 'display=swap';
      }
      
      // Add preload for critical fonts
      if (!link.hasAttribute('rel') || link.getAttribute('rel') !== 'preload') {
        const preloadLink = document.createElement('link');
        preloadLink.href = link.href;
        preloadLink.rel = 'preload';
        preloadLink.as = 'style';
        document.head.appendChild(preloadLink);
      }
    });
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
  
  // Defer loading of third-party embeds until interaction or visibility
  function deferThirdPartyEmbeds() {
    // Skip deferring on the consultation page where Cal.com is critical
    if (window.location.pathname.includes('free-consultation')) {
      return;
    }
    
    // Use Intersection Observer to load third-party content when visible
    if ('IntersectionObserver' in window) {
      const embedPlaceholders = document.querySelectorAll('.embed-placeholder, [data-embed-src]');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const placeholder = entry.target;
            const embedSrc = placeholder.getAttribute('data-embed-src');
            
            if (embedSrc) {
              if (placeholder.tagName === 'IFRAME') {
                placeholder.src = embedSrc;
              } else {
                const iframe = document.createElement('iframe');
                iframe.src = embedSrc;
                iframe.width = placeholder.getAttribute('data-width') || '100%';
                iframe.height = placeholder.getAttribute('data-height') || '100%';
                iframe.frameBorder = '0';
                iframe.allowFullscreen = true;
                placeholder.appendChild(iframe);
              }
              
              // Stop observing after loading
              observer.unobserve(placeholder);
            }
          }
        });
      }, {
        rootMargin: '200px', // Load when within 200px of viewport
        threshold: 0
      });
      
      embedPlaceholders.forEach(placeholder => {
        observer.observe(placeholder);
      });
    }
  }
  
  // Add preconnect links for critical domains
  function addPreconnects() {
    const domains = [
      'https://app.cal.com',
      'https://res.cloudinary.com',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://cdn.prod.website-files.com'
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