import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/components/ui/select';
import {
  Skeleton,
  SkeletonKpiCard,
  SkeletonTable,
} from '@/shared/ui/components/Skeleton';

const MixedStatesShowcasePage: React.FC = () => {
  return (
    <ShowcasePage
      title="Mixed States"
      description="Demonstrate complex real SaaS scenarios with partial data loading."
    >
      <ShowcaseSection
        title="Dashboard with Partial Data"
        description="Some cards loaded, some cards skeleton, one card error - a realistic scenario."
      >
        <CodeExample
          id="states"
          title="Partial Dashboard Loading"
          code={`<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  {/* Loaded card */}
  <Card className="p-6">
    <p className="text-sm text-muted-foreground">Revenue</p>
    <p className="text-2xl font-bold">$12,450</p>
  </Card>
  
  {/* Loading card */}
  <SkeletonKpiCard />
  
  {/* Error card */}
  <Card className="p-6 border-destructive/50">
    <p className="text-sm text-muted-foreground">Orders</p>
    <div className="flex items-center gap-2 text-destructive">
      <AlertCircle className="h-4 w-4" />
      <span className="text-sm">Failed</span>
    </div>
  </Card>
  
  {/* Loaded card */}
  <Card className="p-6">
    <p className="text-sm text-muted-foreground">Customers</p>
    <p className="text-2xl font-bold">1,234</p>
  </Card>
</div>`}
        >
          <div className="space-y-6">
            {/* KPI Row - Mixed states */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Loaded card */}
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Revenue</p>
                <p className="text-2xl font-bold">$12,450</p>
                <p className="text-xs text-success mt-1">+12% from last month</p>
              </Card>
              
              {/* Loading card */}
              <SkeletonKpiCard showSparkline={false} />
              
              {/* Error card */}
              <Card className="p-6 border-destructive/50">
                <p className="text-sm text-muted-foreground mb-1">Orders</p>
                <div className="flex items-center gap-2 text-destructive mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Failed to load</span>
                </div>
                <Button variant="ghost" size="sm" className="mt-2 h-7 px-2 text-xs">
                  <RefreshCw className="h-3 w-3 mr-1" /> Retry
                </Button>
              </Card>
              
              {/* Loaded card */}
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Customers</p>
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-xs text-success mt-1">+5% from last month</p>
              </Card>
            </div>
            
            {/* Charts Row - Mixed states */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Loaded chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Sales Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center bg-muted/30 rounded-md">
                    <p className="text-sm text-muted-foreground">Chart loaded successfully</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Loading chart */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-48 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Table with Partial Rows"
        description="Some rows loaded, some rows loading placeholders - progressive data loading."
      >
        <CodeExample
          id="states"
          title="Partial Table Loading"
          code={`<Card>
  <CardHeader>
    <CardTitle>Recent Transactions</CardTitle>
  </CardHeader>
  <CardContent>
    <table>
      <thead>...</thead>
      <tbody>
        {/* Loaded rows */}
        <tr>
          <td>TXN-001</td>
          <td>John Doe</td>
          <td>$250.00</td>
          <td>Completed</td>
        </tr>
        {/* Loading rows */}
        <tr>
          <td><Skeleton className="h-4 w-20" /></td>
          <td><Skeleton className="h-4 w-24" /></td>
          <td><Skeleton className="h-4 w-16" /></td>
          <td><Skeleton className="h-4 w-20" /></td>
        </tr>
      </tbody>
    </table>
  </CardContent>
</Card>`}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                {/* Header */}
                <div className="grid grid-cols-4 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
                  <div>Transaction ID</div>
                  <div>Customer</div>
                  <div>Amount</div>
                  <div>Status</div>
                </div>
                
                {/* Loaded rows */}
                <div className="grid grid-cols-4 gap-4 p-4 border-b text-sm">
                  <div className="font-mono">TXN-001</div>
                  <div>John Doe</div>
                  <div>$250.00</div>
                  <div className="text-success">Completed</div>
                </div>
                <div className="grid grid-cols-4 gap-4 p-4 border-b text-sm">
                  <div className="font-mono">TXN-002</div>
                  <div>Jane Smith</div>
                  <div>$180.50</div>
                  <div className="text-success">Completed</div>
                </div>
                <div className="grid grid-cols-4 gap-4 p-4 border-b text-sm">
                  <div className="font-mono">TXN-003</div>
                  <div>Bob Wilson</div>
                  <div>$420.00</div>
                  <div className="text-warning">Pending</div>
                </div>
                
                {/* Loading rows */}
                <div className="grid grid-cols-4 gap-4 p-4 border-b">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="grid grid-cols-4 gap-4 p-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Filters Loaded, Data Pending"
        description="Filters visible and interactive while results area shows skeleton."
      >
        <CodeExample
          id="states"
          title="Filters Ready, Data Loading"
          code={`<Card>
  <CardHeader>
    <CardTitle>Product Inventory</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Filters - fully loaded */}
    <div className="flex gap-4 mb-6">
      <Input placeholder="Search products..." />
      <Select>
        <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
        <SelectContent>...</SelectContent>
      </Select>
      <Select>
        <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>...</SelectContent>
      </Select>
    </div>
    
    {/* Results - loading */}
    <SkeletonTable rows={5} columns={4} />
  </CardContent>
</Card>`}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Product Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filters - fully loaded and interactive */}
              <div className="flex flex-wrap gap-4 mb-6">
                <Input placeholder="Search products..." className="w-64" />
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="furniture">Furniture</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">Apply Filters</Button>
              </div>
              
              {/* Results - loading */}
              <SkeletonTable rows={5} columns={4} />
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default MixedStatesShowcasePage;
