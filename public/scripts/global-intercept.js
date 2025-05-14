// Global Intercept - Highest priority click capture
console.log("[INTERCEPT] Global intercept script loaded");

// Intercept ALL clicks site-wide
document.addEventListener('click', function(e) {
  // Look for any element that was clicked
  const target = e.target;
  
  // Check if the clicked element or any of its parents looks like a consultation button
  let element = target;
  let maxLevelsUp = 5; // Check up to 5 levels up the DOM
  
  for (let i = 0; i < maxLevelsUp && element; i++) {
    // Skip if we've already checked this element
    if (element.hasAttribute('data-intercept-checked')) {
      element = element.parentElement;
      continue;
    }
    
    // Mark as checked to avoid reprocessing
    element.setAttribute('data-intercept-checked', 'true');
    
    // Get text content
    const text = element.textContent?.trim();
    if (!text) {
      element = element.parentElement;
      continue;
    }
    
    // Check if element or any parent is a button or link
    const isButton = element.tagName === 'BUTTON' || 
                     element.tagName === 'A' || 
                     element.getAttribute('role') === 'button' ||
                     element.classList.contains('btn') || 
                     element.classList.contains('button');
    
    // Match consultation-related text in any language or format
    const isConsultationLink = text.includes('Book') || 
                               text.includes('book') ||
                               text.includes('Schedule') || 
                               text.includes('schedule') ||
                               text.includes('Consultation') || 
                               text.includes('consultation') ||
                               text.includes('Consult') || 
                               text.includes('consult') ||
                               text.includes('Get Started') || 
                               text.includes('get started');
    
    if (isButton && isConsultationLink) {
      console.log('[INTERCEPT] Intercepted click on consultation-like element:', text);
      
      // Prevent the default behavior
      e.preventDefault();
      e.stopPropagation();
      
      // Show modal directly through DOM manipulation first (most reliable)
      const modal = document.getElementById('consultation-modal');
      if (modal) {
        console.log('[INTERCEPT] Found modal, showing directly');
        modal.classList.remove('hidden');
        document.body.classList.add('modal-open');
      } else if (typeof window.showConsultationModal === 'function') {
        console.log('[INTERCEPT] Using showConsultationModal function');
        window.showConsultationModal();
      } else {
        console.error('[INTERCEPT] Could not find modal or function!');
      }
      
      return false;
    }
    
    // Move up to parent
    element = element.parentElement;
  }
}, true); // Use capture phase for highest priority

// Reset checked flags periodically
setInterval(function() {
  document.querySelectorAll('[data-intercept-checked]').forEach(el => {
    el.removeAttribute('data-intercept-checked');
  });
}, 5000);

// Re-apply periodically to catch dynamically added elements
setInterval(function() {
  console.log("[INTERCEPT] Refreshing intercept checks");
  
  // Find all possible consultation buttons 
  document.querySelectorAll('button, a, [role="button"], .btn, .button').forEach(el => {
    const text = el.textContent?.trim();
    if (!text) return;
    
    // Match consultation-related text
    if (text.includes('Book') || 
        text.includes('Schedule') || 
        text.includes('Consultation') || 
        text.includes('Consult') || 
        text.includes('Get Started')) {
      
      // Add direct onclick handler
      el.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('[INTERCEPT] Clicked button with text:', text);
        
        // Show modal directly
        const modal = document.getElementById('consultation-modal');
        if (modal) {
          modal.classList.remove('hidden');
          document.body.classList.add('modal-open');
        } else if (typeof window.showConsultationModal === 'function') {
          window.showConsultationModal();
        }
        
        return false;
      };
      
      console.log('[INTERCEPT] Added direct handler to:', text);
    }
  });
}, 3000); 