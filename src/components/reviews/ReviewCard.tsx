import { useState } from 'react';
import { ThumbsUp, Shield, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { reviewsApi } from '@/db/api';
import StarRating from './StarRating';
import type { ProductReviewWithUser } from '@/types/types';

interface ReviewCardProps {
  review: ProductReviewWithUser;
  currentUserId?: string;
  onReviewDeleted?: () => void;
  onReviewUpdated?: () => void;
}

export default function ReviewCard({ 
  review, 
  currentUserId,
  onReviewDeleted,
  onReviewUpdated
}: ReviewCardProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isOwnReview = currentUserId === review.user_id;

  const handleVoteHelpful = async () => {
    if (!currentUserId) {
      toast({
        title: 'Login Required',
        description: 'Please login to vote',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (hasVoted) {
        await reviewsApi.unmarkReviewHelpful(review.id, currentUserId);
        setHasVoted(false);
        setHelpfulCount(prev => prev - 1);
      } else {
        await reviewsApi.markReviewHelpful(review.id, currentUserId);
        setHasVoted(true);
        setHelpfulCount(prev => prev + 1);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to vote',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await reviewsApi.deleteReview(review.id);
      toast({
        title: 'Deleted',
        description: 'Review deleted successfully',
      });
      if (onReviewDeleted) onReviewDeleted();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete review',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <StarRating rating={review.rating} size="sm" />
              {review.verified_purchase && (
                <Badge variant="secondary" className="gap-1">
                  <Shield className="w-3 h-3" />
                  Verified Purchase
                </Badge>
              )}
            </div>
            {review.title && (
              <h4 className="font-semibold text-lg mb-1">{review.title}</h4>
            )}
            <p className="text-sm text-muted-foreground">
              By {review.user?.full_name || review.user?.nickname || 'Anonymous'} on {formatDate(review.created_at)}
            </p>
          </div>
          {isOwnReview && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Comment */}
        <p className="text-sm leading-relaxed mb-4 whitespace-pre-wrap">
          {review.comment}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-4 pt-3 border-t">
          <Button
            variant={hasVoted ? 'default' : 'ghost'}
            size="sm"
            onClick={handleVoteHelpful}
            disabled={loading || isOwnReview}
            className="gap-2"
          >
            <ThumbsUp className="w-4 h-4" />
            Helpful ({helpfulCount})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
