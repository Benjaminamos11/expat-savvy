/**
 * Emergency Modal Fix Script - Critical Repair for Modal Issues
 */

(function() {
  console.log("[Critical Modal Fix] Initializing critical fix...");
  
  // Create a completely standalone close function that doesn't rely on other code
  function forceCloseModal() {
    try {
      // Direct DOM operations to force modal closure
      const modal = document.getElementById('consultation-modal');
      if (modal) {
        modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('position');
        document.body.style.removeProperty('width');
        document.body.style.removeProperty('height');
        document.body.style.removeProperty('overflow');
        console.log("[Critical Modal Fix] Modal force closed");
      }
      
      // Clean up any leftover Cal elements that might be causing issues
      const calElements = document.querySelectorAll('[data-cal-namespace]');
      calElements.forEach(el => {
        try { el.remove(); } catch(e) {}
      });
    } catch(e) {
      console.error("[Critical Modal Fix] Error while force closing:", e);
    }
  }
  
  // Override existing functions to ensure our solution takes precedence
  window.closeConsultationModal = forceCloseModal;
  
  // Add emergency close button with standalone functionality
  function addEmergencyCloseButton() {
    // Remove any existing emergency button first
    const existingBtn = document.getElementById('emergency-close-btn');
    if (existingBtn) existingBtn.remove();
    
    // Create new emergency button
    const closeBtn = document.createElement('button');
    closeBtn.id = 'emergency-close-btn';
    closeBtn.innerText = 'Emergency Close';
    closeBtn.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 99999; background: red; color: white; padding: 8px 15px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 10px rgba(0,0,0,0.3);';
    
    // Use direct DOM operation for the click handler
    closeBtn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      forceCloseModal();
      this.remove();
      return false;
    };
    
    document.body.appendChild(closeBtn);
    console.log("[Critical Modal Fix] Emergency close button added");
  }
  
  // Setup direct event listeners with our standalone close function
  function setupDirectEventListeners() {
    // ESC key handler
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        const modal = document.getElementById('consultation-modal');
        if (modal && !modal.classList.contains('hidden')) {
          forceCloseModal();
          console.log("[Critical Modal Fix] Closed via ESC key");
        }
      }
    }, true); // Use capture phase for higher priority
    
    // Direct click handler on modal backdrop
    document.addEventListener('click', function(e) {
      const modal = document.getElementById('consultation-modal');
      if (modal && !modal.classList.contains('hidden') && e.target === modal) {
        forceCloseModal();
        console.log("[Critical Modal Fix] Closed via backdrop click");
      }
    }, true); // Use capture phase for higher priority
    
    // Fix for close button
    setTimeout(function() {
      const closeBtn = document.getElementById('close-modal-btn');
      if (closeBtn) {
        // Remove existing handlers to prevent conflicts
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        
        newCloseBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          forceCloseModal();
          console.log("[Critical Modal Fix] Closed via close button");
          return false;
        }, true);
      }
    }, 500);
  }
  
  // Check for stuck modal and add emergency button if needed
  function monitorForStuckModal() {
    setInterval(function() {
      const modal = document.getElementById('consultation-modal');
      if (modal && !modal.classList.contains('hidden')) {
        // Modal is open, add emergency button if not already present
        if (!document.getElementById('emergency-close-btn')) {
          addEmergencyCloseButton();
        }
      } else {
        // Modal is closed, remove emergency button if present
        const emergencyBtn = document.getElementById('emergency-close-btn');
        if (emergencyBtn) {
          emergencyBtn.remove();
        }
      }
    }, 2000);
  }
  
  // Initialize our fix
  function init() {
    // Set up event listeners first
    setupDirectEventListeners();
    
    // Start monitoring for stuck modal
    monitorForStuckModal();
    
    // Add emergency button if modal is already stuck
    setTimeout(function() {
      const modal = document.getElementById('consultation-modal');
      if (modal && !modal.classList.contains('hidden')) {
        addEmergencyCloseButton();
      }
    }, 1000);
    
    console.log("[Critical Modal Fix] Initialization complete");
  }
  
  // Run immediately
  init();
})(); 