import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/db/supabase';
import { shippingApi, profilesApi, productsApi } from '@/db/api';
import { ArrowLeft, Package, MapPin, Truck, ShoppingCart, Store, CreditCard, Banknote, Smartphone, Wallet } from 'lucide-react';
import type { Product, OrderType } from '@/types/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import RedeemPoints from '@/components/loyalty/RedeemPoints';

type PaymentMethod = 'card' | 'cash' | 'upi' | 'split';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const GST_RATE = 5; // 5% GST
  const [loading, setLoading] = useState(false);
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('online');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [pointsUsed, setPointsUsed] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [splitPayment, setSplitPayment] = useState({
    cash: 0,
    digital: 0,
  });
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
  });

  const calculateGST = () => {
    return (totalPrice * GST_RATE) / 100;
  };

  const calculateSubtotalWithGST = () => {
    return totalPrice + calculateGST();
  };

  const calculateFinalTotal = () => {
    const shipping = orderType === 'online' ? shippingCost : 0;
    const total = Math.max(0, totalPrice + calculateGST() + shipping - pointsDiscount);
    return Math.round(total); // Round to nearest rupee
  };

  const getRoundingAdjustment = () => {
    const shipping = orderType === 'online' ? shippingCost : 0;
    const exactTotal = Math.max(0, totalPrice + calculateGST() + shipping - pointsDiscount);
    const roundedTotal = Math.round(exactTotal);
    return roundedTotal - exactTotal;
  };

  useEffect(() => {
    // Don't redirect if we're processing checkout (prevents race condition)
    if (items.length === 0 && !processingCheckout) {
      navigate('/cart');
    } else if (items.length > 0) {
      loadProducts();
    }
  }, [items, navigate, processingCheckout]);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  // Reset payment method when order type changes
  useEffect(() => {
    if (orderType === 'online') {
      setPaymentMethod('card'); // Online orders default to card payment
    } else {
      setPaymentMethod('cash'); // In-store orders default to cash
    }
    // Reset split payment when changing order type
    setSplitPayment({ cash: 0, digital: 0 });
  }, [orderType]);

  const loadProducts = async () => {
    try {
      const allProducts = await productsApi.getAll();
      setProducts(allProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadUserProfile = async () => {
    if (!user) return;
    try {
      const profile = await profilesApi.getProfile(user.id);
      if (profile) {
        setShippingInfo({
          name: profile.nickname || profile.full_name || '',
          email: profile.email || user.email || '',
          phone: profile.phone || '',
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const calculateTotalWeight = () => {
    return items.reduce((total, item) => {
      // Extract weight from packaging_size (e.g., "1kg" -> 1, "500g" -> 0.5)
      const packagingSize = item.packaging_size.toLowerCase();
      let weightPerUnit = 1.0;
      
      if (packagingSize.includes('kg')) {
        weightPerUnit = parseFloat(packagingSize.replace('kg', '')) || 1.0;
      } else if (packagingSize.includes('g')) {
        weightPerUnit = (parseFloat(packagingSize.replace('g', '')) || 1000) / 1000;
      }
      
      return total + (weightPerUnit * item.quantity);
    }, 0);
  };

  const calculateTotalDiscount = () => {
    return items.reduce((total, item) => {
      if (item.discount_percentage && item.discount_percentage > 0 && item.original_price) {
        const discountAmount = (item.original_price - item.price) * item.quantity;
        return total + discountAmount;
      }
      return total;
    }, 0);
  };

  const handleCalculateShipping = async () => {
    if (!shippingInfo.state || !shippingInfo.city) {
      toast({
        title: 'Missing information',
        description: 'Please enter your city and state to calculate shipping',
        variant: 'destructive',
      });
      return;
    }

    setCalculatingShipping(true);
    try {
      const totalWeight = calculateTotalWeight();
      const cost = await shippingApi.calculateShipping(
        shippingInfo.state,
        shippingInfo.city,
        totalWeight
      );
      setShippingCost(cost);
      toast({
        title: 'Shipping calculated',
        description: `Shipping cost: ₹${cost.toFixed(2)} for ${totalWeight}kg`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to calculate shipping',
        variant: 'destructive',
      });
    } finally {
      setCalculatingShipping(false);
    }
  };

  const handleCheckout = async () => {
    console.log('Checkout started', { orderType, paymentMethod, items: items.length });
    
    if (!shippingInfo.name || !shippingInfo.email || !shippingInfo.phone) {
      toast({
        title: 'Incomplete information',
        description: 'Please fill in name, email, and phone',
        variant: 'destructive',
      });
      return;
    }

    if (orderType === 'online') {
      if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.state) {
        toast({
          title: 'Incomplete shipping information',
          description: 'Please fill in all shipping address fields for online orders',
          variant: 'destructive',
        });
        return;
      }

      if (shippingCost === 0) {
        toast({
          title: 'Calculate shipping',
          description: 'Please calculate shipping cost before proceeding',
          variant: 'destructive',
        });
        return;
      }
    }

    // Validate split payment
    if (orderType === 'instore' && paymentMethod === 'split') {
      const finalTotal = calculateFinalTotal();
      const splitTotal = Math.round(splitPayment.cash + splitPayment.digital);
      if (Math.abs(splitTotal - finalTotal) > 0) {
        toast({
          title: 'Invalid split payment',
          description: `Split payment total (₹${splitTotal}) must equal order total (₹${finalTotal})`,
          variant: 'destructive',
        });
        return;
      }
    }

    setLoading(true);
    setProcessingCheckout(true); // Prevent redirect during checkout
    try {
      console.log('Updating profile...');
      if (user) {
        await profilesApi.updateProfile(user.id, {
          city: shippingInfo.city,
          state: shippingInfo.state,
          address: shippingInfo.address,
          phone: shippingInfo.phone,
        });
      }

      // For in-store purchases with cash/UPI, create order directly
      if (orderType === 'instore' && (paymentMethod === 'cash' || paymentMethod === 'upi' || paymentMethod === 'split')) {
        console.log('Creating in-store order...');
        const GST_RATE = 5;
        const subtotal = totalPrice;
        const gstAmount = (subtotal * GST_RATE) / 100;
        const finalTotal = calculateFinalTotal();

        const { data: orderData, error } = await supabase.rpc('create_order', {
          p_user_id: user?.id || null,
          p_items: items.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image_url: item.image_url,
            packaging_size: item.packaging_size,
            product_id: item.product_id,
            variant_id: item.variant_id,
          })),
          p_total_amount: subtotal,
          p_gst_rate: GST_RATE,
          p_gst_amount: gstAmount,
          p_shipping_cost: 0,
          p_points_used: pointsUsed,
          p_currency: 'inr',
          p_status: 'completed',
          p_order_type: 'instore',
          p_payment_method: paymentMethod,
          p_payment_details: paymentMethod === 'split' ? splitPayment : null,
          p_customer_name: shippingInfo.name,
          p_customer_email: shippingInfo.email,
          p_customer_phone: shippingInfo.phone,
          p_completed_at: new Date().toISOString(),
        });

        if (error) {
          console.error('Order creation error:', error);
          throw error;
        }

        const order = Array.isArray(orderData) ? orderData[0] : orderData;
        console.log('Order created:', order?.id);

        // Redeem loyalty points if used (idempotent)
        if (pointsUsed > 0 && user && order?.id) {
          try {
            await supabase.rpc('redeem_loyalty_points', {
              p_user_id: user.id,
              p_order_id: order.id,
              p_points: pointsUsed,
            });
            console.log(`Redeemed ${pointsUsed} points for order ${order.id}`);
          } catch (error) {
            console.error('Failed to redeem points:', error);
            // Don't fail the entire checkout if point redemption fails
          }
        }

        // Award loyalty points for the purchase (idempotent)
        if (user && order?.id && finalTotal > 0) {
          try {
            const pointsAwarded = await supabase.rpc('award_loyalty_points', {
              p_user_id: user.id,
              p_order_id: order.id,
              p_order_amount: finalTotal,
            });
            console.log(`Awarded ${pointsAwarded} points for order ${order.id}`);
          } catch (error) {
            console.error('Failed to award points:', error);
            // Don't fail the entire checkout if point awarding fails
          }
        }

        console.log('Navigating to payment success...');
        // Clear cart immediately before navigation
        clearCart();
        
        // Navigate with replace to avoid back button issues
        navigate(`/payment-success?order_id=${order?.id}`, {
          state: { order },
          replace: true
        });
        
        // Keep processingCheckout flag set to prevent redirect
        return;
      }

      // For online orders or in-store card payments, use Stripe
      console.log('Creating Stripe checkout...');
      
      // Determine Stripe payment method types based on selected payment method
      // Note: Stripe Checkout in India primarily supports card payments
      // UPI preference is stored in database but Stripe checkout uses card
      let stripePaymentMethods = ['card'];
      if (paymentMethod === 'upi') {
        // Store UPI preference but use card for Stripe checkout
        // In future, this can be enhanced with Stripe Payment Links for UPI
        stripePaymentMethods = ['card'];
      } else if (paymentMethod === 'card') {
        stripePaymentMethods = ['card'];
      }
      
      const { data, error } = await supabase.functions.invoke('create_stripe_checkout', {
        body: JSON.stringify({
          items: items.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image_url: item.image_url,
            packaging_size: item.packaging_size,
            product_id: item.product_id,
            variant_id: item.variant_id,
          })),
          order_type: orderType,
          shipping_cost: orderType === 'online' ? shippingCost : 0,
          points_used: pointsUsed,
          points_discount: pointsDiscount,
          customer_info: shippingInfo,
          currency: 'inr',
          payment_method_types: stripePaymentMethods,
          payment_method: paymentMethod,
        }),
      });

      if (error) {
        console.error('Stripe checkout error:', error);
        const errorMsg = await error?.context?.text();
        throw new Error(errorMsg || 'Failed to create checkout session');
      }

      console.log('Stripe response:', data);
      if (data?.data?.url) {
        // Open Stripe checkout in new tab
        const stripeWindow = window.open(data.data.url, '_blank');
        
        if (stripeWindow) {
          toast({
            title: 'Redirecting to payment',
            description: 'Please complete your payment in the new tab',
          });
        } else {
          toast({
            title: 'Pop-up blocked',
            description: 'Please allow pop-ups and try again',
            variant: 'destructive',
          });
        }
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout failed',
        description: error.message,
        variant: 'destructive',
      });
      setProcessingCheckout(false); // Reset flag on error
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePointsApplied = (points: number, discount: number) => {
    setPointsUsed(points);
    setPointsDiscount(discount);
    toast({
      title: 'Points applied',
      description: `${points} points redeemed for ₹${discount.toFixed(2)} discount`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/cart')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Cart
      </Button>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Type</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={orderType} onValueChange={(value: OrderType) => setOrderType(value)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Label
                    htmlFor="online"
                    className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      orderType === 'online' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="online" id="online" />
                    <div className="flex items-center gap-2 flex-1">
                      <ShoppingCart className="h-5 w-5" />
                      <div>
                        <div className="font-semibold">Online Order</div>
                        <div className="text-sm text-muted-foreground">Delivery to your address</div>
                      </div>
                    </div>
                  </Label>
                  
                  <Label
                    htmlFor="instore"
                    className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      orderType === 'instore' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="instore" id="instore" />
                    <div className="flex items-center gap-2 flex-1">
                      <Store className="h-5 w-5" />
                      <div>
                        <div className="font-semibold">In-Store Purchase</div>
                        <div className="text-sm text-muted-foreground">Pick up at store</div>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {orderType === 'instore' && (
                    <Label
                      htmlFor="cash"
                      className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value="cash" id="cash" />
                      <div className="flex items-center gap-2 flex-1">
                        <Banknote className="h-5 w-5" />
                        <div>
                          <div className="font-semibold">Cash</div>
                          <div className="text-sm text-muted-foreground">Pay with cash</div>
                        </div>
                      </div>
                    </Label>
                  )}

                  <Label
                    htmlFor="upi"
                    className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="upi" id="upi" />
                    <div className="flex items-center gap-2 flex-1">
                      <Smartphone className="h-5 w-5" />
                      <div>
                        <div className="font-semibold">UPI</div>
                        <div className="text-sm text-muted-foreground">
                          {orderType === 'online' ? 'Pay via UPI' : 'GPay, PhonePe, Paytm'}
                        </div>
                      </div>
                    </div>
                  </Label>

                  <Label
                    htmlFor="card"
                    className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="card" id="card" />
                    <div className="flex items-center gap-2 flex-1">
                      <CreditCard className="h-5 w-5" />
                      <div>
                        <div className="font-semibold">Card</div>
                        <div className="text-sm text-muted-foreground">Credit/Debit card</div>
                      </div>
                    </div>
                  </Label>

                  {orderType === 'instore' && (
                    <Label
                      htmlFor="split"
                      className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'split' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value="split" id="split" />
                      <div className="flex items-center gap-2 flex-1">
                        <Wallet className="h-5 w-5" />
                        <div>
                          <div className="font-semibold">Split Payment</div>
                          <div className="text-sm text-muted-foreground">Cash + Digital</div>
                        </div>
                      </div>
                    </Label>
                  )}
                </div>
              </RadioGroup>

              {paymentMethod === 'split' && orderType === 'instore' && (
                <div className="mt-4 space-y-4 p-4 border rounded-lg bg-muted/30">
                  <div className="text-sm font-semibold">Split Payment Details</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cash-amount">Cash Amount (₹)</Label>
                      <Input
                        id="cash-amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={splitPayment.cash}
                        onChange={(e) => setSplitPayment(prev => ({ ...prev, cash: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="digital-amount">Digital Amount (₹)</Label>
                      <Input
                        id="digital-amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={splitPayment.digital}
                        onChange={(e) => setSplitPayment(prev => ({ ...prev, digital: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total: ₹{Math.round(splitPayment.cash + splitPayment.digital)} / ₹{calculateFinalTotal()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {orderType === 'online' ? 'Shipping Information' : 'Contact Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={shippingInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={shippingInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>

              {orderType === 'online' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={shippingInfo.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Street address, apartment, etc."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={shippingInfo.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Enter your city"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={shippingInfo.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="Enter your state"
                      />
                    </div>
                  </div>
                </>
              )}

              {orderType === 'online' && (
                <Button
                  onClick={handleCalculateShipping}
                  disabled={calculatingShipping || !shippingInfo.city || !shippingInfo.state}
                  className="w-full"
                  variant="outline"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  {calculatingShipping ? 'Calculating...' : 'Calculate Shipping Cost'}
                </Button>
              )}
            </CardContent>
          </Card>

          {user && (
            <RedeemPoints
              userId={user.id}
              orderTotal={totalPrice}
              onPointsApplied={handlePointsApplied}
            />
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.variant_id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.name} ({item.packaging_size}) × {item.quantity}
                        {item.discount_percentage && item.discount_percentage > 0 && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {item.discount_percentage}% OFF
                          </Badge>
                        )}
                      </span>
                      <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    {item.discount_percentage && item.discount_percentage > 0 && item.original_price && (
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Original Price</span>
                        <span className="line-through">₹{(item.original_price * item.quantity).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                {calculateTotalDiscount() > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Total Discount Savings</span>
                    <span className="font-medium">-₹{calculateTotalDiscount().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST ({GST_RATE}%)</span>
                  <span className="font-medium">₹{calculateGST().toFixed(2)}</span>
                </div>
                {orderType === 'online' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Weight</span>
                      <span className="font-medium">{calculateTotalWeight().toFixed(2)}kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium">
                        {shippingCost > 0 ? `₹${shippingCost.toFixed(2)}` : 'Calculate'}
                      </span>
                    </div>
                  </>
                )}
                {orderType === 'instore' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium text-green-600">Free (In-Store Pickup)</span>
                  </div>
                )}
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Points Discount ({pointsUsed} points)</span>
                    <span className="font-medium">-₹{pointsDiscount.toFixed(2)}</span>
                  </div>
                )}
                {Math.abs(getRoundingAdjustment()) > 0.01 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rounding Adjustment</span>
                    <span className={`font-medium ${getRoundingAdjustment() > 0 ? 'text-muted-foreground' : 'text-green-600'}`}>
                      {getRoundingAdjustment() > 0 ? '+' : ''}₹{getRoundingAdjustment().toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>₹{calculateFinalTotal()}</span>
                </div>
              </div>

              {orderType === 'online' && shippingCost > 0 && (
                <div className="bg-muted p-3 rounded text-sm">
                  <p className="text-muted-foreground">
                    {shippingInfo.state.toLowerCase() === 'karnataka' 
                      ? '📍 Local delivery (same state)'
                      : '🚚 Interstate delivery'}
                  </p>
                </div>
              )}

              <Button
                onClick={handleCheckout}
                disabled={
                  loading || 
                  !shippingInfo.name || 
                  !shippingInfo.email || 
                  !shippingInfo.phone ||
                  (orderType === 'online' && (!shippingInfo.address || !shippingInfo.city || !shippingInfo.state || shippingCost === 0))
                }
                className="w-full"
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
