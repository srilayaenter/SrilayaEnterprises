import { useEffect, useState } from 'react';
import { Award, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { loyaltyPointsApi } from '@/db/api';

interface PointsBalanceProps {
  userId: string;
  showDetails?: boolean;
}

export default function PointsBalance({ userId, showDetails = true }: PointsBalanceProps) {
  const [balance, setBalance] = useState(0);
  const [expiringPoints, setExpiringPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPointsData();
  }, [userId]);

  const loadPointsData = async () => {
    try {
      setLoading(true);
      const [pointsBalance, expiring] = await Promise.all([
        loyaltyPointsApi.getPointsBalance(userId),
        loyaltyPointsApi.getExpiringPoints(userId)
      ]);
      setBalance(pointsBalance);
      setExpiringPoints(expiring);
    } catch (error) {
      console.error('Error loading points data:', error);
    } finally {
      setLoading(false);
    }
  };

  const pointsValue = loyaltyPointsApi.calculatePointsDiscount(balance);
  const expiringTotal = expiringPoints.reduce((sum, p) => sum + p.points, 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!showDetails) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
        <Award className="w-4 h-4 text-primary" />
        <span className="font-semibold text-sm">{balance.toLocaleString()} Points</span>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Points */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Points</CardTitle>
          <Award className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{balance.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Worth ₹{pointsValue.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      {/* Points Value */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Discount Value</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{pointsValue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            100 points = ₹10 off
          </p>
        </CardContent>
      </Card>

      {/* Expiring Soon */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          <Clock className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{expiringTotal.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {expiringPoints.length > 0 ? 'Within 30 days' : 'No points expiring'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
