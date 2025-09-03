/**
 * ULTRA EMERGENCY CLOSE BUTTON
 * This script FORCES a permanent emergency close button that will
 * always be visible and work even when everything else fails.
 */

(function() {
  // MAXIMUM EMERGENCY - immediately inject button that cannot be hidden
  function injectEmergencyButton() {
    // Remove any existing button first
    try {
      const oldButton = document.getElementById('ultra-emergency-btn');
      if (oldButton) oldButton.parentNode.removeChild(oldButton);
    } catch (e) {}
    
    // Create a new button with the highest possible z-index
    const btn = document.createElement('button');
    btn.id = 'ultra-emergency-btn';
    btn.textContent = '⚠️ FORCE CLOSE ⚠️';
    
    // Apply extreme styling to ensure visibility
    btn.style.cssText = `
      position: fixed !important;
      top: 5px !important;
      right: 5px !important;
      z-index: 2147483647 !important;
      background: linear-gradient(135deg, #ff5f6d, #ffc371) !important;
      color: black !important;
      font-weight: bold !important;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif !important;
      font-size: 14px !important;
      line-height: 1 !important;
      padding: 10px 15px !important;
      border: 3px solid black !important;
      border-radius: 8px !important;
      box-shadow: 0 0 15px rgba(0,0,0,0.7) !important;
      cursor: pointer !important;
      transform: scale(1) !important;
      transition: transform 0.1s !important;
      opacity: 1 !important;
      display: block !important;
      visibility: visible !important;
      pointer-events: auto !important;
      user-select: none !important;
      text-shadow: 0 1px 0 rgba(255,255,255,0.4) !important;
    `;
    
    // Add hover effects
    btn.onmouseover = function() {
      this.style.transform = 'scale(1.1) !important';
      this.style.boxShadow = '0 0 20px rgba(255,0,0,0.7) !important';
    };
    
    btn.onmouseout = function() {
      this.style.transform = 'scale(1) !important';
      this.style.boxShadow = '0 0 15px rgba(0,0,0,0.7) !important';
    };
    
    // Add click handler that BRUTALLY forces modal closure
    btn.onclick = function(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      console.log("💥 ULTRA EMERGENCY CLOSE ACTIVATED");
      
      try {
        // Method 1: Hide consultation modal using every possible technique
        const modal = document.getElementById('consultation-modal');
        if (modal) {
          console.log("🎯 Found modal, applying multiple hiding techniques");
          
          // Hide it every way possible
          modal.style.display = 'none !important';
          modal.style.visibility = 'hidden !important';
          modal.setAttribute('hidden', '');
          modal.setAttribute('aria-hidden', 'true');
          modal.classList.add('hidden');
          
          // Try removing it from the DOM entirely as a last resort
          try {
            const modalParent = modal.parentNode;
            if (modalParent) {
              modalParent.removeChild(modal);
              console.log("💀 Modal removed from DOM");
            }
          } catch (err) {
            console.error("❌ Could not remove modal from DOM:", err);
          }
        }
        
        // Method 2: Reset body styles to ensure page is usable
        console.log("🔄 Resetting body styles");
        document.body.style.cssText = "";
        document.body.className = document.body.className.replace(/modal-open|overflow-hidden|fixed/g, '');
        document.body.style.overflow = 'auto';
        document.body.style.position = 'static';
        document.body.style.height = 'auto';
        document.body.style.width = 'auto';
        
        // Method 3: Find and remove ALL Cal.com elements
        const calElements = document.querySelectorAll('[data-cal-namespace], [data-cal-embed], iframe[src*="cal.com"]');
        calElements.forEach(el => {
          try { el.parentNode.removeChild(el); } catch (e) {}
        });
        
        // Method 4: Remove any backdrop/overlay elements
        const overlays = document.querySelectorAll('.backdrop, .overlay, .modal-backdrop, div[class*="modal"]');
        overlays.forEach(el => {
          if (el.id !== 'consultation-modal' && el.id !== 'ultra-emergency-btn') {
            try { el.parentNode.removeChild(el); } catch (e) {}
          }
        });
        
        // Add success indicator
        this.textContent = '✅ CLOSED';
        this.style.background = 'linear-gradient(135deg, #00b09b, #96c93d) !important';
        
        setTimeout(() => {
          this.textContent = '⚠️ FORCE CLOSE ⚠️';
          this.style.background = 'linear-gradient(135deg, #ff5f6d, #ffc371) !important';
        }, 2000);
        
        // Offer page reload as ultimate solution
        const shouldReload = confirm("Modal closed! Reload page for clean state?");
        if (shouldReload) {
          window.location.reload();
        }
        
        return false;
      } catch (err) {
        console.error("💣 Error during emergency close:", err);
        console.log("If modal won't close, press F5 to reload the page.");
        return false;
      }
    };
    
    // Append to document body or html as fallback
    try {
      document.body.appendChild(btn);
    } catch (e) {
      try {
        document.documentElement.appendChild(btn);
      } catch (e2) {
        console.error("💣 Failed to add emergency button:", e2);
      }
    }
    
    console.log("🚨 Ultra emergency button added");
    return btn;
  }
  
  // Ensure button is ALWAYS available - keep checking and re-adding if removed
  function ensureButtonExists() {
    if (!document.getElementById('ultra-emergency-btn')) {
      console.log("🔍 Emergency button missing, re-adding");
      injectEmergencyButton();
    }
  }
  
  // Add global keyboard shortcut (Alt+X)
  document.addEventListener('keydown', function(e) {
    // Activate on Alt+X for easier access
    if (e.key === 'x' && e.altKey) {
      console.log("⌨️ Alt+X keyboard shortcut detected");
      const btn = document.getElementById('ultra-emergency-btn');
      if (btn) btn.click();
    }
  }, true);
  
  // Initial injection
  injectEmergencyButton();
  
  // Check periodically if button exists
  setInterval(ensureButtonExists, 1000);
  
  // Re-inject on page events
  window.addEventListener('load', injectEmergencyButton);
  document.addEventListener('DOMContentLoaded', injectEmergencyButton);
  
  // Add global emergency function
  window.EMERGENCY_FORCE_CLOSE = function() {
    const btn = document.getElementById('ultra-emergency-btn');
    if (btn) btn.click();
  };
  
  console.log("🚨 ULTRA EMERGENCY SYSTEM INITIALIZED");
})(); 