/**
 * NUCLEAR MODAL FIX - COMPLETE SITE REPAIR
 * 
 * This script completely locks down the modal system to prevent unexpected openings
 * and provides multiple emergency closing mechanisms.
 * 
 * DO NOT MODIFY THIS SCRIPT - IT IS THE LAST LINE OF DEFENSE.
 */

// Run immediately with IIFE
(function() {
  console.log("☢️ NUCLEAR MODAL FIX ACTIVATED - MAXIMUM PROTECTION MODE");
  
  // GLOBAL STATE
  const EMERGENCY_BUTTON_ID = 'nuclear-emergency-btn';
  const ULTRA_PROTECTION = true; // Enable the most aggressive protection
  let isDebugMode = true; // Enable debug logs to help diagnose issues
  
  // HELPER FUNCTIONS
  function debugLog(...args) {
    if (isDebugMode) console.log("🔍 [DEBUG]", ...args);
  }
  
  function infoLog(...args) {
    console.log("ℹ️ [INFO]", ...args);
  }
  
  function warnLog(...args) {
    console.warn("⚠️ [WARN]", ...args);
  }
  
  function errorLog(...args) {
    console.error("❌ [ERROR]", ...args);
  }
  
  function successLog(...args) {
    console.log("✅ [SUCCESS]", ...args);
  }

  // 1. DETERMINE PAGE TYPE - Is this a page where modals should be blocked?
  function shouldBlockModals() {
    const path = window.location.pathname;
    
    // ULTRA PROTECTION: Default to blocking on ALL pages initially
    if (ULTRA_PROTECTION) {
      // Pages where modal SHOULD be allowed (explicit whitelist - very strict)
      const exactAllowedPaths = [
        '/', 
        '/index.html',
        '/consultation',
        '/free-consultation',
        '/contact'
      ];
      
      // Check EXACT path match only - more restrictive
      if (exactAllowedPaths.includes(path)) {
        debugLog("Page is explicitly whitelisted, modals allowed:", path);
        return false;
      }
      
      // Block on ALL other pages
      debugLog("ULTRA PROTECTION: Blocking modals on:", path);
      return true;
    }
    
    // Less restrictive rules (not used with ULTRA_PROTECTION)
    const allowedPaths = [
      '/', 
      '/index.html',
      '/consultation',
      '/free-consultation',
      '/contact'
    ];
    
    // Check if we're on an allowed page
    for (const allowedPath of allowedPaths) {
      if (path === allowedPath) {
        debugLog("Page is whitelisted, modals allowed:", path);
        return false;
      }
    }
    
    // Block modals on all other pages
    debugLog("Page is not whitelisted, blocking modals:", path);
    return true;
  }

  // 2. PROTECT USER FROM MODAL OPENING - MAXIMUM STRENGTH
  function preventModalOpening() {
    // Always check if we should block modals first
    const blockModals = shouldBlockModals();
    
    infoLog("🛡️ Activating modal prevention on:", window.location.pathname, 
           "Blocking:", blockModals ? "YES" : "NO");
    
    if (blockModals) {
      // ULTRA PROTECTION: Immediately hide any existing modal
      const existingModal = document.getElementById('consultation-modal');
      if (existingModal && !existingModal.classList.contains('hidden')) {
        warnLog("Found open modal on page load! Force closing...");
        forceCloseModal();
      }
      
      // DEFENSE LAYER 1: Hard override global open functions
      window.showConsultationModal = function() {
        warnLog("⛔ BLOCKED: Prevented modal opening via showConsultationModal()");
        forceCloseModal(); // Always close just in case
        return false;
      };
      
      // DEFENSE LAYER 2: Block ALL onclick handlers
      document.addEventListener('click', function(e) {
        // Check if click target or parent has modal-related onclick
        let el = e.target;
        let depth = 0;
        const maxDepth = 10; // Check deeper in the tree
        
        while (el && depth < maxDepth) {
          if (el.hasAttribute && el.hasAttribute('onclick')) {
            const onclickValue = el.getAttribute('onclick');
            if (onclickValue && 
                (onclickValue.includes('consultation-modal') || 
                 onclickValue.includes('showConsultationModal') ||
                 onclickValue.includes('consultation'))) {
              warnLog("⛔ BLOCKED click on element with modal-related onclick:", onclickValue);
              e.preventDefault();
              e.stopPropagation();
              return false;
            }
          }
          
          // Also check class names for consultation buttons
          if (el.classList && 
             (el.classList.contains('consultation-button') ||
              el.classList.contains('consultation') ||
              el.classList.contains('consult-btn'))) {
            warnLog("⛔ BLOCKED click on button with consultation class");
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
          
          el = el.parentElement;
          depth++;
        }
      }, true); // Use capture phase for highest priority
      
      // DEFENSE LAYER 3: Continuous monitoring for modal elements
      setInterval(function() {
        // Check if modal is somehow open
        const modal = document.getElementById('consultation-modal');
        if (modal && !modal.classList.contains('hidden')) {
          warnLog("⚠️ Found open modal during monitoring! Force closing...");
          forceCloseModal();
        }
        
        // Continuously neutralize potential trigger elements
        const modalTriggers = document.querySelectorAll([
          '[onclick*="showConsultationModal"]',
          '[onclick*="consultation-modal"]',
          '.consultation-button',
          '[data-open-consultation]',
          'button.consult',
          'a[href*="consultation"]',
          '.consult-btn'
        ].join(','));
        
        modalTriggers.forEach(function(trigger) {
          // Skip if already neutralized
          if (trigger.hasAttribute('data-neutralized')) return;
          
          debugLog("Neutralizing modal trigger:", trigger);
          
          // Remove any onclick attributes
          if (trigger.hasAttribute('onclick')) {
            trigger.removeAttribute('onclick');
          }
          
          // Replace href if it might trigger consultation
          if (trigger.hasAttribute('href') && 
              trigger.getAttribute('href').includes('consultation')) {
            trigger.setAttribute('href', 'javascript:void(0)');
          }
          
          // Mark as neutralized and replace click handler
          trigger.setAttribute('data-neutralized', 'true');
          
          // Clone and replace to remove all event listeners
          const newTrigger = trigger.cloneNode(true);
          newTrigger.addEventListener('click', function(e) {
            warnLog("⛔ Blocked click on neutralized button");
            e.preventDefault();
            e.stopPropagation();
            return false;
          }, true);
          
          if (trigger.parentNode) {
            trigger.parentNode.replaceChild(newTrigger, trigger);
          }
        });
      }, 500); // Check every half second
    }
    
    // Setup global interception regardless of page type
    // DEFENSE LAYER 4: Setup MutationObserver to watch for modal being added to DOM
    const modalObserver = new MutationObserver(function(mutations) {
      if (blockModals) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            for (let i = 0; i < mutation.addedNodes.length; i++) {
              const node = mutation.addedNodes[i];
              // Check if this is the modal or contains it
              if (node.id === 'consultation-modal' || 
                  (node.querySelector && node.querySelector('#consultation-modal'))) {
                warnLog("⚠️ Modal detected being added to DOM! Force closing...");
                setTimeout(forceCloseModal, 10); // Small delay to ensure it's in DOM
              }
            }
          }
          
          // Also check for class changes that might unhide the modal
          if (mutation.type === 'attributes' && 
              mutation.attributeName === 'class' && 
              mutation.target.id === 'consultation-modal') {
            if (!mutation.target.classList.contains('hidden')) {
              warnLog("⚠️ Modal class changed to visible! Force hiding...");
              setTimeout(forceCloseModal, 10);
            }
          }
        });
      }
    });
    
    // Observe the entire document for changes
    modalObserver.observe(document.documentElement, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
    
    successLog("Ultra protection modal prevention initialized");
  }

  // 3. NUCLEAR EMERGENCY CLOSE - THE ULTIMATE CLOSER
  function forceCloseModal() {
    infoLog("🧨 EXECUTING NUCLEAR CLOSE");
    
    try {
      // STEP 1: Find and obliterate the consultation modal using direct DOM manipulation
      const modal = document.getElementById('consultation-modal');
      if (modal) {
        infoLog("Found modal, obliterating it");
        
        // Apply all possible hiding techniques with !important flags
        modal.style.cssText = "display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; z-index: -9999 !important;";
        modal.classList.add('hidden');
        modal.setAttribute('hidden', 'true');
        modal.setAttribute('aria-hidden', 'true');
        
        // Try to remove it entirely
        try {
          modal.parentNode.removeChild(modal);
          infoLog("Removed modal from DOM");
        } catch (e) {
          errorLog("Couldn't remove modal from DOM:", e);
        }
      }
      
      // STEP 2: Reset body styles completely
      document.body.style.cssText = "";
      document.body.classList.remove('modal-open', 'overflow-hidden', 'fixed');
      document.documentElement.classList.remove('modal-open', 'overflow-hidden', 'fixed');
      document.body.style.overflow = 'auto';
      document.body.style.position = 'static';
      document.body.style.height = 'auto';
      document.body.style.width = 'auto';
      document.documentElement.style.overflow = 'auto';
      
      // STEP 3: Destroy ALL Cal.com elements
      document.querySelectorAll([
        '[data-cal-namespace]', 
        '[data-cal-embed]', 
        '.cal-embed', 
        'iframe[src*="cal.com"]',
        '.cal-modal',
        '[class*="cal-"]'
      ].join(',')).forEach(function(el) {
        try { 
          el.parentNode.removeChild(el);
        } catch (e) {}
      });
      
      // STEP 4: Destroy ALL backdrop and overlay elements
      document.querySelectorAll([
        '.backdrop', 
        '.overlay', 
        '.modal-backdrop',
        '[class*="backdrop"]',
        '[class*="overlay"]',
        '[id*="backdrop"]',
        '[id*="overlay"]'
      ].join(',')).forEach(function(el) {
        if (el.id !== EMERGENCY_BUTTON_ID) {
          try { 
            el.parentNode.removeChild(el);
          } catch (e) {}
        }
      });
      
      // STEP 5: Find ANY element with fixed positioning that might be a modal
      document.querySelectorAll('*').forEach(function(el) {
        if (el.id === EMERGENCY_BUTTON_ID) return; // Skip our emergency button
        
        const style = window.getComputedStyle(el);
        if (style.position === 'fixed' && 
            (style.zIndex > 10 || style.zIndex === 'auto') &&
            !['HEADER', 'NAV', 'FOOTER'].includes(el.tagName) &&
            el.id !== EMERGENCY_BUTTON_ID &&
            !el.classList.contains('emergency')) {
          // This might be a modal-like element - hide it
          try {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
            debugLog("Hidden potential modal-like element:", el);
          } catch (e) {}
        }
      });
      
      // STEP 6: Clean up by class name
      ['modal', 'popup', 'dialog', 'lightbox'].forEach(function(className) {
        document.querySelectorAll(`[class*="${className}"]`).forEach(function(el) {
          if (el.id !== EMERGENCY_BUTTON_ID && !el.classList.contains('emergency')) {
            try {
              el.style.display = 'none';
              el.style.visibility = 'hidden';
              el.style.opacity = '0';
              el.style.pointerEvents = 'none';
            } catch (e) {}
          }
        });
      });
      
      successLog("Nuclear close completed");
      return true;
    } catch (err) {
      errorLog("Error during nuclear close:", err);
      return false;
    }
  }

  // 4. CREATE EMERGENCY BUTTON
  function createEmergencyButton() {
    // Remove any existing button first
    const existingBtn = document.getElementById(EMERGENCY_BUTTON_ID);
    if (existingBtn) existingBtn.parentNode.removeChild(existingBtn);
    
    // Create new button
    const btn = document.createElement('button');
    btn.id = EMERGENCY_BUTTON_ID;
    btn.className = 'emergency'; // Add class to help with selections
    btn.innerText = '🔴 EMERGENCY EXIT';
    
    // Style for maximum visibility and CSS specificity
    btn.style.cssText = `
      position: fixed !important;
      top: 10px !important;
      right: 10px !important;
      z-index: 2147483647 !important; /* Maximum z-index */
      background: linear-gradient(to right, #ff0000, #8b0000) !important;
      color: white !important;
      font-weight: bold !important;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif !important;
      font-size: 14px !important;
      padding: 8px 12px !important;
      border: 2px solid white !important;
      border-radius: 4px !important;
      box-shadow: 0 0 10px rgba(0,0,0,0.7) !important;
      cursor: pointer !important;
      transform: scale(1) !important;
      transition: transform 0.1s !important;
      opacity: 1 !important;
      visibility: visible !important;
      pointer-events: auto !important;
      display: block !important;
      margin: 0 !important;
      min-width: 150px !important;
      text-align: center !important;
    `;
    
    // Make it stand out on hover
    btn.onmouseover = function() {
      this.style.transform = 'scale(1.1)';
    };
    
    btn.onmouseout = function() {
      this.style.transform = 'scale(1)';
    };
    
    // Add click handler with ultra protection
    btn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Attempt to close modal with multiple attempts for reliability
      infoLog("Emergency button clicked, executing multiple close attempts");
      
      // Try closing multiple times with slight delays
      forceCloseModal();
      
      setTimeout(function() {
        forceCloseModal();
        
        // Visual feedback
        btn.innerText = '✅ CLOSED';
        btn.style.background = 'linear-gradient(to right, #4CAF50, #2E7D32) !important';
        
        // Reset after 2 seconds
        setTimeout(() => {
          btn.innerText = '🔴 EMERGENCY EXIT';
          btn.style.background = 'linear-gradient(to right, #ff0000, #8b0000) !important';
          
          // Offer reload option
          if (confirm("Modal closed. Reload page for completely fresh state?")) {
            window.location.reload();
          }
        }, 2000);
      }, 100);
      
      return false;
    };
    
    // Make sure the button stays on top of everything
    document.documentElement.appendChild(btn);
    
    // Start with full opacity to ensure visibility
    setTimeout(() => {
      btn.style.opacity = '0.9 !important';
    }, 5000);
    
    successLog("Emergency button created");
    return btn;
  }

  // 5. KEYBOARD SHORTCUTS
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
      // Exit on ESC (very common)
      if (e.key === 'Escape') {
        infoLog("ESC key pressed, activating emergency close");
        forceCloseModal();
      }
      
      // Exit on Alt+X (emergency combo)
      if (e.key === 'x' && e.altKey) {
        infoLog("Alt+X emergency shortcut activated");
        forceCloseModal();
      }
      
      // Exit on X key (simpler emergency)
      if (e.key === 'x' && e.ctrlKey) {
        infoLog("Ctrl+X emergency shortcut activated");
        forceCloseModal();
      }
    }, true); // Capture phase to get it before other handlers
    
    debugLog("Keyboard shortcuts initialized");
  }

  // 6. ENSURE EMERGENCY BUTTON PERSISTS
  function ensureEmergencyButton() {
    if (!document.getElementById(EMERGENCY_BUTTON_ID)) {
      debugLog("Emergency button missing, recreating");
      createEmergencyButton();
    } else {
      // Make sure button is visible and on top
      const btn = document.getElementById(EMERGENCY_BUTTON_ID);
      btn.style.display = 'block';
      btn.style.visibility = 'visible';
      btn.style.zIndex = '2147483647';
      btn.style.opacity = '0.9';
    }
  }

  // 7. CHECK DOM FOR MODALS ON PAGE LOAD
  function checkForOpenModalsOnLoad() {
    debugLog("Checking for open modals on page load");
    
    // If we should block modals on this page, force close any that might be open
    if (shouldBlockModals()) {
      // First, check if the modal exists and is visible
      const modal = document.getElementById('consultation-modal');
      if (modal && !modal.classList.contains('hidden')) {
        warnLog("🚨 Found open modal on page load! Force closing...");
        forceCloseModal();
      }
      
      // Also look for any element that might be a modal overlay
      document.querySelectorAll('.backdrop, .overlay, [class*="modal"]').forEach(function(el) {
        if (el.id !== EMERGENCY_BUTTON_ID && 
            window.getComputedStyle(el).display !== 'none') {
          warnLog("🚨 Found possible modal overlay on page load! Force closing...");
          forceCloseModal();
        }
      });
    }
  }

  // 8. FIX URL PATH CHANGES
  function listenForURLChanges() {
    // Use History API to detect URL changes
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function() {
      originalPushState.apply(this, arguments);
      debugLog("URL changed via pushState, rechecking modal status");
      setTimeout(function() {
        checkForOpenModalsOnLoad();
        if (shouldBlockModals()) {
          forceCloseModal();
        }
      }, 100);
    };
    
    history.replaceState = function() {
      originalReplaceState.apply(this, arguments);
      debugLog("URL changed via replaceState, rechecking modal status");
      setTimeout(function() {
        checkForOpenModalsOnLoad();
        if (shouldBlockModals()) {
          forceCloseModal();
        }
      }, 100);
    };
    
    // Listen for popstate events (back/forward buttons)
    window.addEventListener('popstate', function() {
      debugLog("URL changed via popstate, rechecking modal status");
      setTimeout(function() {
        checkForOpenModalsOnLoad();
        if (shouldBlockModals()) {
          forceCloseModal();
        }
      }, 100);
    });
  }

  // 9. INITIALIZE EVERYTHING
  function init() {
    infoLog("ULTRA PROTECTION initializing on " + window.location.pathname);
    
    // First check for any open modals
    checkForOpenModalsOnLoad();
    
    // Create the emergency button
    createEmergencyButton();
    
    // Setup all protections
    preventModalOpening();
    setupKeyboardShortcuts();
    listenForURLChanges();
    
    // Check periodically if the button is still there
    setInterval(ensureEmergencyButton, 1000);
    
    // Add global emergency function
    window.EMERGENCY_CLOSE = forceCloseModal;
    
    // Periodically check for modals
    setInterval(function() {
      if (shouldBlockModals()) {
        // Check for modal and force close if found
        const modal = document.getElementById('consultation-modal');
        if (modal && !modal.classList.contains('hidden')) {
          warnLog("🚨 Found open modal during periodic check! Force closing...");
          forceCloseModal();
        }
      }
    }, 1000);
    
    successLog("ULTRA PROTECTION fully initialized");
  }

  // Run immediately
  init();
  
  // Also run when DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM already loaded, run now
    init();
  }
  
  // And run once more when page is completely loaded
  window.addEventListener('load', init);
  
  // Also run on visibility change
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
      debugLog("Page visibility changed to visible, rechecking modals");
      init();
    }
  });
})(); 