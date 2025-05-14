/**
 * SITE-WIDE MODAL FIX - LAST RESORT SOLUTION
 * 
 * This script provides a permanent solution to stuck modals across the entire site.
 * It runs immediately and monitors for modals that need to be closed.
 */

(function() {
  // Create a permanent emergency button
  function createGlobalEmergencyButton() {
    // Remove any existing button first
    const existing = document.getElementById('global-emergency-btn');
    if (existing) existing.remove();
    
    // Create new button
    const btn = document.createElement('button');
    btn.id = 'global-emergency-btn';
    btn.innerHTML = '🚨 FORCE CLOSE';
    btn.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      z-index: 9999999999;
      background: linear-gradient(to right, #ff416c, #ff4b2b);
      color: white;
      font-weight: bold;
      padding: 10px 15px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `;
    
    // This function will force close ANY modal on the page
    function forceCloseAll() {
      console.log("[FORCE CLOSE] Executing global emergency close");
      
      try {
        // 1. Find our consultation modal
        const modal = document.getElementById('consultation-modal');
        if (modal) {
          console.log("[FORCE CLOSE] Found consultation modal, closing it");
          // Apply every possible way to hide it
          modal.style.display = 'none';
          modal.style.visibility = 'hidden';
          modal.classList.add('hidden');
          modal.setAttribute('aria-hidden', 'true');
          modal.setAttribute('hidden', 'true');
        }
        
        // 2. Reset body styles
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.classList.remove('modal-open', 'overflow-hidden');
        
        // 3. Remove ALL modal-like elements
        const modalElements = document.querySelectorAll('.modal, .dialog, [role="dialog"], [aria-modal="true"]');
        console.log(`[FORCE CLOSE] Found ${modalElements.length} modal elements`);
        modalElements.forEach(el => {
          if (el.id !== 'global-emergency-btn') {
            try {
              el.style.display = 'none';
              el.classList.add('hidden');
            } catch (e) {}
          }
        });
        
        // 4. Remove Cal.com elements
        const calElements = document.querySelectorAll('[data-cal-namespace], [data-cal-embed]');
        calElements.forEach(el => {
          try { el.remove(); } catch (e) {}
        });
        
        // 5. Remove backdrops and overlays
        const backdrops = document.querySelectorAll('.backdrop, .overlay, .modal-backdrop');
        backdrops.forEach(el => {
          try { el.remove(); } catch (e) {}
        });
        
        // 6. Success indicator
        btn.style.backgroundColor = '#4CAF50';
        btn.innerHTML = '✓ CLOSED';
        setTimeout(() => {
          btn.style.background = 'linear-gradient(to right, #ff416c, #ff4b2b)';
          btn.innerHTML = '🚨 FORCE CLOSE';
        }, 1000);
        
        console.log("[FORCE CLOSE] Emergency close completed successfully");
      } catch (e) {
        console.error("[FORCE CLOSE] Error during emergency close:", e);
      }
    }
    
    // Add click handler
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      forceCloseAll();
    }, true);
    
    // Add to document
    document.body.appendChild(btn);
    console.log("[FORCE CLOSE] Global emergency button added");
  }
  
  // Add keyboard shortcut (Alt+Shift+X)
  document.addEventListener('keydown', function(e) {
    if (e.key === 'X' && e.altKey && e.shiftKey) {
      console.log("[FORCE CLOSE] Keyboard shortcut detected: Alt+Shift+X");
      const emergencyBtn = document.getElementById('global-emergency-btn');
      if (emergencyBtn) {
        emergencyBtn.click();
      }
    }
  }, true);
  
  // Call immediately and also after DOM load
  createGlobalEmergencyButton();
  
  // Also run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createGlobalEmergencyButton);
  }
  
  // Run every 10 seconds to ensure button exists
  setInterval(createGlobalEmergencyButton, 10000);
  
  console.log("[FORCE CLOSE] Global fix initialized");
})(); 