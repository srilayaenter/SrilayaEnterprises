import { useState, useEffect } from 'react';
import { reviewsApi } from '@/db/api';
import StarRating from './StarRating';

interface ProductRatingProps {
  productId: string;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  showCount?: boolean;
}

export default function ProductRating({ 
  productId, 
  size = 'sm',
  showValue = true,
  showCount = true
}: ProductRatingProps) {
  const [rating, setRating] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRating();
  }, [productId]);

  const loadRating = async () => {
    try {
      const [avgRating, reviewCount] = await Promise.all([
        reviewsApi.getAverageRating(productId),
        reviewsApi.getReviewCount(productId)
      ]);
      setRating(avgRating);
      setCount(reviewCount);
    } catch (error) {
      console.error('Error loading rating:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (count === 0) {
    return (
      <p className="text-xs text-muted-foreground">No reviews yet</p>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <StarRating 
        rating={rating} 
        size={size} 
        showValue={showValue}
      />
      {showCount && (
        <span className="text-xs text-muted-foreground">
          ({count})
        </span>
      )}
    </div>
  );
}
