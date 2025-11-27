import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, ShoppingBag, Users, Warehouse, Truck, UserCog, PackageCheck } from 'lucide-react';
import ProductManagement from './ProductManagement';
import CustomerManagement from './CustomerManagement';
import InventoryManagement from './InventoryManagement';
import OrdersView from './OrdersView';
import ShippingSettings from './ShippingSettings';
import VendorsManagement from './VendorsManagement';
import ShipmentHandlersManagement from './ShipmentHandlersManagement';
import ShipmentTracking from './ShipmentTracking';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 xl:grid-cols-8">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Warehouse className="h-4 w-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Shipping
          </TabsTrigger>
          <TabsTrigger value="vendors" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            Vendors
          </TabsTrigger>
          <TabsTrigger value="handlers" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Handlers
          </TabsTrigger>
          <TabsTrigger value="shipments" className="flex items-center gap-2">
            <PackageCheck className="h-4 w-4" />
            Shipments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductManagement />
        </TabsContent>

        <TabsContent value="inventory">
          <InventoryManagement />
        </TabsContent>

        <TabsContent value="orders">
          <OrdersView />
        </TabsContent>

        <TabsContent value="customers">
          <CustomerManagement />
        </TabsContent>

        <TabsContent value="shipping">
          <ShippingSettings />
        </TabsContent>

        <TabsContent value="vendors">
          <VendorsManagement />
        </TabsContent>

        <TabsContent value="handlers">
          <ShipmentHandlersManagement />
        </TabsContent>

        <TabsContent value="shipments">
          <ShipmentTracking />
        </TabsContent>
      </Tabs>
    </div>
  );
}
