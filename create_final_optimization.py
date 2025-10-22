import pandas as pd

# Create the final optimized metadata CSV
optimized_data = [
    # High-priority pages with specific optimizations
    {
        'page': 'https://expat-savvy.ch/blog/accident-insurance-switzerland-uvg-laa/',
        'new_title': 'Accident Insurance Switzerland | Expert Guide 2025',
        'new_meta_description': 'Learn about Swiss accident insurance (UVG/LAA). Independent FINMA-certified advice for expats — understand coverage and avoid double payments.',
        'new_h1': 'Accident Insurance in Switzerland — Expert Guide',
        'notes': 'title too long, description too long, h1 too long'
    },
    {
        'page': 'https://expat-savvy.ch/blog/decoding-swiss-health-insurance-canton-region-premium/',
        'new_title': 'Canton Premiums Switzerland | Expert Guide 2025',
        'new_meta_description': 'Understand Swiss health insurance premium regions. Independent FINMA-certified advice for expats — save money with location strategy.',
        'new_h1': 'Canton Premiums in Switzerland — Expert Guide',
        'notes': 'title too long, description too long, h1 too long'
    },
    {
        'page': 'https://expat-savvy.ch/healthcare/all-insurances/css/',
        'new_title': 'CSS Health Insurance Switzerland | Expert Guide 2025',
        'new_meta_description': 'Compare CSS health insurance for expats. Independent FINMA-certified advice — find the best coverage and group discounts.',
        'new_h1': 'CSS Health Insurance — Expert Guide',
        'notes': 'title too long, description too long'
    },
    {
        'page': 'https://expat-savvy.ch/healthcare/all-insurances/helsana/',
        'new_title': 'Helsana Health Insurance Switzerland | Expert Guide 2025',
        'new_meta_description': 'Compare Helsana health insurance for expats. Independent FINMA-certified advice — find the best coverage and group discounts.',
        'new_h1': 'Helsana Health Insurance — Expert Guide',
        'notes': 'title too long, description too long'
    },
    {
        'page': 'https://expat-savvy.ch/healthcare/all-insurances/assura/',
        'new_title': 'Assura Health Insurance Switzerland | Expert Guide 2025',
        'new_meta_description': 'Compare Assura health insurance for expats. Independent FINMA-certified advice — find the best coverage and group discounts.',
        'new_h1': 'Assura Health Insurance — Expert Guide',
        'notes': 'title too long, description too long'
    },
    {
        'page': 'https://expat-savvy.ch/healthcare/all-insurances/sanitas/',
        'new_title': 'Sanitas Health Insurance Switzerland | Expert Guide 2025',
        'new_meta_description': 'Compare Sanitas health insurance for expats. Independent FINMA-certified advice — find the best coverage and group discounts.',
        'new_h1': 'Sanitas Health Insurance — Expert Guide',
        'notes': 'title too long, description too long'
    },
    {
        'page': 'https://expat-savvy.ch/healthcare/all-insurances/swica/',
        'new_title': 'SWICA Health Insurance Switzerland | Expert Guide 2025',
        'new_meta_description': 'Compare SWICA health insurance for expats. Independent FINMA-certified advice — find the best coverage and group discounts.',
        'new_h1': 'SWICA Health Insurance — Expert Guide',
        'notes': 'title too long, description too long'
    },
    {
        'page': 'https://expat-savvy.ch/blog/expat-family-matters-best-swiss-health-insurers-children-maternity/',
        'new_title': 'Swiss Family Health Insurance | Expert Guide 2025',
        'new_meta_description': 'Find the best Swiss health insurance for families. Independent FINMA-certified advice for expats — optimize coverage and save money.',
        'new_h1': 'Swiss Family Health Insurance — Expert Guide',
        'notes': 'title too long, description too long, duplicate pattern'
    },
    {
        'page': 'https://expat-savvy.ch/healthcare/switching-health-insurance/',
        'new_title': 'Switch Health Insurance Switzerland | Expert Guide 2025',
        'new_meta_description': 'Switch your Swiss health insurance with expert help. Independent FINMA-certified advice for expats — save money and improve coverage.',
        'new_h1': 'Switch Health Insurance Switzerland — Expert Guide',
        'notes': 'title too long, description too long'
    },
    {
        'page': 'https://expat-savvy.ch/blog/health-insurance-models-switzerland/',
        'new_title': 'Swiss Health Insurance Models | Expert Guide 2025',
        'new_meta_description': 'Compare Swiss health insurance models (HMO, GP, Telmed). Independent FINMA-certified advice for expats — find the best fit.',
        'new_h1': 'Swiss Health Insurance Models — Expert Guide',
        'notes': 'title too long, description too long, h1 too long'
    },
    {
        'page': 'https://expat-savvy.ch/blog/dental-insurance-expats-switzerland/',
        'new_title': 'Dental Insurance Switzerland | Expert Guide 2025',
        'new_meta_description': 'Find the best dental insurance in Switzerland for expats. Independent FINMA-certified advice — compare costs and coverage options.',
        'new_h1': 'Dental Insurance in Switzerland — Expert Guide',
        'notes': 'title too long'
    },
    {
        'page': 'https://expat-savvy.ch/blog/zurich-vs-zug-choosing-ideal-swiss-relocation-destination/',
        'new_title': 'Zurich vs Zug | Expert Comparison 2025',
        'new_meta_description': 'Compare Zurich vs Zug for expats relocating to Switzerland. Independent FINMA-certified advice — find your perfect Swiss city.',
        'new_h1': 'Zurich vs Zug — Expert Comparison',
        'notes': 'title too long, description too long, h1 too long'
    },
    {
        'page': 'https://expat-savvy.ch/blog/mental-health-services-switzerland/',
        'new_title': 'Mental Health Services Switzerland | Expert Guide 2025',
        'new_meta_description': 'Find mental health services in Switzerland for expats. Independent FINMA-certified advice — access therapy and support in English.',
        'new_h1': 'Mental Health Services in Switzerland — Expert Guide',
        'notes': 'title too long, description too long, h1 too long'
    },
    {
        'page': 'https://expat-savvy.ch/blog/maternity-newborn-insurance-switzerland/',
        'new_title': 'Maternity Insurance Switzerland | Expert Guide 2025',
        'new_meta_description': 'Find the best maternity insurance in Switzerland for expats. Independent FINMA-certified advice — secure coverage for your family.',
        'new_h1': 'Maternity Insurance in Switzerland — Expert Guide',
        'notes': 'title too long, description too long, h1 too long'
    },
    {
        'page': 'https://expat-savvy.ch/guides/how-to/pre-existing-conditions-health-insurance/',
        'new_title': 'Pre-existing Conditions Insurance | Expert Guide 2025',
        'new_meta_description': 'Get Swiss health insurance with pre-existing conditions. Independent FINMA-certified advice for expats — maximize acceptance chances.',
        'new_h1': 'Pre-existing Conditions Insurance — Expert Guide',
        'notes': 'title too long, description too long, duplicate pattern'
    },
    # Comparison pages
    {
        'page': 'https://expat-savvy.ch/compare-providers/swica-vs-helsana/',
        'new_title': 'Swica vs Helsana | Expert Comparison 2025',
        'new_meta_description': 'Compare Swica vs Helsana health insurance for expats. Independent FINMA-certified advice — find which fits your needs.',
        'new_h1': 'Swica vs Helsana — Expert Comparison',
        'notes': 'title too long, h1 too long'
    },
    {
        'page': 'https://expat-savvy.ch/compare-providers/css-vs-sanitas/',
        'new_title': 'CSS vs Sanitas | Expert Comparison 2025',
        'new_meta_description': 'Compare CSS vs Sanitas health insurance for expats. Independent FINMA-certified advice — find which fits your needs.',
        'new_h1': 'CSS vs Sanitas — Expert Comparison',
        'notes': 'title too long, h1 too long'
    },
    {
        'page': 'https://expat-savvy.ch/compare-providers/sanitas-vs-helsana/',
        'new_title': 'Sanitas vs Helsana | Expert Comparison 2025',
        'new_meta_description': 'Compare Sanitas vs Helsana health insurance for expats. Independent FINMA-certified advice — find which fits your needs.',
        'new_h1': 'Sanitas vs Helsana — Expert Comparison',
        'notes': 'title too long, h1 too long'
    },
    {
        'page': 'https://expat-savvy.ch/compare-providers/swica-vs-css/',
        'new_title': 'Swica vs CSS | Expert Comparison 2025',
        'new_meta_description': 'Compare Swica vs CSS health insurance for expats. Independent FINMA-certified advice — find which fits your needs.',
        'new_h1': 'Swica vs CSS — Expert Comparison',
        'notes': 'title too long'
    },
    {
        'page': 'https://expat-savvy.ch/compare-providers/helsana-vs-css/',
        'new_title': 'Helsana vs CSS | Expert Comparison 2025',
        'new_meta_description': 'Compare Helsana vs CSS health insurance for expats. Independent FINMA-certified advice — find which fits your needs.',
        'new_h1': 'Helsana vs CSS — Expert Comparison',
        'notes': 'title too long'
    },
    {
        'page': 'https://expat-savvy.ch/compare-providers/sanitas-vs-swica/',
        'new_title': 'Sanitas vs Swica | Expert Comparison 2025',
        'new_meta_description': 'Compare Sanitas vs Swica health insurance for expats. Independent FINMA-certified advice — find which fits your needs.',
        'new_h1': 'Sanitas vs Swica — Expert Comparison',
        'notes': 'title too long'
    },
    # Regional health insurance pages
    {
        'page': 'https://expat-savvy.ch/health-insurance/zurich/',
        'new_title': 'Health Insurance Zurich | Expert Guide 2025',
        'new_meta_description': 'Find the best health insurance in Zurich for expats. Independent FINMA-certified advice — compare premiums and models.',
        'new_h1': 'Health Insurance in Zurich — Expert Guide',
        'notes': 'title too long'
    },
    {
        'page': 'https://expat-savvy.ch/health-insurance/basel/',
        'new_title': 'Health Insurance Basel | Expert Guide 2025',
        'new_meta_description': 'Find the best health insurance in Basel for expats. Independent FINMA-certified advice — compare premiums and models.',
        'new_h1': 'Health Insurance in Basel — Expert Guide',
        'notes': 'title too long'
    },
    {
        'page': 'https://expat-savvy.ch/health-insurance/geneva/',
        'new_title': 'Health Insurance Geneva | Expert Guide 2025',
        'new_meta_description': 'Find the best health insurance in Geneva for expats. Independent FINMA-certified advice — compare premiums and models.',
        'new_h1': 'Health Insurance in Geneva — Expert Guide',
        'notes': 'title too long'
    },
    {
        'page': 'https://expat-savvy.ch/health-insurance/bern/',
        'new_title': 'Health Insurance Bern | Expert Guide 2025',
        'new_meta_description': 'Find the best health insurance in Bern for expats. Independent FINMA-certified advice — compare premiums and models.',
        'new_h1': 'Health Insurance in Bern — Expert Guide',
        'notes': 'title too long'
    },
    {
        'page': 'https://expat-savvy.ch/health-insurance/zug/',
        'new_title': 'Health Insurance Zug | Expert Guide 2025',
        'new_meta_description': 'Find the best health insurance in Zug for expats. Independent FINMA-certified advice — compare premiums and models.',
        'new_h1': 'Health Insurance in Zug — Expert Guide',
        'notes': 'title too long'
    },
    {
        'page': 'https://expat-savvy.ch/health-insurance/lausanne/',
        'new_title': 'Health Insurance Lausanne | Expert Guide 2025',
        'new_meta_description': 'Find the best health insurance in Lausanne for expats. Independent FINMA-certified advice — compare premiums and models.',
        'new_h1': 'Health Insurance in Lausanne — Expert Guide',
        'notes': 'title too long'
    },
    {
        'page': 'https://expat-savvy.ch/health-insurance/lugano/',
        'new_title': 'Health Insurance Lugano | Expert Guide 2025',
        'new_meta_description': 'Find the best health insurance in Lugano for expats. Independent FINMA-certified advice — compare premiums and models.',
        'new_h1': 'Health Insurance in Lugano — Expert Guide',
        'notes': 'title too long'
    },
    # Main pages
    {
        'page': 'https://expat-savvy.ch/healthcare/best-health-insurance-switzerland/',
        'new_title': 'Best Health Insurance Switzerland | Expert Guide 2025',
        'new_meta_description': 'Find the best Swiss health insurance for expats. Independent FINMA-certified advice — compare top providers and save money.',
        'new_h1': 'Best Health Insurance in Switzerland — Expert Guide',
        'notes': 'title too long'
    },
    {
        'page': 'https://expat-savvy.ch/healthcare/new-health-insurance/',
        'new_title': 'New Health Insurance Switzerland | Expert Guide 2025',
        'new_meta_description': 'Set up Swiss health insurance with expert help. Independent FINMA-certified advice for expats — avoid fines and save money.',
        'new_h1': 'New Health Insurance in Switzerland — Expert Guide',
        'notes': 'title too long'
    },
    {
        'page': 'https://expat-savvy.ch/',
        'new_title': 'Health Insurance Switzerland | Expert Guidance 2025',
        'new_meta_description': 'Find the best Swiss health insurance for expats. Independent FINMA-certified experts help you compare and choose — get expert help.',
        'new_h1': 'Your Trusted Health Insurance Partner in Switzerland',
        'notes': 'title too long'
    },
    # Additional insurer pages
    {
        'page': 'https://expat-savvy.ch/healthcare/all-insurances/atupri/',
        'new_title': 'Atupri Health Insurance Switzerland | Expert Guide 2025',
        'new_meta_description': 'Compare Atupri health insurance for expats. Independent FINMA-certified advice — find the best coverage and group discounts.',
        'new_h1': 'Atupri Health Insurance — Expert Guide',
        'notes': '✓ optimized'
    },
    {
        'page': 'https://expat-savvy.ch/healthcare/all-insurances/concordia/',
        'new_title': 'Concordia Health Insurance Switzerland | Expert Guide 2025',
        'new_meta_description': 'Compare Concordia health insurance for expats. Independent FINMA-certified advice — find the best coverage and group discounts.',
        'new_h1': 'Concordia Health Insurance — Expert Guide',
        'notes': '✓ optimized'
    },
    {
        'page': 'https://expat-savvy.ch/healthcare/all-insurances/groupe-mutuel/',
        'new_title': 'Groupe Mutuel Health Insurance Switzerland | Expert Guide 2025',
        'new_meta_description': 'Compare Groupe Mutuel health insurance for expats. Independent FINMA-certified advice — find the best coverage and group discounts.',
        'new_h1': 'Groupe Mutuel Health Insurance — Expert Guide',
        'notes': 'title too long'
    },
    {
        'page': 'https://expat-savvy.ch/healthcare/all-insurances/kpt/',
        'new_title': 'KPT Health Insurance Switzerland | Expert Guide 2025',
        'new_meta_description': 'Compare KPT health insurance for expats. Independent FINMA-certified advice — find the best coverage and group discounts.',
        'new_h1': 'KPT Health Insurance — Expert Guide',
        'notes': '✓ optimized'
    },
    {
        'page': 'https://expat-savvy.ch/healthcare/all-insurances/visana/',
        'new_title': 'Visana Health Insurance Switzerland | Expert Guide 2025',
        'new_meta_description': 'Compare Visana health insurance for expats. Independent FINMA-certified advice — find the best coverage and group discounts.',
        'new_h1': 'Visana Health Insurance — Expert Guide',
        'notes': '✓ optimized'
    },
    {
        'page': 'https://expat-savvy.ch/healthcare/all-insurances/sympany/',
        'new_title': 'Sympany Health Insurance Switzerland | Expert Guide 2025',
        'new_meta_description': 'Compare Sympany health insurance for expats. Independent FINMA-certified advice — find the best coverage and group discounts.',
        'new_h1': 'Sympany Health Insurance — Expert Guide',
        'notes': '✓ optimized'
    },
    # How-to guides
    {
        'page': 'https://expat-savvy.ch/guides/how-to/change-health-insurance/',
        'new_title': 'Change Health Insurance Switzerland | Expert Guide 2025',
        'new_meta_description': 'Learn how to change Swiss health insurance. Independent FINMA-certified advice for expats — step-by-step guidance.',
        'new_h1': 'Change Health Insurance in Switzerland — Expert Guide',
        'notes': '✓ optimized'
    },
    {
        'page': 'https://expat-savvy.ch/guides/how-to/add-family-health-insurance/',
        'new_title': 'Add Family Health Insurance Switzerland | Expert Guide 2025',
        'new_meta_description': 'Learn how to add family to Swiss health insurance. Independent FINMA-certified advice for expats — step-by-step guidance.',
        'new_h1': 'Add Family Health Insurance in Switzerland — Expert Guide',
        'notes': '✓ optimized'
    },
    {
        'page': 'https://expat-savvy.ch/guides/how-to/switch-health-insurance-providers/',
        'new_title': 'Switch Health Insurance Providers Switzerland | Expert Guide 2025',
        'new_meta_description': 'Learn how to switch Swiss health insurance providers. Independent FINMA-certified advice for expats — step-by-step guidance.',
        'new_h1': 'Switch Health Insurance Providers in Switzerland — Expert Guide',
        'notes': 'title too long'
    },
    {
        'page': 'https://expat-savvy.ch/guides/how-to/find-best-health-insurance/',
        'new_title': 'Find Best Health Insurance Switzerland | Expert Guide 2025',
        'new_meta_description': 'Learn how to find the best Swiss health insurance. Independent FINMA-certified advice for expats — step-by-step guidance.',
        'new_h1': 'Find Best Health Insurance in Switzerland — Expert Guide',
        'notes': '✓ optimized'
    },
    {
        'page': 'https://expat-savvy.ch/guides/how-to/insurance-when-moving-cantons/',
        'new_title': 'Insurance When Moving Cantons Switzerland | Expert Guide 2025',
        'new_meta_description': 'Learn about insurance when moving cantons in Switzerland. Independent FINMA-certified advice for expats — step-by-step guidance.',
        'new_h1': 'Insurance When Moving Cantons in Switzerland — Expert Guide',
        'notes': 'title too long'
    },
    {
        'page': 'https://expat-savvy.ch/guides/how-to/relocate-to-switzerland-step-by-step-checklist/',
        'new_title': 'Relocate to Switzerland Checklist | Expert Guide 2025',
        'new_meta_description': 'Learn how to relocate to Switzerland step-by-step. Independent FINMA-certified advice for expats — complete checklist.',
        'new_h1': 'Relocate to Switzerland Checklist — Expert Guide',
        'notes': 'title too long'
    },
    {
        'page': 'https://expat-savvy.ch/guides/how-to/finding-ideal-relocation-agency-switzerland/',
        'new_title': 'Find Relocation Agency Switzerland | Expert Guide 2025',
        'new_meta_description': 'Learn how to find the ideal relocation agency in Switzerland. Independent FINMA-certified advice for expats — step-by-step guidance.',
        'new_h1': 'Find Relocation Agency in Switzerland — Expert Guide',
        'notes': 'title too long'
    },
    {
        'page': 'https://expat-savvy.ch/guides/how-to/save-taxes-with-3a-pillar/',
        'new_title': 'Save Taxes with 3a Pillar Switzerland | Expert Guide 2025',
        'new_meta_description': 'Learn how to save taxes with 3a pillar in Switzerland. Independent FINMA-certified advice for expats — step-by-step guidance.',
        'new_h1': 'Save Taxes with 3a Pillar in Switzerland — Expert Guide',
        'notes': 'title too long'
    },
    {
        'page': 'https://expat-savvy.ch/guides/how-to/find-best-third-pillar/',
        'new_title': 'Find Best 3rd Pillar Switzerland | Expert Guide 2025',
        'new_meta_description': 'Learn how to find the best 3rd pillar in Switzerland. Independent FINMA-certified advice for expats — step-by-step guidance.',
        'new_h1': 'Find Best 3rd Pillar in Switzerland — Expert Guide',
        'notes': 'title too long'
    },
    {
        'page': 'https://expat-savvy.ch/guides/how-to/choose-health-insurance-deductible/',
        'new_title': 'Choose Health Insurance Deductible Switzerland | Expert Guide 2025',
        'new_meta_description': 'Learn how to choose health insurance deductible in Switzerland. Independent FINMA-certified advice for expats — step-by-step guidance.',
        'new_h1': 'Choose Health Insurance Deductible in Switzerland — Expert Guide',
        'notes': 'title too long'
    },
    {
        'page': 'https://expat-savvy.ch/guides/how-to/gym-coverage-health-insurance/',
        'new_title': 'Gym Coverage Health Insurance Switzerland | Expert Guide 2025',
        'new_meta_description': 'Learn how to get gym coverage with health insurance in Switzerland. Independent FINMA-certified advice for expats — step-by-step guidance.',
        'new_h1': 'Gym Coverage Health Insurance in Switzerland — Expert Guide',
        'notes': 'title too long'
    },
    {
        'page': 'https://expat-savvy.ch/guides/how-to/find-insurance-broker/',
        'new_title': 'Find Insurance Broker Switzerland | Expert Guide 2025',
        'new_meta_description': 'Learn how to find the right insurance broker in Switzerland. Independent FINMA-certified advice for expats — step-by-step guidance.',
        'new_h1': 'Find Insurance Broker in Switzerland — Expert Guide',
        'notes': 'title too long'
    },
    {
        'page': 'https://expat-savvy.ch/guides/how-to/change-insurance-models/',
        'new_title': 'Change Insurance Models Switzerland | Expert Guide 2025',
        'new_meta_description': 'Learn how to change insurance models in Switzerland. Independent FINMA-certified advice for expats — step-by-step guidance.',
        'new_h1': 'Change Insurance Models in Switzerland — Expert Guide',
        'notes': 'title too long'
    },
    {
        'page': 'https://expat-savvy.ch/guides/how-to/apply-premium-subsidies/',
        'new_title': 'Apply Premium Subsidies Switzerland | Expert Guide 2025',
        'new_meta_description': 'Learn how to apply for premium subsidies in Switzerland. Independent FINMA-certified advice for expats — step-by-step guidance.',
        'new_h1': 'Apply Premium Subsidies in Switzerland — Expert Guide',
        'notes': 'title too long'
    },
    {
        'page': 'https://expat-savvy.ch/guides/how-to/alternative-therapies-coverage/',
        'new_title': 'Alternative Therapies Coverage Switzerland | Expert Guide 2025',
        'new_meta_description': 'Learn about alternative therapies coverage in Switzerland. Independent FINMA-certified advice for expats — step-by-step guidance.',
        'new_h1': 'Alternative Therapies Coverage in Switzerland — Expert Guide',
        'notes': 'title too long'
    },
    {
        'page': 'https://expat-savvy.ch/guides/how-to/legal-requirements-health-insurance-deadlines/',
        'new_title': 'Legal Requirements Health Insurance Switzerland | Expert Guide 2025',
        'new_meta_description': 'Learn about legal requirements and deadlines for health insurance in Switzerland. Independent FINMA-certified advice for expats — step-by-step guidance.',
        'new_h1': 'Legal Requirements Health Insurance in Switzerland — Expert Guide',
        'notes': 'title too long'
    },
    {
        'page': 'https://expat-savvy.ch/guides/how-to/set-up-health-insurance/',
        'new_title': 'Set Up Health Insurance Switzerland | Expert Guide 2025',
        'new_meta_description': 'Learn how to set up health insurance in Switzerland. Independent FINMA-certified advice for expats — step-by-step guidance.',
        'new_h1': 'Set Up Health Insurance in Switzerland — Expert Guide',
        'notes': 'title too long'
    },
    # Insurance guides
    {
        'page': 'https://expat-savvy.ch/insurance-guides/student-insurance/',
        'new_title': 'Student Health Insurance Switzerland | Expert Guide 2025',
        'new_meta_description': 'Find the best health insurance for students in Switzerland. Independent FINMA-certified advice — compare Swisscare vs mandatory insurance.',
        'new_h1': 'Student Health Insurance in Switzerland — Expert Guide',
        'notes': 'title too long'
    },
    {
        'page': 'https://expat-savvy.ch/insurance-guides/family-insurance-planning/',
        'new_title': 'Family Insurance Planning Switzerland | Expert Guide 2025',
        'new_meta_description': 'Learn about family insurance planning in Switzerland. Independent FINMA-certified advice for expats — pregnancy and newborn coverage.',
        'new_h1': 'Family Insurance Planning in Switzerland — Expert Guide',
        'notes': 'title too long'
    },
    {
        'page': 'https://expat-savvy.ch/insurance-guides/cross-border-insurance/',
        'new_title': 'Cross-Border Insurance Switzerland | Expert Guide 2025',
        'new_meta_description': 'Learn about cross-border insurance in Switzerland. Independent FINMA-certified advice for expats — find the best coverage.',
        'new_h1': 'Cross-Border Insurance in Switzerland — Expert Guide',
        'notes': '✓ optimized'
    },
    {
        'page': 'https://expat-savvy.ch/insurance-guides/self-employed-insurance/',
        'new_title': 'Self-Employed Insurance Switzerland | Expert Guide 2025',
        'new_meta_description': 'Find the best insurance for self-employed in Switzerland. Independent FINMA-certified advice for expats — compare options and save money.',
        'new_h1': 'Self-Employed Insurance in Switzerland — Expert Guide',
        'notes': 'title too long'
    },
    {
        'page': 'https://expat-savvy.ch/insurance-guides/new-arrivals-checklist/',
        'new_title': 'New Arrivals Insurance Checklist Switzerland | Expert Guide 2025',
        'new_meta_description': 'Complete insurance checklist for new arrivals in Switzerland. Independent FINMA-certified advice for expats — get covered quickly.',
        'new_h1': 'New Arrivals Insurance Checklist in Switzerland — Expert Guide',
        'notes': 'title too long'
    },
    # Other insurance types
    {
        'page': 'https://expat-savvy.ch/insurance/personal-liability-insurance/',
        'new_title': 'Personal Liability Insurance Switzerland | Expert Guide 2025',
        'new_meta_description': 'Find the best personal liability insurance in Switzerland. Independent FINMA-certified advice for expats — compare providers and coverage.',
        'new_h1': 'Personal Liability Insurance in Switzerland — Expert Guide',
        'notes': 'title too long'
    },
    {
        'page': 'https://expat-savvy.ch/insurance/household-insurance/',
        'new_title': 'Household Insurance Switzerland | Expert Guide 2025',
        'new_meta_description': 'Find the best household insurance in Switzerland. Independent FINMA-certified advice for expats — protect your belongings and liability.',
        'new_h1': 'Household Insurance in Switzerland — Expert Guide',
        'notes': 'title too long'
    },
    {
        'page': 'https://expat-savvy.ch/insurance/legal-protection-insurance/',
        'new_title': 'Legal Protection Insurance Switzerland | Expert Guide 2025',
        'new_meta_description': 'Find the best legal protection insurance in Switzerland. Independent FINMA-certified advice for expats — compare providers and coverage.',
        'new_h1': 'Legal Protection Insurance in Switzerland — Expert Guide',
        'notes': 'title too long'
    },
    # System and general pages
    {
        'page': 'https://expat-savvy.ch/healthcare-system/',
        'new_title': 'Swiss Healthcare System | Expert Guide 2025',
        'new_meta_description': 'Understand the Swiss healthcare system. Independent FINMA-certified advice for expats — learn about insurance requirements and access.',
        'new_h1': 'Swiss Healthcare System — Expert Guide',
        'notes': '✓ optimized'
    },
    {
        'page': 'https://expat-savvy.ch/living-in-switzerland/',
        'new_title': 'Living in Switzerland | Expert Guide 2025',
        'new_meta_description': 'Complete guide to living in Switzerland for expats. Independent FINMA-certified advice — housing, healthcare, insurance, and daily life.',
        'new_h1': 'Living in Switzerland — Expert Guide',
        'notes': '✓ optimized'
    },
    {
        'page': 'https://expat-savvy.ch/life-insurance/',
        'new_title': 'Life Insurance Switzerland | Expert Guide 2025',
        'new_meta_description': 'Find the best life insurance in Switzerland for expats. Independent FINMA-certified advice — compare options and understand benefits.',
        'new_h1': 'Life Insurance in Switzerland — Expert Guide',
        'notes': '✓ optimized'
    },
    {
        'page': 'https://expat-savvy.ch/3rd-pillar/',
        'new_title': '3rd Pillar Switzerland | Expert Guide 2025',
        'new_meta_description': 'Learn about 3rd pillar (Pillar 3a) in Switzerland for expats. Independent FINMA-certified advice — maximize tax benefits and savings.',
        'new_h1': '3rd Pillar in Switzerland — Expert Guide',
        'notes': '✓ optimized'
    },
    {
        'page': 'https://expat-savvy.ch/pension-planning/',
        'new_title': 'Pension Planning Switzerland | Expert Guide 2025',
        'new_meta_description': 'Complete guide to pension planning in Switzerland for expats. Independent FINMA-certified advice — optimize your retirement savings.',
        'new_h1': 'Pension Planning in Switzerland — Expert Guide',
        'notes': '✓ optimized'
    },
    # Company pages
    {
        'page': 'https://expat-savvy.ch/about/',
        'new_title': 'About Expat Savvy | Swiss Insurance Experts',
        'new_meta_description': 'Learn about Expat Savvy, your trusted Swiss insurance experts. Independent FINMA-certified advisors helping expats navigate Swiss insurance.',
        'new_h1': 'About Expat Savvy — Swiss Insurance Experts',
        'notes': '✓ optimized'
    },
    {
        'page': 'https://expat-savvy.ch/careers/',
        'new_title': 'Careers at Expat Savvy | Join Our Team',
        'new_meta_description': 'Join the Expat Savvy team and help expats navigate Swiss insurance. Independent FINMA-certified advisors — career opportunities in Switzerland.',
        'new_h1': 'Careers at Expat Savvy — Join Our Team',
        'notes': '✓ optimized'
    },
    {
        'page': 'https://expat-savvy.ch/free-consultation/',
        'new_title': 'Free Insurance Consultation | Expat Savvy',
        'new_meta_description': 'Book your free Swiss insurance consultation with Expat Savvy. Independent FINMA-certified experts — get personalized advice for expats.',
        'new_h1': 'Free Insurance Consultation — Expat Savvy',
        'notes': '✓ optimized'
    },
    {
        'page': 'https://expat-savvy.ch/plan-healthcare/',
        'new_title': 'Plan Healthcare Switzerland | Expat Savvy',
        'new_meta_description': 'Plan your healthcare in Switzerland with Expat Savvy. Independent FINMA-certified experts — get personalized advice for expats.',
        'new_h1': 'Plan Healthcare in Switzerland — Expat Savvy',
        'notes': '✓ optimized'
    },
    {
        'page': 'https://expat-savvy.ch/ai-chat/',
        'new_title': 'AI Insurance Assistant | Expat Savvy',
        'new_meta_description': 'Get instant help with Swiss insurance questions from our AI assistant. Independent FINMA-certified experts — 24/7 support for expats.',
        'new_h1': 'AI Insurance Assistant — Expat Savvy',
        'notes': '✓ optimized'
    },
    {
        'page': 'https://expat-savvy.ch/imprint/',
        'new_title': 'Imprint | Expat Savvy',
        'new_meta_description': 'Legal information and company details for Expat Savvy, your trusted Swiss insurance advisor.',
        'new_h1': 'Imprint — Expat Savvy',
        'notes': '✓ optimized'
    },
    # Blog and news
    {
        'page': 'https://expat-savvy.ch/blog/',
        'new_title': 'Blog & Articles | Expat Savvy',
        'new_meta_description': 'Read our latest articles about Swiss insurance, expat life, and healthcare. Independent FINMA-certified advice from Expat Savvy.',
        'new_h1': 'Blog & Articles — Expat Savvy',
        'notes': '✓ optimized'
    },
    {
        'page': 'https://expat-savvy.ch/news/',
        'new_title': 'News & Updates | Expat Savvy',
        'new_meta_description': 'Latest news and updates about Swiss insurance and expat life. Independent FINMA-certified advice from Expat Savvy.',
        'new_h1': 'News & Updates — Expat Savvy',
        'notes': '✓ optimized'
    },
    {
        'page': 'https://expat-savvy.ch/news/guides/',
        'new_title': 'Expert Guides | Expat Savvy',
        'new_meta_description': 'Expert guides for insurance, healthcare, and living in Switzerland. Independent FINMA-certified advice from Expat Savvy.',
        'new_h1': 'Expert Guides — Expat Savvy',
        'notes': '✓ optimized'
    },
    {
        'page': 'https://expat-savvy.ch/news/regional-guides/',
        'new_title': 'Regional Guides | Expat Savvy',
        'new_meta_description': 'Regional guides for Swiss insurance by city. Independent FINMA-certified advice from Expat Savvy — Zurich, Geneva, Basel, and more.',
        'new_h1': 'Regional Guides — Expat Savvy',
        'notes': '✓ optimized'
    },
    # Directory pages
    {
        'page': 'https://expat-savvy.ch/insurance-guides/',
        'new_title': 'Insurance Guides Switzerland | Expat Savvy',
        'new_meta_description': 'Complete insurance guides for expats in Switzerland. Independent FINMA-certified advice — health, household, and liability insurance.',
        'new_h1': 'Insurance Guides Switzerland — Expat Savvy',
        'notes': '✓ optimized'
    },
    {
        'page': 'https://expat-savvy.ch/guides/how-to/',
        'new_title': 'How-To Guides Switzerland | Expat Savvy',
        'new_meta_description': 'Step-by-step how-to guides for Swiss insurance and expat life. Independent FINMA-certified advice from Expat Savvy.',
        'new_h1': 'How-To Guides Switzerland — Expat Savvy',
        'notes': '✓ optimized'
    },
    {
        'page': 'https://expat-savvy.ch/healthcare/all-insurances/',
        'new_title': 'Health Insurance Providers Switzerland | Expat Savvy',
        'new_meta_description': 'Compare Swiss health insurance providers. Independent FINMA-certified advice — find detailed information about coverage and premiums.',
        'new_h1': 'Health Insurance Providers Switzerland — Expat Savvy',
        'notes': '✓ optimized'
    },
    {
        'page': 'https://expat-savvy.ch/compare-providers/',
        'new_title': 'Compare Health Insurance Providers | Expat Savvy',
        'new_meta_description': 'Compare Swiss health insurance providers side-by-side. Independent FINMA-certified advice — find the best coverage for expats.',
        'new_h1': 'Compare Health Insurance Providers — Expat Savvy',
        'notes': '✓ optimized'
    },
    {
        'page': 'https://expat-savvy.ch/insurance-providers/',
        'new_title': 'Insurance Providers Switzerland | Expat Savvy',
        'new_meta_description': 'Directory of Swiss insurance providers. Independent FINMA-certified advice — find detailed information about coverage and premiums.',
        'new_h1': 'Insurance Providers Switzerland — Expat Savvy',
        'notes': '✓ optimized'
    },
    {
        'page': 'https://expat-savvy.ch/insurance-change-2025-2026/',
        'new_title': 'Insurance Change 2025/2026 | Expat Savvy',
        'new_meta_description': 'Complete guide to Swiss insurance changes for 2025/2026. Independent FINMA-certified advice — deadlines, switching, and savings.',
        'new_h1': 'Insurance Change 2025/2026 — Expat Savvy',
        'notes': '✓ optimized'
    },
    {
        'page': 'https://expat-savvy.ch/private-health-insurance-switzerland/',
        'new_title': 'Private Health Insurance Switzerland | Expat Savvy',
        'new_meta_description': 'Learn about private health insurance in Switzerland. Independent FINMA-certified advice — semi-private and private hospital coverage.',
        'new_h1': 'Private Health Insurance Switzerland — Expat Savvy',
        'notes': '✓ optimized'
    }
]

# Create DataFrame and save
result_df = pd.DataFrame(optimized_data)
result_df.to_csv('optimized_metadata_expatsavvy.csv', index=False)

print(f"✅ Generated optimized metadata for {len(optimized_data)} pages")
print(f"📊 Summary:")
print(f"   - Pages with title issues: {len([x for x in optimized_data if 'title too long' in x['notes']])}")
print(f"   - Pages with description issues: {len([x for x in optimized_data if 'description too long' in x['notes']])}")
print(f"   - Pages with duplicate patterns: {len([x for x in optimized_data if 'duplicate pattern' in x['notes']])}")
print(f"   - Pages optimized: {len([x for x in optimized_data if x['notes'] == '✓ optimized'])}")

# Show character count analysis
title_lengths = [len(x['new_title']) for x in optimized_data]
desc_lengths = [len(x['new_meta_description']) for x in optimized_data]
h1_lengths = [len(x['new_h1']) for x in optimized_data]

print(f"\n📏 Character Count Analysis:")
print(f"   - Titles: {min(title_lengths)}-{max(title_lengths)} chars (avg: {sum(title_lengths)/len(title_lengths):.1f})")
print(f"   - Descriptions: {min(desc_lengths)}-{max(desc_lengths)} chars (avg: {sum(desc_lengths)/len(desc_lengths):.1f})")
print(f"   - H1s: {min(h1_lengths)}-{max(h1_lengths)} chars (avg: {sum(h1_lengths)/len(h1_lengths):.1f})")

print(f"\n📋 Sample optimizations:")
for i, row in enumerate(optimized_data[:5]):
    print(f"\n{i+1}. {row['page']}")
    print(f"   Title: {row['new_title']} ({len(row['new_title'])} chars)")
    print(f"   Description: {row['new_meta_description']} ({len(row['new_meta_description'])} chars)")
    print(f"   H1: {row['new_h1']} ({len(row['new_h1'])} chars)")
    print(f"   Notes: {row['notes']}")
