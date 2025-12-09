import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { communicationApi } from '@/db/api';
import { supabase } from '@/db/supabase';
import type { CommunicationPreferences as CommunicationPreferencesType } from '@/types/types';

export default function CommunicationPreferences() {
  const [preferences, setPreferences] = useState<Partial<CommunicationPreferencesType>>({
    email_order_confirmation: true,
    email_shipping_updates: true,
    email_delivery_confirmation: true,
    email_promotional: true,
    email_newsletter: true,
    sms_order_confirmation: false,
    sms_shipping_updates: false,
    sms_delivery_confirmation: false,
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const prefs = await communicationApi.getPreferences(user.id);
      if (prefs) {
        setPreferences(prefs);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) {
        throw new Error('User not authenticated');
      }

      await communicationApi.updatePreferences(user.id, user.email, preferences);

      toast({
        title: 'Preferences Saved',
        description: 'Your communication preferences have been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Save Failed',
        description: 'Unable to save preferences. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreference = (key: keyof CommunicationPreferencesType, value: boolean | string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Communication Preferences</CardTitle>
          <CardDescription>Loading your preferences...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Communication Preferences
        </CardTitle>
        <CardDescription>
          Manage how you receive updates about your orders and promotions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Notifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Email Notifications</h3>
          </div>
          
          <div className="space-y-3 pl-7">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email_order_confirmation">Order Confirmation</Label>
                <p className="text-sm text-muted-foreground">
                  Receive confirmation when you place an order
                </p>
              </div>
              <Switch
                id="email_order_confirmation"
                checked={preferences.email_order_confirmation}
                onCheckedChange={(checked) => updatePreference('email_order_confirmation', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email_shipping_updates">Shipping Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when your order is shipped
                </p>
              </div>
              <Switch
                id="email_shipping_updates"
                checked={preferences.email_shipping_updates}
                onCheckedChange={(checked) => updatePreference('email_shipping_updates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email_delivery_confirmation">Delivery Confirmation</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notification when your order is delivered
                </p>
              </div>
              <Switch
                id="email_delivery_confirmation"
                checked={preferences.email_delivery_confirmation}
                onCheckedChange={(checked) => updatePreference('email_delivery_confirmation', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email_promotional">Promotional Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Receive special offers and discounts
                </p>
              </div>
              <Switch
                id="email_promotional"
                checked={preferences.email_promotional}
                onCheckedChange={(checked) => updatePreference('email_promotional', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email_newsletter">Newsletter</Label>
                <p className="text-sm text-muted-foreground">
                  Weekly updates about new products and tips
                </p>
              </div>
              <Switch
                id="email_newsletter"
                checked={preferences.email_newsletter}
                onCheckedChange={(checked) => updatePreference('email_newsletter', checked)}
              />
            </div>
          </div>
        </div>

        {/* SMS Notifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">SMS Notifications</h3>
          </div>

          <div className="space-y-3 pl-7">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 1234567890"
                value={preferences.phone || ''}
                onChange={(e) => updatePreference('phone', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Required for SMS notifications
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms_order_confirmation">Order Confirmation</Label>
                <p className="text-sm text-muted-foreground">
                  SMS when you place an order
                </p>
              </div>
              <Switch
                id="sms_order_confirmation"
                checked={preferences.sms_order_confirmation}
                onCheckedChange={(checked) => updatePreference('sms_order_confirmation', checked)}
                disabled={!preferences.phone}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms_shipping_updates">Shipping Updates</Label>
                <p className="text-sm text-muted-foreground">
                  SMS when your order is shipped
                </p>
              </div>
              <Switch
                id="sms_shipping_updates"
                checked={preferences.sms_shipping_updates}
                onCheckedChange={(checked) => updatePreference('sms_shipping_updates', checked)}
                disabled={!preferences.phone}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms_delivery_confirmation">Delivery Confirmation</Label>
                <p className="text-sm text-muted-foreground">
                  SMS when your order is delivered
                </p>
              </div>
              <Switch
                id="sms_delivery_confirmation"
                checked={preferences.sms_delivery_confirmation}
                onCheckedChange={(checked) => updatePreference('sms_delivery_confirmation', checked)}
                disabled={!preferences.phone}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
