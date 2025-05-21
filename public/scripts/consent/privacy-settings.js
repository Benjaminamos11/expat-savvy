/**
 * Privacy Settings Manager
 * Allows users to update their consent preferences after initial choice
 */

(function() {
  // Create a toggle button in the footer to open privacy settings
  function createPrivacySettingsButton() {
    const footer = document.querySelector('footer');
    if (!footer) return;
    
    const privacyLinks = footer.querySelectorAll('a[href*="privacy"]');
    
    if (privacyLinks.length > 0) {
      // Insert next to existing privacy link
      const privacyLink = privacyLinks[0];
      const settingsButton = document.createElement('button');
      settingsButton.id = 'privacy-settings-button';
      settingsButton.innerText = 'Cookie Settings';
      settingsButton.className = 'privacy-settings-button';
      settingsButton.setAttribute('aria-label', 'Open Cookie Settings');
      
      privacyLink.parentNode.insertBefore(settingsButton, privacyLink.nextSibling);
      
      // Add event listener
      settingsButton.addEventListener('click', openPrivacySettings);
    } else {
      // No privacy link found, add to the footer anyway
      const settingsButton = document.createElement('button');
      settingsButton.id = 'privacy-settings-button';
      settingsButton.innerText = 'Cookie Settings';
      settingsButton.className = 'privacy-settings-button';
      
      footer.appendChild(settingsButton);
      
      // Add event listener
      settingsButton.addEventListener('click', openPrivacySettings);
    }
  }
  
  // Open the privacy settings modal
  function openPrivacySettings() {
    // Check if modal already exists
    let settingsModal = document.getElementById('privacy-settings-modal');
    
    if (!settingsModal) {
      settingsModal = document.createElement('div');
      settingsModal.id = 'privacy-settings-modal';
      settingsModal.className = 'privacy-settings-modal';
      settingsModal.setAttribute('role', 'dialog');
      settingsModal.setAttribute('aria-labelledby', 'privacy-settings-title');
      
      // Get current consent settings from cookies
      const currentSettings = getCurrentConsentSettings();
      
      // Set up modal content
      settingsModal.innerHTML = `
        <div class="privacy-modal-content">
          <div class="privacy-modal-header">
            <h2 id="privacy-settings-title">Privacy Preferences Center</h2>
            <button class="privacy-modal-close" aria-label="Close privacy settings">&times;</button>
          </div>
          
          <div class="privacy-modal-body">
            <p>Manage your cookie preferences. You can enable or disable different types of cookies below.</p>
            
            <div class="privacy-options">
              <div class="privacy-option">
                <input type="checkbox" id="privacy-necessary" checked disabled>
                <label for="privacy-necessary">Necessary Cookies</label>
                <p>These cookies are required for the website to function and cannot be disabled.</p>
              </div>
              
              <div class="privacy-option">
                <input type="checkbox" id="privacy-analytics" ${currentSettings.analytics_storage === 'granted' ? 'checked' : ''}>
                <label for="privacy-analytics">Analytics Cookies</label>
                <p>These cookies help us understand how visitors interact with our website.</p>
              </div>
              
              <div class="privacy-option">
                <input type="checkbox" id="privacy-advertising" ${currentSettings.ad_storage === 'granted' ? 'checked' : ''}>
                <label for="privacy-advertising">Marketing Cookies</label>
                <p>These cookies are used to track visitors across websites to display relevant advertisements.</p>
              </div>
              
              <div class="privacy-option">
                <input type="checkbox" id="privacy-functional" ${currentSettings.functionality_storage === 'granted' ? 'checked' : ''}>
                <label for="privacy-functional">Functional Cookies</label>
                <p>These cookies enable enhanced functionality and personalization.</p>
              </div>
            </div>
          </div>
          
          <div class="privacy-modal-footer">
            <button id="privacy-save-settings" class="privacy-button primary">Save Settings</button>
          </div>
        </div>
      `;
      
      // Append modal to body
      document.body.appendChild(settingsModal);
      
      // Add close button event
      const closeButton = settingsModal.querySelector('.privacy-modal-close');
      closeButton.addEventListener('click', function() {
        closePrivacySettings();
      });
      
      // Add save button event
      const saveButton = document.getElementById('privacy-save-settings');
      saveButton.addEventListener('click', function() {
        savePrivacySettings();
        closePrivacySettings();
      });
      
      // Add styles
      addPrivacyModalStyles();
      
      // Close when clicking outside
      settingsModal.addEventListener('click', function(e) {
        if (e.target === settingsModal) {
          closePrivacySettings();
        }
      });
    }
    
    // Show the modal
    setTimeout(() => {
      settingsModal.classList.add('privacy-modal-visible');
    }, 10);
  }
  
  // Close the privacy settings modal
  function closePrivacySettings() {
    const settingsModal = document.getElementById('privacy-settings-modal');
    if (settingsModal) {
      settingsModal.classList.remove('privacy-modal-visible');
      
      // Remove after animation
      setTimeout(() => {
        settingsModal.remove();
      }, 300);
    }
  }
  
  // Save the privacy settings
  function savePrivacySettings() {
    const analytics = document.getElementById('privacy-analytics').checked ? 'granted' : 'denied';
    const advertising = document.getElementById('privacy-advertising').checked ? 'granted' : 'denied';
    const functional = document.getElementById('privacy-functional').checked ? 'granted' : 'denied';
    
    const consentSettings = {
      ad_storage: advertising,
      analytics_storage: analytics,
      functionality_storage: functional,
      personalization_storage: functional, // Use same value as functional
      security_storage: 'granted' // Always granted
    };
    
    // Update consent in cookies and GTM
    updateConsentSettings(consentSettings);
  }
  
  // Update consent settings
  function updateConsentSettings(settings) {
    // Set cookies
    const expiration = new Date();
    expiration.setMonth(expiration.getMonth() + 6); // 6 months expiration
    
    for (const [key, value] of Object.entries(settings)) {
      document.cookie = `consent_${key}=${value};expires=${expiration.toUTCString()};path=/;SameSite=Strict`;
    }
    
    // Update GTM
    if (window.gtag) {
      window.gtag('consent', 'update', settings);
    }
    
    // Push to dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'consent_updated',
      consent_settings: settings
    });
    
    console.log('Consent settings updated:', settings);
  }
  
  // Get current consent settings from cookies
  function getCurrentConsentSettings() {
    const cookies = document.cookie.split(';');
    const consentSettings = {
      ad_storage: 'denied',
      analytics_storage: 'denied',
      functionality_storage: 'denied',
      personalization_storage: 'denied',
      security_storage: 'granted'
    };
    
    // Parse consent cookies
    cookies.forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name.startsWith('consent_')) {
        const consentType = name.replace('consent_', '');
        consentSettings[consentType] = value;
      }
    });
    
    return consentSettings;
  }
  
  // Add styles for the privacy modal
  function addPrivacyModalStyles() {
    // Check if styles already exist
    if (document.getElementById('privacy-modal-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'privacy-modal-styles';
    style.textContent = `
      .privacy-settings-button {
        background: none;
        border: none;
        color: inherit;
        text-decoration: underline;
        cursor: pointer;
        font-size: inherit;
        font-family: inherit;
        padding: 0 5px;
      }
      
      .privacy-settings-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
      }
      
      .privacy-modal-visible {
        opacity: 1;
        visibility: visible;
      }
      
      .privacy-modal-content {
        background-color: white;
        border-radius: 8px;
        width: 90%;
        max-width: 800px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      }
      
      .privacy-modal-header {
        padding: 1rem;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .privacy-modal-header h2 {
        margin: 0;
        font-size: 1.5rem;
      }
      
      .privacy-modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        color: #666;
      }
      
      .privacy-modal-body {
        padding: 1rem;
      }
      
      .privacy-options {
        margin-top: 1rem;
      }
      
      .privacy-option {
        margin-bottom: 1rem;
        padding: 0.75rem;
        border: 1px solid #eee;
        border-radius: 4px;
      }
      
      .privacy-option p {
        margin: 0.25rem 0 0 0;
        font-size: 0.85rem;
        color: #666;
      }
      
      .privacy-modal-footer {
        padding: 1rem;
        border-top: 1px solid #eee;
        display: flex;
        justify-content: flex-end;
      }
      
      .privacy-button {
        padding: 0.5rem 1rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
      }
      
      .privacy-button.primary {
        background-color: #4a6cf7;
        color: white;
        border-color: #4a6cf7;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Initialize when the DOM is ready
  function init() {
    createPrivacySettingsButton();
  }
  
  // Run when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(); 