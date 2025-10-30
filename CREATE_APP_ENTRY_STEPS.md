# 📱 EXACT STEPS: Create New App Entry in App Store Connect

## 🔐 STEP 1: Login to App Store Connect
1. Go to: https://appstoreconnect.apple.com/
2. Enter your Apple Developer account email
3. Enter your password
4. Complete 2FA if prompted

## ➕ STEP 2: Create New App
1. Click **"My Apps"** (main dashboard)
2. Click the **"+"** button (top left corner)
3. Select **"New App"**

## 📝 STEP 3: Fill App Information Form
**Use these EXACT details:**

### Platform Selection:
- ✅ **iOS** (check this box)
- ❌ macOS (leave unchecked)
- ❌ tvOS (leave unchecked)

### App Information:
- **Name**: `Strago`
- **Primary Language**: `English (U.S.)`
- **Bundle ID**: Select `com.strago.app` from dropdown
  - (If not available, it means it's still registered - contact Apple Support)
- **SKU**: `strago-app-2024`
  - (This is just an internal identifier, can be anything unique)

### User Access:
- **Full Access** (default selection)

## ✅ STEP 4: Create App
1. Click **"Create"** button
2. Wait for app to be created (takes 10-30 seconds)
3. You'll be redirected to the app's main page

## 🚀 STEP 5: Immediately Re-Submit Build
Once the app is created, run this command:
```bash
eas submit --platform ios --latest
```

## 📋 STEP 6: Complete Metadata
Use [`SUBMIT_NOW_CHECKLIST.md`](SUBMIT_NOW_CHECKLIST.md) to fill in all required information.

## ⚠️ TROUBLESHOOTING:
- **Bundle ID not available**: The bundle ID might still be tied to the deleted app. Wait 24 hours or contact Apple Support.
- **SKU already exists**: Change SKU to `strago-app-2024-v2` or similar.
- **Access denied**: Ensure your Apple Developer account has App Manager or Admin role.

## 🎯 SUCCESS INDICATOR:
You'll know it worked when you see the new app dashboard with "Prepare for Submission" status.

**Total time needed: 5-10 minutes**