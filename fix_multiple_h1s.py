#!/usr/bin/env python3
"""
Script to fix multiple H1 tags by converting second+ H1s to H2s
"""

import os
import re
from pathlib import Path

def fix_multiple_h1s(file_path):
    """Fix multiple H1 tags in a file"""
    if not os.path.exists(file_path):
        return False
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find all H1 tags
        h1_pattern = r'<h1[^>]*>.*?</h1>'
        h1_matches = list(re.finditer(h1_pattern, content, re.DOTALL))
        
        if len(h1_matches) <= 1:
            return False  # No multiple H1s to fix
        
        print(f"Found {len(h1_matches)} H1 tags in {file_path}")
        
        # Convert all H1s except the first one to H2s
        for i, match in enumerate(h1_matches):
            if i == 0:
                continue  # Keep the first H1
            
            # Replace H1 with H2
            h1_content = match.group(0)
            h2_content = h1_content.replace('<h1', '<h2').replace('</h1>', '</h2>')
            content = content.replace(h1_content, h2_content)
        
        # Write updated content
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"Fixed multiple H1s in: {file_path}")
        return True
        
    except Exception as e:
        print(f"Error fixing {file_path}: {e}")
        return False

def main():
    """Main function to fix multiple H1s"""
    # List of files that likely have multiple H1s
    files_to_check = [
        'src/pages/compare-providers/helsana-vs-css/index.astro',
        'src/pages/compare-providers/sanitas-vs-helsana/index.astro',
        'src/pages/compare-providers/sanitas-vs-swica/index.astro',
        'src/pages/compare-providers/swica-vs-css/index.astro',
        'src/pages/compare-providers/swica-vs-sanitas/index.astro',
    ]
    
    fixed_count = 0
    
    for file_path in files_to_check:
        if fix_multiple_h1s(file_path):
            fixed_count += 1
    
    print(f"\n=== Summary ===")
    print(f"Fixed multiple H1s in: {fixed_count} files")

if __name__ == "__main__":
    main()
