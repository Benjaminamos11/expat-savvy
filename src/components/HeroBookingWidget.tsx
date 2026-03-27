import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  PiggyBank, 
  CheckCircle2, 
  Clock,
  User,
  Mail,
  Phone,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';

// --- Configuration & API Types ---
const API_BASE = 'https://api.cal.com/v2';

interface Topic {
  id: string;
  title: string;
  icon: React.ReactNode;
  eventTypeId: number;
  apiKey: string;
  description: string;
}

const TOPICS: Topic[] = [
  {
    id: 'health',
    title: 'Health Insurance',
    icon: <ShieldCheck className="w-6 h-6" />,
    eventTypeId: 1894802,
    apiKey: 'cal_live_02d332e8841c6f13b371ee6dd3ca7ca8',
    description: 'Lamas, Grundversicherung & VVG optimization.'
  },
  {
    id: 'life',
    title: 'Life / 3rd Pillar',
    icon: <PiggyBank className="w-6 h-6" />,
    eventTypeId: 4550098,
    apiKey: 'cal_live_8cb1d91e956c64fd591ca700ff9bc523',
    description: 'Private pension planning and tax deduction strategies.'
  }
];

const getNextDays = () => {
  const days = [];
  const now = new Date();
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    days.push({
      date: d.getDate(),
      dayName: dayNames[d.getDay()],
      fullDate: d.toISOString().split('T')[0],
      isToday: i === 0
    });
  }
  return days;
};

const HeroBookingWidget: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedTopic, setSelectedTopic] = useState<string>('health');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [days, setDays] = useState<any[]>(getNextDays());

  useEffect(() => {
    setSelectedDate(days[0].fullDate);
    setIsMounted(true);
    console.log('HeroBookingWidget Hydrated - Ready for interaction');
  }, []);

  const fetchSlots = useCallback(async (date: string, topicId: string) => {
    setIsLoadingSlots(true);
    try {
      const topic = TOPICS.find(t => t.id === topicId);
      if (!topic) return;

      const startTime = `${date}T00:00:00Z`;
      const endTime = `${date}T23:59:59Z`;

      const res = await fetch(`${API_BASE}/slots/available?eventTypeId=${topic.eventTypeId}&startTime=${startTime}&endTime=${endTime}`, {
        headers: { 'Authorization': `Bearer ${topic.apiKey}` }
      });
      const data = await res.json();
      
      const slots = data.status === 'success' ? (data.data.slots?.[date] || []) : [];
      setAvailableSlots(slots);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDate && selectedTopic && isMounted) {
      fetchSlots(selectedDate, selectedTopic);
    }
  }, [selectedDate, selectedTopic, fetchSlots, isMounted]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const topic = TOPICS.find(t => t.id === selectedTopic);
      if (!topic) return;
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${topic.apiKey}`,
          'Content-Type': 'application/json',
          'cal-api-version': '2024-08-13'
        },
        body: JSON.stringify({
          eventTypeId: topic.eventTypeId,
          start: selectedSlot,
          responses: {
            name: formData.name,
            email: formData.email,
            location: { value: formData.phone, optionValue: "" }
          },
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: 'en'
        })
      });
      if (res.ok) alert('Booking confirmed! We will contact you soon.');
      else alert('Booking failed. Please try again or contact us directly.');
    } catch (err) {
      alert('Error connecting to booking service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="bg-white rounded-[2rem] shadow-2xl min-h-[700px] flex flex-col items-center justify-center border border-slate-100 p-8 text-center">
        <div className="animate-spin text-red-600 text-6xl mb-6">⌛</div>
        <p className="text-xl font-black text-red-600 uppercase tracking-widest">Stabilizing React 19...</p>
        <p className="text-xs text-slate-400 mt-4 font-medium">If you see this, the cache was successfully broken.</p>
      </div>
    );
  }

  return (
    <div id="hero-booking-widget-root" className="bg-white rounded-[2rem] shadow-2xl overflow-hidden text-slate-900 border border-slate-100 flex flex-col min-h-[700px]">
      <div className="px-8 pt-10 pb-6 border-b border-gray-50 flex items-center justify-between relative bg-slate-50/50">
        <div className="flex flex-col items-center relative z-10">
          <div className={`w-9 h-9 rounded-full ${step >= 1 ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-slate-300 border'} flex items-center justify-center font-bold text-sm mb-2 transition-all`}>1</div>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${step >= 1 ? 'text-red-600' : 'text-slate-400'}`}>Booking</span>
        </div>
        <div className="flex-1 h-[2px] mx-4 bg-slate-100 relative top-[-10px]">
          <div className={`h-full bg-red-600 transition-all duration-500 ${step === 2 ? 'w-full' : 'w-0'}`}></div>
        </div>
        <div className="flex flex-col items-center relative z-10">
          <div className={`w-9 h-9 rounded-full ${step >= 2 ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-slate-300 border'} flex items-center justify-center font-bold text-sm mb-2 transition-all`}>2</div>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${step >= 2 ? 'text-red-600' : 'text-slate-400'}`}>Details</span>
        </div>
        <div className="absolute top-4 right-8 flex items-center gap-1.5 py-1 px-2.5 bg-red-50 rounded-full border border-red-100">
          <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
          <span className="text-[9px] font-bold text-red-700 uppercase tracking-tighter">Availability <span className="opacity-60 font-medium">Realtime • Live</span></span>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        {step === 1 ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">1. Choose your consultation topic</h2>
              <div className="grid grid-cols-2 gap-4 mt-6">
                {TOPICS.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left cursor-pointer group hover:shadow-xl hover:-translate-y-1 ${
                      selectedTopic === topic.id 
                        ? 'border-red-600 bg-red-50/30 ring-4 ring-red-100 shadow-lg' 
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${selectedTopic === topic.id ? 'bg-red-600 text-white shadow-md' : 'bg-red-50 text-red-600'}`}>
                      {topic.icon}
                    </div>
                    <div className="font-bold text-slate-900 mb-1 flex items-center justify-between">
                      {topic.title}
                      {selectedTopic === topic.id && <CheckCircle2 className="w-4 h-4 text-red-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{topic.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">2. Select a preferred time</h2>
              <div className="flex justify-between mt-6 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                {days.map((d) => (
                  <button
                    key={d.fullDate}
                    onClick={() => setSelectedDate(d.fullDate)}
                    className={`flex flex-col items-center justify-center w-12 py-3 rounded-xl transition-all cursor-pointer hover:shadow-md ${
                      selectedDate === d.fullDate 
                        ? 'bg-white text-red-600 shadow-sm ring-1 ring-slate-200 font-bold scale-110' 
                        : 'text-slate-400 hover:bg-white hover:text-slate-600'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest mb-1">{d.dayName}</span>
                    <span className="text-base font-black">{d.date}</span>
                    {d.isToday && <div className="w-1 h-1 bg-red-600 rounded-full mt-1"></div>}
                  </button>
                ))}
              </div>

              <div className="mt-6 min-h-[140px] relative">
                {isLoadingSlots ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 rounded-2xl">
                    <Loader2 className="w-10 h-10 animate-spin text-red-600 mb-3" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Checking Availability...</span>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 px-1">
                    {availableSlots.slice(0, 12).map((slot) => {
                      const time = new Date(slot.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      return (
                        <button
                          key={slot.time}
                          onClick={() => setSelectedSlot(slot.time)}
                          className={`py-3 px-2 rounded-xl border text-sm font-bold transition-all cursor-pointer hover:shadow-md ${
                            selectedSlot === slot.time 
                              ? 'bg-red-600 border-red-600 text-white shadow-lg scale-105' 
                              : 'bg-white border-slate-100 text-slate-600 hover:border-red-200 hover:text-red-600'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                    <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm font-medium italic">No availability for this day.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <form id="booking-form" onSubmit={handleBooking} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">3. Confirm your details</h2>
            <div className="space-y-4">
              <div className="group">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1 transition-colors group-focus-within:text-red-600">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-red-500 transition-colors" />
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-600 transition-all font-medium"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div className="group">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1 transition-colors group-focus-within:text-red-600">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-red-500 transition-colors" />
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-600 transition-all font-medium"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="group">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1 transition-colors group-focus-within:text-red-600">Phone Number (Mobile)</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-red-500 transition-colors" />
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-600 transition-all font-medium"
                    placeholder="+41 7x xxx xx xx"
                  />
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      <div className="p-8 pt-4 border-t border-slate-50 bg-slate-50/50">
        {step === 1 ? (
          <button
            onClick={() => setStep(2)}
            disabled={!selectedSlot}
            className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer group ${
              selectedSlot 
                ? 'bg-red-600 text-white hover:bg-red-700 hover:shadow-red-200 transform hover:-translate-y-1 active:translate-y-0' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50 grayscale'
            }`}
          >
            Next: Enter Contact Details
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        ) : (
          <div className="grid grid-cols-5 gap-3">
            <button
              onClick={() => setStep(1)}
              className="col-span-1 py-5 rounded-2xl font-bold text-slate-400 bg-white border border-slate-100 hover:bg-slate-50 hover:text-slate-600 transition-all flex items-center justify-center cursor-pointer shadow-sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              form="booking-form"
              type="submit"
              disabled={isSubmitting}
              className="col-span-4 py-5 rounded-2xl bg-red-600 text-white font-black text-lg shadow-xl shadow-red-200 hover:bg-red-700 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Free Booking'}
            </button>
          </div>
        )}
        <p className="text-center text-[10px] text-slate-400 mt-6 font-medium uppercase tracking-[0.2em]">Live Session • 100% Free • No obligation</p>
      </div>
    </div>
  );
};

export default HeroBookingWidget;
