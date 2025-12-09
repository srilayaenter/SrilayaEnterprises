# Order Management - Quick Reference Guide

## 🚀 Quick Start

### For Developers
```bash
# Ensure migrations are applied
# Check Supabase dashboard → Database → Migrations

# Run the application
npm run dev

# Run tests
npm run lint
```

### For Testers
1. Navigate to `/orders` page
2. Look for orders with "Cancel" button (< 30 min old)
3. Test cancellation flow
4. Click "Track Order" to see timeline
5. Admin: Go to `/admin/orders` to manage statuses

---

## 📋 Key Features at a Glance

### Order Cancellation
- **Time Window**: 30 minutes from order creation
- **Eligible Statuses**: pending, processing
- **Visual Timer**: Shows remaining time
- **Reason Field**: Optional text input

### Order Tracking
- **New Statuses**: processing, packed, shipped, out_for_delivery, delivered
- **Timeline View**: Visual progress indicator
- **Tracking Number**: Courier tracking support
- **Estimated Delivery**: Date display

### Order Modification
- **Modification Window**: Before order is packed
- **Auto-Lock**: Locks when status changes to packed/shipped
- **Audit Trail**: All changes logged

---

## 🔑 Important Database Functions

### Check if Order Can Be Cancelled
```sql
SELECT can_cancel_order('order-id-here');
-- Returns: boolean
```

### Cancel an Order
```sql
SELECT cancel_order(
  'order-id',
  'user-id',
  'Optional reason'
);
-- Returns: {"success": true/false, "message": "..."}
```

### Update Order Status (Admin Only)
```sql
SELECT update_order_status(
  'order-id',
  'new_status'::order_status,
  'admin-user-id',
  'Optional notes'
);
-- Returns: {"success": true/false, "message": "..."}
```

### Check if Order Can Be Modified
```sql
SELECT can_modify_order('order-id-here');
-- Returns: boolean
```

---

## 🎨 UI Components

### OrderStatusBadge
```tsx
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';

<OrderStatusBadge status={order.status} />
```

### OrderTimeline
```tsx
import OrderTimeline from '@/components/orders/OrderTimeline';

<OrderTimeline
  currentStatus={order.status}
  statusHistory={historyArray}
  trackingNumber={order.tracking_number}
  estimatedDelivery={order.estimated_delivery}
/>
```

### CancelOrderDialog
```tsx
import CancelOrderDialog from '@/components/orders/CancelOrderDialog';

<CancelOrderDialog
  open={dialogOpen}
  onOpenChange={setDialogOpen}
  onConfirm={handleCancel}
  orderNumber={order.id.slice(0, 8)}
/>
```

### CancellationTimer
```tsx
import CancellationTimer from '@/components/orders/CancellationTimer';

<CancellationTimer
  createdAt={order.created_at}
  onExpire={() => console.log('Time expired')}
/>
```

---

## 🔌 API Functions

### Frontend API Calls

```typescript
import { ordersApi } from '@/db/api';

// Check if order can be cancelled
const canCancel = await ordersApi.canCancelOrder(orderId);

// Cancel an order
const result = await ordersApi.cancelOrder(orderId, userId, reason);

// Check if order can be modified
const canModify = await ordersApi.canModifyOrder(orderId);

// Update order status (admin)
const result = await ordersApi.updateOrderStatus(
  orderId,
  newStatus,
  adminUserId,
  notes
);

// Get order status history
const history = await ordersApi.getOrderStatusHistory(orderId);

// Get order modifications
const mods = await ordersApi.getOrderModifications(orderId);

// Update tracking information
const order = await ordersApi.updateOrderTracking(
  orderId,
  trackingNumber,
  estimatedDelivery
);
```

---

## 📊 Database Schema Quick Reference

### Orders Table - New Columns
```sql
is_cancelled              boolean DEFAULT false
cancellation_requested_at timestamptz
cancellation_reason       text
estimated_delivery        timestamptz
tracking_number           text
actual_delivery_at        timestamptz
can_be_modified           boolean DEFAULT true
```

### order_status_history Table
```sql
id          uuid PRIMARY KEY
order_id    uuid REFERENCES orders(id)
old_status  order_status
new_status  order_status NOT NULL
changed_by  uuid REFERENCES auth.users(id)
notes       text
created_at  timestamptz DEFAULT now()
```

### order_modifications Table
```sql
id                 uuid PRIMARY KEY
order_id           uuid REFERENCES orders(id)
modified_by        uuid REFERENCES auth.users(id)
modification_type  text NOT NULL
old_value          jsonb
new_value          jsonb
notes              text
created_at         timestamptz DEFAULT now()
```

---

## 🎯 Order Status Flow

```
pending
  ↓
processing
  ↓
packed
  ↓
shipped
  ↓
out_for_delivery
  ↓
delivered
  ↓
completed

(cancelled/refunded can happen from any status)
```

---

## ⏱️ Cancellation Rules

| Condition | Can Cancel? |
|-----------|------------|
| Order age < 30 min + status = pending | ✅ Yes |
| Order age < 30 min + status = processing | ✅ Yes |
| Order age > 30 min | ❌ No |
| Status = packed/shipped/delivered | ❌ No |
| Already cancelled | ❌ No |
| User is admin | ✅ Yes (anytime) |

---

## 🔒 Modification Rules

| Order Status | Can Modify? |
|-------------|------------|
| pending | ✅ Yes |
| processing | ✅ Yes |
| packed | ❌ No |
| shipped | ❌ No |
| out_for_delivery | ❌ No |
| delivered | ❌ No |
| cancelled | ❌ No |

---

## 🐛 Common Issues & Solutions

### Issue: Cancel button not showing
**Solution**: Check order age and status
```javascript
// Debug in console
const orderTime = new Date(order.created_at).getTime();
const now = new Date().getTime();
const ageMinutes = (now - orderTime) / (1000 * 60);
console.log('Order age:', ageMinutes, 'minutes');
console.log('Order status:', order.status);
console.log('Can cancel:', ageMinutes <= 30 && ['pending', 'processing'].includes(order.status));
```

### Issue: Timer not counting down
**Solution**: Check if useEffect is running
```javascript
// Add to CancellationTimer component
useEffect(() => {
  console.log('Timer initialized for order:', createdAt);
  // ... rest of code
}, [createdAt]);
```

### Issue: Status not updating
**Solution**: Check user permissions
```sql
-- Verify user is admin
SELECT id, role FROM profiles WHERE id = 'user-id-here';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'orders';
```

### Issue: Timeline not showing history
**Solution**: Verify status history exists
```sql
SELECT * FROM order_status_history
WHERE order_id = 'order-id-here'
ORDER BY created_at DESC;
```

---

## 🧪 Quick Test Commands

### Test Cancellation Function
```sql
-- Create test order
INSERT INTO orders (user_id, items, total_amount, status, created_at)
VALUES (
  'test-user-id',
  '[{"name": "Test Product", "quantity": 1, "price": 100}]'::jsonb,
  100,
  'pending',
  NOW()
)
RETURNING id;

-- Test cancellation
SELECT cancel_order(
  'order-id-from-above',
  'test-user-id',
  'Testing cancellation'
);

-- Verify result
SELECT status, is_cancelled, cancellation_reason
FROM orders
WHERE id = 'order-id-from-above';
```

### Test Status Update
```sql
-- Update status
SELECT update_order_status(
  'order-id',
  'processing'::order_status,
  'admin-user-id',
  'Test status update'
);

-- Check history
SELECT * FROM order_status_history
WHERE order_id = 'order-id'
ORDER BY created_at DESC
LIMIT 1;
```

---

## 📱 Mobile Testing Checklist

- [ ] Cancel button tappable
- [ ] Timer displays correctly
- [ ] Dialog fits screen
- [ ] Timeline scrolls smoothly
- [ ] Status badges readable
- [ ] No horizontal scroll
- [ ] Touch targets adequate (44x44px minimum)

---

## 🔐 Security Checklist

- [ ] Users can only cancel their own orders
- [ ] Admin functions require admin role
- [ ] RLS policies enabled on all tables
- [ ] Input validation on all functions
- [ ] SQL injection protection verified
- [ ] XSS protection in place

---

## 📈 Performance Benchmarks

| Operation | Target Time | Actual |
|-----------|------------|--------|
| Page load (10 orders) | < 2s | ___ |
| Cancel order | < 500ms | ___ |
| Update status | < 500ms | ___ |
| Load timeline | < 300ms | ___ |
| Timer update | < 16ms | ___ |

---

## 🎨 Status Badge Colors Reference

```typescript
const statusColors = {
  pending: 'outline',        // Gray border
  processing: 'default',     // Blue
  packed: 'secondary',       // Gray
  shipped: 'default',        // Blue
  out_for_delivery: 'default', // Blue
  delivered: 'default',      // Blue
  completed: 'default',      // Blue
  cancelled: 'destructive',  // Red
  refunded: 'secondary'      // Gray
};
```

---

## 🔔 Notification Messages

### Success Messages
- "Order Cancelled" - Order successfully cancelled
- "Status updated" - Admin status update successful
- "Tracking Updated" - Tracking info added/updated

### Error Messages
- "Order cannot be cancelled. Time window expired or order already processed."
- "Unauthorized. Only admins can update order status."
- "Order not found"
- "Failed to cancel order"
- "Failed to update order status"

---

## 📞 Support Contacts

### For Technical Issues
- Database: Check Supabase logs
- Frontend: Check browser console
- API: Check Network tab in DevTools

### For Business Logic Questions
- Refer to: `ORDER_MANAGEMENT_SUMMARY.md`
- Testing: See `TESTING_GUIDE.md`

---

## 🔄 Deployment Checklist

Before deploying to production:

- [ ] All migrations applied
- [ ] Database functions tested
- [ ] Triggers verified active
- [ ] RLS policies enabled
- [ ] Frontend builds without errors
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Stakeholders notified

---

## 📚 Related Documentation

- **Full Documentation**: `ORDER_MANAGEMENT_SUMMARY.md`
- **Testing Guide**: `TESTING_GUIDE.md`
- **Implementation Plan**: `ORDER_MANAGEMENT_PLAN.md`
- **Completion Status**: `IMPLEMENTATION_COMPLETE.md`

---

## 💡 Tips & Best Practices

### For Frontend Development
1. Always check `can_be_modified` flag before showing edit options
2. Use `OrderStatusBadge` component for consistent styling
3. Handle loading states for all async operations
4. Show clear error messages to users

### For Backend Development
1. Always use parameterized queries
2. Log all status changes
3. Validate user permissions in functions
4. Return meaningful error messages

### For Testing
1. Test with real-world timing scenarios
2. Verify all edge cases
3. Check database state after operations
4. Test on multiple devices/browsers

---

**Last Updated**: 2025-01-26  
**Version**: 1.0  
**Status**: Production Ready
