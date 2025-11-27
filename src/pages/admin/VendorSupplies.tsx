import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, CheckCircle, XCircle, Clock, DollarSign, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { vendorSuppliesApi, vendorsApi, productsApi } from '@/db/api';
import type { VendorSupply, Vendor, Product } from '@/types/types';
import VendorSupplyDialog from '@/components/admin/VendorSupplyDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function VendorSupplies() {
  const { toast } = useToast();
  const [supplies, setSupplies] = useState<VendorSupply[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupply, setEditingSupply] = useState<VendorSupply | null>(null);
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('all');
  const [filterQualityStatus, setFilterQualityStatus] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [suppliesData, vendorsData, productsData] = await Promise.all([
        vendorSuppliesApi.getAll(),
        vendorsApi.getAll(),
        productsApi.getAll()
      ]);
      setSupplies(suppliesData);
      setVendors(vendorsData);
      setProducts(productsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load vendor supplies',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supply record?')) return;

    try {
      await vendorSuppliesApi.delete(id);
      toast({
        title: 'Success',
        description: 'Supply record deleted successfully',
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete supply record',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (supply: VendorSupply) => {
    setEditingSupply(supply);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingSupply(null);
    loadData();
  };

  const getVendorName = (vendorId: string) => {
    return vendors.find(v => v.id === vendorId)?.name || 'Unknown';
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      paid: 'default',
      partial: 'secondary',
      pending: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status.toUpperCase()}</Badge>;
  };

  const getQualityStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      passed: 'default',
      pending: 'secondary',
      failed: 'destructive',
    };
    const icons = {
      passed: <CheckCircle className="h-3 w-3 mr-1" />,
      pending: <Clock className="h-3 w-3 mr-1" />,
      failed: <XCircle className="h-3 w-3 mr-1" />,
    };
    return (
      <Badge variant={variants[status] || 'default'} className="flex items-center w-fit">
        {icons[status as keyof typeof icons]}
        {status.toUpperCase()}
      </Badge>
    );
  };

  const filteredSupplies = supplies.filter(supply => {
    if (filterPaymentStatus !== 'all' && supply.payment_status !== filterPaymentStatus) return false;
    if (filterQualityStatus !== 'all' && supply.quality_check_status !== filterQualityStatus) return false;
    return true;
  });

  const totalSuppliesValue = filteredSupplies.reduce((sum, s) => sum + Number(s.total_amount), 0);
  const pendingPayments = filteredSupplies
    .filter(s => s.payment_status === 'pending')
    .reduce((sum, s) => sum + Number(s.total_amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Vendor Supplies</h2>
          <p className="text-muted-foreground">Track all inventory supplies from vendors</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Supplies</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSupplies.length}</div>
            <p className="text-xs text-muted-foreground">Supply records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalSuppliesValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All supplies value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{pendingPayments.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Unpaid invoices</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Supply Records</CardTitle>
              <CardDescription>Manage all vendor supply deliveries</CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Supply
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Select value={filterPaymentStatus} onValueChange={setFilterPaymentStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={filterQualityStatus} onValueChange={setFilterQualityStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Quality Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quality Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredSupplies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No supply records found. Add your first supply record.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supply Date</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSupplies.map((supply) => (
                    <TableRow key={supply.id}>
                      <TableCell>
                        {new Date(supply.supply_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {getVendorName(supply.vendor_id)}
                      </TableCell>
                      <TableCell>{supply.invoice_number || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{supply.items.length} items</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₹{Number(supply.total_amount).toFixed(2)}
                      </TableCell>
                      <TableCell>{getPaymentStatusBadge(supply.payment_status)}</TableCell>
                      <TableCell>{getQualityStatusBadge(supply.quality_check_status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(supply)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(supply.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <VendorSupplyDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        supply={editingSupply}
        vendors={vendors}
        products={products}
      />
    </div>
  );
}
