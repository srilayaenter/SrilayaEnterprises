# Inventory and Payment Tracking System Guide

## Overview

This document explains how to track:
1. **Vendor Supplies** - Products received from vendors
2. **Handler Payments** - Money paid to shipment handlers for deliveries

---

## 1. Vendor Supplies Tracking

### Purpose
Track all products supplied by vendors, including quantities, costs, quality checks, and payment status.

### Database Table: `vendor_supplies`

#### Table Structure
```sql
CREATE TABLE vendor_supplies (
  id uuid PRIMARY KEY,
  vendor_id uuid REFERENCES vendors(id),
  supply_date date NOT NULL,
  invoice_number text,
  items jsonb NOT NULL,              -- Array of product items
  total_amount numeric NOT NULL,
  payment_status payment_status,     -- pending, partial, paid
  payment_date date,
  quality_check_status quality_check_status,  -- pending, passed, failed
  quality_notes text,
  delivery_notes text,
  received_by uuid REFERENCES profiles(id),
  created_at timestamptz,
  updated_at timestamptz
);
```

#### Items Structure (JSONB)
Each supply record contains an array of items with the following structure:

```typescript
interface VendorSupplyItem {
  product_id: string;        // Reference to product
  product_name: string;      // Product name for display
  variant_id: string;        // Reference to product variant (optional)
  packaging_size: string;    // e.g., "1kg", "5kg"
  quantity: number;          // Number of units supplied
  unit_cost: number;         // Cost per unit
  total_cost: number;        // quantity × unit_cost
}
```

#### Example Supply Record
```json
{
  "id": "uuid-123",
  "vendor_id": "vendor-uuid",
  "supply_date": "2025-01-15",
  "invoice_number": "INV-2025-001",
  "items": [
    {
      "product_id": "prod-uuid-1",
      "product_name": "Ragi Flour",
      "variant_id": "variant-uuid-1",
      "packaging_size": "1kg",
      "quantity": 100,
      "unit_cost": 117.60,
      "total_cost": 11760.00
    },
    {
      "product_id": "prod-uuid-2",
      "product_name": "Barnyard Flakes",
      "variant_id": "variant-uuid-2",
      "packaging_size": "5kg",
      "quantity": 50,
      "unit_cost": 588.00,
      "total_cost": 29400.00
    }
  ],
  "total_amount": 41160.00,
  "payment_status": "pending",
  "quality_check_status": "passed",
  "quality_notes": "All products meet quality standards",
  "delivery_notes": "Delivered in good condition"
}
```

### How to Use Vendor Supplies

#### 1. Access the Vendor Supplies Tab
- Navigate to Admin Dashboard
- Click on the "Supplies" tab
- View all vendor supply records

#### 2. Add a New Supply
1. Click "Add Supply" button
2. Fill in the form:
   - **Vendor**: Select the vendor
   - **Supply Date**: Date of delivery
   - **Invoice Number**: Vendor's invoice reference
   - **Payment Status**: pending/partial/paid
   - **Quality Check Status**: pending/passed/failed
   - **Quality Notes**: Inspection notes
   - **Delivery Notes**: General notes

3. Add Items:
   - Click "Add Item" for each product
   - Select product and variant
   - Enter quantity and unit cost
   - Total cost is calculated automatically

4. Click "Create Supply" to save

#### 3. Track Supply Metrics
The dashboard shows:
- **Total Supplies**: Number of supply records
- **Total Value**: Sum of all supply amounts
- **Pending Payments**: Amount owed to vendors

#### 4. Filter Supplies
- Filter by Payment Status (pending/partial/paid)
- Filter by Quality Status (pending/passed/failed)

### API Functions for Vendor Supplies

```typescript
import { vendorSuppliesApi } from '@/db/api';

// Get all supplies
const supplies = await vendorSuppliesApi.getAll();

// Get supplies by vendor
const vendorSupplies = await vendorSuppliesApi.getByVendor(vendorId);

// Get supplies by payment status
const pendingPayments = await vendorSuppliesApi.getByPaymentStatus('pending');

// Create new supply
const newSupply = await vendorSuppliesApi.create({
  vendor_id: 'vendor-uuid',
  supply_date: '2025-01-15',
  invoice_number: 'INV-001',
  items: [...],
  total_amount: 41160.00,
  payment_status: 'pending',
  quality_check_status: 'pending',
  // ... other fields
});

// Update supply
await vendorSuppliesApi.update(supplyId, {
  payment_status: 'paid',
  payment_date: '2025-01-20'
});

// Delete supply
await vendorSuppliesApi.delete(supplyId);
```

---

## 2. Handler Payments Tracking

### Purpose
Track all payments made to shipment handlers for their delivery services.

### Database Table: `handler_payments`

#### Table Structure
```sql
CREATE TABLE handler_payments (
  id uuid PRIMARY KEY,
  shipment_id uuid REFERENCES shipments(id),
  handler_id uuid REFERENCES shipment_handlers(id),
  order_id uuid REFERENCES orders(id),
  payment_amount numeric NOT NULL,
  payment_date date,
  payment_method text,               -- cash, bank transfer, UPI, etc.
  payment_status payment_status,     -- pending, partial, paid
  transaction_reference text,        -- Bank transaction ID
  notes text,
  created_at timestamptz,
  updated_at timestamptz
);
```

#### Payment Record Structure
```typescript
interface HandlerPayment {
  id: string;
  shipment_id: string;           // Which shipment
  handler_id: string;            // Which handler
  order_id: string;              // Related order
  payment_amount: number;        // Amount paid
  payment_date: string | null;   // When paid
  payment_method: string | null; // How paid
  payment_status: PaymentStatus; // pending/partial/paid
  transaction_reference: string | null; // Transaction ID
  notes: string | null;          // Additional notes
  created_at: string;
  updated_at: string;
}
```

#### Example Payment Record
```json
{
  "id": "payment-uuid",
  "shipment_id": "shipment-uuid",
  "handler_id": "handler-uuid",
  "order_id": "order-uuid",
  "payment_amount": 150.00,
  "payment_date": "2025-01-15",
  "payment_method": "UPI",
  "payment_status": "paid",
  "transaction_reference": "TXN123456789",
  "notes": "Payment for delivery on 2025-01-15"
}
```

### How to Use Handler Payments

#### 1. Record a Payment
```typescript
import { handlerPaymentsApi } from '@/db/api';

// Create a new payment record
const payment = await handlerPaymentsApi.create({
  shipment_id: 'shipment-uuid',
  handler_id: 'handler-uuid',
  order_id: 'order-uuid',
  payment_amount: 150.00,
  payment_date: '2025-01-15',
  payment_method: 'UPI',
  payment_status: 'paid',
  transaction_reference: 'TXN123456789',
  notes: 'Payment for delivery'
});
```

#### 2. Track Handler Payments
```typescript
// Get all payments for a specific handler
const handlerPayments = await handlerPaymentsApi.getByHandler(handlerId);

// Get payments for a specific shipment
const shipmentPayments = await handlerPaymentsApi.getByShipment(shipmentId);

// Get pending payments
const pendingPayments = await handlerPaymentsApi.getPendingPayments();

// Get total paid to a handler
const totalPaid = await handlerPaymentsApi.getTotalPaidToHandler(handlerId);
```

#### 3. Update Payment Status
```typescript
// Mark payment as paid
await handlerPaymentsApi.update(paymentId, {
  payment_status: 'paid',
  payment_date: '2025-01-15',
  transaction_reference: 'TXN123456789'
});
```

#### 4. Get Payment Details with Relations
```typescript
// Get payments with handler, shipment, and order details
const paymentsWithDetails = await handlerPaymentsApi.getWithDetails();

// Returns:
// {
//   id: 'payment-uuid',
//   payment_amount: 150.00,
//   handler: { id: '...', name: 'Handler Name', phone: '...' },
//   shipment: { id: '...', tracking_number: 'TRK123', status: 'delivered' },
//   order: { id: '...', order_number: 'ORD-001', total_amount: 500.00 }
// }
```

### API Functions for Handler Payments

```typescript
import { handlerPaymentsApi } from '@/db/api';

// Get all payments
const allPayments = await handlerPaymentsApi.getAll();

// Get payment by ID
const payment = await handlerPaymentsApi.getById(paymentId);

// Get payments by handler
const handlerPayments = await handlerPaymentsApi.getByHandler(handlerId);

// Get payments by shipment
const shipmentPayments = await handlerPaymentsApi.getByShipment(shipmentId);

// Get payments by status
const pendingPayments = await handlerPaymentsApi.getByPaymentStatus('pending');

// Get payments with full details
const detailedPayments = await handlerPaymentsApi.getWithDetails();

// Create payment
const newPayment = await handlerPaymentsApi.create({
  shipment_id: 'shipment-uuid',
  handler_id: 'handler-uuid',
  order_id: 'order-uuid',
  payment_amount: 150.00,
  payment_status: 'pending',
  // ... other fields
});

// Update payment
await handlerPaymentsApi.update(paymentId, {
  payment_status: 'paid',
  payment_date: '2025-01-15'
});

// Delete payment
await handlerPaymentsApi.delete(paymentId);

// Get total paid to handler
const totalPaid = await handlerPaymentsApi.getTotalPaidToHandler(handlerId);

// Get all pending payments
const pending = await handlerPaymentsApi.getPendingPayments();
```

---

## 3. Integration Examples

### Example 1: Complete Vendor Supply Workflow

```typescript
// 1. Receive products from vendor
const supply = await vendorSuppliesApi.create({
  vendor_id: vendorId,
  supply_date: new Date().toISOString().split('T')[0],
  invoice_number: 'INV-2025-001',
  items: [
    {
      product_id: 'prod-1',
      product_name: 'Ragi Flour',
      variant_id: 'var-1',
      packaging_size: '1kg',
      quantity: 100,
      unit_cost: 117.60,
      total_cost: 11760.00
    }
  ],
  total_amount: 11760.00,
  payment_status: 'pending',
  quality_check_status: 'pending',
  delivery_notes: 'Received in warehouse'
});

// 2. Perform quality check
await vendorSuppliesApi.update(supply.id, {
  quality_check_status: 'passed',
  quality_notes: 'All products meet quality standards'
});

// 3. Make payment to vendor
await vendorSuppliesApi.update(supply.id, {
  payment_status: 'paid',
  payment_date: new Date().toISOString().split('T')[0]
});
```

### Example 2: Complete Handler Payment Workflow

```typescript
// 1. Shipment is delivered
await shipmentsApi.updateStatus(shipmentId, 'delivered', 'Delivered successfully');

// 2. Record payment to handler
const payment = await handlerPaymentsApi.create({
  shipment_id: shipmentId,
  handler_id: handlerId,
  order_id: orderId,
  payment_amount: 150.00,
  payment_date: new Date().toISOString().split('T')[0],
  payment_method: 'UPI',
  payment_status: 'paid',
  transaction_reference: 'TXN123456789',
  notes: 'Payment for successful delivery'
});

// 3. Track total payments to handler
const totalPaid = await handlerPaymentsApi.getTotalPaidToHandler(handlerId);
console.log(`Total paid to handler: ₹${totalPaid}`);
```

### Example 3: Monthly Financial Report

```typescript
// Get all vendor supplies for the month
const supplies = await vendorSuppliesApi.getAll();
const monthlySupplies = supplies.filter(s => 
  new Date(s.supply_date).getMonth() === new Date().getMonth()
);

// Calculate total purchases
const totalPurchases = monthlySupplies.reduce((sum, s) => 
  sum + Number(s.total_amount), 0
);

// Get pending vendor payments
const pendingVendorPayments = await vendorSuppliesApi.getByPaymentStatus('pending');
const totalOwedToVendors = pendingVendorPayments.reduce((sum, s) => 
  sum + Number(s.total_amount), 0
);

// Get all handler payments for the month
const allPayments = await handlerPaymentsApi.getAll();
const monthlyHandlerPayments = allPayments.filter(p => 
  p.payment_date && new Date(p.payment_date).getMonth() === new Date().getMonth()
);

// Calculate total handler payments
const totalHandlerPayments = monthlyHandlerPayments.reduce((sum, p) => 
  sum + Number(p.payment_amount), 0
);

// Get pending handler payments
const pendingHandlerPayments = await handlerPaymentsApi.getPendingPayments();
const totalOwedToHandlers = pendingHandlerPayments.reduce((sum, p) => 
  sum + Number(p.payment_amount), 0
);

console.log('Monthly Financial Summary:');
console.log(`Total Purchases: ₹${totalPurchases}`);
console.log(`Owed to Vendors: ₹${totalOwedToVendors}`);
console.log(`Handler Payments: ₹${totalHandlerPayments}`);
console.log(`Owed to Handlers: ₹${totalOwedToHandlers}`);
```

---

## 4. Security and Permissions

### Row Level Security (RLS)

Both tables have RLS enabled with admin-only access:

```sql
-- Vendor Supplies
CREATE POLICY "Admins have full access to vendor supplies" ON vendor_supplies
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Handler Payments
CREATE POLICY "Admins have full access to handler payments" ON handler_payments
  FOR ALL TO authenticated USING (is_admin(auth.uid()));
```

Only authenticated users with admin role can:
- View supply and payment records
- Create new records
- Update existing records
- Delete records

---

## 5. Database Indexes

### Vendor Supplies Indexes
```sql
CREATE INDEX idx_vendor_supplies_vendor ON vendor_supplies(vendor_id);
CREATE INDEX idx_vendor_supplies_date ON vendor_supplies(supply_date);
CREATE INDEX idx_vendor_supplies_payment_status ON vendor_supplies(payment_status);
CREATE INDEX idx_vendor_supplies_quality_status ON vendor_supplies(quality_check_status);
```

### Handler Payments Indexes
```sql
CREATE INDEX idx_handler_payments_shipment ON handler_payments(shipment_id);
CREATE INDEX idx_handler_payments_handler ON handler_payments(handler_id);
CREATE INDEX idx_handler_payments_order ON handler_payments(order_id);
CREATE INDEX idx_handler_payments_status ON handler_payments(payment_status);
CREATE INDEX idx_handler_payments_date ON handler_payments(payment_date);
```

These indexes ensure fast queries for:
- Finding supplies by vendor
- Finding payments by handler
- Filtering by payment status
- Date-based queries

---

## 6. Summary

### Vendor Supplies System
✅ **Tracks**: Products received from vendors
✅ **Stores**: Product details, quantities, costs, quality checks
✅ **Manages**: Payment status to vendors
✅ **Location**: Admin Dashboard → Supplies tab

### Handler Payments System
✅ **Tracks**: Payments to shipment handlers
✅ **Stores**: Payment amounts, dates, methods, transaction references
✅ **Manages**: Payment status to handlers
✅ **Access**: Via API functions (handlerPaymentsApi)

### Key Benefits
1. **Complete Audit Trail**: Every supply and payment is recorded
2. **Financial Tracking**: Know exactly what you owe and what you've paid
3. **Quality Control**: Track quality checks on vendor supplies
4. **Payment Management**: Track payment status and methods
5. **Reporting**: Generate financial reports easily
6. **Security**: Admin-only access with RLS protection
