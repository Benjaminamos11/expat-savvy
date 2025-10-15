// Relocation Modal Functionality
// This file provides the openRelocationModal function globally

async function openRelocationModal() {
  console.log('🔄 openRelocationModal called');
  
  // First, try to open the existing consultation modal
  if (typeof window.openConsultationModal === 'function') {
    console.log('✅ Found openConsultationModal, opening it');
    window.openConsultationModal();
    return;
  }
  
  // If that doesn't work, try the smart modal
  if (typeof window.openSmartModal === 'function') {
    console.log('✅ Found openSmartModal, opening it');
    window.openSmartModal();
    return;
  }
  
  // If neither works, try to load the relocation modal directly
  try {
    console.log('⚠️ No existing modal functions found, loading relocation modal');
    window.open('/relocation-modal.html', '_blank');
  } catch (error) {
    console.error('Error opening relocation modal:', error);
  }
}

// Make the function globally available
window.openRelocationModal = openRelocationModal;

console.log('✅ openRelocationModal function defined and made global');
