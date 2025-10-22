import pandas as pd
import re
from urllib.parse import urlparse

def extract_keyword_from_url(url):
    """Extract main keyword from URL path"""
    path = urlparse(url).path.strip('/')
    segments = path.split('/')
    
    # Handle different URL patterns
    if 'healthcare/all-insurances/' in path:
        insurer = segments[-1].replace('-', ' ').title()
        return f"{insurer} Health Insurance"
    elif 'compare-providers/' in path:
        insurer1 = segments[-2].replace('-', ' ').title()
        insurer2 = segments[-1].replace('-', ' ').title()
        return f"{insurer1} vs {insurer2}"
    elif 'health-insurance/' in path:
        city = segments[-1].replace('-', ' ').title()
        return f"Health Insurance {city}"
    elif 'guides/how-to/' in path:
        topic = segments[-1].replace('-', ' ').title()
        return f"How to {topic}"
    elif 'blog/' in path:
        # Extract topic from blog URL
        topic = segments[-1].replace('-', ' ').title()
        return topic
    elif 'insurance-guides/' in path:
        return segments[-1].replace('-', ' ').title()
    elif 'healthcare/best-health-insurance-switzerland/' in path:
        return "Best Health Insurance Switzerland"
    elif 'healthcare/switching-health-insurance/' in path:
        return "Switch Health Insurance Switzerland"
    elif 'healthcare/new-health-insurance/' in path:
        return "New Health Insurance Switzerland"
    else:
        # Fallback to last segment
        return segments[-1].replace('-', ' ').title() if segments else "Swiss Insurance"

def optimize_title(keyword, current_title, max_length=60):
    """Optimize title to be under 60 characters with keyword focus"""
    # Handle NaN values
    if pd.isna(current_title):
        current_title = ""
    
    current_title = str(current_title)
    
    if len(current_title) <= max_length and keyword.lower() in current_title.lower():
        return current_title
    
    # Clean keyword
    keyword = keyword.replace('|', '').strip()
    
    # Create optimized title based on content type
    if 'vs' in keyword.lower():
        # Comparison pages
        optimized = f"{keyword} | Expert Comparison"
    elif 'health insurance' in keyword.lower():
        # Insurance pages
        optimized = f"{keyword} | Expert Guide 2025"
    elif 'how to' in keyword.lower():
        # How-to guides
        optimized = f"{keyword} | Step-by-Step Guide"
    elif 'best' in keyword.lower():
        # Best of pages
        optimized = f"{keyword} | Expert Guide 2025"
    else:
        # General pages
        optimized = f"{keyword} | Expert Guide"
    
    # Ensure it's under max_length
    if len(optimized) > max_length:
        # Try shorter version
        if 'Expert Guide 2025' in optimized:
            optimized = optimized.replace('Expert Guide 2025', '2025 Guide')
        elif 'Expert Guide' in optimized:
            optimized = optimized.replace('Expert Guide', 'Guide')
        elif 'Step-by-Step Guide' in optimized:
            optimized = optimized.replace('Step-by-Step Guide', 'Guide')
        
        # If still too long, truncate
        if len(optimized) > max_length:
            optimized = optimized[:max_length-3] + "..."
    
    return optimized

def optimize_meta_description(keyword, current_desc, max_length=155):
    """Optimize meta description to be under 155 characters with emotional appeal"""
    # Handle NaN values
    if pd.isna(current_desc):
        current_desc = ""
    
    current_desc = str(current_desc)
    
    if len(current_desc) <= max_length and current_desc:
        return current_desc
    
    # Create emotional, action-oriented description
    keyword_lower = keyword.lower()
    
    # Start with action verb based on content type
    if 'vs' in keyword_lower or 'compare' in keyword_lower:
        start = "Compare"
        action = "find which fits your needs"
    elif 'how to' in keyword_lower:
        start = "Learn"
        action = "step-by-step guidance"
    elif 'best' in keyword_lower:
        start = "Find"
        action = "expert recommendations"
    elif 'health insurance' in keyword_lower:
        start = "Compare"
        action = "find the best coverage"
    else:
        start = "Discover"
        action = "expert guidance"
    
    # Add trust elements
    trust = "Independent FINMA-certified" if "independent" not in current_desc.lower() else "Expert"
    
    # Create description
    desc = f"{start} {keyword_lower} in Switzerland. {trust} advice for expats — {action}."
    
    # Ensure it's under max_length
    if len(desc) > max_length:
        # Try shorter version
        desc = f"{start} {keyword_lower} in Switzerland. Expert advice for expats — get help."
        
        if len(desc) > max_length:
            desc = desc[:max_length-3] + "..."
    
    return desc

def optimize_h1(keyword, current_h1, max_length=70):
    """Optimize H1 to be natural and under 70 characters"""
    # Handle NaN values
    if pd.isna(current_h1):
        current_h1 = ""
    
    current_h1 = str(current_h1)
    
    if len(current_h1) <= max_length and keyword.lower() in current_h1.lower():
        return current_h1
    
    # Clean keyword and make it natural
    keyword = keyword.replace('|', '').strip()
    
    # Make H1 more natural than title
    if 'vs' in keyword.lower():
        # For comparisons, make it more conversational
        insurers = keyword.split(' vs ')
        return f"Choosing Between {insurers[0]} and {insurers[1]}?"
    elif 'how to' in keyword.lower():
        # For how-to guides, make it more direct
        return keyword.replace('How to ', '')
    elif 'health insurance' in keyword.lower():
        # For insurance pages, make it more personal
        if 'best' in keyword.lower():
            return f"Best Health Insurance in Switzerland — 2025 Guide"
        else:
            return keyword
    else:
        # General pages
        if len(keyword) <= max_length:
            return keyword
        else:
            # Shorten if needed
            words = keyword.split()
            if len(words) > 4:
                return ' '.join(words[:4])
            return keyword

def get_notes(current_title, current_desc, current_h1, new_title, new_desc, new_h1):
    """Generate notes explaining the changes"""
    notes = []
    
    # Handle NaN values
    current_title = str(current_title) if not pd.isna(current_title) else ""
    current_desc = str(current_desc) if not pd.isna(current_desc) else ""
    current_h1 = str(current_h1) if not pd.isna(current_h1) else ""
    
    if len(current_title) > 60:
        notes.append("title too long")
    if len(current_desc) > 155:
        notes.append("description too long")
    if len(current_h1) > 70:
        notes.append("h1 too long")
    
    # Check for duplicates (simplified check)
    if "Complete Guide" in current_title:
        notes.append("duplicate pattern")
    if "Expert Guide" in current_title:
        notes.append("duplicate pattern")
    
    if not notes:
        return "✓ optimized"
    
    return ", ".join(notes)

# Create comprehensive optimization data
optimized_data = []

# High-priority pages from the audit
priority_pages = [
    {
        'page': 'https://expat-savvy.ch/blog/accident-insurance-switzerland-uvg-laa/',
        'current_title': 'Accident Insurance in Switzerland (UVG/LAA) — 2025/2026 Guide for Employees | Expat Savvy Switzerland',
        'current_desc': 'Understand BU vs NBU, who pays, and how to stay covered between jobs. Seasonal tip: if you work >8h/week, exclude accident from health insurance to avoid double coverage.',
        'current_h1': 'Accident Insurance in Switzerland (UVG/LAA) — 2025/2026 Guide for Employees',
        'keyword': 'Accident Insurance Switzerland'
    },
    {
        'page': 'https://expat-savvy.ch/blog/decoding-swiss-health-insurance-canton-region-premium/',
        'current_title': 'Canton & Region Premiums (2025/2026): How Location Changes Your Swiss Insurance Price | Expat Savvy Switzerland',
        'current_desc': 'Understand Swiss KVG premium regions and why Zurich, Geneva or Basel differ. Seasonal update for 2025/2026: premium letters in Oct, cancel by 30 Nov to switch for 1 Jan. Save with model/deductible choice.',
        'current_h1': 'Canton & Region Premiums (2025/2026): How Location Changes Your Swiss Insurance Price',
        'keyword': 'Canton Region Premiums Switzerland'
    },
    {
        'page': 'https://expat-savvy.ch/healthcare/all-insurances/css/',
        'current_title': 'CSS Health Insurance Switzerland | Independent English Overview',
        'current_desc': 'CSS: 1.7M clients, myFlex models (HMO, GP, Telmed). English support available. Competitive supplementary plans. Strong in German-speaking regions. Independent review + group rates.',
        'current_h1': 'Understand CSS — and Whether It\'s Right for You',
        'keyword': 'CSS Health Insurance'
    },
    {
        'page': 'https://expat-savvy.ch/healthcare/all-insurances/helsana/',
        'current_title': 'Helsana Health Insurance Switzerland | Independent English Overview',
        'current_desc': 'Helsana: 2.2M clients, Helsana+ wellness app, fast claims processing. English hotline available. Strict supplementary acceptance. Group discounts possible. Independent review.',
        'current_h1': 'Understand Helsana — and Whether It\'s Right for You',
        'keyword': 'Helsana Health Insurance'
    },
    {
        'page': 'https://expat-savvy.ch/healthcare/all-insurances/assura/',
        'current_title': 'Assura Health Insurance Switzerland | Independent English Overview',
        'current_desc': 'Assura: Competitive premiums in French Switzerland. Good for budget-conscious expats but limited English support. Is it right for you? Independent review + alternatives.',
        'current_h1': 'Understand Assura — and Whether It\'s Right for You',
        'keyword': 'Assura Health Insurance'
    },
    {
        'page': 'https://expat-savvy.ch/healthcare/all-insurances/sanitas/',
        'current_title': 'Sanitas Health Insurance Switzerland | Independent English Overview',
        'current_desc': 'Sanitas: Premium Swiss insurer, excellent English service, wide supplementary range. Stricter pre-existing acceptance, higher premiums. Group plans available. Independent review.',
        'current_h1': 'Understand Sanitas — and Whether It\'s Right for You',
        'keyword': 'Sanitas Health Insurance'
    },
    {
        'page': 'https://expat-savvy.ch/healthcare/all-insurances/swica/',
        'current_title': 'SWICA Health Insurance Switzerland | Independent English Overview',
        'current_desc': 'SWICA: Up to CHF 1,300/year wellness rebates (gym, yoga, massage). BENEVITA app. English-friendly service. Good supplementary acceptance. Group discounts 10-15%. Independent review.',
        'current_h1': 'Understand SWICA — and Whether It\'s Right for You',
        'keyword': 'SWICA Health Insurance'
    },
    {
        'page': 'https://expat-savvy.ch/blog/expat-family-matters-best-swiss-health-insurers-children-maternity/',
        'current_title': 'Swiss Family Health Insurance Guide 2025: Complete Guide for Expats | Expat Savvy Switzerland',
        'current_desc': 'The definitive guide to navigating health insurance for families in Switzerland, covering everything from prenatal registration to cost optimization strategies for expat families.',
        'current_h1': 'Swiss Family Health Insurance Guide 2025: Complete Guide for Expats',
        'keyword': 'Swiss Family Health Insurance'
    },
    {
        'page': 'https://expat-savvy.ch/healthcare/switching-health-insurance/',
        'current_title': 'Switch Health Insurance Switzerland 2026 | Independent FINMA-Certified Experts',
        'current_desc': 'Review your current Swiss health insurance and discover better options. Independent, English-speaking, FINMA-certified experts help you switch smartly — including group discounts, pre-existing condition guidance, and full setup support.',
        'current_h1': 'Re-Evaluate Your Swiss Health Insurance — With Expert Guidance',
        'keyword': 'Switch Health Insurance Switzerland'
    },
    {
        'page': 'https://expat-savvy.ch/blog/health-insurance-models-switzerland/',
        'current_title': 'Swiss Health Insurance Models (2025/2026): Standard vs HMO vs GP vs Telmed | Expat Savvy Switzerland',
        'current_desc': 'Understand model trade‑offs and savings for 2025/2026. Which fits your budget and habits? Seasonal note: premium letters in Oct, cancel by 30 Nov for changes effective 1 Jan 2026.',
        'current_h1': 'Swiss Health Insurance Models (2025/2026): Standard vs HMO vs GP vs Telmed',
        'keyword': 'Swiss Health Insurance Models'
    },
    {
        'page': 'https://expat-savvy.ch/blog/dental-insurance-expats-switzerland/',
        'current_title': 'Dental Insurance in Switzerland for Expats (Costs & Options) | Expat Savvy Switzerland',
        'current_desc': 'Learn how dental insurance works in Switzerland, what expats pay for braces & treatment, and how to choose the right plan.',
        'current_h1': 'Dental Insurance in Switzerland for Expats (Costs & Options)',
        'keyword': 'Dental Insurance Switzerland'
    },
    {
        'page': 'https://expat-savvy.ch/blog/zurich-vs-zug-choosing-ideal-swiss-relocation-destination/',
        'current_title': 'Zurich vs. Zug: Choosing Your Ideal Swiss Relocation Destination (2025) | Expat Savvy Switzerland',
        'current_desc': 'Comprehensive comparison of Zurich and Zug for expatriates relocating to Switzerland. Expert analysis of living costs, professional opportunities, lifestyle differences, education options, and transportation to help you make an informed decision.',
        'current_h1': 'Zurich vs. Zug: Choosing Your Ideal Swiss Relocation Destination (2025)',
        'keyword': 'Zurich vs Zug'
    },
    {
        'page': 'https://expat-savvy.ch/blog/mental-health-services-switzerland/',
        'current_title': 'Mental Wellness in Switzerland: An Expat\'s Guide to Accessing Mental Health Services and Insurance Coverage | Expat Savvy Switzerland',
        'current_desc': 'A guide for expats in Switzerland on accessing mental health services, understanding insurance coverage for psychotherapy, and finding English-speaking therapists.',
        'current_h1': 'Mental Wellness in Switzerland: An Expat\'s Guide to Accessing Mental Health Services and Insurance Coverage',
        'keyword': 'Mental Health Services Switzerland'
    },
    {
        'page': 'https://expat-savvy.ch/blog/maternity-newborn-insurance-switzerland/',
        'current_title': 'Maternity & Newborn Insurance Switzerland (2025/2026): What\'s Covered and What to Do | Expat Savvy Switzerland',
        'current_desc': 'No deductible/co-payment for standard maternity services, what basic vs supplementary covers, newborn registration, and a 2025/2026 seasonal checklist (letters in Oct, cancel by 30 Nov for 1 Jan 2026).',
        'current_h1': 'Maternity & Newborn Insurance Switzerland (2025/2026): What\'s Covered and What to Do',
        'keyword': 'Maternity Newborn Insurance Switzerland'
    },
    {
        'page': 'https://expat-savvy.ch/guides/how-to/pre-existing-conditions-health-insurance/',
        'current_title': 'How to Get Health Insurance with Pre-existing Conditions in Switzerland | Expert Guide',
        'current_desc': 'Complete guide to securing Swiss health insurance with pre-existing medical conditions. Learn about basic vs. supplementary coverage, exclusions, and how to maximize your chances of acceptance.',
        'current_h1': 'Pre-existing Conditions & Swiss Health Insurance',
        'keyword': 'How to Pre-existing Conditions Health Insurance'
    },
    {
        'page': 'https://expat-savvy.ch/compare-providers/swica-vs-helsana/',
        'current_title': 'Swica vs Helsana — Which Is Better for Expats in Switzerland?',
        'current_desc': 'Independent comparison between Swica and Helsana for expats in Switzerland — find which fits your lifestyle, budget, and coverage goals.',
        'current_h1': 'Choosing Between Swica and Helsana? We Help You Find What\'s Right for You.',
        'keyword': 'Swica vs Helsana'
    },
    {
        'page': 'https://expat-savvy.ch/compare-providers/css-vs-sanitas/',
        'current_title': 'CSS vs Sanitas — Independent Comparison for Expats in Switzerland',
        'current_desc': 'Compare CSS and Sanitas side-by-side. Independent, FINMA-certified advice, English-speaking experts, and personalized guidance for expats in Switzerland.',
        'current_h1': 'Choosing Between CSS and Sanitas? We Help You Find What\'s Right for You.',
        'keyword': 'CSS vs Sanitas'
    },
    {
        'page': 'https://expat-savvy.ch/compare-providers/sanitas-vs-helsana/',
        'current_title': 'Sanitas vs Helsana — Which Is Better for Expats in Switzerland?',
        'current_desc': 'Independent comparison between Sanitas and Helsana for expats in Switzerland — find which fits your lifestyle, budget, and coverage goals.',
        'current_h1': 'Choosing Between Sanitas and Helsana? We Help You Find What\'s Right for You.',
        'keyword': 'Sanitas vs Helsana'
    },
    {
        'page': 'https://expat-savvy.ch/compare-providers/swica-vs-css/',
        'current_title': 'Swica vs CSS — Independent Comparison for Expats in Switzerland',
        'current_desc': 'Compare Swica and CSS side-by-side. Independent, FINMA-certified advice, English-speaking experts, and personalized guidance for expats in Switzerland.',
        'current_h1': 'Choosing Between Swica and CSS? We Help You Find What\'s Right for You.',
        'keyword': 'Swica vs CSS'
    },
    {
        'page': 'https://expat-savvy.ch/compare-providers/helsana-vs-css/',
        'current_title': 'Helsana vs CSS — Which Is Better for Expats in Switzerland?',
        'current_desc': 'Independent comparison between Helsana and CSS for expats in Switzerland — find which fits your lifestyle, budget, and coverage goals.',
        'current_h1': 'Choosing Between Helsana and CSS? We Help You Find What\'s Right for You.',
        'keyword': 'Helsana vs CSS'
    },
    {
        'page': 'https://expat-savvy.ch/compare-providers/sanitas-vs-swica/',
        'current_title': 'Sanitas vs Swica — Which Is Better for Expats in Switzerland?',
        'current_desc': 'Independent comparison between Sanitas and Swica for expats in Switzerland — find which fits your lifestyle, budget, and coverage goals.',
        'current_h1': 'Choosing Between Sanitas and Swica? We Help You Find What\'s Right for You.',
        'keyword': 'Sanitas vs Swica'
    },
    {
        'page': 'https://expat-savvy.ch/health-insurance/zurich/',
        'current_title': 'Health Insurance Zurich 2026 | Best & Cheapest Options for Expats',
        'current_desc': 'Find the best and cheapest health insurance in Zurich (2026). Compare premiums, models (Telmed/HMO), subsidies, and expat-friendly insurers. Free consultation in English.',
        'current_h1': 'Health Insurance in Zurich (2026) Guide for Expats',
        'keyword': 'Health Insurance Zurich'
    },
    {
        'page': 'https://expat-savvy.ch/health-insurance/basel/',
        'current_title': 'Health Insurance Basel 2026 | Best & Cheapest Options for Expats',
        'current_desc': 'Find the best and cheapest health insurance in Basel (2026). Compare premiums, models (Telmed/HMO), subsidies, and expat-friendly insurers. Free consultation in English.',
        'current_h1': 'Health Insurance in Basel (2026) Guide for Expats',
        'keyword': 'Health Insurance Basel'
    },
    {
        'page': 'https://expat-savvy.ch/health-insurance/geneva/',
        'current_title': 'Health Insurance Geneva 2026 | Best & Cheapest Options for Expats',
        'current_desc': 'Find the best and cheapest health insurance in Geneva (2026). Compare premiums, models (Telmed/HMO), subsidies, and expat-friendly insurers. Free consultation in English.',
        'current_h1': 'Health Insurance in Geneva (2026) Guide for Expats',
        'keyword': 'Health Insurance Geneva'
    },
    {
        'page': 'https://expat-savvy.ch/health-insurance/bern/',
        'current_title': 'Health Insurance Bern 2026 | Best & Cheapest Options for Expats',
        'current_desc': 'Find the best and cheapest health insurance in Bern (2026). Compare premiums, models (Telmed/HMO), subsidies, and expat-friendly insurers. Free consultation in English.',
        'current_h1': 'Health Insurance in Bern (2026) Guide for Expats',
        'keyword': 'Health Insurance Bern'
    },
    {
        'page': 'https://expat-savvy.ch/health-insurance/zug/',
        'current_title': 'Health Insurance Zug 2026 | Best & Cheapest Options for Expats',
        'current_desc': 'Find the best and cheapest health insurance in Zug (2026). Compare premiums, models (Telmed/HMO), subsidies, and expat-friendly insurers. Free consultation in English.',
        'current_h1': 'Health Insurance in Zug (2026) Guide for Expats',
        'keyword': 'Health Insurance Zug'
    },
    {
        'page': 'https://expat-savvy.ch/health-insurance/lausanne/',
        'current_title': 'Health Insurance Lausanne 2026 | Best & Cheapest Options for Expats',
        'current_desc': 'Find the best and cheapest health insurance in Lausanne (2026). Compare premiums, models (Telmed/HMO), subsidies, and expat-friendly insurers. Free consultation in English.',
        'current_h1': 'Health Insurance in Lausanne (2026) Guide for Expats',
        'keyword': 'Health Insurance Lausanne'
    },
    {
        'page': 'https://expat-savvy.ch/health-insurance/lugano/',
        'current_title': 'Health Insurance Lugano 2026 | Best & Cheapest Options for Expats',
        'current_desc': 'Find the best and cheapest health insurance in Lugano (2026). Compare premiums, models (Telmed/HMO), subsidies, and expat-friendly insurers. Free consultation in English.',
        'current_h1': 'Health Insurance in Lugano (2026) Guide for Expats',
        'keyword': 'Health Insurance Lugano'
    },
    {
        'page': 'https://expat-savvy.ch/healthcare/best-health-insurance-switzerland/',
        'current_title': 'Best Health Insurance in Switzerland 2026 – Expert Comparison for Expats',
        'current_desc': 'Compare Swica, Helsana, Sanitas, and CSS using official BAG data. FINMA-certified guidance for expats. Get your free English consultation today.',
        'current_h1': 'Best Health Insurance in Switzerland — 2026 Guide for Expats',
        'keyword': 'Best Health Insurance Switzerland'
    },
    {
        'page': 'https://expat-savvy.ch/healthcare/new-health-insurance/',
        'current_title': 'Set Up Swiss Health Insurance | Free Expert Help for Newcomers 2026',
        'current_desc': 'Expert English-speaking help for expats to set up Swiss health insurance (LAMal/KVG). Free consultation with FINMA-certified brokers. Avoid fines – save money now.',
        'current_h1': 'Set Up Your Swiss Health Insurance — Simple, Fast, and in English.',
        'keyword': 'New Health Insurance Switzerland'
    },
    {
        'page': 'https://expat-savvy.ch/',
        'current_title': 'Health Insurance Switzerland | Expert Guidance for Expats | Expat-Savvy',
        'current_desc': 'Trusted health insurance advisors for expats in Switzerland. FINMA-certified experts providing personal consultations, independent comparisons, and ongoing support in English.',
        'current_h1': 'Your Trusted Health Insurance Partner in Switzerland',
        'keyword': 'Health Insurance Switzerland'
    }
]

# Process each page
for page_data in priority_pages:
    page = page_data['page']
    current_title = page_data['current_title']
    current_desc = page_data['current_desc']
    current_h1 = page_data['current_h1']
    keyword = page_data['keyword']
    
    # Optimize metadata
    new_title = optimize_title(keyword, current_title)
    new_desc = optimize_meta_description(keyword, current_desc)
    new_h1 = optimize_h1(keyword, current_h1)
    
    # Generate notes
    notes = get_notes(current_title, current_desc, current_h1, new_title, new_desc, new_h1)
    
    optimized_data.append({
        'page': page,
        'new_title': new_title,
        'new_meta_description': new_desc,
        'new_h1': new_h1,
        'notes': notes
    })

# Add additional pages with common patterns
additional_pages = [
    'https://expat-savvy.ch/healthcare/all-insurances/atupri/',
    'https://expat-savvy.ch/healthcare/all-insurances/concordia/',
    'https://expat-savvy.ch/healthcare/all-insurances/groupe-mutuel/',
    'https://expat-savvy.ch/healthcare/all-insurances/kpt/',
    'https://expat-savvy.ch/healthcare/all-insurances/visana/',
    'https://expat-savvy.ch/healthcare/all-insurances/sympany/',
    'https://expat-savvy.ch/guides/how-to/change-health-insurance/',
    'https://expat-savvy.ch/guides/how-to/add-family-health-insurance/',
    'https://expat-savvy.ch/guides/how-to/switch-health-insurance-providers/',
    'https://expat-savvy.ch/guides/how-to/find-best-health-insurance/',
    'https://expat-savvy.ch/guides/how-to/insurance-when-moving-cantons/',
    'https://expat-savvy.ch/guides/how-to/relocate-to-switzerland-step-by-step-checklist/',
    'https://expat-savvy.ch/guides/how-to/finding-ideal-relocation-agency-switzerland/',
    'https://expat-savvy.ch/guides/how-to/save-taxes-with-3a-pillar/',
    'https://expat-savvy.ch/guides/how-to/find-best-third-pillar/',
    'https://expat-savvy.ch/guides/how-to/choose-health-insurance-deductible/',
    'https://expat-savvy.ch/guides/how-to/gym-coverage-health-insurance/',
    'https://expat-savvy.ch/guides/how-to/find-insurance-broker/',
    'https://expat-savvy.ch/guides/how-to/change-insurance-models/',
    'https://expat-savvy.ch/guides/how-to/apply-premium-subsidies/',
    'https://expat-savvy.ch/guides/how-to/alternative-therapies-coverage/',
    'https://expat-savvy.ch/guides/how-to/legal-requirements-health-insurance-deadlines/',
    'https://expat-savvy.ch/guides/how-to/set-up-health-insurance/',
    'https://expat-savvy.ch/guides/how-to/pre-existing-conditions-health-insurance/',
    'https://expat-savvy.ch/insurance-guides/student-insurance/',
    'https://expat-savvy.ch/insurance-guides/family-insurance-planning/',
    'https://expat-savvy.ch/insurance-guides/cross-border-insurance/',
    'https://expat-savvy.ch/insurance-guides/self-employed-insurance/',
    'https://expat-savvy.ch/insurance-guides/new-arrivals-checklist/',
    'https://expat-savvy.ch/insurance/personal-liability-insurance/',
    'https://expat-savvy.ch/insurance/household-insurance/',
    'https://expat-savvy.ch/insurance/legal-protection-insurance/',
    'https://expat-savvy.ch/healthcare-system/',
    'https://expat-savvy.ch/living-in-switzerland/',
    'https://expat-savvy.ch/life-insurance/',
    'https://expat-savvy.ch/3rd-pillar/',
    'https://expat-savvy.ch/pension-planning/',
    'https://expat-savvy.ch/about/',
    'https://expat-savvy.ch/careers/',
    'https://expat-savvy.ch/free-consultation/',
    'https://expat-savvy.ch/plan-healthcare/',
    'https://expat-savvy.ch/ai-chat/',
    'https://expat-savvy.ch/imprint/',
    'https://expat-savvy.ch/blog/',
    'https://expat-savvy.ch/news/',
    'https://expat-savvy.ch/news/guides/',
    'https://expat-savvy.ch/news/regional-guides/',
    'https://expat-savvy.ch/insurance-guides/',
    'https://expat-savvy.ch/guides/how-to/',
    'https://expat-savvy.ch/healthcare/all-insurances/',
    'https://expat-savvy.ch/compare-providers/',
    'https://expat-savvy.ch/insurance-providers/',
    'https://expat-savvy.ch/insurance-change-2025-2026/',
    'https://expat-savvy.ch/private-health-insurance-switzerland/'
]

# Add additional pages with optimized metadata
for page in additional_pages:
    keyword = extract_keyword_from_url(page)
    new_title = optimize_title(keyword, "")
    new_desc = optimize_meta_description(keyword, "")
    new_h1 = optimize_h1(keyword, "")
    
    optimized_data.append({
        'page': page,
        'new_title': new_title,
        'new_meta_description': new_desc,
        'new_h1': new_h1,
        'notes': '✓ optimized'
    })

# Create DataFrame and save
result_df = pd.DataFrame(optimized_data)
result_df.to_csv('optimized_metadata_expatsavvy.csv', index=False)

print(f"✅ Generated optimized metadata for {len(optimized_data)} pages")
print(f"📊 Summary:")
print(f"   - Pages with title issues: {len([x for x in optimized_data if 'title too long' in x['notes']])}")
print(f"   - Pages with description issues: {len([x for x in optimized_data if 'description too long' in x['notes']])}")
print(f"   - Pages with duplicate patterns: {len([x for x in optimized_data if 'duplicate pattern' in x['notes']])}")
print(f"   - Pages optimized: {len([x for x in optimized_data if x['notes'] == '✓ optimized'])}")

# Show first 10 examples
print("\n📋 Sample optimizations:")
for i, row in enumerate(optimized_data[:10]):
    print(f"\n{i+1}. {row['page']}")
    print(f"   Title: {row['new_title']} ({len(row['new_title'])} chars)")
    print(f"   Description: {row['new_meta_description']} ({len(row['new_meta_description'])} chars)")
    print(f"   H1: {row['new_h1']} ({len(row['new_h1'])} chars)")
    print(f"   Notes: {row['notes']}")
