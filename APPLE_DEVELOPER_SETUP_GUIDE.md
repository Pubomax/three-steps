# 🍎 Apple Developer Account & App Store Connect Setup Guide

## Step 1: Apple Developer Program Enrollment

**🔗 Go to**: https://developer.apple.com/programs/enroll/

**Requirements:**
- Apple ID (use: `tbijou@example.com` or your preferred email)
- $99 USD annual fee
- Valid payment method
- Government-issued photo ID

**Process:**
1. **Sign in** with your Apple ID
2. **Choose enrollment type**: 
   - Select **"Individual"** (unless you have a company)
3. **Provide personal information**:
   - Legal name (must match ID)
   - Address
   - Phone number
4. **Payment**: $99 USD annual fee
5. **Verification**: Apple may call to verify (24-48 hours)

**⏱️ Timeline**: 24-48 hours for approval

---

## Step 2: App Store Connect Setup

**🔗 Go to**: https://appstoreconnect.apple.com

**After Developer Program approval:**

1. **Sign in** with your Apple ID
2. **Accept agreements** (Paid Applications Agreement)
3. **Set up banking/tax info** (required even for free apps)

---

## Step 3: Create Your App in App Store Connect

1. **Click "My Apps"** → **"+" button** → **"New App"**

2. **Fill in app details**:
   ```
   Platform: iOS
   Name: Three Steps
   Primary Language: English (U.S.)
   Bundle ID: com.threesteps.app
   SKU: threesteps-001
   User Access: Full Access
   ```

3. **App Information**:
   ```
   Category: Shopping
   Secondary Category: Lifestyle
   Content Rights: No, it does not contain, show, or access third-party content
   Age Rating: 4+ (complete questionnaire)
   ```

---

## Step 4: Get Required IDs for EAS Configuration

**After app creation, you'll get:**

1. **Apple Team ID**:
   - Go to: https://developer.apple.com/account/
   - Click "Membership Details"
   - Copy "Team ID" (10-character string)

2. **App Store Connect App ID**:
   - In App Store Connect → Your App → App Information
   - Copy "Apple ID" (numeric ID)

3. **Update `eas.json`**:
   ```json
   "ios": {
     "appleId": "your-actual-apple-id@email.com",
     "ascAppId": "1234567890",
     "appleTeamId": "ABC123DEFG"
   }
   ```

---

## Step 5: App Store Connect Configuration

**Pricing and Availability:**
- Price: Free
- Availability: All countries
- App Store Distribution: On

**App Privacy:**
- Complete privacy questionnaire based on `PRIVACY_POLICY.md`
- Data types collected:
  - ✅ Email addresses (account creation)
  - ✅ Precise location (store tracking)
  - ✅ Photos (product images)
  - ✅ Purchase history (price tracking)

**App Review Information:**
- Demo Account Required: Yes
- Create test account: `reviewer@threesteps.app`
- Add sample shopping data
- Provide clear testing instructions

---

## Step 6: Certificates & Provisioning

**EAS will handle this automatically when you run:**
```bash
eas build --platform ios --profile production
```

**This will:**
- Generate distribution certificate
- Create provisioning profile
- Set up push notification keys
- Configure app signing

---

## ⚠️ IMPORTANT NOTES:

1. **Apple Developer Program approval can take 24-48 hours**
2. **Banking/tax info must be completed even for free apps**
3. **Bundle ID `com.threesteps.app` must be unique globally**
4. **Keep your Apple ID secure - it controls everything**

---

## 🎯 NEXT STEPS AFTER APPROVAL:

1. **Complete Apple Developer enrollment** ($99 payment)
2. **Wait for approval** (24-48 hours)
3. **Set up App Store Connect** (banking, agreements)
4. **Create app listing** with the details above
5. **Get Team ID and App Store Connect App ID**
6. **Update `eas.json`** with real values
7. **Test production build**: `eas build --platform ios --profile production`

---

## 📞 Support Resources:

- **Apple Developer Support**: https://developer.apple.com/support/
- **App Store Connect Help**: https://help.apple.com/app-store-connect/
- **EAS Documentation**: https://docs.expo.dev/eas/

---

**Status**: Start this process first as it has the longest approval time (24-48 hours). While waiting, we can work on other requirements like screenshots and legal document hosting.