import { useState, useEffect } from 'react';

// Simple, working modal with all functionality
export default function FunctionalModal({ isOpen, onClose, pageIntent = 'home' }) {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    situation: '',
    complexity: 0,
    name: '',
    email: '',
    phone: ''
  });
  const [bookingData, setBookingData] = useState(null);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setUserData({ situation: '', complexity: 0, name: '', email: '', phone: '' });
        setBookingData(null);
      }, 300);
    }
  }, [isOpen]);

  // ESC key handler
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Situation options with complexity scores
  const situations = [
    { id: 'new', emoji: '🇨🇭', label: 'I just moved to Switzerland', complexity: 9 },
    { id: 'family', emoji: '👨‍👩‍👧', label: 'I need family coverage', complexity: 8 },
    { id: 'save', emoji: '💰', label: 'I want to switch and save', complexity: 8 },
    { id: 'review', emoji: '🔍', label: 'I want to review my coverage', complexity: 5 },
    { id: 'border', emoji: '🌍', label: "I'm a cross-border worker", complexity: 9 },
    { id: 'compare', emoji: '📊', label: 'Just comparing options', complexity: 3 }
  ];

  const handleSituationSelect = (situation) => {
    setUserData({ ...userData, situation: situation.id, complexity: situation.complexity });
    setStep(2);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setUserData({
      ...userData,
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone')
    });
    setStep(4); // Go to calendar
  };

  const handleCalendarBooked = () => {
    setBookingData({
      date: 'Monday, Oct 21 at 10:00 AM',
      duration: '15 minutes',
      link: 'Video call link sent via email'
    });
    setStep(5);
  };

  // Robert Header (appears on all steps)
  const RobertHeader = () => (
    <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">
      <img 
        src="https://res.cloudinary.com/dphbnwjtx/image/upload/w_64,h_64,q_95,f_webp,c_fill,g_face,e_sharpen:100/v1757251477/Generated_Image_September_07_2025_-_9_20PM_uuse1r.webp"
        alt="Robert Kolar"
        className="w-14 h-14 rounded-full border-2 border-gray-200"
      />
      <div className="flex-1">
        <h3 className="text-base font-semibold text-gray-900">Robert Kolar, FINMA Registered Advisor</h3>
        <p className="text-sm text-gray-600">🇬🇧 English • 🇩🇪 Deutsch • ⭐ 4.9/5 (500+ reviews)</p>
      </div>
    </div>
  );

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Robert Header (except step 1) */}
        {step > 1 && <RobertHeader />}

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {/* STEP 1: Qualification */}
          {step === 1 && (
            <div className="p-8 md:p-12">
              <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Find Your Best Swiss Health Insurance
              </h1>
              <p className="text-gray-600 text-center mb-8">Expert guidance from FINMA-registered advisors</p>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8 flex items-center justify-around text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>👥</span>
                  <span>12 booked today</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>💰</span>
                  <span>Avg: CHF 1,847</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⭐⭐⭐⭐⭐</span>
                  <span>4.9/5</span>
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mb-6">What brings you here today?</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {situations.map((sit) => (
                  <button
                    key={sit.id}
                    onClick={() => handleSituationSelect(sit)}
                    className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-red-500 hover:bg-red-50 transition-all text-left group"
                  >
                    <div className="text-4xl mb-3">{sit.emoji}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900 font-medium text-sm">{sit.label}</span>
                      <span className="text-gray-400 group-hover:text-red-500 text-xl transition-colors">→</span>
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-center text-sm text-gray-500 mt-8">100% free • No obligation</p>
            </div>
          )}

          {/* STEP 2: Value Demo (High Complexity) */}
          {step === 2 && userData.complexity >= 7 && (
            <div className="p-8 md:p-12">
              <button onClick={() => setStep(1)} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg mb-6">
                ← Back
              </button>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Perfect! Here's what you need to know...
              </h2>

              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">⚠️</span>
                  <h3 className="font-bold text-amber-900">IMPORTANT TO KNOW</h3>
                </div>
                <p className="text-amber-800 text-sm">
                  Most people in your situation miss key savings because they don't know the specific rules and opportunities.
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Permit type affects pricing</p>
                    <p className="text-sm text-gray-600">Different permits have access to different rates</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">3-month registration deadline</p>
                    <p className="text-sm text-gray-600">Timing impacts available discounts</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Expat-specific packages exist</p>
                    <p className="text-sm text-gray-600">Most comparison sites don't show these</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="font-bold text-blue-900 mb-2">💡 Typical Savings</h3>
                <p className="text-blue-800 text-sm">
                  <strong>CHF 1,500-2,800/year</strong> when optimized by an expert who understands your situation.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-6">How would you like to proceed?</h3>

              <div className="bg-red-500 rounded-lg p-8 mb-6 relative">
                <div className="absolute -top-3 left-6 bg-white px-4 py-1 rounded-full text-xs font-bold text-red-500">
                  ✓ RECOMMENDED
                </div>
                <div className="text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">📞</span>
                    <h3 className="text-2xl font-bold">15-Min Expert Call</h3>
                  </div>
                  <ul className="space-y-2 mb-6 text-sm opacity-95">
                    <li>• Personalized strategies for your situation</li>
                    <li>• Hidden discounts and optimization</li>
                    <li>• 2026 timeline planning</li>
                  </ul>
                  <button
                    onClick={() => setStep(3)}
                    className="w-full bg-white text-red-500 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    BOOK FREE CALL →
                  </button>
                </div>
              </div>

              <div className="text-center text-gray-400 my-4">────── or ──────</div>

              <button className="w-full border-2 border-gray-300 text-gray-600 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Get Standard Quotes (4-5 min)
              </button>
              <p className="text-center text-xs text-amber-600 mt-2">⚠️ May miss CHF 1,200+ in savings</p>
            </div>
          )}

          {/* STEP 2: Medium/Low Complexity - Simplified */}
          {step === 2 && userData.complexity < 7 && (
            <div className="p-8 md:p-12">
              <button onClick={() => setStep(1)} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg mb-6">
                ← Back
              </button>

              <h2 className="text-2xl font-semibold text-gray-900 text-center mb-8">
                Great! How would you like to proceed?
              </h2>

              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-red-500 hover:shadow-lg transition-all">
                  <div className="text-4xl mb-3">📞</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">EXPERT CALL</h3>
                  <p className="text-sm text-gray-600 mb-4">15 minutes</p>
                  <ul className="text-sm text-gray-700 space-y-2 mb-6">
                    <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Personalized</li>
                    <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Hidden discounts</li>
                    <li className="flex items-center gap-2"><span className="text-green-600">✓</span> 2026 strategy</li>
                  </ul>
                  <button
                    onClick={() => setStep(3)}
                    className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600"
                  >
                    BOOK CALL →
                  </button>
                </div>

                <div className="border-2 border-gray-200 rounded-lg p-6">
                  <div className="text-4xl mb-3">📋</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">SELF-SERVICE</h3>
                  <p className="text-sm text-gray-600 mb-4">4-5 minutes</p>
                  <ul className="text-sm text-gray-500 space-y-2 mb-6">
                    <li className="flex items-center gap-2"><span>•</span> Generic comparison</li>
                    <li className="flex items-center gap-2"><span>•</span> Public rates only</li>
                    <li className="flex items-center gap-2"><span>•</span> No personalized advice</li>
                  </ul>
                  <button className="w-full border-2 border-gray-300 text-gray-600 py-3 rounded-lg font-semibold hover:bg-gray-50">
                    GET QUOTES →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Booking Info */}
          {step === 3 && (
            <div className="p-8 md:p-12 max-w-2xl mx-auto">
              <button onClick={() => setStep(2)} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg mb-6">
                ← Back
              </button>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Perfect! Let's get you booked 🎉</h2>
              <p className="text-gray-600 mb-6">
                This will be a 15-minute call where we'll review your situation and find the best rates.
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-3">What you'll get:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Personalized recommendations</li>
                  <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Hidden discount opportunities</li>
                  <li className="flex items-center gap-2"><span className="text-green-600">✓</span> 2026 switching strategy</li>
                </ul>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Phone Number <span className="text-gray-500 font-normal">(for reminder)</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+41 79 123 4567"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-500 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-red-600 transition-colors shadow-lg"
                >
                  CONTINUE TO CALENDAR →
                </button>

                <p className="text-center text-sm text-gray-500">
                  ✓ Free & no obligation  •  ✓ Easy to reschedule
                </p>
              </form>
            </div>
          )}

          {/* STEP 4: Calendar (Cal.com Embed) */}
          {step === 4 && (
            <div className="p-8 md:p-12">
              <button onClick={() => setStep(3)} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg mb-6">
                ← Back
              </button>

              <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">Pick Your Time</h2>
              <p className="text-center text-sm text-gray-600 mb-6">Times shown in Europe/Zurich timezone</p>

              <div className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-6" style={{ minHeight: '500px' }}>
                {/* DEMO: In production, this would be Cal.com BookerEmbed */}
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 max-w-md">
                    <h3 className="text-xl font-bold text-blue-900 mb-4">📅 Calendar Integration</h3>
                    <p className="text-blue-800 mb-6">
                      In production, Cal.com calendar appears here. For demo, click below to simulate booking.
                    </p>
                    <button
                      onClick={handleCalendarBooked}
                      className="w-full bg-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-600"
                    >
                      📞 Book Monday, Oct 21 at 10:00 AM
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-center text-sm text-gray-500">
                ✓ Free  •  ✓ Video or phone  •  ✓ Easy to reschedule
              </p>
            </div>
          )}

          {/* STEP 5: Confirmation */}
          {step === 5 && (
            <div className="p-8 md:p-12 max-w-2xl mx-auto text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-4xl">✓</span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-8">Booking Confirmed! 🎉</h1>

              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 mb-8">
                <div className="space-y-3 text-gray-900">
                  <p className="flex items-center justify-center gap-3">
                    <span>📅</span>
                    <span className="font-semibold">{bookingData?.date}</span>
                  </p>
                  <p className="flex items-center justify-center gap-3">
                    <span>⏱️</span>
                    <span>{bookingData?.duration}</span>
                  </p>
                  <p className="flex items-center justify-center gap-3">
                    <span>📞</span>
                    <span className="text-sm text-gray-600">{bookingData?.link}</span>
                  </p>
                </div>
              </div>

              <div className="text-left mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">What's Next:</h3>
                <ol className="space-y-4">
                  <li className="flex gap-4">
                    <span className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</span>
                    <span className="text-gray-700">Check your email for calendar invite and call link</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</span>
                    <div className="text-gray-700">
                      <p>(Optional) Reply with quick info:</p>
                      <ul className="text-sm text-gray-600 ml-4 mt-2 space-y-1">
                        <li>• Employment status</li>
                        <li>• Coverage needed (self/family)</li>
                        <li>• Start date</li>
                      </ul>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">3</span>
                    <span className="text-gray-700">Join the call - Robert will guide you through everything!</span>
                  </li>
                </ol>
              </div>

              <div className="flex gap-4 justify-center mb-6">
                <button className="bg-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-600">
                  ADD TO CALENDAR
                </button>
                <button
                  onClick={onClose}
                  className="border-2 border-gray-300 text-gray-600 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50"
                >
                  CLOSE
                </button>
              </div>

              <p className="text-gray-600 italic">Looking forward to helping you save money! - Robert</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


