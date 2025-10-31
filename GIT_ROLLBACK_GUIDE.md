# Git Rollback Guide - v1.1.0

## Release Information

**Current Version:** v1.1.0 (Build 4)
**Git Commit:** `c736463`
**Git Tag:** `v1.1.0-build4`
**Branch:** `new-color`
**Release Date:** October 30, 2025

## What Was Deployed

### Code Changes
- 5-tab UI layout
- Settings moved to header
- Image upload fix (legacy API)
- Version updates to 1.1.0 build 4

### Database Changes
- New Supabase project created
- All 9 migrations applied
- Storage bucket configured

### Build & Submission
- Build ID: `0033c233-7be8-4be9-88c4-f3e5cdf05633`
- Submission ID: `803e4ddd-4180-4c8f-95c6-4c1ce2bf73cd`
- Status: Successfully submitted to App Store

---

## Rollback Options

### Option 1: Rollback Code Only (Recommended if Issue is Minor)

This keeps the new database but rolls back the code changes.

```bash
# Check available tags
git tag -l

# Rollback to previous version (you'll need to identify the previous tag)
git checkout <previous-tag>

# Or rollback to specific commit
git log --oneline  # Find the commit you want
git checkout <commit-hash>

# Create a new branch for the rollback
git checkout -b rollback-v1.1.0

# Rebuild and resubmit
eas build --platform ios --profile production
eas submit --platform ios --latest
```

### Option 2: Full Rollback (Code + Database)

Use this if the new Supabase setup is causing issues.

#### Step 1: Rollback Code

```bash
# Rollback to previous release
git checkout <previous-tag>
git checkout -b rollback-full
```

#### Step 2: Restore Old Database

If you have access to the old Supabase project:

1. **Update .env**
   ```
   EXPO_PUBLIC_SUPABASE_URL=<old-supabase-url>
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<old-anon-key>
   ```

2. **Commit the change**
   ```bash
   git add .env
   git commit -m "Rollback: Restore old Supabase credentials"
   ```

#### Step 3: Rebuild & Resubmit

```bash
eas build --platform ios --profile production
eas submit --platform ios --latest
```

### Option 3: Cherry-Pick Specific Fixes

If you only want to keep some changes:

```bash
# Create new branch from previous version
git checkout <previous-tag>
git checkout -b selective-rollback

# Cherry-pick specific commits you want to keep
git cherry-pick <commit-hash>

# Rebuild
eas build --platform ios --profile production
eas submit --platform ios --latest
```

---

## Detailed Rollback Steps

### A. Find Previous Version

```bash
# View all tags
git tag -l

# View commit history
git log --oneline --graph --all

# View changes in current version
git diff v1.1.0-build4^..v1.1.0-build4
```

### B. Rollback Process

```bash
# 1. Ensure you have all commits
git fetch --all --tags

# 2. Create backup branch of current state
git branch backup-v1.1.0 c736463

# 3. Rollback to previous version
git checkout <previous-tag-or-commit>

# 4. Create new branch
git checkout -b rollback-from-v1.1.0

# 5. Test locally
npx expo start -c

# 6. If good, rebuild
eas build --platform ios --profile production

# 7. Submit
eas submit --platform ios --latest
```

### C. Update Version Numbers for Rollback

If rolling back, you may need to increment build number:

```bash
# Update app.json
# Change "version": "1.1.0" to "1.0.1" or "1.1.1"
# Change iOS buildNumber to 5 (increment from 4)

# Update iOS files
# ios/ThreeSteps/Info.plist - CFBundleShortVersionString
# ios/ThreeSteps/Supporting/Expo.plist - EXUpdatesRuntimeVersion
# ios/ThreeSteps.xcodeproj/project.pbxproj - CURRENT_PROJECT_VERSION
```

---

## Database Rollback

### If Using New Database (Current)

**Supabase Project:** `qijxxreajhacsyupmskd`
**URL:** https://qijxxreajhacsyupmskd.supabase.co

### To Switch Back to Old Database

1. **Locate old database credentials**
   - Check git history for old .env
   - Check your email for Supabase welcome message
   - Check backup files

2. **Update .env**
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=<old-url>
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<old-key>
   ```

3. **Rebuild app**
   ```bash
   eas build --platform ios --profile production
   ```

### Data Migration (If Needed)

If users created data in the new database:

```sql
-- Export data from new database
-- Connect to: https://qijxxreajhacsyupmskd.supabase.co

-- Export users, sessions, products, etc.
COPY (SELECT * FROM profiles) TO '/tmp/profiles.csv' CSV HEADER;
COPY (SELECT * FROM products) TO '/tmp/products.csv' CSV HEADER;
-- etc...

-- Import to old database
\copy profiles FROM '/tmp/profiles.csv' CSV HEADER;
\copy products FROM '/tmp/products.csv' CSV HEADER;
```

---

## Rollback Verification Checklist

After rollback:

- [ ] Code is at correct version
- [ ] .env has correct Supabase credentials
- [ ] App builds successfully
- [ ] Local testing passes
- [ ] Version numbers updated correctly
- [ ] Build submitted to App Store
- [ ] TestFlight shows correct version
- [ ] Users notified (if needed)

---

## Commit References

### Current Release (v1.1.0 build 4)
```
Commit: c736463
Tag: v1.1.0-build4
Branch: new-color
Message: "Release v1.1.0 build 4 - 5-tab UI, image fix, new Supabase DB"
```

### Previous Commits
```bash
# View history
git log --oneline --graph

# View specific file history
git log --oneline -- app.json
```

---

## Quick Rollback Commands

### Emergency Rollback (Fast)
```bash
# Rollback to previous commit on same branch
git reset --hard HEAD~1
git push origin new-color --force

# Then rebuild
eas build --platform ios --profile production
eas submit --platform ios --latest
```

⚠️ **WARNING:** `--force` push will overwrite remote history. Use with caution.

### Safe Rollback (Recommended)
```bash
# Revert the commit (creates new commit)
git revert c736463
git push origin new-color

# Then rebuild
eas build --platform ios --profile production
eas submit --platform ios --latest
```

---

## Files Changed in v1.1.0

Key files to review when rolling back:

- `app/(tabs)/_layout.tsx` - 5-tab layout
- `app/(tabs)/settings.tsx` - Settings tab (new)
- `components/HeaderActions.tsx` - Header settings icon (new)
- `lib/imageUpload.ts` - Legacy API fix
- `app.json` - Version 1.1.0
- `ios/ThreeSteps/Info.plist` - Build 4
- `.env` - New Supabase credentials

---

## Support & Recovery

### If Rollback Fails

1. **Code won't build:**
   ```bash
   # Clean everything
   rm -rf node_modules
   npm install
   npx expo prebuild --clean
   ```

2. **Database connection issues:**
   - Verify .env credentials
   - Check Supabase project status
   - Test connection with test script

3. **Build issues:**
   - Check EAS credentials
   - Verify iOS certificates
   - Clear EAS cache: `eas build:clear-cache`

### Contact Information

- **Expo Support:** https://expo.dev/support
- **Supabase Support:** https://supabase.com/support
- **Apple Developer:** https://developer.apple.com/contact/

---

## Backup Information

### Current State Backup

**Branch:** `backup-v1.1.0` (created automatically)
**Commit:** `c736463`

To restore current state later:
```bash
git checkout backup-v1.1.0
git checkout -b restore-v1.1.0
```

### Database Backup

**New Supabase:**
- Project: qijxxreajhacsyupmskd  
- Dashboard: https://supabase.com/dashboard/project/qijxxreajhacsyupmskd

To backup database:
```bash
# Using Supabase CLI
supabase db dump -f backup.sql

# Or via dashboard
# Go to Database → Backups → Create Backup
```

---

## Prevention for Next Time

1. **Always tag releases:**
   ```bash
   git tag -a v1.x.x -m "Description"
   git push origin v1.x.x
   ```

2. **Test on TestFlight first:**
   - Submit to TestFlight
   - Test thoroughly
   - Then release to App Store

3. **Keep database backups:**
   - Regular Supabase backups
   - Export critical data
   - Document credentials

4. **Version control everything:**
   - Include documentation
   - Track .env.example
   - Document migrations

---

## Summary

You now have:
- ✅ Git commit tagged: `v1.1.0-build4`
- ✅ Backup branch: `backup-v1.1.0`
- ✅ Changes pushed to GitHub
- ✅ Easy rollback options documented

To rollback, choose the option that best fits your situation and follow the steps above.
