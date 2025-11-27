import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { vendorSuppliesApi, variantsApi } from '@/db/api';
import type { VendorSupply, VendorSupplyItem, Vendor, Product, ProductVariant, PaymentStatus, QualityCheckStatus } from '@/types/types';

interface VendorSupplyDialogProps {
  open: boolean;
  onClose: () => void;
  supply: VendorSupply | null;
  vendors: Vendor[];
  products: Product[];
}

export default function VendorSupplyDialog({
  open,
  onClose,
  supply,
  vendors,
  products,
}: VendorSupplyDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [formData, setFormData] = useState<{
    vendor_id: string;
    supply_date: string;
    invoice_number: string;
    payment_status: PaymentStatus;
    payment_date: string;
    quality_check_status: QualityCheckStatus;
    quality_notes: string;
    delivery_notes: string;
  }>({
    vendor_id: '',
    supply_date: new Date().toISOString().split('T')[0],
    invoice_number: '',
    payment_status: 'pending',
    payment_date: '',
    quality_check_status: 'pending',
    quality_notes: '',
    delivery_notes: '',
  });
  const [items, setItems] = useState<VendorSupplyItem[]>([]);

  useEffect(() => {
    if (supply) {
      setFormData({
        vendor_id: supply.vendor_id,
        supply_date: supply.supply_date,
        invoice_number: supply.invoice_number || '',
        payment_status: supply.payment_status,
        payment_date: supply.payment_date || '',
        quality_check_status: supply.quality_check_status,
        quality_notes: supply.quality_notes || '',
        delivery_notes: supply.delivery_notes || '',
      });
      setItems(supply.items);
    } else {
      resetForm();
    }
  }, [supply, open]);

  useEffect(() => {
    loadVariants();
  }, []);

  const loadVariants = async () => {
    try {
      const allVariants = await Promise.all(
        products.map(p => variantsApi.getByProductId(p.id))
      );
      setVariants(allVariants.flat());
    } catch (error) {
      console.error('Failed to load variants:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      vendor_id: '',
      supply_date: new Date().toISOString().split('T')[0],
      invoice_number: '',
      payment_status: 'pending',
      payment_date: '',
      quality_check_status: 'pending',
      quality_notes: '',
      delivery_notes: '',
    });
    setItems([]);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        product_id: '',
        product_name: '',
        variant_id: '',
        packaging_size: '',
        quantity: 0,
        unit_cost: 0,
        total_cost: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof VendorSupplyItem, value: string | number) => {
    const newItems = [...items];
    const item = newItems[index];

    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      if (product) {
        item.product_id = value as string;
        item.product_name = product.name;
      }
    } else if (field === 'variant_id') {
      const variant = variants.find(v => v.id === value);
      if (variant) {
        item.variant_id = value as string;
        item.packaging_size = variant.packaging_size;
      }
    } else {
      (item as any)[field] = value;
    }

    if (field === 'quantity' || field === 'unit_cost') {
      item.total_cost = item.quantity * item.unit_cost;
    }

    newItems[index] = item;
    setItems(newItems);
  };

  const calculateTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.total_cost, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vendor_id) {
      toast({
        title: 'Error',
        description: 'Please select a vendor',
        variant: 'destructive',
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one item',
        variant: 'destructive',
      });
      return;
    }

    const invalidItems = items.filter(
      item => !item.product_id || item.quantity <= 0 || item.unit_cost <= 0
    );
    if (invalidItems.length > 0) {
      toast({
        title: 'Error',
        description: 'Please fill in all item details correctly',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const supplyData = {
        ...formData,
        items,
        total_amount: calculateTotalAmount(),
        received_by: null,
      };

      if (supply) {
        await vendorSuppliesApi.update(supply.id, supplyData);
        toast({
          title: 'Success',
          description: 'Supply record updated successfully',
        });
      } else {
        await vendorSuppliesApi.create(supplyData);
        toast({
          title: 'Success',
          description: 'Supply record created successfully',
        });
      }

      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: supply ? 'Failed to update supply record' : 'Failed to create supply record',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{supply ? 'Edit Supply Record' : 'Add New Supply'}</DialogTitle>
          <DialogDescription>
            {supply ? 'Update the supply record details' : 'Enter details of the new supply from vendor'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendor_id">Vendor *</Label>
              <Select
                value={formData.vendor_id}
                onValueChange={(value) => setFormData({ ...formData, vendor_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supply_date">Supply Date *</Label>
              <Input
                id="supply_date"
                type="date"
                value={formData.supply_date}
                onChange={(e) => setFormData({ ...formData, supply_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice_number">Invoice Number</Label>
              <Input
                id="invoice_number"
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                placeholder="INV-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_status">Payment Status</Label>
              <Select
                value={formData.payment_status}
                onValueChange={(value: any) => setFormData({ ...formData, payment_status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_date">Payment Date</Label>
              <Input
                id="payment_date"
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quality_check_status">Quality Check Status</Label>
              <Select
                value={formData.quality_check_status}
                onValueChange={(value: any) => setFormData({ ...formData, quality_check_status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quality_notes">Quality Notes</Label>
            <Textarea
              id="quality_notes"
              value={formData.quality_notes}
              onChange={(e) => setFormData({ ...formData, quality_notes: e.target.value })}
              placeholder="Quality inspection notes..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_notes">Delivery Notes</Label>
            <Textarea
              id="delivery_notes"
              value={formData.delivery_notes}
              onChange={(e) => setFormData({ ...formData, delivery_notes: e.target.value })}
              placeholder="General delivery notes..."
              rows={2}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base">Supply Items *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-md">
                No items added. Click "Add Item" to start.
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="border rounded-md p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Item {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Product *</Label>
                        <Select
                          value={item.product_id}
                          onValueChange={(value) => updateItem(index, 'product_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Variant / Packaging Size *</Label>
                        <Select
                          value={item.variant_id}
                          onValueChange={(value) => updateItem(index, 'variant_id', value)}
                          disabled={!item.product_id}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={item.product_id ? "Select packaging size" : "Select product first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {variants
                              .filter(v => v.product_id === item.product_id)
                              .map((variant) => (
                                <SelectItem key={variant.id} value={variant.id}>
                                  {variant.packaging_size}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        {!item.product_id && (
                          <p className="text-xs text-muted-foreground">
                            Select a product first to see available packaging sizes
                          </p>
                        )}
                        {item.product_id && variants.filter(v => v.product_id === item.product_id).length === 0 && (
                          <p className="text-xs text-destructive">
                            No variants found for this product
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Quantity (Number of packages) *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity || ''}
                          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          placeholder="e.g., 10"
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter the number of packages, not total weight
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Unit Cost (₹ per package) *</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_cost || ''}
                          onChange={(e) => updateItem(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                        <p className="text-xs text-muted-foreground">
                          Cost for one package
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Total Cost (₹)</Label>
                        <Input
                          type="number"
                          value={item.total_cost.toFixed(2)}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                          Auto-calculated: Quantity × Unit Cost
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end items-center gap-4 pt-4 border-t">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-2xl font-bold text-primary">
                    ₹{calculateTotalAmount().toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : supply ? 'Update Supply' : 'Create Supply'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
