# TestFlight Update Guide - Safe Build Upload

## Current Situation
- **Submission Under Review**: Version 1.0.0, Build 1
- **Goal**: Upload new build to TestFlight without affecting the submission

## ✅ The Safe Solution: Increment Build Number Only

**Important**: Your submission under review is locked to **Build 1**. You can safely upload new builds by incrementing the build number while keeping the same version.

### How It Works
- **Version** (1.0.0): Marketing version shown to users - KEEP THIS SAME
- **Build Number**: Internal identifier - INCREMENT THIS
- Your submission uses Build 1, so it won't be affected by Build 2, 3, etc.

## Step-by-Step Instructions

### Option 1: Upload Build 2 to TestFlight (Recommended)

This keeps the same version (1.0.0) but creates a new build for testing.

1. **Update Build Number in app.json**:
```bash
# Current: "buildNumber": "1"
# Change to: "buildNumber": "2"
```

2. **Build and Submit**:
```bash
eas build --platform ios --profile production --auto-submit
```

**Result**: 
- Your submission (Build 1) remains unchanged in review
- Build 2 appears in TestFlight for internal testing
- Both builds coexist peacefully

### Option 2: Create New Version (If you want to submit this as next version)

Only use this if your changes are significant enough for a new App Store version (1.0.1 or 1.1.0).

1. **Update Both Version and Build**:
```json
{
  "version": "1.0.1",  // or "1.1.0" for bigger changes
  "ios": {
    "buildNumber": "1"  // Reset to 1 for new version
  }
}
```

2. **Build and Submit**:
```bash
eas build --platform ios --profile production --auto-submit
```

**Result**:
- Version 1.0.0 (Build 1) continues in review
- Version 1.0.1 (Build 1) available in TestFlight as separate version
- No interference between versions

## Recommended Approach

**Use Option 1** (increment build number to 2) because:
- ✅ Safest - zero risk to your submission
- ✅ Fastest - no version confusion
- ✅ TestFlight ready immediately
- ✅ If your submission gets approved, you can then decide to submit Build 2 as version 1.0.1

## Important Notes

1. **Your submission is safe**: Once a build is submitted for review, it's locked. New builds won't replace it.

2. **TestFlight allows multiple builds**: You can have multiple builds of the same version in TestFlight simultaneously.

3. **Build number must always increment**: You can't reuse build numbers, even across different versions.

4. **After approval**: When your v1.0.0 Build 1 is approved and live, you can:
   - Submit Build 2 as v1.0.0 if it's bug fixes
   - Submit a new build as v1.0.1 or v1.1.0 for new features

## Quick Command Reference

### Check Current Settings
```bash
cat app.json | grep -A 3 "buildNumber"
```

### Build for TestFlight (after updating build number)
```bash
eas build --platform ios --profile production --auto-submit
```

### Check Build Status
```bash
eas build:list --platform ios
```

## What Happens Next

After running the build command:
1. EAS builds your app (15-30 minutes)
2. Automatically submits to App Store Connect
3. Build appears in TestFlight within 10-20 minutes after Apple processes it
4. You can test immediately in TestFlight
5. Your original submission continues its review unaffected

## Questions?

- **Q: Will this cancel my review?**
  A: No, your submission (Build 1) is locked and won't be affected.

- **Q: Can I have multiple builds in TestFlight?**
  A: Yes! You can have many builds of the same version.

- **Q: Which build will go live if approved?**
  A: Only Build 1 (the one you submitted) will go live. Other builds stay in TestFlight.

- **Q: Can I switch which build to release?**
  A: Yes, before approval you can select a different build in App Store Connect. After approval, you'd submit a new version.
