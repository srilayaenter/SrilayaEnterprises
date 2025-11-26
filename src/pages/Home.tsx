import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '@/db/api';
import type { Product, ProductCategory } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ShoppingCart, Leaf } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const categories: { value: ProductCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Products' },
  { value: 'millets', label: 'Millets' },
  { value: 'rice', label: 'Rice' },
  { value: 'flakes', label: 'Flakes' },
  { value: 'sugar', label: 'Sugar' },
  { value: 'honey', label: 'Honey' },
  { value: 'laddus', label: 'Laddus' },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productsApi.getAll(
        selectedCategory === 'all' ? undefined : selectedCategory
      );
      setProducts(data);
    } catch (error: any) {
      toast({
        title: 'Error loading products',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-16 xl:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                <Leaf className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold mb-4 gradient-text">
              Srilaya Enterprises
            </h1>
            <p className="text-lg xl:text-xl text-muted-foreground mb-8">
              Premium Organic Products for a Healthier Lifestyle
            </p>
            <div className="flex gap-4 max-w-md mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat.value)}
                className="transition-smooth"
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-48 w-full bg-muted" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-6 w-3/4 mb-2 bg-muted" />
                    <Skeleton className="h-4 w-full bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-elegant transition-smooth">
                  <CardHeader className="p-0">
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      <Leaf className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <Badge variant="secondary" className="capitalize">
                        {product.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {product.description}
                    </p>
                    <p className="text-xl font-bold text-primary">
                      ${product.base_price.toFixed(2)}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Link to={`/products/${product.id}`} className="w-full">
                      <Button className="w-full">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
