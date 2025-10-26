# 🔍 How to Get Your Apple Team ID and App Store Connect App ID

## Step 1: Get Your Apple Team ID

1. **Go to**: https://developer.apple.com/account/
2. **Sign in** with your Apple Developer account
3. **Click "Membership Details"** (in the sidebar)
4. **Copy the "Team ID"** - it's a 10-character alphanumeric string (e.g., "ABC123DEFG")

## Step 2: Get Your App Store Connect App ID

1. **Go to**: https://appstoreconnect.apple.com
2. **Sign in** with your Apple ID
3. **Click "My Apps"**
4. **Click on your "Three Steps" app**
5. **Go to "App Information"** (in the sidebar)
6. **Copy the "Apple ID"** - it's a numeric ID (e.g., "1234567890")

## Step 3: Update Your EAS Configuration

Once you have both IDs, I'll update your `eas.json` file with:

```json
"ios": {
  "appleId": "your-apple-id-email@example.com",
  "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
  "appleTeamId": "YOUR_APPLE_TEAM_ID"
}
```

## What These IDs Do:

- **Team ID**: Identifies your Apple Developer account for code signing
- **App Store Connect App ID**: Links your build to the specific app listing in App Store Connect

## Next Steps After Getting IDs:

1. Update `eas.json` with real values
2. Test production build: `eas build --platform ios --profile production`
3. Submit to App Store: `eas submit --platform ios --profile production`

---

**Please get these two IDs and share them with me so I can update your configuration!**