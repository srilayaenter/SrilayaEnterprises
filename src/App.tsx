import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { CartProvider } from '@/contexts/CartContext';
import { Toaster } from '@/components/ui/toaster';
import { supabase } from '@/db/supabase';
import Header from '@/components/common/Header';
import routes from './routes';

const App = () => {
  return (
    <Router>
      <AuthProvider client={supabase}>
        <CartProvider>
          <Toaster />
          <RequireAuth whiteList={["/", "/login", "/register", "/products/*", "/cart", "/payment-success"]}>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                <Routes>
                  {routes.map((route, index) => (
                    <Route
                      key={index}
                      path={route.path}
                      element={route.element}
                    />
                  ))}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </RequireAuth>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
