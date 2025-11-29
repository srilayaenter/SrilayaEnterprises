import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsApi, variantsApi, adminApi } from '@/db/api';
import type { Product, ProductVariant, ProductCategory } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Package, TrendingUp, TrendingDown, Save, Filter, BarChart3, ArrowRight } from 'lucide-react';

interface ProductWithVariants extends Product {
  variants: ProductVariant[];
}

const categories: { value: ProductCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'millets', label: 'Millets' },
  { value: 'rice', label: 'Rice' },
  { value: 'flour', label: 'Flour' },
  { value: 'flakes', label: 'Flakes' },
  { value: 'sugar', label: 'Sugar' },
  { value: 'honey', label: 'Honey' },
  { value: 'laddus', label: 'Laddus' },
];

export default function InventoryManagement() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductWithVariants[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockUpdates, setStockUpdates] = useState<Map<string, number>>(new Map());
  const { toast } = useToast();

  useEffect(() => {
    loadInventory();
    loadLowStock();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === selectedCategory));
    }
  }, [selectedCategory, products]);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const allProducts = await productsApi.getAll();
      const productsWithVariants = await Promise.all(
        allProducts.map(async (product) => {
          const variants = await variantsApi.getByProductId(product.id);
          return { ...product, variants };
        })
      );
      setProducts(productsWithVariants);
    } catch (error: any) {
      toast({
        title: 'Error loading inventory',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLowStock = async () => {
    try {
      const data = await adminApi.getLowStockProducts(20);
      setLowStockProducts(data);
    } catch (error: any) {
      console.error('Error loading low stock:', error);
    }
  };

  const handleStockChange = (variantId: string, newStock: number) => {
    const updates = new Map(stockUpdates);
    updates.set(variantId, newStock);
    setStockUpdates(updates);
  };

  const handleSaveStock = async (variantId: string) => {
    const newStock = stockUpdates.get(variantId);
    if (newStock === undefined) return;

    try {
      await variantsApi.update(variantId, { stock: newStock });
      toast({
        title: 'Stock updated',
        description: 'Stock level has been updated successfully'
      });
      
      const updates = new Map(stockUpdates);
      updates.delete(variantId);
      setStockUpdates(updates);
      
      loadInventory();
      loadLowStock();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleBulkUpdate = async (productId: string, adjustment: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    try {
      const updates = product.variants.map(v => ({
        id: v.id,
        stock: Math.max(0, v.stock + adjustment)
      }));

      await adminApi.bulkUpdateStock(updates);
      
      toast({
        title: 'Bulk update completed',
        description: `Updated ${updates.length} variants`
      });
      
      loadInventory();
      loadLowStock();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const calculateTotalStock = (variants: ProductVariant[]) => {
    return variants.reduce((sum, v) => sum + v.stock, 0);
  };

  const calculateTotalValue = (variants: ProductVariant[]) => {
    return variants.reduce((sum, v) => sum + (v.stock * v.cost_price), 0);
  };

  const getTotalInventoryValue = () => {
    return products.reduce((sum, p) => sum + calculateTotalValue(p.variants), 0);
  };

  const getTotalUnits = () => {
    return products.reduce((sum, p) => sum + calculateTotalStock(p.variants), 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Inventory Management</h2>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as ProductCategory | 'all')}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active products in catalog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalUnits()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Units in stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{getTotalInventoryValue().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total stock value
            </p>
          </CardContent>
        </Card>
      </div>

      {lowStockProducts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Low Stock Alert</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{lowStockProducts.length} product variant(s) are running low on stock (below 20 units)</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/admin/inventory-status')}
              className="ml-4"
            >
              View Details <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Critical Inventory Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            View detailed inventory status including out-of-stock, critical stock, and low stock products across all categories.
          </p>
          <Button onClick={() => navigate('/admin/inventory-status')} className="gap-2">
            <BarChart3 className="h-4 w-4" />
            View Inventory Status Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8">Loading inventory...</div>
      ) : (
        <div className="space-y-6">
          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No products found in this category
              </CardContent>
            </Card>
          ) : (
            filteredProducts.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {product.category} • {product.variants.length} variants • 
                      Total: {calculateTotalStock(product.variants)} units • 
                      Value: ₹{calculateTotalValue(product.variants).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkUpdate(product.id, 50)}
                    >
                      +50 All
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkUpdate(product.id, -10)}
                    >
                      -10 All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Size</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Stock Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Update Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.variants.map((variant) => {
                      const pendingUpdate = stockUpdates.get(variant.id);
                      const displayStock = pendingUpdate !== undefined ? pendingUpdate : variant.stock;
                      const hasChanges = pendingUpdate !== undefined && pendingUpdate !== variant.stock;

                      return (
                        <TableRow key={variant.id}>
                          <TableCell className="font-medium">{variant.packaging_size}</TableCell>
                          <TableCell>₹{variant.price.toFixed(2)}</TableCell>
                          <TableCell>{variant.weight_kg}kg</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                variant.stock < 10 ? 'destructive' :
                                variant.stock < 20 ? 'secondary' :
                                'default'
                              }
                            >
                              {variant.stock} units
                            </Badge>
                          </TableCell>
                          <TableCell>₹{(variant.stock * variant.price).toFixed(2)}</TableCell>
                          <TableCell>
                            {variant.stock < 10 && (
                              <Badge variant="destructive">Critical</Badge>
                            )}
                            {variant.stock >= 10 && variant.stock < 20 && (
                              <Badge variant="secondary">Low</Badge>
                            )}
                            {variant.stock >= 20 && (
                              <Badge variant="default">Good</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Input
                                type="number"
                                value={displayStock}
                                onChange={(e) => handleStockChange(variant.id, parseInt(e.target.value) || 0)}
                                className="w-24"
                              />
                              {hasChanges && (
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveStock(variant.id)}
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))
          )}
        </div>
      )}
    </div>
  );
}
