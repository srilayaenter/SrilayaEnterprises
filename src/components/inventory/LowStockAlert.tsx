import { AlertTriangle, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { LowStockProduct } from '@/types/types';

interface LowStockAlertProps {
  products: LowStockProduct[];
  onProductClick?: (productId: string) => void;
}

export default function LowStockAlert({ products, onProductClick }: LowStockAlertProps) {
  if (products.length === 0) {
    return null;
  }

  const criticalProducts = products.filter(p => p.available_stock === 0);
  const lowProducts = products.filter(p => p.available_stock > 0);

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-5 w-5" />
          Low Stock Alert
          <Badge variant="destructive" className="ml-auto">
            {products.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {criticalProducts.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-red-800 mb-2">
                Out of Stock ({criticalProducts.length})
              </h4>
              <div className="space-y-2">
                {criticalProducts.map((product) => (
                  <div
                    key={product.product_id}
                    className="flex items-center justify-between p-2 bg-red-100 rounded-md cursor-pointer hover:bg-red-200 transition-colors"
                    onClick={() => onProductClick?.(product.product_id)}
                  >
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-900">
                        {product.product_name}
                      </span>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      Out of Stock
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lowProducts.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-orange-800 mb-2">
                Low Stock ({lowProducts.length})
              </h4>
              <div className="space-y-2">
                {lowProducts.map((product) => (
                  <div
                    key={product.product_id}
                    className="flex items-center justify-between p-2 bg-white rounded-md cursor-pointer hover:bg-orange-100 transition-colors"
                    onClick={() => onProductClick?.(product.product_id)}
                  >
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">
                        {product.product_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Available: {product.available_stock}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Min: {product.min_threshold}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
