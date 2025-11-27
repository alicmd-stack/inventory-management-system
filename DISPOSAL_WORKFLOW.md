# Disposal Workflow Implementation

## Overview
The disposal workflow has been updated to match the old app's 3-step approval process.

## Workflow States

### 1. Pending
- **Trigger**: Ministry leader or Asset Manager creates a disposal request
- **Action Available**: "Review" button (Eye icon)
- **Who Can Act**: Asset Managers only
- **Badge Color**: Yellow

### 2. Reviewed  
- **Trigger**: Asset Manager clicks "Review"
- **Actions Available**: 
  - "Approve" button (green)
  - "Reject" button (red)
- **Who Can Act**: Asset Managers only
- **Badge Color**: Blue

### 3. Approved
- **Trigger**: Asset Manager clicks "Approve"
- **Side Effects**:
  - Asset `asset_status` updated to 'disposed'
  - Asset `ministry_assigned` set to NULL
  - Asset `responsible_ministry_leader` set to NULL
- **Actions Available**: None
- **Badge Color**: Green

### 4. Rejected
- **Trigger**: Asset Manager clicks "Reject"
- **Side Effects**: None (asset remains unchanged)
- **Actions Available**: None
- **Badge Color**: Red

## Database Changes Required

### Migration 003: Add Disposal Workflow Fields
```sql
ALTER TABLE inventory.disposal_history 
ADD COLUMN IF NOT EXISTS reviewed_by uuid references auth.users(id) on delete set null,
ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
ADD COLUMN IF NOT EXISTS rejected_by uuid references auth.users(id) on delete set null,
ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
ADD COLUMN IF NOT EXISTS approved_at timestamptz;
```

### Migration 004: Make Ministry Nullable
```sql
ALTER TABLE inventory.asset 
ALTER COLUMN ministry_assigned DROP NOT NULL;
```

**Reason**: Disposed assets should have no ministry assignment since they're no longer in use.

### Migration 005: Database Constraints (CRITICAL)

This migration adds **three critical database triggers**:

#### 1. Prevent Disposal of Non-Active Assets
```sql
CREATE TRIGGER prevent_disposal_of_inactive_assets
  BEFORE INSERT ON inventory.disposal_history
  FOR EACH ROW
  EXECUTE FUNCTION inventory.check_asset_active_for_disposal();
```

#### 2. Prevent Transfer of Non-Active Assets
```sql
CREATE TRIGGER prevent_transfer_of_inactive_assets
  BEFORE INSERT ON inventory.transfer_history
  FOR EACH ROW
  EXECUTE FUNCTION inventory.check_asset_active_for_transfer();
```

#### 3. Prevent Editing of Disposed Assets
```sql
CREATE TRIGGER prevent_update_of_disposed_assets
  BEFORE UPDATE ON inventory.asset
  FOR EACH ROW
  EXECUTE FUNCTION inventory.prevent_disposed_asset_update();
```

**Critical**: These prevent operations on disposed assets **at the database level**, not just in the UI.

**Note**: The trigger allows changing status FROM disposed TO active (for recovery scenarios), but prevents any other updates to disposed assets.

## Business Rules Implemented

### Multi-Layer Protection Against Invalid Operations

#### Layer 1: UI Filtering (Convenience)
- **Transfer Form**: Only shows assets with `asset_status = 'active'`
- **Disposal Form**: Only shows assets with `asset_status = 'active'`
- **Asset Table**: Shows all assets, but disposed ones have gray "disposed" badge

#### Layer 2: Application Validation (User-Friendly Errors)
- Before creating disposal: Checks asset status and shows friendly error
- Before creating transfer: Checks asset status and shows friendly error
- Provides specific error messages with asset tag number

#### Layer 3: Database Constraints (Security)
- **BEFORE INSERT trigger** on `disposal_history` table → Prevents re-disposal
- **BEFORE INSERT trigger** on `transfer_history` table → Prevents transfers
- **BEFORE UPDATE trigger** on `asset` table → Prevents editing (read-only)
- Prevents invalid operations even if someone bypasses UI/API
- Enforces business rules at the data level
- Makes disposed assets completely immutable

### On Disposal Approval
When an Asset Manager approves a disposal:
1. ✅ Asset status changes from 'active' → 'disposed'
2. ✅ Ministry assignment cleared (set to NULL)
3. ✅ Responsible person cleared (set to NULL)
4. ✅ Asset no longer appears in transfer/disposal forms
5. ✅ Asset still visible in asset table (for historical records)

### Data Integrity
- Disposed assets maintain their historical data:
  - Original acquisition info
  - Category, tag number, description
  - Financial information
  - Disposal history records
- But operational fields are cleared:
  - Ministry assignment
  - Physical location remains (last known location)
  - Responsible person

## Status Priority Logic

```typescript
const getDisposalStatus = (record: DisposalRecord): string => {
  if (record.rejected_by) return "Rejected";      // Highest priority
  if (record.approved_by) return "Approved";      // Second priority
  if (record.reviewed_by) return "Reviewed";      // Third priority
  return "Pending";                                // Default
};
```

## Apply These Migrations

Run in Supabase SQL Editor in this **exact order**:

1. **003_disposal_workflow.sql** - Adds workflow tracking columns
2. **004_make_ministry_nullable.sql** - Allows NULL ministry for disposed assets
3. **005_disposal_constraints.sql** - Enforces business rules at database level (CRITICAL)

After applying all three migrations, refresh your app to see:
- ✅ Full 3-step disposal workflow (Pending → Reviewed → Approved/Rejected)
- ✅ Database-level protection against re-disposal
- ✅ Database-level protection against transferring disposed assets
- ✅ Database-level protection against editing disposed assets (read-only)
- ✅ User-friendly error messages when violations are attempted

**Result**: Disposed assets become completely immutable - they cannot be transferred, disposed again, or edited.

## Testing the Constraints

Try these scenarios to verify the protection works:

### Test 1: Re-Disposal Prevention
1. **UI Layer**: Try to create a disposal for a disposed asset - Should not see it in the dropdown
2. **Application Layer**: Use browser DevTools to force submit - Should see friendly error message
3. **Database Layer**: Try direct SQL insert:
   ```sql
   INSERT INTO inventory.disposal_history (asset_id, disposal_method, disposal_date, disposal_value, requested_by)
   VALUES ('disposed-asset-uuid', 'Sold', '2024-01-01', 100, 'user-uuid');
   -- Should fail with: "Cannot create disposal request for non-active asset"
   ```

### Test 2: Transfer Prevention
Same as above but for `transfer_history` table.

### Test 3: Edit Prevention
Try to update a disposed asset:
```sql
UPDATE inventory.asset 
SET asset_description = 'New description'
WHERE id = 'disposed-asset-uuid' AND asset_status = 'disposed';
-- Should fail with: "Cannot update disposed asset"
```

### Recovery Scenario (Allowed)
If you need to reactivate a disposed asset (rare):
```sql
UPDATE inventory.asset 
SET asset_status = 'active'
WHERE id = 'disposed-asset-uuid';
-- This IS allowed (status change from disposed to active)
```

