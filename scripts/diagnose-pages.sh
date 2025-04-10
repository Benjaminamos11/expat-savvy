#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Log file
LOG_FILE="astro-diagnostic.log"

# Function to check file existence and content
check_file() {
    local file_path=$1
    local file_type=$2
    
    echo -e "\n${YELLOW}Checking $file_type file: $file_path${NC}"
    
    if [ -f "$file_path" ]; then
        echo -e "${GREEN}✓ File exists${NC}"
        echo -e "\nFile contents:"
        echo "----------------------------------------"
        cat "$file_path"
        echo "----------------------------------------"
    else
        echo -e "${RED}✗ File does not exist${NC}"
        # List directory contents if file doesn't exist
        local dir_path=$(dirname "$file_path")
        if [ -d "$dir_path" ]; then
            echo -e "\nContents of directory ${dir_path}:"
            ls -la "$dir_path"
        else
            echo -e "\nDirectory ${dir_path} does not exist"
        fi
    fi
}

# Clear or create log file
> "$LOG_FILE"

echo "=== Astro Page Diagnostic Script ==="
echo "Started at: $(date)"
echo

# Array of source files to check
declare -a src_files=(
    "src/pages/3rd-pillar.astro"
    "src/pages/news/regional-guides/zurich.astro"
    "src/pages/news/regional-guides/geneva.astro"
    "src/pages/news/regional-guides/zug.astro"
    "src/pages/news/regional-guides/basel.astro"
    "src/pages/news/regional-guides/bern.astro"
    "src/pages/news/regional-guides/lausanne.astro"
    "src/pages/news/regional-guides/lugano.astro"
)

# Array of corresponding dist files
declare -a dist_files=(
    "dist/3rd-pillar/index.html"
    "dist/news/regional-guides/zurich/index.html"
    "dist/news/regional-guides/geneva/index.html"
    "dist/news/regional-guides/zug/index.html"
    "dist/news/regional-guides/basel/index.html"
    "dist/news/regional-guides/bern/index.html"
    "dist/news/regional-guides/lausanne/index.html"
    "dist/news/regional-guides/lugano/index.html"
)

# Check source files
echo "=== Checking Source Files ==="
for file in "${src_files[@]}"; do
    check_file "$file" "Source"
done

# Run astro build and capture output
echo -e "\n=== Running Astro Build ==="
echo "Building project... (This may take a moment)"
npm run build 2>&1 | tee -a "$LOG_FILE"

# Check if build was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build completed successfully${NC}"
else
    echo -e "${RED}✗ Build failed - check $LOG_FILE for details${NC}"
fi

# Check dist files
echo -e "\n=== Checking Generated Files ==="
for file in "${dist_files[@]}"; do
    check_file "$file" "Generated"
done

echo -e "\n=== Diagnostic Summary ==="
echo "Log file created at: $LOG_FILE"
echo "Completed at: $(date)"