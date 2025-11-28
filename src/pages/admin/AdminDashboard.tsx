import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, ShoppingBag, Users, Warehouse, Truck, UserCog, PackageCheck, ClipboardList, Shield, Banknote, FileText } from 'lucide-react';
import ProductManagement from './ProductManagement';
import CustomerManagement from './CustomerManagement';
import InventoryManagement from './InventoryManagement';
import OrdersView from './OrdersView';
import ShippingSettings from './ShippingSettings';
import UsersManagement from './UsersManagement';
import VendorsManagement from './VendorsManagement';
import VendorSupplies from './VendorSupplies';
import ShipmentHandlersManagement from './ShipmentHandlersManagement';
import ShipmentTracking from './ShipmentTracking';
import VendorPayments from './VendorPayments';
import PurchaseOrders from './PurchaseOrders';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="w-full overflow-x-auto">
          <TabsList className="inline-flex w-auto min-w-full">
            <TabsTrigger value="products" className="flex items-center gap-2 whitespace-nowrap">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2 whitespace-nowrap">
              <Warehouse className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2 whitespace-nowrap">
              <ShoppingBag className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2 whitespace-nowrap">
              <Users className="h-4 w-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2 whitespace-nowrap">
              <Shield className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="shipping" className="flex items-center gap-2 whitespace-nowrap">
              <Truck className="h-4 w-4" />
              Shipping
            </TabsTrigger>
            <TabsTrigger value="vendors" className="flex items-center gap-2 whitespace-nowrap">
              <UserCog className="h-4 w-4" />
              Vendors
            </TabsTrigger>
            <TabsTrigger value="supplies" className="flex items-center gap-2 whitespace-nowrap">
              <ClipboardList className="h-4 w-4" />
              Supplies
            </TabsTrigger>
            <TabsTrigger value="handlers" className="flex items-center gap-2 whitespace-nowrap">
              <Truck className="h-4 w-4" />
              Handlers
            </TabsTrigger>
            <TabsTrigger value="shipments" className="flex items-center gap-2 whitespace-nowrap">
              <PackageCheck className="h-4 w-4" />
              Shipments
            </TabsTrigger>
            <TabsTrigger value="vendor-payments" className="flex items-center gap-2 whitespace-nowrap">
              <Banknote className="h-4 w-4" />
              Vendor Payments
            </TabsTrigger>
            <TabsTrigger value="purchase-orders" className="flex items-center gap-2 whitespace-nowrap">
              <FileText className="h-4 w-4" />
              Purchase Orders
            </TabsTrigger>
          </TabsList>
        </div>

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

        <TabsContent value="users">
          <UsersManagement />
        </TabsContent>

        <TabsContent value="shipping">
          <ShippingSettings />
        </TabsContent>

        <TabsContent value="vendors">
          <VendorsManagement />
        </TabsContent>

        <TabsContent value="supplies">
          <VendorSupplies />
        </TabsContent>

        <TabsContent value="handlers">
          <ShipmentHandlersManagement />
        </TabsContent>

        <TabsContent value="shipments">
          <ShipmentTracking />
        </TabsContent>

        <TabsContent value="vendor-payments">
          <VendorPayments />
        </TabsContent>

        <TabsContent value="purchase-orders">
          <PurchaseOrders />
        </TabsContent>
      </Tabs>
    </div>
  );
}
