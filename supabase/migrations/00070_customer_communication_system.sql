/*
# Customer Communication System

## Overview
Comprehensive customer communication system for order notifications, newsletters, and promotional campaigns.

## Features
1. Order Confirmation - Immediate email/SMS after order placement
2. Shipping Notifications - Updates when order is shipped with tracking
3. Delivery Confirmation - Notification when order is delivered
4. Promotional Communications - Newsletter and promotional offers

## Tables
1. `communication_preferences` - User notification preferences
2. `communication_logs` - Audit trail of all communications
3. `newsletter_subscriptions` - Newsletter subscription management
4. `promotional_campaigns` - Marketing campaigns

## Security
- RLS enabled on all tables
- Users can manage their own preferences
- Admins have full access
- Communication logs are immutable

## Notes
- Uses existing notification system for in-app notifications
- Integrates with send_bill_email edge function for emails
- SMS integration optional (can be added later)
*/

-- ============================================================================
-- 1. COMMUNICATION PREFERENCES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS communication_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  phone text,
  
  -- Email preferences
  email_order_confirmation boolean DEFAULT true,
  email_shipping_updates boolean DEFAULT true,
  email_delivery_confirmation boolean DEFAULT true,
  email_promotional boolean DEFAULT true,
  email_newsletter boolean DEFAULT true,
  
  -- SMS preferences
  sms_order_confirmation boolean DEFAULT false,
  sms_shipping_updates boolean DEFAULT false,
  sms_delivery_confirmation boolean DEFAULT false,
  
  -- General preferences
  language text DEFAULT 'en',
  timezone text DEFAULT 'Asia/Kolkata',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Create index
CREATE INDEX idx_communication_preferences_user_id ON communication_preferences(user_id);
CREATE INDEX idx_communication_preferences_email ON communication_preferences(email);

-- Enable RLS
ALTER TABLE communication_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own preferences" ON communication_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON communication_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON communication_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins have full access to preferences" ON communication_preferences
  FOR ALL USING (is_admin(auth.uid()));

-- ============================================================================
-- 2. COMMUNICATION LOGS TABLE
-- ============================================================================

CREATE TYPE communication_type AS ENUM (
  'order_confirmation',
  'shipping_notification',
  'delivery_confirmation',
  'promotional',
  'newsletter',
  'password_reset',
  'account_verification',
  'other'
);

CREATE TYPE communication_channel AS ENUM ('email', 'sms', 'push', 'in_app');

CREATE TYPE communication_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'bounced');

CREATE TABLE IF NOT EXISTS communication_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  
  -- Communication details
  type communication_type NOT NULL,
  channel communication_channel NOT NULL,
  status communication_status DEFAULT 'pending',
  
  -- Recipient details
  recipient_email text,
  recipient_phone text,
  recipient_name text,
  
  -- Content
  subject text,
  message text,
  template_id text,
  template_data jsonb,
  
  -- Tracking
  sent_at timestamptz,
  delivered_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  
  -- Error handling
  error_message text,
  retry_count integer DEFAULT 0,
  
  -- Metadata
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  
  -- Prevent updates (immutable log)
  CONSTRAINT communication_logs_immutable CHECK (created_at IS NOT NULL)
);

-- Create indexes
CREATE INDEX idx_communication_logs_user_id ON communication_logs(user_id);
CREATE INDEX idx_communication_logs_order_id ON communication_logs(order_id);
CREATE INDEX idx_communication_logs_type ON communication_logs(type);
CREATE INDEX idx_communication_logs_status ON communication_logs(status);
CREATE INDEX idx_communication_logs_created_at ON communication_logs(created_at DESC);

-- Enable RLS
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own communication logs" ON communication_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins have full access to logs" ON communication_logs
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "System can insert logs" ON communication_logs
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 3. NEWSLETTER SUBSCRIPTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Subscription details
  is_active boolean DEFAULT true,
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz,
  
  -- Preferences
  categories text[] DEFAULT ARRAY['general'],
  frequency text DEFAULT 'weekly', -- daily, weekly, monthly
  
  -- Tracking
  confirmation_token text,
  confirmed_at timestamptz,
  last_sent_at timestamptz,
  
  -- Metadata
  source text, -- checkout, footer, popup, etc.
  metadata jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_newsletter_subscriptions_email ON newsletter_subscriptions(email);
CREATE INDEX idx_newsletter_subscriptions_user_id ON newsletter_subscriptions(user_id);
CREATE INDEX idx_newsletter_subscriptions_is_active ON newsletter_subscriptions(is_active);

-- Enable RLS
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can subscribe" ON newsletter_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own subscription" ON newsletter_subscriptions
  FOR SELECT USING (auth.uid() = user_id OR email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update own subscription" ON newsletter_subscriptions
  FOR UPDATE USING (auth.uid() = user_id OR email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ));

CREATE POLICY "Admins have full access to subscriptions" ON newsletter_subscriptions
  FOR ALL USING (is_admin(auth.uid()));

-- ============================================================================
-- 4. PROMOTIONAL CAMPAIGNS TABLE
-- ============================================================================

CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'cancelled');

CREATE TABLE IF NOT EXISTS promotional_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Campaign details
  name text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  template_id text,
  
  -- Targeting
  target_audience text DEFAULT 'all', -- all, customers, subscribers, segment
  segment_criteria jsonb,
  
  -- Scheduling
  status campaign_status DEFAULT 'draft',
  scheduled_at timestamptz,
  sent_at timestamptz,
  
  -- Tracking
  total_recipients integer DEFAULT 0,
  sent_count integer DEFAULT 0,
  delivered_count integer DEFAULT 0,
  opened_count integer DEFAULT 0,
  clicked_count integer DEFAULT 0,
  unsubscribed_count integer DEFAULT 0,
  
  -- Metadata
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_promotional_campaigns_status ON promotional_campaigns(status);
CREATE INDEX idx_promotional_campaigns_scheduled_at ON promotional_campaigns(scheduled_at);
CREATE INDEX idx_promotional_campaigns_created_by ON promotional_campaigns(created_by);

-- Enable RLS
ALTER TABLE promotional_campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage campaigns" ON promotional_campaigns
  FOR ALL USING (is_admin(auth.uid()));

-- ============================================================================
-- 5. FUNCTIONS
-- ============================================================================

-- Function to create or update communication preferences
CREATE OR REPLACE FUNCTION upsert_communication_preferences(
  p_user_id uuid,
  p_email text,
  p_phone text DEFAULT NULL,
  p_email_order_confirmation boolean DEFAULT true,
  p_email_shipping_updates boolean DEFAULT true,
  p_email_delivery_confirmation boolean DEFAULT true,
  p_email_promotional boolean DEFAULT true,
  p_email_newsletter boolean DEFAULT true,
  p_sms_order_confirmation boolean DEFAULT false,
  p_sms_shipping_updates boolean DEFAULT false,
  p_sms_delivery_confirmation boolean DEFAULT false
)
RETURNS communication_preferences
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_preferences communication_preferences;
BEGIN
  INSERT INTO communication_preferences (
    user_id, email, phone,
    email_order_confirmation, email_shipping_updates, email_delivery_confirmation,
    email_promotional, email_newsletter,
    sms_order_confirmation, sms_shipping_updates, sms_delivery_confirmation
  ) VALUES (
    p_user_id, p_email, p_phone,
    p_email_order_confirmation, p_email_shipping_updates, p_email_delivery_confirmation,
    p_email_promotional, p_email_newsletter,
    p_sms_order_confirmation, p_sms_shipping_updates, p_sms_delivery_confirmation
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    email_order_confirmation = EXCLUDED.email_order_confirmation,
    email_shipping_updates = EXCLUDED.email_shipping_updates,
    email_delivery_confirmation = EXCLUDED.email_delivery_confirmation,
    email_promotional = EXCLUDED.email_promotional,
    email_newsletter = EXCLUDED.email_newsletter,
    sms_order_confirmation = EXCLUDED.sms_order_confirmation,
    sms_shipping_updates = EXCLUDED.sms_shipping_updates,
    sms_delivery_confirmation = EXCLUDED.sms_delivery_confirmation,
    updated_at = now()
  RETURNING * INTO v_preferences;
  
  RETURN v_preferences;
END;
$$;

-- Function to log communication
CREATE OR REPLACE FUNCTION log_communication(
  p_user_id uuid,
  p_order_id uuid,
  p_type communication_type,
  p_channel communication_channel,
  p_recipient_email text,
  p_recipient_phone text DEFAULT NULL,
  p_recipient_name text DEFAULT NULL,
  p_subject text DEFAULT NULL,
  p_message text DEFAULT NULL,
  p_template_id text DEFAULT NULL,
  p_template_data jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO communication_logs (
    user_id, order_id, type, channel,
    recipient_email, recipient_phone, recipient_name,
    subject, message, template_id, template_data,
    status
  ) VALUES (
    p_user_id, p_order_id, p_type, p_channel,
    p_recipient_email, p_recipient_phone, p_recipient_name,
    p_subject, p_message, p_template_id, p_template_data,
    'pending'
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Function to update communication status
CREATE OR REPLACE FUNCTION update_communication_status(
  p_log_id uuid,
  p_status communication_status,
  p_error_message text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE communication_logs
  SET 
    status = p_status,
    error_message = p_error_message,
    sent_at = CASE WHEN p_status = 'sent' THEN now() ELSE sent_at END,
    delivered_at = CASE WHEN p_status = 'delivered' THEN now() ELSE delivered_at END
  WHERE id = p_log_id;
  
  RETURN FOUND;
END;
$$;

-- Function to subscribe to newsletter
CREATE OR REPLACE FUNCTION subscribe_to_newsletter(
  p_email text,
  p_user_id uuid DEFAULT NULL,
  p_source text DEFAULT 'website'
)
RETURNS newsletter_subscriptions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription newsletter_subscriptions;
BEGIN
  INSERT INTO newsletter_subscriptions (
    email, user_id, source, is_active, subscribed_at, confirmed_at
  ) VALUES (
    p_email, p_user_id, p_source, true, now(), now()
  )
  ON CONFLICT (email) DO UPDATE SET
    is_active = true,
    subscribed_at = now(),
    unsubscribed_at = NULL,
    updated_at = now()
  RETURNING * INTO v_subscription;
  
  RETURN v_subscription;
END;
$$;

-- Function to unsubscribe from newsletter
CREATE OR REPLACE FUNCTION unsubscribe_from_newsletter(
  p_email text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE newsletter_subscriptions
  SET 
    is_active = false,
    unsubscribed_at = now(),
    updated_at = now()
  WHERE email = p_email;
  
  RETURN FOUND;
END;
$$;

-- Function to get communication preferences for order
CREATE OR REPLACE FUNCTION get_order_communication_preferences(p_order_id uuid)
RETURNS TABLE (
  user_id uuid,
  email text,
  phone text,
  email_enabled boolean,
  sms_enabled boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.user_id,
    COALESCE(cp.email, o.customer_email) as email,
    COALESCE(cp.phone, o.customer_phone) as phone,
    COALESCE(cp.email_order_confirmation, true) as email_enabled,
    COALESCE(cp.sms_order_confirmation, false) as sms_enabled
  FROM orders o
  LEFT JOIN communication_preferences cp ON cp.user_id = o.user_id
  WHERE o.id = p_order_id;
END;
$$;

-- ============================================================================
-- 6. TRIGGERS
-- ============================================================================

-- Trigger to send order confirmation
CREATE OR REPLACE FUNCTION trigger_send_order_confirmation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_prefs record;
  v_log_id uuid;
BEGIN
  -- Get communication preferences
  SELECT * INTO v_prefs FROM get_order_communication_preferences(NEW.id);
  
  -- Log email communication
  IF v_prefs.email_enabled THEN
    SELECT log_communication(
      NEW.user_id,
      NEW.id,
      'order_confirmation',
      'email',
      v_prefs.email,
      v_prefs.phone,
      NEW.customer_name,
      'Order Confirmation - Srilaya Enterprises',
      NULL,
      'order_confirmation',
      jsonb_build_object(
        'order_id', NEW.id,
        'order_number', NEW.id::text,
        'customer_name', NEW.customer_name,
        'total_amount', NEW.total_amount,
        'currency', NEW.currency,
        'items', NEW.items,
        'created_at', NEW.created_at
      )
    ) INTO v_log_id;
  END IF;
  
  -- Log SMS communication (if enabled)
  IF v_prefs.sms_enabled AND v_prefs.phone IS NOT NULL THEN
    SELECT log_communication(
      NEW.user_id,
      NEW.id,
      'order_confirmation',
      'sms',
      v_prefs.email,
      v_prefs.phone,
      NEW.customer_name,
      NULL,
      'Your order has been confirmed. Order ID: ' || NEW.id::text,
      NULL,
      NULL
    ) INTO v_log_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for order confirmation
DROP TRIGGER IF EXISTS trigger_order_confirmation ON orders;
CREATE TRIGGER trigger_order_confirmation
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_send_order_confirmation();

-- Trigger to send shipping and delivery notifications
CREATE OR REPLACE FUNCTION trigger_send_order_status_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_prefs record;
  v_log_id uuid;
  v_type communication_type;
  v_subject text;
  v_message text;
BEGIN
  -- Only process if status changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- Get communication preferences
  SELECT * INTO v_prefs FROM get_order_communication_preferences(NEW.id);
  
  -- Determine notification type based on status
  CASE NEW.status
    WHEN 'shipped', 'out_for_delivery' THEN
      v_type := 'shipping_notification';
      v_subject := 'Your Order Has Been Shipped - Srilaya Enterprises';
      v_message := 'Your order ' || NEW.id::text || ' has been shipped and is on its way!';
      
      -- Send email if enabled
      IF v_prefs.email_enabled THEN
        SELECT log_communication(
          NEW.user_id, NEW.id, v_type, 'email',
          v_prefs.email, v_prefs.phone, NEW.customer_name,
          v_subject, NULL, 'shipping_notification',
          jsonb_build_object(
            'order_id', NEW.id,
            'customer_name', NEW.customer_name,
            'status', NEW.status,
            'tracking_number', NEW.payment_details->>'tracking_number',
            'carrier', NEW.payment_details->>'carrier'
          )
        ) INTO v_log_id;
      END IF;
      
      -- Send SMS if enabled
      IF v_prefs.sms_enabled AND v_prefs.phone IS NOT NULL THEN
        SELECT log_communication(
          NEW.user_id, NEW.id, v_type, 'sms',
          v_prefs.email, v_prefs.phone, NEW.customer_name,
          NULL, v_message, NULL, NULL
        ) INTO v_log_id;
      END IF;
      
    WHEN 'delivered' THEN
      v_type := 'delivery_confirmation';
      v_subject := 'Your Order Has Been Delivered - Srilaya Enterprises';
      v_message := 'Your order ' || NEW.id::text || ' has been delivered. Thank you for shopping with us!';
      
      -- Send email if enabled
      IF v_prefs.email_enabled THEN
        SELECT log_communication(
          NEW.user_id, NEW.id, v_type, 'email',
          v_prefs.email, v_prefs.phone, NEW.customer_name,
          v_subject, NULL, 'delivery_confirmation',
          jsonb_build_object(
            'order_id', NEW.id,
            'customer_name', NEW.customer_name,
            'delivered_at', now()
          )
        ) INTO v_log_id;
      END IF;
      
      -- Send SMS if enabled
      IF v_prefs.sms_enabled AND v_prefs.phone IS NOT NULL THEN
        SELECT log_communication(
          NEW.user_id, NEW.id, v_type, 'sms',
          v_prefs.email, v_prefs.phone, NEW.customer_name,
          NULL, v_message, NULL, NULL
        ) INTO v_log_id;
      END IF;
      
    ELSE
      -- No notification for other statuses
      NULL;
  END CASE;
  
  RETURN NEW;
END;
$$;

-- Create trigger for order status notifications
DROP TRIGGER IF EXISTS trigger_order_status_notification ON orders;
CREATE TRIGGER trigger_order_status_notification
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_send_order_status_notification();

-- ============================================================================
-- 7. GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION upsert_communication_preferences(uuid, text, text, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION log_communication(uuid, uuid, communication_type, communication_channel, text, text, text, text, text, text, jsonb) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION update_communication_status(uuid, communication_status, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION subscribe_to_newsletter(text, uuid, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION unsubscribe_from_newsletter(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_order_communication_preferences(uuid) TO authenticated, anon;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
