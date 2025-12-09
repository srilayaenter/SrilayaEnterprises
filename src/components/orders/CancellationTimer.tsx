import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CancellationTimerProps {
  createdAt: string;
  onExpire?: () => void;
}

export default function CancellationTimer({ createdAt, onExpire }: CancellationTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const orderTime = new Date(createdAt).getTime();
      const now = new Date().getTime();
      const thirtyMinutes = 30 * 60 * 1000;
      const elapsed = now - orderTime;
      const remaining = thirtyMinutes - elapsed;

      if (remaining <= 0) {
        if (onExpire) onExpire();
        return 0;
      }

      return remaining;
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt, onExpire]);

  if (timeLeft <= 0) {
    return null;
  }

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  const isUrgent = minutes < 5;

  return (
    <div className={`flex items-center gap-2 text-sm ${isUrgent ? 'text-destructive' : 'text-muted-foreground'}`}>
      <Clock className="w-4 h-4" />
      <span>
        Cancel within: <span className="font-semibold">{minutes}:{seconds.toString().padStart(2, '0')}</span>
      </span>
    </div>
  );
}
