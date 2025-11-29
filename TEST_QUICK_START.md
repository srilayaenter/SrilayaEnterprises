# Test Quick Start Guide
## Get Started with E-Commerce Testing in 5 Minutes

**Project:** Srilaya Enterprises Organic Store  
**Purpose:** Quick onboarding for new testers  
**Time to Read:** 5 minutes

---

## 🚀 Start Here

Welcome to the e-commerce testing suite! This guide will get you testing in 5 minutes.

---

## 📋 What You Need

### Before You Start
- [ ] Access to test environment
- [ ] Test user account credentials
- [ ] Stripe test card numbers
- [ ] This documentation

### Test Environment
- **URL:** [Your test environment URL]
- **Database:** Supabase (pre-loaded with 17 products)
- **Payment:** Stripe Test Mode

---

## 🎯 Your First Test (5 Minutes)

### Quick Smoke Test

Follow these steps to verify the application works:

#### 1. Browse Products (1 min)
```
✓ Open the application home page
✓ Verify products are displayed
✓ Click on any product
✓ Verify product details load
```

#### 2. Add to Cart (1 min)
```
✓ Select a variant (e.g., 1kg)
✓ Click "Add to Cart"
✓ Verify success message
✓ Check cart badge shows "1"
```

#### 3. View Cart (1 min)
```
✓ Click on cart icon
✓ Verify item is in cart
✓ Check price is correct
✓ Try changing quantity
```

#### 4. Checkout (1 min)
```
✓ Click "Proceed to Checkout"
✓ Login if prompted (use test account)
✓ Verify order summary
✓ Proceed to payment
```

#### 5. Payment (1 min)
```
✓ Enter test card: 4242 4242 4242 4242
✓ Expiry: 12/25, CVC: 123
✓ Complete payment
✓ Verify success page
```

**✅ If all steps pass, the application is working!**

---

## 📚 Documentation Structure

### 5 Key Documents

1. **TEST_QUICK_START.md** (This file)
   - Quick onboarding guide
   - First test in 5 minutes
   - Essential information

2. **TESTING_DOCUMENTATION_SUMMARY.md**
   - Overview of all testing docs
   - How to use each document
   - Best practices

3. **ECOMMERCE_TEST_PLAN.md**
   - Complete test plan (44 KB)
   - 55 detailed test cases
   - All test procedures

4. **TEST_EXECUTION_CHECKLIST.md**
   - Daily testing checklist
   - Quick reference
   - Test data

5. **TEST_RESULTS_TEMPLATE.md**
   - Results recording template
   - Defect tracking
   - Sign-off forms

**Bonus:** TEST_CASE_MATRIX.md - Visual test case overview

---

## 🎓 Which Document to Use When

### Starting Your Day
→ **TEST_EXECUTION_CHECKLIST.md**
- Check off test cases as you complete them
- Quick reference for test data
- Daily summary template

### Executing Tests
→ **ECOMMERCE_TEST_PLAN.md**
- Detailed test steps
- Expected results
- Test data requirements

### Recording Results
→ **TEST_RESULTS_TEMPLATE.md**
- Mark tests as Pass/Fail
- Document defects
- Track progress

### Understanding the Big Picture
→ **TESTING_DOCUMENTATION_SUMMARY.md**
- Test strategy overview
- Success criteria
- Best practices

### Quick Reference
→ **TEST_CASE_MATRIX.md**
- All test cases at a glance
- Priority and dependencies
- Time estimates

---

## 🔑 Essential Information

### Test Accounts

**Admin Account:**
- First registered user becomes admin
- Full access to admin dashboard

**Regular User Accounts:**
- Create multiple test accounts
- Use for different scenarios

### Stripe Test Cards

**Success:**
```
Card: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

**Decline:**
```
Card: 4000 0000 0000 0002
```

**Insufficient Funds:**
```
Card: 4000 0000 0000 9995
```

**More cards in:** ECOMMERCE_TEST_PLAN.md → Test Data Requirements

### Sample Products

**Foxtail Millet:**
- 1kg: ₹120
- 2kg: ₹230
- 5kg: ₹550
- 10kg: ₹1050

**Basmati Rice:**
- 1kg: ₹150
- 2kg: ₹280

**Raw Honey:**
- 200g: ₹180
- 500g: ₹420

---

## 🎯 Test Priorities

### Must Test First (Critical Path)
1. ✅ View products
2. ✅ Add to cart
3. ✅ View cart
4. ✅ Checkout
5. ✅ Payment

**Time:** 1 hour  
**Pass Rate Required:** 100%

### Test Next (High Priority)
- Search and filter
- Cart calculations
- Multiple items
- Payment failures
- Order verification

**Time:** 4 hours  
**Pass Rate Required:** ≥ 95%

### Test Last (Medium/Low Priority)
- UI responsiveness
- Performance
- Edge cases
- Error handling

**Time:** 3 hours  
**Pass Rate Required:** ≥ 90%

---

## 📊 Test Coverage

### 55 Total Test Cases

| Feature | Test Cases | Time |
|---------|------------|------|
| Product Catalog | 10 | 58 min |
| Shopping Cart | 15 | 89 min |
| Checkout | 10 | 53 min |
| Payment Gateway | 20 | 144 min |
| **Total** | **55** | **5.7 hours** |

---

## 🐛 Reporting Defects

### Quick Defect Template

```
Title: [Brief description]
Severity: Critical / High / Medium / Low
Test Case: TC-XX-XXX
Steps:
1. [Step 1]
2. [Step 2]
3. [Step 3]
Expected: [What should happen]
Actual: [What happened]
```

### Severity Guide

**Critical (P1)** - Fix immediately
- Payment failures
- Data loss
- Security issues
- App crashes

**High (P2)** - Fix before release
- Wrong calculations
- Broken features
- Major UI issues

**Medium (P3)** - Fix in current release
- Minor errors
- UI inconsistencies
- Performance issues

**Low (P4)** - Fix later
- Cosmetic issues
- Text errors
- Enhancements

---

## ✅ Daily Checklist

### Every Morning
- [ ] Check test environment is up
- [ ] Review assigned test cases
- [ ] Prepare test data
- [ ] Clear browser cache

### During Testing
- [ ] Follow test steps exactly
- [ ] Document everything
- [ ] Take screenshots of failures
- [ ] Report defects immediately

### End of Day
- [ ] Update test results
- [ ] Complete daily summary
- [ ] Communicate status
- [ ] Plan next day

---

## 🎓 Testing Best Practices

### Do's ✅
- ✅ Test with fresh data
- ✅ Clear cache between tests
- ✅ Take screenshots of failures
- ✅ Verify calculations manually
- ✅ Test on real devices
- ✅ Report defects immediately
- ✅ Retest fixed bugs

### Don'ts ❌
- ❌ Skip test steps
- ❌ Assume something works
- ❌ Test without test data
- ❌ Ignore minor issues
- ❌ Rush through tests
- ❌ Test only happy paths
- ❌ Forget to document

---

## 🚨 Common Issues & Solutions

### Issue: Products Not Loading
**Solution:** Check internet connection, refresh page, verify test environment is up

### Issue: Cart Badge Not Updating
**Solution:** Clear browser cache, check browser console for errors

### Issue: Payment Fails with Test Card
**Solution:** Verify Stripe is in test mode, check card number is correct

### Issue: Can't Login
**Solution:** Verify account exists, check credentials, try password reset

### Issue: Order Not Created
**Solution:** Check payment completed successfully, verify webhook is working

---

## 📞 Who to Contact

### Test Environment Issues
→ Contact: Dev Lead

### Test Data Issues
→ Contact: QA Lead

### Defect Questions
→ Contact: Dev Lead

### Test Plan Questions
→ Contact: QA Lead

### Priority/Scope Questions
→ Contact: Project Manager

---

## 🎯 Success Criteria

### You're Ready for Release When:

- ✅ All critical tests pass (100%)
- ✅ All high priority tests pass (≥95%)
- ✅ Overall pass rate ≥95%
- ✅ No critical defects open
- ✅ No high defects open
- ✅ Payment works perfectly
- ✅ Cart calculations are accurate
- ✅ Cross-browser testing done
- ✅ Mobile testing done
- ✅ Stakeholders approve

---

## 📖 Next Steps

### After This Guide

1. **Read:** TESTING_DOCUMENTATION_SUMMARY.md
   - Understand the full testing strategy
   - Learn about all documents

2. **Review:** ECOMMERCE_TEST_PLAN.md
   - Study detailed test cases
   - Understand test procedures

3. **Use:** TEST_EXECUTION_CHECKLIST.md
   - Start executing tests
   - Track your progress

4. **Record:** TEST_RESULTS_TEMPLATE.md
   - Document test results
   - Report defects

5. **Reference:** TEST_CASE_MATRIX.md
   - Quick test case lookup
   - Check dependencies

---

## 🎉 You're Ready!

You now have everything you need to start testing:

✅ Test environment access  
✅ Test data and accounts  
✅ Documentation and guides  
✅ First test completed  
✅ Understanding of process  

**Start with the 5-minute smoke test above, then dive into the full test suite!**

---

## 📚 Quick Links

- **Full Test Plan:** ECOMMERCE_TEST_PLAN.md
- **Daily Checklist:** TEST_EXECUTION_CHECKLIST.md
- **Results Template:** TEST_RESULTS_TEMPLATE.md
- **Documentation Overview:** TESTING_DOCUMENTATION_SUMMARY.md
- **Test Case Matrix:** TEST_CASE_MATRIX.md

---

## 💡 Pro Tips

1. **Start Small** - Begin with the smoke test, then expand
2. **Stay Organized** - Use the checklist to track progress
3. **Document Everything** - Screenshots are your friend
4. **Ask Questions** - Don't hesitate to reach out
5. **Test Early** - Find bugs before they reach production
6. **Be Thorough** - Edge cases matter
7. **Communicate** - Keep team updated on progress

---

## 🎯 Your Testing Journey

```
Day 1: Onboarding & Smoke Test
  ↓
Day 2-3: Product Catalog & Cart Testing
  ↓
Day 4-5: Checkout & Payment Testing
  ↓
Day 6-7: Integration & Regression
  ↓
Day 8-9: Cross-browser & Mobile
  ↓
Day 10: Final Validation & Sign-off
```

---

## ✨ Remember

**Quality is everyone's responsibility!**

Your testing ensures customers have a great experience and the business runs smoothly. Every bug you find is a problem prevented.

**Happy Testing! 🚀**

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-29  
**Questions?** Contact QA Lead

---

**Quick Reference Card**

```
┌─────────────────────────────────────────┐
│  QUICK REFERENCE                        │
├─────────────────────────────────────────┤
│  Test Card: 4242 4242 4242 4242        │
│  Expiry: 12/25  CVC: 123               │
│                                         │
│  Total Tests: 55                        │
│  Time: ~6 hours                         │
│                                         │
│  Critical Tests: 5 (Must pass 100%)    │
│  High Priority: 27 (Must pass ≥95%)    │
│                                         │
│  Defect Severity:                       │
│  P1 = Critical (Fix now)               │
│  P2 = High (Fix before release)        │
│  P3 = Medium (Fix this release)        │
│  P4 = Low (Fix later)                  │
└─────────────────────────────────────────┘
```
