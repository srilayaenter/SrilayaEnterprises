import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Package, Calendar, TrendingDown, CheckCircle } from 'lucide-react';
import { inventoryApi } from '@/db/api';
import LowStockAlert from '@/components/inventory/LowStockAlert';
import ExpiringProductsAlert from '@/components/inventory/ExpiringProductsAlert';
import InventoryAlertsPanel from '@/components/inventory/InventoryAlertsPanel';
import BackButton from '@/components/common/BackButton';
import type { LowStockProduct, ExpiringProduct } from '@/types/types';

export default function InventoryDashboard() {
  const [loading, setLoading] = useState(true);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [expiringProducts, setExpiringProducts] = useState<ExpiringProduct[]>([]);
  const [expiredProducts, setExpiredProducts] = useState<ExpiringProduct[]>([]);
  const [summary, setSummary] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    expiringCount: 0,
    expiredCount: 0,
    totalAlerts: 0
  });

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    setLoading(true);
    try {
      const [lowStock, expiring, expired, summaryData] = await Promise.all([
        inventoryApi.getLowStockProducts(),
        inventoryApi.getExpiringProducts(30),
        inventoryApi.getExpiredProducts(),
        inventoryApi.getInventorySummary()
      ]);

      setLowStockProducts(lowStock);
      setExpiringProducts(expiring);
      setExpiredProducts(expired);
      setSummary(summaryData);
    } catch (error: any) {
      console.error('Error loading inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId: string) => {
    // Navigate to product details or open edit dialog
    console.log('Product clicked:', productId);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <BackButton />
        <h1 className="text-3xl font-bold mb-6">Inventory Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <BackButton />
          <h1 className="text-3xl font-bold mt-2">Inventory Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor stock levels, expiry dates, and inventory alerts
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Active products in inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {summary.lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Products below threshold
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {summary.outOfStockCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Products unavailable
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {summary.expiringCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Within 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {summary.expiredCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Past expiry date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {summary.totalAlerts}
            </div>
            <p className="text-xs text-muted-foreground">
              Unresolved alerts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">All Alerts</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Products</TabsTrigger>
          <TabsTrigger value="expired">Expired Products</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <InventoryAlertsPanel />
        </TabsContent>

        <TabsContent value="low-stock" className="space-y-4">
          {lowStockProducts.length > 0 ? (
            <LowStockAlert
              products={lowStockProducts}
              onProductClick={handleProductClick}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All Stock Levels Healthy</h3>
                  <p className="text-muted-foreground">
                    No products are currently below their minimum stock threshold
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="expiring" className="space-y-4">
          {expiringProducts.length > 0 ? (
            <ExpiringProductsAlert
              products={expiringProducts}
              onProductClick={handleProductClick}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Products Expiring Soon</h3>
                  <p className="text-muted-foreground">
                    All products have sufficient time before expiry
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
          {expiredProducts.length > 0 ? (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  Expired Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {expiredProducts.map((product) => (
                    <div
                      key={product.product_id}
                      className="flex items-center justify-between p-3 bg-white rounded-md border border-red-200 cursor-pointer hover:bg-red-50 transition-colors"
                      onClick={() => handleProductClick(product.product_id)}
                    >
                      <div>
                        <p className="font-medium">{product.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Expired {Math.abs(product.days_until_expiry)} days ago
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Stock: {product.current_stock}</p>
                        <p className="text-xs text-red-600">Action Required</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Expired Products</h3>
                  <p className="text-muted-foreground">
                    All products are within their expiry dates
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
