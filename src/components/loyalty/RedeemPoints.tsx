import { useState, useEffect } from 'react';
import { Award, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loyaltyPointsApi } from '@/db/api';

interface RedeemPointsProps {
  userId: string;
  orderTotal: number;
  onPointsApplied: (points: number, discount: number) => void;
}

export default function RedeemPoints({ userId, orderTotal, onPointsApplied }: RedeemPointsProps) {
  const [balance, setBalance] = useState(0);
  const [pointsToRedeem, setPointsToRedeem] = useState('');
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBalance();
  }, [userId]);

  useEffect(() => {
    calculateDiscount();
  }, [pointsToRedeem, balance, orderTotal]);

  const loadBalance = async () => {
    try {
      setLoading(true);
      const pointsBalance = await loyaltyPointsApi.getPointsBalance(userId);
      setBalance(pointsBalance);
    } catch (error) {
      console.error('Error loading points balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = () => {
    setError('');
    const points = parseInt(pointsToRedeem) || 0;

    if (points === 0) {
      setDiscount(0);
      return;
    }

    // Validation
    if (points < 100) {
      setError('Minimum redemption is 100 points');
      setDiscount(0);
      return;
    }

    if (points > balance) {
      setError('Insufficient points balance');
      setDiscount(0);
      return;
    }

    const calculatedDiscount = loyaltyPointsApi.calculatePointsDiscount(points);
    const maxDiscount = orderTotal * 0.5; // Max 50% of order

    if (calculatedDiscount > maxDiscount) {
      setError(`Maximum discount allowed is ₹${maxDiscount.toFixed(2)} (50% of order)`);
      setDiscount(0);
      return;
    }

    setDiscount(calculatedDiscount);
  };

  const handleApplyPoints = () => {
    const points = parseInt(pointsToRedeem) || 0;
    if (points > 0 && discount > 0 && !error) {
      onPointsApplied(points, discount);
    }
  };

  const handleUseMaxPoints = () => {
    const maxDiscount = orderTotal * 0.5;
    const maxPointsForDiscount = Math.floor((maxDiscount / 10) * 100);
    const maxPoints = Math.min(balance, maxPointsForDiscount);
    setPointsToRedeem(maxPoints.toString());
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (balance < 100) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          You need at least 100 points to redeem. Current balance: {balance} points
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Redeem Loyalty Points
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance Info */}
        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
          <span className="text-sm font-medium">Available Points</span>
          <span className="text-lg font-bold">{balance.toLocaleString()}</span>
        </div>

        {/* Points Input */}
        <div className="space-y-2">
          <Label htmlFor="points-input">Points to Redeem</Label>
          <div className="flex gap-2">
            <Input
              id="points-input"
              type="number"
              min="100"
              max={balance}
              step="100"
              value={pointsToRedeem}
              onChange={(e) => setPointsToRedeem(e.target.value)}
              placeholder="Enter points (min 100)"
            />
            <Button
              variant="outline"
              onClick={handleUseMaxPoints}
              disabled={balance < 100}
            >
              Max
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            100 points = ₹10 discount
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Discount Preview */}
        {discount > 0 && !error && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-900">Discount Amount</span>
              <span className="text-2xl font-bold text-green-600">₹{discount.toFixed(2)}</span>
            </div>
            <p className="text-xs text-green-700">
              Using {pointsToRedeem} points
            </p>
          </div>
        )}

        {/* Apply Button */}
        <Button
          onClick={handleApplyPoints}
          disabled={!pointsToRedeem || discount === 0 || !!error}
          className="w-full"
        >
          Apply Points
        </Button>

        {/* Info */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <ul className="list-disc list-inside space-y-1">
              <li>Minimum redemption: 100 points</li>
              <li>Maximum discount: 50% of order value</li>
              <li>Points expire after 1 year</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
