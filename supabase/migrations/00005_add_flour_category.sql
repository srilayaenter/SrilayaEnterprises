/*
# Add Flour Category

## Plain English Explanation
This migration adds "flour" as a new product category and recategorizes flour products that were previously listed under "flakes".

## Changes Made
1. Add 'flour' to product_category enum
2. Update 10 flour products from 'flakes' to 'flour' category

## Products Being Recategorized
- Foxtail, Little, Browntop, Barnyard Flour
- Ragi Flour
- Natty Pearl Flour
- Pearl Flour
- Sorghum Flour
- Proso Flour
- Millet Flour

## Notes
- This separates flour products from flakes for better organization
- Maintains all existing product data and variants
- No impact on orders or other tables
*/

-- Add 'flour' to the product_category enum
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'flour';

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