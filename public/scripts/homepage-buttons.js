// Emergency Homepage Button Fix
(function() {
  console.log('[HomepageFix] Loading emergency homepage button fix');
  
  function fixHomepageButtons() {
    console.log('[HomepageFix] Running homepage-specific button fixes');
    
    // Ensure modal function exists
    if (typeof window.showConsultationModal !== 'function') {
      window.showConsultationModal = function() {
        const modal = document.getElementById('consultation-modal');
        if (modal) {
          modal.classList.remove('hidden');
          document.body.classList.add('modal-open');
        }
      };
    }
    
    // Direct approach to the hero button (no selectors, just direct DOM manipulation)
    try {
      // First approach: Find by text content in the hero section
      const heroButtons = Array.from(document.querySelectorAll('a, button')).filter(button => {
        const text = button.textContent?.trim() || '';
        return text === 'Book Free Consultation' || 
               text === 'Schedule Free Consultation' || 
               text.includes('Consultation →');
      });
      
      console.log(`[HomepageFix] Found ${heroButtons.length} hero buttons by text content`);
      
      heroButtons.forEach(button => {
        // Replace the button's click handler
        const clonedButton = button.cloneNode(true);
        if (button.parentNode) {
          button.parentNode.replaceChild(clonedButton, button);
          
          clonedButton.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[HomepageFix] Hero button clicked');
            window.showConsultationModal();
            return false;
          };
          
          console.log('[HomepageFix] Fixed hero button:', clonedButton.textContent);
        }
      });
      
      // Second approach: Find by position in the hero section
      document.querySelectorAll('main > div, header > div, section > div').forEach(container => {
        const buttons = container.querySelectorAll('a, button');
        buttons.forEach(button => {
          const text = button.textContent?.trim() || '';
          if (text.includes('Consultation') || text.includes('Book Free') || text.includes('Schedule')) {
            const rect = button.getBoundingClientRect();
            // Check if it's in the top part of the page (hero area)
            if (rect.top < window.innerHeight * 0.7) {
              button.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('[HomepageFix] Position-based hero button clicked');
                window.showConsultationModal();
                return false;
              };
              console.log('[HomepageFix] Fixed position-based hero button:', text);
            }
          }
        });
      });
      
      // Third approach: Find buttons before the footer
      const footerButtons = Array.from(document.querySelectorAll('main > div:last-of-type a, main > div:last-of-type button, main > section:last-of-type a, main > section:last-of-type button')).filter(button => {
        const text = button.textContent?.trim() || '';
        return text.includes('Consultation') || text.includes('Schedule') || text.includes('Get Started');
      });
      
      console.log(`[HomepageFix] Found ${footerButtons.length} footer buttons`);
      
      footerButtons.forEach(button => {
        button.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          console.log('[HomepageFix] Footer button clicked');
          window.showConsultationModal();
          return false;
        };
        console.log('[HomepageFix] Fixed footer button:', button.textContent);
      });
      
      // Fourth approach: Direct targeting by text/content
      document.querySelectorAll('a, button').forEach(button => {
        const text = button.textContent?.trim() || '';
        if (text === 'Book Free Consultation' || 
            text === 'Schedule Free Consultation' || 
            text === 'Schedule Consultation' || 
            text === 'Book Consultation' ||
            text === 'Get Started Today') {
          
          button.onclick = function(e) {
            e.preventDefault(); 
            e.stopPropagation();
            console.log('[HomepageFix] Direct text match button clicked:', text);
            window.showConsultationModal();
            return false;
          };
          console.log('[HomepageFix] Fixed direct text match button:', text);
        }
      });
      
    } catch (error) {
      console.error('[HomepageFix] Error fixing homepage buttons:', error);
    }
  }
  
  // Run immediately
  fixHomepageButtons();
  
  // Also run when DOM is fully loaded
  if (document.readyState === 'complete') {
    setTimeout(fixHomepageButtons, 100);
  } else {
    window.addEventListener('load', function() {
      setTimeout(fixHomepageButtons, 100);
    });
  }
  
  // Run multiple times to ensure it catches late-loading elements
  setTimeout(fixHomepageButtons, 500);
  setTimeout(fixHomepageButtons, 1500);
  setTimeout(fixHomepageButtons, 3000);
})(); 