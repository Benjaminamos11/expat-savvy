/**
 * Performance Optimizations Script - Enhanced Version with Loading Safety
 * Optimized for blog pages and better Core Web Vitals
 */

// Execute immediately with error handling
(function() {
  try {
    // Add loading safety check
    addLoadingSafetyCheck();
    
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
  } catch (error) {
    console.warn('Performance optimization error:', error);
    // Continue with basic initialization
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', basicInit);
    } else {
      basicInit();
    }
  }
  
  // Add loading safety check to prevent partial page loads
  function addLoadingSafetyCheck() {
    // Prevent partial page loads
    let isLoaded = false;
    
    const checkLoaded = () => {
      if (isLoaded) return;
      if (document.readyState === 'complete') {
        isLoaded = true;
        document.body.classList.add('page-loaded');
      }
    };
    
    document.addEventListener('readystatechange', checkLoaded);
    window.addEventListener('load', checkLoaded);
    
    // Fallback safety check
    setTimeout(checkLoaded, 5000);
  }
  
  // Basic initialization fallback
  function basicInit() {
    try {
      // Ensure body is visible
      document.body.style.visibility = 'visible';
      document.body.style.opacity = '1';
      
      // Basic image loading
      const images = document.querySelectorAll('img:not([loading])');
      images.forEach(img => {
        if (!img.complete) {
          img.loading = 'eager';
        }
      });
    } catch (error) {
      console.warn('Basic init error:', error);
    }
  }
  
  // Prioritize critical resources to improve page load
  function prioritizeCriticalResources() {
    // Preload critical fonts
    const fontPreloads = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
    ];
    
    fontPreloads.forEach(href => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = href;
        link.onload = function() {
          this.onload = null;
          this.rel = 'stylesheet';
        };
        document.head.appendChild(link);
      }
    });
  }
  
  function initOptimizations() {
    // Optimize images
    optimizeImages();
    
    // Optimize external resources
    optimizeExternalResources();
    
    // Implement intersection observer for lazy loading
    implementLazyLoading();
    
    // Optimize CSS delivery
    optimizeCSSDelivery();
    
    // Minimize layout shifts
    minimizeLayoutShifts();
  }
  
  function optimizeImages() {
    const images = document.querySelectorAll('img:not([data-optimized])');
    
    images.forEach(img => {
      // Mark as optimized to avoid double processing
      img.setAttribute('data-optimized', 'true');
      
      // Add loading="lazy" if not already set and not above fold
      if (!img.hasAttribute('loading') && !img.hasAttribute('fetchpriority')) {
        const rect = img.getBoundingClientRect();
        if (rect.top > window.innerHeight) {
          img.loading = 'lazy';
        }
      }
      
      // Optimize Cloudinary URLs if not already optimized
      if (img.src.includes('cloudinary.com') && !img.src.includes('q_auto')) {
        const originalSrc = img.src;
        if (originalSrc.includes('/upload/')) {
          const parts = originalSrc.split('/upload/');
          if (parts.length === 2) {
            const optimizedSrc = `${parts[0]}/upload/q_auto,f_auto,dpr_auto/${parts[1]}`;
            img.src = optimizedSrc;
          }
        }
      }
      
      // Add error handling
      img.addEventListener('error', function() {
        if (this.src.includes('cloudinary.com')) {
          // Fallback to original format if WebP fails
          this.src = this.src.replace('f_auto', 'f_jpg');
        }
      }, { once: true });
    });
  }
  
  function implementLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            
            // Load the image
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            
            // Load srcset if available
            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
              img.removeAttribute('data-srcset');
            }
            
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      }, {
        root: null,
        rootMargin: '50px',
        threshold: 0.01
      });
      
      // Observe lazy images
      document.querySelectorAll('img[data-src], img.lazy').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }
  
  function optimizeExternalResources() {
    // Defer non-critical external scripts
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      if (script.src.includes('facebook.net') || 
          script.src.includes('googletagmanager.com') ||
          script.src.includes('google-analytics.com')) {
        if (!script.hasAttribute('async') && !script.hasAttribute('defer')) {
          script.async = true;
        }
      }
    });
  }
  
  function optimizeCSSDelivery() {
    // Convert non-critical CSS to load asynchronously
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
    stylesheets.forEach(link => {
      if (!link.href.includes('modal-styles.css') && 
          !link.href.includes('critical.css')) {
        // Use media trick for async CSS loading
        link.media = 'print';
        link.onload = function() {
          this.media = 'all';
          this.onload = null;
        };
      }
    });
  }
  
  function minimizeLayoutShifts() {
    // Add dimensions to images without them
    const images = document.querySelectorAll('img:not([width]):not([height])');
    images.forEach(img => {
      // Set default dimensions to prevent layout shift
      if (!img.style.aspectRatio) {
        img.style.aspectRatio = '16/9';
        img.style.objectFit = 'cover';
      }
    });
    
    // Reserve space for iframes
    const iframes = document.querySelectorAll('iframe:not([width]):not([height])');
    iframes.forEach(iframe => {
      if (!iframe.style.aspectRatio) {
        iframe.style.aspectRatio = '16/9';
        iframe.style.width = '100%';
      }
    });
  }
  
  // Add preconnect links for critical domains
  function addPreconnects() {
    const preconnects = [
      'https://res.cloudinary.com',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];
    
    preconnects.forEach(href => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = href;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });
  }
})(); 