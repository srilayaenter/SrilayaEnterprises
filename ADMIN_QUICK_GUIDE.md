# Admin Quick Guide - Adding Non-Admin Users

## ✅ YES! Admins Can Add Regular (Non-Admin) Users

As an admin, you have full privileges to create new user accounts with either regular user or admin roles.

## Quick Steps to Add a Regular User

### 1. Access User Management
- Log in as admin
- Go to **Admin Dashboard** → **Users** tab
- Or visit: `/admin/users`

### 2. Click "Add New User"
- Click the **"Add New User"** button in the top right

### 3. Fill in User Details
- **Email**: User's email address (required)
- **Password**: Minimum 6 characters (required)
- **Full Name**: Optional
- **Phone**: Optional
- **Role**: Select **"User"** for regular users (this is the default)

### 4. Create User
- Click **"Create User"**
- Done! The user can now log in with their credentials

## Key Points

✅ **Default Role is "User"** - When you create a new user, the role defaults to "User" (non-admin)

✅ **You Control the Role** - You can choose to create either:
  - **User** - Regular user with standard shopping privileges
  - **Admin** - Admin user with full system access

✅ **Instant Access** - Users can log in immediately after creation

✅ **Change Roles Anytime** - You can promote users to admin or demote admins to regular users at any time

## What Regular Users Can Do

Regular users (non-admin) can:
- ✅ Browse and search products
- ✅ Add items to cart
- ✅ Place orders
- ✅ View order history
- ✅ Track shipments
- ✅ Update their own profile
- ❌ Cannot access admin dashboard
- ❌ Cannot manage products or inventory
- ❌ Cannot view other users' information

## What Admin Users Can Do

Admin users have all regular user privileges PLUS:
- ✅ Access admin dashboard
- ✅ Manage products and inventory
- ✅ View and manage all orders
- ✅ Manage all users (create, edit roles)
- ✅ Configure system settings
- ✅ Manage vendors and shipments

## Managing Existing Users

### View All Users
- Go to **Admin Dashboard** → **Users** tab
- See total users, admins, and regular users count

### Search Users
- Use the search bar to find users by:
  - Email
  - Full name
  - Phone number

### Filter Users
- Filter by role:
  - All Roles
  - Users Only
  - Admins Only

### Change User Role
- Find the user in the list
- In the **Actions** column, use the dropdown to change their role
- Select **"User"** to make them a regular user
- Select **"Admin"** to give them admin privileges
- Changes take effect immediately

## Security Best Practices

1. **Create Regular Users by Default**
   - Only assign admin role when absolutely necessary
   - Most users should be regular users

2. **Review Admin List Regularly**
   - Periodically check who has admin access
   - Remove admin privileges from users who no longer need them

3. **Use Strong Passwords**
   - Require minimum 6 characters (enforced)
   - Encourage users to use strong, unique passwords

4. **Audit User Activity**
   - Monitor who has admin access
   - Track when users are created and roles are changed

## Troubleshooting

### Can't Access User Management?
- Ensure you're logged in as an admin
- Check that your role is set to "admin" in the database

### User Can't Log In?
- Verify the email and password are correct
- Check that the user was created successfully
- Look for error messages in the user creation process

### Need to Create First Admin?
If you don't have any admin users yet:
1. Create a regular user through registration
2. Access your Supabase dashboard
3. Run this SQL query:
   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE email = 'your-email@example.com';
   ```
4. Log in with that account - you now have admin access

## Summary

✅ **Admins can add regular (non-admin) users** through the User Management interface

✅ **Default role is "User"** - ensuring regular users are created unless you explicitly choose admin

✅ **Full control** - You can create, view, search, filter, and manage all user roles

✅ **Secure** - Role-based access control ensures only admins can manage users

For more detailed information, see the complete **USER_MANAGEMENT_GUIDE.md** file.
