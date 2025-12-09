# User Delete and Password Edit Implementation

## Overview
This document describes the implementation of user deletion and password editing functionality for administrators in the User Management system.

## Features Implemented

### 1. Delete User Functionality
- **Admin-only access**: Only administrators can delete user accounts
- **Self-protection**: Admins cannot delete their own account
- **Confirmation dialog**: Displays a warning before deletion
- **Permanent action**: Deletes the user from both auth.users and profiles tables
- **Visual feedback**: Success/error toast notifications

### 2. Edit User Password Functionality
- **Admin-only access**: Only administrators can change user passwords
- **Password validation**: Minimum 6 characters required
- **Secure implementation**: Uses Supabase Admin API via Edge Functions
- **Visual feedback**: Success/error toast notifications

## Technical Implementation

### Edge Functions Created

#### 1. `admin_delete_user`
**Location**: `/supabase/functions/admin_delete_user/index.ts`

**Purpose**: Securely delete users using Supabase Admin API

**Features**:
- Validates admin role before allowing deletion
- Prevents self-deletion
- Uses `auth.admin.deleteUser()` to remove user from auth system
- Cascade deletion automatically removes profile record

**API Endpoint**: `POST /functions/v1/admin_delete_user`

**Request Body**:
```json
{
  "userId": "uuid-of-user-to-delete"
}
```

**Response**:
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

#### 2. `admin_update_user_password`
**Location**: `/supabase/functions/admin_update_user_password/index.ts`

**Purpose**: Securely update user passwords using Supabase Admin API

**Features**:
- Validates admin role before allowing password changes
- Validates password length (minimum 6 characters)
- Uses `auth.admin.updateUserById()` to update password

**API Endpoint**: `POST /functions/v1/admin_update_user_password`

**Request Body**:
```json
{
  "userId": "uuid-of-user",
  "newPassword": "new-password-string"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

### Database API Updates

**File**: `/src/db/api.ts`

Added two new methods to `profilesApi`:

```typescript
async deleteUser(userId: string): Promise<void>
async updateUserPassword(userId: string, newPassword: string): Promise<void>
```

Both methods:
- Call the respective Edge Functions
- Handle errors properly
- Provide meaningful error messages

### UI Updates

**File**: `/src/pages/admin/UsersManagement.tsx`

#### New Components Added:
1. **Password Update Dialog**: Modal form for changing user passwords
2. **Delete Confirmation Dialog**: AlertDialog for confirming user deletion

#### New UI Elements:
- **Password Edit Button**: Key icon button in the Actions column
- **Delete Button**: Trash icon button in the Actions column (disabled for current user)

#### New State Variables:
```typescript
const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
const [newPassword, setNewPassword] = useState('');
const [currentUserId, setCurrentUserId] = useState<string | null>(null);
```

#### New Handler Functions:
- `handleDeleteUser()`: Executes user deletion
- `handleUpdatePassword()`: Updates user password
- `openPasswordDialog()`: Opens password edit dialog
- `openDeleteDialog()`: Opens delete confirmation dialog
- `getCurrentUser()`: Gets current logged-in user ID

## User Interface

### Actions Column Layout
Each user row now has three action elements:
1. **Role Selector**: Dropdown to change user role (User/Admin)
2. **Password Button**: Key icon to change password
3. **Delete Button**: Trash icon to delete user (disabled for self)

### Password Update Dialog
- **Title**: "Update Password"
- **Description**: Shows the email of the user being edited
- **Input Field**: Password input with minimum 6 characters
- **Buttons**: Cancel and Update Password

### Delete Confirmation Dialog
- **Title**: "Are you sure?"
- **Description**: Warning message with user email
- **Buttons**: Cancel and Delete User (destructive style)

## Security Features

1. **Admin-only operations**: Both Edge Functions verify admin role
2. **Self-deletion prevention**: Cannot delete own account
3. **Secure password handling**: Passwords never exposed in frontend
4. **Edge Function security**: Uses service role key, not accessible from client
5. **Authorization checks**: Validates JWT token on every request

## Error Handling

### Frontend Validation:
- Password length validation (minimum 6 characters)
- Required field validation
- Self-deletion prevention

### Backend Validation:
- Admin role verification
- User existence checks
- Password strength validation

### User Feedback:
- Success toast notifications
- Error toast notifications with descriptive messages
- Loading states during operations

## Testing Checklist

- [x] Admin can delete other users
- [x] Admin cannot delete their own account
- [x] Admin can change user passwords
- [x] Password validation works (minimum 6 characters)
- [x] Confirmation dialogs appear before destructive actions
- [x] Success/error messages display correctly
- [x] Edge Functions deployed successfully
- [x] Lint check passes with no errors

## Usage Instructions

### To Delete a User:
1. Navigate to Admin Dashboard → User Management
2. Find the user in the table
3. Click the trash icon button in the Actions column
4. Confirm deletion in the dialog
5. User will be permanently deleted

### To Change a User's Password:
1. Navigate to Admin Dashboard → User Management
2. Find the user in the table
3. Click the key icon button in the Actions column
4. Enter the new password (minimum 6 characters)
5. Click "Update Password"
6. User's password will be updated immediately

## Notes

- Deleted users cannot be recovered
- Password changes take effect immediately
- Users are not notified when their password is changed
- The current logged-in admin cannot delete their own account
- All operations are logged in Supabase Edge Function logs

## Files Modified

1. `/supabase/functions/admin_delete_user/index.ts` (created)
2. `/supabase/functions/admin_update_user_password/index.ts` (created)
3. `/src/db/api.ts` (modified - added deleteUser and updateUserPassword methods)
4. `/src/pages/admin/UsersManagement.tsx` (modified - added UI and handlers)

## Dependencies

- `@supabase/supabase-js@2.39.3` (Edge Functions)
- Existing shadcn/ui components (Dialog, AlertDialog, Button, Input)
- Lucide React icons (KeyRound, Trash2)
