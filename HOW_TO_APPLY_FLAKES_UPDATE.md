# How to Apply Flakes Category Update

## 🎯 Current Situation

**Problem:** Only 7 products are showing in the Flakes category  
**Solution:** Apply the database migration to add 8 new products  
**Result:** 14 products will be displayed in the Flakes category

---

## 📋 What Needs to Be Done

The migration file has been created but **NOT yet applied** to your database. You need to run the SQL migration to update your Supabase database.

**Migration File:** `supabase/migrations/20250201000001_update_flakes_products.sql`

---

## 🚀 How to Apply the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Open: https://supabase.com/dashboard
   - Select your project: `asktiecxlfidjmqonlwa`

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Paste the Migration**
   - Open the file: `supabase/migrations/20250201000001_update_flakes_products.sql`
   - Copy ALL the content
   - Paste it into the SQL Editor

4. **Run the Migration**
   - Click "Run" button (or press Ctrl+Enter)
   - Wait for confirmation message
   - Check for any errors

5. **Verify the Update**
   - Go to "Table Editor" in Supabase
   - Open the `products` table
   - Filter by category = 'flakes'
   - You should see 14 products (FLAKES001 to FLAKES014)

---

### Option 2: Using Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
# Navigate to project directory
cd /workspace/app-7tlhtx3qdxc1

# Apply the migration
supabase db push

# Or apply specific migration
supabase migration up
```

---

## ✅ Verification Steps

After applying the migration, verify the changes:

### 1. Check Database
```sql
-- Count flakes products
SELECT COUNT(*) FROM products WHERE category = 'flakes';
-- Should return: 14

-- List all flakes products
SELECT product_code, name FROM products 
WHERE category = 'flakes' 
ORDER BY product_code;
```

### 2. Check Website
1. Open your application
2. Navigate to the Flakes category
3. You should see 14 products:
   - Foxtail Flakes
   - Little Flakes
   - Kodo Flakes
   - Barnyard Flakes
   - Ragi Flakes
   - Pearl Flakes
   - Red Sorghum Flakes ⭐ NEW
   - White Sorghum Flakes ⭐ NEW
   - Green Gram Flakes ⭐ NEW
   - Horse Gram Flakes ⭐ NEW
   - Wheat Flakes ⭐ NEW
   - Barley Flakes ⭐ NEW
   - Karupukavini Rice Flakes ⭐ NEW
   - Mapillai Sambha Rice Flakes ⭐ NEW

---

## 📊 What the Migration Does

### Step 1: Remove Old Product
- Deletes "Sorghum Flakes" (FLAKES007) and its 4 variants

### Step 2: Add New Products
- Inserts 8 new flakes products (FLAKES007 to FLAKES014)

### Step 3: Create Variants
- Creates 4 packaging variants for each new product:
  - 1kg (no discount)
  - 2kg (no discount)
  - 5kg (2% discount)
  - 10kg (3% discount)

### Step 4: Apply Discounts
- Calculates and applies discount pricing for 5kg and 10kg variants

---

## 🔍 Expected Results

### Before Migration
```
Flakes Category: 7 products
- FLAKES001 to FLAKES007
- Total variants: 28 (7 products × 4 sizes)
```

### After Migration
```
Flakes Category: 14 products
- FLAKES001 to FLAKES014
- Total variants: 56 (14 products × 4 sizes)
```

---

## ⚠️ Important Notes

1. **Backup First**: Before applying any migration, it's good practice to backup your database
2. **Test Environment**: If you have a test/staging environment, apply there first
3. **No Rollback**: This migration deletes the old "Sorghum Flakes" product permanently
4. **Images**: New products will show placeholder images until you upload actual product images
5. **Inventory**: All new products start with 100 units stock per variant

---

## 🐛 Troubleshooting

### Issue: Migration Fails
**Solution:** Check the error message. Common issues:
- Foreign key constraints (check if old product has orders)
- Duplicate product codes
- Invalid SQL syntax

### Issue: Products Not Showing on Website
**Solution:** 
1. Clear browser cache
2. Refresh the page
3. Check if products exist in database
4. Verify category filter is working

### Issue: Prices Look Wrong
**Solution:**
- Check the `cost_price` in products table
- Verify the 15% markup calculation
- Check discount percentages (2% for 5kg, 3% for 10kg)

---

## 📞 Need Help?

If you encounter any issues:

1. **Check Migration File**: `supabase/migrations/20250201000001_update_flakes_products.sql`
2. **Check Documentation**: `FLAKES_CATEGORY_UPDATE.md`
3. **Verify Database**: Use Supabase Table Editor to inspect data
4. **Check Console**: Look for errors in browser console (F12)

---

## 🎉 Success Checklist

After applying the migration, verify:

- [ ] Migration executed without errors
- [ ] 14 products exist in flakes category
- [ ] Each product has 4 variants (1kg, 2kg, 5kg, 10kg)
- [ ] Old "Sorghum Flakes" is removed
- [ ] New products appear on website
- [ ] Prices are calculated correctly
- [ ] Discounts are applied (5kg: 2%, 10kg: 3%)
- [ ] Stock quantities are set to 100
- [ ] Add to cart works for new products

---

**Status:** ⏳ Migration Ready - Waiting to be Applied  
**Next Step:** Apply migration using Supabase Dashboard or CLI  
**Expected Time:** 2-3 minutes

---

**Quick Link to Supabase Dashboard:**  
https://supabase.com/dashboard/project/asktiecxlfidjmqonlwa/editor
