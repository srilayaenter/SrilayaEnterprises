/*
# Create Product Reviews and Ratings System

## Purpose
Allow users to rate and review products they've purchased.

## Tables Created

### product_reviews
- `id` (uuid, primary key)
- `product_id` (uuid, references products) - Which product
- `user_id` (uuid, references profiles) - Who wrote the review
- `rating` (integer, 1-5) - Star rating
- `title` (text) - Review title
- `comment` (text) - Review text
- `verified_purchase` (boolean) - Did user actually buy this?
- `helpful_count` (integer) - How many found this helpful
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### review_votes
- `id` (uuid, primary key)
- `review_id` (uuid, references product_reviews)
- `user_id` (uuid, references profiles) - Who voted
- `created_at` (timestamptz)

## Security
- Enable RLS on both tables
- Users can view all reviews
- Users can only edit/delete their own reviews
- Users can vote once per review
- Admins have full access

## Indexes
- product_id for product-based queries
- user_id for user-based queries
- rating for sorting

## Notes
- One review per user per product
- Rating must be between 1 and 5
- Verified purchase checked against orders table
- Helpful count updated via trigger
*/

-- Create product_reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  verified_purchase boolean DEFAULT false,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create review_votes table
CREATE TABLE IF NOT EXISTS review_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES product_reviews(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Create indexes
CREATE INDEX idx_product_reviews_product ON product_reviews(product_id);
CREATE INDEX idx_product_reviews_user ON product_reviews(user_id);
CREATE INDEX idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX idx_review_votes_review ON review_votes(review_id);
CREATE INDEX idx_review_votes_user ON review_votes(user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_product_reviews_updated_at
  BEFORE UPDATE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

-- Everyone can view reviews
CREATE POLICY "Anyone can view reviews" ON product_reviews
  FOR SELECT TO authenticated USING (true);

-- Users can create reviews
CREATE POLICY "Users can create reviews" ON product_reviews
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON product_reviews
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews" ON product_reviews
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Everyone can view votes
CREATE POLICY "Anyone can view votes" ON review_votes
  FOR SELECT TO authenticated USING (true);

-- Users can vote on reviews
CREATE POLICY "Users can vote on reviews" ON review_votes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can remove their votes
CREATE POLICY "Users can remove own votes" ON review_votes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Admins have full access
CREATE POLICY "Admins have full access to reviews" ON product_reviews
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Admins have full access to votes" ON review_votes
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Function to update helpful_count when vote is added/removed
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE product_reviews
    SET helpful_count = helpful_count + 1
    WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE product_reviews
    SET helpful_count = helpful_count - 1
    WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update helpful_count
CREATE TRIGGER update_helpful_count_on_vote
  AFTER INSERT OR DELETE ON review_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_review_helpful_count();

-- Function to check if user purchased product
CREATE OR REPLACE FUNCTION check_verified_purchase(p_user_id uuid, p_product_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.user_id = p_user_id
      AND o.status = 'completed'
      AND EXISTS (
        SELECT 1
        FROM jsonb_array_elements(o.items) AS item
        WHERE (item->>'product_id')::uuid = p_product_id
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get average rating for a product
CREATE OR REPLACE FUNCTION get_product_average_rating(p_product_id uuid)
RETURNS numeric AS $$
DECLARE
  avg_rating numeric;
BEGIN
  SELECT ROUND(AVG(rating)::numeric, 1)
  INTO avg_rating
  FROM product_reviews
  WHERE product_id = p_product_id;
  
  RETURN COALESCE(avg_rating, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get review count for a product
CREATE OR REPLACE FUNCTION get_product_review_count(p_product_id uuid)
RETURNS integer AS $$
DECLARE
  review_count integer;
BEGIN
  SELECT COUNT(*)
  INTO review_count
  FROM product_reviews
  WHERE product_id = p_product_id;
  
  RETURN COALESCE(review_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;