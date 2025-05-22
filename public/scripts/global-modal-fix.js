/**
 * Global Modal Fix Script
 * Fixes issues with modals, particularly related to scrolling
 */

(function() {
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100); // Small delay to ensure other scripts are loaded
  }
  
  function init() {
    // Fix for modal step navigation scrolling
    document.addEventListener('modalStepChange', function(event) {
      // Scroll modal content to top on step change
      const modalContent = document.querySelector('.modal-content');
      if (modalContent) {
        modalContent.scrollTop = 0;
      }
    });
    
    // Enhanced fix for consultation modal buttons
    enhanceConsultationButtons();
    
    // Add explicit handlers for step navigation
    enhanceStepNavigation();
  }
  
  function enhanceConsultationButtons() {
    // Handle all consultation buttons with a direct approach
    document.addEventListener('click', function(e) {
      // Find any consultation-related buttons
      const target = e.target;
      
      // Check for consultation buttons by text content or attributes
      const isConsultationButton = 
        (target.textContent && (target.textContent.includes('Book Free') || 
                                target.textContent.includes('Consultation') || 
                                target.textContent.includes('Schedule'))) ||
        target.hasAttribute('data-open-consultation') ||
        target.closest('[data-open-consultation]');
      
      if (isConsultationButton) {
        // Check if this button is already properly handled
        const hasHandler = target.getAttribute('data-handler-attached') === 'true' ||
                          (target.closest('button') && target.closest('button').getAttribute('data-handler-attached') === 'true');
        
        if (!hasHandler) {
          // Find the closest button or link
          const button = target.closest('button, a');
          if (button) {
            e.preventDefault();
            e.stopPropagation();
            
            // Get scroll position before opening modal
            const scrollPosition = {
              x: window.scrollX || window.pageXOffset,
              y: window.scrollY || window.pageYOffset
            };
            
            // Show the modal directly
            const modal = document.getElementById('consultation-modal');
            if (modal) {
              modal.classList.remove('hidden');
              document.body.classList.add('modal-open');
              
              // Store scroll position on the modal element
              modal.setAttribute('data-scroll-x', scrollPosition.x.toString());
              modal.setAttribute('data-scroll-y', scrollPosition.y.toString());
              
              // Reset to first step
              const steps = modal.querySelectorAll('.modal-step');
              steps.forEach((step, index) => {
                if (index === 0) {
                  step.classList.remove('hidden');
                  step.classList.add('active');
                } else {
                  step.classList.add('hidden');
                  step.classList.remove('active');
                }
              });
              
              // Mark this button as handled
              button.setAttribute('data-handler-attached', 'true');
            }
          }
        }
      }
    }, true); // Use capturing for highest priority
    
    // Enhanced close button handling
    document.addEventListener('click', function(e) {
      const target = e.target;
      const isCloseButton = target.matches('[data-close-modal]') || 
                            target.closest('[data-close-modal]');
      
      if (isCloseButton) {
        e.preventDefault();
        e.stopPropagation();
        
        // Find the modal
        const modal = target.closest('.modal, [id$="-modal"]');
        if (modal) {
          // Hide the modal
          modal.classList.add('hidden');
          document.body.classList.remove('modal-open');
          
          // Restore scroll position
          const scrollX = parseInt(modal.getAttribute('data-scroll-x') || '0');
          const scrollY = parseInt(modal.getAttribute('data-scroll-y') || '0');
          
          setTimeout(() => {
            window.scrollTo(scrollX, scrollY);
          }, 10);
        }
      }
    }, true); // Use capturing for highest priority
  }
  
  function enhanceStepNavigation() {
    // Enhanced next/previous button handling for modal steps
    document.addEventListener('click', function(e) {
      const target = e.target;
      
      // Check for next/prev buttons
      const isNextButton = target.matches('.modal-next-btn') || 
                          target.closest('.modal-next-btn');
      const isPrevButton = target.matches('.modal-prev-btn') || 
                          target.closest('.modal-prev-btn');
      
      if (isNextButton || isPrevButton) {
        // Scroll to top of modal content after a short delay
        setTimeout(() => {
          const modalContent = document.querySelector('.modal-content');
          if (modalContent) {
            modalContent.scrollTop = 0;
          }
        }, 50);
      }
    }, true); // Use capturing for highest priority
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