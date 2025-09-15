# Environment Variables Documentation

This document lists all environment variables used by the Expat Savvy Lead Platform.

## Required Variables (Core Platform)

```bash
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Analytics
PLAUSIBLE_DOMAIN=expat-savvy.ch
PLAUSIBLE_API_KEY=your-plausible-api-key-here

# Authentication
ADMIN_USER=admin
ADMIN_PASS=changeme123
```

## Phase A - Data Foundation (New Variables)

```bash
# Google Search Console Integration
GSC_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project",...}
GSC_PROPERTY_URL=https://expat-savvy.ch/

# ETL Configuration
ETL_ENABLED=true
ETL_HOUR_UTC=6
PLAUSIBLE_ETL_DAYS_HISTORY=90
```

## Optional Variables

```bash
# Email
EMAIL_PROVIDER=resend
EMAIL_API_KEY=your-email-api-key-here
FROM_EMAIL=hello@expat-savvy.ch

# Cal.com
CAL_LINK=https://cal.com/expat-savvy
CALCOM_WEBHOOK_SECRET=your-webhook-secret-here
```

## Future Phases (For Reference)

### Phase B - LLM Integration
```bash
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-key-here
OPENAI_API_KEY=sk-your-openai-key-here
```

### Phase C - Ad Platforms
```bash
GOOGLE_ADS_CLIENT_ID=your-client-id
META_ACCESS_TOKEN=your-meta-access-token
LINKEDIN_CLIENT_ID=your-linkedin-client-id
```

## Setting Up Environment Variables

### For Fly.io Deployment
```bash
# Set individual secrets
fly secrets set SUPABASE_URL=https://your-project.supabase.co
fly secrets set PLAUSIBLE_API_KEY=your-api-key

# For JSON variables, use single quotes
fly secrets set GSC_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'

# List all secrets
fly secrets list
```

### For Local Development
1. Create `.env` file in backend directory
2. Copy variables from this documentation
3. Fill in actual values
4. Never commit `.env` to git

## Security Notes

- Never commit actual secrets to git
- Use strong, unique passwords
- Rotate API keys regularly
- Use least-privilege access for service accounts
- Monitor logs for suspicious activity

