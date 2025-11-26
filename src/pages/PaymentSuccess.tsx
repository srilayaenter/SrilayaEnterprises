import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const { clearCart } = useCart();

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    } else {
      setVerifying(false);
      setError('No session ID found');
    }
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('verify_stripe_payment', {
        body: JSON.stringify({ sessionId }),
      });

      if (error) {
        const errorMsg = await error?.context?.text();
        throw new Error(errorMsg || 'Failed to verify payment');
      }

      if (data?.data?.verified) {
        setVerified(true);
        clearCart();
      } else {
        setError('Payment not completed');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-12">
            <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin mb-4" />
            <p className="text-lg">Verifying your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-md mx-auto text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {verified ? (
              <CheckCircle2 className="w-20 h-20 text-primary" />
            ) : (
              <XCircle className="w-20 h-20 text-destructive" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {verified ? 'Payment Successful!' : 'Payment Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {verified
              ? 'Thank you for your order! Your payment has been processed successfully.'
              : error || 'There was an issue processing your payment.'}
          </p>
          <div className="flex flex-col gap-2">
            {verified && (
              <Link to="/orders">
                <Button className="w-full">View Orders</Button>
              </Link>
            )}
            <Link to="/">
              <Button variant="outline" className="w-full">
                {verified ? 'Continue Shopping' : 'Back to Home'}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
