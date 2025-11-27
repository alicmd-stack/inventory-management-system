# Quick Start Guide

## ⚠️ Before Running the App

You're seeing 404 errors because the database hasn't been set up yet. Follow these steps:

## Step 1: Apply Database Migrations

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/oyewjuvpnavwhmdiqfve
2. Click on **SQL Editor** in the left sidebar
3. Click **+ New query**
4. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
5. Paste it into the query editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Wait for ✅ Success message

8. Repeat for the second migration:
   - Create a new query
   - Copy contents of `supabase/migrations/002_rls_policies.sql`
   - Paste and Run

## Step 2: Expose the Inventory Schema

The `asset`, `verification_history`, `transfer_history`, and `disposal_history` tables are in the `inventory` schema, not `public`.

**Option A: Expose the Schema (Recommended)**

1. In Supabase Dashboard, go to **Settings** → **API**
2. Scroll to **Exposed schemas**
3. Add `inventory` to the list (if it's not already there)
4. Click **Save**

**Option B: Tables in Public Schema**
If you prefer, you can modify the migrations to create tables in `public` schema instead of `inventory`.

## Step 3: Reload Schema Cache

Supabase needs to refresh its understanding of your database:

1. Go to **API Docs** in Supabase dashboard
2. This triggers a schema refresh
3. OR wait 2-3 minutes for automatic refresh

## Step 4: Seed with Sample Data

### Option A: Quick User ID Lookup

1. Run this SQL in Supabase SQL Editor:

```sql
-- Copy and run: supabase/GET_USER_ID.sql
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 10;
```

2. Copy your `id` (UUID) from the results

### Option B: Full Sample Data

1. Open `supabase/seed_sample_data.sql`
2. Find all instances of `YOUR_USER_ID_HERE` (there are 13 of them)
3. Replace with your actual user ID from Step 4A
4. Run the entire script in Supabase SQL Editor

**This will create:**

- ✅ 3 Roles (finance, ministry_leader, system_admin)
- ✅ 2 Church Branches (Main Campus, North Branch)
- ✅ 7 Ministries across both branches
- ✅ Your user profile with Finance role
- ✅ 7 Sample Assets (pianos, projectors, computers, furniture)
- ✅ 5 Verification records
- ✅ 1 Pending Transfer request
- ✅ 1 Pending Disposal request

### Quick Find & Replace:

If using VS Code or Cursor:

1. Open `supabase/seed_sample_data.sql`
2. Press `Cmd+H` (Mac) or `Ctrl+H` (Windows)
3. Find: `YOUR_USER_ID_HERE`
4. Replace with: `your-actual-uuid-from-step-4a`
5. Click "Replace All" (should replace 13 instances)
6. Save and copy the entire file
7. Paste and run in Supabase SQL Editor

## Step 5: Refresh Your App

1. Go back to http://localhost:3000/inventory
2. Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
3. Check browser console - errors should be gone!

## Troubleshooting

### Still seeing 404 errors?

- Verify migrations ran successfully (check for green checkmarks)
- Make sure `inventory` schema is exposed in API settings
- Wait 2-3 minutes for Supabase to refresh schema cache

### "Could not find relationship" error?

- This means the schema wasn't properly created
- Re-run the migrations
- Check for any SQL errors in the output

### User role errors?

- Make sure you created a user_profile record for your user
- Verify the user_roles record exists
- Check that the roles table has the 'finance' role

### Empty dashboard?

- This is normal if you haven't created any assets yet
- Run the test data SQL above to see sample data
- Or start creating assets through the UI once everything is working

## Next Steps

Once the errors are gone:

1. Create your church branches and ministries
2. Add user profiles and roles
3. Start adding assets!
