# Quick Reference Guide

## 📦 Vendor Supplies - Product Tracking

### What It Does
Stores detailed information about products received from vendors, including quantities, costs, quality checks, and payment status.

### Where to Access
**Admin Dashboard → Supplies Tab**

### Quick Example
```typescript
import { vendorSuppliesApi } from '@/db/api';

// Add a new supply
await vendorSuppliesApi.create({
  vendor_id: 'vendor-uuid',
  supply_date: '2025-01-15',
  invoice_number: 'INV-001',
  items: [
    {
      product_id: 'prod-uuid',
      product_name: 'Ragi Flour',
      variant_id: 'var-uuid',
      packaging_size: '1kg',
      quantity: 100,
      unit_cost: 117.60,
      total_cost: 11760.00
    }
  ],
  total_amount: 11760.00,
  payment_status: 'pending',
  quality_check_status: 'pending'
});
```

### Key Features
- ✅ Track products from vendors
- ✅ Store quantities and costs
- ✅ Quality check management
- ✅ Payment status tracking
- ✅ Invoice management

---

## 💰 Handler Payments - Delivery Payment Tracking

### What It Does
Tracks all payments made to shipment handlers for their delivery services.

### Where to Access
**Via API** (no UI page yet - can be added if needed)

### Quick Example
```typescript
import { handlerPaymentsApi } from '@/db/api';

// Record a payment
await handlerPaymentsApi.create({
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

// Get handler's total payments
const total = await handlerPaymentsApi.getTotalPaidToHandler(handlerId);
```

### Key Features
- ✅ Track handler payments
- ✅ Record payment methods
- ✅ Store transaction references
- ✅ Calculate total paid per handler
- ✅ Track pending payments

---

## 🔧 Common Operations

### Get Pending Vendor Payments
```typescript
const pending = await vendorSuppliesApi.getByPaymentStatus('pending');
const totalOwed = pending.reduce((sum, s) => sum + Number(s.total_amount), 0);
console.log(`Owed to vendors: ₹${totalOwed}`);
```

### Get Pending Handler Payments
```typescript
const pending = await handlerPaymentsApi.getPendingPayments();
const totalOwed = pending.reduce((sum, p) => sum + Number(p.payment_amount), 0);
console.log(`Owed to handlers: ₹${totalOwed}`);
```

### Mark Payment as Paid
```typescript
// Vendor payment
await vendorSuppliesApi.update(supplyId, {
  payment_status: 'paid',
  payment_date: '2025-01-15'
});

// Handler payment
await handlerPaymentsApi.update(paymentId, {
  payment_status: 'paid',
  payment_date: '2025-01-15',
  transaction_reference: 'TXN123'
});
```

### Get Payment History
```typescript
// Vendor supplies by vendor
const supplies = await vendorSuppliesApi.getByVendor(vendorId);

// Handler payments by handler
const payments = await handlerPaymentsApi.getByHandler(handlerId);
```

---

## 📊 Financial Reports

### Monthly Vendor Purchases
```typescript
const supplies = await vendorSuppliesApi.getAll();
const thisMonth = supplies.filter(s => 
  new Date(s.supply_date).getMonth() === new Date().getMonth()
);
const total = thisMonth.reduce((sum, s) => sum + Number(s.total_amount), 0);
```

### Monthly Handler Payments
```typescript
const payments = await handlerPaymentsApi.getAll();
const thisMonth = payments.filter(p => 
  p.payment_date && new Date(p.payment_date).getMonth() === new Date().getMonth()
);
const total = thisMonth.reduce((sum, p) => sum + Number(p.payment_amount), 0);
```

---

## 📚 Documentation Files

| File | Description |
|------|-------------|
| `QUICK_REFERENCE.md` | This file - quick examples |
| `INVENTORY_AND_PAYMENTS_GUIDE.md` | Complete guide with detailed examples |
| `IMPLEMENTATION_SUMMARY.md` | What was implemented and how |
| `ADMIN_FIXES.md` | Admin dashboard fixes and inventory calculation |

---

## 🔐 Security

Both systems are **admin-only**:
- Row Level Security (RLS) enabled
- Only authenticated admin users can access
- No public access to financial data

---

## ✅ Status

| Component | Status | Location |
|-----------|--------|----------|
| Vendor Supplies Table | ✅ Created | Database |
| Handler Payments Table | ✅ Created | Database |
| Vendor Supplies API | ✅ Implemented | `@/db/api.ts` |
| Handler Payments API | ✅ Implemented | `@/db/api.ts` |
| Vendor Supplies UI | ✅ Implemented | Admin Dashboard → Supplies |
| Handler Payments UI | ⚠️ API Only | Can be added if needed |
| TypeScript Types | ✅ Defined | `@/types/types.ts` |
| Database Indexes | ✅ Created | For performance |
| RLS Policies | ✅ Enabled | Admin-only access |

---

## 🚀 Next Steps (Optional)

### If you want a UI for Handler Payments:
1. Create a new page: `src/pages/admin/HandlerPayments.tsx`
2. Add a tab in Admin Dashboard
3. Create a dialog component for adding/editing payments
4. Add filters and search functionality

### If you want automated workflows:
1. Auto-create handler payment when shipment is delivered
2. Send email reminders for pending payments
3. Generate monthly payment reports
4. Add payment approval workflow

---

## 💡 Tips

1. **Always use the API functions** - Don't query Supabase directly
2. **Check payment status** - Use filters to find pending payments
3. **Track transaction references** - Store bank transaction IDs for audit trail
4. **Add notes** - Use the notes field for important information
5. **Regular reconciliation** - Compare database records with bank statements

---

## 🆘 Need Help?

1. Check `INVENTORY_AND_PAYMENTS_GUIDE.md` for detailed examples
2. Review the API function signatures in `@/db/api.ts`
3. Look at the database schema in the migration files
4. Test API functions in your development environment
