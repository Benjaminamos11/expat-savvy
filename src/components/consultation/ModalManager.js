/**
 * Clean Modal Management System
 * Controls modal behavior in a non-intrusive way
 */

// Whitelist of pages where the modal can appear
const ALLOWED_PAGES = [
  '/', 
  '/index.html',
  '/consultation',
  '/free-consultation',
  '/contact'
];

// Core modal functionality
export const ModalManager = {
  // Check if current page should allow modal
  isModalAllowedOnCurrentPage() {
    const path = window.location.pathname;
    return ALLOWED_PAGES.includes(path);
  },

  // Open modal only if allowed
  openModal() {
    // Only open if on allowed page
    if (!this.isModalAllowedOnCurrentPage()) {
      console.log("Modal prevented: Not allowed on this page");
      return false;
    }

    // Reference modal and open it properly
    const modal = document.getElementById('consultation-modal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.classList.add('modal-open');
      
      console.log("Modal opened on allowed page");
      return true;
    }
    return false;
  },

  // Close modal
  closeModal() {
    const modal = document.getElementById('consultation-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.classList.remove('modal-open');
      return true;
    }
    return false;
  },

  // Initialize modal with proper event handlers
  initialize() {
    // Don't proceed with initialization if on a page where modals aren't allowed
    if (!this.isModalAllowedOnCurrentPage()) {
      console.log("Modal disabled on this page");
      return;
    }

    // Setup close button
    const closeButton = document.getElementById('close-modal-btn');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.closeModal());
    }

    // Close on background click
    const modal = document.getElementById('consultation-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal();
        }
      });
    }

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });

    console.log("Modal initialized properly");
  }
};

// Export as default and expose to window
export default ModalManager;

// Make accessible to global scope
if (typeof window !== 'undefined') {
  window.ModalManager = ModalManager;
} 