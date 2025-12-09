import { Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { ExpiringProduct } from '@/types/types';

interface ExpiringProductsAlertProps {
  products: ExpiringProduct[];
  onProductClick?: (productId: string) => void;
}

export default function ExpiringProductsAlert({ products, onProductClick }: ExpiringProductsAlertProps) {
  if (products.length === 0) {
    return null;
  }

  const getSeverityColor = (days: number) => {
    if (days <= 7) return 'destructive';
    if (days <= 14) return 'default';
    return 'secondary';
  };

  const getSeverityBg = (days: number) => {
    if (days <= 7) return 'bg-red-100 hover:bg-red-200';
    if (days <= 14) return 'bg-orange-100 hover:bg-orange-200';
    return 'bg-yellow-100 hover:bg-yellow-200';
  };

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <Calendar className="h-5 w-5" />
          Expiring Products
          <Badge variant="outline" className="ml-auto border-yellow-600 text-yellow-800">
            {products.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {products.map((product) => (
            <div
              key={product.product_id}
              className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${getSeverityBg(product.days_until_expiry)}`}
              onClick={() => onProductClick?.(product.product_id)}
            >
              <div className="flex items-center gap-2 flex-1">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{product.product_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Expires: {format(new Date(product.expiry_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Stock: {product.current_stock}
                </span>
                <Badge variant={getSeverityColor(product.days_until_expiry)} className="text-xs">
                  {product.days_until_expiry} {product.days_until_expiry === 1 ? 'day' : 'days'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
