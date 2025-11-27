/*
# Add Admin Update Orders Policy

## Changes
1. Add policy to allow admins to update orders
2. This enables admins to change order status and other order details

## Security
- Only users with admin role can update orders
- Uses the is_admin() function to check permissions

## Notes
- Required for order management functionality in admin dashboard
*/

-- Add policy for admins to update orders
CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE 
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));
