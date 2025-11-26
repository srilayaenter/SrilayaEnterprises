# Srilaya Enterprises Organic Store - Setup Guide

## Overview
A complete e-commerce platform for selling organic products including millets, rice, flakes, sugar, honey, and laddus. Built with React, TypeScript, Supabase, and Stripe.

## Features Implemented

### Customer Features
- ✅ Product browsing with category filters
- ✅ Product search functionality
- ✅ Detailed product pages with multiple packaging options
- ✅ Shopping cart with quantity management
- ✅ Secure checkout with Stripe payment integration
- ✅ Order history and tracking
- ✅ User authentication (login/register)
- ✅ Responsive design for all devices

### Admin Features
- ✅ Admin dashboard
- ✅ Product management (view products)
- ✅ Order management (view all orders)
- ✅ Customer management (view all customers)
- ✅ First registered user automatically becomes admin

### Technical Features
- ✅ Supabase backend with PostgreSQL database
- ✅ Row Level Security (RLS) policies
- ✅ Stripe payment processing via Edge Functions
- ✅ Real-time authentication state management
- ✅ Persistent shopping cart (localStorage)
- ✅ Toast notifications for user feedback
- ✅ Loading states and error handling

## Required Configuration

### Stripe Payment Setup

**CRITICAL**: To enable payment functionality, you must configure your Stripe secret key:

1. **Get your Stripe API key:**
   - Go to https://dashboard.stripe.com/apikeys
   - Copy your "Secret key" (starts with `sk_test_` for test mode or `sk_live_` for production)

2. **Add the key to your Supabase project:**
   - The key needs to be added as an environment secret named `STRIPE_SECRET_KEY`
   - Contact your system administrator or use the Supabase dashboard to add this secret

3. **Test the payment flow:**
   - Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date and any 3-digit CVC

## Database Structure

### Tables Created
- **profiles**: User accounts and roles
- **products**: Product catalog with categories
- **product_variants**: Different packaging sizes and prices
- **orders**: Customer orders and payment status

### Product Data
The database includes 40 real products from your inventory:
- **6 Rice varieties**: Parboiled, Mapillai Samba, Poongar, Tooyamalli, Karupukavuni, White Ponni
- **10 Flour products**: Foxtail, Little, Browntop, Barnyard, Ragi, Natty Pearl, Pearl, Sorghum, Proso, Millet
- **7 Flakes**: Foxtail, Little, Kodo, Barnyard, Ragi, Pearl, Sorghum
- **11 Millets**: Foxtail Rice, Little Rice, Kodo Rice, Barnyard Rice, Browntop Rice, Proso Rice, Ragi, Native Pearl, Pearl, Sorghum (White & Red)
- **6 Honey varieties**: Cave Black, Siru, Kombu, Honey & Fig, Honey & Amla, Rose Petals

### Packaging Options
- **Rice, Flour, Flakes, Millets**: 1kg, 2kg, 5kg, 10kg
- **Honey**: 250g, 500g, 1kg

### Pricing
- All prices in **Indian Rupees (₹)**
- Prices based on your provided spreadsheet
- Proportional pricing for different package sizes

## User Roles

### Admin Access
- The **first user to register** automatically becomes an admin
- Admins can access the admin dashboard at `/admin`
- Admins can view all products, orders, and customers

### Regular Users
- Can browse and purchase products
- Can view their own order history
- Can manage their shopping cart

## Design System

### Color Palette
- **Primary (Green)**: #4CAF50 - Represents organic and natural
- **Secondary (Brown)**: #8D6E63 - Earthy and warm
- **Accent (Orange)**: #FF9800 - Call-to-action elements
- **Background (Cream)**: #FFF8E1 - Soft and inviting

### Typography
- Clean sans-serif fonts for readability
- Gradient text effects for headings
- Consistent spacing and hierarchy

## Payment Flow

1. **Add to Cart**: Users select products and packaging sizes
2. **Checkout**: Click "Proceed to Checkout" in cart
3. **Stripe Payment**: Opens Stripe checkout in new tab
4. **Payment Processing**: Secure payment via Stripe
5. **Verification**: Automatic payment verification
6. **Order Completion**: Order status updated to "completed"
7. **Confirmation**: User redirected to success page

## API Endpoints

### Edge Functions
- `create_stripe_checkout`: Creates Stripe payment session
- `verify_stripe_payment`: Verifies payment completion

## Security Features

- Row Level Security (RLS) on all tables
- Admin-only access to product/order management
- Secure payment processing via Stripe
- JWT-based authentication
- Protected API routes

## Known Limitations

1. **Admin CRUD**: Basic admin dashboard created, full CRUD operations need expansion
2. **Product Images**: Using placeholder images, real images need to be uploaded
3. **Inventory Management**: Stock tracking implemented but needs admin UI
4. **Email Notifications**: Not implemented (can be added via Supabase triggers)

## Next Steps for Production

1. **Configure Stripe Key**: Add your production Stripe secret key
2. **Upload Product Images**: Replace placeholder images with real product photos
3. **Test Payment Flow**: Complete end-to-end payment testing
4. **Expand Admin Panel**: Add full CRUD operations for products
5. **Add Email Notifications**: Set up order confirmation emails
6. **Configure Domain**: Set up custom domain and SSL
7. **Performance Testing**: Test with real user load

## Support

For issues or questions:
- Check the TODO.md file for implementation status
- Review the database schema in the migration files
- Test with Stripe test cards before going live

## Important Notes

⚠️ **Before going live:**
- Switch to Stripe production keys
- Test all payment flows thoroughly
- Review and adjust product pricing
- Update product images and descriptions
- Configure email notifications
- Set up proper error monitoring

✅ **What's working:**
- User authentication and registration
- Product browsing and search
- Shopping cart functionality
- Stripe payment integration (with key configured)
- Order tracking
- Admin role assignment
- Responsive design

🔧 **What needs configuration:**
- STRIPE_SECRET_KEY environment variable
- Product images (currently placeholders)
- Email notification system (optional)
- Advanced admin features (optional)
