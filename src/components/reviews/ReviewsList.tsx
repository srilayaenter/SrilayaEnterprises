import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { reviewsApi } from '@/db/api';
import { supabase } from '@/db/supabase';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import StarRating from './StarRating';
import type { ProductReviewWithUser } from '@/types/types';

interface ReviewsListProps {
  productId: string;
}

export default function ReviewsList({ productId }: ReviewsListProps) {
  const [reviews, setReviews] = useState<ProductReviewWithUser[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<ProductReviewWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [sortBy, setSortBy] = useState('recent');
  const [filterRating, setFilterRating] = useState('all');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);

  useEffect(() => {
    checkAuth();
    loadReviews();
    loadRatingStats();
  }, [productId]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [reviews, sortBy, filterRating]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);
  };

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewsApi.getProductReviews(productId);
      setReviews(data);
      
      // Check if current user has reviewed
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userReview = data.find(r => r.user_id === user.id);
        setHasUserReviewed(!!userReview);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRatingStats = async () => {
    try {
      const [avgRating, count] = await Promise.all([
        reviewsApi.getAverageRating(productId),
        reviewsApi.getReviewCount(productId)
      ]);
      setAverageRating(avgRating);
      setReviewCount(count);
    } catch (error) {
      console.error('Error loading rating stats:', error);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...reviews];

    // Apply rating filter
    if (filterRating !== 'all') {
      const rating = parseInt(filterRating);
      filtered = filtered.filter(r => r.rating === rating);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        case 'helpful':
          return b.helpful_count - a.helpful_count;
        default:
          return 0;
      }
    });

    setFilteredReviews(filtered);
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    loadReviews();
    loadRatingStats();
  };

  if (loading) {
    return (
      <div className="py-8">
        <p className="text-center text-muted-foreground">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-muted/50 rounded-lg p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="text-center md:text-left">
            <div className="text-5xl font-bold mb-2">{averageRating.toFixed(1)}</div>
            <StarRating rating={averageRating} size="lg" />
            <p className="text-sm text-muted-foreground mt-2">
              Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 w-full">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviews.filter(r => r.rating === rating).length;
              const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center gap-2 mb-1">
                  <span className="text-sm w-8">{rating}</span>
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Write Review Button */}
      {userId && !hasUserReviewed && !showReviewForm && (
        <Button onClick={() => setShowReviewForm(true)} className="w-full">
          Write a Review
        </Button>
      )}

      {/* Review Form */}
      {showReviewForm && userId && (
        <ReviewForm
          productId={productId}
          userId={userId}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      {/* Filters and Sort */}
      {reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={filterRating} onValueChange={setFilterRating}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highest">Highest Rating</SelectItem>
              <SelectItem value="lowest">Lowest Rating</SelectItem>
              <SelectItem value="helpful">Most Helpful</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {reviews.length === 0
                ? 'No reviews yet. Be the first to review this product!'
                : 'No reviews match your filters.'}
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={userId || undefined}
              onReviewDeleted={loadReviews}
              onReviewUpdated={loadReviews}
            />
          ))
        )}
      </div>
    </div>
  );
}
