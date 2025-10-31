# Creating a New Supabase Project

## Impact Assessment

### ⚠️ IMPORTANT: What You'll Lose
- **All existing user accounts** (if any test users exist)
- **All test data** (grocery sessions, products, checkout history)
- **Any uploaded product images** in storage

### ✅ What Won't Be Affected
- **Your code** - No code changes needed (except .env)
- **App Store submission** - Won't affect submission at all
- **The app's functionality** - Will work exactly the same
- **Your builds** - Already built apps won't break, they just need to be rebuilt

### 💡 Good News
Since you're still in development/testing phase and haven't launched yet, this is the **perfect time** to create a fresh database. You'll start with a clean slate.

## Step-by-Step: Create New Supabase Project

### 1. Create New Project

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Sign in with `tbijou@me.com` (or create account if needed)

2. **Click "New Project"**
   - Organization: Create new or use existing
   - Name: `strago` or `three-steps-grocery`
   - Database Password: **Choose a strong password and SAVE IT**
   - Region: Choose closest to your target users (e.g., `us-east-1`)
   - Plan: Free tier is fine for now

3. **Wait for Project Setup**
   - Takes 2-3 minutes
   - Don't close the window

### 2. Get Your New Credentials

Once project is created:

1. **Go to Project Settings → API**
   - Find "Project URL" (e.g., `https://abcdefghijk.supabase.co`)
   - Find "anon/public" key (long string starting with `eyJ...`)

2. **Copy Both Values** - You'll need them next

### 3. Update Your .env File

Replace the current `.env` file with new credentials:

```bash
# Update these with your NEW Supabase values
EXPO_PUBLIC_SUPABASE_URL=https://your-new-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key-here
```

**IMPORTANT:** Keep your .env file secure and never commit it to git!

### 4. Set Up Storage Bucket

1. **Go to Storage in Supabase Dashboard**
2. **Create New Bucket**
   - Name: `product-images`
   - Public bucket: ✓ Yes (checked)
   - File size limit: 50MB
   - Allowed MIME types: `image/*`

3. **Set Bucket Policy**
   - Click on the bucket
   - Go to "Policies"
   - Create these policies:

   **Policy 1: Allow public read**
   ```sql
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   USING ( bucket_id = 'product-images' );
   ```

   **Policy 2: Allow authenticated uploads**
   ```sql
   CREATE POLICY "Authenticated users can upload"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK ( bucket_id = 'product-images' );
   ```

### 5. Run All Database Migrations

Go to SQL Editor in Supabase Dashboard and run these migrations **in order**:

#### Migration 1: Create Base Schema
```sql
-- Copy contents from: supabase/migrations/20251025162643_create_grocery_tracker_schema.sql
```

#### Migration 2: Add Checkout Sessions
```sql
-- Copy contents from: supabase/migrations/20251025165012_add_checkout_sessions_table.sql
```

#### Migration 3: Add Brand to Products
```sql
-- Copy contents from: supabase/migrations/20251025170329_add_brand_to_products.sql
```

#### Migration 4: Add Grocery Sessions
```sql
-- Copy contents from: supabase/migrations/20251025171319_add_grocery_sessions.sql
```

#### Migration 5: Add Session Times
```sql
-- Copy contents from: supabase/migrations/20251025181019_add_start_end_times_to_sessions.sql
```

#### Migration 6: Add Session Details
```sql
-- Copy contents from: supabase/migrations/20251025181715_add_grocery_session_details.sql
```

#### Migration 7: Add Store Location
```sql
-- Copy contents from: supabase/migrations/20251025184244_add_store_location_to_grocery_sessions.sql
```

#### Migration 8: Add Store to Checkout Sessions
```sql
-- Copy contents from: supabase/migrations/20251029000000_add_store_to_checkout_sessions.sql
```

#### Migration 9: Add Account Deletion
```sql
-- Copy contents from: supabase/migrations/20251030000000_add_account_deletion.sql
```

**Tip:** Run each migration separately, wait for success before proceeding to next.

### 6. Test Your Local App

1. **Restart your development server**
   ```bash
   # Stop current server (Ctrl+C)
   # Start fresh
   npx expo start -c
   ```

2. **Test the app**
   - Create a test account
   - Add some products
   - Test checkout
   - Verify everything works

### 7. Rebuild and Republish

Once you've verified everything works locally:

1. **Publish to Expo**
   ```bash
   eas update --branch production --message "Updated Supabase configuration"
   ```

2. **Build new version for App Store**
   ```bash
   eas build --platform ios --profile production
   ```

3. **Wait for build to complete** (30-45 minutes)

4. **Submit to TestFlight**
   ```bash
   eas submit --platform ios --latest
   ```

## Impact on App Store Submission

### Will NOT Affect Submission:
- ✅ Database change is backend-only
- ✅ No app functionality changes
- ✅ No UI changes
- ✅ Same version number (1.1.0 build 4)
- ✅ Same bundle identifier
- ✅ Same features and capabilities

### Will Need to Do:
- 🔄 Rebuild the iOS app (takes 30-45 min)
- 🔄 Resubmit to TestFlight
- 🔄 Wait for Apple review again (24-48 hours)

## Demo Account for App Store

After setting up the new database:

1. **Create demo account**
   - Email: `demo@strago.app`
   - Password: Choose a simple one for reviewers
   - Document it in `DEMO_ACCOUNT_INFO.md`

2. **Add test data**
   - Create a grocery session
   - Add 3-5 products
   - Complete a checkout
   - This gives reviewers something to see

## Timeline

- **Setup new Supabase:** 10-15 minutes
- **Run migrations:** 5-10 minutes
- **Test locally:** 10-15 minutes
- **Rebuild app:** 30-45 minutes
- **Submit to App Store:** 5 minutes
- **Apple review:** 24-48 hours

**Total:** About 1 hour of your time + waiting for build/review

## Alternative: Try Finding Old Project First

Before creating a new project, one last attempt:

1. Check your email (tbijou@me.com) for "Welcome to Supabase"
2. Try logging in to Supabase with GitHub OAuth
3. Try other email addresses you might have used

If you find it, you only need to:
- Run the one missing migration
- No rebuild needed
- No resubmission needed

## Recommendation

**If you can't find the old project within 15 minutes → Create a new one.**

The time saved by creating a fresh project outweighs the time spent searching for the old one, especially since you're still in development phase.

## Need Help?

I can help you:
1. Extract and prepare all migration files
2. Create a single SQL script to run all migrations at once
3. Test the new setup

Let me know which option you'd like to proceed with!
