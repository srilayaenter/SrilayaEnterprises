import { OrderStatus } from '@/types/types';
import { Badge } from '@/components/ui/badge';
import { Clock, Package, Truck, CheckCircle, XCircle, DollarSign, PackageCheck, Navigation } from 'lucide-react';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  pending: {
    label: 'Pending',
    variant: 'outline',
    icon: <Clock className="w-3 h-3" />
  },
  processing: {
    label: 'Processing',
    variant: 'default',
    icon: <Package className="w-3 h-3" />
  },
  packed: {
    label: 'Packed',
    variant: 'secondary',
    icon: <PackageCheck className="w-3 h-3" />
  },
  shipped: {
    label: 'Shipped',
    variant: 'default',
    icon: <Truck className="w-3 h-3" />
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    variant: 'default',
    icon: <Navigation className="w-3 h-3" />
  },
  delivered: {
    label: 'Delivered',
    variant: 'default',
    icon: <CheckCircle className="w-3 h-3" />
  },
  completed: {
    label: 'Completed',
    variant: 'default',
    icon: <CheckCircle className="w-3 h-3" />
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'destructive',
    icon: <XCircle className="w-3 h-3" />
  },
  refunded: {
    label: 'Refunded',
    variant: 'secondary',
    icon: <DollarSign className="w-3 h-3" />
  }
};

export default function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={className}>
      <span className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </span>
    </Badge>
  );
}
