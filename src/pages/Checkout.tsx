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
import { ArrowLeft, Package, MapPin, Truck } from 'lucide-react';
import type { Product } from '@/types/types';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const GST_RATE = 5; // 5% GST
  const [loading, setLoading] = useState(false);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
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

  const calculateFinalTotal = () => {
    return totalPrice + calculateGST() + shippingCost;
  };

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    } else {
      loadProducts();
    }
  }, [items, navigate]);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

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
    if (!shippingInfo.name || !shippingInfo.email || !shippingInfo.address || !shippingInfo.city || !shippingInfo.state) {
      toast({
        title: 'Incomplete information',
        description: 'Please fill in all required fields',
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

    setLoading(true);
    try {
      if (user) {
        await profilesApi.updateProfile(user.id, {
          city: shippingInfo.city,
          state: shippingInfo.state,
          address: shippingInfo.address,
          phone: shippingInfo.phone,
        });
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
          shipping_cost: shippingCost,
          customer_info: shippingInfo,
          currency: 'inr',
          payment_method_types: ['card'],
        }),
      });

      if (error) {
        const errorMsg = await error?.context?.text();
        throw new Error(errorMsg || 'Failed to create checkout session');
      }

      if (data?.data?.url) {
        window.open(data.data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: 'Checkout failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
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
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Information
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
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={shippingInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>

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

              <Button
                onClick={handleCalculateShipping}
                disabled={calculatingShipping || !shippingInfo.city || !shippingInfo.state}
                className="w-full"
                variant="outline"
              >
                <Truck className="h-4 w-4 mr-2" />
                {calculatingShipping ? 'Calculating...' : 'Calculate Shipping Cost'}
              </Button>
            </CardContent>
          </Card>
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
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>₹{calculateFinalTotal().toFixed(2)}</span>
                </div>
              </div>

              {shippingCost > 0 && (
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
                disabled={loading || shippingCost === 0}
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
