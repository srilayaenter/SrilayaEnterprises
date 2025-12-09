/*
# Add Loyalty Points Wrapper Functions

## Purpose
Create wrapper functions `add_loyalty_points` and `deduct_loyalty_points` that are called by the frontend code.
These functions provide a simpler interface for manually adding/deducting points without requiring order context.

## Problem
Checkout.tsx calls `add_loyalty_points` and `deduct_loyalty_points` but these functions don't exist.
The existing functions are `award_loyalty_points` (requires order_id and order_amount) and `redeem_loyalty_points` (requires order_id).

## Solution
Create new wrapper functions that:
1. `add_loyalty_points` - Manually add points with a custom description (no order required)
2. `deduct_loyalty_points` - Manually deduct points with a custom description (no order required)

## Security
- Both functions use SECURITY DEFINER to bypass RLS
- Input validation ensures data integrity
- Points balance cannot go negative

## Notes
- These are for manual point adjustments
- For order-based points, use `award_loyalty_points` and `redeem_loyalty_points`
*/

-- Function to manually add loyalty points (without order context)
CREATE OR REPLACE FUNCTION add_loyalty_points(
  p_user_id uuid,
  p_points integer,
  p_description text DEFAULT 'Points added'
)
RETURNS integer AS $$
DECLARE
  expires_date timestamptz;
BEGIN
  -- Validate points amount
  IF p_points <= 0 THEN
    RAISE EXCEPTION 'Points must be greater than 0';
  END IF;
  
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
    p_points,
    'earned',
    NULL,  -- No order context
    p_description,
    expires_date
  );
  
  -- Update user's points balance
  UPDATE profiles
  SET points_balance = points_balance + p_points
  WHERE id = p_user_id;
  
  RETURN p_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to manually deduct loyalty points (without order context)
CREATE OR REPLACE FUNCTION deduct_loyalty_points(
  p_user_id uuid,
  p_points integer,
  p_description text DEFAULT 'Points deducted'
)
RETURNS integer AS $$
DECLARE
  current_balance integer;
BEGIN
  -- Validate points amount
  IF p_points <= 0 THEN
    RAISE EXCEPTION 'Points must be greater than 0';
  END IF;
  
  -- Check current balance
  SELECT points_balance INTO current_balance
  FROM profiles
  WHERE id = p_user_id;
  
  -- Validate sufficient points
  IF current_balance < p_points THEN
    RAISE EXCEPTION 'Insufficient points balance. Current: %, Requested: %', current_balance, p_points;
  END IF;
  
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
    NULL,  -- No order context
    p_description
  );
  
  -- Update user's points balance
  UPDATE profiles
  SET points_balance = points_balance - p_points
  WHERE id = p_user_id;
  
  RETURN p_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON FUNCTION add_loyalty_points(uuid, integer, text) IS 
'Manually add loyalty points to a user account without order context';

COMMENT ON FUNCTION deduct_loyalty_points(uuid, integer, text) IS 
'Manually deduct loyalty points from a user account without order context';
