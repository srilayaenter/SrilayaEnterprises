# E-Commerce Test Execution Checklist
## Quick Reference Guide

**Project:** Srilaya Enterprises Organic Store  
**Purpose:** Quick checklist for daily test execution  
**Related Document:** ECOMMERCE_TEST_PLAN.md

---

## Pre-Test Setup Checklist

- [ ] Test environment is accessible
- [ ] Database has sample data loaded (17 products)
- [ ] Test user accounts are created
- [ ] Stripe is in test mode
- [ ] Browser/device for testing is ready
- [ ] Test data reference is available
- [ ] Defect tracking system is ready

---

## Daily Test Execution Checklist

### Product Catalog Tests (10 Test Cases)

- [ ] **TC-PC-001** - View product listing page
- [ ] **TC-PC-002** - Search products by name
- [ ] **TC-PC-003** - Filter products by category
- [ ] **TC-PC-004** - View product details
- [ ] **TC-PC-005** - Select product variant
- [ ] **TC-PC-006** - Product image display
- [ ] **TC-PC-007** - Product price display
- [ ] **TC-PC-008** - Empty search results
- [ ] **TC-PC-009** - Responsive design
- [ ] **TC-PC-010** - Performance testing

**Status:** _____ / 10 Passed

---

### Shopping Cart Tests (15 Test Cases)

- [ ] **TC-SC-001** - Add product to cart from detail page
- [ ] **TC-SC-002** - Add multiple products to cart
- [ ] **TC-SC-003** - View cart page
- [ ] **TC-SC-004** - Update cart item quantity
- [ ] **TC-SC-005** - Remove item from cart
- [ ] **TC-SC-006** - Empty cart handling
- [ ] **TC-SC-007** - Cart calculations accuracy
- [ ] **TC-SC-008** - Cart persistence (guest)
- [ ] **TC-SC-009** - Cart persistence (logged-in)
- [ ] **TC-SC-010** - Same product, different variants
- [ ] **TC-SC-011** - Maximum quantity validation
- [ ] **TC-SC-012** - Cart UI responsiveness
- [ ] **TC-SC-013** - Cart badge updates
- [ ] **TC-SC-014** - Performance with multiple items
- [ ] **TC-SC-015** - Cart error handling

**Status:** _____ / 15 Passed

---

### Checkout Tests (10 Test Cases)

- [ ] **TC-CO-001** - Initiate checkout as guest
- [ ] **TC-CO-002** - Initiate checkout as logged-in user
- [ ] **TC-CO-003** - View order summary before payment
- [ ] **TC-CO-004** - Checkout validation - empty cart
- [ ] **TC-CO-005** - Checkout button state
- [ ] **TC-CO-006** - Checkout flow continuity
- [ ] **TC-CO-007** - Checkout authentication check
- [ ] **TC-CO-008** - Checkout error handling
- [ ] **TC-CO-009** - Checkout responsive design
- [ ] **TC-CO-010** - Checkout cancel/back navigation

**Status:** _____ / 10 Passed

---

### Payment Gateway Tests (20 Test Cases)

#### Critical Payment Tests
- [ ] **TC-PG-001** - Create Stripe checkout session
- [ ] **TC-PG-002** - Successful payment processing ⭐
- [ ] **TC-PG-007** - Payment verification ⭐
- [ ] **TC-PG-013** - Payment amount accuracy ⭐
- [ ] **TC-PG-020** - Edge function security ⭐

#### Payment Failure Scenarios
- [ ] **TC-PG-003** - Declined payment handling
- [ ] **TC-PG-004** - Insufficient funds handling
- [ ] **TC-PG-005** - Expired card handling
- [ ] **TC-PG-006** - Payment processing error

#### Payment Flow Tests
- [ ] **TC-PG-008** - Payment success page
- [ ] **TC-PG-009** - Payment cancellation
- [ ] **TC-PG-010** - Order status update after payment
- [ ] **TC-PG-011** - Multiple payment attempts
- [ ] **TC-PG-017** - Payment error recovery

#### Security & Integration Tests
- [ ] **TC-PG-012** - Payment security - HTTPS
- [ ] **TC-PG-014** - Payment webhook handling
- [ ] **TC-PG-019** - Stripe test mode verification

#### Additional Tests
- [ ] **TC-PG-015** - Payment session timeout
- [ ] **TC-PG-016** - Concurrent payment attempts
- [ ] **TC-PG-018** - Payment receipt/confirmation

**Status:** _____ / 20 Passed

---

## End-to-End User Scenarios

### Scenario 1: Guest User Purchase Flow
- [ ] Browse products without login
- [ ] Search for specific product
- [ ] View product details
- [ ] Add product to cart
- [ ] Update quantity in cart
- [ ] Proceed to checkout (redirected to login)
- [ ] Register new account
- [ ] Complete checkout
- [ ] Make payment with test card
- [ ] View order confirmation
- [ ] Check order in order history

**Status:** Pass / Fail / Blocked

---

### Scenario 2: Returning User Purchase Flow
- [ ] Log in with existing account
- [ ] Filter products by category
- [ ] Add multiple products to cart
- [ ] View cart and verify totals
- [ ] Remove one item from cart
- [ ] Update quantity of another item
- [ ] Proceed to checkout
- [ ] Review order summary
- [ ] Complete payment
- [ ] Verify order status
- [ ] Log out and log back in
- [ ] Verify order still appears in history

**Status:** Pass / Fail / Blocked

---

### Scenario 3: Multiple Variant Purchase
- [ ] Browse to a product (e.g., Foxtail Millet)
- [ ] Add 1kg variant to cart
- [ ] Return to same product
- [ ] Add 2kg variant to cart
- [ ] View cart (should show 2 separate items)
- [ ] Verify prices are different
- [ ] Update quantities of both
- [ ] Verify total calculation
- [ ] Complete checkout and payment
- [ ] Verify order contains both variants

**Status:** Pass / Fail / Blocked

---

### Scenario 4: Payment Failure Recovery
- [ ] Add products to cart
- [ ] Proceed to checkout
- [ ] Attempt payment with declined card (4000 0000 0000 0002)
- [ ] Verify error message
- [ ] Verify cart is preserved
- [ ] Retry with successful card (4242 4242 4242 4242)
- [ ] Verify payment succeeds
- [ ] Verify only one order is created
- [ ] Verify cart is cleared

**Status:** Pass / Fail / Blocked

---

## Cross-Browser Testing Checklist

### Chrome (Latest)
- [ ] Product catalog works
- [ ] Shopping cart works
- [ ] Checkout works
- [ ] Payment works
- [ ] UI displays correctly

### Firefox (Latest)
- [ ] Product catalog works
- [ ] Shopping cart works
- [ ] Checkout works
- [ ] Payment works
- [ ] UI displays correctly

### Safari (Latest)
- [ ] Product catalog works
- [ ] Shopping cart works
- [ ] Checkout works
- [ ] Payment works
- [ ] UI displays correctly

### Edge (Latest)
- [ ] Product catalog works
- [ ] Shopping cart works
- [ ] Checkout works
- [ ] Payment works
- [ ] UI displays correctly

---

## Mobile Testing Checklist

### iOS Safari (iPhone)
- [ ] Product browsing is smooth
- [ ] Touch targets are adequate (44x44px min)
- [ ] Cart operations work with touch
- [ ] Checkout form is usable
- [ ] Payment flow works
- [ ] Responsive layout is correct
- [ ] No horizontal scrolling

### Chrome Mobile (Android)
- [ ] Product browsing is smooth
- [ ] Touch targets are adequate
- [ ] Cart operations work with touch
- [ ] Checkout form is usable
- [ ] Payment flow works
- [ ] Responsive layout is correct
- [ ] No horizontal scrolling

---

## Performance Testing Checklist

### Page Load Times
- [ ] Home page loads < 3 seconds
- [ ] Product detail page loads < 2 seconds
- [ ] Cart page loads < 2 seconds
- [ ] Checkout loads < 2 seconds

### Operation Response Times
- [ ] Search/filter response < 500ms
- [ ] Add to cart response < 300ms
- [ ] Update quantity response < 300ms
- [ ] Cart badge update < 100ms

### Stress Testing
- [ ] Cart with 20+ items performs well
- [ ] Multiple concurrent users can checkout
- [ ] Payment processing handles load

---

## Security Testing Checklist

### Authentication
- [ ] Checkout requires login
- [ ] Unauthorized users cannot access checkout
- [ ] Session management works correctly
- [ ] Logout clears session properly

### Payment Security
- [ ] All payment pages use HTTPS
- [ ] No payment data in client-side code
- [ ] Stripe keys are secure (not exposed)
- [ ] Payment verification is server-side

### Data Protection
- [ ] User data is protected
- [ ] Cart data is secure
- [ ] Order data is private
- [ ] No SQL injection vulnerabilities

---

## Regression Testing Checklist

After any bug fix or update, verify:

- [ ] Core product browsing still works
- [ ] Search and filter still work
- [ ] Add to cart still works
- [ ] Cart calculations are still accurate
- [ ] Checkout flow is not broken
- [ ] Payment processing still works
- [ ] No new bugs introduced
- [ ] Previously fixed bugs don't reappear

---

## Critical Path Testing (Smoke Test)

**Time Required:** ~15 minutes  
**Purpose:** Quick verification that core functionality works

1. [ ] **Can browse products** (2 min)
   - Open home page
   - Verify products load
   - Click on a product

2. [ ] **Can add to cart** (2 min)
   - Select a variant
   - Click "Add to Cart"
   - Verify cart badge updates

3. [ ] **Can view cart** (2 min)
   - Navigate to cart
   - Verify item is shown
   - Verify price is correct

4. [ ] **Can update cart** (2 min)
   - Change quantity
   - Verify total updates
   - Remove item works

5. [ ] **Can checkout** (3 min)
   - Add items to cart
   - Click "Proceed to Checkout"
   - Login if needed
   - Reach payment page

6. [ ] **Can complete payment** (4 min)
   - Enter test card: 4242 4242 4242 4242
   - Complete payment
   - Verify success page
   - Verify order in history

**Result:** Pass / Fail

---

## Test Data Quick Reference

### Stripe Test Cards
```
Success:           4242 4242 4242 4242
Decline:           4000 0000 0000 0002
Insufficient:      4000 0000 0000 9995
Expired:           4000 0000 0000 0069
Processing Error:  4000 0000 0000 0119

Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

### Sample Products
```
Foxtail Millet:
- 1kg: ₹120
- 2kg: ₹230
- 5kg: ₹550
- 10kg: ₹1050

Basmati Rice:
- 1kg: ₹150
- 2kg: ₹280
- 5kg: ₹680
- 10kg: ₹1300

Raw Honey:
- 200g: ₹180
- 500g: ₹420
- 1kg: ₹800
```

### Test Calculation
```
Cart Example:
- Foxtail Millet 1kg × 2 = ₹240
- Basmati Rice 2kg × 1 = ₹280
- Total = ₹520
```

---

## Defect Logging Quick Template

```
ID: [Auto]
Title: [Brief description]
Severity: Critical / High / Medium / Low
Test Case: TC-XX-XXX
Browser: [Chrome/Firefox/Safari/Edge]
Device: [Desktop/Mobile/Tablet]
Steps:
1. [Step 1]
2. [Step 2]
3. [Step 3]
Expected: [What should happen]
Actual: [What happened]
Screenshot: [Attach]
```

---

## Daily Test Summary Template

```
Date: __________
Tester: __________
Environment: __________

Tests Executed: _____ / _____
Tests Passed: _____
Tests Failed: _____
Tests Blocked: _____

Pass Rate: _____%

New Defects: _____
- Critical: _____
- High: _____
- Medium: _____
- Low: _____

Notes:
_________________________________
_________________________________
_________________________________
```

---

## Test Completion Criteria

### Must Pass Before Release
- [ ] All critical (P1) test cases pass
- [ ] All high (P2) test cases pass
- [ ] 95% overall pass rate achieved
- [ ] No critical defects open
- [ ] No high defects open
- [ ] Payment processing works 100%
- [ ] Cart calculations are 100% accurate
- [ ] Checkout flow works end-to-end
- [ ] Cross-browser testing complete
- [ ] Mobile testing complete
- [ ] Security testing complete

### Sign-off Required
- [ ] QA Lead approval
- [ ] Development Lead approval
- [ ] Product Owner approval
- [ ] Stakeholder acceptance

---

## Quick Tips for Testers

1. **Always test with fresh data** - Clear cache and cookies between test runs
2. **Document everything** - Take screenshots of failures
3. **Test edge cases** - Don't just test happy paths
4. **Verify calculations manually** - Don't trust the UI alone
5. **Test on real devices** - Emulators don't catch everything
6. **Use different test accounts** - Don't reuse the same account
7. **Check database** - Verify data is saved correctly
8. **Test payment last** - Ensure everything else works first
9. **Report defects immediately** - Don't wait until end of day
10. **Retest fixed bugs** - Verify fixes actually work

---

## Contact Information

**QA Lead:** _______________  
**Dev Lead:** _______________  
**Project Manager:** _______________  

**Defect Tracking:** _______________  
**Test Environment URL:** _______________  
**Documentation:** ECOMMERCE_TEST_PLAN.md

---

**Last Updated:** 2025-11-29  
**Version:** 1.0
