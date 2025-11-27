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
import { shipmentHandlersApi, shipmentHandlerTransactionsApi } from '@/db/api';
import type { ShipmentHandler, ShipmentHandlerTransaction, ServiceType, PaymentMethod } from '@/types/types';
import { Plus, Edit, Trash2, Truck } from 'lucide-react';

interface HandlerFormData {
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  service_type: ServiceType;
  coverage_area: string;
  status: 'active' | 'inactive';
  notes: string;
}

interface TransactionFormData {
  handler_id: string;
  amount: number;
  payment_method: PaymentMethod;
  reference_number: string;
  description: string;
  transaction_date: string;
}

export default function ShipmentHandlersManagement() {
  const [handlers, setHandlers] = useState<ShipmentHandler[]>([]);
  const [selectedHandler, setSelectedHandler] = useState<ShipmentHandler | null>(null);
  const [transactions, setTransactions] = useState<ShipmentHandlerTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [handlerDialogOpen, setHandlerDialogOpen] = useState(false);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [editingHandler, setEditingHandler] = useState<ShipmentHandler | null>(null);
  const { toast } = useToast();

  const handlerForm = useForm<HandlerFormData>({
    defaultValues: {
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      service_type: 'courier',
      coverage_area: '',
      status: 'active',
      notes: ''
    }
  });

  const transactionForm = useForm<TransactionFormData>({
    defaultValues: {
      handler_id: '',
      amount: 0,
      payment_method: 'bank_transfer',
      reference_number: '',
      description: '',
      transaction_date: new Date().toISOString().split('T')[0]
    }
  });

  useEffect(() => {
    loadHandlers();
  }, []);

  const loadHandlers = async () => {
    try {
      setLoading(true);
      const data = await shipmentHandlersApi.getAll();
      setHandlers(data);
    } catch (error) {
      console.error('Error loading handlers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load shipment handlers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (handlerId: string) => {
    try {
      const data = await shipmentHandlerTransactionsApi.getAll(handlerId);
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transactions',
        variant: 'destructive',
      });
    }
  };

  const handleHandlerSubmit = async (data: HandlerFormData) => {
    try {
      if (editingHandler) {
        await shipmentHandlersApi.update(editingHandler.id, data);
        toast({
          title: 'Success',
          description: 'Handler updated successfully',
        });
      } else {
        await shipmentHandlersApi.create(data);
        toast({
          title: 'Success',
          description: 'Handler created successfully',
        });
      }
      setHandlerDialogOpen(false);
      setEditingHandler(null);
      handlerForm.reset();
      loadHandlers();
    } catch (error) {
      console.error('Error saving handler:', error);
      toast({
        title: 'Error',
        description: 'Failed to save handler',
        variant: 'destructive',
      });
    }
  };

  const handleTransactionSubmit = async (data: TransactionFormData) => {
    try {
      await shipmentHandlerTransactionsApi.create(data);
      toast({
        title: 'Success',
        description: 'Transaction recorded successfully',
      });
      setTransactionDialogOpen(false);
      transactionForm.reset();
      if (selectedHandler) {
        loadTransactions(selectedHandler.id);
      }
    } catch (error) {
      console.error('Error recording transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to record transaction',
        variant: 'destructive',
      });
    }
  };

  const handleEditHandler = (handler: ShipmentHandler) => {
    setEditingHandler(handler);
    handlerForm.reset({
      name: handler.name,
      contact_person: handler.contact_person || '',
      email: handler.email || '',
      phone: handler.phone || '',
      service_type: handler.service_type,
      coverage_area: handler.coverage_area || '',
      status: handler.status,
      notes: handler.notes || ''
    });
    setHandlerDialogOpen(true);
  };

  const handleDeleteHandler = async (id: string) => {
    if (!confirm('Are you sure you want to delete this handler?')) return;

    try {
      await shipmentHandlersApi.delete(id);
      toast({
        title: 'Success',
        description: 'Handler deleted successfully',
      });
      loadHandlers();
    } catch (error) {
      console.error('Error deleting handler:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete handler',
        variant: 'destructive',
      });
    }
  };

  const handleViewHandler = (handler: ShipmentHandler) => {
    setSelectedHandler(handler);
    loadTransactions(handler.id);
  };

  const calculateTotalPayments = (handlerId: string) => {
    return transactions.filter(t => t.handler_id === handlerId).reduce((sum, t) => sum + Number(t.amount), 0);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading shipment handlers...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shipment Handlers</h1>
          <p className="text-muted-foreground">Manage logistics partners and transactions</p>
        </div>
        <Dialog open={handlerDialogOpen} onOpenChange={setHandlerDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingHandler(null); handlerForm.reset(); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Handler
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingHandler ? 'Edit Handler' : 'Add New Handler'}</DialogTitle>
            </DialogHeader>
            <Form {...handlerForm}>
              <form onSubmit={handlerForm.handleSubmit(handleHandlerSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={handlerForm.control}
                    name="name"
                    rules={{ required: 'Handler name is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Handler Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter handler name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={handlerForm.control}
                    name="contact_person"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter contact person" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={handlerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="handler@example.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={handlerForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+91 1234567890" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={handlerForm.control}
                    name="service_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="courier">Courier</SelectItem>
                            <SelectItem value="freight">Freight</SelectItem>
                            <SelectItem value="local_delivery">Local Delivery</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={handlerForm.control}
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
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={handlerForm.control}
                  name="coverage_area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coverage Area</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Karnataka, South India" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={handlerForm.control}
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
                  <Button type="button" variant="outline" onClick={() => setHandlerDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingHandler ? 'Update' : 'Create'} Handler
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Handlers</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{handlers.length}</div>
            <p className="text-xs text-muted-foreground">
              {handlers.filter(h => h.status === 'active').length} active
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Handlers List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Coverage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {handlers.map((handler) => (
                <TableRow key={handler.id}>
                  <TableCell className="font-medium">{handler.name}</TableCell>
                  <TableCell>{handler.contact_person || '-'}</TableCell>
                  <TableCell>{handler.phone || '-'}</TableCell>
                  <TableCell className="capitalize">{handler.service_type.replace('_', ' ')}</TableCell>
                  <TableCell>{handler.coverage_area || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={handler.status === 'active' ? 'default' : 'secondary'}>
                      {handler.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleViewHandler(handler)}>
                      View
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEditHandler(handler)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteHandler(handler.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedHandler && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{selectedHandler.name} - Transactions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Total Paid: ₹{calculateTotalPayments(selectedHandler.id).toFixed(2)}
              </p>
            </div>
            <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => transactionForm.setValue('handler_id', selectedHandler.id)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Payment</DialogTitle>
                </DialogHeader>
                <Form {...transactionForm}>
                  <form onSubmit={transactionForm.handleSubmit(handleTransactionSubmit)} className="space-y-4">
                    <FormField
                      control={transactionForm.control}
                      name="amount"
                      rules={{ required: 'Amount is required', min: { value: 0, message: 'Amount must be positive' } }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (₹)</FormLabel>
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
                      control={transactionForm.control}
                      name="payment_method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                              <SelectItem value="cheque">Cheque</SelectItem>
                              <SelectItem value="upi">UPI</SelectItem>
                              <SelectItem value="card">Card</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={transactionForm.control}
                      name="reference_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reference Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Transaction reference" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={transactionForm.control}
                      name="transaction_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Date</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={transactionForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Payment details" rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setTransactionDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Record Payment</Button>
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
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{new Date(transaction.transaction_date).toLocaleDateString()}</TableCell>
                    <TableCell>₹{Number(transaction.amount).toFixed(2)}</TableCell>
                    <TableCell className="capitalize">{transaction.payment_method?.replace('_', ' ')}</TableCell>
                    <TableCell>{transaction.reference_number || '-'}</TableCell>
                    <TableCell>{transaction.description || '-'}</TableCell>
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
