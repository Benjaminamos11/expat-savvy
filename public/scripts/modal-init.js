/**
 * Modal Initialization Script
 * Lightweight modal handler with improved performance
 */

(function() {
  // Keep track of active modals to avoid duplicate event handling
  const activeModals = {};
  
  // Store scroll positions for each modal
  const scrollPositions = {};
  
  // Initialize immediately if DOM is ready, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  function init() {
    // Set up global open/close functions
    window.closeConsultationModal = closeModal;
    window.openConsultationModal = openModal;
    
    // Set up button and backdrop handlers
    setupEventDelegation();
  }
  
  // Open modal by ID
  function openModal(modalId = 'consultation-modal') {
    const modal = document.getElementById(modalId);
    if (!modal) return false;
    
    // Don't reopen if already open
    if (!modal.classList.contains('hidden')) return true;
    
    // Save current scroll position before opening modal
    scrollPositions[modalId] = {
      x: window.scrollX || window.pageXOffset,
      y: window.scrollY || window.pageYOffset
    };
    
    // Open the modal
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    
    // Track this modal as active
    activeModals[modalId] = true;
    
    // Dispatch event for other scripts
    document.dispatchEvent(new CustomEvent('modalOpened', { 
      detail: { modalId } 
    }));
    
    return true;
  }
  
  // Close modal by ID
  function closeModal(modalId = 'consultation-modal') {
    const modal = document.getElementById(modalId);
    if (!modal) return false;
    
    // Don't close if already closed
    if (modal.classList.contains('hidden')) return true;
    
    // Close the modal
    modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
    
    // Remove from active modals
    delete activeModals[modalId];
    
    // Restore scroll position after modal is closed
    if (scrollPositions[modalId]) {
      setTimeout(() => {
        window.scrollTo(scrollPositions[modalId].x, scrollPositions[modalId].y);
      }, 10);
    }
    
    // Dispatch event for other scripts
    document.dispatchEvent(new CustomEvent('modalClosed', { 
      detail: { modalId } 
    }));
    
    return true;
  }
  
  // Use event delegation instead of binding to every button
  function setupEventDelegation() {
    // Single click handler for all modal open buttons
    document.addEventListener('click', function(e) {
      // Open buttons
      if (e.target.matches('[data-open-consultation], [data-open-modal]') || 
          e.target.closest('[data-open-consultation], [data-open-modal]')) {
        e.preventDefault();
        e.stopPropagation(); // Prevent default and stop propagation
        
        // Get the target element
        const btn = e.target.matches('[data-open-consultation], [data-open-modal]') ? 
          e.target : 
          e.target.closest('[data-open-consultation], [data-open-modal]');
        
        // Get the target modal ID
        const targetModal = btn.getAttribute('data-modal-target') || 'consultation-modal';
        
        // Open the modal
        openModal(targetModal);
      }
      
      // Close buttons 
      if (e.target.matches('[data-close-modal]') || e.target.closest('[data-close-modal]')) {
        e.preventDefault();
        e.stopPropagation(); // Prevent default and stop propagation
        
        // Get the parent modal
        const modal = e.target.closest('.modal, [id$="-modal"]');
        if (modal) {
          closeModal(modal.id);
        }
      }
      
      // Backdrop clicks
      if (e.target.hasAttribute('data-modal-backdrop')) {
        closeModal(e.target.id);
      }
    });
    
    // Handle escape key for all modals
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && Object.keys(activeModals).length > 0) {
        // Close the last opened modal
        const lastModal = Object.keys(activeModals).pop();
        closeModal(lastModal);
      }
    });
  }
})(); 