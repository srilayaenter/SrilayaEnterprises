/*
# Add Idempotency to Loyalty Points Functions

## Purpose
Prevent duplicate loyalty point entries for the same order by adding idempotency checks.

## Problem
If `award_loyalty_points` is called multiple times for the same order (e.g., webhook retries, page refreshes),
it creates duplicate entries and doubles the points balance.

## Solution
Update `award_loyalty_points` to:
1. Check if points have already been awarded for this order
2. If yes, return the existing points amount without creating a new entry
3. If no, proceed with awarding points as normal

## Security
- Maintains SECURITY DEFINER for bypassing RLS
- Idempotency ensures data integrity
- Prevents accidental duplicate point awarding

## Notes
- Only affects `award_loyalty_points` (order-based)
- `add_loyalty_points` (manual) doesn't have order context, so can't be made idempotent this way
- `redeem_loyalty_points` already has balance checks
*/

-- Update award_loyalty_points to be idempotent
CREATE OR REPLACE FUNCTION award_loyalty_points(
  p_user_id uuid,
  p_order_id uuid,
  p_order_amount numeric
)
RETURNS integer AS $$
DECLARE
  points_to_award integer;
  expires_date timestamptz;
  existing_points integer;
BEGIN
  -- Check if points have already been awarded for this order
  SELECT points INTO existing_points
  FROM loyalty_points
  WHERE user_id = p_user_id
    AND order_id = p_order_id
    AND transaction_type = 'earned'
  LIMIT 1;
  
  -- If points already awarded, return the existing amount (idempotent)
  IF existing_points IS NOT NULL THEN
    RAISE NOTICE 'Points already awarded for order %. Returning existing amount: %', p_order_id, existing_points;
    RETURN existing_points;
  END IF;
  
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

-- Update redeem_loyalty_points to be idempotent
CREATE OR REPLACE FUNCTION redeem_loyalty_points(
  p_user_id uuid,
  p_order_id uuid,
  p_points integer
)
RETURNS numeric AS $$
DECLARE
  current_balance integer;
  discount_amount numeric;
  existing_redemption integer;
BEGIN
  -- Check if points have already been redeemed for this order
  SELECT ABS(points) INTO existing_redemption
  FROM loyalty_points
  WHERE user_id = p_user_id
    AND order_id = p_order_id
    AND transaction_type = 'redeemed'
  LIMIT 1;
  
  -- If points already redeemed, return the existing discount (idempotent)
  IF existing_redemption IS NOT NULL THEN
    discount_amount := calculate_points_discount(existing_redemption);
    RAISE NOTICE 'Points already redeemed for order %. Returning existing discount: %', p_order_id, discount_amount;
    RETURN discount_amount;
  END IF;
  
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

-- Add comments for documentation
COMMENT ON FUNCTION award_loyalty_points(uuid, uuid, numeric) IS 
'Award loyalty points for an order (idempotent - safe to call multiple times for same order)';

COMMENT ON FUNCTION redeem_loyalty_points(uuid, uuid, integer) IS 
'Redeem loyalty points for an order (idempotent - safe to call multiple times for same order)';
