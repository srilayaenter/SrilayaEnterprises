import type { ReactNode } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import Orders from './pages/Orders';
import TrackShipment from './pages/TrackShipment';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagement from './pages/admin/UsersManagement';
import VendorsManagement from './pages/admin/VendorsManagement';
import VendorSupplies from './pages/admin/VendorSupplies';
import ShipmentHandlersManagement from './pages/admin/ShipmentHandlersManagement';
import ShipmentTracking from './pages/admin/ShipmentTracking';
import { RequireAdmin } from './components/auth/RequireAdmin';

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
    element: <Checkout />,
    visible: false
  },
  {
    name: 'Orders',
    path: '/orders',
    element: <Orders />,
    visible: false
  },
  {
    name: 'Track Shipment',
    path: '/track-shipment',
    element: <TrackShipment />,
    visible: true
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
  }
];

export default routes;