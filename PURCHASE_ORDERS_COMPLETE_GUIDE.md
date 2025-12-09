# Purchase Orders - Complete User Guide

## 🎯 Overview
The Purchase Orders system is a comprehensive solution for managing vendor orders, tracking payments (including partial payments), and monitoring vendor performance. This guide covers all features and how to use them effectively.

---

## 📋 Table of Contents
1. [Core Features](#core-features)
2. [Payment Management](#payment-management)
3. [Vendor Tracking](#vendor-tracking)
4. [Filtering & Search](#filtering--search)
5. [Common Workflows](#common-workflows)
6. [Tips & Best Practices](#tips--best-practices)

---

## Core Features

### 1. Purchase Order Management
- **Create Orders**: Add new purchase orders with multiple items
- **Edit Orders**: Modify order details before receiving
- **Track Status**: Monitor order progress from ordered to received
- **Delete Orders**: Remove cancelled or erroneous orders

### 2. Payment Tracking
- **Payment Status**: Track pending, partial, and paid orders
- **Payment Methods**: Record cash, bank transfer, UPI, cheque, or card payments
- **Payment Details**: Store payment date and reference numbers
- **Partial Payments**: Track installment payments with paid and pending amounts

### 3. Vendor Management
- **Vendor Selection**: Choose from registered vendors
- **Vendor Filtering**: View orders for specific vendors
- **Vendor Statistics**: See vendor-specific order and payment data
- **Vendor Performance**: Compare vendors based on order volume and value

### 4. Inventory Integration
- **Automatic Updates**: Inventory updates when orders are received
- **Stock Tracking**: Monitor stock levels across products
- **Variant Support**: Handle different packaging sizes

---

## Payment Management

### Payment Status Options

#### 1. Pending
**When to use**: No payment has been made yet

**Characteristics**:
- Paid Amount: ₹0
- Pending Amount: Full order amount
- Payment Method: Not required
- Badge Color: Yellow

**Example**:
```
Order Total: ₹10,000
Status: [Pending]
Paid: ₹0
Pending: ₹10,000
```

#### 2. Partial
**When to use**: Some payment has been made, but not the full amount

**Characteristics**:
- Paid Amount: Between ₹0 and total amount
- Pending Amount: Total - Paid
- Payment Method: Required
- Badge Color: Blue

**Example**:
```
Order Total: ₹10,000
Status: [Partial] (Bank Transfer)
Paid: ₹6,000 / Pending: ₹4,000
```

**How to Record**:
1. Click payment status badge or "Payment" button
2. Select "Partial" from Payment Status
3. Enter paid amount (e.g., 6000)
4. System shows: "Pending Amount: ₹4,000.00"
5. Select payment method
6. Enter payment date and reference
7. Click "Update Payment"

#### 3. Paid
**When to use**: Full payment has been made

**Characteristics**:
- Paid Amount: Full order amount (auto-set)
- Pending Amount: ₹0
- Payment Method: Required
- Badge Color: Green

**Example**:
```
Order Total: ₹10,000
Status: [Paid] (UPI)
Paid: ₹10,000
Pending: ₹0
```

### Payment Methods
- **Cash**: Physical cash payment
- **Bank Transfer**: Direct bank-to-bank transfer
- **UPI**: Unified Payments Interface (Google Pay, PhonePe, etc.)
- **Cheque**: Check payment
- **Card**: Credit or debit card payment

### Payment Reference
Use this field to record:
- Transaction ID for UPI/bank transfers
- Cheque number for cheque payments
- Receipt number for cash payments
- Any other payment identifier

---

## Vendor Tracking

### Vendor Filter
**Location**: Top of the page, next to search bar

**How to Use**:
1. Click "Filter by vendor" dropdown
2. Select a vendor from the list
3. View vendor-specific data

**What Happens**:
- **Vendor View Header** appears showing vendor name
- **Statistics cards** update to show vendor-specific data
- **Table** shows only orders for that vendor
- **Comparison** shows vendor stats vs. total (e.g., "15 of 50 total")

### Vendor View Header
**Appears when**: A vendor is selected in the filter

**Features**:
- Shows selected vendor name
- Displays description: "Showing statistics and orders for this vendor only"
- Includes "Clear Filter" button to reset

**Example**:
```
┌─────────────────────────────────────────────────┐
│ Vendor View: ABC Suppliers                      │
│ Showing statistics and orders for this vendor   │
│                              [Clear Filter]      │
└─────────────────────────────────────────────────┘
```

### Vendor-Specific Statistics
When a vendor is selected, all statistics cards show:
- **Primary Value**: Vendor-specific count/amount
- **Comparison**: "of X total" showing global total

**Example**:
```
Vendor Orders          Outstanding           Vendor Value
     15                     8                  ₹45,000.00
of 50 total           of 20 total           of ₹150,000.00 total
```

---

## Filtering & Search

### Available Filters

#### 1. Status Filter
Filter orders by their current status:
- **All Status**: Show all orders
- **Ordered**: Orders placed with vendor
- **Confirmed**: Vendor confirmed the order
- **Shipped**: Order is in transit
- **Received**: Order received and inventory updated
- **Cancelled**: Cancelled orders

#### 2. Payment Status Filter
Filter orders by payment status:
- **All Payments**: Show all orders
- **Pending**: No payment made
- **Partial**: Some payment made
- **Paid**: Fully paid

#### 3. Vendor Filter
Filter orders by vendor:
- **All Vendors**: Show all vendors
- **[Vendor Name]**: Show specific vendor only

#### 4. Search
Search by:
- **PO Number**: e.g., "PO-2024-001"
- **Vendor Name**: e.g., "ABC Suppliers"

### Filter Combinations
All filters work together (AND logic):

**Example 1**: Find pending payments for a specific vendor
- Vendor Filter: "ABC Suppliers"
- Payment Status: "Pending"
- Result: Shows only unpaid orders from ABC Suppliers

**Example 2**: Find shipped orders with partial payments
- Status Filter: "Shipped"
- Payment Status: "Partial"
- Result: Shows only shipped orders with partial payments

**Example 3**: Search within filtered results
- Vendor Filter: "ABC Suppliers"
- Search: "PO-2024"
- Result: Shows ABC Suppliers orders with PO numbers containing "2024"

---

## Common Workflows

### Workflow 1: Create a Purchase Order

**Steps**:
1. Click "Create Order" button
2. Select vendor from dropdown
3. Add items:
   - Select product
   - Select variant (packaging size)
   - Enter quantity
   - Enter unit cost
   - Click "Add Item"
4. Repeat for all items
5. Enter shipping cost (if any)
6. Add notes (optional)
7. Set expected delivery date
8. Click "Create Purchase Order"

**Result**: New order created with status "Ordered" and payment status "Pending"

### Workflow 2: Record a Partial Payment

**Scenario**: You paid ₹5,000 out of ₹10,000 order

**Steps**:
1. Find the order in the table
2. Click on the payment status badge (or "Payment" button)
3. Select "Partial" from Payment Status dropdown
4. Enter "5000" in Paid Amount field
5. Verify: "Pending Amount: ₹5,000.00"
6. Select payment method (e.g., "Bank Transfer")
7. Enter payment date
8. Enter payment reference (transaction ID)
9. Click "Update Payment"

**Result**: 
- Order shows [Partial] badge
- Table displays: "Paid: ₹5,000.00 / Pending: ₹5,000.00"

### Workflow 3: Complete a Partial Payment

**Scenario**: You want to pay the remaining ₹5,000

**Steps**:
1. Click on the payment status badge
2. Select "Paid" from Payment Status dropdown
3. System automatically sets paid amount to ₹10,000
4. Select payment method
5. Enter payment date and reference
6. Click "Update Payment"

**Result**: 
- Order shows [Paid] badge in green
- No pending amount

### Workflow 4: Track Vendor Performance

**Steps**:
1. Select vendor from "Filter by vendor" dropdown
2. Review Vendor View header confirming selection
3. Check statistics cards:
   - Total orders with this vendor
   - Outstanding orders
   - Total value of orders
   - Payment status breakdown
4. Scroll down to see detailed order list
5. Click "Clear Filter" to view another vendor

**Result**: Complete overview of vendor relationship

### Workflow 5: Process Pending Payments

**Steps**:
1. Select "Pending" from Payment Status filter
2. Optionally select a specific vendor
3. Review the filtered list of unpaid orders
4. For each order:
   - Click payment status or "Payment" button
   - Update payment details
   - Click "Update Payment"
5. Clear filters to see all orders

**Result**: All pending payments processed

### Workflow 6: Update Order Status

**Steps**:
1. Find the order in the table
2. Use the status dropdown in the Actions column
3. Select new status:
   - Ordered → Confirmed (vendor confirmed)
   - Confirmed → Shipped (order dispatched)
   - Shipped → Received (order arrived)
4. System updates status immediately

**Result**: Order status updated, inventory updated if "Received"

### Workflow 7: Find Specific Order

**Steps**:
1. Enter PO number or vendor name in search bar
2. Optionally apply filters to narrow down
3. View matching orders in the table
4. Click on order to view/edit details

**Result**: Quick access to specific order

---

## Tips & Best Practices

### Payment Management Tips

#### Recording Payments
✅ **Record immediately**: Update payment status as soon as payment is made  
✅ **Use cumulative amounts**: For partial payments, enter total paid so far  
✅ **Add references**: Always include payment reference for audit trail  
✅ **Verify amounts**: Double-check paid amount before saving  
✅ **Correct method**: Select the actual payment method used  

#### Partial Payments
✅ **Track externally**: Keep a separate log of individual installments  
✅ **Update regularly**: Update cumulative total after each installment  
✅ **Use notes**: Add installment number in payment reference  
✅ **Review periodically**: Check partial payments to ensure completion  
✅ **Transition properly**: Use "Paid" status when fully paid, not "Partial"  

### Vendor Management Tips

#### Vendor Tracking
✅ **Regular reviews**: Periodically review each vendor's orders and payments  
✅ **Monitor outstanding**: Keep track of outstanding orders per vendor  
✅ **Compare performance**: Use vendor filter to compare different suppliers  
✅ **Maintain records**: Keep payment references up to date  
✅ **Clear communication**: Use order notes for vendor-specific information  

#### Vendor Selection
✅ **Consistent naming**: Use consistent vendor names  
✅ **Complete profiles**: Ensure vendor contact information is current  
✅ **Track reliability**: Note delivery performance in order notes  
✅ **Payment terms**: Record agreed payment terms in notes  

### Filtering Tips

#### Effective Filtering
✅ **Start broad**: Begin with vendor filter, then narrow with other filters  
✅ **Combine filters**: Use multiple filters together for precise results  
✅ **Use search**: Combine search with filters for specific orders  
✅ **Check statistics**: Review stats cards to understand filtered data  
✅ **Clear filters**: Use "Clear Filter" button to reset and start fresh  

#### Search Best Practices
✅ **Use PO numbers**: Most precise way to find specific orders  
✅ **Partial matches**: Search works with partial vendor names  
✅ **Case insensitive**: Search is not case-sensitive  
✅ **Combine with filters**: Search within filtered results  

### Order Management Tips

#### Creating Orders
✅ **Verify vendor**: Double-check vendor selection  
✅ **Accurate costs**: Enter correct unit costs  
✅ **Include shipping**: Don't forget shipping costs  
✅ **Set delivery date**: Always set expected delivery date  
✅ **Add notes**: Include PO terms, special instructions  

#### Updating Orders
✅ **Timely updates**: Update status as soon as it changes  
✅ **Accurate dates**: Record actual delivery dates  
✅ **Inventory check**: Verify inventory after receiving  
✅ **Payment coordination**: Update payment status with order status  

---

## Statistics Cards Explained

### 1. Total Orders / Vendor Orders
**Shows**: Count of orders (filtered or total)
**Changes to**: "Vendor Orders" when vendor filter is active
**Use for**: Understanding order volume

### 2. Outstanding Orders
**Shows**: Orders not yet received (Ordered, Confirmed, Shipped)
**Use for**: Tracking pending deliveries

### 3. Total Value / Vendor Value
**Shows**: Sum of all order amounts (filtered or total)
**Changes to**: "Vendor Value" when vendor filter is active
**Use for**: Understanding financial commitment

### 4. Pending Payments
**Shows**: Count of orders with pending payment status
**Use for**: Identifying unpaid orders

### 5. Paid Orders
**Shows**: Count of orders with paid status
**Use for**: Tracking payment completion

---

## Keyboard Shortcuts & Quick Actions

### Quick Actions
- **Click Payment Badge**: Opens payment dialog
- **Click Payment Button**: Opens payment dialog
- **Status Dropdown**: Quick status update
- **Clear Filter Button**: Resets vendor filter

### Navigation
- **Search Bar**: Type to search immediately
- **Filter Dropdowns**: Click to open, select to apply
- **Table Rows**: Click to view details

---

## Troubleshooting

### Common Issues

#### "Paid amount must be greater than 0"
**Problem**: Entered 0 with "Partial" status  
**Solution**: Enter a positive amount or use "Pending" status

#### "Paid amount must be less than total"
**Problem**: Entered full amount with "Partial" status  
**Solution**: Use "Paid" status instead

#### "Please select a payment method"
**Problem**: Selected "Partial" or "Paid" without payment method  
**Solution**: Select a payment method from dropdown

#### No orders showing
**Problem**: Filters are too restrictive  
**Solution**: Clear filters and try again

#### Statistics don't match
**Problem**: Filters are active  
**Solution**: Check active filters, clear if needed

---

## Feature Summary

### ✅ Implemented Features
- ✅ Create, edit, delete purchase orders
- ✅ Track order status (Ordered → Received)
- ✅ Payment status tracking (Pending, Partial, Paid)
- ✅ Partial payment tracking with paid/pending amounts
- ✅ Payment method recording
- ✅ Payment date and reference tracking
- ✅ Vendor filtering with dedicated view
- ✅ Status filtering
- ✅ Payment status filtering
- ✅ Search by PO number and vendor name
- ✅ Dynamic filtered statistics
- ✅ Vendor-specific statistics
- ✅ Automatic inventory updates
- ✅ Real-time calculations
- ✅ Comprehensive validation

### 📊 Statistics & Reporting
- ✅ Total orders count
- ✅ Outstanding orders count
- ✅ Total order value
- ✅ Pending payments count
- ✅ Paid orders count
- ✅ Vendor-specific statistics
- ✅ Filtered statistics

### 🔒 Data Integrity
- ✅ Database constraints
- ✅ Input validation
- ✅ Error handling
- ✅ Audit trail (payment references)
- ✅ Automatic calculations

---

## Related Documentation

For more detailed information, see:
- **PARTIAL_PAYMENT_TRACKING.md**: Detailed guide on partial payments
- **VENDOR_TRACKING_ENHANCEMENTS.md**: Vendor-specific features
- **PURCHASE_ORDERS_FEATURE_SUMMARY.md**: Complete feature overview
- **TODO.md**: Implementation history and updates

---

## Support & Feedback

### Getting Help
- Review this guide for common workflows
- Check troubleshooting section for common issues
- Refer to related documentation for detailed features

### Best Practices
- Record payments immediately
- Keep payment references updated
- Review vendor performance regularly
- Use filters effectively
- Maintain accurate order status

---

**Last Updated**: 2025-11-26  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
