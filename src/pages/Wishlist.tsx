import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { wishlistApi } from '@/db/api';
import { supabase } from '@/db/supabase';
import type { WishlistWithProduct } from '@/types/types';

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndLoadWishlist();
  }, []);

  const checkAuthAndLoadWishlist = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/login');
      return;
    }

    setUserId(user.id);
    await loadWishlist(user.id);
  };

  const loadWishlist = async (uid: string) => {
    try {
      setLoading(true);
      const data = await wishlistApi.getWishlist(uid);
      setWishlistItems(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load wishlist',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    if (!userId) return;

    try {
      await wishlistApi.removeFromWishlist(userId, productId);
      setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
      toast({
        title: 'Removed',
        description: 'Product removed from wishlist',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove product',
        variant: 'destructive',
      });
    }
  };

  const handleClearWishlist = async () => {
    if (!userId) return;

    try {
      await wishlistApi.clearWishlist(userId);
      setWishlistItems([]);
      toast({
        title: 'Cleared',
        description: 'Wishlist cleared successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear wishlist',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Package className="w-12 h-12 mx-auto mb-4 animate-pulse text-muted-foreground" />
            <p className="text-muted-foreground">Loading wishlist...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-500 fill-current" />
            My Wishlist
          </h1>
          <p className="text-muted-foreground mt-1">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        {wishlistItems.length > 0 && (
          <Button
            variant="outline"
            onClick={handleClearWishlist}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Empty State */}
      {wishlistItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Heart className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Start adding products you love to your wishlist and they'll appear here
            </p>
            <Button asChild>
              <Link to="/">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Wishlist Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                {/* Product Image */}
                <Link to={`/product/${item.product_id}`} className="block mb-4">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    {item.product?.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </Link>

                {/* Product Info */}
                <div className="space-y-2">
                  <Link to={`/product/${item.product_id}`}>
                    <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
                      {item.product?.name || 'Product'}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      ₹{item.product?.base_price?.toFixed(2) || '0.00'}
                    </span>
                    {item.product?.stock !== undefined && (
                      <span className={`text-sm ${
                        item.product.stock > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      asChild
                      className="flex-1"
                      disabled={!item.product?.stock || item.product.stock === 0}
                    >
                      <Link to={`/product/${item.product_id}`}>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        View
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveItem(item.product_id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
