import { useState, useEffect } from 'react';
import { profilesApi, ordersApi } from '@/db/api';
import type { Profile, Order } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { UserCog, ShoppingBag } from 'lucide-react';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Profile | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersDialogOpen, setOrdersDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await profilesApi.getAllProfiles();
      setCustomers(data);
    } catch (error: any) {
      toast({
        title: 'Error loading customers',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerOrders = async (customerId: string) => {
    try {
      const allOrders = await ordersApi.getAll();
      const filtered = allOrders.filter(order => order.user_id === customerId);
      setCustomerOrders(filtered);
    } catch (error: any) {
      toast({
        title: 'Error loading orders',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleViewOrders = (customer: Profile) => {
    setSelectedCustomer(customer);
    loadCustomerOrders(customer.id);
    setOrdersDialogOpen(true);
  };

  const handlePromoteToAdmin = async (customerId: string) => {
    if (!confirm('Are you sure you want to promote this user to admin?')) {
      return;
    }

    try {
      await profilesApi.promoteToAdmin(customerId);
      toast({
        title: 'User promoted',
        description: 'User has been promoted to admin successfully'
      });
      loadCustomers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const calculateTotalSpent = (orders: Order[]) => {
    return orders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + order.total_amount + (order.shipping_cost || 0), 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Customer Management</h2>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading customers...</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Customers ({customers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Nickname</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.email}</TableCell>
                    <TableCell>{customer.nickname || '-'}</TableCell>
                    <TableCell>{customer.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={customer.role === 'admin' ? 'default' : 'secondary'}>
                        {customer.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(customer.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewOrders(customer)}
                        >
                          <ShoppingBag className="h-4 w-4" />
                        </Button>
                        {customer.role !== 'admin' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePromoteToAdmin(customer.id)}
                          >
                            <UserCog className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={ordersDialogOpen} onOpenChange={setOrdersDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Orders for {selectedCustomer?.nickname || selectedCustomer?.email}
            </DialogTitle>
          </DialogHeader>
          
          {customerOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders found for this customer
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{customerOrders.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {customerOrders.filter(o => o.status === 'completed').length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₹{calculateTotalSpent(customerOrders).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead>Shipping</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">
                        {order.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{order.items?.length || 0}</TableCell>
                      <TableCell>₹{order.total_amount.toFixed(2)}</TableCell>
                      <TableCell>₹{(order.shipping_cost || 0).toFixed(2)}</TableCell>
                      <TableCell className="font-medium">
                        ₹{(order.total_amount + (order.shipping_cost || 0)).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === 'completed' ? 'default' :
                            order.status === 'pending' ? 'secondary' :
                            'destructive'
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
