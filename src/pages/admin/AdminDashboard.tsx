// Admin Dashboard with Sidebar Navigation
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Package, ShoppingBag, Users, Warehouse, Truck, UserCog, PackageCheck, ClipboardList, Shield, Banknote, FileText, MessageCircle, ChevronDown, ChevronRight, BarChart3, Box, ShoppingCart, DollarSign, Settings, Star, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import ChatManagement from './ChatManagement';
import ReviewManagement from './ReviewManagement';
import SecurityDashboard from './SecurityDashboard';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface NavCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: NavItem[];
}

const navigationCategories: NavCategory[] = [
  {
    id: 'products-stock',
    label: 'Products & Stock',
    icon: <Box className="h-5 w-5" />,
    items: [
      { id: 'products', label: 'Products', icon: <Package className="h-4 w-4" /> },
      { id: 'inventory', label: 'Inventory', icon: <Warehouse className="h-4 w-4" /> },
      { id: 'inventory-status', label: 'Stock Status', icon: <BarChart3 className="h-4 w-4" /> },
    ],
  },
  {
    id: 'sales',
    label: 'Sales',
    icon: <ShoppingCart className="h-5 w-5" />,
    items: [
      { id: 'orders', label: 'Orders', icon: <ShoppingBag className="h-4 w-4" /> },
      { id: 'customers', label: 'Customers', icon: <Users className="h-4 w-4" /> },
      { id: 'shipping', label: 'Shipping Settings', icon: <Truck className="h-4 w-4" /> },
      { id: 'handlers', label: 'Shipment Handlers', icon: <Truck className="h-4 w-4" /> },
      { id: 'shipments', label: 'Shipment Tracking', icon: <PackageCheck className="h-4 w-4" /> },
    ],
  },
  {
    id: 'purchases',
    label: 'Purchases',
    icon: <DollarSign className="h-5 w-5" />,
    items: [
      { id: 'vendors', label: 'Vendors', icon: <UserCog className="h-4 w-4" /> },
      { id: 'purchase-orders', label: 'Purchase Orders', icon: <FileText className="h-4 w-4" /> },
      { id: 'supplies', label: 'Supplies', icon: <ClipboardList className="h-4 w-4" /> },
      { id: 'vendor-payments', label: 'Vendor Payments', icon: <Banknote className="h-4 w-4" /> },
    ],
  },
  {
    id: 'system',
    label: 'System',
    icon: <Settings className="h-5 w-5" />,
    items: [
      { id: 'users', label: 'Users', icon: <Shield className="h-4 w-4" /> },
      { id: 'security', label: 'Security', icon: <ShieldCheck className="h-4 w-4" /> },
      { id: 'reviews', label: 'Reviews', icon: <Star className="h-4 w-4" /> },
      { id: 'chat', label: 'Chat Support', icon: <MessageCircle className="h-4 w-4" /> },
    ],
  },
];

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState('products');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['products-stock']);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const renderContent = () => {
    switch (activeView) {
      case 'products':
        return <ProductManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'inventory-status':
        return <div className="p-6"><p>Redirecting to Inventory Status...</p></div>;
      case 'orders':
        return <OrdersView />;
      case 'customers':
        return <CustomerManagement />;
      case 'shipping':
        return <ShippingSettings />;
      case 'handlers':
        return <ShipmentHandlersManagement />;
      case 'shipments':
        return <ShipmentTracking />;
      case 'vendors':
        return <VendorsManagement />;
      case 'purchase-orders':
        return <PurchaseOrders />;
      case 'supplies':
        return <VendorSupplies />;
      case 'vendor-payments':
        return <VendorPayments />;
      case 'users':
        return <UsersManagement />;
      case 'security':
        return <SecurityDashboard />;
      case 'reviews':
        return <ReviewManagement />;
      case 'chat':
        return <ChatManagement />;
      default:
        return <ProductManagement />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        
        <ScrollArea className="h-[calc(100vh-5rem)]">
          <nav className="p-4 space-y-2">
            {navigationCategories.map((category) => (
              <div key={category.id} className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 font-semibold"
                  onClick={() => toggleCategory(category.id)}
                >
                  {category.icon}
                  <span className="flex-1 text-left">{category.label}</span>
                  {expandedCategories.includes(category.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                
                {expandedCategories.includes(category.id) && (
                  <div className="ml-4 space-y-1">
                    {category.items.map((item) => (
                      <Button
                        key={item.id}
                        variant={activeView === item.id ? 'secondary' : 'ghost'}
                        className={cn(
                          'w-full justify-start gap-2 text-sm',
                          activeView === item.id && 'bg-secondary'
                        )}
                        onClick={() => {
                          if (item.id === 'inventory-status') {
                            window.location.href = '/admin/inventory-status';
                          } else {
                            setActiveView(item.id);
                          }
                        }}
                      >
                        {item.icon}
                        {item.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
