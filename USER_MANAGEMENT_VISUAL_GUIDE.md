# User Management - Visual Testing Guide

## 🎨 What You Should See

This guide describes what the User Management interface should look like at each step of testing.

## 📍 Page Layout

### Main Page View

```
┌─────────────────────────────────────────────────────────────┐
│  👥 User Management                    [+ Add New User]      │
│  Create and manage user accounts...                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Total Users  │  │ Admin Users  │  │ Regular Users│      │
│  │     15       │  │      3       │  │      12      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│  🔍 [Search users...]        [Filter: All ▼]                │
├─────────────────────────────────────────────────────────────┤
│  Email              │ Full Name  │ Phone      │ Role │ ...  │
│  ─────────────────────────────────────────────────────────  │
│  admin@store.com    │ Admin User │ 1234567890 │ 🛡️Admin│   │
│  user1@store.com    │ John Doe   │ 9876543210 │ 👤User │   │
│  user2@store.com    │ Jane Smith │ 5551234567 │ 👤User │   │
└─────────────────────────────────────────────────────────────┘
```

### Visual Elements

**Header Section:**
- 👥 Users icon (left side)
- "User Management" title (large, bold)
- Description text (gray, smaller)
- "Add New User" button (right side, blue/primary color)

**Summary Cards:**
- Three cards in a row
- Each card has:
  - Icon (📦 Package icon)
  - Label (e.g., "Total Users")
  - Number (large, bold)
- Cards have subtle shadow
- White background

**Search & Filter Bar:**
- Search icon (🔍) inside search box
- Search box: "Search users..." placeholder
- Filter dropdown: "Filter: All ▼"
- Both aligned horizontally

**Users Table:**
- Clean, bordered table
- Headers: Email, Full Name, Phone, Role, Created At, Actions
- Alternating row colors (subtle)
- Role badges are colored:
  - Admin: Blue badge with shield icon
  - User: Gray badge with user icon

## 🎯 Step-by-Step Visual Guide

### Step 1: Initial Page Load

**What You Should See:**
```
✅ Page loads smoothly (no flash of unstyled content)
✅ Header with title and button
✅ Three summary cards with numbers
✅ Search bar and filter dropdown
✅ Table with existing users
✅ Loading indicator briefly (if any)
```

**Colors:**
- Background: Light gray or white
- Primary color: Green (#4CAF50) or brown (#8D6E63)
- Text: Dark gray or black
- Muted text: Light gray

### Step 2: Click "Add New User"

**Dialog Appearance:**
```
┌─────────────────────────────────────┐
│  Add New User                    [X]│
│  Create a new user account...       │
├─────────────────────────────────────┤
│  Email *                            │
│  [_____________________________]    │
│                                     │
│  Password *                         │
│  [_____________________________]    │
│  Minimum 6 characters               │
│                                     │
│  Full Name                          │
│  [_____________________________]    │
│                                     │
│  Phone                              │
│  [_____________________________]    │
│                                     │
│  Role                               │
│  [User ▼]                           │
│                                     │
│              [Create User]          │
└─────────────────────────────────────┘
```

**What You Should See:**
```
✅ Dialog appears centered on screen
✅ Semi-transparent backdrop behind dialog
✅ Title: "Add New User"
✅ Description text below title
✅ All form fields visible
✅ Required fields marked with *
✅ Password hint text: "Minimum 6 characters"
✅ Role dropdown defaults to "User"
✅ "Create User" button at bottom
✅ Close button (X) in top-right
```

### Step 3: Fill in Form

**As You Type:**
```
Email field:     test1@example.com
Password field:  ••••••• (dots, not visible text)
Full Name:       Test User
Phone:           1234567890
Role:            User (from dropdown)
```

**What You Should See:**
```
✅ Text appears as you type
✅ Password shows dots/asterisks
✅ No validation errors yet
✅ Fields have focus state (border color changes)
✅ Cursor is visible
```

### Step 4: Submit Form

**After Clicking "Create User":**

**Success Case:**
```
┌─────────────────────────────────┐
│  ✅ Success                     │
│  User created successfully      │
└─────────────────────────────────┘
```

**What You Should See:**
```
✅ Green toast notification appears (top-right)
✅ Message: "User created successfully"
✅ Dialog closes automatically
✅ New user appears in table
✅ Summary cards update (+1 to Total Users)
✅ Toast auto-dismisses after 3-5 seconds
```

**Error Case (e.g., empty email):**
```
┌─────────────────────────────────┐
│  ❌ Error                       │
│  Email and password are required│
└─────────────────────────────────┘
```

**What You Should See:**
```
✅ Red toast notification appears
✅ Error message is clear
✅ Dialog stays open
✅ Form data is preserved
✅ User can correct and retry
```

### Step 5: View New User in Table

**Table Row:**
```
│ test1@example.com │ Test User │ 1234567890 │ 👤 User │ Nov 26, 2025 │ [Role ▼] │
```

**What You Should See:**
```
✅ New row at top of table (or sorted position)
✅ Email is displayed
✅ Full name is displayed
✅ Phone is displayed
✅ Role badge: Gray with user icon
✅ Created date: Today's date
✅ Role dropdown in Actions column
```

### Step 6: Search for User

**Type "test1" in search box:**

**What You Should See:**
```
✅ Table filters in real-time (as you type)
✅ Only matching users shown
✅ Other users disappear
✅ Summary cards update to show filtered count
✅ No page reload
✅ Smooth transition
```

**If no matches:**
```
┌─────────────────────────────────────┐
│  No users found                     │
└─────────────────────────────────────┘
```

### Step 7: Filter by Role

**Select "Admin" from filter dropdown:**

**What You Should See:**
```
✅ Dropdown opens with options: All, Admin, User
✅ Click "Admin"
✅ Table shows only admin users
✅ All visible users have blue "Admin" badge
✅ Summary cards update
✅ Search still works with filter active
```

### Step 8: Change User Role

**Click role dropdown for a user:**

**Dropdown Menu:**
```
┌─────────┐
│ User    │ ← currently selected
│ Admin   │
└─────────┘
```

**Select "Admin":**

**What You Should See:**
```
✅ Dropdown closes
✅ Success toast: "User role updated successfully"
✅ Badge changes from gray "User" to blue "Admin"
✅ Badge icon changes to shield
✅ Summary cards update (-1 Regular, +1 Admin)
✅ Change is immediate (no page reload)
```

## 🎨 Color Scheme

### Primary Colors
- **Primary:** Green (#4CAF50) or Brown (#8D6E63)
- **Background:** White or Light Gray (#F5F5F5)
- **Text:** Dark Gray (#333333)
- **Muted Text:** Light Gray (#999999)

### Role Badges
- **Admin Badge:**
  - Background: Blue (#3B82F6)
  - Text: White
  - Icon: Shield (🛡️)
  - Border: None or subtle

- **User Badge:**
  - Background: Gray (#6B7280)
  - Text: White
  - Icon: User (👤)
  - Border: None or subtle

### Buttons
- **Primary Button (Create User):**
  - Background: Primary color
  - Text: White
  - Hover: Slightly darker
  - Active: Even darker

- **Secondary Button:**
  - Background: Gray
  - Text: Dark
  - Hover: Slightly darker

### Toast Notifications
- **Success:**
  - Background: Green (#10B981)
  - Text: White
  - Icon: Checkmark (✅)

- **Error:**
  - Background: Red (#EF4444)
  - Text: White
  - Icon: X mark (❌)

## 📱 Responsive Views

### Desktop (1920px)
```
┌────────────────────────────────────────────────────────────┐
│  Full width layout                                          │
│  Three summary cards side by side                           │
│  Search and filter on same line                             │
│  Table shows all columns                                    │
│  Plenty of spacing                                          │
└────────────────────────────────────────────────────────────┘
```

### Tablet (768px)
```
┌──────────────────────────────────┐
│  Narrower layout                 │
│  Three cards still side by side  │
│  Search and filter stack         │
│  Table may scroll horizontally   │
│  Tighter spacing                 │
└──────────────────────────────────┘
```

### Mobile (375px)
```
┌─────────────────────┐
│  Narrow layout      │
│  Cards stack        │
│  vertically         │
│  Search full width  │
│  Filter full width  │
│  Table scrolls      │
│  horizontally       │
└─────────────────────┘
```

## 🔍 What to Look For

### Good Signs ✅
- Smooth animations
- No flickering
- Consistent spacing
- Aligned elements
- Readable text
- Clear icons
- Proper colors
- Responsive layout
- Fast loading
- No console errors

### Bad Signs ❌
- Broken layout
- Overlapping elements
- Misaligned text
- Wrong colors
- Missing icons
- Slow loading
- Console errors
- Unresponsive buttons
- Broken images
- Text overflow

## 🎯 Visual Checklist

### Typography
- [ ] Title is large and bold
- [ ] Description text is smaller and gray
- [ ] Table headers are bold
- [ ] Table data is readable
- [ ] No text overflow
- [ ] Consistent font family

### Spacing
- [ ] Consistent padding in cards
- [ ] Proper margins between sections
- [ ] Table cells have padding
- [ ] Dialog has padding
- [ ] Buttons have proper spacing

### Colors
- [ ] Primary color is consistent
- [ ] Role badges are colored correctly
- [ ] Toast notifications are colored
- [ ] Hover states are visible
- [ ] Focus states are visible
- [ ] Contrast is good (readable)

### Icons
- [ ] Users icon in header
- [ ] Shield icon for admin badge
- [ ] User icon for user badge
- [ ] Search icon in search box
- [ ] Package icons in summary cards
- [ ] Close icon in dialog

### Interactions
- [ ] Buttons change on hover
- [ ] Inputs show focus state
- [ ] Dropdowns open smoothly
- [ ] Dialogs appear centered
- [ ] Toasts slide in/out
- [ ] Table rows highlight on hover

### Responsive
- [ ] Layout adapts to screen size
- [ ] No horizontal scroll (except table)
- [ ] Touch targets are large enough
- [ ] Text remains readable
- [ ] Images scale properly

## 📸 Screenshot Checklist

When testing, capture screenshots of:

1. **Initial page load** - Full page view
2. **Add user dialog** - Empty form
3. **Add user dialog** - Filled form
4. **Success toast** - After creating user
5. **New user in table** - Showing new row
6. **Search results** - Filtered table
7. **Filter results** - Admin only
8. **Role change** - Before and after
9. **Mobile view** - Responsive layout
10. **Error state** - Validation error

## 🎓 Visual Testing Tips

1. **Compare with Design**
   - Check if colors match
   - Verify spacing is consistent
   - Ensure fonts are correct

2. **Test Interactions**
   - Hover over elements
   - Click all buttons
   - Type in all fields
   - Open all dropdowns

3. **Check Responsiveness**
   - Resize browser window
   - Test on different devices
   - Verify mobile layout

4. **Look for Bugs**
   - Overlapping elements
   - Misaligned text
   - Broken images
   - Wrong colors

5. **Verify Accessibility**
   - Tab through elements
   - Check color contrast
   - Verify focus indicators
   - Test with screen reader

## ✅ Visual Acceptance Criteria

The UI passes visual testing if:

- ✅ All elements are visible and properly aligned
- ✅ Colors match the design system
- ✅ Typography is consistent and readable
- ✅ Icons are displayed correctly
- ✅ Spacing is consistent throughout
- ✅ Responsive design works on all screen sizes
- ✅ Animations are smooth
- ✅ No visual bugs or glitches
- ✅ Hover and focus states are visible
- ✅ Toast notifications appear correctly

---

**Document Version:** 1.0
**Last Updated:** 2025-11-26
