import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { wishlistApi } from '@/db/api';
import { supabase } from '@/db/supabase';

interface WishlistButtonProps {
  productId: string;
  variantId?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function WishlistButton({ 
  productId, 
  variantId, 
  size = 'md',
  showText = false 
}: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userId) {
      checkWishlistStatus();
    }
  }, [userId, productId]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);
  };

  const checkWishlistStatus = async () => {
    if (!userId) return;
    
    try {
      const inWishlist = await wishlistApi.isInWishlist(userId, productId);
      setIsInWishlist(inWishlist);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      toast({
        title: 'Login Required',
        description: 'Please login to add items to your wishlist',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (isInWishlist) {
        await wishlistApi.removeFromWishlist(userId, productId);
        setIsInWishlist(false);
        toast({
          title: 'Removed from Wishlist',
          description: 'Product removed from your wishlist',
        });
      } else {
        await wishlistApi.addToWishlist(userId, productId, variantId);
        setIsInWishlist(true);
        toast({
          title: 'Added to Wishlist',
          description: 'Product added to your wishlist',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update wishlist',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  const buttonSize = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10';

  return (
    <Button
      variant={isInWishlist ? 'default' : 'outline'}
      size={showText ? 'default' : 'icon'}
      className={`${!showText && buttonSize} transition-all duration-300 ${
        isInWishlist ? 'bg-red-500 hover:bg-red-600 text-white' : ''
      }`}
      onClick={handleToggleWishlist}
      disabled={loading}
    >
      <Heart
        className={`${iconSize} ${isInWishlist ? 'fill-current' : ''} transition-all duration-300`}
      />
      {showText && (
        <span className="ml-2">
          {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
        </span>
      )}
    </Button>
  );
}
