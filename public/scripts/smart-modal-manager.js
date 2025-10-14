/**
 * SmartModalManager - Manages state and transitions for the Smart Modal system
 * Follows the specification closely for psychological flow and conversion optimization
 */

class SmartModalManager {
  constructor() {
    this.currentStep = 'qualification';
    this.userData = {};
    this.bookingData = {};
    this.pageContext = this.detectPageContext();
    this.isOpen = false;
    
    // Step definitions
    this.steps = {
      'qualification': '/src/components/smart-modal/QualificationStep.astro',
      'value-high': '/src/components/smart-modal/ValueStepHigh.astro',
      'value-medium': '/src/components/smart-modal/ValueStepMedium.astro', 
      'value-low': '/src/components/smart-modal/ValueStepLow.astro',
      'booking-info': '/src/components/smart-modal/BookingInfoStep.astro',
      'booking-calendar': '/src/components/smart-modal/BookingCalendarStep.astro',
      'confirmation': '/src/components/smart-modal/ConfirmationStep.astro'
    };
    
    this.init();
  }
  
  init() {
    console.log('🚀 SmartModalManager: Initializing');
    this.bindEvents();
    this.setupGlobalAccess();
    
    // Load saved data from sessionStorage if available
    this.loadSessionData();
    
    console.log('✅ SmartModalManager: Initialized');
  }
  
  detectPageContext() {
    const modal = document.getElementById('smart-modal');
    if (!modal) return { intent: 'home', city: '', slug: '' };
    
    return {
      intent: modal.getAttribute('data-page-intent') || 'home',
      city: modal.getAttribute('data-city') || '',
      slug: modal.getAttribute('data-page-slug') || ''
    };
  }
  
  bindEvents() {
    // Close button
    const closeBtn = document.getElementById('smart-modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }
    
    // Backdrop click
    const modal = document.getElementById('smart-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.close();
        }
      });
    }
    
    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
    
    // Window resize - adjust mobile behavior
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }
  
  setupGlobalAccess() {
    window.SmartModalManager = this;
    
    // Legacy compatibility
    window.openOffersModal = () => this.open();
    window.openConsultationModal = () => this.open();
    window.showConsultationModal = () => this.open();
  }
  
  loadSessionData() {
    try {
      const savedData = sessionStorage.getItem('smartModalData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        this.userData = parsed.userData || {};
        this.bookingData = parsed.bookingData || {};
        console.log('📊 SmartModalManager: Loaded session data', parsed);
      }
    } catch (error) {
      console.warn('⚠️ SmartModalManager: Could not load session data', error);
    }
  }
  
  saveSessionData() {
    try {
      const dataToSave = {
        userData: this.userData,
        bookingData: this.bookingData,
        timestamp: Date.now()
      };
      sessionStorage.setItem('smartModalData', JSON.stringify(dataToSave));
    } catch (error) {
      console.warn('⚠️ SmartModalManager: Could not save session data', error);
    }
  }
  
  open() {
    console.log('🎯 SmartModalManager: Opening modal');
    
    const modal = document.getElementById('smart-modal');
    if (!modal) {
      console.error('❌ SmartModalManager: Modal element not found');
      return;
    }
    
    // Show modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
    
    this.isOpen = true;
    
    // Start with qualification step
    this.goToStep('qualification');
    
    // Track modal open
    this.trackEvent('smart_modal_opened', {
      pageIntent: this.pageContext.intent,
      city: this.pageContext.city,
      timestamp: Date.now()
    });
    
    console.log('✅ SmartModalManager: Modal opened');
  }
  
  close() {
    console.log('🔒 SmartModalManager: Closing modal');
    
    const modal = document.getElementById('smart-modal');
    if (!modal) return;
    
    // Add closing animation class
    modal.classList.add('closing');
    
    // Hide modal after animation
    setTimeout(() => {
      modal.classList.add('hidden');
      modal.classList.remove('closing');
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
      
      this.isOpen = false;
      
      // Track modal close
      const timeSpent = this.getSessionDuration();
      this.trackEvent('smart_modal_closed', {
        step: this.currentStep,
        timeSpent: timeSpent,
        converted: this.currentStep === 'confirmation'
      });
      
    }, 150);
    
    console.log('✅ SmartModalManager: Modal closed');
  }
  
  async goToStep(stepName) {
    console.log(`📍 SmartModalManager: Going to step ${stepName}`);
    
    if (!this.steps[stepName]) {
      console.error(`❌ SmartModalManager: Unknown step ${stepName}`);
      return;
    }
    
    const previousStep = this.currentStep;
    this.currentStep = stepName;
    
    // Load step content
    try {
      await this.loadStepContent(stepName);
      
      // Track step change
      this.trackEvent('modal_step_change', {
        from: previousStep,
        to: stepName
      });
      
    } catch (error) {
      console.error(`❌ SmartModalManager: Failed to load step ${stepName}`, error);
      // Fallback to previous step
      this.currentStep = previousStep;
    }
  }
  
  async loadStepContent(stepName) {
    const container = document.getElementById('smart-modal-content');
    if (!container) {
      throw new Error('Modal content container not found');
    }
    
    // Show loading state
    container.innerHTML = `
      <div class="step-loading">
        <div class="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    `;
    
    try {
      // In a real implementation, we'd fetch the actual component content
      // For now, we'll render the step content directly
      const stepContent = await this.renderStepContent(stepName);
      container.innerHTML = stepContent;
      
      // Add step transition class
      container.classList.add('smart-modal-step');
      
      // Bind step-specific events
      this.bindStepEvents(stepName);
      
      console.log(`✅ SmartModalManager: Loaded step ${stepName}`);
      
    } catch (error) {
      console.error(`❌ SmartModalManager: Error loading step ${stepName}`, error);
      container.innerHTML = `
        <div class="step-error">
          <h3>Something went wrong</h3>
          <p>Please try refreshing the page.</p>
          <button onclick="location.reload()" class="btn-primary">Refresh</button>
        </div>
      `;
    }
  }
  
  bindStepEvents(stepName) {
    console.log(`🔗 SmartModalManager: Binding events for step ${stepName}`);
    
    // Remove existing onclick attributes and add proper event listeners
    const modalContent = document.getElementById('smart-modal-content');
    if (!modalContent) return;
    
    // Bind all buttons with onclick attributes
    const buttonsWithOnclick = modalContent.querySelectorAll('button[onclick], div[onclick]');
    buttonsWithOnclick.forEach(button => {
      const onclickAttr = button.getAttribute('onclick');
      if (onclickAttr && onclickAttr.includes('SmartModalManager')) {
        // Remove the onclick attribute
        button.removeAttribute('onclick');
        
        // Add proper event listener
        if (onclickAttr.includes("goToStep('qualification')")) {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            this.goToStep('qualification');
          });
        } else if (onclickAttr.includes("goToStep('booking-info')")) {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            this.goToStep('booking-info');
          });
        } else if (onclickAttr.includes("goToStep('booking-calendar')")) {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            this.goToStep('booking-calendar');
          });
        } else if (onclickAttr.includes('simulateBookingSuccess')) {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            this.simulateBookingSuccess();
          });
        } else if (onclickAttr.includes('addToCalendar')) {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            this.addToCalendar();
          });
        } else if (onclickAttr.includes('goBack')) {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            this.goBack();
          });
        }
      }
    });
    
    // Bind form submissions
    const forms = modalContent.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (form.id === 'booking-info-form') {
          this.handleBookingInfoSubmit();
        }
      });
    });
    
    console.log(`✅ SmartModalManager: Events bound for step ${stepName}`);
  }
  
  async renderStepContent(stepName) {
    // This is a simplified version - in production, we'd properly render Astro components
    // For now, we'll create the content programmatically
    
    switch (stepName) {
      case 'qualification':
        return this.renderQualificationStep();
      case 'value-high':
        return this.renderValueStepHigh();
      case 'value-medium':
        return this.renderValueStepMedium();
      case 'value-low':
        return this.renderValueStepLow();
      case 'booking-info':
        return this.renderBookingInfoStep();
      case 'booking-calendar':
        return this.renderBookingCalendarStep();
      case 'confirmation':
        return this.renderConfirmationStep();
      default:
        throw new Error(`Unknown step: ${stepName}`);
    }
  }
  
  renderQualificationStep() {
    const headline = this.getDynamicHeadline();
    
    return `
      <div class="smart-modal-step qualification-step">
        <div class="text-center mb-lg">
          <h1 id="smart-modal-title" class="mb-md">${headline}</h1>
          <p style="color: var(--medium-gray)">Expert guidance from FINMA-registered advisors in English</p>
        </div>
        
        <div class="social-proof-bar">
          <div class="social-proof-item">
            <svg class="social-proof-icon" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
            </svg>
            <span>12 people booked today</span>
          </div>
          <div class="social-proof-item">
            <svg class="social-proof-icon" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
            </svg>
            <span>Avg savings: CHF 1,847</span>
          </div>
          <div class="social-proof-item">
            <span>⭐⭐⭐⭐⭐ 4.9/5 (500+)</span>
          </div>
        </div>
        
        <div class="mb-lg">
          <h2 class="mb-lg">What brings you here today?</h2>
          
          <div class="options-grid">
            <div class="card option-card" data-situation="new-to-switzerland" data-score="9" tabindex="0" role="button">
              <div class="emoji">🇨🇭</div>
              <div class="content">
                <span class="text">I just moved to Switzerland</span>
                <span class="arrow">→</span>
              </div>
            </div>
            
            <div class="card option-card" data-situation="switch-save" data-score="8" tabindex="0" role="button">
              <div class="emoji">💰</div>
              <div class="content">
                <span class="text">I want to switch & save money</span>
                <span class="arrow">→</span>
              </div>
            </div>
            
            <div class="card option-card" data-situation="family" data-score="8" tabindex="0" role="button">
              <div class="emoji">👨‍👩‍👧</div>
              <div class="content">
                <span class="text">I need advice for my family</span>
                <span class="arrow">→</span>
              </div>
            </div>
            
            <div class="card option-card" data-situation="review-coverage" data-score="5" tabindex="0" role="button">
              <div class="emoji">🔍</div>
              <div class="content">
                <span class="text">I want to review my coverage</span>
                <span class="arrow">→</span>
              </div>
            </div>
            
            <div class="card option-card" data-situation="cross-border" data-score="9" tabindex="0" role="button">
              <div class="emoji">🌍</div>
              <div class="content">
                <span class="text">I'm a cross-border worker</span>
                <span class="arrow">→</span>
              </div>
            </div>
            
            <div class="card option-card" data-situation="comparing" data-score="3" tabindex="0" role="button">
              <div class="emoji">📊</div>
              <div class="content">
                <span class="text">Just comparing options</span>
                <span class="arrow">→</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="text-center">
          <p class="text-small" style="color: var(--medium-gray)">100% free • No obligation</p>
        </div>
      </div>
    `;
  }
  
  renderValueStepHigh() {
    const situation = this.userData.situation || 'new-to-switzerland';
    const content = this.getSituationContent(situation);
    
    return `
      <div class="smart-modal-step value-step-high">
        <button class="back-button" onclick="SmartModalManager.goToStep('qualification')">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          Back
        </button>
        
        <div class="mt-xl">
          <h2 class="mb-lg">${content.headline}</h2>
          
          <div class="info-box warning">
            <div class="title">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              IMPORTANT TO KNOW
            </div>
            <div class="content">
              Most people in your situation miss key savings because they don't know the specific rules and opportunities that apply to their case.
            </div>
          </div>
          
          <div class="benefits-list">
            ${content.insights.map(insight => `
              <div class="benefit-item">
                <div class="benefit-icon">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div class="benefit-content">
                  <div class="benefit-text font-medium">${insight.title}</div>
                  <div class="benefit-text text-small mt-xs" style="color: var(--medium-gray)">${insight.explanation}</div>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="info-box info">
            <div class="title">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
              </svg>
              Typical Savings
            </div>
            <div class="content">
              <strong>CHF 1,500-2,800/year</strong> when optimized by someone who understands your specific situation and the current market dynamics.
            </div>
          </div>
          
          <h3 class="mb-lg mt-xl">How would you like to proceed?</h3>
          
          <div class="consultation-card card" style="position: relative; background: var(--red-primary); border-color: var(--red-primary); padding: var(--space-xl); margin-bottom: var(--space-lg);">
            <div style="position: absolute; top: -12px; left: var(--space-lg); background: var(--white); color: var(--red-primary); font-size: var(--font-size-tiny); font-weight: 700; text-transform: uppercase; padding: 4px 12px; border-radius: var(--radius-medium); box-shadow: var(--shadow-card);">
              ✓ RECOMMENDED
            </div>
            
            <div class="flex items-center mb-md" style="color: white;">
              <span style="font-size: 32px; margin-right: var(--space-md);">📞</span>
              <div>
                <h3 style="color: white; margin-bottom: 4px;">15-Min Expert Call</h3>
              </div>
            </div>
            
            <div class="benefits-list mb-lg" style="color: white; opacity: 0.95;">
              <div style="margin-bottom: var(--space-sm);">• Personalized strategies for your exact situation</div>
              <div style="margin-bottom: var(--space-sm);">• Hidden discounts and optimization opportunities</div>
              <div style="margin-bottom: var(--space-sm);">• 2026 timeline planning and next steps</div>
            </div>
            
            <button class="btn-large" style="background: white; color: var(--red-primary); width: 100%;" onclick="SmartModalManager.goToStep('booking-info')">
              BOOK FREE CALL →
            </button>
          </div>
          
          <div class="divider">
            <span>or</span>
          </div>
          
          <button class="btn-ghost" style="width: 100%;" onclick="SmartModalManager.goToStep('booking-info')">
            Get Standard Quotes (4-5 min)
          </button>
          <div class="text-center mt-xs">
            <p class="text-tiny" style="color: var(--warning-amber); display: flex; align-items: center; justify-content: center; gap: var(--space-xxs);">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              May miss CHF 1,200+ in potential savings
            </p>
          </div>
        </div>
      </div>
    `;
  }
  
  // Continue with other render methods...
  renderValueStepMedium() {
    return `
      <div class="smart-modal-step value-step-medium">
        <button class="back-button" onclick="SmartModalManager.goToStep('qualification')">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          Back
        </button>
        
        <div class="mt-xl">
          <h2 class="mb-2xl text-center">Great! How would you like to proceed?</h2>
          
          <div class="comparison-container" style="display: grid; gap: var(--space-lg); max-width: 800px; margin: 0 auto; grid-template-columns: 1fr 1fr;">
            <div class="comparison-card expert-card card" style="padding: var(--space-lg); min-height: 400px; display: flex; flex-direction: column;">
              <div class="card-header text-center mb-lg">
                <div class="icon-large mb-sm" style="font-size: 40px;">📞</div>
                <h3 class="card-title" style="font-size: 18px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: var(--dark-gray); margin-bottom: var(--space-xxs);">EXPERT CALL</h3>
                <p class="card-duration" style="font-size: var(--font-size-small); color: var(--medium-gray); margin-bottom: var(--space-lg);">15 minutes</p>
              </div>
              
              <div class="benefits-list mb-lg">
                <div class="benefit-item">
                  <div class="benefit-icon">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <div class="benefit-text">Personalized to your exact situation</div>
                </div>
                <div class="benefit-item">
                  <div class="benefit-icon">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <div class="benefit-text">Hidden discounts & optimization</div>
                </div>
                <div class="benefit-item">
                  <div class="benefit-icon">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <div class="benefit-text">2026 strategy & timing advice</div>
                </div>
              </div>
              
              <div class="savings-highlight success mb-lg" style="background: var(--green-50); padding: var(--space-sm); border-radius: var(--radius-small); text-align: center; font-size: var(--font-size-small); color: var(--green-900);">
                <strong>Average savings: CHF 1,847/year</strong>
              </div>
              
              <button class="btn-primary btn-large" style="margin-top: auto;" onclick="SmartModalManager.goToStep('booking-info')">
                BOOK CALL →
              </button>
            </div>
            
            <div class="comparison-card self-service-card card" style="padding: var(--space-lg); min-height: 400px; display: flex; flex-direction: column;">
              <div class="card-header text-center mb-lg">
                <div class="icon-large mb-sm" style="font-size: 40px;">📋</div>
                <h3 class="card-title" style="font-size: 18px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: var(--dark-gray); margin-bottom: var(--space-xxs);">SELF-SERVICE</h3>
                <p class="card-duration" style="font-size: var(--font-size-small); color: var(--medium-gray); margin-bottom: var(--space-lg);">4-5 minutes</p>
              </div>
              
              <div class="features-list mb-lg">
                <div class="feature-item" style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-sm);">
                  <span class="bullet" style="color: var(--gray-400); font-size: 20px; width: 20px; flex-shrink: 0;">•</span>
                  <span class="feature-text" style="font-size: var(--font-size-small); color: var(--medium-gray); line-height: 1.5;">Generic comparison</span>
                </div>
                <div class="feature-item" style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-sm);">
                  <span class="bullet" style="color: var(--gray-400); font-size: 20px; width: 20px; flex-shrink: 0;">•</span>
                  <span class="feature-text" style="font-size: var(--font-size-small); color: var(--medium-gray); line-height: 1.5;">Public rates only</span>
                </div>
                <div class="feature-item" style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-sm);">
                  <span class="bullet" style="color: var(--gray-400); font-size: 20px; width: 20px; flex-shrink: 0;">•</span>
                  <span class="feature-text" style="font-size: var(--font-size-small); color: var(--medium-gray); line-height: 1.5;">No personalized advice</span>
                </div>
              </div>
              
              <div class="warning-highlight warning mb-lg" style="background: var(--amber-50); padding: var(--space-sm); border-radius: var(--radius-small); text-align: center; font-size: var(--font-size-small); color: var(--amber-800); display: flex; align-items: center; justify-content: center; gap: var(--space-xs);">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                <strong>May miss CHF 800-1,500 in savings</strong>
              </div>
              
              <button class="btn-secondary btn-large" style="margin-top: auto;" onclick="SmartModalManager.goToStep('booking-info')">
                GET QUOTES →
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <style>
        @media (max-width: 767px) {
          .comparison-container {
            grid-template-columns: 1fr !important;
          }
        }
      </style>
    `;
  }
  
  renderValueStepLow() {
    return `
      <div class="smart-modal-step value-step-low">
        <button class="back-button" onclick="SmartModalManager.goToStep('qualification')">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          Back
        </button>
        
        <div class="mt-xl">
          <h2 class="mb-2xl text-center">No problem! How can I help?</h2>
          
          <div class="options-container" style="max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-md);">
            <div class="option-card-row card" style="display: flex; align-items: center; gap: var(--space-md); padding: var(--space-lg); cursor: pointer;" onclick="SmartModalManager.goToStep('booking-info')">
              <div class="option-icon" style="font-size: 32px; flex-shrink: 0;">📞</div>
              <div class="option-content" style="flex: 1;">
                <h3 class="option-title" style="font-size: var(--font-size-body); font-weight: 600; color: var(--dark-gray); margin-bottom: var(--space-xxs);">Quick Call</h3>
                <p class="option-subtitle" style="font-size: var(--font-size-small); color: var(--medium-gray); margin: 0;">Personalized advice (15 min)</p>
              </div>
              <button class="btn-primary option-button" style="flex-shrink: 0; padding: 10px 20px;">
                BOOK NOW →
              </button>
            </div>
            
            <div class="option-card-row card" style="display: flex; align-items: center; gap: var(--space-md); padding: var(--space-lg); cursor: pointer;" onclick="SmartModalManager.goToStep('booking-info')">
              <div class="option-icon" style="font-size: 32px; flex-shrink: 0;">📋</div>
              <div class="option-content" style="flex: 1;">
                <h3 class="option-title" style="font-size: var(--font-size-body); font-weight: 600; color: var(--dark-gray); margin-bottom: var(--space-xxs);">Compare Rates</h3>
                <p class="option-subtitle" style="font-size: var(--font-size-small); color: var(--medium-gray); margin: 0;">Standard quotes (4-5 min)</p>
              </div>
              <button class="btn-secondary option-button" style="flex-shrink: 0; padding: 10px 20px;">
                GET QUOTES →
              </button>
            </div>
          </div>
          
          <div class="gentle-nudge" style="text-align: center; margin-top: var(--space-xl); display: flex; align-items: center; justify-content: center; gap: var(--space-xs);">
            <span class="nudge-icon" style="font-size: 16px;">💡</span>
            <p class="nudge-text" style="font-size: var(--font-size-small); color: var(--medium-gray); margin: 0;">
              Most people find the call more helpful for their specific situation
            </p>
          </div>
        </div>
      </div>
    `;
  }
  
  renderBookingInfoStep() {
    const situationText = this.getUserData()?.situation || 'your situation';
    const situationMap = {
      'new-to-switzerland': 'your move to Switzerland',
      'family': 'your family\'s coverage',
      'cross-border': 'your cross-border situation',
      'switch-save': 'your switching options',
      'review-coverage': 'your current coverage',
      'comparing': 'your comparison needs'
    };
    
    const description = situationMap[situationText] || 'your situation';
    
    return `
      <div class="smart-modal-step booking-info-step">
        <button class="back-button" onclick="SmartModalManager.goToPreviousValueStep()">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          Back
        </button>
        
        <div class="mt-xl">
          <div class="text-center mb-lg">
            <h2 class="mb-md">Perfect! Let's get you booked 🎉</h2>
            <p style="color: var(--medium-gray)">
              This will be a 15-minute call where we'll review ${description} and find you the best rates + discounts.
            </p>
          </div>
          
          <div class="info-box info mb-xl">
            <div class="title">What you'll get:</div>
            <div class="content">
              <div class="benefits-list">
                <div class="benefit-item">
                  <div class="benefit-icon">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <div class="benefit-text">Personalized recommendations</div>
                </div>
                <div class="benefit-item">
                  <div class="benefit-icon">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <div class="benefit-text">Hidden discount opportunities</div>
                </div>
                <div class="benefit-item">
                  <div class="benefit-icon">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <div class="benefit-text">2026 switching strategy</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="form-section" style="max-width: 500px; margin: 0 auto;">
            <h3 class="mb-lg">Quick info for the booking:</h3>
            
            <form id="booking-info-form">
              <div class="form-group">
                <label for="booking-name" class="form-label">Your Name</label>
                <input 
                  type="text" 
                  id="booking-name" 
                  name="name" 
                  class="form-input" 
                  placeholder="John Doe"
                  required
                  autocomplete="name"
                  value="${this.userData.name || ''}"
                />
                <div class="form-error hidden" id="name-error">Please enter your name</div>
              </div>
              
              <div class="form-group">
                <label for="booking-email" class="form-label">Email Address</label>
                <input 
                  type="email" 
                  id="booking-email" 
                  name="email" 
                  class="form-input" 
                  placeholder="john@example.com"
                  required
                  autocomplete="email"
                  value="${this.userData.email || ''}"
                />
                <div class="form-error hidden" id="email-error">Please enter a valid email address</div>
              </div>
              
              <div class="form-group">
                <label for="booking-phone" class="form-label">
                  Phone Number
                  <span class="form-helper">(for appointment reminder)</span>
                </label>
                <input 
                  type="tel" 
                  id="booking-phone" 
                  name="phone" 
                  class="form-input" 
                  placeholder="+41 79 123 4567"
                  required
                  autocomplete="tel"
                  value="${this.userData.phone || ''}"
                />
                <div class="form-error hidden" id="phone-error">Please enter a valid phone number</div>
              </div>
              
              <button type="submit" class="btn-primary btn-large" id="continue-to-calendar" disabled>
                CONTINUE TO CALENDAR →
              </button>
            </form>
          </div>
          
          <div class="trust-badges text-center mt-xl">
            <div class="trust-items" style="display: flex; justify-content: center; gap: var(--space-lg); flex-wrap: wrap;">
              <div class="trust-item" style="display: flex; align-items: center; gap: var(--space-xs); font-size: var(--font-size-small); color: var(--medium-gray);">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style="color: var(--success-green); flex-shrink: 0;">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span>Free & no obligation</span>
              </div>
              <div class="trust-item" style="display: flex; align-items: center; gap: var(--space-xs); font-size: var(--font-size-small); color: var(--medium-gray);">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style="color: var(--success-green); flex-shrink: 0;">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span>Easy to reschedule</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  renderBookingCalendarStep() {
    return `
      <div class="smart-modal-step booking-calendar-step">
        <button class="back-button" onclick="SmartModalManager.goToStep('booking-info')">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          Back
        </button>
        
        <div class="mt-xl">
          <div class="text-center mb-lg">
            <h2 class="mb-xs">Pick Your Time</h2>
            <p class="text-small" style="color: var(--medium-gray)">Times shown in Europe/Zurich timezone</p>
          </div>
          
          <div class="calendar-container">
            <div id="cal-booking-placeholder">
              <div class="calendar-demo" style="text-align: center; padding: var(--space-2xl); color: var(--dark-gray);">
                <div style="background: var(--blue-50); border: 2px solid var(--blue-200); border-radius: var(--radius-medium); padding: var(--space-xl); margin-bottom: var(--space-lg);">
                  <h3 style="color: var(--blue-700); margin-bottom: var(--space-md);">📅 Demo Mode</h3>
                  <p style="color: var(--blue-800); margin-bottom: var(--space-lg);">
                    Cal.com integration will be configured with your actual booking calendar.
                    For testing, click the button below to simulate a successful booking.
                  </p>
                  <button onclick="SmartModalManager.simulateBookingSuccess()" class="btn-primary btn-large">
                    📞 Book Monday, Oct 21 at 10:00 AM
                  </button>
                </div>
                <p style="font-size: var(--font-size-small); color: var(--medium-gray);">
                  In production, this will show your real Cal.com calendar with available time slots.
                </p>
              </div>
            </div>
          </div>
          
          <div class="scarcity-indicator" style="background: var(--amber-50); border: 1px solid var(--amber-200); border-radius: var(--radius-small); padding: var(--space-sm) var(--space-md); margin: var(--space-md) 0; text-align: center; font-size: var(--font-size-small); font-weight: 500; color: var(--amber-800); display: flex; align-items: center; justify-content: center; gap: var(--space-xs);">
            <span>⚡</span>
            <span>Only 3 spots left today</span>
          </div>
          
          <div class="trust-badges text-center mt-lg">
            <div class="trust-items" style="display: flex; justify-content: center; gap: var(--space-lg); flex-wrap: wrap;">
              <div class="trust-item" style="display: flex; align-items: center; gap: var(--space-xs); font-size: var(--font-size-small); color: var(--medium-gray);">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style="color: var(--success-green); flex-shrink: 0;">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span>Free & no obligation</span>
              </div>
              <div class="trust-item" style="display: flex; align-items: center; gap: var(--space-xs); font-size: var(--font-size-small); color: var(--medium-gray);">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style="color: var(--success-green); flex-shrink: 0;">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span>Instant confirmation email</span>
              </div>
              <div class="trust-item" style="display: flex; align-items: center; gap: var(--space-xs); font-size: var(--font-size-small); color: var(--medium-gray);">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style="color: var(--success-green); flex-shrink: 0;">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span>Easy to reschedule</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  renderConfirmationStep() {
    const bookingData = this.getBookingData();
    const userData = this.getUserData();
    
    let formattedDate = 'Monday, Oct 21 at 10:00 AM';
    if (bookingData.dateTime) {
      try {
        const date = new Date(bookingData.dateTime);
        const options = {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Europe/Zurich'
        };
        formattedDate = date.toLocaleDateString('en-US', options);
      } catch (error) {
        formattedDate = bookingData.dateTime;
      }
    }
    
    return `
      <div class="smart-modal-step confirmation-step" style="max-width: 600px; margin: 0 auto; padding: var(--space-xl) var(--space-lg);">
        <div class="text-center">
          <div class="success-icon mb-md" style="width: 80px; height: 80px; background: var(--success-green); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; margin: 0 auto; position: relative; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2); animation: successBounce 0.6s ease-out 0.2s both;">
            <svg fill="currentColor" viewBox="0 0 20 20" style="width: 40px; height: 40px; color: var(--white);">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
          </div>
          
          <h1 class="mb-xl" style="animation: fadeInUp 0.5s ease-out 0.4s both;">Booking Confirmed! 🎉</h1>
          
          <div class="booking-details-box mb-xl" style="background: var(--light-gray); border: 2px solid var(--gray-200); border-radius: var(--radius-medium); padding: var(--space-lg); max-width: 400px; margin: 0 auto; animation: fadeInUp 0.5s ease-out 0.6s both;">
            <div class="detail-item" style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-md); font-size: var(--font-size-body); color: var(--dark-gray); line-height: 1.5;">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" style="flex-shrink: 0; color: var(--red-primary);">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
              </svg>
              <span>${formattedDate}</span>
            </div>
            <div class="detail-item" style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-md); font-size: var(--font-size-body); color: var(--dark-gray); line-height: 1.5;">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" style="flex-shrink: 0; color: var(--red-primary);">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
              </svg>
              <span>15 minutes</span>
            </div>
            <div class="detail-item" style="display: flex; align-items: center; gap: var(--space-sm); font-size: var(--font-size-body); color: var(--dark-gray); line-height: 1.5;">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" style="flex-shrink: 0; color: var(--red-primary);">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
              <a href="${bookingData.callLink || '#'}" class="call-link" style="color: var(--red-primary); text-decoration: underline; font-weight: 500;">${bookingData.callLink ? 'Join Video Call' : 'Call link will be sent via email'}</a>
            </div>
          </div>
          
          <div class="next-steps-section text-left" style="margin: var(--space-2xl) 0; animation: fadeInUp 0.5s ease-out 0.8s both;">
            <h3 class="mb-lg text-center" style="color: var(--dark-gray);">What's Next:</h3>
            
            <div class="numbered-list" style="counter-reset: step-counter;">
              <div class="numbered-item" style="display: flex; align-items: flex-start; gap: var(--space-md); margin-bottom: var(--space-lg); counter-increment: step-counter;">
                <div class="numbered-content" style="flex: 1;">
                  <div class="numbered-title" style="font-size: var(--font-size-body); font-weight: 500; color: var(--dark-gray); margin-bottom: var(--space-xs);">Check your email for calendar invite and call link</div>
                </div>
              </div>
              
              <div class="numbered-item" style="display: flex; align-items: flex-start; gap: var(--space-md); margin-bottom: var(--space-lg); counter-increment: step-counter;">
                <div class="numbered-content" style="flex: 1;">
                  <div class="numbered-title" style="font-size: var(--font-size-body); font-weight: 500; color: var(--dark-gray); margin-bottom: var(--space-xs);">(Optional) Reply with quick info:</div>
                  <div class="sub-bullets" style="margin-top: var(--space-xs); margin-left: var(--space-2xl);">
                    <div class="sub-bullet" style="font-size: var(--font-size-small); color: var(--medium-gray); margin-bottom: var(--space-xxs);">• Employment status</div>
                    <div class="sub-bullet" style="font-size: var(--font-size-small); color: var(--medium-gray); margin-bottom: var(--space-xxs);">• Coverage needed (self/family)</div>
                    <div class="sub-bullet" style="font-size: var(--font-size-small); color: var(--medium-gray); margin-bottom: var(--space-xxs);">• Start date needed</div>
                  </div>
                </div>
              </div>
              
              <div class="numbered-item" style="display: flex; align-items: flex-start; gap: var(--space-md); counter-increment: step-counter;">
                <div class="numbered-content" style="flex: 1;">
                  <div class="numbered-title" style="font-size: var(--font-size-body); font-weight: 500; color: var(--dark-gray); margin-bottom: var(--space-xs);">Join the call - Robert will guide you through everything!</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="action-buttons mb-xl" style="display: flex; gap: var(--space-md); justify-content: center; align-items: center; animation: fadeInUp 0.5s ease-out 1s both;">
            <button class="btn-primary btn-large" onclick="SmartModalManager.addToCalendar()">
              ADD TO CALENDAR
            </button>
            <button class="btn-secondary" onclick="SmartModalManager.close()">
              CLOSE
            </button>
          </div>
          
          <div class="personal-signature" style="margin-top: var(--space-lg); animation: fadeInUp 0.5s ease-out 1.2s both;">
            <div class="signature-content" style="display: flex; align-items: center; justify-content: center; gap: var(--space-sm);">
              <div class="avatar-container" style="flex-shrink: 0;">
                <img 
                  src="https://res.cloudinary.com/dphbnwjtx/image/upload/w_64,h_64,q_95,f_webp,c_fill,g_face,e_sharpen:100/v1757251477/Generated_Image_September_07_2025_-_9_20PM_uuse1r.webp"
                  alt="Robert Kolar"
                  style="width: 32px; height: 32px; border-radius: var(--radius-full); object-fit: cover; border: 2px solid var(--gray-200);"
                  width="32"
                  height="32"
                />
              </div>
              <p style="font-size: var(--font-size-body); color: var(--medium-gray); font-style: italic; line-height: 1.5; margin: 0;">
                Looking forward to helping you save money! - Robert
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <style>
        @keyframes successBounce {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.1); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .numbered-item::before {
          content: counter(step-counter);
          width: 40px;
          height: 40px;
          background: var(--red-50);
          color: var(--red-primary);
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: var(--font-size-body);
          flex-shrink: 0;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .success-icon,
          .confirmation-step h1,
          .booking-details-box,
          .next-steps-section,
          .action-buttons,
          .personal-signature {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
        
        @media (max-width: 767px) {
          .confirmation-step {
            padding: var(--space-lg) var(--space-md) !important;
          }
          
          .success-icon {
            width: 64px !important;
            height: 64px !important;
          }
          
          .success-icon svg {
            width: 32px !important;
            height: 32px !important;
          }
          
          .action-buttons {
            flex-direction: column !important;
            gap: var(--space-sm) !important;
          }
          
          .action-buttons .btn-primary,
          .action-buttons .btn-secondary {
            width: 100% !important;
          }
          
          .signature-content {
            flex-direction: column !important;
            gap: var(--space-xs) !important;
          }
          
          .signature-content p {
            font-size: var(--font-size-small) !important;
            text-align: center !important;
          }
        }
      </style>
    `;
  }
  
  // Helper methods
  getDynamicHeadline() {
    const headlines = {
      home: "Find Your Best Swiss Health Insurance in Minutes",
      setup: "Set Up Your Swiss Health Insurance in Minutes", 
      change: "Switch to Better Health Insurance for 2026",
      compare: "Find Your Best Insurance Match in Minutes",
      cheapest: "Find the Cheapest Health Insurance for You",
      best: "Get the Best Health Insurance Recommendations",
      family: "Optimize Your Family's Health Insurance",
      provider: "Compare This Provider Against All Options"
    };
    
    const intent = this.pageContext.intent;
    const city = this.pageContext.city;
    
    if (city && ['zurich', 'basel', 'bern', 'geneva', 'lausanne', 'lugano', 'zug'].includes(city)) {
      return `Get health insurance in ${city.charAt(0).toUpperCase() + city.slice(1)} with confidence`;
    }
    
    return headlines[intent] || headlines.home;
  }
  
  getSituationContent(situation) {
    const contentMap = {
      'new-to-switzerland': {
        headline: 'Perfect! Here\'s what you need to know about moving to Switzerland...',
        insights: [
          {
            title: 'Permit type (B, C, L) affects which insurers accept you and pricing',
            explanation: 'Different permit types have access to different insurance products and rates'
          },
          {
            title: 'You have 3 months to register - timing impacts available discounts',
            explanation: 'Early registration can unlock special newcomer rates and avoid penalties'
          },
          {
            title: 'Expat-specific packages exist that most comparison sites don\'t show',
            explanation: 'These specialized plans often offer better coverage for international situations'
          }
        ]
      },
      'family': {
        headline: 'Perfect! Here\'s what you need to know about family coverage...',
        insights: [
          {
            title: 'Children under 18 are often cheaper on separate policies',
            explanation: 'Individual child policies can be significantly more cost-effective than family plans'
          },
          {
            title: 'Spouse combinations can save 15-20% vs individual policies',
            explanation: 'Strategic coupling of adult policies can unlock substantial savings'
          },
          {
            title: 'Deductible strategies differ significantly for families vs singles',
            explanation: 'Family deductible optimization requires different calculation methods'
          }
        ]
      },
      'cross-border': {
        headline: 'Perfect! Here\'s what you need to know about cross-border work...',
        insights: [
          {
            title: 'EU/EFTA workers have special exemption options (LAMal/CMU choice)',
            explanation: 'You can choose between Swiss and home country healthcare systems'
          },
          {
            title: 'Double taxation and coordination rules most sites don\'t account for',
            explanation: 'Cross-border tax implications affect insurance premium calculations'
          },
          {
            title: 'Timing of registration affects which country\'s system applies',
            explanation: 'Registration deadlines determine your healthcare system obligations'
          }
        ]
      },
      'switch-save': {
        headline: 'Perfect! Here\'s what you need to know about switching insurance...',
        insights: [
          {
            title: 'Premium increases for 2026 vary dramatically by insurer (5-15%)',
            explanation: 'Some insurers are raising rates much more than others'
          },
          {
            title: 'Switching deadlines and procedures have specific requirements',
            explanation: 'Missing deadlines or incorrect procedures can delay your switch'
          },
          {
            title: 'Hidden discounts and loyalty penalties most people miss',
            explanation: 'Long-term customers often pay more than new customers for the same coverage'
          }
        ]
      }
    };
    
    return contentMap[situation] || contentMap['new-to-switzerland'];
  }
  
  goToPreviousValueStep() {
    const score = this.userData?.complexityScore || 5;
    
    let previousStep;
    if (score >= 7) {
      previousStep = 'value-high';
    } else if (score >= 4) {
      previousStep = 'value-medium';
    } else {
      previousStep = 'value-low';
    }
    
    this.goToStep(previousStep);
  }
  
  simulateBookingSuccess() {
    console.log('🎬 Simulating successful booking...');
    
    // Simulate booking data
    const mockBookingData = {
      dateTime: '2024-10-21T10:00:00.000Z',
      callLink: 'https://meet.google.com/abc-defg-hij',
      calendarEventId: 'demo-' + Date.now(),
      bookingReference: 'DEMO-' + Math.random().toString(36).substr(2, 9).toUpperCase()
    };
    
    this.setBookingData(mockBookingData);
    this.goToStep('confirmation');
  }
  
  addToCalendar() {
    const bookingData = this.getBookingData();
    const userData = this.getUserData();
    
    if (bookingData.dateTime) {
      try {
        const startDate = new Date(bookingData.dateTime);
        const endDate = new Date(startDate.getTime() + 15 * 60 * 1000); // 15 minutes
        
        const formatDate = (date) => {
          return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };
        
        const title = encodeURIComponent('Expat-Savvy Insurance Consultation with Robert');
        const description = encodeURIComponent(`Insurance consultation with Robert Kolar from Expat-Savvy.\n\nSituation: ${userData.situation || 'General consultation'}\n\nCall link: ${bookingData.callLink || 'Will be sent via email'}`);
        const location = encodeURIComponent(bookingData.callLink || 'Video call link will be provided');
        
        const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${description}&location=${location}`;
        
        window.open(googleCalUrl, '_blank');
        
        this.trackEvent('calendar_add_clicked', {
          bookingId: bookingData.calendarEventId || 'unknown',
          method: 'google_calendar'
        });
        
      } catch (error) {
        console.error('Error creating calendar event:', error);
        alert('There was an error creating the calendar event. Please check your email for the calendar invite.');
      }
    } else {
      alert('Please check your email for the calendar invite.');
    }
  }
  
  // Data management methods
  setUserData(data) {
    this.userData = { ...this.userData, ...data };
    this.saveSessionData();
    console.log('📊 SmartModalManager: User data updated', this.userData);
  }
  
  getUserData() {
    return this.userData;
  }
  
  setBookingData(data) {
    this.bookingData = { ...this.bookingData, ...data };
    this.saveSessionData();
    console.log('📅 SmartModalManager: Booking data updated', this.bookingData);
  }
  
  getBookingData() {
    return this.bookingData;
  }
  
  handleBookingInfoSubmit() {
    console.log('📝 SmartModalManager: Handling booking info submit');
    
    const nameInput = document.getElementById('booking-name');
    const emailInput = document.getElementById('booking-email');
    const phoneInput = document.getElementById('booking-phone');
    
    if (!nameInput || !emailInput || !phoneInput) {
      console.error('❌ Form fields not found');
      return;
    }
    
    const userData = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim()
    };
    
    // Basic validation
    if (!userData.name || !userData.email || !userData.phone) {
      alert('Please fill in all fields to continue.');
      return;
    }
    
    if (!userData.email.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    
    if (userData.phone.replace(/\D/g, '').length < 6) {
      alert('Please enter a valid phone number.');
      return;
    }
    
    // Save user data and proceed
    this.setUserData(userData);
    this.goToStep('booking-calendar');
  }
  
  getSessionDuration() {
    const savedData = sessionStorage.getItem('smartModalData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        return Date.now() - (parsed.timestamp || Date.now());
      } catch (error) {
        return 0;
      }
    }
    return 0;
  }
  
  handleResize() {
    // Handle responsive behavior changes
    const isMobile = window.innerWidth < 768;
    const modal = document.getElementById('smart-modal');
    
    if (modal && this.isOpen) {
      if (isMobile) {
        modal.classList.add('mobile-mode');
      } else {
        modal.classList.remove('mobile-mode');
      }
    }
  }
  
  trackEvent(eventName, data = {}) {
    try {
      // Track with Google Analytics if available
      if (typeof gtag === 'function') {
        gtag('event', eventName, {
          ...data,
          event_category: 'smart_modal',
          event_label: this.currentStep
        });
      }
      
      // Track with custom analytics if available
      if (typeof window.trackEvent === 'function') {
        window.trackEvent(eventName, {
          ...data,
          source: 'smart_modal',
          step: this.currentStep,
          pageIntent: this.pageContext.intent
        });
      }
      
      console.log('📈 SmartModalManager: Event tracked', eventName, data);
      
    } catch (error) {
      console.warn('⚠️ SmartModalManager: Error tracking event', error);
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 SmartModalManager: DOM ready, initializing...');
  
  // Only initialize if smart modal exists on page
  if (document.getElementById('smart-modal')) {
    window.smartModalManager = new SmartModalManager();
  }
  
  // Set up global event handlers
  function setupGlobalEventHandlers() {
    document.addEventListener('click', function(e) {
      // Handle option card clicks
      const optionCard = e.target.closest('.option-card');
      if (optionCard && window.SmartModalManager) {
        const situation = optionCard.getAttribute('data-situation');
        const score = parseInt(optionCard.getAttribute('data-score'));
        
        if (situation && score) {
          console.log('🎯 Option selected:', situation, 'Score:', score);
          
          window.SmartModalManager.setUserData({
            situation: situation,
            complexityScore: score
          });
          
          // Route to appropriate next step
          let nextStep;
          if (score >= 7) {
            nextStep = 'value-high';
          } else if (score >= 4) {
            nextStep = 'value-medium';
          } else {
            nextStep = 'value-low';
          }
          
          window.SmartModalManager.goToStep(nextStep);
        }
      }
    });
    
    // Handle form submissions
    document.addEventListener('submit', function(e) {
      const bookingForm = e.target.closest('#booking-info-form');
      if (bookingForm && window.SmartModalManager) {
        e.preventDefault();
        
        console.log('📝 Processing booking info form');
        
        const formData = new FormData(bookingForm);
        const userData = {
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone')
        };
        
        // Basic validation
        if (userData.name && userData.email && userData.phone) {
          console.log('✅ Form validation passed');
          window.SmartModalManager.setUserData(userData);
          window.SmartModalManager.goToStep('booking-calendar');
        } else {
          console.log('❌ Form validation failed');
          alert('Please fill in all fields to continue.');
        }
      }
    });
    
    // Setup real-time form validation for booking info
    document.addEventListener('input', function(e) {
      const input = e.target;
      if (input.closest('#booking-info-form')) {
        validateBookingForm();
      }
    });
  }
  
  // Form validation function
  function validateBookingForm() {
    const nameInput = document.getElementById('booking-name');
    const emailInput = document.getElementById('booking-email');
    const phoneInput = document.getElementById('booking-phone');
    const submitButton = document.getElementById('continue-to-calendar');
    
    if (!nameInput || !emailInput || !phoneInput || !submitButton) return;
    
    const isValid = nameInput.value.trim().length >= 2 && 
                   emailInput.value.includes('@') && 
                   phoneInput.value.replace(/\D/g, '').length >= 6;
    
    submitButton.disabled = !isValid;
    
    return isValid;
  }
  
  // Initialize global handlers
  setupGlobalEventHandlers();
  
  // Create the SmartModalManager instance
  console.log('🚀 Creating SmartModalManager instance');
  new SmartModalManager();
});