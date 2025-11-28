import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { reviewsApi } from '@/db/api';
import StarRatingInput from './StarRatingInput';
import type { ReviewRating } from '@/types/types';

interface ReviewFormProps {
  productId: string;
  userId: string;
  onReviewSubmitted?: () => void;
}

export default function ReviewForm({ productId, userId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState<ReviewRating>(0 as ReviewRating);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      toast({
        title: 'Rating Required',
        description: 'Please select a star rating',
        variant: 'destructive',
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: 'Review Required',
        description: 'Please write a review',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      await reviewsApi.createReview(
        productId,
        userId,
        rating,
        title.trim() || undefined,
        comment.trim()
      );

      toast({
        title: 'Review Submitted',
        description: 'Thank you for your review!',
      });

      // Reset form
      setRating(0 as ReviewRating);
      setTitle('');
      setComment('');

      // Notify parent
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit review',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div className="space-y-2">
            <Label>Your Rating *</Label>
            <StarRatingInput
              value={rating}
              onChange={(r) => setRating(r as ReviewRating)}
              size="lg"
              disabled={submitting}
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="review-title">Review Title (Optional)</Label>
            <Input
              id="review-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sum up your experience"
              maxLength={100}
              disabled={submitting}
            />
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="review-comment">Your Review *</Label>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this product..."
              rows={5}
              maxLength={1000}
              disabled={submitting}
              required
            />
            <p className="text-xs text-muted-foreground">
              {comment.length}/1000 characters
            </p>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
