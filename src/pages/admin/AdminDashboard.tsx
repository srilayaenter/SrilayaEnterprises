import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingBag, Users } from 'lucide-react';

export default function AdminDashboard() {
  const adminSections = [
    {
      title: 'Products',
      description: 'Manage your product catalog',
      icon: Package,
      path: '/admin/products',
      color: 'text-primary',
    },
    {
      title: 'Orders',
      description: 'View and manage customer orders',
      icon: ShoppingBag,
      path: '/admin/orders',
      color: 'text-secondary',
    },
    {
      title: 'Customers',
      description: 'Manage customer accounts',
      icon: Users,
      path: '/admin/customers',
      color: 'text-accent',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {adminSections.map((section) => (
          <Link key={section.path} to={section.path}>
            <Card className="hover:shadow-elegant transition-smooth cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center ${section.color}`}>
                    <section.icon className="w-6 h-6" />
                  </div>
                  <CardTitle>{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{section.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
