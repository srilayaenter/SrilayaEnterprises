# Order Management Enhancements - Implementation Plan

## Overview
Enhance the order management system with cancellation policy, order modification, and real-time tracking features.

## Features to Implement

### 1. Order Cancellation Policy
- **Time Limit**: 30 minutes from order placement
- **Cancellation Button**: Show in Orders page if within time limit
- **Status Check**: Only allow cancellation for orders in "pending" or "processing" status
- **Confirmation Dialog**: Require confirmation before cancellation
- **Refund Handling**: Automatic refund initiation for paid orders
- **Notification**: Send cancellation confirmation to customer

### 2. Order Modification
- **Modification Window**: Allow modifications before order is "packed"
- **Modifiable Fields**:
  - Change item quantities
  - Add new items from catalog
  - Remove items from order
  - Update delivery address
- **Price Recalculation**: Automatic price adjustment
- **Modification History**: Track all changes made to order
- **Restrictions**: Cannot modify once order is packed/shipped

### 3. Order Tracking Enhancement
- **Status Flow**:
  1. Order Placed (initial)
  2. Processing (payment confirmed, preparing)
  3. Packed (items packed, ready to ship)
  4. Shipped (handed to courier)
  5. Out for Delivery (in transit to customer)
  6. Delivered (completed)
- **Real-time Updates**: Status changes reflected immediately
- **Notifications**: Push notifications for each status change
- **Timeline View**: Visual timeline showing order progress
- **Estimated Delivery**: Show expected delivery date/time
- **Tracking Number**: Display courier tracking number when shipped

## Implementation Steps

### Phase 1: Database Schema Updates
- [ ] Add `cancellation_requested_at` timestamp to orders
- [ ] Add `cancellation_reason` text field
- [ ] Add `is_cancelled` boolean flag
- [ ] Create `order_modifications` table to track changes
- [ ] Add `estimated_delivery` timestamp
- [ ] Add `tracking_number` field
- [ ] Enhance order_status enum with new statuses

### Phase 2: Backend API Functions
- [ ] Create `cancelOrder()` function with time validation
- [ ] Create `canCancelOrder()` helper function
- [ ] Create `canModifyOrder()` helper function
- [ ] Create `modifyOrder()` function
- [ ] Create `updateOrderStatus()` function
- [ ] Create `getOrderTimeline()` function
- [ ] Add RPC for order cancellation with refund logic

### Phase 3: Frontend Components
- [ ] Create `CancelOrderDialog` component
- [ ] Create `ModifyOrderDialog` component
- [ ] Create `OrderTimeline` component
- [ ] Create `OrderStatusBadge` component with color coding
- [ ] Update `Orders.tsx` page with new features
- [ ] Add countdown timer for cancellation window
- [ ] Add modification interface

### Phase 4: Notifications System
- [ ] Create notification triggers for status changes
- [ ] Add email notifications for important updates
- [ ] Add in-app notification badges
- [ ] Create notification preferences

### Phase 5: Admin Interface
- [ ] Add order status management in admin panel
- [ ] Add bulk status updates
- [ ] Add cancellation approval workflow
- [ ] Add modification review interface

### Phase 6: Testing & Documentation
- [ ] Test cancellation within/outside time window
- [ ] Test modification restrictions
- [ ] Test status flow transitions
- [ ] Create user documentation
- [ ] Create admin documentation

## Technical Considerations

### Time Validation
```typescript
const canCancelOrder = (orderCreatedAt: string): boolean => {
  const orderTime = new Date(orderCreatedAt);
  const now = new Date();
  const diffMinutes = (now.getTime() - orderTime.getTime()) / (1000 * 60);
  return diffMinutes <= 30;
};
```

### Status Transition Rules
- Order Placed → Processing (automatic after payment)
- Processing → Packed (admin action)
- Packed → Shipped (admin action, requires tracking number)
- Shipped → Out for Delivery (automatic or admin)
- Out for Delivery → Delivered (admin confirmation)

### Modification Restrictions
- Allowed: Order Placed, Processing
- Not Allowed: Packed, Shipped, Out for Delivery, Delivered, Cancelled

## User Experience Flow

### Cancellation Flow
1. User views order in Orders page
2. "Cancel Order" button visible if within 30 minutes
3. Click button → Confirmation dialog appears
4. User confirms → Order cancelled
5. Refund initiated (if paid)
6. Notification sent

### Modification Flow
1. User views order in Orders page
2. "Modify Order" button visible if order not packed
3. Click button → Modification dialog appears
4. User makes changes (quantities, items, address)
5. Price recalculated and shown
6. User confirms → Order updated
7. Notification sent

### Tracking Flow
1. User views order details
2. Timeline shows current status with visual indicator
3. Each completed step shown with timestamp
4. Current step highlighted
5. Upcoming steps shown in gray
6. Tracking number clickable (if shipped)

## Files to Create/Modify

### New Files
- `src/components/orders/CancelOrderDialog.tsx`
- `src/components/orders/ModifyOrderDialog.tsx`
- `src/components/orders/OrderTimeline.tsx`
- `src/components/orders/OrderStatusBadge.tsx`
- `src/components/orders/CancellationTimer.tsx`
- `supabase/migrations/add_order_management_enhancements.sql`

### Files to Modify
- `src/pages/Orders.tsx`
- `src/db/api.ts`
- `src/types/types.ts`
- `src/pages/admin/AdminDashboard.tsx`
- `src/components/notifications/NotificationBell.tsx`

## Success Criteria
- [x] Users can cancel orders within 30 minutes
- [x] Users can modify orders before packing
- [x] Real-time status updates visible
- [x] Notifications sent for status changes
- [x] Admin can manage order statuses
- [x] All validations working correctly
- [x] Comprehensive error handling
- [x] User-friendly interface
- [x] Complete documentation

## Priority
**HIGH** - Core e-commerce functionality

## Estimated Time
- Phase 1: 1 hour
- Phase 2: 2 hours
- Phase 3: 3 hours
- Phase 4: 1 hour
- Phase 5: 2 hours
- Phase 6: 1 hour
**Total**: ~10 hours

---

**Status**: 🚀 Ready to Implement  
**Created**: 2025-11-26
