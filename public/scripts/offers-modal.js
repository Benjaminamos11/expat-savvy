
window.handleNextStep = function() {
  if (window.globalOffersModal) {
    const instance = window.globalOffersModal;
    if (instance.validateStep(instance.currentStep)) {
      if (instance.currentStep < 6) {
        instance.nextStep();
      } else {
        instance.submitOffersForm();
      }
    }
  } else {
    console.error('OffersModal instance not found');
  }
};

class OffersModal {
  constructor() {
    this.currentStep = 'intro'; // 'intro', 'consultation_intake', or step numbers 1-6, 'thankyou'
    this.formData = { people: [{}] }; // Init with one person
    this.pageIntent = this.detectPageIntent();
    this.isMobile = window.innerWidth < 1024; // Simple mobile detection
    this.listenersAttachedForStep = false; // Flag to prevent multiple attachments
    this.isSubmitting = false; // Prevent duplicate form submissions
    
    console.log('OffersModal constructor - Mobile detection:', this.isMobile, 'Window width:', window.innerWidth);
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupGlobalModalAccess();
    this.renderContent(); // Initial render when modal is created
    window.globalOffersModal = this; // Make instance globally accessible
    console.log('OffersModal initialized and set as globalOffersModal.');
  }

  // Detect page intent (simplified for now)
  detectPageIntent() {
    const path = window.location.pathname;
    if (path.includes('/setup')) return 'setup';
    if (path.includes('/change')) return 'change';
    return 'home'; // Default
  }

  // Render consultation panel in left column
  renderConsultationPanel(intent = 'general') {
    const container = document.getElementById('consultation-panel-container');
    if (!container) return;

    const personalizedCTA = this.getPersonalizedCTA(intent);
    
    container.innerHTML = `
      <div class="consultation-panel">
        <!-- Clean Header -->
        <div class="text-center mb-6">
          <h3 class="text-2xl font-bold text-gray-900 mb-3">Need Expert Guidance?</h3>
          <p class="text-gray-600 text-sm">Get personalized advice from Robert Kolar<br>FINMA Registered Advisor</p>
        </div>
        
        <!-- Robert's Photo -->
        <div class="flex justify-center mb-6">
          <div class="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm">
            <img 
              src="https://res.cloudinary.com/dphbnwjtx/image/upload/w_80,h_80,q_95,f_webp,c_fill,g_face,e_sharpen:100/v1757251477/Generated_Image_September_07_2025_-_9_20PM_uuse1r.webp" 
              alt="Robert Kolar - FINMA Registered Advisor" 
              width="80"
              height="80"
              class="w-full h-full object-cover" 
              onerror="this.src='/images/default-avatar.svg'" 
            />
          </div>
        </div>
        
        <!-- Benefits List -->
        <div class="mb-8">
          <ul class="space-y-4">
            <li class="flex items-center">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </div>
              <span class="text-gray-700 font-medium">Expert guidance in English</span>
            </li>
            <li class="flex items-center">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </div>
              <span class="text-gray-700 font-medium">Compare all insurers objectively</span>
            </li>
            <li class="flex items-center">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </div>
              <span class="text-gray-700 font-medium">Save time & avoid costly mistakes</span>
            </li>
          </ul>
        </div>
        
        <!-- Primary CTA Button -->
        <div class="mb-6">
          <button 
            class="btn-consultation-primary w-full"
            onclick="window.globalOffersModal && window.globalOffersModal.startConsultationFlow()"
            aria-label="Schedule a free 15–30 minute consultation with Robert"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            ${personalizedCTA}
          </button>
          <p class="text-xs text-gray-500 text-center mt-2">Recommended · 15–30 min · 100% free</p>
        </div>
        
        <!-- Trust Indicator -->
        <div class="text-center">
          <p class="text-sm text-gray-500">💬 Most people start with a quick call</p>
        </div>
      </div>
    `;
  }

  // Render main content in right column
  renderMainContent(contentHTML) {
    const container = document.getElementById('main-content-container');
    if (!container) return;
    
    // Add step class for CSS styling (only step 4 should scroll)
    container.className = 'modal-content-panel';
    if (typeof this.currentStep === 'number' && this.currentStep === 4) {
      container.classList.add('step-4');
    }

    container.innerHTML = contentHTML;
  }

  // Get personalized CTA text based on intent
  getPersonalizedCTA(intent) {
    switch (intent) {
      case 'setup':
      case 'new':
        return "Book a quick welcome consultation (15–30 min)";
      case 'switch':
      case 'change':
        return "Compare your plan with Robert (15–30 min)";
      case 'family':
      case 'special':
        return "Discuss your family's coverage (15–30 min)";
      case 'review':
        return "Get expert feedback on your plan (15–30 min)";
      default:
        return "Schedule Free Consultation (15–30 min)";
    }
  }

  // Get current user intent based on form data
  getCurrentIntent() {
    // Check if user selected a motivation card
    if (this.formData.motivation) {
      return this.formData.motivation;
    }
    
    // Check form data for indicators
    if (this.formData.householdType === 'family') {
      return 'family';
    }
    
    // Default based on page intent
    return this.pageIntent || 'general';
  }

  // Get form step content for main content panel
  getFormStepContent(step, title, subtitle, intro) {
    let contentHTML = `
      <div data-step-name="step-${step}">
        <h3 class="text-2xl font-bold mb-2">${title}</h3>
        ${subtitle ? `<p class="text-gray-600 mb-6">${subtitle}</p>` : ''}
        ${intro ? `<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p class="text-sm text-blue-800">${intro}</p>
        </div>` : ''}`;
    
    contentHTML += this.getStepContent(step);
    
    // Add navigation buttons
    contentHTML += this.getStepNavigation(step);
    
    contentHTML += `</div>`;
    return contentHTML;
  }

  // Get step navigation buttons (REMOVED - no navigation buttons needed)
  getStepNavigation(step) {
    return ''; // No navigation buttons - removed completely
  }

  // Render mobile consultation panel (collapsible card)
  renderMobileConsultationPanel(intent = 'general') {
    const personalizedCTA = this.getPersonalizedCTA(intent);
    
    return `
      <div class="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center">
            <img 
              src="https://res.cloudinary.com/dphbnwjtx/image/upload/w_40,h_40,q_95,f_webp,c_fill,g_face,e_sharpen:100/v1757251477/Generated_Image_September_07_2025_-_9_20PM_uuse1r.webp" 
              alt="Robert Kolar" 
              class="w-10 h-10 rounded-full mr-3 object-cover" 
            />
            <div>
              <h4 class="font-semibold text-gray-900 text-sm">Not sure about options?</h4>
              <p class="text-xs text-gray-600">Get personalized advice from Robert</p>
            </div>
          </div>
          <button id="toggle-consultation-mobile" class="text-gray-500 hover:text-gray-700">
            <svg class="w-5 h-5 transition-transform" id="consultation-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
        
        <div id="mobile-consultation-details" class="hidden">
          <div class="flex justify-center gap-1 mb-4">
            <span class="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">DE</span>
            <span class="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">EN</span>
            <span class="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">FR</span>
            <span class="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">CZ</span>
          </div>
          
          <div class="space-y-2 mb-4">
            <div class="flex items-start text-sm">
              <svg class="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              <span class="text-gray-700">Expert guidance in English</span>
            </div>
            <div class="flex items-start text-sm">
              <svg class="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              <span class="text-gray-700">Compare all insurers objectively</span>
            </div>
            <div class="flex items-start text-sm">
              <svg class="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              <span class="text-gray-700">Save time & avoid costly mistakes</span>
            </div>
          </div>
          
          <p class="text-xs text-gray-500 text-center mb-3">💬 Most people start with a quick call.</p>
        </div>
        
        <button 
          class="btn-consultation-primary w-full text-sm py-3"
          onclick="window.globalOffersModal && window.globalOffersModal.trackConsultationBooked(window.globalOffersModal.currentStep, window.globalOffersModal.getCurrentIntent()); window.open('https://cal.com/robertkolar/expat-savvy', '_blank')"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          ${personalizedCTA}
        </button>
        <p class="text-xs text-gray-500 text-center mt-2">Recommended · 15–30 min · 100% free</p>
      </div>
    `;
  }

  // Track analytics events
  trackEvent(eventName, properties = {}) {
    const eventData = {
      ...properties,
      variant: 'consult-left-primary',
      modal_type: 'offers_modal',
      timestamp: new Date().toISOString()
    };
    
    console.log('📊 Tracking event:', eventName, eventData);
    
    // Send to Plausible if available
    if (typeof window.plausible === 'function') {
      window.plausible(eventName, { props: eventData });
    }
    
    // Send to Google Analytics if available
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, eventData);
    }
  }

  // Track modal view
  trackModalView(step, intent) {
    this.trackEvent('modal_view', {
      step: step,
      intent: intent,
      variant: 'consult-left-primary'
    });
  }

  // Track CTA click
  trackCTAClick(step, surface, intent) {
    this.trackEvent('cta_click', {
      step: step,
      surface: surface,
      intent: intent,
      variant: 'consult-left-primary'
    });
  }

  // Track consultation booking
  trackConsultationBooked(step, intent) {
    this.trackEvent('consultation_booked', {
      source: 'modal',
      stepAtClick: step,
      intent: intent,
      variant: 'consult-left-primary'
    });
  }

  // Start consultation flow - collect details first, then show Cal.com
  startConsultationFlow() {
    console.log('🚀 Starting consultation flow');
    this.trackEvent('consultation_flow_started', {
      intent: this.getCurrentIntent(),
      variant: 'consult-left-primary'
    });
    
    // Set consultation mode
    this.isConsultationFlow = true;
    this.currentStep = 'consultation_intake';
    this.renderContent();
  }

  // Validate consultation form
  validateConsultationForm() {
    const nameInput = document.querySelector('input[name="consultation-name"]');
    const emailInput = document.querySelector('input[name="consultation-email"]');
    
    let isValid = true;
    
    if (!nameInput || !nameInput.value.trim()) {
      isValid = false;
      console.log('❌ Consultation form: Name is required');
    }
    
    if (!emailInput || !emailInput.value.trim() || !this.isValidEmail(emailInput.value)) {
      isValid = false;
      console.log('❌ Consultation form: Valid email is required');
    }
    
    return isValid;
  }

  // Save consultation form data
  saveConsultationData() {
    const nameInput = document.querySelector('input[name="consultation-name"]');
    const emailInput = document.querySelector('input[name="consultation-email"]');
    const phoneInput = document.querySelector('input[name="consultation-phone"]');
    const topicSelect = document.querySelector('select[name="consultation-topic"]');
    const notesTextarea = document.querySelector('textarea[name="consultation-notes"]');
    
    this.formData.consultationName = nameInput?.value || '';
    this.formData.consultationEmail = emailInput?.value || '';
    this.formData.consultationPhone = phoneInput?.value || '';
    this.formData.consultationTopic = topicSelect?.value || '';
    this.formData.consultationNotes = notesTextarea?.value || '';
    
    console.log('💾 Consultation data saved:', this.formData);
    
    // Trigger Resend email funnel for consultation flow
    this.triggerConsultationEmailSequence();
  }

  // Trigger Resend email sequence for consultation flow
  async triggerConsultationEmailSequence() {
    try {
      console.log('📧 Triggering consultation email sequence');
      
      const emailData = {
        email: this.formData.consultationEmail,
        name: this.formData.consultationName,
        phone: this.formData.consultationPhone,
        topic: this.formData.consultationTopic,
        notes: this.formData.consultationNotes,
        source: 'consultation_modal',
        intent: this.getCurrentIntent()
      };

      const response = await fetch('/api/consultation-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });

      if (response.ok) {
        console.log('✅ Consultation email sequence triggered successfully');
        this.trackEvent('consultation_email_triggered', {
          email: this.formData.consultationEmail,
          intent: this.getCurrentIntent()
        });
      } else {
        console.error('❌ Failed to trigger consultation email sequence');
      }
    } catch (error) {
      console.error('❌ Error triggering consultation email sequence:', error);
    }
  }

  // Simple email validation
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Render content based on current step
  renderContent() {
    console.log('=== RENDER CONTENT DEBUG ===');
    console.log('Current step:', this.currentStep);
    
    // Track modal view
    this.trackModalView(this.currentStep, this.getCurrentIntent());
    console.log('Current step type:', typeof this.currentStep);
    console.log('Is mobile:', this.isMobile, 'Window width:', window.innerWidth);
    const mobileContentDiv = document.getElementById('mobile-content');
    const desktopContentDiv = document.getElementById('desktop-content');
    if (!mobileContentDiv || !desktopContentDiv) {
      console.error('Modal content divs not found.');
      return;
    }

    let contentHTML = '';
    console.log('About to check step conditions...');

    // For desktop on intro step, use the new two-column layout structure
    if (!this.isMobile && this.currentStep === 'intro') {
      console.log('BRANCH: Desktop intro step with consultation panel');
      console.log('Checking for consultation-panel-container:', !!document.getElementById('consultation-panel-container'));
      console.log('Checking for main-content-container:', !!document.getElementById('main-content-container'));
      this.renderConsultationPanel(this.getCurrentIntent());
      this.renderMainContent(this.renderIntroStep());
      this.attachStepEventHandlers();
      this.initializeLucideIcons();
      return; // Exit early since we're using separate containers
    } else if (this.currentStep === 'intro') {
      console.log('BRANCH: Mobile intro step');
      contentHTML = this.renderIntroStep();
    } else if (this.currentStep === 'consultation_intake') {
      if (!this.isMobile) {
        // Desktop: Show consultation intake form on LEFT side
        this.renderConsultationIntakePanel();
        this.renderMainContent(this.renderIntroStep());
        this.attachStepEventHandlers();
        this.initializeLucideIcons();
        return;
      } else {
        contentHTML = this.renderConsultationIntakeStep();
      }
    } else if (this.currentStep === 'consultation_scheduling') {
      if (!this.isMobile) {
        // Desktop: Show Cal.com inline on LEFT side
        this.renderConsultationSchedulingPanel();
        this.renderMainContent(this.renderIntroStep());
        return;
      } else {
        contentHTML = this.renderConsultationSchedulingStep();
      }
    } else if (typeof this.currentStep === 'number' && this.currentStep >= 1 && this.currentStep <= 6) {
      if (!this.isMobile) {
        // Desktop: Use new two-column layout
        this.renderOffersStep(this.currentStep);
        return; // Exit early since we're using separate containers
      } else {
        contentHTML = this.renderOffersStep(this.currentStep);
      }
    } else if (this.currentStep === 'thankyou') {
      contentHTML = this.renderThankYouStep();
    }

    // Start interval before setting HTML for form steps
    let interval;
    if (typeof this.currentStep === 'number' && this.currentStep >= 1 && this.currentStep <= 6 && !this.listenersAttachedForStep) {
      console.log('Starting interval check for desktop buttons');
      const checkInterval = 100;
      const maxTime = 2000;
      let timeElapsed = 0;

      const nextHandler = (e) => {
        console.log('Desktop next button clicked');
        e.preventDefault();
        if (this.validateStep(this.currentStep)) {
          if (this.currentStep < 6) {
            console.log('Step advanced to', this.currentStep + 1);
            this.nextStep();
          } else {
            this.submitOffersForm();
          }
        }
      };

      const backHandler = (e) => {
        console.log('Desktop back button clicked');
        e.preventDefault();
        this.previousStep();
      };

      const attachIfExists = (id, handler, logMsg) => {
        let btn = document.getElementById(id);
        if (btn && btn.dataset.attached !== 'true') {
          console.log(`Attaching ${logMsg} listener to: ${id}`);
          btn.addEventListener('click', handler, {capture: true});
          btn.addEventListener('touchend', handler, {capture: true});
          btn.dataset.attached = 'true';
          console.log(`${logMsg} listener attached successfully`);
          return true;
        } else if (btn) {
          console.log(`Immediate check for ${logMsg}: already attached`);
        } else {
          console.log(`Immediate check for ${logMsg}: not found`);
        }
        return false;
      };

      // Immediate check before interval
      const nextAttached = attachIfExists('step-next', nextHandler, 'desktop next');
      const backAttached = attachIfExists('step-back', backHandler, 'desktop back');
      if (nextAttached && backAttached) {
        this.listenersAttachedForStep = true;
        console.log('Desktop listeners attached on immediate check');
      } else {
        interval = setInterval(() => {
          timeElapsed += checkInterval;
          console.log(`Checking for buttons at ${timeElapsed}ms`);
          const nextNowAttached = attachIfExists('step-next', nextHandler, 'desktop next');
          const backNowAttached = attachIfExists('step-back', backHandler, 'desktop back');
          if (nextNowAttached && backNowAttached) {
            clearInterval(interval);
            this.listenersAttachedForStep = true;
            console.log('Desktop listeners attached via interval check');
          } else if (timeElapsed >= maxTime) {
            clearInterval(interval);
            console.error('Timeout - desktop buttons not found after 2s');
          }
        }, checkInterval);
      }
    }

    // Set content for mobile and desktop separately
    if (this.isMobile) {
      console.log('=== MOBILE CONTENT DEBUG ===');
      console.log('Setting mobile content HTML length:', contentHTML.length);
      console.log('Mobile content div found:', !!mobileContentDiv);
      console.log('Desktop content div found:', !!desktopContentDiv);
      console.log('Mobile content div classes:', mobileContentDiv?.className);
      console.log('Mobile content div styles:', mobileContentDiv?.style.cssText);
      
      // Check if mobile content div has any existing content
      console.log('Mobile content div existing innerHTML:', mobileContentDiv?.innerHTML);
      
      mobileContentDiv.innerHTML = contentHTML;
      desktopContentDiv.innerHTML = ''; // Clear desktop content on mobile
      
      console.log('Mobile content set, new innerHTML length:', mobileContentDiv.innerHTML.length);
      console.log('Mobile content div offsetHeight:', mobileContentDiv.offsetHeight);
      console.log('Mobile content div scrollHeight:', mobileContentDiv.scrollHeight);
      console.log('Mobile content div computed display:', window.getComputedStyle(mobileContentDiv).display);
      console.log('Mobile content div computed background:', window.getComputedStyle(mobileContentDiv).backgroundColor);
      console.log('Mobile content div computed color:', window.getComputedStyle(mobileContentDiv).color);
      console.log('FULL contentHTML preview (first 500 chars):', contentHTML.substring(0, 500));
    } else {
      console.log('Setting desktop content:', contentHTML);
      desktopContentDiv.innerHTML = contentHTML;
      mobileContentDiv.innerHTML = ''; // Clear mobile content on desktop
      console.log('Desktop content set, div innerHTML length:', desktopContentDiv.innerHTML.length);
    }
    console.log("Final contentHTML length:", contentHTML.length);
    console.log("Final contentHTML preview:", contentHTML.substring(0, 200));

    // Explicit check after setting HTML
    if (typeof this.currentStep === 'number' && this.currentStep >= 1 && this.currentStep <= 6 && !this.listenersAttachedForStep) {
      const nextHandler = (e) => {
        console.log('Desktop next button clicked');
        e.preventDefault();
        if (this.validateStep(this.currentStep)) {
          if (this.currentStep < 6) {
            console.log('Step advanced to', this.currentStep + 1);
            this.nextStep();
          } else {
            this.submitOffersForm();
          }
        }
      };

      const backHandler = (e) => {
        console.log('Desktop back button clicked');
        e.preventDefault();
        this.previousStep();
      };

      const attachIfExists = (id, handler, logMsg) => {
        let btn = document.getElementById(id);
        if (btn && btn.dataset.attached !== 'true') {
          console.log(`Attaching ${logMsg} listener to: ${id}`);
          btn.addEventListener('click', handler, {capture: true});
          btn.addEventListener('touchend', handler, {capture: true});
          btn.dataset.attached = 'true';
          console.log(`${logMsg} listener attached successfully`);
          return true;
        }
        return false;
      };

      const nextAttached = attachIfExists('step-next', nextHandler, 'desktop next');
      const backAttached = attachIfExists('step-back', backHandler, 'desktop back');
      if (nextAttached && backAttached) {
        this.listenersAttachedForStep = true;
        console.log('Desktop listeners attached on explicit check after innerHTML');
        if (interval) clearInterval(interval);
      } else {
        console.log('Explicit check after innerHTML: buttons not found - continuing with interval');
      }
    }

    setTimeout(() => {
      this.attachStepEventHandlers();
      this.initializeLucideIcons();
      if (this.isMobile && typeof this.currentStep === 'number') {
        this.updateMobileProgress();
        this.updateMobileFooter();
        this.attachMobileListeners();
      }
    }, 0);
  }

  renderIntroStep() {
    console.log('=== RENDER INTRO STEP DEBUG ===');
    console.log('isMobile flag:', this.isMobile);
    console.log('window.innerWidth:', window.innerWidth);
    
    const socialCount = this.generateSocialProof();
    const { headline, subline } = this.getHeadlineContent();
    
    console.log('Generated social count:', socialCount);
    console.log('Generated headline:', headline);
    console.log('Generated subline:', subline);
    
    if (this.isMobile) {
      console.log('ENTERING MOBILE BRANCH for intro step');
      // Mobile version with consultation panel at top
      return `
        <div data-step-name="intro">
          ${this.renderMobileConsultationPanel(this.getCurrentIntent())}
          
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-3">${headline}</h2>
            <p class="text-gray-600 mb-4">${subline}</p>
            
            <div class="inline-flex items-center bg-green-50 border border-green-200 rounded-full px-3 py-1 text-sm text-green-800">
              <i data-lucide="message-circle" class="w-4 h-4 mr-2 text-green-600"></i>
              ${socialCount} people booked consultations in the last 24 hours
            </div>
          </div>
          
          <div class="grid grid-cols-1 gap-3 mb-6">
            <button class="motivation-card p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left" data-motivation="setup">
              <i data-lucide="home" class="w-5 h-5 text-green-600 mb-2"></i>
              <p>I need to set up Swiss health insurance (new in Switzerland)</p>
            </button>
            <button class="motivation-card p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left" data-motivation="switch">
              <i data-lucide="repeat" class="w-5 h-5 text-green-600 mb-2"></i>
              <p>I want to switch to a cheaper plan for 2026</p>
            </button>
            <button class="motivation-card p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left" data-motivation="review">
              <i data-lucide="search" class="w-5 h-5 text-green-600 mb-2"></i>
              <p>I'd like to review my current coverage</p>
            </button>
            <button class="motivation-card p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left" data-motivation="family">
              <i data-lucide="users" class="w-5 h-5 text-green-600 mb-2"></i>
              <p>I need advice for my family / special situation</p>
            </button>
          </div>
          
          <!-- Primary CTA: Consultation (Swiss Gradient) -->
          <button id="mobile-consultation-btn" class="btn-consultation-primary w-full mb-3" onclick="window.globalOffersModal && window.globalOffersModal.startConsultationFlow()">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Schedule Free Consultation (15–30 min)
          </button>
          <p class="text-xs text-gray-500 text-center mb-4">Recommended · 15–30 min · 100% free</p>
          
          <!-- Secondary CTA: Get Offers (Green) -->
          <button id="start-offers-btn" class="btn-secondary w-full">
            <div class="flex items-center justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div>
                <div class="font-medium">Get 3 Best Offers</div>
                <div class="text-green-100 text-sm">Takes ~1 min</div>
              </div>
            </div>
          </button>
          <p class="text-xs text-gray-500 text-center mt-2">Or book a quick call now for faster results</p>
        </div>
      `;
    } else {
      // Desktop version (no consultation button - it's in sidebar)
      return `
        <div data-step-name="intro">
          <div class="text-center mb-8">
            <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">${headline}</h2>
            <p class="text-gray-600 mb-4">${subline}</p>
            
            <div class="inline-flex items-center bg-green-50 border border-green-200 rounded-full px-3 py-1 text-sm text-green-800">
              <i data-lucide="message-circle" class="w-4 h-4 mr-2 text-green-600"></i>
              ${socialCount} people booked consultations in the last 24 hours
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button class="motivation-card p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left" data-motivation="setup">
              <i data-lucide="home" class="w-5 h-5 text-green-600 mb-2"></i>
              <p>I need to set up Swiss health insurance (new in Switzerland)</p>
            </button>
            <button class="motivation-card p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left" data-motivation="switch">
              <i data-lucide="repeat" class="w-5 h-5 text-green-600 mb-2"></i>
              <p>I want to switch to a cheaper plan for 2026</p>
            </button>
            <button class="motivation-card p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left" data-motivation="review">
              <i data-lucide="search" class="w-5 h-5 text-green-600 mb-2"></i>
              <p>I'd like to review my current coverage</p>
            </button>
            <button class="motivation-card p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left" data-motivation="family">
              <i data-lucide="users" class="w-5 h-5 text-green-600 mb-2"></i>
              <p>I need advice for my family / special situation</p>
            </button>
          </div>
          
          <div style="height: 60px;"></div>
          
          <button id="start-offers-btn" class="btn-secondary w-full">
            <div class="flex items-center justify-center">
              <i data-lucide="sparkles" class="w-5 h-5 mr-2"></i>
              <div>
                <div class="font-semibold">Get 3 Best Offers</div>
                <div class="text-green-100 text-sm">Takes ~1 min</div>
              </div>
            </div>
          </button>
        </div>
      `;
    }
  }

  renderConsultationIntakeStep() {
    console.log('Generating Consultation Intake Step HTML.');
    return `
      <div data-step-name="consultation_intake">
        <div class="text-center mb-8">
          <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">Let's schedule your consultation</h2>
          <p class="text-gray-600">We'll collect a few details to personalize your session with Robert.</p>
        </div>
        
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input type="text" name="consultation-name" required value="${this.formData.name || ''}" 
                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" name="consultation-email" required value="${this.formData.email || ''}" 
                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Phone (optional)</label>
            <input type="tel" name="consultation-phone" value="${this.formData.phone || ''}" 
                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">What would you like to discuss?</label>
            <select name="consultation-topic" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg">
              <option value="setup">Setting up Swiss health insurance</option>
              <option value="switch">Switching to a better plan</option>
              <option value="review">Reviewing current coverage</option>
              <option value="family">Family insurance planning</option>
              <option value="other">Other questions</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Additional notes (optional)</label>
            <textarea name="consultation-notes" rows="3" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg"
                      placeholder="Tell us about your specific situation..."></textarea>
          </div>
        </div>
        
        <div class="mt-8 pt-6 border-t border-gray-200">
          <button id="schedule-consultation-btn" class="btn-consultation-primary w-full">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Continue to Scheduling
          </button>
        </div>
      </div>
    `;
  }

  renderConsultationSchedulingStep() {
    console.log('Generating Consultation Scheduling Step HTML.');
    return `
      <div data-step-name="consultation_scheduling">
        <div class="text-center mb-6">
          <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">Choose your preferred time</h2>
          <p class="text-gray-600">Select a time that works best for your consultation with Robert.</p>
        </div>
        
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <div id="cal-embed" style="width: 100%; height: 620px; overflow: hidden;">
            <iframe 
              src="https://cal.com/robertkolar/expat-savvy?embed=true&embedType=inline" 
              width="100%" 
              height="620"
              frameborder="0"
              style="border: none; border-radius: 8px;"
              title="Schedule a consultation with Robert Kolar">
            </iframe>
          </div>
        </div>
        
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-500">
            Having trouble with the calendar? 
            <a href="https://cal.com/robertkolar/expat-savvy" target="_blank" class="text-red-600 hover:text-red-700 underline">
              Open in new tab
            </a>
          </p>
        </div>
      </div>
    `;
  }

  // Render consultation intake form on LEFT panel (desktop only)
  renderConsultationIntakePanel() {
    const container = document.getElementById('consultation-panel-container');
    if (!container) return;

    container.innerHTML = `
      <div class="consultation-panel">
        <div class="text-center mb-6">
          <h3 class="text-xl font-bold text-gray-900 mb-2">Let's schedule your consultation</h3>
          <p class="text-gray-600">We'll collect a few details to personalize your session with Robert.</p>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input type="text" name="consultation-name" required value="${this.formData.name || ''}" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" name="consultation-email" required value="${this.formData.email || ''}" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Phone (optional)</label>
            <input type="tel" name="consultation-phone" value="${this.formData.phone || ''}" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">What would you like to discuss?</label>
            <select name="consultation-topic" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
              <option value="setup">Setting up Swiss health insurance</option>
              <option value="switch">Switching to a better plan</option>
              <option value="review">Reviewing current coverage</option>
              <option value="family">Family insurance planning</option>
              <option value="other">Other questions</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Additional notes (optional)</label>
            <textarea name="consultation-notes" rows="2" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Tell us about your specific situation..."></textarea>
          </div>
        </div>
        
        <div class="mt-6 pt-4 border-t border-gray-200">
          <button id="schedule-consultation-btn" class="btn-consultation-primary w-full mb-3">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Continue to Scheduling
          </button>
          
          <button id="back-to-intro-btn" class="w-full text-gray-600 hover:text-gray-800 underline text-sm">
            ← Back to options
          </button>
        </div>
      </div>
    `;
  }

  // Render Cal.com scheduling on LEFT panel (desktop only)
  renderConsultationSchedulingPanel() {
    const container = document.getElementById('consultation-panel-container');
    if (!container) return;

    container.innerHTML = `
      <div class="consultation-panel">
        <div class="text-center mb-6">
          <h3 class="text-xl font-bold text-gray-900 mb-2">Choose your preferred time</h3>
          <p class="text-gray-600">Select a time that works best for your consultation with Robert.</p>
        </div>
        
        <div class="bg-gray-50 rounded-lg border border-gray-200 p-2">
          <div id="cal-embed" style="width: 100%; height: 500px; overflow: hidden;">
            <iframe 
              src="https://cal.com/robertkolar/expat-savvy?embed=true&embedType=inline" 
              width="100%" 
              height="500"
              frameborder="0"
              style="border: none; border-radius: 6px;"
              title="Schedule a consultation with Robert Kolar">
            </iframe>
          </div>
        </div>
        
        <div class="mt-4 text-center">
          <p class="text-xs text-gray-500 mb-3">
            Having trouble with the calendar? 
            <a href="https://cal.com/robertkolar/expat-savvy" target="_blank" class="text-red-600 hover:text-red-700 underline">
              Open in new tab
            </a>
          </p>
          
          <button id="back-to-intake-btn" class="text-gray-600 hover:text-gray-800 underline text-sm">
            ← Back to details
          </button>
        </div>
      </div>
    `;
  }

  renderOffersStep(step) {
    const { title, subtitle, intro } = this.getStepInfo(step);
    
    if (!this.isMobile) {
      // Desktop: Use new two-column layout with consultation panel
      this.renderConsultationPanel(this.getCurrentIntent());
      this.renderMainContent(this.getFormStepContent(step, title, subtitle, intro));
      return ''; // Return empty since we're using separate containers
    } else {
      // Mobile: Single column with banner at top
      let stepHTML = this.getStepBanner();
      stepHTML += `<h3 class="text-xl font-bold mb-2">${title}</h3>`;
      stepHTML += subtitle ? `<p class="text-gray-600 mb-4">${subtitle}</p>` : '';
      stepHTML += intro ? `<div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <p class="text-sm text-blue-800">${intro}</p>
      </div>` : '';
      stepHTML += this.getStepContent(step);
      return stepHTML;
    }
  }
  
  getStepContent(step) {
    let stepHTML = '';
    
    switch (step) {
      case 1:
        stepHTML += `
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" name="name" required value="${this.formData.name || ''}" placeholder="e.g. Benjamin Wagner"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
              <p id="error-name" class="text-red-500 text-xs mt-1 hidden">Please enter your name.</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Postcode (optional)</label>
              <input type="text" name="postcode" pattern="\\d{4}" placeholder="e.g. 8001" value="${this.formData.postcode || ''}"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
              <p class="text-sm text-gray-500 mt-1">If you don't have one yet (new to Switzerland), leave blank—we'll follow up.</p>
              <p id="error-postcode" class="text-red-500 text-xs mt-1 hidden">Invalid format (must be 4 digits).</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Household Type</label>
              <select name="household" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                <option value="">Select</option>
                <option value="single" ${this.formData.household === 'single' ? 'selected' : ''}>Single</option>
                <option value="couple" ${this.formData.household === 'couple' ? 'selected' : ''}>Couple</option>
                <option value="family" ${this.formData.household === 'family' ? 'selected' : ''}>Family</option>
              </select>
              <p id="error-household" class="text-red-500 text-xs mt-1 hidden">Please select household type.</p>
            </div>
          </div>
        `;
        // After setting innerHTML, add listeners
        setTimeout(() => {
          const contentDiv = document.getElementById('desktop-content') || document.getElementById('mobile-content');
          if (!contentDiv) return;
          
          const nameInput = contentDiv.querySelector('input[name="name"]');
          if (nameInput) nameInput.addEventListener('input', () => console.log('Name input to:', nameInput.value.trim()));
          
          const postcodeInput = contentDiv.querySelector('input[name="postcode"]');
          if (postcodeInput) postcodeInput.addEventListener('input', () => console.log('Postcode input to:', postcodeInput.value));
          
          const householdSelect = contentDiv.querySelector('select[name="household"]');
          if (householdSelect) householdSelect.addEventListener('change', () => console.log('Household selected:', householdSelect.value));
        }, 0);
        break;
      case 2:
        // Ensure at least one person exists
        if (this.formData.people.length === 0) {
          this.formData.people = [{ dob: '', employment: '' }];
        }
        
        let peopleHTML = '';
        for (let i = 1; i <= this.formData.people.length; i++) {
          const person = this.formData.people[i-1];
          peopleHTML += `
            <div class="relative border-b pb-4 mb-4" data-person="${i}">
              <button class="remove-person absolute top-0 right-0 text-red-600 hover:bg-red-50 p-1 rounded" data-person="${i}" ${this.formData.people.length <= 1 ? 'style="display: none;"' : ''}>
                <i data-lucide="x" class="w-5 h-5"></i>
              </button>
              <h4 class="font-semibold mb-4">Person ${i}</h4>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input type="date" name="dob-${i}" required value="${person.dob || ''}" max="${new Date().toISOString().split('T')[0]}" placeholder="YYYY-MM-DD" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <p id="error-dob-${i}" class="text-red-500 text-xs mt-1 hidden">Please enter a valid date of birth.</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Employment Status</label>
                  <select name="employment-${i}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">Select</option>
                    <option value="employed" ${person.employment === 'employed' ? 'selected' : ''}>Employed</option>
                    <option value="self-employed" ${person.employment === 'self-employed' ? 'selected' : ''}>Self-employed</option>
                    <option value="student" ${person.employment === 'student' ? 'selected' : ''}>Student</option>
                    <option value="retired" ${person.employment === 'retired' ? 'selected' : ''}>Retired</option>
                    <option value="unemployed" ${person.employment === 'unemployed' ? 'selected' : ''}>Unemployed</option>
                  </select>
                  <p id="error-employment-${i}" class="text-red-500 text-xs mt-1 hidden">Please select employment status.</p>
                </div>
              </div>
            </div>
          `;
        }
        stepHTML += `
          <div class="space-y-6">
            ${peopleHTML}
            <button id="add-person" class="mt-4 px-4 py-2 bg-gray-200 rounded-lg">Add Person</button>
          </div>
        `;
        

        break;
      case 3:
        stepHTML += `
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Preferred Deductible</label>
              <select name="deductible" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                <option value="">Select deductible</option>
                <option value="300" ${this.formData.deductible === '300' ? 'selected' : ''}>CHF 300 (higher premiums)</option>
                <option value="500" ${this.formData.deductible === '500' ? 'selected' : ''}>CHF 500</option>
                <option value="1000" ${this.formData.deductible === '1000' ? 'selected' : ''}>CHF 1,000</option>
                <option value="1500" ${this.formData.deductible === '1500' ? 'selected' : ''}>CHF 1,500</option>
                <option value="2000" ${this.formData.deductible === '2000' ? 'selected' : ''}>CHF 2,000</option>
                <option value="2500" ${this.formData.deductible === '2500' ? 'selected' : ''}>CHF 2,500 (lowest premiums)</option>
              </select>
              <p class="text-sm text-gray-500 mt-1">Choose higher for savings if you rarely visit doctors.</p>
              <p id="error-deductible" class="text-red-500 text-xs mt-1 hidden">Please select a deductible.</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Insurance Model</label>
              <select name="model" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                <option value="">Select model</option>
                <option value="standard" ${this.formData.model === 'standard' ? 'selected' : ''}>Standard (free doctor choice)</option>
                <option value="telmed" ${this.formData.model === 'telmed' ? 'selected' : ''}>Telmed (phone first, save ~15%)</option>
                <option value="family-doctor" ${this.formData.model === 'family-doctor' ? 'selected' : ''}>Family Doctor (assigned GP, save ~10%)</option>
                <option value="hmo" ${this.formData.model === 'hmo' ? 'selected' : ''}>HMO (network clinics, save ~20%)</option>
              </select>
              <p class="text-sm text-gray-500 mt-1">Restricted models lower premiums but limit doctor choice.</p>
              <p id="error-model" class="text-red-500 text-xs mt-1 hidden">Please select an insurance model.</p>
            </div>
          </div>
        `;
        break;
      case 4:
        stepHTML += `
          <div class="space-y-4">
            <p class="text-base text-gray-700 mb-6">Thank you for your information ${this.formData.name ? this.formData.name.split(' ')[0] : ''}! Now to find the best options for you, please tell us about your preferences.</p>
            <p class="text-sm text-gray-600 mb-4">Rate how important each coverage type is to you:</p>
            ${['Alternative Medicine', 'Dental Care', 'Private Hospital Room', 'Maternity Benefits', 'Fitness/Gym Coverage', 'International Travel', 'Mental Health'].map(priority => `
              <div class="mb-4">
                <label class="text-sm font-medium text-gray-700 block mb-2">${priority}</label>
                <div class="relative">
                  <input type="range" min="1" max="5" value="${this.formData.priorities?.[priority.toLowerCase().replace(' ', '_')] || 3}" name="priority-${priority.toLowerCase().replace(' ', '_')}"
                         class="w-full accent-green-600">
                  <div class="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Not important</span>
                    <span>Very important</span>
                  </div>
                </div>
              </div>
            `).join('')}
            <label class="block text-sm font-medium text-gray-700 mt-6">Other Needs</label>
            <textarea name="other-needs" placeholder="Any specific requirements? (e.g., coverage for glasses, orthodontics)" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" rows="3">${this.formData.other_needs || ''}</textarea>
          </div>
        `;
        break;
      case 5:
        stepHTML += `
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" required value="${this.formData.email || ''}" placeholder="your@email.com"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
              <p id="error-email" class="text-red-500 text-xs mt-1 hidden">Please enter a valid email address.</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
              <input type="tel" name="phone" value="${this.formData.phone || ''}" placeholder="+41 ..."
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
              <p class="text-sm text-gray-500 mt-1">For faster follow-up if needed.</p>
              <p id="error-phone" class="text-red-500 text-xs mt-1 hidden">Please enter a valid phone number.</p>
            </div>
            <label class="flex items-start">
              <input type="checkbox" name="consent" required class="mt-1 mr-2">
              <span class="text-sm text-gray-600">I consent to Expat Savvy processing my data to provide personalized health insurance offers and contacting me via email/phone. This is free, no-obligation, and I can withdraw consent anytime. See our <a href="/privacy" class="text-green-600 underline">Privacy Policy</a>.</span>
            </label>
            <p id="error-consent" class="text-red-500 text-xs hidden">You must agree to continue.</p>
          </div>
        `;
        break;
      case 6:
        stepHTML += `
          <div class="text-center mb-6">
            <p class="text-lg text-gray-700">Perfect! We'll send your 3 personalized insurance offers to <strong>${this.formData.email}</strong> within 24 hours.</p>
          </div>
          <div class="border border-gray-300 rounded-lg p-4 mb-6 bg-gray-50 space-y-2">
            <h4 class="font-semibold mb-2">Your Summary</h4>
            <p><strong>Name:</strong> ${this.formData.name || 'N/A'}</p>
            <p><strong>Postcode:</strong> ${this.formData.postcode || 'N/A'}</p>
            <p><strong>Household:</strong> ${this.formData.household || 'N/A'}</p>
            <p><strong>Number of People:</strong> ${this.formData.people.length}</p>
            <p><strong>Deductible:</strong> CHF ${this.formData.deductible || 'N/A'}</p>
            <p><strong>Model:</strong> ${this.formData.model || 'N/A'}</p>
            <p><strong>Email:</strong> ${this.formData.email || 'N/A'}</p>
          </div>
          <a href="#" id="prefer-talk" class="block text-center text-gray-600 underline mb-4">Prefer to talk now? Book Free Consultation →</a>
        `;
        break;
    }

    // Add navigation buttons (hidden on mobile, not on thank you step)
    if (!this.isMobile && typeof step === 'number') {
      stepHTML += `
        <div class="mt-8 flex justify-between">
          <button id="step-back" class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 ${step === 1 ? 'invisible' : ''}" onclick="window.globalOffersModal && window.globalOffersModal.previousStep()">Back</button>
          <button id="step-next" class="px-6 py-3 bg-green-600 text-white rounded-lg" onclick="window.handleNextStep()">${step === 6 ? 'Send My Request' : 'Next'}</button>
        </div>
      `;
    }
    
    return stepHTML;
  }

  getStepTitle(step) {
    const titles = ['Where & Who', 'People', 'Basic Insurance', 'Your Preferences', 'Contact & Consent', 'Review & Send'];
    return titles[step - 1];
  }

  getStepInfo(step) {
    const name = this.formData.name ? this.formData.name.split(' ')[0] : '';
    
    const stepInfoMap = {
      1: {
        title: name ? `Welcome ${name}! Let's get started` : "Let's get you the best insurance rates",
        subtitle: "First, we need a few basic details about you",
        intro: this.getIntentBasedIntro()
      },
      2: {
        title: name ? `Thanks ${name}! Who needs coverage?` : "Who needs insurance coverage?",
        subtitle: "Tell us about everyone who needs to be insured",
        intro: "We only ask for the minimum information needed to calculate accurate rates. All insurers require date of birth and employment status for pricing."
      },
      3: {
        title: "Choose your basic insurance preferences",
        subtitle: "These choices significantly impact your premiums",
        intro: "The deductible and insurance model are the two main factors that determine your monthly costs. We'll help you understand each option."
      },
      4: {
        title: name ? `${name}, what's important to you?` : "What matters most in your coverage?",
        subtitle: "Help us find plans that match your priorities",
        intro: "While basic insurance is standardized by law, supplementary options vary greatly. Tell us what matters so we can recommend the best fit."
      },
      5: {
        title: "Almost done! How can we reach you?",
        subtitle: "We'll send your personalized comparison here",
        intro: "Your information is secure and will only be used to send your insurance comparison. We never share your data without permission."
      },
      6: {
        title: "Review your information",
        subtitle: "Make sure everything looks correct before we calculate your rates",
        intro: null
      }
    };
    
    return stepInfoMap[step] || { title: `Step ${step}`, subtitle: '', intro: null };
  }

  getIntentBasedIntro() {
    const intentMessages = {
      'setup': "As someone new to Switzerland, getting the right health insurance is crucial. We'll help you navigate the system and find the best coverage for your needs.",
      'change': "Great timing! The annual switching window is open until November 30th. We'll help you find better rates for 2026.",
      'cheapest': "Looking to save money? Smart move! We'll compare all insurers to find you the lowest rates while maintaining good coverage.",
      'best': "You want the best value, not just the cheapest. We'll balance price, service, and coverage to find your ideal insurer.",
      'compare': "Comparing insurers is smart - prices can vary by hundreds of francs for the same coverage. Let's find your best option.",
      'provider': "Researching specific insurers? We'll show you how they compare to others and if they're the right fit for you.",
      'home': "Whether you're new to Switzerland or looking to optimize your coverage, we'll help you find the best insurance solution."
    };
    
    return intentMessages[this.pageIntent] || intentMessages['home'];
  }

  renderThankYouStep() {
    const email = this.formData.email || 'your email';
    let seasonalBanner = '';
    if (['change', 'cheapest'].includes(this.pageIntent)) {
      seasonalBanner = '<div class="bg-yellow-50 border border-yellow-200 p-4 mb-6 rounded-lg"><div class="flex items-center"><svg class="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><span class="text-yellow-800 font-medium">Deadline: Switch by Nov 30 for 2026 savings!</span></div></div>';
    }
    
    return `
      <div class="max-w-2xl mx-auto text-center p-8">
        <div class="mb-8">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-gray-900 mb-3">Thank you!</h2>
          <h3 class="text-xl text-gray-700 mb-6">Your 3 tailored offers are on the way</h3>
        </div>
        
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
          <div class="flex items-center justify-center mb-3">
            <svg class="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            <span class="text-gray-600 font-medium">Sending to:</span>
          </div>
          <p class="text-lg font-semibold text-gray-900">${email}</p>
          <p class="text-sm text-gray-600 mt-2">Within 24 hours</p>
        </div>
        
        ${seasonalBanner}
        
        <!-- Large Swiss Gradient CTA -->
        <div class="mb-8">
          <button id="book-consultation-thankyou" class="btn-consultation-primary w-full max-w-md mx-auto text-lg py-4 px-8" onclick="window.globalOffersModal && window.globalOffersModal.trackConsultationBooked(window.globalOffersModal.currentStep, window.globalOffersModal.getCurrentIntent()); window.open('https://cal.com/robertkolar/expat-savvy', '_blank')">
            <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Book Free Consultation (15–30 min)
          </button>
          <p class="text-sm text-gray-600 mt-3">Recommended to ensure you don't miss better coverage or savings</p>
        </div>
        
        <a href="#" id="close-thankyou" class="text-gray-500 hover:text-gray-700 underline">Close</a>
      </div>
    `;
  }

  getStepBanner() {
    if (!this.isMobile) {
      // Desktop: Full height sidebar with Robert's photo and consultation CTA
      return `
        <div class="bg-red-50 border border-red-200 p-6 rounded-lg shadow-sm h-full flex flex-col">
          <div class="flex-1 flex flex-col justify-center">
            <div class="text-center mb-6">
              <img
                src="https://res.cloudinary.com/dphbnwjtx/image/upload/w_80,h_80,q_95,f_webp,c_fill,g_face,e_sharpen:100/v1757251477/Generated_Image_September_07_2025_-_9_20PM_uuse1r.webp"
                alt="Robert Kolar"
                class="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 class="text-xl font-bold text-gray-900 mb-2">Not sure about options?</h3>
              <p class="text-gray-700 mb-4">Get personalized advice from Robert</p>
            </div>
            
            <div class="bg-white p-4 rounded-lg shadow-sm mb-4">
              <h4 class="font-semibold text-red-600 mb-2">Why schedule a consultation?</h4>
              <ul class="text-sm space-y-2 text-gray-700">
                <li class="flex items-start">
                  <i data-lucide="check" class="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0"></i>
                  <span>Expert guidance in English</span>
                </li>
                <li class="flex items-start">
                  <i data-lucide="check" class="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0"></i>
                  <span>Compare all insurers objectively</span>
                </li>
                <li class="flex items-start">
                  <i data-lucide="check" class="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0"></i>
                  <span>Save time and avoid costly mistakes</span>
                </li>
              </ul>
            </div>
            
            <button id="schedule-consultation-banner" class="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors">
              Schedule Free Consultation
            </button>
            <p class="text-center text-sm text-red-600 font-bold mt-2">(Recommended)</p>
          </div>
        </div>
      `;
    } else {
      // Mobile: Compact banner with Robert's small photo
      return `
        <div class="bg-red-50 border border-red-200 p-4 rounded-lg shadow-sm mb-6">
          <div class="flex items-center mb-3">
            <img
              src="https://res.cloudinary.com/dphbnwjtx/image/upload/w_48,h_48,q_95,f_webp,c_fill,g_face,e_sharpen:100/v1757251477/Generated_Image_September_07_2025_-_9_20PM_uuse1r.webp"
              alt="Robert Kolar"
              class="w-12 h-12 rounded-full mr-3 object-cover"
            />
            <div>
              <h4 class="font-semibold text-gray-900">Not sure about options?</h4>
              <p class="text-sm text-gray-600">Get personalized advice from Robert</p>
            </div>
          </div>
          <button id="schedule-consultation-banner" class="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold text-sm transition-colors">
            Schedule Free Consultation
          </button>
          <p class="text-center text-sm text-red-600 font-bold mt-1">(Recommended)</p>
        </div>
      `;
    }
  }

  updateMobileProgress() {
    const progressBar = document.getElementById('mobile-progress-bar');
    if (progressBar && typeof this.currentStep === 'number') {
      const progress = (this.currentStep / 6) * 100;
      progressBar.style.width = `${progress}%`;
    } else if (progressBar) {
      // Hide progress bar for non-numbered steps
      progressBar.style.width = '0%';
    }
  }

  updateMobileFooter() {
    const backBtn = document.getElementById('mobile-back-btn');
    if (backBtn) {
      backBtn.classList.toggle('hidden', this.currentStep === 1 || this.currentStep === 'intro');
    }
    // Note: mobile-next-btn removed - navigation happens via content buttons
  }

  // Generate consistent social proof number
  generateSocialProof() {
    const existingCount = document.getElementById('booking-count');
    if (existingCount) {
      const match = existingCount.textContent?.match(/(\d+) people/);
      if (match) return match[1];
    }
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const random = ((seed * 9301 + 49297) % 233280) / 233280;
    return Math.floor(random * 9) + 3;
  }

  getHeadlineContent() {
    // Extract city from URL if on a city page
    const cityFromUrl = this.extractCityFromUrl();
    
    const headlines = {
      'setup': {
        headline: cityFromUrl ? `Get health insurance in ${cityFromUrl} with confidence` : 'Set Up Your Swiss Health Insurance in Minutes',
        subline: 'Personal, English-speaking advice. Free & no obligation.'
      },
      'change': {
        headline: cityFromUrl ? `Switch your ${cityFromUrl} health insurance for 1 Jan 2026` : 'Switch to Better Health Insurance for 2026',
        subline: 'Personal, English-speaking advice. Free & no obligation.'
      },
      'compare': {
        headline: cityFromUrl ? `Compare All Top Insurers in ${cityFromUrl}` : 'Find Your Best Insurance Match in Minutes',
        subline: 'Personal, English-speaking advice. Free & no obligation.'
      },
      'cheapest': {
        headline: cityFromUrl ? `Find the cheapest health insurance in ${cityFromUrl}` : 'Find the Cheapest Health Insurance for You',
        subline: 'Personal, English-speaking advice. Free & no obligation.'
      },
      'best': {
        headline: cityFromUrl ? `Find the best health insurance in ${cityFromUrl}` : 'Get the Best Health Insurance Recommendations',
        subline: 'Personal, English-speaking advice. Free & no obligation.'
      },
      'family': {
        headline: cityFromUrl ? `Get family health insurance sorted in ${cityFromUrl}` : 'Optimize Your Family\'s Health Insurance',
        subline: 'Personal, English-speaking advice. Free & no obligation.'
      },
      'provider': {
        headline: cityFromUrl ? `Compare This Provider Against All Options in ${cityFromUrl}` : 'Compare This Provider Against All Options',
        subline: 'See how this insurer stacks up. Personal, English-speaking advice. Free & no obligation.'
      },
      'home': {
        headline: cityFromUrl ? `Get health insurance in ${cityFromUrl} with confidence` : 'Find Your Best Swiss Health Insurance in Minutes',
        subline: 'Personal, English-speaking advice. Free & no obligation.'
      }
    };
    
    return headlines[this.pageIntent] || headlines['home'];
  }

  extractCityFromUrl() {
    const path = window.location.pathname;
    
    // Check if we're on a city page: /health-insurance/{city}/
    const cityMatch = path.match(/\/health-insurance\/([^\/]+)\//);
    if (cityMatch) {
      const citySlug = cityMatch[1];
      // Convert slug to proper city name
      const cityNames = {
        'zurich': 'Zurich',
        'geneva': 'Geneva',
        'basel': 'Basel',
        'bern': 'Bern',
        'lausanne': 'Lausanne',
        'lugano': 'Lugano',
        'zug': 'Zug'
      };
      return cityNames[citySlug] || citySlug.charAt(0).toUpperCase() + citySlug.slice(1);
    }
    
    return null;
  }

  getCalComLink() {
    const intent = this.pageIntent;
    switch (intent) {
      case 'setup': return "https://cal.com/robertkolar/setting-up-health-insurance-in-switzerland";
      case 'change': return "https://cal.com/robertkolar/change-health-insurance";
      default: return "https://cal.com/robertkolar/change-health-insurance";
    }
  }

  // Main event binding (called once on init)
  bindEvents() {
    console.log('Binding main events.');
    
    // Global close button handler (fallback for all pages)
    document.addEventListener('click', (e) => {
      // Check if clicked element or any parent is the close button
      const closeBtn = e.target.closest('#close-modal-btn') || 
                      (e.target.id === 'close-modal-btn') ||
                      (e.target.parentElement && e.target.parentElement.id === 'close-modal-btn') ||
                      (e.target.parentElement && e.target.parentElement.parentElement && e.target.parentElement.parentElement.id === 'close-modal-btn');
      
      if (closeBtn) {
        console.log('🔴 GLOBAL CLOSE BUTTON CLICKED!', 'Target:', e.target.tagName, 'ID:', e.target.id);
        e.preventDefault();
        e.stopPropagation();
        this.closeModal();
      }
    });
    
    // Escape key to close (this can be bound early)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !document.getElementById('offers-modal')?.classList.contains('hidden')) {
        console.log('Escape key pressed.');
        this.closeModal();
      }
    });

    // Handle initial calls from non-dynamic buttons (like homepage CTAs)
    document.querySelectorAll('[data-open-offers-modal]').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Data-open-offers-modal button clicked.', button);
        this.openModal();
      });
    });

    // This is for the sidebar button in Astro
    document.getElementById('sidebar-consultation-btn')?.addEventListener('click', () => {
        console.log('Sidebar consultation button clicked.');
        this.startConsultationFlow();
    });

    // Listen for resize to update isMobile flag
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 1024;
      // Re-render content to adapt if needed (e.g. mobile/desktop specific UI)
      if (!document.getElementById('offers-modal')?.classList.contains('hidden')) {
        console.log('Window resized, re-rendering content.');
        this.renderContent();
      }
    });

    // Attach mobile listeners after modal is visible
    this.attachMobileListeners();

    setTimeout(() => {
      const firstFocusable = document.getElementById('offers-modal')?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) firstFocusable.focus();
    }, 100);

    document.addEventListener('click', (e) => {
      const target = e.target;
      console.log('Global click detected on: ID=' + (target.id || 'none') + ', Tag=' + target.tagName + ', Classes=' + (target.className || 'none') + ', Parent=' + (target.parentElement?.tagName || 'none'));
    }, {capture: true});
  }

  // Bind close events when modal is opened (close button exists in DOM)
  bindCloseEvents() {
    console.log('=== BINDING CLOSE EVENTS ===');
    
    // Close button
    const closeBtn = document.getElementById('close-modal-btn');
    console.log('Close button found:', !!closeBtn, 'Already attached:', closeBtn?.dataset.closeAttached);
    
    if (closeBtn && !closeBtn.dataset.closeAttached) {
      // Use event delegation to catch all clicks on button and its children
      closeBtn.addEventListener('click', (e) => {
        console.log('🔴 CLOSE BUTTON AREA CLICKED!', 'Target:', e.target.tagName, 'Classes:', e.target.className);
        e.preventDefault();
        e.stopPropagation();
        this.closeModal();
      }, true); // Use capture phase to catch all clicks
      
      // Also add listener to all child elements
      const allChildren = closeBtn.querySelectorAll('*');
      allChildren.forEach(child => {
        child.addEventListener('click', (e) => {
          console.log('🔴 CLOSE BUTTON CHILD CLICKED!', 'Target:', e.target.tagName);
          e.preventDefault();
          e.stopPropagation();
          this.closeModal();
        });
      });
      
      closeBtn.dataset.closeAttached = 'true';
      console.log('✅ Close button listener attached successfully.');
    } else if (closeBtn) {
      console.log('⚠️ Close button already has listener attached.');
    } else {
      console.error('❌ Close button not found in DOM!');
    }
    
    // Backdrop click
    const modal = document.getElementById('offers-modal');
    console.log('Modal found:', !!modal, 'Already attached:', modal?.dataset.backdropAttached);
    
    if (modal && !modal.dataset.backdropAttached) {
      modal.addEventListener('click', (e) => {
        console.log('Modal clicked, target classes:', e.target.className);
        
        // Check if clicked on backdrop (modal itself or centering div)
        const isBackdrop = e.target === modal || 
                          e.target.classList.contains('fixed') ||
                          (e.target.classList.contains('flex') && e.target.classList.contains('items-center'));
        
        if (isBackdrop) {
          console.log('🔴 BACKDROP CLICKED!');
          e.preventDefault();
          e.stopPropagation();
          this.closeModal();
        }
      });
      modal.dataset.backdropAttached = 'true';
      console.log('✅ Backdrop listener attached successfully.');
    } else if (modal) {
      console.log('⚠️ Modal backdrop already has listener attached.');
    } else {
      console.error('❌ Modal not found in DOM!');
    }
  }

  // Attach event handlers for dynamically rendered step content
  attachStepEventHandlers() {
    console.log('Attaching step event handlers for step:', this.currentStep);
    
    const contentContainers = [document.getElementById('mobile-content'), document.getElementById('desktop-content')];
    contentContainers.forEach(container => {
      if (!container) return;
      
      container.addEventListener('click', (e) => {
        const target = e.target.closest('button, a');
        if (!target) return;
        
        if (this.currentStep === 'consultation_intake') {
          if (target.id === 'schedule-consultation-btn') {
            console.log('Schedule consultation button clicked');
            e.preventDefault();
            
            // Validate consultation form
            if (this.validateConsultationForm()) {
              // Save consultation data
              this.saveConsultationData();
              
              // Move to scheduling step
              this.currentStep = 'consultation_scheduling';
              this.renderContent();
              
              // Track consultation form submitted
              this.trackEvent('consultation_form_submitted', {
                intent: this.getCurrentIntent(),
                variant: 'consult-left-primary'
              });
            }
          } else if (target.id === 'back-to-intro-btn') {
            console.log('Back to intro clicked');
            e.preventDefault();
            this.currentStep = 'intro';
            this.isConsultationFlow = false;
            this.renderContent();
          }
        } else if (this.currentStep === 'consultation_scheduling') {
          if (target.id === 'back-to-intake-btn') {
            console.log('Back to intake clicked');
            e.preventDefault();
            this.currentStep = 'consultation_intake';
            this.renderContent();
          }
        } else if (this.currentStep === 'intro') {
          if (target.id === 'toggle-consultation-mobile') {
            const details = document.getElementById('mobile-consultation-details');
            const chevron = document.getElementById('consultation-chevron');
            if (details && chevron) {
              details.classList.toggle('hidden');
              chevron.style.transform = details.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
            }
            e.preventDefault();
          } else if (target.classList.contains('motivation-card')) {
            this.formData.motivation = target.dataset.motivation;
            console.log('Motivation selected:', this.formData.motivation);
            
            // Update consultation panel with personalized CTA if on desktop
            if (!this.isMobile && this.currentStep === 'intro') {
              this.renderConsultationPanel(this.formData.motivation);
              
              // Add pulse animation to consultation CTA
              const consultationBtn = document.querySelector('.btn-consultation-primary');
              if (consultationBtn) {
                consultationBtn.classList.add('btn-consultation-pulse');
                setTimeout(() => {
                  consultationBtn.classList.remove('btn-consultation-pulse');
                }, 1000);
              }
            }
            
            this.currentStep = 1;
            this.renderContent();
            e.preventDefault();
          } else if (target.id === 'start-offers-btn') {
            // Track get offers CTA click
            this.trackEvent('cta_get_offers_click', {
              intent: this.pageIntent,
              source: 'get_offers_button'
            });
            
            // Optional: If no motivation selected, default to something
            this.formData.motivation = this.formData.motivation || 'general';
            console.log('Get 3 Best Offers clicked with motivation:', this.formData.motivation);
            
            // Track quote flow started
            console.log('🎯 Tracking quote_flow_started event');
            if (typeof window.getAttributionData === 'function') {
              const attribution = window.getAttributionData();
              console.log('🎯 Attribution data:', attribution);
              if (typeof window.attributionTracker !== 'undefined' && window.attributionTracker.sendToPlausible) {
                console.log('🎯 Sending quote_flow_started to Plausible');
                window.attributionTracker.sendToPlausible('quote_flow_started', {
                  channel: attribution.channel,
                  city: attribution.city,
                  page_type: attribution.page_type,
                  campaign: attribution.utm_campaign,
                  source: attribution.utm_source,
                  flow: 'quote'
                });
              } else {
                console.error('❌ attributionTracker not available');
              }
            } else {
              console.error('❌ getAttributionData function not available');
            }
            
            this.currentStep = 1;
            this.renderContent();
            e.preventDefault();
          }
        } else if (typeof this.currentStep === 'number' && this.currentStep >= 1 && this.currentStep <= 6) {
          if (target.id === 'schedule-consultation-banner' || target.closest('#schedule-consultation-banner')) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Schedule consultation clicked from step', this.currentStep);
            this.startConsultationFlow();
          } else if (target.id === 'step-back' || target.closest('#step-back')) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Back button clicked via delegation');
            this.previousStep();
          } else if (target.id === 'add-person') {
            // Handled separately with proper data saving
            e.preventDefault();
          } else if (target.classList.contains('remove-person')) {
            e.preventDefault();
            e.stopPropagation();
            const personIndex = parseInt(target.dataset.person) - 1;
            if (this.formData.people.length > 1) { // Keep at least one person
              this.saveCurrentData(); // Save current form state
              this.formData.people.splice(personIndex, 1);
              this.renderContent();
            } else {
              console.log('Cannot remove last person');
            }
          } else if (target.id === 'submit-offers') {
            if (this.validateStep(6)) {
              this.submitOffersForm();
            }
            e.preventDefault();
          } else if (target.id === 'prefer-talk') {
            this.startConsultationFlow();
            e.preventDefault();
          }
        } else if (this.currentStep === 'consultation_intake') {
          if (target.id === 'consultation-back-btn') {
            console.log('Delegated: Back to Intro clicked');
            this.currentStep = 'intro';
            this.renderContent();
            e.preventDefault();
          } else if (target.id === 'consultation-continue-btn') {
            console.log('Delegated: Continue to Calendar clicked');
            console.log('Current step:', this.currentStep);
            console.log('Target element:', target);
            // Manually trigger submit logic since delegation is on click
            this.submitConsultationForm();
            e.preventDefault();
          }
        } else if (this.currentStep === 'thankyou') {
          if (target.id === 'book-consultation-thankyou') {
            this.startConsultationFlow();
            e.preventDefault();
          } else if (target.id === 'close-thankyou') {
            this.closeModal();
            e.preventDefault();
          }
        }
      });
      
      // For form submit (not click-based)
      if (this.currentStep === 'consultation_intake') {
        const form = container.querySelector('#consultation-form');
        if (form) {
          console.log('Form #consultation-form found, attaching submit listener.');
          form.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Consultation form submitted.');
            this.submitConsultationForm();
          });
        } else {
          console.error('Form #consultation-form not found in container!');
        }
      }

      // Submit handlers for forms
      const form = container.querySelector('form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          if (this.currentStep === 'consultation_intake') {
            this.submitConsultationForm();
          } else if (typeof this.currentStep === 'number') {
            if (this.validateStep(this.currentStep)) {
              if (this.currentStep < 6) {
                this.nextStep();
              } else {
                this.submitOffersForm();
              }
            }
          }
        });
      }
    });

    // Handle add person with data preservation
    if (this.currentStep === 2) {
      document.querySelectorAll('#add-person').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          // Save current people data from DOM
          const contentDiv = document.getElementById('desktop-content') || document.getElementById('mobile-content');
          const currentPeople = [];
          // Find all person divs and save their data
          contentDiv.querySelectorAll('[data-person]').forEach((personDiv, index) => {
            const personNum = index + 1;
            const dobInput = personDiv.querySelector(`input[name="dob-${personNum}"]`);
            const employmentSelect = personDiv.querySelector(`select[name="employment-${personNum}"]`);
            if (dobInput && employmentSelect) {
              currentPeople.push({
                dob: dobInput.value || '',
                employment: employmentSelect.value || ''
              });
            }
          });
          // Update formData with current values
          this.formData.people = currentPeople;
          // Add new empty person
          this.formData.people.push({ dob: '', employment: '' });
          this.renderContent();
        });
      });
    }

    // Remove person is handled via event delegation above
  }

  nextStep() {
    console.log('NextStep called. Current step:', this.currentStep, 'Type:', typeof this.currentStep);
    
    if (typeof this.currentStep === 'number' && this.currentStep < 6) {
      this.saveCurrentData(); // Save current form data before moving
      this.currentStep = this.currentStep + 1; // Ensure numeric addition
      this.listenersAttachedForStep = false; // Reset for new step
      console.log('Moving to step:', this.currentStep);
      this.renderContent();
    } else {
      console.log('Cannot advance - either not a number or already at step 6');
    }
  }

  previousStep() {
    console.log('Previous step called from step:', this.currentStep, 'type:', typeof this.currentStep);
    this.saveCurrentData(); // Save BEFORE changing step
    
    if (this.currentStep === 2) {
      this.currentStep = 1;
      this.listenersAttachedForStep = false;
      console.log('Going back to step 1');
      this.renderContent();
    } else if (this.currentStep === 3) {
      this.currentStep = 2;
      this.listenersAttachedForStep = false;
      console.log('Going back to step 2');
      this.renderContent();
    } else if (this.currentStep === 4) {
      this.currentStep = 3;
      this.listenersAttachedForStep = false;
      console.log('Going back to step 3');
      this.renderContent();
    } else if (this.currentStep === 5) {
      this.currentStep = 4;
      this.listenersAttachedForStep = false;
      console.log('Going back to step 4');
      this.renderContent();
    } else if (this.currentStep === 6) {
      this.currentStep = 5;
      this.listenersAttachedForStep = false;
      console.log('Going back to step 5');
      this.renderContent();
    } else if (this.currentStep === 1) {
      this.currentStep = 'intro';
      console.log('Going back to intro');
      this.renderContent();
    } else if (this.currentStep === 'consultation_intake') {
      this.currentStep = 'intro';
      console.log('Going back to intro from consultation');
      this.renderContent();
    }
  }

  validateStep(step) {
    // SIMPLIFIED: No validation, just return true
    console.log('Simplified validateStep - always returns true');
    
    // Don't save data here - it will be saved in nextStep()
    return true;
  }

  async submitToBackendAPI() {
    console.log('📤 Submitting to backend API...');
    
    // Get attribution data
    const attribution = typeof window.getAttributionData === 'function' ? window.getAttributionData() : {};
    
    // Prepare lead data for backend API
    const leadData = {
      name: this.formData.name || '',
      email: this.formData.email || '',
      phone: this.formData.phone || '',
      consent_marketing: this.formData.consent || true, // Assuming consent for form submissions
      
      // Attribution data
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      utm_campaign: attribution.utm_campaign,
      utm_term: attribution.utm_term,
      utm_content: attribution.utm_content,
      referrer: attribution.referrer,
      landing_path: attribution.landing_path,
      channel: attribution.channel,
      city: attribution.city,
      page_type: attribution.page_type,
      
      // Lead metadata
      stage: 'new',
      flow: 'quote',
      notes: {
        form_type: 'get_3_best_offers',
        postcode: this.formData.postcode,
        household: this.formData.household,
        motivation: this.formData.motivation,
        deductible: this.formData.deductible,
        model: this.formData.model,
        people_count: this.formData.people?.length || 0,
        priorities: this.formData.priorities,
        other_needs: this.formData.other_needs,
        page_intent: this.pageIntent,
        page_slug: window.location.pathname
      }
    };

    try {
      const response = await fetch('https://expat-savvy-api.fly.dev/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Backend API submission successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Backend API submission error:', error);
      throw error;
    }
  }

  submitOffersForm() {
    console.log('Submitting offers form...');
    
    // Prevent duplicate submissions
    if (this.isSubmitting) {
      console.log('Form already submitting, ignoring duplicate call');
      return;
    }
    this.isSubmitting = true;
    
    // Track quote submitted
    console.log('🎯 Tracking quote_submitted event');
    if (typeof window.getAttributionData === 'function') {
      const attribution = window.getAttributionData();
      if (typeof window.attributionTracker !== 'undefined' && window.attributionTracker.sendToPlausible) {
        console.log('🎯 Sending quote_submitted to Plausible');
        window.attributionTracker.sendToPlausible('quote_submitted', {
          channel: attribution.channel,
          city: attribution.city,
          page_type: attribution.page_type,
          campaign: attribution.utm_campaign,
          source: attribution.utm_source,
          flow: 'quote'
        });
      } else {
        console.error('❌ attributionTracker not available for quote_submitted');
      }
    } else {
      console.error('❌ getAttributionData not available for quote_submitted');
    }
    
    // Safety timeout to reset submission flag (in case of network issues)
    setTimeout(() => {
      this.isSubmitting = false;
      console.log('Submission flag reset by timeout');
    }, 10000);
    
    // Track form submission event
    this.trackEvent('offers_form_submit_success', {
      intent: this.pageIntent,
      step: this.currentStep
    });
    
    // Save current step data first
    this.saveCurrentData();
    
    // First, submit to backend API
    this.submitToBackendAPI()
      .then(() => console.log('✅ Backend API submission successful'))
      .catch(error => console.error('⚠️ Backend API submission failed (continuing anyway):', error));
    
    // Prepare form data for Formspree
    const formData = new FormData();
    
    // Basic info
    formData.append('form_type', 'get_3_best_offers');
    formData.append('name', this.formData.name || '');
    formData.append('email', this.formData.email || '');
    formData.append('phone', this.formData.phone || '');
    formData.append('postcode', this.formData.postcode || '');
    formData.append('household', this.formData.household || '');
    formData.append('motivation', this.formData.motivation || '');
    
    // Insurance preferences
    formData.append('deductible', this.formData.deductible || '');
    formData.append('model', this.formData.model || '');
    
    // People data
    formData.append('people_count', this.formData.people?.length || 0);
    if (this.formData.people) {
      this.formData.people.forEach((person, index) => {
        formData.append(`person_${index + 1}_dob`, person.dob || '');
        formData.append(`person_${index + 1}_employment`, person.employment || '');
      });
    }
    
    // Supplementary priorities (Step 4 sliders)
    if (this.formData.priorities) {
      Object.keys(this.formData.priorities).forEach(key => {
        formData.append(`priority_${key}`, this.formData.priorities[key]);
      });
    }
    formData.append('other_needs', this.formData.other_needs || '');
    
    // Consent
    formData.append('consent', this.formData.consent || false);
    
    // Hidden fields for tracking
    formData.append('page_intent', this.pageIntent || 'home');
    formData.append('page_slug', window.location.pathname);
    formData.append('timestamp', new Date().toISOString());
    
    // Submit to Formspree
    console.log('Submitting to Formspree with data:', Array.from(formData.entries()));
    
    fetch('https://formspree.io/f/mrbewjlr', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => {
      console.log('Formspree response status:', response.status);
      if (response.ok) {
        console.log('Form submitted successfully');
        this.currentStep = 'thankyou';
        this.renderContent();
        // Fire analytics event
        console.log('Offers submitted - tracking event');
        
        // Call the Plausible tracking function
        if (typeof window.trackLeadCreation === 'function') {
          console.log('🎯 Calling trackLeadCreation function');
          window.trackLeadCreation({
            flow: 'quote',
            leadId: 'offers-modal-' + Date.now()
          });
        } else {
          console.error('❌ window.trackLeadCreation function not available');
        }
        
        this.isSubmitting = false; // Reset submission flag
      } else {
        return response.text().then(text => {
          console.error('Formspree error response:', text);
          throw new Error(`Form submission failed: ${response.status}`);
        });
      }
    })
    .catch(error => {
      console.error('Submission error:', error);
      alert('There was an error submitting your request. Please try again or contact us directly.');
      this.isSubmitting = false; // Reset submission flag on error
    });
  }

  // Open the modal
  openModal() {
    console.log('🚀🚀🚀 Opening NEW OffersModal with Swiss Gradient Design 🚀🚀🚀');
    console.log('=== MODAL OPEN DEBUG ===');
    console.log('Current window dimensions:', window.innerWidth, 'x', window.innerHeight);
    console.log('User agent:', navigator.userAgent);
    console.log('OffersModal ID should be: offers-modal');
    
    // Track modal open event
    this.trackEvent('modal_opened', {
      intent: this.pageIntent,
      source: 'cta_button'
    });
    
    // Update mobile detection when opening modal
    this.isMobile = window.innerWidth < 1024;
    console.log('Modal opening - Updated mobile detection:', this.isMobile, 'Window width:', window.innerWidth);
    console.log('Will use mobile layout:', this.isMobile);
    
    const modal = document.getElementById('offers-modal');
    if (!modal) { console.error('❌ Modal element not found'); return; }

    this.currentStep = 'intro';
    this.formData = { people: [{}], name: '' };
    
    // Save current scroll position before opening modal
    this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    console.log('Saved scroll position:', this.scrollPosition);
    
    modal.classList.remove('hidden');
    modal.style.display = 'block !important'; // Override for visibility
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    document.body.classList.add('modal-open');
    
    // Set the body's top position to maintain visual scroll position
    document.body.style.top = `-${this.scrollPosition}px`;
    
    console.log('Modal opening initiated');
    console.log('Modal visibility confirmed');
    
    this.renderContent();

    // Bind close events now that modal is rendered
    this.bindCloseEvents();

    // Attach mobile listeners after modal is visible
    this.attachMobileListeners();

    setTimeout(() => {
      const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) firstFocusable.focus();
    }, 100);
  }

  // Close the modal
  closeModal() {
    console.log('🔴 === CLOSING MODAL ===');
    const modal = document.getElementById('offers-modal');
    console.log('Modal element found:', !!modal);
    
    if (modal) {
      console.log('Adding hidden class to modal...');
      modal.classList.add('hidden');
      
      // Remove modal-open class and restore scroll position
      console.log('Removing modal-open class from body...');
      document.body.classList.remove('modal-open');
      document.body.style.top = ''; // Clear the top style
      
      // Restore the scroll position
      if (this.scrollPosition !== undefined) {
        console.log('Restoring scroll position:', this.scrollPosition);
        window.scrollTo(0, this.scrollPosition);
      }
      
      console.log('✅ Modal closed successfully');
    } else {
      console.error('❌ Modal element not found when trying to close!');
    }
    // Optionally reset form state here
  }

  // Start consultation flow (redirect to mini-intake)
  startConsultationFlow() {
    console.log('=== START CONSULTATION FLOW CALLED ===');
    console.log('Current step before:', this.currentStep);
    console.log('Is mobile:', this.isMobile);
    console.log('Starting consultation flow: rendering mini-intake');
    
    // Track consultation CTA click
    this.trackEvent('cta_consultation_click', {
      intent: this.pageIntent,
      source: 'consultation_button'
    });
    
    this.currentStep = 'consultation_intake';
    console.log('Current step after:', this.currentStep);
    this.renderContent();
    console.log('=== END START CONSULTATION FLOW ===');
  }

  // Submit consultation mini-intake form and open Cal.com
  submitConsultationForm() {
    console.log('Opening Cal.com for consultation');
    
    // Prevent duplicate submissions
    if (this.isSubmitting) {
      console.log('Already submitting, ignoring duplicate consultation call');
      return;
    }
    this.isSubmitting = true;
    
    // Get form values for Formspree and Cal.com prefill
    const name = document.getElementById('consultation-name')?.value || '';
    const email = document.getElementById('consultation-email')?.value || '';
    const phone = document.getElementById('consultation-phone')?.value || '';
    const reason = document.getElementById('consultation-reason')?.value || '';
    
    // Send to Formspree first
    if (name && email) {
      const formData = new FormData();
      formData.append('form_type', 'consultation_request');
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('reason', reason);
      formData.append('source', window.location.pathname);
      
      fetch('https://formspree.io/f/mrbewjlr', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      }).then(response => {
        console.log('Consultation lead sent to Formspree:', response.ok);
        this.isSubmitting = false; // Reset submission flag
      }).catch(error => {
        console.error('Error sending to Formspree:', error);
        this.isSubmitting = false; // Reset submission flag on error
      });
    }
    
    // Open Cal.com with prefilled data
    const calUrl = new URL('https://cal.com/robertkolar/expat-savvy');
    if (name) calUrl.searchParams.append('name', name);
    if (email) calUrl.searchParams.append('email', email);
    if (phone || reason) {
      const notes = `${phone ? `Phone: ${phone}` : ''}${phone && reason ? '\n' : ''}${reason ? `Topic: ${reason}` : ''}`;
      calUrl.searchParams.append('notes', notes);
    }
    
    // Open in new tab
    window.open(calUrl.toString(), '_blank');
    
    // Close modal after a short delay
    setTimeout(() => {
      this.closeModal();
    }, 500);
  }

  // Helper for analytics (simple console log for now)
  setupGlobalModalAccess() {
    window.globalOffersModal = this; // Make instance globally accessible
    window.openOffersModal = (intent = null) => {
      console.log('window.openOffersModal called with intent:', intent);
      if (intent) {
        this.pageIntent = intent; // Override detected intent
        console.log('Modal intent set to:', this.pageIntent);
      }
      this.openModal();
    }; // Global function for external triggers
    window.showConsultationModal = () => {
      console.log('window.showConsultationModal (legacy) called.');
      this.openModal();
    }; // Legacy compatibility
  }

  initializeLucideIcons() {
    console.log('Attempting to initialize Lucide icons.');
    // Only initialize if lucide is available and modal is visible
    const modal = document.getElementById('offers-modal');
    if (typeof lucide !== 'undefined' && lucide.createIcons && modal && !modal.classList.contains('hidden')) {
      try {
        lucide.createIcons();
        console.log('Lucide icons initialized.');
      } catch (error) {
        console.error('Error initializing Lucide icons:', error);
      }
    } else {
      console.log('Lucide not available or modal not visible, skipping initialization.');
    }
  }

  // New method for mobile attachment with retry
  attachMobileListeners() {
    const attachWithRetry = (id, handler, logMsg) => {
      let btn = document.getElementById(id);
      if (btn) {
        console.log(`Attaching ${logMsg} listener to: ${id}`);
        btn.addEventListener('click', handler, {capture: true});
        btn.addEventListener('touchend', handler, {capture: true}); // For mobile touch
      } else {
        console.warn(`${logMsg} button not found (${id}) - retrying in 100ms`);
        setTimeout(() => attachWithRetry(id, handler, logMsg), 100);
      }
    };


    const backHandler = (e) => {
      console.log('Mobile back button clicked');
      e.preventDefault();
      this.previousStep();
    };

    // Only attach back button - next button was removed from mobile
    attachWithRetry('mobile-back-btn', backHandler, 'mobile back');
  }

  // New method to setup observer
  setupDesktopObserver(contentDiv) {
    const observer = new MutationObserver((mutations) => {
      console.log('Observer detected button addition');
      this.attachDesktopButtons();
      if (this.listenersAttachedForStep) {
        observer.disconnect();
        console.log('Observer disconnected after attachment');
      }
    });

    observer.observe(contentDiv, { childList: true, subtree: true });
    return observer;
  }

  // Separate attachment logic
  attachDesktopButtons() {
    const checkInterval = 100;
    const maxTime = 1000;
    let timeElapsed = 0;

    const nextHandler = (e) => {
      console.log('Desktop next button clicked');
      e.preventDefault();
      if (this.validateStep(this.currentStep)) {
        if (this.currentStep < 6) {
          console.log('Step advanced to', this.currentStep + 1);
          this.nextStep();
        } else {
          this.submitOffersForm();
        }
      }
    };

    const backHandler = (e) => {
      console.log('Desktop back button clicked');
      e.preventDefault();
      this.previousStep();
    };

    const attachIfExists = (id, handler, logMsg) => {
      let btn = document.getElementById(id);
      if (btn && btn.dataset.attached !== 'true') {
        console.log(`Attaching ${logMsg} listener to: ${id}`);
        btn.addEventListener('click', handler, {capture: true});
        btn.addEventListener('touchend', handler, {capture: true});
        btn.dataset.attached = 'true';
        console.log(`${logMsg} listener attached successfully`);
        return true;
      }
      return false;
    };

    // Immediate check
    const nextAttached = attachIfExists('step-next', nextHandler, 'desktop next');
    const backAttached = attachIfExists('step-back', backHandler, 'desktop back');
    if (nextAttached && backAttached) {
      this.listenersAttachedForStep = true;
      return;
    }

    // Interval check if not found
    console.log('Starting interval check for desktop buttons');
    const interval = setInterval(() => {
      timeElapsed += checkInterval;
      const nextNowAttached = attachIfExists('step-next', nextHandler, 'desktop next');
      const backNowAttached = attachIfExists('step-back', backHandler, 'desktop back');
      if (nextNowAttached && backNowAttached) {
        clearInterval(interval);
        this.listenersAttachedForStep = true;
        console.log('Desktop listeners attached via interval check');
      } else if (timeElapsed >= maxTime) {
        clearInterval(interval);
        console.error('Timeout - desktop buttons not found after 1s');
      }
    }, checkInterval);
  }

  saveCurrentData() {
    console.log('=== SAVING DATA FOR STEP ===', this.currentStep);
    
    // Try both mobile and desktop content divs
    const mobileDiv = document.getElementById('mobile-content');
    const desktopDiv = document.getElementById('desktop-content');
    const contentDiv = this.isMobile ? mobileDiv : desktopDiv;
    
    console.log('Using content div:', this.isMobile ? 'mobile' : 'desktop', 'Found:', !!contentDiv);
    
    if (!contentDiv) {
      console.log('No content div found - cannot save data');
      return;
    }
    
    if (this.currentStep === 1) {
      // Save Step 1 data
      const nameInput = contentDiv.querySelector('input[name="name"]');
      const postcodeInput = contentDiv.querySelector('input[name="postcode"]');
      const householdSelect = contentDiv.querySelector('select[name="household"]');
      
      this.formData.name = nameInput?.value || '';
      this.formData.postcode = postcodeInput?.value || '';
      this.formData.household = householdSelect?.value || '';
      
      console.log('Step 1 data saved:', {
        name: this.formData.name,
        postcode: this.formData.postcode,
        household: this.formData.household
      });
      
    } else if (this.currentStep === 2) {
      // Save Step 2 data
      this.formData.people = [];
      const personDivs = contentDiv.querySelectorAll('[data-person]');
      console.log('Found person divs:', personDivs.length);
      
      personDivs.forEach((div, index) => {
        const dobInput = div.querySelector(`input[name="dob-${index+1}"]`);
        const employmentSelect = div.querySelector(`select[name="employment-${index+1}"]`);
        
        if (dobInput && employmentSelect) {
          const personData = {
            dob: dobInput.value || '', 
            employment: employmentSelect.value || ''
          };
          this.formData.people.push(personData);
          console.log(`Person ${index+1} data:`, personData);
        }
      });
      
    } else if (this.currentStep === 3) {
      // Save Step 3 data
      const deductibleSelect = contentDiv.querySelector('select[name="deductible"]');
      const modelSelect = contentDiv.querySelector('select[name="model"]');
      
      this.formData.deductible = deductibleSelect?.value || '';
      this.formData.model = modelSelect?.value || '';
      
      console.log('Step 3 data saved:', {
        deductible: this.formData.deductible,
        model: this.formData.model
      });
      
    } else if (this.currentStep === 4) {
      // Save Step 4 data
      this.formData.priorities = {};
      const sliders = contentDiv.querySelectorAll('input[type="range"]');
      sliders.forEach(input => {
        const priorityName = input.name.replace('priority-', '');
        this.formData.priorities[priorityName] = input.value;
      });
      
      const otherNeedsTextarea = contentDiv.querySelector('textarea[name="other-needs"]');
      this.formData.other_needs = otherNeedsTextarea?.value || '';
      
      console.log('Step 4 data saved:', {
        priorities: this.formData.priorities,
        other_needs: this.formData.other_needs
      });
      
    } else if (this.currentStep === 5) {
      // Save Step 5 data
      const emailInput = contentDiv.querySelector('input[name="email"]');
      const phoneInput = contentDiv.querySelector('input[name="phone"]');
      const consentCheckbox = contentDiv.querySelector('input[name="consent"]');
      
      this.formData.email = emailInput?.value || '';
      this.formData.phone = phoneInput?.value || '';
      this.formData.consent = consentCheckbox?.checked || false;
      
      console.log('Step 5 data saved:', {
        email: this.formData.email,
        phone: this.formData.phone,
        consent: this.formData.consent
      });
    }
    
    console.log('Complete formData after save:', this.formData);
  }

  // Track events with city-aware data
  trackEvent(eventName, data = {}) {
    if (typeof umami !== 'undefined') {
      const cityFromUrl = this.extractCityFromUrl();
      umami.track(eventName, {
        page: window.location.pathname,
        intent: this.pageIntent,
        city: cityFromUrl || 'general',
        ...data
      });
    } else {
      console.log('Umami not available, would track:', eventName, data);
    }
  }

}

// Instantiate the modal when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 offers-modal.js loaded - DOM ready, creating OffersModal instance.');
  try {
    const modalInstance = new OffersModal();
    
    // Verify initialization
    if (window.globalOffersModal === modalInstance) {
      console.log('✅ OffersModal successfully initialized and globally accessible');
    } else {
      console.error('❌ OffersModal initialization failed');
    }
  } catch (error) {
    console.error('❌ Error creating OffersModal instance:', error);
  }
});

// Add immediate script load confirmation
console.log('🎯 offers-modal.js script loaded successfully');
