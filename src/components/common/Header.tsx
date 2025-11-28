import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, ShoppingCart, User, LogOut, Heart, Award } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCart } from "@/contexts/CartContext";
import { wishlistApi, loyaltyPointsApi } from "@/db/api";
import NotificationBell from "@/components/notifications/NotificationBell";
import routes from "../../routes";

const Header = () => {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { totalItems } = useCart();
  const navigation = routes.filter((route) => route.visible !== false);
  
  const [wishlistCount, setWishlistCount] = useState(0);
  const [pointsBalance, setPointsBalance] = useState(0);

  useEffect(() => {
    if (user) {
      loadUserData();
      const interval = setInterval(loadUserData, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      const [wishlist, points] = await Promise.all([
        wishlistApi.getWishlistCount(user.id),
        loyaltyPointsApi.getPointsBalance(user.id)
      ]);
      setWishlistCount(wishlist);
      setPointsBalance(points);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <nav className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold gradient-text">
              Srilaya Enterprises
            </span>
          </Link>

          <div className="hidden xl:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-smooth ${
                  location.pathname === item.path
                    ? "text-primary bg-primary/10"
                    : "text-foreground hover:text-primary hover:bg-muted"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Wishlist */}
            {user && (
              <Link to="/wishlist">
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {wishlistCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Notifications */}
            {user && <NotificationBell userId={user.id} />}

            {/* Points Balance */}
            {user && pointsBalance > 0 && (
              <Link to="/loyalty-points">
                <Button variant="ghost" className="gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">{pointsBalance}</span>
                </Button>
              </Link>
            )}

            {user ? (
              <>
                <Link to="/orders">
                  <Button variant="ghost" size="icon">
                    <User className="w-5 h-5" />
                  </Button>
                </Link>
                {profile?.role === 'admin' && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm">
                      Admin
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="icon" onClick={() => signOut()}>
                  <LogOut className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button variant="default" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
