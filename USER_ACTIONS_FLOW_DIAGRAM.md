# User Actions Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Management UI                          │
│                  (UsersManagement.tsx)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ User clicks action button
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Action Handlers                            │
│  • openPasswordDialog()  → Shows password dialog                │
│  • openDeleteDialog()    → Shows delete confirmation            │
│  • handleUpdatePassword() → Calls API to update password        │
│  • handleDeleteUser()     → Calls API to delete user            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Calls API method
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Database API                               │
│                     (src/db/api.ts)                             │
│  • profilesApi.deleteUser(userId)                               │
│  • profilesApi.updateUserPassword(userId, newPassword)          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Invokes Edge Function
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase Edge Functions                      │
│  • admin_delete_user                                            │
│  • admin_update_user_password                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Uses Admin API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Supabase Admin API                            │
│  • auth.admin.deleteUser(userId)                                │
│  • auth.admin.updateUserById(userId, { password })              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Updates database
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Supabase Database                          │
│  • auth.users table (authentication)                            │
│  • public.profiles table (user data)                            │
└─────────────────────────────────────────────────────────────────┘
```

## Delete User Flow

```
Admin clicks Delete Button (🗑️)
         │
         ▼
openDeleteDialog(user)
         │
         ▼
┌─────────────────────────┐
│  Delete Confirmation    │
│  Dialog Appears         │
│                         │
│  "Are you sure?"        │
│  [Cancel] [Delete User] │
└─────────────────────────┘
         │
         │ Admin clicks "Delete User"
         ▼
handleDeleteUser()
         │
         ▼
profilesApi.deleteUser(userId)
         │
         ▼
supabase.functions.invoke('admin_delete_user')
         │
         ▼
Edge Function Validates:
  ✓ Valid JWT token?
  ✓ User is admin?
  ✓ Not deleting self?
         │
         ▼
auth.admin.deleteUser(userId)
         │
         ▼
Database Updates:
  • Removes from auth.users
  • Cascade deletes from profiles
         │
         ▼
Success Response
         │
         ▼
UI Updates:
  • Close dialog
  • Show success toast
  • Reload user list
```

## Update Password Flow

```
Admin clicks Password Button (🔑)
         │
         ▼
openPasswordDialog(user)
         │
         ▼
┌─────────────────────────┐
│  Password Update Dialog │
│                         │
│  New Password: [______] │
│  [Cancel] [Update]      │
└─────────────────────────┘
         │
         │ Admin enters password and submits
         ▼
handleUpdatePassword()
         │
         ▼
Validate Password:
  ✓ Length >= 6 characters?
         │
         ▼
profilesApi.updateUserPassword(userId, newPassword)
         │
         ▼
supabase.functions.invoke('admin_update_user_password')
         │
         ▼
Edge Function Validates:
  ✓ Valid JWT token?
  ✓ User is admin?
  ✓ Password length >= 6?
         │
         ▼
auth.admin.updateUserById(userId, { password })
         │
         ▼
Database Updates:
  • Updates password in auth.users
         │
         ▼
Success Response
         │
         ▼
UI Updates:
  • Close dialog
  • Show success toast
  • Clear password field
```

## Security Validation Points

### Frontend Validation (UI Layer)
```
┌─────────────────────────────────────┐
│ 1. Self-deletion check              │
│    → Delete button disabled for     │
│      current user                   │
│                                     │
│ 2. Password length check            │
│    → Minimum 6 characters           │
│                                     │
│ 3. Required field validation        │
│    → All fields must be filled      │
└─────────────────────────────────────┘
```

### Backend Validation (Edge Function Layer)
```
┌─────────────────────────────────────┐
│ 1. Authentication check             │
│    → Valid JWT token required       │
│                                     │
│ 2. Authorization check              │
│    → User must be admin             │
│                                     │
│ 3. Self-deletion prevention         │
│    → Cannot delete own account      │
│                                     │
│ 4. Input validation                 │
│    → Validate all parameters        │
└─────────────────────────────────────┘
```

## Error Handling Flow

```
Error Occurs
    │
    ├─ Frontend Error
    │   │
    │   ├─ Validation Error
    │   │   └─→ Show error toast
    │   │       "Password must be at least 6 characters"
    │   │
    │   └─ Network Error
    │       └─→ Show error toast
    │           "Failed to connect to server"
    │
    └─ Backend Error
        │
        ├─ Authentication Error
        │   └─→ Show error toast
        │       "Unauthorized"
        │
        ├─ Authorization Error
        │   └─→ Show error toast
        │       "Only admins can delete users"
        │
        └─ Operation Error
            └─→ Show error toast
                "Failed to delete user"
```

## Data Flow Diagram

```
┌──────────────┐
│   Browser    │
│   (React)    │
└──────┬───────┘
       │
       │ HTTPS
       │
┌──────▼───────┐
│  Supabase    │
│   Client     │
└──────┬───────┘
       │
       ├─────────────────┐
       │                 │
       │ REST API        │ Edge Functions
       │                 │
┌──────▼───────┐  ┌──────▼───────┐
│  Database    │  │  Admin API   │
│  (Postgres)  │  │  (Deno)      │
└──────────────┘  └──────────────┘
```

## Component Interaction

```
UsersManagement Component
    │
    ├─ State Management
    │   ├─ users (all users)
    │   ├─ filteredUsers (search/filter results)
    │   ├─ selectedUser (user being edited/deleted)
    │   ├─ isPasswordDialogOpen
    │   ├─ isDeleteDialogOpen
    │   └─ currentUserId (logged-in admin)
    │
    ├─ UI Components
    │   ├─ Table (user list)
    │   ├─ Dialog (password update)
    │   └─ AlertDialog (delete confirmation)
    │
    └─ Event Handlers
        ├─ openPasswordDialog()
        ├─ openDeleteDialog()
        ├─ handleUpdatePassword()
        ├─ handleDeleteUser()
        └─ handleUpdateRole()
```

## Success/Error Notification Flow

```
Operation Completes
    │
    ├─ Success
    │   └─→ toast({
    │         title: 'Success',
    │         description: 'Operation completed',
    │       })
    │
    └─ Error
        └─→ toast({
              title: 'Error',
              description: error.message,
              variant: 'destructive',
            })
```

## User Experience Flow

```
Admin visits User Management page
    │
    ▼
Views list of all users
    │
    ├─ Wants to delete user
    │   │
    │   ├─ Clicks delete button (🗑️)
    │   ├─ Sees confirmation dialog
    │   ├─ Confirms deletion
    │   ├─ Sees loading state
    │   ├─ Sees success message
    │   └─ User removed from list
    │
    └─ Wants to change password
        │
        ├─ Clicks password button (🔑)
        ├─ Sees password dialog
        ├─ Enters new password
        ├─ Submits form
        ├─ Sees loading state
        ├─ Sees success message
        └─ Dialog closes
```

## Key Features Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    User Management Actions                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔑 Change Password                                         │
│     • Admin only                                            │
│     • Minimum 6 characters                                  │
│     • Immediate effect                                      │
│     • No email notification                                 │
│                                                             │
│  🗑️  Delete User                                            │
│     • Admin only                                            │
│     • Cannot delete self                                    │
│     • Requires confirmation                                 │
│     • Permanent deletion                                    │
│     • Cascade deletes profile                               │
│                                                             │
│  ⚙️  Change Role                                            │
│     • Admin only                                            │
│     • User ↔ Admin                                          │
│     • Immediate effect                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
