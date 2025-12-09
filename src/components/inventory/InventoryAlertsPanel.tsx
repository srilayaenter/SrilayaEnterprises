import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { inventoryApi } from '@/db/api';
import { useAuth } from '@/components/auth/AuthProvider';
import type { InventoryAlert } from '@/types/types';
import { format } from 'date-fns';

export default function InventoryAlertsPanel() {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await inventoryApi.getInventoryAlerts(false);
      setAlerts(data);
    } catch (error: any) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (alertId: string) => {
    if (!user) return;

    try {
      await inventoryApi.resolveAlert(alertId, user.id);
      toast({
        title: 'Alert Resolved',
        description: 'The alert has been marked as resolved'
      });
      loadAlerts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'out_of_stock':
      case 'expired':
        return <X className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading alerts...</p>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Inventory Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No active alerts. All inventory levels are healthy! ✨
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Inventory Alerts
          <Badge variant="destructive" className="ml-auto">
            {alerts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="mt-0.5">
                {getAlertIcon(alert.alert_type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <Badge variant={getSeverityColor(alert.severity)} className="text-xs">
                    {alert.severity}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{alert.alert_type.replace('_', ' ')}</span>
                  <span>•</span>
                  <span>{format(new Date(alert.created_at), 'MMM dd, HH:mm')}</span>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleResolve(alert.id)}
                className="shrink-0"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
