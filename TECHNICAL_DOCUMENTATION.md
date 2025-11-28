# Technical Documentation - Customer Experience Enhancements

## Overview

This document provides technical details about the Customer Experience Enhancement features implemented in Phase 1 (Database & API) and Phase 2 (UI Components).

---

## Phase 1: Database & API Layer

### Database Schema

#### 1. Wishlists Table
```sql
CREATE TABLE wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id, variant_id)
);
```

**Purpose**: Store user wishlist items  
**Key Features**:
- Unique constraint prevents duplicate entries
- Cascade delete when user or product is deleted
- Optional variant_id for specific product variants

#### 2. Product Reviews Table
```sql
CREATE TABLE product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  rating review_rating NOT NULL,
  comment text NOT NULL,
  verified_purchase boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TYPE review_rating AS ENUM ('1', '2', '3', '4', '5');
```

**Purpose**: Store product reviews and ratings  
**Key Features**:
- Rating enum ensures valid values (1-5)
- Verified purchase flag for confirmed buyers
- Timestamps for creation and updates

#### 3. Loyalty Points Table
```sql
CREATE TABLE loyalty_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  points integer NOT NULL DEFAULT 0,
  transaction_type points_transaction_type NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  description text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TYPE points_transaction_type AS ENUM ('earned', 'redeemed', 'expired', 'bonus');
```

**Purpose**: Track loyalty points transactions  
**Key Features**:
- Transaction types for different point activities
- Expiration date for points
- Optional order reference
- Description for transaction details

#### 4. Notifications Table
```sql
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TYPE notification_type AS ENUM ('order', 'loyalty', 'promotion', 'system');
```

**Purpose**: Store user notifications  
**Key Features**:
- Type categorization for filtering
- Read/unread status
- Title and message content

#### 5. Chat System Tables
```sql
CREATE TABLE chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status chat_status DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TYPE chat_status AS ENUM ('active', 'closed');
```

**Purpose**: Enable real-time customer support chat  
**Key Features**:
- Conversation management with status
- Message threading
- Read/unread tracking
- Timestamps for message ordering

### RPC Functions

#### 1. Get User Points Balance
```sql
CREATE OR REPLACE FUNCTION get_user_points_balance(p_user_id uuid)
RETURNS integer AS $$
  SELECT COALESCE(SUM(
    CASE 
      WHEN transaction_type = 'earned' OR transaction_type = 'bonus' THEN points
      WHEN transaction_type = 'redeemed' OR transaction_type = 'expired' THEN -points
      ELSE 0
    END
  ), 0)::integer
  FROM loyalty_points
  WHERE user_id = p_user_id
    AND (expires_at IS NULL OR expires_at > now());
$$ LANGUAGE sql STABLE;
```

**Purpose**: Calculate current points balance  
**Logic**: Sum earned/bonus points, subtract redeemed/expired points

#### 2. Get Expiring Points
```sql
CREATE OR REPLACE FUNCTION get_expiring_points(p_user_id uuid, p_days integer DEFAULT 30)
RETURNS integer AS $$
  SELECT COALESCE(SUM(points), 0)::integer
  FROM loyalty_points
  WHERE user_id = p_user_id
    AND transaction_type IN ('earned', 'bonus')
    AND expires_at IS NOT NULL
    AND expires_at > now()
    AND expires_at <= now() + (p_days || ' days')::interval;
$$ LANGUAGE sql STABLE;
```

**Purpose**: Get points expiring within specified days  
**Default**: 30 days

#### 3. Get Unread Notifications Count
```sql
CREATE OR REPLACE FUNCTION get_unread_notifications_count(p_user_id uuid)
RETURNS integer AS $$
  SELECT COUNT(*)::integer
  FROM notifications
  WHERE user_id = p_user_id AND read = false;
$$ LANGUAGE sql STABLE;
```

**Purpose**: Count unread notifications for badge display

#### 4. Get Unread Messages Count
```sql
CREATE OR REPLACE FUNCTION get_unread_messages_count(p_user_id uuid)
RETURNS integer AS $$
  SELECT COUNT(*)::integer
  FROM chat_messages cm
  JOIN chat_conversations cc ON cm.conversation_id = cc.id
  WHERE cc.user_id = p_user_id
    AND cm.sender_id != p_user_id
    AND cm.read = false;
$$ LANGUAGE sql STABLE;
```

**Purpose**: Count unread chat messages for badge display

### API Layer

#### File: `src/db/api.ts`

All database operations are encapsulated in API modules:

1. **wishlistApi**: Wishlist CRUD operations
2. **reviewsApi**: Product reviews management
3. **loyaltyPointsApi**: Points transactions and balance
4. **notificationsApi**: Notification management
5. **chatApi**: Chat conversations and messages

#### Error Handling Pattern
```typescript
return Array.isArray(data) ? data : [];
```
All queries return empty arrays on error, never null.

#### Null Safety Pattern
```typescript
item.field?.length;
item.title || 'Untitled';
```
All field accesses use optional chaining and default values.

---

## Phase 2: UI Components

### Component Architecture

#### 1. Wishlist Components

**WishlistButton.tsx**
- Location: `src/components/wishlist/`
- Props: `productId`, `variantId?`, `size?`, `showText?`
- Features:
  - Toggle wishlist status
  - Real-time UI updates
  - Toast notifications
  - Heart icon animation

**Wishlist.tsx**
- Location: `src/pages/`
- Features:
  - Grid layout of wishlist items
  - Remove individual items
  - Clear all functionality
  - Empty state handling
  - Loading skeletons

#### 2. Review Components

**StarRating.tsx**
- Location: `src/components/reviews/`
- Props: `rating`, `size?`, `showCount?`, `count?`
- Features:
  - Display star ratings
  - Partial star support
  - Configurable size
  - Optional review count

**StarRatingInput.tsx**
- Location: `src/components/reviews/`
- Props: `value`, `onChange`, `size?`
- Features:
  - Interactive star selection
  - Hover preview
  - Click to select
  - Keyboard accessible

**ReviewForm.tsx**
- Location: `src/components/reviews/`
- Props: `productId`, `onSuccess?`
- Features:
  - Star rating input
  - Comment textarea
  - Form validation
  - Submit handling
  - Success callback

**ReviewCard.tsx**
- Location: `src/components/reviews/`
- Props: `review`
- Features:
  - Display review details
  - Star rating
  - Verified badge
  - Formatted date
  - User information

**ReviewsList.tsx**
- Location: `src/components/reviews/`
- Props: `productId`
- Features:
  - List all reviews
  - Filter by rating
  - Sort options
  - Write review button
  - Pagination ready

#### 3. Loyalty Points Components

**PointsBalance.tsx**
- Location: `src/components/loyalty/`
- Features:
  - Display total points
  - Show discount value
  - Expiring points alert
  - Three stat cards
  - Real-time updates

**PointsHistory.tsx**
- Location: `src/components/loyalty/`
- Features:
  - Transaction history table
  - Type filtering
  - Color-coded types
  - Date formatting
  - Responsive design

**RedeemPoints.tsx**
- Location: `src/components/loyalty/`
- Props: `orderTotal`, `onPointsApplied`
- Features:
  - Points input field
  - Validation (min 100, max 50%)
  - Discount calculation
  - Apply/remove points
  - Error handling

**LoyaltyPoints.tsx**
- Location: `src/pages/`
- Features:
  - Combined points view
  - Balance display
  - History table
  - Responsive layout

#### 4. Notification Components

**NotificationBell.tsx**
- Location: `src/components/notifications/`
- Features:
  - Bell icon with badge
  - Unread count
  - Dropdown menu
  - Recent notifications
  - View all link
  - Mark all as read

**NotificationsList.tsx**
- Location: `src/components/notifications/`
- Features:
  - Full notification list
  - Type indicators
  - Mark as read
  - Clear all
  - Empty state
  - Loading state

**Notifications.tsx**
- Location: `src/pages/`
- Features:
  - Full page view
  - All notifications
  - Management actions

#### 5. Chat Components

**ChatWidget.tsx**
- Location: `src/components/chat/`
- Features:
  - Floating chat button
  - Unread badge
  - Toggle chat window
  - Fixed position
  - Z-index management

**ChatWindow.tsx**
- Location: `src/components/chat/`
- Features:
  - Message list
  - Send message form
  - Real-time updates
  - Auto-scroll
  - Message timestamps
  - Sender identification

**ChatManagement.tsx**
- Location: `src/pages/admin/`
- Features:
  - Conversation list
  - Select conversation
  - View messages
  - Send responses
  - Unread indicators
  - Admin interface

### Integration Points

#### Header Component
Updated to include:
- Wishlist icon with count
- Notification bell with dropdown
- Points balance display
- Responsive layout

#### App.tsx
Added:
- ChatWidget component (global)
- Available on all pages

#### ProductDetail Page
Integrated:
- WishlistButton in header
- ReviewsList section
- Separator for visual clarity

#### Home Page
Integrated:
- WishlistButton on product cards
- Positioned top-right
- Conditional rendering (logged in only)

#### AdminDashboard
Added:
- Chat Support tab
- ChatManagement component

#### Routes Configuration
New routes:
- `/wishlist` - Wishlist page
- `/loyalty-points` - Loyalty points page
- `/notifications` - Notifications page
- `/admin/chat` - Chat management (admin only)

### State Management

#### Real-time Updates
Components use polling for real-time updates:
- Chat messages: 3-second interval
- Notifications: On bell click
- Points balance: On page load

#### Loading States
All components implement:
- Skeleton loaders
- Loading indicators
- Disabled states during operations

#### Error Handling
Consistent error handling:
- Toast notifications
- User-friendly messages
- Fallback UI states

### Styling

#### Design System
- Uses shadcn/ui components
- Tailwind CSS utilities
- Consistent spacing
- Responsive breakpoints

#### Color Coding
- Notifications: Type-based colors
- Points: Transaction type colors
- Chat: Sender identification
- Reviews: Star ratings

#### Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Grid layouts adapt
- Touch-friendly targets

---

## Testing

### Manual Testing Checklist

#### Wishlist
- ✅ Add to wishlist
- ✅ Remove from wishlist
- ✅ View wishlist page
- ✅ Clear all items
- ✅ Navigate to product details

#### Reviews
- ✅ Write review
- ✅ View reviews
- ✅ Filter by rating
- ✅ Sort reviews
- ✅ Verified badge display

#### Loyalty Points
- ✅ View balance
- ✅ View history
- ✅ Redeem points
- ✅ Validation rules
- ✅ Expiring points alert

#### Notifications
- ✅ View notifications
- ✅ Mark as read
- ✅ Clear all
- ✅ Unread count
- ✅ Type filtering

#### Chat
- ✅ Send message
- ✅ Receive message
- ✅ Unread count
- ✅ Admin response
- ✅ Real-time updates

### Linting
All code passes TypeScript and ESLint checks:
```bash
npm run lint
```
Result: 0 errors, 0 warnings

---

## Performance Considerations

### Database Queries
- Indexed foreign keys
- Efficient RPC functions
- Pagination ready
- Optimized joins

### Component Rendering
- Memoization where needed
- Lazy loading
- Skeleton loaders
- Debounced inputs

### Real-time Updates
- Polling intervals optimized
- Conditional fetching
- Cache management
- Error recovery

---

## Security

### Row Level Security (RLS)
All tables have RLS policies:
- Users can only access their own data
- Admins have full access
- Public read for product reviews

### Input Validation
- Client-side validation
- Server-side constraints
- SQL injection prevention
- XSS protection

### Authentication
- Supabase Auth integration
- Protected routes
- Session management
- Secure token handling

---

## Future Enhancements

### Potential Improvements
1. **Real-time Subscriptions**: Replace polling with Supabase real-time
2. **Push Notifications**: Browser push for important updates
3. **Email Notifications**: Send email for order updates
4. **Advanced Analytics**: Track user engagement
5. **Review Moderation**: Admin approval workflow
6. **Points Tiers**: VIP levels based on points
7. **Chat Attachments**: Image/file sharing
8. **Notification Preferences**: User-configurable settings

### Scalability
- Database indexing strategy
- Caching layer (Redis)
- CDN for static assets
- Load balancing
- Database replication

---

## Deployment

### Environment Variables
Required in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Build Process
```bash
npm run build
```

### Database Migrations
All migrations in `supabase/migrations/`:
1. `20240101000001_create_wishlists.sql`
2. `20240101000002_create_product_reviews.sql`
3. `20240101000003_create_loyalty_points.sql`
4. `20240101000004_create_notifications.sql`
5. `20240101000005_create_chat_system.sql`

Apply migrations in order using Supabase CLI or dashboard.

---

## Maintenance

### Regular Tasks
1. **Monitor Chat**: Respond to customer queries
2. **Review Moderation**: Check for inappropriate content
3. **Points Expiry**: Notify users of expiring points
4. **Database Cleanup**: Archive old notifications
5. **Performance Monitoring**: Track query performance

### Backup Strategy
- Daily database backups
- Point-in-time recovery
- Migration version control
- Code repository backups

---

## Support

### For Developers
- Review this documentation
- Check component comments
- Follow established patterns
- Test thoroughly before deployment

### For Admins
- Refer to USER_GUIDE.md
- Use admin dashboard
- Monitor chat support
- Track customer feedback

---

## Changelog

### Phase 2 (Current)
- ✅ All UI components implemented
- ✅ Full integration complete
- ✅ Testing passed
- ✅ Documentation created

### Phase 1
- ✅ Database schema created
- ✅ API layer implemented
- ✅ RPC functions added
- ✅ Type definitions updated

---

## License

This project is proprietary software for Srilaya Enterprises.

---

**Last Updated**: 2025-11-26  
**Version**: 2.0.0  
**Status**: Production Ready
