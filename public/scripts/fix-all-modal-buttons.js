// Fix All Modal Buttons
console.log("[Fix] Modal buttons fix script loaded");

// Function to wait for DOM to be ready
function onReady(callback) {
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(callback, 1);
  } else {
    document.addEventListener("DOMContentLoaded", callback);
  }
}

// Function to ensure showConsultationModal exists
function ensureModalFunctions() {
  if (typeof window.showConsultationModal !== 'function') {
    console.log("[Fix] Creating showConsultationModal function");
    window.showConsultationModal = function() {
      const modal = document.getElementById('consultation-modal');
      if (modal) {
        modal.classList.remove('hidden');
        document.body.classList.add('modal-open');
      } else {
        console.error("[Fix] Modal element not found!");
      }
    };
  }
  
  if (typeof window.closeConsultationModal !== 'function') {
    console.log("[Fix] Creating closeConsultationModal function");
    window.closeConsultationModal = function() {
      const modal = document.getElementById('consultation-modal');
      if (modal) {
        modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
      }
    };
  }
}

// Super aggressive button detection and fixing
function fixAllConsultationButtons() {
  console.log("[Fix] Running super aggressive button detection");
  
  // First ensure the modal functions exist
  ensureModalFunctions();
  
  // Directly target hero and footer section buttons first - these are highest priority
  function fixSpecificButtons() {
    // Target hero section buttons with exact text content match
    const heroButtonSelector = 'a:contains("Book Free Consultation"), button:contains("Book Free Consultation")';
    const heroButtons = document.querySelectorAll('header a, header button, main > div:first-child a, main > div:first-child button');
    
    heroButtons.forEach(button => {
      const text = button.textContent?.trim();
      if (text && (text.includes('Book Free Consultation') || text.includes('Schedule Free Consultation'))) {
        console.log('[Fix] Found hero button with text:', text);
        
        if (!button.hasAttribute('data-modal-fixed')) {
          button.setAttribute('data-modal-fixed', 'true');
          
          // Remove any existing click handlers
          const newButton = button.cloneNode(true);
          if (button.parentNode) {
            button.parentNode.replaceChild(newButton, button);
          }
          
          // Add our click handler with highest priority
          newButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[Fix] Hero button clicked:', text);
            window.showConsultationModal();
            return false;
          }, true);
        }
      }
    });
    
    // Target footer section buttons ("Get Started Today" section)
    const footerSectionButtons = document.querySelectorAll('section a, section button, main > div:last-child a, main > div:last-child button, footer ~ div a, footer ~ div button');
    
    footerSectionButtons.forEach(button => {
      const text = button.textContent?.trim();
      if (text && 
          (text.includes('Schedule Free Consultation') || 
           text.includes('Book Consultation') || 
           text.includes('Free Consultation') ||
           text.includes('Schedule Consultation'))) {
        
        console.log('[Fix] Found footer section button with text:', text);
        
        if (!button.hasAttribute('data-modal-fixed')) {
          button.setAttribute('data-modal-fixed', 'true');
          
          // Direct event attachment
          button.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[Fix] Footer section button clicked:', text);
            window.showConsultationModal();
            return false;
          };
        }
      }
    });
    
    // Target elements with these exact class names
    document.querySelectorAll('.consultation-btn, .schedule-btn, .booking-btn, .book-btn').forEach(button => {
      if (!button.hasAttribute('data-modal-fixed')) {
        button.setAttribute('data-modal-fixed', 'true');
        button.onclick = function(e) {
          e.preventDefault();
          window.showConsultationModal();
          return false;
        };
      }
    });
    
    // Target elements with specific ID patterns
    document.querySelectorAll('[id*="consultation"], [id*="book"], [id*="schedule"]').forEach(button => {
      if (!button.hasAttribute('data-modal-fixed') && 
          !button.id.includes('close') && 
          !button.id.includes('whatsapp') && 
          button.tagName !== 'FORM') {
        
        button.setAttribute('data-modal-fixed', 'true');
        button.onclick = function(e) {
          e.preventDefault();
          window.showConsultationModal();
          return false;
        };
      }
    });
    
    // Target by direct HTML matching
    const specificButtonTexts = [
      'Book Free Consultation',
      'Schedule Free Consultation',
      'Book Consultation',
      'Schedule Consultation',
      'Free Consultation',
      'Get Started Today'
    ];
    
    // Use most aggressive approach - find any element with the exact text
    specificButtonTexts.forEach(searchText => {
      // Regex to find text nodes containing the exact phrase
      const elems = document.evaluate(
        `//*[contains(text(), '${searchText}')]`,
        document,
        null,
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        null
      );
      
      for (let i = 0; i < elems.snapshotLength; i++) {
        const elem = elems.snapshotItem(i);
        if (elem && !elem.hasAttribute('data-modal-fixed')) {
          const elemText = elem.textContent?.trim();
          if (elemText && elemText.includes(searchText)) {
            console.log('[Fix] Found element with text match:', searchText);
            
            // Find closest clickable parent
            let clickableParent = elem;
            // Look up to 3 levels up for a button or anchor
            for (let j = 0; j < 3; j++) {
              if (!clickableParent.parentElement) break;
              clickableParent = clickableParent.parentElement;
              if (clickableParent.tagName === 'BUTTON' || 
                  clickableParent.tagName === 'A' || 
                  clickableParent.getAttribute('role') === 'button') {
                break;
              }
            }
            
            if (clickableParent) {
              clickableParent.setAttribute('data-modal-fixed', 'true');
              clickableParent.style.cursor = 'pointer';
              
              clickableParent.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('[Fix] Text match element clicked:', searchText);
                window.showConsultationModal();
                return false;
              }, true);
            }
          }
        }
      }
    });
    
    // Emergency last-resort fix for main hero section button
    setTimeout(() => {
      // Try to find the main hero button if it wasn't caught by other methods
      const heroSectionButtons = Array.from(document.querySelectorAll('a, button'))
        .filter(el => {
          // Check if it looks like a main hero button
          const text = el.textContent?.trim().toLowerCase() || '';
          const isInHeroArea = el.offsetTop < window.innerHeight; // In first viewport
          return isInHeroArea && text.includes('consultation');
        });
      
      heroSectionButtons.forEach(button => {
        if (!button.hasAttribute('data-modal-fixed')) {
          console.log('[Fix] Emergency fix for hero button:', button.textContent);
          button.setAttribute('data-modal-fixed', 'true');
          
          // Force replace with a new handler
          button.onclick = function(e) {
            e.preventDefault();
            window.showConsultationModal();
            return false;
          };
        }
      });
    }, 500);
  }
  
  // Run specific button fixes
  fixSpecificButtons();
  
  // All possible button texts that could indicate a consultation button
  const buttonTexts = [
    'schedule', 'consultation', 'book', 'meet', 'talk', 'chat', 'speak',
    'advice', 'expert', 'free', 'get started', 'start now', 'insurance expert',
    'get in touch', 'contact us', 'contact', 'insurance needs', 'insurance journey', 
    'get advice', 'insurance solutions', 'request', 'support', 'help',
    'call', 'appointment', 'discuss', 'plan', 'review', 'analyze'
  ];
  
  // Specific button text combinations that are highly likely consultation buttons
  const strongButtonTexts = [
    'book free', 'schedule free', 'free consultation', 'get started today',
    'book consultation', 'schedule consultation', 'meet with us', 'talk to an expert',
    'speak with us', 'chat with us', 'get insurance advice', 'insurance consultation',
    'personal consultation', 'discuss your needs', 'insurance conversation',
    'insurance discussion', 'set up insurance', 'optimize insurance', 'insurance help'
  ];
  
  // Process all possible button-like elements
  const allElements = document.querySelectorAll('a, button, div[role="button"], span[role="button"], [class*="button"], [class*="btn"]');
  console.log(`[Fix] Found ${allElements.length} potential button elements`);
  
  allElements.forEach(element => {
    // Skip if already processed or is a navigation link
    if (element.hasAttribute('data-modal-fixed') || 
        element.classList.contains('modal-next-btn') || 
        element.classList.contains('modal-prev-btn')) {
      return;
    }
    
    // Skip internal or external links (but not # or javascript: links which are often buttons)
    const href = element.getAttribute('href');
    if (href && (href.startsWith('/') || href.startsWith('http')) && 
        !href.includes('contact') && !href.includes('consultation')) {
      return;
    }
    
    // Get all text content including child elements
    const elementText = (element.textContent || '').toLowerCase().trim();
    const hasConsultationText = buttonTexts.some(text => elementText.includes(text));
    const hasStrongConsultationText = strongButtonTexts.some(text => elementText.includes(text));
    
    // Process if:
    // 1. Element has onclick with showConsultationModal
    // 2. Element has consultation-related data attributes
    // 3. Element has consultation-related classes
    // 4. Element has strong consultation text
    // 5. Element looks like a button and has consultation text
    const hasConsultationOnclick = element.getAttribute('onclick')?.includes('showConsultationModal');
    const hasConsultationData = element.hasAttribute('data-open-consultation');
    const hasConsultationClass = element.classList.contains('consultation-button') || 
                                 element.classList.contains('schedule-button') || 
                                 element.classList.contains('book-button');
    const looksLikeButton = element.tagName === 'BUTTON' || 
                            element.getAttribute('role') === 'button' ||
                            element.classList.contains('btn') || 
                            element.classList.contains('button') ||
                            (element.style && (
                              element.style.cursor === 'pointer' ||
                              element.style.backgroundColor ||
                              element.style.border
                            ));
    
    // Check for specific button text like "Book Free Consultation"
    if (hasConsultationOnclick || 
        hasConsultationData || 
        hasConsultationClass || 
        hasStrongConsultationText || 
        (looksLikeButton && hasConsultationText)) {
      
      console.log(`[Fix] Fixing button: "${elementText.substring(0, 30)}..."`);
      
      // Mark as fixed to prevent re-processing
      element.setAttribute('data-modal-fixed', 'true');
      
      // Remove existing onclick if present (we'll add our own event listener)
      if (element.hasAttribute('onclick')) {
        element.removeAttribute('onclick');
      }
      
      // Add click handler with event capturing for maximum reliability
      element.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log(`[Fix] Consultation button clicked: "${elementText.substring(0, 30)}..."`);
        
        // Direct DOM manipulation for the most reliable approach
        const modal = document.getElementById('consultation-modal');
        if (modal) {
          modal.classList.remove('hidden');
          document.body.classList.add('modal-open');
          console.log("[Fix] Modal shown successfully");
        } else {
          console.error("[Fix] Modal element not found!");
        }
        
        return false;
      }, true); // Use capturing for highest priority
    }
  });
  
  // Extra handling for elements with specific text like "Book Free Consultation"
  document.querySelectorAll('*').forEach(element => {
    if (element.hasAttribute('data-modal-fixed')) return;
    
    const text = element.textContent?.toLowerCase().trim();
    if (text && (
        text.includes('book free consultation') || 
        text.includes('schedule free consultation') ||
        text.includes('free consultation') ||
        text.includes('schedule consultation') ||
        text.includes('book consultation') ||
        text.includes('get started today'))) {
      
      console.log(`[Fix] Found text-only consultation element: "${text.substring(0, 30)}..."`);
      element.style.cursor = 'pointer';
      element.setAttribute('data-modal-fixed', 'true');
      
      element.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log(`[Fix] Text-only consultation element clicked: "${text.substring(0, 30)}..."`);
        
        const modal = document.getElementById('consultation-modal');
        if (modal) {
          modal.classList.remove('hidden');
          document.body.classList.add('modal-open');
        }
        
        return false;
      }, true);
    }
  });
}

// Run immediately and when DOM is ready
ensureModalFunctions();
onReady(fixAllConsultationButtons);

// Also run on window load
window.addEventListener('load', fixAllConsultationButtons);

// Run again after a delay to catch dynamic elements
setTimeout(fixAllConsultationButtons, 500);
setTimeout(fixAllConsultationButtons, 1500);
setTimeout(fixAllConsultationButtons, 3000);

// Monitor DOM changes to catch dynamically added buttons
if (typeof MutationObserver !== 'undefined') {
  const observer = new MutationObserver(function(mutations) {
    let needsRefresh = false;
    
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        needsRefresh = true;
      }
    });
    
    if (needsRefresh) {
      console.log("[Fix] DOM changed, re-running button detection");
      fixAllConsultationButtons();
    }
  });
  
  // Start observing the document with the configured parameters
  observer.observe(document.body, { childList: true, subtree: true });
} 