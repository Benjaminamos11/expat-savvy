/**
 * Global Modal Fix
 * This script adds an emergency close button to the page that will forcibly close any modals.
 */

(function() {
  // Create the emergency close button
  function createEmergencyButton() {
    const btn = document.createElement('button');
    btn.id = 'global-emergency-close';
    btn.textContent = 'Emergency Close';
    btn.style.cssText = `
      position: fixed;
      top: 5px;
      right: 5px;
      z-index: 999999;
      background: #ff3c3c;
      color: white;
      font-weight: bold;
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    `;
    
    // Add click handler that forcibly closes any modal using direct DOM manipulation
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Force close modal
      const modal = document.getElementById('consultation-modal');
      if (modal) {
        // Reset modal state
        modal.classList.add('hidden');
        // Reset body state
        document.body.classList.remove('modal-open');
        document.body.style.overflow = 'auto';
        document.body.style.position = 'static';
        document.body.style.width = 'auto';
        document.body.style.height = 'auto';
        
        console.log("Emergency close button clicked - modal forcibly closed");
      }
      
      // Attempt to remove any Cal.com elements
      document.querySelectorAll('[data-cal-namespace]').forEach(el => el.remove());
      
      // Hide this button after use
      this.style.display = 'none';
      
      return false;
    }, true);
    
    // Add to document
    document.body.appendChild(btn);
  }
  
  // Initialize the fix
  function init() {
    // Create the emergency button
    createEmergencyButton();
    
    // Global override to ensure closeConsultationModal works
    window.closeConsultationModal = function() {
      // Call original if it exists
      const original = window._originalCloseConsultationModal;
      if (typeof original === 'function') {
        try { 
          original();
        } catch(e) {
          console.error("Error calling original close function:", e);
        }
      }
      
      // Forcibly close the modal regardless
      const modal = document.getElementById('consultation-modal');
      if (modal) {
        modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
        document.body.style.overflow = 'auto';
        console.log("Modal forcibly closed by global override");
      }
    };
    
    console.log("Global modal fix initialized");
  }
  
  // Initialize immediately or on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM is already loaded
    init();
  }
})();

// Global Modal Fix
console.log("[Fix] Global modal fix script loaded");

// Immediately define the showConsultationModal function globally
window.showConsultationModal = function() {
  console.log("[Fix] showConsultationModal called");
  const modal = document.getElementById('consultation-modal');
  
  if (!modal) {
    console.error("[Fix] Modal element not found!");
    return;
  }
  
  // Save scroll position
  const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  
  // Show the modal
  modal.classList.remove('hidden');
  document.body.classList.add('modal-open');
  
  // Set default insurance type based on path
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
  
  console.log("[Fix] Modal opened with insurance type:", insuranceType);

  // Reset to first step
  const steps = modal.querySelectorAll('.modal-step');
  // Hide all steps
  steps.forEach(step => {
    step.classList.add('hidden');
    step.classList.remove('active');
  });
  
  // Show first step
  const firstStep = modal.querySelector('.modal-step.step-1');
  if (firstStep) {
    firstStep.classList.remove('hidden');
    firstStep.classList.add('active');
  }
  
  // Reset indicators if they exist
  const indicators = modal.querySelectorAll('.modal-step-indicator .step');
  if (indicators.length > 0) {
    indicators.forEach((indicator, index) => {
      const stepNum = index + 1;
      const line = indicator.querySelector('.h-1');
      const circle = indicator.querySelector('.w-4');
      
      if (stepNum === 1) {
        // First step is active
        indicator.classList.add('active');
        indicator.classList.remove('completed');
        if (line) {
          line.classList.remove('bg-gray-300');
          line.classList.add('bg-red-600');
        }
        if (circle) {
          circle.classList.remove('bg-white', 'border-gray-300');
          circle.classList.add('bg-white', 'border-red-600');
        }
      } else {
        // Other steps are inactive
        indicator.classList.remove('active', 'completed');
        if (line) {
          line.classList.remove('bg-red-600');
          line.classList.add('bg-gray-300');
        }
        if (circle) {
          circle.classList.remove('bg-red-600', 'border-red-600', 'text-white');
          circle.classList.add('bg-white', 'border-gray-300');
        }
      }
    });
  }
};

// Attach click handlers to modal buttons when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log("[Fix] DOM loaded, setting up modal handlers");
  
  // Find all consultation buttons
  const buttons = document.querySelectorAll('[onclick*="showConsultationModal()"]');
  buttons.forEach(button => {
    console.log("[Fix] Found modal button:", button);
    // Replace onclick with event listener
    button.removeAttribute('onclick');
    button.addEventListener('click', function(e) {
      e.preventDefault();
      console.log("[Fix] Modal button clicked");
      window.showConsultationModal();
    });
  });
  
  // Add click handler to close modal when clicking outside
  const modal = document.getElementById('consultation-modal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        window.closeConsultationModal();
      }
    });
    
    // Add click handler to close button
    const closeBtn = modal.querySelector('#close-modal-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', window.closeConsultationModal);
    }
  }
});

// Check if modal exists
console.log("[Fix] Checking if modal exists:", !!document.getElementById('consultation-modal')); 