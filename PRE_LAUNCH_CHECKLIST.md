# Pre-Launch Checklist for App Store Submission

Complete this checklist before submitting to Apple App Store and Google Play Store.

---

## 🎯 Critical Path Items

### Developer Accounts
- [ ] **Apple Developer Program** - $99/year membership active
- [ ] **Google Play Developer** - $25 one-time fee paid
- [ ] **Expo Account** - Free account created
- [ ] **EAS CLI** - Installed globally (`npm install -g eas-cli`)

### Legal & Compliance
- [ ] **Privacy Policy** - Hosted at public URL
- [ ] **Terms of Service** - Hosted at public URL
- [ ] **Support Email** - Set up and monitoring (support@threesteps.app)
- [ ] **Company Registration** - If required in your jurisdiction
- [ ] **Tax Forms** - Submitted to Apple/Google if monetizing

### Production Environment
- [ ] **Supabase Production Database** - Separate from dev/test
- [ ] **All Migrations Run** - All 8 migrations applied to production DB
- [ ] **Storage Bucket Created** - 'product-images' bucket exists
- [ ] **RLS Policies Active** - Row-Level Security enabled on all tables
- [ ] **Backup Strategy** - Database backups configured
- [ ] **Environment Variables** - Production keys in eas.json

---

## 🎨 Assets & Branding

### App Icons
- [ ] **iOS Icon** - 1024x1024px PNG, no alpha channel, in `assets/images/icon.png`
- [ ] **Android Adaptive Icon** - 1024x1024px PNG, safe area centered, in `assets/images/adaptive-icon.png`
- [ ] **Splash Screen** - 1284x2778px PNG in `assets/images/splash.png`
- [ ] **Favicon** - 48x48px PNG in `assets/images/favicon.png`

### Screenshots
- [ ] **iPhone 6.9"** - 3-5 screenshots at 1290x2796px
- [ ] **iPhone 6.7"** - 3-5 screenshots at 1290x2796px
- [ ] **iPad Pro 12.9"** - 3-5 screenshots at 2048x2732px (if supporting iPad)
- [ ] **Android Phone** - 4-6 screenshots at 1440x2560px
- [ ] **Android Tablet** - 4-6 screenshots (if supporting tablets)

### Store Graphics
- [ ] **Android Feature Graphic** - 1024x500px JPG/PNG
- [ ] **App Preview Video** - (Optional) 15-30 second video

### Screenshot Content
- [ ] Shows all 5 main screens (Home, Cart, Scan, History, Analytics)
- [ ] Uses realistic data (not empty/placeholder content)
- [ ] Has device frames for professional look
- [ ] Includes descriptive text overlays
- [ ] Consistent styling across all screenshots

---

## 🔧 Technical Requirements

### Configuration Files
- [ ] **app.json** - Updated with production bundle IDs and permissions
- [ ] **eas.json** - Created with production build configuration
- [ ] **package.json** - All dependencies at stable versions
- [ ] **.env.example** - Template for testers/developers

### Bundle Identifiers
- [ ] **iOS Bundle ID** - `com.threesteps.app` registered in Apple Developer
- [ ] **Android Package** - `com.threesteps.app` unique and available
- [ ] **Scheme** - `threesteps` set in app.json

### Permissions & Descriptions
- [ ] **Camera Permission** - Clear explanation in infoPlist and Android manifest
- [ ] **Location Permission** - Clear explanation (optional permission)
- [ ] **Photo Library** - Clear explanation for saving photos
- [ ] All permission strings are user-friendly and accurate

### Build Testing
- [ ] **Production Build iOS** - Successfully built with `eas build --platform ios`
- [ ] **Production Build Android** - Successfully built with `eas build --platform android`
- [ ] **No Build Errors** - Clean build with no blocking errors
- [ ] **Size Acceptable** - App size under 150MB (ideal under 100MB)

---

## 🧪 Testing & Quality Assurance

### Functional Testing
- [ ] **Authentication Flow** - Sign up, sign in, logout work perfectly
- [ ] **Session Creation** - 4-step wizard completes without errors
- [ ] **Product Scanning** - Camera opens, QR scanning works, manual entry works
- [ ] **Photo Capture** - Camera captures photos, uploads to Supabase Storage
- [ ] **Cart Management** - Add items, adjust quantities, remove items, calculate total
- [ ] **Budget Tracking** - Spending limit alerts work correctly
- [ ] **Checkout Process** - Completes successfully, clears cart, ends session
- [ ] **History View** - Shows past sessions, expands correctly, calculates stats
- [ ] **Analytics** - All metrics calculate correctly, recommendations appear
- [ ] **Feedback Button** - Opens email client with correct template

### Edge Cases
- [ ] **Empty States** - All screens handle no data gracefully
- [ ] **Long Text** - Product names/stores with 100+ characters don't break UI
- [ ] **Extreme Prices** - $0.01 and $9999.99 work correctly
- [ ] **Large Cart** - 50+ items don't cause performance issues
- [ ] **No Internet** - Appropriate error messages shown
- [ ] **Slow Connection** - Loading states appear, doesn't timeout prematurely

### Device Testing
- [ ] **iOS Latest Version** - Tested on iOS 17+ device
- [ ] **iOS One Version Back** - Tested on iOS 16
- [ ] **Small iPhone** - Tested on iPhone SE/13 mini
- [ ] **Large iPhone** - Tested on iPhone 14 Pro Max/15 Plus
- [ ] **iPad** - Tested if claiming iPad support
- [ ] **Android Latest** - Tested on Android 13+
- [ ] **Android One Back** - Tested on Android 12
- [ ] **Different Manufacturers** - Tested on Samsung, Google Pixel, etc.

### Performance Testing
- [ ] **Cold Start** - App launches in under 3 seconds
- [ ] **Navigation** - Tab switching is smooth
- [ ] **Scrolling** - History and analytics scroll smoothly with 50+ items
- [ ] **Image Upload** - Photos upload within 10 seconds on average connection
- [ ] **Checkout** - Completes within 5 seconds
- [ ] **Memory Usage** - No memory leaks after 30 minutes of use
- [ ] **Battery Impact** - Normal battery usage (not excessive)

### Error Handling
- [ ] **Network Errors** - Clear messages, retry options
- [ ] **Invalid Input** - Form validation with helpful messages
- [ ] **Server Errors** - Graceful degradation
- [ ] **Permission Denied** - Alternative flows when camera/location denied
- [ ] **Error Boundary** - Catches React errors, shows recovery screen

### Security Testing
- [ ] **SQL Injection** - Protected by Supabase parameterized queries
- [ ] **XSS** - No user input rendered as HTML
- [ ] **Authentication** - Sessions expire appropriately
- [ ] **Data Access** - Users can only see their own data
- [ ] **Image Upload** - File type validation, size limits
- [ ] **API Keys** - No secrets exposed in client code

---

## 📝 Store Listings

### Apple App Store

#### Required Information
- [ ] **App Name** - "Three Steps" decided
- [ ] **Subtitle** - 30 characters prepared
- [ ] **Description** - Full 4000 character description written
- [ ] **Keywords** - 100 characters of comma-separated keywords
- [ ] **Support URL** - Website with support info
- [ ] **Privacy Policy URL** - Accessible public URL
- [ ] **Category** - Shopping (primary), Lifestyle (secondary)
- [ ] **Age Rating** - Completed questionnaire (should be 4+)
- [ ] **Copyright** - "© 2025 [Your Name/Company]"

#### Demo Account
- [ ] **Test Account Created** - reviewer@threesteps.app with password
- [ ] **Sample Data Added** - At least 3 completed sessions with products
- [ ] **Account Documented** - Credentials ready for "App Review Information"

#### Privacy Questionnaire
- [ ] **Data Types** - Identified (email, location, photos, purchases)
- [ ] **Data Usage** - Purposes documented
- [ ] **Tracking** - No tracking confirmed
- [ ] **Third Parties** - Supabase listed if required

### Google Play Store

#### Required Information
- [ ] **App Name** - "Three Steps" matches iOS
- [ ] **Short Description** - 80 characters
- [ ] **Full Description** - 4000 characters
- [ ] **Category** - Shopping
- [ ] **Content Rating** - Questionnaire completed
- [ ] **Target Audience** - 13+ selected
- [ ] **Privacy Policy** - Same URL as iOS
- [ ] **Contact Email** - support@threesteps.app
- [ ] **Data Safety** - All sections completed

#### Store Listing Content
- [ ] **Feature Graphic** - 1024x500px ready
- [ ] **Screenshots** - All device types covered
- [ ] **App Icon** - 512x512px generated from 1024px source

---

## 🔐 Security & Privacy

### Data Protection
- [ ] **HTTPS Only** - All API calls use HTTPS
- [ ] **Password Hashing** - Supabase handles securely
- [ ] **Session Management** - Tokens expire appropriately
- [ ] **RLS Policies** - All tables protected
- [ ] **Input Sanitization** - Protected against injection
- [ ] **File Upload Validation** - Only images accepted

### Privacy Compliance
- [ ] **GDPR Compliance** - If serving EU users
- [ ] **CCPA Compliance** - If serving California users
- [ ] **COPPA Compliance** - App not targeting children under 13
- [ ] **Data Deletion** - Users can delete account and data
- [ ] **Data Portability** - Users can export data (or plan to add)
- [ ] **Cookie Policy** - If using cookies/tracking

### Third-Party Services
- [ ] **Supabase Terms** - Reviewed and compliant
- [ ] **Expo Terms** - Reviewed and compliant
- [ ] **Data Processing Agreement** - With Supabase if needed

---

## 📊 Monitoring & Analytics

### Error Tracking
- [ ] **Crash Reporting** - Sentry or similar set up (recommended)
- [ ] **Error Logging** - Console errors captured
- [ ] **Alert System** - Notifications for critical errors

### Usage Analytics (Optional for Launch)
- [ ] **Analytics Tool** - Google Analytics, Mixpanel, or Amplitude
- [ ] **Key Events** - Track signups, sessions, scans, checkouts
- [ ] **User Properties** - Track relevant user segments

### Performance Monitoring (Optional for Launch)
- [ ] **API Response Times** - Monitor Supabase performance
- [ ] **App Performance** - Track load times, navigation speed

---

## 🎓 Documentation

### User-Facing
- [ ] **In-App Help** - Onboarding or help screens (optional)
- [ ] **FAQ Page** - Common questions answered (optional)
- [ ] **Support Email** - Ready to respond to users

### Developer-Facing
- [ ] **README.md** - Complete setup instructions
- [ ] **TESTING_CHECKLIST.md** - For QA testing
- [ ] **KNOWN_ISSUES.md** - Documented limitations
- [ ] **APP_STORE_GUIDE.md** - Submission instructions
- [ ] **PRIVACY_POLICY.md** - Legal document
- [ ] **TERMS_OF_SERVICE.md** - Legal document

---

## 💰 Business Setup

### If Monetizing (Free for Now)
- [ ] **Stripe/Payment Provider** - N/A currently
- [ ] **Pricing Tiers** - N/A currently
- [ ] **Tax Settings** - N/A currently

### Marketing Preparation
- [ ] **Landing Page** - Website for the app (recommended)
- [ ] **Social Media** - Twitter/Instagram accounts (optional)
- [ ] **Press Kit** - Logo, screenshots, description (optional)
- [ ] **Launch Plan** - Where/how to announce

---

## 🚀 Final Pre-Submission

### Code Quality
- [ ] **TypeScript Warnings** - Documented in KNOWN_ISSUES.md
- [ ] **Console Warnings** - Production build has minimal warnings
- [ ] **Code Comments** - Complex logic is documented
- [ ] **Dead Code** - Unused imports/functions removed
- [ ] **Version Numbers** - app.json version set to 1.0.0

### Review Preparation
- [ ] **Demo Video** - Record yourself using the app (for reference)
- [ ] **Test Credentials** - Saved securely, ready to share with reviewers
- [ ] **Rejection Response Plan** - Know how to address common issues

### Backup & Rollback
- [ ] **Code Repository** - Latest code committed to Git
- [ ] **Database Backup** - Production database backed up
- [ ] **Environment Backup** - All keys/credentials documented securely
- [ ] **Version Tagged** - Git tag for v1.0.0 created

### Communication
- [ ] **Team Notified** - Everyone aware of submission
- [ ] **Support Ready** - Can respond to user inquiries
- [ ] **Social Media Ready** - Announcement posts drafted

---

## ✅ Submission Checklist

### Apple App Store
- [ ] **Build Uploaded** - Via EAS or Transporter
- [ ] **Build Processed** - App Store Connect shows build
- [ ] **All Metadata** - Entered in App Store Connect
- [ ] **Screenshots Uploaded** - All required device sizes
- [ ] **Privacy Info** - Questionnaire completed
- [ ] **Demo Account** - Provided with instructions
- [ ] **Export Compliance** - Declared (no encryption = No)
- [ ] **Content Rights** - Confirmed you own content
- [ ] **Ready for Review** - Submitted for review

### Google Play Store
- [ ] **Build Uploaded** - AAB via EAS or manually
- [ ] **Store Listing** - All text and images
- [ ] **Content Rating** - Completed
- [ ] **Data Safety** - All sections filled
- [ ] **Pricing** - Set to Free
- [ ] **Countries** - Selected availability
- [ ] **Test Account** - Provided in access instructions
- [ ] **Ready for Review** - Release rolled out to production

---

## 📅 Timeline Expectations

### Before Submission
- **Setup & Development**: Complete ✅
- **Testing**: 1-2 weeks (thorough testing)
- **Asset Creation**: 1-3 days (icons, screenshots)
- **Legal Docs**: 1 day (privacy policy, terms)
- **Store Listings**: 1-2 days (write descriptions, metadata)

### After Submission
- **Apple Review**: 24-48 hours typically
- **Google Review**: Few hours to 1 day typically
- **Revisions (if rejected)**: Fix and resubmit within days

### Post-Launch
- **Monitor**: First 48 hours critical
- **Fix Critical Bugs**: Within 24 hours
- **First Update**: 2-4 weeks after launch

---

## 🆘 Troubleshooting Common Issues

### Build Fails
- Check EAS build logs
- Verify all dependencies are compatible
- Ensure iOS/Android versions supported
- Clear caches: `npm cache clean --force`

### App Rejected
- Read rejection carefully
- Fix exact issue mentioned
- Respond in Resolution Center
- Resubmit promptly

### Can't Upload Screenshots
- Verify exact pixel dimensions
- Check file format (PNG or JPG)
- Ensure file size under limits
- Remove alpha channel from iOS icons

### Demo Account Doesn't Work
- Test credentials before submitting
- Ensure account has sample data
- Provide clear instructions
- Create backup account just in case

---

## 📞 Resources & Support

### Official Documentation
- **Expo EAS**: https://docs.expo.dev/eas/
- **Apple Developer**: https://developer.apple.com/documentation/
- **Google Play**: https://developer.android.com/distribute

### Community Help
- **Expo Forums**: https://forums.expo.dev/
- **Expo Discord**: https://chat.expo.dev/
- **Stack Overflow**: Tag with 'expo' or 'react-native'
- **Reddit**: r/reactnative, r/ExpoMobile

### Paid Support Options
- **Expo Priority Support**: Available with paid EAS plans
- **Freelance Developers**: Upwork, Fiverr for specific issues
- **App Store Consultant**: For complex rejection issues

---

## ✨ Final Confidence Check

Before you submit, ask yourself:

- ✅ "Would I be proud to show this to my mom?"
- ✅ "Does it work smoothly on my device?"
- ✅ "Can a new user figure out how to use it?"
- ✅ "Have I tested all the main features?"
- ✅ "Are there any embarrassing bugs?"
- ✅ "Is the description accurate?"
- ✅ "Do I have a way to help users who need support?"

If you answered YES to all these, you're ready to submit! 🚀

---

**Last Updated**: January 25, 2025
**Version**: 1.0.0

Good luck with your launch!
