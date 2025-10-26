# App Store Submission Guide

Complete guide for submitting Three Steps to Apple App Store and Google Play Store.

---

## Table of Contents
1. [Pre-Submission Checklist](#pre-submission-checklist)
2. [App Icon & Screenshots](#app-icon--screenshots)
3. [Apple App Store Submission](#apple-app-store-submission)
4. [Google Play Store Submission](#google-play-store-submission)
5. [App Store Metadata](#app-store-metadata)
6. [Review Guidelines](#review-guidelines)
7. [Post-Submission](#post-submission)

---

## Pre-Submission Checklist

### ✅ Required Before Submission

#### Legal Documents
- [ ] Privacy Policy hosted at accessible URL
- [ ] Terms of Service hosted at accessible URL
- [ ] Support email set up (support@threesteps.app)
- [ ] Company/developer information ready

#### Technical Requirements
- [ ] All features working on production build
- [ ] No crashes or critical bugs
- [ ] App tested on multiple devices/OS versions
- [ ] All permissions properly described
- [ ] Links in app work correctly
- [ ] Supabase production database set up
- [ ] Environment variables configured for production

#### Assets Ready
- [ ] App icon (1024x1024px PNG)
- [ ] Screenshots for all required device sizes
- [ ] Promotional graphics
- [ ] Feature graphic (Android)
- [ ] App preview videos (optional but recommended)

#### Accounts & Memberships
- [ ] Apple Developer Program membership ($99/year)
- [ ] Google Play Developer account ($25 one-time)
- [ ] Expo account created
- [ ] EAS CLI installed

---

## App Icon & Screenshots

### App Icon Requirements

#### iOS
- **Size**: 1024x1024px
- **Format**: PNG (no alpha channel)
- **Color Space**: RGB
- **No rounded corners**: iOS applies them automatically

#### Android
- **Adaptive Icon Foreground**: 1024x1024px PNG (safe area: 512x512px center)
- **Background**: Solid color #10b981 (already set in app.json)
- **Legacy Icon**: 512x512px PNG

### Creating Your Icon

Use a design tool (Figma, Canva, Adobe Illustrator) or hire a designer on Fiverr ($15-50).

**Icon Design Guidelines**:
- Simple, recognizable at small sizes
- Represents grocery/shopping theme
- Use Three Steps brand color #10b981 (green)
- Consider: shopping cart, steps (1-2-3), grocery bag, receipt icons

**Where to save**:
```
assets/images/icon.png          (1024x1024)
assets/images/adaptive-icon.png (1024x1024 for Android)
assets/images/splash.png        (1284x2778 recommended)
assets/images/favicon.png       (48x48 for web)
```

### Screenshot Requirements

#### iOS Screenshots Needed

**iPhone 6.9" (Required)**
- Size: 1290 x 2796 pixels
- Devices: iPhone 15 Pro Max, 14 Pro Max

**iPhone 6.7" (Required)**
- Size: 1290 x 2796 pixels
- Devices: iPhone 15 Plus, 14 Plus, 13 Pro Max, 12 Pro Max

**iPad Pro 12.9" (Required if supporting iPad)**
- Size: 2048 x 2732 pixels
- Devices: iPad Pro 12.9" (all generations)

**Minimum**: 3-5 screenshots per device size
**Maximum**: 10 screenshots

#### Android Screenshots Needed

**Phone**
- Size: 1080 x 1920 pixels (minimum)
- Recommended: 1440 x 2560 pixels or higher

**7-inch Tablet** (if supporting)
- Size: 1200 x 1920 pixels (minimum)

**10-inch Tablet** (if supporting)
- Size: 1536 x 2048 pixels (minimum)

**Minimum**: 2 screenshots
**Maximum**: 8 screenshots
**Recommended**: 4-6 screenshots

### What to Screenshot

Capture these key screens:

1. **Home Screen** - Shows "Start Grocery" call-to-action
2. **Product Scanning** - Camera view with barcode/QR scanning
3. **Product Details** - Form with product photo
4. **Shopping Cart** - Items with spending limit indicator
5. **Analytics** - Charts and insights
6. **History** - Past shopping trips

**Screenshot Tips**:
- Use device frames for professional look
- Add descriptive text overlays
- Show realistic data (not empty screens)
- Highlight key features
- Keep text readable
- Use consistent style across all screenshots

**Tools for Screenshots**:
- [Figma](https://figma.com) with device mockup plugins
- [Shotsnapp](https://shotsnapp.com) - Free device mockups
- [AppMockUp](https://app-mockup.com)
- iOS Simulator + Screenshot (cmd+S)
- Android Emulator + Screenshot

---

## Apple App Store Submission

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

### Step 2: Configure EAS

```bash
# Initialize EAS project
eas build:configure

# Update app.json with your details:
# - Change "owner" to your Expo username
# - Get EAS project ID: eas project:init
```

### Step 3: Update eas.json

Edit `eas.json` production section:
```json
{
  "production": {
    "env": {
      "EXPO_PUBLIC_SUPABASE_URL": "your-production-supabase-url",
      "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-production-anon-key"
    }
  }
}
```

### Step 4: Build for iOS

```bash
# First build (generates credentials)
eas build --platform ios --profile production

# This will:
# - Generate Apple push notification key
# - Create distribution certificate
# - Create provisioning profile
# - Build the app
# - Upload to EAS servers
```

### Step 5: App Store Connect Setup

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - **Platform**: iOS
   - **Name**: Three Steps
   - **Primary Language**: English
   - **Bundle ID**: com.threesteps.app
   - **SKU**: threesteps-app-001
   - **User Access**: Full Access

### Step 6: App Information

**Category**:
- Primary: Shopping
- Secondary: Lifestyle

**Content Rights**: Your app does not use third-party content

**Age Rating**:
- None: No frequent/intense content
- Age: 4+

**Copyright**: © 2025 [Your Name/Company]

**Trade Representative Contact**: Your contact info

### Step 7: Pricing and Availability

- **Price**: Free
- **Availability**: All countries (or select specific ones)
- **Pre-order**: No

### Step 8: App Privacy

Click "App Privacy" → "Get Started"

**Data Collection**:

**Contact Info**
- Email Address
  - Used for: App functionality (account creation)
  - Linked to user: Yes
  - Used for tracking: No

**Location**
- Precise Location
  - Used for: App functionality (store tracking)
  - Linked to user: Yes
  - Used for tracking: No

**Purchases**
- Purchase History
  - Used for: App functionality (price tracking)
  - Linked to user: Yes
  - Used for tracking: No

**Photos**
- Photos
  - Used for: App functionality (product photos)
  - Linked to user: Yes
  - Used for tracking: No

**Privacy Policy URL**: https://yourwebsite.com/privacy

### Step 9: App Review Information

- **Sign-in required**: Yes
- **Demo Account**:
  - Username: reviewer@threesteps.app
  - Password: [Create a test account with sample data]
  - **Important**: Create this account and add sample shopping data

**Notes for Reviewer**:
```
Thank you for reviewing Three Steps!

To test the app:
1. Sign in with the provided demo account
2. The account has sample shopping data pre-loaded
3. To scan products: use any barcode or QR code, or enter manually
4. Camera permission is needed for barcode scanning and photos
5. Location permission is optional for store tracking

Key features to review:
- Start a new grocery session (Home → Start Grocery)
- Scan a product (Grocery tab)
- Manage cart (Cart tab)
- View analytics (Analytics tab)
- Review history (History tab)

Contact: support@threesteps.app for any questions.
```

### Step 10: Version Information

- **Version**: 1.0.0
- **Copyright**: © 2025 [Your Name/Company]
- **What's New in This Version**:
  ```
  Welcome to Three Steps!

  • Track your grocery shopping in real-time
  • Scan products and capture photos
  • Set spending limits and stay on budget
  • Compare prices across stores
  • View detailed analytics of your shopping habits
  • Review your purchase history

  Start making smarter shopping decisions today!
  ```

### Step 11: App Description

**Subtitle** (30 characters max):
```
Smart Grocery Shopping Tracker
```

**Description** (4000 characters max):
```
Three Steps helps you take control of your grocery shopping with smart tracking, budgeting, and price comparison.

TRACK EVERY PURCHASE
Scan product barcodes, capture photos, and log prices as you shop. Build your personal product database and never wonder what you paid again.

STAY ON BUDGET
Set spending limits for each shopping trip. Three Steps shows you your total in real-time and alerts you when you're approaching your budget.

COMPARE PRICES
See how prices change over time and across different stores. Find the best deals and save money on your regular purchases.

SHOPPING ANALYTICS
Understand your shopping patterns with detailed analytics:
• Total spending by month
• Most purchased products
• Price trends
• Store comparisons
• Smart recommendations

FEATURES:
✓ Barcode & QR code scanning
✓ Product photo capture
✓ Shopping session management
✓ Real-time cart total tracking
✓ Spending limit alerts
✓ Price comparison across stores
✓ Purchase history
✓ Shopping analytics
✓ Budget insights

PERFECT FOR:
• Budget-conscious shoppers
• Meal planners
• Coupon enthusiasts
• Anyone wanting to save money on groceries

HOW IT WORKS:
1. Start a shopping session with your budget
2. Scan products as you shop
3. Add items to your cart
4. Complete checkout when done
5. Review your analytics and insights

PRIVACY FIRST:
Your shopping data is private and secure. We don't sell your data or share it with retailers. You're in complete control.

Start making smarter shopping decisions with Three Steps today!

Questions or feedback? Email support@threesteps.app
```

**Keywords** (100 characters max):
```
grocery,shopping,budget,price tracker,barcode scanner,shopping list,expense,deals,savings,cart
```

**Support URL**: https://yourwebsite.com/support

**Marketing URL** (optional): https://yourwebsite.com

### Step 12: Upload Build

1. After `eas build` completes, download .ipa file
2. Upload to App Store Connect:
   - Option A: Use EAS Submit: `eas submit --platform ios`
   - Option B: Use Transporter app (download from Mac App Store)
3. Wait for processing (15-60 minutes)

### Step 13: Submit for Review

1. Select the build
2. Review all information
3. Click "Add for Review"
4. Click "Submit to App Review"

**Review Time**: Typically 24-48 hours

---

## Google Play Store Submission

### Step 1: Build for Android

```bash
# Build Android App Bundle (.aab)
eas build --platform android --profile production
```

### Step 2: Google Play Console Setup

1. Go to [Google Play Console](https://play.google.com/console)
2. Pay $25 one-time registration fee (if first app)
3. Create application → "Create app"

### Step 3: App Details

**App Name**: Three Steps

**Short Description** (80 characters):
```
Smart grocery shopping tracker with budget management and price comparison
```

**Full Description** (4000 characters):
```
[Same as iOS description above]
```

**Category**: Shopping

**Tags**: shopping, grocery, budget, price tracker

**Email**: support@threesteps.app

**Phone** (optional): Your phone number

**Website** (optional): https://yourwebsite.com

**Privacy Policy**: https://yourwebsite.com/privacy (REQUIRED)

### Step 4: Store Listing

**App Icon**: Upload 512x512 PNG (will be auto-generated from 1024x1024)

**Feature Graphic** (REQUIRED):
- Size: 1024 x 500 pixels
- Format: JPG or PNG (no alpha)
- Shows app name and key feature

**Screenshots**: Upload 2-8 screenshots per device type

**Promotional Video** (optional): YouTube URL

### Step 5: Content Rating

Complete questionnaire:
- App category: Utility
- No violence, sexual content, alcohol, etc.
- Expected rating: Everyone

### Step 6: Target Audience

- **Target Age**: 13 and older
- **Appeals to Children**: No
- **Store Presence**: Teacher Approved: No

### Step 7: Data Safety

**Data Collection**:

**Location**
- Approximate location
- Purpose: App functionality
- Optional: Users can choose

**Personal Info**
- Email addresses
- Purpose: Account management
- Required

**Photos**
- Photos
- Purpose: App functionality
- Optional

**Purchase History**
- Purchase history
- Purpose: App functionality
- Required for feature

**Security Practices**:
- Data encrypted in transit: Yes
- Users can request deletion: Yes
- Complies with Play Families Policy: N/A
- Independent security review: No (optional)

### Step 8: App Access

**All or Some Features Restricted**: Yes, account required

**Instructions for testing restricted features**:
```
Test Account:
Email: reviewer@threesteps.app
Password: [Your test password]

The account has sample data for testing all features.
```

### Step 9: Upload App Bundle

1. Go to "Release" → "Production"
2. Click "Create new release"
3. Upload the .aab file from EAS build
4. Or use: `eas submit --platform android`

### Step 10: Release Notes

**What's New**:
```
Initial release of Three Steps!

• Track grocery shopping in real-time
• Scan product barcodes
• Set and monitor spending budgets
• Compare prices across stores
• View detailed shopping analytics
• Review purchase history

Start shopping smarter today!
```

### Step 11: Countries

Select availability:
- All countries, or
- Select specific countries

### Step 12: Review and Rollout

1. Review all information
2. Click "Review Release"
3. Click "Start Rollout to Production"

**Review Time**: Typically faster than iOS (hours to 1 day)

---

## App Store Metadata

### App Name Best Practices

- Clear and memorable
- Avoid generic terms
- No special characters or emojis
- Describe what it does

### Description Writing Tips

- First 2-3 sentences are crucial (visible without "more")
- Use bullet points for features
- Include keywords naturally
- Highlight unique value proposition
- End with call-to-action
- Proofread for grammar/spelling

### Keyword Research

**iOS Keywords** (100 characters):
- No spaces after commas
- Use singular forms (Apple adds plurals)
- Research competitor keywords
- Tools: App Annie, Sensor Tower

**Good Keywords**:
- grocery, shopping, budget, price, tracker, barcode, scanner, list, cart, expense, savings, deals, compare

**Avoid**:
- Brand names you don't own
- Irrelevant keywords
- Repeated words

---

## Review Guidelines

### Common Rejection Reasons

**iOS**:
1. **Incomplete App**: Missing features or placeholder content
2. **Crashes**: App crashes during review
3. **Links Don't Work**: Broken privacy policy or support links
4. **Demo Account**: Invalid or missing demo credentials
5. **Permissions Not Justified**: Camera/location without clear explanation
6. **Privacy Policy**: Missing or insufficient
7. **Misleading**: App doesn't match description

**Android**:
1. **Missing Privacy Policy**: Must be accessible URL
2. **Dangerous Permissions**: Unjustified sensitive permissions
3. **Inappropriate Content**: Violates content policy
4. **Impersonation**: Misleading name/icon
5. **Malware**: Security concerns

### How to Pass Review

✅ **Do**:
- Test thoroughly before submission
- Provide clear demo account with data
- Explain all permissions in UI and store listing
- Have working privacy policy and terms
- Respond quickly to reviewer questions
- Be honest in description

❌ **Don't**:
- Use copyrighted images without permission
- Promise features that don't exist
- Include broken features
- Use misleading screenshots
- Ignore reviewer feedback

### If Rejected

1. Read rejection reason carefully
2. Fix the issue
3. Respond in Resolution Center (iOS) or Developer Response (Android)
4. Resubmit
5. Usually faster second review

---

## Post-Submission

### After Approval

1. **Announce Launch**:
   - Social media
   - Email list
   - Product Hunt (optional)
   - Reddit (relevant subreddits)

2. **Monitor**:
   - Crash reports
   - Reviews and ratings
   - Download metrics
   - User feedback

3. **Respond to Reviews**:
   - Thank positive reviews
   - Address negative feedback professionally
   - Fix reported bugs in updates

### Update Release Cycle

**Recommended**:
- Bug fixes: As needed (within days)
- Minor updates: Every 2-4 weeks
- Major features: Every 2-3 months

**Version Numbering**:
- 1.0.0 → 1.0.1 (bug fixes)
- 1.0.0 → 1.1.0 (minor features)
- 1.0.0 → 2.0.0 (major changes)

### Analytics

Set up analytics to track:
- User acquisition sources
- Feature usage
- Retention rates
- Conversion funnels
- Crash rates

**Recommended Tools**:
- Google Analytics
- Mixpanel
- Amplitude
- Sentry (error tracking)

---

## Quick Reference

### iOS Build & Submit
```bash
eas build --platform ios --profile production
eas submit --platform ios
```

### Android Build & Submit
```bash
eas build --platform android --profile production
eas submit --platform android
```

### Update Version
```json
// app.json
{
  "version": "1.0.1",
  "ios": { "buildNumber": "2" },
  "android": { "versionCode": 2 }
}
```

---

## Support Resources

- **Expo EAS Docs**: https://docs.expo.dev/eas/
- **Apple Review Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **Google Play Policies**: https://play.google.com/about/developer-content-policy/
- **App Store Connect Help**: https://developer.apple.com/help/app-store-connect/
- **Play Console Help**: https://support.google.com/googleplay/android-developer/

---

**Need Help?**

If you get stuck:
1. Check Expo EAS documentation
2. Search Stack Overflow
3. Ask in Expo Discord/Forums
4. Consider hiring a React Native consultant

Good luck with your submission! 🚀
