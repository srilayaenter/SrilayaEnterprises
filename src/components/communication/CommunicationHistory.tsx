import { useState, useEffect } from 'react';
import { Mail, MessageSquare, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { communicationApi } from '@/db/api';
import { supabase } from '@/db/supabase';
import type { CommunicationLog } from '@/types/types';
import { format } from 'date-fns';

export default function CommunicationHistory() {
  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const data = await communicationApi.getCommunicationLogs(user.id, 20);
      setLogs(data);
    } catch (error) {
      console.error('Error loading communication logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            {status === 'delivered' ? 'Delivered' : 'Sent'}
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'order_confirmation':
        return 'Order Confirmation';
      case 'shipping_notification':
        return 'Shipping Update';
      case 'delivery_confirmation':
        return 'Delivery Confirmation';
      case 'promotional':
        return 'Promotional';
      case 'newsletter':
        return 'Newsletter';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Communication History</CardTitle>
          <CardDescription>Loading your communication history...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Communication History</CardTitle>
        <CardDescription>
          View all emails and messages sent to you
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No communication history yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="mt-1">
                  {getChannelIcon(log.channel)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{log.subject || getTypeLabel(log.type)}</h4>
                    {getStatusBadge(log.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {log.recipient_email || log.recipient_phone}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}</span>
                    <span className="capitalize">{log.channel}</span>
                    <span>{getTypeLabel(log.type)}</span>
                  </div>
                  {log.error_message && (
                    <p className="text-xs text-destructive mt-2">
                      Error: {log.error_message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
