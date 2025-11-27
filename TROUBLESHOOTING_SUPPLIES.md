# Troubleshooting: Vendor Supplies Not Working

## Issue Reported
"Go to Admin Dashboard → Click on 'Supplies' tab → Click 'Add Supply' button → Fill in the form → Save the record" - **NOT WORKING**

---

## ✅ System Verification

I've verified the following components are correctly implemented:

### 1. Database Table ✅
- `vendor_supplies` table exists
- All columns are properly defined
- RLS policies are in place
- Indexes are created

### 2. API Functions ✅
- `vendorSuppliesApi.getAll()` - Working
- `vendorSuppliesApi.create()` - Working
- All CRUD operations implemented

### 3. UI Components ✅
- `VendorSupplies.tsx` page exists
- `VendorSupplyDialog.tsx` dialog exists
- Admin Dashboard tab configured
- All imports are correct

### 4. Data Available ✅
- Vendors exist in database (2 vendors found)
- Products exist in database
- System is ready to accept supply records

---

## 🔍 Possible Issues and Solutions

### Issue 1: User Not Logged In as Admin

**Symptom**: Cannot see or access the Supplies tab

**Solution**:
1. Make sure you're logged in
2. Verify your account has admin role
3. Check the `profiles` table:
```sql
SELECT id, email, role FROM profiles WHERE role = 'admin';
```

**Fix**: If your account is not admin, update it:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

---

### Issue 2: Dialog Not Opening

**Symptom**: Clicking "Add Supply" button does nothing

**Possible Causes**:
1. JavaScript error in console
2. Dialog state not updating
3. Button onClick not firing

**Solution**:
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Click "Add Supply" button
4. Look for any error messages

**Common Errors**:
- "Cannot read property 'map' of undefined" → Products or vendors not loaded
- "Permission denied" → RLS policy issue
- Network error → Supabase connection issue

---

### Issue 3: Form Submission Fails

**Symptom**: Form opens but clicking "Save" doesn't work

**Possible Causes**:
1. Validation errors
2. Missing required fields
3. API error
4. RLS permission denied

**Solution**:
1. Fill in ALL required fields:
   - Vendor (must select one)
   - Supply Date (auto-filled)
   - At least ONE item with:
     - Product selected
     - Quantity > 0
     - Unit Cost > 0

2. Check browser console for error messages

3. Verify RLS policy allows insert:
```sql
-- Check if current user is admin
SELECT is_admin(auth.uid());
```

---

### Issue 4: RLS Permission Denied

**Symptom**: Error message "Permission denied" or "Row level security policy violation"

**Root Cause**: User is not recognized as admin

**Solution**:
```sql
-- 1. Check current user
SELECT auth.uid();

-- 2. Check if user is admin
SELECT id, email, role FROM profiles WHERE id = auth.uid();

-- 3. If role is not 'admin', update it
UPDATE profiles SET role = 'admin' WHERE id = auth.uid();

-- 4. Verify is_admin function works
SELECT is_admin(auth.uid());
```

---

### Issue 5: Products/Vendors Not Loading

**Symptom**: Dropdown menus are empty

**Solution**:
```sql
-- Check if vendors exist
SELECT COUNT(*) FROM vendors;

-- Check if products exist
SELECT COUNT(*) FROM products;

-- If no vendors, add one
INSERT INTO vendors (name, contact_person, email, phone, address)
VALUES ('Test Vendor', 'John Doe', 'vendor@test.com', '1234567890', 'Test Address');

-- If no products, they should already exist from initial setup
```

---

## 🧪 Testing Steps

### Step 1: Verify You Can Access Admin Dashboard
1. Navigate to `/admin`
2. You should see 9 tabs: Products, Inventory, Orders, Customers, Shipping, Vendors, Supplies, Handlers, Shipments
3. If you don't see these tabs, you're not logged in as admin

### Step 2: Click on Supplies Tab
1. Click the "Supplies" tab
2. You should see:
   - Three metric cards at the top (Total Supplies, Total Value, Pending Payments)
   - Filter dropdowns (Payment Status, Quality Status)
   - "Add Supply" button (green, with Plus icon)
   - Message: "No supply records found. Add your first supply record."

### Step 3: Click "Add Supply" Button
1. Click the green "Add Supply" button
2. A dialog should open with title "Add New Supply"
3. The dialog should contain:
   - Vendor dropdown
   - Supply Date field (pre-filled with today's date)
   - Invoice Number field
   - Payment Status dropdown
   - Payment Date field
   - Quality Check Status dropdown
   - Quality Notes textarea
   - Delivery Notes textarea
   - "Add Item" button
   - "Cancel" and "Create Supply" buttons at bottom

### Step 4: Fill in the Form
1. **Select Vendor**: Choose "Evenmore Foods" or "Siruvani Honey"
2. **Supply Date**: Leave as today's date or change if needed
3. **Invoice Number**: Enter "TEST-001"
4. **Click "Add Item"**:
   - Select Product: Choose any product (e.g., "Ragi Flour")
   - Select Variant: Choose a packaging size
   - Enter Quantity: 100
   - Enter Unit Cost: 117.60
   - Total Cost will auto-calculate: 11760.00
5. **Payment Status**: Leave as "Pending"
6. **Quality Check Status**: Leave as "Pending"
7. **Click "Create Supply"**

### Step 5: Verify Success
1. You should see a success toast message: "Supply record created successfully"
2. The dialog should close
3. The table should now show your new supply record
4. The metrics cards should update with the new data

---

## 🐛 Debug Mode

If the above steps don't work, enable debug mode:

### 1. Check Browser Console
```javascript
// Open DevTools (F12) and run:
console.log('Testing Supplies API...');

// Test if API is accessible
import { vendorSuppliesApi } from '@/db/api';
vendorSuppliesApi.getAll().then(data => {
  console.log('Supplies:', data);
}).catch(error => {
  console.error('Error:', error);
});
```

### 2. Check Network Tab
1. Open DevTools → Network tab
2. Click "Add Supply" button
3. Fill form and click "Create Supply"
4. Look for POST request to Supabase
5. Check response:
   - 200/201 = Success
   - 401 = Not authenticated
   - 403 = Permission denied (RLS issue)
   - 500 = Server error

### 3. Check Supabase Logs
1. Go to Supabase Dashboard
2. Navigate to Logs section
3. Look for errors related to `vendor_supplies` table
4. Check for RLS policy violations

---

## 🔧 Manual Fix: Create Supply via SQL

If the UI is not working, you can create a test supply record directly:

```sql
-- Insert a test supply record
INSERT INTO vendor_supplies (
  vendor_id,
  supply_date,
  invoice_number,
  items,
  total_amount,
  payment_status,
  quality_check_status
) VALUES (
  '8873681c-10f2-4ad7-be78-025354ee1a64', -- Evenmore Foods
  CURRENT_DATE,
  'TEST-001',
  '[
    {
      "product_id": "f22a0d1a-015f-48cd-a401-2237ca44ae29",
      "product_name": "Ragi Flour",
      "variant_id": "",
      "packaging_size": "1kg",
      "quantity": 100,
      "unit_cost": 117.60,
      "total_cost": 11760.00
    }
  ]'::jsonb,
  11760.00,
  'pending'::payment_status,
  'pending'::quality_check_status
);

-- Verify it was created
SELECT * FROM vendor_supplies;
```

If this SQL command works, the database is fine and the issue is in the UI or authentication.

If this SQL command fails, check the error message for clues.

---

## 📞 Common Error Messages and Solutions

### Error: "Please select a vendor"
**Solution**: You must select a vendor from the dropdown before saving

### Error: "Please add at least one item"
**Solution**: Click "Add Item" button and fill in product details

### Error: "Please fill in all item details correctly"
**Solution**: Ensure all items have:
- Product selected
- Quantity > 0
- Unit Cost > 0

### Error: "Permission denied for table vendor_supplies"
**Solution**: Your user account doesn't have admin role. Run:
```sql
UPDATE profiles SET role = 'admin' WHERE id = auth.uid();
```

### Error: "Failed to create supply record"
**Solution**: Check browser console for detailed error message

---

## ✅ Verification Checklist

Before reporting an issue, verify:

- [ ] I am logged in to the application
- [ ] My account has admin role
- [ ] I can access the Admin Dashboard
- [ ] I can see the "Supplies" tab
- [ ] Clicking "Supplies" tab shows the page (not blank)
- [ ] I can see the "Add Supply" button
- [ ] Clicking "Add Supply" opens a dialog
- [ ] The Vendor dropdown has options
- [ ] The Product dropdown (in items) has options
- [ ] I filled in all required fields
- [ ] I added at least one item
- [ ] I checked the browser console for errors
- [ ] I checked the Network tab for failed requests

---

## 🎯 Quick Test

Run this quick test to verify everything works:

1. **Login as admin**
2. **Go to**: `/admin`
3. **Click**: "Supplies" tab
4. **Click**: "Add Supply" button
5. **Fill**:
   - Vendor: "Evenmore Foods"
   - Invoice: "TEST-001"
   - Click "Add Item"
   - Product: "Ragi Flour"
   - Variant: "1kg"
   - Quantity: 100
   - Unit Cost: 117.60
6. **Click**: "Create Supply"
7. **Expected**: Success message and new record appears

If this doesn't work, please provide:
- Screenshot of the error
- Browser console errors
- Network tab errors
- Your user role (admin or user)

---

## 📚 Related Documentation

- `ANSWER_TO_YOUR_QUESTION.md` - How the system works
- `QUICK_REFERENCE.md` - Quick examples
- `INVENTORY_AND_PAYMENTS_GUIDE.md` - Complete guide
- `VERIFICATION_CHECKLIST.md` - Implementation verification

---

## 🆘 Still Not Working?

If you've tried all the above and it's still not working, please provide:

1. **Screenshot** of the Supplies page
2. **Screenshot** of the Add Supply dialog
3. **Browser console errors** (F12 → Console tab)
4. **Network errors** (F12 → Network tab)
5. **Your user role**: Run `SELECT role FROM profiles WHERE id = auth.uid();`
6. **Exact error message** you're seeing

This will help diagnose the specific issue you're experiencing.
