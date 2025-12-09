# Srilaya Enterprises Organic Store - Comprehensive Requirements Document

## 1. Website Overview

### 1.1 Website Name
**Srilaya Enterprises Organic Store**

### 1.2 Website Description
An e-commerce platform dedicated to selling organic products including millets, rice, flakes, sugar, honey, and laddus. The website targets health-conscious individuals and families seeking ready-to-cook organic items with convenient packaging options.

### 1.3 Target Audience
- Health-conscious individuals
- Families looking for organic food options
- Local organic food buyers
- Customers seeking ready-to-cook essential items
- Age group: 25-55 years
- Geographic focus: Local and regional customers

### 1.4 Business Model
- B2C (Business to Consumer) e-commerce
- Direct sales of organic products
- Online ordering with home delivery

---

## 2. Product Categories and Specifications

### 2.1 Product Categories
1. **Millets** (Foxtail, Pearl, Finger, Little, Kodo, Barnyard, Proso, Browntop)
2. **Rice** (Brown Rice, Red Rice, Black Rice, White Organic Rice)
3. **Flakes** (Rice Flakes, Wheat Flakes, Corn Flakes, Ragi Flakes)
4. **Sugar** (Jaggery Powder, Palm Sugar, Coconut Sugar, Organic Brown Sugar)
5. **Honey** (Raw Honey, Forest Honey, Multi-flora Honey)
6. **Laddus** (Ragi Laddu, Dry Fruit Laddu, Sesame Laddu, Besan Laddu)

### 2.2 Packaging Options
- **Standard categories** (Millets, Rice, Flakes, Sugar, Laddus): 1kg, 2kg, 5kg, 10kg
- **Honey**: 200g, 500g, 1kg
- **Laddus**: May also include piece-based packaging (6 pieces, 12 pieces)

### 2.3 Product Attributes
Each product must include:
- Product ID (unique identifier)
- Product Name
- Category
- Description (detailed, highlighting organic certification and benefits)
- Price per packaging option
- Available packaging sizes
- Stock quantity per size
- Product images (minimum 3 images: main, detail, packaging)
- Nutritional information
- Organic certification details
- Shelf life
- Storage instructions
- Country of origin
- SKU (Stock Keeping Unit)
- Weight/Volume
- Featured/New arrival flag
- Discount percentage (if applicable)
- Average rating
- Number of reviews

---

## 3. System Modules

### 3.1 User Authentication & Authorization Module

#### 3.1.1 User Roles
1. **Customer**
   - Browse products
   - Add to cart
   - Place orders
   - View order history
   - Manage profile
   - Write reviews

2. **Admin**
   - Full system access
   - Product management
   - Order management
   - Customer management
   - Inventory management
   - View analytics and reports

#### 3.1.2 Authentication Features
- User registration with email verification
- Login with email and password
- Password strength validation
- "Remember me" functionality
- Password reset/recovery via email
- Logout functionality
- Session management
- Account activation

#### 3.1.3 User Profile Management
- Personal information (Name, Email, Phone)
- Multiple delivery addresses
- Default address selection
- Profile picture upload
- Change password
- Account deletion request

---

### 3.2 Product Catalog Module

#### 3.2.1 Product Listing
- Grid view with product cards
- Product image, name, price, rating
- "Add to Cart" button
- "Quick View" option
- Pagination (20 products per page)
- Sort options:
  - Price: Low to High
  - Price: High to Low
  - Newest First
  - Best Selling
  - Top Rated

#### 3.2.2 Product Filtering
- Filter by category
- Filter by price range (slider)
- Filter by packaging size
- Filter by availability (In Stock/Out of Stock)
- Filter by rating (4+ stars, 3+ stars, etc.)
- Filter by discount availability
- Clear all filters option

#### 3.2.3 Product Search
- Search bar in header (always visible)
- Search by product name
- Search by category
- Auto-suggestions while typing
- Search results page with filters
- "No results found" message with suggestions

#### 3.2.4 Product Detail Page
- Product image gallery (3-5 images, zoomable)
- Product name and category
- Price display (with discount if applicable)
- Packaging size selector (dropdown or buttons)
- Quantity selector (+ and - buttons)
- Stock availability indicator
- "Add to Cart" button
- "Buy Now" button (direct checkout)
- Product description (expandable)
- Nutritional information (expandable)
- Organic certification details
- Customer reviews and ratings section
- Related products section
- Breadcrumb navigation

---

### 3.3 Shopping Cart Module

#### 3.3.1 Cart Features
- Add products to cart
- Update product quantity
- Remove products from cart
- Select packaging size
- Cart item count badge in header
- Cart persistence (logged-in users)
- Session-based cart (guest users)
- Cart summary:
  - Subtotal
  - Discount (if applicable)
  - Delivery charges
  - Total amount

#### 3.3.2 Cart Validations
- Stock availability check
- Maximum quantity limit per product
- Minimum order value check
- Price recalculation on quantity change
- Out-of-stock item notification

#### 3.3.3 Cart Page
- List of cart items with:
  - Product image
  - Product name
  - Selected packaging size
  - Unit price
  - Quantity selector
  - Subtotal
  - Remove button
- "Continue Shopping" button
- "Proceed to Checkout" button
- Empty cart message with "Browse Products" link

---

### 3.4 Checkout & Order Module

#### 3.4.1 Checkout Process
**Step 1: Delivery Address**
- Select from saved addresses
- Add new address form:
  - Full name
  - Phone number
  - Address line 1
  - Address line 2 (optional)
  - City
  - State
  - PIN code
  - Address type (Home/Office)
- Set as default address option

**Step 2: Order Summary**
- Review cart items
- Edit cart option
- Apply coupon/promo code
- View price breakdown:
  - Subtotal
  - Discount
  - Delivery charges (free above certain amount)
  - Tax (if applicable)
  - Total amount

**Step 3: Payment**
- Payment method selection:
  - Credit/Debit Card
  - UPI
  - Net Banking
  - Cash on Delivery (COD)
- Secure payment gateway integration
- Order confirmation

#### 3.4.2 Order Management
**Order Status Workflow:**
1. Order Placed
2. Payment Confirmed
3. Processing
4. Packed
5. Shipped
6. Out for Delivery
7. Delivered
8. Cancelled (if applicable)
9. Returned (if applicable)

**Order Details:**
- Order ID (unique)
- Order date and time
- Customer details
- Delivery address
- Order items (product, quantity, size, price)
- Payment method
- Payment status
- Order status
- Tracking information
- Estimated delivery date
- Invoice download option

#### 3.4.3 Order History (Customer)
- List of all orders (most recent first)
- Order card showing:
  - Order ID
  - Order date
  - Total amount
  - Order status
  - "View Details" button
  - "Track Order" button
  - "Reorder" button
  - "Cancel Order" button (if applicable)
  - "Return Order" button (if applicable)

#### 3.4.4 Order Tracking
- Real-time order status updates
- Timeline view of order progress
- Estimated delivery date
- Courier partner details (if shipped)
- Tracking number

---

### 3.5 Payment Module

#### 3.5.1 Payment Gateway Integration
- Secure payment processing
- Support for multiple payment methods:
  - Credit/Debit Cards (Visa, Mastercard, RuPay)
  - UPI (Google Pay, PhonePe, Paytm)
  - Net Banking
  - Digital Wallets
  - Cash on Delivery

#### 3.5.2 Payment Flow
1. User selects payment method
2. Redirect to payment gateway (for online payments)
3. User completes payment
4. Payment confirmation
5. Order confirmation email/SMS
6. Redirect to order success page

#### 3.5.3 Payment Status
- Success
- Failed
- Pending
- Refunded

#### 3.5.4 Payment Security
- SSL certificate for secure transactions
- PCI DSS compliance
- No storage of card details
- Encrypted payment data

---

### 3.6 Admin Dashboard Module

#### 3.6.1 Dashboard Overview
- Total sales (today, this week, this month)
- Total orders (pending, processing, completed)
- Total customers
- Total products
- Low stock alerts
- Recent orders list
- Sales chart (daily/weekly/monthly)
- Top-selling products
- Revenue analytics

#### 3.6.2 Product Management
**Product List:**
- Table view with columns:
  - Product image
  - Product name
  - Category
  - Price
  - Stock
  - Status (Active/Inactive)
  - Actions (Edit, Delete, View)
- Search products
- Filter by category, status
- Bulk actions (delete, activate, deactivate)
- Export to CSV

**Add/Edit Product:**
- Product information form:
  - Product name
  - Category (dropdown)
  - Description (rich text editor)
  - Price per packaging size
  - Stock quantity per size
  - SKU
  - Weight
  - Organic certification details
  - Nutritional information
  - Storage instructions
  - Shelf life
- Image upload (multiple images)
- Packaging options management
- Featured product toggle
- Active/Inactive status
- Save and publish

**Category Management:**
- Add/Edit/Delete categories
- Category image upload
- Category description
- Active/Inactive status

#### 3.6.3 Order Management
**Order List:**
- Table view with columns:
  - Order ID
  - Customer name
  - Order date
  - Total amount
  - Payment status
  - Order status
  - Actions (View, Update Status, Invoice)
- Search orders (by ID, customer name, date)
- Filter by status, payment method, date range
- Export to CSV

**Order Details:**
- Customer information
- Delivery address
- Order items with details
- Payment information
- Order timeline
- Update order status
- Add tracking information
- Print invoice
- Cancel order
- Process refund

#### 3.6.4 Customer Management
**Customer List:**
- Table view with columns:
  - Customer name
  - Email
  - Phone
  - Registration date
  - Total orders
  - Total spent
  - Status (Active/Blocked)
  - Actions (View, Block/Unblock)
- Search customers
- Filter by registration date, status
- Export to CSV

**Customer Details:**
- Personal information
- Order history
- Total orders and revenue
- Saved addresses
- Account status management

#### 3.6.5 Inventory Management
- Stock level monitoring
- Low stock alerts (below threshold)
- Out of stock notifications
- Stock update functionality
- Stock history log
- Bulk stock update

#### 3.6.6 Reports & Analytics
- Sales report (daily, weekly, monthly, yearly)
- Revenue report
- Product performance report
- Customer acquisition report
- Order status report
- Payment method report
- Category-wise sales report
- Export reports to PDF/CSV
- Date range filter
- Visual charts and graphs

#### 3.6.7 Discount & Coupon Management
**Coupon List:**
- Table view with coupon details
- Add/Edit/Delete coupons

**Coupon Details:**
- Coupon code
- Discount type (percentage, fixed amount)
- Discount value
- Minimum order value
- Maximum discount amount
- Valid from date
- Valid to date
- Usage limit (total and per user)
- Active/Inactive status

#### 3.6.8 Settings
- Website settings (name, logo, contact info)
- Delivery charges configuration
- Minimum order value
- Tax settings
- Email templates
- Payment gateway configuration
- Admin user management

---

### 3.7 Review & Rating Module

#### 3.7.1 Customer Reviews
- Customers can review purchased products
- Rating (1-5 stars)
- Review title
- Review description
- Review date
- Verified purchase badge
- Helpful/Not helpful voting

#### 3.7.2 Review Management (Admin)
- Approve/Reject reviews
- Delete inappropriate reviews
- Respond to reviews

#### 3.7.3 Product Rating Display
- Average rating on product card
- Rating distribution (5 stars: X%, 4 stars: Y%, etc.)
- Total number of reviews
- Filter reviews by rating

---

### 3.8 Notification Module

#### 3.8.1 Email Notifications
**Customer Emails:**
- Welcome email (registration)
- Email verification
- Password reset
- Order confirmation
- Order status updates
- Delivery confirmation
- Review request
- Promotional emails

**Admin Emails:**
- New order notification
- Low stock alert
- New customer registration

#### 3.8.2 SMS Notifications (Optional)
- Order confirmation
- Order shipped
- Out for delivery
- Delivered

---

### 3.9 Content Management Module

#### 3.9.1 Static Pages
- About Us
- Contact Us
- Privacy Policy
- Terms & Conditions
- Shipping & Delivery Policy
- Return & Refund Policy
- FAQ

#### 3.9.2 Contact Form
- Name
- Email
- Phone
- Subject
- Message
- Submit button
- Email notification to admin

---

## 4. User Interface Specifications

### 4.1 Page Structure

#### 4.1.1 Header (All Pages)
- Logo (left side, clickable to home)
- Search bar (center)
- Navigation menu:
  - Home
  - Products (dropdown with categories)
  - About Us
  - Contact Us
- User account icon (dropdown):
  - Login/Register (if not logged in)
  - My Profile
  - My Orders
  - Logout (if logged in)
- Cart icon with item count badge

#### 4.1.2 Footer (All Pages)
- Company information
- Quick links (About, Contact, FAQ, etc.)
- Product categories
- Contact details (phone, email, address)
- Social media links
- Newsletter subscription
- Payment method icons
- Copyright notice: "2025 Srilaya Enterprises Organic Store"

#### 4.1.3 Homepage
- Hero banner (carousel with promotional images)
- Category cards (6 categories with images)
- Featured products section
- New arrivals section
- Best sellers section
- Why choose us section (organic, quality, delivery)
- Customer testimonials
- Newsletter subscription

#### 4.1.4 Product Listing Page
- Breadcrumb navigation
- Page title
- Filter sidebar (left)
- Product grid (right)
- Sort dropdown
- Pagination

#### 4.1.5 Product Detail Page
- Breadcrumb navigation
- Product image gallery (left)
- Product information (right)
- Product description tabs
- Related products section

#### 4.1.6 Cart Page
- Page title
- Cart items list
- Cart summary (right sidebar)
- Continue shopping button
- Proceed to checkout button

#### 4.1.7 Checkout Page
- Progress indicator (Address → Summary → Payment)
- Step content
- Order summary sidebar

#### 4.1.8 User Account Pages
- Sidebar navigation:
  - Dashboard
  - My Profile
  - My Orders
  - Addresses
  - Change Password
- Main content area

#### 4.1.9 Admin Dashboard
- Sidebar navigation (collapsible)
- Top bar with admin name and logout
- Main content area
- Breadcrumb navigation

### 4.2 Responsive Design

#### 4.2.1 Desktop (1920px, 1366px, 1440px)
- Multi-column layouts
- Sidebar navigation
- Hover effects
- Dropdown menus

#### 4.2.2 Tablet (768px - 1024px)
- Adjusted grid layouts
- Collapsible sidebar
- Touch-friendly buttons

#### 4.2.3 Mobile (375px - 430px)
- Single column layout
- Hamburger menu
- Bottom navigation (optional)
- Sticky header
- Mobile-optimized forms

---

## 5. Design System

### 5.1 Color Palette

#### 5.1.1 Primary Colors
- **Fresh Green**: #4CAF50 (buttons, links, highlights)
- **Earthy Brown**: #8D6E63 (headings, accents)

#### 5.1.2 Secondary Colors
- **Soft Cream**: #FFF8E1 (backgrounds, cards)
- **Warm Orange**: #FF9800 (call-to-action, badges)

#### 5.1.3 Neutral Colors
- **White**: #FFFFFF (backgrounds)
- **Light Gray**: #F5F5F5 (section backgrounds)
- **Medium Gray**: #9E9E9E (borders, disabled states)
- **Dark Gray**: #424242 (body text)
- **Black**: #212121 (headings)

#### 5.1.4 Semantic Colors
- **Success**: #4CAF50 (success messages, in stock)
- **Warning**: #FF9800 (warnings, low stock)
- **Error**: #F44336 (error messages, out of stock)
- **Info**: #2196F3 (information messages)

### 5.2 Typography

#### 5.2.1 Font Family
- **Primary**: Inter, system-ui, sans-serif
- **Headings**: Poppins, sans-serif (optional for more personality)

#### 5.2.2 Font Sizes
- **H1**: 2.5rem (40px) - Page titles
- **H2**: 2rem (32px) - Section headings
- **H3**: 1.5rem (24px) - Card titles
- **H4**: 1.25rem (20px) - Subsections
- **Body**: 1rem (16px) - Regular text
- **Small**: 0.875rem (14px) - Captions, labels
- **Tiny**: 0.75rem (12px) - Helper text

#### 5.2.3 Font Weights
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

### 5.3 Spacing System
- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **2xl**: 3rem (48px)
- **3xl**: 4rem (64px)

### 5.4 Component Styles

#### 5.4.1 Buttons
- **Primary Button**:
  - Background: Fresh Green (#4CAF50)
  - Text: White
  - Padding: 12px 24px
  - Border radius: 8px
  - Hover: Darken 10%
  - Transition: 0.3s ease

- **Secondary Button**:
  - Background: Transparent
  - Border: 2px solid Fresh Green
  - Text: Fresh Green
  - Padding: 12px 24px
  - Border radius: 8px
  - Hover: Background Fresh Green, Text White

- **Danger Button**:
  - Background: Error (#F44336)
  - Text: White
  - Padding: 12px 24px
  - Border radius: 8px

#### 5.4.2 Cards
- Background: White
- Border: 1px solid #E0E0E0
- Border radius: 8px
- Box shadow: 0 2px 8px rgba(0,0,0,0.1)
- Padding: 16px
- Hover: Box shadow: 0 4px 12px rgba(0,0,0,0.15)
- Transition: 0.3s ease

#### 5.4.3 Forms
- **Input Fields**:
  - Border: 1px solid #E0E0E0
  - Border radius: 8px
  - Padding: 12px 16px
  - Focus: Border color Fresh Green, box shadow
  - Error: Border color Error red

- **Labels**:
  - Font size: 14px
  - Font weight: 500
  - Color: Dark Gray
  - Margin bottom: 8px

- **Error Messages**:
  - Font size: 12px
  - Color: Error red
  - Margin top: 4px

#### 5.4.4 Navigation
- **Header**:
  - Background: White
  - Box shadow: 0 2px 4px rgba(0,0,0,0.1)
  - Height: 80px
  - Sticky on scroll

- **Footer**:
  - Background: Earthy Brown (#8D6E63)
  - Text: White
  - Padding: 48px 0

### 5.5 Icons
- Use Lucide React icon library
- Icon size: 20px (default), 24px (large)
- Icon color: Inherit from parent or Fresh Green for highlights

### 5.6 Images
- Product images: 1:1 aspect ratio (square)
- Banner images: 16:9 aspect ratio
- Category images: 4:3 aspect ratio
- Image optimization: WebP format, lazy loading

---

## 6. Technical Specifications

### 6.1 Technology Stack

#### 6.1.1 Frontend
- **Framework**: React 18+
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Routing**: React Router v6
- **State Management**: React Context + Hooks
- **Form Handling**: React Hook Form
- **Form Validation**: Zod
- **HTTP Client**: Fetch API / Axios

#### 6.1.2 Backend
- **Platform**: Supabase
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for product images)
- **Edge Functions**: Supabase Edge Functions (for payment processing)

#### 6.1.3 Payment Gateway
- Razorpay / Stripe / PayU (to be decided)

### 6.2 Database Schema

#### 6.2.1 Tables

**users** (managed by Supabase Auth)
- id (uuid, primary key)
- email (text, unique)
- created_at (timestamp)

**profiles**
- id (uuid, primary key, references users.id)
- full_name (text)
- phone (text)
- avatar_url (text)
- created_at (timestamp)
- updated_at (timestamp)

**categories**
- id (uuid, primary key)
- name (text, unique)
- slug (text, unique)
- description (text)
- image_url (text)
- is_active (boolean, default true)
- created_at (timestamp)
- updated_at (timestamp)

**products**
- id (uuid, primary key)
- category_id (uuid, references categories.id)
- name (text)
- slug (text, unique)
- description (text)
- nutritional_info (text)
- certification_details (text)
- storage_instructions (text)
- shelf_life (text)
- country_of_origin (text)
- is_featured (boolean, default false)
- is_active (boolean, default true)
- average_rating (decimal, default 0)
- total_reviews (integer, default 0)
- created_at (timestamp)
- updated_at (timestamp)

**product_images**
- id (uuid, primary key)
- product_id (uuid, references products.id)
- image_url (text)
- is_primary (boolean, default false)
- display_order (integer)
- created_at (timestamp)

**product_variants**
- id (uuid, primary key)
- product_id (uuid, references products.id)
- size (text) -- e.g., "1kg", "500g"
- sku (text, unique)
- price (decimal)
- stock_quantity (integer)
- is_available (boolean, default true)
- created_at (timestamp)
- updated_at (timestamp)

**addresses**
- id (uuid, primary key)
- user_id (uuid, references users.id)
- full_name (text)
- phone (text)
- address_line1 (text)
- address_line2 (text)
- city (text)
- state (text)
- pin_code (text)
- address_type (text) -- 'home' or 'office'
- is_default (boolean, default false)
- created_at (timestamp)
- updated_at (timestamp)

**orders**
- id (uuid, primary key)
- order_number (text, unique)
- user_id (uuid, references users.id)
- address_id (uuid, references addresses.id)
- subtotal (decimal)
- discount_amount (decimal, default 0)
- delivery_charges (decimal, default 0)
- tax_amount (decimal, default 0)
- total_amount (decimal)
- payment_method (text) -- 'card', 'upi', 'netbanking', 'cod'
- payment_status (text) -- 'pending', 'completed', 'failed', 'refunded'
- order_status (text) -- 'placed', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'
- tracking_number (text)
- estimated_delivery_date (date)
- notes (text)
- created_at (timestamp)
- updated_at (timestamp)

**order_items**
- id (uuid, primary key)
- order_id (uuid, references orders.id)
- product_id (uuid, references products.id)
- variant_id (uuid, references product_variants.id)
- product_name (text)
- variant_size (text)
- quantity (integer)
- unit_price (decimal)
- subtotal (decimal)
- created_at (timestamp)

**reviews**
- id (uuid, primary key)
- product_id (uuid, references products.id)
- user_id (uuid, references users.id)
- order_id (uuid, references orders.id)
- rating (integer) -- 1 to 5
- title (text)
- comment (text)
- is_verified_purchase (boolean, default true)
- is_approved (boolean, default false)
- helpful_count (integer, default 0)
- created_at (timestamp)
- updated_at (timestamp)

**coupons**
- id (uuid, primary key)
- code (text, unique)
- discount_type (text) -- 'percentage' or 'fixed'
- discount_value (decimal)
- min_order_value (decimal)
- max_discount_amount (decimal)
- usage_limit (integer)
- used_count (integer, default 0)
- valid_from (timestamp)
- valid_to (timestamp)
- is_active (boolean, default true)
- created_at (timestamp)
- updated_at (timestamp)

**admin_users**
- id (uuid, primary key, references users.id)
- role (text) -- 'admin' or 'super_admin'
- created_at (timestamp)

### 6.3 API Endpoints (Supabase)

All database operations will be handled through Supabase client with Row Level Security (RLS) policies.

**Key RLS Policies:**
- Users can only view/edit their own profile
- Users can only view/edit their own orders and addresses
- Products and categories are publicly readable
- Only admins can create/update/delete products, categories, and manage orders
- Reviews require authentication to create

### 6.4 Security Requirements

#### 6.4.1 Authentication Security
- Password minimum length: 8 characters
- Password must contain: uppercase, lowercase, number, special character
- Email verification required
- Session timeout: 7 days
- Secure password reset flow

#### 6.4.2 Data Security
- HTTPS only
- SQL injection prevention (Supabase handles this)
- XSS prevention (sanitize user inputs)
- CSRF protection
- Row Level Security (RLS) enabled on all tables

#### 6.4.3 Payment Security
- PCI DSS compliant payment gateway
- No storage of card details
- Encrypted payment data transmission
- 3D Secure authentication

### 6.5 Performance Requirements

#### 6.5.1 Page Load Time
- Homepage: < 2 seconds
- Product listing: < 2 seconds
- Product detail: < 1.5 seconds
- Checkout: < 2 seconds

#### 6.5.2 Optimization
- Image lazy loading
- Code splitting
- Minification and compression
- CDN for static assets
- Database query optimization
- Caching strategy

### 6.6 Browser Support
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 7. Business Rules

### 7.1 Pricing Rules
- All prices are in INR (₹)
- Prices include all taxes
- Discounts are applied before delivery charges
- Delivery charges: Free for orders above ₹500, otherwise ₹50

### 7.2 Order Rules
- Minimum order value: ₹200
- Maximum quantity per product: 10 units
- Order cancellation allowed before "Packed" status
- Return window: 7 days from delivery (for damaged/wrong items only)

### 7.3 Stock Rules
- Low stock threshold: 10 units
- Out of stock products cannot be added to cart
- Stock is reserved when order is placed
- Stock is released if payment fails or order is cancelled

### 7.4 Discount Rules
- Only one coupon per order
- Coupons cannot be combined with other offers
- Coupon validation at checkout
- Expired coupons are automatically deactivated

### 7.5 Review Rules
- Only verified purchasers can review
- One review per product per user
- Reviews require admin approval before display
- Minimum rating: 1 star, Maximum: 5 stars

---

## 8. Marketing & Promotional Features

### 8.1 Discount Programs
- Seasonal sales (festival offers)
- First-time buyer discount
- Bulk purchase discounts
- Referral discounts

### 8.2 Loyalty Program (Future Enhancement)
- Points on every purchase
- Redeem points for discounts
- Tier-based benefits

### 8.3 Email Marketing
- Newsletter subscription
- Promotional emails
- Abandoned cart emails
- Product recommendation emails

### 8.4 Social Media Integration
- Share products on social media
- Social media login (future)
- Instagram feed integration

---

## 9. Analytics & Reporting

### 9.1 Admin Analytics
- Daily/Weekly/Monthly sales reports
- Revenue trends
- Product performance
- Customer acquisition metrics
- Order fulfillment metrics
- Inventory turnover

### 9.2 Customer Analytics
- Order history
- Total spending
- Favorite products
- Saved items

---

## 10. Future Enhancements

### 10.1 Phase 2 Features
- Wishlist functionality
- Product comparison
- Live chat support
- Mobile app (iOS/Android)
- Multi-language support
- Multi-currency support

### 10.2 Phase 3 Features
- Subscription boxes
- Recipe suggestions
- Blog/Content section
- Loyalty program
- Affiliate program
- Wholesale ordering

---

## 11. Testing Requirements

### 11.1 Functional Testing
- User registration and login
- Product browsing and search
- Add to cart and checkout
- Payment processing
- Order management
- Admin functionalities

### 11.2 Usability Testing
- Navigation ease
- Form usability
- Mobile responsiveness
- Accessibility (WCAG 2.1 Level AA)

### 11.3 Performance Testing
- Load testing (concurrent users)
- Stress testing
- Page load speed testing

### 11.4 Security Testing
- Penetration testing
- Vulnerability assessment
- Authentication testing
- Authorization testing

---

## 12. Deployment & Maintenance

### 12.1 Deployment
- Hosting: Vercel / Netlify
- Database: Supabase (cloud-hosted)
- Domain: Custom domain with SSL
- CI/CD pipeline

### 12.2 Maintenance
- Regular security updates
- Database backups (daily)
- Performance monitoring
- Bug fixes and improvements
- Content updates

### 12.3 Support
- Customer support email
- FAQ section
- Contact form
- Response time: 24-48 hours

---

## 13. Success Metrics

### 13.1 Key Performance Indicators (KPIs)
- Monthly active users
- Conversion rate (visitors to customers)
- Average order value
- Customer retention rate
- Cart abandonment rate
- Customer satisfaction score
- Net Promoter Score (NPS)

### 13.2 Sales Targets
- Month 1-3: ₹50,000 - ₹1,00,000
- Month 4-6: ₹1,00,000 - ₹2,00,000
- Month 7-12: ₹2,00,000 - ₹5,00,000

---

## 14. Compliance & Legal

### 14.1 Legal Pages
- Privacy Policy (GDPR compliant)
- Terms & Conditions
- Shipping & Delivery Policy
- Return & Refund Policy
- Cookie Policy

### 14.2 Certifications
- Display organic certifications
- FSSAI license (if applicable)
- GST registration details

### 14.3 Data Protection
- User data encryption
- Secure data storage
- Data retention policy
- Right to data deletion

---

## 15. Content Requirements

### 15.1 Product Content
- High-quality product images (minimum 1000x1000px)
- Detailed product descriptions (100-200 words)
- Accurate nutritional information
- Clear packaging size information
- Organic certification details

### 15.2 Marketing Content
- Compelling homepage banners
- Category descriptions
- About Us story
- Customer testimonials
- Blog posts (future)

### 15.3 SEO Content
- Meta titles and descriptions for all pages
- Alt text for all images
- Structured data markup
- XML sitemap
- Robots.txt

---

## 16. Accessibility Requirements

### 16.1 WCAG 2.1 Level AA Compliance
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast (4.5:1 for text)
- Resizable text (up to 200%)
- Focus indicators
- Alt text for images
- Form labels and error messages
- Skip navigation links

---

## 17. Localization (Future)

### 17.1 Language Support
- English (default)
- Hindi (future)
- Regional languages (future)

### 17.2 Currency Support
- INR (default)
- USD (future for international orders)

---

## 18. Customer Support

### 18.1 Support Channels
- Email support
- Contact form
- Phone support (business hours)
- FAQ section
- Live chat (future)

### 18.2 Support Topics
- Order tracking
- Payment issues
- Product inquiries
- Returns and refunds
- Account management
- Technical issues

---

## 19. Backup & Recovery

### 19.1 Backup Strategy
- Database backups: Daily automated backups
- Image backups: Cloud storage with redundancy
- Code repository: Git version control
- Backup retention: 30 days

### 19.2 Disaster Recovery
- Recovery Time Objective (RTO): 4 hours
- Recovery Point Objective (RPO): 24 hours
- Backup restoration testing: Monthly

---

## 20. Project Timeline (Estimated)

### 20.1 Phase 1: Core E-commerce (8-10 weeks)
- Week 1-2: Design system and UI components
- Week 3-4: Product catalog and search
- Week 5-6: Shopping cart and checkout
- Week 7-8: User authentication and profile
- Week 9-10: Payment integration and testing

### 20.2 Phase 2: Admin Dashboard (4-6 weeks)
- Week 11-12: Product and category management
- Week 13-14: Order management
- Week 15-16: Analytics and reports

### 20.3 Phase 3: Additional Features (4-6 weeks)
- Week 17-18: Reviews and ratings
- Week 19-20: Coupons and discounts
- Week 21-22: Email notifications and final testing

### 20.4 Phase 4: Launch (2 weeks)
- Week 23: User acceptance testing
- Week 24: Deployment and launch

---

## Appendix A: Glossary

- **SKU**: Stock Keeping Unit - unique identifier for each product variant
- **RLS**: Row Level Security - database security feature
- **COD**: Cash on Delivery
- **UPI**: Unified Payments Interface
- **WCAG**: Web Content Accessibility Guidelines
- **SEO**: Search Engine Optimization
- **KPI**: Key Performance Indicator
- **RTO**: Recovery Time Objective
- **RPO**: Recovery Point Objective

---

## Appendix B: References

- Supabase Documentation: https://supabase.com/docs
- React Documentation: https://react.dev
- Tailwind CSS Documentation: https://tailwindcss.com
- shadcn/ui Documentation: https://ui.shadcn.com
- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/

---

**Document Version**: 2.0  
**Last Updated**: 2025-11-26  
**Prepared By**: Miaoda AI Assistant  
**Status**: Comprehensive Requirements Document

---

## Document Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Initial | Initial requirements document | User |
| 2.0 | 2025-11-26 | Comprehensive update with all modules, technical specs, and detailed requirements | Miaoda |

