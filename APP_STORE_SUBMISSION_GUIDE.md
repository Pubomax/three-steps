# App Store Submission Guide - Step by Step

## Prerequisites
✅ Apple Developer License Agreement accepted
✅ iOS build completed with `eas build --platform ios --profile production`
✅ Build uploaded to App Store Connect (EAS does this automatically)

## Step-by-Step Submission Process

### 1. Access App Store Connect
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Sign in with your Apple ID: `tbijou@me.com`
3. Click on "My Apps"

### 2. Select Your App
1. Find and click on "Strago" (or your app name)
2. You should see your app's dashboard

### 3. Create a New Version (if needed)
1. Click the "+ Version or Platform" button (if visible)
2. Select "iOS"
3. Enter the version number: `1.1.0`
4. Click "Create"

### 4. Select the Build
1. In the app version page, scroll to the "Build" section
2. Click on the "+" button next to Build
3. You'll see a list of available builds
4. Select the build you just created (version 1.1.0, build 4)
5. Click "Done"

### 5. Fill in App Information (if not already filled)

**App Information:**
- Name: Strago
- Subtitle: Smart grocery shopping tracker
- Category: Lifestyle or Shopping

**What's New in This Version:**
```
Version 1.1.0 - Major Update

New Features:
• Guest Mode: Try the app without creating an account
• Account Management: Delete your account anytime from Settings
• Improved Camera Permissions: Clearer permission flow for barcode scanning

Bug Fixes:
• Fixed issue with guest users creating grocery sessions
• Improved overall app stability
```

**Screenshots:** (Should already be uploaded from previous submission)
- If needed, upload new screenshots showing the updates

**App Privacy:**
- Review the privacy information
- Make sure it matches what you've implemented

### 6. Age Rating
- Confirm the age rating is appropriate (should be 4+ or 12+)

### 7. Review Information
**Contact Information:**
- First Name: Thierry
- Last Name: Bijou
- Phone: [Your phone number]
- Email: tbijou@me.com

**Demo Account (Important!):**
- Username: demo@strago.app
- Password: [Your demo password]
- Add note: "This demo account has pre-populated data for testing"

### 8. Version Release
Choose how you want to release:
- **Manually release this version** (Recommended for first time)
  - You'll approve when it's ready to go live
- **Automatically release this version**
  - Goes live immediately after approval

### 9. Submit for Review
1. Scroll to the top of the page
2. Click "Save" to save all your changes
3. Click "Add for Review" button
4. Review the submission summary
5. Click "Submit to App Review"

### 10. Wait for Review
- Apple typically reviews apps within 24-48 hours
- You'll receive email updates about the status
- Check App Store Connect regularly for status updates

## After Submission

### Monitor Status
The app will go through these stages:
1. **Waiting for Review** - In queue
2. **In Review** - Being reviewed by Apple
3. **Pending Developer Release** - Approved, waiting for you to release (if manual release)
4. **Ready for Sale** - Live on the App Store!

### If Rejected
1. Read the rejection message carefully
2. Make necessary changes to the code
3. Rebuild with `eas build --platform ios --profile production`
4. Resubmit following these same steps

## Using EAS Submit (Alternative Method)

If you prefer to submit directly from the command line:

```bash
eas submit --platform ios --latest
```

This will:
1. Use your latest build
2. Automatically submit to App Store Connect
3. You'll still need to go to App Store Connect to:
   - Add the build to a version
   - Fill in "What's New"
   - Submit for review

## Important Notes

1. **Build Must Be Uploaded First**
   - After running `eas build`, wait for the build to complete
   - EAS automatically uploads it to App Store Connect
   - Wait 5-10 minutes for processing

2. **TestFlight Testing (Optional but Recommended)**
   - Before submitting for review, test via TestFlight
   - Build automatically available in TestFlight
   - Invite testers to try the app first

3. **Export Compliance**
   - Your app uses standard encryption (HTTPS)
   - You've set `usesNonExemptEncryption: false` in app.json
   - No additional export compliance needed

## Quick Reference Commands

```bash
# 1. Accept Apple Developer License (do this first!)
# Go to: https://appstoreconnect.apple.com

# 2. Build for production
eas build --platform ios --profile production

# 3. (Optional) Submit via CLI
eas submit --platform ios --latest

# 4. Check build status
eas build:list --platform ios --status finished

# 5. View build details
eas build:view [build-id]
```

## Troubleshooting

### "No builds available"
- Wait 10-15 minutes after build completes
- Check build status: `eas build:list`
- Refresh App Store Connect page

### "Missing export compliance"
- Confirm `usesNonExemptEncryption: false` in app.json
- This should be automatic, but you can answer "No" if asked

### "Missing app icon"
- Make sure icon is in `assets/images/icon.png`
- Should be 1024x1024 pixels
- Should be uploaded in previous build

## Support Resources

- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)

---

**Next Steps After This Submission:**
1. Monitor email for Apple's review updates
2. Test the app thoroughly via TestFlight
3. Prepare for any follow-up questions from Apple
4. Apply the database migration in Supabase when app goes live
