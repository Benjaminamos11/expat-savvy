/**
 * Expat Savvy Custom Consent Manager
 * Integrates with Google Tag Manager's Consent Mode v2
 */

(function() {
  // Create consent banner if it doesn't exist yet
  function createConsentBanner() {
    // Check if banner already exists
    if (document.getElementById('consent-banner')) return;
    
    // Create banner element
    const banner = document.createElement('div');
    banner.id = 'consent-banner';
    banner.className = 'consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'consent-title');
    
    // Banner HTML content
    banner.innerHTML = `
      <div class="consent-content">
        <div class="consent-header">
          <h2 id="consent-title">Privacy Settings</h2>
          <p>We use cookies to improve your browsing experience and help us improve our websites.</p>
        </div>
        
        <div class="consent-options">
          <div class="consent-option">
            <input type="checkbox" id="consent-necessary" checked disabled>
            <label for="consent-necessary">Necessary (Required)</label>
            <p>Essential cookies for site functionality</p>
          </div>
          
          <div class="consent-option">
            <input type="checkbox" id="consent-analytics" checked>
            <label for="consent-analytics">Analytics</label>
            <p>Help us improve our website by collecting anonymous usage data</p>
          </div>
          
          <div class="consent-option">
            <input type="checkbox" id="consent-advertising" checked>
            <label for="consent-advertising">Advertising</label>
            <p>Personalized ads and audience targeting</p>
          </div>
          
          <div class="consent-option">
            <input type="checkbox" id="consent-functional" checked>
            <label for="consent-functional">Functional</label>
            <p>Enhanced website functionality and personalization</p>
          </div>
        </div>
        
        <div class="consent-actions">
          <button id="consent-reject-all" class="consent-button secondary">Reject All</button>
          <button id="consent-accept-selected" class="consent-button primary">Accept Selected</button>
          <button id="consent-accept-all" class="consent-button primary">Accept All</button>
        </div>
      </div>
    `;
    
    // Append banner to body
    document.body.appendChild(banner);
    
    // Add event listeners
    document.getElementById('consent-reject-all').addEventListener('click', function() {
      updateConsent({
        ad_storage: 'denied',
        analytics_storage: 'denied',
        functionality_storage: 'denied',
        personalization_storage: 'denied',
        security_storage: 'granted' // Always granted
      });
      hideConsentBanner();
    });
    
    document.getElementById('consent-accept-all').addEventListener('click', function() {
      updateConsent({
        ad_storage: 'granted',
        analytics_storage: 'granted',
        functionality_storage: 'granted',
        personalization_storage: 'granted',
        security_storage: 'granted'
      });
      hideConsentBanner();
    });
    
    document.getElementById('consent-accept-selected').addEventListener('click', function() {
      const analytics = document.getElementById('consent-analytics').checked ? 'granted' : 'denied';
      const advertising = document.getElementById('consent-advertising').checked ? 'granted' : 'denied';
      const functional = document.getElementById('consent-functional').checked ? 'granted' : 'denied';
      
      updateConsent({
        ad_storage: advertising,
        analytics_storage: analytics,
        functionality_storage: functional,
        personalization_storage: functional,
        security_storage: 'granted'
      });
      hideConsentBanner();
    });
    
    // Add banner styles
    addBannerStyles();
  }
  
  // Update consent in GTM
  function updateConsent(consentSettings) {
    // Store consent in cookie
    const expiration = new Date();
    expiration.setMonth(expiration.getMonth() + 6); // 6 months expiration
    
    // Store each consent type in cookies
    for (const [key, value] of Object.entries(consentSettings)) {
      document.cookie = `consent_${key}=${value};expires=${expiration.toUTCString()};path=/;SameSite=Strict`;
    }
    
    // Update GTM consent state
    if (window.gtag) {
      console.log('Updating GTM consent settings:', consentSettings);
      window.gtag('consent', 'update', consentSettings);
    }
    
    // Let the data layer know about consent changes
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'consent_updated',
      consent_settings: consentSettings
    });
  }
  
  // Hide the consent banner
  function hideConsentBanner() {
    const banner = document.getElementById('consent-banner');
    if (banner) {
      banner.classList.add('consent-banner-hidden');
      // Remove after animation completes
      setTimeout(() => {
        banner.remove();
      }, 300);
    }
  }
  
  // Add banner styles
  function addBannerStyles() {
    // Check if styles already exist
    if (document.getElementById('consent-banner-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'consent-banner-styles';
    style.textContent = `
      .consent-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: white;
        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        padding: 1rem;
        max-height: 80vh;
        overflow-y: auto;
        transition: transform 0.3s ease, opacity 0.3s ease;
        border-top: 1px solid #eee;
      }
      
      .consent-banner-hidden {
        transform: translateY(100%);
        opacity: 0;
      }
      
      .consent-content {
        max-width: 1200px;
        margin: 0 auto;
      }
      
      .consent-header {
        margin-bottom: 1rem;
      }
      
      .consent-header h2 {
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
      }
      
      .consent-options {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 1rem;
      }
      
      .consent-option {
        padding: 0.5rem;
        border: 1px solid #eee;
        border-radius: 4px;
      }
      
      .consent-option p {
        margin: 0.25rem 0;
        font-size: 0.8rem;
        color: #666;
      }
      
      .consent-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
      }
      
      .consent-button {
        padding: 0.5rem 1rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
      }
      
      .consent-button.primary {
        background-color: #4a6cf7;
        color: white;
        border-color: #4a6cf7;
      }
      
      .consent-button.secondary {
        background-color: white;
        color: #333;
      }
      
      @media (max-width: 768px) {
        .consent-options {
          grid-template-columns: 1fr;
        }
        
        .consent-actions {
          flex-direction: column;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Initialize the consent system
  function initConsent() {
    // Check if consent was already given
    const hasGivenConsent = checkExistingConsent();
    
    if (!hasGivenConsent) {
      // Show the banner if no consent was given
      createConsentBanner();
    }
  }
  
  // Check if user has already given consent
  function checkExistingConsent() {
    // Check cookies for consent
    const cookies = document.cookie.split(';');
    const consentCookies = cookies.filter(cookie => cookie.trim().startsWith('consent_'));
    
    // If we have consent cookies, parse them
    if (consentCookies.length > 0) {
      const consentSettings = {};
      
      consentCookies.forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        const consentType = name.replace('consent_', '');
        consentSettings[consentType] = value;
      });
      
      // Update GTM with existing settings
      if (window.gtag) {
        window.gtag('consent', 'update', consentSettings);
      }
      
      return true;
    }
    
    return false;
  }
  
  // Initialize after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConsent);
  } else {
    initConsent();
  }
})(); 