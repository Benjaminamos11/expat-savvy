#!/bin/bash

# Daily ETL Job for Expat Savvy Phase A
# Runs Plausible and GSC ETL daily at 6 AM UTC

# Set the API endpoint and credentials
API_URL="https://expat-savvy-api.fly.dev"
ADMIN_USER="admin"
ADMIN_PASS="phase_a_2025"

# Log file for monitoring
LOG_FILE="/var/log/expat-savvy-etl.log"

# Function to log with timestamp
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

log "Starting daily ETL job"

# Run full ETL (Plausible + GSC)
response=$(curl -s -X POST "${API_URL}/api/etl/full" \
    -H "Content-Type: application/json" \
    -d '{}' \
    -u "${ADMIN_USER}:${ADMIN_PASS}")

# Log the response
log "ETL Response: $response"

# Check if successful
if echo "$response" | grep -q '"success":true'; then
    log "ETL job completed successfully"
else
    log "ETL job failed or had issues"
    # Optional: Send alert email or Slack notification here
fi

log "ETL job finished"

