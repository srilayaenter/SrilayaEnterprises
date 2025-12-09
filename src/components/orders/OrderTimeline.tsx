import { OrderStatus, OrderStatusHistory } from '@/types/types';
import { Clock, Package, Truck, CheckCircle, PackageCheck, Navigation } from 'lucide-react';
import { format } from 'date-fns';

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  statusHistory: OrderStatusHistory[];
  trackingNumber?: string | null;
  estimatedDelivery?: string | null;
}

const statusSteps: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { status: 'pending', label: 'Order Placed', icon: <Clock className="w-5 h-5" /> },
  { status: 'processing', label: 'Processing', icon: <Package className="w-5 h-5" /> },
  { status: 'packed', label: 'Packed', icon: <PackageCheck className="w-5 h-5" /> },
  { status: 'shipped', label: 'Shipped', icon: <Truck className="w-5 h-5" /> },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: <Navigation className="w-5 h-5" /> },
  { status: 'delivered', label: 'Delivered', icon: <CheckCircle className="w-5 h-5" /> }
];

export default function OrderTimeline({ currentStatus, statusHistory, trackingNumber, estimatedDelivery }: OrderTimelineProps) {
  const getStatusIndex = (status: OrderStatus): number => {
    return statusSteps.findIndex(step => step.status === status);
  };

  const currentIndex = getStatusIndex(currentStatus);
  const isCancelled = currentStatus === 'cancelled';
  const isRefunded = currentStatus === 'refunded';

  const getStatusTimestamp = (status: OrderStatus): string | null => {
    const historyItem = statusHistory.find(h => h.new_status === status);
    return historyItem ? historyItem.created_at : null;
  };

  if (isCancelled || isRefunded) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
        <div className="flex items-center gap-3 text-destructive">
          <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Order {isCancelled ? 'Cancelled' : 'Refunded'}</h3>
            <p className="text-sm text-muted-foreground">
              {getStatusTimestamp(currentStatus) && format(new Date(getStatusTimestamp(currentStatus)!), 'PPp')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trackingNumber && (
        <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Tracking Number</p>
            <p className="font-mono font-semibold">{trackingNumber}</p>
          </div>
          {estimatedDelivery && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Estimated Delivery</p>
              <p className="font-semibold">{format(new Date(estimatedDelivery), 'PPP')}</p>
            </div>
          )}
        </div>
      )}

      <div className="relative">
        {statusSteps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const timestamp = getStatusTimestamp(step.status);

          return (
            <div key={step.status} className="relative flex items-start gap-4 pb-8 last:pb-0">
              {index < statusSteps.length - 1 && (
                <div
                  className={`absolute left-5 top-10 w-0.5 h-full ${
                    isCompleted ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}

              <div
                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isCompleted
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
              >
                {step.icon}
              </div>

              <div className="flex-1 pt-1">
                <h4 className={`font-semibold ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </h4>
                {timestamp && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(timestamp), 'PPp')}
                  </p>
                )}
                {isCurrent && !timestamp && (
                  <p className="text-sm text-primary mt-1">In Progress</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
