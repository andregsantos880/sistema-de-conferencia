import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, X, SlidersHorizontal } from 'lucide-react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Card, CardContent } from '@/shared/ui/shadcn/components/ui/card';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/components/ui/select';
import { EmptyState } from '@/shared/ui/components/states/EmptyState';
import { cn } from '@/shadcn/lib/utils';

// Sample data
const allOrders = [
  { id: 'ORD-001', customer: 'Alice Johnson', status: 'Completed', total: 125.00, date: '2024-12-10', category: 'Electronics', priority: 'Normal' },
  { id: 'ORD-002', customer: 'Bob Smith', status: 'Processing', total: 89.50, date: '2024-12-09', category: 'Clothing', priority: 'High' },
  { id: 'ORD-003', customer: 'Carol Williams', status: 'Pending', total: 245.00, date: '2024-12-08', category: 'Electronics', priority: 'Normal' },
  { id: 'ORD-004', customer: 'David Brown', status: 'Completed', total: 67.25, date: '2024-12-07', category: 'Books', priority: 'Low' },
  { id: 'ORD-005', customer: 'Eva Martinez', status: 'Cancelled', total: 189.99, date: '2024-12-06', category: 'Electronics', priority: 'High' },
  { id: 'ORD-006', customer: 'Frank Lee', status: 'Processing', total: 312.00, date: '2024-12-05', category: 'Furniture', priority: 'Normal' },
  { id: 'ORD-007', customer: 'Grace Kim', status: 'Completed', total: 45.00, date: '2024-12-04', category: 'Books', priority: 'Low' },
  { id: 'ORD-008', customer: 'Henry Chen', status: 'Pending', total: 567.50, date: '2024-12-03', category: 'Electronics', priority: 'High' },
];

const AdvancedFiltersShowcasePage: React.FC = () => {
  // Basic filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Advanced filters
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      // Basic filters
      const matchesSearch =
        searchQuery === '' ||
        order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      // Advanced filters
      const matchesCategory = categoryFilter === 'all' || order.category === categoryFilter;
      const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
      const matchesMinAmount = minAmount === '' || order.total >= parseFloat(minAmount);
      const matchesMaxAmount = maxAmount === '' || order.total <= parseFloat(maxAmount);
      
      return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesMinAmount && matchesMaxAmount;
    });
  }, [searchQuery, statusFilter, categoryFilter, priorityFilter, minAmount, maxAmount]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setPriorityFilter('all');
    setMinAmount('');
    setMaxAmount('');
  };

  const activeFilterCount = [
    statusFilter !== 'all',
    categoryFilter !== 'all',
    priorityFilter !== 'all',
    minAmount !== '',
    maxAmount !== '',
  ].filter(Boolean).length;

  const hasActiveFilters = searchQuery !== '' || activeFilterCount > 0;

  return (
    <ShowcasePage
      title="Advanced Filters"
      description="Demonstrate progressive disclosure of filter options - basic filters visible by default, advanced filters revealed on demand."
    >
      <ShowcaseSection
        title="Order Search with Advanced Filters"
        description="Toggle 'Advanced filters' to reveal additional filtering options without cluttering the default view."
      >
        <CodeExample
          id="progressive"
          title="Progressive Filter Disclosure"
          code={`const [showAdvanced, setShowAdvanced] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [statusFilter, setStatusFilter] = useState('all');
// Advanced filters
const [categoryFilter, setCategoryFilter] = useState('all');
const [priorityFilter, setPriorityFilter] = useState('all');
const [minAmount, setMinAmount] = useState('');

<Card>
  {/* Basic Filters - Always Visible */}
  <div className="p-4 border-b">
    <div className="flex gap-4">
      <Input placeholder="Search orders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="Completed">Completed</SelectItem>
          <SelectItem value="Processing">Processing</SelectItem>
        </SelectContent>
      </Select>
    </div>
    
    {/* Advanced Filters Toggle */}
    <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Advanced filters
          {activeFilterCount > 0 && <Badge>{activeFilterCount}</Badge>}
          {showAdvanced ? <ChevronUp /> : <ChevronDown />}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        {/* Additional filters revealed here */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>...</Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>...</Select>
          <div className="flex gap-2">
            <Input placeholder="Min $" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} />
            <Input placeholder="Max $" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  </div>
  
  {/* Results Table */}
  <table>...</table>
</Card>`}
        >
          <Card>
            {/* Basic Filters - Always Visible */}
            <div className="p-4 border-b">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by order ID or customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    <X className="h-4 w-4 mr-1" /> Clear all
                  </Button>
                )}
              </div>

              {/* Advanced Filters Toggle */}
              <div className="mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  aria-expanded={showAdvanced}
                >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Advanced filters
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                        {activeFilterCount}
                      </Badge>
                    )}
                    {showAdvanced ? (
                      <ChevronUp className="h-4 w-4 ml-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                </Button>

                {showAdvanced && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 mt-3 border-t">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Category</Label>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="Electronics">Electronics</SelectItem>
                          <SelectItem value="Clothing">Clothing</SelectItem>
                          <SelectItem value="Books">Books</SelectItem>
                          <SelectItem value="Furniture">Furniture</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Priority</Label>
                      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="All Priorities" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priorities</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Normal">Normal</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Min Amount</Label>
                      <Input
                        type="number"
                        placeholder="$0"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Max Amount</Label>
                      <Input
                        type="number"
                        placeholder="No limit"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>
                )}
              </div>

              {hasActiveFilters && (
                <p className="text-sm text-muted-foreground mt-3">
                  Showing {filteredOrders.length} of {allOrders.length} orders
                </p>
              )}
            </div>

            {/* Results Table */}
            <CardContent className="p-0">
              {filteredOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-left text-xs font-medium">Order ID</th>
                        <th className="p-3 text-left text-xs font-medium">Customer</th>
                        <th className="p-3 text-left text-xs font-medium">Status</th>
                        <th className="p-3 text-left text-xs font-medium">Category</th>
                        <th className="p-3 text-left text-xs font-medium">Priority</th>
                        <th className="p-3 text-right text-xs font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="border-b last:border-b-0 hover:bg-muted/30">
                          <td className="p-3 text-sm font-medium">{order.id}</td>
                          <td className="p-3 text-sm">{order.customer}</td>
                          <td className="p-3">
                            <Badge
                              variant={
                                order.status === 'Completed'
                                  ? 'default'
                                  : order.status === 'Processing'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {order.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">{order.category}</td>
                          <td className="p-3">
                            <span className={cn(
                              "text-xs font-medium",
                              order.priority === 'High' && 'text-red-600',
                              order.priority === 'Normal' && 'text-blue-600',
                              order.priority === 'Low' && 'text-muted-foreground'
                            )}>
                              {order.priority}
                            </span>
                          </td>
                          <td className="p-3 text-sm text-right font-medium">${order.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8">
                  <EmptyState
                    title="No orders found"
                    description="Try adjusting your filters to find what you're looking for."
                    action={{
                      label: 'Clear all filters',
                      onClick: clearAllFilters,
                      variant: 'outline',
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default AdvancedFiltersShowcasePage;
