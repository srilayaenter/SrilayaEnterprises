import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2, Home, Package, Printer, Mail, Share2, CreditCard, Wallet, Banknote, Split } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/types/types';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [showBill, setShowBill] = useState(false);
  const { clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if order data was passed through navigation state
    if (location.state?.order) {
      setOrder(location.state.order);
      setVerified(true);
      setVerifying(false);
      clearCart();
      toast({
        title: 'Order Confirmed!',
        description: 'Your order has been successfully placed.',
      });
    } else if (sessionId) {
      verifyPayment();
    } else if (orderId) {
      // Direct order confirmation (for in-store purchases)
      verifyDirectOrder();
    } else {
      setVerifying(false);
      setError('No session ID or order ID found');
    }
  }, [sessionId, orderId, location.state]);

  const verifyDirectOrder = async () => {
    try {
      const { data, error } = await supabase.rpc('get_order_by_id', {
        p_order_id: orderId
      });

      if (error) throw error;
      
      const orderData = Array.isArray(data) ? data[0] : data;
      
      if (orderData) {
        setOrder(orderData);
        setVerified(true);
        clearCart();
        toast({
          title: 'Order Confirmed!',
          description: 'Your order has been successfully placed.',
        });
      } else {
        setError('Order not found');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setVerifying(false);
    }
  };

  const verifyPayment = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('verify_stripe_payment', {
        body: JSON.stringify({ sessionId }),
      });

      if (error) {
        const errorMsg = await error?.context?.text();
        throw new Error(errorMsg || 'Failed to verify payment');
      }

      if (data?.data?.verified) {
        setVerified(true);
        setOrder(data?.data?.order);
        clearCart();
        toast({
          title: 'Payment Successful!',
          description: 'Your payment has been processed successfully.',
        });
      } else {
        setError('Payment not completed');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setVerifying(false);
    }
  };

  const handlePrint = () => {
    setShowBill(true);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleEmail = async () => {
    if (!order) return;
    
    setShowBill(true);
    
    try {
      const { error } = await supabase.functions.invoke('send_bill_email', {
        body: JSON.stringify({ orderId: order.id }),
      });

      if (error) {
        const errorMsg = await error?.context?.text();
        throw new Error(errorMsg || 'Failed to send email');
      }

      toast({
        title: 'Email Sent!',
        description: 'Bill has been sent to your email address.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleWhatsAppShare = () => {
    if (!order) return;
    
    const message = `Order Confirmation\n\nOrder ID: ${order.id}\nTotal: ₹${(order.total_amount + order.gst_amount + order.shipping_cost).toFixed(2)}\nStatus: ${order.status}\n\nThank you for your order!`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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

  if (verifying) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-12">
            <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin mb-4" />
            <p className="text-lg">Verifying your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-2xl mx-auto print-bill">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {verified ? (
              <CheckCircle2 className="w-20 h-20 text-primary" />
            ) : (
              <XCircle className="w-20 h-20 text-destructive" />
            )}
          </div>
          <CardTitle className="text-3xl">
            {verified ? 'Order Confirmed!' : 'Payment Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground text-lg">
              {verified
                ? 'Thank you for your order! Your payment has been processed successfully.'
                : error || 'There was an issue processing your payment.'}
            </p>
          </div>

          {verified && order && (
            <div className="space-y-6 border-t pt-6">
              {/* Quick Order Summary */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Order ID</p>
                  <p className="font-semibold">{order.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant="default" className="capitalize">{order.status}</Badge>
                </div>
              </div>

              {/* Action Buttons - View, Print or Email to view bill */}
              {!showBill && (
                <div className="border-t pt-6">
                  <p className="text-center text-muted-foreground mb-4">
                    Click below to view your bill details
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button variant="default" size="lg" onClick={() => setShowBill(true)}>
                      <Package className="h-5 w-5 mr-2" />
                      View Bill
                    </Button>
                    <Button variant="outline" size="lg" onClick={handlePrint}>
                      <Printer className="h-5 w-5 mr-2" />
                      Print Bill
                    </Button>
                    <Button variant="outline" size="lg" onClick={handleEmail}>
                      <Mail className="h-5 w-5 mr-2" />
                      Email Bill
                    </Button>
                  </div>
                </div>
              )}

              {/* Full Bill Details - Show only when requested */}
              {showBill && (
                <>
                  {/* Order Header Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
                    <div>
                      <p className="text-muted-foreground">Order Type</p>
                      <p className="font-semibold capitalize">{order.order_type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payment Method</p>
                      <div className="flex items-center gap-2 font-semibold">
                        {getPaymentMethodIcon(order.payment_method)}
                        <span>{getPaymentMethodLabel(order.payment_method)}</span>
                      </div>
                    </div>
                  </div>

              {/* Product Details Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3">Product</th>
                      <th className="text-center p-3">Size</th>
                      <th className="text-center p-3">Price</th>
                      <th className="text-center p-3">Qty</th>
                      <th className="text-right p-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-medium">{item.name}</span>
                            {item.discount_percentage && item.discount_percentage > 0 && (
                              <Badge variant="secondary" className="text-xs w-fit mt-1">
                                {item.discount_percentage}% OFF
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="text-center p-3">{item.packaging_size || '-'}</td>
                        <td className="text-center p-3">
                          <div className="flex flex-col items-center">
                            <span>₹{item.price.toFixed(2)}</span>
                            {item.discount_percentage && item.discount_percentage > 0 && item.original_price && (
                              <span className="text-xs text-muted-foreground line-through">
                                ₹{item.original_price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="text-center p-3">{item.quantity}</td>
                        <td className="text-right p-3 font-semibold">
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
                  <span className="text-muted-foreground">GST ({order.gst_rate}%)</span>
                  <span>₹{order.gst_amount.toFixed(2)}</span>
                </div>
                {order.shipping_cost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>₹{order.shipping_cost.toFixed(2)}</span>
                  </div>
                )}
                {order.points_used > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Points Used</span>
                    <span>-{order.points_used} points</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total Amount</span>
                  <span className="text-primary">
                    ₹{(order.total_amount + order.gst_amount + order.shipping_cost).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Details for Split Payments */}
              {order.payment_method === 'split' && order.payment_details && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Payment Breakdown</h4>
                  <div className="space-y-2">
                    {order.payment_details.cash > 0 && (
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-4 w-4" />
                          <span>Cash</span>
                        </div>
                        <span className="font-medium">₹{order.payment_details.cash.toFixed(2)}</span>
                      </div>
                    )}
                    {order.payment_details.upi > 0 && (
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4" />
                          <span>UPI</span>
                        </div>
                        <span className="font-medium">₹{order.payment_details.upi.toFixed(2)}</span>
                      </div>
                    )}
                    {order.payment_details.card > 0 && (
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          <span>Card</span>
                        </div>
                        <span className="font-medium">₹{order.payment_details.card.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-4 border-t no-print">
                <Button variant="outline" size="sm" onClick={handlePrint} className="flex-1">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Bill
                </Button>
                <Button variant="outline" size="sm" onClick={handleEmail} className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Bill
                </Button>
                <Button variant="outline" size="sm" onClick={handleWhatsAppShare} className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
                </>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4 no-print">
            {verified && (
              <>
                <Link to="/orders" className="w-full">
                  <Button className="w-full" variant="default">
                    <Package className="h-4 w-4 mr-2" />
                    View My Orders
                  </Button>
                </Link>
                <Link to="/" className="w-full">
                  <Button variant="outline" className="w-full">
                    <Home className="h-4 w-4 mr-2" />
                    Start New Order
                  </Button>
                </Link>
              </>
            )}
            {!verified && (
              <Link to="/" className="w-full">
                <Button variant="outline" className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
