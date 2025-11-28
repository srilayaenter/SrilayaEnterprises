/*
# Create Notifications System

## Purpose
Send in-app notifications to users for orders, promotions, points, and products.

## Tables Created

### notifications
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles) - Who receives the notification
- `type` (enum) - order, promotion, points, product, system
- `title` (text) - Notification title
- `message` (text) - Notification message
- `link` (text, optional) - Link to related page
- `read` (boolean) - Has user read this?
- `created_at` (timestamptz)

## Notification Types
- **order**: Order status updates
- **promotion**: Special offers and promotions
- **points**: Points earned or expiring
- **product**: New products or restocks
- **system**: System announcements

## Security
- Enable RLS on notifications table
- Users can only view their own notifications
- Users can mark their own notifications as read
- Admins can create notifications for any user
- Admins have full access

## Indexes
- user_id for user-based queries
- read status for filtering
- created_at for sorting

## Notes
- Notifications are soft-deleted (marked as read, not deleted)
- Unread count is calculated on-the-fly
- Consider adding push notification integration later
*/

-- Create notification type enum
CREATE TYPE notification_type AS ENUM (
  'order',
  'promotion',
  'points',
  'product',
  'system'
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_type ON notifications(type);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Admins can create notifications
CREATE POLICY "Admins can create notifications" ON notifications
  FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));

-- Admins have full access
CREATE POLICY "Admins have full access to notifications" ON notifications
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type notification_type,
  p_title text,
  p_message text,
  p_link text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    link
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_link
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread count for user
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  unread_count integer;
BEGIN
  SELECT COUNT(*)
  INTO unread_count
  FROM notifications
  WHERE user_id = p_user_id
    AND read = false;
  
  RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE notifications
  SET read = true
  WHERE user_id = p_user_id
    AND read = false;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send notification to all users
CREATE OR REPLACE FUNCTION broadcast_notification(
  p_type notification_type,
  p_title text,
  p_message text,
  p_link text DEFAULT NULL
)
RETURNS integer AS $$
DECLARE
  notification_count integer := 0;
  user_record RECORD;
BEGIN
  -- Create notification for each user
  FOR user_record IN
    SELECT id FROM profiles
  LOOP
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      link
    ) VALUES (
      user_record.id,
      p_type,
      p_title,
      p_message,
      p_link
    );
    
    notification_count := notification_count + 1;
  END LOOP;
  
  RETURN notification_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create notification when order status changes
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM create_notification(
      NEW.user_id,
      'order'::notification_type,
      'Order Status Updated',
      'Your order #' || NEW.id || ' status changed to ' || NEW.status,
      '/orders'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER order_status_notification
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_order_status_change();

-- Trigger to create notification when points are earned
CREATE OR REPLACE FUNCTION notify_points_earned()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify for earned points
  IF NEW.transaction_type = 'earned' AND NEW.points > 0 THEN
    PERFORM create_notification(
      NEW.user_id,
      'points'::notification_type,
      'Points Earned!',
      'You earned ' || NEW.points || ' loyalty points!',
      '/loyalty-points'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER points_earned_notification
  AFTER INSERT ON loyalty_points
  FOR EACH ROW
  WHEN (NEW.transaction_type = 'earned')
  EXECUTE FUNCTION notify_points_earned();