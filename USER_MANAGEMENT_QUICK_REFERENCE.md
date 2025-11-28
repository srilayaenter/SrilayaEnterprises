# User Management - Quick Reference Card

## 🚀 Quick Start

**Access:** Login as Admin → Admin Dashboard → Users Tab

**URL:** `/admin/users`

## 📋 Common Tasks

### Create New User
1. Click "Add New User"
2. Fill: Email*, Password*, Full Name, Phone, Role
3. Click "Create User"
4. ✅ Success toast appears

### Change User Role
1. Find user in table
2. Click role dropdown in Actions column
3. Select new role (User or Admin)
4. ✅ Badge updates, toast appears

### Search for User
1. Type in search box
2. Search by: Email, Name, or Phone
3. Table filters in real-time

### Filter by Role
1. Click filter dropdown
2. Select: All, Admin, or User
3. Table shows filtered results

## ✅ Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Email | Required | "Email and password are required" |
| Email | Valid format | Browser validation |
| Email | Unique | "Email already exists" |
| Password | Required | "Email and password are required" |
| Password | Min 6 chars | "Password must be at least 6 characters" |
| Full Name | Optional | - |
| Phone | Optional | - |

## 🎨 Visual Reference

### Role Badges
- **Admin:** 🛡️ Blue badge with shield icon
- **User:** 👤 Gray badge with user icon

### Toast Notifications
- **Success:** ✅ Green background
- **Error:** ❌ Red background

### Summary Cards
- **Total Users:** All users count
- **Admin Users:** Admin role count
- **Regular Users:** User role count

## 🧪 Test Data

### Valid Test Users
```
Email: test1@example.com
Password: Test123!
Full Name: Test User One
Role: User

Email: admin1@example.com
Password: Admin123!
Full Name: Test Admin One
Role: Admin
```

### Invalid Test Data
```
Email: (empty) → Error
Password: 12345 → Error (too short)
Email: notanemail → Error (invalid format)
Email: existing@example.com → Error (duplicate)
```

## 🔍 Troubleshooting

| Problem | Solution |
|---------|----------|
| Cannot access page | Verify admin role |
| Cannot create user | Check email format & password length |
| Search not working | Clear search box, refresh page |
| Role not changing | Check console, verify permissions |
| Page not loading | Check network, clear cache |

## 📊 Test Checklist

**Quick Test (5 min):**
- [ ] Page loads
- [ ] Create user
- [ ] Search works
- [ ] Filter works
- [ ] Change role

**Full Test (15 min):**
- [ ] All validation tests
- [ ] Role management
- [ ] Search & filter
- [ ] UI responsiveness
- [ ] Error handling

## 🎯 Success Criteria

**Must Work:**
- ✅ Create user
- ✅ Email validation
- ✅ Password validation
- ✅ Change role
- ✅ Search
- ✅ Filter

**Should Work:**
- ✅ Duplicate prevention
- ✅ Toast notifications
- ✅ Summary cards
- ✅ Responsive design

## 📞 Quick Commands

### Check User Count
```sql
SELECT COUNT(*) FROM profiles;
```

### Find Test Users
```sql
SELECT * FROM profiles WHERE email LIKE '%test%';
```

### Delete Test User
```sql
DELETE FROM profiles WHERE email = 'test1@example.com';
```

## 🔐 Security Notes

- ✅ Admin-only access
- ✅ Passwords encrypted
- ✅ Cannot view passwords
- ✅ Row-level security
- ✅ Session management

## 📱 Responsive Breakpoints

- **Desktop:** 1920px - Full layout
- **Tablet:** 768px - Adapted layout
- **Mobile:** 375px - Stacked layout

## 🎨 Color Codes

- **Primary:** #4CAF50 (Green) or #8D6E63 (Brown)
- **Admin Badge:** #3B82F6 (Blue)
- **User Badge:** #6B7280 (Gray)
- **Success:** #10B981 (Green)
- **Error:** #EF4444 (Red)

## ⚡ Keyboard Shortcuts

- **Tab:** Navigate fields
- **Enter:** Submit form
- **Esc:** Close dialog

## 📈 Performance Targets

- **Page Load:** < 2 seconds
- **Search Response:** < 100ms
- **Filter Response:** < 100ms
- **Create User:** < 1 second

## 🐛 Common Bugs to Watch

- ⚠️ Console errors
- ⚠️ Network failures
- ⚠️ Validation bypassed
- ⚠️ Duplicate users
- ⚠️ Role not saving
- ⚠️ UI breaking on mobile

## ✍️ Quick Sign-Off

**Tester:** _______________

**Date:** _______________

**Status:** [ ] ✅ PASS [ ] ❌ FAIL

**Notes:** _______________

---

## 📚 Full Documentation

- **Comprehensive Testing:** USER_MANAGEMENT_TESTING.md
- **Test Checklist:** USER_MANAGEMENT_TEST_CHECKLIST.md
- **Visual Guide:** USER_MANAGEMENT_VISUAL_GUIDE.md
- **Summary:** USER_MANAGEMENT_SUMMARY.md

---

**Version:** 1.0 | **Updated:** 2025-11-26
