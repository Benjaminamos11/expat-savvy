#!/usr/bin/env python3
"""
Script to apply metadata optimization from CSV to Astro pages
"""

import pandas as pd
import os
import re
from pathlib import Path

def read_csv_data():
    """Read the optimized metadata CSV"""
    try:
        df = pd.read_csv('optimized_metadata_expatsavvy.csv')
        return df
    except FileNotFoundError:
        print("Error: optimized_metadata_expatsavvy.csv not found")
        return None

def extract_page_path(url):
    """Extract page path from URL"""
    # Remove domain and trailing slash
    path = url.replace('https://expat-savvy.ch', '').rstrip('/')
    if not path:
        path = '/'
    return path

def find_astro_file(page_path):
    """Find the corresponding Astro file for a page path"""
    if page_path == '/':
        return 'src/pages/index.astro'
    
    # Remove leading slash
    path = page_path.lstrip('/')
    
    # Handle different page types
    if path.startswith('blog/'):
        # Blog posts
        slug = path.replace('blog/', '')
        return f'src/pages/blog/{slug}.astro'
    elif path.startswith('healthcare/all-insurances/'):
        # Insurance provider pages
        slug = path.replace('healthcare/all-insurances/', '')
        return f'src/pages/healthcare/all-insurances/{slug}/index.astro'
    elif path.startswith('compare-providers/'):
        # Comparison pages
        slug = path.replace('compare-providers/', '')
        return f'src/pages/compare-providers/{slug}/index.astro'
    elif path.startswith('health-insurance/'):
        # Regional pages
        slug = path.replace('health-insurance/', '')
        return f'src/pages/health-insurance/{slug}/index.astro'
    elif path.startswith('guides/how-to/'):
        # How-to guides
        slug = path.replace('guides/how-to/', '')
        return f'src/pages/guides/how-to/{slug}.astro'
    else:
        # Other pages
        if path.endswith('/'):
            path = path.rstrip('/')
        return f'src/pages/{path}.astro'

def update_astro_file(file_path, new_title, new_description, new_h1):
    """Update an Astro file with new metadata"""
    if not os.path.exists(file_path):
        print(f"Warning: File not found: {file_path}")
        return False
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Update title in Layout component
        title_pattern = r'title="[^"]*"'
        if re.search(title_pattern, content):
            content = re.sub(title_pattern, f'title="{new_title}"', content)
        else:
            print(f"Warning: No title found in {file_path}")
        
        # Update description in Layout component
        desc_pattern = r'description="[^"]*"'
        if re.search(desc_pattern, content):
            content = re.sub(desc_pattern, f'description="{new_description}"', content)
        else:
            print(f"Warning: No description found in {file_path}")
        
        # Update H1 tag
        h1_pattern = r'<h1[^>]*>[^<]*</h1>'
        if re.search(h1_pattern, content):
            content = re.sub(h1_pattern, f'<h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">{new_h1}</h1>', content)
        else:
            print(f"Warning: No H1 found in {file_path}")
        
        # Write updated content
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"Updated: {file_path}")
        return True
        
    except Exception as e:
        print(f"Error updating {file_path}: {e}")
        return False

def main():
    """Main function to apply metadata optimization"""
    print("Reading optimized metadata...")
    df = read_csv_data()
    
    if df is None:
        return
    
    print(f"Found {len(df)} pages to update")
    
    updated_count = 0
    skipped_count = 0
    
    for index, row in df.iterrows():
        page_url = row['page']
        new_title = row['new_title']
        new_description = row['new_meta_description']
        new_h1 = row['new_h1']
        notes = row['notes']
        
        # Skip if no changes needed
        if notes == "✓":
            skipped_count += 1
            continue
        
        # Extract page path and find Astro file
        page_path = extract_page_path(page_url)
        astro_file = find_astro_file(page_path)
        
        print(f"\nProcessing: {page_url}")
        print(f"File: {astro_file}")
        print(f"New title: {new_title}")
        print(f"New description: {new_description}")
        print(f"New H1: {new_h1}")
        
        # Update the file
        if update_astro_file(astro_file, new_title, new_description, new_h1):
            updated_count += 1
        else:
            skipped_count += 1
    
    print(f"\n=== Summary ===")
    print(f"Updated: {updated_count} files")
    print(f"Skipped: {skipped_count} files")
    print(f"Total processed: {len(df)} files")

if __name__ == "__main__":
    main()
