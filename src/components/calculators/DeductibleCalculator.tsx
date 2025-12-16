import React, { useState, useEffect } from 'react';

const DeductibleCalculator = () => {
  const [medicalCosts, setMedicalCosts] = useState<number>(1000);
  const [bestFranchise, setBestFranchise] = useState<number>(2500);
  const [savings, setSavings] = useState<number>(0);

  const FRANCHISES = [300, 500, 1000, 1500, 2000, 2500];

  // Calculate best option whenever costs change
  useEffect(() => {
    const results = FRANCHISES.map(franchise => {
      const basePremium = 450; // Base monthly premium reference
      const discounts: Record<number, number> = {
        300: 0,
        500: 12,
        1000: 35,
        1500: 60,
        2000: 85,
        2500: 110
      };

      const premiumYearly = (basePremium - discounts[franchise]) * 12;
      let cost = premiumYearly;
      let remainingMedical = medicalCosts;

      // Apply franchise
      if (remainingMedical > franchise) {
        cost += franchise;
        remainingMedical -= franchise;

        // Apply retention (10% up to 700)
        const retention = Math.min(remainingMedical * 0.10, 700);
        cost += retention;
      } else {
        cost += remainingMedical;
      }

      return { franchise, totalCost: cost };
    }).sort((a, b) => a.totalCost - b.totalCost);

    setBestFranchise(results[0].franchise);
    // Calculate savings vs the worst option
    const worstOption = results[results.length - 1];
    setSavings(worstOption.totalCost - results[0].totalCost);
  }, [medicalCosts]);

  const costSamples = [
    { label: "GP Visit", cost: 130 },
    { label: "Specialist", cost: 200 },
    { label: "Physio", cost: 80 },
    { label: "MRI Scan", cost: 800 },
    { label: "Emergency", cost: 400 },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="p-8 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Input Section */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Estimate Your Costs</h3>

            <div className="mb-8">
              <label htmlFor="medical-costs" className="block text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                Annual Medical Expenses
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-2xl text-gray-400 font-light">CHF</span>
                <input
                  type="number"
                  id="medical-costs"
                  className="block w-full pl-16 pr-4 py-4 text-3xl font-bold text-gray-900 border-gray-200 rounded-xl focus:ring-primary-600 focus:border-primary-600 transition-colors"
                  placeholder="0"
                  value={medicalCosts}
                  onChange={(e) => setMedicalCosts(Math.max(0, Number(e.target.value)))}
                />
              </div>
            </div>

            <div className="mb-8">
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={medicalCosts > 5000 ? 5000 : medicalCosts}
                onChange={(e) => setMedicalCosts(Number(e.target.value))}
                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>CHF 0</span>
                <span>CHF 5,000+</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-900 mb-4">Quick Add:</p>
              <div className="flex flex-wrap gap-3">
                {costSamples.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMedicalCosts(prev => prev + sample.cost)}
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-sm text-gray-600 transition-all active:scale-95"
                  >
                    + {sample.label} <span className="text-gray-400 ml-1">{sample.cost}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="flex flex-col justify-center bg-gray-50 rounded-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <p className="text-gray-500 font-medium mb-2">Recommended Franchise</p>
              <div className="text-5xl font-bold text-primary-600 mb-2">
                CHF {bestFranchise}
              </div>
              <p className="text-sm text-gray-400">
                Based on your estimated costs of CHF {medicalCosts}
              </p>
            </div>

            {savings > 0 && (
              <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm text-center">
                <p className="text-gray-600">
                  Potential savings vs wrong choice:
                </p>
                <p className="text-xl font-bold text-green-600 mt-1">
                  Up to CHF {savings.toFixed(0)} / year
                </p>
              </div>
            )}

            <div className="mt-8 text-center">
              <a href="/healthcare/best-health-insurance-switzerland/" className="inline-block w-full px-6 py-3 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20">
                Compare Insurers Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeductibleCalculator;
