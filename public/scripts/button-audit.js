// Button Audit Script
console.log("[AUDIT] Button audit script loaded");

document.addEventListener('DOMContentLoaded', function() {
  console.log("[AUDIT] DOM loaded, running button audit");
  
  // Function to log button details
  function logButtonDetails(button, index, location) {
    console.log(`[AUDIT] Button #${index} in ${location}:`);
    console.log(`  - Text: "${button.textContent?.trim()}"`);
    console.log(`  - Tag: ${button.tagName}`);
    console.log(`  - Classes: ${button.className}`);
    console.log(`  - Attributes: ${Array.from(button.attributes).map(attr => `${attr.name}="${attr.value}"`).join(', ')}`);
    console.log(`  - Has click handlers: ${button.onclick !== null || button._events?.click}`);
    
    // Check if it has event listeners (limited detection)
    const hasEventListeners = button.getAttribute('onclick') || 
                              button.getAttribute('data-open-consultation') ||
                              button.hasAttribute('data-modal-fixed');
                              
    console.log(`  - Has event attributes: ${hasEventListeners ? 'Yes' : 'No'}`);
    console.log(`  - Position: ${button.getBoundingClientRect().top}px from top`);
    console.log(`  - Visible: ${isVisible(button) ? 'Yes' : 'No'}`);
  }
  
  // Function to check if an element is visible
  function isVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' && 
           element.offsetWidth > 0 && 
           element.offsetHeight > 0;
  }
  
  // Audit all buttons in the hero section
  console.log("[AUDIT] === Hero Section Buttons ===");
  const heroSection = document.querySelector('.hero-section');
  if (heroSection) {
    const heroButtons = heroSection.querySelectorAll('button, a');
    heroButtons.forEach((button, index) => {
      logButtonDetails(button, index, 'Hero Section');
    });
  } else {
    console.log("[AUDIT] No hero section found");
  }
  
  // Audit buttons at the bottom (Get Started Today section)
  console.log("[AUDIT] === Footer/Get Started Buttons ===");
  const bottomSections = document.querySelectorAll('main > div:last-of-type, main > section:last-of-type');
  bottomSections.forEach((section, sectionIndex) => {
    const buttons = section.querySelectorAll('button, a');
    buttons.forEach((button, index) => {
      logButtonDetails(button, index, `Bottom Section ${sectionIndex}`);
    });
  });

  // Fix all buttons directly to be 100% sure
  console.log("[AUDIT] Applying direct fix to critical buttons");
  
  // Direct targeting of hero button
  const heroButton = document.querySelector('.hero-section button, .hero-section a');
  if (heroButton && heroButton.textContent?.trim().includes('Book Free Consultation')) {
    console.log("[AUDIT] Found hero button, applying direct fix");
    
    // Override with direct onclick
    heroButton.setAttribute('onclick', `
      event.preventDefault(); 
      console.log('[AUDIT] Hero button clicked directly'); 
      
      const modal = document.getElementById('consultation-modal');
      if (modal) {
        modal.classList.remove('hidden');
        document.body.classList.add('modal-open');
      } else if (typeof window.showConsultationModal === 'function') {
        window.showConsultationModal();
      }
      
      return false;
    `);
    
    // Mark as fixed
    heroButton.setAttribute('data-audit-fixed', 'true');
  }
  
  // Direct targeting of Get Started Today button
  document.querySelectorAll('button, a').forEach(button => {
    const text = button.textContent?.trim();
    
    if (text === 'Schedule Free Consultation' || text === 'Book Free Consultation') {
      console.log(`[AUDIT] Found critical button: ${text}, applying direct fix`);
      
      // Override with direct onclick attribute
      button.setAttribute('onclick', `
        event.preventDefault(); 
        console.log('[AUDIT] Critical button clicked directly: ${text}'); 
        
        const modal = document.getElementById('consultation-modal');
        if (modal) {
          modal.classList.remove('hidden');
          document.body.classList.add('modal-open');
        } else if (typeof window.showConsultationModal === 'function') {
          window.showConsultationModal();
        }
        
        return false;
      `);
      
      // Mark as fixed
      button.setAttribute('data-audit-fixed', 'true');
      
      // Force style to show it's clickable
      button.style.cursor = 'pointer';
    }
  });
  
  // Add a global click listener to detect button clicks
  document.addEventListener('click', function(e) {
    const clickedElement = e.target;
    const button = clickedElement.closest('button, a');
    
    if (button) {
      const text = button.textContent?.trim();
      console.log(`[AUDIT] Element clicked: ${button.tagName} with text "${text}"`);
      
      if (text && (
        text.includes('Book Free Consultation') || 
        text.includes('Schedule Free Consultation') ||
        text.includes('Schedule Consultation') ||
        text.includes('Get Started Today')
      )) {
        console.log('[AUDIT] Consultation button click detected!');
        e.preventDefault();
        e.stopPropagation();
        
        // Direct modal manipulation
        const modal = document.getElementById('consultation-modal');
        if (modal) {
          console.log('[AUDIT] Showing modal directly');
          modal.classList.remove('hidden');
          document.body.classList.add('modal-open');
        } else if (typeof window.showConsultationModal === 'function') {
          console.log('[AUDIT] Calling showConsultationModal() function');
          window.showConsultationModal();
        } else {
          console.error('[AUDIT] No modal or showConsultationModal function found!');
        }
        
        return false;
      }
    }
  }, true); // Use capturing phase
}); 