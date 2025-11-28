/*
# Create Wishlists Table

## Purpose
Allow users to save favorite products for later viewing and purchase.

## Tables Created

### wishlists
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles) - Who saved the product
- `product_id` (uuid, references products) - Which product
- `variant_id` (uuid, references product_variants, optional) - Specific variant
- `created_at` (timestamptz) - When added to wishlist

## Security
- Enable RLS on wishlists table
- Users can only view and modify their own wishlist items
- Admins have full access

## Indexes
- user_id for user-based queries
- product_id for product-based queries
- Composite index on (user_id, product_id) for uniqueness

## Notes
- Each user can only add a product once to wishlist
- Deleting a product removes it from all wishlists
- Deleting a user removes their wishlist items
*/

-- Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create indexes for performance
CREATE INDEX idx_wishlists_user ON wishlists(user_id);
CREATE INDEX idx_wishlists_product ON wishlists(product_id);
CREATE INDEX idx_wishlists_user_product ON wishlists(user_id, product_id);

-- Enable RLS
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Users can view their own wishlist items
CREATE POLICY "Users can view own wishlist" ON wishlists
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Users can add to their own wishlist
CREATE POLICY "Users can add to own wishlist" ON wishlists
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can remove from their own wishlist
CREATE POLICY "Users can remove from own wishlist" ON wishlists
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Admins have full access
CREATE POLICY "Admins have full access to wishlists" ON wishlists
  FOR ALL TO authenticated USING (is_admin(auth.uid()));