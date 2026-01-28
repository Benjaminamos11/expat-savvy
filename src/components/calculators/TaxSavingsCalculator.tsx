import React, { useState, useEffect } from 'react';

const cantons = [
    'Aargau', 'Appenzell Ausserrhoden', 'Appenzell Innerrhoden', 'Basel-Landschaft',
    'Basel-Stadt', 'Bern', 'Fribourg', 'Geneva', 'Glarus', 'Graubünden', 'Jura',
    'Lucerne', 'Neuchâtel', 'Nidwalden', 'Obwalden', 'Schaffhausen', 'Schwyz',
    'Solothurn', 'St. Gallen', 'Thurgau', 'Ticino', 'Uri', 'Valais', 'Vaud',
    'Zug', 'Zurich'
];

// High-tax and low-tax canton adjustments
const highTaxCantons = ['Geneva', 'Vaud', 'Bern', 'Neuchâtel', 'Jura', 'Basel-Stadt'];
const lowTaxCantons = ['Zug', 'Schwyz', 'Nidwalden', 'Obwalden', 'Uri'];

const TaxSavingsCalculator = () => {
    // Individual state hooks (proven pattern)
    const [contribution, setContribution] = useState<number>(7056);
    const [canton, setCanton] = useState<string>('Zurich');
    const [income, setIncome] = useState<number>(120000);
    const [maritalStatus, setMaritalStatus] = useState<'single' | 'married'>('single');
    const [savings, setSavings] = useState<number>(1411);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [submitted, setSubmitted] = useState<boolean>(false);

    // Recalculate savings whenever inputs change
    useEffect(() => {
        console.log('TaxSavingsCalculator useEffect triggered:', { contribution, canton, income, maritalStatus });

        // Base marginal tax rate estimation
        let marginalRate = 0.15;

        // Income progression
        if (income > 80000) marginalRate += 0.05;
        if (income > 120000) marginalRate += 0.05;
        if (income > 180000) marginalRate += 0.05;

        // Canton adjustment
        if (highTaxCantons.includes(canton)) marginalRate += 0.05;
        if (lowTaxCantons.includes(canton)) marginalRate -= 0.03;

        // Marriage adjustment
        if (maritalStatus === 'married') marginalRate -= 0.02;

        // Cap reasonable range (10% - 40%)
        marginalRate = Math.max(0.10, Math.min(0.40, marginalRate));

        const newSavings = Math.round(contribution * marginalRate);
        console.log('Calculated savings:', newSavings, 'marginalRate:', marginalRate);
        setSavings(newSavings);
    }, [contribution, canton, income, maritalStatus]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 }).format(val);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row">
                {/* Left Side: Inputs */}
                <div className="p-8 lg:p-12 bg-gray-50 lg:w-1/2 space-y-8">
                    {/* Contribution Amount */}
                    <div>
                        <label className="block text-gray-700 font-bold mb-3 text-lg">Contribution Amount</label>
                        <div className="flex items-center gap-4 mb-2">
                            <input
                                type="number"
                                value={contribution}
                                onChange={(e) => setContribution(Math.max(0, Number(e.target.value)))}
                                className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C41E3A] focus:border-[#C41E3A] outline-none font-bold text-gray-900"
                            />
                            <span className="text-gray-500">CHF</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="36288"
                            step="100"
                            value={contribution}
                            onChange={(e) => setContribution(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#C41E3A]"
                        />
                        <div className="flex gap-2 mt-3">
                            <button
                                type="button"
                                onClick={() => setContribution(7056)}
                                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-full hover:border-[#C41E3A] hover:text-[#C41E3A] transition"
                            >
                                Max 3a (Employed)
                            </button>
                            <button
                                type="button"
                                onClick={() => setContribution(35280)}
                                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-full hover:border-[#C41E3A] hover:text-[#C41E3A] transition"
                            >
                                Max 3a (Self-Employed)
                            </button>
                        </div>
                    </div>

                    {/* Canton Selection */}
                    <div>
                        <label className="block text-gray-700 font-bold mb-3 text-lg">Canton of Residence</label>
                        <select
                            value={canton}
                            onChange={(e) => setCanton(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C41E3A] focus:border-[#C41E3A] outline-none bg-white"
                        >
                            {cantons.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {/* Income Slider */}
                    <div>
                        <label className="block text-gray-700 font-bold mb-3 text-lg">Annual Gross Income (CHF)</label>
                        <div className="mb-2 font-bold text-gray-900 text-xl">{formatCurrency(income)}</div>
                        <input
                            type="range"
                            min="50000"
                            max="500000"
                            step="5000"
                            value={income}
                            onChange={(e) => setIncome(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#C41E3A]"
                        />
                    </div>

                    {/* Marital Status */}
                    <div>
                        <label className="block text-gray-700 font-bold mb-3 text-lg">Marital Status</label>
                        <div className="flex gap-6">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="marital"
                                    checked={maritalStatus === 'single'}
                                    onChange={() => setMaritalStatus('single')}
                                    className="w-5 h-5 text-[#C41E3A] focus:ring-[#C41E3A]"
                                />
                                <span className="ml-2 text-gray-700 text-lg">Single</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="marital"
                                    checked={maritalStatus === 'married'}
                                    onChange={() => setMaritalStatus('married')}
                                    className="w-5 h-5 text-[#C41E3A] focus:ring-[#C41E3A]"
                                />
                                <span className="ml-2 text-gray-700 text-lg">Married</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right Side: Outputs */}
                <div className="p-8 lg:p-12 bg-white lg:w-1/2 flex flex-col justify-between relative">
                    <div className="absolute top-0 right-0 w-2 h-full bg-[#C41E3A]/5 hidden lg:block"></div>

                    <div>
                        <h3 className="text-gray-500 font-medium uppercase tracking-wider text-sm mb-1">Estimated Annual Tax Savings</h3>
                        <div className="text-5xl lg:text-6xl font-extrabold text-[#C41E3A] mb-2 tracking-tight">
                            {formatCurrency(savings)}
                        </div>
                        <div className="text-gray-500 mb-8 pb-8 border-b border-gray-100">
                            ≈ {formatCurrency(Math.round(savings / 12))} / month in your pocket
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-semibold text-gray-700">Pillar 3a Savings</span>
                                    <span className="font-bold text-[#C41E3A]">{formatCurrency(savings)}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                                    <div className="bg-[#C41E3A] h-4 rounded-full" style={{ width: '100%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-semibold text-gray-400">Pillar 3b Savings</span>
                                    <span className="font-medium text-gray-400">CHF 0.00</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                                    <div className="bg-gray-300 h-4 rounded-full" style={{ width: '1%' }}></div>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Pillar 3b contributions are generally not tax deductible.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 bg-[#F5E6E8] p-6 rounded-xl border border-[#C41E3A]/10">
                        <h4 className="font-bold text-gray-900 mb-2">Get Your Personalized Recommendation</h4>
                        <p className="text-sm text-gray-600 mb-4">
                            Our experts can help you choose the best provider to reinvest these savings for maximum growth.
                        </p>

                        {!showForm && !submitted && (
                            <button
                                type="button"
                                onClick={() => setShowForm(true)}
                                className="w-full py-4 bg-[#C41E3A] text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition-all transform hover:-translate-y-1"
                            >
                                Send My Results & Get Strategy
                            </button>
                        )}

                        {showForm && !submitted && (
                            <form className="space-y-3" onSubmit={handleSubmit}>
                                <input type="email" placeholder="Email Address" className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[#C41E3A]" required />
                                <input type="tel" placeholder="Phone Number (Optional)" className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[#C41E3A]" />
                                <label className="flex items-start gap-2 text-xs text-gray-600">
                                    <input type="checkbox" className="mt-1 text-[#C41E3A] focus:ring-[#C41E3A]" defaultChecked />
                                    Yes, I want a free consultation to discuss my strategy.
                                </label>
                                <button type="submit" className="w-full py-3 bg-[#C41E3A] text-white font-bold rounded-lg hover:bg-red-700 transition">
                                    Send Info
                                </button>
                            </form>
                        )}

                        {submitted && (
                            <div className="text-center py-4">
                                <div className="text-green-600 font-bold text-lg mb-2">✓ Request Sent!</div>
                                <p className="text-gray-600 text-sm">We'll contact you shortly with personalized recommendations.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaxSavingsCalculator;
