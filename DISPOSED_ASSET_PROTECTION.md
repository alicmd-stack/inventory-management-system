# Disposed Asset Protection

## Summary

Once an asset is approved for disposal, it becomes **completely immutable** and is protected at three layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    DISPOSED ASSET                           │
│                   (Read-Only State)                         │
├─────────────────────────────────────────────────────────────┤
│  ❌ Cannot be Transferred                                   │
│  ❌ Cannot be Re-Disposed                                   │
│  ❌ Cannot be Edited                                        │
│  ✅ Can only be Viewed                                      │
│  ✅ Can be Reactivated (with proper authorization)         │
└─────────────────────────────────────────────────────────────┘
```

---

## Protection Layers

### 🎨 Layer 1: UI/UX (Convenience)
**Purpose**: Hide disposed assets from operational forms

| Feature | Protection |
|---------|-----------|
| Transfer Form | Disposed assets don't appear in dropdown |
| Disposal Form | Disposed assets don't appear in dropdown |
| Edit Form | "Edit" button will be disabled for disposed assets |
| Asset List | Disposed assets show gray "disposed" badge |

**Implementation**:
- Dropdowns filter: `.eq("asset_status", "active")`
- Edit button conditional rendering based on status

---

### 🛡️ Layer 2: Application Logic (User Experience)
**Purpose**: Provide helpful error messages

**Disposal Creation**:
```typescript
// Validates before database call
const { data: asset } = await supabase
  .schema("inventory")
  .from("asset")
  .select("asset_status, asset_tag_number")
  .eq("id", assetId)
  .single();

if (asset.asset_status !== "active") {
  throw new Error(
    `Cannot dispose ${asset.asset_status} asset "${asset.asset_tag_number}". 
     Only active assets can be disposed.`
  );
}
```

**Transfer Creation**: Same validation pattern

**Asset Update**: (To be implemented when edit feature is added)
```typescript
if (asset.asset_status === "disposed") {
  throw new Error("Cannot edit disposed asset. Disposed assets are read-only.");
}
```

---

### 🔒 Layer 3: Database Constraints (Security)
**Purpose**: Enforce business rules at the data level

#### Trigger 1: Prevent Re-Disposal
```sql
CREATE TRIGGER prevent_disposal_of_inactive_assets
  BEFORE INSERT ON inventory.disposal_history
  FOR EACH ROW
  EXECUTE FUNCTION inventory.check_asset_active_for_disposal();
```

**Error Message**: 
```
ERROR: Cannot create disposal request for non-active asset (asset_id: xxx)
HINT: Only assets with status "active" can be disposed
```

#### Trigger 2: Prevent Transfers
```sql
CREATE TRIGGER prevent_transfer_of_inactive_assets
  BEFORE INSERT ON inventory.transfer_history
  FOR EACH ROW
  EXECUTE FUNCTION inventory.check_asset_active_for_transfer();
```

**Error Message**: 
```
ERROR: Cannot create transfer request for non-active asset (asset_id: xxx)
HINT: Only assets with status "active" can be transferred
```

#### Trigger 3: Prevent Edits (Read-Only)
```sql
CREATE TRIGGER prevent_update_of_disposed_assets
  BEFORE UPDATE ON inventory.asset
  FOR EACH ROW
  EXECUTE FUNCTION inventory.prevent_disposed_asset_update();
```

**Error Message**: 
```
ERROR: Cannot update disposed asset (asset_id: xxx, asset_tag: VA-000123)
HINT: Disposed assets are read-only and cannot be modified
```

**Exception**: The trigger allows status changes from `disposed` → `active` for recovery scenarios.

---

## What Happens When an Asset is Disposed?

### During Approval (Step 3 of Disposal Workflow)
```typescript
// When Asset Manager clicks "Approve" on a reviewed disposal:

1. Asset status changes: 'active' → 'disposed'
2. Ministry assignment cleared: ministry_assigned = NULL
3. Responsible person cleared: responsible_ministry_leader = NULL
4. Disposal record updated: approved_by = user_id, approved_at = timestamp
```

### After Approval
```
┌─────────────────────────────────────────────────────────────┐
│  Asset Table (inventory.asset)                              │
├─────────────────────────────────────────────────────────────┤
│  asset_status: 'disposed'                                   │
│  ministry_assigned: NULL                                    │
│  responsible_ministry_leader: NULL                          │
│  physical_location: [Last known location - preserved]      │
│  acquisition_cost: [Preserved for records]                 │
│  Other fields: [All preserved for historical records]      │
├─────────────────────────────────────────────────────────────┤
│  STATE: Read-Only, Immutable                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Recovery Scenarios

### Reactivating a Disposed Asset
If an asset was disposed by mistake, an Asset Manager can reactivate it:

```sql
-- This IS allowed by the database trigger
UPDATE inventory.asset 
SET asset_status = 'active',
    ministry_assigned = 'ministry-uuid',
    responsible_ministry_leader = 'Leader Name'
WHERE id = 'asset-uuid';
```

**Note**: This should be a rare administrative action and may require audit trail.

---

## Testing Checklist

After applying migration `005_disposal_constraints.sql`, verify:

- [ ] ✅ UI: Disposed assets don't appear in disposal form dropdown
- [ ] ✅ UI: Disposed assets don't appear in transfer form dropdown  
- [ ] ✅ UI: Disposed assets show "disposed" badge in asset list
- [ ] ✅ App: Friendly error when trying to dispose a disposed asset via DevTools
- [ ] ✅ App: Friendly error when trying to transfer a disposed asset via DevTools
- [ ] ✅ DB: Direct SQL INSERT into disposal_history for disposed asset fails
- [ ] ✅ DB: Direct SQL INSERT into transfer_history for disposed asset fails
- [ ] ✅ DB: Direct SQL UPDATE of disposed asset fields fails
- [ ] ✅ DB: SQL UPDATE to change status from 'disposed' to 'active' succeeds (recovery)

---

## Migration Files Required

Run these in order in Supabase SQL Editor:

1. **003_disposal_workflow.sql** - Adds reviewed_by, rejected_by fields
2. **004_make_ministry_nullable.sql** - Allows NULL ministry (for disposed assets)
3. **005_disposal_constraints.sql** - Adds all three protection triggers ⭐

---

## Benefits of This Approach

✅ **Defense in Depth**: Three layers of protection
✅ **User-Friendly**: Clear error messages at each layer  
✅ **Secure**: Cannot be bypassed via API or direct database access
✅ **Maintainable**: Business rules enforced in database schema
✅ **Recoverable**: Allows reactivation if needed
✅ **Auditable**: All operations logged via disposal_history

---

## Future Enhancements

When implementing the asset edit feature:

1. Add UI check to disable edit button for disposed assets
2. Add application validation before update (already documented above)
3. Database trigger is already in place ✅




