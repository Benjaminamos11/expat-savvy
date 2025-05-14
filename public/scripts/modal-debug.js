/**
 * Modal Debug Script
 * Provides a debug interface and in-browser diagnostics for troubleshooting
 */

(function() {
  console.log("🔍 Modal debug script loading...");
  
  // Only activate in development mode (localhost or ports other than 80/443)
  const isDev = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' ||
                (window.location.port && window.location.port !== '80' && window.location.port !== '443');
  
  if (!isDev) {
    console.log("Debug mode disabled in production");
    return;
  }
  
  // Create debug button
  function createDebugButton() {
    // Remove any existing button
    const existingButton = document.getElementById('modal-debug-button');
    if (existingButton) existingButton.remove();
    
    // Create button
    const button = document.createElement('button');
    button.id = 'modal-debug-button';
    button.innerText = '🔍 Debug Modal';
    button.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      z-index: 10000;
      background: #3b82f6;
      color: white;
      font-weight: bold;
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-family: system-ui, sans-serif;
      font-size: 12px;
    `;
    
    // Add click handler
    button.addEventListener('click', function() {
      runModalDiagnostics();
      
      // Try to open the modal directly
      const modal = document.getElementById('consultation-modal');
      if (modal) {
        modal.classList.remove('hidden');
        document.body.classList.add('modal-open');
        console.log("Modal opened via debug button");
      } else {
        console.error("Modal element not found!");
        alert("Modal not found in DOM!");
      }
    });
    
    // Add to document
    document.body.appendChild(button);
    console.log("Debug button added");
  }
  
  // Run diagnostics
  function runModalDiagnostics() {
    console.group("Modal Diagnostics");
    
    // Check if modal exists
    const modal = document.getElementById('consultation-modal');
    console.log("Modal exists:", !!modal);
    
    // Check current path and whitelist status
    const path = window.location.pathname;
    console.log("Current path:", path);
    
    // Check if showConsultationModal exists
    console.log("showConsultationModal function exists:", typeof window.showConsultationModal === 'function');
    
    // Check for consultation buttons
    const consultButtons = document.querySelectorAll('.consultation-button, [data-open-consultation]');
    console.log("Found consultation buttons:", consultButtons.length);
    
    // Log DOM button count for debugging
    const allButtons = document.querySelectorAll('button, a.btn, .button, [role="button"]');
    console.log("Total buttons on page:", allButtons.length);
    
    // Check if modal is currently visible
    if (modal) {
      console.log("Modal is visible:", !modal.classList.contains('hidden'));
    }
    
    console.groupEnd();
  }
  
  // Check modal functionality regularly
  function monitorModal() {
    // Is modal in DOM?
    const modal = document.getElementById('consultation-modal');
    
    // Is showConsultationModal function available?
    const hasFunction = typeof window.showConsultationModal === 'function';
    
    // Log status
    console.log(`Modal status: element ${modal ? 'exists' : 'missing'}, function ${hasFunction ? 'exists' : 'missing'}`);
    
    if (!modal) {
      console.warn("Modal element is missing from DOM!");
    }
  }
  
  // Initialize
  setTimeout(function() {
    createDebugButton();
    runModalDiagnostics();
    
    // Monitor periodically
    setInterval(monitorModal, 5000);
  }, 1000);
  
  console.log("🔍 Modal debug script loaded");
})(); 