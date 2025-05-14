/**
 * Component Helper Script
 * Helps detect and fix missing modal issues on pages
 */

(function() {
  console.log("Component Helper initializing...");
  
  // Check if modal is in the page
  function checkForModal() {
    const modal = document.getElementById('consultation-modal');
    
    if (!modal) {
      console.warn("⚠️ No consultation modal found in DOM!");
      
      // Create a button to let user add a modal if missing
      createHelperButton();
    } else {
      console.log("✅ Consultation modal found in DOM");
    }
  }
  
  // Create helper button when modal is missing
  function createHelperButton() {
    // Only show in development
    if (!(window.location.hostname === 'localhost' || 
          window.location.hostname === '127.0.0.1' || 
          window.location.port)) {
      return;
    }
    
    // Create button if not exists
    if (document.getElementById('add-modal-button')) {
      return;
    }
    
    const button = document.createElement('button');
    button.id = 'add-modal-button';
    button.textContent = '+ Add Modal';
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      background: #2563eb;
      color: white;
      font-weight: bold;
      padding: 12px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    `;
    
    // Add click handler
    button.addEventListener('click', function() {
      appendModalToPage();
    });
    
    // Add to page
    document.body.appendChild(button);
    console.log("Added helper button to add missing modal");
  }
  
  // Dynamically append modal to page
  function appendModalToPage() {
    console.log("Attempting to add modal to page...");
    
    // Create a placeholder for the modal
    const modalPlaceholder = document.createElement('div');
    modalPlaceholder.id = 'consultation-modal';
    modalPlaceholder.className = 'fixed inset-0 bg-black bg-opacity-70 hidden z-50';
    modalPlaceholder.setAttribute('data-insurance-type', 'health');
    modalPlaceholder.setAttribute('data-modal-backdrop', 'true');
    
    // Add inner structure
    modalPlaceholder.innerHTML = `
      <div class="fixed inset-0 flex items-center justify-center p-2 sm:p-4">
        <div class="bg-white rounded-2xl md:max-w-4xl w-full p-4 sm:p-8 relative shadow-xl modal-content overflow-y-auto">
          <!-- Close button -->
          <button
            id="close-modal-btn"
            class="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 z-10"
            aria-label="Close"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <h2 class="text-2xl font-bold text-center mb-6">Get Expert Insurance Advice</h2>
          <p class="text-center text-gray-600 mb-6">
            Our consultation is entirely free and comes with no obligations.
            Let us help you find the right insurance solution for your needs.
          </p>
          
          <div class="flex justify-center">
            <button
              id="open-consultation-form"
              class="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow hover:bg-red-700 transition-colors"
            >
              Book Free Consultation
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Add to body
    document.body.appendChild(modalPlaceholder);
    
    // Add event listeners for closing
    const closeBtn = document.getElementById('close-modal-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        document.getElementById('consultation-modal').classList.add('hidden');
        document.body.classList.remove('modal-open');
      });
    }
    
    // Button to open form
    const openFormBtn = document.getElementById('open-consultation-form');
    if (openFormBtn) {
      openFormBtn.addEventListener('click', function() {
        window.location.href = '/contact';
      });
    }
    
    // Click outside to close
    modalPlaceholder.addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.add('hidden');
        document.body.classList.remove('modal-open');
      }
    });
    
    console.log("✅ Modal added to page successfully!");
    
    // Remove helper button
    const helperButton = document.getElementById('add-modal-button');
    if (helperButton) {
      helperButton.remove();
    }
    
    // Check for existing click handlers
    fixAllButtons();
    
    // Alert user
    alert("Modal added to page! You can now use the consultation buttons.");
  }
  
  // Fix all consultation buttons to use the dynamically added modal
  function fixAllButtons() {
    document.querySelectorAll('[onclick*="showConsultation"]').forEach(button => {
      button.removeAttribute('onclick');
      
      button.addEventListener('click', function(e) {
        e.preventDefault();
        
        const modal = document.getElementById('consultation-modal');
        if (modal) {
          modal.classList.remove('hidden');
          document.body.classList.add('modal-open');
        } else {
          console.error("Modal not found even after adding!");
        }
        
        return false;
      });
    });
  }
  
  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkForModal);
  } else {
    checkForModal();
  }
  
  console.log("Component Helper initialized");
})(); 