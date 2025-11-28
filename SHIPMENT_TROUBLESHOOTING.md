# Shipment Tracking Troubleshooting Guide

## Issue: Shipments Not Displaying in Shipment Tracking Tab

If you're not seeing shipments in the Shipment Tracking tab, follow these troubleshooting steps:

## ✅ What Has Been Fixed

1. **Automatic Shipment Creation**: All existing online orders now have shipment entries created automatically
2. **Migration Applied**: A database migration has been run to create shipments for all past online orders
3. **Enhanced UI**: Added loading states and empty state messages for better user feedback
4. **Better Error Handling**: Improved error messages to help identify issues

## 🔍 Troubleshooting Steps

### Step 1: Verify You're Logged In as Admin

**Check:**
- Are you logged in?
- Is your account role set to "admin"?

**How to Verify:**
1. Go to the Admin Dashboard
2. If you can access the Admin Dashboard, you're logged in as admin
3. If you're redirected to the home page, your account is not an admin

**Solution:**
- Ask an existing admin to promote your account to admin role
- Or use the Users Management page to change your role (requires admin access)

### Step 2: Check Browser Console for Errors

**How to Check:**
1. Open your browser's Developer Tools (F12 or Right-click → Inspect)
2. Go to the "Console" tab
3. Navigate to Admin Dashboard → Shipments tab
4. Look for any error messages in red

**Common Errors and Solutions:**

#### Error: "Failed to load shipment data"
- **Cause**: Database connection issue or RLS policy blocking access
- **Solution**: 
  - Refresh the page
  - Log out and log back in
  - Check your internet connection

#### Error: "You do not have permission to access this page"
- **Cause**: Your account is not an admin
- **Solution**: Contact an admin to upgrade your account role

#### Console shows: "Shipments loaded: 0"
- **Cause**: No online orders exist yet, or all orders are in-store orders
- **Solution**: 
  - Create a test online order
  - Verify orders exist in the Orders tab
  - Check that orders have `order_type = 'online'`

### Step 3: Verify Online Orders Exist

**Check:**
1. Go to Admin Dashboard → Orders tab
2. Look for orders with "Online" badge
3. Check if any orders have been completed

**Expected Behavior:**
- Orders with "Online" badge should automatically have shipments created
- In-store orders (with "In-Store" badge) will NOT have shipments

**Solution if No Online Orders:**
- Place a test order as a customer
- Select "Online" as the order type during checkout
- Complete the payment
- The shipment should appear automatically

### Step 4: Check Database Directly

If you have database access, run this query to verify shipments exist:

```sql
-- Check shipments count
SELECT COUNT(*) as total_shipments FROM shipments;

-- Check online orders and their shipments
SELECT 
  o.id as order_id,
  o.order_type,
  o.status as order_status,
  s.id as shipment_id,
  s.tracking_number,
  s.status as shipment_status
FROM orders o
LEFT JOIN shipments s ON s.order_id = o.id
WHERE o.order_type = 'online'
ORDER BY o.created_at DESC
LIMIT 10;
```

**Expected Results:**
- Every online order should have a corresponding shipment
- Shipments should have tracking numbers like "SHIP-XXXXXXXX"
- Initial status should be "pending"

### Step 5: Clear Browser Cache

Sometimes cached data can cause display issues.

**How to Clear Cache:**
1. Press Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
2. Select "Cached images and files"
3. Click "Clear data"
4. Refresh the page

### Step 6: Check Network Tab

**How to Check:**
1. Open Developer Tools (F12)
2. Go to "Network" tab
3. Refresh the Shipments page
4. Look for API calls to Supabase

**What to Look For:**
- Look for requests to `/rest/v1/shipments`
- Check the response status (should be 200)
- Click on the request and check the "Response" tab
- Verify data is being returned

**Common Issues:**

#### Status 401 (Unauthorized)
- **Cause**: Not logged in or session expired
- **Solution**: Log out and log back in

#### Status 403 (Forbidden)
- **Cause**: RLS policy blocking access
- **Solution**: Verify you're logged in as admin

#### Status 200 but empty array `[]`
- **Cause**: No shipments exist in database
- **Solution**: Create test online orders

## 🎯 Quick Verification Checklist

Use this checklist to quickly verify everything is working:

- [ ] I'm logged in as an admin user
- [ ] I can access the Admin Dashboard
- [ ] I can see the Shipments tab
- [ ] The page loads without errors
- [ ] Browser console shows no red error messages
- [ ] At least one online order exists in the system
- [ ] The online order has been completed (payment successful)

## 📊 Expected Behavior

### When Everything Works Correctly:

1. **Customer places online order** → Order created with `order_type = 'online'`
2. **Customer completes payment** → Order status changes to "completed"
3. **Automatic shipment creation** → Shipment entry created with status "pending"
4. **Admin views Shipments tab** → Shipment appears in the list
5. **Admin edits shipment** → Can assign handler, set dates, update status

### Visual Indicators:

- **Loading State**: Shows spinner with "Loading shipments..." message
- **Empty State**: Shows package icon with "No Shipments Found" message
- **Data State**: Shows table with all shipments and their details

## 🔧 Advanced Troubleshooting

### Check RLS Policies

If you have database access, verify RLS policies are correct:

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'shipments';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'shipments';
```

**Expected Policies:**
1. "Admins have full access to shipments" - Allows admins to view/edit all shipments
2. "Users can view their own shipments" - Allows users to view their own order shipments

### Verify is_admin Function

```sql
-- Test if current user is admin
SELECT is_admin(auth.uid());
```

**Expected Result:**
- Should return `true` if you're logged in as admin
- Should return `false` if you're not an admin

### Manual Shipment Creation (Emergency)

If automatic creation fails, you can manually create shipments:

```sql
-- Create shipment for a specific order
INSERT INTO shipments (order_id, status, tracking_number)
VALUES (
  'YOUR_ORDER_ID_HERE',
  'pending',
  'SHIP-' || UPPER(SUBSTRING('YOUR_ORDER_ID_HERE', 1, 8))
);
```

## 📞 Still Having Issues?

If you've tried all the above steps and still can't see shipments:

1. **Check the browser console** for specific error messages
2. **Verify your admin role** in the Users Management page
3. **Create a test online order** and verify it appears
4. **Check database directly** to confirm shipments exist
5. **Try a different browser** to rule out browser-specific issues

## 🎉 Success Indicators

You'll know everything is working when:

✅ Shipments tab loads without errors
✅ You can see a list of shipments with tracking numbers
✅ Each shipment shows the order ID, status, and dates
✅ You can click "Edit Details" to update shipment information
✅ New online orders automatically create shipment entries
✅ Statistics cards show correct counts (Pending, In Transit, Delivered, etc.)

## 📝 Notes

- **In-store orders do NOT create shipments** - This is expected behavior
- **Only completed online orders** should have shipments
- **Pending orders** (payment not completed) will not have shipments until payment is confirmed
- **Shipments are created automatically** - No manual action needed for new orders
- **Existing orders** have been migrated - All past online orders now have shipments

## 🔄 Recent Changes Applied

1. ✅ Updated `verify_stripe_payment` Edge Function to auto-create shipments
2. ✅ Created migration to add shipments for existing online orders
3. ✅ Enhanced ShipmentTracking UI with loading and empty states
4. ✅ Added better error handling and logging
5. ✅ Updated dialog to include handler and date selection
6. ✅ Improved form validation and user feedback

All changes have been deployed and are now active in your system.
