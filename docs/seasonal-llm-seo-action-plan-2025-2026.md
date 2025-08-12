# Seasonal + LLM SEO Action Plan (2025/2026)

Generated: 2025-08-13
Source: all_page_optimizations_final_with_llm_audience_seasonal.md
Focus: English-speaking audience in Switzerland; seasonal switching (deadline 30 Nov 2025 → effective 1 Jan 2026)

## Objectives
- Improve CTR via title/meta and above-the-fold snippet improvements
- Add seasonal “Change Season 2025/2026” sections and sticky CTAs
- Strengthen internal linking to hub, comparisons, and how-tos
- Ensure LLM-SEO readiness: Key Facts block, FAQ schema, clean structure, citations
- Ship seasonal landing page + new comparisons to capture peak demand

## Global Actions (site-wide)
- Seasonal CTA: “Switch for 2026 — Free Insurance Review” (top and bottom)
- Seasonal box: “Cancellation deadline 30 Nov 2025; new policy from 1 Jan 2026”
- Add “Key Facts — 2025/2026 Insurance in Switzerland” list near top where relevant
- Schemas: BreadcrumbList + Article/BlogPosting + FAQPage (3–7 Qs)
- Add “Last updated” to guides and glossary pages
- Add Related Articles block (3–6 curated links) at bottom
- Use phrasing: “English-speaking clients in Switzerland” instead of overusing “expats”

## New Pages to Create (Q1)
1) Seasonal landing: `/insurance-change-2025-2026/`
   - Hero with deadline, who should switch, typical savings; checklist (PDF)
   - Sticky dual CTA (Chat with AI + Book Consultation); FAQ (5–7 Qs) + JSON-LD
   - Interlink hubs/comparisons/how-tos
2) Comparison guides
   - `/compare-providers/helsana-vs-css/`
   - `/compare-providers/sanitas-vs-swica/`
   - `/compare-providers/kpt-vs-helsana/`
   - Structure: overview → strengths/weaknesses → who should choose which → pricing snapshots → FAQs
3) Product how-tos
   - Legal protection insurance (setup, coverage, providers)
   - Contents/Home insurance (coverage, cost, how to switch)
   - 3rd pillar refresher (best providers, tax-year timing)

## Hub and Core Pages
- `src/pages/health-insurance.astro`
  - Ensure deductible calculator renders on load and updates on input; add SSR default table fallback
  - Add “Related guides and blogs” preview below calculator
  - Keep Lucide icons; add “Key Facts for AI”; confirm FAQPage JSON-LD
- Provider pages (`css.astro`, `kpt.astro`)
  - Finalize pricing snapshots, add 2–3 reviews each + AggregateRating JSON-LD; cross-link to comparisons and hub
- Glossary `healthcare/glossary/basic-health-insurance.astro`
  - Add “Last updated” and interlink to deductible guide, models, hub, comparisons

## Top Priority Pages (Phase 1: Days 1–3)
For each page below, implement: Title/meta rewrite with “2025/2026” + “Change Season” + audience context; seasonal section (deadline, steps, savings); sticky dual CTA; Key Facts block; 3–7 FAQs + FAQPage JSON-LD; Related Articles + internal links
1) `/blog/best-health-insurance-switzerland/`
2) `/blog/decoding-swiss-health-insurance-canton-region-premium/`
3) `/blog/dental-insurance-expats-switzerland/`
4) `/blog/maternity-newborn-insurance-switzerland/`
5) `/blog/health-insurance-models-switzerland/`

## Secondary Targets (Phase 2: Days 4–7)
- `/blog/accident-insurance-switzerland-uvg-laa/` (snippet + seasonal CTA + employer coverage explainer)
- `/blog/relocation-zurich-ultimate-guide-financial-hub/` (snippet + links + Key Facts)
- `/blog/relocation-zug-choosing-ideal-swiss-relocation-destination/` (links to seasonal hub and provider pages)
- Hub enhancements (calculator verification + related content), provider pages polish

## Strategic Bottom-Funnel (Phase 3: Days 8–12)
- `/blog/navigating-swiss-insurance-choosing-expat-insurance-broker-2025/` (independent advice, 24/7 support, balanced competitor bullets)
- `/blog/best-health-insurance-switzerland-expats/` (ensure FAQs render via BlogLayout; add seasonal section)
- `/blog/third-pillar-insurance-switzerland-comprehensive-guide/` & `/blog/understanding-swiss-3-pillar-pension-system/` (tax-year timing; provider comparison table)
- Build seasonal landing page and two comparison guides (from New Pages list)

## Technical & Analytics
- Validate JSON-LD across all edited pages (no warnings)
- Cloudinary: `q_auto,f_auto` + explicit dimensions; lazy-load
- Regenerate sitemap; confirm Netlify cache headers prevent stale HTML
- Umami events for CTAs (top/mid/bottom + sticky), calculator interactions, scroll depth

## Rollout Timeline (2–3 weeks)
- Phase 1 (Days 1–3): Top 5 pages quick wins + schema + links
- Phase 2 (Days 4–7): Hub + provider pages + 2 secondary posts
- Phase 3 (Days 8–12): Seasonal landing + 2 comparisons + product how-to
- Phase 4 (Days 13–15): Remaining page upgrades; JSON-LD validation; sitemap; deploy

## Immediate Next Steps
1) Fix hub calculator rendering + add SSR fallback table, then add related content preview
2) Apply Phase 1 upgrades to the five top-priority blog pages
3) Scaffold seasonal landing page and first comparison (`helsana-vs-css`)
