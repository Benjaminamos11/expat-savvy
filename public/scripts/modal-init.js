/**
 * Modal Initialization Script
 * 
 * This script sets up the modal system in a clean, non-intrusive way.
 * It replaces the global modal functions with ones that respect the whitelist.
 */

(function() {
  // Pages where modals are allowed (EXACT matches only)
  const ALLOWED_PAGES = [
    '/', 
    '/index.html',
    '/consultation',
    '/free-consultation',
    '/contact'
  ];

  // Pages where modals are allowed (includes partial path matching)
  const ALLOWED_PATH_PATTERNS = [
    '/contact',
    '/consultation',
    '/free-consultation'
  ];

  // Check if current page should allow modal
  function isModalAllowedOnCurrentPage() {
    const path = window.location.pathname;
    
    // Check exact matches
    if (ALLOWED_PAGES.includes(path)) {
      return true;
    }
    
    // Check partial matches
    for (const pattern of ALLOWED_PATH_PATTERNS) {
      if (path.includes(pattern)) {
        return true;
      }
    }
    
    // Not allowed
    return false;
  }
  
  // Define safer global modal functions
  window.showConsultationModal = function() {
    console.log("Modal trigger attempted on: " + window.location.pathname);
    
    // For debugging, always allow modals during development
    const isDevMode = window.location.port && (window.location.port !== '80' && window.location.port !== '443');
    const allowModal = isDevMode || isModalAllowedOnCurrentPage();
    
    if (!allowModal) {
      console.log("Modal prevented: Not allowed on this page");
      return false;
    }
    
    const modal = document.getElementById('consultation-modal');
    if (modal) {
      // Save current scroll position if needed
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      
      // Show the modal
      modal.classList.remove('hidden');
      document.body.classList.add('modal-open');
      
      // Set appropriate insurance type based on path
      const path = window.location.pathname;
      let insuranceType = 'health'; // default
      
      if (path.includes('3rd-pillar') || path.includes('pension')) {
        insuranceType = 'pension';
      } else if (path.includes('liability') || path.includes('legal-protection')) {
        insuranceType = 'liability';
      } else if (path.includes('household')) {
        insuranceType = 'household';
      } else if (path.includes('life')) {
        insuranceType = 'life';
      } else if (path.includes('/healthcare/new-health-insurance')) {
        insuranceType = 'new-health';
      }
      
      // Set the data attribute
      modal.setAttribute('data-insurance-type', insuranceType);
      console.log("Modal opened: " + insuranceType);
      
      return true;
    }
    
    return false;
  };
  
  // Close function
  window.closeConsultationModal = function() {
    const modal = document.getElementById('consultation-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.classList.remove('modal-open');
      
      // Restore scroll position if needed
      return true;
    }
    return false;
  };
  
  // Fix all consultation buttons in the document
  function fixAllButtons() {
    console.log("Fixing all consultation buttons");
    
    // Find all consultation buttons
    const buttons = document.querySelectorAll(
      '.consultation-button, [data-open-consultation], .btn-consultation, button[onclick*="showConsultation"], a[onclick*="showConsultation"]'
    );
    
    // Attach proper event handlers to each button
    buttons.forEach(function(button) {
      // Remove the original onclick attribute if it exists
      if (button.hasAttribute('onclick')) {
        button.removeAttribute('onclick');
      }
      
      // Add our clean click handler to each button
      button.addEventListener('click', function(e) {
        e.preventDefault();
        window.showConsultationModal();
      });
      
      console.log("Fixed consultation button:", button);
    });
  }
  
  // Initialize modal system when DOM is ready
  function initializeModal() {
    console.log("Initializing modal system on: " + window.location.pathname);
    
    // Always fix buttons on all pages (but control whether they actually open the modal)
    fixAllButtons();
    
    // Setup close button
    const closeButton = document.getElementById('close-modal-btn');
    if (closeButton) {
      closeButton.addEventListener('click', function() {
        window.closeConsultationModal();
      });
    }
    
    // Setup background click to close
    const modal = document.getElementById('consultation-modal');
    if (modal) {
      modal.addEventListener('click', function(e) {
        if (e.target === this) {
          window.closeConsultationModal();
        }
      });
    }
    
    // Setup ESC key to close
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        const modal = document.getElementById('consultation-modal');
        if (modal && !modal.classList.contains('hidden')) {
          window.closeConsultationModal();
        }
      }
    });
  }
  
  // Initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeModal);
  } else {
    initializeModal();
  }
  
  // Also initialize after fully loaded (catches dynamic content)
  window.addEventListener('load', function() {
    // Short delay to allow dynamic content to be added
    setTimeout(fixAllButtons, 500);
  });
  
  console.log("Modal init script loaded, modals " + 
    (isModalAllowedOnCurrentPage() ? "allowed" : "prevented") + 
    " on " + window.location.pathname);
})(); 