/**
 * OffersModal - Dynamic lead generation modal
 * Replaces old consultation modal with "Get 3 Best Offers" + consultation paths
 */

class OffersModal {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 6;
    this.formData = {};
    this.isProcessing = false;
    this.isMobile = window.innerWidth < 1024;
    
    // Intent and page context
    this.pageIntent = this.detectPageIntent();
    this.providerContext = this.getProviderContext();
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }
  
  init() {
    this.bindEvents();
    this.generateSocialProof();
    this.setupEventTracking();
    console.log('OffersModal initialized with intent:', this.pageIntent);
  }
  
  // Detect page intent for dynamic headlines
  detectPageIntent() {
    const path = window.location.pathname;
    const title = document.title.toLowerCase();
    
    // Home page
    if (path === '/' || path === '/index.html') {
      return 'home';
    }
    
    // Setup pages
    if (path.includes('health-insurance') || path.includes('healthcare-system') || 
        path.includes('set-up-health-insurance') || path.includes('new-health-insurance')) {
      return 'setup';
    }
    
    // Change pages
    if (path.includes('insurance-change') || path.includes('switching') || 
        title.includes('switch') || title.includes('change')) {
      return 'change';
    }
    
    // Cheapest pages
    if (path.includes('cheapest') || title.includes('cheapest')) {
      return 'cheapest';
    }
    
    // Best pages
    if (path.includes('best-health-insurance') || title.includes('best')) {
      return 'best';
    }
    
    // Provider pages
    if (path.includes('/healthcare/all-insurances/') || path.includes('/providers/')) {
      return 'provider';
    }
    
    // Comparison pages
    if (path.includes('/compare-providers/') || path.includes('-vs-')) {
      return 'comparison';
    }
    
    return 'general';
  }
  
  // Get provider context for dynamic headlines
  getProviderContext() {
    const path = window.location.pathname;
    
    // Extract provider from path
    if (path.includes('/healthcare/all-insurances/')) {
      const provider = path.split('/').pop()?.replace('.html', '') || '';
      return provider.charAt(0).toUpperCase() + provider.slice(1);
    }
    
    // Extract providers from comparison path
    if (path.includes('/compare-providers/')) {
      const comparison = path.split('/compare-providers/')[1]?.split('/')[0] || '';
      if (comparison.includes('-vs-')) {
        const [providerA, providerB] = comparison.split('-vs-').map(p => 
          p.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        );
        return { providerA, providerB };
      }
    }
    
    return null;
  }
  
  // Generate dynamic headlines based on intent
  getHeadlineContent() {
    const provider = this.providerContext;
    
    switch (this.pageIntent) {
      case 'home':
        return {
          headline: 'Find Your Best Swiss Health Insurance in Minutes',
          subline: 'Personal, English-speaking advice. Free & no obligation.'
        };
      case 'setup':
        return {
          headline: 'Set Up Your Swiss Health Insurance (Step by Step)',
          subline: 'Personal, English-speaking advice. Free & no obligation.'
        };
      case 'change':
        return {
          headline: 'Switch Your Swiss Health Insurance for 2026',
          subline: 'Personal, English-speaking advice. Free & no obligation.'
        };
      case 'cheapest':
        return {
          headline: 'Cheapest 2026 Options for Your Canton',
          subline: 'Personal, English-speaking advice. Free & no obligation.'
        };
      case 'best':
        return {
          headline: 'Best Health Insurance for Expats — 2026 Guide',
          subline: 'Personal, English-speaking advice. Free & no obligation.'
        };
      case 'provider':
        return {
          headline: `${provider} Rate + 2 Alternatives for 2026`,
          subline: 'Personal, English-speaking advice. Free & no obligation.'
        };
      case 'comparison':
        return {
          headline: `${provider?.providerA} vs ${provider?.providerB} — Compare 2026 Rates and 1 Smart Alternative`,
          subline: 'Personal, English-speaking advice. Free & no obligation.'
        };
      default:
        return {
          headline: 'Find Your Best Swiss Health Insurance in Minutes',
          subline: 'Personal, English-speaking advice. Free & no obligation.'
        };
    }
  }
  
  // Generate daily-seeded social proof number
  generateSocialProof() {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    
    // Simple seeded random number between 5-18
    const random = ((seed * 9301 + 49297) % 233280) / 233280;
    const count = Math.floor(random * 14) + 5; // 5-18
    
    return count;
  }
  
  // Bind all event listeners
  bindEvents() {
    // Close modal events
    document.getElementById('close-offers-modal-btn')?.addEventListener('click', () => this.closeModal());
    document.getElementById('offers-modal')?.addEventListener('click', (e) => {
      if (e.target.dataset.modalBackdrop) this.closeModal();
    });
    
    // Mobile navigation
    document.getElementById('mobile-back-btn')?.addEventListener('click', () => this.previousStep());
    document.getElementById('mobile-next-btn')?.addEventListener('click', () => this.nextStep());
    
    // Desktop consultation button
    document.getElementById('desktop-consultation-btn')?.addEventListener('click', () => this.startConsultationFlow());
    
    // Global consultation buttons (replace old modal triggers)
    this.replaceConsultationButtons();
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !document.getElementById('offers-modal')?.classList.contains('hidden')) {
        this.closeModal();
      }
    });
    
    // Resize handler
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 1024;
    });
  }
  
  // Replace all existing consultation button triggers
  replaceConsultationButtons() {
    const selectors = [
      '[data-open-consultation]',
      '.consultation-button',
      '.btn-consultation',
      '.safe-consultation-btn',
      'button:has-text("Book"), button:has-text("Consultation")',
      'a:has-text("Book"), a:has-text("Consultation")'
    ];
    
    // Find buttons by text content (more reliable)
    document.querySelectorAll('button, a, [role="button"]').forEach(el => {
      const text = el.textContent?.toLowerCase().trim() || '';
      const isConsultationButton = 
        text.includes('consultation') || 
        text.includes('book') || 
        text.includes('get started') ||
        text.includes('free advice') ||
        text.includes('contact us') ||
        el.hasAttribute('data-open-consultation');
      
      if (isConsultationButton && !el.hasAttribute('data-offers-enhanced')) {
        el.setAttribute('data-offers-enhanced', 'true');
        
        // Remove old handlers and add new one
        el.removeAttribute('onclick');
        el.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.openModal();
          return false;
        });
      }
    });
  }
  
  // Open modal with dynamic content
  openModal() {
    const modal = document.getElementById('offers-modal');
    if (!modal) return;
    
    // Track modal open
    this.trackEvent('modal_opened', { intent: this.pageIntent });
    
    // Reset state
    this.currentStep = 1;
    this.formData = {};
    
    // Show modal
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    
    // Generate content based on device
    if (this.isMobile) {
      this.renderMobileContent();
    } else {
      this.renderDesktopContent();
    }
    
    // Show urgency for relevant intents
    if (this.pageIntent === 'change' || this.pageIntent === 'cheapest') {
      document.getElementById('desktop-urgency')?.classList.remove('hidden');
    }
    
    // Focus management
    setTimeout(() => {
      const firstInput = modal.querySelector('input, select, button:not([data-close-modal])');
      firstInput?.focus();
    }, 100);
  }
  
  // Close modal
  closeModal() {
    const modal = document.getElementById('offers-modal');
    if (!modal) return;
    
    modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
    
    this.trackEvent('modal_closed', { step: this.currentStep, intent: this.pageIntent });
  }
  
  // Render mobile quiz-style content
  renderMobileContent() {
    const container = document.getElementById('mobile-content');
    if (!container) return;
    
    this.updateMobileProgress();
    
    switch (this.currentStep) {
      case 1:
        container.innerHTML = this.renderIntroStep();
        break;
      case 2:
        container.innerHTML = this.renderLocationStep();
        break;
      case 3:
        container.innerHTML = this.renderPersonalStep();
        break;
      case 4:
        container.innerHTML = this.renderInsuranceStep();
        break;
      case 5:
        container.innerHTML = this.renderSupplementaryStep();
        break;
      case 6:
        container.innerHTML = this.renderContactStep();
        break;
      case 7:
        container.innerHTML = this.renderConfirmationStep();
        break;
    }
    
    this.updateMobileNavigation();
    this.attachStepEventHandlers();
  }
  
  // Render desktop split-layout content
  renderDesktopContent() {
    const container = document.getElementById('desktop-content');
    if (!container) return;
    
    // For desktop, we show a more compact single-screen form
    container.innerHTML = this.renderDesktopForm();
  }
  
  // Render intro step (mobile step 1)
  renderIntroStep() {
    const { headline, subline } = this.getHeadlineContent();
    const socialCount = this.generateSocialProof();
    
    return `
      <div class="text-center mb-8">
        <h2 id="modal-title" class="text-2xl font-bold text-gray-900 mb-3">${headline}</h2>
        <p id="modal-description" class="text-gray-600 mb-4">${subline}</p>
        
        <!-- Social proof -->
        <div class="inline-flex items-center bg-green-50 border border-green-200 rounded-full px-3 py-1 text-sm text-green-800 mb-6">
          <svg class="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
          </svg>
          ${socialCount} people booked consultations in the last 24 hours
        </div>
      </div>
      
      <!-- CTA Options -->
      <div class="space-y-4 mb-8">
        <button id="start-offers-btn" class="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors">
          ✨ Get 3 Best Offers
          <div class="text-sm font-normal text-green-100 mt-1">Takes ~1 min</div>
        </button>
        
        <button id="consultation-btn" class="w-full border-2 border-red-600 text-red-600 py-3 px-6 rounded-lg font-semibold hover:bg-red-50 transition-colors">
          📅 Book Free Consultation
          <div class="text-sm font-normal text-red-500 mt-1">30–60 min video call</div>
        </button>
      </div>
    `;
  }
  
  // Render location & household step (mobile step 2)
  renderLocationStep() {
    return `
      <div class="space-y-6">
        <div class="text-center mb-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Where & Who</h3>
          <p class="text-gray-600">Help us find the best options for your location</p>
        </div>
        
        <!-- Postcode -->
        <div>
          <label for="postcode" class="block text-sm font-medium text-gray-700 mb-2">Swiss Postcode</label>
          <input type="text" id="postcode" name="postcode" placeholder="e.g. 8001" maxlength="4" 
                 class="form-input" pattern="[0-9]{4}" required />
          <p class="text-xs text-gray-500 mt-1">4-digit Swiss postcode</p>
        </div>
        
        <!-- Household type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">Household</label>
          <div class="space-y-2">
            <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input type="radio" name="household" value="single" class="form-radio mr-3" />
              <div>
                <div class="font-medium text-gray-900">Single</div>
                <div class="text-sm text-gray-500">Just me</div>
              </div>
            </label>
            <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input type="radio" name="household" value="couple" class="form-radio mr-3" />
              <div>
                <div class="font-medium text-gray-900">Couple</div>
                <div class="text-sm text-gray-500">Me + partner</div>
              </div>
            </label>
            <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input type="radio" name="household" value="family" class="form-radio mr-3" />
              <div>
                <div class="font-medium text-gray-900">Family with children</div>
                <div class="text-sm text-gray-500">Parents + kids</div>
              </div>
            </label>
          </div>
        </div>
        
        <!-- Dynamic person adding will be handled by JS -->
        <div id="additional-persons" class="hidden">
          <!-- Will be populated when couple/family is selected -->
        </div>
      </div>
    `;
  }
  
  // Render personal info step (mobile step 3)
  renderPersonalStep() {
    return `
      <div class="space-y-6">
        <div class="text-center mb-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Personal Details</h3>
          <p class="text-gray-600">Birth dates and employment status</p>
        </div>
        
        <div id="persons-container">
          <!-- Will be populated based on household selection -->
        </div>
      </div>
    `;
  }
  
  // Render insurance preferences step (mobile step 4)
  renderInsuranceStep() {
    return `
      <div class="space-y-6">
        <div class="text-center mb-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Basic Insurance</h3>
          <p class="text-gray-600">Your coverage preferences</p>
        </div>
        
        <!-- Deductible -->
        <div>
          <label for="deductible" class="block text-sm font-medium text-gray-700 mb-2">
            Annual Deductible
            <button type="button" class="ml-1 text-gray-400 hover:text-gray-600" data-tooltip="Higher deductible = lower monthly premium">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </label>
          <select id="deductible" name="deductible" class="form-select" required>
            <option value="">Select deductible...</option>
            <option value="300">CHF 300 (highest premium, lowest out-of-pocket)</option>
            <option value="500">CHF 500</option>
            <option value="1000">CHF 1,000</option>
            <option value="1500">CHF 1,500</option>
            <option value="2000">CHF 2,000</option>
            <option value="2500">CHF 2,500 (lowest premium, highest out-of-pocket)</option>
            <option value="unsure">Unsure - advise me</option>
          </select>
        </div>
        
        <!-- Model -->
        <div>
          <label for="model" class="block text-sm font-medium text-gray-700 mb-2">
            Insurance Model
            <button type="button" class="ml-1 text-gray-400 hover:text-gray-600" data-tooltip="Restricted models offer lower premiums">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </label>
          <select id="model" name="model" class="form-select" required>
            <option value="">Select model...</option>
            <option value="standard">Standard (free choice of doctors)</option>
            <option value="hmo">HMO (group practice first, 15-25% savings)</option>
            <option value="family-doctor">Family Doctor (GP first, 10-20% savings)</option>
            <option value="telmed">Telmed (phone first, 20-30% savings)</option>
            <option value="unsure">Unsure - advise me</option>
          </select>
        </div>
      </div>
    `;
  }
  
  // Render supplementary needs step (mobile step 5)
  renderSupplementaryStep() {
    return `
      <div class="space-y-6">
        <div class="text-center mb-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Supplementary Needs</h3>
          <p class="text-gray-600">Rate importance (1 = not important, 5 = very important)</p>
        </div>
        
        <div class="space-y-4">
          ${this.renderSlider('international', 'International coverage', 'Medical treatment abroad')}
          ${this.renderSlider('hospital', 'Hospital upgrade', 'Private/semi-private room')}
          ${this.renderSlider('prevention', 'Prevention & fitness', 'Gym, wellness, check-ups')}
          ${this.renderSlider('vision', 'Glasses/vision', 'Glasses, contact lenses')}
          ${this.renderSlider('dental', 'Dental', 'Cleanings, fillings, orthodontics')}
          ${this.renderSlider('maternity', 'Maternity', 'Pregnancy, childbirth extras')}
          ${this.renderSlider('mental', 'Mental health/alternative', 'Psychology, naturopathy')}
        </div>
        
        <!-- Other needs -->
        <div>
          <label for="other-needs" class="block text-sm font-medium text-gray-700 mb-2">Other specific needs (optional)</label>
          <textarea id="other-needs" name="other-needs" rows="2" placeholder="e.g., specific conditions, medications, cross-border work..." class="form-input"></textarea>
        </div>
      </div>
    `;
  }
  
  // Helper to render slider components
  renderSlider(name, label, description) {
    return `
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">${label}</label>
        <div class="flex items-center space-x-3">
          <span class="text-xs text-gray-500">1</span>
          <input type="range" id="${name}" name="${name}" min="1" max="5" value="3" class="form-slider flex-1" />
          <span class="text-xs text-gray-500">5</span>
          <span id="${name}-value" class="text-sm font-medium text-gray-900 w-8">3</span>
        </div>
        <p class="text-xs text-gray-500 mt-1">${description}</p>
      </div>
    `;
  }
  
  // Render contact & consent step (mobile step 6)
  renderContactStep() {
    return `
      <div class="space-y-6">
        <div class="text-center mb-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Contact & Consent</h3>
          <p class="text-gray-600">How to send your personalized offers</p>
        </div>
        
        <!-- Contact info -->
        <div class="space-y-4">
          <div>
            <label for="full-name" class="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
            <input type="text" id="full-name" name="full-name" required class="form-input" placeholder="Your full name" />
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
            <input type="email" id="email" name="email" required class="form-input" placeholder="your@email.com" />
          </div>
          
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">Phone (optional)</label>
            <input type="tel" id="phone" name="phone" class="form-input" placeholder="+41 XX XXX XX XX" />
          </div>
        </div>
        
        <!-- Consent -->
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <label class="flex items-start">
            <input type="checkbox" id="consent" name="consent" required class="form-checkbox mt-1 mr-3 flex-shrink-0" />
            <span class="text-sm text-gray-700">
              I agree to be contacted with my 3 offers. Consultations are free, independent & in English. 
              We are a FINMA-registered broker and may receive commissions. No obligation. *
            </span>
          </label>
        </div>
      </div>
    `;
  }
  
  // Render confirmation step (mobile step 7)
  renderConfirmationStep() {
    return `
      <div class="text-center space-y-6">
        <div class="mb-8">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3">Thank you! Your 3 tailored offers are on the way 🚀</h3>
          <p class="text-gray-600 mb-6">We'll prepare your comparison and send it to <strong>${this.formData.email}</strong> within 24 hours.</p>
          
          ${(this.pageIntent === 'change' || this.pageIntent === 'cheapest') ? `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p class="text-sm text-red-800">
                <strong>Reminder:</strong> Switch by 30 Nov 2025 for a 1 Jan 2026 start.
              </p>
            </div>
          ` : ''}
        </div>
        
        <!-- Robert's photo and CTA -->
        <div class="bg-gray-50 rounded-lg p-6">
          <img src="/images/consultants/robert-kolar.jpg" alt="Robert Kolar" class="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-white shadow-lg object-cover" />
          <h4 class="font-semibold text-gray-900 mb-2">Want to discuss your options?</h4>
          <p class="text-sm text-gray-600 mb-4">Book a free consultation with Robert, our FINMA-registered advisor.</p>
          
          <button id="final-consultation-btn" class="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors mb-3">
            📅 Book Free Consultation
          </button>
          
          <button id="just-email-btn" class="text-sm text-gray-500 hover:text-gray-700">
            Just email me my offers
          </button>
        </div>
      </div>
    `;
  }
  
  // Render desktop form (single screen)
  renderDesktopForm() {
    const { headline, subline } = this.getHeadlineContent();
    const socialCount = this.generateSocialProof();
    
    return `
      <div class="space-y-8">
        <!-- Header -->
        <div class="text-center">
          <h2 id="modal-title" class="text-3xl font-bold text-gray-900 mb-3">${headline}</h2>
          <p id="modal-description" class="text-gray-600 mb-4">${subline}</p>
          
          <!-- Social proof -->
          <div class="inline-flex items-center bg-green-50 border border-green-200 rounded-full px-3 py-1 text-sm text-green-800 mb-6">
            <svg class="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
            </svg>
            ${socialCount} people booked consultations in the last 24 hours
          </div>
          
          <!-- Primary CTA -->
          <button id="desktop-start-offers-btn" class="bg-green-600 text-white py-3 px-8 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors mb-8">
            ✨ Get 3 Best Offers <span class="text-green-200 text-sm font-normal">(Takes ~1 min)</span>
          </button>
        </div>
        
        <!-- Compact form -->
        <form id="desktop-offers-form" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Location -->
            <div>
              <label for="desktop-postcode" class="block text-sm font-medium text-gray-700 mb-2">Swiss Postcode *</label>
              <input type="text" id="desktop-postcode" name="postcode" placeholder="e.g. 8001" maxlength="4" pattern="[0-9]{4}" required class="form-input" />
            </div>
            
            <!-- Household -->
            <div>
              <label for="desktop-household" class="block text-sm font-medium text-gray-700 mb-2">Household *</label>
              <select id="desktop-household" name="household" required class="form-select">
                <option value="">Select...</option>
                <option value="single">Single</option>
                <option value="couple">Couple</option>
                <option value="family">Family with children</option>
              </select>
            </div>
            
            <!-- Deductible -->
            <div>
              <label for="desktop-deductible" class="block text-sm font-medium text-gray-700 mb-2">Preferred Deductible</label>
              <select id="desktop-deductible" name="deductible" class="form-select">
                <option value="">Select...</option>
                <option value="300">CHF 300 (highest premium)</option>
                <option value="1000">CHF 1,000</option>
                <option value="2500">CHF 2,500 (lowest premium)</option>
                <option value="unsure">Unsure - advise me</option>
              </select>
            </div>
            
            <!-- Model -->
            <div>
              <label for="desktop-model" class="block text-sm font-medium text-gray-700 mb-2">Insurance Model</label>
              <select id="desktop-model" name="model" class="form-select">
                <option value="">Select...</option>
                <option value="standard">Standard (free choice)</option>
                <option value="telmed">Telmed (20-30% savings)</option>
                <option value="unsure">Unsure - advise me</option>
              </select>
            </div>
            
            <!-- Name -->
            <div>
              <label for="desktop-name" class="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input type="text" id="desktop-name" name="full-name" required class="form-input" placeholder="Your full name" />
            </div>
            
            <!-- Email -->
            <div>
              <label for="desktop-email" class="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
              <input type="email" id="desktop-email" name="email" required class="form-input" placeholder="your@email.com" />
            </div>
          </div>
          
          <!-- Supplementary (condensed) -->
          <div class="border-t border-gray-200 pt-6">
            <h4 class="font-medium text-gray-900 mb-4">Supplementary priorities (optional):</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label class="flex items-center">
                <input type="checkbox" name="supplements[]" value="international" class="form-checkbox mr-2" />
                <span class="text-sm">International</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" name="supplements[]" value="dental" class="form-checkbox mr-2" />
                <span class="text-sm">Dental</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" name="supplements[]" value="hospital" class="form-checkbox mr-2" />
                <span class="text-sm">Hospital upgrade</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" name="supplements[]" value="prevention" class="form-checkbox mr-2" />
                <span class="text-sm">Prevention/fitness</span>
              </label>
            </div>
          </div>
          
          <!-- Consent -->
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <label class="flex items-start">
              <input type="checkbox" id="desktop-consent" name="consent" required class="form-checkbox mt-1 mr-3 flex-shrink-0" />
              <span class="text-sm text-gray-700">
                I agree to be contacted with my 3 offers. Consultations are free, independent & in English. 
                We are a FINMA-registered broker and may receive commissions. No obligation. *
              </span>
            </label>
          </div>
          
          <!-- Submit -->
          <button type="submit" id="desktop-submit-btn" class="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Get My 3 Best Offers →
          </button>
        </form>
      </div>
    `;
  }
  
  // Update mobile progress bar
  updateMobileProgress() {
    const progressBar = document.getElementById('mobile-progress-bar');
    if (!progressBar) return;
    
    const progress = ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
    progressBar.style.width = `${Math.min(progress, 100)}%`;
  }
  
  // Update mobile navigation buttons
  updateMobileNavigation() {
    const backBtn = document.getElementById('mobile-back-btn');
    const nextBtn = document.getElementById('mobile-next-btn');
    
    if (!backBtn || !nextBtn) return;
    
    // Back button visibility
    if (this.currentStep <= 1) {
      backBtn.classList.add('hidden');
    } else {
      backBtn.classList.remove('hidden');
    }
    
    // Next button text
    if (this.currentStep === 1) {
      nextBtn.textContent = 'Start';
    } else if (this.currentStep === this.totalSteps) {
      nextBtn.textContent = 'Submit';
      nextBtn.classList.remove('bg-red-600', 'hover:bg-red-700');
      nextBtn.classList.add('bg-green-600', 'hover:bg-green-700');
    } else if (this.currentStep === this.totalSteps + 1) {
      // Confirmation step
      nextBtn.textContent = 'Close';
    } else {
      nextBtn.textContent = 'Next';
    }
  }
  
  // Navigate to next step
  nextStep() {
    if (this.isProcessing) return;
    
    // Validate current step
    if (!this.validateCurrentStep()) return;
    
    this.collectCurrentStepData();
    
    if (this.currentStep < this.totalSteps + 1) {
      this.currentStep++;
      this.trackEvent('form_step_completed', { step: this.currentStep - 1, intent: this.pageIntent });
      
      if (this.currentStep === this.totalSteps) {
        // Submit form
        this.submitForm();
      } else if (this.currentStep === this.totalSteps + 1) {
        // Show confirmation
        this.renderMobileContent();
      } else {
        // Next step
        this.renderMobileContent();
      }
    } else {
      // Close modal from confirmation
      this.closeModal();
    }
  }
  
  // Navigate to previous step
  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.renderMobileContent();
    }
  }
  
  // Validate current step data
  validateCurrentStep() {
    switch (this.currentStep) {
      case 1:
        // Intro - always valid
        return true;
      case 2:
        // Location step
        const postcode = document.getElementById('postcode')?.value;
        const household = document.querySelector('input[name="household"]:checked')?.value;
        
        if (!postcode || !/^\d{4}$/.test(postcode)) {
          this.showValidationError('Please enter a valid 4-digit Swiss postcode');
          return false;
        }
        if (!household) {
          this.showValidationError('Please select your household type');
          return false;
        }
        return true;
        
      case 3:
        // Personal step - validate DOBs
        const dobInputs = document.querySelectorAll('input[name$="-dob"]');
        for (const input of dobInputs) {
          if (!input.value) {
            this.showValidationError('Please enter all birth dates');
            return false;
          }
          // Validate date format and realistic age
          const date = new Date(input.value.split('.').reverse().join('-'));
          const age = (new Date() - date) / (365.25 * 24 * 60 * 60 * 1000);
          if (age < 0 || age > 120) {
            this.showValidationError('Please enter valid birth dates');
            return false;
          }
        }
        return true;
        
      case 4:
        // Insurance step - optional validation
        return true;
        
      case 5:
        // Supplementary - always valid
        return true;
        
      case 6:
        // Contact step
        const name = document.getElementById('full-name')?.value;
        const email = document.getElementById('email')?.value;
        const consent = document.getElementById('consent')?.checked;
        
        if (!name?.trim()) {
          this.showValidationError('Please enter your full name');
          return false;
        }
        if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          this.showValidationError('Please enter a valid email address');
          return false;
        }
        if (!consent) {
          this.showValidationError('Please agree to be contacted with your offers');
          return false;
        }
        return true;
        
      default:
        return true;
    }
  }
  
  // Show validation error
  showValidationError(message) {
    // Simple alert for now - could be enhanced with better UI
    alert(message);
  }
  
  // Collect data from current step
  collectCurrentStepData() {
    const container = this.isMobile ? document.getElementById('mobile-content') : document.getElementById('desktop-offers-form');
    if (!container) return;
    
    // Collect all form inputs in current container
    const inputs = container.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (input.type === 'radio' || input.type === 'checkbox') {
        if (input.checked) {
          if (input.name.endsWith('[]')) {
            // Array field
            const name = input.name.replace('[]', '');
            if (!this.formData[name]) this.formData[name] = [];
            this.formData[name].push(input.value);
          } else {
            this.formData[input.name] = input.value;
          }
        }
      } else if (input.value) {
        this.formData[input.name] = input.value;
      }
    });
    
    // Collect slider values
    const sliders = container.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
      this.formData[slider.name] = slider.value;
    });
  }
  
  // Submit form to Formspree
  async submitForm() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    
    try {
      // Collect final data
      this.collectCurrentStepData();
      
      // Track submission start
      this.trackEvent('form_submit_started', { intent: this.pageIntent });
      
      // Prepare form data for Formspree
      const formData = new FormData();
      
      // Core form data
      Object.entries(this.formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formData.append(key, value.join(', '));
        } else {
          formData.append(key, value);
        }
      });
      
      // Hidden context data
      formData.append('form_type', 'offers_request');
      formData.append('page_intent', this.pageIntent);
      formData.append('page_url', window.location.href);
      formData.append('page_title', document.title);
      formData.append('provider_context', JSON.stringify(this.providerContext));
      formData.append('date_submitted', new Date().toISOString());
      formData.append('user_agent', navigator.userAgent);
      
      // UTM and tracking data
      const urlParams = new URLSearchParams(window.location.search);
      ['utm_source', 'utm_medium', 'utm_campaign', 'gclid', 'fbclid'].forEach(param => {
        if (urlParams.has(param)) {
          formData.append(param, urlParams.get(param));
        }
      });
      
      // Submit to Formspree
      const response = await fetch('https://formspree.io/f/mrbewjlr', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        // Success
        this.trackEvent('form_submit_success', { intent: this.pageIntent });
        this.trackEvent('lead_offer_form_submit');
        this.trackEvent('email_offers_enqueued');
        
        // Move to confirmation step
        this.currentStep = this.totalSteps + 1;
        this.renderMobileContent();
      } else {
        throw new Error('Submission failed');
      }
      
    } catch (error) {
      console.error('Form submission error:', error);
      this.trackEvent('form_submit_error', { error: error.message, intent: this.pageIntent });
      alert('There was an error submitting your request. Please try again.');
    } finally {
      this.isProcessing = false;
    }
  }
  
  // Start consultation flow (secondary path)
  startConsultationFlow() {
    this.trackEvent('cta_consultation_click', { intent: this.pageIntent });
    
    // For now, redirect to Cal.com - later can be enhanced with mini-intake
    window.open('https://cal.com/robert-kolar/consultation', '_blank');
    
    this.trackEvent('lead_consultation_booked');
  }
  
  // Event tracking
  setupEventTracking() {
    // Initialize tracking if available
    if (typeof gtag !== 'undefined') {
      this.trackEvent = (event, params = {}) => {
        gtag('event', event, {
          ...params,
          page_location: window.location.href,
          page_title: document.title
        });
      };
    } else if (typeof fbq !== 'undefined') {
      this.trackEvent = (event, params = {}) => {
        fbq('trackCustom', event, params);
      };
    } else {
      // Fallback console logging
      this.trackEvent = (event, params = {}) => {
        console.log('Track Event:', event, params);
      };
    }
  }
  
  // Enhanced event tracking with fallback
  trackEvent(event, params = {}) {
    // Will be set by setupEventTracking
  }
  
  // Attach event handlers for current step
  attachStepEventHandlers() {
    // Handle intro step buttons
    document.getElementById('start-offers-btn')?.addEventListener('click', () => {
      this.trackEvent('cta_get_offers_click', { intent: this.pageIntent });
      this.nextStep();
    });
    
    document.getElementById('consultation-btn')?.addEventListener('click', () => {
      this.startConsultationFlow();
    });
    
    // Handle household selection for dynamic person adding
    document.querySelectorAll('input[name="household"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.handleHouseholdChange(e.target.value);
      });
    });
    
    // Handle slider value display updates
    document.querySelectorAll('input[type="range"]').forEach(slider => {
      const valueDisplay = document.getElementById(`${slider.name}-value`);
      if (valueDisplay) {
        slider.addEventListener('input', () => {
          valueDisplay.textContent = slider.value;
        });
      }
    });
    
    // Handle desktop form submission
    document.getElementById('desktop-offers-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleDesktopFormSubmit();
    });
    
    // Handle desktop start button
    document.getElementById('desktop-start-offers-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.trackEvent('cta_get_offers_click', { intent: this.pageIntent });
      // Scroll to form or show form section
      const form = document.getElementById('desktop-offers-form');
      if (form) {
        form.scrollIntoView({ behavior: 'smooth' });
        form.querySelector('input')?.focus();
      }
    });
    
    // Handle confirmation step buttons
    document.getElementById('final-consultation-btn')?.addEventListener('click', () => {
      this.startConsultationFlow();
    });
    
    document.getElementById('just-email-btn')?.addEventListener('click', () => {
      this.closeModal();
    });
    
    // Handle tooltip triggers
    document.querySelectorAll('[data-tooltip]').forEach(trigger => {
      this.setupTooltip(trigger);
    });
  }
  
  // Handle household type change for dynamic person adding
  handleHouseholdChange(householdType) {
    const container = document.getElementById('additional-persons');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (householdType === 'couple') {
      container.innerHTML = `
        <div class="border-t border-gray-200 pt-4">
          <p class="text-sm font-medium text-gray-700 mb-2">Partner</p>
          <button type="button" class="text-sm text-blue-600 hover:text-blue-800">+ Add partner details</button>
        </div>
      `;
      container.classList.remove('hidden');
    } else if (householdType === 'family') {
      container.innerHTML = `
        <div class="border-t border-gray-200 pt-4 space-y-2">
          <p class="text-sm font-medium text-gray-700 mb-2">Family members</p>
          <button type="button" id="add-partner-btn" class="block text-sm text-blue-600 hover:text-blue-800">+ Add partner</button>
          <button type="button" id="add-child-btn" class="block text-sm text-blue-600 hover:text-blue-800">+ Add child</button>
        </div>
      `;
      container.classList.remove('hidden');
    } else {
      container.classList.add('hidden');
    }
  }
  
  // Handle desktop form submission
  async handleDesktopFormSubmit() {
    if (this.isProcessing) return;
    
    // Collect desktop form data
    const form = document.getElementById('desktop-offers-form');
    if (!form) return;
    
    // Validate required fields
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        field.classList.add('border-red-500');
        isValid = false;
      } else {
        field.classList.remove('border-red-500');
      }
    });
    
    if (!isValid) {
      this.showValidationError('Please fill in all required fields');
      return;
    }
    
    // Collect form data
    const formData = new FormData(form);
    this.formData = {};
    for (const [key, value] of formData.entries()) {
      if (key.endsWith('[]')) {
        const arrayKey = key.replace('[]', '');
        if (!this.formData[arrayKey]) this.formData[arrayKey] = [];
        this.formData[arrayKey].push(value);
      } else {
        this.formData[key] = value;
      }
    }
    
    // Submit
    await this.submitForm();
    
    // Show success message
    document.getElementById('desktop-content').innerHTML = this.renderDesktopConfirmation();
  }
  
  // Render desktop confirmation
  renderDesktopConfirmation() {
    return `
      <div class="text-center space-y-6">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-gray-900">Thank you! Your 3 tailored offers are on the way 🚀</h3>
        <p class="text-gray-600">We'll prepare your comparison and send it to <strong>${this.formData.email}</strong> within 24 hours.</p>
        
        ${(this.pageIntent === 'change' || this.pageIntent === 'cheapest') ? `
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-sm text-red-800">
              <strong>Reminder:</strong> Switch by 30 Nov 2025 for a 1 Jan 2026 start.
            </p>
          </div>
        ` : ''}
        
        <button onclick="document.getElementById('offers-modal').classList.add('hidden')" class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
          Close
        </button>
      </div>
    `;
  }
  
  // Setup tooltip functionality
  setupTooltip(trigger) {
    const tooltipText = trigger.getAttribute('data-tooltip');
    if (!tooltipText) return;
    
    let tooltip = null;
    
    trigger.addEventListener('mouseenter', () => {
      tooltip = document.createElement('div');
      tooltip.className = 'tooltip show';
      tooltip.textContent = tooltipText;
      document.body.appendChild(tooltip);
      
      // Position tooltip
      const rect = trigger.getBoundingClientRect();
      tooltip.style.left = `${rect.left + rect.width / 2}px`;
      tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
      tooltip.style.transform = 'translateX(-50%)';
    });
    
    trigger.addEventListener('mouseleave', () => {
      if (tooltip) {
        tooltip.remove();
        tooltip = null;
      }
    });
  }
}

// Global instance
let globalOffersModal = null;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    globalOffersModal = new OffersModal();
    window.globalOffersModal = globalOffersModal;
  });
} else {
  globalOffersModal = new OffersModal();
  window.globalOffersModal = globalOffersModal;
}

// Global access for debugging and external calls
window.OffersModal = OffersModal;

// Global function to open modal (for compatibility with existing scripts)
window.openOffersModal = function() {
  if (globalOffersModal) {
    globalOffersModal.openModal();
  } else {
    // Fallback: directly show modal
    const modal = document.getElementById('offers-modal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.classList.add('modal-open');
    }
  }
};

// Legacy compatibility
window.showConsultationModal = window.openOffersModal;
window.openConsultationModal = window.openOffersModal;
