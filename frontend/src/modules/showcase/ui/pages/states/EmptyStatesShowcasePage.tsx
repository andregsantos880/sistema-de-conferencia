import React from 'react';
import { Plus, Search, FileText, LayoutDashboard, FolderOpen, RefreshCw } from 'lucide-react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { EmptyState } from '@/shared/ui/components/states/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/shadcn/components/ui/table';

const EmptyStatesShowcasePage: React.FC = () => {
  return (
    <ShowcasePage
      title="Empty States"
      description="Demonstrate how Katalyst handles absence of data gracefully and intentionally."
    >
      <ShowcaseSection
        title="Empty Table"
        description="Table component with no rows, clear empty message, and primary CTA."
      >
        <CodeExample
          id="states"
          title="Empty Data Table"
          code={`<Card>
  <CardHeader>
    <CardTitle>Recent Orders</CardTitle>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* No rows - empty state */}
      </TableBody>
    </Table>
    <EmptyState
      icon={FileText}
      title="No orders yet"
      description="When customers place orders, they will appear here."
      action={{
        label: "Create Order",
        onClick: () => {},
        icon: Plus,
      }}
    />
  </CardContent>
</Card>`}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* No rows - empty state */}
                </TableBody>
              </Table>
              <div className="py-8">
                <EmptyState
                  icon={FileText}
                  title="No orders yet"
                  description="When customers place orders, they will appear here."
                  action={{
                    label: "Create Order",
                    onClick: () => {},
                    icon: Plus,
                  }}
                  size="sm"
                />
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Empty Dashboard"
        description="Empty stat cards and placeholder charts with helpful onboarding text."
      >
        <CodeExample
          id="states"
          title="Empty Dashboard View"
          code={`<div className="space-y-6">
  {/* Empty KPI Cards */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card className="p-6">
      <p className="text-sm text-muted-foreground">Total Revenue</p>
      <p className="text-2xl font-bold text-muted-foreground/50">--</p>
    </Card>
    {/* ... more cards */}
  </div>
  
  {/* Empty Chart Area */}
  <Card className="p-6">
    <EmptyState
      icon={LayoutDashboard}
      title="No data to display"
      description="Connect your data sources to see analytics here."
      action={{ label: "Connect Data", onClick: () => {} }}
    />
  </Card>
</div>`}
        >
          <div className="space-y-6">
            {/* Empty KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-muted-foreground/50">--</p>
                <p className="text-xs text-muted-foreground mt-1">No data available</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Active Users</p>
                <p className="text-2xl font-bold text-muted-foreground/50">--</p>
                <p className="text-xs text-muted-foreground mt-1">No data available</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Conversion Rate</p>
                <p className="text-2xl font-bold text-muted-foreground/50">--</p>
                <p className="text-xs text-muted-foreground mt-1">No data available</p>
              </Card>
            </div>
            
            {/* Empty Chart Area */}
            <Card className="p-6">
              <EmptyState
                icon={LayoutDashboard}
                title="No analytics data yet"
                description="Connect your data sources to see charts and insights here."
                action={{
                  label: "Connect Data Source",
                  onClick: () => {},
                  icon: Plus,
                }}
                size="md"
              />
            </Card>
          </div>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Empty Search Results"
        description="Search input with no matches, friendly copy, and reset filters action."
      >
        <CodeExample
          id="states"
          title="No Search Results"
          code={`<div className="space-y-4">
  <div className="flex gap-2">
    <Input placeholder="Search..." value="xyz123" />
    <Button variant="outline">Search</Button>
  </div>
  
  <EmptyState
    icon={Search}
    title="No results found"
    description="We couldn't find anything matching 'xyz123'. Try adjusting your search."
    action={{ label: "Clear Search", onClick: () => {}, variant: "outline" }}
  />
</div>`}
        >
          <div className="space-y-4">
            <div className="flex gap-2 max-w-md">
              <Input placeholder="Search..." defaultValue="xyz123" className="flex-1" />
              <Button variant="outline">Search</Button>
            </div>
            
            <Card className="p-6">
              <EmptyState
                icon={Search}
                title="No results found"
                description="We couldn't find anything matching 'xyz123'. Try adjusting your search or clearing filters."
                action={{
                  label: "Clear Search",
                  onClick: () => {},
                  variant: "outline",
                  icon: RefreshCw,
                }}
                size="sm"
              />
            </Card>
          </div>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Empty Detail Page"
        description="Example of navigating to a resource that has no content yet."
      >
        <CodeExample
          id="states"
          title="Empty Project Detail"
          code={`<Card className="p-8">
  <div className="flex items-center justify-between mb-6">
    <div>
      <h2 className="text-xl font-semibold">Project Alpha</h2>
      <p className="text-sm text-muted-foreground">Created Dec 10, 2024</p>
    </div>
    <Button>Edit Project</Button>
  </div>
  
  <EmptyState
    icon={FolderOpen}
    title="This project is empty"
    description="Add files, tasks, or team members to get started."
    action={{ label: "Add Content", onClick: () => {}, icon: Plus }}
    secondaryAction={{ label: "Import from Template", onClick: () => {} }}
  />
</Card>`}
        >
          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Project Alpha</h2>
                <p className="text-sm text-muted-foreground">Created Dec 10, 2024</p>
              </div>
              <Button variant="outline">Edit Project</Button>
            </div>
            
            <div className="border-t pt-6">
              <EmptyState
                icon={FolderOpen}
                title="This project is empty"
                description="Add files, tasks, or team members to get started with your project."
                action={{
                  label: "Add Content",
                  onClick: () => {},
                  icon: Plus,
                }}
                secondaryAction={{
                  label: "Import from Template",
                  onClick: () => {},
                  variant: "outline",
                }}
                size="md"
              />
            </div>
          </Card>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default EmptyStatesShowcasePage;
