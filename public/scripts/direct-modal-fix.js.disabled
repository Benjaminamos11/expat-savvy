/**
 * Direct Modal Fix - Applies direct fixes to common buttons like in the header
 */

(function() {
  console.log("Direct modal fix loading...");
  
  // Function to find and fix common navigation buttons
  function fixNavButtons() {
    try {
      // 1. Fix header "Contact" button
      document.querySelectorAll('header a[href="/contact"], nav a[href="/contact"]').forEach(button => {
        if (button.hasAttribute('data-direct-fixed')) return;
        
        // Add direct handler
        button.addEventListener('click', function(e) {
          e.preventDefault();
          console.log("Header contact link clicked");
          if (typeof window.showConsultationModal === 'function') {
            window.showConsultationModal();
          }
          return false;
        });
        
        button.setAttribute('data-direct-fixed', 'true');
        console.log("Fixed header contact button");
      });
      
      // 2. Fix footer contact button
      document.querySelectorAll('footer a[href="/contact"], #footer a[href="/contact"]').forEach(button => {
        if (button.hasAttribute('data-direct-fixed')) return;
        
        // Add direct handler
        button.addEventListener('click', function(e) {
          e.preventDefault();
          console.log("Footer contact link clicked");
          if (typeof window.showConsultationModal === 'function') {
            window.showConsultationModal();
          }
          return false;
        });
        
        button.setAttribute('data-direct-fixed', 'true');
        console.log("Fixed footer contact button");
      });
      
      // 3. Find any buttons by text content
      const textButtons = [
        'Contact Us', 
        'Free Consultation',
        'Book a Call',
        'Insurance Advice',
        'Insurance Check',
        'Get Started'
      ];
      
      textButtons.forEach(buttonText => {
        // Find elements containing this text
        document.querySelectorAll('a, button').forEach(element => {
          if (element.hasAttribute('data-direct-fixed')) return;
          
          if (element.textContent && element.textContent.trim() === buttonText) {
            // Direct match - add handler
            element.addEventListener('click', function(e) {
              e.preventDefault();
              console.log("Text match button clicked:", buttonText);
              if (typeof window.showConsultationModal === 'function') {
                window.showConsultationModal();
              }
              return false;
            });
            
            element.setAttribute('data-direct-fixed', 'true');
            console.log("Fixed text match button:", buttonText);
          }
        });
      });
      
      // 4. CTA button in hero section
      document.querySelectorAll('.cta-button, .hero-cta, [class*="hero"] button, [class*="cta"] button').forEach(button => {
        if (button.hasAttribute('data-direct-fixed')) return;
        
        // Likely a primary CTA, add handler
        button.addEventListener('click', function(e) {
          e.preventDefault();
          console.log("Hero CTA button clicked");
          if (typeof window.showConsultationModal === 'function') {
            window.showConsultationModal();
          }
          return false;
        });
        
        button.setAttribute('data-direct-fixed', 'true');
        console.log("Fixed hero CTA button");
      });
    } catch (err) {
      console.error("Error in direct modal fix:", err);
    }
  }
  
  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixNavButtons);
  } else {
    fixNavButtons();
  }
  
  // Also run after page is fully loaded
  window.addEventListener('load', fixNavButtons);
  
  // Run periodically to catch dynamic content
  setInterval(fixNavButtons, 2000);
  
  console.log("Direct modal fix loaded");
})(); 