# Srilaya Enterprises Organic Store - User Guide

## Welcome! 🌿

Your organic e-commerce store is ready! This guide will help you understand how to use and manage your new online store.

## For Customers

### Browsing Products
1. **Home Page**: View all organic products with beautiful cards
2. **Category Filters**: Click category buttons to filter by product type
3. **Search**: Use the search bar to find specific products
4. **Product Details**: Click any product to see full details and packaging options

### Shopping
1. **Select Size**: Choose your preferred packaging size (1kg, 2kg, 5kg, etc.)
2. **Add to Cart**: Select quantity and add items to your cart
3. **View Cart**: Click the cart icon in the header (shows item count)
4. **Checkout**: Review your order and proceed to payment

### Account Management
1. **Register**: Create an account to track orders
2. **Login**: Access your account anytime
3. **Order History**: View all your past orders
4. **Profile**: Manage your account information

## For Store Owners (Admin)

### Getting Admin Access
- **First User**: The first person to register automatically becomes an admin
- **Admin Button**: Once logged in as admin, you'll see an "Admin" button in the header

### Admin Dashboard
Access at `/admin` to manage:
- **Products**: View and manage your product catalog
- **Orders**: See all customer orders and their status
- **Customers**: View registered customer accounts

### Managing Products
Current products in your store:

**Millets:**
- Foxtail Millet (1kg, 2kg, 5kg, 10kg)
- Pearl Millet (Bajra) (1kg, 2kg, 5kg, 10kg)
- Finger Millet (Ragi) (1kg, 2kg, 5kg, 10kg)

**Rice:**
- Basmati Rice (1kg, 2kg, 5kg, 10kg)
- Brown Rice (1kg, 2kg, 5kg, 10kg)
- Red Rice (1kg, 2kg, 5kg, 10kg)

**Flakes:**
- Oat Flakes (1kg, 2kg, 5kg, 10kg)
- Corn Flakes (1kg, 2kg, 5kg, 10kg)
- Rice Flakes (Poha) (1kg, 2kg, 5kg, 10kg)

**Sugar Alternatives:**
- Jaggery Powder (1kg, 2kg, 5kg, 10kg)
- Coconut Sugar (1kg, 2kg, 5kg, 10kg)

**Honey:**
- Raw Honey (200g, 500g, 1kg)
- Forest Honey (200g, 500g, 1kg)
- Manuka Honey (200g, 500g, 1kg)

**Laddus:**
- Ragi Laddu (1kg, 2kg, 5kg, 10kg)
- Sesame Laddu (1kg, 2kg, 5kg, 10kg)
- Dry Fruit Laddu (1kg, 2kg, 5kg, 10kg)

### Processing Orders
1. View all orders in the admin dashboard
2. Check order status (pending, completed, cancelled)
3. See customer details and order items
4. Track payment status

## Payment Information

### For Customers
- Secure payment via Stripe
- Accepts all major credit/debit cards
- Payment processed in new tab
- Automatic order confirmation

### For Testing (Development)
Use Stripe test card:
- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

### For Production
- Store owner must configure Stripe secret key
- Use real credit cards
- Real payments will be processed

## Features Overview

### ✅ What's Working
- User registration and login
- Product browsing with filters
- Shopping cart management
- Secure checkout with Stripe
- Order tracking
- Admin dashboard
- Responsive mobile design
- Real-time cart updates
- Toast notifications

### 🔧 Configuration Needed
- **Stripe Secret Key**: Required for payment processing
- **Product Images**: Currently using placeholders
- **Email Notifications**: Optional feature to add

## Common Tasks

### How to Add Products to Cart
1. Browse products on home page
2. Click "View Details" on any product
3. Select your preferred packaging size
4. Choose quantity
5. Click "Add to Cart"

### How to Complete a Purchase
1. Click cart icon in header
2. Review items and quantities
3. Click "Proceed to Checkout"
4. Complete payment in Stripe window
5. Wait for confirmation
6. View order in "Orders" page

### How to View Order History
1. Login to your account
2. Click user icon in header
3. Select "Orders"
4. View all your past orders

### How to Manage Cart
- **Increase Quantity**: Click + button
- **Decrease Quantity**: Click - button
- **Remove Item**: Click trash icon
- **Clear Cart**: Click "Clear Cart" button

## Design & Branding

### Color Scheme
- **Green (#4CAF50)**: Primary color, represents organic/natural
- **Brown (#8D6E63)**: Secondary color, earthy feel
- **Orange (#FF9800)**: Accent color for buttons
- **Cream (#FFF8E1)**: Background color, soft and inviting

### Visual Style
- Clean, modern design
- Nature-inspired icons
- Rounded corners for friendly feel
- Smooth animations and transitions
- Responsive on all devices

## Troubleshooting

### Payment Not Working
- Ensure Stripe secret key is configured
- Check internet connection
- Try different browser
- Use test card for development

### Can't Login
- Check email and password
- Register if you don't have an account
- Clear browser cache

### Cart Items Disappearing
- Cart is saved in browser
- Don't clear browser data
- Login to save orders permanently

### Admin Access Not Showing
- Ensure you're the first registered user
- Logout and login again
- Check profile role in database

## Mobile Experience

The store is fully responsive:
- **Mobile**: Optimized for phones (375px+)
- **Tablet**: Great on tablets (768px+)
- **Desktop**: Full features on desktop (1280px+)

### Mobile Features
- Touch-friendly buttons
- Swipe-friendly cards
- Collapsible navigation
- Optimized images
- Fast loading

## Security

### Customer Data
- Passwords encrypted
- Secure authentication
- Protected user data
- HTTPS connection

### Payment Security
- PCI-compliant via Stripe
- No card data stored
- Secure payment processing
- Encrypted transactions

## Support & Maintenance

### Regular Tasks
1. Check orders daily
2. Update product availability
3. Respond to customer inquiries
4. Monitor payment processing
5. Review analytics

### Recommended Updates
1. Upload real product images
2. Add more product descriptions
3. Set up email notifications
4. Configure shipping options
5. Add customer reviews

## Getting Help

### Documentation
- `SETUP.md`: Technical setup guide
- `TODO.md`: Implementation checklist
- This file: User guide

### Common Questions
**Q: How do I become an admin?**
A: The first user to register automatically becomes admin.

**Q: Can I add more products?**
A: Yes, through the admin dashboard (full CRUD to be implemented).

**Q: How do I change prices?**
A: Access the database or admin panel to update product variants.

**Q: Can customers checkout without account?**
A: Currently requires login for order tracking.

**Q: How do I test payments?**
A: Use Stripe test card 4242 4242 4242 4242.

## Next Steps

### For Store Owners
1. ✅ Register your admin account (be the first!)
2. ✅ Browse the product catalog
3. ⚠️ Configure Stripe secret key for payments
4. 📸 Upload real product images
5. 📝 Update product descriptions
6. 🧪 Test the complete purchase flow
7. 🚀 Launch your store!

### For Developers
1. Review SETUP.md for technical details
2. Configure environment variables
3. Test all features thoroughly
4. Implement additional admin features
5. Add email notifications
6. Set up monitoring and analytics

## Congratulations! 🎉

Your organic store is ready to serve health-conscious customers. Start by registering as the first user to get admin access, then explore all the features!

**Happy Selling! 🌿**
