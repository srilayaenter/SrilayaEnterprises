# E-Commerce Test Plan
## Srilaya Enterprises Organic Store

**Version:** 1.0  
**Date:** 2025-11-29  
**Application:** Srilaya Enterprises Organic Store  
**Test Environment:** Development/Staging  

---

## Table of Contents

1. [Test Plan Overview](#test-plan-overview)
2. [Test Objectives](#test-objectives)
3. [Test Scope](#test-scope)
4. [Test Approach](#test-approach)
5. [Test Environment](#test-environment)
6. [Test Data Requirements](#test-data-requirements)
7. [Entry and Exit Criteria](#entry-and-exit-criteria)
8. [Test Cases](#test-cases)
   - [Product Catalog Testing](#product-catalog-testing)
   - [Shopping Cart Testing](#shopping-cart-testing)
   - [Checkout Testing](#checkout-testing)
   - [Payment Gateway Testing](#payment-gateway-testing)
9. [Test Execution Schedule](#test-execution-schedule)
10. [Risk Assessment](#risk-assessment)
11. [Defect Management](#defect-management)
12. [Test Deliverables](#test-deliverables)

---

## Test Plan Overview

This test plan outlines the comprehensive testing strategy for the core e-commerce features of Srilaya Enterprises Organic Store. The plan focuses on ensuring the reliability, functionality, and security of the product catalog, shopping cart, checkout process, and payment gateway integration.

### Application Details
- **Technology Stack:** React 18, TypeScript, Supabase, Stripe
- **UI Framework:** shadcn/ui + Tailwind CSS
- **Payment Provider:** Stripe
- **Database:** PostgreSQL (Supabase)

---

## Test Objectives

1. **Verify Product Catalog Functionality**
   - Ensure accurate product display and information
   - Validate search and filtering capabilities
   - Confirm product variant selection works correctly

2. **Validate Shopping Cart Operations**
   - Test add/remove/update cart operations
   - Verify cart calculations and totals
   - Ensure cart persistence across sessions

3. **Confirm Checkout Process**
   - Validate complete checkout workflow
   - Test user authentication during checkout
   - Verify order creation and data integrity

4. **Ensure Payment Gateway Integration**
   - Test Stripe payment processing
   - Validate payment verification
   - Confirm order status updates after payment

5. **Cross-Browser and Device Compatibility**
   - Test on multiple browsers (Chrome, Firefox, Safari, Edge)
   - Verify responsive design on mobile, tablet, and desktop

6. **Security and Data Integrity**
   - Validate secure payment processing
   - Test authentication and authorization
   - Ensure data privacy and protection

---

## Test Scope

### In Scope

#### Product Catalog
- Product listing page
- Product search functionality
- Category filtering
- Product detail pages
- Product variant selection (packaging sizes)
- Price display
- Product images
- Product descriptions
- Stock availability display

#### Shopping Cart
- Add to cart functionality
- Update item quantities
- Remove items from cart
- Cart total calculations
- Cart persistence
- Empty cart handling
- Cart item validation
- Cart badge/counter updates

#### Checkout
- Checkout initiation
- User authentication check
- Order summary display
- Shipping information (if applicable)
- Order creation
- Checkout validation
- Error handling

#### Payment Gateway
- Stripe checkout session creation
- Payment processing
- Payment verification
- Success/failure handling
- Order status updates
- Payment security
- Test card processing
- Webhook handling

### Out of Scope
- Admin dashboard functionality (separate test plan)
- Email notifications
- Product reviews system
- Advanced inventory management
- Third-party integrations (except Stripe)

---

## Test Approach

### Testing Types

1. **Functional Testing**
   - Verify all features work as specified
   - Test user workflows end-to-end
   - Validate business logic

2. **Integration Testing**
   - Test Supabase database integration
   - Verify Stripe payment integration
   - Test Edge Functions

3. **UI/UX Testing**
   - Verify responsive design
   - Test user interface elements
   - Validate accessibility

4. **Security Testing**
   - Test authentication mechanisms
   - Verify payment security
   - Test data protection

5. **Performance Testing**
   - Test page load times
   - Verify cart operations speed
   - Test concurrent user scenarios

6. **Compatibility Testing**
   - Cross-browser testing
   - Device compatibility
   - Screen resolution testing

### Testing Methodology
- **Manual Testing:** Primary approach for functional and UI testing
- **Exploratory Testing:** For discovering edge cases
- **Regression Testing:** After bug fixes and updates
- **User Acceptance Testing:** Final validation before production

---

## Test Environment

### Hardware Requirements
- Desktop: Windows 10/11, macOS 12+, Linux
- Mobile: iOS 14+, Android 10+
- Tablets: iPad, Android tablets

### Software Requirements
- **Browsers:**
  - Chrome (latest 2 versions)
  - Firefox (latest 2 versions)
  - Safari (latest 2 versions)
  - Edge (latest 2 versions)
  - Mobile Safari (iOS)
  - Chrome Mobile (Android)

### Test Environment Setup
- **Frontend URL:** Development server (localhost or staging)
- **Backend:** Supabase project
- **Payment Gateway:** Stripe Test Mode
- **Database:** Test database with sample data

### Test Accounts
- **Admin Account:** First registered user
- **Regular User Accounts:** Multiple test users
- **Test Payment Cards:** Stripe test cards

---

## Test Data Requirements

### Product Data
- 17 products across 6 categories (Millets, Rice, Flakes, Sugar, Honey, Laddus)
- Multiple variants per product (1kg, 2kg, 5kg, 10kg)
- Product images (placeholders acceptable for testing)
- Product descriptions and pricing

### User Data
- Admin user account
- 5+ regular user accounts with different profiles
- Guest user scenarios

### Payment Data
- **Stripe Test Cards:**
  - Success: `4242 4242 4242 4242`
  - Decline: `4000 0000 0000 0002`
  - Insufficient Funds: `4000 0000 0000 9995`
  - Expired Card: `4000 0000 0000 0069`
  - Processing Error: `4000 0000 0000 0119`

### Order Data
- Various order combinations
- Different quantities and variants
- Multiple items per order

---

## Entry and Exit Criteria

### Entry Criteria
- ✅ Application deployed to test environment
- ✅ Test environment configured and accessible
- ✅ Test data loaded into database
- ✅ Stripe test mode configured
- ✅ Test accounts created
- ✅ Test plan reviewed and approved

### Exit Criteria
- ✅ All critical and high-priority test cases executed
- ✅ 95% of test cases passed
- ✅ All critical defects resolved
- ✅ No high-priority defects open
- ✅ Test summary report completed
- ✅ Sign-off from stakeholders

---

## Test Cases

### Product Catalog Testing

#### TC-PC-001: View Product Listing Page
**Priority:** High  
**Type:** Functional  
**Preconditions:** User is on the home page

**Test Steps:**
1. Navigate to the home page (/)
2. Observe the product listing

**Expected Results:**
- All products are displayed in a grid layout
- Each product card shows: image, name, price, category
- Products are organized in a responsive grid
- Page loads within 3 seconds
- No broken images or missing data

**Test Data:** N/A

---

#### TC-PC-002: Search Products by Name
**Priority:** High  
**Type:** Functional  
**Preconditions:** User is on the home page with products loaded

**Test Steps:**
1. Locate the search input field
2. Enter "Foxtail" in the search box
3. Observe the filtered results

**Expected Results:**
- Search field is visible and functional
- Products are filtered in real-time
- Only "Foxtail Millet" product is displayed
- Other products are hidden
- Search is case-insensitive

**Test Data:** Search term: "Foxtail"

---

#### TC-PC-003: Filter Products by Category
**Priority:** High  
**Type:** Functional  
**Preconditions:** User is on the home page

**Test Steps:**
1. Locate the category filter dropdown/buttons
2. Select "Millets" category
3. Observe the filtered results
4. Select "All Categories"
5. Observe all products are shown again

**Expected Results:**
- Category filter is visible and accessible
- Only products in selected category are displayed
- Product count updates correctly
- "All Categories" option shows all products
- Filter state is maintained during session

**Test Data:** Category: "Millets"

---

#### TC-PC-004: View Product Details
**Priority:** High  
**Type:** Functional  
**Preconditions:** User is on the home page

**Test Steps:**
1. Click on any product card (e.g., "Foxtail Millet")
2. Observe the product detail page

**Expected Results:**
- User is navigated to product detail page
- URL changes to /products/{product-id}
- Product image is displayed
- Product name, description, and category are shown
- All available variants are listed with prices
- "Add to Cart" button is visible
- Back navigation works correctly

**Test Data:** Product: "Foxtail Millet"

---

#### TC-PC-005: Select Product Variant
**Priority:** High  
**Type:** Functional  
**Preconditions:** User is on a product detail page

**Test Steps:**
1. Navigate to product detail page
2. Observe the variant options (1kg, 2kg, 5kg, 10kg)
3. Select "2kg" variant
4. Observe the price update

**Expected Results:**
- All variants are displayed clearly
- Each variant shows size and price
- Selected variant is highlighted
- Price updates to match selected variant
- Variant selection is required before adding to cart

**Test Data:** Product: "Foxtail Millet", Variant: "2kg"

---

#### TC-PC-006: Product Image Display
**Priority:** Medium  
**Type:** UI  
**Preconditions:** User is viewing products

**Test Steps:**
1. View product listing page
2. View product detail page
3. Check image loading and display

**Expected Results:**
- Images load correctly (or placeholder shown)
- Images are properly sized and aligned
- No broken image icons
- Images are responsive on different screen sizes
- Alt text is present for accessibility

**Test Data:** N/A

---

#### TC-PC-007: Product Price Display
**Priority:** High  
**Type:** Functional  
**Preconditions:** User is viewing products

**Test Steps:**
1. View multiple products on listing page
2. View product detail page
3. Check price formatting

**Expected Results:**
- Prices are displayed in correct currency format (₹)
- Prices are accurate and match database values
- Variant prices are clearly differentiated
- No pricing errors or inconsistencies

**Test Data:** N/A

---

#### TC-PC-008: Empty Search Results
**Priority:** Medium  
**Type:** Functional  
**Preconditions:** User is on the home page

**Test Steps:**
1. Enter a search term that doesn't match any product (e.g., "xyz123")
2. Observe the results

**Expected Results:**
- "No products found" message is displayed
- Message is clear and user-friendly
- Search can be cleared easily
- No error messages or crashes

**Test Data:** Search term: "xyz123"

---

#### TC-PC-009: Product Catalog Responsive Design
**Priority:** High  
**Type:** UI  
**Preconditions:** Application is accessible

**Test Steps:**
1. View product catalog on desktop (1920x1080)
2. View on tablet (768x1024)
3. View on mobile (375x667)
4. Test portrait and landscape orientations

**Expected Results:**
- Layout adapts to screen size
- Products remain readable and accessible
- Grid columns adjust appropriately (4 cols desktop, 2 cols tablet, 1 col mobile)
- Touch targets are adequate on mobile (min 44x44px)
- No horizontal scrolling required

**Test Data:** N/A

---

#### TC-PC-010: Product Catalog Performance
**Priority:** Medium  
**Type:** Performance  
**Preconditions:** User is on the home page

**Test Steps:**
1. Clear browser cache
2. Navigate to home page
3. Measure page load time
4. Scroll through all products
5. Apply filters and search

**Expected Results:**
- Initial page load < 3 seconds
- Product images load progressively
- Filtering/search response < 500ms
- Smooth scrolling without lag
- No memory leaks during extended use

**Test Data:** N/A

---

### Shopping Cart Testing

#### TC-SC-001: Add Product to Cart from Product Detail
**Priority:** High  
**Type:** Functional  
**Preconditions:** User is on a product detail page, not logged in

**Test Steps:**
1. Navigate to product detail page (e.g., "Foxtail Millet")
2. Select a variant (e.g., "1kg")
3. Click "Add to Cart" button
4. Observe the cart badge/counter

**Expected Results:**
- Product is added to cart successfully
- Success message/toast notification appears
- Cart badge updates to show item count
- User can continue shopping
- Cart icon shows updated count

**Test Data:** Product: "Foxtail Millet", Variant: "1kg"

---

#### TC-SC-002: Add Multiple Products to Cart
**Priority:** High  
**Type:** Functional  
**Preconditions:** User has empty cart

**Test Steps:**
1. Add "Foxtail Millet 1kg" to cart
2. Navigate to another product
3. Add "Basmati Rice 2kg" to cart
4. Navigate to another product
5. Add "Raw Honey 500g" to cart
6. Check cart badge

**Expected Results:**
- All three products are added to cart
- Cart badge shows "3" items
- Each addition shows success notification
- Cart maintains all items

**Test Data:** 
- Product 1: "Foxtail Millet 1kg"
- Product 2: "Basmati Rice 2kg"
- Product 3: "Raw Honey 500g"

---

#### TC-SC-003: View Cart Page
**Priority:** High  
**Type:** Functional  
**Preconditions:** User has items in cart

**Test Steps:**
1. Add at least 2 products to cart
2. Click on cart icon or navigate to /cart
3. Observe the cart page

**Expected Results:**
- Cart page displays all added items
- Each item shows: image, name, variant, price, quantity
- Subtotal for each item is calculated correctly
- Total amount is displayed
- Quantity controls are visible
- Remove button is available for each item
- "Proceed to Checkout" button is visible

**Test Data:** Cart with 2+ items

---

#### TC-SC-004: Update Cart Item Quantity
**Priority:** High  
**Type:** Functional  
**Preconditions:** User is on cart page with items

**Test Steps:**
1. Navigate to cart page
2. Locate quantity control for an item
3. Click "+" button to increase quantity
4. Observe the updates
5. Click "-" button to decrease quantity
6. Observe the updates

**Expected Results:**
- Quantity increases/decreases by 1
- Item subtotal updates immediately
- Cart total updates immediately
- Quantity cannot go below 1
- Changes are reflected in cart badge
- No page reload required

**Test Data:** Any cart item

---

#### TC-SC-005: Remove Item from Cart
**Priority:** High  
**Type:** Functional  
**Preconditions:** User is on cart page with multiple items

**Test Steps:**
1. Navigate to cart page with 3 items
2. Click "Remove" button on one item
3. Observe the cart updates

**Expected Results:**
- Item is removed from cart immediately
- Cart total recalculates
- Cart badge updates
- Remaining items stay in cart
- Confirmation message appears (optional)
- No errors occur

**Test Data:** Cart with 3 items

---

#### TC-SC-006: Empty Cart Handling
**Priority:** Medium  
**Type:** Functional  
**Preconditions:** User has items in cart

**Test Steps:**
1. Navigate to cart page
2. Remove all items from cart
3. Observe the empty cart state

**Expected Results:**
- "Your cart is empty" message is displayed
- Cart badge shows "0" or is hidden
- "Continue Shopping" button is available
- No error messages
- Cart total shows ₹0

**Test Data:** N/A

---

#### TC-SC-007: Cart Calculations Accuracy
**Priority:** High  
**Type:** Functional  
**Preconditions:** User is on cart page

**Test Steps:**
1. Add "Foxtail Millet 1kg" (₹120) - Quantity: 2
2. Add "Basmati Rice 2kg" (₹280) - Quantity: 1
3. Navigate to cart page
4. Verify calculations

**Expected Results:**
- Item 1 subtotal: ₹240 (120 × 2)
- Item 2 subtotal: ₹280 (280 × 1)
- Cart total: ₹520 (240 + 280)
- All calculations are accurate
- No rounding errors

**Test Data:** 
- Product 1: "Foxtail Millet 1kg" @ ₹120, Qty: 2
- Product 2: "Basmati Rice 2kg" @ ₹280, Qty: 1

---

#### TC-SC-008: Cart Persistence Across Sessions
**Priority:** High  
**Type:** Functional  
**Preconditions:** User is not logged in

**Test Steps:**
1. Add 2 products to cart
2. Close the browser
3. Reopen the browser
4. Navigate to the application
5. Check cart contents

**Expected Results:**
- Cart items are preserved (if using localStorage)
- Cart badge shows correct count
- All item details are intact
- Quantities are maintained

**Test Data:** Any 2 products

---

#### TC-SC-009: Cart Persistence for Logged-in Users
**Priority:** High  
**Type:** Functional  
**Preconditions:** User is logged in

**Test Steps:**
1. Log in to the application
2. Add 3 products to cart
3. Log out
4. Log in again with the same account
5. Check cart contents

**Expected Results:**
- Cart items are preserved in database
- All items are restored after login
- Quantities and variants are correct
- Cart syncs across devices (if applicable)

**Test Data:** Registered user account, 3 products

---

#### TC-SC-010: Add Same Product with Different Variants
**Priority:** Medium  
**Type:** Functional  
**Preconditions:** User has empty cart

**Test Steps:**
1. Add "Foxtail Millet 1kg" to cart
2. Navigate back to product detail
3. Add "Foxtail Millet 2kg" to cart
4. View cart page

**Expected Results:**
- Both variants appear as separate line items
- Each variant shows correct size and price
- Quantities are independent
- Cart badge shows "2" items

**Test Data:** "Foxtail Millet" - 1kg and 2kg variants

---

#### TC-SC-011: Cart Maximum Quantity Validation
**Priority:** Medium  
**Type:** Functional  
**Preconditions:** User is on cart page

**Test Steps:**
1. Add a product to cart
2. Increase quantity to maximum allowed (e.g., 99)
3. Try to increase further
4. Observe behavior

**Expected Results:**
- Quantity stops at maximum limit
- Error message or tooltip appears
- "+" button is disabled at maximum
- Cart remains functional

**Test Data:** Any product

---

#### TC-SC-012: Cart UI Responsiveness
**Priority:** Medium  
**Type:** UI  
**Preconditions:** User has items in cart

**Test Steps:**
1. View cart page on desktop
2. View cart page on tablet
3. View cart page on mobile
4. Test all interactions on each device

**Expected Results:**
- Cart layout adapts to screen size
- All buttons are accessible and properly sized
- Touch targets are adequate on mobile
- Quantity controls work on touch devices
- No horizontal scrolling
- Text is readable on all devices

**Test Data:** Cart with 3+ items

---

#### TC-SC-013: Cart Badge Updates
**Priority:** Medium  
**Type:** Functional  
**Preconditions:** User is on any page

**Test Steps:**
1. Observe cart badge (should show 0 or be hidden)
2. Add a product to cart
3. Observe cart badge update
4. Add another product
5. Observe cart badge update
6. Remove a product from cart
7. Observe cart badge update

**Expected Results:**
- Badge updates immediately after each action
- Badge shows correct item count
- Badge is visible when cart has items
- Badge updates without page reload
- Badge is consistent across all pages

**Test Data:** Any products

---

#### TC-SC-014: Cart Performance with Multiple Items
**Priority:** Low  
**Type:** Performance  
**Preconditions:** User has empty cart

**Test Steps:**
1. Add 20 different products to cart
2. Navigate to cart page
3. Update quantities multiple times
4. Remove several items
5. Observe performance

**Expected Results:**
- Cart page loads within 2 seconds
- Quantity updates are instant (<100ms)
- No lag or freezing
- Calculations remain accurate
- UI remains responsive

**Test Data:** 20 different products

---

#### TC-SC-015: Cart Error Handling
**Priority:** Medium  
**Type:** Functional  
**Preconditions:** User is on cart page

**Test Steps:**
1. Simulate network disconnection
2. Try to update cart quantity
3. Observe error handling
4. Reconnect network
5. Retry operation

**Expected Results:**
- Appropriate error message is displayed
- User is informed of the issue
- Cart state is not corrupted
- Operation can be retried
- No data loss occurs

**Test Data:** Any cart items

---

### Checkout Testing

#### TC-CO-001: Initiate Checkout as Guest
**Priority:** High  
**Type:** Functional  
**Preconditions:** User is not logged in, has items in cart

**Test Steps:**
1. Add products to cart
2. Navigate to cart page
3. Click "Proceed to Checkout" button
4. Observe the behavior

**Expected Results:**
- User is redirected to login page
- Message indicates login is required
- Cart contents are preserved
- After login, user can continue checkout

**Test Data:** Cart with 2+ items

---

#### TC-CO-002: Initiate Checkout as Logged-in User
**Priority:** High  
**Type:** Functional  
**Preconditions:** User is logged in, has items in cart

**Test Steps:**
1. Log in to the application
2. Add products to cart
3. Navigate to cart page
4. Click "Proceed to Checkout" button
5. Observe the behavior

**Expected Results:**
- Checkout process initiates
- User proceeds to payment
- No login prompt appears
- Cart contents are maintained

**Test Data:** Registered user, cart with 2+ items

---

#### TC-CO-003: View Order Summary Before Payment
**Priority:** High  
**Type:** Functional  
**Preconditions:** User is logged in, initiating checkout

**Test Steps:**
1. Log in and add items to cart
2. Proceed to checkout
3. Observe the order summary

**Expected Results:**
- All cart items are listed
- Item details are accurate (name, variant, quantity, price)
- Subtotals are correct
- Total amount is displayed prominently
- Order summary matches cart contents

**Test Data:** Cart with 3+ items

---

#### TC-CO-004: Checkout Validation - Empty Cart
**Priority:** Medium  
**Type:** Functional  
**Preconditions:** User is logged in, cart is empty

**Test Steps:**
1. Log in to the application
2. Ensure cart is empty
3. Try to navigate to checkout directly (via URL)
4. Observe the behavior

**Expected Results:**
- User is prevented from accessing checkout
- Redirect to cart or home page
- Message indicates cart is empty
- No errors occur

**Test Data:** Empty cart

---

#### TC-CO-005: Checkout Button State
**Priority:** Medium  
**Type:** UI  
**Preconditions:** User is on cart page

**Test Steps:**
1. View cart page with empty cart
2. Observe "Proceed to Checkout" button
3. Add items to cart
4. Observe button state change

**Expected Results:**
- Button is disabled when cart is empty
- Button is enabled when cart has items
- Button has clear visual state indicators
- Hover effects work correctly

**Test Data:** N/A

---

#### TC-CO-006: Checkout Flow Continuity
**Priority:** High  
**Type:** Functional  
**Preconditions:** User is logged in with items in cart

**Test Steps:**
1. Log in and add items to cart
2. Proceed to checkout
3. Complete the entire checkout flow
4. Verify each step transitions correctly

**Expected Results:**
- Smooth transition from cart to checkout
- No broken links or navigation issues
- User can go back if needed
- Progress is maintained
- No data loss during flow

**Test Data:** Cart with 2+ items

---

#### TC-CO-007: Checkout Authentication Check
**Priority:** High  
**Type:** Security  
**Preconditions:** User is not logged in

**Test Steps:**
1. Add items to cart without logging in
2. Try to access checkout
3. Observe authentication enforcement

**Expected Results:**
- User is redirected to login page
- Authentication is required
- After login, user returns to checkout
- Cart is preserved during login

**Test Data:** Cart with items

---

#### TC-CO-008: Checkout Error Handling
**Priority:** Medium  
**Type:** Functional  
**Preconditions:** User is logged in, in checkout process

**Test Steps:**
1. Initiate checkout
2. Simulate network error during checkout
3. Observe error handling
4. Retry checkout

**Expected Results:**
- Appropriate error message is displayed
- User can retry the operation
- Cart contents are not lost
- No duplicate orders are created

**Test Data:** Cart with items

---

#### TC-CO-009: Checkout Responsive Design
**Priority:** Medium  
**Type:** UI  
**Preconditions:** User is in checkout process

**Test Steps:**
1. View checkout on desktop
2. View checkout on tablet
3. View checkout on mobile
4. Test all interactions

**Expected Results:**
- Checkout layout adapts to screen size
- All form fields are accessible
- Buttons are properly sized
- Order summary is readable
- No horizontal scrolling

**Test Data:** Cart with items

---

#### TC-CO-010: Checkout Cancel/Back Navigation
**Priority:** Medium  
**Type:** Functional  
**Preconditions:** User is in checkout process

**Test Steps:**
1. Initiate checkout
2. Click browser back button
3. Observe behavior
4. Return to checkout
5. Verify cart state

**Expected Results:**
- User can navigate back to cart
- Cart contents are preserved
- User can resume checkout
- No errors occur

**Test Data:** Cart with items

---

### Payment Gateway Testing

#### TC-PG-001: Create Stripe Checkout Session
**Priority:** Critical  
**Type:** Integration  
**Preconditions:** User is logged in, has items in cart, Stripe configured

**Test Steps:**
1. Log in to the application
2. Add products to cart
3. Proceed to checkout
4. Click "Pay Now" or equivalent button
5. Observe Stripe checkout session creation

**Expected Results:**
- Stripe checkout session is created successfully
- User is redirected to Stripe checkout page
- Order details are passed correctly to Stripe
- Session URL is valid and accessible
- Loading indicator is shown during creation

**Test Data:** Cart with 2+ items

---

#### TC-PG-002: Successful Payment Processing
**Priority:** Critical  
**Type:** Integration  
**Preconditions:** User is on Stripe checkout page

**Test Steps:**
1. Complete checkout to reach Stripe payment page
2. Enter test card details:
   - Card: 4242 4242 4242 4242
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)
3. Click "Pay" button
4. Observe payment processing

**Expected Results:**
- Payment is processed successfully
- User is redirected to success page
- Order is created in database
- Order status is "completed"
- Payment confirmation is shown
- Order appears in order history

**Test Data:** Stripe test card 4242 4242 4242 4242

---

#### TC-PG-003: Declined Payment Handling
**Priority:** High  
**Type:** Integration  
**Preconditions:** User is on Stripe checkout page

**Test Steps:**
1. Complete checkout to reach Stripe payment page
2. Enter declined test card:
   - Card: 4000 0000 0000 0002
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
3. Click "Pay" button
4. Observe payment decline handling

**Expected Results:**
- Payment is declined
- Clear error message is displayed
- User remains on payment page
- User can retry with different card
- No order is created in database
- Cart is preserved

**Test Data:** Stripe test card 4000 0000 0000 0002

---

#### TC-PG-004: Insufficient Funds Handling
**Priority:** High  
**Type:** Integration  
**Preconditions:** User is on Stripe checkout page

**Test Steps:**
1. Complete checkout to reach Stripe payment page
2. Enter insufficient funds test card:
   - Card: 4000 0000 0000 9995
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
3. Click "Pay" button
4. Observe handling

**Expected Results:**
- Payment fails with insufficient funds error
- Appropriate error message is displayed
- User can retry payment
- No order is created
- Cart is preserved

**Test Data:** Stripe test card 4000 0000 0000 9995

---

#### TC-PG-005: Expired Card Handling
**Priority:** Medium  
**Type:** Integration  
**Preconditions:** User is on Stripe checkout page

**Test Steps:**
1. Complete checkout to reach Stripe payment page
2. Enter expired card test card:
   - Card: 4000 0000 0000 0069
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
3. Click "Pay" button
4. Observe handling

**Expected Results:**
- Payment fails with expired card error
- Clear error message is displayed
- User can enter different card
- No order is created

**Test Data:** Stripe test card 4000 0000 0000 0069

---

#### TC-PG-006: Payment Processing Error
**Priority:** High  
**Type:** Integration  
**Preconditions:** User is on Stripe checkout page

**Test Steps:**
1. Complete checkout to reach Stripe payment page
2. Enter processing error test card:
   - Card: 4000 0000 0000 0119
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
3. Click "Pay" button
4. Observe error handling

**Expected Results:**
- Payment processing fails
- Error message is displayed
- User can retry payment
- No order is created
- System remains stable

**Test Data:** Stripe test card 4000 0000 0000 0119

---

#### TC-PG-007: Payment Verification
**Priority:** Critical  
**Type:** Integration  
**Preconditions:** Payment has been completed

**Test Steps:**
1. Complete a successful payment
2. Check database for order record
3. Verify order status
4. Check payment details

**Expected Results:**
- Order is created in database
- Order status is "completed"
- Payment amount matches order total
- Order items match cart contents
- Timestamp is recorded correctly
- User ID is associated with order

**Test Data:** Successful payment transaction

---

#### TC-PG-008: Payment Success Page
**Priority:** High  
**Type:** Functional  
**Preconditions:** Payment completed successfully

**Test Steps:**
1. Complete a successful payment
2. Observe the success page redirect
3. Review success page content

**Expected Results:**
- User is redirected to /payment-success
- Success message is displayed
- Order number/ID is shown
- Order summary is displayed
- Link to order history is available
- Cart is cleared after successful payment

**Test Data:** Successful payment

---

#### TC-PG-009: Payment Cancellation
**Priority:** Medium  
**Type:** Functional  
**Preconditions:** User is on Stripe checkout page

**Test Steps:**
1. Complete checkout to reach Stripe payment page
2. Click "Back" or "Cancel" button
3. Observe behavior

**Expected Results:**
- User is returned to the application
- Cart contents are preserved
- No order is created
- User can retry checkout
- Appropriate message is shown

**Test Data:** Any cart items

---

#### TC-PG-010: Order Status Update After Payment
**Priority:** Critical  
**Type:** Integration  
**Preconditions:** Payment completed

**Test Steps:**
1. Complete a successful payment
2. Navigate to order history
3. Find the recent order
4. Check order status

**Expected Results:**
- Order appears in order history
- Order status is "completed"
- Order details are accurate
- Payment timestamp is recorded
- Order total matches payment amount

**Test Data:** Successful payment

---

#### TC-PG-011: Multiple Payment Attempts
**Priority:** Medium  
**Type:** Functional  
**Preconditions:** User has items in cart

**Test Steps:**
1. Initiate checkout
2. Attempt payment with declined card
3. Retry with another declined card
4. Finally use successful card
5. Verify order creation

**Expected Results:**
- Each failed attempt shows appropriate error
- User can retry multiple times
- Only one order is created on success
- No duplicate orders
- Cart is cleared only on success

**Test Data:** Multiple test cards

---

#### TC-PG-012: Payment Security - HTTPS
**Priority:** Critical  
**Type:** Security  
**Preconditions:** Application is accessible

**Test Steps:**
1. Navigate to checkout
2. Check URL protocol
3. Verify SSL certificate
4. Check for security indicators

**Expected Results:**
- All payment pages use HTTPS
- Valid SSL certificate is present
- Browser shows secure connection indicator
- No mixed content warnings
- Payment data is encrypted

**Test Data:** N/A

---

#### TC-PG-013: Payment Amount Accuracy
**Priority:** Critical  
**Type:** Functional  
**Preconditions:** User has items in cart

**Test Steps:**
1. Add items to cart with known prices:
   - Item 1: ₹120
   - Item 2: ₹280
   - Item 3: ₹150
2. Proceed to checkout
3. Verify amount on Stripe checkout page
4. Complete payment
5. Verify order total in database

**Expected Results:**
- Stripe checkout shows correct total (₹550)
- No price manipulation is possible
- Order total in database matches payment
- All amounts are accurate
- Currency is correct (INR)

**Test Data:** 
- Item 1: ₹120
- Item 2: ₹280
- Item 3: ₹150
- Expected Total: ₹550

---

#### TC-PG-014: Payment Webhook Handling
**Priority:** High  
**Type:** Integration  
**Preconditions:** Stripe webhooks configured

**Test Steps:**
1. Complete a payment
2. Monitor webhook events
3. Verify webhook processing
4. Check order status update

**Expected Results:**
- Webhook is received successfully
- Payment verification Edge Function is triggered
- Order status is updated correctly
- Webhook signature is validated
- Failed webhooks are retried

**Test Data:** Successful payment

---

#### TC-PG-015: Payment Session Timeout
**Priority:** Medium  
**Type:** Functional  
**Preconditions:** User is on Stripe checkout page

**Test Steps:**
1. Initiate checkout
2. Reach Stripe payment page
3. Wait for session timeout (typically 24 hours, test with shorter timeout if possible)
4. Try to complete payment

**Expected Results:**
- Expired session is detected
- User is informed of expiration
- User can create new checkout session
- No errors occur
- Cart is preserved

**Test Data:** N/A

---

#### TC-PG-016: Concurrent Payment Attempts
**Priority:** Low  
**Type:** Performance  
**Preconditions:** Multiple users ready to checkout

**Test Steps:**
1. Have 10 users simultaneously initiate checkout
2. All users proceed to payment
3. All users complete payment
4. Verify all orders

**Expected Results:**
- All checkout sessions are created successfully
- No session conflicts
- All payments are processed correctly
- All orders are created
- No data corruption

**Test Data:** 10 concurrent users

---

#### TC-PG-017: Payment Error Recovery
**Priority:** Medium  
**Type:** Functional  
**Preconditions:** User encounters payment error

**Test Steps:**
1. Initiate checkout
2. Simulate payment failure
3. Observe error handling
4. Retry payment
5. Complete successfully

**Expected Results:**
- Error is handled gracefully
- User can retry without issues
- Cart is not lost
- No duplicate orders
- Successful retry creates order

**Test Data:** Failed then successful payment

---

#### TC-PG-018: Payment Receipt/Confirmation
**Priority:** Medium  
**Type:** Functional  
**Preconditions:** Payment completed successfully

**Test Steps:**
1. Complete a successful payment
2. Check success page for confirmation details
3. Navigate to order history
4. View order details

**Expected Results:**
- Order confirmation is displayed
- Order number is provided
- Order details are accessible
- Payment amount is shown
- Order date/time is recorded

**Test Data:** Successful payment

---

#### TC-PG-019: Stripe Test Mode Verification
**Priority:** High  
**Type:** Configuration  
**Preconditions:** Application is in test environment

**Test Steps:**
1. Check Stripe configuration
2. Verify test mode is enabled
3. Attempt payment with test card
4. Verify no real charges occur

**Expected Results:**
- Stripe is in test mode
- Test cards work correctly
- No real money is charged
- Test transactions are clearly marked
- Production keys are not used

**Test Data:** Stripe test cards

---

#### TC-PG-020: Payment Edge Function Security
**Priority:** Critical  
**Type:** Security  
**Preconditions:** Edge Functions deployed

**Test Steps:**
1. Review Edge Function code
2. Check for exposed secrets
3. Verify authentication requirements
4. Test unauthorized access attempts

**Expected Results:**
- STRIPE_SECRET_KEY is stored securely
- No secrets in client-side code
- Edge Functions require authentication
- Unauthorized requests are rejected
- Input validation is implemented

**Test Data:** N/A

---

## Test Execution Schedule

### Phase 1: Product Catalog Testing (Days 1-2)
- Execute TC-PC-001 through TC-PC-010
- Focus on core product display and filtering
- Document any defects found

### Phase 2: Shopping Cart Testing (Days 3-4)
- Execute TC-SC-001 through TC-SC-015
- Test all cart operations thoroughly
- Verify calculations and persistence

### Phase 3: Checkout Testing (Days 5)
- Execute TC-CO-001 through TC-CO-010
- Test complete checkout flow
- Verify authentication and validation

### Phase 4: Payment Gateway Testing (Days 6-8)
- Execute TC-PG-001 through TC-PG-020
- Test all payment scenarios
- Verify Stripe integration thoroughly
- Test security aspects

### Phase 5: Integration & Regression Testing (Days 9-10)
- Execute end-to-end user scenarios
- Retest any fixed defects
- Perform cross-browser testing
- Conduct performance testing

### Phase 6: User Acceptance Testing (Days 11-12)
- Stakeholder review
- Real-world scenario testing
- Final sign-off

---

## Risk Assessment

### High-Risk Areas

1. **Payment Processing**
   - **Risk:** Payment failures or incorrect charges
   - **Mitigation:** Thorough testing with all Stripe test cards, webhook verification
   - **Impact:** Critical - affects revenue and customer trust

2. **Cart Calculations**
   - **Risk:** Incorrect pricing or totals
   - **Mitigation:** Automated calculation verification, multiple test scenarios
   - **Impact:** High - affects order accuracy

3. **Authentication**
   - **Risk:** Unauthorized access to checkout
   - **Mitigation:** Security testing, authentication verification
   - **Impact:** High - security vulnerability

4. **Data Integrity**
   - **Risk:** Order data corruption or loss
   - **Mitigation:** Database transaction testing, error handling verification
   - **Impact:** Critical - affects business operations

### Medium-Risk Areas

1. **Browser Compatibility**
   - **Risk:** Features not working on certain browsers
   - **Mitigation:** Cross-browser testing
   - **Impact:** Medium - affects user experience

2. **Performance**
   - **Risk:** Slow page loads or cart operations
   - **Mitigation:** Performance testing, optimization
   - **Impact:** Medium - affects user satisfaction

3. **Mobile Responsiveness**
   - **Risk:** Poor mobile experience
   - **Mitigation:** Mobile device testing
   - **Impact:** Medium - affects mobile users

### Low-Risk Areas

1. **UI Styling**
   - **Risk:** Minor visual inconsistencies
   - **Mitigation:** UI review and testing
   - **Impact:** Low - cosmetic issues

2. **Search Performance**
   - **Risk:** Slow search with many products
   - **Mitigation:** Performance testing with large datasets
   - **Impact:** Low - affects user convenience

---

## Defect Management

### Defect Severity Levels

**Critical (P1)**
- Payment processing failures
- Data loss or corruption
- Security vulnerabilities
- Application crashes
- **Resolution Time:** Immediate (within 24 hours)

**High (P2)**
- Incorrect calculations
- Cart functionality broken
- Checkout flow blocked
- Major UI issues
- **Resolution Time:** 2-3 days

**Medium (P3)**
- Minor calculation errors
- UI inconsistencies
- Performance issues
- Browser-specific issues
- **Resolution Time:** 1 week

**Low (P4)**
- Cosmetic issues
- Minor text errors
- Enhancement requests
- **Resolution Time:** Future release

### Defect Reporting Template

```
Defect ID: [Auto-generated]
Title: [Brief description]
Severity: [Critical/High/Medium/Low]
Priority: [P1/P2/P3/P4]
Test Case ID: [Related test case]
Environment: [Browser, OS, Device]
Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]
Expected Result: [What should happen]
Actual Result: [What actually happened]
Screenshots: [Attach if applicable]
Additional Notes: [Any other relevant information]
```

### Defect Workflow
1. **New** - Defect reported
2. **Assigned** - Assigned to developer
3. **In Progress** - Being fixed
4. **Fixed** - Fix completed
5. **Ready for Retest** - Ready for verification
6. **Retesting** - Being retested
7. **Closed** - Verified and closed
8. **Reopened** - Issue persists

---

## Test Deliverables

### Test Documentation
1. **Test Plan** (this document)
2. **Test Cases** (detailed in this document)
3. **Test Execution Report**
4. **Defect Report**
5. **Test Summary Report**
6. **Test Metrics Dashboard**

### Test Execution Report Template

```
Test Execution Report
Date: [Date]
Tester: [Name]
Test Phase: [Phase name]

Summary:
- Total Test Cases: [Number]
- Executed: [Number]
- Passed: [Number]
- Failed: [Number]
- Blocked: [Number]
- Not Executed: [Number]

Pass Rate: [Percentage]

Critical Defects: [Number]
High Defects: [Number]
Medium Defects: [Number]
Low Defects: [Number]

Comments: [Any observations or notes]
```

### Test Summary Report Template

```
Test Summary Report
Project: Srilaya Enterprises Organic Store
Test Period: [Start Date] to [End Date]
Prepared By: [Name]
Date: [Date]

Executive Summary:
[Brief overview of testing activities and results]

Test Scope:
- Product Catalog: [Status]
- Shopping Cart: [Status]
- Checkout: [Status]
- Payment Gateway: [Status]

Test Statistics:
- Total Test Cases: [Number]
- Test Cases Executed: [Number]
- Test Cases Passed: [Number]
- Test Cases Failed: [Number]
- Pass Rate: [Percentage]

Defect Summary:
- Total Defects Found: [Number]
- Critical: [Number]
- High: [Number]
- Medium: [Number]
- Low: [Number]
- Defects Fixed: [Number]
- Defects Open: [Number]

Test Environment:
- Browsers Tested: [List]
- Devices Tested: [List]
- OS Tested: [List]

Key Findings:
[List major findings and observations]

Risks and Issues:
[List any risks or issues identified]

Recommendations:
[List recommendations for improvement]

Sign-off:
QA Lead: _________________ Date: _______
Project Manager: _________________ Date: _______
```

---

## Appendix

### A. Test Data Reference

#### Sample Products for Testing
1. **Foxtail Millet**
   - 1kg: ₹120
   - 2kg: ₹230
   - 5kg: ₹550
   - 10kg: ₹1050

2. **Basmati Rice**
   - 1kg: ₹150
   - 2kg: ₹280
   - 5kg: ₹680
   - 10kg: ₹1300

3. **Raw Honey**
   - 200g: ₹180
   - 500g: ₹420
   - 1kg: ₹800

#### Test User Accounts
- **Admin:** admin@test.com / Test@123
- **User 1:** user1@test.com / Test@123
- **User 2:** user2@test.com / Test@123
- **User 3:** user3@test.com / Test@123

#### Stripe Test Cards
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **Insufficient Funds:** 4000 0000 0000 9995
- **Expired:** 4000 0000 0000 0069
- **Processing Error:** 4000 0000 0000 0119

### B. Browser Compatibility Matrix

| Browser | Version | Desktop | Mobile | Status |
|---------|---------|---------|--------|--------|
| Chrome | Latest 2 | ✓ | ✓ | Required |
| Firefox | Latest 2 | ✓ | ✓ | Required |
| Safari | Latest 2 | ✓ | ✓ | Required |
| Edge | Latest 2 | ✓ | ✓ | Required |
| Opera | Latest | ✓ | - | Optional |

### C. Device Testing Matrix

| Device Type | Screen Size | Orientation | Priority |
|-------------|-------------|-------------|----------|
| Desktop | 1920x1080 | Landscape | High |
| Desktop | 1366x768 | Landscape | High |
| Laptop | 1440x900 | Landscape | High |
| Tablet | 768x1024 | Both | Medium |
| Mobile | 375x667 | Both | High |
| Mobile | 414x896 | Both | High |

### D. Test Metrics to Track

1. **Test Coverage**
   - Percentage of requirements covered
   - Percentage of code covered (if applicable)

2. **Test Execution**
   - Test cases executed per day
   - Test execution velocity
   - Pass/fail rate

3. **Defect Metrics**
   - Defects found per test phase
   - Defect density
   - Defect resolution time
   - Defect reopen rate

4. **Quality Metrics**
   - Critical defects in production
   - Customer-reported issues
   - Test effectiveness

### E. Glossary

- **Cart:** Shopping cart containing selected products
- **Checkout:** Process of finalizing a purchase
- **Edge Function:** Serverless function running on Supabase
- **RLS:** Row Level Security in Supabase
- **Stripe:** Payment processing platform
- **Variant:** Different packaging size of a product
- **Webhook:** HTTP callback for event notifications

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-29 | QA Team | Initial test plan creation |

---

## Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | | | |
| Project Manager | | | |
| Development Lead | | | |
| Product Owner | | | |

---

**End of Test Plan**
