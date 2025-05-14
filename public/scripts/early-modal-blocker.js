/**
 * EARLY MODAL BLOCKER
 * This script runs as early as possible to prevent modals from appearing
 * before the main fix script has a chance to load and execute.
 */

// Run immediately
(function() {
  console.log("🛑 Early Modal Blocker activated");
  
  // Whitelist of allowed paths - EXACT MATCH ONLY
  const ALLOWED_PATHS = [
    '/', 
    '/index.html',
    '/consultation',
    '/free-consultation',
    '/contact'
  ];
  
  // Check if the current path should allow modals
  function shouldBlockModals() {
    const path = window.location.pathname;
    return !ALLOWED_PATHS.includes(path); // Block if not in whitelist
  }
  
  // Only proceed if we should block modals on this page
  if (!shouldBlockModals()) {
    console.log("🟢 Early blocker: This page is allowed to have modals");
    // Add allow-modals class to body for CSS targeting
    document.addEventListener('DOMContentLoaded', function() {
      document.body.classList.add('allow-modals');
    });
    return;
  }
  
  console.log("🔴 Early blocker: Preventing modals on " + window.location.pathname);
  
  // Make sure body DOESN'T have allow-modals class for CSS targeting
  document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.remove('allow-modals');
  });
  
  // Preemptively define the showConsultationModal function to block it
  window.showConsultationModal = function() {
    console.warn("⛔ Early blocker: Prevented modal opening");
    return false;
  };
  
  // Also preemptively define the close function
  window.closeConsultationModal = function() {
    // Find modal and close it
    const modal = document.getElementById('consultation-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.add('hidden');
      document.body.classList.remove('modal-open');
      console.log("⛔ Early blocker: Closed modal");
    }
  };
  
  // Setup MutationObserver to watch for modal being added to DOM
  function setupObserver() {
    if (typeof MutationObserver === 'undefined') return;
    
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if modal was added
          const modal = document.getElementById('consultation-modal');
          if (modal && !modal.classList.contains('hidden')) {
            console.warn("⛔ Early blocker: Found modal, hiding it");
            modal.style.display = 'none';
            modal.classList.add('hidden');
            document.body.classList.remove('modal-open');
          }
        }
      });
    });
    
    // Start observing
    observer.observe(document.documentElement, { 
      childList: true, 
      subtree: true 
    });
    
    // Set up a simple check to run periodically until the main fix script loads
    const intervalId = setInterval(function() {
      const modal = document.getElementById('consultation-modal');
      if (modal && !modal.classList.contains('hidden')) {
        console.warn("⛔ Early blocker: Found modal during interval check, hiding it");
        modal.style.display = 'none';
        modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
      }
      
      // Stop after 10 seconds (main script should be loaded by then)
      if (window.EMERGENCY_CLOSE) {
        clearInterval(intervalId);
        console.log("✅ Early blocker: Main modal fix detected, deactivating early blocker");
      }
    }, 200);
  }
  
  // Run setup when DOM is available
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupObserver);
  } else {
    setupObserver();
  }
})(); 