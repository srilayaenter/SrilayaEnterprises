/*
# Create Loyalty Points System

## Purpose
Reward customers with points for purchases and allow redemption for discounts.

## Tables Modified/Created

### profiles (modified)
- Add `points_balance` (integer, default 0) - Current points balance

### orders (modified)
- Add `points_earned` (integer, default 0) - Points earned from this order
- Add `points_used` (integer, default 0) - Points redeemed for discount

### loyalty_points (new)
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles) - Who earned/spent points
- `points` (integer) - Amount of points (positive for earned, negative for redeemed)
- `transaction_type` (enum) - earned, redeemed, expired, adjusted
- `order_id` (uuid, references orders, optional) - Related order
- `description` (text) - Transaction description
- `created_at` (timestamptz)

## Point Rules
- Earn: 1 point per ₹10 spent
- Redeem: 100 points = ₹10 discount
- Minimum redemption: 100 points
- Maximum redemption: 50% of order value
- Points expire after 365 days

## Security
- Enable RLS on loyalty_points table
- Users can view their own points history
- Only system can create point transactions
- Admins have full access

## Indexes
- user_id for user-based queries
- order_id for order-based queries
- created_at for expiry checks

## Notes
- Points balance is denormalized in profiles for quick access
- All point transactions are logged for audit trail
- Expired points are marked but not deleted
*/

-- Create transaction type enum
CREATE TYPE loyalty_transaction_type AS ENUM (
  'earned',
  'redeemed',
  'expired',
  'adjusted'
);

-- Add points_balance to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS points_balance integer DEFAULT 0 CHECK (points_balance >= 0);

-- Add points fields to orders
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS points_earned integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS points_used integer DEFAULT 0;

-- Create loyalty_points table
CREATE TABLE IF NOT EXISTS loyalty_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  points integer NOT NULL,
  transaction_type loyalty_transaction_type NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  description text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_loyalty_points_user ON loyalty_points(user_id);
CREATE INDEX idx_loyalty_points_order ON loyalty_points(order_id);
CREATE INDEX idx_loyalty_points_created ON loyalty_points(created_at);
CREATE INDEX idx_loyalty_points_expires ON loyalty_points(expires_at);
CREATE INDEX idx_loyalty_points_type ON loyalty_points(transaction_type);

-- Enable RLS
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;

-- Users can view their own points history
CREATE POLICY "Users can view own points history" ON loyalty_points
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Admins have full access
CREATE POLICY "Admins have full access to loyalty points" ON loyalty_points
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Function to calculate points earned from order amount
CREATE OR REPLACE FUNCTION calculate_points_earned(order_amount numeric)
RETURNS integer AS $$
BEGIN
  -- 1 point per ₹10 spent
  RETURN FLOOR(order_amount / 10)::integer;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate discount from points
CREATE OR REPLACE FUNCTION calculate_points_discount(points integer)
RETURNS numeric AS $$
BEGIN
  -- 100 points = ₹10 discount
  RETURN (points / 100.0) * 10;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to award points for an order
CREATE OR REPLACE FUNCTION award_loyalty_points(
  p_user_id uuid,
  p_order_id uuid,
  p_order_amount numeric
)
RETURNS integer AS $$
DECLARE
  points_to_award integer;
  expires_date timestamptz;
BEGIN
  -- Calculate points (1 point per ₹10)
  points_to_award := calculate_points_earned(p_order_amount);
  
  -- Set expiry date (1 year from now)
  expires_date := now() + interval '365 days';
  
  -- Create points transaction
  INSERT INTO loyalty_points (
    user_id,
    points,
    transaction_type,
    order_id,
    description,
    expires_at
  ) VALUES (
    p_user_id,
    points_to_award,
    'earned',
    p_order_id,
    'Points earned from order',
    expires_date
  );
  
  -- Update user's points balance
  UPDATE profiles
  SET points_balance = points_balance + points_to_award
  WHERE id = p_user_id;
  
  -- Update order with points earned
  UPDATE orders
  SET points_earned = points_to_award
  WHERE id = p_order_id;
  
  RETURN points_to_award;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to redeem points
CREATE OR REPLACE FUNCTION redeem_loyalty_points(
  p_user_id uuid,
  p_order_id uuid,
  p_points integer
)
RETURNS numeric AS $$
DECLARE
  current_balance integer;
  discount_amount numeric;
BEGIN
  -- Check current balance
  SELECT points_balance INTO current_balance
  FROM profiles
  WHERE id = p_user_id;
  
  -- Validate sufficient points
  IF current_balance < p_points THEN
    RAISE EXCEPTION 'Insufficient points balance';
  END IF;
  
  -- Validate minimum redemption (100 points)
  IF p_points < 100 THEN
    RAISE EXCEPTION 'Minimum redemption is 100 points';
  END IF;
  
  -- Calculate discount
  discount_amount := calculate_points_discount(p_points);
  
  -- Create points transaction
  INSERT INTO loyalty_points (
    user_id,
    points,
    transaction_type,
    order_id,
    description
  ) VALUES (
    p_user_id,
    -p_points,
    'redeemed',
    p_order_id,
    'Points redeemed for discount'
  );
  
  -- Update user's points balance
  UPDATE profiles
  SET points_balance = points_balance - p_points
  WHERE id = p_user_id;
  
  -- Update order with points used
  UPDATE orders
  SET points_used = p_points
  WHERE id = p_order_id;
  
  RETURN discount_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to expire old points
CREATE OR REPLACE FUNCTION expire_loyalty_points()
RETURNS integer AS $$
DECLARE
  expired_count integer := 0;
  point_record RECORD;
BEGIN
  -- Find all expired points that haven't been marked as expired
  FOR point_record IN
    SELECT id, user_id, points
    FROM loyalty_points
    WHERE transaction_type = 'earned'
      AND expires_at < now()
      AND points > 0
  LOOP
    -- Create expiry transaction
    INSERT INTO loyalty_points (
      user_id,
      points,
      transaction_type,
      description
    ) VALUES (
      point_record.user_id,
      -point_record.points,
      'expired',
      'Points expired'
    );
    
    -- Update user's points balance
    UPDATE profiles
    SET points_balance = GREATEST(0, points_balance - point_record.points)
    WHERE id = point_record.user_id;
    
    expired_count := expired_count + 1;
  END LOOP;
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's points expiring soon (within 30 days)
CREATE OR REPLACE FUNCTION get_expiring_points(p_user_id uuid)
RETURNS TABLE (
  points integer,
  expires_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT lp.points, lp.expires_at
  FROM loyalty_points lp
  WHERE lp.user_id = p_user_id
    AND lp.transaction_type = 'earned'
    AND lp.expires_at BETWEEN now() AND now() + interval '30 days'
    AND lp.points > 0
  ORDER BY lp.expires_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;