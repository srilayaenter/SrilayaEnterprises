# Srilaya Enterprises - Quick Reference Card

## 🎯 Store Overview
**40 Products** | **154 Variants** | **Indian Rupees (₹)**

## 📦 Product Breakdown

| Category | Products | Variants | Price Range |
|----------|----------|----------|-------------|
| Rice | 6 | 24 | ₹74.81 - ₹190.31/kg |
| Flour | 10 | 40 | ₹56.44 - ₹87.94/kg |
| Flakes | 7 | 28 | ₹89.25 - ₹147.00/kg |
| Millets | 11 | 44 | ₹49.88 - ₹133.88/kg |
| Honey | 6 | 18 | ₹872.81 - ₹1004.06/kg |

## 🔑 Admin Access
**First registered user becomes admin automatically**

### Admin Features:
- View all products
- View all orders
- View all customers
- Manage inventory

## 💳 Payment Setup
**Status:** ⚠️ Requires Configuration

### To Enable Payments:
1. Go to Supabase Dashboard
2. Navigate to Project Settings → Edge Functions
3. Add secret: `STRIPE_SECRET_KEY`
4. Value: Your Stripe secret key (starts with `sk_`)

### Test Payments:
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

## 🌐 Supabase Details
- **Endpoint:** `asktiecxlfidjmqonlwa.supabase.co`
- **Region:** US East
- **Database:** PostgreSQL with RLS enabled

## 📊 Database Tables
- `profiles` - User accounts and roles
- `products` - Product catalog (40 items)
- `product_variants` - Packaging options (154 variants)
- `orders` - Customer orders

## 🎨 Design Theme
- **Primary Color:** Fresh Green (#4CAF50)
- **Secondary Color:** Earthy Brown (#8D6E63)
- **Accent:** Warm Orange (#FF9800)
- **Background:** Soft Cream (#FFF8E1)

## 📱 Key Pages
- `/` - Home (Product Catalog)
- `/login` - User Login
- `/register` - User Registration
- `/products/:id` - Product Details
- `/cart` - Shopping Cart
- `/orders` - Order History
- `/payment-success` - Payment Confirmation
- `/admin` - Admin Dashboard

## 🔄 Packaging Options

### Standard (Rice, Flour, Flakes, Millets):
- 1kg, 2kg, 5kg, 10kg

### Honey:
- 250g, 500g, 1kg

## 📈 Stock Levels
- **Small/Medium packages:** 100 units each
- **Large packages (10kg):** 50 units each
- **Honey (1kg):** 50 units each

## ⚡ Quick Commands

### Check Products:
```sql
SELECT category, COUNT(*) FROM products GROUP BY category;
```

### View Orders:
```sql
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;
```

### Check Stock:
```sql
SELECT p.name, pv.packaging_size, pv.stock 
FROM products p 
JOIN product_variants pv ON p.id = pv.product_id 
WHERE pv.stock < 20;
```

## 🚀 Next Steps
1. ✅ Products loaded with correct pricing
2. ✅ Currency changed to INR (₹)
3. ⚠️ Configure Stripe secret key
4. ⚠️ Upload product images
5. ⚠️ Test complete purchase flow
6. ⚠️ Add real product photos

## 📞 Support Resources
- **SETUP.md** - Technical setup guide
- **USER_GUIDE.md** - Complete user manual
- **PRODUCT_UPDATE_SUMMARY.md** - Detailed product list
- **PROJECT_SUMMARY.md** - Project overview

## 🎯 Success Metrics
- ✅ 40 products from your inventory
- ✅ 154 product variants created
- ✅ All prices in Indian Rupees
- ✅ Stripe payment integration ready
- ✅ User authentication working
- ✅ Admin dashboard functional
- ✅ Order tracking system active

---

**Store Status:** 🟢 READY FOR USE

*Configure Stripe key and upload images to go live!*
