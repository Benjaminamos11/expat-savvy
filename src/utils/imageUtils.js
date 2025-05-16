/**
 * Utility functions for image optimization and social media sharing
 */

/**
 * Converts WebP images to JPG format for social media sharing
 * Some platforms like Facebook don't properly handle WebP images
 * @param {string} imageUrl - The original image URL
 * @returns {string} - The converted JPG URL or original if not WebP
 */
export function convertToSocialImage(imageUrl) {
  if (!imageUrl) return '';
  
  // Check if image is from Cloudinary and is WebP
  if (imageUrl && imageUrl.includes('cloudinary.com') && imageUrl.endsWith('.webp')) {
    // Replace .webp with .jpg for social media sharing
    return imageUrl.replace('.webp', '.jpg');
  }
  
  // For non-cloudinary WebP images
  if (imageUrl && imageUrl.endsWith('.webp')) {
    // Try to convert by changing extension
    return imageUrl.replace('.webp', '.jpg');
  }
  
  // Return original URL if not WebP or already properly formatted
  return imageUrl;
}

/**
 * Optimizes an image URL for responsive delivery
 * @param {string} imageUrl - The original image URL
 * @param {Object} options - Options for optimization
 * @returns {string} - The optimized image URL
 */
export function optimizeImage(imageUrl, options = {}) {
  const {
    width = 1200,
    height = 630,
    quality = 80,
    format = 'auto'
  } = options;
  
  // Only process Cloudinary images
  if (imageUrl && imageUrl.includes('cloudinary.com')) {
    // Extract base URL and transformation part
    const [baseUrl, transformPart] = imageUrl.split('/upload/');
    
    // Create optimization parameters
    const optimizeParams = `c_fill,w_${width},h_${height},q_${quality},f_${format}`;
    
    // If there are existing transformations, add ours
    if (transformPart && transformPart.includes('/')) {
      const pathParts = transformPart.split('/');
      const existingTransforms = pathParts[0];
      const imagePath = pathParts.slice(1).join('/');
      
      return `${baseUrl}/upload/${existingTransforms},${optimizeParams}/${imagePath}`;
    }
    
    // No existing transformations
    return `${baseUrl}/upload/${optimizeParams}/${transformPart}`;
  }
  
  // Return original for non-Cloudinary images
  return imageUrl;
} 