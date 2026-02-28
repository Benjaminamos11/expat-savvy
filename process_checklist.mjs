import fs from 'fs';

const originalFile = fs.readFileSync('src/pages/guides/how-to/relocate-to-switzerland-step-by-step-checklist.astro', 'utf-8');
const timelineFile = fs.readFileSync('src/pages/guides/how-to/relocate-to-switzerland-step-by-step-checklist.timeline.astro', 'utf-8');

// 1. Extract phases from timeline
const phasesMatch = timelineFile.match(/const phases = \[\s*\{[\s\S]*?\}\s*\];/);
const phasesCode = phasesMatch ? phasesMatch[0] : '';

// 2. We will inject phases right before `// Define the steps for the how-to guide`
let newFrontmatter = originalFile.replace(/\/\/ Define the steps for the how-to guide/, phasesCode + '\n\n// Define the steps for the how-to guide');

// 3. Extract Hero, Timeline, FAQ, Trust Bar, and CTA bounds from timeline
const heroStart = timelineFile.indexOf('<!-- Premium Hero Section -->');
const heroCode = timelineFile.slice(heroStart); // grabs everything to the end

// Let's build the new Body Content
// We want:
// - <Layout> and <Schema> from original
// - Premium Hero
// - Modern Timeline Container
// - The 14 Steps Container (Styled)
// - Key Facts (Styled)
// - High-Convert FAQ Section (Iterating over original FAQS)
// - Trust Bar
// - Epic Final CTA
// - <style> tags from timeline

// We will construct this manually to ensure it's perfect.

const finalBody = `
  <!-- Premium Hero Section -->
  <section class="relative bg-slate-900 pt-24 pb-32 overflow-hidden">
    <div class="absolute inset-0 opacity-20 pointer-events-none">
       <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_20%,#dc2626_0%,transparent_50%)]"></div>
    </div>
    
    <div class="max-w-5xl mx-auto px-4 relative z-10 text-center">
      <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-semibold mb-8 animate-fade-in">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
        </span>
        <span>Relocation Roadmap 2026</span>
      </div>
      
      <h1 class="text-4xl md:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tight">
        Relocating to Switzerland <br/>
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600">Step-by-Step Checklist</span>
      </h1>
      <p class="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
        The chronological authority on moving to the Swiss Confederation. <br class="hidden md:block"/> No guesswork. No missed deadlines. Just Swiss precision.
      </p>

      <div class="flex flex-col sm:flex-row justify-center gap-6">
        <button 
           onclick="window.openRelocationModal()"
           class="px-10 py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-xl transition-all shadow-2xl shadow-primary-900/40 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
        >
          Start Relocation Finder
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </button>
      </div>
    </div>
  </section>

  <!-- Modern Timeline Container -->
  <section class="py-24 bg-white relative">
    <div class="max-w-6xl mx-auto px-4">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-5xl font-black text-slate-900 mb-6">The 3 Critical Phases</h2>
        <p class="text-slate-500 font-medium text-lg max-w-2xl mx-auto">Master the most dangerous bottlenecks of Swiss relocation before they cost you time and money.</p>
      </div>
      
      <div class="relative">
        <div class="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-slate-100 md:-ml-0.5 hidden sm:block"></div>
        
        <div class="space-y-32">
          {phases.map((phase, phaseIdx) => (
            <div class="relative group">
              <div class="flex flex-col items-center mb-16 relative z-10">
                <div class="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-3xl shadow-xl shadow-slate-900/20 group-hover:scale-110 transition-transform">
                  {phase.icon}
                </div>
                <div class="mt-4 px-4 py-1.5 bg-primary-600 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-lg">
                  {phase.title}
                </div>
                <div class="mt-2 text-slate-900 font-bold text-lg">{phase.period}</div>
                <p class="mt-1 text-slate-500 text-sm italic">{phase.summary}</p>
              </div>

              <div class="space-y-16">
                {phase.steps.map((step, stepIdx) => (
                  <div class={\`flex flex-col md:flex-row gap-8 md:gap-16 items-start \${stepIdx % 2 !== 0 ? 'md:flex-row-reverse' : ''}\`}>
                    <div class="w-full md:w-1/2 bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all relative">
                      <div class="absolute -top-4 -left-4 w-12 h-12 rounded-2xl bg-primary-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-primary-500/30">
                        {stepIdx + 1}
                      </div>
                      <h3 class="text-2xl md:text-3xl font-black text-slate-900 mb-6 leading-tight">
                        {step.title}
                      </h3>
                      <p class="text-slate-600 text-lg mb-8 leading-relaxed font-medium">
                        {step.text}
                      </p>

                      {step.details && (
                        <div class="bg-slate-50 rounded-2xl p-6 mb-10">
                          <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Critical Checkpoints</h4>
                          <ul class="space-y-4">
                            {step.details.map((detail: any) => (
                              <li class="flex items-start gap-4 text-slate-700 font-semibold group/li text-sm md:text-base">
                                <svg class="w-5 h-5 text-primary-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {step.cta && (
                        <div class="space-y-6 pt-6 border-t border-slate-100">
                           <div>
                              <div class="flex items-center gap-2 mb-2">
                                <span class={\`w-2 h-2 rounded-full \${step.cta.type === 'expat-savvy' ? 'bg-primary-500' : 'bg-slate-900'}\`}></span>
                                <h4 class="font-black text-slate-900 text-lg leading-none">{step.cta.title}</h4>
                              </div>
                              <p class="text-slate-500 text-sm font-medium leading-relaxed">{step.cta.text}</p>
                           </div>

                           <div class="flex flex-col gap-3">
                              <a 
                                href={(step.cta as any).onclick ? 'javascript:void(0)' : (step.cta as any).link}
                                onclick={(step.cta as any).onclick}
                                target={(step.cta as any).link ? "_blank" : undefined}
                                class="inline-flex items-center justify-center px-8 py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all gap-3 shadow-xl shadow-slate-900/20 group/btn"
                              >
                                {step.cta.label}
                                <svg class="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                              </a>

                              {(step as any).ctaSecondary && (
                                <a 
                                  href={(step as any).ctaSecondary.link}
                                  target="_blank"
                                  class="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-bold hover:bg-slate-50 hover:border-slate-200 transition-all gap-3"
                                >
                                  {(step as any).ctaSecondary.label}
                                  <svg class="w-5 h-5 opacity-40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                                </a>
                              )}
                           </div>
                        </div>
                      )}
                    </div>
                    <div class="hidden md:block md:w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>

  <!-- Complete 14-Step Master Checklist (Restyled Original Content) -->
  <section class="py-24 bg-slate-50 border-t border-slate-200">
    <div class="max-w-4xl mx-auto px-4">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-5xl font-black text-slate-900 mb-6">The Complete 14-Step Master Checklist</h2>
        <p class="text-slate-500 font-medium text-lg max-w-2xl mx-auto">For the meticulous planner: every single administrative step required to legally and comfortably settle in Switzerland.</p>
      </div>

      <div class="space-y-6">
        {steps.map((step, index) => (
          <div class="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div class="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary-400 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="flex flex-col md:flex-row items-start gap-8">
              <div class="flex-shrink-0">
                 <div class="w-16 h-16 rounded-full bg-slate-50 text-slate-400 border-2 border-slate-100 flex items-center justify-center font-black text-2xl group-hover:border-primary-200 group-hover:text-primary-600 transition-colors">
                   {index + 1}
                 </div>
              </div>
              <div class="flex-grow">
                <h3 class="text-2xl font-bold text-slate-900 mb-4">{step.name}</h3>
                <p class="text-lg text-slate-600 leading-relaxed">{step.text}</p>
                
                {/* Re-inject the Housing Ecosystem CTA if it's the accommodation step */}
                {step.name === "Accommodation Research & Initial Search" && (
                  <div class="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-6 relative overflow-hidden">
                    <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600"></div>
                    <h4 class="text-xl font-bold text-slate-900 mb-2">How to Beat the 0.06% Vacancy Rate</h4>
                    <p class="text-slate-700">For VIP corporate service, compare verified agencies at <a href="https://relofinder.ch" class="text-red-600 font-semibold hover:underline">ReloFinder.ch</a>. For DIY off-market 'Nachmieter' apartments, bypass the public portals using <a href="https://www.offlist.ch" class="text-red-600 font-semibold hover:underline">Offlist.ch</a>.</p>
                  </div>
                )}

                {/* Re-inject the Health Insurance Ecosystem CTA if it's the KVG step */}
                {step.name === "Obtain Mandatory Swiss Health Insurance" && (
                  <div class="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-6 relative overflow-hidden">
                    <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600"></div>
                    <h4 class="text-xl font-bold text-slate-900 mb-2">The 90-Day Deadline</h4>
                    <p class="text-slate-700 mb-6">Don't risk cantonal assignment. Book a free digital demand assessment with Expat-Savvy to bundle your mandatory KVG and supplementary VVG perfectly.</p>
                     <button onclick="window.openHealthModal('relocation')" class="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-600/20">
                      Start Free Assessment
                      <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>

  <!-- Key Facts / Checklists Overview -->
  <section class="py-24 bg-white border-t border-slate-200">
    <div class="max-w-6xl mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
        <!-- Pre/Post Checklists -->
        <div class="space-y-12">
           <div>
             <h3 class="text-xl font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
               <span class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">1</span>
               Pre-Arrival List
             </h3>
             <ul class="space-y-4">
               {preArrivalChecklist.map((item) => (
                 <li class="flex items-start gap-4 text-slate-600 font-medium">
                   <svg class="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                   <span>{item}</span>
                 </li>
               ))}
             </ul>
           </div>
           
           <div>
             <h3 class="text-xl font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
               <span class="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">2</span>
               Post-Arrival List
             </h3>
             <ul class="space-y-4">
               {postArrivalChecklist.map((item) => (
                 <li class="flex items-start gap-4 text-slate-600 font-medium">
                   <svg class="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                   <span>{item}</span>
                 </li>
               ))}
             </ul>
           </div>
        </div>

        <!-- Documentation & Admin timeline -->
        <div class="space-y-12">
           <div class="bg-slate-50 rounded-3xl p-8 border border-slate-200">
              <h3 class="text-xl font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-200 pb-4">Essential Docs to Pack</h3>
              <ul class="space-y-3">
               {supplies.map((item) => (
                 <li class="flex items-start gap-3 text-slate-700 text-sm font-medium">
                   <div class="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></div>
                   <span>{item}</span>
                 </li>
               ))}
             </ul>
           </div>
           
           <div class="bg-slate-900 text-white rounded-3xl p-8 shadow-xl">
             <h3 class="text-xl font-black uppercase tracking-widest mb-6 text-primary-400">Firm Deadlines</h3>
             <p class="text-sm text-slate-300 font-medium mb-4">Print these out and stick them on your fridge.</p>
             <ul class="space-y-4">
               <li class="flex justify-between items-center border-b border-slate-800 pb-3">
                 <span class="font-bold text-slate-100">Kreisbüro Registration</span>
                 <span class="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-black">14 DAYS</span>
               </li>
               <li class="flex justify-between items-center border-b border-slate-800 pb-3">
                 <span class="font-bold text-slate-100">Basic Health Insurance</span>
                 <span class="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-black">90 DAYS</span>
               </li>
               <li class="flex justify-between items-center border-b border-slate-800 pb-3">
                 <span class="font-bold text-slate-100">Driver's License Exchange</span>
                 <span class="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-black">365 DAYS</span>
               </li>
             </ul>
           </div>
        </div>
      </div>
    </div>
  </section>

  <!-- High-Convert FAQ Section (Using target file's FAQs) -->
  <section class="py-24 bg-slate-50">
    <div class="max-w-4xl mx-auto px-4">
       <div class="text-center mb-16">
          <h2 class="text-3xl md:text-5xl font-black text-slate-900 mb-6">Expert Relocation Q&A</h2>
          <p class="text-slate-500 font-medium text-lg">Detailed answers for the most critical relocation hurdles.</p>
       </div>
       
       <div class="space-y-6">
          {faqs.map(faq => (
            <div class="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
               <h3 class="text-xl font-bold text-slate-900 mb-4">{faq.question}</h3>
               <p class="text-slate-600 leading-relaxed font-medium">{faq.answer}</p>
            </div>
          ))}
       </div>
    </div>
  </section>

  <!-- Trust Bar -->
  <section class="py-20 bg-white border-t border-slate-100">
    <div class="max-w-7xl mx-auto px-4 text-center">
      <h2 class="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-12">Helping Teams Secure Their Future in Switzerland</h2>
      <div class="flex flex-wrap justify-center items-center gap-x-16 gap-y-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
         <img src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Google_Logo.svg" alt="Google" class="h-6"/>
         <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix" class="h-6"/>
         <img src="https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg" alt="Meta" class="h-6"/>
         <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" class="h-6"/>
         <img src="https://upload.wikimedia.org/wikipedia/commons/b/b9/CERN_logo.svg" alt="CERN" class="h-7"/>
      </div>
    </div>
  </section>

  {/* Epic Final CTA */}
  <section class="py-32 bg-slate-900 relative overflow-hidden">
    <div class="absolute inset-0 opacity-10 pointer-events-none">
       <div class="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,#dc2626_0%,transparent_50%)]"></div>
    </div>

    <div class="max-w-4xl mx-auto px-4 text-center relative z-10">
      <h2 class="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">Ready for a Seamless Move?</h2>
      <p class="text-xl md:text-2xl text-slate-400 mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
        Join the thousands of successful expats who secured their Swiss life with professional guidance. Independent. FINMA-registered.
      </p>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <button 
          onclick="window.openRelocationModal()"
          class="group px-10 py-6 bg-primary-600 text-white rounded-[2rem] font-black text-xl hover:bg-primary-700 transition-all shadow-2xl shadow-primary-900/40 hover:-translate-y-2 flex flex-col items-center gap-1"
        >
          <span class="text-sm text-primary-200 uppercase tracking-widest font-bold">Relocation</span>
          <span>Find Housing Expert</span>
        </button>

        <button 
          onclick="window.openContextualModal('health')"
          class="group px-10 py-6 bg-white text-slate-900 rounded-[2rem] font-black text-xl hover:bg-slate-50 transition-all shadow-2xl hover:-translate-y-2 flex flex-col items-center gap-1"
        >
          <span class="text-sm text-slate-400 uppercase tracking-widest font-bold">Insurance</span>
          <span>Book Strategy Call</span>
        </button>
      </div>

      <div class="mt-16 flex flex-wrap justify-center gap-8 text-slate-500 font-bold uppercase tracking-widest text-xs">
         <span class="flex items-center gap-2">
            <svg class="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            Trustpilot 4.9/5
         </span>
         <span class="flex items-center gap-2">
            <svg class="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
            FINMA Registered
         </span>
         <span class="flex items-center gap-2">
            <svg class="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/></svg>
            100% Secure
         </span>
      </div>
    </div>
  </section>

</Layout>

<style>
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.6s ease-out forwards;
  }
</style>
`;

// Find where to splice the body
const oldBodyStartString = "  <!-- Hero Section -->";
const stopIndex = newFrontmatter.indexOf(oldBodyStartString);

if (stopIndex !== -1) {
    const finalFileContent = newFrontmatter.substring(0, stopIndex) + finalBody;
    fs.writeFileSync('src/pages/guides/how-to/relocate-to-switzerland-step-by-step-checklist.astro', finalFileContent);
    console.log("Successfully replaced the file content.");
} else {
    console.error("Could not find the start of the Hero Section to replace.");
}
