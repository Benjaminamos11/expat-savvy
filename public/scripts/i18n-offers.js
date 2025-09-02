/**
 * i18n Utility for OffersModal
 * Simple internationalization support for English, German, French, Italian
 */

const i18nStrings = {
  'en-CH': {
    // Headlines by intent
    'headline.home': 'Find Your Best Swiss Health Insurance in Minutes',
    'headline.setup': 'Set Up Your Swiss Health Insurance (Step by Step)',
    'headline.change': 'Switch Your Swiss Health Insurance for 2026',
    'headline.cheapest': 'Cheapest 2026 Options for Your Canton',
    'headline.best': 'Best Health Insurance for Expats — 2026 Guide',
    'headline.provider': '{provider} Rate + 2 Alternatives for 2026',
    'headline.comparison': '{providerA} vs {providerB} — Compare 2026 Rates and 1 Smart Alternative',
    
    // Common
    'subline': 'Personal, English-speaking advice. Free & no obligation.',
    'social_proof': '{count} people booked consultations in the last 24 hours',
    
    // CTAs
    'cta.get_offers': 'Get 3 Best Offers',
    'cta.get_offers_helper': 'Takes ~1 min',
    'cta.consultation': 'Book Free Consultation',
    'cta.consultation_helper': '30–60 min video call',
    
    // Steps
    'step.location.title': 'Where & Who',
    'step.location.subtitle': 'Help us find the best options for your location',
    'step.personal.title': 'Personal Details',
    'step.personal.subtitle': 'Birth dates and employment status',
    'step.insurance.title': 'Basic Insurance',
    'step.insurance.subtitle': 'Your coverage preferences',
    'step.supplementary.title': 'Supplementary Needs',
    'step.supplementary.subtitle': 'Rate importance (1 = not important, 5 = very important)',
    'step.contact.title': 'Contact & Consent',
    'step.contact.subtitle': 'How to send your personalized offers',
    
    // Forms
    'form.postcode': 'Swiss Postcode',
    'form.postcode_help': '4-digit Swiss postcode',
    'form.household': 'Household',
    'form.household.single': 'Single',
    'form.household.single_desc': 'Just me',
    'form.household.couple': 'Couple',
    'form.household.couple_desc': 'Me + partner',
    'form.household.family': 'Family with children',
    'form.household.family_desc': 'Parents + kids',
    'form.name': 'Full Name',
    'form.email': 'Email Address',
    'form.phone': 'Phone (optional)',
    'form.deductible': 'Annual Deductible',
    'form.model': 'Insurance Model',
    'form.consent': 'I agree to be contacted with my 3 offers. Consultations are free, independent & in English. We are a FINMA-registered broker and may receive commissions. No obligation.',
    
    // Confirmation
    'confirmation.title': 'Thank you! Your 3 tailored offers are on the way 🚀',
    'confirmation.subtitle': 'We\'ll prepare your comparison and send it to {email} within 24 hours.',
    'confirmation.urgency': 'Switch by 30 Nov 2025 for a 1 Jan 2026 start.',
    
    // Navigation
    'nav.back': '← Back',
    'nav.next': 'Next',
    'nav.start': 'Start',
    'nav.submit': 'Submit',
    'nav.close': 'Close',
    
    // Validation
    'validation.postcode': 'Please enter a valid 4-digit Swiss postcode',
    'validation.household': 'Please select your household type',
    'validation.dob': 'Please enter all birth dates',
    'validation.dob_invalid': 'Please enter valid birth dates',
    'validation.name': 'Please enter your full name',
    'validation.email': 'Please enter a valid email address',
    'validation.consent': 'Please agree to be contacted with your offers',
    'validation.required': 'Please fill in all required fields',
  },
  
  'de-CH': {
    // Headlines by intent
    'headline.home': 'Finden Sie Ihre beste Schweizer Krankenversicherung in Minuten',
    'headline.setup': 'Richten Sie Ihre Schweizer Krankenversicherung ein (Schritt für Schritt)',
    'headline.change': 'Wechseln Sie Ihre Schweizer Krankenversicherung für 2026',
    'headline.cheapest': 'Günstigste Optionen 2026 für Ihren Kanton',
    'headline.best': 'Beste Krankenversicherung für Expats — Leitfaden 2026',
    'headline.provider': '{provider} Tarif + 2 Alternativen für 2026',
    'headline.comparison': '{providerA} vs {providerB} — Vergleich 2026 Tarife und 1 intelligente Alternative',
    
    // Common
    'subline': 'Persönliche, englischsprachige Beratung. Kostenlos & unverbindlich.',
    'social_proof': '{count} Personen haben in den letzten 24 Stunden Beratungen gebucht',
    
    // Continue with German translations...
    'cta.get_offers': '3 beste Angebote erhalten',
    'cta.get_offers_helper': 'Dauert ~1 Min',
    'cta.consultation': 'Kostenlose Beratung buchen',
    'cta.consultation_helper': '30–60 Min Videoanruf',
    
    // Add more German translations as needed
  },
  
  'fr-CH': {
    // Headlines by intent
    'headline.home': 'Trouvez votre meilleure assurance maladie suisse en minutes',
    'headline.setup': 'Configurez votre assurance maladie suisse (étape par étape)',
    'headline.change': 'Changez votre assurance maladie suisse pour 2026',
    'headline.cheapest': 'Options les moins chères 2026 pour votre canton',
    'headline.best': 'Meilleure assurance maladie pour expatriés — Guide 2026',
    'headline.provider': 'Tarif {provider} + 2 alternatives pour 2026',
    'headline.comparison': '{providerA} vs {providerB} — Comparer les tarifs 2026 et 1 alternative intelligente',
    
    // Common
    'subline': 'Conseil personnel en anglais. Gratuit et sans engagement.',
    'social_proof': '{count} personnes ont réservé des consultations au cours des dernières 24 heures',
    
    // CTAs
    'cta.get_offers': 'Obtenir 3 meilleures offres',
    'cta.get_offers_helper': 'Prend ~1 min',
    'cta.consultation': 'Réserver consultation gratuite',
    'cta.consultation_helper': '30–60 min appel vidéo',
    
    // Add more French translations as needed
  },
  
  'it-CH': {
    // Headlines by intent
    'headline.home': 'Trova la tua migliore assicurazione malattia svizzera in minuti',
    'headline.setup': 'Configura la tua assicurazione malattia svizzera (passo dopo passo)',
    'headline.change': 'Cambia la tua assicurazione malattia svizzera per il 2026',
    'headline.cheapest': 'Opzioni più economiche 2026 per il tuo cantone',
    'headline.best': 'Migliore assicurazione malattia per expat — Guida 2026',
    'headline.provider': 'Tariffa {provider} + 2 alternative per il 2026',
    'headline.comparison': '{providerA} vs {providerB} — Confronta tariffe 2026 e 1 alternativa intelligente',
    
    // Common
    'subline': 'Consulenza personale in inglese. Gratuita e senza impegno.',
    'social_proof': '{count} persone hanno prenotato consultazioni nelle ultime 24 ore',
    
    // CTAs
    'cta.get_offers': 'Ottieni 3 migliori offerte',
    'cta.get_offers_helper': 'Richiede ~1 min',
    'cta.consultation': 'Prenota consultazione gratuita',
    'cta.consultation_helper': '30–60 min videochiamata',
    
    // Add more Italian translations as needed
  }
};

// Simple i18n utility
class I18n {
  constructor(locale = 'en-CH') {
    this.locale = locale;
    this.strings = i18nStrings[locale] || i18nStrings['en-CH'];
  }
  
  // Get translated string with placeholder replacement
  t(key, params = {}) {
    let string = this.strings[key] || key;
    
    // Replace placeholders
    Object.keys(params).forEach(param => {
      string = string.replace(new RegExp(`{${param}}`, 'g'), params[param]);
    });
    
    return string;
  }
  
  // Get locale-specific formatting
  formatDate(date) {
    return new Intl.DateTimeFormat(this.locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }
  
  // Detect locale from browser or URL
  static detectLocale() {
    // Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && i18nStrings[urlLang]) {
      return urlLang;
    }
    
    // Check browser language
    const browserLang = navigator.language || navigator.languages?.[0];
    if (browserLang) {
      // Swiss-specific locales
      if (browserLang.startsWith('de') && browserLang.includes('CH')) return 'de-CH';
      if (browserLang.startsWith('fr') && browserLang.includes('CH')) return 'fr-CH';
      if (browserLang.startsWith('it') && browserLang.includes('CH')) return 'it-CH';
      
      // Fall back to language without country
      if (browserLang.startsWith('de')) return 'de-CH';
      if (browserLang.startsWith('fr')) return 'fr-CH';
      if (browserLang.startsWith('it')) return 'it-CH';
    }
    
    // Default to English
    return 'en-CH';
  }
}

// Global instance
window.i18n = new I18n(I18n.detectLocale());

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { I18n, i18nStrings };
}
