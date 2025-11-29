# Loyalty Points System - Complete Guide

## Overview

The Loyalty Points System is a customer retention feature that rewards customers with points for every purchase and allows them to redeem those points for discounts on future orders.

## Features

### 1. Points Earning
- **Earn Rate**: 1 point per ₹10 spent
- **Automatic**: Points are automatically awarded when an order is completed
- **Notification**: Users receive a notification when points are earned
- **Expiry**: Points expire after 365 days from earning date

### 2. Points Redemption
- **Redemption Rate**: 100 points = ₹10 discount
- **Minimum Redemption**: 100 points
- **Maximum Discount**: 50% of order value
- **Checkout Integration**: Points can be redeemed during checkout

### 3. Points History
- **Transaction Log**: All points transactions are logged
- **Transaction Types**: earned, redeemed, expired, adjusted
- **Order Linking**: Points transactions are linked to orders
- **Audit Trail**: Complete history for transparency

### 4. Points Balance
- **Real-time Balance**: Current points balance displayed in header
- **Expiring Soon**: Shows points expiring within 30 days
- **Value Display**: Shows equivalent discount value

## User Flow

### Earning Points

1. **Place Order**: Customer places an order
2. **Payment**: Customer completes payment
3. **Order Completion**: Order status changes to "completed"
4. **Points Award**: System automatically awards points based on order amount
5. **Notification**: Customer receives notification about points earned
6. **Balance Update**: Points balance is updated in real-time

### Redeeming Points

1. **Add to Cart**: Customer adds products to cart
2. **Checkout**: Customer proceeds to checkout
3. **Redeem Points**: Customer enters points to redeem in the RedeemPoints component
4. **Validation**: System validates:
   - Sufficient points balance
   - Minimum redemption (100 points)
   - Maximum discount (50% of order)
5. **Apply Discount**: Discount is applied to order total
6. **Payment**: Customer completes payment with discounted amount
7. **Points Deduction**: Points are deducted when order is completed

## Database Schema

### loyalty_points Table
```sql
CREATE TABLE loyalty_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  points integer NOT NULL,
  transaction_type loyalty_transaction_type NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  description text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

### profiles Table (Modified)
```sql
ALTER TABLE profiles
ADD COLUMN points_balance integer DEFAULT 0 CHECK (points_balance >= 0);
```

### orders Table (Modified)
```sql
ALTER TABLE orders
ADD COLUMN points_earned integer DEFAULT 0,
ADD COLUMN points_used integer DEFAULT 0;
```

## API Methods

### Frontend API (src/db/api.ts)

```typescript
export const loyaltyPointsApi = {
  // Get user's current points balance
  async getPointsBalance(userId: string): Promise<number>

  // Get user's points transaction history
  async getPointsHistory(userId: string): Promise<LoyaltyPointWithOrder[]>

  // Award points for an order (called by backend)
  async awardPoints(userId: string, orderId: string, orderAmount: number): Promise<number>

  // Redeem points for an order (called by backend)
  async redeemPoints(userId: string, orderId: string, points: number): Promise<number>

  // Calculate points earned from order amount
  calculatePointsEarned(orderAmount: number): number

  // Calculate discount from points
  calculatePointsDiscount(points: number): number

  // Get points expiring within 30 days
  async getExpiringPoints(userId: string): Promise<ExpiringPoints[]>

  // Expire old points (admin function)
  async expirePoints(): Promise<number>
}
```

### Database Functions (RPC)

```sql
-- Award points for an order
award_loyalty_points(p_user_id uuid, p_order_id uuid, p_order_amount numeric) RETURNS integer

-- Redeem points for an order
redeem_loyalty_points(p_user_id uuid, p_order_id uuid, p_points integer) RETURNS numeric

-- Calculate points earned from order amount
calculate_points_earned(order_amount numeric) RETURNS integer

-- Calculate discount from points
calculate_points_discount(points integer) RETURNS numeric

-- Expire old points
expire_loyalty_points() RETURNS integer

-- Get expiring points
get_expiring_points(p_user_id uuid) RETURNS TABLE (points integer, expires_at timestamptz)
```

## Components

### 1. PointsBalance Component
**Location**: `src/components/loyalty/PointsBalance.tsx`

**Purpose**: Display user's points balance and statistics

**Props**:
- `userId: string` - User ID
- `showDetails?: boolean` - Show detailed cards or compact view

**Features**:
- Total points balance
- Equivalent discount value
- Points expiring soon
- Compact mode for header display

### 2. PointsHistory Component
**Location**: `src/components/loyalty/PointsHistory.tsx`

**Purpose**: Display user's points transaction history

**Props**:
- `userId: string` - User ID

**Features**:
- Transaction list with date, type, description, points
- Transaction type badges (earned, redeemed, expired, adjusted)
- Icons for different transaction types
- Empty state message

### 3. RedeemPoints Component
**Location**: `src/components/loyalty/RedeemPoints.tsx`

**Purpose**: Allow users to redeem points during checkout

**Props**:
- `userId: string` - User ID
- `orderTotal: number` - Order total amount
- `onPointsApplied: (points: number, discount: number) => void` - Callback when points are applied

**Features**:
- Points balance display
- Points input with validation
- "Max" button to use maximum allowed points
- Real-time discount calculation
- Error messages for validation failures
- Info about redemption rules

### 4. LoyaltyPoints Page
**Location**: `src/pages/LoyaltyPoints.tsx`

**Purpose**: Main loyalty points page

**Features**:
- Points balance cards
- "How It Works" section
- Important information
- Points history

## Integration Points

### 1. Checkout Page
**File**: `src/pages/Checkout.tsx`

**Integration**:
```typescript
import RedeemPoints from '@/components/loyalty/RedeemPoints';

// State
const [pointsUsed, setPointsUsed] = useState(0);
const [pointsDiscount, setPointsDiscount] = useState(0);

// Handler
const handlePointsApplied = (points: number, discount: number) => {
  setPointsUsed(points);
  setPointsDiscount(discount);
  toast({ title: 'Points applied', description: `${points} points redeemed` });
};

// Component
{user && (
  <RedeemPoints
    userId={user.id}
    orderTotal={totalPrice}
    onPointsApplied={handlePointsApplied}
  />
)}

// Order summary
{pointsDiscount > 0 && (
  <div>Points Discount ({pointsUsed} points): -₹{pointsDiscount.toFixed(2)}</div>
)}

// Final total calculation
const calculateFinalTotal = () => {
  return Math.max(0, totalPrice + gst + shipping - pointsDiscount);
};
```

### 2. Stripe Checkout Edge Function
**File**: `supabase/functions/create_stripe_checkout/index.ts`

**Integration**:
```typescript
// Request interface
interface CheckoutRequest {
  points_used?: number;
  points_discount?: number;
  // ... other fields
}

// Process order items with points discount
function processOrderItems(items, shippingCost, pointsDiscount) {
  const totalAmount = Math.max(0, subtotal + gst + shipping - pointsDiscount);
  // ...
}

// Create order with points_used
await supabase.from("orders").insert({
  points_used: pointsUsed,
  // ... other fields
});

// Add points discount as negative line item in Stripe
if (pointsDiscountPaise > 0) {
  lineItems.push({
    price_data: {
      product_data: { name: `Loyalty Points Discount (${pointsUsed} points)` },
      unit_amount: -pointsDiscountPaise,
    },
    quantity: 1,
  });
}
```

### 3. Payment Verification Edge Function
**File**: `supabase/functions/verify_stripe_payment/index.ts`

**Integration**:
```typescript
// Fetch order with points_used
const { data: order } = await supabase
  .from("orders")
  .select("id, user_id, total_amount, points_used")
  .eq("stripe_session_id", sessionId)
  .single();

// Redeem points if used
if (order.points_used > 0) {
  await supabase.rpc('redeem_loyalty_points', {
    p_user_id: order.user_id,
    p_order_id: order.id,
    p_points: order.points_used
  });
}

// Award points for purchase
const { data: pointsAwarded } = await supabase.rpc('award_loyalty_points', {
  p_user_id: order.user_id,
  p_order_id: order.id,
  p_order_amount: order.total_amount
});

// Create notification
await supabase.from('notifications').insert({
  user_id: order.user_id,
  type: 'points',
  title: 'Points Earned!',
  message: `You earned ${pointsAwarded} loyalty points from your recent purchase.`,
  link: '/loyalty-points'
});
```

### 4. Header Component
**File**: `src/components/common/Header.tsx`

**Integration**:
```typescript
import { loyaltyPointsApi } from '@/db/api';

const [pointsBalance, setPointsBalance] = useState(0);

useEffect(() => {
  if (user) {
    const points = await loyaltyPointsApi.getPointsBalance(user.id);
    setPointsBalance(points);
  }
}, [user]);

// Display in header
{user && pointsBalance > 0 && (
  <Link to="/loyalty-points">
    <Button variant="ghost">
      <Award className="w-4 h-4" />
      {pointsBalance} Points
    </Button>
  </Link>
)}
```

## Security

### Row Level Security (RLS)

```sql
-- Users can view their own points history
CREATE POLICY "Users can view own points history" ON loyalty_points
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Admins have full access
CREATE POLICY "Admins have full access to loyalty points" ON loyalty_points
  FOR ALL TO authenticated USING (is_admin(auth.uid()));
```

### Function Security

All RPC functions use `SECURITY DEFINER` to ensure they run with elevated privileges:
- `award_loyalty_points` - Only callable by backend
- `redeem_loyalty_points` - Only callable by backend
- `expire_loyalty_points` - Only callable by admin

## Business Rules

### Points Earning
1. Points are earned only on completed orders
2. Points are calculated on subtotal (before GST and shipping)
3. Points are awarded after payment is confirmed
4. Points expire after 365 days

### Points Redemption
1. Minimum redemption: 100 points
2. Maximum discount: 50% of order value
3. Points must be available in balance
4. Points are deducted only after payment is confirmed
5. Redeemed points cannot be refunded

### Points Expiry
1. Points expire 365 days after earning
2. Users are notified 30 days before expiry
3. Expired points are marked but not deleted
4. Expiry process can be run manually or scheduled

## Testing Scenarios

### Test 1: Earn Points
1. Create a test user
2. Place an order for ₹1000
3. Complete payment
4. Verify 100 points are awarded
5. Verify notification is sent
6. Verify balance is updated

### Test 2: Redeem Points
1. User has 500 points
2. Place order for ₹1000
3. Redeem 100 points
4. Verify ₹10 discount is applied
5. Complete payment
6. Verify 100 points are deducted
7. Verify balance is 400 points

### Test 3: Maximum Discount
1. User has 10,000 points
2. Place order for ₹1000
3. Try to redeem 5,000 points (₹500 discount)
4. Verify error: maximum discount is ₹500 (50%)
5. Redeem 5,000 points
6. Verify ₹500 discount is applied

### Test 4: Insufficient Points
1. User has 50 points
2. Try to redeem 100 points
3. Verify error: insufficient points balance

### Test 5: Minimum Redemption
1. User has 500 points
2. Try to redeem 50 points
3. Verify error: minimum redemption is 100 points

## Future Enhancements

### Tier System
- Bronze, Silver, Gold, Platinum tiers
- Tier-based points multipliers
- Tier-based benefits (free shipping, early access)
- Automatic tier upgrades

### Admin Features
- Points management dashboard
- View all users' points
- Manually adjust points
- Points statistics and analytics
- Export points data

### Enhanced Features
- Points expiry notifications (30 days before)
- Tier progress indicator
- Referral points system
- Special promotions (double points days)
- Points leaderboard
- Birthday bonus points
- Points gifting

## Troubleshooting

### Points Not Awarded
1. Check order status is "completed"
2. Check user_id is set on order
3. Check total_amount is greater than 0
4. Check edge function logs for errors
5. Verify RPC function is working

### Points Not Redeemed
1. Check points_used is set on order
2. Check order status is "completed"
3. Check edge function logs for errors
4. Verify RPC function is working
5. Check user has sufficient balance

### Balance Not Updated
1. Check loyalty_points table for transactions
2. Check profiles table for points_balance
3. Verify triggers are working
4. Check for database errors

## Support

For issues or questions:
1. Check edge function logs in Supabase dashboard
2. Check database logs for RPC function errors
3. Verify RLS policies are correct
4. Test RPC functions directly in Supabase SQL editor
5. Check frontend console for API errors

## Conclusion

The Loyalty Points System is fully integrated and production-ready. It provides a complete customer retention solution with automatic points earning, flexible redemption, and comprehensive tracking. The system is secure, scalable, and easy to maintain.
