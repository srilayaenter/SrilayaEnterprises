/*
# Add Flour Category - Step 1

## Plain English Explanation
This migration adds "flour" as a new product category enum value.

## Changes Made
1. Add 'flour' to product_category enum

## Notes
- Enum values must be added in a separate transaction before use
- Step 2 will update products to use this category
*/

-- Add 'flour' to the product_category enum
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'flour';