# Order Management Enhancements - Comprehensive Testing Guide

## Overview
This document provides detailed testing procedures for all order management enhancements including order cancellation, modification, and tracking features.

---

## Table of Contents
1. [Testing Environment Setup](#testing-environment-setup)
2. [Order Cancellation Testing](#order-cancellation-testing)
3. [Order Modification Testing](#order-modification-testing)
4. [Order Tracking Testing](#order-tracking-testing)
5. [Admin Interface Testing](#admin-interface-testing)
6. [Database Function Testing](#database-function-testing)
7. [Security Testing](#security-testing)
8. [Performance Testing](#performance-testing)
9. [Edge Cases & Error Handling](#edge-cases--error-handling)
10. [User Experience Testing](#user-experience-testing)

---

## Testing Environment Setup

### Prerequisites
- [ ] Application running locally or on staging server
- [ ] Database migrations applied successfully
- [ ] Test user accounts created (regular user and admin)
- [ ] Browser developer tools open for console monitoring
- [ ] Network tab open to monitor API calls

### Test Accounts Required
1. **Regular User Account**
   - Email: testuser@example.com
   - Role: user
   
2. **Admin Account**
   - Email: admin@example.com
   - Role: admin

3. **Guest User** (no login)
   - For testing guest checkout orders

### Test Data Setup
```sql
-- Create test orders with different statuses
-- Run these in Supabase SQL Editor

-- Order 1: Recent order (for cancellation testing)
INSERT INTO orders (user_id, items, total_amount, status, created_at)
VALUES (
  'user-id-here',
  '[{"name": "Foxtail Millet", "quantity": 2, "price": 150, "packaging_size": "1kg"}]'::jsonb,
  300,
  'pending',
  NOW()
);

-- Order 2: Old order (for cancellation timeout testing)
INSERT INTO orders (user_id, items, total_amount, status, created_at)
VALUES (
  'user-id-here',
  '[{"name": "Brown Rice", "quantity": 1, "price": 200, "packaging_size": "2kg"}]'::jsonb,
  200,
  'pending',
  NOW() - INTERVAL '45 minutes'
);

-- Order 3: Processing order
INSERT INTO orders (user_id, items, total_amount, status, created_at)
VALUES (
  'user-id-here',
  '[{"name": "Organic Honey", "quantity": 1, "price": 350, "packaging_size": "500g"}]'::jsonb,
  350,
  'processing',
  NOW() - INTERVAL '10 minutes'
);

-- Order 4: Shipped order (cannot be cancelled)
INSERT INTO orders (user_id, items, total_amount, status, created_at)
VALUES (
  'user-id-here',
  '[{"name": "Ragi Flour", "quantity": 3, "price": 120, "packaging_size": "1kg"}]'::jsonb,
  360,
  'shipped',
  NOW() - INTERVAL '2 days'
);
```

---

## Order Cancellation Testing

### Test Case 1: Successful Cancellation Within Time Window
**Objective**: Verify that users can cancel orders within 30 minutes

**Steps**:
1. Log in as regular user
2. Navigate to Orders page (`/orders`)
3. Locate an order created less than 30 minutes ago
4. Verify "Cancel" button is visible
5. Verify cancellation timer is displayed showing remaining time
6. Click "Cancel" button
7. Verify cancellation dialog appears
8. Enter cancellation reason: "Changed my mind"
9. Click "Cancel Order" button

**Expected Results**:
- ✅ Cancel button is visible and enabled
- ✅ Timer shows correct remaining time (format: MM:SS)
- ✅ Dialog opens with reason field
- ✅ Success toast appears: "Order Cancelled"
- ✅ Order status changes to "Cancelled"
- ✅ Cancel button disappears
- ✅ Order badge shows "Cancelled" status
- ✅ Notification created in database

**SQL Verification**:
```sql
-- Check order status
SELECT id, status, is_cancelled, cancellation_reason, cancellation_requested_at
FROM orders
WHERE id = 'order-id-here';

-- Check status history
SELECT * FROM order_status_history
WHERE order_id = 'order-id-here'
ORDER BY created_at DESC;

-- Check notification
SELECT * FROM notifications
WHERE related_id = 'order-id-here'
ORDER BY created_at DESC;
```

---

### Test Case 2: Cancellation After Time Window Expires
**Objective**: Verify that cancellation is blocked after 30 minutes

**Steps**:
1. Log in as regular user
2. Navigate to Orders page
3. Locate an order created more than 30 minutes ago
4. Verify "Cancel" button is NOT visible
5. Verify no cancellation timer is displayed

**Expected Results**:
- ✅ Cancel button is hidden
- ✅ No timer displayed
- ✅ Order shows current status (pending/processing)
- ✅ Only "Track Order" and "Print" buttons visible

---

### Test Case 3: Cancellation Timer Countdown
**Objective**: Verify timer counts down correctly and updates in real-time

**Steps**:
1. Create a new order (or use one created 25 minutes ago)
2. Navigate to Orders page
3. Observe the cancellation timer

**Expected Results**:
- ✅ Timer displays in MM:SS format
- ✅ Timer counts down every second
- ✅ Timer turns red when less than 5 minutes remain
- ✅ Timer disappears when it reaches 00:00
- ✅ Cancel button disappears when timer expires
- ✅ Page refreshes automatically when timer expires

---

### Test Case 4: Cancellation with Empty Reason
**Objective**: Verify cancellation works without providing a reason

**Steps**:
1. Click "Cancel" button on eligible order
2. Leave reason field empty
3. Click "Cancel Order"

**Expected Results**:
- ✅ Cancellation succeeds
- ✅ Success message appears
- ✅ Order status updated to cancelled
- ✅ `cancellation_reason` field is NULL in database

---

### Test Case 5: Cancel Button for Different Order Statuses
**Objective**: Verify cancel button only appears for eligible statuses

**Test Matrix**:
| Order Status | Age | Cancel Button Visible? |
|-------------|-----|----------------------|
| pending | < 30 min | ✅ Yes |
| pending | > 30 min | ❌ No |
| processing | < 30 min | ✅ Yes |
| processing | > 30 min | ❌ No |
| packed | < 30 min | ❌ No |
| shipped | < 30 min | ❌ No |
| out_for_delivery | < 30 min | ❌ No |
| delivered | < 30 min | ❌ No |
| completed | < 30 min | ❌ No |
| cancelled | any | ❌ No |

---

### Test Case 6: Unauthorized Cancellation Attempt
**Objective**: Verify users cannot cancel other users' orders

**Steps**:
1. Log in as User A
2. Note an order ID from User A's orders
3. Log out and log in as User B
4. Attempt to cancel User A's order via API:
```javascript
// In browser console
await ordersApi.cancelOrder('user-a-order-id', 'user-b-id', 'Test');
```

**Expected Results**:
- ✅ API returns error: "Unauthorized"
- ✅ Order status remains unchanged
- ✅ Error toast appears

---

## Order Modification Testing

### Test Case 7: Check Modification Eligibility
**Objective**: Verify `can_be_modified` flag is set correctly

**Steps**:
1. Create orders with different statuses
2. Check `can_be_modified` flag for each

**Expected Results**:
| Order Status | can_be_modified |
|-------------|----------------|
| pending | ✅ true |
| processing | ✅ true |
| packed | ❌ false |
| shipped | ❌ false |
| out_for_delivery | ❌ false |
| delivered | ❌ false |
| cancelled | ❌ false |

**SQL Verification**:
```sql
SELECT id, status, can_be_modified
FROM orders
ORDER BY created_at DESC;
```

---

### Test Case 8: Modification Flag Auto-Update
**Objective**: Verify flag updates automatically when status changes

**Steps**:
1. Create order with status 'pending' (can_be_modified = true)
2. Update status to 'packed' via admin interface
3. Check `can_be_modified` flag

**Expected Results**:
- ✅ Flag automatically changes to false
- ✅ No manual intervention needed

**SQL Test**:
```sql
-- Create test order
INSERT INTO orders (user_id, items, total_amount, status, can_be_modified)
VALUES ('test-user-id', '[]'::jsonb, 100, 'pending', true)
RETURNING id;

-- Update status
UPDATE orders SET status = 'packed' WHERE id = 'order-id';

-- Verify flag
SELECT status, can_be_modified FROM orders WHERE id = 'order-id';
-- Expected: status = 'packed', can_be_modified = false
```

---

## Order Tracking Testing

### Test Case 9: Order Timeline Display
**Objective**: Verify timeline shows correct order progress

**Steps**:
1. Log in as regular user
2. Navigate to Orders page
3. Click "Track Order" button on any order
4. Verify timeline dialog opens

**Expected Results**:
- ✅ Dialog opens with "Order Tracking" title
- ✅ Two tabs visible: "Timeline" and "Details"
- ✅ Timeline tab shows visual progress
- ✅ Current status is highlighted
- ✅ Completed steps show checkmarks
- ✅ Future steps are grayed out
- ✅ Timestamps shown for completed steps

---

### Test Case 10: Status History Accuracy
**Objective**: Verify all status changes are recorded

**Steps**:
1. Create new order (status: pending)
2. Admin updates to 'processing'
3. Admin updates to 'packed'
4. Admin updates to 'shipped'
5. Check status history

**Expected Results**:
- ✅ 4 entries in order_status_history
- ✅ Entry 1: NULL → pending (order creation)
- ✅ Entry 2: pending → processing
- ✅ Entry 3: processing → packed
- ✅ Entry 4: packed → shipped
- ✅ All entries have timestamps
- ✅ changed_by field populated for admin changes

**SQL Verification**:
```sql
SELECT 
  old_status,
  new_status,
  changed_by,
  notes,
  created_at
FROM order_status_history
WHERE order_id = 'order-id-here'
ORDER BY created_at ASC;
```

---

### Test Case 11: Tracking Number Display
**Objective**: Verify tracking number appears correctly

**Steps**:
1. Admin adds tracking number to shipped order
2. Customer views order timeline
3. Verify tracking number is displayed

**Expected Results**:
- ✅ Tracking number shown in timeline
- ✅ Formatted as monospace font
- ✅ Displayed prominently at top of timeline
- ✅ Visible in both Timeline and Details tabs

---

### Test Case 12: Estimated Delivery Date
**Objective**: Verify estimated delivery date is shown

**Steps**:
1. Admin sets estimated delivery date
2. Customer views order timeline
3. Verify date is displayed

**Expected Results**:
- ✅ Date shown in readable format (e.g., "January 15, 2025")
- ✅ Displayed next to tracking number
- ✅ Updates when admin changes it

---

### Test Case 13: Order Status Badge Colors
**Objective**: Verify status badges have correct colors and icons

**Test Matrix**:
| Status | Badge Color | Icon |
|--------|------------|------|
| pending | Outline (gray) | Clock |
| processing | Primary (blue) | Package |
| packed | Secondary (gray) | PackageCheck |
| shipped | Primary (blue) | Truck |
| out_for_delivery | Primary (blue) | Navigation |
| delivered | Primary (blue) | CheckCircle |
| completed | Primary (blue) | CheckCircle |
| cancelled | Destructive (red) | XCircle |
| refunded | Secondary (gray) | DollarSign |

---

## Admin Interface Testing

### Test Case 14: Admin Status Update
**Objective**: Verify admin can update order status

**Steps**:
1. Log in as admin
2. Navigate to Admin Dashboard → Orders Management
3. Locate an order with status 'pending'
4. Click on status badge
5. Dialog opens with status dropdown
6. Select 'processing'
7. Add note: "Payment verified, preparing order"
8. Click "Update Status"

**Expected Results**:
- ✅ Dialog opens on badge click
- ✅ All status options available in dropdown
- ✅ Notes field is optional
- ✅ Success toast appears
- ✅ Order status updates immediately
- ✅ Badge color changes
- ✅ Status history entry created with note

---

### Test Case 15: Admin Tracking Number Update
**Objective**: Verify admin can add/update tracking numbers

**Steps**:
1. Log in as admin
2. Navigate to order with status 'shipped'
3. Click "Add Tracking" button (or similar)
4. Enter tracking number: "TRK123456789"
5. Enter estimated delivery: "2025-01-20"
6. Click "Update"

**Expected Results**:
- ✅ Tracking number saved
- ✅ Estimated delivery saved
- ✅ Success message appears
- ✅ Customer can see tracking info immediately

---

### Test Case 16: Admin Cannot Be Blocked by Time Window
**Objective**: Verify admin can cancel orders anytime

**Steps**:
1. Log in as admin
2. Locate order created > 30 minutes ago
3. Update status to 'cancelled'

**Expected Results**:
- ✅ Status update succeeds
- ✅ No time window restriction for admin
- ✅ Order marked as cancelled

---

### Test Case 17: Bulk Status View
**Objective**: Verify admin can see all orders with different statuses

**Steps**:
1. Log in as admin
2. Navigate to Orders Management
3. Observe order list

**Expected Results**:
- ✅ All orders visible regardless of status
- ✅ Status badges clearly visible
- ✅ Orders sortable by status
- ✅ Filter by order type works (online/instore)

---

## Database Function Testing

### Test Case 18: can_cancel_order() Function
**Objective**: Test the cancellation validation function

**SQL Tests**:
```sql
-- Test 1: Recent pending order (should return true)
SELECT can_cancel_order('recent-pending-order-id');
-- Expected: true

-- Test 2: Old pending order (should return false)
SELECT can_cancel_order('old-pending-order-id');
-- Expected: false

-- Test 3: Recent shipped order (should return false)
SELECT can_cancel_order('recent-shipped-order-id');
-- Expected: false

-- Test 4: Already cancelled order (should return false)
SELECT can_cancel_order('cancelled-order-id');
-- Expected: false

-- Test 5: Non-existent order (should return false)
SELECT can_cancel_order('00000000-0000-0000-0000-000000000000');
-- Expected: false
```

---

### Test Case 19: cancel_order() Function
**Objective**: Test the order cancellation function

**SQL Tests**:
```sql
-- Test 1: Valid cancellation
SELECT cancel_order(
  'valid-order-id',
  'user-id',
  'Customer changed mind'
);
-- Expected: {"success": true, "message": "Order cancelled successfully"}

-- Test 2: Expired time window
SELECT cancel_order(
  'old-order-id',
  'user-id',
  'Test'
);
-- Expected: {"success": false, "message": "Order cannot be cancelled..."}

-- Test 3: Unauthorized user
SELECT cancel_order(
  'order-id',
  'wrong-user-id',
  'Test'
);
-- Expected: {"success": false, "message": "Unauthorized"}

-- Test 4: Non-existent order
SELECT cancel_order(
  '00000000-0000-0000-0000-000000000000',
  'user-id',
  'Test'
);
-- Expected: {"success": false, "message": "Order not found"}
```

---

### Test Case 20: update_order_status() Function
**Objective**: Test admin status update function

**SQL Tests**:
```sql
-- Test 1: Valid admin update
SELECT update_order_status(
  'order-id',
  'processing'::order_status,
  'admin-user-id',
  'Payment confirmed'
);
-- Expected: {"success": true, "message": "Order status updated successfully"}

-- Test 2: Non-admin user
SELECT update_order_status(
  'order-id',
  'processing'::order_status,
  'regular-user-id',
  'Test'
);
-- Expected: {"success": false, "message": "Unauthorized. Only admins..."}

-- Test 3: Status progression
SELECT update_order_status(
  'order-id',
  'delivered'::order_status,
  'admin-user-id',
  'Delivered successfully'
);
-- Expected: success = true, actual_delivery_at populated
```

---

### Test Case 21: Trigger Testing
**Objective**: Verify triggers fire correctly

**Test: track_order_status_change_trigger**
```sql
-- Update order status
UPDATE orders SET status = 'shipped' WHERE id = 'test-order-id';

-- Check if history entry was created
SELECT * FROM order_status_history
WHERE order_id = 'test-order-id'
ORDER BY created_at DESC
LIMIT 1;
-- Expected: New entry with old_status and new_status
```

**Test: order_status_notification**
```sql
-- Update order status
UPDATE orders SET status = 'out_for_delivery' WHERE id = 'test-order-id';

-- Check if notification was created
SELECT * FROM notifications
WHERE related_id = 'test-order-id'
AND type = 'order'
ORDER BY created_at DESC
LIMIT 1;
-- Expected: New notification for user
```

---

## Security Testing

### Test Case 22: RLS Policy Verification
**Objective**: Verify Row Level Security policies work correctly

**Test: Users can only see their own order history**
```sql
-- As User A
SET LOCAL jwt.claims.sub = 'user-a-id';
SELECT * FROM order_status_history;
-- Expected: Only User A's order history

-- As User B
SET LOCAL jwt.claims.sub = 'user-b-id';
SELECT * FROM order_status_history;
-- Expected: Only User B's order history
```

---

### Test Case 23: SQL Injection Prevention
**Objective**: Verify functions are protected against SQL injection

**Tests**:
```sql
-- Test 1: Malicious order ID
SELECT cancel_order(
  'test''; DROP TABLE orders; --',
  'user-id',
  'Test'
);
-- Expected: Safe handling, no SQL execution

-- Test 2: Malicious reason
SELECT cancel_order(
  'order-id',
  'user-id',
  '''; DELETE FROM orders WHERE 1=1; --'
);
-- Expected: Reason stored as text, no SQL execution
```

---

### Test Case 24: Authorization Checks
**Objective**: Verify proper authorization at all levels

**Test Matrix**:
| Action | Regular User | Admin | Guest |
|--------|-------------|-------|-------|
| Cancel own order | ✅ Allow | ✅ Allow | ❌ Deny |
| Cancel other's order | ❌ Deny | ✅ Allow | ❌ Deny |
| Update order status | ❌ Deny | ✅ Allow | ❌ Deny |
| View own order history | ✅ Allow | ✅ Allow | ❌ Deny |
| View other's order history | ❌ Deny | ✅ Allow | ❌ Deny |
| Add tracking number | ❌ Deny | ✅ Allow | ❌ Deny |

---

## Performance Testing

### Test Case 25: Page Load Performance
**Objective**: Verify pages load quickly with order data

**Steps**:
1. Create 50 test orders
2. Navigate to Orders page
3. Measure load time

**Expected Results**:
- ✅ Page loads in < 2 seconds
- ✅ Orders display without lag
- ✅ No console errors
- ✅ Smooth scrolling

---

### Test Case 26: Timer Performance
**Objective**: Verify cancellation timer doesn't cause performance issues

**Steps**:
1. Display 10 orders with active timers
2. Monitor CPU usage
3. Check for memory leaks

**Expected Results**:
- ✅ CPU usage remains normal
- ✅ No memory leaks after 5 minutes
- ✅ Timers update smoothly
- ✅ No browser freezing

---

### Test Case 27: Database Query Performance
**Objective**: Verify queries execute efficiently

**SQL Performance Tests**:
```sql
-- Test 1: Get order status history (should use index)
EXPLAIN ANALYZE
SELECT * FROM order_status_history
WHERE order_id = 'test-order-id'
ORDER BY created_at DESC;
-- Expected: Index scan, < 10ms

-- Test 2: Get user's orders (should be fast)
EXPLAIN ANALYZE
SELECT * FROM orders
WHERE user_id = 'test-user-id'
ORDER BY created_at DESC;
-- Expected: Index scan, < 50ms

-- Test 3: Check cancellation eligibility
EXPLAIN ANALYZE
SELECT can_cancel_order('test-order-id');
-- Expected: < 5ms
```

---

## Edge Cases & Error Handling

### Test Case 28: Concurrent Cancellation Attempts
**Objective**: Verify system handles simultaneous cancellation attempts

**Steps**:
1. Open order page in two browser tabs
2. Click "Cancel" in both tabs simultaneously
3. Confirm cancellation in both

**Expected Results**:
- ✅ Only one cancellation succeeds
- ✅ Second attempt shows error: "Order already cancelled"
- ✅ No duplicate status history entries

---

### Test Case 29: Network Failure During Cancellation
**Objective**: Verify graceful handling of network errors

**Steps**:
1. Open browser DevTools → Network tab
2. Set network to "Offline"
3. Attempt to cancel order
4. Restore network

**Expected Results**:
- ✅ Error message appears: "Network error"
- ✅ Order status unchanged
- ✅ User can retry after network restored

---

### Test Case 30: Invalid Date Formats
**Objective**: Verify system handles invalid dates gracefully

**Steps**:
1. Admin attempts to set estimated delivery
2. Enter invalid date: "invalid-date"
3. Submit

**Expected Results**:
- ✅ Validation error appears
- ✅ Form doesn't submit
- ✅ Clear error message shown

---

### Test Case 31: Very Long Cancellation Reason
**Objective**: Verify system handles long text input

**Steps**:
1. Click "Cancel" on order
2. Enter 5000 character reason
3. Submit

**Expected Results**:
- ✅ Text is accepted (or truncated with warning)
- ✅ No database error
- ✅ Cancellation succeeds

---

### Test Case 32: Rapid Status Changes
**Objective**: Verify system handles quick successive status updates

**Steps**:
1. Admin updates order: pending → processing
2. Immediately update: processing → packed
3. Immediately update: packed → shipped

**Expected Results**:
- ✅ All updates succeed
- ✅ All status history entries created
- ✅ Correct order of entries
- ✅ No race conditions

---

## User Experience Testing

### Test Case 33: Mobile Responsiveness
**Objective**: Verify features work on mobile devices

**Steps**:
1. Open application on mobile device (or use DevTools mobile view)
2. Navigate to Orders page
3. Test all features

**Expected Results**:
- ✅ Cancel button visible and tappable
- ✅ Timer displays correctly
- ✅ Dialog fits screen
- ✅ Timeline scrolls smoothly
- ✅ Status badges readable
- ✅ No horizontal scrolling

---

### Test Case 34: Accessibility Testing
**Objective**: Verify features are accessible

**Steps**:
1. Use screen reader (NVDA/JAWS)
2. Navigate through order cancellation flow
3. Check keyboard navigation

**Expected Results**:
- ✅ All buttons have proper labels
- ✅ Dialog can be closed with Escape key
- ✅ Tab navigation works correctly
- ✅ Status changes announced
- ✅ Timer updates announced
- ✅ Error messages read aloud

---

### Test Case 35: Toast Notification Clarity
**Objective**: Verify all notifications are clear and helpful

**Test Matrix**:
| Action | Toast Message | Type |
|--------|--------------|------|
| Cancel success | "Order Cancelled" | Success |
| Cancel failure | "Order cannot be cancelled..." | Error |
| Status update | "Status updated" | Success |
| Tracking added | "Tracking Updated" | Success |
| Network error | "Network error" | Error |
| Unauthorized | "Unauthorized" | Error |

---

### Test Case 36: Loading States
**Objective**: Verify loading indicators appear during operations

**Steps**:
1. Throttle network to "Slow 3G"
2. Perform various actions
3. Observe loading states

**Expected Results**:
- ✅ "Cancelling..." shown during cancellation
- ✅ "Updating..." shown during status update
- ✅ Skeleton loaders on page load
- ✅ Buttons disabled during operations
- ✅ No double-submission possible

---

## Regression Testing Checklist

### Existing Features to Verify
- [ ] Order creation still works
- [ ] Payment processing unaffected
- [ ] Order listing displays correctly
- [ ] Print functionality works
- [ ] Admin dashboard loads
- [ ] User authentication works
- [ ] Product catalog unaffected
- [ ] Cart functionality intact
- [ ] Checkout process works
- [ ] Email notifications sent

---

## Test Execution Summary Template

```markdown
## Test Execution Report
**Date**: [Date]
**Tester**: [Name]
**Environment**: [Production/Staging/Local]

### Summary
- Total Tests: 36
- Passed: __
- Failed: __
- Skipped: __
- Pass Rate: __%

### Failed Tests
| Test Case | Issue | Severity | Status |
|-----------|-------|----------|--------|
| TC-XX | Description | High/Medium/Low | Open/Fixed |

### Notes
[Any additional observations]

### Sign-off
- [ ] All critical tests passed
- [ ] No blocking issues found
- [ ] Ready for production deployment
```

---

## Automated Testing Scripts

### Quick Smoke Test Script
```javascript
// Run in browser console on Orders page

async function runSmokeTests() {
  console.log('🧪 Starting Order Management Smoke Tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Check if OrderStatusBadge component exists
  try {
    const badge = document.querySelector('[class*="badge"]');
    if (badge) {
      console.log('✅ Test 1: Status badges render');
      passed++;
    } else {
      throw new Error('No badges found');
    }
  } catch (e) {
    console.log('❌ Test 1: Status badges render - FAILED');
    failed++;
  }
  
  // Test 2: Check if cancel button exists for eligible orders
  try {
    const cancelBtn = document.querySelector('button:has-text("Cancel")');
    console.log('✅ Test 2: Cancel button check');
    passed++;
  } catch (e) {
    console.log('⚠️  Test 2: Cancel button check - No eligible orders');
  }
  
  // Test 3: Check if Track Order button exists
  try {
    const trackBtn = document.querySelector('button:has-text("Track")');
    if (trackBtn) {
      console.log('✅ Test 3: Track Order button exists');
      passed++;
    } else {
      throw new Error('Track button not found');
    }
  } catch (e) {
    console.log('❌ Test 3: Track Order button - FAILED');
    failed++;
  }
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
}

runSmokeTests();
```

---

## Database Validation Script

```sql
-- Run this to validate database state after testing

-- Check for orphaned status history entries
SELECT COUNT(*) as orphaned_history
FROM order_status_history osh
LEFT JOIN orders o ON osh.order_id = o.id
WHERE o.id IS NULL;
-- Expected: 0

-- Check for orders with invalid status transitions
SELECT o.id, o.status, osh.old_status, osh.new_status
FROM orders o
JOIN order_status_history osh ON o.id = osh.order_id
WHERE osh.created_at = (
  SELECT MAX(created_at) FROM order_status_history WHERE order_id = o.id
)
AND osh.new_status != o.status;
-- Expected: 0 rows

-- Check for cancelled orders without cancellation timestamp
SELECT id, status, is_cancelled, cancellation_requested_at
FROM orders
WHERE is_cancelled = true
AND cancellation_requested_at IS NULL;
-- Expected: 0 rows

-- Check for orders with can_be_modified flag mismatch
SELECT id, status, can_be_modified
FROM orders
WHERE (
  (status IN ('pending', 'processing') AND can_be_modified = false)
  OR
  (status NOT IN ('pending', 'processing') AND can_be_modified = true)
);
-- Expected: 0 rows

-- Verify all triggers are active
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table = 'orders';
-- Expected: All order-related triggers listed
```

---

## Conclusion

This comprehensive testing guide covers all aspects of the order management enhancements. Execute these tests systematically to ensure the system is production-ready.

### Testing Priority Levels
1. **Critical** (Must Pass): TC-1, TC-2, TC-3, TC-14, TC-18, TC-19, TC-22
2. **High** (Should Pass): TC-4, TC-5, TC-9, TC-10, TC-20, TC-23, TC-24
3. **Medium** (Important): TC-6, TC-7, TC-11, TC-12, TC-15, TC-25, TC-33
4. **Low** (Nice to Have): TC-26, TC-27, TC-34, TC-35, TC-36

### Recommended Testing Schedule
- **Day 1**: Critical tests (TC-1 to TC-5, TC-18, TC-19)
- **Day 2**: High priority tests (TC-9, TC-10, TC-14, TC-20, TC-22 to TC-24)
- **Day 3**: Medium priority tests (TC-6, TC-7, TC-11, TC-12, TC-15, TC-25)
- **Day 4**: Edge cases and error handling (TC-28 to TC-32)
- **Day 5**: UX and regression testing (TC-33 to TC-36, regression checklist)

### Sign-off Criteria
- [ ] All critical tests passed
- [ ] No high-severity bugs
- [ ] Performance benchmarks met
- [ ] Security tests passed
- [ ] Accessibility requirements met
- [ ] Documentation complete
- [ ] Stakeholder approval obtained

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-26  
**Author**: Development Team  
**Status**: Ready for Testing
