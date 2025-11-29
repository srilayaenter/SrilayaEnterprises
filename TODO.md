# Task: Vendor Integration & Purchase Order Tracking System

## Plan

### Phase 1: Database Schema
- [x] Add vendor_id to products table
- [x] Add purchase_order_id to vendor_payments table
- [x] Add vendor_id to vendor_payments table
- [x] Add necessary indexes

### Phase 2: Type Definitions
- [x] Update Product type with vendor_id
- [x] Update VendorPayment type with purchase_order_id and vendor_id
- [x] Create VendorPaymentWithDetails type
- [x] Update ProductWithVariants to include vendor

### Phase 3: API Functions
- [ ] Update productsApi to include vendor info
- [ ] Update vendorPaymentsApi for new fields
- [ ] Add vendor transaction queries
- [ ] Update purchase orders API

### Phase 4: Product Management Updates
- [ ] Add vendor selection dropdown to product form
- [ ] Add "Add Vendor" button at top level (like Add Category)
- [ ] Display vendor name in product list
- [ ] Update product creation to include vendor_id
- [ ] Update product edit to allow vendor change

### Phase 5: Purchase Orders Management Enhancement
- [ ] Update PurchaseOrders page to show payment status
- [ ] Link to vendor payments from PO
- [ ] Show payment history for each PO

### Phase 6: Vendor Management Enhancement
- [ ] Add transaction history tab/section
- [ ] Display all purchase orders for vendor
- [ ] Display all payments for vendor
- [ ] Show financial summary (total owed, paid, outstanding)
- [ ] Add quick payment action

### Phase 7: Vendor Payments Page Enhancement
- [ ] Update VendorPayments page to link with POs
- [ ] Add PO selection when creating payment
- [ ] Show related PO info in payment list
- [ ] Update payment status in PO when payment is made

### Phase 8: Dashboard Updates
- [ ] Update navigation if needed
- [ ] Add summary cards for POs and payments if needed

## Notes
- Existing tables: purchase_orders, vendor_payments, vendors already exist
- purchase_orders has: po_number, vendor_id, order_date, status, items (jsonb), total_amount
- vendor_payments has: vendor_name, vendor_contact, amount, payment_date, payment_method, reference_number, purpose
- Need to integrate existing structure with new vendor linkages
- All monetary values in INR (₹)
