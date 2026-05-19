import React, { useState } from 'react';
import { Mail, Phone, MapPin, Building } from 'lucide-react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { ScrollArea } from '@/shared/ui/shadcn/components/ui/scroll-area';
import { Separator } from '@/shared/ui/shadcn/components/ui/separator';
import { cn } from '@/shadcn/lib/utils';

// Sample data
const customers = [
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@company.com',
    phone: '+1 (555) 123-4567',
    company: 'Tech Corp',
    location: 'San Francisco, CA',
    status: 'Active',
    totalOrders: 24,
    totalSpent: '$4,250',
    joinDate: 'Jan 15, 2023',
    lastOrder: 'Dec 10, 2024',
    notes: 'VIP customer, prefers email communication.',
  },
  {
    id: 2,
    name: 'Bob Smith',
    email: 'bob@startup.io',
    phone: '+1 (555) 234-5678',
    company: 'Startup Inc',
    location: 'New York, NY',
    status: 'Active',
    totalOrders: 12,
    totalSpent: '$1,890',
    joinDate: 'Mar 22, 2023',
    lastOrder: 'Dec 8, 2024',
    notes: 'Interested in bulk discounts.',
  },
  {
    id: 3,
    name: 'Carol Williams',
    email: 'carol@design.co',
    phone: '+1 (555) 345-6789',
    company: 'Design Co',
    location: 'Los Angeles, CA',
    status: 'Inactive',
    totalOrders: 8,
    totalSpent: '$920',
    joinDate: 'Jun 10, 2023',
    lastOrder: 'Sep 15, 2024',
    notes: 'Account on hold - pending payment.',
  },
  {
    id: 4,
    name: 'David Brown',
    email: 'david@enterprise.com',
    phone: '+1 (555) 456-7890',
    company: 'Enterprise Ltd',
    location: 'Chicago, IL',
    status: 'Active',
    totalOrders: 45,
    totalSpent: '$12,500',
    joinDate: 'Feb 5, 2023',
    lastOrder: 'Dec 12, 2024',
    notes: 'Enterprise account, dedicated support.',
  },
  {
    id: 5,
    name: 'Eva Martinez',
    email: 'eva@agency.net',
    phone: '+1 (555) 567-8901',
    company: 'Creative Agency',
    location: 'Miami, FL',
    status: 'Pending',
    totalOrders: 3,
    totalSpent: '$450',
    joinDate: 'Nov 1, 2024',
    lastOrder: 'Nov 28, 2024',
    notes: 'New customer, trial period.',
  },
  {
    id: 6,
    name: 'Frank Lee',
    email: 'frank@consulting.biz',
    phone: '+1 (555) 678-9012',
    company: 'Consulting Group',
    location: 'Seattle, WA',
    status: 'Active',
    totalOrders: 18,
    totalSpent: '$3,200',
    joinDate: 'Apr 18, 2023',
    lastOrder: 'Dec 5, 2024',
    notes: 'Prefers phone calls for support.',
  },
];

const MasterDetailShowcasePage: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0]);

  return (
    <ShowcasePage
      title="Master-Detail View"
      description="Demonstrate the split-view pattern with a list/table on the left and detail preview on the right."
    >
      <ShowcaseSection
        title="Customer Directory"
        description="Select a customer from the list to view their details. State is managed locally without route changes."
      >
        <CodeExample
          id="compositions"
          title="Master-Detail Split View"
          code={`const [selectedCustomer, setSelectedCustomer] = useState(customers[0]);

<div className="grid grid-cols-3 gap-4 h-[500px]">
  {/* Master List (Left Pane) */}
  <Card className="col-span-1">
    <CardHeader>
      <CardTitle>Customers</CardTitle>
    </CardHeader>
    <ScrollArea className="h-[400px]">
      {customers.map((customer) => (
        <div
          key={customer.id}
          onClick={() => setSelectedCustomer(customer)}
          className={cn(
            "p-3 cursor-pointer hover:bg-muted/50",
            selectedCustomer.id === customer.id && "bg-primary/10"
          )}
        >
          <p className="font-medium">{customer.name}</p>
          <p className="text-sm text-muted-foreground">{customer.company}</p>
        </div>
      ))}
    </ScrollArea>
  </Card>
  
  {/* Detail View (Right Pane) */}
  <Card className="col-span-2">
    <CardHeader>
      <CardTitle>{selectedCustomer.name}</CardTitle>
      <Badge>{selectedCustomer.status}</Badge>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Email</p>
          <p>{selectedCustomer.email}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Phone</p>
          <p>{selectedCustomer.phone}</p>
        </div>
        {/* ... more fields */}
      </div>
    </CardContent>
  </Card>
</div>`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[550px]">
            {/* Master List (Left Pane) */}
            <Card className="lg:col-span-1 flex flex-col">
              <CardHeader className="pb-2 shrink-0">
                <CardTitle className="text-base">Customers</CardTitle>
                <p className="text-sm text-muted-foreground">{customers.length} total</p>
              </CardHeader>
              <ScrollArea className="flex-1">
                <div className="divide-y">
                  {customers.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => setSelectedCustomer(customer)}
                      className={cn(
                        "p-4 cursor-pointer transition-colors hover:bg-muted/50",
                        selectedCustomer.id === customer.id && "bg-primary/10 border-l-2 border-l-primary"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">{customer.company}</p>
                        </div>
                        <Badge
                          variant={
                            customer.status === 'Active'
                              ? 'default'
                              : customer.status === 'Pending'
                              ? 'secondary'
                              : 'outline'
                          }
                          className="text-[10px] px-1.5 py-0"
                        >
                          {customer.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{customer.email}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>

            {/* Detail View (Right Pane) */}
            <Card className="lg:col-span-2 flex flex-col">
              <CardHeader className="pb-2 shrink-0">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{selectedCustomer.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{selectedCustomer.company}</p>
                  </div>
                  <Badge
                    variant={
                      selectedCustomer.status === 'Active'
                        ? 'default'
                        : selectedCustomer.status === 'Pending'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {selectedCustomer.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm">{selectedCustomer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm">{selectedCustomer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Building className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Company</p>
                      <p className="text-sm">{selectedCustomer.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm">{selectedCustomer.location}</p>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Total Orders</p>
                    <p className="text-lg font-bold">{selectedCustomer.totalOrders}</p>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                    <p className="text-lg font-bold">{selectedCustomer.totalSpent}</p>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Join Date</p>
                    <p className="text-sm font-medium">{selectedCustomer.joinDate}</p>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Last Order</p>
                    <p className="text-sm font-medium">{selectedCustomer.lastOrder}</p>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Notes */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    {selectedCustomer.notes}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-6">
                  <Button size="sm">Edit Customer</Button>
                  <Button size="sm" variant="outline">View Orders</Button>
                  <Button size="sm" variant="outline">Send Email</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default MasterDetailShowcasePage;
