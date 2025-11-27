import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { shipmentsApi } from '@/db/api';
import type { ShipmentWithDetails } from '@/types/types';
import { Package, Truck, CheckCircle, XCircle, Clock, MapPin, Calendar } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface TrackingStep {
  key: string;
  label: string;
  icon: LucideIcon;
  completed?: boolean;
  active?: boolean;
}

export default function TrackShipment() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shipment, setShipment] = useState<ShipmentWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { toast } = useToast();

  const handleTrack = async () => {
    if (!trackingNumber.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a tracking number',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      setSearched(true);
      const data = await shipmentsApi.getByTrackingNumber(trackingNumber);
      setShipment(data);
      
      if (!data) {
        toast({
          title: 'Not Found',
          description: 'No shipment found with this tracking number',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error tracking shipment:', error);
      toast({
        title: 'Error',
        description: 'Failed to track shipment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'returned':
      case 'cancelled':
        return <XCircle className="w-8 h-8 text-red-600" />;
      case 'in_transit':
      case 'out_for_delivery':
        return <Truck className="w-8 h-8 text-blue-600" />;
      default:
        return <Clock className="w-8 h-8 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'returned':
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'in_transit':
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getStatusSteps = (): TrackingStep[] => {
    const steps: TrackingStep[] = [
      { key: 'pending', label: 'Order Placed', icon: Package },
      { key: 'picked_up', label: 'Picked Up', icon: Package },
      { key: 'in_transit', label: 'In Transit', icon: Truck },
      { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
      { key: 'delivered', label: 'Delivered', icon: CheckCircle }
    ];

    if (!shipment) return steps;

    const statusOrder = ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(shipment.status);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex
    }));
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Track Your Shipment</h1>
        <p className="text-muted-foreground">Enter your tracking number to see the latest status</p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="tracking">Tracking Number</Label>
              <Input
                id="tracking"
                placeholder="Enter tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleTrack} disabled={loading}>
                {loading ? 'Tracking...' : 'Track Shipment'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {searched && !shipment && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Shipment Found</h3>
            <p className="text-muted-foreground">
              Please check your tracking number and try again
            </p>
          </CardContent>
        </Card>
      )}

      {shipment && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Shipment Status</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tracking Number: {shipment.tracking_number}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusIcon(shipment.status)}
                  <Badge className={getStatusColor(shipment.status)}>
                    {shipment.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {shipment.handler && (
                  <div className="flex items-start gap-3">
                    <Truck className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Carrier</p>
                      <p className="text-sm text-muted-foreground">{shipment.handler.name}</p>
                    </div>
                  </div>
                )}

                {shipment.shipped_date && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Shipped Date</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(shipment.shipped_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {shipment.expected_delivery_date && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Expected Delivery</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(shipment.expected_delivery_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {shipment.status === 'delivered' && shipment.actual_delivery_date && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">
                    ✓ Delivered on {new Date(shipment.actual_delivery_date).toLocaleDateString()}
                  </p>
                </div>
              )}

              {shipment.status === 'returned' && shipment.return_reason && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800">Return Reason:</p>
                  <p className="text-sm text-red-700 mt-1">{shipment.return_reason}</p>
                </div>
              )}

              {shipment.notes && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Notes:</p>
                  <p className="text-sm text-muted-foreground mt-1">{shipment.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {!['returned', 'cancelled'].includes(shipment.status) && (
            <Card>
              <CardHeader>
                <CardTitle>Tracking Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {getStatusSteps().map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="flex items-center mb-8 last:mb-0">
                        <div className="relative">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                              step.completed
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'bg-background border-muted-foreground text-muted-foreground'
                            }`}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          {index < getStatusSteps().length - 1 && (
                            <div
                              className={`absolute left-1/2 top-12 w-0.5 h-8 -ml-px ${
                                step.completed ? 'bg-primary' : 'bg-muted'
                              }`}
                            />
                          )}
                        </div>
                        <div className="ml-4">
                          <p
                            className={`font-medium ${
                              step.completed ? 'text-foreground' : 'text-muted-foreground'
                            }`}
                          >
                            {step.label}
                          </p>
                          {step.active && (
                            <p className="text-sm text-primary font-medium">Current Status</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
