# Testing New Disposal Workflow & Protections

## Prerequisites
- ✅ Migrations 003, 004, 005 applied
- ✅ App running (`npm run dev`)
- ✅ Logged in as Asset Manager

---

## Test 1: New 3-Step Disposal Workflow

### Step 1: Navigate to Disposals
1. Go to: http://localhost:3000/inventory/disposals
2. Look at the existing disposal records

**Expected Result:**
- You should see a "Review" button for any Pending disposals
- Status badge should be yellow "Pending"

### Step 2: Click "Review"
1. Find a disposal with status "Pending"
2. Click the "Review" button (Eye icon)

**Expected Result:**
- Status changes to blue "Reviewed"
- Button changes to "Approve" (green) + "Reject" (red)

### Step 3: Click "Approve"
1. Click the green "Approve" button

**Expected Result:**
- Status changes to green "Approved"
- The asset's status becomes "disposed"
- The asset disappears from disposal/transfer form dropdowns
- Buttons disappear (no further actions)

### Alternative: Click "Reject"
1. Instead of Approve, click red "Reject"

**Expected Result:**
- Status changes to red "Rejected"
- Asset remains "active" (not disposed)
- Buttons disappear

---

## Test 2: Create New Disposal Request

### Step 1: Open Dialog
1. Click "Request Disposal" button
2. Select an **active** asset from dropdown

**Expected Result:**
- Only active assets appear in dropdown
- Previously disposed assets are NOT in the list

### Step 2: Fill Form
1. Select disposal method (Sold, Donated, etc.)
2. Enter value
3. Add remarks
4. Submit

**Expected Result:**
- New disposal created with status "Pending"
- Shows "Review" button

---

## Test 3: Database Protection (Re-Disposal)

### Scenario: Try to dispose an already-disposed asset

**Method 1: Via UI (Should not be possible)**
1. Open "Request Disposal" dialog
2. Look for a disposed asset in the dropdown

**Expected Result:**
- ✅ Disposed assets don't appear in dropdown

**Method 2: Via Database (Trigger should block)**
1. Go to Supabase SQL Editor
2. Find a disposed asset's UUID
3. Try to insert a disposal record:
   ```sql
   -- Get a disposed asset ID first
   SELECT id, asset_tag_number, asset_status 
   FROM inventory.asset 
   WHERE asset_status = 'disposed' 
   LIMIT 1;
   
   -- Try to create disposal (should fail)
   INSERT INTO inventory.disposal_history (
     asset_id, 
     disposal_method, 
     disposal_date, 
     disposal_value, 
     requested_by
   )
   VALUES (
     '<disposed-asset-uuid>',
     'Sold',
     '2024-01-01',
     100,
     '<your-user-uuid>'
   );
   ```

**Expected Result:**
- ❌ Error: "Cannot create disposal request for non-active asset"
- ✅ Database trigger blocks the operation

---

## Test 4: Database Protection (Transfer)

### Try to transfer a disposed asset

**Via Database:**
```sql
-- Get a disposed asset ID
SELECT id, asset_tag_number, asset_status 
FROM inventory.asset 
WHERE asset_status = 'disposed' 
LIMIT 1;

-- Try to create transfer (should fail)
INSERT INTO inventory.transfer_history (
  asset_id,
  previous_ministry,
  new_ministry,
  previous_location,
  new_location,
  requested_by
)
VALUES (
  '<disposed-asset-uuid>',
  '<ministry-uuid>',
  '<ministry-uuid>',
  'Location A',
  'Location B',
  '<your-user-uuid>'
);
```

**Expected Result:**
- ❌ Error: "Cannot create transfer request for non-active asset"
- ✅ Database trigger blocks the operation

---

## Test 5: Database Protection (Edit)

### Try to edit a disposed asset

**Via Database:**
```sql
-- Get a disposed asset ID
SELECT id, asset_tag_number, asset_status, asset_description
FROM inventory.asset 
WHERE asset_status = 'disposed' 
LIMIT 1;

-- Try to update description (should fail)
UPDATE inventory.asset 
SET asset_description = 'New description'
WHERE id = '<disposed-asset-uuid>' 
AND asset_status = 'disposed';
```

**Expected Result:**
- ❌ Error: "Cannot update disposed asset"
- ✅ Database trigger blocks the operation

---

## Test 6: Recovery Scenario (Reactivation)

### Reactivate a disposed asset (should be allowed)

```sql
-- This SHOULD succeed (status change allowed for recovery)
UPDATE inventory.asset 
SET asset_status = 'active',
    ministry_assigned = '<ministry-uuid>'
WHERE id = '<disposed-asset-uuid>';
```

**Expected Result:**
- ✅ Update succeeds
- Asset becomes active again
- Asset appears in disposal/transfer dropdowns

---

## Quick Visual Checklist

After migrations, on `/inventory/disposals` you should see:

- [ ] "Review" button for Pending disposals (Eye icon)
- [ ] "Approve" + "Reject" buttons for Reviewed disposals
- [ ] Four status colors: Yellow, Blue, Green, Red
- [ ] "Last Action By" column (not "Approved By")
- [ ] Disposed assets don't appear in "Request Disposal" dropdown

---

## If You Don't See Changes:

1. **Hard refresh the browser**: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
2. **Check migration was applied**:
   ```sql
   -- Check if new columns exist
   SELECT reviewed_by, rejected_by, approved_at 
   FROM inventory.disposal_history 
   LIMIT 1;
   
   -- Check if triggers exist
   SELECT trigger_name, event_object_table 
   FROM information_schema.triggers 
   WHERE trigger_schema = 'inventory';
   ```
3. **Check browser console** for errors
4. **Verify you're logged in as Asset Manager**

---

## Current Disposal Records

To see the workflow in action, you need existing disposal records. Check if you have any:

```sql
SELECT 
  dh.id,
  a.asset_tag_number,
  dh.disposal_method,
  CASE 
    WHEN dh.rejected_by IS NOT NULL THEN 'Rejected'
    WHEN dh.approved_by IS NOT NULL THEN 'Approved'
    WHEN dh.reviewed_by IS NOT NULL THEN 'Reviewed'
    ELSE 'Pending'
  END as status
FROM inventory.disposal_history dh
JOIN inventory.asset a ON a.id = dh.asset_id
ORDER BY dh.created_at DESC;
```

If no records exist, create one using "Request Disposal" button!

