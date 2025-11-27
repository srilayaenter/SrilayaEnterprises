import type { ReactNode } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import Orders from './pages/Orders';
import AdminDashboard from './pages/admin/AdminDashboard';

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
    element: <AdminDashboard />,
    visible: false
  }
];

export default routes;