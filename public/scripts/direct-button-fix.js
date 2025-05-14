// Direct Button Fix - Most aggressive approach
(function() {
  console.log("[DirectFix] Loading direct button fix script");

  function setupButtons() {
    // Immediate direct targeting of hero section buttons
    const heroSection = document.querySelector('main > div:first-child');
    if (heroSection) {
      const buttons = heroSection.querySelectorAll('a, button');
      buttons.forEach(button => {
        const text = button.textContent?.trim();
        if (text && (text.includes('Book') || text.includes('Consultation') || text.includes('Schedule'))) {
          console.log('[DirectFix] Found hero button:', text);
          
          // Direct DOM replacement approach
          const newButton = document.createElement(button.tagName);
          // Copy all attributes
          [...button.attributes].forEach(attr => {
            newButton.setAttribute(attr.name, attr.value);
          });
          // Copy HTML content
          newButton.innerHTML = button.innerHTML;
          
          // Add direct click handler
          newButton.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[DirectFix] Hero button clicked directly');
            
            // Most direct approach - manually show the modal
            const modal = document.getElementById('consultation-modal');
            if (modal) {
              modal.classList.remove('hidden');
              document.body.classList.add('modal-open');
              return false;
            } else if (typeof window.showConsultationModal === 'function') {
              window.showConsultationModal();
              return false;
            }
          };
          
          // Replace original button
          if (button.parentNode) {
            button.parentNode.replaceChild(newButton, button);
            console.log('[DirectFix] Replaced hero button with direct handler');
          }
        }
      });
    }
    
    // Target specific buttons based on exact text content
    [
      'Book Free Consultation',
      'Schedule Free Consultation',
      'Book Consultation',
      'Schedule Consultation',
      'Get Started Today',
      'Free Consultation'
    ].forEach(buttonText => {
      // Ultra-specific approach: Find all text nodes containing this text
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function(node) {
            return node.nodeValue.includes(buttonText) ?
              NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
          }
        }
      );
      
      const textNodes = [];
      let currentNode;
      while (currentNode = walker.nextNode()) {
        textNodes.push(currentNode);
      }
      
      textNodes.forEach(textNode => {
        // Find parent element that is or contains a clickable element
        let element = textNode.parentElement;
        let clickableParent = null;
        
        // Look up the DOM tree for a clickable element
        for (let i = 0; i < 5 && element; i++) {
          if (element.tagName === 'A' || 
              element.tagName === 'BUTTON' || 
              element.getAttribute('role') === 'button' ||
              element.classList.contains('btn') || 
              element.classList.contains('button')) {
            clickableParent = element;
            break;
          }
          element = element.parentElement;
        }
        
        if (clickableParent) {
          console.log('[DirectFix] Found clickable parent for text:', buttonText);
          
          // Replace with a clone that has our handler
          const newElement = clickableParent.cloneNode(true);
          newElement.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[DirectFix] Text-matched button clicked:', buttonText);
            
            // Try multiple approaches to showing the modal
            if (typeof window.showConsultationModal === 'function') {
              window.showConsultationModal();
            } else {
              const modal = document.getElementById('consultation-modal');
              if (modal) {
                modal.classList.remove('hidden');
                document.body.classList.add('modal-open');
              }
            }
            return false;
          };
          
          if (clickableParent.parentNode) {
            clickableParent.parentNode.replaceChild(newElement, clickableParent);
            console.log('[DirectFix] Replaced clickable parent with direct handler');
          }
        }
      });
    });
    
    // Add direct inline click handlers to all buttons with these texts
    document.querySelectorAll('a, button').forEach(button => {
      const text = button.textContent?.trim();
      if (text && (
          text === 'Book Free Consultation' ||
          text === 'Schedule Free Consultation' ||
          text === 'Schedule Consultation' ||
          text === 'Book Consultation' ||
          text === 'Free Consultation' ||
          text === 'Get Started Today'
      )) {
        // Add inline onclick attribute (highest priority in DOM)
        button.setAttribute('onclick', "event.preventDefault(); window.showConsultationModal(); return false;");
        console.log('[DirectFix] Added inline onclick attribute to button:', text);
      }
    });
  }
  
  // Run immediately
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    setupButtons();
  } else {
    document.addEventListener('DOMContentLoaded', setupButtons);
  }
  
  // Also run after full page load
  window.addEventListener('load', setupButtons);
  
  // Run periodically to catch any dynamically loaded content
  setTimeout(setupButtons, 500);
  setTimeout(setupButtons, 1500);
  setTimeout(setupButtons, 3000);
})(); 