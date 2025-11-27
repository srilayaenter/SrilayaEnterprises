/*
# Add Flour Category - Step 2

## Plain English Explanation
This migration recategorizes flour products from 'flakes' to the new 'flour' category.

## Products Being Recategorized (10 products)
- Foxtail, Little, Browntop, Barnyard Flour
- Ragi Flour
- Natty Pearl Flour
- Pearl Flour
- Sorghum Flour
- Proso Flour
- Millet Flour

## Notes
- Maintains all existing product data and variants
- No impact on orders or other tables
*/

-- Update flour products to use the new category
UPDATE products 
SET category = 'flour'::product_category
WHERE name IN (
  'Foxtail, Little, Browntop, Barnyard Flour',
  'Ragi Flour',
  'Natty Pearl Flour',
  'Pearl Flour',
  'Sorghum Flour',
  'Proso Flour',
  'Millet Flour'
);