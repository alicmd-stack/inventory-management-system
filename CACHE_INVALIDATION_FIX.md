# Dashboard Auto-Refresh Fix

## Problem
After performing actions (approve disposal, complete transfer, etc.), navigating back to the dashboard showed stale data. Manual browser refresh was required to see updated counts.

## Root Cause
**React Query cache invalidation** - When mutations occurred on other pages, the dashboard's query cache wasn't being invalidated.

## Solution
Updated all mutation `onSuccess` callbacks to invalidate the relevant dashboard queries.

---

## Dashboard Query Keys

The dashboard uses these query keys for its stats:

```typescript
// app/(inventory)/inventory/page.tsx
{
  ["assets"]: getAssets(),           // Total Assets count
  ["verifications"]: getVerifications(5), // Verifications count
  ["transfers"]: getPendingTransfers(),   // Active Transfers count
  ["disposals"]: getPendingDisposals(),   // Pending Disposals count
}
```

---

## Mutations Updated

### Disposals Page (`app/(inventory)/inventory/disposals/page.tsx`)

#### 1. Create Disposal Mutation
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["disposal-history-full"] });
  queryClient.invalidateQueries({ queryKey: ["assets-for-disposal"] });
  queryClient.invalidateQueries({ queryKey: ["disposals"] }); // ✅ ADDED
  // ...
}
```
**Effect**: Dashboard "Pending Disposals" count updates when new disposal is created.

#### 2. Review Disposal Mutation
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["disposal-history-full"] });
  queryClient.invalidateQueries({ queryKey: ["disposals"] }); // ✅ ADDED
}
```
**Effect**: Dashboard reflects status change from "Pending" to "Reviewed".

#### 3. Approve Disposal Mutation
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["disposal-history-full"] });
  queryClient.invalidateQueries({ queryKey: ["assets"] });
  queryClient.invalidateQueries({ queryKey: ["assets-for-disposal"] });
  queryClient.invalidateQueries({ queryKey: ["assets-for-transfer"] });
  queryClient.invalidateQueries({ queryKey: ["disposals"] }); // ✅ ADDED
}
```
**Effect**: Dashboard reflects:
- Disposal no longer pending (removed from count)
- Asset becomes disposed (Total Assets might change if filtering by status)

#### 4. Reject Disposal Mutation
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["disposal-history-full"] });
  queryClient.invalidateQueries({ queryKey: ["disposals"] }); // ✅ ADDED
}
```
**Effect**: Dashboard reflects disposal no longer pending.

---

### Transfers Page (`app/(inventory)/inventory/transfers/page.tsx`)

#### 1. Create Transfer Mutation
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["transfer-history-full"] });
  queryClient.invalidateQueries({ queryKey: ["assets-for-transfer"] });
  queryClient.invalidateQueries({ queryKey: ["transfers"] }); // ✅ ADDED
  // ...
}
```
**Effect**: Dashboard "Active Transfers" count increases.

#### 2. Approve Transfer Mutation
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["transfer-history-full"] });
  queryClient.invalidateQueries({ queryKey: ["transfers"] }); // ✅ ADDED
}
```
**Effect**: Dashboard reflects transfer status change (still counted as "active").

#### 3. Complete Transfer Mutation
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["transfer-history-full"] });
  queryClient.invalidateQueries({ queryKey: ["assets"] });
  queryClient.invalidateQueries({ queryKey: ["transfers"] }); // ✅ ADDED
}
```
**Effect**: Dashboard reflects:
- Transfer no longer active (removed from count)
- Asset ministry updated

---

## How It Works

### Before Fix
```
User Action (Approve Disposal)
  ↓
Mutation updates database
  ↓
Invalidates ["disposal-history-full"]
  ↓
User navigates to /inventory (Dashboard)
  ↓
Dashboard queries use STALE cache
  ❌ Shows old counts
```

### After Fix
```
User Action (Approve Disposal)
  ↓
Mutation updates database
  ↓
Invalidates:
  - ["disposal-history-full"]
  - ["disposals"] ✅
  - ["assets"] ✅
  ↓
User navigates to /inventory (Dashboard)
  ↓
Dashboard queries detect stale cache
  ↓
Automatically refetch data
  ✅ Shows updated counts
```

---

## Testing the Fix

### Test 1: Create New Disposal
1. Go to Dashboard, note "Pending Disposals" count
2. Go to Disposals page
3. Click "Request Disposal", submit form
4. Navigate back to Dashboard
5. ✅ Count should increase automatically (no refresh needed)

### Test 2: Approve Disposal
1. Go to Dashboard, note "Pending Disposals" count
2. Go to Disposals page
3. Review → Approve a disposal
4. Navigate back to Dashboard
5. ✅ Count should decrease automatically

### Test 3: Create Transfer
1. Go to Dashboard, note "Active Transfers" count
2. Go to Transfers page
3. Click "Request Transfer", submit form
4. Navigate back to Dashboard
5. ✅ Count should increase automatically

### Test 4: Complete Transfer
1. Go to Dashboard, note "Active Transfers" count
2. Go to Transfers page
3. Complete a transfer
4. Navigate back to Dashboard
5. ✅ Count should decrease automatically

---

## React Query Cache Invalidation Patterns

### Pattern 1: Invalidate Related Queries
```typescript
// When an action affects multiple data sets
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["assets"] });
  queryClient.invalidateQueries({ queryKey: ["disposals"] });
  queryClient.invalidateQueries({ queryKey: ["transfers"] });
}
```

### Pattern 2: Invalidate Prefix
```typescript
// Invalidate all queries starting with "disposal"
queryClient.invalidateQueries({ queryKey: ["disposal"] });
// Invalidates: ["disposal-history-full"], ["disposals"], etc.
```

### Pattern 3: Selective Invalidation
```typescript
// Only invalidate if condition is met
if (wasApproved) {
  queryClient.invalidateQueries({ queryKey: ["disposals"] });
}
```

---

## Future Considerations

### When Adding New Mutations
Always ask: **"Does this action affect the dashboard counts?"**

If YES, add:
```typescript
queryClient.invalidateQueries({ queryKey: ["<dashboard-query-key>"] });
```

### Dashboard Query Keys to Remember
- `["assets"]` - Total assets
- `["verifications"]` - Recent verifications
- `["transfers"]` - Active/pending transfers
- `["disposals"]` - Pending disposals

---

## Benefits of This Approach

✅ **Automatic Updates** - No manual refresh needed
✅ **Real-time Feel** - Dashboard always shows current data
✅ **Minimal Network Overhead** - Only refetches when cache is invalidated
✅ **User Experience** - Seamless navigation between pages
✅ **Data Consistency** - No stale data displayed

---

## Related Files

- `/app/(inventory)/inventory/page.tsx` - Dashboard (query definitions)
- `/app/(inventory)/inventory/disposals/page.tsx` - Disposal mutations
- `/app/(inventory)/inventory/transfers/page.tsx` - Transfer mutations
- `/lib/supabase/queries.ts` - Query functions

