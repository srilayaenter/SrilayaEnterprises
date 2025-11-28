# User Management - Quick Test Checklist

## ✅ Pre-Testing Setup

- [ ] Admin account is ready
- [ ] Browser is open
- [ ] Developer tools are open (F12)
- [ ] Test email addresses are prepared

## 🚀 Quick Smoke Test (5 minutes)

### 1. Access & Load
- [ ] Login as admin
- [ ] Navigate to Admin Dashboard
- [ ] Click "Users" tab
- [ ] Page loads without errors
- [ ] Users table is visible

### 2. Create User
- [ ] Click "Add New User"
- [ ] Fill in:
  - Email: `test1@example.com`
  - Password: `Test123!`
  - Full Name: `Test User`
  - Role: User
- [ ] Click "Create User"
- [ ] Success message appears
- [ ] User appears in table

### 3. Search
- [ ] Type "test1" in search box
- [ ] User is filtered correctly
- [ ] Clear search
- [ ] All users appear again

### 4. Filter
- [ ] Select "User" from role filter
- [ ] Only users with "User" role shown
- [ ] Select "All"
- [ ] All users shown again

### 5. Change Role
- [ ] Find test user
- [ ] Change role to "Admin"
- [ ] Success message appears
- [ ] Badge changes to "Admin"

## 🔍 Detailed Test (15 minutes)

### Validation Tests
- [ ] Try creating user without email → Error
- [ ] Try creating user without password → Error
- [ ] Try password with 5 characters → Error
- [ ] Try invalid email format → Error
- [ ] Try duplicate email → Error

### Role Management
- [ ] Create admin user
- [ ] Admin badge is blue with shield icon
- [ ] Change admin to user
- [ ] User badge is gray with user icon
- [ ] Summary cards update correctly

### Search Tests
- [ ] Search by email (partial match)
- [ ] Search by full name
- [ ] Search by phone number
- [ ] Search with no results
- [ ] Clear search

### Filter Tests
- [ ] Filter by Admin
- [ ] Filter by User
- [ ] Filter by All
- [ ] Combine search + filter

### UI Tests
- [ ] Responsive on desktop (1920px)
- [ ] Responsive on tablet (768px)
- [ ] Responsive on mobile (375px)
- [ ] Toast notifications appear
- [ ] Loading states work

## 🐛 Bug Check

### Common Issues
- [ ] No JavaScript errors in console
- [ ] No network errors
- [ ] All buttons work
- [ ] All dropdowns work
- [ ] All forms submit correctly
- [ ] Data persists after refresh
- [ ] No duplicate users created
- [ ] Role changes save correctly

## 📊 Test Results

**Total Tests:** 40+

**Passed:** _____

**Failed:** _____

**Pass Rate:** _____%

**Critical Issues:** _____

**Status:** [ ] PASS [ ] FAIL

## 🎯 Quick Verification Commands

### Check User Count
```sql
SELECT COUNT(*) FROM profiles;
```

### Check Admin Count
```sql
SELECT COUNT(*) FROM profiles WHERE role = 'admin';
```

### Check Recent Users
```sql
SELECT email, full_name, role, created_at 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;
```

### Find Test Users
```sql
SELECT * FROM profiles WHERE email LIKE '%test%';
```

## 🧹 Cleanup After Testing

- [ ] Delete test users:
  - test1@example.com
  - testadmin1@example.com
  - minimal@example.com
  - duplicate@example.com
  - special@example.com
  - (any other test users)

- [ ] Reset modified roles
- [ ] Verify production data is intact
- [ ] Clear browser cache if needed

## ✍️ Sign-Off

**Tester:** _______________________

**Date:** _______________________

**Time Spent:** _______ minutes

**Overall Status:** [ ] ✅ APPROVED [ ] ⚠️ APPROVED WITH ISSUES [ ] ❌ REJECTED

**Notes:**
_______________________________________
_______________________________________
_______________________________________

---

## 📋 Test Scenarios by Priority

### P0 - Critical (Must Pass)
1. ✅ Admin can access user management
2. ✅ Can create new user
3. ✅ Email validation works
4. ✅ Password validation works
5. ✅ Can change user role
6. ✅ Users appear in table
7. ✅ Data persists after refresh

### P1 - High (Should Pass)
1. ✅ Search works correctly
2. ✅ Filter works correctly
3. ✅ Duplicate email prevention
4. ✅ Role badges display correctly
5. ✅ Toast notifications appear
6. ✅ Summary cards accurate

### P2 - Medium (Nice to Have)
1. ✅ Responsive design works
2. ✅ Loading states appear
3. ✅ Special characters handled
4. ✅ Long emails handled
5. ✅ International phone formats

### P3 - Low (Optional)
1. ✅ Performance with many users
2. ✅ Rapid actions handled
3. ✅ Edge cases covered

## 🎓 Testing Tips

### For Manual Testers
1. **Be Thorough** - Don't skip steps
2. **Document Everything** - Write down what you see
3. **Try to Break It** - Test edge cases
4. **Check Console** - Look for errors
5. **Test Different Browsers** - Chrome, Firefox, Safari

### For Automated Testing
1. Use Playwright or Cypress for E2E tests
2. Test API endpoints directly
3. Mock Supabase responses
4. Test error scenarios
5. Verify database state

### Red Flags to Watch For
- ⚠️ Console errors
- ⚠️ Network failures
- ⚠️ Slow loading (>3 seconds)
- ⚠️ UI breaking on resize
- ⚠️ Data not saving
- ⚠️ Duplicate entries
- ⚠️ Security vulnerabilities
- ⚠️ Validation bypassed

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify admin permissions
3. Check network connectivity
4. Clear browser cache
5. Try different browser
6. Contact system administrator

---

**Document Version:** 1.0
**Last Updated:** 2025-11-26
