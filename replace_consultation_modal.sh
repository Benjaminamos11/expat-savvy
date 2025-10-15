#!/bin/bash

echo "🔄 Replacing old ConsultationModal with new OffersModal..."

# Find all files that import ConsultationModal
files=$(find src/pages -name "*.astro" -exec grep -l "ConsultationModal" {} \;)

for file in $files; do
    echo "Processing: $file"
    
    # Replace import statements
    sed -i '' 's/import ConsultationModal from.*ConsultationModal\.astro.*;/import OffersModal from "..\/..\/components\/OffersModal.astro";/' "$file"
    sed -i '' 's/import ConsultationModal from.*ConsultationModal\.astro.*;/import OffersModal from "..\/..\/..\/components\/OffersModal.astro";/' "$file"
    sed -i '' 's/import ConsultationModal from.*ConsultationModal\.astro.*;/import OffersModal from "..\/..\/..\/..\/components\/OffersModal.astro";/' "$file"
    
    # Replace component usage
    sed -i '' 's/<ConsultationModal \/>/<OffersModal \/>/' "$file"
    
    echo "✅ Updated: $file"
done

echo "🎉 All ConsultationModal imports replaced with OffersModal!"
echo "📊 Files updated: $(find src/pages -name "*.astro" -exec grep -l "OffersModal" {} \; | wc -l | tr -d ' ')"


