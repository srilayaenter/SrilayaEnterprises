# Debug Guide: Shipment Update Error

## Enhanced Error Logging

I've added comprehensive error logging to help identify the exact issue. The system will now show you the specific error message from the database.

## What Changed

### 1. Enhanced API Error Messages
**File:** `src/db/api.ts`

The `shipmentsApi.update()` function now:
- ✅ Logs the shipment ID being updated
- ✅ Logs the exact data being sent
- ✅ Shows the specific Supabase error message
- ✅ Indicates if no data was returned

### 2. Improved Data Cleaning
**File:** `src/pages/admin/ShipmentTracking.tsx`

The `handleStatusUpdate()` function now:
- ✅ Converts empty strings to null (prevents database errors)
- ✅ Properly handles "none" value for handler_id
- ✅ Logs the shipment ID and update data in JSON format
- ✅ Shows the actual error message in the toast notification

## How to Debug

### Step 1: Clear Cache and Refresh
1. Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
2. Clear "Cached images and files"
3. Press `Ctrl+Shift+R` to hard refresh

### Step 2: Open Browser Console
1. Press `F12` to open Developer Tools
2. Go to the **Console** tab
3. Keep it open during testing

### Step 3: Try to Update a Shipment
1. Go to **Admin Dashboard** → **Shipments**
2. Click **"Edit Details"** on any shipment
3. Make a simple change (e.g., just change the status to "in_transit")
4. Click **"Update Shipment"**

### Step 4: Check Console Output

**Look for these messages:**

#### When Opening Dialog:
```
Opening status dialog for shipment: {shipment object}
Available handlers: [Array]
Form data: {handler_id, status, dates, etc.}
```

#### When Clicking Update:
```
Updating shipment ID: 64ebe67a-e138-4003-af02-3df7fcaa7e3d
Update data: {
  "handler_id": null,
  "status": "in_transit",
  "shipped_date": null,
  "expected_delivery_date": null,
  "notes": null
}
Updating shipment: 64ebe67a-e138-4003-af02-3df7fcaa7e3d with data: {...}
```

#### If Successful:
```
Shipment updated successfully: {updated shipment object}
```

#### If Error:
```
Supabase update error: {error object}
Error updating shipment: Error: Failed to update shipment: [SPECIFIC ERROR MESSAGE]
```

## Common Error Messages and Solutions

### Error: "new row violates row-level security policy"

**Meaning:** Your account doesn't have permission to update shipments.

**Solutions:**

1. **Verify you're logged in as admin:**
   ```
   - Go to Admin Dashboard → Users
   - Find your account
   - Check if role is "admin"
   ```

2. **Log out and log back in:**
   ```
   - Click your profile icon
   - Click "Logout"
   - Log back in with admin credentials
   ```

3. **Check if is_admin() function works:**
   ```sql
   SELECT is_admin(auth.uid());
   ```
   Should return `true` for admin users.

### Error: "violates foreign key constraint"

**Meaning:** The handler_id you're trying to set doesn't exist in the shipment_handlers table.

**Solutions:**

1. **Use "Not Assigned" option:**
   - Select "Not Assigned" from the handler dropdown
   - This sets handler_id to null (which is valid)

2. **Verify handler exists:**
   ```sql
   SELECT id, name, status FROM shipment_handlers WHERE status = 'active';
   ```

3. **Don't manually type handler IDs:**
   - Always use the dropdown to select handlers
   - Never paste UUIDs directly

### Error: "invalid input syntax for type date"

**Meaning:** The date format is incorrect.

**Solutions:**

1. **Use the date picker:**
   - Don't type dates manually
   - Click the field and use the calendar picker
   - Dates should be in YYYY-MM-DD format

2. **Leave dates empty if not needed:**
   - Empty date fields are converted to null automatically
   - This is valid and won't cause errors

### Error: "column does not exist"

**Meaning:** Trying to update a field that doesn't exist in the shipments table.

**Solution:**
- This shouldn't happen with the current code
- If you see this, share the full error message

### Error: "No data returned"

**Meaning:** The update query didn't return the updated row.

**Possible Causes:**
1. RLS policy blocking the SELECT after UPDATE
2. Shipment was deleted during update
3. Database connection issue

**Solutions:**
1. Refresh the page and try again
2. Check if the shipment still exists
3. Verify RLS policies allow reading after writing

## Step-by-Step Debugging Process

### Test 1: Minimal Update (Status Only)
1. Open edit dialog
2. **Only** change status to "in_transit"
3. Don't change anything else
4. Click "Update Shipment"

**Expected Console Output:**
```
Update data: {
  "handler_id": null,
  "status": "in_transit",
  "shipped_date": null,
  "expected_delivery_date": null,
  "notes": null
}
```

**If this works:** The basic update is working. Try adding more fields.

**If this fails:** Share the exact error message from console.

### Test 2: Add Handler
1. Open edit dialog
2. Change status to "in_transit"
3. Select "Blue Dart Courier - freight" from handler dropdown
4. Click "Update Shipment"

**Expected Console Output:**
```
Update data: {
  "handler_id": "c3393a42-7cde-4df7-af85-f979ce2f2124",
  "status": "in_transit",
  "shipped_date": null,
  "expected_delivery_date": null,
  "notes": null
}
```

**If this works:** Handler assignment is working.

**If this fails:** Check the error - likely foreign key constraint issue.

### Test 3: Add Dates
1. Open edit dialog
2. Change status to "in_transit"
3. Select a handler
4. Set shipped date to today
5. Set expected delivery date to 3 days from now
6. Click "Update Shipment"

**Expected Console Output:**
```
Update data: {
  "handler_id": "c3393a42-7cde-4df7-af85-f979ce2f2124",
  "status": "in_transit",
  "shipped_date": "2025-11-28",
  "expected_delivery_date": "2025-12-01",
  "notes": null
}
```

**If this works:** Date handling is working.

**If this fails:** Check date format in console output.

### Test 4: Add Notes
1. Open edit dialog
2. Change status to "in_transit"
3. Select a handler
4. Set dates
5. Add notes: "Test update"
6. Click "Update Shipment"

**Expected Console Output:**
```
Update data: {
  "handler_id": "c3393a42-7cde-4df7-af85-f979ce2f2124",
  "status": "in_transit",
  "shipped_date": "2025-11-28",
  "expected_delivery_date": "2025-12-01",
  "notes": "Test update"
}
```

**If this works:** Everything is working!

**If this fails:** Share the specific field that's causing the issue.

## What to Share If Still Failing

If you're still getting errors after following this guide, please share:

1. **Console Output:**
   - Copy the entire console output from when you click "Update Shipment"
   - Include all messages, especially errors in red

2. **Error Toast Message:**
   - What does the error notification say?
   - It should now show the specific error, not just "Failed to update shipment"

3. **Update Data:**
   - Copy the "Update data:" JSON from console
   - This shows exactly what data is being sent

4. **Your Account Role:**
   - Go to Admin Dashboard → Users
   - Find your account
   - What is the role? (should be "admin")

5. **Browser Information:**
   - Which browser are you using? (Chrome, Firefox, Edge, Safari)
   - Browser version?

## Database Verification

If you have database access, you can verify the update manually:

### Check Current Shipment Data:
```sql
SELECT 
  id,
  tracking_number,
  status,
  handler_id,
  shipped_date,
  expected_delivery_date,
  notes
FROM shipments
WHERE tracking_number = 'SHIP-XXXXXXXX';  -- Replace with actual tracking number
```

### Try Manual Update:
```sql
UPDATE shipments
SET 
  status = 'in_transit',
  notes = 'Manual test update'
WHERE tracking_number = 'SHIP-XXXXXXXX';  -- Replace with actual tracking number
```

**If manual update works:** The issue is with the application code or authentication.

**If manual update fails:** The issue is with database permissions or constraints.

### Check Your Admin Status:
```sql
SELECT 
  id,
  email,
  role
FROM profiles
WHERE id = auth.uid();
```

**Expected Result:** role should be 'admin'

### Test is_admin Function:
```sql
SELECT is_admin(auth.uid()) as am_i_admin;
```

**Expected Result:** Should return `true`

## Quick Fixes to Try

### Fix 1: Force Logout/Login
```
1. Click profile icon → Logout
2. Close all browser tabs
3. Open new tab
4. Go to your website
5. Login again
6. Try update again
```

### Fix 2: Use Different Browser
```
1. Try Chrome if you're using Firefox
2. Try Firefox if you're using Chrome
3. This helps identify browser-specific issues
```

### Fix 3: Simplify the Update
```
1. Open edit dialog
2. ONLY change status (nothing else)
3. Click Update
4. If this works, add fields one by one
```

### Fix 4: Check Network Tab
```
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Try to update
5. Look for the request to Supabase
6. Check the response status and body
```

## Expected Behavior After Fix

Once working, you should see:

**Console:**
```
Updating shipment ID: 64ebe67a-e138-4003-af02-3df7fcaa7e3d
Update data: {...}
Updating shipment: 64ebe67a-e138-4003-af02-3df7fcaa7e3d with data: {...}
Shipment updated successfully: {...}
Loading shipments data...
Shipments loaded: 9
Handlers loaded: 2
```

**UI:**
- ✅ Success toast appears
- ✅ Dialog closes
- ✅ Shipment list refreshes
- ✅ Updated values visible in table

**No Errors:**
- ❌ No red errors in console
- ❌ No error toast
- ❌ No "Failed to update shipment" message

## Summary

The enhanced logging will now show you:
1. ✅ Exact shipment ID being updated
2. ✅ Exact data being sent to database
3. ✅ Specific error message from Supabase
4. ✅ Whether data was returned after update

**Next Steps:**
1. Clear cache and hard refresh
2. Open browser console
3. Try to update a shipment
4. Share the console output if it still fails

The error message should now be much more specific and help us identify the exact issue!
