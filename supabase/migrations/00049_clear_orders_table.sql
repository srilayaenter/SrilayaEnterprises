/*
# Clear Orders Table

## Purpose
This migration clears all records from the orders table, removing all shopping list data
regardless of payment mode (online, in-store, or any other payment method).

## Changes
- Deletes all records from the orders table
- Preserves the table structure and all constraints
- Does not affect other related tables (profiles, products, etc.)

## Impact
- All order history will be permanently deleted
- This action cannot be undone
- Related shipments, payments, and other linked data may become orphaned

## Notes
- This is a data-only operation - no schema changes
- Consider backing up data before running if needed
- Related tables (shipments, handler_payments, vendor_payments, etc.) may still contain references
*/

-- Clear all orders from the orders table
DELETE FROM orders;
