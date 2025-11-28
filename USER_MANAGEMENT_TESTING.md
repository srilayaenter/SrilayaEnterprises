# User Management System - Testing Guide

## 📋 Overview

This document provides comprehensive testing procedures for the User Management system in Srilaya Enterprises Organic Store.

## 🎯 Testing Objectives

- Verify user creation functionality
- Test role assignment (user vs admin)
- Validate search and filter capabilities
- Ensure data validation works correctly
- Test security and permissions
- Verify UI responsiveness and usability

## 🔐 Prerequisites

Before testing, ensure you have:
- ✅ Admin account credentials
- ✅ Access to Admin Dashboard
- ✅ Test email addresses (for creating test users)
- ✅ Browser with developer tools (for debugging)

## 📍 Access User Management

1. **Login as Admin**
   - Navigate to `/login`
   - Enter admin credentials
   - Click "Login"

2. **Navigate to Admin Dashboard**
   - Click "Admin Dashboard" in navigation
   - Or go directly to `/admin`

3. **Open Users Tab**
   - Click on "Users" tab (Shield icon)
   - Or go directly to `/admin/users`

## 🧪 Test Cases

### Test Suite 1: User Interface & Layout

#### TC1.1: Page Load
**Objective:** Verify page loads correctly

**Steps:**
1. Navigate to Users Management page
2. Observe page loading

**Expected Results:**
- ✅ Page loads without errors
- ✅ "User Management" title is visible
- ✅ Description text is displayed
- ✅ "Add New User" button is visible
- ✅ Search bar is present
- ✅ Role filter dropdown is present
- ✅ Users table is displayed
- ✅ Summary cards show statistics

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

#### TC1.2: Summary Cards
**Objective:** Verify summary statistics display correctly

**Steps:**
1. View the summary cards at the top
2. Check the numbers displayed

**Expected Results:**
- ✅ "Total Users" card shows correct count
- ✅ "Admin Users" card shows correct count
- ✅ "Regular Users" card shows correct count
- ✅ Icons are displayed correctly
- ✅ Numbers update when users are added/removed

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

#### TC1.3: Users Table
**Objective:** Verify users table displays correctly

**Steps:**
1. View the users table
2. Check table structure and data

**Expected Results:**
- ✅ Table headers: Email, Full Name, Phone, Role, Created At, Actions
- ✅ User data is displayed in rows
- ✅ Role badges are color-coded (Admin = blue, User = gray)
- ✅ Dates are formatted correctly
- ✅ Role dropdown is present in Actions column
- ✅ Table is scrollable if many users

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

### Test Suite 2: Create New User

#### TC2.1: Open Add User Dialog
**Objective:** Verify dialog opens correctly

**Steps:**
1. Click "Add New User" button
2. Observe dialog

**Expected Results:**
- ✅ Dialog opens smoothly
- ✅ Dialog title: "Add New User"
- ✅ Description text is visible
- ✅ Form fields are displayed:
  - Email (required)
  - Password (required)
  - Full Name (optional)
  - Phone (optional)
  - Role (dropdown)
- ✅ "Create User" button is visible
- ✅ Close button (X) is visible

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

#### TC2.2: Create User - Valid Data
**Objective:** Successfully create a new user

**Test Data:**
- Email: `testuser1@example.com`
- Password: `Test123!`
- Full Name: `Test User One`
- Phone: `1234567890`
- Role: `User`

**Steps:**
1. Click "Add New User"
2. Fill in all fields with test data
3. Click "Create User"

**Expected Results:**
- ✅ Success toast notification appears
- ✅ Message: "User created successfully"
- ✅ Dialog closes automatically
- ✅ New user appears in the table
- ✅ User data is correct
- ✅ Role badge shows "User"
- ✅ Summary cards update (+1 to Total Users, +1 to Regular Users)

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

#### TC2.3: Create Admin User
**Objective:** Successfully create an admin user

**Test Data:**
- Email: `testadmin1@example.com`
- Password: `Admin123!`
- Full Name: `Test Admin One`
- Phone: `9876543210`
- Role: `Admin`

**Steps:**
1. Click "Add New User"
2. Fill in all fields
3. Select "Admin" from Role dropdown
4. Click "Create User"

**Expected Results:**
- ✅ Success toast notification appears
- ✅ New admin user appears in table
- ✅ Role badge shows "Admin" with shield icon
- ✅ Badge color is blue
- ✅ Summary cards update (+1 to Total Users, +1 to Admin Users)

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

#### TC2.4: Create User - Minimal Data
**Objective:** Create user with only required fields

**Test Data:**
- Email: `minimal@example.com`
- Password: `Pass123!`
- Full Name: (empty)
- Phone: (empty)
- Role: `User`

**Steps:**
1. Click "Add New User"
2. Fill only Email and Password
3. Click "Create User"

**Expected Results:**
- ✅ User is created successfully
- ✅ Full Name shows as empty or "N/A"
- ✅ Phone shows as empty or "N/A"
- ✅ No validation errors

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

### Test Suite 3: Validation Testing

#### TC3.1: Empty Email
**Objective:** Verify email is required

**Steps:**
1. Click "Add New User"
2. Leave Email empty
3. Fill Password: `Test123!`
4. Click "Create User"

**Expected Results:**
- ✅ Error toast appears
- ✅ Message: "Email and password are required"
- ✅ Dialog remains open
- ✅ User is NOT created

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

#### TC3.2: Empty Password
**Objective:** Verify password is required

**Steps:**
1. Click "Add New User"
2. Fill Email: `test@example.com`
3. Leave Password empty
4. Click "Create User"

**Expected Results:**
- ✅ Error toast appears
- ✅ Message: "Email and password are required"
- ✅ Dialog remains open
- ✅ User is NOT created

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

#### TC3.3: Short Password
**Objective:** Verify password length validation

**Steps:**
1. Click "Add New User"
2. Fill Email: `test@example.com`
3. Fill Password: `12345` (5 characters)
4. Click "Create User"

**Expected Results:**
- ✅ Error toast appears
- ✅ Message: "Password must be at least 6 characters"
- ✅ Dialog remains open
- ✅ User is NOT created

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

#### TC3.4: Invalid Email Format
**Objective:** Verify email format validation

**Steps:**
1. Click "Add New User"
2. Fill Email: `notanemail` (invalid format)
3. Fill Password: `Test123!`
4. Click "Create User"

**Expected Results:**
- ✅ Browser validation error appears
- ✅ Or error toast with message about invalid email
- ✅ User is NOT created

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

#### TC3.5: Duplicate Email
**Objective:** Verify duplicate email prevention

**Steps:**
1. Create a user with email: `duplicate@example.com`
2. Try to create another user with same email
3. Click "Create User"

**Expected Results:**
- ✅ Error toast appears
- ✅ Message indicates email already exists
- ✅ Second user is NOT created
- ✅ Only one user with that email exists

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

### Test Suite 4: Role Management

#### TC4.1: Change User to Admin
**Objective:** Verify role can be changed from User to Admin

**Steps:**
1. Find a user with "User" role
2. Click the role dropdown in Actions column
3. Select "Admin"

**Expected Results:**
- ✅ Success toast appears
- ✅ Message: "User role updated successfully"
- ✅ Role badge changes to "Admin" (blue with shield)
- ✅ Summary cards update (-1 Regular Users, +1 Admin Users)
- ✅ User can now access admin features

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

#### TC4.2: Change Admin to User
**Objective:** Verify role can be changed from Admin to User

**Steps:**
1. Find a user with "Admin" role (not your own account!)
2. Click the role dropdown
3. Select "User"

**Expected Results:**
- ✅ Success toast appears
- ✅ Message: "User role updated successfully"
- ✅ Role badge changes to "User" (gray with user icon)
- ✅ Summary cards update (+1 Regular Users, -1 Admin Users)
- ✅ User loses admin access

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

#### TC4.3: Cannot Demote Self
**Objective:** Verify admin cannot demote their own account

**Steps:**
1. Find your own admin account in the list
2. Try to change role to "User"

**Expected Results:**
- ✅ Either dropdown is disabled for own account
- ✅ Or error message appears preventing self-demotion
- ✅ Role remains "Admin"

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

### Test Suite 5: Search Functionality

#### TC5.1: Search by Email
**Objective:** Verify search works with email

**Steps:**
1. Enter a user's email in search box
2. Observe filtered results

**Expected Results:**
- ✅ Table updates in real-time
- ✅ Only users matching email are shown
- ✅ Partial matches work (e.g., "test" finds "testuser@example.com")
- ✅ Search is case-insensitive
- ✅ Summary cards show filtered counts

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

#### TC5.2: Search by Full Name
**Objective:** Verify search works with full name

**Steps:**
1. Enter a user's full name in search box
2. Observe filtered results

**Expected Results:**
- ✅ Table updates in real-time
- ✅ Only users matching name are shown
- ✅ Partial matches work
- ✅ Search is case-insensitive

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

#### TC5.3: Search by Phone
**Objective:** Verify search works with phone number

**Steps:**
1. Enter a user's phone number in search box
2. Observe filtered results

**Expected Results:**
- ✅ Table updates in real-time
- ✅ Only users matching phone are shown
- ✅ Partial matches work

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

#### TC5.4: Search No Results
**Objective:** Verify behavior when no matches found

**Steps:**
1. Enter search term that doesn't match any user
2. Observe results

**Expected Results:**
- ✅ Table shows "No users found" message
- ✅ No error occurs
- ✅ Summary cards show 0

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

#### TC5.5: Clear Search
**Objective:** Verify clearing search restores all users

**Steps:**
1. Enter search term
2. Clear the search box
3. Observe results

**Expected Results:**
- ✅ All users are displayed again
- ✅ Summary cards show full counts
- ✅ Table updates smoothly

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

### Test Suite 6: Filter Functionality

#### TC6.1: Filter by Admin Role
**Objective:** Verify filtering by admin role

**Steps:**
1. Select "Admin" from role filter dropdown
2. Observe filtered results

**Expected Results:**
- ✅ Only admin users are shown
- ✅ All displayed users have "Admin" badge
- ✅ Summary cards update to show filtered counts
- ✅ Search still works with filter active

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

#### TC6.2: Filter by User Role
**Objective:** Verify filtering by user role

**Steps:**
1. Select "User" from role filter dropdown
2. Observe filtered results

**Expected Results:**
- ✅ Only regular users are shown
- ✅ All displayed users have "User" badge
- ✅ Summary cards update to show filtered counts
- ✅ Search still works with filter active

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

#### TC6.3: Filter All Roles
**Objective:** Verify "All" filter shows all users

**Steps:**
1. Select "All" from role filter dropdown
2. Observe results

**Expected Results:**
- ✅ All users are displayed
- ✅ Both admin and regular users are shown
- ✅ Summary cards show full counts

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

#### TC6.4: Combined Search and Filter
**Objective:** Verify search and filter work together

**Steps:**
1. Select "Admin" from role filter
2. Enter search term in search box
3. Observe results

**Expected Results:**
- ✅ Only admin users matching search are shown
- ✅ Both filters apply simultaneously
- ✅ Results are accurate

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

### Test Suite 7: Security & Permissions

#### TC7.1: Admin Access Only
**Objective:** Verify only admins can access user management

**Steps:**
1. Logout from admin account
2. Login as regular user
3. Try to access `/admin/users`

**Expected Results:**
- ✅ Access is denied
- ✅ User is redirected (to home or login)
- ✅ Or error message appears
- ✅ User management page is not accessible

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

#### TC7.2: Unauthenticated Access
**Objective:** Verify unauthenticated users cannot access

**Steps:**
1. Logout completely
2. Try to access `/admin/users` directly

**Expected Results:**
- ✅ Access is denied
- ✅ Redirected to login page
- ✅ After login, may redirect to user management

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

#### TC7.3: Password Security
**Objective:** Verify passwords are not visible

**Steps:**
1. Create a user
2. Check if password is visible anywhere
3. Check browser network tab

**Expected Results:**
- ✅ Password is not displayed in UI
- ✅ Password is not stored in plain text
- ✅ Password field shows dots/asterisks
- ✅ Password is transmitted securely (HTTPS)

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

### Test Suite 8: Data Integrity

#### TC8.1: User Data Persistence
**Objective:** Verify user data persists after page reload

**Steps:**
1. Create a new user
2. Refresh the page
3. Check if user still exists

**Expected Results:**
- ✅ User is still in the list
- ✅ All user data is intact
- ✅ Role is preserved
- ✅ Summary cards are accurate

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

#### TC8.2: Role Change Persistence
**Objective:** Verify role changes persist

**Steps:**
1. Change a user's role
2. Refresh the page
3. Check user's role

**Expected Results:**
- ✅ Role change is saved
- ✅ New role is displayed correctly
- ✅ User has appropriate permissions

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

#### TC8.3: Created Date Accuracy
**Objective:** Verify created date is accurate

**Steps:**
1. Create a new user
2. Check the "Created At" column
3. Verify the date/time

**Expected Results:**
- ✅ Date is current date
- ✅ Time is approximately current time
- ✅ Format is readable (e.g., "Nov 26, 2025")
- ✅ Timezone is correct

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

### Test Suite 9: UI/UX Testing

#### TC9.1: Responsive Design - Desktop
**Objective:** Verify layout works on desktop

**Steps:**
1. View page on desktop (1920x1080)
2. Check layout and spacing

**Expected Results:**
- ✅ All elements are visible
- ✅ Table is not cramped
- ✅ Buttons are accessible
- ✅ No horizontal scrolling needed
- ✅ Text is readable

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

#### TC9.2: Responsive Design - Tablet
**Objective:** Verify layout works on tablet

**Steps:**
1. Resize browser to tablet size (768px)
2. Check layout adaptation

**Expected Results:**
- ✅ Layout adjusts appropriately
- ✅ Table may scroll horizontally
- ✅ Buttons remain accessible
- ✅ Dialog is properly sized
- ✅ Text remains readable

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

#### TC9.3: Responsive Design - Mobile
**Objective:** Verify layout works on mobile

**Steps:**
1. Resize browser to mobile size (375px)
2. Check layout adaptation

**Expected Results:**
- ✅ Layout stacks vertically
- ✅ Table scrolls horizontally
- ✅ Buttons are touch-friendly
- ✅ Dialog fits screen
- ✅ Text is readable

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

#### TC9.4: Loading States
**Objective:** Verify loading indicators work

**Steps:**
1. Refresh page and observe loading
2. Create user and observe loading
3. Update role and observe loading

**Expected Results:**
- ✅ Loading indicator appears during data fetch
- ✅ "Loading users..." message is shown
- ✅ UI is disabled during operations
- ✅ Loading states are smooth

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

#### TC9.5: Toast Notifications
**Objective:** Verify all toast notifications work

**Steps:**
1. Perform various actions
2. Observe toast notifications

**Expected Results:**
- ✅ Success toasts are green/positive
- ✅ Error toasts are red/negative
- ✅ Messages are clear and helpful
- ✅ Toasts auto-dismiss after few seconds
- ✅ Toasts don't block UI

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

### Test Suite 10: Edge Cases

#### TC10.1: Many Users
**Objective:** Verify performance with many users

**Steps:**
1. Create 50+ users (or use existing data)
2. Test search, filter, and scrolling

**Expected Results:**
- ✅ Page loads without lag
- ✅ Search is responsive
- ✅ Filter works quickly
- ✅ Scrolling is smooth
- ✅ No performance issues

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

#### TC10.2: Special Characters in Name
**Objective:** Verify special characters are handled

**Test Data:**
- Full Name: `O'Brien-Smith (Test)`
- Email: `special@example.com`

**Steps:**
1. Create user with special characters in name
2. Search for the user
3. View in table

**Expected Results:**
- ✅ User is created successfully
- ✅ Special characters display correctly
- ✅ Search works with special characters
- ✅ No encoding issues

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

#### TC10.3: Long Email Address
**Objective:** Verify long emails are handled

**Test Data:**
- Email: `verylongemailaddress123456789@example.com`

**Steps:**
1. Create user with long email
2. View in table

**Expected Results:**
- ✅ User is created successfully
- ✅ Email is displayed (may truncate with ellipsis)
- ✅ Full email visible on hover or in details
- ✅ Table layout not broken

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

#### TC10.4: International Phone Numbers
**Objective:** Verify international phone formats work

**Test Data:**
- Phone: `+91 98765 43210`
- Phone: `+1-555-123-4567`

**Steps:**
1. Create users with different phone formats
2. Search by phone

**Expected Results:**
- ✅ All formats are accepted
- ✅ Phone numbers display correctly
- ✅ Search works with various formats

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

#### TC10.5: Rapid Actions
**Objective:** Verify system handles rapid actions

**Steps:**
1. Quickly create multiple users
2. Rapidly change roles
3. Quickly search and filter

**Expected Results:**
- ✅ All actions complete successfully
- ✅ No race conditions
- ✅ Data remains consistent
- ✅ No duplicate entries
- ✅ UI remains responsive

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________

## 📊 Test Summary

### Test Execution Summary

| Test Suite | Total Tests | Passed | Failed | Skipped |
|------------|-------------|--------|--------|---------|
| UI & Layout | 3 | | | |
| Create User | 4 | | | |
| Validation | 5 | | | |
| Role Management | 3 | | | |
| Search | 5 | | | |
| Filter | 4 | | | |
| Security | 3 | | | |
| Data Integrity | 3 | | | |
| UI/UX | 5 | | | |
| Edge Cases | 5 | | | |
| **TOTAL** | **40** | | | |

### Pass Rate: ____%

## 🐛 Bugs Found

| Bug ID | Severity | Description | Steps to Reproduce | Status |
|--------|----------|-------------|-------------------|--------|
| | | | | |
| | | | | |
| | | | | |

## 💡 Recommendations

### High Priority
- [ ] 

### Medium Priority
- [ ] 

### Low Priority
- [ ] 

## ✅ Sign-Off

**Tested By:** _______________________

**Date:** _______________________

**Environment:** _______________________

**Browser:** _______________________

**Overall Status:** [ ] Approved [ ] Approved with Issues [ ] Rejected

**Comments:**
_______________________________________
_______________________________________
_______________________________________

---

## 📝 Notes for Testers

### Tips for Effective Testing

1. **Test Systematically**
   - Follow test cases in order
   - Don't skip steps
   - Document everything

2. **Use Different Data**
   - Don't use same test data repeatedly
   - Try various combinations
   - Test boundary conditions

3. **Check Console**
   - Open browser developer tools
   - Watch for JavaScript errors
   - Check network requests

4. **Take Screenshots**
   - Capture bugs with screenshots
   - Document unexpected behavior
   - Include error messages

5. **Test Thoroughly**
   - Don't assume anything works
   - Verify every expected result
   - Test negative scenarios

### Common Issues to Watch For

- ⚠️ Email validation not working
- ⚠️ Password too short accepted
- ⚠️ Duplicate emails allowed
- ⚠️ Role changes not saving
- ⚠️ Search not working
- ⚠️ Filter not applying
- ⚠️ Toast notifications not appearing
- ⚠️ Loading states missing
- ⚠️ UI breaking on mobile
- ⚠️ Security vulnerabilities

### Test Data Cleanup

After testing, remember to:
- [ ] Delete test users created
- [ ] Reset any modified roles
- [ ] Clear test data
- [ ] Restore original state

---

**Last Updated:** 2025-11-26
**Version:** 1.0
