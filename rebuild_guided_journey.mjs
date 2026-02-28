import fs from 'fs';

const filePath = 'src/pages/guides/how-to/relocate-to-switzerland-step-by-step-checklist.astro';
const originalFile = fs.readFileSync(filePath, 'utf-8');

// The replacement starts from <!-- Modern Timeline Container --> and ends right before <!-- Key Facts / Checklists Overview -->
const startMarker = '<!-- Modern Timeline Container -->';
const endMarker = '<!-- Key Facts / Checklists Overview -->';

const startIndex = originalFile.indexOf(startMarker);
const endIndex = originalFile.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.error("Markers not found!");
    process.exit(1);
}

const beforeContent = originalFile.substring(0, startIndex);
const afterContent = originalFile.substring(endIndex);

const newLayout = `
  <!-- Guided Journey Layout -->
  <section class="py-16 md:py-24 bg-white relative">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-16 items-start">
        
        <!-- Sticky Sidebar TOC -->
        <div class="lg:col-span-1 sticky top-28 hidden lg:block">
          <div class="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 class="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 pb-4">Journey Overview</h3>
            <ul class="space-y-6">
              <li>
                <a href="#phase-1" class="flex gap-4 items-center group text-slate-600 hover:text-primary-600 transition-colors">
                  <span class="w-10 h-10 rounded-full bg-white border-2 border-slate-100 shadow-sm flex flex-shrink-0 items-center justify-center font-bold text-sm group-hover:border-primary-200 group-hover:text-primary-600 transition-colors">1</span>
                  <span class="font-bold leading-tight">Pre-Departure<br><span class="text-xs font-medium text-slate-400">Months 1-3</span></span>
                </a>
              </li>
              <li>
                <a href="#phase-2" class="flex gap-4 items-center group text-slate-600 hover:text-primary-600 transition-colors">
                  <span class="w-10 h-10 rounded-full bg-white border-2 border-slate-100 shadow-sm flex flex-shrink-0 items-center justify-center font-bold text-sm group-hover:border-primary-200 group-hover:text-primary-600 transition-colors">2</span>
                  <span class="font-bold leading-tight">Arrival & Setup<br><span class="text-xs font-medium text-slate-400">First 14 Days</span></span>
                </a>
              </li>
              <li>
                <a href="#phase-3" class="flex gap-4 items-center group text-slate-600 hover:text-primary-600 transition-colors">
                  <span class="w-10 h-10 rounded-full bg-white border-2 border-slate-100 shadow-sm flex flex-shrink-0 items-center justify-center font-bold text-sm group-hover:border-primary-200 group-hover:text-primary-600 transition-colors">3</span>
                  <span class="font-bold leading-tight">The 90-Day Deadline<br><span class="text-xs font-medium text-slate-400">Administration</span></span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <!-- Main Content Column -->
        <div class="lg:col-span-3">
          
          <div class="relative border-l-2 border-slate-200 pl-8 md:pl-16 pb-12 ml-4 lg:ml-0">
            
            {/* Phase 1: Pre-Departure */}
            <div id="phase-1" class="relative mb-24 scroll-mt-32">
               <div class="absolute -left-[2.85rem] md:-left-[4.85rem] top-0 w-16 h-16 rounded-2xl bg-slate-900 border-4 border-white text-white flex items-center justify-center text-3xl shadow-xl shadow-slate-900/20 z-10">
                  ✈️
               </div>
               <h2 class="text-3xl md:text-5xl font-black text-slate-900 mb-4 pt-1">Phase 1: Pre-Departure</h2>
               <p class="text-xl text-slate-500 font-medium mb-12">Strategic planning before you leave your home country.</p>
               
               <div class="space-y-16 relative">
                 {steps.slice(0, 6).map((step, idx) => (
                    <div class="relative group">
                       <div class="absolute -left-[2.4rem] md:-left-[4.4rem] top-1 w-6 h-6 rounded-full bg-white border-4 border-slate-200 group-hover:border-primary-500 group-hover:scale-125 transition-all z-10"></div>
                       <div class="prose prose-lg max-w-none prose-h3:text-2xl prose-h3:font-bold prose-h3:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed">
                          <h3>{idx + 1}. {step.name}</h3>
                          <p>{step.text}</p>
                       </div>

                       {step.name === "Accommodation Research & Initial Search" && (
                          <div class="mt-8 bg-slate-50 border border-slate-200 p-8 rounded-2xl shadow-sm relative overflow-hidden group/callout">
                            <div class="absolute top-0 left-0 bg-red-600 text-white text-xs font-black uppercase tracking-widest px-4 py-1 rounded-br-xl">Expert Tip</div>
                            <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600"></div>
                            <h4 class="text-2xl font-black text-slate-900 mt-6 mb-3">How to Beat the 0.06% Vacancy Rate</h4>
                            <p class="text-lg text-slate-700 leading-relaxed font-medium mb-8">
                              Standard portals are out of date by the time you click. For VIP corporate service, compare verified agencies at <a href="https://relofinder.ch" class="text-red-600 font-bold hover:underline">ReloFinder.ch</a>. For DIY off-market 'Nachmieter' apartments (takeover leases), bypass the public portals entirely using <a href="https://www.offlist.ch" class="text-red-600 font-bold hover:underline">Offlist.ch</a>.
                            </p>
                            <div class="flex flex-col sm:flex-row gap-4">
                               <a href="https://relofinder.ch" target="_blank" class="inline-flex items-center justify-center px-6 py-4 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition-colors group/btn">
                                  Compare VIP Agencies
                                  <svg class="ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                               </a>
                               <a href="https://www.offlist.ch" target="_blank" class="inline-flex items-center justify-center px-6 py-4 bg-white border-2 border-slate-200 text-slate-900 font-black rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors group/btn2">
                                  Search Off-Market
                                  <svg class="ml-2 w-5 h-5 opacity-40 group-hover/btn2:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                               </a>
                            </div>
                          </div>
                       )}
                    </div>
                 ))}
               </div>
            </div>

            {/* Phase 2: Arrival */}
            <div id="phase-2" class="relative mb-24 scroll-mt-32">
               <div class="absolute -left-[2.85rem] md:-left-[4.85rem] top-0 w-16 h-16 rounded-2xl bg-slate-900 border-4 border-white text-white flex items-center justify-center text-3xl shadow-xl shadow-slate-900/20 z-10">
                  📍
               </div>
               <h2 class="text-3xl md:text-5xl font-black text-slate-900 mb-4 pt-1">Phase 2: Arrival & Setup</h2>
               <p class="text-xl text-slate-500 font-medium mb-12">First 14 Days. Critical administration steps upon landing on Swiss soil.</p>
               
               <div class="space-y-16 relative">
                 {steps.slice(6, 9).map((step, idx) => (
                    <div class="relative group">
                       <div class="absolute -left-[2.4rem] md:-left-[4.4rem] top-1 w-6 h-6 rounded-full bg-white border-4 border-slate-200 group-hover:border-primary-500 group-hover:scale-125 transition-all z-10"></div>
                       <div class="prose prose-lg max-w-none prose-h3:text-2xl prose-h3:font-bold prose-h3:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed">
                          <h3>{idx + 7}. {step.name}</h3>
                          <p>{step.text}</p>
                       </div>
                    </div>
                 ))}
               </div>
            </div>

            {/* Phase 3: 90 Days */}
            <div id="phase-3" class="relative scroll-mt-32">
               <div class="absolute -left-[2.85rem] md:-left-[4.85rem] top-0 w-16 h-16 rounded-2xl bg-slate-900 border-4 border-white text-white flex items-center justify-center text-3xl shadow-xl shadow-slate-900/20 z-10">
                  🛡️
               </div>
               <h2 class="text-3xl md:text-5xl font-black text-slate-900 mb-4 pt-1">Phase 3: The 90-Day Deadline</h2>
               <p class="text-xl text-slate-500 font-medium mb-12">Finalizing your legal protection and financial infrastructure.</p>
               
               <div class="space-y-16 relative">
                 {steps.slice(9, 14).map((step, idx) => (
                    <div class="relative group">
                       <div class="absolute -left-[2.4rem] md:-left-[4.4rem] top-1 w-6 h-6 rounded-full bg-white border-4 border-slate-200 group-hover:border-primary-500 group-hover:scale-125 transition-all z-10"></div>
                       <div class="prose prose-lg max-w-none prose-h3:text-2xl prose-h3:font-bold prose-h3:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed">
                          <h3>{idx + 10}. {step.name}</h3>
                          <p>{step.text}</p>
                       </div>

                       {step.name === "Obtain Mandatory Swiss Health Insurance" && (
                          <div class="mt-8 bg-slate-50 border border-slate-200 p-8 rounded-2xl shadow-sm relative overflow-hidden group/callout">
                            <div class="absolute top-0 left-0 bg-red-600 text-white text-xs font-black uppercase tracking-widest px-4 py-1 rounded-br-xl">Expert Tip</div>
                            <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600"></div>
                            <h4 class="text-2xl font-black text-slate-900 mt-6 mb-3">The 90-Day Legal Deadline</h4>
                            <p class="text-lg text-slate-700 leading-relaxed font-medium mb-8">
                              Health insurance is mandatory. If you miss the 90-day deadline, authorities will force-assign you to a random provider and backdate your premiums with a massive penalty surcharge. Don't risk it.
                            </p>
                            <div class="flex flex-col sm:flex-row gap-4">
                                <button onclick="window.openHealthModal('relocation')" class="inline-flex items-center justify-center px-8 py-4 bg-red-600 text-white font-black rounded-xl shadow-lg shadow-red-600/20 hover:-translate-y-1 hover:shadow-xl hover:bg-red-700 transition-all group/btn">
                                  Start Free Health Assessment
                                  <svg class="ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                                </button>
                            </div>
                          </div>
                       )}
                    </div>
                 ))}
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </section>

  `;

const fullNewFile = beforeContent + newLayout + afterContent;
fs.writeFileSync(filePath, fullNewFile);
console.log("Guided Journey Rebuild Complete.");
