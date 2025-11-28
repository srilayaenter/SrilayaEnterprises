import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { purchaseOrdersApi, vendorsApi, productsApi } from '@/db/api';
import type { PurchaseOrder, PurchaseOrderWithDetails, PurchaseOrderStatus, PurchaseOrderItem, Vendor, Product } from '@/types/types';
import { Plus, Pencil, Trash2, Package, Search, X } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function PurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrderWithDetails[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Summary stats
  const [totalOrders, setTotalOrders] = useState(0);
  const [outstandingOrders, setOutstandingOrders] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    vendor_id: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    items: [] as PurchaseOrderItem[],
    shipping_cost: 0,
    notes: '',
  });

  // Item form state
  const [itemForm, setItemForm] = useState({
    product_id: '',
    product_name: '',
    quantity: 1,
    unit_cost: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, vendorsData, productsData] = await Promise.all([
        purchaseOrdersApi.getAllWithDetails(),
        vendorsApi.getAll(),
        productsApi.getAll(),
      ]);

      setOrders(ordersData);
      setVendors(vendorsData);
      setProducts(productsData);

      // Calculate summary stats
      setTotalOrders(ordersData.length);
      const outstanding = ordersData.filter(o => 
        ['ordered', 'confirmed', 'shipped'].includes(o.status)
      ).length;
      setOutstandingOrders(outstanding);

      const total = ordersData.reduce((sum, o) => sum + Number(o.total_amount), 0);
      setTotalValue(total);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load purchase orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    try {
      if (!formData.vendor_id) {
        toast({
          title: 'Validation Error',
          description: 'Please select a vendor',
          variant: 'destructive',
        });
        return;
      }

      if (formData.items.length === 0) {
        toast({
          title: 'Validation Error',
          description: 'Please add at least one item',
          variant: 'destructive',
        });
        return;
      }

      const poNumber = await purchaseOrdersApi.generatePONumber();
      const totalAmount = formData.items.reduce((sum, item) => sum + item.total_cost, 0) + formData.shipping_cost;

      await purchaseOrdersApi.create({
        po_number: poNumber,
        vendor_id: formData.vendor_id,
        order_date: formData.order_date,
        expected_delivery_date: formData.expected_delivery_date || null,
        actual_delivery_date: null,
        status: 'ordered',
        items: formData.items,
        total_amount: totalAmount,
        shipping_cost: formData.shipping_cost,
        notes: formData.notes || null,
        ordered_by: null,
        vendor_supply_id: null,
      });

      toast({
        title: 'Success',
        description: 'Purchase order created successfully',
      });

      setIsCreateDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to create purchase order',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    try {
      const totalAmount = formData.items.reduce((sum, item) => sum + item.total_cost, 0) + formData.shipping_cost;

      await purchaseOrdersApi.update(selectedOrder.id, {
        vendor_id: formData.vendor_id,
        order_date: formData.order_date,
        expected_delivery_date: formData.expected_delivery_date || null,
        items: formData.items,
        total_amount: totalAmount,
        shipping_cost: formData.shipping_cost,
        notes: formData.notes || null,
      });

      toast({
        title: 'Success',
        description: 'Purchase order updated successfully',
      });

      setIsEditDialogOpen(false);
      setSelectedOrder(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update purchase order',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this purchase order?')) return;

    try {
      await purchaseOrdersApi.delete(id);
      toast({
        title: 'Success',
        description: 'Purchase order deleted successfully',
      });
      loadData();
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete purchase order',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStatus = async (id: string, status: PurchaseOrderStatus) => {
    try {
      const actualDeliveryDate = status === 'received' ? new Date().toISOString().split('T')[0] : undefined;
      await purchaseOrdersApi.updateStatus(id, status, actualDeliveryDate);
      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const handleAddItem = () => {
    if (!itemForm.product_id || itemForm.quantity <= 0 || itemForm.unit_cost <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all item fields correctly',
        variant: 'destructive',
      });
      return;
    }

    const newItem: PurchaseOrderItem = {
      product_id: itemForm.product_id,
      product_name: itemForm.product_name,
      quantity: itemForm.quantity,
      unit_cost: itemForm.unit_cost,
      total_cost: itemForm.quantity * itemForm.unit_cost,
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    setItemForm({
      product_id: '',
      product_name: '',
      quantity: 1,
      unit_cost: 0,
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const resetForm = () => {
    setFormData({
      vendor_id: '',
      order_date: new Date().toISOString().split('T')[0],
      expected_delivery_date: '',
      items: [],
      shipping_cost: 0,
      notes: '',
    });
    setItemForm({
      product_id: '',
      product_name: '',
      quantity: 1,
      unit_cost: 0,
    });
  };

  const openEditDialog = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setFormData({
      vendor_id: order.vendor_id,
      order_date: order.order_date,
      expected_delivery_date: order.expected_delivery_date || '',
      items: order.items,
      shipping_cost: order.shipping_cost,
      notes: order.notes || '',
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: PurchaseOrderStatus) => {
    const variants: Record<PurchaseOrderStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      ordered: { variant: 'secondary', label: 'Ordered' },
      confirmed: { variant: 'default', label: 'Confirmed' },
      shipped: { variant: 'outline', label: 'Shipped' },
      received: { variant: 'default', label: 'Received' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    };

    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = order.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const calculateTotal = () => {
    const itemsTotal = formData.items.reduce((sum, item) => sum + item.total_cost, 0);
    return itemsTotal + formData.shipping_cost;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading purchase orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outstandingOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <CardTitle>Purchase Orders</CardTitle>
            <div className="flex flex-col xl:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by PO number or vendor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-full xl:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full xl:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetForm()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Order
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Purchase Order</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Vendor *</Label>
                        <Select value={formData.vendor_id} onValueChange={(value) => setFormData(prev => ({ ...prev, vendor_id: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vendor" />
                          </SelectTrigger>
                          <SelectContent>
                            {vendors.map(vendor => (
                              <SelectItem key={vendor.id} value={vendor.id}>
                                {vendor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Order Date *</Label>
                        <Input
                          type="date"
                          value={formData.order_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, order_date: e.target.value }))}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Expected Delivery Date</Label>
                      <Input
                        type="date"
                        value={formData.expected_delivery_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, expected_delivery_date: e.target.value }))}
                        min={formData.order_date}
                      />
                    </div>

                    {/* Add Items Section */}
                    <div className="border rounded-lg p-4 space-y-4">
                      <h3 className="font-semibold">Add Items</h3>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="space-y-2">
                          <Label>Product *</Label>
                          <Select 
                            value={itemForm.product_id} 
                            onValueChange={(value) => {
                              const product = products.find(p => p.id === value);
                              setItemForm(prev => ({ 
                                ...prev, 
                                product_id: value,
                                product_name: product?.name || ''
                              }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map(product => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Quantity *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={itemForm.quantity}
                            onChange={(e) => setItemForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Unit Cost *</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={itemForm.unit_cost}
                            onChange={(e) => setItemForm(prev => ({ ...prev, unit_cost: parseFloat(e.target.value) || 0 }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>&nbsp;</Label>
                          <Button type="button" onClick={handleAddItem} className="w-full">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Items List */}
                      {formData.items.length > 0 && (
                        <div className="space-y-2">
                          <Label>Order Items</Label>
                          <div className="border rounded-md">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Product</TableHead>
                                  <TableHead>Quantity</TableHead>
                                  <TableHead>Unit Cost</TableHead>
                                  <TableHead>Total</TableHead>
                                  <TableHead className="w-12"></TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {formData.items.map((item, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{item.product_name}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>₹{item.unit_cost.toFixed(2)}</TableCell>
                                    <TableCell>₹{item.total_cost.toFixed(2)}</TableCell>
                                    <TableCell>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveItem(index)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Shipping Cost</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.shipping_cost}
                        onChange={(e) => setFormData(prev => ({ ...prev, shipping_cost: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="text-lg font-semibold">
                        Total: ₹{calculateTotal().toFixed(2)}
                      </div>
                      <Button onClick={handleCreateOrder}>Create Purchase Order</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Expected Delivery</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No purchase orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.po_number}</TableCell>
                    <TableCell>{order.vendor?.name || 'N/A'}</TableCell>
                    <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {order.expected_delivery_date 
                        ? new Date(order.expected_delivery_date).toLocaleDateString()
                        : 'Not set'}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>₹{Number(order.total_amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {order.status !== 'received' && order.status !== 'cancelled' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(order)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleUpdateStatus(order.id, value as PurchaseOrderStatus)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ordered">Ordered</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="received">Received</SelectItem>
                                <SelectItem value="cancelled">Cancel</SelectItem>
                              </SelectContent>
                            </Select>
                          </>
                        )}
                        {order.status !== 'received' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteOrder(order.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Purchase Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vendor *</Label>
                <Select value={formData.vendor_id} onValueChange={(value) => setFormData(prev => ({ ...prev, vendor_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map(vendor => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Order Date *</Label>
                <Input
                  type="date"
                  value={formData.order_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, order_date: e.target.value }))}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Expected Delivery Date</Label>
              <Input
                type="date"
                value={formData.expected_delivery_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expected_delivery_date: e.target.value }))}
                min={formData.order_date}
              />
            </div>

            {/* Add Items Section */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Add Items</h3>
              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-2">
                  <Label>Product *</Label>
                  <Select 
                    value={itemForm.product_id} 
                    onValueChange={(value) => {
                      const product = products.find(p => p.id === value);
                      setItemForm(prev => ({ 
                        ...prev, 
                        product_id: value,
                        product_name: product?.name || ''
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={itemForm.quantity}
                    onChange={(e) => setItemForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit Cost *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={itemForm.unit_cost}
                    onChange={(e) => setItemForm(prev => ({ ...prev, unit_cost: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button type="button" onClick={handleAddItem} className="w-full">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Items List */}
              {formData.items.length > 0 && (
                <div className="space-y-2">
                  <Label>Order Items</Label>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit Cost</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formData.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.product_name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>₹{item.unit_cost.toFixed(2)}</TableCell>
                            <TableCell>₹{item.total_cost.toFixed(2)}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Shipping Cost</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.shipping_cost}
                onChange={(e) => setFormData(prev => ({ ...prev, shipping_cost: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-lg font-semibold">
                Total: ₹{calculateTotal().toFixed(2)}
              </div>
              <Button onClick={handleUpdateOrder}>Update Purchase Order</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
