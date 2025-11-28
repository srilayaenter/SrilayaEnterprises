/*
# Create Live Chat Support System

## Purpose
Enable real-time chat communication between customers and support staff.

## Tables Created

### chat_conversations
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles) - Customer
- `status` (enum) - open, closed
- `last_message_at` (timestamptz) - Last message timestamp
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### chat_messages
- `id` (uuid, primary key)
- `conversation_id` (uuid, references chat_conversations)
- `sender_id` (uuid, references profiles) - Who sent the message
- `message` (text) - Message content
- `read` (boolean) - Has recipient read this?
- `created_at` (timestamptz)

## Chat Flow
1. User opens chat widget
2. System creates or retrieves conversation
3. User sends message
4. Admin sees message in chat dashboard
5. Admin responds
6. User sees response in real-time
7. Conversation can be closed by admin

## Security
- Enable RLS on both tables
- Users can view their own conversations
- Users can send messages in their conversations
- Admins can view all conversations
- Admins can send messages in any conversation
- Admins can close conversations

## Indexes
- user_id for user-based queries
- conversation_id for message queries
- status for filtering open/closed chats
- created_at for sorting

## Notes
- Consider implementing real-time updates with Supabase Realtime
- Messages are never deleted, only conversations can be closed
- Unread count helps admins prioritize responses
*/

-- Create conversation status enum
CREATE TYPE conversation_status AS ENUM (
  'open',
  'closed'
);

-- Create chat_conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status conversation_status DEFAULT 'open' NOT NULL,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES chat_conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_chat_conversations_user ON chat_conversations(user_id);
CREATE INDEX idx_chat_conversations_status ON chat_conversations(status);
CREATE INDEX idx_chat_conversations_last_message ON chat_conversations(last_message_at);
CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at);
CREATE INDEX idx_chat_messages_read ON chat_messages(read);

-- Create trigger for updated_at
CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own conversations
CREATE POLICY "Users can view own conversations" ON chat_conversations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Users can create their own conversations
CREATE POLICY "Users can create own conversations" ON chat_conversations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can view messages in their conversations
CREATE POLICY "Users can view own messages" ON chat_messages
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

-- Users can send messages in their conversations
CREATE POLICY "Users can send messages" ON chat_messages
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

-- Users can mark messages as read
CREATE POLICY "Users can mark messages read" ON chat_messages
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

-- Admins have full access to conversations
CREATE POLICY "Admins have full access to conversations" ON chat_conversations
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Admins have full access to messages
CREATE POLICY "Admins have full access to messages" ON chat_messages
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Function to get or create conversation for user
CREATE OR REPLACE FUNCTION get_or_create_conversation(p_user_id uuid)
RETURNS uuid AS $$
DECLARE
  conversation_id uuid;
BEGIN
  -- Try to find existing open conversation
  SELECT id INTO conversation_id
  FROM chat_conversations
  WHERE user_id = p_user_id
    AND status = 'open'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If no open conversation exists, create one
  IF conversation_id IS NULL THEN
    INSERT INTO chat_conversations (user_id)
    VALUES (p_user_id)
    RETURNING id INTO conversation_id;
  END IF;
  
  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send message
CREATE OR REPLACE FUNCTION send_chat_message(
  p_conversation_id uuid,
  p_sender_id uuid,
  p_message text
)
RETURNS uuid AS $$
DECLARE
  message_id uuid;
BEGIN
  -- Insert message
  INSERT INTO chat_messages (
    conversation_id,
    sender_id,
    message
  ) VALUES (
    p_conversation_id,
    p_sender_id,
    p_message
  ) RETURNING id INTO message_id;
  
  -- Update conversation's last_message_at
  UPDATE chat_conversations
  SET last_message_at = now()
  WHERE id = p_conversation_id;
  
  RETURN message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread message count for conversation
CREATE OR REPLACE FUNCTION get_unread_message_count(
  p_conversation_id uuid,
  p_user_id uuid
)
RETURNS integer AS $$
DECLARE
  unread_count integer;
BEGIN
  SELECT COUNT(*)
  INTO unread_count
  FROM chat_messages
  WHERE conversation_id = p_conversation_id
    AND sender_id != p_user_id
    AND read = false;
  
  RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark conversation messages as read
CREATE OR REPLACE FUNCTION mark_conversation_read(
  p_conversation_id uuid,
  p_user_id uuid
)
RETURNS integer AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE chat_messages
  SET read = true
  WHERE conversation_id = p_conversation_id
    AND sender_id != p_user_id
    AND read = false;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to close conversation
CREATE OR REPLACE FUNCTION close_conversation(p_conversation_id uuid)
RETURNS boolean AS $$
BEGIN
  UPDATE chat_conversations
  SET status = 'closed'
  WHERE id = p_conversation_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reopen conversation
CREATE OR REPLACE FUNCTION reopen_conversation(p_conversation_id uuid)
RETURNS boolean AS $$
BEGIN
  UPDATE chat_conversations
  SET status = 'open'
  WHERE id = p_conversation_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin's open conversations count
CREATE OR REPLACE FUNCTION get_open_conversations_count()
RETURNS integer AS $$
DECLARE
  open_count integer;
BEGIN
  SELECT COUNT(*)
  INTO open_count
  FROM chat_conversations
  WHERE status = 'open';
  
  RETURN COALESCE(open_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get conversations with unread messages for admin
CREATE OR REPLACE FUNCTION get_conversations_with_unread()
RETURNS TABLE (
  conversation_id uuid,
  user_id uuid,
  unread_count bigint,
  last_message_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id AS conversation_id,
    c.user_id,
    COUNT(m.id) AS unread_count,
    c.last_message_at
  FROM chat_conversations c
  LEFT JOIN chat_messages m ON m.conversation_id = c.id
    AND m.read = false
    AND m.sender_id = c.user_id
  WHERE c.status = 'open'
  GROUP BY c.id, c.user_id, c.last_message_at
  HAVING COUNT(m.id) > 0
  ORDER BY c.last_message_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;