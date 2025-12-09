# Inventory Management System - Complete Guide

## Overview

The Inventory Management System provides comprehensive stock control, expiry tracking, and automated alerts for Srilaya Enterprises Organic Store. This system prevents overselling, tracks product expiry dates, and maintains a complete audit trail of all stock movements.

## Table of Contents

1. [Features](#features)
2. [Database Schema](#database-schema)
3. [Stock Management Flow](#stock-management-flow)
4. [API Reference](#api-reference)
5. [UI Components](#ui-components)
6. [Admin Dashboard](#admin-dashboard)
7. [Testing Guide](#testing-guide)
8. [Troubleshooting](#troubleshooting)

## Features

### 1. Stock Reservation System
- **Automatic Reservation**: Stock is automatically reserved when an order is placed
- **Overselling Prevention**: System prevents orders when available stock is insufficient
- **Available Stock Calculation**: `Available Stock = Total Stock - Reserved Stock`
- **Concurrent Order Handling**: Database-level locks prevent race conditions

### 2. Low Stock Alerts
- **Configurable Thresholds**: Each product has a `min_stock_threshold` setting
- **Automatic Alerts**: System creates alerts when available stock falls below threshold
- **Severity Levels**: Low, Medium, High, Critical
- **Admin Notifications**: Admins receive real-time notifications for critical alerts

### 3. Expiry Date Tracking
- **Product Expiry Dates**: Track expiry dates for organic products
- **Expiring Soon Alerts**: Configurable alert period (default: 30 days)
- **Expired Product Handling**: Automatic alerts for expired products
- **Prevent Expired Sales**: System can prevent selling expired products

### 4. Stock Movement Audit Trail
- **Complete History**: Every stock change is logged
- **Movement Types**: Reserve, Release, Finalize, Adjustment, Restock
- **Order Tracking**: Link stock movements to specific orders
- **User Attribution**: Track which user made each change

## Database Schema

### Products Table Enhancements

```sql
ALTER TABLE products ADD COLUMN:
- min_stock_threshold (integer): Minimum stock level before alert (default: 10)
- reserved_stock (integer): Stock reserved for pending orders (default: 0)
- expiry_date (date): Product expiry date (nullable)
- expiry_alert_days (integer): Days before expiry to alert (default: 30)
```

### Stock Movements Table

```sql
CREATE TABLE stock_movements (
  id uuid PRIMARY KEY,
  product_id uuid REFERENCES products(id),
  movement_type text, -- 'reserve', 'release', 'finalize', 'adjustment', 'restock'
  quantity integer,
  order_id uuid REFERENCES orders(id),
  previous_stock integer,
  new_stock integer,
  previous_reserved integer,
  new_reserved integer,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz
);
```

### Inventory Alerts Table

```sql
CREATE TABLE inventory_alerts (
  id uuid PRIMARY KEY,
  product_id uuid REFERENCES products(id),
  alert_type text, -- 'low_stock', 'expiring', 'expired', 'out_of_stock'
  severity text, -- 'low', 'medium', 'high', 'critical'
  message text,
  is_resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id),
  created_at timestamptz
);
```

## Stock Management Flow

### Order Lifecycle and Stock Management

```
1. ORDER CREATED (pending/processing)
   ├─> Reserve stock for each item
   ├─> Check available stock before reservation
   ├─> Create stock movement record (type: 'reserve')
   └─> Trigger low stock alerts if needed

2. ORDER CANCELLED
   ├─> Release reserved stock
   ├─> Stock returns to available pool
   └─> Create stock movement record (type: 'release')

3. ORDER DELIVERED
   ├─> Finalize stock reduction
   ├─> Reduce both total stock and reserved stock
   └─> Create stock movement record (type: 'finalize')

4. ORDER REFUNDED
   ├─> Release reserved stock (if any)
   ├─> Restore stock to inventory
   └─> Create stock movement record (type: 'adjustment')
```

### Stock Calculation

```typescript
// Available Stock (what customers can order)
available_stock = stock - reserved_stock

// Example:
// Total Stock: 100 units
// Reserved Stock: 30 units (from pending orders)
// Available Stock: 70 units (can be ordered)
```

## API Reference

### Inventory API Functions

#### 1. Get Available Stock

```typescript
const availableStock = await inventoryApi.getAvailableStock(productId);
// Returns: number (available stock quantity)
```

#### 2. Reserve Stock

```typescript
const result = await inventoryApi.reserveStock(
  productId,
  quantity,
  orderId,
  userId // optional
);
// Returns: { success: boolean, message: string, reserved_quantity?: number, available_stock?: number }
```

#### 3. Release Stock

```typescript
const result = await inventoryApi.releaseStock(
  productId,
  quantity,
  orderId,
  userId, // optional
  notes   // optional
);
// Returns: { success: boolean, message: string }
```

#### 4. Finalize Stock

```typescript
const result = await inventoryApi.finalizeStock(
  productId,
  quantity,
  orderId,
  userId // optional
);
// Returns: { success: boolean, message: string }
```

#### 5. Get Low Stock Products

```typescript
const lowStockProducts = await inventoryApi.getLowStockProducts();
// Returns: LowStockProduct[]
```

#### 6. Get Expiring Products

```typescript
const expiringProducts = await inventoryApi.getExpiringProducts(30); // days
// Returns: ExpiringProduct[]
```

#### 7. Get Expired Products

```typescript
const expiredProducts = await inventoryApi.getExpiredProducts();
// Returns: ExpiringProduct[]
```

#### 8. Get Stock Movements

```typescript
const movements = await inventoryApi.getStockMovements(productId);
// Returns: StockMovement[]
```

#### 9. Get Inventory Alerts

```typescript
const alerts = await inventoryApi.getInventoryAlerts(includeResolved);
// Returns: InventoryAlert[]
```

#### 10. Resolve Alert

```typescript
const success = await inventoryApi.resolveAlert(alertId, userId);
// Returns: boolean
```

#### 11. Update Stock Threshold

```typescript
await inventoryApi.updateStockThreshold(productId, threshold);
```

#### 12. Update Expiry Date

```typescript
await inventoryApi.updateExpiryDate(productId, expiryDate);
```

#### 13. Get Inventory Summary

```typescript
const summary = await inventoryApi.getInventorySummary();
// Returns: {
//   totalProducts: number,
//   lowStockCount: number,
//   outOfStockCount: number,
//   expiringCount: number,
//   expiredCount: number,
//   totalAlerts: number
// }
```

## UI Components

### 1. LowStockAlert Component

Displays products with low or out-of-stock status.

```tsx
import LowStockAlert from '@/components/inventory/LowStockAlert';

<LowStockAlert
  products={lowStockProducts}
  onProductClick={(productId) => handleProductClick(productId)}
/>
```

**Features:**
- Separate sections for out-of-stock and low-stock items
- Color-coded severity (red for out-of-stock, orange for low stock)
- Shows available stock and minimum threshold
- Clickable items for quick navigation

### 2. ExpiringProductsAlert Component

Displays products approaching or past expiry date.

```tsx
import ExpiringProductsAlert from '@/components/inventory/ExpiringProductsAlert';

<ExpiringProductsAlert
  products={expiringProducts}
  onProductClick={(productId) => handleProductClick(productId)}
/>
```

**Features:**
- Color-coded by urgency (red: ≤7 days, orange: ≤14 days, yellow: ≤30 days)
- Shows days until expiry
- Displays current stock level
- Formatted expiry dates

### 3. InventoryAlertsPanel Component

Comprehensive alert management panel.

```tsx
import InventoryAlertsPanel from '@/components/inventory/InventoryAlertsPanel';

<InventoryAlertsPanel />
```

**Features:**
- Lists all unresolved alerts
- Severity badges (critical, high, medium, low)
- One-click alert resolution
- Timestamp display
- Auto-refresh capability

## Admin Dashboard

### Inventory Dashboard Page

Access: `/admin/inventory-dashboard`

**Features:**

1. **Summary Cards**
   - Total Products
   - Low Stock Count
   - Out of Stock Count
   - Expiring Soon Count
   - Expired Count
   - Active Alerts Count

2. **Tabbed Interface**
   - All Alerts: Complete list of inventory alerts
   - Low Stock: Products below threshold
   - Expiring Products: Products expiring within 30 days
   - Expired Products: Products past expiry date

3. **Real-time Updates**
   - Automatic data refresh
   - Live alert notifications
   - Stock level monitoring

### Product Management Integration

The Product Management page now includes:
- Min Stock Threshold field
- Expiry Date field
- Reserved Stock display (read-only)
- Available Stock calculation

## Testing Guide

### 1. Test Stock Reservation

```sql
-- Create a test order
SELECT create_order(
  'user-id'::uuid,
  '[{"product_id": "product-id", "quantity": 5, "name": "Test Product", "price": 100}]'::jsonb,
  500,
  0.18,
  90,
  0,
  0,
  'INR',
  'pending',
  'online',
  'stripe',
  '{}'::jsonb,
  'Test Customer',
  'test@example.com',
  '1234567890',
  NULL
);

-- Check reserved stock
SELECT id, name, stock, reserved_stock, (stock - reserved_stock) as available
FROM products
WHERE id = 'product-id';

-- Check stock movements
SELECT * FROM stock_movements
WHERE product_id = 'product-id'
ORDER BY created_at DESC
LIMIT 5;
```

### 2. Test Stock Release (Cancellation)

```sql
-- Update order status to cancelled
UPDATE orders
SET status = 'cancelled'
WHERE id = 'order-id';

-- Verify reserved stock was released
SELECT id, name, stock, reserved_stock, (stock - reserved_stock) as available
FROM products
WHERE id = 'product-id';
```

### 3. Test Stock Finalization (Delivery)

```sql
-- Update order status to delivered
UPDATE orders
SET status = 'delivered'
WHERE id = 'order-id';

-- Verify stock was reduced
SELECT id, name, stock, reserved_stock, (stock - reserved_stock) as available
FROM products
WHERE id = 'product-id';
```

### 4. Test Low Stock Alerts

```sql
-- Set low threshold
UPDATE products
SET min_stock_threshold = 50
WHERE id = 'product-id';

-- Reduce stock below threshold
UPDATE products
SET stock = 40
WHERE id = 'product-id';

-- Check alerts
SELECT * FROM inventory_alerts
WHERE product_id = 'product-id'
AND is_resolved = false;
```

### 5. Test Expiry Alerts

```sql
-- Set expiry date
UPDATE products
SET expiry_date = CURRENT_DATE + INTERVAL '15 days'
WHERE id = 'product-id';

-- Check expiring products
SELECT * FROM check_expiring_products(30);

-- Check alerts
SELECT * FROM inventory_alerts
WHERE product_id = 'product-id'
AND alert_type = 'expiring';
```

### 6. Test Overselling Prevention

```sql
-- Try to create order with more quantity than available
-- This should fail with an error
SELECT create_order(
  'user-id'::uuid,
  '[{"product_id": "product-id", "quantity": 1000, "name": "Test Product", "price": 100}]'::jsonb,
  100000,
  0.18,
  18000,
  0,
  0,
  'INR',
  'pending',
  'online',
  'stripe',
  '{}'::jsonb,
  'Test Customer',
  'test@example.com',
  '1234567890',
  NULL
);
```

## Troubleshooting

### Issue: Stock not being reserved on order creation

**Solution:**
1. Check if the order items have `product_id` field
2. Verify the `create_order` function is being used
3. Check database logs for errors
4. Ensure products table has the new columns

```sql
-- Verify product has required columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('min_stock_threshold', 'reserved_stock', 'expiry_date', 'expiry_alert_days');
```

### Issue: Alerts not being created

**Solution:**
1. Check if triggers are enabled
2. Verify alert creation function exists
3. Check RLS policies on inventory_alerts table

```sql
-- Check triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE '%stock%' OR trigger_name LIKE '%expiry%';

-- Test alert creation manually
SELECT create_inventory_alert(
  'product-id'::uuid,
  'low_stock',
  'high',
  'Test alert message'
);
```

### Issue: Reserved stock not being released on cancellation

**Solution:**
1. Verify the order status change trigger is active
2. Check if order items have product_id
3. Review stock_movements table for the order

```sql
-- Check trigger
SELECT * FROM information_schema.triggers
WHERE trigger_name = 'trigger_handle_order_stock_on_status_change';

-- Check stock movements for order
SELECT * FROM stock_movements
WHERE order_id = 'order-id'
ORDER BY created_at DESC;
```

### Issue: Incorrect available stock calculation

**Solution:**
1. Verify reserved_stock is not negative
2. Check for orphaned reservations
3. Recalculate if needed

```sql
-- Find products with issues
SELECT id, name, stock, reserved_stock, (stock - reserved_stock) as available
FROM products
WHERE reserved_stock < 0 OR reserved_stock > stock;

-- Fix orphaned reservations (if needed)
UPDATE products p
SET reserved_stock = COALESCE((
  SELECT SUM((item->>'quantity')::integer)
  FROM orders o, jsonb_array_elements(o.items) as item
  WHERE (item->>'product_id')::uuid = p.id
  AND o.status IN ('pending', 'processing', 'packed', 'shipped', 'out_for_delivery')
), 0)
WHERE id = 'product-id';
```

## Best Practices

### 1. Stock Management
- Always use the provided API functions for stock operations
- Never manually update stock or reserved_stock without logging
- Set appropriate min_stock_threshold for each product
- Regularly review and resolve inventory alerts

### 2. Expiry Date Management
- Set expiry dates for all organic products
- Configure expiry_alert_days based on product type
- Review expiring products weekly
- Remove or discount products nearing expiry

### 3. Alert Management
- Resolve alerts promptly
- Investigate root causes of frequent alerts
- Adjust thresholds based on sales patterns
- Set up admin notification preferences

### 4. Monitoring
- Check inventory dashboard daily
- Review stock movements for anomalies
- Monitor concurrent order scenarios
- Audit stock levels regularly

## Security Considerations

1. **RLS Policies**: All tables have appropriate Row Level Security policies
2. **Function Security**: Stock management functions use SECURITY DEFINER
3. **Admin Access**: Only admins can resolve alerts and modify thresholds
4. **Audit Trail**: All stock changes are logged with user attribution
5. **Transaction Safety**: Stock operations use database transactions

## Performance Optimization

1. **Indexes**: All critical queries have appropriate indexes
2. **Batch Operations**: Use batch updates for multiple products
3. **Caching**: Consider caching inventory summary data
4. **Query Optimization**: Use materialized views for complex reports
5. **Cleanup**: Regularly archive old stock movements

## Future Enhancements

1. **Predictive Alerts**: ML-based stock prediction
2. **Auto-Reordering**: Automatic purchase order creation
3. **Batch Expiry Management**: Bulk expiry date updates
4. **Stock Transfer**: Inter-location stock transfers
5. **Barcode Integration**: Barcode scanning for stock updates
6. **Mobile App**: Mobile inventory management
7. **Analytics Dashboard**: Advanced inventory analytics
8. **Supplier Integration**: Direct supplier stock updates

## Support

For issues or questions:
1. Check this documentation
2. Review the troubleshooting section
3. Check database logs
4. Contact system administrator

---

**Last Updated**: 2025-11-26  
**Version**: 1.0.0  
**Author**: Srilaya Enterprises Development Team
