# Customer Registration & Checkout Test Checklist

**Quick Reference Guide for Testing Customer Account Creation and Checkout Process**

---

## 🎯 Test Objective

Validate the complete customer journey from registration through checkout initiation, including order type selection and order summary review.

---

## ✅ Quick Test Checklist

### Phase 1: Customer Account Creation ✨

#### 1.1 New User Registration
- [ ] Navigate to registration page
- [ ] Fill in all required fields:
  - [ ] Username (unique)
  - [ ] Email (valid format)
  - [ ] Phone (10 digits)
  - [ ] Password (meets requirements)
  - [ ] Confirm Password (matches)
- [ ] Click "Register" button
- [ ] ✅ Success message appears
- [ ] ✅ User is logged in or redirected to login

#### 1.2 User Login
- [ ] Navigate to login page
- [ ] Enter valid credentials
- [ ] Click "Login" button
- [ ] ✅ User is logged in successfully
- [ ] ✅ User name appears in header
- [ ] ✅ Logout option is visible

---

### Phase 2: Shopping Cart Operations 🛒

#### 2.1 Add Products to Cart
- [ ] Browse product catalog
- [ ] Click on a product (e.g., "Foxtail Millet")
- [ ] Select variant (e.g., "1kg")
- [ ] Click "Add to Cart"
- [ ] ✅ Success toast appears
- [ ] ✅ Cart badge updates (shows "1")
- [ ] Add another product
- [ ] ✅ Cart badge updates (shows "2")

#### 2.2 View Cart
- [ ] Click on cart icon in header
- [ ] ✅ All added items are displayed
- [ ] ✅ Each item shows: name, variant, price, quantity
- [ ] ✅ Cart total is calculated correctly
- [ ] ✅ "Proceed to Checkout" button is visible

---

### Phase 3: Checkout Initiation 🚀

#### 3.1 Access Checkout Page
- [ ] Click "Proceed to Checkout" from cart
- [ ] ✅ Redirected to `/checkout` page
- [ ] ✅ User information is pre-filled (if profile exists)
- [ ] ✅ Order summary displays all cart items
- [ ] ✅ Order type selection is visible
- [ ] ✅ Payment method options are visible

---

### Phase 4: Order Type Selection 📦

#### 4.1 Test "Online Order" Option
- [ ] Select "Online Order" radio button
- [ ] ✅ Delivery address fields appear
- [ ] ✅ Fields marked as required:
  - [ ] Full Name
  - [ ] Email
  - [ ] Phone
  - [ ] Street Address
  - [ ] City
  - [ ] State
- [ ] ✅ "Calculate Shipping" button appears
- [ ] ✅ Payment method defaults to "Card"
- [ ] ✅ Shipping cost section is visible

#### 4.2 Test "In-Store Purchase" Option
- [ ] Select "In-Store Purchase" radio button
- [ ] ✅ Delivery address fields become optional/hidden
- [ ] ✅ Basic contact info remains required:
  - [ ] Full Name
  - [ ] Email
  - [ ] Phone
- [ ] ✅ Payment method options show:
  - [ ] Cash
  - [ ] UPI
  - [ ] Split Payment
- [ ] ✅ Shipping cost is ₹0
- [ ] ✅ "Calculate Shipping" button is hidden

---

### Phase 5: Delivery Address Entry (Online Orders Only) 📍

#### 5.1 Enter Delivery Address
**Prerequisites:** "Online Order" is selected

- [ ] Fill in delivery address:
  - [ ] Full Name: `John Doe`
  - [ ] Email: `john.doe@example.com`
  - [ ] Phone: `9876543210`
  - [ ] Street Address: `123 Main Street, Apartment 4B`
  - [ ] City: `Bangalore`
  - [ ] State: `Karnataka`
- [ ] Click "Calculate Shipping" button
- [ ] ✅ Shipping cost is calculated
- [ ] ✅ Success toast: "Shipping calculated: ₹[amount] for [weight]kg"
- [ ] ✅ Order summary updates with shipping cost

#### 5.2 Validate Shipping Calculation
- [ ] ✅ Shipping cost > ₹0
- [ ] ✅ Shipping cost is reasonable
- [ ] ✅ Total includes shipping cost
- [ ] ✅ Calculation: Total = Subtotal + GST + Shipping

---

### Phase 6: Order Summary Review 📋

#### 6.1 Verify Order Summary Components
- [ ] ✅ **Items List** displays:
  - [ ] Product name
  - [ ] Variant (packaging size)
  - [ ] Quantity
  - [ ] Unit price
  - [ ] Subtotal per item
- [ ] ✅ **Pricing Breakdown** displays:
  - [ ] Subtotal (sum of all items)
  - [ ] GST (5% of subtotal)
  - [ ] Shipping Cost (online orders only)
  - [ ] Loyalty Points Discount (if applied)
  - [ ] **Final Total** (bold/highlighted)

#### 6.2 Validate Pricing Calculations

**For Online Order:**
```
Example:
Item 1: Foxtail Millet (1kg) × 1 = ₹150.00
Item 2: Kodo Millet (2kg) × 1 = ₹280.00
─────────────────────────────────────────
Subtotal:                        ₹430.00
GST (5%):                         ₹21.50
Shipping (Bangalore, 3kg):        ₹80.00
─────────────────────────────────────────
Total:                           ₹531.50
```

- [ ] ✅ Subtotal = Sum of (item price × quantity)
- [ ] ✅ GST = Subtotal × 5%
- [ ] ✅ Shipping = Calculated amount
- [ ] ✅ Total = Subtotal + GST + Shipping
- [ ] ✅ Order type badge: "Online Order"
- [ ] ✅ Delivery address displayed
- [ ] ✅ Payment method: "Card"

**For In-Store Purchase:**
```
Example:
Item 1: Foxtail Millet (1kg) × 1 = ₹150.00
Item 2: Kodo Millet (2kg) × 1 = ₹280.00
─────────────────────────────────────────
Subtotal:                        ₹430.00
GST (5%):                         ₹21.50
Shipping:                          ₹0.00
─────────────────────────────────────────
Total:                           ₹451.50
```

- [ ] ✅ Subtotal = Sum of (item price × quantity)
- [ ] ✅ GST = Subtotal × 5%
- [ ] ✅ Shipping = ₹0.00 (or not displayed)
- [ ] ✅ Total = Subtotal + GST
- [ ] ✅ Order type badge: "In-Store Purchase"
- [ ] ✅ No delivery address required
- [ ] ✅ Payment method: "Cash" or "UPI" or "Split"

---

### Phase 7: Final Validation ✔️

#### 7.1 Pre-Checkout Validation
- [ ] ✅ All required fields are filled
- [ ] ✅ Order type is selected
- [ ] ✅ Payment method is selected
- [ ] ✅ Order summary is accurate
- [ ] ✅ Total calculation is correct
- [ ] ✅ "Place Order" button is enabled

#### 7.2 Place Order (Optional - Full E2E Test)

**For Online Orders:**
- [ ] Click "Place Order" button
- [ ] ✅ Redirected to Stripe payment page
- [ ] Enter test card: `4242 4242 4242 4242`
- [ ] ✅ Payment processes successfully
- [ ] ✅ Redirected to success page
- [ ] ✅ Order confirmation displayed
- [ ] ✅ Cart is cleared

**For In-Store Purchases:**
- [ ] Click "Place Order" button
- [ ] ✅ Order created successfully
- [ ] ✅ Success message appears
- [ ] ✅ Redirected to order confirmation
- [ ] ✅ Cart is cleared

---

## 🧪 Test Data

### Test User Credentials
```
Username: testuser_001
Email: testuser001@example.com
Phone: 9876543210
Password: TestPass123!
```

### Test Delivery Address
```
Full Name: John Doe
Email: john.doe@example.com
Phone: 9876543210
Street Address: 123 Main Street, Apartment 4B
City: Bangalore
State: Karnataka
```

### Test Products
```
Product 1: Foxtail Millet (1kg) - ₹150.00
Product 2: Kodo Millet (2kg) - ₹280.00
```

### Stripe Test Card
```
Card Number: 4242 4242 4242 4242
Expiry: 12/25
CVC: 123
ZIP: 12345
```

---

## 🐛 Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Registration fails | Try different username/email |
| Can't add to cart | Select variant first |
| Shipping not calculated | Fill City & State, click "Calculate Shipping" |
| Total incorrect | Verify: Subtotal + GST + Shipping - Discounts |
| Payment fails | Use test card: `4242 4242 4242 4242` |
| In-store order fails | Verify Name, Email, Phone are filled |

---

## 📊 Test Results Summary

**Test Date:** _______________  
**Tester:** _______________  
**Browser:** _______________

| Phase | Test Cases | Pass | Fail | Notes |
|-------|-----------|------|------|-------|
| 1. Registration & Login | 2 | ___ | ___ | __________ |
| 2. Shopping Cart | 2 | ___ | ___ | __________ |
| 3. Checkout Initiation | 1 | ___ | ___ | __________ |
| 4. Order Type Selection | 2 | ___ | ___ | __________ |
| 5. Delivery Address | 2 | ___ | ___ | __________ |
| 6. Order Summary | 2 | ___ | ___ | __________ |
| 7. Final Validation | 2 | ___ | ___ | __________ |
| **TOTAL** | **13** | ___ | ___ | |

**Overall Result:** [ ] ✅ PASS  [ ] ❌ FAIL

---

## 🎓 Key Validation Points

### ✅ Must Verify

1. **Registration:**
   - Unique username/email enforcement
   - Password validation
   - Successful account creation

2. **Login:**
   - Valid credentials work
   - Invalid credentials show error
   - Session persists

3. **Cart:**
   - Items added successfully
   - Cart badge updates
   - Quantities can be changed
   - Total calculates correctly

4. **Checkout:**
   - User must be logged in
   - Cart items display correctly
   - Order type selection works

5. **Order Type:**
   - Online: Address required, shipping calculated
   - In-Store: Address optional, no shipping

6. **Order Summary:**
   - All items listed
   - Subtotal correct
   - GST = 5% of subtotal
   - Shipping included (online only)
   - Total = Subtotal + GST + Shipping - Discounts

7. **Pricing:**
   - All amounts in ₹ (INR)
   - 2 decimal places
   - Calculations accurate
   - No negative values

---

## 📝 Notes Section

Use this space to document any observations, issues, or recommendations:

```
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________

_________________________________________________________________

_________________________________________________________________

_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

---

## ✍️ Sign-Off

**Test Completed:** [ ] Yes  [ ] No  
**All Critical Tests Passed:** [ ] Yes  [ ] No  
**Ready for Production:** [ ] Yes  [ ] No

**Tester Signature:** _______________________  
**Date:** _______________________

---

**Quick Reference:** For detailed test steps, see [CUSTOMER_REGISTRATION_CHECKOUT_TEST.md](./CUSTOMER_REGISTRATION_CHECKOUT_TEST.md)
