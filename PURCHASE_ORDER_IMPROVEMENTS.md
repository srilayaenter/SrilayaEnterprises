# Purchase Order Improvements - Packaging Size Selection

## Overview

The purchase order system has been enhanced to properly handle product variants with specific packaging sizes. Previously, the system only allowed selecting a product without specifying the packaging size, which made it impossible to correctly update inventory for specific variants (1kg, 2kg, 5kg, 10kg, etc.).

---

## Problem Statement

### Before the Change

When creating a purchase order, the admin could only:
1. Select a product (e.g., "Foxtail Rice")
2. Enter total quantity
3. Enter unit cost

**Issues:**
- ❌ No way to specify which packaging size was being purchased
- ❌ Inventory trigger couldn't determine which variant to update
- ❌ Stock updates were ambiguous or failed
- ❌ Example: Purchasing "100kg of Foxtail Rice" - should this be:
  - 100 units of 1kg packages?
  - 50 units of 2kg packages?
  - 20 units of 5kg packages?
  - 10 units of 10kg packages?

### Root Cause

The `PurchaseOrderItem` interface had optional fields for `variant_id` and `packaging_size`, but the UI didn't collect this information during purchase order creation.

---

## Solution

### Changes Made

#### 1. Enhanced Item Form State

**Before:**
```typescript
const [itemForm, setItemForm] = useState({
  product_id: '',
  product_name: '',
  quantity: 1,
  unit_cost: 0,
});
```

**After:**
```typescript
const [itemForm, setItemForm] = useState({
  product_id: '',
  product_name: '',
  variant_id: '',        // NEW: Specific variant ID
  packaging_size: '',    // NEW: Display packaging size
  quantity: 1,
  unit_cost: 0,
});
```

#### 2. Added Variant Loading

New function to load available variants when a product is selected:

```typescript
const handleProductChange = async (productId: string) => {
  const product = products.find(p => p.id === productId);
  setItemForm(prev => ({ 
    ...prev, 
    product_id: productId,
    product_name: product?.name || '',
    variant_id: '',
    packaging_size: '',
  }));

  // Load variants for the selected product
  try {
    const variants = await variantsApi.getByProductId(productId);
    setAvailableVariants(variants);
  } catch (error) {
    console.error('Error loading variants:', error);
    setAvailableVariants([]);
  }
};
```

#### 3. Added Variant Selection Handler

New function to handle variant selection and auto-fill cost price:

```typescript
const handleVariantChange = (variantId: string) => {
  const variant = availableVariants.find(v => v.id === variantId);
  setItemForm(prev => ({
    ...prev,
    variant_id: variantId,
    packaging_size: variant?.packaging_size || '',
    unit_cost: variant?.cost_price || 0,  // Auto-fill from variant
  }));
};
```

#### 4. Updated Item Creation

**Before:**
```typescript
const newItem: PurchaseOrderItem = {
  product_id: itemForm.product_id,
  product_name: itemForm.product_name,
  quantity: itemForm.quantity,
  unit_cost: itemForm.unit_cost,
  total_cost: itemForm.quantity * itemForm.unit_cost,
};
```

**After:**
```typescript
const newItem: PurchaseOrderItem = {
  product_id: itemForm.product_id,
  product_name: itemForm.product_name,
  variant_id: itemForm.variant_id,        // NOW REQUIRED
  packaging_size: itemForm.packaging_size, // NOW REQUIRED
  quantity: itemForm.quantity,
  unit_cost: itemForm.unit_cost,
  total_cost: itemForm.quantity * itemForm.unit_cost,
};
```

#### 5. Enhanced UI Form

**Before (4 columns):**
- Product
- Quantity
- Unit Cost
- Add Button

**After (5 columns):**
- Product
- **Packaging Size** (NEW)
- Quantity (Units)
- Unit Cost
- Add Button

**New Packaging Size Selector:**
```tsx
<div className="space-y-2">
  <Label>Packaging Size *</Label>
  <Select 
    value={itemForm.variant_id} 
    onValueChange={handleVariantChange}
    disabled={!itemForm.product_id || availableVariants.length === 0}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select size" />
    </SelectTrigger>
    <SelectContent>
      {availableVariants.map(variant => (
        <SelectItem key={variant.id} value={variant.id}>
          {variant.packaging_size}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

#### 6. Updated Items Display Table

**Before:**
- Product
- Quantity
- Unit Cost
- Total
- Actions

**After:**
- Product
- **Size** (NEW)
- Quantity
- Unit Cost
- Total
- Actions

---

## User Workflow

### Creating a Purchase Order with Specific Packaging

1. **Select Vendor**
   - Choose the vendor supplying the products

2. **Add Items**
   - **Step 1**: Select Product (e.g., "Foxtail Rice")
   - **Step 2**: Select Packaging Size (e.g., "10kg")
     - Dropdown is enabled after product selection
     - Shows all available packaging sizes for that product
   - **Step 3**: Enter Quantity in Units (e.g., 50 units)
     - This means 50 units of 10kg packages = 500kg total
   - **Step 4**: Unit Cost is auto-filled from variant's cost price
     - Can be manually adjusted if needed
   - **Step 5**: Click Add (+) button

3. **Review Items**
   - Table shows: Product Name, Size, Quantity, Unit Cost, Total
   - Example: "Foxtail Rice | 10kg | 50 | ₹600.00 | ₹30,000.00"

4. **Complete Order**
   - Add shipping cost and notes
   - Submit purchase order

5. **Receive Order**
   - When goods arrive, mark order as "Received"
   - Inventory trigger automatically updates stock for the specific variant
   - Example: 50 units added to "Foxtail Rice 10kg" variant stock

---

## Benefits

### ✅ Accurate Inventory Tracking

- Stock updates are precise and variant-specific
- No ambiguity about which packaging size was purchased
- Inventory Status Dashboard shows accurate stock levels

### ✅ Better Cost Management

- Unit cost auto-fills from variant's cost price
- Easy to track costs per packaging size
- Accurate total cost calculations

### ✅ Improved User Experience

- Clear, step-by-step workflow
- Packaging size selector only enables after product selection
- Visual feedback with disabled states

### ✅ Data Integrity

- Required fields prevent incomplete data
- Validation ensures all necessary information is captured
- Database trigger can reliably update correct variant

### ✅ Reporting Accuracy

- Purchase history shows exact packaging sizes ordered
- Easy to analyze purchasing patterns by size
- Better vendor performance tracking

---

## Technical Details

### Database Schema

The `PurchaseOrderItem` interface already supported these fields:

```typescript
export interface PurchaseOrderItem {
  product_id: string;
  product_name: string;
  variant_id?: string;      // Now populated
  packaging_size?: string;  // Now populated
  quantity: number;         // Now represents units, not weight
  unit_cost: number;
  total_cost: number;
}
```

### Inventory Trigger Compatibility

The existing inventory trigger (`update_inventory_on_purchase_order_received`) already expects `variant_id` in purchase order items:

```sql
-- Extract variant_id from item
variant_id_val := (item->>'variant_id')::uuid;

-- Update stock for specific variant
UPDATE product_variants
SET stock = stock + quantity_val
WHERE id = variant_id_val;
```

**Before this change:** `variant_id` was null or missing → trigger failed or skipped
**After this change:** `variant_id` is always present → trigger works correctly

---

## Examples

### Example 1: Ordering Multiple Sizes of Same Product

**Scenario:** Vendor delivers Foxtail Rice in mixed packaging

**Purchase Order Items:**
1. Foxtail Rice | 1kg | 100 units | ₹80.00 | ₹8,000.00
2. Foxtail Rice | 5kg | 50 units | ₹350.00 | ₹17,500.00
3. Foxtail Rice | 10kg | 20 units | ₹650.00 | ₹13,000.00

**Total:** ₹38,500.00

**When Received:**
- Foxtail Rice 1kg variant: +100 units
- Foxtail Rice 5kg variant: +50 units
- Foxtail Rice 10kg variant: +20 units

### Example 2: Ordering Different Products

**Purchase Order Items:**
1. Foxtail Rice | 10kg | 50 units | ₹600.00 | ₹30,000.00
2. Barnyard Millet | 5kg | 30 units | ₹400.00 | ₹12,000.00
3. Organic Honey | 500g | 100 units | ₹250.00 | ₹25,000.00

**Total:** ₹67,000.00

**When Received:**
- Each variant's stock is incremented by the specified quantity
- Inventory Status Dashboard reflects updated stock levels

---

## Migration Notes

### Existing Purchase Orders

**Historical Data:**
- Existing purchase orders may have items without `variant_id` or `packaging_size`
- These will display as before (without size column)
- No data migration needed - old data remains valid

**New Purchase Orders:**
- All new purchase orders MUST include variant_id and packaging_size
- Validation prevents creating items without these fields

### Backward Compatibility

The changes are backward compatible:
- ✅ Old purchase orders display correctly
- ✅ Old items without variant_id are handled gracefully
- ✅ Inventory trigger checks for variant_id before updating
- ✅ No breaking changes to database schema

---

## Validation Rules

### Item Addition Validation

```typescript
if (!itemForm.product_id || !itemForm.variant_id || 
    itemForm.quantity <= 0 || itemForm.unit_cost <= 0) {
  toast({
    title: 'Validation Error',
    description: 'Please fill in all item fields correctly including packaging size',
    variant: 'destructive',
  });
  return;
}
```

**Required Fields:**
- ✅ Product (must be selected)
- ✅ Packaging Size (must be selected)
- ✅ Quantity (must be > 0)
- ✅ Unit Cost (must be > 0)

---

## Testing Checklist

### Manual Testing

- [x] Select product → packaging size dropdown enables
- [x] Select packaging size → unit cost auto-fills
- [x] Add item → appears in table with size column
- [x] Remove item → item removed from table
- [x] Submit purchase order → saves with variant_id
- [x] Mark as received → stock updates for correct variant
- [x] Inventory Status Dashboard → shows updated stock

### Edge Cases

- [x] Product with no variants → packaging size dropdown shows empty
- [x] Change product selection → packaging size resets
- [x] Edit existing order → can add new items with packaging size
- [x] Multiple items same product different sizes → all tracked separately

---

## Future Enhancements

### Potential Improvements

1. **Bulk Import**
   - CSV upload for purchase orders
   - Template with product, size, quantity, cost columns

2. **Suggested Reorder Quantities**
   - Based on sales velocity
   - Recommend optimal packaging sizes

3. **Vendor Preferences**
   - Track which vendors supply which packaging sizes
   - Auto-filter packaging sizes by selected vendor

4. **Price History**
   - Track unit cost changes over time
   - Alert on significant price increases

5. **Packaging Conversion**
   - Convert between packaging sizes
   - Example: 10 units of 1kg = 1 unit of 10kg

---

## Troubleshooting

### Issue: Packaging size dropdown is disabled

**Cause:** No product selected or product has no variants

**Solution:**
1. Ensure a product is selected first
2. Check that the product has variants defined in Product Management
3. If product has no variants, create them first

### Issue: Unit cost is 0 after selecting packaging size

**Cause:** Variant doesn't have a cost price set

**Solution:**
1. Go to Product Management → Inventory tab
2. Find the variant and set its cost price
3. Return to purchase order and reselect the packaging size

### Issue: Stock not updating after marking as received

**Cause:** Purchase order items missing variant_id

**Solution:**
1. Check purchase order items in database
2. Ensure all items have variant_id populated
3. For old orders, manually update stock or recreate order

### Issue: Can't find specific packaging size

**Cause:** Variant doesn't exist for that product

**Solution:**
1. Go to Product Management
2. Select the product
3. Add the missing packaging size variant
4. Return to purchase order and it will appear in dropdown

---

## Summary

The purchase order system now properly handles product variants with specific packaging sizes, ensuring:

✅ **Accurate inventory tracking** - Stock updates for correct variants  
✅ **Clear data entry** - Step-by-step workflow with validation  
✅ **Better reporting** - Detailed purchase history by packaging size  
✅ **Cost management** - Auto-fill unit costs from variant data  
✅ **Data integrity** - Required fields prevent incomplete orders  
✅ **Trigger compatibility** - Works seamlessly with inventory automation  

The system is now production-ready for managing purchase orders with precise packaging size tracking.

---

**Last Updated:** 2025-11-26  
**Version:** 2.0.0  
**Status:** ✅ Production Ready
