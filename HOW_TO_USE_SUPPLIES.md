# How to Use Vendor Supplies - Step by Step Guide

## 📋 Overview

The Vendor Supplies feature allows you to track all products received from vendors, including quantities, costs, payment status, and quality checks.

---

## 🚀 Getting Started

### Prerequisites
1. You must be logged in as an **admin user**
2. You must have at least one vendor in the system
3. You must have products in your catalog

---

## 📖 Step-by-Step Instructions

### Step 1: Access Admin Dashboard

1. **Navigate to the Admin Dashboard**
   - URL: `/admin`
   - Or click "Admin" link in the navigation menu

2. **What you should see:**
   - Page title: "Admin Dashboard"
   - Nine tabs across the top:
     - Products
     - Inventory
     - Orders
     - Customers
     - Shipping
     - Vendors
     - **Supplies** ← This is what we need
     - Handlers
     - Shipments

---

### Step 2: Open Supplies Tab

1. **Click on the "Supplies" tab**
   - It's the 7th tab from the left
   - Has a clipboard icon next to the text

2. **What you should see:**
   - **Three metric cards at the top:**
     - 📦 Total Supplies: Shows count of supply records
     - 💰 Total Value: Shows total amount of all supplies
     - ⏳ Pending Payments: Shows amount owed to vendors
   
   - **Filter section:**
     - Payment Status dropdown (All, Pending, Partial, Paid)
     - Quality Status dropdown (All, Pending, Passed, Failed)
   
   - **Add Supply button:**
     - Green button with Plus (+) icon
     - Text: "Add Supply"
   
   - **Supply records table:**
     - If no records exist: "No supply records found. Add your first supply record."
     - If records exist: Table with columns:
       - Supply Date
       - Vendor
       - Invoice #
       - Items
       - Total Amount
       - Payment Status
       - Quality Status
       - Actions (Edit/Delete buttons)

---

### Step 3: Click "Add Supply" Button

1. **Click the green "Add Supply" button**
   - Located in the top-right area of the card

2. **A dialog window will open with:**
   - **Title**: "Add New Supply"
   - **Description**: "Enter details of the new supply from vendor"
   - **Form fields** (see Step 4 for details)
   - **Buttons at bottom**:
     - "Cancel" (gray)
     - "Create Supply" (green)

---

### Step 4: Fill in the Supply Form

#### Section 1: Basic Information

1. **Vendor** (Required)
   - Click the dropdown
   - Select a vendor from the list
   - Example: "Evenmore Foods" or "Siruvani Honey"
   - ⚠️ If dropdown is empty, you need to add vendors first (Vendors tab)

2. **Supply Date** (Required)
   - Pre-filled with today's date
   - Click to change if needed
   - Format: YYYY-MM-DD

3. **Invoice Number** (Optional)
   - Enter the vendor's invoice number
   - Example: "INV-2025-001"
   - Helps track payments and reconciliation

#### Section 2: Payment Information

4. **Payment Status** (Required)
   - Dropdown with options:
     - **Pending** (default) - Not yet paid
     - **Partial** - Partially paid
     - **Paid** - Fully paid
   - Select based on current payment status

5. **Payment Date** (Optional)
   - Only fill if payment status is "Partial" or "Paid"
   - Date when payment was made
   - Format: YYYY-MM-DD

#### Section 3: Quality Check

6. **Quality Check Status** (Required)
   - Dropdown with options:
     - **Pending** (default) - Not yet checked
     - **Passed** - Quality check passed
     - **Failed** - Quality check failed
   - Select based on quality inspection results

7. **Quality Notes** (Optional)
   - Text area for quality check notes
   - Example: "All items in good condition" or "Some packages damaged"

#### Section 4: Additional Notes

8. **Delivery Notes** (Optional)
   - Text area for delivery-related notes
   - Example: "Delivered at 10 AM, signed by warehouse manager"

---

### Step 5: Add Product Items

**IMPORTANT**: You must add at least ONE item to create a supply record.

1. **Click the "Add Item" button**
   - Located below the delivery notes field
   - Green button with Plus (+) icon

2. **A new item row will appear with fields:**

   **a) Product** (Required)
   - Dropdown to select product
   - Example: "Ragi Flour", "Barnyard Flakes", etc.
   - ⚠️ If dropdown is empty, you need to add products first (Products tab)

   **b) Variant** (Required)
   - Dropdown to select packaging size
   - Options depend on selected product
   - Example: "1kg", "2kg", "5kg", "10kg"
   - For honey: "200g", "500g", "1kg"

   **c) Quantity** (Required)
   - Number input
   - Enter quantity received
   - Example: 100 (means 100 units of the selected variant)
   - Must be greater than 0

   **d) Unit Cost** (Required)
   - Number input
   - Enter cost per unit in rupees
   - Example: 117.60 (cost for one 1kg package)
   - Must be greater than 0
   - Use decimal point for paisa (e.g., 117.60)

   **e) Total Cost** (Auto-calculated)
   - Automatically calculated as: Quantity × Unit Cost
   - Example: 100 × 117.60 = ₹11,760.00
   - Read-only field (cannot edit)

3. **To add more items:**
   - Click "Add Item" button again
   - Fill in the new item's details
   - Repeat as needed

4. **To remove an item:**
   - Click the red Trash icon next to the item
   - Item will be removed immediately

---

### Step 6: Review and Save

1. **Review all information:**
   - ✓ Vendor selected
   - ✓ Supply date correct
   - ✓ At least one item added
   - ✓ All item quantities > 0
   - ✓ All item unit costs > 0
   - ✓ Payment status set
   - ✓ Quality status set

2. **Check the total amount:**
   - Displayed at the bottom of the items section
   - Should match your expectations
   - Example: "Total Amount: ₹11,760.00"

3. **Click "Create Supply" button**
   - Green button at bottom-right of dialog

---

### Step 7: Verify Success

1. **Success message appears:**
   - Toast notification at top-right
   - Message: "Supply record created successfully"
   - Green checkmark icon

2. **Dialog closes automatically**

3. **Table updates with new record:**
   - Your new supply appears in the table
   - Shows all the information you entered

4. **Metrics update:**
   - Total Supplies count increases by 1
   - Total Value increases by the supply amount
   - Pending Payments increases (if status is "pending")

---

## 📊 Example: Complete Supply Entry

Here's a complete example of adding a supply:

### Scenario
Evenmore Foods delivered 100 units of Ragi Flour (1kg) at ₹117.60 per unit.

### Form Data
```
Vendor: Evenmore Foods
Supply Date: 2025-01-15
Invoice Number: INV-2025-001
Payment Status: Pending
Payment Date: (leave empty)
Quality Check Status: Pending
Quality Notes: (leave empty)
Delivery Notes: Delivered at warehouse, 10 AM

Items:
  Item 1:
    Product: Ragi Flour
    Variant: 1kg
    Quantity: 100
    Unit Cost: 117.60
    Total Cost: 11,760.00 (auto-calculated)

Total Amount: ₹11,760.00
```

### Result
- Supply record created
- Shows in table with:
  - Date: 15/01/2025
  - Vendor: Evenmore Foods
  - Invoice: INV-2025-001
  - Items: 1 items (badge)
  - Total: ₹11,760.00
  - Payment: PENDING (red badge)
  - Quality: PENDING (yellow badge)

---

## 🔄 Editing a Supply Record

1. **Find the supply in the table**
2. **Click the Edit button** (pencil icon) in the Actions column
3. **Dialog opens with existing data pre-filled**
4. **Make your changes**
5. **Click "Update Supply"**
6. **Success message appears and table updates**

---

## 🗑️ Deleting a Supply Record

1. **Find the supply in the table**
2. **Click the Delete button** (trash icon) in the Actions column
3. **Confirmation dialog appears**: "Are you sure you want to delete this supply record?"
4. **Click OK to confirm**
5. **Success message appears and record is removed**

---

## 🔍 Filtering Supply Records

### Filter by Payment Status
1. **Click the "Payment Status" dropdown**
2. **Select a status:**
   - All Payment Status (shows all)
   - Pending (shows only unpaid)
   - Partial (shows partially paid)
   - Paid (shows fully paid)
3. **Table updates immediately**

### Filter by Quality Status
1. **Click the "Quality Status" dropdown**
2. **Select a status:**
   - All Quality Status (shows all)
   - Pending (shows not yet checked)
   - Passed (shows quality approved)
   - Failed (shows quality rejected)
3. **Table updates immediately**

### Combine Filters
- You can use both filters together
- Example: Show all "Pending" payments with "Passed" quality

---

## 💡 Tips and Best Practices

### 1. Invoice Numbers
- Always enter invoice numbers for easy tracking
- Use a consistent format: INV-YYYY-MM-###
- Example: INV-2025-01-001

### 2. Quality Checks
- Set status to "Pending" when receiving
- Update to "Passed" or "Failed" after inspection
- Add notes for failed items

### 3. Payment Tracking
- Start with "Pending" status
- Update to "Paid" when payment is made
- Always enter payment date when marking as paid

### 4. Multiple Items
- Add all items from one delivery in a single supply record
- Don't create separate records for each item
- Use the invoice number to group related items

### 5. Cost Accuracy
- Enter exact unit costs including paisa
- Double-check calculations
- Verify total matches invoice

---

## ⚠️ Common Mistakes to Avoid

### ❌ Mistake 1: Not Selecting Vendor
**Error**: "Please select a vendor"
**Solution**: Always select a vendor from the dropdown

### ❌ Mistake 2: Not Adding Items
**Error**: "Please add at least one item"
**Solution**: Click "Add Item" and fill in product details

### ❌ Mistake 3: Zero Quantity or Cost
**Error**: "Please fill in all item details correctly"
**Solution**: Ensure quantity and unit cost are greater than 0

### ❌ Mistake 4: Wrong Total Calculation
**Issue**: Total doesn't match invoice
**Solution**: Check unit costs and quantities for each item

### ❌ Mistake 5: Forgetting to Update Payment Status
**Issue**: Paid supplies still showing as pending
**Solution**: Edit the record and update payment status to "Paid"

---

## 🎯 Quick Checklist

Before clicking "Create Supply", verify:

- [ ] Vendor is selected
- [ ] Supply date is correct
- [ ] Invoice number is entered (if available)
- [ ] At least one item is added
- [ ] All items have product selected
- [ ] All items have variant selected
- [ ] All quantities are > 0
- [ ] All unit costs are > 0
- [ ] Total amount looks correct
- [ ] Payment status is set correctly
- [ ] Quality status is set correctly

---

## 📞 Need Help?

If something isn't working:

1. **Check**: `TROUBLESHOOTING_SUPPLIES.md` for detailed troubleshooting
2. **Verify**: You're logged in as admin
3. **Check**: Browser console for errors (F12 → Console)
4. **Review**: `ANSWER_TO_YOUR_QUESTION.md` for system overview

---

## 📚 Related Documentation

- `ANSWER_TO_YOUR_QUESTION.md` - System overview and purpose
- `QUICK_REFERENCE.md` - Quick API examples
- `INVENTORY_AND_PAYMENTS_GUIDE.md` - Complete technical guide
- `TROUBLESHOOTING_SUPPLIES.md` - Detailed troubleshooting
- `SYSTEM_OVERVIEW.md` - Architecture and data flow

---

## ✅ Summary

**To add a supply record:**
1. Go to Admin Dashboard
2. Click "Supplies" tab
3. Click "Add Supply" button
4. Select vendor
5. Add at least one item with product, variant, quantity, and cost
6. Set payment and quality status
7. Click "Create Supply"
8. Done! ✓

**That's it!** Your supply record is now tracked in the system.
