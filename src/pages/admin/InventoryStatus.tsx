import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, PackageX, TrendingDown, Package, AlertCircle } from 'lucide-react';
import { supabase } from '@/db/supabase';
import type { Product, ProductVariant } from '@/types/types';

interface InventoryItem {
  product: Product;
  variant: ProductVariant;
}

export default function InventoryStatus() {
  const [loading, setLoading] = useState(true);
  const [outOfStock, setOutOfStock] = useState<InventoryItem[]>([]);
  const [criticalStock, setCriticalStock] = useState<InventoryItem[]>([]);
  const [lowStock, setLowStock] = useState<InventoryItem[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);

  const CRITICAL_THRESHOLD = 3;
  const LOW_THRESHOLD = 5;

  useEffect(() => {
    loadInventoryStatus();
  }, []);

  const loadInventoryStatus = async () => {
    setLoading(true);
    try {
      const { data: variants, error } = await supabase
        .from('product_variants')
        .select(`
          *,
          products (*)
        `)
        .order('stock', { ascending: true });

      if (error) throw error;

      const items: InventoryItem[] = (variants || []).map((v: any) => ({
        product: v.products,
        variant: v as ProductVariant,
      }));

      setTotalProducts(items.length);
      setOutOfStock(items.filter(item => item.variant.stock === 0));
      setCriticalStock(items.filter(item => item.variant.stock > 0 && item.variant.stock <= CRITICAL_THRESHOLD));
      setLowStock(items.filter(item => item.variant.stock > CRITICAL_THRESHOLD && item.variant.stock <= LOW_THRESHOLD));
    } catch (error) {
      console.error('Error loading inventory status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive" className="gap-1"><PackageX className="h-3 w-3" />Out of Stock</Badge>;
    }
    if (stock <= CRITICAL_THRESHOLD) {
      return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Critical</Badge>;
    }
    if (stock <= LOW_THRESHOLD) {
      return <Badge variant="secondary" className="gap-1"><TrendingDown className="h-3 w-3" />Low Stock</Badge>;
    }
    return <Badge variant="default" className="gap-1"><Package className="h-3 w-3" />In Stock</Badge>;
  };

  const renderInventoryList = (items: InventoryItem[], title: string, icon: React.ReactNode) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title} ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No items in this category</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.variant.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium">{item.product.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.variant.packaging_size} • ₹{item.variant.price}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-bold">{item.variant.stock}</div>
                    <div className="text-xs text-muted-foreground">units</div>
                  </div>
                  {getStockBadge(item.variant.stock)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Inventory Status</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-12 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Inventory Status</h1>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Total Products: {totalProducts}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <Card className="border-destructive">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <PackageX className="h-8 w-8 text-destructive" />
              <div className="text-3xl font-bold text-destructive">{outOfStock.length}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Critical Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <div className="text-3xl font-bold text-destructive">{criticalStock.length}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">≤ {CRITICAL_THRESHOLD} units remaining</p>
          </CardContent>
        </Card>

        <Card className="border-secondary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-8 w-8 text-secondary-foreground" />
              <div className="text-3xl font-bold">{lowStock.length}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">≤ {LOW_THRESHOLD} units remaining</p>
          </CardContent>
        </Card>

        <Card className="border-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-primary" />
              <div className="text-3xl font-bold text-primary">
                {totalProducts - outOfStock.length - criticalStock.length - lowStock.length}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">&gt; {LOW_THRESHOLD} units available</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {outOfStock.length > 0 && renderInventoryList(
          outOfStock,
          'Out of Stock - Immediate Action Required',
          <PackageX className="h-5 w-5 text-destructive" />
        )}

        {criticalStock.length > 0 && renderInventoryList(
          criticalStock,
          'Critical Stock - Reorder Soon',
          <AlertCircle className="h-5 w-5 text-destructive" />
        )}

        {lowStock.length > 0 && renderInventoryList(
          lowStock,
          'Low Stock - Monitor Closely',
          <TrendingDown className="h-5 w-5 text-secondary-foreground" />
        )}

        {outOfStock.length === 0 && criticalStock.length === 0 && lowStock.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-16 w-16 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">All Products Well Stocked!</h3>
              <p className="text-muted-foreground">
                No critical inventory issues at this time. All products have sufficient stock levels.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="mt-8 bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Inventory Thresholds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-semibold mb-1">Out of Stock</div>
              <div className="text-muted-foreground">Stock = 0 units</div>
            </div>
            <div>
              <div className="font-semibold mb-1">Critical Stock</div>
              <div className="text-muted-foreground">Stock ≤ {CRITICAL_THRESHOLD} units</div>
            </div>
            <div>
              <div className="font-semibold mb-1">Low Stock</div>
              <div className="text-muted-foreground">Stock ≤ {LOW_THRESHOLD} units</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
