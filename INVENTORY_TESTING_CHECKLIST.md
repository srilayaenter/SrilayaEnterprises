# Inventory Management System - Testing Checklist

## Pre-Testing Setup

### 1. Database Migration
- [ ] Run migration `00068_inventory_management_system.sql`
- [ ] Run migration `00069_integrate_stock_reservation_with_orders.sql`
- [ ] Verify all tables created successfully
- [ ] Verify all functions created successfully
- [ ] Verify all triggers are active

```sql
-- Verify tables
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('stock_movements', 'inventory_alerts');

-- Verify functions
SELECT routine_name FROM information_schema.routines 
WHERE routine_name LIKE '%stock%' OR routine_name LIKE '%inventory%';

-- Verify triggers
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name LIKE '%stock%' OR trigger_name LIKE '%expiry%';
```

### 2. Test Data Setup
- [ ] Create test products with various stock levels
- [ ] Set min_stock_threshold for test products
- [ ] Set expiry dates for some products
- [ ] Create test user account

```sql
-- Create test product
INSERT INTO products (name, category, base_price, stock, min_stock_threshold, expiry_date)
VALUES 
  ('Test Millet 1kg', 'millets', 100, 50, 10, CURRENT_DATE + INTERVAL '20 days'),
  ('Test Rice 1kg', 'rice', 80, 5, 10, NULL),
  ('Test Honey 500g', 'honey', 200, 100, 20, CURRENT_DATE + INTERVAL '60 days');
```

## Functional Testing

### Test 1: Stock Reservation on Order Creation ✅

**Objective**: Verify stock is reserved when order is placed

**Steps**:
1. Note initial stock and reserved_stock for a product
2. Create an order with that product
3. Verify reserved_stock increased by order quantity
4. Verify available stock decreased
5. Verify stock_movements record created

**Expected Results**:
- `reserved_stock` = initial_reserved + order_quantity
- `available_stock` = stock - reserved_stock
- Stock movement record with type 'reserve' exists

**SQL Test**:
```sql
-- Before order
SELECT id, name, stock, reserved_stock, (stock - reserved_stock) as available 
FROM products WHERE name = 'Test Millet 1kg';

-- Create order (replace UUIDs with actual values)
SELECT create_order(
  NULL, -- user_id (can be null for guest)
  '[{"product_id": "PRODUCT_UUID", "quantity": 5, "name": "Test Millet 1kg", "price": 100}]'::jsonb,
  500, 0.18, 90, 0, 0, 'INR', 'pending', 'online', 'stripe', '{}'::jsonb,
  'Test Customer', 'test@example.com', '1234567890', NULL
);

-- After order
SELECT id, name, stock, reserved_stock, (stock - reserved_stock) as available 
FROM products WHERE name = 'Test Millet 1kg';

-- Check movement
SELECT * FROM stock_movements 
WHERE product_id = 'PRODUCT_UUID' 
ORDER BY created_at DESC LIMIT 1;
```

**Pass Criteria**: ✅ Reserved stock increased, movement logged

---

### Test 2: Overselling Prevention ✅

**Objective**: Verify system prevents orders when stock is insufficient

**Steps**:
1. Find product with low available stock
2. Try to create order with quantity > available stock
3. Verify order creation fails with appropriate error

**Expected Results**:
- Order creation fails
- Error message indicates insufficient stock
- No stock changes occur

**SQL Test**:
```sql
-- Try to order more than available
SELECT create_order(
  NULL,
  '[{"product_id": "PRODUCT_UUID", "quantity": 1000, "name": "Test Product", "price": 100}]'::jsonb,
  100000, 0.18, 18000, 0, 0, 'INR', 'pending', 'online', 'stripe', '{}'::jsonb,
  'Test Customer', 'test@example.com', '1234567890', NULL
);
-- Should fail with error
```

**Pass Criteria**: ✅ Order rejected, error message clear

---

### Test 3: Stock Release on Cancellation ✅

**Objective**: Verify reserved stock is released when order is cancelled

**Steps**:
1. Create an order (stock gets reserved)
2. Note reserved_stock value
3. Cancel the order
4. Verify reserved_stock decreased
5. Verify stock_movements record created

**Expected Results**:
- `reserved_stock` decreased by order quantity
- `available_stock` increased
- Stock movement record with type 'release' exists
- Total stock unchanged

**SQL Test**:
```sql
-- Before cancellation
SELECT id, name, stock, reserved_stock FROM products WHERE id = 'PRODUCT_UUID';

-- Cancel order
UPDATE orders SET status = 'cancelled' WHERE id = 'ORDER_UUID';

-- After cancellation
SELECT id, name, stock, reserved_stock FROM products WHERE id = 'PRODUCT_UUID';

-- Check movement
SELECT * FROM stock_movements 
WHERE order_id = 'ORDER_UUID' AND movement_type = 'release';
```

**Pass Criteria**: ✅ Reserved stock released, total stock unchanged

---

### Test 4: Stock Finalization on Delivery ✅

**Objective**: Verify stock is reduced when order is delivered

**Steps**:
1. Create an order (stock gets reserved)
2. Note stock and reserved_stock values
3. Mark order as delivered
4. Verify both stock and reserved_stock decreased
5. Verify stock_movements record created

**Expected Results**:
- `stock` decreased by order quantity
- `reserved_stock` decreased by order quantity
- `available_stock` unchanged (stock - reserved both decreased)
- Stock movement record with type 'finalize' exists

**SQL Test**:
```sql
-- Before delivery
SELECT id, name, stock, reserved_stock, (stock - reserved_stock) as available 
FROM products WHERE id = 'PRODUCT_UUID';

-- Mark as delivered
UPDATE orders SET status = 'delivered' WHERE id = 'ORDER_UUID';

-- After delivery
SELECT id, name, stock, reserved_stock, (stock - reserved_stock) as available 
FROM products WHERE id = 'PRODUCT_UUID';

-- Check movement
SELECT * FROM stock_movements 
WHERE order_id = 'ORDER_UUID' AND movement_type = 'finalize';
```

**Pass Criteria**: ✅ Both stock and reserved reduced, movement logged

---

### Test 5: Stock Restoration on Refund ✅

**Objective**: Verify stock is restored when order is refunded

**Steps**:
1. Create and deliver an order (stock reduced)
2. Note stock value
3. Refund the order
4. Verify stock increased back
5. Verify stock_movements record created

**Expected Results**:
- `stock` increased by order quantity
- Stock movement record with type 'adjustment' exists
- Available stock increased

**SQL Test**:
```sql
-- Before refund
SELECT id, name, stock, reserved_stock FROM products WHERE id = 'PRODUCT_UUID';

-- Refund order
UPDATE orders SET status = 'refunded' WHERE id = 'ORDER_UUID';

-- After refund
SELECT id, name, stock, reserved_stock FROM products WHERE id = 'PRODUCT_UUID';

-- Check movement
SELECT * FROM stock_movements 
WHERE order_id = 'ORDER_UUID' AND movement_type = 'adjustment';
```

**Pass Criteria**: ✅ Stock restored, movement logged

---

### Test 6: Low Stock Alert Creation ✅

**Objective**: Verify alerts are created when stock falls below threshold

**Steps**:
1. Set min_stock_threshold = 10 for a product
2. Reduce available stock below threshold
3. Verify alert is created
4. Check alert severity

**Expected Results**:
- Alert created with type 'low_stock'
- Severity appropriate to stock level
- Admin notification created

**SQL Test**:
```sql
-- Set threshold
UPDATE products SET min_stock_threshold = 10 WHERE id = 'PRODUCT_UUID';

-- Reduce stock
UPDATE products SET stock = 8 WHERE id = 'PRODUCT_UUID';

-- Check alert
SELECT * FROM inventory_alerts 
WHERE product_id = 'PRODUCT_UUID' 
AND alert_type = 'low_stock' 
AND is_resolved = false;

-- Check notification
SELECT * FROM notifications 
WHERE type = 'inventory' 
ORDER BY created_at DESC LIMIT 1;
```

**Pass Criteria**: ✅ Alert created, notification sent

---

### Test 7: Out of Stock Alert ✅

**Objective**: Verify critical alert when stock is completely unavailable

**Steps**:
1. Reserve all available stock
2. Verify out_of_stock alert is created
3. Check alert severity is 'critical'

**Expected Results**:
- Alert created with type 'out_of_stock'
- Severity is 'critical'
- Available stock = 0

**SQL Test**:
```sql
-- Create order that reserves all stock
-- (Adjust quantity to match available stock)

-- Check alert
SELECT * FROM inventory_alerts 
WHERE product_id = 'PRODUCT_UUID' 
AND alert_type = 'out_of_stock' 
AND severity = 'critical';
```

**Pass Criteria**: ✅ Critical alert created

---

### Test 8: Expiring Product Alert ✅

**Objective**: Verify alerts for products approaching expiry

**Steps**:
1. Set expiry_date within 30 days
2. Trigger expiry check
3. Verify alert is created
4. Check alert severity based on days remaining

**Expected Results**:
- Alert created with type 'expiring'
- Severity based on days until expiry:
  - ≤7 days: high
  - ≤14 days: medium
  - ≤30 days: low

**SQL Test**:
```sql
-- Set expiry date
UPDATE products 
SET expiry_date = CURRENT_DATE + INTERVAL '10 days' 
WHERE id = 'PRODUCT_UUID';

-- Check expiring products
SELECT * FROM check_expiring_products(30);

-- Check alert
SELECT * FROM inventory_alerts 
WHERE product_id = 'PRODUCT_UUID' 
AND alert_type = 'expiring';
```

**Pass Criteria**: ✅ Alert created with correct severity

---

### Test 9: Expired Product Alert ✅

**Objective**: Verify alerts for expired products

**Steps**:
1. Set expiry_date in the past
2. Trigger expiry check
3. Verify critical alert is created

**Expected Results**:
- Alert created with type 'expired'
- Severity is 'critical'

**SQL Test**:
```sql
-- Set expired date
UPDATE products 
SET expiry_date = CURRENT_DATE - INTERVAL '5 days' 
WHERE id = 'PRODUCT_UUID';

-- Check expired products
SELECT * FROM check_expired_products();

-- Check alert
SELECT * FROM inventory_alerts 
WHERE product_id = 'PRODUCT_UUID' 
AND alert_type = 'expired' 
AND severity = 'critical';
```

**Pass Criteria**: ✅ Critical alert created

---

### Test 10: Alert Resolution ✅

**Objective**: Verify admins can resolve alerts

**Steps**:
1. Create an alert
2. Resolve it as admin
3. Verify alert is marked resolved
4. Verify resolved_at and resolved_by are set

**Expected Results**:
- `is_resolved` = true
- `resolved_at` timestamp set
- `resolved_by` = admin user ID

**SQL Test**:
```sql
-- Resolve alert (replace with actual admin user ID)
SELECT resolve_inventory_alert('ALERT_UUID', 'ADMIN_USER_UUID');

-- Check alert
SELECT * FROM inventory_alerts WHERE id = 'ALERT_UUID';
```

**Pass Criteria**: ✅ Alert marked resolved with timestamp and user

---

### Test 11: Concurrent Order Handling ✅

**Objective**: Verify system handles concurrent orders correctly

**Steps**:
1. Set product stock to 10
2. Simulate 3 concurrent orders of 5 units each
3. Verify only 2 orders succeed
4. Verify third order fails with insufficient stock error

**Expected Results**:
- First 2 orders succeed
- Third order fails
- No overselling occurs
- Reserved stock = 10

**Note**: This test requires concurrent execution, best done with a script

**Pass Criteria**: ✅ No overselling, proper error handling

---

### Test 12: Stock Movement Audit Trail ✅

**Objective**: Verify all stock changes are logged

**Steps**:
1. Perform various stock operations
2. Query stock_movements table
3. Verify all operations are logged
4. Check data completeness

**Expected Results**:
- Every stock change has a movement record
- Previous and new values are correct
- Movement type is appropriate
- User attribution is correct

**SQL Test**:
```sql
-- Get all movements for a product
SELECT 
  movement_type,
  quantity,
  previous_stock,
  new_stock,
  previous_reserved,
  new_reserved,
  notes,
  created_at
FROM stock_movements
WHERE product_id = 'PRODUCT_UUID'
ORDER BY created_at DESC;
```

**Pass Criteria**: ✅ Complete audit trail exists

---

## UI Testing

### Test 13: Inventory Dashboard Display ✅

**Objective**: Verify inventory dashboard shows correct data

**Steps**:
1. Navigate to `/admin/inventory-dashboard`
2. Verify summary cards show correct counts
3. Check each tab displays appropriate data
4. Verify alerts are displayed

**Expected Results**:
- All summary cards show accurate counts
- Tabs switch correctly
- Alerts are visible and actionable
- Data refreshes properly

**Pass Criteria**: ✅ Dashboard displays correctly

---

### Test 14: Low Stock Alert Component ✅

**Objective**: Verify low stock alert component works

**Steps**:
1. Create products with low stock
2. View inventory dashboard
3. Check Low Stock tab
4. Verify products are listed
5. Click on a product

**Expected Results**:
- Low stock products are displayed
- Color coding is correct
- Available stock shown
- Click navigation works

**Pass Criteria**: ✅ Component displays and functions correctly

---

### Test 15: Expiring Products Alert Component ✅

**Objective**: Verify expiring products alert component works

**Steps**:
1. Create products with expiry dates
2. View inventory dashboard
3. Check Expiring Products tab
4. Verify products are listed with correct urgency

**Expected Results**:
- Expiring products displayed
- Color coding by urgency
- Days until expiry shown
- Expiry dates formatted correctly

**Pass Criteria**: ✅ Component displays correctly

---

### Test 16: Alert Resolution UI ✅

**Objective**: Verify admins can resolve alerts from UI

**Steps**:
1. View All Alerts tab
2. Click resolve button on an alert
3. Verify alert disappears
4. Check database for resolution

**Expected Results**:
- Alert removed from list
- Success toast shown
- Database updated correctly

**Pass Criteria**: ✅ Alert resolution works

---

## Integration Testing

### Test 17: End-to-End Order Flow ✅

**Objective**: Verify complete order lifecycle with stock management

**Steps**:
1. Customer places order
2. Stock is reserved
3. Order is processed
4. Order is delivered
5. Stock is finalized

**Expected Results**:
- Stock reserved on order creation
- Stock finalized on delivery
- All movements logged
- Alerts triggered if needed

**Pass Criteria**: ✅ Complete flow works correctly

---

### Test 18: Product Management Integration ✅

**Objective**: Verify product management includes new fields

**Steps**:
1. Navigate to Product Management
2. Create new product
3. Verify new fields are present
4. Update stock threshold and expiry date
5. Save and verify

**Expected Results**:
- New fields visible in form
- Default values set correctly
- Updates save successfully
- Validation works

**Pass Criteria**: ✅ Product management updated

---

## Performance Testing

### Test 19: Large Order Performance ✅

**Objective**: Verify system handles orders with many items

**Steps**:
1. Create order with 50+ items
2. Measure execution time
3. Verify all stock reservations complete
4. Check for timeouts or errors

**Expected Results**:
- Order completes in reasonable time (<5 seconds)
- All items reserved correctly
- No errors or timeouts

**Pass Criteria**: ✅ Performs well with large orders

---

### Test 20: High Volume Alert Generation ✅

**Objective**: Verify system handles many alerts

**Steps**:
1. Create 100+ products with low stock
2. Trigger alert generation
3. Verify all alerts created
4. Check dashboard performance

**Expected Results**:
- All alerts created
- Dashboard loads quickly
- No performance degradation

**Pass Criteria**: ✅ Handles high alert volume

---

## Security Testing

### Test 21: RLS Policy Verification ✅

**Objective**: Verify Row Level Security policies work

**Steps**:
1. Try to access stock_movements as non-admin
2. Try to resolve alerts as non-admin
3. Verify appropriate access control

**Expected Results**:
- Non-admins can only see their order movements
- Only admins can resolve alerts
- Policies enforce correctly

**Pass Criteria**: ✅ RLS policies work correctly

---

### Test 22: Function Security ✅

**Objective**: Verify function permissions are correct

**Steps**:
1. Test function execution as different user roles
2. Verify SECURITY DEFINER functions work
3. Check for unauthorized access

**Expected Results**:
- Functions execute with correct permissions
- No unauthorized access possible
- Security maintained

**Pass Criteria**: ✅ Function security correct

---

## Summary

### Test Results

- [ ] All functional tests passed
- [ ] All UI tests passed
- [ ] All integration tests passed
- [ ] All performance tests passed
- [ ] All security tests passed

### Issues Found

| Test # | Issue Description | Severity | Status |
|--------|------------------|----------|--------|
|        |                  |          |        |

### Sign-off

- [ ] Database migrations verified
- [ ] All tests completed
- [ ] Documentation reviewed
- [ ] Ready for production

**Tested By**: _______________  
**Date**: _______________  
**Approved By**: _______________  
**Date**: _______________

---

**Note**: This checklist should be completed before deploying the inventory management system to production.
