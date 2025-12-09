# Customer Registration & Checkout Initiation Test Guide

**Test Objective:** Validate customer account creation and complete checkout process flow

**Test Date:** 2025-12-01  
**Application:** Srilaya Enterprises Organic Store  
**Test Type:** End-to-End Functional Testing

---

## Table of Contents

1. [Test Overview](#test-overview)
2. [Prerequisites](#prerequisites)
3. [Test Environment Setup](#test-environment-setup)
4. [Test Execution Steps](#test-execution-steps)
5. [Expected Results](#expected-results)
6. [Test Data](#test-data)
7. [Validation Checklist](#validation-checklist)
8. [Troubleshooting](#troubleshooting)

---

## Test Overview

This test validates the complete customer journey from account creation through checkout initiation, including:

- ✅ Customer account creation
- ✅ Customer login functionality
- ✅ Shopping cart operations
- ✅ Checkout process initiation
- ✅ Order type selection (Online Order vs In-Store Purchase)
- ✅ Delivery address entry and validation
- ✅ Order summary with complete pricing details

---

## Prerequisites

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Active internet connection
- Access to the application URL

### Test Account Requirements
- **New User:** Email/username not previously registered
- **Existing User:** Valid credentials for login testing
- **Test Payment Card:** Stripe test card `4242 4242 4242 4242` (for online orders)

### Test Data Preparation
- Valid email address for registration
- Valid phone number (10 digits)
- Complete delivery address (for online orders)
- Test products available in the catalog

---

## Test Environment Setup

### 1. Access the Application
```
URL: [Your application URL]
Browser: Chrome/Firefox/Safari/Edge (latest version)
```

### 2. Clear Browser Data (Optional but Recommended)
- Clear cookies and cache
- Open application in incognito/private mode
- This ensures a clean test environment

### 3. Verify Application Status
- ✅ Application loads successfully
- ✅ Product catalog is visible
- ✅ Navigation menu is functional
- ✅ No console errors

---

## Test Execution Steps

### Phase 1: Customer Account Creation

#### Test Case 1.1: New Customer Registration

**Steps:**
1. Navigate to the home page
2. Click on the **"Login"** or **"Sign Up"** button in the header
3. Click on **"Register"** or **"Create Account"** link
4. Fill in the registration form:
   - **Username:** `testuser_[timestamp]` (e.g., testuser_20251201)
   - **Email:** `testuser_[timestamp]@example.com`
   - **Phone:** `9876543210`
   - **Password:** `TestPass123!`
   - **Confirm Password:** `TestPass123!`
5. Click **"Register"** or **"Create Account"** button
6. Observe the registration result

**Expected Results:**
- ✅ Registration form validates all fields
- ✅ Password strength indicator shows (if implemented)
- ✅ Success message appears: "Account created successfully"
- ✅ User is automatically logged in OR redirected to login page
- ✅ No error messages displayed
- ✅ User profile is created in the database

**Validation Points:**
- Username must be unique
- Email format validation works
- Phone number accepts 10 digits
- Password meets minimum requirements
- Confirm password matches password field

---

#### Test Case 1.2: Existing Customer Login

**Steps:**
1. Navigate to the home page
2. Click on the **"Login"** button in the header
3. Enter valid credentials:
   - **Username/Email:** `testuser_20251201@example.com`
   - **Password:** `TestPass123!`
4. Click **"Login"** button
5. Observe the login result

**Expected Results:**
- ✅ Login form accepts credentials
- ✅ Success message appears: "Logged in successfully"
- ✅ User is redirected to home page or previous page
- ✅ User name/profile icon appears in header
- ✅ Cart icon shows item count (if items exist)
- ✅ "Logout" option is visible

**Validation Points:**
- Invalid credentials show error message
- Password field is masked
- "Remember me" option works (if implemented)
- Session persists across page refreshes

---

### Phase 2: Shopping Cart Operations

#### Test Case 2.1: Add Products to Cart

**Steps:**
1. While logged in, browse the product catalog
2. Click on a product (e.g., "Foxtail Millet")
3. On the product detail page:
   - Select a variant: **"1kg"**
   - Click **"Add to Cart"** button
4. Observe the cart update
5. Return to home page
6. Add another product:
   - Click on "Kodo Millet"
   - Select variant: **"2kg"**
   - Click **"Add to Cart"**
7. Observe the cart badge update

**Expected Results:**
- ✅ Product is added to cart successfully
- ✅ Success toast notification appears: "Added to cart"
- ✅ Cart badge updates to show item count (e.g., "1", "2")
- ✅ User can continue shopping
- ✅ Cart persists across page navigation

**Validation Points:**
- Variant must be selected before adding to cart
- Duplicate items increase quantity (not create new line)
- Cart badge shows accurate count
- Toast notification is visible and auto-dismisses

---

#### Test Case 2.2: View Shopping Cart

**Steps:**
1. Click on the **Cart icon** in the header
2. Observe the cart page contents
3. Verify all added items are displayed

**Expected Results:**
- ✅ Cart page displays all added items
- ✅ Each item shows:
  - Product name
  - Selected variant (packaging size)
  - Unit price
  - Quantity selector
  - Subtotal (price × quantity)
  - Product image
- ✅ Cart summary shows:
  - Subtotal
  - Item count
  - "Proceed to Checkout" button
- ✅ Empty cart message if no items

**Validation Points:**
- Quantity can be updated (+ / - buttons)
- Items can be removed
- Prices calculate correctly
- Cart total updates in real-time

---

### Phase 3: Checkout Process Initiation

#### Test Case 3.1: Proceed to Checkout

**Steps:**
1. From the cart page, click **"Proceed to Checkout"** button
2. Observe the checkout page load
3. Verify user is logged in (if not, should redirect to login)

**Expected Results:**
- ✅ User is navigated to `/checkout` page
- ✅ Checkout page displays:
  - Order summary section
  - Customer information form
  - Order type selection
  - Payment method options (based on order type)
- ✅ User information is pre-filled (if profile exists)
- ✅ All cart items are displayed in order summary

**Validation Points:**
- Non-logged-in users are redirected to login
- Empty cart redirects to cart page
- Page loads without errors
- All sections are visible and functional

---

### Phase 4: Order Type Selection

#### Test Case 4.1: Select "Online Order"

**Steps:**
1. On the checkout page, locate the **Order Type** section
2. Select **"Online Order"** radio button
3. Observe the form changes

**Expected Results:**
- ✅ "Online Order" option is selected
- ✅ Delivery address fields become visible/required:
  - Full Name
  - Email
  - Phone
  - Street Address
  - City
  - State
- ✅ "Calculate Shipping" button appears
- ✅ Payment method defaults to "Card" (Stripe)
- ✅ Shipping cost section is visible (initially ₹0)

**Validation Points:**
- Address fields are marked as required
- Shipping calculation is mandatory before checkout
- Payment method options show: Card (Stripe)
- Order summary updates to include shipping

---

#### Test Case 4.2: Select "In-Store Purchase"

**Steps:**
1. On the checkout page, locate the **Order Type** section
2. Select **"In-Store Purchase"** radio button
3. Observe the form changes

**Expected Results:**
- ✅ "In-Store Purchase" option is selected
- ✅ Delivery address fields become optional or hidden
- ✅ Basic contact information remains required:
  - Full Name
  - Email
  - Phone
- ✅ Payment method options show:
  - Cash
  - UPI
  - Split Payment (Cash + Digital)
- ✅ Shipping cost is ₹0 (not applicable)
- ✅ "Calculate Shipping" button is hidden

**Validation Points:**
- Address fields are not required
- Payment method defaults to "Cash"
- Order summary shows no shipping cost
- Total calculation excludes shipping

---

### Phase 5: Delivery Address Entry (Online Orders)

#### Test Case 5.1: Enter Delivery Address

**Prerequisites:** "Online Order" is selected

**Steps:**
1. Fill in the delivery address form:
   - **Full Name:** `John Doe`
   - **Email:** `john.doe@example.com`
   - **Phone:** `9876543210`
   - **Street Address:** `123 Main Street, Apartment 4B`
   - **City:** `Bangalore`
   - **State:** `Karnataka`
2. Verify all fields are filled
3. Click **"Calculate Shipping"** button
4. Observe the shipping calculation

**Expected Results:**
- ✅ All fields accept input
- ✅ Email validation works (format check)
- ✅ Phone validation works (10 digits)
- ✅ "Calculate Shipping" button is enabled
- ✅ Shipping cost is calculated and displayed
- ✅ Success toast: "Shipping calculated: ₹[amount] for [weight]kg"
- ✅ Order summary updates with shipping cost

**Validation Points:**
- Required fields show error if empty
- Email format: `user@domain.com`
- Phone format: 10 digits
- Shipping cost is greater than ₹0
- Total updates to include shipping

---

#### Test Case 5.2: Shipping Cost Validation

**Prerequisites:** Address entered, shipping calculated

**Steps:**
1. Verify the shipping cost in the order summary
2. Check the calculation logic:
   - Base shipping rate
   - Weight-based calculation
   - State-based rates (if applicable)
3. Verify total includes shipping

**Expected Results:**
- ✅ Shipping cost is displayed clearly
- ✅ Shipping cost is added to subtotal
- ✅ Total = Subtotal + GST + Shipping - Discounts
- ✅ Shipping cost is reasonable (not ₹0 for online orders)

**Validation Points:**
- Shipping cost matches expected rate
- Total calculation is accurate
- Shipping cost persists if form is edited
- Recalculation works if address changes

---

### Phase 6: Order Summary Review

#### Test Case 6.1: Review Order Summary with All Pricing Details

**Steps:**
1. Scroll to the **Order Summary** section
2. Verify all pricing components are displayed
3. Check calculations for accuracy

**Expected Results:**
- ✅ Order summary displays:
  - **Items List:**
    - Product name
    - Variant (packaging size)
    - Quantity
    - Unit price
    - Subtotal per item
  - **Pricing Breakdown:**
    - Subtotal (sum of all items)
    - GST (5% of subtotal)
    - Shipping Cost (for online orders)
    - Loyalty Points Discount (if applied)
    - **Final Total**
- ✅ All prices are in ₹ (INR)
- ✅ Calculations are accurate
- ✅ Total is bold/highlighted

**Validation Points:**
- Subtotal = Sum of (item price × quantity)
- GST = Subtotal × 5%
- Shipping = Calculated amount (online) or ₹0 (in-store)
- Final Total = Subtotal + GST + Shipping - Discounts
- All amounts are rounded to 2 decimal places

---

#### Test Case 6.2: Order Summary for Online Order

**Prerequisites:** "Online Order" selected, shipping calculated

**Example Calculation:**
```
Item 1: Foxtail Millet (1kg) × 1 = ₹150.00
Item 2: Kodo Millet (2kg) × 1 = ₹280.00
─────────────────────────────────────────
Subtotal:                        ₹430.00
GST (5%):                         ₹21.50
Shipping (Bangalore, 3kg):        ₹80.00
─────────────────────────────────────────
Total:                           ₹531.50
```

**Expected Results:**
- ✅ Subtotal: ₹430.00
- ✅ GST: ₹21.50
- ✅ Shipping: ₹80.00
- ✅ **Total: ₹531.50**
- ✅ Order type badge: "Online Order"
- ✅ Delivery address displayed
- ✅ Payment method: "Card"

---

#### Test Case 6.3: Order Summary for In-Store Purchase

**Prerequisites:** "In-Store Purchase" selected

**Example Calculation:**
```
Item 1: Foxtail Millet (1kg) × 1 = ₹150.00
Item 2: Kodo Millet (2kg) × 1 = ₹280.00
─────────────────────────────────────────
Subtotal:                        ₹430.00
GST (5%):                         ₹21.50
Shipping:                          ₹0.00
─────────────────────────────────────────
Total:                           ₹451.50
```

**Expected Results:**
- ✅ Subtotal: ₹430.00
- ✅ GST: ₹21.50
- ✅ Shipping: ₹0.00 (or not displayed)
- ✅ **Total: ₹451.50**
- ✅ Order type badge: "In-Store Purchase"
- ✅ No delivery address required
- ✅ Payment method: "Cash" or "UPI" or "Split"

---

### Phase 7: Final Validation Before Checkout

#### Test Case 7.1: Pre-Checkout Validation

**Steps:**
1. Review all entered information
2. Verify order type is correct
3. Verify payment method is selected
4. Verify all required fields are filled
5. Verify order summary is accurate
6. Click **"Place Order"** or **"Proceed to Payment"** button

**Expected Results:**
- ✅ All validations pass
- ✅ No error messages displayed
- ✅ Button is enabled and clickable
- ✅ Loading indicator appears (if applicable)

**For Online Orders:**
- ✅ Redirects to Stripe payment page
- ✅ Order is created with status "pending"

**For In-Store Purchases:**
- ✅ Order is created with status "completed"
- ✅ Success message appears
- ✅ Redirects to order confirmation page
- ✅ Cart is cleared

---

## Expected Results Summary

### Successful Test Completion Criteria

✅ **Customer Registration:**
- New account created successfully
- User can log in with credentials
- Profile information is saved

✅ **Checkout Initiation:**
- User can access checkout page
- Cart items are displayed correctly
- User information is pre-filled (if available)

✅ **Order Type Selection:**
- "Online Order" option works correctly
- "In-Store Purchase" option works correctly
- Form fields update based on selection

✅ **Delivery Address (Online Orders):**
- All address fields are functional
- Validation works correctly
- Shipping cost is calculated accurately

✅ **Order Summary:**
- All items are listed with correct details
- Pricing breakdown is complete and accurate
- Subtotal, GST, shipping, and total are correct
- Order type is clearly indicated

✅ **Payment Method:**
- Correct payment options based on order type
- Payment method can be selected
- Validation works for split payments (in-store)

---

## Test Data

### Sample Test Users

**Test User 1 (New Registration):**
```
Username: testuser_001
Email: testuser001@example.com
Phone: 9876543210
Password: TestPass123!
```

**Test User 2 (Existing User):**
```
Email: john.doe@example.com
Password: SecurePass456!
```

### Sample Delivery Addresses

**Address 1 (Bangalore):**
```
Full Name: John Doe
Email: john.doe@example.com
Phone: 9876543210
Street Address: 123 Main Street, Apartment 4B
City: Bangalore
State: Karnataka
```

**Address 2 (Mumbai):**
```
Full Name: Jane Smith
Email: jane.smith@example.com
Phone: 9123456789
Street Address: 456 Park Avenue, Floor 2
City: Mumbai
State: Maharashtra
```

### Sample Products for Testing

**Product 1:**
- Name: Foxtail Millet
- Variant: 1kg
- Price: ₹150.00

**Product 2:**
- Name: Kodo Millet
- Variant: 2kg
- Price: ₹280.00

**Product 3:**
- Name: Organic Honey
- Variant: 500g
- Price: ₹350.00

### Stripe Test Cards

**Successful Payment:**
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

**Declined Payment:**
```
Card Number: 4000 0000 0000 0002
Expiry: Any future date
CVC: Any 3 digits
```

---

## Validation Checklist

### Pre-Test Validation
- [ ] Application is accessible
- [ ] Database is populated with test products
- [ ] Stripe test mode is enabled
- [ ] Test user accounts are ready

### Registration & Login Validation
- [ ] Registration form validates all fields
- [ ] Unique username/email enforcement works
- [ ] Password requirements are enforced
- [ ] Login with valid credentials succeeds
- [ ] Login with invalid credentials fails with error
- [ ] User session persists across pages

### Shopping Cart Validation
- [ ] Products can be added to cart
- [ ] Cart badge updates correctly
- [ ] Cart page displays all items
- [ ] Quantity can be updated
- [ ] Items can be removed
- [ ] Cart total calculates correctly
- [ ] Cart persists for logged-in users

### Checkout Page Validation
- [ ] Checkout page loads successfully
- [ ] User information is pre-filled
- [ ] Order type selection works
- [ ] Payment method options are correct
- [ ] Form validation works for all fields

### Online Order Validation
- [ ] Delivery address fields are required
- [ ] Shipping calculation works
- [ ] Shipping cost is added to total
- [ ] Stripe payment integration works
- [ ] Order is created with "pending" status

### In-Store Purchase Validation
- [ ] Address fields are optional
- [ ] Shipping cost is ₹0
- [ ] Cash payment option works
- [ ] UPI payment option works
- [ ] Split payment option works
- [ ] Order is created with "completed" status

### Order Summary Validation
- [ ] All items are listed correctly
- [ ] Subtotal is accurate
- [ ] GST (5%) is calculated correctly
- [ ] Shipping cost is displayed (online orders)
- [ ] Final total is accurate
- [ ] Order type badge is displayed
- [ ] Payment method is displayed

### Pricing Calculation Validation
- [ ] Subtotal = Sum of (item price × quantity)
- [ ] GST = Subtotal × 5%
- [ ] Shipping = Calculated amount or ₹0
- [ ] Total = Subtotal + GST + Shipping - Discounts
- [ ] All amounts are formatted correctly (₹)
- [ ] Rounding is consistent (2 decimal places)

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Registration Fails
**Symptoms:** Error message on registration form

**Possible Causes:**
- Username/email already exists
- Password doesn't meet requirements
- Network error

**Solutions:**
1. Try a different username/email
2. Ensure password has: 8+ characters, uppercase, lowercase, number
3. Check browser console for errors
4. Verify internet connection

---

#### Issue 2: Cannot Add to Cart
**Symptoms:** "Add to Cart" button doesn't work

**Possible Causes:**
- Variant not selected
- User not logged in (if required)
- Product out of stock

**Solutions:**
1. Select a variant (packaging size) first
2. Log in to the application
3. Check product availability
4. Clear browser cache and retry

---

#### Issue 3: Shipping Cost Not Calculated
**Symptoms:** Shipping cost remains ₹0 for online orders

**Possible Causes:**
- City/State not entered
- "Calculate Shipping" button not clicked
- Shipping calculation error

**Solutions:**
1. Fill in City and State fields
2. Click "Calculate Shipping" button
3. Check browser console for errors
4. Verify shipping rates are configured in database

---

#### Issue 4: Order Summary Incorrect
**Symptoms:** Total doesn't match expected amount

**Possible Causes:**
- GST calculation error
- Shipping not included
- Discount applied incorrectly

**Solutions:**
1. Manually verify calculation:
   - Subtotal = Sum of items
   - GST = Subtotal × 5%
   - Total = Subtotal + GST + Shipping
2. Check for applied discounts/loyalty points
3. Verify order type (online vs in-store)
4. Report bug if calculation is consistently wrong

---

#### Issue 5: Payment Fails (Online Orders)
**Symptoms:** Stripe payment page shows error

**Possible Causes:**
- Invalid test card
- Stripe not configured
- Network error

**Solutions:**
1. Use correct test card: `4242 4242 4242 4242`
2. Verify Stripe test mode is enabled
3. Check Stripe API keys in environment variables
4. Try again with a different browser

---

#### Issue 6: In-Store Order Not Created
**Symptoms:** Error when placing in-store order

**Possible Causes:**
- Required fields missing
- Database error
- Split payment validation failed

**Solutions:**
1. Verify Name, Email, Phone are filled
2. For split payment: ensure Cash + Digital = Total
3. Check browser console for errors
4. Verify database connection

---

## Test Execution Log Template

Use this template to document your test execution:

```
Test Execution Date: _______________
Tester Name: _______________
Browser: _______________
Application Version: _______________

┌─────────────────────────────────────────────────────────────┐
│ Test Case 1.1: Customer Registration                        │
├─────────────────────────────────────────────────────────────┤
│ Status: [ ] Pass  [ ] Fail  [ ] Blocked                     │
│ Notes: ________________________________________________      │
│ ________________________________________________________     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Test Case 1.2: Customer Login                               │
├─────────────────────────────────────────────────────────────┤
│ Status: [ ] Pass  [ ] Fail  [ ] Blocked                     │
│ Notes: ________________________________________________      │
│ ________________________________________________________     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Test Case 2.1: Add Products to Cart                         │
├─────────────────────────────────────────────────────────────┤
│ Status: [ ] Pass  [ ] Fail  [ ] Blocked                     │
│ Notes: ________________________________________________      │
│ ________________________________________________________     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Test Case 3.1: Proceed to Checkout                          │
├─────────────────────────────────────────────────────────────┤
│ Status: [ ] Pass  [ ] Fail  [ ] Blocked                     │
│ Notes: ________________________________________________      │
│ ________________________________________________________     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Test Case 4.1: Select "Online Order"                        │
├─────────────────────────────────────────────────────────────┤
│ Status: [ ] Pass  [ ] Fail  [ ] Blocked                     │
│ Notes: ________________________________________________      │
│ ________________________________________________________     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Test Case 4.2: Select "In-Store Purchase"                   │
├─────────────────────────────────────────────────────────────┤
│ Status: [ ] Pass  [ ] Fail  [ ] Blocked                     │
│ Notes: ________________________________________________      │
│ ________________________________________________________     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Test Case 5.1: Enter Delivery Address                       │
├─────────────────────────────────────────────────────────────┤
│ Status: [ ] Pass  [ ] Fail  [ ] Blocked                     │
│ Notes: ________________________________________________      │
│ ________________________________________________________     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Test Case 6.1: Review Order Summary                         │
├─────────────────────────────────────────────────────────────┤
│ Status: [ ] Pass  [ ] Fail  [ ] Blocked                     │
│ Notes: ________________________________________________      │
│ ________________________________________________________     │
└─────────────────────────────────────────────────────────────┘

Overall Test Result: [ ] Pass  [ ] Fail
Total Test Cases: 8
Passed: ___
Failed: ___
Blocked: ___

Critical Issues Found:
1. ________________________________________________________
2. ________________________________________________________
3. ________________________________________________________

Recommendations:
________________________________________________________
________________________________________________________
________________________________________________________
```

---

## Additional Resources

### Related Documentation
- [E-Commerce Test Plan](./ECOMMERCE_TEST_PLAN.md) - Complete test plan
- [User Guide](./USER_GUIDE.md) - Application user guide
- [Quick Start Guide](./QUICK_START_GUIDE.md) - Getting started
- [Admin Management Guide](./ADMIN_MANAGEMENT_GUIDE.md) - Admin features

### Support
For issues or questions during testing:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Check network tab for failed API requests
4. Document the issue with screenshots
5. Report to development team with details

---

## Test Sign-Off

```
Test Completed By: _______________________
Date: _______________________
Signature: _______________________

Test Reviewed By: _______________________
Date: _______________________
Signature: _______________________

Test Approved By: _______________________
Date: _______________________
Signature: _______________________
```

---

**Document Version:** 1.0  
**Last Updated:** 2025-12-01  
**Next Review Date:** [To be determined]
