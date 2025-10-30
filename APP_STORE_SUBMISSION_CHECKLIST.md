# App Store Submission Checklist for Strigo

## Pre-Submission Requirements

### 1. Apple Developer Account
- [ ] Active Apple Developer Program membership ($99/year)
- [ ] Apple Developer account is in good standing
- [ ] Team Agent/Admin role assigned (for app submission)
- [ ] Two-factor authentication enabled on Apple ID

### 2. App Store Connect Setup
- [ ] App created in App Store Connect
- [ ] Bundle ID matches: `com.strigo.app`
- [ ] App name "Strigo" is available and reserved
- [ ] Primary language set to English (U.S.)
- [ ] App category selected (Shopping or Lifestyle)
- [ ] Age rating completed via questionnaire

## App Metadata & Marketing Assets

### 3. App Information
- [ ] **App Name**: Strigo (30 characters max)
- [ ] **Subtitle**: "Smart Grocery Price Tracker" (30 characters max)
- [ ] **Keywords**: grocery, shopping, price tracker, budget, barcode scanner (100 characters max, comma-separated)
- [ ] **Promotional Text**: Updated promotional message (170 characters max)
- [ ] **Description**: Compelling app description (4000 characters max)
- [ ] **Support URL**: Active support website URL
- [ ] **Marketing URL**: Optional marketing website URL
- [ ] **Privacy Policy URL**: https://strigo.app/privacy (must be accessible)

### 4. App Store Screenshots (REQUIRED)
Must provide screenshots for:

#### iPhone 6.7" Display (Required - iPhone 15 Pro Max, 14 Pro Max, 13 Pro Max, 12 Pro Max)
- [ ] 3-10 screenshots at 1290 x 2796 pixels (portrait) OR 2796 x 1290 pixels (landscape)
- [ ] Screenshots showcase key features
- [ ] No placeholder or Lorem Ipsum text
- [ ] High quality, readable text

#### iPhone 6.5" Display (Required - iPhone 11 Pro Max, XS Max)
- [ ] 3-10 screenshots at 1284 x 2778 pixels (portrait) OR 2778 x 1284 pixels (landscape)

#### Additional Recommended Sizes:
- [ ] iPhone 5.5" Display: 1242 x 2208 pixels
- [ ] iPad Pro (6th Gen) 12.9": 2048 x 2732 pixels
- [ ] iPad Pro (2nd Gen) 12.9": 2048 x 2732 pixels

**Screenshot Content Requirements:**
- [ ] Screenshot 1: Home screen showing app name/logo and main features
- [ ] Screenshot 2: Grocery session creation flow
- [ ] Screenshot 3: Barcode scanning in action
- [ ] Screenshot 4: Shopping cart with budget tracking
- [ ] Screenshot 5: Analytics/insights dashboard
- [ ] Screenshot 6: Price comparison feature
- [ ] All screenshots include status bar or use device frames
- [ ] No unauthorized content (trademarked brands without permission)

### 5. App Preview Videos (Optional but Recommended)
- [ ] 15-30 second video showcasing app features
- [ ] Video dimensions match screenshot requirements
- [ ] No music/audio that violates copyright
- [ ] Clear demonstration of core functionality

### 6. App Icon
- [ ] App icon is 1024 x 1024 pixels
- [ ] PNG format without transparency
- [ ] No rounded corners (Apple adds them)
- [ ] Matches in-app icon design
- [ ] No text or words in icon (Apple guideline)
- [ ] Icon looks good at all sizes

### 7. Contact Information
- [ ] **First Name**: [Your First Name]
- [ ] **Last Name**: [Your Last Name]
- [ ] **Phone Number**: Valid contact number
- [ ] **Email Address**: Professional support email (e.g., support@strigo.app)
- [ ] Contact information is monitored and responsive

## Technical Requirements

### 8. App Build Preparation
- [ ] App version number set in `app.json`: "1.0.0"
- [ ] Build number incremented for each submission
- [ ] Bundle identifier correct: `com.strigo.app`
- [ ] Minimum iOS version specified (iOS 13.0+)
- [ ] App compiled with latest Xcode version
- [ ] All dependencies up to date
- [ ] No development/debugging code left in production build

### 9. EAS Build Configuration
- [ ] EAS CLI installed: `npm install -g eas-cli`
- [ ] Logged into Expo account: `eas login`
- [ ] EAS project configured: `eas build:configure`
- [ ] Production credentials set up
- [ ] Build profile configured for iOS production

**Build Commands:**
```bash
# Create production build
eas build --platform ios --profile production

# Check build status
eas build:list
```

### 10. App Capabilities & Permissions
All permissions properly configured in app.json:

- [ ] **Camera Permission**:
  - Description: "Strigo needs access to your camera to scan product barcodes and take photos of items you're purchasing."
  - Justified usage in app review notes

- [ ] **Photo Library Permission**:
  - Description: "Strigo needs access to your photo library to save product photos."
  - Justified usage in app review notes

- [ ] **Location Permission** (When In Use):
  - Description: "Strigo uses your location to help track where you shop and provide store-specific insights."
  - Justified usage in app review notes
  - Must demonstrate clear value to user

### 11. Code Quality & Testing
- [ ] App tested on multiple device sizes
- [ ] Tested on iOS 13, 14, 15, 16, 17 minimum
- [ ] No crashes on launch
- [ ] All features functional
- [ ] Performance optimized (quick launch, smooth scrolling)
- [ ] No memory leaks
- [ ] Works offline gracefully (appropriate error messages)
- [ ] All API endpoints tested and working
- [ ] Database queries optimized

### 12. Supabase Backend Verification
- [ ] Supabase project in production mode
- [ ] All tables and schemas properly configured
- [ ] Row Level Security (RLS) policies enabled
- [ ] Database migrations applied
- [ ] API keys secured (not exposed in client)
- [ ] Storage bucket configured for product images
- [ ] Rate limiting configured
- [ ] Backup strategy in place

## Legal & Compliance

### 13. Privacy Policy (CRITICAL)
- [ ] Privacy policy URL hosted and accessible: https://strigo.app/privacy
- [ ] Privacy policy covers:
  - [ ] What data is collected
  - [ ] How data is used
  - [ ] How data is stored
  - [ ] Third-party services (Supabase, Expo)
  - [ ] User rights (access, deletion, portability)
  - [ ] Contact information for privacy concerns
  - [ ] Last updated date
- [ ] Privacy policy in plain language
- [ ] Complies with GDPR, CCPA if applicable

### 14. Terms of Service
- [ ] Terms of Service URL hosted and accessible
- [ ] Terms cover:
  - [ ] User responsibilities
  - [ ] Acceptable use policy
  - [ ] Limitation of liability
  - [ ] Dispute resolution
  - [ ] Intellectual property rights
  - [ ] Service modifications
  - [ ] Account termination

### 15. App Store Review Guidelines Compliance
Review Apple's App Store Review Guidelines and ensure:

- [ ] **2.1 App Completeness**: App is complete and fully functional
- [ ] **2.3 Accurate Metadata**: All metadata accurately describes the app
- [ ] **3.1 Payments**: If using in-app purchases, uses Apple's IAP system
- [ ] **3.2 Other Business Models**: No alternative payment methods outside Apple
- [ ] **4.0 Design**: Follows iOS design guidelines
- [ ] **5.1 Privacy**: Privacy policy accessible, data collection justified
- [ ] **5.1.2 Data Use**: Clear purpose for all permissions requested

### 16. Data Collection & Privacy Labels
Configure App Privacy Details in App Store Connect:

**Data Collection (check all that apply):**
- [ ] Contact Info (Email)
- [ ] User Content (Product scans, photos)
- [ ] Identifiers (User ID)
- [ ] Usage Data (Analytics)
- [ ] Location Data (Store location tracking)

**For each data type, specify:**
- [ ] Whether it's linked to user identity
- [ ] Whether it's used for tracking
- [ ] Purpose of collection

## App Review Information

### 17. App Review Notes
Prepare detailed notes for Apple reviewers:

```
DEMO ACCOUNT:
Email: reviewer@strigo.app
Password: ReviewPassword123!

TESTING INSTRUCTIONS:
1. Log in with demo account
2. Tap "Start Grocery" to create a shopping session
3. Enter session details (any store name, budget, etc.)
4. Tap on the "Scan" tab
5. Grant camera permissions when prompted
6. Scan any barcode (or enter manually: 123456789)
7. Take a product photo (or skip)
8. Enter product details and save
9. View the product in your cart
10. Check analytics to see insights
11. Complete checkout from cart

FEATURES TO TEST:
- Barcode scanning functionality
- Product price tracking
- Budget management
- Shopping history
- Analytics dashboard
- Session management

PERMISSIONS REQUIRED:
- Camera: For barcode scanning and product photos
- Photo Library: For saving product images
- Location: For store location tracking (optional)

BACKEND SERVICES:
- Using Supabase for authentication and database
- All API calls to: [your-project].supabase.co
- Image storage in Supabase Storage

NOTES:
- App requires internet connection for full functionality
- Location permission is optional
- Camera permission required for barcode scanning feature
```

### 18. Demo Account
- [ ] Demo account created and tested
- [ ] Demo account credentials provided in review notes
- [ ] Demo account has sample data (completed shopping trips, products, etc.)
- [ ] Demo account never expires
- [ ] Demo account has all features accessible

### 19. Export Compliance
- [ ] Determine if app uses encryption (YES - HTTPS for API calls)
- [ ] Complete export compliance questionnaire in App Store Connect
- [ ] Most apps select "No" for custom encryption (using standard HTTPS)

## Final Checks

### 20. Pre-Submission Testing
- [ ] Fresh install test (delete app, reinstall, test)
- [ ] New user flow test (create account, complete first session)
- [ ] All tabs functional
- [ ] All buttons work
- [ ] Navigation flows correctly
- [ ] Camera permission flow works
- [ ] Barcode scanning works
- [ ] Product save works
- [ ] Cart functionality works
- [ ] Checkout process works
- [ ] History displays correctly
- [ ] Analytics displays correctly
- [ ] Logout and login work
- [ ] Password reset works (if implemented)

### 21. App Store Connect Final Steps
- [ ] All required metadata filled in
- [ ] Screenshots uploaded for all required sizes
- [ ] App icon uploaded (1024x1024)
- [ ] Privacy policy URL entered and verified
- [ ] Support URL entered and verified
- [ ] Age rating completed
- [ ] Content rights confirmed
- [ ] Export compliance answered
- [ ] Pricing and availability set
- [ ] Release options selected (Manual or Automatic)

### 22. Build Upload
- [ ] Create production build with EAS:
  ```bash
  eas build --platform ios --profile production
  ```
- [ ] Wait for build to complete
- [ ] Download build artifact if needed
- [ ] Upload to App Store Connect (automatic with EAS)
- [ ] Select build in App Store Connect
- [ ] Verify build shows as "Processing" then "Ready for Submit"

### 23. Final Submission
- [ ] All sections show green checkmarks in App Store Connect
- [ ] "Submit for Review" button is active
- [ ] App information reviewed one final time
- [ ] Click "Submit for Review"
- [ ] Receive confirmation email
- [ ] Status changes to "Waiting for Review"

## Post-Submission

### 24. Monitor Review Process
- [ ] Check App Store Connect daily for status updates
- [ ] Respond to any Apple requests within 24 hours
- [ ] Monitor support email for user feedback
- [ ] Prepare to fix any issues if rejected

### 25. Expected Timeline
- **In Review**: 24-48 hours typically
- **Review Time**: Usually completed within 1-3 days
- **Possible Statuses**:
  - Waiting for Review
  - In Review
  - Pending Developer Release (Approved!)
  - Ready for Sale
  - Rejected (needs fixes)

### 26. If Rejected
- [ ] Read rejection reason carefully
- [ ] Address all issues mentioned
- [ ] Update app if code changes needed
- [ ] Upload new build
- [ ] Respond to Resolution Center with explanation
- [ ] Resubmit for review

### 27. If Approved
- [ ] App automatically releases (if automatic release selected)
- [ ] OR manually release when ready
- [ ] Verify app appears in App Store
- [ ] Test download from App Store
- [ ] Announce launch on social media/marketing channels
- [ ] Monitor crash reports and user reviews
- [ ] Plan for updates and improvements

## Quick Reference Checklist

**Critical Before Submission:**
- [ ] Privacy Policy live and accessible
- [ ] Demo account working
- [ ] All screenshots uploaded
- [ ] App icon 1024x1024 uploaded
- [ ] App builds and runs without crashes
- [ ] All permissions justified
- [ ] Support email active
- [ ] Production build uploaded

**Common Rejection Reasons to Avoid:**
- ❌ Incomplete app information
- ❌ Broken demo account
- ❌ Crashes on launch
- ❌ Missing privacy policy
- ❌ Unjustified permissions
- ❌ Poor quality screenshots
- ❌ Placeholder content
- ❌ Non-functional features

---

## Need Help?

**Expo Documentation**: https://docs.expo.dev/submit/ios/
**Apple Developer**: https://developer.apple.com/app-store/review/
**App Store Connect**: https://appstoreconnect.apple.com/

Good luck with your submission! 🚀
