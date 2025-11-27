import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { shippingApi } from '@/db/api';
import type { ShippingRate } from '@/types/types';
import { Truck, MapPin, Save } from 'lucide-react';

export default function ShippingSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<ShippingRate | null>(null);
  const [formData, setFormData] = useState({
    store_state: '',
    store_city: '',
    local_rate_min: 30,
    local_rate_max: 50,
    interstate_rate_min: 70,
    interstate_rate_max: 100,
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await shippingApi.getConfig();
      if (data) {
        setConfig(data);
        setFormData({
          store_state: data.store_state,
          store_city: data.store_city,
          local_rate_min: data.local_rate_min,
          local_rate_max: data.local_rate_max,
          interstate_rate_min: data.interstate_rate_min,
          interstate_rate_max: data.interstate_rate_max,
        });
      }
    } catch (error) {
      console.error('Error loading shipping config:', error);
    }
  };

  const handleSave = async () => {
    if (!config) {
      toast({
        title: 'Error',
        description: 'No shipping configuration found',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await shippingApi.updateConfig(config.id, formData);
      toast({
        title: 'Settings saved',
        description: 'Shipping configuration has been updated successfully',
      });
      loadConfig();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update shipping configuration',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Shipping Settings</h2>
        <p className="text-muted-foreground">
          Configure shipping rates based on location and weight
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Store Location
            </CardTitle>
            <CardDescription>
              Set your store's location for calculating local vs interstate shipping
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store_state">State</Label>
              <Input
                id="store_state"
                value={formData.store_state}
                onChange={(e) => handleInputChange('store_state', e.target.value)}
                placeholder="Enter store state"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store_city">City</Label>
              <Input
                id="store_city"
                value={formData.store_city}
                onChange={(e) => handleInputChange('store_city', e.target.value)}
                placeholder="Enter store city"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipping Rates
            </CardTitle>
            <CardDescription>
              Set shipping rates per kg for local and interstate delivery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Local Delivery (Same State)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="local_rate_min">Min Rate (₹/kg)</Label>
                    <Input
                      id="local_rate_min"
                      type="number"
                      step="1"
                      value={formData.local_rate_min}
                      onChange={(e) => handleInputChange('local_rate_min', parseFloat(e.target.value))}
                      placeholder="30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="local_rate_max">Max Rate (₹/kg)</Label>
                    <Input
                      id="local_rate_max"
                      type="number"
                      step="1"
                      value={formData.local_rate_max}
                      onChange={(e) => handleInputChange('local_rate_max', parseFloat(e.target.value))}
                      placeholder="50"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">Interstate Delivery</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="interstate_rate_min">Min Rate (₹/kg)</Label>
                    <Input
                      id="interstate_rate_min"
                      type="number"
                      step="1"
                      value={formData.interstate_rate_min}
                      onChange={(e) => handleInputChange('interstate_rate_min', parseFloat(e.target.value))}
                      placeholder="70"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interstate_rate_max">Max Rate (₹/kg)</Label>
                    <Input
                      id="interstate_rate_max"
                      type="number"
                      step="1"
                      value={formData.interstate_rate_max}
                      onChange={(e) => handleInputChange('interstate_rate_max', parseFloat(e.target.value))}
                      placeholder="100"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipping Calculation Logic</CardTitle>
          <CardDescription>
            How shipping costs are calculated
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <p className="font-medium">Local Delivery (Same State & City):</p>
            <p className="text-muted-foreground">
              Average of min and max local rates × total weight (rounded up to nearest kg)
            </p>
            <p className="font-mono bg-muted p-2 rounded">
              Cost = ((₹{formData.local_rate_min} + ₹{formData.local_rate_max}) / 2) × weight
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-medium">Interstate Delivery (Different State):</p>
            <p className="text-muted-foreground">
              Average of min and max interstate rates × total weight (rounded up to nearest kg)
            </p>
            <p className="font-mono bg-muted p-2 rounded">
              Cost = ((₹{formData.interstate_rate_min} + ₹{formData.interstate_rate_max}) / 2) × weight
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-medium">Example Calculations:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>2.5kg local delivery: ₹{(((formData.local_rate_min + formData.local_rate_max) / 2) * Math.ceil(2.5)).toFixed(2)}</li>
              <li>2.5kg interstate delivery: ₹{(((formData.interstate_rate_min + formData.interstate_rate_max) / 2) * Math.ceil(2.5)).toFixed(2)}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
