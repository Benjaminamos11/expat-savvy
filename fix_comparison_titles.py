#!/usr/bin/env python3
"""
Script to fix hero title styling on all comparison pages
"""

import os
import re
from pathlib import Path

def fix_comparison_page_titles(file_path):
    """Fix hero title styling in a comparison page"""
    if not os.path.exists(file_path):
        return False
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Fix mobile H1 title
        mobile_pattern = r'<h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">'
        mobile_replacement = '<h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 animate-fade-in text-shadow leading-tight">'
        content = re.sub(mobile_pattern, mobile_replacement, content)
        
        # Fix desktop H2 title  
        desktop_pattern = r'<h2 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">'
        desktop_replacement = '<h2 class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 animate-fade-in text-shadow leading-tight">'
        content = re.sub(desktop_pattern, desktop_replacement, content)
        
        # Also fix any H1 with text-gray-900 that might be in hero sections
        hero_h1_pattern = r'<h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">'
        hero_h1_replacement = '<h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 animate-fade-in text-shadow leading-tight">'
        content = re.sub(hero_h1_pattern, hero_h1_replacement, content)
        
        # Write updated content
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"Fixed hero titles in: {file_path}")
        return True
        
    except Exception as e:
        print(f"Error fixing {file_path}: {e}")
        return False

def main():
    """Main function to fix all comparison pages"""
    comparison_pages = [
        'src/pages/compare-providers/css-vs-sanitas/index.astro',
        'src/pages/compare-providers/sanitas-vs-helsana/index.astro',
        'src/pages/compare-providers/sanitas-vs-swica/index.astro',
        'src/pages/compare-providers/swica-vs-css/index.astro',
        'src/pages/compare-providers/swica-vs-sanitas/index.astro',
        'src/pages/compare-providers/helsana-vs-css/index.astro',
    ]
    
    fixed_count = 0
    
    for file_path in comparison_pages:
        if fix_comparison_page_titles(file_path):
            fixed_count += 1
    
    print(f"\n=== Summary ===")
    print(f"Fixed hero titles in: {fixed_count} comparison pages")

if __name__ == "__main__":
    main()
