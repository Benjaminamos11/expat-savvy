/**
 * Enhanced utility functions for image optimization and social media sharing
 * Automatically serves WebP format for all images when possible
 */

/**
 * Enhanced image optimization with automatic WebP delivery
 * @param {string} imageUrl - The original image URL
 * @param {Object} options - Options for optimization
 * @returns {string} - The optimized image URL with WebP format
 */
export function optimizeImage(imageUrl, options = {}) {
  const {
    width = 1200,
    height = 630,
    quality = 'auto:good',  // Better quality optimization
    format = 'auto',        // Auto format selection (prioritizes WebP)
    crop = 'fill',
    gravity = 'auto',       // Smart cropping
    fetchFormat = 'auto',   // Additional format optimization
    progressive = true,     // Progressive loading
    stripMetadata = true    // Remove metadata for smaller files
  } = options;
  
  // Only process Cloudinary images
  if (imageUrl && imageUrl.includes('cloudinary.com')) {
    // Extract base URL and transformation part
    const [baseUrl, transformPart] = imageUrl.split('/upload/');
    
    if (!transformPart) return imageUrl;
    
    // Build optimization parameters
    const params = [];
    if (width) params.push(`w_${width}`);
    if (height) params.push(`h_${height}`);
    params.push(`c_${crop}`);
    params.push(`g_${gravity}`);
    params.push(`q_${quality}`);
    params.push(`f_${format}`);
    if (progressive) params.push('fl_progressive');
    if (stripMetadata) params.push('fl_strip_profile');
    
    const optimizeParams = params.join(',');
    
    // If there are existing transformations, merge them intelligently
    if (transformPart.includes('/')) {
      const pathParts = transformPart.split('/');
      const existingTransforms = pathParts[0];
      const imagePath = pathParts.slice(1).join('/');
      
      // Check if existing transforms already have format specified
      if (existingTransforms.includes('f_')) {
        // Replace existing format with our auto format
        const updatedTransforms = existingTransforms.replace(/f_[^,]+/, `f_${format}`);
        return `${baseUrl}/upload/${updatedTransforms},${optimizeParams.replace(`f_${format},`, '')}/${imagePath}`;
      }
      
      return `${baseUrl}/upload/${existingTransforms},${optimizeParams}/${imagePath}`;
    }
    
    // No existing transformations
    return `${baseUrl}/upload/${optimizeParams}/${transformPart}`;
  }
  
  // Return original for non-Cloudinary images
  return imageUrl;
}

/**
 * Generates WebP image with JPG fallback for maximum compatibility
 * @param {string} imageUrl - The original image URL
 * @param {Object} options - Options for optimization
 * @returns {Object} - Object with webp and fallback URLs
 */
export function getImageWithFallback(imageUrl, options = {}) {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    return { webp: imageUrl, fallback: imageUrl };
  }
  
  const webpUrl = optimizeImage(imageUrl, { ...options, format: 'webp' });
  const fallbackUrl = optimizeImage(imageUrl, { ...options, format: 'jpg' });
  
  return {
    webp: webpUrl,
    fallback: fallbackUrl
  };
}

/**
 * Generates responsive image srcset with WebP format
 * @param {string} imageUrl - The original image URL
 * @param {Array} breakpoints - Array of width breakpoints
 * @returns {string} - Responsive srcset string
 */
export function generateResponsiveSrcSet(imageUrl, breakpoints = [400, 800, 1200, 1600]) {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    return '';
  }
  
  return breakpoints
    .map(width => {
      const optimizedUrl = optimizeImage(imageUrl, { 
        width, 
        quality: 'auto:good',
        format: 'auto',
        crop: 'scale' // Preserve aspect ratio for responsive images
      });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
}

/**
 * Optimizes images specifically for hero sections
 * @param {string} imageUrl - The original image URL
 * @param {number} width - Target width
 * @returns {string} - Optimized hero image URL
 */
export function optimizeHeroImage(imageUrl, width = 1920) {
  return optimizeImage(imageUrl, {
    width,
    height: Math.round(width * 0.6), // 16:10 aspect ratio
    quality: 'auto:best',
    format: 'auto',
    crop: 'fill',
    gravity: 'auto',
    progressive: true
  });
}

/**
 * Optimizes images for thumbnails and cards
 * @param {string} imageUrl - The original image URL
 * @param {number} size - Square size for thumbnail
 * @returns {string} - Optimized thumbnail URL
 */
export function optimizeThumbnail(imageUrl, size = 300) {
  return optimizeImage(imageUrl, {
    width: size,
    height: size,
    quality: 'auto:good',
    format: 'auto',
    crop: 'fill',
    gravity: 'face', // Focus on faces if present
    progressive: false // Small images don't need progressive loading
  });
}

/**
 * Converts WebP images to JPG format for social media sharing
 * Some platforms like Facebook don't properly handle WebP images
 * @param {string} imageUrl - The original image URL
 * @returns {string} - The converted JPG URL or original if not WebP
 */
export function convertToSocialImage(imageUrl) {
  if (!imageUrl) return '';
  
  // For Cloudinary images, force JPG format for social sharing
  if (imageUrl && imageUrl.includes('cloudinary.com')) {
    return optimizeImage(imageUrl, {
      width: 1200,
      height: 630,
      quality: 85, // Higher quality for social sharing
      format: 'jpg', // Always JPG for social media
      crop: 'fill',
      gravity: 'auto'
    });
  }
  
  // For non-cloudinary WebP images
  if (imageUrl && imageUrl.endsWith('.webp')) {
    return imageUrl.replace('.webp', '.jpg');
  }
  
  return imageUrl;
}

/**
 * Simple function to add WebP optimization to any Cloudinary URL
 * @param {string} imageUrl - The original Cloudinary image URL
 * @returns {string} - The URL with WebP optimization
 */
export function addWebPOptimization(imageUrl) {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }
  
  // Check if it already has transformations
  if (imageUrl.includes('/upload/') && !imageUrl.includes('f_auto')) {
    return imageUrl.replace('/upload/', '/upload/f_auto,q_auto/');
  }
  
  return imageUrl;
} 