# Test Case Matrix
## E-Commerce Feature Testing - Quick Reference

**Project:** Srilaya Enterprises Organic Store  
**Total Test Cases:** 55  
**Last Updated:** 2025-11-29

---

## Test Case Overview Matrix

| ID | Test Case Name | Feature | Priority | Type | Estimated Time |
|----|----------------|---------|----------|------|----------------|
| **PRODUCT CATALOG (10 Test Cases)** |
| TC-PC-001 | View Product Listing Page | Catalog | High | Functional | 5 min |
| TC-PC-002 | Search Products by Name | Catalog | High | Functional | 5 min |
| TC-PC-003 | Filter Products by Category | Catalog | High | Functional | 5 min |
| TC-PC-004 | View Product Details | Catalog | High | Functional | 5 min |
| TC-PC-005 | Select Product Variant | Catalog | High | Functional | 5 min |
| TC-PC-006 | Product Image Display | Catalog | Medium | UI | 5 min |
| TC-PC-007 | Product Price Display | Catalog | High | Functional | 5 min |
| TC-PC-008 | Empty Search Results | Catalog | Medium | Functional | 3 min |
| TC-PC-009 | Product Catalog Responsive Design | Catalog | High | UI | 10 min |
| TC-PC-010 | Product Catalog Performance | Catalog | Medium | Performance | 10 min |
| **SHOPPING CART (15 Test Cases)** |
| TC-SC-001 | Add Product to Cart from Detail | Cart | High | Functional | 5 min |
| TC-SC-002 | Add Multiple Products to Cart | Cart | High | Functional | 7 min |
| TC-SC-003 | View Cart Page | Cart | High | Functional | 5 min |
| TC-SC-004 | Update Cart Item Quantity | Cart | High | Functional | 5 min |
| TC-SC-005 | Remove Item from Cart | Cart | High | Functional | 3 min |
| TC-SC-006 | Empty Cart Handling | Cart | Medium | Functional | 3 min |
| TC-SC-007 | Cart Calculations Accuracy | Cart | High | Functional | 7 min |
| TC-SC-008 | Cart Persistence (Guest) | Cart | High | Functional | 5 min |
| TC-SC-009 | Cart Persistence (Logged-in) | Cart | High | Functional | 7 min |
| TC-SC-010 | Same Product Different Variants | Cart | Medium | Functional | 7 min |
| TC-SC-011 | Cart Maximum Quantity Validation | Cart | Medium | Functional | 5 min |
| TC-SC-012 | Cart UI Responsiveness | Cart | Medium | UI | 10 min |
| TC-SC-013 | Cart Badge Updates | Cart | Medium | Functional | 5 min |
| TC-SC-014 | Performance with Multiple Items | Cart | Low | Performance | 10 min |
| TC-SC-015 | Cart Error Handling | Cart | Medium | Functional | 5 min |
| **CHECKOUT (10 Test Cases)** |
| TC-CO-001 | Initiate Checkout as Guest | Checkout | High | Functional | 5 min |
| TC-CO-002 | Initiate Checkout as Logged-in User | Checkout | High | Functional | 5 min |
| TC-CO-003 | View Order Summary Before Payment | Checkout | High | Functional | 5 min |
| TC-CO-004 | Checkout Validation - Empty Cart | Checkout | Medium | Functional | 3 min |
| TC-CO-005 | Checkout Button State | Checkout | Medium | UI | 3 min |
| TC-CO-006 | Checkout Flow Continuity | Checkout | High | Functional | 7 min |
| TC-CO-007 | Checkout Authentication Check | Checkout | High | Security | 5 min |
| TC-CO-008 | Checkout Error Handling | Checkout | Medium | Functional | 5 min |
| TC-CO-009 | Checkout Responsive Design | Checkout | Medium | UI | 10 min |
| TC-CO-010 | Checkout Cancel/Back Navigation | Checkout | Medium | Functional | 5 min |
| **PAYMENT GATEWAY (20 Test Cases)** |
| TC-PG-001 | Create Stripe Checkout Session | Payment | Critical | Integration | 5 min |
| TC-PG-002 | Successful Payment Processing ⭐ | Payment | Critical | Integration | 7 min |
| TC-PG-003 | Declined Payment Handling | Payment | High | Integration | 7 min |
| TC-PG-004 | Insufficient Funds Handling | Payment | High | Integration | 7 min |
| TC-PG-005 | Expired Card Handling | Payment | Medium | Integration | 5 min |
| TC-PG-006 | Payment Processing Error | Payment | High | Integration | 7 min |
| TC-PG-007 | Payment Verification ⭐ | Payment | Critical | Integration | 7 min |
| TC-PG-008 | Payment Success Page | Payment | High | Functional | 5 min |
| TC-PG-009 | Payment Cancellation | Payment | Medium | Functional | 5 min |
| TC-PG-010 | Order Status Update After Payment | Payment | Critical | Integration | 7 min |
| TC-PG-011 | Multiple Payment Attempts | Payment | Medium | Functional | 10 min |
| TC-PG-012 | Payment Security - HTTPS | Payment | Critical | Security | 5 min |
| TC-PG-013 | Payment Amount Accuracy ⭐ | Payment | Critical | Functional | 7 min |
| TC-PG-014 | Payment Webhook Handling | Payment | High | Integration | 10 min |
| TC-PG-015 | Payment Session Timeout | Payment | Medium | Functional | 15 min |
| TC-PG-016 | Concurrent Payment Attempts | Payment | Low | Performance | 20 min |
| TC-PG-017 | Payment Error Recovery | Payment | Medium | Functional | 10 min |
| TC-PG-018 | Payment Receipt/Confirmation | Payment | Medium | Functional | 5 min |
| TC-PG-019 | Stripe Test Mode Verification | Payment | High | Configuration | 5 min |
| TC-PG-020 | Payment Edge Function Security ⭐ | Payment | Critical | Security | 10 min |

⭐ = Critical Test Case (Must Pass)

---

## Test Case Dependency Matrix

### Prerequisites and Dependencies

| Test Case | Depends On | Blocks |
|-----------|------------|--------|
| TC-PC-004 | TC-PC-001 | TC-PC-005 |
| TC-PC-005 | TC-PC-004 | TC-SC-001 |
| TC-SC-001 | TC-PC-005 | TC-SC-003, TC-SC-004 |
| TC-SC-003 | TC-SC-001 | TC-SC-004, TC-SC-005 |
| TC-SC-004 | TC-SC-003 | TC-SC-007 |
| TC-SC-007 | TC-SC-004 | TC-CO-003 |
| TC-CO-002 | TC-SC-003 | TC-CO-003, TC-PG-001 |
| TC-PG-001 | TC-CO-002 | TC-PG-002 |
| TC-PG-002 | TC-PG-001 | TC-PG-007, TC-PG-010 |
| TC-PG-007 | TC-PG-002 | TC-PG-008 |

---

## Test Execution Priority

### Phase 1: Critical Path (Must Pass First)
Execute in this order:

1. **TC-PC-001** - View Product Listing
2. **TC-PC-004** - View Product Details
3. **TC-PC-005** - Select Product Variant
4. **TC-SC-001** - Add to Cart
5. **TC-SC-003** - View Cart
6. **TC-SC-007** - Cart Calculations
7. **TC-CO-002** - Checkout (Logged-in)
8. **TC-PG-001** - Create Payment Session
9. **TC-PG-002** - Successful Payment
10. **TC-PG-007** - Payment Verification

**Estimated Time:** 1 hour  
**Pass Criteria:** 100% (All must pass)

---

### Phase 2: High Priority Features
Execute after Phase 1 passes:

**Product Catalog:**
- TC-PC-002, TC-PC-003, TC-PC-007, TC-PC-009

**Shopping Cart:**
- TC-SC-002, TC-SC-004, TC-SC-005, TC-SC-008, TC-SC-009

**Checkout:**
- TC-CO-001, TC-CO-003, TC-CO-006, TC-CO-007

**Payment:**
- TC-PG-003, TC-PG-004, TC-PG-006, TC-PG-008, TC-PG-010, TC-PG-012, TC-PG-013, TC-PG-014, TC-PG-019, TC-PG-020

**Estimated Time:** 4 hours  
**Pass Criteria:** ≥ 95%

---

### Phase 3: Medium Priority Features
Execute after Phase 2:

**Product Catalog:**
- TC-PC-006, TC-PC-008, TC-PC-010

**Shopping Cart:**
- TC-SC-006, TC-SC-010, TC-SC-011, TC-SC-012, TC-SC-013, TC-SC-015

**Checkout:**
- TC-CO-004, TC-CO-005, TC-CO-008, TC-CO-009, TC-CO-010

**Payment:**
- TC-PG-005, TC-PG-009, TC-PG-011, TC-PG-015, TC-PG-017, TC-PG-018

**Estimated Time:** 3 hours  
**Pass Criteria:** ≥ 90%

---

### Phase 4: Low Priority & Performance
Execute last:

- TC-SC-014 - Cart Performance
- TC-PG-016 - Concurrent Payments

**Estimated Time:** 30 minutes  
**Pass Criteria:** ≥ 80%

---

## Test Coverage by Feature

### Product Catalog Coverage

| Functionality | Test Cases | Coverage |
|---------------|------------|----------|
| Product Display | TC-PC-001, TC-PC-006 | 100% |
| Search | TC-PC-002, TC-PC-008 | 100% |
| Filtering | TC-PC-003 | 100% |
| Product Details | TC-PC-004 | 100% |
| Variant Selection | TC-PC-005 | 100% |
| Pricing | TC-PC-007 | 100% |
| Responsive Design | TC-PC-009 | 100% |
| Performance | TC-PC-010 | 100% |

**Overall Coverage:** 100%

---

### Shopping Cart Coverage

| Functionality | Test Cases | Coverage |
|---------------|------------|----------|
| Add to Cart | TC-SC-001, TC-SC-002 | 100% |
| View Cart | TC-SC-003 | 100% |
| Update Quantity | TC-SC-004, TC-SC-011 | 100% |
| Remove Items | TC-SC-005 | 100% |
| Empty Cart | TC-SC-006 | 100% |
| Calculations | TC-SC-007 | 100% |
| Persistence | TC-SC-008, TC-SC-009 | 100% |
| Multi-Variant | TC-SC-010 | 100% |
| UI/UX | TC-SC-012, TC-SC-013 | 100% |
| Error Handling | TC-SC-015 | 100% |
| Performance | TC-SC-014 | 100% |

**Overall Coverage:** 100%

---

### Checkout Coverage

| Functionality | Test Cases | Coverage |
|---------------|------------|----------|
| Guest Checkout | TC-CO-001 | 100% |
| User Checkout | TC-CO-002 | 100% |
| Order Summary | TC-CO-003 | 100% |
| Validation | TC-CO-004, TC-CO-005 | 100% |
| Flow Control | TC-CO-006, TC-CO-010 | 100% |
| Authentication | TC-CO-007 | 100% |
| Error Handling | TC-CO-008 | 100% |
| Responsive Design | TC-CO-009 | 100% |

**Overall Coverage:** 100%

---

### Payment Gateway Coverage

| Functionality | Test Cases | Coverage |
|---------------|------------|----------|
| Session Creation | TC-PG-001 | 100% |
| Payment Processing | TC-PG-002, TC-PG-003, TC-PG-004, TC-PG-005, TC-PG-006 | 100% |
| Payment Verification | TC-PG-007 | 100% |
| Success Handling | TC-PG-008, TC-PG-018 | 100% |
| Failure Handling | TC-PG-003, TC-PG-004, TC-PG-005, TC-PG-006, TC-PG-009 | 100% |
| Order Creation | TC-PG-010 | 100% |
| Multiple Attempts | TC-PG-011, TC-PG-017 | 100% |
| Security | TC-PG-012, TC-PG-020 | 100% |
| Amount Accuracy | TC-PG-013 | 100% |
| Webhooks | TC-PG-014 | 100% |
| Session Management | TC-PG-015 | 100% |
| Performance | TC-PG-016 | 100% |
| Configuration | TC-PG-019 | 100% |

**Overall Coverage:** 100%

---

## Test Data Requirements Matrix

### Products Required

| Test Case(s) | Product | Variant | Quantity |
|--------------|---------|---------|----------|
| TC-PC-001 to TC-PC-010 | All 17 products | All variants | N/A |
| TC-SC-001, TC-SC-010 | Foxtail Millet | 1kg, 2kg | 1-2 |
| TC-SC-002 | Foxtail Millet, Basmati Rice, Raw Honey | Various | 1 each |
| TC-SC-007 | Foxtail Millet, Basmati Rice | 1kg, 2kg | 2, 1 |
| TC-PG-013 | Any 3 products | Any | Various |

### User Accounts Required

| Test Case(s) | Account Type | Count | Notes |
|--------------|--------------|-------|-------|
| TC-CO-001 | Guest | N/A | No login |
| TC-CO-002, TC-SC-009 | Regular User | 1 | Registered account |
| TC-PG-002 to TC-PG-020 | Regular User | 1+ | For payment testing |
| All Tests | Admin | 1 | First registered user |

### Payment Cards Required

| Test Case | Card Number | Purpose |
|-----------|-------------|---------|
| TC-PG-002, TC-PG-007, TC-PG-008, TC-PG-010 | 4242 4242 4242 4242 | Successful payment |
| TC-PG-003 | 4000 0000 0000 0002 | Declined payment |
| TC-PG-004 | 4000 0000 0000 9995 | Insufficient funds |
| TC-PG-005 | 4000 0000 0000 0069 | Expired card |
| TC-PG-006 | 4000 0000 0000 0119 | Processing error |
| TC-PG-011, TC-PG-017 | Multiple cards | Payment retry scenarios |

---

## Browser/Device Testing Matrix

### Desktop Browser Coverage

| Test Case Category | Chrome | Firefox | Safari | Edge |
|--------------------|--------|---------|--------|------|
| Product Catalog | ✓ | ✓ | ✓ | ✓ |
| Shopping Cart | ✓ | ✓ | ✓ | ✓ |
| Checkout | ✓ | ✓ | ✓ | ✓ |
| Payment Gateway | ✓ | ✓ | ✓ | ✓ |

**Total Tests per Browser:** 55  
**Total Browser Tests:** 220

---

### Mobile Device Coverage

| Test Case Category | iOS Safari | Chrome Mobile |
|--------------------|------------|---------------|
| Product Catalog | ✓ | ✓ |
| Shopping Cart | ✓ | ✓ |
| Checkout | ✓ | ✓ |
| Payment Gateway | ✓ | ✓ |

**Total Tests per Platform:** 55  
**Total Mobile Tests:** 110

---

### Responsive Design Test Points

| Screen Size | Device Type | Test Cases |
|-------------|-------------|------------|
| 1920x1080 | Desktop | TC-PC-009, TC-SC-012, TC-CO-009 |
| 1366x768 | Laptop | TC-PC-009, TC-SC-012, TC-CO-009 |
| 768x1024 | Tablet | TC-PC-009, TC-SC-012, TC-CO-009 |
| 375x667 | Mobile | TC-PC-009, TC-SC-012, TC-CO-009 |
| 414x896 | Mobile | TC-PC-009, TC-SC-012, TC-CO-009 |

---

## Risk-Based Testing Priority

### Critical Risk Areas (Test First)

| Risk Area | Test Cases | Impact | Likelihood |
|-----------|------------|--------|------------|
| Payment Processing | TC-PG-002, TC-PG-007, TC-PG-013 | Critical | Medium |
| Cart Calculations | TC-SC-007 | High | Medium |
| Payment Security | TC-PG-012, TC-PG-020 | Critical | Low |
| Order Creation | TC-PG-010 | Critical | Medium |
| Authentication | TC-CO-007 | High | Low |

**Total Critical Tests:** 8  
**Must Pass:** 100%

---

### High Risk Areas (Test Second)

| Risk Area | Test Cases | Impact | Likelihood |
|-----------|------------|--------|------------|
| Payment Failures | TC-PG-003, TC-PG-004, TC-PG-006 | High | High |
| Cart Operations | TC-SC-001, TC-SC-004, TC-SC-005 | High | Medium |
| Checkout Flow | TC-CO-002, TC-CO-006 | High | Medium |
| Product Display | TC-PC-001, TC-PC-004 | Medium | Low |

**Total High Risk Tests:** 10  
**Target Pass Rate:** ≥ 95%

---

### Medium Risk Areas (Test Third)

| Risk Area | Test Cases | Impact | Likelihood |
|-----------|------------|--------|------------|
| Search/Filter | TC-PC-002, TC-PC-003 | Medium | Medium |
| Cart Persistence | TC-SC-008, TC-SC-009 | Medium | Medium |
| UI Responsiveness | TC-PC-009, TC-SC-012, TC-CO-009 | Medium | High |
| Error Handling | TC-SC-015, TC-CO-008 | Medium | Medium |

**Total Medium Risk Tests:** 9  
**Target Pass Rate:** ≥ 90%

---

## Test Execution Time Estimates

### By Feature

| Feature | Test Cases | Total Time | Avg per Test |
|---------|------------|------------|--------------|
| Product Catalog | 10 | 58 minutes | 5.8 min |
| Shopping Cart | 15 | 89 minutes | 5.9 min |
| Checkout | 10 | 53 minutes | 5.3 min |
| Payment Gateway | 20 | 144 minutes | 7.2 min |
| **Total** | **55** | **344 minutes** | **6.3 min** |

**Total Execution Time:** ~5.7 hours (single pass)

---

### By Priority

| Priority | Test Cases | Total Time |
|----------|------------|------------|
| Critical | 5 | 43 minutes |
| High | 27 | 171 minutes |
| Medium | 21 | 120 minutes |
| Low | 2 | 30 minutes |
| **Total** | **55** | **364 minutes** |

---

### By Test Type

| Test Type | Test Cases | Total Time |
|-----------|------------|------------|
| Functional | 45 | 270 minutes |
| Integration | 15 | 115 minutes |
| UI | 10 | 68 minutes |
| Security | 8 | 50 minutes |
| Performance | 5 | 65 minutes |

*Note: Some tests cover multiple types*

---

## Defect Prediction Matrix

### Expected Defects by Feature

| Feature | Expected Defects | Severity Distribution |
|---------|------------------|----------------------|
| Product Catalog | 2-3 | Low-Medium |
| Shopping Cart | 3-5 | Medium-High |
| Checkout | 2-4 | Medium-High |
| Payment Gateway | 4-6 | High-Critical |
| **Total Expected** | **11-18** | **Mixed** |

### Common Defect Types

| Defect Type | Likelihood | Impact | Test Cases |
|-------------|------------|--------|------------|
| Calculation Errors | Medium | High | TC-SC-007, TC-PG-013 |
| UI Issues | High | Low-Medium | TC-PC-009, TC-SC-012, TC-CO-009 |
| Payment Failures | Medium | Critical | TC-PG-002 to TC-PG-006 |
| Data Persistence | Low | High | TC-SC-008, TC-SC-009 |
| Security Issues | Low | Critical | TC-PG-012, TC-PG-020 |

---

## Test Automation Candidates

### High Priority for Automation (Future)

| Test Case | Reason | ROI |
|-----------|--------|-----|
| TC-SC-007 | Calculation verification | High |
| TC-PG-002 | Critical path, frequent execution | High |
| TC-PG-013 | Amount accuracy, repetitive | High |
| TC-PC-001 | Smoke test, frequent execution | Medium |
| TC-SC-001 | Critical path, frequent execution | Medium |

### Medium Priority for Automation

| Test Case | Reason | ROI |
|-----------|--------|-----|
| TC-PC-002 | Search functionality, repetitive | Medium |
| TC-SC-004 | Cart operations, frequent | Medium |
| TC-CO-002 | Checkout flow, critical | Medium |

**Automation Coverage Target:** 30-40% of test cases

---

## Test Metrics Dashboard

### Key Performance Indicators

| Metric | Target | Measurement |
|--------|--------|-------------|
| Test Execution Rate | 100% | Tests executed / Total tests |
| Pass Rate | ≥ 95% | Tests passed / Tests executed |
| Critical Pass Rate | 100% | Critical tests passed / Critical tests |
| Defect Detection Rate | N/A | Defects found / Tests executed |
| Test Efficiency | ≥ 80% | Valid defects / Total defects |
| Retest Pass Rate | ≥ 90% | Retests passed / Retests executed |

### Quality Gates

| Gate | Criteria | Action if Failed |
|------|----------|------------------|
| Gate 1 | Critical tests 100% pass | Stop and fix |
| Gate 2 | High priority ≥ 95% pass | Review and decide |
| Gate 3 | Overall ≥ 95% pass | Review and decide |
| Gate 4 | No critical defects open | Stop release |
| Gate 5 | No high defects open | Review and decide |

---

## Quick Reference: Test Status Codes

| Code | Status | Meaning |
|------|--------|---------|
| ✅ | Pass | Test passed successfully |
| ❌ | Fail | Test failed, defect found |
| ⏸️ | Blocked | Cannot execute, dependency failed |
| ⏭️ | Skipped | Intentionally not executed |
| 🔄 | Retest | Needs retesting after fix |
| ⚠️ | Warning | Passed with minor issues |
| 📝 | Not Run | Not yet executed |

---

## Test Case Traceability

### Requirements to Test Cases Mapping

| Requirement | Test Cases | Coverage |
|-------------|------------|----------|
| REQ-001: Browse Products | TC-PC-001, TC-PC-002, TC-PC-003 | 100% |
| REQ-002: View Product Details | TC-PC-004, TC-PC-005, TC-PC-006, TC-PC-007 | 100% |
| REQ-003: Add to Cart | TC-SC-001, TC-SC-002 | 100% |
| REQ-004: Manage Cart | TC-SC-003, TC-SC-004, TC-SC-005, TC-SC-006 | 100% |
| REQ-005: Cart Calculations | TC-SC-007 | 100% |
| REQ-006: Cart Persistence | TC-SC-008, TC-SC-009 | 100% |
| REQ-007: Checkout Process | TC-CO-001 to TC-CO-010 | 100% |
| REQ-008: Payment Processing | TC-PG-001 to TC-PG-020 | 100% |
| REQ-009: Responsive Design | TC-PC-009, TC-SC-012, TC-CO-009 | 100% |
| REQ-010: Security | TC-CO-007, TC-PG-012, TC-PG-020 | 100% |

**Overall Requirements Coverage:** 100%

---

## Summary Statistics

### Test Suite Composition

- **Total Test Cases:** 55
- **Critical:** 5 (9%)
- **High:** 27 (49%)
- **Medium:** 21 (38%)
- **Low:** 2 (4%)

### Estimated Effort

- **Single Pass:** 5.7 hours
- **With Retests (20%):** 6.8 hours
- **Full Cycle (3 passes):** 17.1 hours
- **Cross-browser (4 browsers):** 22.8 hours
- **Mobile (2 platforms):** 11.4 hours
- **Total Estimated Effort:** 52 hours

### Expected Outcomes

- **Pass Rate:** 90-95%
- **Defects Found:** 11-18
- **Critical Defects:** 1-2
- **High Defects:** 3-5
- **Medium Defects:** 5-8
- **Low Defects:** 2-3

---

**Last Updated:** 2025-11-29  
**Version:** 1.0  
**Related Documents:** ECOMMERCE_TEST_PLAN.md, TEST_EXECUTION_CHECKLIST.md
