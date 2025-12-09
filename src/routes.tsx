import type { ReactNode } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import Orders from './pages/Orders';
import TrackShipment from './pages/TrackShipment';
import Wishlist from './pages/Wishlist';
import LoyaltyPoints from './pages/LoyaltyPoints';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagement from './pages/admin/UsersManagement';
import VendorsManagement from './pages/admin/VendorsManagement';
import VendorSupplies from './pages/admin/VendorSupplies';
import ShipmentHandlersManagement from './pages/admin/ShipmentHandlersManagement';
import ShipmentTracking from './pages/admin/ShipmentTracking';
import VendorPayments from './pages/admin/VendorPayments';
import PurchaseOrders from './pages/admin/PurchaseOrders';
import ChatManagement from './pages/admin/ChatManagement';
import InventoryStatus from './pages/admin/InventoryStatus';
import InventoryDashboard from './pages/admin/InventoryDashboard';
import ReviewManagement from './pages/admin/ReviewManagement';
import SecurityDashboard from './pages/admin/SecurityDashboard';
import { RequireAdmin } from './components/auth/RequireAdmin';
import { RequireAuth } from './components/auth/RequireAuth';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <Home />,
    visible: true
  },
  {
    name: 'Cart',
    path: '/cart',
    element: <Cart />,
    visible: false
  },
  {
    name: 'Checkout',
    path: '/checkout',
    element: <RequireAuth><Checkout /></RequireAuth>,
    visible: false
  },
  {
    name: 'Profile',
    path: '/profile',
    element: <RequireAuth><Profile /></RequireAuth>,
    visible: false
  },
  {
    name: 'Orders',
    path: '/orders',
    element: <RequireAuth><Orders /></RequireAuth>,
    visible: false
  },
  {
    name: 'Track Shipment',
    path: '/track-shipment',
    element: <TrackShipment />,
    visible: true
  },
  {
    name: 'Wishlist',
    path: '/wishlist',
    element: <RequireAuth><Wishlist /></RequireAuth>,
    visible: false
  },
  {
    name: 'Loyalty Points',
    path: '/loyalty-points',
    element: <RequireAuth><LoyaltyPoints /></RequireAuth>,
    visible: false
  },
  {
    name: 'Notifications',
    path: '/notifications',
    element: <RequireAuth><Notifications /></RequireAuth>,
    visible: false
  },
  {
    name: 'Product Detail',
    path: '/products/:id',
    element: <ProductDetail />,
    visible: false
  },
  {
    name: 'Payment Success',
    path: '/payment-success',
    element: <PaymentSuccess />,
    visible: false
  },
  {
    name: 'Login',
    path: '/login',
    element: <Login />,
    visible: false
  },
  {
    name: 'Register',
    path: '/register',
    element: <Register />,
    visible: false
  },
  {
    name: 'Admin',
    path: '/admin',
    element: <RequireAdmin><AdminDashboard /></RequireAdmin>,
    visible: false
  },
  {
    name: 'Users Management',
    path: '/admin/users',
    element: <RequireAdmin><UsersManagement /></RequireAdmin>,
    visible: false
  },
  {
    name: 'Vendors Management',
    path: '/admin/vendors',
    element: <RequireAdmin><VendorsManagement /></RequireAdmin>,
    visible: false
  },
  {
    name: 'Vendor Supplies',
    path: '/admin/vendor-supplies',
    element: <RequireAdmin><VendorSupplies /></RequireAdmin>,
    visible: false
  },
  {
    name: 'Shipment Handlers',
    path: '/admin/handlers',
    element: <RequireAdmin><ShipmentHandlersManagement /></RequireAdmin>,
    visible: false
  },
  {
    name: 'Shipment Tracking',
    path: '/admin/shipments',
    element: <RequireAdmin><ShipmentTracking /></RequireAdmin>,
    visible: false
  },
  {
    name: 'Vendor Payments',
    path: '/admin/vendor-payments',
    element: <RequireAdmin><VendorPayments /></RequireAdmin>,
    visible: false
  },
  {
    name: 'Purchase Orders',
    path: '/admin/purchase-orders',
    element: <RequireAdmin><PurchaseOrders /></RequireAdmin>,
    visible: false
  },
  {
    name: 'Inventory Status',
    path: '/admin/inventory-status',
    element: <RequireAdmin><InventoryStatus /></RequireAdmin>,
    visible: false
  },
  {
    name: 'Inventory Dashboard',
    path: '/admin/inventory-dashboard',
    element: <RequireAdmin><InventoryDashboard /></RequireAdmin>,
    visible: false
  },
  {
    name: 'Chat Management',
    path: '/admin/chat',
    element: <RequireAdmin><ChatManagement /></RequireAdmin>,
    visible: false
  },
  {
    name: 'Review Management',
    path: '/admin/reviews',
    element: <RequireAdmin><ReviewManagement /></RequireAdmin>,
    visible: false
  },
  {
    name: 'Security Dashboard',
    path: '/admin/security',
    element: <RequireAdmin><SecurityDashboard /></RequireAdmin>,
    visible: false
  }
];

export default routes;