# Purchase Orders System - User Guide

## 🎉 System Overview

The Purchase Orders system is now fully implemented and ready to use! This system allows you to track vendor orders from the moment you place them until they're received and verified.

## 📍 How to Access

1. **Login as Admin** - Navigate to the login page and sign in with admin credentials
2. **Go to Admin Dashboard** - Click on "Admin Dashboard" in the navigation
3. **Select Purchase Orders Tab** - Click on the "Purchase Orders" tab (with the FileText icon)

**Direct URL**: `/admin/purchase-orders`

## 🎯 Key Features

### ✅ Complete Order Lifecycle Tracking

```
Create Order → Confirmed → Shipped → Received
     ↓
  Cancel (if needed)
```

### ✅ What You Can Track

- **Purchase Order Number** - Auto-generated (e.g., PO-20251126-001)
- **Vendor Information** - Which vendor you ordered from
- **Order Date** - When you placed the order
- **Expected Delivery Date** - When you expect to receive it
- **Actual Delivery Date** - When you actually received it
- **Order Status** - Current state of the order
- **Product Details** - What products, quantities, and costs
- **Shipping Cost** - Additional shipping charges
- **Total Amount** - Complete order value
- **Notes** - Any additional information

## 📊 Dashboard Summary Cards

At the top of the page, you'll see three summary cards:

1. **Total Orders** - Total number of purchase orders created
2. **Outstanding Orders** - Orders not yet received (ordered, confirmed, shipped)
3. **Total Value** - Sum of all purchase order amounts

## 🆕 Creating a Purchase Order

### Step-by-Step Guide:

1. **Click "Create Order" Button** (top right)

2. **Fill in Order Details:**
   - **Vendor*** (required) - Select from dropdown
   - **Order Date*** (required) - When you placed the order (defaults to today)
   - **Expected Delivery Date** (optional) - When you expect delivery

3. **Add Items to Order:**
   - **Product*** - Select product from dropdown
   - **Quantity*** - How many units
   - **Unit Cost*** - Cost per unit
   - Click the **+** button to add the item
   - Repeat for multiple items
   - Remove items by clicking the **X** button

4. **Additional Information:**
   - **Shipping Cost** - Enter shipping charges (if any)
   - **Notes** - Add any relevant notes

5. **Review Total** - Check the calculated total at the bottom

6. **Click "Create Purchase Order"**

### ✅ What Happens:
- System auto-generates a unique PO number (PO-YYYYMMDD-XXX)
- Order is created with status "Ordered"
- Order appears in the main table
- Summary cards update automatically

## 📝 Managing Purchase Orders

### View All Orders

The main table shows all purchase orders with:
- PO Number
- Vendor Name
- Order Date
- Expected Delivery Date
- Status Badge (color-coded)
- Total Amount
- Action Buttons

### Filter Orders

**By Status:**
- Use the status dropdown to filter:
  - All Status
  - Ordered
  - Confirmed
  - Shipped
  - Received
  - Cancelled

**By Search:**
- Type in the search box to find orders by:
  - PO Number
  - Vendor Name

### Edit an Order

1. Click the **Pencil Icon** (✏️) next to the order
2. Modify any details (vendor, dates, items, shipping, notes)
3. Add or remove items as needed
4. Click "Update Purchase Order"

**Note:** You can only edit orders that are NOT "Received" or "Cancelled"

### Update Order Status

1. Use the **Status Dropdown** in the Actions column
2. Select new status:
   - **Ordered** → Initial state
   - **Confirmed** → Vendor confirmed the order
   - **Shipped** → Vendor shipped the order
   - **Received** → Order received and verified
   - **Cancel** → Cancel the order

**Note:** When you mark as "Received", the system automatically sets the actual delivery date to today.

### Delete an Order

1. Click the **Trash Icon** (🗑️) next to the order
2. Confirm deletion
3. Order is permanently removed

**Note:** You cannot delete orders with status "Received"

## 📈 Order Status Meanings

| Status | Badge Color | Meaning |
|--------|-------------|---------|
| **Ordered** | Gray | Order placed with vendor |
| **Confirmed** | Blue | Vendor confirmed the order |
| **Shipped** | White | Vendor shipped the order |
| **Received** | Blue | Order received and verified |
| **Cancelled** | Red | Order was cancelled |

## 💡 Best Practices

### When to Create a Purchase Order

✅ **Create IMMEDIATELY when you place an order with a vendor**
- Don't wait until you receive the goods
- This is the key difference from the old "Vendor Supplies" system

### What to Include

✅ **Always Include:**
- Vendor name
- Order date (when YOU placed the order)
- Expected delivery date (when vendor says they'll deliver)
- All product details with accurate quantities and costs
- Shipping costs (if applicable)

✅ **Optional but Recommended:**
- Notes about special requirements
- Reference to vendor's invoice number
- Any special terms or conditions

### Status Updates

✅ **Update status as things progress:**
- **Ordered** → When you first create the PO
- **Confirmed** → When vendor confirms they received your order
- **Shipped** → When vendor notifies you they shipped
- **Received** → When you physically receive and verify the goods

### Linking to Vendor Supplies

When you mark a purchase order as "Received", you can:
1. Create a corresponding "Vendor Supply" record
2. Link the supply record to the purchase order
3. This creates a complete audit trail from order to receipt

## 🔍 Common Workflows

### Workflow 1: Standard Order

```
1. Create PO when ordering from vendor
2. Update to "Confirmed" when vendor confirms
3. Update to "Shipped" when vendor ships
4. Update to "Received" when goods arrive
5. Create Vendor Supply record (in Supplies tab)
6. Link supply to PO (optional)
```

### Workflow 2: Urgent Order

```
1. Create PO with expected delivery date = today
2. Update to "Shipped" immediately
3. Update to "Received" when goods arrive
```

### Workflow 3: Cancelled Order

```
1. Create PO
2. Vendor cannot fulfill
3. Update status to "Cancelled"
4. Create new PO with different vendor
```

## 📊 Reporting & Analytics

### Outstanding Orders Report

**Filter by Status:**
- Select "Ordered", "Confirmed", or "Shipped"
- See all orders awaiting delivery
- Check expected delivery dates
- Follow up with vendors if overdue

### Vendor Performance

**View orders by vendor:**
1. Use search box to filter by vendor name
2. Check delivery times (expected vs actual)
3. Identify reliable vendors

### Order Value Analysis

- Check "Total Value" summary card
- Filter by date range (using order date)
- Analyze spending patterns

## 🔗 Integration with Other Systems

### Vendor Supplies

- Purchase Orders track the **ordering process**
- Vendor Supplies track the **received goods**
- Link them together for complete traceability

### Vendors Management

- Purchase Orders reference the Vendors table
- Ensure vendors are created before creating POs
- Vendor details auto-populate in orders

### Inventory Management

- When orders are received, update inventory
- Use PO details to verify received quantities
- Track cost prices from PO unit costs

## ⚠️ Important Notes

### Cannot Edit Received Orders

Once an order is marked as "Received", you cannot:
- Edit the order details
- Change the status back
- Delete the order

**Why?** To maintain data integrity and audit trail.

**Solution:** If you made a mistake, create a new PO with correct details.

### Cannot Cancel Received Orders

You cannot cancel an order that's already received.

**Solution:** Create a return or adjustment record in Vendor Supplies.

### PO Numbers are Unique

- Format: PO-YYYYMMDD-XXX
- Auto-generated by system
- Cannot be manually changed
- Resets daily (001, 002, 003...)

### Date Validation

- Order date cannot be in the future
- Expected delivery date must be >= order date
- Actual delivery date must be >= order date

## 🆘 Troubleshooting

### Problem: Cannot find my order

**Solution:**
- Check status filter (set to "All Status")
- Clear search box
- Check if order was deleted

### Problem: Cannot edit order

**Solution:**
- Check if order status is "Received" or "Cancelled"
- These statuses lock the order from editing

### Problem: Total amount is wrong

**Solution:**
- Check individual item quantities and unit costs
- Verify shipping cost
- Total = (Sum of all item totals) + Shipping cost

### Problem: Vendor not in dropdown

**Solution:**
- Go to "Vendors" tab
- Create the vendor first
- Return to Purchase Orders and create PO

### Problem: Product not in dropdown

**Solution:**
- Go to "Products" tab
- Create the product first
- Return to Purchase Orders and create PO

## 📞 Quick Reference

### Keyboard Shortcuts

- **Tab** - Navigate between fields
- **Enter** - Submit form (when focused on button)
- **Esc** - Close dialog

### Required Fields

Fields marked with * are required:
- Vendor
- Order Date
- At least one item with:
  - Product
  - Quantity
  - Unit Cost

### Data Limits

- **PO Number**: Auto-generated, max 50 characters
- **Quantity**: Must be positive integer
- **Unit Cost**: Must be positive number (2 decimal places)
- **Shipping Cost**: Must be non-negative (2 decimal places)
- **Notes**: Max 1000 characters

## 🎓 Training Checklist

For new users, practice these tasks:

- [ ] Create a simple purchase order with one item
- [ ] Add multiple items to a purchase order
- [ ] Edit an existing order
- [ ] Update order status from Ordered → Confirmed
- [ ] Update order status from Confirmed → Shipped
- [ ] Mark an order as Received
- [ ] Cancel an order
- [ ] Search for orders by PO number
- [ ] Filter orders by status
- [ ] View outstanding orders
- [ ] Check summary statistics

## 🚀 Advanced Tips

### Bulk Ordering

When ordering multiple products from same vendor:
- Create one PO with multiple items
- Easier to track and manage
- Single PO number for entire order

### Partial Deliveries

If vendor delivers in parts:
- Keep original PO in "Shipped" status
- Create separate Vendor Supply records for each delivery
- Mark PO as "Received" only when complete

### Recurring Orders

For regular orders from same vendor:
- Create first PO with all details
- For future orders, edit a copy (create new with same items)
- Adjust dates and quantities as needed

### Cost Tracking

- Use PO unit costs to track price changes over time
- Compare costs between vendors
- Identify cost-saving opportunities

## 📋 Summary

The Purchase Orders system provides:

✅ **Complete Order Tracking** - From placement to receipt
✅ **Auto-Generated PO Numbers** - Unique identifiers
✅ **Status Management** - Track order progress
✅ **Multi-Item Orders** - Add multiple products per order
✅ **Cost Tracking** - Unit costs, shipping, totals
✅ **Vendor Integration** - Links to vendor records
✅ **Search & Filter** - Find orders quickly
✅ **Data Validation** - Prevents errors
✅ **Audit Trail** - Complete history

---

**Need Help?** Contact your system administrator or refer to this guide.

**Last Updated:** 2025-11-26
