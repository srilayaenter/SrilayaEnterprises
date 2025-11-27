# System Overview - Inventory and Payment Tracking

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SRILAYA ENTERPRISES SYSTEM                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         ADMIN DASHBOARD                          │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────────┐  │
│  │ Products │Inventory │  Orders  │Customers │   Shipping   │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────────┘  │
│  ┌──────────┬──────────┬──────────┬──────────────────────────┐  │
│  │ Vendors  │ Supplies │ Handlers │      Shipments           │  │
│  └──────────┴──────────┴──────────┴──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Vendor Supply Flow

```
┌──────────┐         ┌──────────────────┐         ┌──────────────┐
│  Vendor  │────────▶│  Vendor Supplies │────────▶│   Inventory  │
│          │ Delivers│      Table       │ Updates │   Products   │
└──────────┘         └──────────────────┘         └──────────────┘
                              │
                              │ Tracks
                              ▼
                     ┌─────────────────┐
                     │  Payment Status │
                     │  Quality Check  │
                     │  Invoice Info   │
                     └─────────────────┘
```

**Process:**
1. Vendor delivers products
2. Admin records supply in "Supplies" tab
3. System stores:
   - Product details (name, quantity, cost)
   - Payment status (pending/partial/paid)
   - Quality check status (pending/passed/failed)
   - Invoice information
4. Inventory can be updated based on supply

---

### 2. Handler Payment Flow

```
┌──────────┐         ┌──────────────┐         ┌─────────────────┐
│ Customer │────────▶│    Order     │────────▶│    Shipment     │
│  Places  │  Creates│              │ Creates │                 │
└──────────┘         └──────────────┘         └─────────────────┘
                                                        │
                                                        │ Assigned to
                                                        ▼
                                               ┌─────────────────┐
                                               │     Handler     │
                                               │    Delivers     │
                                               └─────────────────┘
                                                        │
                                                        │ Payment for
                                                        ▼
                                               ┌─────────────────┐
                                               │ Handler Payment │
                                               │     Record      │
                                               └─────────────────┘
```

**Process:**
1. Customer places order
2. Shipment is created and assigned to handler
3. Handler delivers the order
4. Admin records payment to handler
5. System stores:
   - Payment amount
   - Payment date and method
   - Transaction reference
   - Payment status

---

## Database Schema Relationships

```
┌─────────────────┐
│    vendors      │
│  (id, name)     │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────┐
│   vendor_supplies       │
│  - vendor_id (FK)       │
│  - items (JSONB)        │◀─── Contains product details
│  - total_amount         │
│  - payment_status       │
│  - quality_check_status │
└─────────────────────────┘


┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     orders      │       │    shipments    │       │shipment_handlers│
│  (id, number)   │       │  (id, tracking) │       │  (id, name)     │
└────────┬────────┘       └────────┬────────┘       └────────┬────────┘
         │                         │                          │
         │                         │                          │
         │ 1:1                     │ N:1                      │ 1:N
         │                         │                          │
         └─────────────────────────┴──────────────────────────┘
                                   │
                                   │ All reference
                                   ▼
                          ┌─────────────────────┐
                          │  handler_payments   │
                          │  - order_id (FK)    │
                          │  - shipment_id (FK) │
                          │  - handler_id (FK)  │
                          │  - payment_amount   │
                          │  - payment_status   │
                          └─────────────────────┘
```

---

## API Structure

### Vendor Supplies API

```typescript
vendorSuppliesApi {
  // Read Operations
  getAll()                    // Get all supplies
  getById(id)                 // Get specific supply
  getByVendor(vendorId)       // Get supplies by vendor
  getByPaymentStatus(status)  // Filter by payment status
  getByQualityStatus(status)  // Filter by quality status
  
  // Write Operations
  create(supply)              // Add new supply
  update(id, updates)         // Update supply
  delete(id)                  // Remove supply
}
```

### Handler Payments API

```typescript
handlerPaymentsApi {
  // Read Operations
  getAll()                       // Get all payments
  getById(id)                    // Get specific payment
  getByHandler(handlerId)        // Get payments by handler
  getByShipment(shipmentId)      // Get payments by shipment
  getByPaymentStatus(status)     // Filter by status
  getWithDetails()               // Get with relations
  getTotalPaidToHandler(id)      // Calculate total paid
  getPendingPayments()           // Get pending only
  
  // Write Operations
  create(payment)                // Record payment
  update(id, updates)            // Update payment
  delete(id)                     // Remove payment
}
```

---

## Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                    ROW LEVEL SECURITY (RLS)                  │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐              ┌──────────────────────┐
│  vendor_supplies     │              │  handler_payments    │
│                      │              │                      │
│  RLS: ENABLED        │              │  RLS: ENABLED        │
│  Policy: Admin Only  │              │  Policy: Admin Only  │
└──────────────────────┘              └──────────────────────┘
           │                                     │
           │                                     │
           └─────────────┬───────────────────────┘
                         │
                         ▼
                ┌─────────────────┐
                │   is_admin()    │
                │    Function     │
                └─────────────────┘
                         │
                         ▼
                ┌─────────────────┐
                │    profiles     │
                │  role = 'admin' │
                └─────────────────┘

Access Control:
✅ Admin users: Full CRUD access
❌ Regular users: No access
❌ Anonymous users: No access
```

---

## Data Storage Details

### Vendor Supplies - Items Structure

```json
{
  "items": [
    {
      "product_id": "uuid",
      "product_name": "Ragi Flour",
      "variant_id": "uuid",
      "packaging_size": "1kg",
      "quantity": 100,
      "unit_cost": 117.60,
      "total_cost": 11760.00
    },
    {
      "product_id": "uuid",
      "product_name": "Barnyard Flakes",
      "variant_id": "uuid",
      "packaging_size": "5kg",
      "quantity": 50,
      "unit_cost": 588.00,
      "total_cost": 29400.00
    }
  ]
}
```

**Why JSONB?**
- Flexible structure for multiple products
- No need for separate line items table
- Easy to query and update
- Maintains product history even if product is deleted

---

## Performance Optimization

### Indexes Created

**vendor_supplies:**
```sql
idx_vendor_supplies_vendor          ON vendor_id
idx_vendor_supplies_date            ON supply_date
idx_vendor_supplies_payment_status  ON payment_status
idx_vendor_supplies_quality_status  ON quality_check_status
```

**handler_payments:**
```sql
idx_handler_payments_shipment       ON shipment_id
idx_handler_payments_handler        ON handler_id
idx_handler_payments_order          ON order_id
idx_handler_payments_status         ON payment_status
idx_handler_payments_date           ON payment_date
```

**Benefits:**
- Fast filtering by status
- Quick lookups by vendor/handler
- Efficient date-based queries
- Improved join performance

---

## Workflow Examples

### Complete Vendor Supply Workflow

```
1. Vendor Delivers
   ↓
2. Admin Opens: Dashboard → Supplies → Add Supply
   ↓
3. Fill Form:
   - Select vendor
   - Enter supply date
   - Add invoice number
   - Add product items
   - Set quality status: "pending"
   - Set payment status: "pending"
   ↓
4. Save Supply Record
   ↓
5. Perform Quality Check
   ↓
6. Update: quality_check_status = "passed"
   ↓
7. Make Payment to Vendor
   ↓
8. Update: payment_status = "paid", payment_date = today
   ↓
9. Complete ✓
```

### Complete Handler Payment Workflow

```
1. Order Placed by Customer
   ↓
2. Shipment Created
   ↓
3. Handler Assigned
   ↓
4. Handler Delivers Order
   ↓
5. Update Shipment: status = "delivered"
   ↓
6. Admin Records Payment:
   handlerPaymentsApi.create({
     shipment_id: "...",
     handler_id: "...",
     order_id: "...",
     payment_amount: 150.00,
     payment_method: "UPI",
     payment_status: "paid",
     transaction_reference: "TXN123"
   })
   ↓
7. Payment Recorded ✓
```

---

## Financial Tracking

### Key Metrics

**Vendor Supplies:**
- Total Supplies Count
- Total Supply Value
- Pending Payments Amount
- Quality Check Pass Rate

**Handler Payments:**
- Total Payments Made
- Pending Payments Count
- Total Paid per Handler
- Average Payment Amount

### Monthly Report Example

```typescript
// Get monthly data
const supplies = await vendorSuppliesApi.getAll();
const payments = await handlerPaymentsApi.getAll();

// Filter by current month
const thisMonth = new Date().getMonth();
const monthlySupplies = supplies.filter(s => 
  new Date(s.supply_date).getMonth() === thisMonth
);
const monthlyPayments = payments.filter(p => 
  p.payment_date && new Date(p.payment_date).getMonth() === thisMonth
);

// Calculate totals
const totalPurchases = monthlySupplies.reduce((sum, s) => 
  sum + Number(s.total_amount), 0
);
const totalHandlerPayments = monthlyPayments.reduce((sum, p) => 
  sum + Number(p.payment_amount), 0
);

// Get pending amounts
const pendingVendor = await vendorSuppliesApi.getByPaymentStatus('pending');
const pendingHandler = await handlerPaymentsApi.getPendingPayments();

console.log({
  purchases: totalPurchases,
  handlerPayments: totalHandlerPayments,
  owedToVendors: pendingVendor.reduce((s, v) => s + Number(v.total_amount), 0),
  owedToHandlers: pendingHandler.reduce((s, h) => s + Number(h.payment_amount), 0)
});
```

---

## Summary

### ✅ What's Implemented

1. **Vendor Supplies System**
   - Database table with JSONB items
   - Full CRUD API
   - Admin UI in Supplies tab
   - Payment and quality tracking

2. **Handler Payments System**
   - Database table with foreign keys
   - Full CRUD API
   - Payment tracking and reporting
   - Transaction reference storage

3. **Security**
   - RLS enabled on both tables
   - Admin-only access
   - Secure data storage

4. **Performance**
   - Optimized indexes
   - Efficient queries
   - Fast filtering

### 📚 Documentation

- `QUICK_REFERENCE.md` - Quick examples
- `INVENTORY_AND_PAYMENTS_GUIDE.md` - Complete guide
- `IMPLEMENTATION_SUMMARY.md` - Implementation details
- `ADMIN_FIXES.md` - Bug fixes and improvements
- `SYSTEM_OVERVIEW.md` - This file

### 🎯 Use Cases

**Vendor Supplies:**
- Track inventory purchases
- Manage vendor payments
- Quality control
- Invoice management

**Handler Payments:**
- Track delivery payments
- Handler payment history
- Financial reporting
- Transaction auditing
