import { useState, useEffect } from 'react';
import { MessageCircle, User, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatApi } from '@/db/api';
import { supabase } from '@/db/supabase';
import ChatWindow from '@/components/chat/ChatWindow';
import type { ChatConversationWithUser } from '@/types/types';

export default function ChatManagement() {
  const [conversations, setConversations] = useState<ChatConversationWithUser[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('open');

  useEffect(() => {
    checkAuth();
    loadConversations();
    const interval = setInterval(loadConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await chatApi.getAllConversations();
      
      // Add unread count for each conversation
      const conversationsWithUnread = await Promise.all(
        data.map(async (conv) => {
          const unreadCount = await chatApi.getUnreadCount(conv.id, conv.user_id);
          return { ...conv, unread_count: unreadCount };
        })
      );
      
      setConversations(conversationsWithUnread);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseConversation = async (conversationId: string) => {
    try {
      await chatApi.closeConversation(conversationId);
      await loadConversations();
    } catch (error) {
      console.error('Error closing conversation:', error);
    }
  };

  const handleReopenConversation = async (conversationId: string) => {
    try {
      await chatApi.reopenConversation(conversationId);
      await loadConversations();
    } catch (error) {
      console.error('Error reopening conversation:', error);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (filter === 'all') return true;
    return conv.status === filter;
  });

  const openCount = conversations.filter(c => c.status === 'open').length;
  const closedCount = conversations.filter(c => c.status === 'closed').length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!userId) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageCircle className="w-8 h-8" />
          Chat Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage customer support conversations
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Chats</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed Chats</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{closedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Conversations List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Conversations</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={filter === 'open' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('open')}
                >
                  Open
                </Button>
                <Button
                  variant={filter === 'closed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('closed')}
                >
                  Closed
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {loading ? (
                <div className="p-4 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-muted rounded animate-pulse"></div>
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No conversations found
                </div>
              ) : (
                <div className="divide-y">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                        selectedConversation === conversation.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold truncate">
                                {conversation.user?.full_name || conversation.user?.nickname || 'User'}
                              </h4>
                              <Badge variant={conversation.status === 'open' ? 'default' : 'secondary'}>
                                {conversation.status}
                              </Badge>
                              {conversation.unread_count && conversation.unread_count > 0 && (
                                <Badge variant="destructive">
                                  {conversation.unread_count}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {conversation.user?.email}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Last message: {formatDate(conversation.last_message_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          {conversation.status === 'open' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCloseConversation(conversation.id);
                              }}
                            >
                              Close
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReopenConversation(conversation.id);
                              }}
                            >
                              Reopen
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card>
          <CardHeader>
            <CardTitle>Chat</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {selectedConversation ? (
              <div className="h-[600px]">
                <ChatWindow
                  conversationId={selectedConversation}
                  userId={userId}
                />
              </div>
            ) : (
              <div className="h-[600px] flex items-center justify-center text-muted-foreground">
                Select a conversation to view messages
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
