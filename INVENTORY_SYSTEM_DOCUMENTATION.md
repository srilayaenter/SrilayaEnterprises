# Inventory System Documentation

## Overview

The Srilaya Enterprises Organic Store now has a complete, automated inventory management system that tracks stock levels in real-time for both sales orders and purchase orders.

---

## System Architecture

### Automatic Inventory Updates

The system uses **database triggers** to automatically update inventory stock levels when:
1. **Sales Orders are completed** → Stock is **decremented**
2. **Purchase Orders are received** → Stock is **incremented**

This ensures inventory is always accurate without manual intervention.

---

## Sales Order Inventory Management

### How It Works

When a customer completes a purchase:

1. **Order Creation**
   - Customer adds items to cart
   - Proceeds to checkout
   - Order created with status = `pending`

2. **Payment Processing**
   - Stripe processes payment
   - Customer redirected to success page

3. **Order Completion**
   - `verify_stripe_payment` Edge Function verifies payment
   - Order status updated: `pending` → `completed`

4. **Automatic Stock Update** ⭐
   - Database trigger fires automatically
   - For each item in the order:
     - Extracts `variant_id` and `quantity`
     - Decrements stock: `stock = GREATEST(stock - quantity, 0)`
   - Prevents negative stock values

### Database Objects

**Trigger**: `trigger_update_inventory_on_order_completion`
- **Table**: `orders`
- **Event**: AFTER UPDATE
- **Condition**: `NEW.status = 'completed' AND OLD.status = 'pending'`

**Function**: `update_inventory_on_order_completion()`
- **Language**: PL/pgSQL
- **Purpose**: Parse order items and decrement stock

### Example

```sql
-- Order items structure
{
  "items": [
    {
      "name": "Foxtail Rice",
      "quantity": 10,
      "variant_id": "4f9c2430-00b7-43a8-9f6c-c30d3af7ffdf",
      "packaging_size": "10kg",
      "price": 840.31
    }
  ]
}

-- Stock update
UPDATE product_variants
SET stock = GREATEST(stock - 10, 0)
WHERE id = '4f9c2430-00b7-43a8-9f6c-c30d3af7ffdf';
```

---

## Purchase Order Inventory Management

### How It Works

When a purchase order is received from a vendor:

1. **Purchase Order Creation**
   - Admin creates PO with vendor
   - Status = `ordered`
   - Items stored in JSONB format

2. **Order Progression**
   - Status changes: `ordered` → `confirmed` → `shipped`

3. **Order Receipt**
   - Admin marks order as `received`
   - Status updated: `shipped` → `received`

4. **Automatic Stock Update** ⭐
   - Database trigger fires automatically
   - For each item in the purchase order:
     - Extracts `variant_id` and `quantity`
     - Increments stock: `stock = stock + quantity`
   - Adds received inventory to existing stock

### Database Objects

**Trigger**: `trigger_update_inventory_on_purchase_order_received`
- **Table**: `purchase_orders`
- **Event**: AFTER UPDATE
- **Condition**: `NEW.status = 'received'`

**Function**: `update_inventory_on_purchase_order_received()`
- **Language**: PL/pgSQL
- **Purpose**: Parse PO items and increment stock

### Purchase Order Status Flow

```
ordered → confirmed → shipped → received
                                    ↓
                          [Trigger fires here]
                                    ↓
                          Stock is incremented
```

### Example

```sql
-- Purchase order items structure
{
  "items": [
    {
      "product_name": "Foxtail Rice",
      "quantity": 50,
      "variant_id": "4f9c2430-00b7-43a8-9f6c-c30d3af7ffdf",
      "packaging_size": "10kg",
      "unit_price": 600.00
    }
  ]
}

-- Stock update
UPDATE product_variants
SET stock = stock + 50
WHERE id = '4f9c2430-00b7-43a8-9f6c-c30d3af7ffdf';
```

---

## Inventory Status Dashboard

### Overview

A dedicated dashboard page (`/admin/inventory-status`) provides real-time visibility into critical stock levels across all products.

### Access

**Navigation Path**:
1. Admin Dashboard → Inventory Tab
2. Click "View Inventory Status Dashboard" button
3. Or click "View Details" in low stock alerts

**Direct URL**: `/admin/inventory-status`

### Features

#### 1. Four-Tier Stock Classification

| Category | Threshold | Badge Color | Priority |
|----------|-----------|-------------|----------|
| **Out of Stock** | Stock = 0 | Red (Destructive) | Critical |
| **Critical Stock** | Stock ≤ 3 | Red (Destructive) | Urgent |
| **Low Stock** | Stock ≤ 5 | Gray (Secondary) | Monitor |
| **In Stock** | Stock > 5 | Blue (Primary) | Healthy |

#### 2. Summary Cards

At the top of the dashboard, four cards display:
- **Out of Stock**: Count of products with 0 units
- **Critical Stock**: Count of products with ≤3 units
- **Low Stock**: Count of products with ≤5 units
- **In Stock**: Count of products with >5 units

#### 3. Detailed Product Lists

For each category (Out of Stock, Critical, Low Stock):
- Product name and category
- Packaging size and price
- Current stock level (large, bold number)
- Color-coded status badge
- Hover effects for better UX

#### 4. Visual Indicators

- **Icons**: PackageX, AlertCircle, TrendingDown, Package
- **Color Coding**: Red for critical, gray for low, blue for healthy
- **Gradient Backgrounds**: Subtle gradients for visual appeal
- **Responsive Design**: Works on desktop, tablet, and mobile

### Use Cases

#### Daily Operations
- **Morning Check**: Review out-of-stock and critical items
- **Reorder Planning**: Identify products needing purchase orders
- **Stock Monitoring**: Track low stock trends

#### Inventory Management
- **Prevent Stockouts**: Proactive alerts before running out
- **Optimize Ordering**: Order right quantities at right time
- **Reduce Waste**: Avoid overstocking perishable items

#### Business Intelligence
- **Sales Patterns**: Identify fast-moving products
- **Seasonal Trends**: Track stock levels over time
- **Vendor Performance**: Monitor restock frequency

---

## Database Schema

### Orders Table

```sql
CREATE TABLE orders (
  id uuid PRIMARY KEY,
  items jsonb NOT NULL,  -- Array of order items
  status order_status DEFAULT 'pending',
  total_amount numeric(10,2),
  completed_at timestamptz,
  ...
);
```

### Purchase Orders Table

```sql
CREATE TABLE purchase_orders (
  id uuid PRIMARY KEY,
  po_number text UNIQUE NOT NULL,
  vendor_id uuid REFERENCES vendors(id),
  items jsonb NOT NULL,  -- Array of PO items
  status purchase_order_status DEFAULT 'ordered',
  actual_delivery_date date,
  ...
);
```

### Product Variants Table

```sql
CREATE TABLE product_variants (
  id uuid PRIMARY KEY,
  product_id uuid REFERENCES products(id),
  packaging_size text NOT NULL,
  price numeric(10,2) NOT NULL,
  stock integer DEFAULT 0,  -- Updated by triggers
  cost_price numeric(10,2),
  ...
);
```

### Item Structure (JSONB)

Both `orders.items` and `purchase_orders.items` use this structure:

```json
[
  {
    "name": "Product Name",
    "quantity": 10,
    "variant_id": "uuid-here",
    "packaging_size": "10kg",
    "price": 840.31
  }
]
```

---

## Monitoring and Maintenance

### Check Inventory Status

```sql
-- Get all products with critical stock
SELECT 
  p.name,
  pv.packaging_size,
  pv.stock,
  pv.price
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
WHERE pv.stock <= 3
ORDER BY pv.stock ASC, p.name;
```

### Check Recent Stock Changes

```sql
-- View recent completed orders (stock decrements)
SELECT 
  o.id,
  o.completed_at,
  o.items,
  o.total_amount
FROM orders o
WHERE o.status = 'completed'
  AND o.completed_at > NOW() - INTERVAL '7 days'
ORDER BY o.completed_at DESC;

-- View recent received purchase orders (stock increments)
SELECT 
  po.id,
  po.po_number,
  po.actual_delivery_date,
  po.items,
  po.total_amount
FROM purchase_orders po
WHERE po.status = 'received'
  AND po.actual_delivery_date > NOW() - INTERVAL '7 days'
ORDER BY po.actual_delivery_date DESC;
```

### Verify Triggers Are Active

```sql
-- Check sales order trigger
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_inventory_on_order_completion';

-- Check purchase order trigger
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_inventory_on_purchase_order_received';
```

### Manual Stock Adjustment

If you need to manually adjust stock (e.g., for damaged goods, theft, or corrections):

```sql
-- Increase stock (e.g., found missing inventory)
UPDATE product_variants 
SET stock = stock + 10 
WHERE id = 'variant-uuid-here';

-- Decrease stock (e.g., damaged goods)
UPDATE product_variants 
SET stock = GREATEST(stock - 5, 0) 
WHERE id = 'variant-uuid-here';

-- Set specific stock level
UPDATE product_variants 
SET stock = 25 
WHERE id = 'variant-uuid-here';
```

---

## Troubleshooting

### Issue: Stock not updating for completed orders

**Check**:
1. Verify trigger exists:
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'trigger_update_inventory_on_order_completion';
   ```

2. Check order status:
   ```sql
   SELECT id, status, completed_at, items 
   FROM orders 
   WHERE id = 'order-uuid-here';
   ```

3. Verify variant_id in order items matches product_variants table

**Solution**: If trigger is missing, re-apply migration:
```bash
# Migration file: 20240102000001_add_inventory_update_trigger.sql
```

### Issue: Stock not updating for received purchase orders

**Check**:
1. Verify trigger exists:
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'trigger_update_inventory_on_purchase_order_received';
   ```

2. Check PO status:
   ```sql
   SELECT id, po_number, status, items 
   FROM purchase_orders 
   WHERE id = 'po-uuid-here';
   ```

3. Ensure status is exactly 'received' (not 'Received' or other variations)

**Solution**: If trigger is missing, re-apply migration:
```bash
# Migration file: 20240102000003_add_purchase_order_inventory_trigger.sql
```

### Issue: Negative stock values

**Cause**: Should not happen due to `GREATEST(stock - quantity, 0)` function

**Check**:
```sql
SELECT p.name, pv.packaging_size, pv.stock
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
WHERE pv.stock < 0;
```

**Solution**: Manually reset to 0:
```sql
UPDATE product_variants 
SET stock = 0 
WHERE stock < 0;
```

### Issue: Inventory Status Dashboard not loading

**Check**:
1. Browser console for errors
2. Network tab for failed API calls
3. Supabase connection

**Common Causes**:
- RLS policies blocking read access
- Missing product_variants or products table
- Supabase client not initialized

**Solution**: Verify RLS policies allow read access:
```sql
-- Check RLS policies
SELECT * FROM pg_policies 
WHERE tablename IN ('products', 'product_variants');
```

---

## Best Practices

### Inventory Management

1. **Daily Review**: Check Inventory Status Dashboard every morning
2. **Reorder Points**: Set up purchase orders when stock reaches critical levels
3. **Regular Audits**: Periodically verify physical stock matches system stock
4. **Historical Analysis**: Review stock movement trends monthly

### Purchase Order Workflow

1. **Create PO**: When stock reaches low threshold (≤5 units)
2. **Confirm with Vendor**: Update status to 'confirmed'
3. **Track Shipment**: Update to 'shipped' when vendor ships
4. **Receive Goods**: Mark as 'received' only after physical verification
5. **Verify Stock**: Check that stock was automatically updated

### Sales Order Monitoring

1. **Monitor Completion**: Ensure orders move from 'pending' to 'completed'
2. **Check Stock Updates**: Verify stock decrements after order completion
3. **Handle Failures**: Investigate if stock doesn't update
4. **Customer Communication**: Notify customers of out-of-stock situations

### Stock Thresholds

Recommended thresholds by product category:

| Category | Critical | Low | Reorder Point |
|----------|----------|-----|---------------|
| Millets | 3 units | 5 units | 10 units |
| Rice | 3 units | 5 units | 10 units |
| Flour | 3 units | 5 units | 10 units |
| Flakes | 3 units | 5 units | 10 units |
| Sugar | 5 units | 10 units | 20 units |
| Honey | 2 units | 5 units | 10 units |
| Laddus | 5 units | 10 units | 20 units |

---

## Future Enhancements

### Planned Features

1. **Stock Reservation**
   - Reserve stock when order is created (pending status)
   - Release stock if payment fails or order is cancelled
   - Prevents overselling during checkout

2. **Automated Reorder Alerts**
   - Email notifications when stock reaches critical levels
   - Suggested reorder quantities based on sales velocity
   - Integration with vendor management system

3. **Stock Movement History**
   - Create `inventory_transactions` table
   - Log all stock changes with timestamps and reasons
   - Track: sales, purchases, adjustments, returns

4. **Predictive Analytics**
   - Forecast when products will run out
   - Suggest optimal reorder quantities
   - Identify seasonal trends

5. **Barcode Scanning**
   - Mobile app for warehouse staff
   - Scan products during receiving
   - Real-time stock updates

6. **Multi-Location Support**
   - Track stock across multiple warehouses
   - Transfer stock between locations
   - Location-based inventory reports

---

## API Reference

### Get Low Stock Products

```typescript
// Get products with stock below threshold
const lowStockProducts = await adminApi.getLowStockProducts(threshold);

// Example
const criticalProducts = await adminApi.getLowStockProducts(3);
```

### Get Product Variants

```typescript
// Get all variants for a product
const variants = await variantsApi.getByProductId(productId);

// Get specific variant
const variant = await variantsApi.getById(variantId);
```

### Update Stock Manually

```typescript
// Update variant stock
await variantsApi.update(variantId, {
  stock: newStockLevel
});
```

---

## Support and Contact

For issues or questions about the inventory system:

1. **Check Documentation**: Review this file and INVENTORY_FIX_DOCUMENTATION.md
2. **Check Logs**: Review Supabase logs for trigger execution
3. **Database Queries**: Use monitoring queries provided above
4. **Manual Intervention**: Use manual stock adjustment queries if needed

---

## Changelog

### 2025-11-26 - Initial Release

**Added**:
- Sales order inventory trigger
- Purchase order inventory trigger
- Inventory Status Dashboard
- Historical data fix for existing orders
- Comprehensive documentation

**Database Migrations**:
- `20240102000001_add_inventory_update_trigger.sql`
- `20240102000002_fix_historical_inventory.sql`
- `20240102000003_add_purchase_order_inventory_trigger.sql`

**Files Created**:
- `src/pages/admin/InventoryStatus.tsx`
- `INVENTORY_FIX_DOCUMENTATION.md`
- `INVENTORY_SYSTEM_DOCUMENTATION.md`

**Files Modified**:
- `src/pages/admin/InventoryManagement.tsx`
- `src/routes.tsx`

---

## Summary

The Srilaya Enterprises Organic Store now has a **complete, automated inventory management system** that:

✅ **Automatically updates stock** for sales and purchases  
✅ **Provides real-time visibility** into critical stock levels  
✅ **Prevents stockouts** with proactive alerts  
✅ **Streamlines operations** with automated workflows  
✅ **Ensures accuracy** with database-level enforcement  
✅ **Scales effortlessly** as business grows  

The system is **production-ready** and requires **no manual intervention** for normal operations.

---

**Last Updated**: 2025-11-26  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
