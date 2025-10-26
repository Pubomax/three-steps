# Three Steps - App Store Deployment Roadmap

Your complete guide from current state to App Store launch.

---

## Current Status: ✅ Code Complete, Assets Needed

Your app is **technically ready** for production. What's missing are:
1. Visual assets (icons, screenshots)
2. Store accounts setup
3. Legal documents hosted publicly
4. Final testing on production builds

---

## Deployment Phases

### Phase 1: Asset Creation (1-3 days)
**Priority: HIGH** - Can't submit without these

#### Required Assets
- [ ] App Icon (1024x1024px)
- [ ] Splash Screen (1284x2778px)
- [ ] iOS Screenshots (3-5 per device size)
- [ ] Android Screenshots (4-6 images)
- [ ] Android Feature Graphic (1024x500px)

**Action Steps**:
1. Read [ASSET_CREATION_GUIDE.md](ASSET_CREATION_GUIDE.md)
2. Choose DIY (free, 4-8 hours) or hire designer ($50-300)
3. Create or commission all assets
4. Save in `/assets/images/` folder
5. Test at actual sizes

**Recommended**: Hybrid approach - DIY screenshots ($0, 2 hours), hire designer for icon ($50, 3 days)

---

### Phase 2: Account Setup (1 day)
**Priority: HIGH** - Required for submission

#### Developer Accounts
- [ ] **Apple Developer Program** - $99/year
  - Sign up at https://developer.apple.com/programs/
  - Approval takes 24-48 hours

- [ ] **Google Play Developer** - $25 one-time
  - Register at https://play.google.com/console/signup
  - Approval usually instant

- [ ] **Expo Account** - Free
  - Sign up at https://expo.dev
  - Create organization if needed

**Action Steps**:
1. Apple: Enroll in developer program
2. Google: Pay registration fee
3. Expo: Create account, note username
4. Update `app.json` with your Expo username
5. Run `eas project:init` to get project ID

**Time**: 2-3 hours setup + 1-2 days Apple approval

---

### Phase 3: Legal & Hosting (1 day)
**Priority: MEDIUM** - Required for App Stores

#### Host Legal Documents
You have the documents, now make them publicly accessible:

**Option A: Simple Website (Recommended)**
- Use **GitHub Pages** (free):
  1. Create `docs` folder in repo
  2. Copy PRIVACY_POLICY.md and TERMS_OF_SERVICE.md
  3. Enable GitHub Pages in repo settings
  4. Your URLs: `https://yourusername.github.io/project/privacy-policy.html`

**Option B: Website Builder**
- **Carrd.co** ($19/year) - Simple one-pager
- **Webflow** (Free tier) - More customizable
- **Google Sites** (Free) - Very basic

**Option C: Full Website**
- Hire web developer (Fiverr: $50-200)
- Include: Home, Privacy, Terms, Support pages

**Minimum Requirements**:
- Privacy Policy at accessible URL
- Terms of Service at accessible URL
- Support email working (support@threesteps.app)

**Action Steps**:
1. Choose hosting method
2. Upload legal documents
3. Create simple support page
4. Test all URLs are accessible
5. Update app.json and store listings with URLs

---

### Phase 4: Production Environment Setup (2-3 hours)
**Priority: HIGH** - Don't use dev database for production!

#### Supabase Production Setup
- [ ] Create new Supabase project (separate from dev/test)
- [ ] Run all 8 migrations in order
- [ ] Create 'product-images' storage bucket
- [ ] Enable RLS policies on all tables
- [ ] Configure backups (automatic in Supabase)
- [ ] Get production URL and anon key

**Action Steps**:
```bash
# In Supabase dashboard for NEW project:
1. Settings → API → Copy URL and anon key
2. SQL Editor → Run each migration file
3. Storage → Create "product-images" bucket, make public
4. Authentication → Configure email settings
5. Database → Verify RLS policies active on all tables
```

#### Update Production Config
Edit `eas.json` production section:
```json
{
  "production": {
    "env": {
      "EXPO_PUBLIC_SUPABASE_URL": "your-PRODUCTION-url",
      "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-PRODUCTION-key"
    }
  }
}
```

⚠️ **IMPORTANT**: Never use dev/test database for production!

---

### Phase 5: EAS Build Configuration (1-2 hours)
**Priority: HIGH** - Required for App Store builds

#### Install & Setup EAS
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Initialize project (if not done)
eas project:init

# Configure builds
eas build:configure
```

#### Update app.json
Replace placeholder values:
```json
{
  "expo": {
    "owner": "your-expo-username",  // Your Expo username
    "extra": {
      "eas": {
        "projectId": "abc-123-xyz"   // From eas project:init
      }
    }
  }
}
```

#### First Test Build
```bash
# Build for iOS (generates credentials automatically)
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production
```

**First build takes**: 20-40 minutes
**Subsequent builds**: 10-20 minutes

---

### Phase 6: Production Testing (1-2 days)
**Priority: CRITICAL** - Don't skip this!

#### Download and Test Builds
1. **iOS Build**:
   - Download .ipa from EAS dashboard
   - Install via TestFlight or direct install
   - Test on physical iPhone

2. **Android Build**:
   - Download .aab or .apk from EAS
   - Install on physical Android device
   - Test all features

#### Test Checklist (Use [PRE_LAUNCH_CHECKLIST.md](PRE_LAUNCH_CHECKLIST.md))
- [ ] Authentication (sign up, sign in, logout)
- [ ] Session creation (all 4 steps)
- [ ] Product scanning (camera works)
- [ ] Photo capture (uploads to Storage)
- [ ] Cart management (add, edit, remove)
- [ ] Checkout process (completes successfully)
- [ ] History view (shows completed sessions)
- [ ] Analytics (calculates correctly)
- [ ] Feedback button (opens email)
- [ ] No crashes after 30 minutes of use

#### Create Demo Account
```bash
# Create in production Supabase:
Email: reviewer@threesteps.app
Password: [Strong password you'll share with reviewers]

# Add sample data:
- 3 completed shopping sessions
- 15+ products with photos
- Various stores
- Realistic prices and data
```

---

### Phase 7: Store Listing Preparation (1-2 days)
**Priority: HIGH** - Required for submission

Follow [APP_STORE_GUIDE.md](APP_STORE_GUIDE.md) for detailed instructions.

#### Apple App Store Connect
1. Create app listing
2. Upload screenshots for all device sizes
3. Write app description (use template from guide)
4. Complete privacy questionnaire
5. Set category: Shopping
6. Provide demo account credentials
7. Upload build via EAS submit or Transporter

#### Google Play Console
1. Create app listing
2. Upload screenshots and feature graphic
3. Write description (same as iOS)
4. Complete content rating questionnaire
5. Fill data safety section
6. Set category: Shopping
7. Upload build via EAS submit

**Store Metadata** (prepare in advance):
```
App Name: Three Steps
Subtitle: Smart Grocery Shopping Tracker
Keywords: grocery,shopping,budget,price tracker,barcode
Category: Shopping
Age Rating: 4+ / Everyone
Price: Free
```

---

### Phase 8: Submission (1 hour)
**Priority: Submit when ready!**

#### Final Pre-Submission Check
- [ ] All assets uploaded
- [ ] Legal URLs working
- [ ] Demo account tested
- [ ] Production build tested
- [ ] Metadata complete
- [ ] No placeholder text anywhere

#### Submit to Apple
```bash
# Via EAS (recommended)
eas submit --platform ios

# Or manually upload to App Store Connect
```

**Review Time**: 24-48 hours typically

#### Submit to Google
```bash
# Via EAS (recommended)
eas submit --platform android

# Or manually upload to Play Console
```

**Review Time**: Few hours to 1 day typically

---

### Phase 9: Post-Submission (Ongoing)
**Priority: Be ready to respond**

#### Monitor Submissions
- Check App Store Connect daily
- Check Google Play Console daily
- Be ready to answer reviewer questions
- Respond within 24 hours if contacted

#### If Approved ✅
1. **Announce Launch**:
   - Social media
   - Friends/family
   - Product Hunt (optional)
   - Reddit (relevant subreddits)

2. **Monitor Launch**:
   - Watch for crashes (set up Sentry recommended)
   - Read reviews daily
   - Respond to user emails quickly
   - Track downloads

3. **First Update**:
   - Fix critical bugs within 48 hours
   - Plan first feature update for 2-4 weeks post-launch

#### If Rejected ❌
1. **Don't Panic** - rejections are common, especially first time
2. **Read Carefully** - understand exact issue
3. **Fix** - address the specific problem mentioned
4. **Resubmit** - usually faster second review
5. **Common Issues**:
   - Demo account doesn't work → Test it!
   - Privacy policy missing → Check URL is accessible
   - App crashes → Test production build more
   - Misleading metadata → Be accurate in description

---

## Timeline Estimate

### Absolute Minimum (If rushing)
- **Assets**: 1 day (basic DIY)
- **Accounts**: 1 day (instant Google, wait for Apple)
- **Hosting**: 2 hours (GitHub Pages)
- **Setup**: 3 hours (Supabase + EAS)
- **Testing**: 1 day (minimal)
- **Store Prep**: 4 hours (rush job)
- **Total**: 3-4 days (risky, not recommended)

### Recommended Timeline
- **Assets**: 3-5 days (hire designer)
- **Accounts**: 2-3 days (wait for Apple)
- **Hosting**: 1 day (proper website)
- **Setup**: 1 day (thorough Supabase + EAS)
- **Testing**: 2-3 days (comprehensive)
- **Store Prep**: 2 days (quality listings)
- **Total**: 10-14 days (smart approach)

### Ideal Timeline
- **Assets**: 1 week (professional designer, revisions)
- **Accounts**: 3 days (Apple approval wait)
- **Hosting**: 3 days (nice website with support page)
- **Setup**: 1 day (clean production environment)
- **Testing**: 1 week (beta test with friends first)
- **Store Prep**: 3 days (perfect listings, reviews)
- **Total**: 3-4 weeks (best chance of success)

---

## Budget Estimate

### Absolute Minimum ($124)
- Apple Developer: $99/year
- Google Play: $25 one-time
- **Total**: $124

### Recommended ($224-324)
- Apple Developer: $99/year
- Google Play: $25 one-time
- App Icon Designer: $50-100
- Website Hosting: $0-20/year (GitHub free or Carrd)
- Misc: $50 buffer
- **Total**: $224-324

### Professional Launch ($424-624)
- Apple Developer: $99/year
- Google Play: $25 one-time
- Designer (icon + screenshots): $150-300
- Website: $50-100
- Sentry (error tracking): $0-100/month
- **Total**: $424-624

---

## Critical Path Items

Focus on these first (blocking items):

1. ✅ **Code** - DONE
2. ⏳ **App Icon** - NEEDED
3. ⏳ **Screenshots** - NEEDED
4. ⏳ **Apple Developer Account** - NEEDED
5. ⏳ **Google Developer Account** - NEEDED
6. ⏳ **Privacy Policy URL** - NEEDED
7. ⏳ **Production Supabase** - NEEDED
8. ⏳ **EAS Setup** - NEEDED
9. ⏳ **Demo Account** - NEEDED
10. ⏳ **Production Testing** - NEEDED

**Can be done in parallel**:
- Assets + Accounts setup
- Hosting + Production Supabase
- Testing while store listings are being prepared

---

## Risk Assessment

### High Risk
❌ **Skipping production testing** - Will likely get rejected or crash in users' hands
❌ **Using dev database for production** - Security risk, data loss risk
❌ **Bad demo account** - Instant rejection
❌ **No legal documents** - Can't submit

### Medium Risk
⚠️ **Poor quality assets** - Might hurt downloads but won't block submission
⚠️ **Incomplete testing** - Might miss bugs users will find
⚠️ **Rushed store listing** - Might have typos, unclear value prop

### Low Risk
✓ **Missing optional features** - Can add in updates
✓ **Not perfect icon** - Can change post-launch
✓ **Basic website** - Can improve later

---

## Success Checklist

You're ready to submit when:

### Technical
- [x] Code compiles without errors
- [ ] Production build tested on real device
- [ ] No crashes in 30-minute test session
- [ ] All core features work
- [ ] Demo account with sample data works

### Assets
- [ ] App icon looks good at small sizes
- [ ] Screenshots show key features clearly
- [ ] All required sizes prepared
- [ ] No placeholder content

### Legal & Accounts
- [ ] Privacy Policy publicly accessible
- [ ] Terms of Service publicly accessible
- [ ] Support email works and monitored
- [ ] Apple & Google accounts approved
- [ ] EAS configured with credentials

### Store Listings
- [ ] Description written (no typos)
- [ ] Screenshots uploaded
- [ ] Metadata complete
- [ ] Category selected
- [ ] Demo account documented
- [ ] All links tested

---

## Next Steps (Right Now)

1. **Today**: Decide on asset strategy (DIY or hire)
2. **This Week**:
   - Create or commission app icon
   - Sign up for Apple Developer Program
   - Sign up for Google Play Developer
   - Create GitHub Pages for legal documents
3. **Next Week**:
   - Take screenshots or commission them
   - Set up production Supabase
   - Configure EAS and do first builds
   - Test production builds
4. **Week 3**:
   - Prepare store listings
   - Create demo account
   - Submit to both stores
   - Monitor review process

---

## Resources Quick Links

### Documentation You Have
- [README.md](README.md) - Setup guide
- [APP_STORE_GUIDE.md](APP_STORE_GUIDE.md) - Detailed submission steps
- [PRE_LAUNCH_CHECKLIST.md](PRE_LAUNCH_CHECKLIST.md) - Complete testing checklist
- [ASSET_CREATION_GUIDE.md](ASSET_CREATION_GUIDE.md) - How to create assets
- [PRIVACY_POLICY.md](PRIVACY_POLICY.md) - Ready to host
- [TERMS_OF_SERVICE.md](TERMS_OF_SERVICE.md) - Ready to host
- [KNOWN_ISSUES.md](KNOWN_ISSUES.md) - Technical debt documented
- [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) - MVP testing guide

### External Resources
- **Expo EAS**: https://docs.expo.dev/eas/
- **Apple Developer**: https://developer.apple.com
- **Google Play Console**: https://play.google.com/console
- **Supabase**: https://supabase.com/docs

### Support
- **Expo Discord**: https://chat.expo.dev/
- **Expo Forums**: https://forums.expo.dev/
- **Stack Overflow**: Tag with 'expo' or 'react-native'

---

## FAQ

**Q: Can I submit without a designer?**
A: Yes! Use Canva (free) for basic assets. Your first version doesn't need to be perfect.

**Q: How long until my app is in the stores?**
A: Apple: 1-3 days after submission. Google: Few hours to 1 day. Total from starting now: 2-4 weeks realistic.

**Q: What if I get rejected?**
A: Normal! Read rejection, fix issue, resubmit. Usually approved on second try.

**Q: Do I need both stores?**
A: No, you can start with one. But submitting to both maximizes your reach.

**Q: Can I update the app after launch?**
A: Yes! You can update as often as needed. Just increment version number.

**Q: What if I find a bug after launch?**
A: Fix it ASAP and submit an update. Usually approved faster than initial submission.

**Q: How much will this cost?**
A: Minimum $124 (developer fees). Recommended budget: $250-400 including designer.

**Q: Can I monetize later?**
A: Yes! Start free, add paid features or subscription later. Much easier than starting paid.

---

## Motivation

You've built a great app! Don't let it sit on your computer.

**Remember**:
- Done is better than perfect
- You can update post-launch
- First version teaches you what users want
- Every successful app started with v1.0

**You're closer than you think**: 90% of the work is done. The last 10% is assets and paperwork.

---

## Final Checklist

Before you start, gather:
- [ ] $99 for Apple Developer
- [ ] $25 for Google Play
- [ ] $0-150 for designer (optional)
- [ ] 10-20 hours of your time over 2 weeks
- [ ] Test iPhone or Android device
- [ ] Credit card for developer accounts
- [ ] Company/personal info for store listings

**You're ready to launch!** 🚀

Start with Phase 1 (Assets) and work through each phase. You've got this!

---

**Questions?** Review the documentation above or reach out for help. Good luck! 🎉
