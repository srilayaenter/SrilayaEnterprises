# Customer Registration & Checkout Test - Quick Reference Card

**Print this page for quick reference during testing**

---

## 🎯 Test Objective
Validate customer account creation and complete checkout process with order type selection and order summary review.

---

## 📋 7-Phase Test Flow

| Phase | What to Test | Expected Result |
|-------|--------------|-----------------|
| **1️⃣ Registration** | Create new account | ✅ Account created, user logged in |
| **2️⃣ Shopping Cart** | Add 2+ products | ✅ Cart badge shows count, items displayed |
| **3️⃣ Checkout** | Proceed to checkout | ✅ Checkout page loads with pre-filled info |
| **4️⃣ Order Type** | Select Online/In-Store | ✅ Form updates based on selection |
| **5️⃣ Address** | Enter delivery address (online) | ✅ Shipping calculated and added to total |
| **6️⃣ Order Summary** | Review pricing breakdown | ✅ All calculations correct |
| **7️⃣ Validation** | Verify all details | ✅ Ready to place order |

---

## 🧪 Test Data

### User Credentials
```
Username: testuser_001
Email: testuser001@example.com
Phone: 9876543210
Password: TestPass123!
```

### Delivery Address (Online Orders)
```
Name: John Doe
Email: john.doe@example.com
Phone: 9876543210
Address: 123 Main Street, Apartment 4B
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
Card: 4242 4242 4242 4242
Expiry: 12/25 | CVC: 123 | ZIP: 12345
```

---

## 💰 Pricing Calculations

### Formula
```
Subtotal = Sum of (item price × quantity)
GST = Subtotal × 5%
Shipping = Calculated amount (online) or ₹0 (in-store)
Total = Subtotal + GST + Shipping - Discounts
```

### Online Order Example
```
Subtotal:  ₹430.00
GST (5%):   ₹21.50
Shipping:   ₹80.00
─────────────────────
Total:     ₹531.50
```

### In-Store Purchase Example
```
Subtotal:  ₹430.00
GST (5%):   ₹21.50
Shipping:    ₹0.00
─────────────────────
Total:     ₹451.50
```

---

## 🔍 Key Validation Points

### ✅ Registration & Login
- [ ] Username is unique
- [ ] Email format is valid
- [ ] Password meets requirements (8+ chars, uppercase, lowercase, number)
- [ ] Login successful with valid credentials
- [ ] User name appears in header after login

### ✅ Shopping Cart
- [ ] Products can be added to cart
- [ ] Cart badge updates with item count
- [ ] All items displayed on cart page
- [ ] Quantities can be changed
- [ ] Total calculates correctly

### ✅ Checkout Page
- [ ] User must be logged in
- [ ] User info is pre-filled (if profile exists)
- [ ] All cart items are displayed
- [ ] Order type selection is visible
- [ ] Payment method options are visible

### ✅ Order Type: Online Order
- [ ] Delivery address fields are **required**
- [ ] "Calculate Shipping" button appears
- [ ] Shipping cost is calculated and displayed
- [ ] Shipping cost > ₹0
- [ ] Payment method: Card (Stripe)
- [ ] Total includes shipping

### ✅ Order Type: In-Store Purchase
- [ ] Delivery address fields are **optional**
- [ ] No "Calculate Shipping" button
- [ ] Shipping cost = ₹0
- [ ] Payment method: Cash, UPI, or Split
- [ ] Total excludes shipping

### ✅ Order Summary
- [ ] All items listed with name, variant, quantity, price
- [ ] Subtotal = Sum of all items
- [ ] GST = Subtotal × 5%
- [ ] Shipping = Calculated (online) or ₹0 (in-store)
- [ ] Total = Subtotal + GST + Shipping - Discounts
- [ ] All amounts in ₹ (INR) with 2 decimal places
- [ ] Order type badge displayed
- [ ] Payment method displayed

### ✅ Final Validation
- [ ] All required fields filled
- [ ] Order type selected
- [ ] Payment method selected
- [ ] Order summary accurate
- [ ] "Place Order" button enabled

---

## 🐛 Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| **Registration fails** | Try different username/email |
| **Can't add to cart** | Select variant (packaging size) first |
| **Shipping not calculated** | Fill City & State, click "Calculate Shipping" |
| **Total incorrect** | Verify: Subtotal + GST + Shipping - Discounts |
| **Payment fails** | Use test card: `4242 4242 4242 4242` |
| **In-store order fails** | Verify Name, Email, Phone are filled |
| **Split payment error** | Ensure Cash + Digital = Total |

---

## 📊 Test Result Template

```
Test Date: _______________
Tester: _______________
Browser: _______________

Phase 1 - Registration & Login:     [ ] Pass  [ ] Fail
Phase 2 - Shopping Cart:             [ ] Pass  [ ] Fail
Phase 3 - Checkout Initiation:       [ ] Pass  [ ] Fail
Phase 4 - Order Type Selection:      [ ] Pass  [ ] Fail
Phase 5 - Delivery Address:          [ ] Pass  [ ] Fail
Phase 6 - Order Summary:             [ ] Pass  [ ] Fail
Phase 7 - Final Validation:          [ ] Pass  [ ] Fail

Overall Result:                      [ ] ✅ PASS  [ ] ❌ FAIL

Critical Issues:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## 🎓 Testing Tips

### Before You Start
1. ✅ Clear browser cache or use incognito mode
2. ✅ Verify application is accessible
3. ✅ Have test data ready
4. ✅ Open browser console (F12) to check for errors

### During Testing
1. ✅ Follow the test flow in order (Phase 1 → 7)
2. ✅ Document any errors or unexpected behavior
3. ✅ Take screenshots of issues
4. ✅ Note the exact steps to reproduce issues
5. ✅ Check browser console for error messages

### After Testing
1. ✅ Complete the test result template
2. ✅ Document all issues found
3. ✅ Verify critical functionality works
4. ✅ Sign off on test completion

---

## 🔗 Related Documentation

- **Detailed Test Steps:** [CUSTOMER_REGISTRATION_CHECKOUT_TEST.md](./CUSTOMER_REGISTRATION_CHECKOUT_TEST.md)
- **Test Checklist:** [CHECKOUT_TEST_CHECKLIST.md](./CHECKOUT_TEST_CHECKLIST.md)
- **Visual Flow Diagram:** [CHECKOUT_TEST_FLOW.md](./CHECKOUT_TEST_FLOW.md)
- **Full Test Plan:** [ECOMMERCE_TEST_PLAN.md](./ECOMMERCE_TEST_PLAN.md)

---

## 📞 Support

**For issues during testing:**
1. Check troubleshooting section in detailed test guide
2. Review browser console for errors
3. Check network tab for failed API requests
4. Document issue with screenshots
5. Report to development team

---

## ✍️ Quick Sign-Off

```
Test Completed: [ ] Yes  [ ] No
All Tests Passed: [ ] Yes  [ ] No
Ready for Production: [ ] Yes  [ ] No

Tester: _______________________
Date: _______________________
```

---

**Document Version:** 1.0  
**Last Updated:** 2025-12-01

---

## 🖨️ Print Instructions

**For best results:**
- Print in color for better readability
- Use landscape orientation
- Print double-sided to save paper
- Keep this card handy during testing

---

**Quick Access URLs:**

```
Application URL: [Your application URL]
Admin Panel: [Your application URL]/admin
Login Page: [Your application URL]/login
Register Page: [Your application URL]/register
```

---

## 🎯 Success Criteria

**Test is successful when:**

✅ New user can register successfully  
✅ User can log in with valid credentials  
✅ Products can be added to cart  
✅ Cart displays all items correctly  
✅ Checkout page loads with pre-filled info  
✅ Order type selection works (Online/In-Store)  
✅ Delivery address can be entered (online orders)  
✅ Shipping cost is calculated (online orders)  
✅ Order summary displays all pricing details  
✅ All calculations are accurate  
✅ Order can be placed successfully  

---

**Remember:** Quality testing ensures a great user experience! 🚀
