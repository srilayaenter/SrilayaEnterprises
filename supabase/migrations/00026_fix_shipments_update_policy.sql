/*
# Fix Shipments Update Policy

## Issue
The "Admins have full access to shipments" policy was not allowing UPDATE operations because the `with_check` clause was null.

## Changes
1. Drop the existing admin policy
2. Recreate it with proper USING and WITH CHECK clauses
3. This ensures admins can both read and write to all shipments

## Security
- Only users with admin role can update shipments
- Uses the existing is_admin() function to verify admin status
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Admins have full access to shipments" ON shipments;

-- Recreate with proper WITH CHECK clause
CREATE POLICY "Admins have full access to shipments" ON shipments
  FOR ALL 
  TO authenticated 
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));
