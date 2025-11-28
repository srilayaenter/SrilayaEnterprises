import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/db/supabase';
import { chatApi } from '@/db/api';
import ChatWindow from './ChatWindow';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userId && conversationId) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 10000);
      return () => clearInterval(interval);
    }
  }, [userId, conversationId]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      await initializeConversation(user.id);
    }
  };

  const initializeConversation = async (uid: string) => {
    try {
      const convId = await chatApi.getOrCreateConversation(uid);
      setConversationId(convId);
    } catch (error) {
      console.error('Error initializing conversation:', error);
    }
  };

  const loadUnreadCount = async () => {
    if (!userId || !conversationId) return;
    
    try {
      const count = await chatApi.getUnreadCount(conversationId, userId);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && userId && conversationId) {
      chatApi.markAsRead(conversationId, userId);
      setUnreadCount(0);
    }
  };

  if (!userId) return null;

  return (
    <>
      {/* Chat Window */}
      {isOpen && conversationId && (
        <div className="fixed bottom-24 right-4 w-96 h-[500px] shadow-2xl rounded-lg overflow-hidden z-50 bg-background border">
          <ChatWindow
            conversationId={conversationId}
            userId={userId}
            onClose={() => setIsOpen(false)}
          />
        </div>
      )}

      {/* Chat Button */}
      <Button
        onClick={handleToggle}
        size="icon"
        className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-40"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </>
        )}
      </Button>
    </>
  );
}
