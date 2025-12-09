import { useEffect, useState } from 'react';
import { ordersApi } from '@/db/api';
import type { Order, OrderStatusHistory } from '@/types/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Printer, CreditCard, Wallet, Banknote, Split, XCircle, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import OrderTimeline from '@/components/orders/OrderTimeline';
import CancelOrderDialog from '@/components/orders/CancelOrderDialog';
import CancellationTimer from '@/components/orders/CancellationTimer';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [timelineDialogOpen, setTimelineDialogOpen] = useState(false);
  const [orderForTimeline, setOrderForTimeline] = useState<Order | null>(null);
  const [statusHistory, setStatusHistory] = useState<OrderStatusHistory[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await ordersApi.getMyOrders();
      setOrders(data);
    } catch (error: any) {
      toast({
        title: 'Error loading orders',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const canCancelOrder = (order: Order): boolean => {
    if (order.is_cancelled || order.status === 'cancelled') return false;
    if (!['pending', 'processing'].includes(order.status)) return false;

    const orderTime = new Date(order.created_at).getTime();
    const now = new Date().getTime();
    const diffMinutes = (now - orderTime) / (1000 * 60);
    return diffMinutes <= 30;
  };

  const handleCancelOrder = async (reason: string) => {
    if (!orderToCancel || !user) return;

    try {
      const result = await ordersApi.cancelOrder(orderToCancel.id, user.id, reason);
      
      if (result.success) {
        toast({
          title: 'Order Cancelled',
          description: result.message,
        });
        loadOrders();
      } else {
        toast({
          title: 'Cancellation Failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel order',
        variant: 'destructive',
      });
    }
  };

  const handleViewTimeline = async (order: Order) => {
    setOrderForTimeline(order);
    try {
      const history = await ordersApi.getOrderStatusHistory(order.id);
      setStatusHistory(history);
      setTimelineDialogOpen(true);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load order timeline',
        variant: 'destructive',
      });
    }
  };

  const getPaymentMethodIcon = (method: string | null) => {
    if (!method) return <CreditCard className="h-4 w-4" />;
    switch (method.toLowerCase()) {
      case 'cash':
        return <Banknote className="h-4 w-4" />;
      case 'upi':
        return <Wallet className="h-4 w-4" />;
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'split':
        return <Split className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getPaymentMethodLabel = (method: string | null) => {
    if (!method) return 'Card';
    return method.charAt(0).toUpperCase() + method.slice(1);
  };

  const handlePrintOrder = (order: Order) => {
    setSelectedOrder(order);
    setPrintDialogOpen(true);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="w-24 h-24 mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
        <p className="text-muted-foreground">Your order history will appear here</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                  <OrderStatusBadge status={order.status} />
                  {canCancelOrder(order) && (
                    <CancellationTimer 
                      createdAt={order.created_at}
                      onExpire={() => loadOrders()}
                    />
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewTimeline(order)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Track Order
                  </Button>
                  {canCancelOrder(order) && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setOrderToCancel(order);
                        setCancelDialogOpen(true);
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePrintOrder(order)}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                {order.payment_method && (
                  <div className="flex items-center gap-1">
                    {getPaymentMethodIcon(order.payment_method)}
                    <span>{getPaymentMethodLabel(order.payment_method)}</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Product Details Table */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-2">Product</th>
                        <th className="text-center p-2">Size</th>
                        <th className="text-center p-2">Price</th>
                        <th className="text-center p-2">Qty</th>
                        <th className="text-right p-2">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-2">
                            <div className="flex flex-col">
                              <span className="font-medium">{item.name}</span>
                              {item.discount_percentage && item.discount_percentage > 0 && (
                                <Badge variant="secondary" className="text-xs w-fit mt-1">
                                  {item.discount_percentage}% OFF
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="text-center p-2">{item.packaging_size || '-'}</td>
                          <td className="text-center p-2">
                            <div className="flex flex-col items-center">
                              <span>₹{item.price.toFixed(2)}</span>
                              {item.discount_percentage && item.discount_percentage > 0 && item.original_price && (
                                <span className="text-xs text-muted-foreground line-through">
                                  ₹{item.original_price.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="text-center p-2">{item.quantity}</td>
                          <td className="text-right p-2 font-semibold">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Order Summary */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{order.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GST ({order.gst_rate || 5}%)</span>
                    <span>₹{(order.gst_amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>₹{(order.shipping_cost || 0).toFixed(2)}</span>
                  </div>
                  {order.points_used > 0 && (
                    <div className="flex justify-between text-sm text-primary">
                      <span>Points Discount</span>
                      <span>-{order.points_used} points</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total</span>
                    <span className="text-primary">₹{(order.total_amount + (order.gst_amount || 0) + (order.shipping_cost || 0)).toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Details for Split Payments */}
                {order.payment_method === 'split' && order.payment_details && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2 text-sm">Payment Breakdown</h4>
                    <div className="space-y-1 text-sm">
                      {order.payment_details.cash > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cash</span>
                          <span>₹{order.payment_details.cash.toFixed(2)}</span>
                        </div>
                      )}
                      {order.payment_details.upi > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">UPI</span>
                          <span>₹{order.payment_details.upi.toFixed(2)}</span>
                        </div>
                      )}
                      {order.payment_details.card > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Card</span>
                          <span>₹{order.payment_details.card.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cancel Order Dialog */}
      <CancelOrderDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleCancelOrder}
        orderNumber={orderToCancel?.id.slice(0, 8) || ''}
      />

      {/* Order Timeline Dialog */}
      <Dialog open={timelineDialogOpen} onOpenChange={setTimelineDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Tracking</DialogTitle>
          </DialogHeader>
          {orderForTimeline && (
            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              <TabsContent value="timeline" className="mt-4">
                <OrderTimeline
                  currentStatus={orderForTimeline.status}
                  statusHistory={statusHistory}
                  trackingNumber={orderForTimeline.tracking_number}
                  estimatedDelivery={orderForTimeline.estimated_delivery}
                />
              </TabsContent>
              <TabsContent value="details" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Order ID</p>
                    <p className="font-semibold">#{orderForTimeline.id.slice(0, 8)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <OrderStatusBadge status={orderForTimeline.status} />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Order Date</p>
                    <p className="font-semibold">
                      {new Date(orderForTimeline.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="font-semibold">
                      ₹{(orderForTimeline.total_amount + (orderForTimeline.gst_amount || 0) + (orderForTimeline.shipping_cost || 0)).toFixed(2)}
                    </p>
                  </div>
                  {orderForTimeline.customer_name && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Customer Name</p>
                      <p className="font-semibold">{orderForTimeline.customer_name}</p>
                    </div>
                  )}
                  {orderForTimeline.shipping_address && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Shipping Address</p>
                      <p className="font-semibold">{orderForTimeline.shipping_address}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Print Dialog */}
      <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print-content">
          <DialogHeader className="no-print">
            <DialogTitle>Order Bill</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="text-center border-b-2 border-foreground pb-4">
                <h1 className="text-3xl font-bold">Srilaya Enterprises</h1>
                <p className="text-muted-foreground">Organic Store</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Order ID:</strong> {selectedOrder.id.slice(0, 8).toUpperCase()}
                </div>
                <div className="text-right">
                  <strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleDateString()}
                </div>
                <div>
                  <strong>Status:</strong> <span className="uppercase">{selectedOrder.status}</span>
                </div>
                <div className="text-right">
                  <strong>Payment:</strong> {getPaymentMethodLabel(selectedOrder.payment_method)}
                </div>
                {selectedOrder.customer_name && (
                  <div className="col-span-2">
                    <strong>Customer:</strong> {selectedOrder.customer_name}
                  </div>
                )}
              </div>

              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-foreground">
                    <th className="text-left p-2">Product</th>
                    <th className="text-center p-2">Size</th>
                    <th className="text-center p-2">Price</th>
                    <th className="text-center p-2">Qty</th>
                    <th className="text-right p-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2">{item.name}</td>
                      <td className="text-center p-2">{item.packaging_size || '-'}</td>
                      <td className="text-center p-2">₹{item.price.toFixed(2)}</td>
                      <td className="text-center p-2">{item.quantity}</td>
                      <td className="text-right p-2">₹{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="ml-auto w-80 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{selectedOrder.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST ({selectedOrder.gst_rate}%):</span>
                  <span>₹{selectedOrder.gst_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>₹{selectedOrder.shipping_cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t-2 border-foreground pt-2 font-bold text-lg">
                  <span>Total:</span>
                  <span>₹{(selectedOrder.total_amount + selectedOrder.gst_amount + selectedOrder.shipping_cost).toFixed(2)}</span>
                </div>
              </div>

              {selectedOrder.payment_method === 'split' && selectedOrder.payment_details && (
                <div className="border-t pt-4">
                  <strong>Payment Breakdown:</strong>
                  <div className="mt-2 space-y-1">
                    {selectedOrder.payment_details.cash > 0 && (
                      <div className="flex justify-between">
                        <span>Cash:</span>
                        <span>₹{selectedOrder.payment_details.cash.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedOrder.payment_details.upi > 0 && (
                      <div className="flex justify-between">
                        <span>UPI:</span>
                        <span>₹{selectedOrder.payment_details.upi.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedOrder.payment_details.card > 0 && (
                      <div className="flex justify-between">
                        <span>Card:</span>
                        <span>₹{selectedOrder.payment_details.card.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="text-center text-sm text-muted-foreground border-t pt-4">
                <p>Thank you for your business!</p>
                <p>For any queries, please contact us.</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
