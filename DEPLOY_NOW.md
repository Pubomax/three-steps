# Deploy to App Stores - Step by Step Guide

Your app is ready! Follow these steps in order.

---

## Current Status

✅ **Completed**:
- App icon created (1024x1024px)
- Splash screen created
- Adaptive icon created
- EAS configuration ready
- Expo account: tbijou

---

## Step 1: Initialize EAS Project (5 minutes)

Run this command to create your EAS project:

```bash
eas project:init
```

When prompted:
- **"Create a project for @tbijou/three-steps?"** → Press **Y** (Yes)

This will:
- Create a project on Expo servers
- Add project ID to your app.json
- Link your local project to EAS

---

## Step 2: Apply for Developer Accounts (Do in parallel)

### Apple Developer Program ($99/year)

**Important**: This takes 24-48 hours for approval!

1. Go to: https://developer.apple.com/programs/enroll/
2. Sign in with your Apple ID (or create one)
3. Click "Start Your Enrollment"
4. Choose "Individual" (unless you have a company)
5. Agree to terms
6. Pay $99
7. Wait for approval email (24-48 hours)

### Google Play Developer ($25 one-time)

1. Go to: https://play.google.com/console/signup
2. Sign in with Google account
3. Pay $25 registration fee
4. Complete developer profile
5. Approval usually within 1 hour

**You can continue to Step 3-5 while waiting for Apple approval**

---

## Step 3: Create Production Supabase Database (30 minutes)

⚠️ **IMPORTANT**: Use a DIFFERENT project than development!

### 3.1 Create New Project

1. Go to: https://supabase.com/dashboard
2. Click "New Project"
3. Name it: **"three-steps-production"**
4. Generate strong database password (save it!)
5. Select region closest to your users
6. Click "Create new project"
7. Wait 2-3 minutes for setup

### 3.2 Run All Migrations

In Supabase dashboard → SQL Editor, run these files **in order**:

```bash
1. supabase/migrations/20251025162643_create_grocery_tracker_schema.sql
2. supabase/migrations/20251025165012_add_checkout_sessions_table.sql
3. supabase/migrations/20251025170329_add_brand_to_products.sql
4. supabase/migrations/20251025171319_add_grocery_sessions.sql
5. supabase/migrations/20251025181019_add_start_end_times_to_sessions.sql
6. supabase/migrations/20251025181715_add_grocery_session_details.sql
7. supabase/migrations/20251025184244_add_store_location_to_grocery_sessions.sql
8. supabase/migrations/20251025190000_create_product_images_bucket.sql
```

Copy/paste each file's contents and click "Run".

### 3.3 Verify Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. You should see "product-images" bucket
3. Click on it → Settings
4. Make sure "Public bucket" is **enabled**

### 3.4 Get Production Credentials

1. Go to **Settings** → **API**
2. Copy **Project URL** (looks like: `https://xxxxx.supabase.co`)
3. Copy **anon/public** key (long string)
4. **SAVE THESE** - you'll need them next!

---

## Step 4: Configure Production Environment (5 minutes)

Edit `eas.json` file and replace placeholder values:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://your-production-project.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-production-anon-key-here"
      }
    }
  }
}
```

Replace:
- `https://your-production-project.supabase.co` → Your production Supabase URL from Step 3.4
- `your-production-anon-key-here` → Your production anon key from Step 3.4

**Save the file!**

---

## Step 5: Build iOS App (30-60 minutes)

⚠️ **Wait for this until Apple Developer account is approved!**

### 5.1 Start iOS Build

```bash
eas build --platform ios --profile production
```

You'll be asked several questions:

**"Generate a new Apple Distribution Certificate?"** → **Y** (Yes)
**"Generate a new Apple Provisioning Profile?"** → **Y** (Yes)
**"Log in to your Apple Developer account"** → Enter your Apple ID and password
**"Select team"** → Choose your team (likely just one option)

EAS will:
- Generate iOS credentials automatically
- Build your app (~20-40 minutes)
- Upload to EAS servers

### 5.2 Download Build

After build completes:
1. You'll get a URL in the terminal
2. Go to: https://expo.dev/accounts/tbijou/projects/three-steps/builds
3. Download the `.ipa` file
4. Keep this for testing and submission

---

## Step 6: Build Android App (20-40 minutes)

```bash
eas build --platform android --profile production
```

You'll be asked:

**"Generate a new Android Keystore?"** → **Y** (Yes)

EAS will:
- Generate Android keystore automatically
- Build your app (~10-20 minutes)
- Upload to EAS servers

After build completes:
1. Download the `.aab` file
2. Keep this for Play Store submission

---

## Step 7: Host Legal Documents (30 minutes)

You need public URLs for Privacy Policy and Terms.

### Option A: GitHub Pages (Recommended - Free)

1. Create a `docs` folder in your project:
```bash
mkdir docs
```

2. Convert Markdown to HTML (simple version):
```bash
# Create simple HTML files
cat > docs/privacy.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Privacy Policy - Three Steps</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; line-height: 1.6; }
        h1 { color: #10b981; }
        h2 { color: #333; margin-top: 30px; }
    </style>
</head>
<body>
<!-- Copy paste PRIVACY_POLICY.md content here, formatted as HTML -->
<h1>Privacy Policy for Three Steps</h1>
<p><strong>Last Updated: January 25, 2025</strong></p>
<!-- Add rest of content -->
</body>
</html>
EOF
```

3. Do the same for `docs/terms.html` with TERMS_OF_SERVICE.md content

4. Push to GitHub:
```bash
git add docs/
git commit -m "Add legal documents"
git push
```

5. Enable GitHub Pages:
   - Go to your GitHub repo
   - Settings → Pages
   - Source: Deploy from branch `main`
   - Folder: `/docs`
   - Save

6. Your URLs will be:
   - Privacy: `https://yourusername.github.io/project/privacy.html`
   - Terms: `https://yourusername.github.io/project/terms.html`

### Option B: Quick Website (Paid)

Use **Carrd.co** ($19/year):
1. Sign up at carrd.co
2. Create simple one-page site
3. Add Privacy and Terms as sections
4. Publish

---

## Step 8: Create Demo Account (15 minutes)

In your **production** Supabase:

1. Sign up in your app with:
   - Email: `reviewer@threesteps.app`
   - Password: Create a strong password (save it!)

2. Add realistic sample data:
   - Create 3 shopping sessions
   - Add 15+ products with photos
   - Use real store names (Target, Walmart, etc.)
   - Use realistic prices
   - Complete 2-3 sessions for history

3. **Test the demo account thoroughly!**

---

## Step 9: Prepare Store Listings

### Apple App Store

1. Go to: https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - **Platform**: iOS
   - **Name**: Three Steps
   - **Primary Language**: English
   - **Bundle ID**: com.threesteps.app
   - **SKU**: threesteps-001
   - Click "Create"

4. Complete App Information:
   - **Subtitle**: "Smart Grocery Shopping Tracker"
   - **Category**: Shopping (Primary), Lifestyle (Secondary)
   - **Privacy Policy URL**: Your URL from Step 7
   - **Description**: (See APP_STORE_GUIDE.md for full text)

5. Upload Screenshots:
   - You need to take these (see ASSET_CREATION_GUIDE.md)
   - Minimum: 3 screenshots per device size
   - Capture: Home, Scanning, Cart, Analytics, History

6. Complete Privacy Questionnaire:
   - Click "App Privacy" → Start
   - Add: Email, Location, Photos, Purchase History
   - Link to your Privacy Policy URL

7. App Review Information:
   - **Demo Account Email**: reviewer@threesteps.app
   - **Demo Account Password**: [Your demo password]
   - **Notes**: See APP_STORE_GUIDE.md for template

### Google Play Store

1. Go to: https://play.google.com/console
2. Create app → "Create app"
3. Fill in:
   - **App name**: Three Steps
   - **Default language**: English
   - **App or game**: App
   - **Free or paid**: Free
   - Click "Create app"

4. Complete Store Listing:
   - **Short description**: (80 chars)
   - **Full description**: (Same as iOS)
   - **App icon**: Upload icon.png
   - **Feature graphic**: Create 1024x500px graphic
   - **Screenshots**: Upload 4-6 screenshots

5. Complete Content Rating:
   - Start questionnaire
   - Select "Utility"
   - Answer "No" to all content questions
   - Expected rating: Everyone

6. Complete Data Safety:
   - Add: Location, Email, Photos, Purchase History
   - Privacy Policy URL: Your URL from Step 7

7. App Access:
   - Select "All or some features are restricted"
   - Add demo account credentials
   - Provide testing instructions

---

## Step 10: Submit to App Stores

### Submit to Apple

```bash
eas submit --platform ios
```

Or manually:
1. Download Transporter app (Mac App Store)
2. Drag .ipa file from Step 5
3. Upload to App Store Connect

In App Store Connect:
1. Select your build
2. Review all information
3. Click "Add for Review"
4. Click "Submit to App Review"

**Review time**: Typically 24-48 hours

### Submit to Google

```bash
eas submit --platform android
```

Or manually:
1. In Play Console → Production
2. Create new release
3. Upload .aab file from Step 6
4. Add release notes
5. Review and roll out

**Review time**: Few hours to 1 day

---

## Troubleshooting

### Build Fails

Check EAS build logs:
```bash
eas build:list
```

Click on failed build to see logs.

Common issues:
- **Missing assets**: Make sure icon.png, splash.png exist
- **Environment variables**: Check eas.json has production Supabase keys
- **Dependencies**: Run `npm install` and try again

### Can't Upload to App Store

- **Apple account not approved**: Wait for approval email
- **Wrong build type**: Make sure you built with `--profile production`
- **Certificates issue**: Run `eas credentials` to check

### Demo Account Doesn't Work

- Test it yourself first!
- Make sure you're using PRODUCTION Supabase
- Add realistic data (not empty)

---

## Timeline

- **Today**: Steps 1, 2, 3, 4 (2-3 hours)
- **While waiting for Apple**: Steps 5, 6, 7, 8 (1-2 days)
- **After Apple approval**: Steps 9, 10 (1 day)
- **Review period**: 1-3 days
- **Total**: 5-7 days from start to approval

---

## Cost Summary

- ✅ **Code & Assets**: $0 (done!)
- 💰 **Apple Developer**: $99/year
- 💰 **Google Play**: $25 one-time
- 💰 **Website hosting**: $0-20/year (GitHub Pages free)
- **Total**: $124-144

---

## Next Steps

**Start Now**:
1. Run `eas project:init` (5 minutes)
2. Apply for Apple Developer (5 minutes, wait 24-48h)
3. Sign up for Google Play (10 minutes, instant)
4. Create production Supabase (30 minutes)

**Tomorrow**:
- While waiting for Apple approval, work on screenshots
- Host legal documents
- Create demo account

**After Apple Approval**:
- Build iOS and Android
- Prepare store listings
- Submit!

---

## Questions?

- **EAS Build Issues**: https://docs.expo.dev/eas/
- **App Store Help**: https://developer.apple.com/help/app-store-connect/
- **Play Store Help**: https://support.google.com/googleplay/android-developer/

---

**You're ready to deploy! Start with Step 1** 🚀

Run this command now:
```bash
eas project:init
```

Then move through each step. You've got this! 🎉
