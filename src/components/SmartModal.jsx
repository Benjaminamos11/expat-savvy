import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowLeft, 
  ArrowRight, 
  MapPin, 
  Users, 
  DollarSign, 
  Scale, 
  HelpCircle, 
  Eye,
  Phone,
  Calendar,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const SmartModal = ({ isOpen, onClose, pageContext = {} }) => {
  const [currentStep, setCurrentStep] = useState('qualification');
  const [userData, setUserData] = useState({});
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  // Reset modal when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('qualification');
      setUserData({});
      setFormData({ name: '', email: '', phone: '' });
    }
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const getStepOneConfig = (pageIntent) => {
    switch(pageIntent) {
      case 'setup':
        return {
          headline: "Welcome to Switzerland!",
          subline: "You have 3 months to register. Let's get started.",
          question: "What best describes your situation?",
          highlightedOption: 'new-to-switzerland',
          badge: 'RECOMMENDED FOR YOU'
        };
      
      case 'family':
        return {
          headline: "Let's optimize your family's coverage",
          subline: "Most families save CHF 1,200-2,800 with expert help",
          question: "Tell me about your situation:",
          highlightedOption: 'family',
          badge: 'SUGGESTED FOR FAMILIES'
        };
      
      case 'change':
        return {
          headline: "Ready to switch for 2026?",
          subline: "Switching deadline is 30 November 2025",
          question: "What's your goal?",
          highlightedOption: 'switch-save',
          badge: 'POPULAR CHOICE'
        };
      
      case 'compare':
        return {
          headline: "Comparing your options?",
          subline: "Let me help you choose the right one",
          question: "What brings you here?",
          highlightedOption: 'compare-options',
          badge: 'FASTEST WAY'
        };
      
      case 'provider':
        return {
          headline: `Interested in ${pageContext.providerName || 'this provider'}?`,
          subline: "Let's see if it's the best fit for you",
          question: "What's your interest?",
          highlightedOption: 'compare-options',
          badge: 'SMART APPROACH'
        };
      
      default:
        return {
          headline: "What's your situation?",
          subline: "Personal, English-speaking advice. Free & no obligation.",
          question: "What brings you here today?",
          highlightedOption: null,
          badge: null
        };
    }
  };

  const stepConfig = getStepOneConfig(pageContext.intent || 'home');

  const qualificationOptions = [
    {
      id: 'new-to-switzerland',
      icon: MapPin,
      title: 'I just moved to Switzerland',
      score: 9
    },
    {
      id: 'family',
      icon: Users,
      title: 'I need family coverage',
      score: 8
    },
    {
      id: 'switch-save',
      icon: DollarSign,
      title: 'I want to switch and save money',
      score: 6
    },
    {
      id: 'compare-options',
      icon: Scale,
      title: "I'm comparing different options",
      score: 4
    },
    {
      id: 'have-questions',
      icon: HelpCircle,
      title: 'I have specific questions',
      score: 3
    },
    {
      id: 'just-browsing',
      icon: Eye,
      title: "I'm just browsing",
      score: 2
    }
  ];

  const handleOptionSelect = (option) => {
    setUserData({
      situation: option.id,
      complexityScore: option.score
    });
    setCurrentStep('value');
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.phone) {
      setUserData(prev => ({ ...prev, bookingData: formData }));
      setCurrentStep('success');
    }
  };

  const getValueStep = () => {
    const { complexityScore } = userData;
    if (complexityScore >= 7) return 'value-high';
    if (complexityScore >= 4) return 'value-medium';
    return 'value-low';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 lg:p-4">
      <div className="bg-white w-full h-full lg:max-w-[1200px] lg:max-h-[90vh] lg:rounded-2xl lg:h-auto overflow-y-auto relative shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 lg:p-12">
          
          {/* Step 1: Qualification */}
          {currentStep === 'qualification' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  {stepConfig.headline}
                </h2>
                <p className="text-lg text-gray-600 mb-2">
                  {stepConfig.subline}
                </p>
                <p className="text-xl font-semibold text-gray-900">
                  {stepConfig.question}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {qualificationOptions.map((option) => {
                  const IconComponent = option.icon;
                  const isHighlighted = option.id === stepConfig.highlightedOption;
                  
                  return (
                    <div
                      key={option.id}
                      onClick={() => handleOptionSelect(option)}
                      className={`relative bg-white border-2 rounded-xl p-6 cursor-pointer transition-all flex items-center gap-4 ${
                        isHighlighted
                          ? 'border-green-500 bg-gradient-to-br from-white to-green-50 shadow-lg shadow-green-500/20 scale-[1.02]'
                          : 'border-gray-200 hover:border-red-500 hover:shadow-lg'
                      }`}
                    >
                      {isHighlighted && stepConfig.badge && (
                        <div className="absolute -top-3 left-4 bg-green-500 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                          {stepConfig.badge}
                        </div>
                      )}
                      
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                        isHighlighted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{option.title}</div>
                        <div className={`font-bold ${isHighlighted ? 'text-green-500' : 'text-red-500'}`}>
                          →
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center text-sm text-gray-500">
                12 people booked a consultation today • ⭐⭐⭐⭐⭐ 4.9/5 rating
              </div>
            </div>
          )}

          {/* Step 2: Value - High Complexity */}
          {currentStep === 'value' && getValueStep() === 'value-high' && (
            <div className="space-y-8">
              <button 
                onClick={() => goToStep('qualification')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <div className="text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-green-600" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Perfect! You need expert guidance.
                </h2>
                <p className="text-lg text-gray-700 mb-8">
                  Your situation requires personalized advice. Let's book a free consultation to ensure you get the best coverage at the best price.
                </p>
                
                <button
                  onClick={() => goToStep('booking')}
                  className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
                >
                  Book Free Consultation
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Value - Medium Complexity */}
          {currentStep === 'value' && getValueStep() === 'value-medium' && (
            <div className="space-y-8">
              <button 
                onClick={() => goToStep('qualification')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  Great choice! Here are your options:
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <Phone className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-bold text-xl mb-4">Free Consultation</h3>
                  <p className="text-gray-700 mb-6">Get personalized advice and potentially save CHF 800-1,500 per year.</p>
                  <button 
                    onClick={() => goToStep('booking')}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    Book Call →
                  </button>
                </div>
                
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Scale className="w-6 h-6 text-gray-600" />
                  </div>
                  <h3 className="font-bold text-xl mb-4">Self-Service Quotes</h3>
                  <p className="text-gray-700 mb-6">Get standard quotes in 4-5 minutes.</p>
                  <button 
                    onClick={() => goToStep('booking')}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    Get Quotes →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Value - Low Complexity */}
          {currentStep === 'value' && getValueStep() === 'value-low' && (
            <div className="space-y-8">
              <button 
                onClick={() => goToStep('qualification')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  No problem! How can I help?
                </h2>
              </div>

              <div className="max-w-2xl mx-auto space-y-4">
                <div 
                  onClick={() => goToStep('booking')}
                  className="bg-white border-2 border-gray-200 rounded-xl p-6 cursor-pointer hover:border-red-500 hover:shadow-lg transition-all flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">Quick Call</h3>
                    <p className="text-gray-600">Personalized advice (15 min)</p>
                  </div>
                  <button className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                    Book Now →
                  </button>
                </div>
                
                <div 
                  onClick={() => goToStep('booking')}
                  className="bg-white border-2 border-gray-200 rounded-xl p-6 cursor-pointer hover:border-red-500 hover:shadow-lg transition-all flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Scale className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">Compare Rates</h3>
                    <p className="text-gray-600">Standard quotes (4-5 min)</p>
                  </div>
                  <button className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                    Get Quotes →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Booking Form */}
          {currentStep === 'booking' && (
            <div className="space-y-8">
              <button 
                onClick={() => goToStep('value')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Let's get you set up!
                </h2>
                <p className="text-lg text-gray-600">
                  Just a few details and we'll be in touch within 24 hours
                </p>
              </div>
              
              <form onSubmit={handleBookingSubmit} className="max-w-md mx-auto space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors" 
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors" 
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input 
                    type="tel" 
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors" 
                    placeholder="+41 XX XXX XX XX"
                  />
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors flex items-center justify-center gap-2"
                >
                  Continue to Calendar
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </div>
          )}

          {/* Step 4: Success */}
          {currentStep === 'success' && (
            <div className="text-center max-w-2xl mx-auto space-y-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900">
                Thank you!
              </h2>
              
              <p className="text-lg text-gray-700">
                Your booking request has been submitted. We'll contact you shortly to schedule your free consultation.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="font-bold text-green-900 mb-4">What happens next:</h3>
                <ul className="text-green-800 text-left space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    We'll call you within 24 hours to confirm your appointment
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    Prepare any current insurance documents
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    Get ready to potentially save CHF 800-1,500 per year
                  </li>
                </ul>
              </div>
              
              <button 
                onClick={onClose}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SmartModal;