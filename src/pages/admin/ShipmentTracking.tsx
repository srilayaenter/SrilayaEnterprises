import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { shipmentsApi, shipmentHandlersApi, ordersApi } from '@/db/api';
import type { ShipmentWithDetails, ShipmentHandler, ShipmentStatus } from '@/types/types';
import { Plus, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ShipmentFormData {
  order_id: string;
  handler_id: string;
  tracking_number: string;
  status: ShipmentStatus;
  shipped_date: string;
  expected_delivery_date: string;
  notes: string;
}

interface StatusUpdateFormData {
  handler_id: string;
  status: ShipmentStatus;
  shipped_date: string;
  expected_delivery_date: string;
  return_reason: string;
  notes: string;
}

export default function ShipmentTracking() {
  const [shipments, setShipments] = useState<ShipmentWithDetails[]>([]);
  const [handlers, setHandlers] = useState<ShipmentHandler[]>([]);
  const [loading, setLoading] = useState(true);
  const [shipmentDialogOpen, setShipmentDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentWithDetails | null>(null);
  const { toast } = useToast();

  const shipmentForm = useForm<ShipmentFormData>({
    defaultValues: {
      order_id: '',
      handler_id: '',
      tracking_number: '',
      status: 'pending',
      shipped_date: '',
      expected_delivery_date: '',
      notes: ''
    }
  });

  const statusForm = useForm<StatusUpdateFormData>({
    defaultValues: {
      handler_id: '',
      status: 'pending',
      shipped_date: '',
      expected_delivery_date: '',
      return_reason: '',
      notes: ''
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading shipments data...');
      const [shipmentsData, handlersData] = await Promise.all([
        shipmentsApi.getAll(),
        shipmentHandlersApi.getAll()
      ]);
      console.log('Shipments loaded:', shipmentsData.length);
      console.log('Handlers loaded:', handlersData.length);
      setShipments(shipmentsData);
      setHandlers(handlersData.filter(h => h.status === 'active'));
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load shipment data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShipmentSubmit = async (data: ShipmentFormData) => {
    try {
      await shipmentsApi.create({
        ...data,
        actual_delivery_date: null,
        return_reason: null
      });
      toast({
        title: 'Success',
        description: 'Shipment created successfully',
      });
      setShipmentDialogOpen(false);
      shipmentForm.reset();
      loadData();
    } catch (error) {
      console.error('Error creating shipment:', error);
      toast({
        title: 'Error',
        description: 'Failed to create shipment',
        variant: 'destructive',
      });
    }
  };

  const handleStatusUpdate = async (data: StatusUpdateFormData) => {
    if (!selectedShipment) return;

    try {
      const updateData: any = {
        handler_id: data.handler_id || null,
        status: data.status,
        shipped_date: data.shipped_date || null,
        expected_delivery_date: data.expected_delivery_date || null,
        notes: data.notes
      };

      if (data.status === 'returned' && data.return_reason) {
        updateData.return_reason = data.return_reason;
      }

      if (data.status === 'delivered') {
        updateData.actual_delivery_date = new Date().toISOString();
      }

      await shipmentsApi.update(selectedShipment.id, updateData);
      toast({
        title: 'Success',
        description: 'Shipment updated successfully',
      });
      setStatusDialogOpen(false);
      setSelectedShipment(null);
      statusForm.reset();
      loadData();
    } catch (error) {
      console.error('Error updating shipment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update shipment',
        variant: 'destructive',
      });
    }
  };

  const openStatusDialog = (shipment: ShipmentWithDetails) => {
    setSelectedShipment(shipment);
    statusForm.reset({
      handler_id: shipment.handler_id || '',
      status: shipment.status,
      shipped_date: shipment.shipped_date ? shipment.shipped_date.split('T')[0] : '',
      expected_delivery_date: shipment.expected_delivery_date || '',
      return_reason: shipment.return_reason || '',
      notes: shipment.notes || ''
    });
    setStatusDialogOpen(true);
  };

  const getStatusIcon = (status: ShipmentStatus) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'returned':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'in_transit':
      case 'out_for_delivery':
        return <Truck className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusVariant = (status: ShipmentStatus): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'delivered':
        return 'default';
      case 'returned':
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const stats = {
    total: shipments.length,
    pending: shipments.filter(s => s.status === 'pending').length,
    inTransit: shipments.filter(s => ['picked_up', 'in_transit', 'out_for_delivery'].includes(s.status)).length,
    delivered: shipments.filter(s => s.status === 'delivered').length,
    returned: shipments.filter(s => s.status === 'returned').length
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading shipments...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shipment Tracking</h1>
          <p className="text-muted-foreground">Track and manage order shipments</p>
        </div>
        <Dialog open={shipmentDialogOpen} onOpenChange={setShipmentDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => shipmentForm.reset()}>
              <Plus className="w-4 h-4 mr-2" />
              Create Shipment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Shipment</DialogTitle>
            </DialogHeader>
            <Form {...shipmentForm}>
              <form onSubmit={shipmentForm.handleSubmit(handleShipmentSubmit)} className="space-y-4">
                <FormField
                  control={shipmentForm.control}
                  name="order_id"
                  rules={{ required: 'Order ID is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order ID *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter order ID" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={shipmentForm.control}
                  name="handler_id"
                  rules={{ required: 'Handler is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipment Handler *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select handler" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {handlers.map((handler) => (
                            <SelectItem key={handler.id} value={handler.id}>
                              {handler.name} - {handler.service_type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={shipmentForm.control}
                  name="tracking_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tracking Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter tracking number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={shipmentForm.control}
                    name="shipped_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipped Date</FormLabel>
                        <FormControl>
                          <Input {...field} type="datetime-local" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={shipmentForm.control}
                    name="expected_delivery_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Delivery</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={shipmentForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Additional notes" rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShipmentDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Shipment</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inTransit}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.delivered}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Returned</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.returned}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Shipments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <span className="ml-3 text-muted-foreground">Loading shipments...</span>
            </div>
          ) : shipments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Shipments Found</h3>
              <p className="text-muted-foreground mb-4">
                Shipments will appear here automatically when customers place online orders.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Tracking Number</TableHead>
                  <TableHead>Handler</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Shipped Date</TableHead>
                  <TableHead>Expected Delivery</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-medium">{shipment.order_id.substring(0, 8)}...</TableCell>
                    <TableCell>{shipment.tracking_number || '-'}</TableCell>
                    <TableCell>{shipment.handler?.name || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(shipment.status)}
                        <Badge variant={getStatusVariant(shipment.status)}>
                          {shipment.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {shipment.shipped_date 
                        ? new Date(shipment.shipped_date).toLocaleDateString() 
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {shipment.expected_delivery_date 
                        ? new Date(shipment.expected_delivery_date).toLocaleDateString() 
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => openStatusDialog(shipment)}>
                        Edit Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Shipment Details</DialogTitle>
          </DialogHeader>
          <Form {...statusForm}>
            <form onSubmit={statusForm.handleSubmit(handleStatusUpdate)} className="space-y-4">
              <FormField
                control={statusForm.control}
                name="handler_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shipment Handler</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a handler" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {handlers.map((handler) => (
                          <SelectItem key={handler.id} value={handler.id}>
                            {handler.name} - {handler.service_type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={statusForm.control}
                  name="shipped_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipped Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={statusForm.control}
                  name="expected_delivery_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Delivery Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={statusForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="picked_up">Picked Up</SelectItem>
                        <SelectItem value="in_transit">In Transit</SelectItem>
                        <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="returned">Returned</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {statusForm.watch('status') === 'returned' && (
                <FormField
                  control={statusForm.control}
                  name="return_reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Return Reason</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Reason for return" rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={statusForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Additional notes" rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setStatusDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Shipment</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
