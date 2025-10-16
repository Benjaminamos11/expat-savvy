#!/bin/bash
# Run the test email script on Fly.io
fly ssh console --app expat-savvy-api --command "cd /app && python3 send_test_emails.py"
