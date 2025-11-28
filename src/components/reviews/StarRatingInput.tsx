import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export default function StarRatingInput({ 
  value, 
  onChange, 
  maxRating = 5, 
  size = 'md',
  disabled = false
}: StarRatingInputProps) {
  const [hoverRating, setHoverRating] = useState(0);
  
  const iconSize = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const displayRating = hoverRating || value;

  const handleClick = (rating: number) => {
    if (!disabled) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!disabled) {
      setHoverRating(rating);
    }
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, i) => i + 1).map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => handleClick(rating)}
          onMouseEnter={() => handleMouseEnter(rating)}
          onMouseLeave={handleMouseLeave}
          disabled={disabled}
          className={`transition-all duration-200 ${
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'
          }`}
        >
          <Star
            className={`${iconSize} transition-colors ${
              rating <= displayRating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm font-medium">
          {value} {value === 1 ? 'star' : 'stars'}
        </span>
      )}
    </div>
  );
}
