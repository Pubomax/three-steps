# App Store Connect Setup Guide for Strago

## Quick Reference Information

**App Details:**
- **App Name**: Strago
- **Bundle ID**: com.strago.app
- **Version**: 1.0.0
- **Build Number**: 1
- **Website**: https://strago.app/
- **Privacy Policy**: https://strago.app/privacy
- **Support URL**: https://strago.app/

## Step-by-Step Setup

### 1. Create New App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - **Platform**: iOS
   - **Name**: Strago
   - **Primary Language**: English (U.S.)
   - **Bundle ID**: com.strago.app
   - **SKU**: strago-ios-app (or any unique identifier)

### 2. App Information

**General Information:**
- **Name**: Strago
- **Subtitle**: Scan - Track - Go
- **Category**: 
  - Primary: Shopping
  - Secondary: Finance (optional)

**Pricing and Availability:**
- **Price**: Free
- **Availability**: All countries/regions

### 3. App Store Metadata

**App Store Information:**

**Description** (4000 characters max):
```
Strago helps you save money on groceries by tracking prices, managing budgets, and providing smart shopping insights.

TRACK YOUR SPENDING
• Create shopping sessions with spending limits
• Scan barcodes to add products instantly
• Monitor your cart in real-time
• Get alerts when approaching your budget

COMPARE PRICES
• Track prices across multiple stores
• See price trends over time
• Get notifications on price drops
• Find the best deals automatically

SHOPPING INSIGHTS
• View detailed analytics on your spending
• See which stores offer the best prices
• Identify your most-purchased items
• Get personalized recommendations

SMART FEATURES
• Barcode scanner for quick product entry
• Photo capture for product records
• Multi-store support
• Budget tracking per session
• Purchase history with receipts
• Analytics dashboard

Perfect for budget-conscious shoppers who want to make informed decisions and save money on every grocery trip!
```

**Keywords** (100 characters max):
```
grocery,shopping,price,tracker,budget,scanner,barcode,savings,deals,compare
```

**Promotional Text** (170 characters max):
```
Stop overpaying for groceries! Track prices across stores, stay on budget, and make smarter shopping decisions with Strago.
```

**Support URL**: https://strago.app/
**Marketing URL**: https://strago.app/ (optional)

### 4. App Privacy

**Privacy Policy URL**: https://strago.app/privacy

**Data Collection (App Privacy Details):**

**Contact Info:**
- ✅ Email Address
- Purpose: App Functionality, Customer Support
- Linked to Identity: Yes
- Used for Tracking: No

**User Content:**
- ✅ Photos or Videos (product photos)
- ✅ Other User Content (product scans, shopping data)
- Purpose: App Functionality
- Linked to Identity: Yes
- Used for Tracking: No

**Identifiers:**
- ✅ User ID
- Purpose: App Functionality, Analytics
- Linked to Identity: Yes
- Used for Tracking: No

**Usage Data:**
- ✅ Product Interaction (app usage analytics)
- Purpose: Analytics, App Functionality
- Linked to Identity: Yes
- Used for Tracking: No

**Location:**
- ✅ Precise Location (optional - for store tracking)
- Purpose: App Functionality
- Linked to Identity: Yes
- Used for Tracking: No

### 5. Age Rating

Complete the Age Rating questionnaire:
- **Made for Kids**: No
- **Age Rating**: 4+ (No Objectionable Content)

Most answers will be "No" since Strigo is a grocery shopping app with no objectionable content.

### 6. App Review Information

**App Review Information:**
```
DEMO ACCOUNT CREDENTIALS:
Email: [Your demo account email]
Password: [Your demo account password]

TESTING INSTRUCTIONS:
1. Log in with the demo account provided above
2. Tap "Start Grocery" to create a new shopping session
3. Enter session details:
   - Store Name: Any name (e.g., "Walmart")
   - Location: Any location (e.g., "123 Main St")
   - Budget: Any amount (e.g., "$100")
   - Type: Select any option
4. Tap "Scan" tab to access barcode scanner
5. Grant camera permissions when prompted
6. Scan any barcode OR enter manually: 123456789
7. Take a product photo (optional) or skip
8. Enter product details:
   - Brand: Any brand name
   - Product Name: Any product name
   - Price: Any price (e.g., "$3.99")
9. Save the product - it will appear in your cart
10. View "Analytics" tab to see spending insights
11. Complete checkout from the cart
12. View "History" tab to see completed sessions

FEATURES TO TEST:
- User authentication and account management
- Barcode scanning with camera
- Product price tracking and entry
- Budget management and alerts
- Shopping cart functionality
- Session checkout process
- Purchase history viewing
- Analytics and insights dashboard
- Multi-store price comparison

PERMISSIONS REQUIRED:
- Camera: Required for barcode scanning and product photos
- Photo Library: Optional for saving product images
- Location: Optional for store location tracking

BACKEND SERVICES:
- Authentication and database: Supabase (bebrakqpymztgjpiisrn.supabase.co)
- All API communications use HTTPS
- Image storage handled via Supabase Storage

IMPORTANT NOTES:
- App requires internet connection for full functionality
- Location permission is optional and enhances store tracking
- Camera permission is required for barcode scanning feature
- Demo account has pre-populated sample data for testing
```

**Contact Information:**
- **First Name**: [Your first name]
- **Last Name**: [Your last name]
- **Phone Number**: [Your phone number]
- **Email**: [Your support email]

### 7. Export Compliance

**Uses Encryption**: Yes (Standard HTTPS encryption only)
- Select "No" for custom encryption algorithms
- This covers standard HTTPS API calls to Supabase

### 8. Content Rights

Confirm that you have the rights to use all content in your app.

### 9. Screenshots Requirements

You'll need to upload screenshots for:

**iPhone 6.7" Display (Required):**
- Size: 1290 x 2796 pixels (portrait)
- Quantity: 3-10 screenshots

**iPhone 6.5" Display (Required):**
- Size: 1284 x 2778 pixels (portrait)
- Quantity: 3-10 screenshots

**Recommended Screenshot Content:**
1. **Home Screen**: Show the main interface with "Start Grocery" button
2. **Session Setup**: Display the grocery session creation form
3. **Barcode Scanner**: Show the camera interface scanning a product
4. **Shopping Cart**: Display cart with products and budget tracking
5. **Analytics**: Show the insights dashboard with charts
6. **History**: Display past shopping sessions

### 10. App Icon

Upload your 1024 x 1024 pixel app icon (already prepared in your project).

## Final Checklist Before Submission

- [ ] All metadata fields completed
- [ ] Screenshots uploaded for required device sizes
- [ ] App icon uploaded (1024x1024)
- [ ] Privacy policy URL verified and accessible
- [ ] Demo account credentials provided in review notes
- [ ] Age rating questionnaire completed
- [ ] Export compliance answered
- [ ] Content rights confirmed
- [ ] Build uploaded and selected
- [ ] All sections show green checkmarks

## After Build Completes

1. **Select Build**: Once your EAS build completes, it will automatically appear in App Store Connect
2. **Final Review**: Double-check all information
3. **Submit for Review**: Click the "Submit for Review" button

## Expected Timeline

- **Build Upload**: Automatic with EAS (after build completes)
- **Processing**: 5-15 minutes after upload
- **Review Queue**: 24-48 hours typically
- **Review Time**: 1-3 days average
- **Total Time**: 2-5 days from submission to decision

## Common Issues to Avoid

- ❌ Broken demo account credentials
- ❌ Inaccessible privacy policy URL
- ❌ Missing or low-quality screenshots
- ❌ Incomplete app description
- ❌ Wrong bundle identifier
- ❌ Missing required device screenshots

## Support Resources

- **App Store Connect**: https://appstoreconnect.apple.com/
- **App Store Review Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **EAS Documentation**: https://docs.expo.dev/eas/

---

**Status**: Ready for App Store Connect setup while build is processing
**Next Step**: Complete App Store Connect setup, then submit when build is ready