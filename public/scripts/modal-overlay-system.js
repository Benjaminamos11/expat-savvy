/**
 * Universal Modal Overlay System
 * Loads HTML modal files as overlays instead of popup windows
 */

class ModalOverlaySystem {
  constructor() {
    this.currentModal = null;
    this.init();
  }

  init() {
    console.log('🚀 Modal Overlay System initialized');
    console.log('🔧 About to create modal functions...');
    
    // Create global functions
    window.openModalOverlay = this.openModalOverlay.bind(this);
    window.openRelocationModal = this.openRelocationModal.bind(this);
    window.openHealthModal = this.openHealthModal.bind(this);
    window.openOtherModal = this.openOtherModal.bind(this);
    window.openLifePensionModal = this.openLifePensionModal.bind(this);
    window.closeModalOverlay = this.closeModalOverlay.bind(this);
    window.initializeCalComManually = this.initializeCalComManually.bind(this);
    
    // Legacy compatibility functions
    window.openOffersModal = this.openHealthModal.bind(this);
    window.openConsultationModal = this.openHealthModal.bind(this);
    window.showConsultationModal = this.openHealthModal.bind(this);
    
    console.log('✅ Modal functions created successfully!');
    console.log('🔧 openHealthModal type:', typeof window.openHealthModal);
    console.log('🔧 openOffersModal type:', typeof window.openOffersModal);
    console.log('🔧 openConsultationModal type:', typeof window.openConsultationModal);
    console.log('🔧 Legacy functions created:', {
      openOffersModal: typeof window.openOffersModal,
      openConsultationModal: typeof window.openConsultationModal,
      openHealthModal: typeof window.openHealthModal
    });
  }

  getModalTypeFromFile(modalFile) {
    if (modalFile.includes('relocation')) return 'relocation';
    if (modalFile.includes('health') || modalFile.includes('final')) return 'health_insurance';
    if (modalFile.includes('other-insurance')) return 'other_insurance';
    if (modalFile.includes('life-pension')) return 'life_pension';
    return 'unknown';
  }

  async openModalOverlay(modalFile, options = {}) {
    try {
      console.log('🔄 Loading modal:', modalFile);
      
      // Enhanced modal tracking
      const modalType = this.getModalTypeFromFile(modalFile);
      const context = {
        modal_file: modalFile,
        modal_type: modalType,
        page_location: window.location.pathname,
        page_title: document.title,
        source: options.source || 'unknown',
        intent: options.intent || 'unknown'
      };
      
      // Track with enhanced system
      if (typeof window.trackModalOpen === 'function') {
        window.trackModalOpen(modalType, context);
      }
      
      // Legacy tracking for backward compatibility
      if (typeof window.trackQuoteFlowStart === 'function') {
        window.trackQuoteFlowStart({
          flowType: 'modal',
          modalFile: modalFile,
          modalType: modalType
        });
      }
      
      // Remove existing modal if any (before setting isOpening flag)
      if (this.currentModal) {
        this.currentModal.remove();
        this.currentModal = null;
        const existingModals = document.querySelectorAll('#modal');
        existingModals.forEach(modal => modal.remove());
      }
      
      // Set a flag to prevent immediate closure
      this.isOpening = true;
      
      // Fetch modal HTML
      const response = await fetch(modalFile);
      if (!response.ok) {
        throw new Error(`Failed to load modal: ${response.status}`);
      }
      
      const html = await response.text();
      console.log('📄 HTML fetched, length:', html.length);
      console.log('📄 HTML contains modal:', html.includes('id="modal"'));
      
      // Parse HTML to extract modal content
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Find the modal element
      const modalElement = doc.querySelector('#modal');
      if (!modalElement) {
        throw new Error('Modal element not found in HTML');
      }
      
      console.log('📋 Modal element found:', modalElement);
      
      // Clone the modal element to avoid DOM issues
      const modalClone = modalElement.cloneNode(true);
      
      // Ensure the modal is visible and properly styled
      modalClone.classList.remove('hidden');
      modalClone.classList.add('flex');
      modalClone.style.display = 'flex';
      modalClone.style.zIndex = '9999';
      
      // Add modal to page
      document.body.appendChild(modalClone);
      
      console.log('📋 Modal added to DOM:', modalClone);
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Track current modal
      this.currentModal = modalClone;
      
      // Extract and execute scripts from the modal
      const scripts = doc.querySelectorAll('script');
      console.log(`📜 Found ${scripts.length} scripts to inject`);
      
      scripts.forEach((script, index) => {
        if (script.textContent && !script.src) {
          try {
            // Create a new script element
            const newScript = document.createElement('script');
            newScript.textContent = script.textContent;
            newScript.setAttribute('data-modal-script', 'true');
            newScript.setAttribute('data-script-index', index);
            
            // Execute scripts immediately and sequentially
            document.body.appendChild(newScript);
            console.log(`✅ Injected and executed modal script ${index + 1}/${scripts.length}`);
          } catch (error) {
            console.warn(`⚠️ Error executing script ${index + 1}:`, error);
          }
        }
      });
      
      // Load Tailwind CSS if not already loaded
      if (!document.querySelector('script[src*="tailwindcss"]')) {
        const tailwindScript = document.createElement('script');
        tailwindScript.src = 'https://cdn.tailwindcss.com';
        document.head.appendChild(tailwindScript);
        console.log('✅ Loaded Tailwind CSS');
      }
      
      // Load Lucide icons if not already loaded
      if (!document.querySelector('script[src*="lucide"]')) {
        const lucideScript = document.createElement('script');
        lucideScript.src = 'https://unpkg.com/lucide@latest';
        document.head.appendChild(lucideScript);
        console.log('✅ Loaded Lucide icons');
      }
      
      // Load Cal.com script if not already loaded
      if (!window.Cal && !window.calScriptLoaded) {
        const calScript = document.createElement('script');
        calScript.src = 'https://app.cal.com/embed/embed.js';
        calScript.async = true;
        calScript.onload = async () => {
          console.log('✅ Cal.com script loaded successfully');
          
          // Wait a bit for Cal to be available
          setTimeout(async () => {
            window.calScriptLoaded = true;
            
            // Try to get the Cal API using the modern approach
            try {
              if (typeof window.getCalApi === 'function') {
                const cal = await window.getCalApi({namespace: "expat-savvy"});
                window.calApi = cal;
                console.log('✅ Cal API obtained successfully');
              } else {
                console.log('⚠️ getCalApi not available, using legacy Cal function');
              }
              
              // Check if legacy Cal function is available
              if (typeof window.Cal === 'function') {
                console.log('✅ Legacy Cal function is available');
              } else {
                console.error('❌ Neither Cal API nor Cal function available');
              }
            } catch (error) {
              console.log('⚠️ Could not get Cal API, will use legacy method:', error);
            }
          }, 500);
        };
        calScript.onerror = () => {
          console.error('❌ Failed to load Cal.com script');
        };
        document.head.appendChild(calScript);
        console.log('✅ Loading Cal.com script...');
      } else if (window.Cal) {
        window.calScriptLoaded = true;
        console.log('✅ Cal.com script already loaded');
      }
      
      // Extract and inject CSS styles from the modal
      const styleElement = doc.querySelector('style');
      if (styleElement) {
        const modalStyles = document.createElement('style');
        modalStyles.textContent = styleElement.textContent;
        modalStyles.setAttribute('data-modal-styles', 'true');
        document.head.appendChild(modalStyles);
        console.log('✅ Injected modal CSS styles');
      }
      
      // Add additional CSS to force red colors and fix blue borders
      const additionalStyles = document.createElement('style');
      additionalStyles.textContent = `
        /* Force all form elements to use red colors on focus only */
        input[type="text"], input[type="email"], input[type="tel"] {
          accent-color: #EF4444 !important;
        }
        input[type="text"]:focus, input[type="email"]:focus, input[type="tel"]:focus {
          border-color: #EF4444 !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
          outline: none !important;
        }
        input[type="checkbox"]:checked {
          background-color: #EF4444 !important;
          border-color: #EF4444 !important;
        }
        input[type="checkbox"]:focus {
          border-color: #EF4444 !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
        }
        input[type="radio"]:checked {
          background-color: #EF4444 !important;
          border-color: #EF4444 !important;
        }
        input[type="radio"]:focus {
          border-color: #EF4444 !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
        }
        select:focus {
          border-color: #EF4444 !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
        }
        * {
          accent-color: #EF4444 !important;
        }
        .border-blue-500 {
          border-color: #EF4444 !important;
        }
        .text-blue-500 {
          color: #EF4444 !important;
        }
        .bg-blue-500 {
          background-color: #EF4444 !important;
        }
      `;
      additionalStyles.setAttribute('data-red-override-styles', 'true');
      document.head.appendChild(additionalStyles);
      console.log('✅ Added red color overrides');
      
      // Initialize basic modal functionality
      this.initializeModalContent(modalClone);
      
      // Call the modal's openModal function after scripts have executed
      // Use requestAnimationFrame to ensure scripts have run
      requestAnimationFrame(() => {
        setTimeout(() => {
          console.log('🔍 Checking for window.openModal...');
          console.log('🔍 window.openModal type:', typeof window.openModal);
          
          if (typeof window.openModal === 'function') {
            console.log('🎯🎯🎯 CALLING window.openModal with intent:', options.intent || 'home');
            console.log('🔍 Intent value:', options.intent);
            console.log('🔍 Options object:', options);
            window.openModal(options.intent || 'home');
            
            // Initialize Lucide icons AFTER modal content is fully rendered
            setTimeout(() => {
              if (typeof lucide !== 'undefined') {
                lucide.createIcons();
                console.log('✅ Lucide icons initialized after modal opened');
              }
            }, 200);
            
            console.log('✅ Modal initialized successfully');
          } else {
            console.error('❌ window.openModal function not found! Scripts not executed yet.');
          }
        }, 100);
      });
      
      // Reset opening flag after a delay to prevent immediate closure
      setTimeout(() => {
        this.isOpening = false;
      }, 500);
      
      console.log('✅ Modal loaded successfully');
      
    } catch (error) {
      console.error('❌ Failed to load modal:', error);
      // Fallback to popup window
      window.open(modalFile, '_blank', 'width=1200,height=900,scrollbars=yes,resizable=yes');
    }
  }

  initializeModalContent(modalElement) {
    // Make sure the modal is visible and properly positioned
    modalElement.style.display = 'flex !important';
    modalElement.style.position = 'fixed !important';
    modalElement.style.top = '0 !important';
    modalElement.style.left = '0 !important';
    modalElement.style.width = '100% !important';
    modalElement.style.height = '100% !important';
    modalElement.style.zIndex = '9999 !important';
    modalElement.style.backgroundColor = 'rgba(0, 0, 0, 0.6) !important';
    
    // Initialize Lucide icons if available
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
    
    // Add basic close functionality to close buttons
    const closeButtons = modalElement.querySelectorAll('[onclick*="closeModal"], .close-modal, button[onclick*="close"]');
    console.log('🔍 Found close buttons:', closeButtons.length);
    closeButtons.forEach((button, index) => {
      console.log(`🔧 Adding click handler to close button ${index + 1}`);
      // Remove any existing onclick handlers
      button.removeAttribute('onclick');
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🖱️ Close button clicked!');
        this.closeModalOverlay();
      });
    });
    
    // Also look for X button specifically
    const xButtons = modalElement.querySelectorAll('button[class*="absolute"][class*="top"]');
    console.log('🔍 Found X buttons:', xButtons.length);
    xButtons.forEach((button, index) => {
      console.log(`🔧 Adding click handler to X button ${index + 1}`);
      button.removeAttribute('onclick');
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🖱️ X button clicked!');
        this.closeModalOverlay();
      });
    });
    
    // Add backdrop click to close (with delay to prevent immediate closure)
    setTimeout(() => {
      modalElement.addEventListener('click', (e) => {
        // Only close if clicking directly on the backdrop (not on modal content)
        if (e.target === modalElement || e.target.id === 'modal') {
          console.log('🖱️ Backdrop clicked, closing modal');
          e.preventDefault();
          e.stopPropagation();
          this.closeModalOverlay();
        }
      });
    }, 400);
    
    // Debug: Check if modal is actually in DOM
    setTimeout(() => {
      const modalInDOM = document.querySelector('#modal');
      console.log('🔍 Modal in DOM after init:', modalInDOM);
      console.log('🔍 Modal visibility:', modalInDOM ? window.getComputedStyle(modalInDOM).display : 'not found');
    }, 100);
    
    console.log('🔧 Modal content initialized with proper positioning');
  }

  closeModalOverlay() {
    console.log('🔒 Closing modal overlay...', 'isOpening:', this.isOpening);
    console.trace('Close called from:');
    
    // Prevent closing if we're still opening
    if (this.isOpening) {
      console.log('⚠️ Modal is still opening, ignoring close request');
      return;
    }
    
    // Re-enable modal backdrop clicks
    const modal = document.querySelector('#modal');
    if (modal) {
      modal.style.pointerEvents = 'auto';
      console.log('🔓 Re-enabled modal backdrop clicks');
    }
    
    if (this.currentModal) {
      this.currentModal.remove();
      this.currentModal = null;
    }
    
    // Force reset the isOpening flag to prevent reopening issues
    this.isOpening = false;
    
    // Remove any existing modals
    const existingModals = document.querySelectorAll('#modal');
    console.log('🔍 Found existing modals to remove:', existingModals.length);
    existingModals.forEach(modal => modal.remove());
    
    // Remove modal scripts and styles
    const modalScripts = document.querySelectorAll('script[data-modal-script="true"]');
    modalScripts.forEach(script => script.remove());
    
    const modalStyles = document.querySelectorAll('style[data-modal-styles="true"]');
    modalStyles.forEach(style => style.remove());
    
    const redStyles = document.querySelectorAll('style[data-red-override-styles="true"]');
    redStyles.forEach(style => style.remove());
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    console.log('🔒 Modal closed and cleaned up');
  }

  // Specific modal functions
  openRelocationModal(source = 'unknown', intent = 'unknown') {
    console.log('🚀 openRelocationModal called');
    this.openModalOverlay('/relocation-modal.html', { 
      source, 
      intent,
      modal_type: 'relocation'
    });
  }

  openHealthModal(intent = 'home', source = 'unknown') {
    this.openModalOverlay('/final-modal.html', { 
      intent, 
      source,
      modal_type: 'health_insurance'
    });
  }

  openOtherModal(intent = 'unknown', source = 'unknown') {
    this.openModalOverlay('/other-insurance-modal.html', { 
      intent, 
      source,
      modal_type: 'other_insurance'
    });
  }

  openLifePensionModal(intent = 'unknown', source = 'unknown') {
    this.openModalOverlay('/life-pension-modal.html', { 
      intent, 
      source,
      modal_type: 'life_pension'
    });
  }
  
  // Manual Cal.com initialization for when user reaches calendar step
  initializeCalComManually() {
    console.log('🎯 Manual Cal.com initialization triggered...');
    console.log('🔍 Cal script loaded:', window.calScriptLoaded);
    console.log('🔍 Cal function available:', typeof window.Cal !== 'undefined');
    
    // Detect if mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    console.log('📱 Is mobile device:', isMobile);
    
    // On mobile, open in new tab instead of embedding
    if (isMobile) {
      console.log('📱 Mobile detected - opening Cal.com in new tab');
      
      // Get user data from the modal's userData object
      let calUrl = "https://cal.com/primerelocation/expat-savvy";
      
      if (window.userData) {
        const params = new URLSearchParams();
        
        if (window.userData.firstName || window.userData.lastName) {
          const fullName = `${window.userData.firstName || ''} ${window.userData.lastName || ''}`.trim();
          if (fullName) {
            params.append('name', fullName);
          }
        }
        
        if (window.userData.email) {
          params.append('email', window.userData.email);
        }
        
        if (window.userData.phone) {
          params.append('phone', window.userData.phone);
        }
        
        if (params.toString()) {
          calUrl += '?' + params.toString();
        }
      }
      
      // Open in new tab
      window.open(calUrl, '_blank');
      
      // Show mobile-friendly message in the container
      const container = document.querySelector('#my-cal-inline-expat-savvy');
      if (container) {
        container.innerHTML = `
          <div class="text-center p-8">
            <div class="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Calendar opened in new tab</h3>
            <p class="text-gray-600 mb-6">For the best booking experience on mobile, we've opened the calendar in a new tab.</p>
            <button 
              onclick="window.open('${calUrl}', '_blank')" 
              class="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg inline-flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
              Open Calendar Again
            </button>
          </div>
        `;
      }
      
      return;
    }
    
    // Desktop: Continue with normal initialization
    const tryInitialize = async () => {
      // Check if both script is loaded and Cal function is available
      const hasCalFunction = typeof window.Cal === 'function';
      const hasCalApi = window.calApi && typeof window.calApi === 'function';
      const hasCalObject = window.Cal && typeof window.Cal === 'object';
      
      console.log('🔍 Cal availability check:', {
        scriptLoaded: window.calScriptLoaded,
        hasCalFunction,
        hasCalApi,
        hasCalObject,
        calType: typeof window.Cal,
        calKeys: window.Cal ? Object.keys(window.Cal) : []
      });
      
      if (window.calScriptLoaded && (hasCalFunction || hasCalApi || hasCalObject)) {
        try {
          const container = document.querySelector('#my-cal-inline-expat-savvy');
          if (!container) {
            console.error('❌ Calendar container not found for manual init');
            return;
          }
          
          console.log('✅ Found container for manual init:', container);
          console.log('🔍 Container dimensions:', {
            width: container.offsetWidth,
            height: container.offsetHeight,
            display: window.getComputedStyle(container).display
          });
          
          // Clear any existing content
          container.innerHTML = '';
          
          // Keep modal backdrop clicks enabled for calendar step
          const modal = document.querySelector('#modal');
          if (modal) {
            // Don't disable pointer events - allow user to close modal
            console.log('✅ Modal backdrop clicks remain enabled for calendar step');
          }
          
          // Try Cal.com APIs first, fallback to iframe
          if (window.calApi) {
            console.log('🎯 Using modern Cal API...');
            
            // Apply UI styling (like in React version)
            window.calApi("ui", {
              "theme":"light",
              "cssVarsPerTheme":{
                "light":{"cal-brand":"#EF4444"}, // Red as requested
                "dark":{"cal-brand":"#EF4444"}
              },
              "hideEventTypeDetails":false,
              "layout":"month_view"
            });
            
            // Create inline embed using modern API
            window.calApi("inline", {
              elementOrSelector:"#my-cal-inline-expat-savvy",
              config: {
                "layout":"month_view",
                "theme":"light"
              },
              calLink: "primerelocation/expat-savvy",
            });
          } else if (typeof window.Cal === 'function') {
            console.log('🎯 Using legacy Cal API...');
            
            // Initialize Cal.com using legacy approach
            window.Cal("init", "expat-savvy", {origin:"https://app.cal.com"});
            
            // Apply UI styling first (like in React version)
            window.Cal.ns["expat-savvy"]("ui", {
              "theme":"light",
              "cssVarsPerTheme":{
                "light":{"cal-brand":"#EF4444"}, // Red as requested
                "dark":{"cal-brand":"#EF4444"}
              },
              "hideEventTypeDetails":false,
              "layout":"month_view"
            });
            
            // Create inline embed
            window.Cal.ns["expat-savvy"]("inline", {
              elementOrSelector:"#my-cal-inline-expat-savvy",
              config: {
                "layout":"month_view",
                "theme":"light"
              },
              calLink: "primerelocation/expat-savvy",
            });
          } else {
            console.log('🎯 No working Cal API found, using iframe embed...');
            
            // Get user data from the modal's userData object
            let prefillParams = '';
            if (window.userData) {
              const params = new URLSearchParams();
              
              if (window.userData.firstName || window.userData.lastName) {
                const fullName = `${window.userData.firstName || ''} ${window.userData.lastName || ''}`.trim();
                if (fullName) {
                  params.append('name', fullName);
                  console.log('📝 Prefilling name:', fullName);
                }
              }
              
              if (window.userData.email) {
                params.append('email', window.userData.email);
                console.log('📝 Prefilling email:', window.userData.email);
              }
              
              if (window.userData.phone) {
                // Cal.com uses 'phone' for phone number
                params.append('phone', window.userData.phone);
                console.log('📝 Prefilling phone:', window.userData.phone);
              }
              
              if (params.toString()) {
                prefillParams = '&' + params.toString();
              }
            }
            
            // Use iframe embed as the most reliable method
            const iframe = document.createElement('iframe');
            iframe.src = `https://cal.com/primerelocation/expat-savvy?embed=true&layout=month_view&theme=light${prefillParams}`;
            iframe.style.width = '100%';
            iframe.style.height = '600px';
            iframe.style.border = 'none';
            iframe.style.borderRadius = '8px';
            iframe.style.background = '#F3F4F6'; // Match Cal.com gray
            iframe.style.display = 'block';
            iframe.setAttribute('allow', 'camera; microphone; geolocation');
            
            // Make the entire container gray to match Cal.com
            container.style.background = '#F3F4F6';
            container.style.backgroundColor = '#F3F4F6';
            container.style.padding = '0';
            container.style.margin = '0';
            container.style.overflow = 'hidden';
            container.style.minHeight = '600px';
            
            // Don't block pointer events on the container - allow backdrop clicks
            container.style.pointerEvents = 'none';
            iframe.style.pointerEvents = 'auto';
            
            // Find the parent modal content container and make it gray
            const modalContent = document.querySelector('#modal-content');
            if (modalContent) {
              modalContent.style.padding = '0';
              modalContent.style.backgroundColor = '#F3F4F6';
            }
            
            // Find the step 4 container and make it gray
            const step4Container = container.closest('.bg-white');
            if (step4Container) {
              step4Container.style.padding = '0';
              step4Container.style.backgroundColor = '#F3F4F6';
            }
            
            container.appendChild(iframe);
            console.log('✅ Created Cal.com iframe embed with prefill data');
          }
          
          console.log('✅ Cal.com manually initialized successfully');
          
          // Debug: Check what was created in the container
          setTimeout(() => {
            console.log('🔍 Container content after init:', container.innerHTML.length > 0 ? 'Has content' : 'Empty');
            console.log('🔍 Container children:', container.children.length);
            if (container.children.length > 0) {
              console.log('🔍 First child:', container.children[0]);
            }
          }, 1000);
        } catch (error) {
          console.error('❌ Error in manual Cal.com init:', error);
        }
      } else {
        console.log('⚠️ Cal.com not ready yet, retrying in 1000ms...');
        console.log('🔍 Script loaded:', window.calScriptLoaded);
        console.log('🔍 Cal function type:', typeof window.Cal);
        console.log('🔍 Cal API:', !!window.calApi);
        console.log('🔍 getCalApi available:', typeof window.getCalApi === 'function');
        setTimeout(tryInitialize, 1000);
      }
    };
    
    // Start trying to initialize
    tryInitialize();
  }
}

// Initialize when DOM is ready
let modalSystemInstance;
console.log('📦 modal-overlay-system.js loaded, document.readyState:', document.readyState);
if (document.readyState === 'loading') {
  console.log('⏳ Document still loading, waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOMContentLoaded fired, creating ModalOverlaySystem...');
    modalSystemInstance = new ModalOverlaySystem();
    console.log('✅ ModalOverlaySystem instance created:', !!modalSystemInstance);
  });
} else {
  console.log('✅ Document already loaded, creating ModalOverlaySystem immediately...');
  modalSystemInstance = new ModalOverlaySystem();
  console.log('✅ ModalOverlaySystem instance created:', !!modalSystemInstance);
}

// Global close handler (with debounce)
document.addEventListener('click', (e) => {
  // Ignore clicks if modal is still opening
  if (modalSystemInstance && modalSystemInstance.isOpening) {
    console.log('⚠️ Ignoring click - modal is opening');
    return;
  }
  
  // Check for close button clicks
  if (e.target.classList.contains('close-modal') || 
      e.target.closest('.close-modal') ||
      e.target.closest('[onclick*="closeModal"]') ||
      e.target.closest('button[onclick*="closeModal"]')) {
    e.preventDefault();
    e.stopPropagation();
    window.closeModalOverlay();
    return;
  }
  
  // Check for backdrop clicks
  if (e.target.classList.contains('modal') && e.target.id === 'modal') {
    window.closeModalOverlay();
  }
});

// ESC key handler
document.addEventListener('keydown', (e) => {
  // Ignore ESC if modal is still opening
  if (modalSystemInstance && modalSystemInstance.isOpening) {
    return;
  }
  
  if (e.key === 'Escape') {
    window.closeModalOverlay();
  }
});
