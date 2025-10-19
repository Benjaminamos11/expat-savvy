# CTA Button Audit & Optimization TODO List

## 🚨 PHASE 1: CRITICAL FIXES (Priority 1)

### A. Broken Homepage Buttons
- [x] **Homepage** (`src/pages/index.astro`)
  - [x] Fix "Set Up New Insurance" button (line 341-352) - Add onclick handler
  - [x] Fix "Review Existing Insurance" button (line 353-364) - Add onclick handler
  - [x] Update button text to be more specific: "Get 3 Best Setup Options" / "Get 3 Better Alternatives"

### B. Legacy Function Calls - Update `showConsultationModal()` to `window.openOffersModal()`
- [ ] **Healthcare Pages**
  - [x] `src/pages/healthcare/new-health-insurance.astro` (lines 421, 1111, 1132)
  - [ ] `src/pages/healthcare/switching-health-insurance.astro` (if exists)
  - [x] `src/pages/health-insurance.astro` (line 651-699 area)
  - [ ] `src/pages/healthcare/all-insurances/index.astro` (line 245-273 area)

- [ ] **Insurance Pages**
  - [ ] `src/pages/insurance/household-insurance.astro` (line 449-489 area)

- [ ] **Guide Pages**
  - [ ] `src/pages/guides/how-to/save-taxes-with-3a-pillar.astro` (line 618-661 area)
  - [ ] `src/pages/guides/how-to/set-up-health-insurance.astro` (line 586-424 area)
  - [ ] `src/pages/guides/how-to/change-health-insurance.astro` (if exists)

- [ ] **Other Pages**
  - [ ] `src/pages/about.astro` (line 498-532 area)
  - [ ] `src/pages/free-consultation.astro` (line 1-40 area)
  - [ ] `src/pages/insurance-guides/new-arrivals-checklist.astro` (line 387-410 area)

### C. Calculator Links - Point to AI Chat
- [ ] **Blog Posts with Calculator References**
  - [x] `src/content/blog/best-health-insurance-switzerland.md` (line 460) - Update calculator link
  - [x] `src/content/blog/cheapest-health-insurance-switzerland-2026.md` (line 360) - Update calculator link
  - [ ] `src/content/blog/switzerland-relocation-step-by-step-roadmap.md` (line 430) - Update calculator link
  - [x] `src/pages/health-insurance.astro` - Update calculator link
  - [x] `src/pages/healthcare/new-health-insurance.astro` - Update calculator link
  - [ ] Search for other calculator references in blog posts

## 🎨 PHASE 2: CONTEXT-AWARE CTA OPTIMIZATION (Priority 2)

### A. Homepage Specific CTAs
- [ ] **Main Hero Section** - Already working, but optimize text
- [ ] **Insurance Solutions Section** - Make CTAs more specific to setup vs review
- [ ] **Contact Section** - Optimize for conversion

### B. Blog Post CTAs - Make Context-Specific
- [ ] **Insurance Comparison Posts**
  - [x] `src/content/blog/best-health-insurance-switzerland.md` - "Get 3 Best Recommendations"
  - [x] `src/content/blog/cheapest-health-insurance-switzerland-2026.md` - "Find Cheapest Options for You"
  - [x] `src/content/blog/expat-family-matters-best-swiss-health-insurers-children-maternity.md` - "Get Family Coverage Options"

- [ ] **Provider Comparison Posts**
  - [ ] `src/content/blog/swica-vs-helsana.md` (if exists) - "Compare All Top Insurers"
  - [ ] Provider-specific blog posts - "See How [Provider] Compares to Others"

- [ ] **Specialized Insurance Posts**
  - [ ] `src/content/blog/dental-insurance-expats-switzerland.md` - "Get Dental Coverage Options"
  - [ ] `src/content/blog/legal-protection-insurance-switzerland-complete-guide.md` - "Get Legal Protection Options"
  - [ ] `src/content/blog/third-pillar-insurance-switzerland-comprehensive-guide.md` - "Get 3rd Pillar Options"
  - [ ] `src/content/blog/3rd-pillar-vs-life-insurance-switzerland.md` - "Compare 3rd Pillar vs Life Insurance"

- [ ] **Relocation Posts**
  - [ ] `src/content/blog/switzerland-relocation-step-by-step-roadmap.md` - "Get Relocation Insurance Guide"
  - [ ] `src/content/blog/hidden-costs-zurich-relocation-budget-planning-expats.md` - "Get Zurich Setup Guide"
  - [ ] `src/content/blog/relocating-switzerland-insurance-checklist-by-canton.md` - "Get Canton-Specific Guide"

### C. Provider Comparison Pages
- [ ] **Compare Providers Section** (`src/pages/compare-providers/`)
  - [ ] Update generic CTAs to "Compare Beyond These Options"
  - [ ] Add specific provider comparison CTAs

### D. Healthcare Hub Pages
- [ ] **Main Health Insurance Hub** (`src/pages/health-insurance.astro`)
  - [ ] Update CTAs to match hub purpose
  - [ ] Add calculator-specific CTAs pointing to AI chat

## 🔧 PHASE 3: MODAL INTENT INTEGRATION (Priority 2)

### A. Update Modal Opening with Intent
- [ ] **Setup Pages** - Pass 'setup' intent
  - [ ] New health insurance pages
  - [ ] Relocation guides
  - [ ] New arrival checklists

- [ ] **Change/Switch Pages** - Pass 'change' intent
  - [ ] Switching health insurance pages
  - [ ] Cheapest insurance guides
  - [ ] Annual switching guides

- [ ] **Compare Pages** - Pass 'compare' intent
  - [ ] Provider comparison pages
  - [ ] Best insurance guides
  - [ ] Model comparison guides

- [ ] **Specialized Pages** - Pass specific intent
  - [ ] Family insurance → 'family'
  - [ ] Dental insurance → 'dental'
  - [ ] Legal protection → 'legal'

### B. Update Modal Intent Detection
- [ ] **Enhance `detectPageIntent()` in offers-modal.js**
  - [ ] Add more URL pattern detection
  - [ ] Add intent parameter support
  - [ ] Update headline generation based on intent

### C. Dynamic Headlines by Intent
- [ ] **Update `getHeadlineContent()` in offers-modal.js**
  - [ ] Setup intent: "Set Up Your Swiss Health Insurance"
  - [ ] Change intent: "Switch to Better Health Insurance"
  - [ ] Compare intent: "Find Your Best Insurance Match"
  - [ ] Family intent: "Optimize Your Family's Coverage"
  - [ ] Cheapest intent: "Find the Cheapest Options for You"

## 🧹 PHASE 4: CLEANUP & CONSOLIDATION (Priority 3)

### A. Remove Conflicting Scripts
- [ ] **Delete/Disable Legacy Button Scripts**
  - [ ] `public/scripts/component-helper.js`
  - [ ] `public/scripts/direct-modal-fix.js`
  - [ ] `public/scripts/direct-button-fix.js`
  - [ ] `public/scripts/global-intercept.js`
  - [ ] `public/scripts/global-modal-fix.js`
  - [ ] `public/scripts/button-fixer.js`
  - [ ] `public/scripts/homepage-buttons.js`
  - [ ] `public/scripts/button-audit.js`

### B. Update Layout References
- [ ] **Remove Script References from Layout**
  - [ ] `src/layouts/Layout.astro` - Remove disabled script imports
  - [ ] Clean up commented-out emergency scripts

### C. Floating Banners in Blog Posts
- [ ] **Update CTA Banners in Blog Posts**
  - [ ] Make banners context-aware
  - [ ] Update styling to match site design
  - [ ] Ensure all banners use correct modal opening

## 📊 VALIDATION & TESTING

### A. Functionality Testing
- [ ] **Test All Updated Buttons**
  - [ ] Homepage buttons open modal correctly
  - [ ] Blog post CTAs work with correct intent
  - [ ] Provider comparison CTAs function properly
  - [ ] Calculator links point to AI chat

### B. Intent Testing
- [ ] **Test Modal Intent Detection**
  - [ ] Setup pages show setup-focused content
  - [ ] Change pages show switching-focused content
  - [ ] Compare pages show comparison-focused content

### C. Mobile Testing
- [ ] **Test All CTAs on Mobile**
  - [ ] Buttons are properly sized and clickable
  - [ ] Modal opens correctly on mobile
  - [ ] Intent detection works on mobile

## 📝 PROGRESS TRACKING

### Completed Pages
- [x] `src/pages/index.astro` - Fixed broken buttons, added intent support
- [x] `src/pages/healthcare/new-health-insurance.astro` - Updated all CTAs and calculator links
- [x] `src/pages/health-insurance.astro` - Updated all CTAs and calculator links
- [x] `src/content/blog/best-health-insurance-switzerland.md` - Updated CTA and calculator link
- [x] `src/content/blog/cheapest-health-insurance-switzerland-2026.md` - Updated CTA
- [x] `src/content/blog/expat-family-matters-best-swiss-health-insurers-children-maternity.md` - Updated CTA
- [x] `public/scripts/offers-modal.js` - Added intent support and dynamic headlines

### ✅ **COMPARISON PAGES COMPLETED (13/13)**
- [x] `src/pages/compare-providers/swica-vs-helsana/index.astro` ⭐ **TOP TRAFFIC**
- [x] `src/pages/compare-providers/css-vs-sanitas/index.astro`
- [x] `src/pages/compare-providers/swica-vs-css/index.astro`
- [x] `src/pages/compare-providers/helsana-vs-css/index.astro`
- [x] `src/pages/compare-providers/swica-vs-sanitas/index.astro`
- [x] `src/pages/compare-providers/sanitas-vs-helsana/index.astro`
- [x] `src/pages/compare-providers/sanitas-vs-swica/index.astro`
- [x] `src/pages/compare-providers/kpt-vs-helsana/index.astro`
- [x] `src/pages/compare-providers/groupe-mutuel-vs-assura/index.astro`
- [x] `src/pages/compare-providers/groupe-mutuel-vs-sympany/index.astro`
- [x] `src/pages/compare-providers/concordia-vs-kpt/index.astro`
- [x] `src/pages/compare-providers/visana-vs-atupri/index.astro`
- [x] `src/pages/compare-providers/index.astro` (main comparison hub)

### ✅ **PROVIDER PAGES COMPLETED (12/12)**
- [x] `src/pages/healthcare/all-insurances/swica.astro`
- [x] `src/pages/healthcare/all-insurances/helsana.astro`
- [x] `src/pages/healthcare/all-insurances/css.astro`
- [x] `src/pages/healthcare/all-insurances/sanitas.astro`
- [x] `src/pages/healthcare/all-insurances/assura.astro`
- [x] `src/pages/healthcare/all-insurances/groupe-mutuel.astro`
- [x] `src/pages/healthcare/all-insurances/kpt.astro`
- [x] `src/pages/healthcare/all-insurances/sympany.astro`
- [x] `src/pages/healthcare/all-insurances/visana.astro`
- [x] `src/pages/healthcare/all-insurances/atupri.astro`
- [x] `src/pages/healthcare/all-insurances/concordia.astro`
- [x] `src/pages/healthcare/all-insurances/index.astro` (main provider hub)

### ✅ **KEY INSURANCE PAGES COMPLETED (6/6)**
- [x] `src/pages/insurance-change-2025-2026/index.astro` - Intent: 'change'
- [x] `src/pages/healthcare/switching-health-insurance.astro` - Intent: 'change'
- [x] `src/pages/guides/how-to/set-up-health-insurance.astro` - Intent: 'setup'
- [x] `src/pages/guides/how-to/change-health-insurance.astro` - Intent: 'change'
- [x] `src/pages/guides/how-to/apply-premium-subsidies.astro` - Intent: 'setup'
- [x] `src/pages/about.astro` - Intent: 'home'

### In Progress
- [ ] Remaining healthcare pages
- [ ] Remaining blog posts
- [ ] Provider comparison pages

### Tested & Validated
- [x] Homepage buttons now work with intent
- [x] Modal opens with correct intent-based headlines
- [x] Calculator links point to AI chat
- [x] Dev server running successfully (200 response)

---

## 🎯 SUCCESS CRITERIA

- [ ] All buttons on all pages open the modal correctly
- [ ] No more `showConsultationModal()` function calls
- [ ] All calculator links point to `/ai-chat`
- [ ] CTAs are context-specific and conversion-optimized
- [ ] Modal opens with correct intent based on page context
- [ ] All legacy button-fixing scripts removed
- [ ] Mobile functionality fully tested
- [ ] Performance impact minimized

---

*Last Updated: [Current Date]*
*Total Pages to Update: ~50+*
*Estimated Time: 2-3 hours*
