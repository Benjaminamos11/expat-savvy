#!/bin/bash
# Script to find potential broken links in the codebase

echo "=== Searching for potential broken links in the codebase ==="
echo

# Define common patterns for internal links that might be broken
PATTERNS=(
  "/contact"
  "/guides/relocation/zurich-vs-zug-comparison"
  "/guides/relocation/zurich-relocation-costs"
  "/healthcare/glossary/supplementary-insurance"
  "/guides/how-to/relocate-to-switzerland-step-by-step-checklist"
  "/guides/how-to/finding-ideal-relocation-agency-switzerland"
)

# Function to search for a pattern in content files
search_pattern() {
  local pattern=$1
  echo "Searching for: $pattern"
  echo "===================="
  
  # Check in Markdown files
  grep -r "$pattern" --include="*.md" src/content 2>/dev/null
  
  # Check in Astro files
  grep -r "$pattern" --include="*.astro" src 2>/dev/null
  
  echo
}

# Search for each pattern
for pattern in "${PATTERNS[@]}"; do
  search_pattern "$pattern"
done

# Find links to non-existing pages
echo "=== Checking for links to potentially non-existing pages ==="
echo

# Extract all internal links
echo "Extracting all internal links..."
grep -r -o -E '\/([\w-]+\/)+[\w-]+' --include="*.md" --include="*.astro" src | grep -v "node_modules" | sort | uniq > all_links.txt

# Get a list of actual pages (this is approximate and may need adjustment)
echo "Listing actual pages..."
find src/pages -type f -name "*.astro" | sed 's/src\/pages//' | sed 's/\.astro$//' | sed 's/\/index$/\//' | sort > actual_pages.txt
find src/content -type f -name "*.md" | sed 's/src\/content//' | sed 's/\.md$//' | sort >> actual_pages.txt

# Compare links with actual pages (this is a simplistic approach and will have false positives)
echo "Potential links to non-existing pages:"
echo "======================================"
while read -r link; do
  # Skip certain paths that are handled dynamically
  if [[ $link == "/blog/"* ]] || [[ $link == "/assets/"* ]] || [[ $link == "/images/"* ]] || [[ $link == "/css/"* ]] || [[ $link == "/js/"* ]]; then
    continue
  fi
  
  # Check if the link exists in actual pages
  if ! grep -q "$link" actual_pages.txt; then
    echo "$link"
    grep -r "$link" --include="*.md" --include="*.astro" src | grep -v "node_modules" | head -3
    echo
  fi
done < all_links.txt

# Clean up temporary files
rm all_links.txt actual_pages.txt

echo "=== Link check complete ===" 