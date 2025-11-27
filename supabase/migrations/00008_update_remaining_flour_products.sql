/*
# Update Remaining Flour Products

## Plain English Explanation
This migration updates the remaining 4 flour products that were stored individually.

## Products Being Recategorized
- Foxtail Flour
- Little Flour
- Browntop Flour
- Barnyard Flour

## Notes
- Completes the flour category migration
- All 10 flour products now properly categorized
*/

-- Update remaining flour products
UPDATE products 
SET category = 'flour'::product_category
WHERE name IN (
  'Foxtail Flour',
  'Little Flour',
  'Browntop Flour',
  'Barnyard Flour'
);