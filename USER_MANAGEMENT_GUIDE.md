# User Management Guide

## Overview

This application implements a role-based access control (RBAC) system with two user roles:
- **User** (Regular user with limited privileges)
- **Admin** (Administrator with full system access)

## How to Add New Users

### Method 1: Self-Registration (Recommended for Regular Users)

1. **Navigate to Registration Page**
   - Go to `/register` or click the "Register" link in the header
   
2. **Fill Out Registration Form**
   - Enter email address
   - Create a password (minimum 6 characters)
   - Provide full name (optional)
   - Enter phone number (optional)
   
3. **Automatic Role Assignment**
   - All new users are automatically assigned the **"user"** role
   - Users can immediately log in and access user-level features

### Method 2: Admin-Created Users (For Admin Users Only)

1. **Access Admin Dashboard**
   - Log in as an admin user
   - Navigate to `/admin` or click "Admin" in the header
   
2. **Go to Users Management Tab**
   - Click on the "Users" tab in the admin dashboard
   - Or navigate directly to `/admin/users`
   
3. **Click "Add New User" Button**
   - Fill in the required information:
     - Email (required)
     - Password (required, minimum 6 characters)
     - Full Name (optional)
     - Phone (optional)
     - **Role** (required - choose "User" or "Admin")
   
4. **Create User**
   - Click "Create User" button
   - The new user will receive a confirmation email
   - They can log in immediately with the provided credentials

## User Roles and Privileges

### Regular User Privileges

Regular users can:
- ✅ Browse products
- ✅ Add items to cart
- ✅ Place orders
- ✅ View their order history
- ✅ Track shipments
- ✅ Update their own profile
- ❌ **Cannot** access admin dashboard
- ❌ **Cannot** manage products, inventory, or other users
- ❌ **Cannot** view system-wide reports

### Admin User Privileges

Admin users have **all regular user privileges** plus:
- ✅ Access to admin dashboard (`/admin`)
- ✅ Manage products and inventory
- ✅ View and manage all orders
- ✅ Manage customer information
- ✅ Configure shipping settings
- ✅ Manage vendors and supplies
- ✅ Manage shipment handlers
- ✅ Track all shipments
- ✅ **Manage users and assign roles**
- ✅ Promote users to admin or demote admins to regular users

## How to Promote a User to Admin

### Option 1: Through Admin Dashboard (Recommended)

1. **Log in as Admin**
   - Access the admin dashboard
   
2. **Navigate to Users Management**
   - Go to Admin Dashboard → Users tab
   - Or visit `/admin/users`
   
3. **Find the User**
   - Use the search bar to find users by email, name, or phone
   - Or use the role filter to view all users
   
4. **Change Role**
   - In the "Actions" column, find the role dropdown for the user
   - Select "Admin" from the dropdown
   - The change is applied immediately
   - User will have admin access on their next login

### Option 2: Direct Database Update (Advanced)

If you need to manually promote a user via database:

1. **Access Supabase Dashboard**
   - Log into your Supabase project
   
2. **Open SQL Editor**
   - Navigate to the SQL Editor
   
3. **Run Update Query**
   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE email = 'user@example.com';
   ```
   
4. **Verify Update**
   ```sql
   SELECT id, email, role FROM profiles WHERE email = 'user@example.com';
   ```

## Admin Route Protection

All admin routes are protected by the `RequireAdmin` component:

- **Protected Routes:**
  - `/admin` - Admin Dashboard
  - `/admin/users` - User Management
  - `/admin/vendors` - Vendor Management
  - `/admin/vendor-supplies` - Vendor Supplies
  - `/admin/handlers` - Shipment Handlers
  - `/admin/shipments` - Shipment Tracking

- **Protection Behavior:**
  - Non-authenticated users are redirected to `/login`
  - Authenticated users without admin role are redirected to `/` (home)
  - Toast notification explains why access was denied

## User Management Features

### Search and Filter

- **Search by:**
  - Email address
  - Full name
  - Phone number
  
- **Filter by Role:**
  - All Roles
  - Users Only
  - Admins Only

### User Statistics

The Users Management page displays:
- Total number of users
- Number of admin users
- Number of regular users

### Role Management

- Admins can change any user's role instantly
- Changes take effect immediately
- Users don't need to log out and back in

## Security Considerations

### Password Requirements

- Minimum 6 characters
- Enforced at both frontend and backend
- Passwords are securely hashed by Supabase Auth

### Role-Based Access Control

- All admin routes check user role before rendering
- Database policies ensure data security
- RLS (Row Level Security) policies protect sensitive data

### Admin Permissions

- Admins can view all user profiles
- Admins can update any user's role
- Users can only view and update their own profile
- Role changes are logged in the database

## Troubleshooting

### User Can't Access Admin Dashboard

**Problem:** User sees "Access denied" message when trying to access admin pages.

**Solution:**
1. Verify the user's role in the Users Management page
2. Ensure the role is set to "admin" (not "user")
3. Ask the user to log out and log back in
4. Check browser console for any errors

### Can't Create New Admin User

**Problem:** Unable to create a user with admin role.

**Solution:**
1. Ensure you're logged in as an admin
2. Verify you have access to the Users Management page
3. Check that all required fields are filled
4. Ensure password meets minimum requirements (6 characters)

### First Admin User Setup

**Problem:** No admin users exist in the system.

**Solution:**
1. Create a regular user through registration
2. Access Supabase dashboard
3. Manually update the user's role to 'admin' using SQL:
   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE email = 'your-email@example.com';
   ```
4. Log in with that account - you now have admin access

## Best Practices

1. **Limit Admin Accounts**
   - Only promote trusted users to admin
   - Regularly audit admin user list
   
2. **Use Strong Passwords**
   - Encourage users to use strong, unique passwords
   - Consider implementing password complexity requirements
   
3. **Regular Security Audits**
   - Review user roles periodically
   - Remove inactive admin accounts
   - Monitor admin activity logs
   
4. **Principle of Least Privilege**
   - Only grant admin access when necessary
   - Consider creating additional role levels if needed
   
5. **User Onboarding**
   - New users should register themselves when possible
   - Admin-created accounts should be for special cases only

## Technical Implementation

### Database Schema

```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE,
  full_name text,
  phone text UNIQUE,
  role user_role DEFAULT 'user' NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TYPE user_role AS ENUM ('user', 'admin');
```

### Key Components

- **RequireAdmin Component:** `/src/components/auth/RequireAdmin.tsx`
  - Protects admin routes
  - Checks authentication and role
  - Redirects unauthorized users
  
- **UsersManagement Page:** `/src/pages/admin/UsersManagement.tsx`
  - Lists all users
  - Allows role management
  - Provides search and filter
  - Enables admin user creation
  
- **Routes Configuration:** `/src/routes.tsx`
  - Defines all admin routes
  - Wraps admin pages with RequireAdmin

### API Methods

```typescript
// Get all user profiles
profilesApi.getAllProfiles(): Promise<Profile[]>

// Update user profile (including role)
profilesApi.updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile>

// Get specific user profile
profilesApi.getProfile(userId: string): Promise<Profile | null>

// Promote user to admin
profilesApi.promoteToAdmin(userId: string): Promise<Profile>
```

## Summary

- **New regular users** are created through self-registration with automatic "user" role assignment
- **Admin users** can create users with any role through the Users Management page
- **Role changes** can be made instantly by admins through the UI
- **Admin routes** are protected and only accessible to users with admin role
- **Security** is enforced at both frontend (UI) and backend (database policies)
