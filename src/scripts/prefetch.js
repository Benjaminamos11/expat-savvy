// Custom prefetch implementation with error handling
export function prefetch(url, options = {}) {
  // Check connection speed
  if (navigator.connection) {
    const { effectiveType, saveData } = navigator.connection;
    if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
      return Promise.reject(new Error('Network conditions are poor'));
    }
  }

  // Proceed with prefetch
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  
  return new Promise((resolve, reject) => {
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  }).catch(error => {
    console.warn(`Failed to prefetch ${url}:`, error);
    return Promise.reject(error);
  });
}