import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { communicationApi } from '@/db/api';

export default function NewsletterSubscription() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      await communicationApi.subscribeToNewsletter(email, undefined, 'footer');
      
      toast({
        title: 'Successfully Subscribed! 🎉',
        description: 'Thank you for subscribing to our newsletter. You\'ll receive updates about new products and special offers.',
      });

      setEmail('');
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: 'Subscription Failed',
        description: 'Unable to subscribe. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Subscribe to Our Newsletter</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Get updates on new organic products, special offers, and healthy living tips.
      </p>
      <form onSubmit={handleSubscribe} className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </form>
      <p className="text-xs text-muted-foreground mt-2">
        We respect your privacy. Unsubscribe anytime.
      </p>
    </div>
  );
}
