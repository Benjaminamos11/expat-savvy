# Expat Savvy Tracking & Consent Setup

## What We've Accomplished

### 1. Google Tag Manager
- ✅ Implemented GTM container ID: GTM-NC6FSJTW
- ✅ Set up proper initialization in BaseLayout.astro
- ✅ Created custom data layer implementation for enhanced tracking

### 2. GDPR Consent Management
- ✅ Created custom consent banner implementation
- ✅ Added privacy settings modal in footer
- ✅ Implemented Google Consent Mode integration
- ✅ Setup proper cookie handling with 6-month expiration

### 3. Retargeting Setup
- ✅ Created page type detection for different insurance categories
- ✅ Implemented event tracking for consultation steps
- ✅ Added Facebook Pixel integration via GTM
- ✅ Created basic audience segmentation infrastructure

### 4. Analytics Implementation
- ✅ Created GA4 configuration in GTM
- ✅ Set up consent-aware analytics tracking
- ✅ Added enhanced data collection (page types, user intent)

## Outstanding Tasks

### 1. Fix Google Analytics Verification
- ❌ **URGENT**: Fix GA4 measurement ID mismatch (G-B6PD4JQ5SG vs G-D6HZDXVNK3)
- ❌ Ensure only one GA4 implementation is active
- ❌ Add verification code to bypass consent temporarily for verification
- ❌ Check if verification passes after these changes
- ❌ Consider direct HTML implementation if GTM version continues to fail

### 2. Facebook Pixel Verification
- ❌ Verify Facebook Pixel is firing correctly
- ❌ Check custom events are passing correctly (InsuranceView, etc.)
- ❌ Create Facebook custom audiences based on events

### 3. LinkedIn Implementation
- ❌ Add correct LinkedIn Partner ID to script
- ❌ Verify LinkedIn tracking is working
- ❌ Set up conversion tracking for consultations

### 4. GTM Configuration Cleanup
- ❌ Remove duplicate/conflicting tags
- ❌ Ensure proper tag firing order (consent first, then analytics)
- ❌ Test all events in GTM preview mode

### 5. Testing & Validation
- ❌ Test consent banner on live site
- ❌ Verify cookie settings are saved correctly
- ❌ Check if retargeting audiences are populating
- ❌ Monitor GA4 real-time reporting

## Technical Details & Code References

### Google Tag Manager Setup
The main GTM implementation is in `src/layouts/BaseLayout.astro`:

```html
<!-- Consent Management (must be before GTM) -->
<script is:inline src="/scripts/consent/gtm-consent-init.js"></script>

<!-- Google Tag Manager -->
<script is:inline>
(function(w,d,s,l,i){
  w[l]=w[l]||[];
  w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
  var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),
      dl=l!='dataLayer'?'&l='+l:'';
  j.async=true;
  j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
  if (f && f.parentNode) f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-NC6FSJTW'); 
</script>
```

### Consent Management
The consent system consists of three main files:
- `/public/scripts/consent/gtm-consent-init.js`: Initializes consent mode
- `/public/scripts/consent/consent-banner.js`: UI for the consent banner
- `/public/scripts/consent/privacy-settings.js`: Settings modal in footer

### GA4 Configuration Fix
In GTM, edit the "GA4 - Configuration" tag to use the correct measurement ID:

```javascript
gtag('config', 'G-B6PD4JQ5SG'); // Use this ID consistently
```

### Verification Helper
For GA4 verification, temporarily add this code:

```javascript
// Force analytics consent to be granted (temporarily)
gtag('consent', 'update', {
  'analytics_storage': 'granted'
});
```

## Notes & Next Steps

- **The consent banner** should appear for new visitors but might not show if you've previously accepted cookies
- **GA4 verification** will likely succeed after fixing the ID mismatch and ensuring consent doesn't block verification
- **For retargeting** to work effectively, we need to finish audience setup in ad platforms after verifying tracking works
- **Documentation** of the full tracking implementation is available in the codebase comments

This project uses a fully custom consent management solution rather than a third-party provider, giving us complete control over the GDPR implementation while maintaining compatibility with Google's requirements. 