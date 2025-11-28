import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsApi } from '@/db/api';
import type { ProductWithVariants, ProductVariant } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Leaf, ShoppingCart, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/components/auth/AuthProvider';
import WishlistButton from '@/components/wishlist/WishlistButton';
import ReviewsList from '@/components/reviews/ReviewsList';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductWithVariants | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { addItem } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const data = await productsApi.getById(id!);
      setProduct(data);
      if (data?.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0]);
      }
    } catch (error: any) {
      toast({
        title: 'Error loading product',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    // Calculate original price before discount
    const originalPrice = selectedVariant.discount_percentage > 0 
      ? selectedVariant.price / (1 - selectedVariant.discount_percentage / 100)
      : selectedVariant.price;

    addItem({
      product_id: product.id,
      variant_id: selectedVariant.id,
      name: product.name,
      price: selectedVariant.price,
      quantity,
      image_url: product.image_url || undefined,
      packaging_size: selectedVariant.packaging_size,
      discount_percentage: selectedVariant.discount_percentage,
      original_price: originalPrice,
    });

    toast({
      title: 'Added to cart',
      description: `${quantity}x ${product.name} (${selectedVariant.packaging_size})`,
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6 bg-muted" />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <Skeleton className="h-96 w-full bg-muted" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4 bg-muted" />
            <Skeleton className="h-20 w-full bg-muted" />
            <Skeleton className="h-32 w-full bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Product not found</p>
        <Button onClick={() => navigate('/')} className="mt-4">
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
          <Leaf className="w-32 h-32 text-muted-foreground/30" />
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl xl:text-4xl font-bold">{product.name}</h1>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {product.category}
                </Badge>
                {user && <WishlistButton productId={product.id} />}
              </div>
            </div>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Size</label>
                <div className="grid grid-cols-2 gap-2">
                  {product.variants?.map((variant) => (
                    <Button
                      key={variant.id}
                      variant={selectedVariant?.id === variant.id ? 'default' : 'outline'}
                      onClick={() => setSelectedVariant(variant)}
                      className="flex flex-col h-auto py-3 relative"
                    >
                      {variant.discount_percentage > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-2 -right-2 text-xs px-1.5 py-0.5"
                        >
                          {variant.discount_percentage}% OFF
                        </Badge>
                      )}
                      <Package className="w-4 h-4 mb-1" />
                      <span className="font-semibold">{variant.packaging_size}</span>
                      <span className="text-xs">₹{variant.price.toFixed(2)}</span>
                      {variant.discount_percentage > 0 && (
                        <span className="text-xs line-through opacity-60">
                          ₹{(variant.price / (1 - variant.discount_percentage / 100)).toFixed(2)}
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedVariant && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Quantity</label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        -
                      </Button>
                      <span className="w-12 text-center font-semibold">{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-medium">Total Price</span>
                      <span className="text-2xl font-bold text-primary">
                        ₹{(selectedVariant.price * quantity).toFixed(2)}
                      </span>
                    </div>
                    <Button onClick={handleAddToCart} className="w-full" size="lg">
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reviews Section */}
      <Separator className="my-12" />
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        <ReviewsList productId={product.id} />
      </div>
    </div>
  );
}
