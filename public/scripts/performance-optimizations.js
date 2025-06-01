/**
 * Safe Performance Optimizations Script
 * Focus on image optimization and safe enhancements only
 */

(function() {
  'use strict';
  
  // Execute optimizations when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOptimizations);
  } else {
    initOptimizations();
  }

  function initOptimizations() {
    try {
      // Safe image optimizations
      optimizeImages();
      
      // Add lazy loading for images below the fold
      addLazyLoading();
      
      // Fix layout shifts
      preventLayoutShifts();
      
    } catch (error) {
      console.warn('Performance optimization error:', error);
    }
  }

  function optimizeImages() {
    const images = document.querySelectorAll('img:not([data-optimized])');
    
    images.forEach(img => {
      // Mark as optimized to avoid double processing
      img.setAttribute('data-optimized', 'true');
      
      // Optimize Cloudinary URLs if not already optimized
      if (img.src && img.src.includes('cloudinary.com') && !img.src.includes('q_auto')) {
        const originalSrc = img.src;
        if (originalSrc.includes('/upload/')) {
          const parts = originalSrc.split('/upload/');
          if (parts.length === 2) {
            const optimizedSrc = `${parts[0]}/upload/q_auto,f_auto/${parts[1]}`;
            img.src = optimizedSrc;
          }
        }
      }
      
      // Add error handling for images
      img.addEventListener('error', function() {
        if (this.src.includes('cloudinary.com') && this.src.includes('f_auto')) {
          // Fallback to JPG if WebP fails
          this.src = this.src.replace('f_auto', 'f_jpg');
        }
      }, { once: true });
    });
  }

  function addLazyLoading() {
    // Only add lazy loading to images that are clearly below the fold
    const images = document.querySelectorAll('img:not([loading]):not([fetchpriority])');
    
    images.forEach((img, index) => {
      // Skip the first 3 images (likely above the fold)
      if (index < 3) return;
      
      const rect = img.getBoundingClientRect();
      // Only add lazy loading if image is significantly below the viewport
      if (rect.top > window.innerHeight + 200) {
        img.loading = 'lazy';
      }
    });
  }

  function preventLayoutShifts() {
    // Add aspect ratios to images without dimensions
    const images = document.querySelectorAll('img:not([width]):not([height])');
    
    images.forEach(img => {
      if (!img.style.aspectRatio && !img.style.width && !img.style.height) {
        // Only add aspect ratio if the image doesn't have any sizing
        img.style.aspectRatio = '16/9';
        img.style.objectFit = 'contain';
      }
    });
  }

})(); 