import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  reviewCount?: number;
}

export default function StarRating({ 
  rating, 
  maxRating = 5, 
  size = 'md',
  showValue = false,
  reviewCount
}: StarRatingProps) {
  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  
  const stars = [];
  for (let i = 1; i <= maxRating; i++) {
    const fillPercentage = Math.min(Math.max(rating - (i - 1), 0), 1) * 100;
    
    stars.push(
      <div key={i} className="relative inline-block">
        {/* Background star (empty) */}
        <Star className={`${iconSize} text-gray-300`} />
        
        {/* Foreground star (filled) */}
        <div
          className="absolute top-0 left-0 overflow-hidden"
          style={{ width: `${fillPercentage}%` }}
        >
          <Star className={`${iconSize} text-yellow-400 fill-current`} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {stars}
      </div>
      {showValue && (
        <span className="text-sm font-medium ml-1">
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className="text-sm text-muted-foreground ml-1">
          ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
}
