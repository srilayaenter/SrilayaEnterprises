import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Gift, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/db/supabase';
import PointsBalance from '@/components/loyalty/PointsBalance';
import PointsHistory from '@/components/loyalty/PointsHistory';

export default function LoyaltyPoints() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/login');
      return;
    }

    setUserId(user.id);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Award className="w-12 h-12 mx-auto mb-4 animate-pulse text-muted-foreground" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userId) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <Award className="w-8 h-8 text-primary" />
          Loyalty Points
        </h1>
        <p className="text-muted-foreground">
          Earn points with every purchase and redeem them for discounts
        </p>
      </div>

      {/* Points Balance Cards */}
      <div className="mb-8">
        <PointsBalance userId={userId} showDetails={true} />
      </div>

      {/* How It Works */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold">Earn Points</h3>
              <p className="text-sm text-muted-foreground">
                Get 1 point for every ₹10 you spend on orders
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold">Accumulate</h3>
              <p className="text-sm text-muted-foreground">
                Points are automatically added to your account after order completion
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold">Redeem</h3>
              <p className="text-sm text-muted-foreground">
                Use 100 points to get ₹10 off your next purchase
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Information */}
      <Alert className="mb-8">
        <Info className="h-4 w-4" />
        <AlertTitle>Important Information</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
            <li>Minimum redemption: 100 points</li>
            <li>Maximum discount per order: 50% of order value</li>
            <li>Points expire after 365 days from earning date</li>
            <li>Points cannot be transferred or exchanged for cash</li>
            <li>Points are earned only on completed orders</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Points History */}
      <PointsHistory userId={userId} />
    </div>
  );
}
