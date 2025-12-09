# User Management Actions - Quick Guide

## Overview
Administrators can now delete users and edit their passwords directly from the User Management page.

## Visual Layout

### User Table - Actions Column
Each user row displays three action controls:

```
┌─────────────────────────────────────────────────────────────────┐
│ Email          │ Name  │ Phone │ Role  │ Created │ Actions      │
├─────────────────────────────────────────────────────────────────┤
│ user@email.com │ John  │ 123   │ User  │ 1/1/24  │ [▼ User] [🔑] [🗑️] │
└─────────────────────────────────────────────────────────────────┘
```

**Actions (left to right):**
1. **[▼ User]** - Role selector dropdown (User/Admin)
2. **[🔑]** - Change password button
3. **[🗑️]** - Delete user button (disabled for your own account)

## Features

### 1. Change User Password
**Button**: Key icon (🔑)

**Steps**:
1. Click the key icon next to the user
2. Dialog opens: "Update Password"
3. Enter new password (minimum 6 characters)
4. Click "Update Password"
5. Success notification appears

**Dialog Preview**:
```
┌─────────────────────────────────────────┐
│ Update Password                    [×]  │
├─────────────────────────────────────────┤
│ Change the password for user@email.com  │
│                                         │
│ New Password *                          │
│ [••••••••••••••••••••]                 │
│ Minimum 6 characters                    │
│                                         │
│              [Cancel] [Update Password] │
└─────────────────────────────────────────┘
```

### 2. Delete User
**Button**: Trash icon (🗑️)

**Steps**:
1. Click the trash icon next to the user
2. Confirmation dialog appears
3. Review the warning message
4. Click "Delete User" to confirm
5. User is permanently deleted

**Dialog Preview**:
```
┌─────────────────────────────────────────┐
│ ⚠️  Are you sure?                       │
├─────────────────────────────────────────┤
│ This will permanently delete the user   │
│ account for user@email.com.             │
│ This action cannot be undone.           │
│                                         │
│              [Cancel] [Delete User]     │
└─────────────────────────────────────────┘
```

## Important Notes

### Security Features
✅ Only administrators can access these features
✅ You cannot delete your own account (button is disabled)
✅ All actions require confirmation
✅ Operations are logged in the system

### Password Requirements
- Minimum 6 characters
- No maximum length
- Can include any characters

### Deletion Behavior
⚠️ **Warning**: User deletion is permanent and cannot be undone
- Removes user from authentication system
- Removes user profile from database
- User will be immediately logged out if currently logged in
- All user data is permanently deleted

### Success/Error Messages
All actions show toast notifications:
- ✅ Success: Green notification at top-right
- ❌ Error: Red notification with error details

## Common Use Cases

### Scenario 1: Reset Forgotten Password
1. User contacts admin about forgotten password
2. Admin navigates to User Management
3. Admin clicks key icon for that user
4. Admin enters temporary password
5. Admin shares temporary password with user
6. User logs in and changes password

### Scenario 2: Remove Inactive User
1. Admin identifies inactive user account
2. Admin clicks trash icon for that user
3. Admin confirms deletion in dialog
4. User account is permanently removed

### Scenario 3: Promote User to Admin
1. Admin clicks role dropdown for user
2. Admin selects "Admin" from dropdown
3. User immediately gains admin privileges
4. User can access admin dashboard on next login

## Keyboard Shortcuts
- **Tab**: Navigate between buttons
- **Enter**: Submit forms/confirm actions
- **Escape**: Close dialogs

## Troubleshooting

### "Cannot delete your own account"
- The delete button is disabled for your own account
- This is a security feature to prevent accidental self-deletion
- Ask another admin to delete your account if needed

### "Failed to delete user"
- Check your internet connection
- Verify you have admin privileges
- Try refreshing the page and trying again

### "Failed to update password"
- Ensure password is at least 6 characters
- Check your internet connection
- Verify you have admin privileges

## Best Practices

1. **Before Deleting**:
   - Verify you have the correct user
   - Consider if the user should be deactivated instead
   - Ensure no critical data will be lost

2. **Password Changes**:
   - Use strong temporary passwords
   - Inform users when their password is changed
   - Encourage users to change temporary passwords immediately

3. **Role Changes**:
   - Only promote trusted users to admin
   - Review admin list regularly
   - Demote admins who no longer need access

## Quick Reference

| Action | Icon | Shortcut | Confirmation Required |
|--------|------|----------|----------------------|
| Change Role | Dropdown | None | No |
| Change Password | 🔑 | None | No (dialog only) |
| Delete User | 🗑️ | None | Yes (alert dialog) |

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify your admin role in your profile
3. Try logging out and back in
4. Contact system administrator if problems persist
