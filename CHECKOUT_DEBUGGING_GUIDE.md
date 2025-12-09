# Checkout Debugging Guide

## Issue Reported
**Problem**: Clicking "Proceed to Payment" button redirects to home page with no action taken.

## Root Cause Analysis

### Potential Causes Identified

1. **Silent Failures**: Errors occurring without user feedback
2. **Pop-up Blockers**: Stripe checkout window blocked by browser
3. **Missing Toast Notifications**: No feedback after Stripe checkout creation
4. **Cart Clearing Issues**: Cart being cleared prematurely causing redirect
5. **Validation Failures**: Form validation failing silently

## Fixes Implemented

### 1. Added Console Logging
**Purpose**: Track execution flow and identify where failures occur

**Logs Added**:
```typescript
console.log('Checkout started', { orderType, paymentMethod, items: items.length });
console.log('Updating profile...');
console.log('Creating in-store order...');
console.log('Order created:', order?.id);
console.log('Navigating to payment success...');
console.log('Creating Stripe checkout...');
console.log('Stripe response:', data);
console.error('Order creation error:', error);
console.error('Stripe checkout error:', error);
console.error('Checkout error:', error);
```

**How to Use**:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Click "Proceed to Payment"
4. Watch console logs to see where process stops

### 2. Enhanced Error Handling
**Purpose**: Catch and display all errors to user

**Changes**:
- Added error logging for order creation
- Added error logging for Stripe checkout
- Added error logging for general checkout failures
- All errors now show toast notifications

### 3. Pop-up Blocker Detection
**Purpose**: Detect when browser blocks Stripe checkout window

**Implementation**:
```typescript
const stripeWindow = window.open(data.data.url, '_blank');

if (stripeWindow) {
  toast({
    title: 'Redirecting to payment',
    description: 'Please complete your payment in the new tab',
  });
} else {
  toast({
    title: 'Pop-up blocked',
    description: 'Please allow pop-ups and try again',
    variant: 'destructive',
  });
}
```

**User Action Required**:
- If pop-up is blocked, user will see error message
- User must allow pop-ups for the site
- User must click "Proceed to Payment" again

### 4. Missing URL Validation
**Purpose**: Ensure Stripe returns a valid checkout URL

**Implementation**:
```typescript
if (data?.data?.url) {
  // Open Stripe checkout
} else {
  throw new Error('No checkout URL received');
}
```

### 5. Success Feedback for Stripe Checkout
**Purpose**: Inform user that Stripe checkout is opening

**Implementation**:
- Toast notification when Stripe window opens successfully
- Clear message to complete payment in new tab
- User stays on checkout page until they complete payment

---

## Debugging Steps

### Step 1: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Clear console
4. Click "Proceed to Payment"
5. Look for:
   - "Checkout started" log
   - Any error messages in red
   - "Creating Stripe checkout..." or "Creating in-store order..."
   - Stripe response data

### Step 2: Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Click "Proceed to Payment"
4. Look for:
   - Request to `create_stripe_checkout` function
   - Response status (should be 200)
   - Response data (should contain URL)

### Step 3: Check Form Validation
**For Online Orders**:
- ✅ Name filled
- ✅ Email filled
- ✅ Phone filled
- ✅ Address filled
- ✅ City filled
- ✅ State filled
- ✅ Shipping cost calculated (not 0)

**For In-Store Orders**:
- ✅ Name filled
- ✅ Email filled
- ✅ Phone filled
- ✅ Payment method selected

**For Split Payment**:
- ✅ Cash amount entered
- ✅ Digital amount entered
- ✅ Cash + Digital = Total amount

### Step 4: Check Pop-up Blocker
1. Look for pop-up blocked icon in address bar
2. Check if toast shows "Pop-up blocked" message
3. Allow pop-ups for the site
4. Try again

### Step 5: Check Supabase Edge Function
1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Check `create_stripe_checkout` function logs
4. Look for errors or failures

---

## Common Issues & Solutions

### Issue 1: Button Does Nothing
**Symptoms**:
- Click button, nothing happens
- No toast notification
- No console logs

**Possible Causes**:
- Button is disabled
- Form validation failing
- JavaScript error preventing execution

**Solution**:
1. Check if button is disabled (grayed out)
2. Fill in all required fields
3. Check console for JavaScript errors
4. Check if `handleCheckout` function is defined

### Issue 2: "Pop-up Blocked" Message
**Symptoms**:
- Toast shows "Pop-up blocked"
- No Stripe checkout window opens

**Solution**:
1. Click pop-up blocked icon in address bar
2. Select "Always allow pop-ups from this site"
3. Click "Proceed to Payment" again

### Issue 3: "Checkout Failed" Message
**Symptoms**:
- Toast shows "Checkout failed"
- Error message displayed

**Possible Causes**:
- Supabase Edge Function error
- Network error
- Invalid data

**Solution**:
1. Check console for detailed error
2. Check network tab for failed requests
3. Check Supabase Edge Function logs
4. Verify all form data is valid

### Issue 4: Redirects to Home Page
**Symptoms**:
- Click button, page redirects to home
- No error message

**Possible Causes**:
- Cart is empty (items.length === 0)
- Navigation triggered incorrectly
- Error in routing

**Solution**:
1. Check console for "Checkout started" log
2. Verify items.length > 0
3. Check if cart was cleared prematurely
4. Check browser console for errors

### Issue 5: Stripe Window Opens But Closes Immediately
**Symptoms**:
- Stripe window flashes and closes
- No payment page shown

**Possible Causes**:
- Invalid Stripe session
- Expired checkout URL
- Browser security settings

**Solution**:
1. Check Stripe dashboard for session creation
2. Verify Stripe API keys are correct
3. Check browser security settings
4. Try different browser

---

## Testing Checklist

### Online Order with Card Payment
1. [ ] Add items to cart
2. [ ] Go to checkout
3. [ ] Select "Online Order"
4. [ ] Fill in all shipping information
5. [ ] Click "Calculate Shipping"
6. [ ] Verify shipping cost is calculated
7. [ ] Click "Proceed to Payment"
8. [ ] Check console for "Checkout started" log
9. [ ] Check console for "Creating Stripe checkout..." log
10. [ ] Check console for "Stripe response" log
11. [ ] Verify toast shows "Redirecting to payment"
12. [ ] Verify Stripe window opens in new tab
13. [ ] Complete payment in Stripe
14. [ ] Verify redirect to payment success page

### In-Store Order with Cash Payment
1. [ ] Add items to cart
2. [ ] Go to checkout
3. [ ] Select "In-Store Purchase"
4. [ ] Verify payment method is "Cash"
5. [ ] Fill in name, email, phone
6. [ ] Click "Proceed to Payment"
7. [ ] Check console for "Checkout started" log
8. [ ] Check console for "Creating in-store order..." log
9. [ ] Check console for "Order created" log
10. [ ] Check console for "Navigating to payment success..." log
11. [ ] Verify redirect to payment success page
12. [ ] Verify order confirmation displayed

### In-Store Order with UPI Payment
1. [ ] Add items to cart
2. [ ] Go to checkout
3. [ ] Select "In-Store Purchase"
4. [ ] Select "UPI" payment method
5. [ ] Fill in name, email, phone
6. [ ] Click "Proceed to Payment"
7. [ ] Verify immediate confirmation
8. [ ] Verify order details displayed

### In-Store Order with Card Payment
1. [ ] Add items to cart
2. [ ] Go to checkout
3. [ ] Select "In-Store Purchase"
4. [ ] Select "Card" payment method
5. [ ] Fill in name, email, phone
6. [ ] Click "Proceed to Payment"
7. [ ] Check console for "Creating Stripe checkout..." log
8. [ ] Verify toast shows "Redirecting to payment"
9. [ ] Verify Stripe window opens
10. [ ] Complete payment
11. [ ] Verify redirect to payment success page

### In-Store Order with Split Payment
1. [ ] Add items to cart
2. [ ] Go to checkout
3. [ ] Select "In-Store Purchase"
4. [ ] Select "Split Payment" method
5. [ ] Fill in name, email, phone
6. [ ] Enter cash amount
7. [ ] Enter digital amount
8. [ ] Verify total matches order total
9. [ ] Click "Proceed to Payment"
10. [ ] Verify immediate confirmation
11. [ ] Verify payment details shown

---

## Console Log Examples

### Successful In-Store Cash Order
```
Checkout started {orderType: 'instore', paymentMethod: 'cash', items: 3}
Updating profile...
Creating in-store order...
Order created: abc123-def456-ghi789
Navigating to payment success...
```

### Successful Online Order
```
Checkout started {orderType: 'online', paymentMethod: 'card', items: 2}
Updating profile...
Creating Stripe checkout...
Stripe response: {data: {url: 'https://checkout.stripe.com/...'}}
```

### Failed Order (Missing Info)
```
Checkout started {orderType: 'online', paymentMethod: 'card', items: 2}
(No further logs - validation failed)
```

### Failed Order (Stripe Error)
```
Checkout started {orderType: 'online', paymentMethod: 'card', items: 2}
Updating profile...
Creating Stripe checkout...
Stripe checkout error: Error: Failed to create checkout session
Checkout error: Error: Failed to create checkout session
```

### Failed Order (RPC Error)
```
Checkout started {orderType: 'instore', paymentMethod: 'cash', items: 3}
Updating profile...
Creating in-store order...
Order creation error: {code: 'PGRST...", message: '...'}
Checkout error: Error: ...
```

---

## Browser-Specific Issues

### Chrome
**Pop-up Blocker**:
- Icon appears in address bar (right side)
- Click icon → "Always allow pop-ups"

**Console Access**:
- F12 or Ctrl+Shift+I
- Or: Right-click → Inspect → Console tab

### Firefox
**Pop-up Blocker**:
- Yellow bar at top of page
- Click "Preferences" → "Allow pop-ups"

**Console Access**:
- F12 or Ctrl+Shift+K
- Or: Menu → Web Developer → Browser Console

### Safari
**Pop-up Blocker**:
- Settings → Websites → Pop-up Windows
- Allow for your site

**Console Access**:
- Cmd+Option+C
- Or: Develop → Show JavaScript Console

### Edge
**Pop-up Blocker**:
- Similar to Chrome
- Icon in address bar

**Console Access**:
- F12 or Ctrl+Shift+I
- Or: Menu → More tools → Developer tools

---

## Network Request Details

### Stripe Checkout Request
**Endpoint**: `https://[project-ref].supabase.co/functions/v1/create_stripe_checkout`

**Method**: POST

**Headers**:
```
Content-Type: application/json
Authorization: Bearer [anon-key]
```

**Body**:
```json
{
  "items": [...],
  "order_type": "online" | "instore",
  "shipping_cost": 0,
  "points_used": 0,
  "points_discount": 0,
  "customer_info": {...},
  "currency": "inr",
  "payment_method_types": ["card"]
}
```

**Expected Response**:
```json
{
  "data": {
    "url": "https://checkout.stripe.com/c/pay/..."
  }
}
```

### Create Order RPC Request
**Endpoint**: `https://[project-ref].supabase.co/rest/v1/rpc/create_order`

**Method**: POST

**Headers**:
```
Content-Type: application/json
Authorization: Bearer [anon-key]
apikey: [anon-key]
```

**Body**:
```json
{
  "p_user_id": "uuid" | null,
  "p_items": [...],
  "p_total_amount": 1000,
  "p_gst_rate": 5,
  "p_gst_amount": 50,
  "p_shipping_cost": 0,
  "p_points_used": 0,
  "p_currency": "inr",
  "p_status": "completed",
  "p_order_type": "instore",
  "p_payment_method": "cash" | "upi" | "card" | "split",
  "p_payment_details": {...} | null,
  "p_customer_name": "...",
  "p_customer_email": "...",
  "p_customer_phone": "...",
  "p_completed_at": "2025-01-01T00:00:00Z"
}
```

**Expected Response**:
```json
{
  "id": "uuid",
  "user_id": "uuid" | null,
  "items": [...],
  "total_amount": 1000,
  ...
}
```

---

## Supabase Edge Function Debugging

### Check Function Logs
1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Click on `create_stripe_checkout`
4. View logs tab
5. Look for recent invocations
6. Check for errors

### Common Edge Function Errors
1. **Missing Stripe API Key**: Check secrets
2. **Invalid Stripe Session**: Check Stripe dashboard
3. **Network Timeout**: Check function timeout settings
4. **CORS Error**: Check function CORS configuration

---

## Quick Fixes

### Fix 1: Clear Browser Cache
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

### Fix 2: Allow Pop-ups
1. Click pop-up blocked icon in address bar
2. Select "Always allow"
3. Refresh page

### Fix 3: Check Stripe Keys
1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Check secrets
4. Verify `STRIPE_SECRET_KEY` is set

### Fix 4: Verify RPC Function
```sql
-- Run in Supabase SQL Editor
SELECT * FROM pg_proc WHERE proname = 'create_order';
```

### Fix 5: Check RLS Policies
```sql
-- Run in Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'orders';
```

---

## Support Information

### Files Modified
- `src/pages/Checkout.tsx` - Added logging and error handling

### Related Files
- `src/pages/PaymentSuccess.tsx` - Confirmation page
- `supabase/functions/create_stripe_checkout/index.ts` - Stripe integration
- `supabase/migrations/*_add_create_order_rpc.sql` - Order creation RPC

### Documentation
- `CHECKOUT_IMPROVEMENTS.md` - Feature improvements
- `CHECKOUT_FIX_SUMMARY.md` - Quick reference
- `CHECKOUT_DEBUGGING_GUIDE.md` - This file

---

## Next Steps

1. **Test the checkout flow** with console open
2. **Share console logs** if issue persists
3. **Check network tab** for failed requests
4. **Verify Supabase Edge Function** is deployed
5. **Check Stripe dashboard** for session creation

---

## Status
✅ **DEBUGGING TOOLS ADDED** - Console logging and error handling enhanced

The checkout should now provide clear feedback about what's happening. If the issue persists, the console logs will help identify the exact problem.
