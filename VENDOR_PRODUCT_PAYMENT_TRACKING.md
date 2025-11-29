# Vendor-Product Relationship and Payment Tracking System

## Overview
This document describes the implementation of the vendor-product relationship and payment tracking system that links products with their suppliers and tracks payments for purchase orders.

## Database Schema Updates

### 1. Products Table Enhancement
**Column Added:**
- `vendor_id` (uuid, nullable) - References `vendors(id)` with `ON DELETE SET NULL`

**Purpose:**
- Links each product to its supplier/vendor
- Allows tracking which vendor supplies which products
- Enables vendor-specific product queries and reports

**Index:**
- `idx_products_vendor_id` - Optimizes queries filtering by vendor

### 2. Vendor Payments Table Enhancement
**Columns Added:**
- `purchase_order_id` (uuid, nullable) - References `purchase_orders(id)` with `ON DELETE SET NULL`
- `vendor_id` (uuid, nullable) - References `vendors(id)` with `ON DELETE RESTRICT`

**Purpose:**
- `purchase_order_id`: Links payments to specific purchase orders for better tracking
- `vendor_id`: Direct reference to vendor for efficient querying and reporting

**Indexes:**
- `idx_vendor_payments_po_id` - Optimizes queries filtering by purchase order
- `idx_vendor_payments_vendor_id` - Optimizes queries filtering by vendor

**Delete Behavior:**
- `purchase_order_id`: SET NULL - If a purchase order is deleted, the payment record remains but the link is removed
- `vendor_id`: RESTRICT - Cannot delete a vendor if they have payment records (data integrity)

## Type System Updates

### 1. Product Interface
```typescript
export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: ProductCategory;
  base_price: number;
  product_code: string | null;
  image_url: string | null;
  stock: number;
  weight_per_kg: number;
  is_active: boolean;
  vendor_id: string | null;  // ✅ Added
  created_at: string;
  updated_at: string;
}
```

### 2. ProductWithVariants Interface
```typescript
export interface ProductWithVariants extends Product {
  variants?: ProductVariant[];
  vendor?: Vendor;  // ✅ Includes vendor details
}
```

### 3. VendorPayment Interface
```typescript
export interface VendorPayment {
  id: string;
  vendor_name: string;
  vendor_contact: string | null;
  vendor_id: string | null;  // ✅ Added
  purchase_order_id: string | null;  // ✅ Added
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  reference_number: string | null;
  purpose: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
```

### 4. VendorPaymentWithDetails Interface
```typescript
export interface VendorPaymentWithDetails extends VendorPayment {
  vendor?: Vendor;  // ✅ Includes vendor details
  purchase_order?: PurchaseOrder;  // ✅ Includes purchase order details
}
```

## API Layer Updates

### Products API
**Enhanced Methods:**

1. **`getAllWithVendors(category?: ProductCategory)`**
   - Returns products with vendor information included
   - Useful for displaying supplier information on product listings

2. **`getById(id: string)`**
   - Returns product with vendor details and variants
   - Complete product information including supplier

### Vendor Payments API
**Enhanced Methods:**

1. **`getAllWithDetails()`**
   - Returns all payments with vendor and purchase order details
   - Provides complete payment context

2. **`getByVendorId(vendorId: string)`**
   - Returns all payments for a specific vendor
   - Includes vendor and purchase order details

3. **`getByPurchaseOrder(purchaseOrderId: string)`**
   - Returns all payments for a specific purchase order
   - Useful for tracking payment status of orders

## Use Cases

### 1. Product-Vendor Tracking
**Scenario:** View which vendor supplies a specific product
```typescript
const product = await productsApi.getById(productId);
console.log(`Product: ${product.name}`);
console.log(`Supplier: ${product.vendor?.name}`);
console.log(`Contact: ${product.vendor?.phone}`);
```

### 2. Vendor Product Catalog
**Scenario:** List all products from a specific vendor
```typescript
const products = await productsApi.getAllWithVendors();
const vendorProducts = products.filter(p => p.vendor_id === vendorId);
```

### 3. Purchase Order Payment Tracking
**Scenario:** Track all payments made for a purchase order
```typescript
const payments = await vendorPaymentsApi.getByPurchaseOrder(poId);
const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
console.log(`Total Paid: ₹${totalPaid}`);
```

### 4. Vendor Payment History
**Scenario:** View complete payment history for a vendor
```typescript
const payments = await vendorPaymentsApi.getByVendorId(vendorId);
payments.forEach(payment => {
  console.log(`Date: ${payment.payment_date}`);
  console.log(`Amount: ₹${payment.amount}`);
  console.log(`PO: ${payment.purchase_order?.po_number || 'N/A'}`);
});
```

### 5. Payment-Purchase Order Reconciliation
**Scenario:** Verify if a purchase order is fully paid
```typescript
const po = await purchaseOrdersApi.getById(poId);
const payments = await vendorPaymentsApi.getByPurchaseOrder(poId);
const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
const balance = po.total_amount - totalPaid;
console.log(`Order Total: ₹${po.total_amount}`);
console.log(`Total Paid: ₹${totalPaid}`);
console.log(`Balance: ₹${balance}`);
```

## Benefits

### 1. Data Integrity
- Foreign key constraints ensure valid relationships
- RESTRICT on vendor_id prevents accidental data loss
- Indexes improve query performance

### 2. Better Reporting
- Easy to generate vendor-wise product reports
- Track payment history by vendor or purchase order
- Analyze supplier performance and payment patterns

### 3. Improved Workflow
- Link payments directly to purchase orders
- Track which vendor supplies which products
- Simplify vendor management and reconciliation

### 4. Enhanced Queries
- Fast lookups with proper indexing
- Efficient filtering by vendor or purchase order
- Optimized for common reporting scenarios

## Migration Files

### Primary Migration
**File:** `00044_add_vendor_product_link.sql`

**Contents:**
```sql
-- Add vendor_id to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS vendor_id uuid 
  REFERENCES vendors(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);

-- Add purchase_order_id to vendor_payments
ALTER TABLE vendor_payments ADD COLUMN IF NOT EXISTS purchase_order_id uuid 
  REFERENCES purchase_orders(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_vendor_payments_po_id ON vendor_payments(purchase_order_id);

-- Add vendor_id to vendor_payments
ALTER TABLE vendor_payments ADD COLUMN IF NOT EXISTS vendor_id uuid 
  REFERENCES vendors(id) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS idx_vendor_payments_vendor_id ON vendor_payments(vendor_id);
```

## Testing Checklist

- [x] Database columns created successfully
- [x] Foreign key constraints working correctly
- [x] Indexes created for performance optimization
- [x] TypeScript interfaces updated
- [x] API methods support new fields
- [x] Queries with vendor details working
- [x] Queries with purchase order details working
- [x] No linting errors

## Future Enhancements

### Potential Improvements
1. **Vendor Performance Metrics**
   - Track delivery times by vendor
   - Calculate vendor reliability scores
   - Monitor product quality by supplier

2. **Payment Analytics**
   - Payment trends by vendor
   - Average payment cycles
   - Outstanding balance reports

3. **Product Sourcing**
   - Multi-vendor support for same product
   - Automatic vendor selection based on price/availability
   - Vendor comparison reports

4. **Automated Reconciliation**
   - Auto-match payments to purchase orders
   - Alert for overdue payments
   - Payment schedule reminders

## Conclusion

The vendor-product relationship and payment tracking system provides a robust foundation for managing supplier relationships, tracking product sources, and monitoring payment flows. The implementation follows best practices with proper indexing, foreign key constraints, and comprehensive type safety.
