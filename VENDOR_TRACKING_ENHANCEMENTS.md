# Vendor Tracking Enhancements

## Overview
Enhanced the Purchase Orders page with vendor-specific views and dynamic filtered statistics to make tracking vendor orders, payments, and performance much easier.

## Key Features Implemented

### 1. Dynamic Filtered Statistics
All statistics cards now update in real-time based on the active filters (vendor, status, payment status).

**Before**: Statistics showed only global totals
**After**: Statistics reflect the current filter selection

#### Statistics Cards
- **Total Orders / Vendor Orders**: Shows filtered order count
- **Outstanding Orders**: Shows outstanding orders for selected filters
- **Total Value / Vendor Value**: Shows total amount for filtered orders
- **Pending Payments**: Shows pending payment count for filtered orders
- **Paid Orders**: Shows paid order count for filtered orders

#### Comparison Display
When a vendor filter is active, each card shows:
- **Primary Value**: The filtered statistic (e.g., vendor-specific count)
- **Comparison Text**: Shows how it compares to total (e.g., "5 of 20 total")

Example:
```
Vendor Orders
     15
of 50 total
```

### 2. Vendor View Header
When a vendor filter is applied, a special header card appears at the top of the page.

**Features**:
- **Vendor Name Display**: Shows "Vendor View: [Vendor Name]"
- **Description**: "Showing statistics and orders for this vendor only"
- **Clear Filter Button**: Quick way to reset the vendor filter
- **Visual Distinction**: Highlighted with primary color theme (bg-primary/5, border-primary/20)

**Benefits**:
- Clear visual indication that you're in vendor-specific mode
- Easy way to exit vendor view
- Prevents confusion about what data is being displayed

### 3. Comprehensive Filter System
Three independent filters work together:

#### Status Filter
- All Status
- Ordered
- Confirmed
- Shipped
- Received
- Cancelled

#### Payment Status Filter
- All Payments
- Pending
- Partial
- Paid

#### Vendor Filter
- All Vendors
- [List of all vendors dynamically loaded]

**Filter Behavior**:
- Filters work together (AND logic)
- Statistics update instantly when any filter changes
- Table shows only orders matching all active filters
- Search works in combination with filters

### 4. Contextual Card Titles
Card titles change based on the active filters:

| Filter State | Card Title |
|-------------|------------|
| No vendor filter | "Total Orders" |
| Vendor filter active | "Vendor Orders" |
| No vendor filter | "Total Value" |
| Vendor filter active | "Vendor Value" |

This provides clear context about what data is being displayed.

## Use Cases

### Use Case 1: Track Specific Vendor Performance
**Scenario**: You want to see all orders and payment status for "ABC Suppliers"

**Steps**:
1. Select "ABC Suppliers" from the Vendor filter dropdown
2. View the Vendor View header confirming the selection
3. See vendor-specific statistics:
   - How many orders placed with this vendor
   - How many are outstanding
   - Total value of orders with this vendor
   - Payment status breakdown

**Result**: Complete overview of your relationship with ABC Suppliers

### Use Case 2: Find Pending Payments for a Vendor
**Scenario**: You need to process pending payments for a specific vendor

**Steps**:
1. Select the vendor from the Vendor filter
2. Select "Pending" from the Payment Status filter
3. View the filtered list showing only unpaid orders for that vendor
4. See the "Pending Payments" card showing the count
5. Click on payment status or Payment button to update

**Result**: Quick identification and processing of pending payments

### Use Case 3: Review Outstanding Orders by Vendor
**Scenario**: You want to follow up on orders that haven't been received yet

**Steps**:
1. Select the vendor from the Vendor filter
2. Select "Ordered", "Confirmed", or "Shipped" from Status filter
3. View the "Outstanding" card showing the count
4. Review the filtered table for details

**Result**: Easy tracking of in-progress orders per vendor

### Use Case 4: Compare Vendor Performance
**Scenario**: You want to compare order volumes and values across vendors

**Steps**:
1. Select Vendor A, note the statistics
2. Click "Clear Filter" in the Vendor View header
3. Select Vendor B, note the statistics
4. Compare the values

**Result**: Data-driven vendor performance comparison

## Technical Implementation

### Filtered Statistics Calculation
```typescript
const filteredStats = {
  total: filteredOrders.length,
  outstanding: filteredOrders.filter(o => 
    ['ordered', 'confirmed', 'shipped'].includes(o.status)
  ).length,
  totalValue: filteredOrders.reduce((sum, o) => sum + Number(o.total_amount), 0),
  pending: filteredOrders.filter(o => !o.payment_status || o.payment_status === 'pending').length,
  paid: filteredOrders.filter(o => o.payment_status === 'paid').length,
};
```

### Vendor Name Resolution
```typescript
const selectedVendorName = vendorFilter !== 'all' 
  ? vendors.find(v => v.id === vendorFilter)?.name 
  : null;
```

### Filter Logic
```typescript
const filteredOrders = orders.filter(order => {
  const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
  const matchesPaymentStatus = paymentStatusFilter === 'all' || 
    (order.payment_status || 'pending') === paymentStatusFilter;
  const matchesVendor = vendorFilter === 'all' || order.vendor_id === vendorFilter;
  const matchesSearch = order.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  
  return matchesStatus && matchesPaymentStatus && matchesVendor && matchesSearch;
});
```

## Benefits

### For Business Operations
- **Better Vendor Management**: Easy tracking of orders and payments per vendor
- **Improved Cash Flow**: Quick identification of pending payments
- **Performance Insights**: Compare vendor performance at a glance
- **Faster Decision Making**: Real-time statistics for informed decisions

### For Users
- **Intuitive Interface**: Clear visual indicators of active filters
- **Quick Navigation**: Easy switching between vendor views
- **Comprehensive View**: All relevant data in one place
- **Efficient Workflow**: Reduced clicks to find specific information

### For Data Accuracy
- **Real-time Updates**: Statistics update instantly with filter changes
- **Consistent Display**: All data respects active filters
- **Clear Context**: Always know what data you're viewing
- **No Confusion**: Vendor View header prevents misinterpretation

## Future Enhancements (Suggestions)

1. **Vendor Performance Dashboard**: Dedicated page with charts and trends
2. **Export Vendor Reports**: Download vendor-specific data as PDF/Excel
3. **Vendor Comparison View**: Side-by-side comparison of multiple vendors
4. **Payment Reminders**: Automated alerts for pending payments per vendor
5. **Vendor Rating System**: Track and display vendor reliability scores
6. **Order History Timeline**: Visual timeline of orders per vendor
7. **Vendor Contact Quick Actions**: Call/email vendor directly from the page
8. **Bulk Payment Processing**: Mark multiple orders as paid at once

## Files Modified
- `src/pages/admin/PurchaseOrders.tsx`: Added filtered statistics and vendor view header
- `TODO.md`: Updated with vendor-specific enhancements documentation

## Testing Checklist
- [x] Vendor filter updates statistics correctly
- [x] Vendor View header appears when vendor is selected
- [x] Clear Filter button resets vendor filter
- [x] Statistics show comparison text when vendor filter is active
- [x] Card titles change contextually
- [x] All filters work together correctly
- [x] Search works with vendor filter
- [x] Lint check passes

---

**Last Updated**: 2025-11-26  
**Status**: ✅ Implemented and Tested
