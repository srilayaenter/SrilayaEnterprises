# Inventory Management Critical Features - Implementation Plan

## Overview
Implement comprehensive inventory management features including low stock alerts, stock reservation, automatic stock updates, and expiry date tracking.

## Features to Implement

### 1. Low Stock Alerts
- [ ] Add `min_stock_threshold` field to products table
- [ ] Create function to check low stock products
- [ ] Create notification system for low stock alerts
- [ ] Add admin dashboard widget for low stock alerts
- [ ] Create UI component to display low stock warnings

### 2. Stock Reservation System
- [ ] Add `reserved_stock` field to products table
- [ ] Create function to reserve stock on order placement
- [ ] Create function to release reserved stock on cancellation
- [ ] Create function to finalize stock on delivery
- [ ] Update order placement logic to reserve stock
- [ ] Prevent overselling by checking available stock

### 3. Automatic Stock Updates
- [ ] Create trigger for order status changes
- [ ] Update stock when order is delivered
- [ ] Release reserved stock when order is cancelled
- [ ] Handle refunds and stock restoration
- [ ] Create audit trail for stock movements

### 4. Expiry Date Tracking
- [ ] Add expiry date fields to products/inventory
- [ ] Create function to check expiring products
- [ ] Create alerts for products nearing expiry (30 days)
- [ ] Add admin dashboard widget for expiring products
- [ ] Prevent selling expired products
- [ ] Create UI to manage product expiry dates

## Implementation Steps

### Phase 1: Database Schema Updates ✅
- [x] Create migration file
- [x] Add fields to products table:
  - `min_stock_threshold` (integer)
  - `reserved_stock` (integer, default 0)
  - `expiry_date` (date, nullable)
  - `expiry_alert_days` (integer, default 30)
- [x] Create `stock_movements` table for audit trail
- [x] Create `inventory_alerts` table for tracking alerts

### Phase 2: Database Functions ✅
- [x] `check_low_stock_products()` - Returns products below threshold
- [x] `reserve_stock(product_id, quantity)` - Reserve stock for order
- [x] `release_stock(product_id, quantity)` - Release reserved stock
- [x] `finalize_stock(product_id, quantity)` - Finalize on delivery
- [x] `check_expiring_products(days)` - Returns products expiring soon
- [x] `get_available_stock(product_id)` - Calculate available stock
- [x] `log_stock_movement()` - Audit trail function

### Phase 3: Triggers ✅
- [x] Create trigger on order creation to reserve stock
- [x] Create trigger on order status change to update stock
- [x] Create trigger on stock changes to check alerts
- [x] Create trigger to prevent selling expired products

### Phase 4: TypeScript Types ✅
- [x] Update Product interface with new fields
- [x] Create StockMovement interface
- [x] Create InventoryAlert interface
- [x] Update Order-related types

### Phase 5: API Functions ✅
- [x] `getLowStockProducts()` - Get products below threshold
- [x] `getExpiringProducts(days)` - Get products expiring soon
- [x] `getAvailableStock(productId)` - Get available stock
- [x] `updateStockThreshold(productId, threshold)` - Update min threshold
- [x] `updateExpiryDate(productId, expiryDate)` - Update expiry
- [x] `getStockMovements(productId)` - Get stock history
- [x] `getInventoryAlerts()` - Get all active alerts

### Phase 6: UI Components ✅
- [x] Create `LowStockAlert` component
- [x] Create `ExpiringProductsAlert` component
- [x] Create `StockReservationIndicator` component (not needed)
- [x] Create `StockMovementHistory` component (not needed)
- [x] Create `InventoryAlertsPanel` component

### Phase 7: Admin Dashboard Updates ✅
- [x] Add low stock alerts widget
- [x] Add expiring products widget
- [x] Add stock movements view
- [x] Add inventory alerts management
- [x] Update product management with new fields

### Phase 8: Integration ✅
- [x] Update checkout process to check available stock
- [x] Update order placement to reserve stock
- [x] Update order cancellation to release stock
- [x] Update order delivery to finalize stock
- [x] Add stock validation before order confirmation

### Phase 9: Testing ⏳
- [ ] Test stock reservation on order placement
- [ ] Test stock release on cancellation
- [ ] Test stock finalization on delivery
- [ ] Test low stock alerts
- [ ] Test expiry date alerts
- [ ] Test overselling prevention
- [ ] Test concurrent order scenarios

### Phase 10: Documentation ✅
- [x] Create comprehensive documentation
- [x] Create testing guide
- [x] Create quick reference guide
- [x] Update existing documentation

## Database Schema Design

### Products Table Updates
```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_stock_threshold integer DEFAULT 10;
ALTER TABLE products ADD COLUMN IF NOT EXISTS reserved_stock integer DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS expiry_date date;
ALTER TABLE products ADD COLUMN IF NOT EXISTS expiry_alert_days integer DEFAULT 30;
```

### Stock Movements Table
```sql
CREATE TABLE stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  movement_type text NOT NULL, -- 'reserve', 'release', 'finalize', 'adjustment', 'restock'
  quantity integer NOT NULL,
  order_id uuid REFERENCES orders(id),
  previous_stock integer NOT NULL,
  new_stock integer NOT NULL,
  previous_reserved integer NOT NULL,
  new_reserved integer NOT NULL,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);
```

### Inventory Alerts Table
```sql
CREATE TABLE inventory_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  alert_type text NOT NULL, -- 'low_stock', 'expiring', 'expired', 'out_of_stock'
  severity text NOT NULL, -- 'low', 'medium', 'high', 'critical'
  message text NOT NULL,
  is_resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);
```

## Key Business Rules

### Stock Reservation
1. When order is placed: `reserved_stock += quantity`
2. Available stock = `stock - reserved_stock`
3. Cannot place order if available stock < order quantity
4. Reserved stock is locked until order is delivered or cancelled

### Stock Updates
1. Order Delivered: `stock -= quantity`, `reserved_stock -= quantity`
2. Order Cancelled: `reserved_stock -= quantity` (stock unchanged)
3. Order Refunded: `stock += quantity` (restore stock)

### Low Stock Alerts
1. Alert when `(stock - reserved_stock) < min_stock_threshold`
2. Critical alert when `(stock - reserved_stock) = 0`
3. Notify admin immediately for critical alerts

### Expiry Date Alerts
1. Warning when `expiry_date - current_date <= expiry_alert_days`
2. Critical when product is expired
3. Prevent selling expired products
4. Auto-mark expired products as unavailable

## Success Criteria
- [ ] No overselling occurs
- [ ] Stock is accurately tracked
- [ ] Admins receive timely alerts
- [ ] Stock movements are auditable
- [ ] Expired products cannot be sold
- [ ] System handles concurrent orders correctly

## Notes
- All stock operations must be atomic (use transactions)
- Stock movements must be logged for audit purposes
- Alerts should be actionable and clear
- UI should clearly show available vs reserved stock
