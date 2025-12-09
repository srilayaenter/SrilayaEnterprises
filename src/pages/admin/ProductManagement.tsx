import { useState, useEffect } from 'react';
import { productsApi, variantsApi, categoriesApi, vendorsApi } from '@/db/api';
import type { Product, ProductVariant, ProductCategory, Category, Vendor, ProductWithVariants } from '@/types/types';
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
import { Plus, Edit, Trash2, Package, FolderPlus, X, Building2 } from 'lucide-react';

interface ProductFormData {
  name: string;
  category: ProductCategory;
  description: string;
  base_price: number;
  weight_per_kg: number;
  image_url: string;
  vendor_id: string;
}

interface VariantFormData {
  packaging_size: string;
  price: number;
  stock: number;
  discount_percentage: number;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  display_order: number;
}

interface VendorFormData {
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  payment_terms: string;
}

interface NewVariant {
  packaging_size: string;
  price: number;
  stock: number;
  weight_kg: number;
  discount_percentage: number;
}

// Helper function to parse packaging size and return weight in kg
const parsePackagingWeight = (packagingSize: string): number => {
  const match = packagingSize.match(/^(\d+(?:\.\d+)?)(g|kg)$/i);
  if (!match) return 1.0; // Default to 1kg if format is invalid
  
  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  
  if (unit === 'g') {
    return value / 1000; // Convert grams to kg
  }
  return value; // Already in kg
};


export default function ProductManagement() {
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [newVariants, setNewVariants] = useState<NewVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const { toast } = useToast();

  const productForm = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      category: 'millets',
      description: '',
      base_price: 0,
      image_url: '',
      vendor_id: ''
    }
  });

  const variantForm = useForm<VariantFormData>({
    defaultValues: {
      packaging_size: '1kg',
      price: 0,
      stock: 100,
      discount_percentage: 0
    }
  });

  const categoryForm = useForm<CategoryFormData>({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      display_order: 0
    }
  });

  const vendorForm = useForm<VendorFormData>({
    defaultValues: {
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      payment_terms: 'Net 30'
    }
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadVendors();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (error: any) {
      toast({
        title: 'Error loading categories',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const loadVendors = async () => {
    try {
      const data = await vendorsApi.getAll();
      setVendors(data);
    } catch (error: any) {
      toast({
        title: 'Error loading vendors',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productsApi.getAllWithVendors();
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
      const productData = {
        ...data,
        vendor_id: data.vendor_id === 'none' || !data.vendor_id ? null : data.vendor_id
      };

      if (selectedProduct) {
        await productsApi.update(selectedProduct.id, productData);
        toast({
          title: 'Product updated',
          description: 'Product has been updated successfully'
        });
      } else {
        const newProduct = await productsApi.create({
          ...productData,
          product_code: null,
          weight_per_kg: 1.0,
          stock: 0,
          is_active: true,
          min_stock_threshold: 10,
          reserved_stock: 0,
          expiry_date: null,
          expiry_alert_days: 30
        });

        // Create variants if any were added
        if (newVariants.length > 0) {
          for (const variant of newVariants) {
            const cost_price = data.base_price * variant.weight_kg;
            await variantsApi.create({
              product_id: newProduct.id,
              ...variant,
              cost_price
            });
          }
          toast({
            title: 'Product created',
            description: `Product and ${newVariants.length} variant(s) created successfully. Product code auto-generated.`
          });
        } else {
          toast({
            title: 'Product created',
            description: 'Product has been created successfully. Product code auto-generated.'
          });
        }
      }
      setDialogOpen(false);
      productForm.reset();
      setSelectedProduct(null);
      setNewVariants([]);
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
      const weight_kg = parsePackagingWeight(data.packaging_size);
      const cost_price = selectedProduct.base_price * weight_kg;
      
      await variantsApi.create({
        product_id: selectedProduct.id,
        ...data,
        weight_kg,
        cost_price
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

  const onSubmitCategory = async (data: CategoryFormData) => {
    try {
      await categoriesApi.create({
        ...data,
        is_active: true
      });
      toast({
        title: 'Category created',
        description: 'Category has been created successfully'
      });
      setCategoryDialogOpen(false);
      categoryForm.reset();
      loadCategories();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const onSubmitVendor = async (data: VendorFormData) => {
    try {
      await vendorsApi.create({
        ...data,
        gstin: null,
        status: 'active',
        notes: null
      });
      toast({
        title: 'Vendor created',
        description: 'Vendor has been created successfully'
      });
      setVendorDialogOpen(false);
      vendorForm.reset();
      loadVendors();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleCategoryNameChange = (name: string) => {
    categoryForm.setValue('name', name);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    categoryForm.setValue('slug', slug);
  };

  const handleAddVariant = () => {
    const basePrice = productForm.getValues('base_price') || 0;
    const newVariant: NewVariant = {
      packaging_size: '1kg',
      price: basePrice,
      stock: 100,
      weight_kg: 1.0,
      discount_percentage: 0
    };
    setNewVariants([...newVariants, newVariant]);
  };

  const handleRemoveVariant = (index: number) => {
    setNewVariants(newVariants.filter((_, i) => i !== index));
  };

  const handleUpdateVariant = (index: number, field: keyof NewVariant, value: string | number) => {
    const updated = [...newVariants];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-calculate weight when packaging_size changes
    if (field === 'packaging_size' && typeof value === 'string') {
      updated[index].weight_kg = parsePackagingWeight(value);
    }
    
    setNewVariants(updated);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    productForm.reset({
      name: product.name,
      category: product.category,
      description: product.description || '',
      base_price: product.base_price,
      image_url: product.image_url || '',
      vendor_id: product.vendor_id || 'none'
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
        <div className="flex items-center gap-2">
          <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderPlus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>
              <Form {...categoryForm}>
                <form onSubmit={categoryForm.handleSubmit(onSubmitCategory)} className="space-y-4">
                  <FormField
                    control={categoryForm.control}
                    name="name"
                    rules={{ required: 'Category name is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g., Millets, Rice, Honey"
                            onChange={(e) => handleCategoryNameChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={categoryForm.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug (Auto-generated)</FormLabel>
                        <FormControl>
                          <Input {...field} disabled className="bg-muted" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={categoryForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Brief description of the category" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={categoryForm.control}
                    name="display_order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            placeholder="Order for sorting (e.g., 1, 2, 3)"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Category</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={vendorDialogOpen} onOpenChange={setVendorDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Building2 className="mr-2 h-4 w-4" />
                Add Vendor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Vendor</DialogTitle>
              </DialogHeader>
              <Form {...vendorForm}>
                <form onSubmit={vendorForm.handleSubmit(onSubmitVendor)} className="space-y-4">
                  <FormField
                    control={vendorForm.control}
                    name="name"
                    rules={{ required: 'Vendor name is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vendor Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Organic Farms Ltd" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={vendorForm.control}
                    name="contact_person"
                    rules={{ required: 'Contact person is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., John Doe" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={vendorForm.control}
                    name="email"
                    rules={{ 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="vendor@example.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={vendorForm.control}
                    name="phone"
                    rules={{ required: 'Phone is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+91 9876543210" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={vendorForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address (Optional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Full address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={vendorForm.control}
                    name="payment_terms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Terms</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Net 30, Net 60" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setVendorDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Vendor</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setSelectedProduct(null);
              productForm.reset();
              setNewVariants([]);
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
              {!selectedProduct && (
                <p className="text-sm text-muted-foreground mt-2">
                  Product code will be auto-generated based on the category (e.g., MIL-001, RIC-002)
                </p>
              )}
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
                            <SelectItem key={cat.slug} value={cat.slug}>
                              {cat.name}
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
                  name="vendor_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vendor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {vendors.map((vendor) => (
                            <SelectItem key={vendor.id} value={vendor.id}>
                              {vendor.name}
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

                {!selectedProduct && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Packaging Variants</h3>
                        <p className="text-sm text-muted-foreground">
                          Add packaging sizes and stock for this product
                        </p>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={handleAddVariant}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Variant
                      </Button>
                    </div>

                    {newVariants.length > 0 && (
                      <div className="space-y-3">
                        {newVariants.map((variant, index) => (
                          <Card key={index} className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-medium">Variant {index + 1}</h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveVariant(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-sm font-medium">Packaging Size</label>
                                <Select
                                  value={variant.packaging_size}
                                  onValueChange={(value) => handleUpdateVariant(index, 'packaging_size', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="200g">200g</SelectItem>
                                    <SelectItem value="500g">500g</SelectItem>
                                    <SelectItem value="1kg">1kg</SelectItem>
                                    <SelectItem value="2kg">2kg</SelectItem>
                                    <SelectItem value="5kg">5kg</SelectItem>
                                    <SelectItem value="10kg">10kg</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Weight (kg)</label>
                                <Input
                                  type="number"
                                  step="0.001"
                                  value={variant.weight_kg}
                                  disabled
                                  className="bg-muted"
                                  placeholder="Auto-calculated"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Price (₹)</label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={variant.price}
                                  onChange={(e) => handleUpdateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                                  placeholder="Price"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Discount (%)</label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  value={variant.discount_percentage}
                                  onChange={(e) => handleUpdateVariant(index, 'discount_percentage', parseFloat(e.target.value) || 0)}
                                  placeholder="Discount"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Stock</label>
                                <Input
                                  type="number"
                                  value={variant.stock}
                                  onChange={(e) => handleUpdateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                                  placeholder="Stock quantity"
                                />
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

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
                  <TableHead>Vendor</TableHead>
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
                    <TableCell>
                      {product.vendor ? (
                        <span className="text-sm text-muted-foreground">{product.vendor.name}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">No vendor</span>
                      )}
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
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select size" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="200g">200g</SelectItem>
                              <SelectItem value="500g">500g</SelectItem>
                              <SelectItem value="1kg">1kg</SelectItem>
                              <SelectItem value="2kg">2kg</SelectItem>
                              <SelectItem value="5kg">5kg</SelectItem>
                              <SelectItem value="10kg">10kg</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={variantForm.control}
                        name="price"
                        rules={{ 
                          required: 'Price is required',
                          min: { value: 0, message: 'Price must be positive' }
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Selling Price (₹)</FormLabel>
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
                        name="discount_percentage"
                        rules={{ 
                          min: { value: 0, message: 'Discount must be positive' },
                          max: { value: 100, message: 'Discount cannot exceed 100%' }
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount (%)</FormLabel>
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
                    </div>

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
                  <TableHead>Cost Price</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell className="font-medium">{variant.packaging_size}</TableCell>
                    <TableCell>₹{variant.cost_price.toFixed(2)}</TableCell>
                    <TableCell>₹{variant.price.toFixed(2)}</TableCell>
                    <TableCell>
                      {variant.discount_percentage > 0 ? (
                        <Badge variant="secondary">{variant.discount_percentage}%</Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
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
