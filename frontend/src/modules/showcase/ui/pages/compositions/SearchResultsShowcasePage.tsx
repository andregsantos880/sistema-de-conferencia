import React, { useState, useMemo } from 'react';
import { Search, Grid, List } from 'lucide-react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Card, CardContent } from '@/shared/ui/shadcn/components/ui/card';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { EmptyState } from '@/shared/ui/components/states/EmptyState';
import { Skeleton } from '@/shared/ui/components/Skeleton';
import { cn } from '@/shadcn/lib/utils';

// Sample products data
const allProducts = [
  { id: 1, name: 'Wireless Bluetooth Headphones', category: 'Electronics', price: 79.99, rating: 4.5, inStock: true, image: 'headphones' },
  { id: 2, name: 'Ergonomic Office Chair', category: 'Furniture', price: 299.99, rating: 4.8, inStock: true, image: 'chair' },
  { id: 3, name: 'Mechanical Keyboard RGB', category: 'Electronics', price: 149.99, rating: 4.7, inStock: false, image: 'keyboard' },
  { id: 4, name: 'Standing Desk Converter', category: 'Furniture', price: 199.99, rating: 4.3, inStock: true, image: 'desk' },
  { id: 5, name: 'USB-C Hub 7-in-1', category: 'Electronics', price: 49.99, rating: 4.6, inStock: true, image: 'hub' },
  { id: 6, name: 'Noise Cancelling Earbuds', category: 'Electronics', price: 129.99, rating: 4.4, inStock: true, image: 'earbuds' },
  { id: 7, name: 'Monitor Light Bar', category: 'Electronics', price: 59.99, rating: 4.2, inStock: false, image: 'lightbar' },
  { id: 8, name: 'Laptop Stand Aluminum', category: 'Accessories', price: 39.99, rating: 4.5, inStock: true, image: 'stand' },
];

const SearchResultsShowcasePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);

  const filteredProducts = useMemo(() => {
    if (searchQuery === '') return allProducts;
    return allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSearch = (value: string) => {
    setIsLoading(true);
    setSearchQuery(value);
    // Simulate search delay
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <ShowcasePage
      title="Search Results"
      description="Demonstrate search input, results display, and various states working together."
    >
      <ShowcaseSection
        title="Product Search"
        description="A complete search experience with results grid/list, count display, and empty state."
      >
        <CodeExample
          id="compositions"
          title="Search + Results Composition"
          code={`const [searchQuery, setSearchQuery] = useState('');
const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

const filteredProducts = useMemo(() => {
  return allProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
}, [searchQuery]);

<Card>
  {/* Search Header */}
  <div className="p-4 border-b">
    <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
    <p className="text-sm text-muted-foreground mt-2">
      {filteredProducts.length} results found
    </p>
  </div>
  
  {/* View Toggle */}
  <div className="flex gap-2">
    <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} onClick={() => setViewMode('grid')}>
      <Grid className="h-4 w-4" />
    </Button>
    <Button variant={viewMode === 'list' ? 'default' : 'ghost'} onClick={() => setViewMode('list')}>
      <List className="h-4 w-4" />
    </Button>
  </div>
  
  {/* Results */}
  {filteredProducts.length > 0 ? (
    <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-2'}>
      {filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}
    </div>
  ) : (
    <EmptyState title="No products found" description="Try a different search term" />
  )}
</Card>`}
        >
          <Card>
            {/* Search Header */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex items-center gap-1 border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {isLoading ? 'Searching...' : `${filteredProducts.length} results found`}
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>

            {/* Results */}
            <CardContent className="p-4">
              {isLoading ? (
                // Loading skeleton
                <div className={cn(
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4' 
                    : 'space-y-3'
                )}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={cn(
                      "border rounded-lg p-4",
                      viewMode === 'list' && 'flex items-center gap-4'
                    )}>
                      <Skeleton className={cn(
                        viewMode === 'grid' ? 'h-32 w-full mb-3' : 'h-16 w-16 shrink-0'
                      )} />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className={cn(
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4' 
                    : 'space-y-3'
                )}>
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className={cn(
                        "border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer",
                        viewMode === 'list' && 'flex items-center gap-4'
                      )}
                    >
                      {/* Product Image Placeholder */}
                      <div className={cn(
                        "bg-muted rounded-md flex items-center justify-center text-muted-foreground text-xs",
                        viewMode === 'grid' ? 'h-32 w-full mb-3' : 'h-16 w-16 shrink-0'
                      )}>
                        {product.image}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "font-medium",
                          viewMode === 'grid' ? 'text-sm truncate' : 'text-base'
                        )}>
                          {product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">{product.category}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-semibold">${product.price}</span>
                          <Badge variant={product.inStock ? 'default' : 'secondary'}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </Badge>
                        </div>
                        {viewMode === 'list' && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-yellow-500">★</span>
                            <span className="text-sm">{product.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No products found"
                  description={`No products match "${searchQuery}". Try a different search term.`}
                  action={{
                    label: 'Clear search',
                    onClick: () => setSearchQuery(''),
                    variant: 'outline',
                  }}
                />
              )}
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default SearchResultsShowcasePage;
