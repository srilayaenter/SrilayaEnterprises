import { useState, useEffect } from 'react';
import { productsApi, variantsApi } from '@/db/api';
import type { Product, ProductVariant, ProductCategory } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, Package } from 'lucide-react';

const categories: ProductCategory[] = ['millets', 'rice', 'flour', 'flakes', 'sugar', 'honey', 'laddus'];

interface ProductFormData {
  name: string;
  category: ProductCategory;
  description: string;
  base_price: number;
  weight_per_kg: number;
  product_code: string;
  image_url: string;
}

interface VariantFormData {
  packaging_size: string;
  price: number;
  stock: number;
  weight_kg: number;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const { toast } = useToast();

  const productForm = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      category: 'millets',
      description: '',
      base_price: 0,
      product_code: '',
      image_url: ''
    }
  });

  const variantForm = useForm<VariantFormData>({
    defaultValues: {
      packaging_size: '1kg',
      price: 0,
      stock: 100,
      weight_kg: 1.0
    }
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productsApi.getAll();
      setProducts(data);
    } catch (error: any) {
      toast({
        title: 'Error loading products',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadVariants = async (productId: string) => {
    try {
      const data = await variantsApi.getByProductId(productId);
      setVariants(data);
    } catch (error: any) {
      toast({
        title: 'Error loading variants',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const onSubmitProduct = async (data: ProductFormData) => {
    try {
      if (selectedProduct) {
        await productsApi.update(selectedProduct.id, data);
        toast({
          title: 'Product updated',
          description: 'Product has been updated successfully'
        });
      } else {
        await productsApi.create({
          ...data,
          weight_per_kg: 1.0,
          stock: 0,
          is_active: true
        });
        toast({
          title: 'Product created',
          description: 'Product has been created successfully'
        });
      }
      setDialogOpen(false);
      productForm.reset();
      setSelectedProduct(null);
      loadProducts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const onSubmitVariant = async (data: VariantFormData) => {
    if (!selectedProduct) return;

    try {
      await variantsApi.create({
        product_id: selectedProduct.id,
        ...data
      });
      toast({
        title: 'Variant created',
        description: 'Product variant has been created successfully'
      });
      setVariantDialogOpen(false);
      variantForm.reset();
      loadVariants(selectedProduct.id);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    productForm.reset({
      name: product.name,
      category: product.category,
      description: product.description || '',
      base_price: product.base_price,
      product_code: product.product_code || '',
      image_url: product.image_url || ''
    });
    setDialogOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This will also delete all variants.')) {
      return;
    }

    try {
      await productsApi.delete(id);
      toast({
        title: 'Product deleted',
        description: 'Product has been deleted successfully'
      });
      loadProducts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleViewVariants = (product: Product) => {
    setSelectedProduct(product);
    loadVariants(product.id);
  };

  const handleUpdateVariantStock = async (variantId: string, newStock: number) => {
    try {
      await variantsApi.update(variantId, { stock: newStock });
      toast({
        title: 'Stock updated',
        description: 'Variant stock has been updated successfully'
      });
      if (selectedProduct) {
        loadVariants(selectedProduct.id);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('Are you sure you want to delete this variant?')) {
      return;
    }

    try {
      await variantsApi.delete(variantId);
      toast({
        title: 'Variant deleted',
        description: 'Variant has been deleted successfully'
      });
      if (selectedProduct) {
        loadVariants(selectedProduct.id);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedProduct(null);
            productForm.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <Form {...productForm}>
              <form onSubmit={productForm.handleSubmit(onSubmitProduct)} className="space-y-4">
                <FormField
                  control={productForm.control}
                  name="name"
                  rules={{ required: 'Product name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter product name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={productForm.control}
                  name="category"
                  rules={{ required: 'Category is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={productForm.control}
                  name="product_code"
                  rules={{ required: 'Product code is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., RICE001" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={productForm.control}
                  name="base_price"
                  rules={{ 
                    required: 'Base price is required',
                    min: { value: 0, message: 'Price must be positive' }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Price (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          step="0.01"
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          placeholder="Enter base price" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={productForm.control}
                  name="weight_per_kg"
                  rules={{ 
                    required: 'Weight is required',
                    min: { value: 0.1, message: 'Weight must be at least 0.1 kg' }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight per Unit (kg)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          step="0.1"
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          placeholder="Enter weight in kg" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={productForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Enter product description" rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={productForm.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://example.com/image.jpg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {selectedProduct ? 'Update Product' : 'Create Product'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading products...</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Products ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-sm">{product.product_code}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell>₹{product.base_price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? 'default' : 'secondary'}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewVariants(product)}
                        >
                          <Package className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {selectedProduct && variants.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Variants for {selectedProduct.name}</CardTitle>
            <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Variant
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Variant</DialogTitle>
                </DialogHeader>
                <Form {...variantForm}>
                  <form onSubmit={variantForm.handleSubmit(onSubmitVariant)} className="space-y-4">
                    <FormField
                      control={variantForm.control}
                      name="packaging_size"
                      rules={{ required: 'Packaging size is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Packaging Size</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 1kg, 500g" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={variantForm.control}
                      name="price"
                      rules={{ 
                        required: 'Price is required',
                        min: { value: 0, message: 'Price must be positive' }
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (₹)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.01"
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={variantForm.control}
                      name="stock"
                      rules={{ 
                        required: 'Stock is required',
                        min: { value: 0, message: 'Stock must be positive' }
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={variantForm.control}
                      name="weight_kg"
                      rules={{ 
                        required: 'Weight is required',
                        min: { value: 0, message: 'Weight must be positive' }
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.001"
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setVariantDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Create Variant</Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Size</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell className="font-medium">{variant.packaging_size}</TableCell>
                    <TableCell>₹{variant.price.toFixed(2)}</TableCell>
                    <TableCell>{variant.weight_kg}kg</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => handleUpdateVariantStock(variant.id, parseInt(e.target.value))}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteVariant(variant.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
