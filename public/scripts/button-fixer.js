/**
 * Button Fixer Script
 * Finds and repairs all possible consultation buttons for maximum compatibility
 */

(function() {
  console.log("Button fixer initializing...");
  
  // List of text patterns that indicate consultation buttons
  const BUTTON_TEXT_PATTERNS = [
    'consultation',
    'consult',
    'book now',
    'book a call',
    'get in touch',
    'contact us',
    'speak to an expert',
    'talk to us',
    'get advice',
    'get started',
    'free insurance',
    'insurance check',
    'get quote',
    'get a quote'
  ];
  
  // Function to fix all buttons
  function fixAllButtons() {
    console.log("Scanning for consultation buttons...");
    
    // APPROACH 1: Find buttons by class or attribute
    const buttonSelectors = [
      // Direct triggers
      '.consultation-button', 
      '[data-open-consultation]',
      '.btn-consultation',
      '.consult-btn',
      '.consultation-link',
      '.cta-button',
      
      // By onclick
      '[onclick*="showConsultation"]',
      '[onclick*="modal"]',
      '[onclick*="consultation"]',
      
      // By standard elements
      'button:not([disabled])',
      'a.btn',
      '.button',
      '[role="button"]'
    ];
    
    // Find all potential buttons
    const potentialButtons = document.querySelectorAll(buttonSelectors.join(','));
    console.log(`Found ${potentialButtons.length} potential buttons`);
    
    // APPROACH 2: Find by text content
    potentialButtons.forEach(button => {
      if (button.hasAttribute('data-fixed-button')) {
        return; // Skip already fixed buttons
      }
      
      // Get button text
      const text = (button.textContent || '').toLowerCase().trim();
      
      // Check if this button is a consultation button by text
      const isConsultButton = BUTTON_TEXT_PATTERNS.some(pattern => 
        text.includes(pattern)
      );
      
      // Process button if it's a consultation button
      if (isConsultButton || 
          button.classList.contains('consultation-button') ||
          button.hasAttribute('data-open-consultation') || 
          button.classList.contains('btn-consultation') ||
          button.classList.contains('consult-btn') ||
          (button.getAttribute('onclick') || '').includes('showConsultation') ||
          (button.getAttribute('onclick') || '').includes('consultation-modal')
      ) {
        // Mark it to avoid duplicate processing
        button.setAttribute('data-fixed-button', 'true');
        
        // Remove potentially problematic onclick handlers
        if (button.hasAttribute('onclick')) {
          button.removeAttribute('onclick');
        }
        
        // Add direct event listener - highest priority using capture phase
        button.addEventListener('click', function(e) {
          // Prevent default only for links to avoid page navigation
          if (button.tagName === 'A') {
            e.preventDefault();
          }
          
          console.log("Consultation button clicked", text);
          
          // Call the global function if it exists
          if (typeof window.showConsultationModal === 'function') {
            window.showConsultationModal();
          } else {
            // Fallback if function not available
            const modal = document.getElementById('consultation-modal');
            if (modal) {
              modal.classList.remove('hidden');
              document.body.classList.add('modal-open');
            }
          }
          
          return false;
        }, true); // true for capture phase - highest priority
        
        console.log("Fixed consultation button:", text);
      }
    });
  }
  
  // Initialize immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixAllButtons);
  } else {
    fixAllButtons();
  }
  
  // Also run after everything is loaded
  window.addEventListener('load', fixAllButtons);
  
  // Run periodically to catch any dynamically added buttons
  setInterval(fixAllButtons, 2000);
  
  console.log("Button fixer installed successfully");
})(); 