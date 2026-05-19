import React, { useState } from 'react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
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
import { DataTable, type DataTableColumn } from '@/shared/ui/components/table/DataTable';
import { ScrollArea } from '@/shared/ui/shadcn/components/ui/scroll-area';
import { Separator } from '@/shared/ui/shadcn/components/ui/separator';
import { cn } from '@/shadcn/lib/utils';

// Generate large dataset for tables
const generateTableData = (count: number) => {
  const statuses = ['Active', 'Pending', 'Inactive', 'Archived'];
  const departments = ['Engineering', 'Sales', 'Marketing', 'Support', 'Finance', 'HR'];
  const locations = ['New York', 'London', 'Tokyo', 'Berlin', 'Sydney', 'Toronto'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `USR-${String(i + 1).padStart(4, '0')}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    department: departments[i % departments.length],
    location: locations[i % locations.length],
    status: statuses[i % statuses.length],
    role: i % 5 === 0 ? 'Admin' : i % 3 === 0 ? 'Manager' : 'Member',
    joinDate: new Date(2020 + (i % 5), i % 12, (i % 28) + 1).toLocaleDateString(),
    lastActive: `${(i % 24) + 1}h ago`,
    projects: Math.floor(Math.random() * 20) + 1,
    tasks: Math.floor(Math.random() * 50) + 5,
    completion: Math.floor(Math.random() * 100),
  }));
};

const largeDataset = generateTableData(75);
const denseColumnsData = generateTableData(20);

type DensityUser = (typeof largeDataset)[number];

// Column definitions for large table
const largeTableColumns: DataTableColumn<DensityUser>[] = [
  { id: 'id', header: 'ID', cell: (row) => <span className="font-mono text-xs">{row.id}</span>, sortable: true },
  { id: 'name', header: 'Name', cell: (row) => row.name, sortable: true },
  { id: 'email', header: 'Email', cell: (row) => row.email, sortable: true },
  { id: 'status', header: 'Status', cell: (row) => (
    <Badge variant={row.status === 'Active' ? 'default' : row.status === 'Pending' ? 'secondary' : 'outline'}>
      {row.status}
    </Badge>
  ), sortable: true },
];

// Column definitions for dense columns table
const denseColumnsTableColumns: DataTableColumn<DensityUser>[] = [
  { id: 'id', header: 'ID', cell: (row) => <span className="font-mono text-xs">{row.id}</span>, sortable: true },
  { id: 'name', header: 'Name', cell: (row) => row.name, sortable: true },
  { id: 'email', header: 'Email', cell: (row) => <span className="truncate max-w-[150px] block">{row.email}</span> },
  { id: 'department', header: 'Department', cell: (row) => row.department },
  { id: 'location', header: 'Location', cell: (row) => row.location },
  { id: 'role', header: 'Role', cell: (row) => row.role },
  { id: 'joinDate', header: 'Join Date', cell: (row) => row.joinDate },
  { id: 'lastActive', header: 'Last Active', cell: (row) => row.lastActive },
  { id: 'projects', header: 'Projects', cell: (row) => row.projects, className: 'text-right' },
  { id: 'tasks', header: 'Tasks', cell: (row) => row.tasks, className: 'text-right' },
  { id: 'completion', header: 'Completion', cell: (row) => `${row.completion}%`, className: 'text-right' },
];

// Dashboard stats data
const dashboardStats = [
  { label: 'Total Revenue', value: '$124,500', change: '+12.5%', positive: true },
  { label: 'Active Users', value: '8,420', change: '+5.2%', positive: true },
  { label: 'Orders', value: '1,234', change: '-2.1%', positive: false },
  { label: 'Conversion', value: '3.24%', change: '+0.8%', positive: true },
  { label: 'Avg. Order', value: '$85.40', change: '+4.3%', positive: true },
  { label: 'Refunds', value: '23', change: '-15%', positive: true },
];

const DensityShowcasePage: React.FC = () => {
  const [densityMode, setDensityMode] = useState<'comfortable' | 'compact'>('comfortable');

  return (
    <ShowcasePage
      title="Density & Scale"
      description="Demonstrate how Katalyst adapts to power-user scenarios, large datasets, and compact UI requirements."
    >
      {/* Section A: Comfortable Density */}
      <ShowcaseSection
        title="Comfortable Density (Default)"
        description="Standard spacing optimized for readability. Matches most SaaS defaults."
      >
        <CodeExample
          id="density"
          title="Default Spacing"
          code={`{/* Table with standard row height */}
<DataTable
  columns={columns}
  data={data}
  density="regular"
/>

{/* Form with normal spacing */}
<div className="space-y-4">
  <div className="space-y-2">
    <Label>Field Label</Label>
    <Input placeholder="Enter value..." />
  </div>
</div>

{/* Card with regular padding */}
<Card className="p-6">
  <CardTitle>Card Title</CardTitle>
  <CardContent>Content here</CardContent>
</Card>`}
        >
          <div className="space-y-6">
            {/* Comfortable table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Comfortable Table</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <div className="grid grid-cols-4 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
                    <div>Name</div>
                    <div>Email</div>
                    <div>Department</div>
                    <div>Status</div>
                  </div>
                  {largeDataset.slice(0, 5).map((row) => (
                    <div key={row.id} className="grid grid-cols-4 gap-4 p-4 border-b last:border-b-0 text-sm">
                      <div>{row.name}</div>
                      <div className="text-muted-foreground">{row.email}</div>
                      <div>{row.department}</div>
                      <div>
                        <Badge variant={row.status === 'Active' ? 'default' : 'secondary'}>{row.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Comfortable form */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Comfortable Form</h3>
              <div className="grid grid-cols-2 gap-6 max-w-2xl">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input placeholder="Enter first name..." />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input placeholder="Enter last name..." />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="Enter email..." />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eng">Engineering</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Section B: Compact Density */}
      <ShowcaseSection
        title="Compact Density (Power User)"
        description="Reduced spacing for information-dense interfaces. Same components, tighter layout."
      >
        <CodeExample
          id="density"
          title="Compact Spacing"
          code={`{/* Table with compact row height */}
<DataTable
  columns={columns}
  data={data}
  density="compact"
/>

{/* Form with condensed spacing */}
<div className="space-y-2">
  <div className="space-y-1">
    <Label className="text-xs">Field Label</Label>
    <Input className="h-8 text-sm" placeholder="Enter value..." />
  </div>
</div>

{/* Card with tighter padding */}
<Card className="p-3">
  <CardTitle className="text-sm">Card Title</CardTitle>
  <CardContent>Content here</CardContent>
</Card>`}
        >
          <div className="space-y-4">
            {/* Compact table */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Compact Table</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="rounded-lg border">
                  <div className="grid grid-cols-4 gap-3 px-3 py-2 border-b bg-muted/50 text-xs font-medium">
                    <div>Name</div>
                    <div>Email</div>
                    <div>Department</div>
                    <div>Status</div>
                  </div>
                  {largeDataset.slice(0, 8).map((row) => (
                    <div key={row.id} className="grid grid-cols-4 gap-3 px-3 py-1.5 border-b last:border-b-0 text-xs">
                      <div>{row.name}</div>
                      <div className="text-muted-foreground truncate">{row.email}</div>
                      <div>{row.department}</div>
                      <div>
                        <Badge variant={row.status === 'Active' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                          {row.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Compact form */}
            <Card className="p-4">
              <h3 className="font-medium text-sm mb-3">Compact Form</h3>
              <div className="grid grid-cols-3 gap-3 max-w-3xl">
                <div className="space-y-1">
                  <Label className="text-xs">First Name</Label>
                  <Input className="h-8 text-sm" placeholder="First name" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Last Name</Label>
                  <Input className="h-8 text-sm" placeholder="Last name" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Email</Label>
                  <Input className="h-8 text-sm" type="email" placeholder="Email" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Department</Label>
                  <Select>
                    <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eng">Engineering</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Role</Label>
                  <Select>
                    <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Location</Label>
                  <Input className="h-8 text-sm" placeholder="Location" />
                </div>
              </div>
            </Card>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Section C: Large Table Dataset */}
      <ShowcaseSection
        title="Large Table Dataset"
        description="Table with 75 rows demonstrating pagination and sorting at scale."
      >
        <CodeExample
          id="density"
          title="75-Row Table with Pagination"
          code={`<DataTable
  columns={columns}
  data={largeDataset} // 75 rows
  pageSizeOptions={[10, 25, 50]}
  enableRowSelection={false}
/>`}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">User Directory ({largeDataset.length} records)</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={largeTableColumns}
                data={largeDataset}
                pageSizeOptions={[10, 25, 50]}
                enableRowSelection={false}
              />
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      {/* Section D: Dense Columns */}
      <ShowcaseSection
        title="Dense Columns"
        description="Table with 11 columns demonstrating horizontal scroll and enterprise data layouts."
      >
        <CodeExample
          id="density"
          title="Multi-Column Table"
          code={`<div className="overflow-x-auto">
  <DataTable
    columns={denseColumns} // 11 columns
    data={data}
    density="compact"
  />
</div>`}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Enterprise Data View (11 columns)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <DataTable
                  columns={denseColumnsTableColumns}
                  data={denseColumnsData}
                  density="compact"
                  enableRowSelection={false}
                  pageSizeOptions={[10, 20]}
                />
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      {/* Section E: Long Forms */}
      <ShowcaseSection
        title="Long Forms"
        description="Form with 18 fields grouped into logical sections with clear visual hierarchy."
      >
        <CodeExample
          id="density"
          title="Multi-Section Form"
          code={`<form className="space-y-8">
  {/* Section 1: Personal Info */}
  <div>
    <h3 className="font-semibold mb-4">Personal Information</h3>
    <div className="grid grid-cols-3 gap-4">
      <Input placeholder="First Name" />
      <Input placeholder="Last Name" />
      <Input placeholder="Email" />
      {/* ... more fields */}
    </div>
  </div>
  
  <Separator />
  
  {/* Section 2: Work Info */}
  <div>
    <h3 className="font-semibold mb-4">Work Information</h3>
    {/* ... fields */}
  </div>
  
  {/* Sticky action bar */}
  <div className="sticky bottom-0 bg-background border-t p-4">
    <Button>Save Changes</Button>
  </div>
</form>`}
        >
          <Card>
            <CardContent className="p-6">
              <ScrollArea className="h-[500px] pr-4">
                <form className="space-y-8">
                  {/* Section 1: Personal Information */}
                  <div>
                    <h3 className="font-semibold text-base mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input placeholder="John" />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input placeholder="Doe" />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" placeholder="john@example.com" />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input placeholder="+1 (555) 000-0000" />
                      </div>
                      <div className="space-y-2">
                        <Label>Date of Birth</Label>
                        <Input type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <Select>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Section 2: Address */}
                  <div>
                    <h3 className="font-semibold text-base mb-4">Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label>Street Address</Label>
                        <Input placeholder="123 Main Street" />
                      </div>
                      <div className="space-y-2">
                        <Label>Apt/Suite</Label>
                        <Input placeholder="Apt 4B" />
                      </div>
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input placeholder="New York" />
                      </div>
                      <div className="space-y-2">
                        <Label>State/Province</Label>
                        <Input placeholder="NY" />
                      </div>
                      <div className="space-y-2">
                        <Label>Postal Code</Label>
                        <Input placeholder="10001" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Section 3: Work Information */}
                  <div>
                    <h3 className="font-semibold text-base mb-4">Work Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Job Title</Label>
                        <Input placeholder="Software Engineer" />
                      </div>
                      <div className="space-y-2">
                        <Label>Department</Label>
                        <Select>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="eng">Engineering</SelectItem>
                            <SelectItem value="sales">Sales</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="hr">Human Resources</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Manager</Label>
                        <Input placeholder="Jane Smith" />
                      </div>
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label>Employee ID</Label>
                        <Input placeholder="EMP-0001" />
                      </div>
                      <div className="space-y-2">
                        <Label>Work Location</Label>
                        <Select>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="remote">Remote</SelectItem>
                            <SelectItem value="office">Office</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Sticky action bar */}
                  <div className="sticky bottom-0 bg-background border-t pt-4 -mx-6 px-6 -mb-6 pb-6">
                    <div className="flex gap-3">
                      <Button>Save Changes</Button>
                      <Button variant="outline">Cancel</Button>
                    </div>
                  </div>
                </form>
              </ScrollArea>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      {/* Section F & G: Dashboard Density Comparison */}
      <ShowcaseSection
        title="Dashboard Density Comparison"
        description="Toggle between compact and comfortable dashboard layouts."
      >
        <CodeExample
          id="density"
          title="Adaptive Dashboard"
          code={`const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');

<div className={cn(
  "grid gap-4",
  density === 'compact' ? 'grid-cols-6 gap-2' : 'grid-cols-3 gap-4'
)}>
  {stats.map((stat) => (
    <Card className={cn(density === 'compact' ? 'p-3' : 'p-6')}>
      <p className={cn(density === 'compact' ? 'text-xs' : 'text-sm')}>{stat.label}</p>
      <p className={cn(density === 'compact' ? 'text-lg' : 'text-2xl')}>{stat.value}</p>
    </Card>
  ))}
</div>`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label>Density Mode:</Label>
              <Select value={densityMode} onValueChange={(v) => setDensityMode(v as 'comfortable' | 'compact')}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={cn(
              "grid transition-all duration-300",
              densityMode === 'compact' 
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2' 
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            )}>
              {dashboardStats.map((stat, i) => (
                <Card key={i} className={cn(
                  "transition-all duration-300",
                  densityMode === 'compact' ? 'p-3' : 'p-6'
                )}>
                  <p className={cn(
                    "text-muted-foreground mb-1",
                    densityMode === 'compact' ? 'text-xs' : 'text-sm'
                  )}>
                    {stat.label}
                  </p>
                  <p className={cn(
                    "font-bold",
                    densityMode === 'compact' ? 'text-lg' : 'text-2xl'
                  )}>
                    {stat.value}
                  </p>
                  <p className={cn(
                    densityMode === 'compact' ? 'text-[10px]' : 'text-xs',
                    stat.positive ? 'text-success' : 'text-destructive'
                  )}>
                    {stat.change}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Section H: Split Layout */}
      <ShowcaseSection
        title="Split Layout (Power User)"
        description="Compact filters sidebar with main content area for information-dense interfaces."
      >
        <CodeExample
          id="density"
          title="Filters + Content Split"
          code={`<div className="flex gap-4">
  {/* Compact filters sidebar */}
  <aside className="w-64 shrink-0 space-y-3 p-3 border rounded-lg">
    <Input className="h-8 text-sm" placeholder="Search..." />
    <Select>...</Select>
    <Select>...</Select>
  </aside>
  
  {/* Main content */}
  <main className="flex-1">
    <DataTable columns={columns} data={data} density="compact" />
  </main>
</div>`}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Compact filters sidebar */}
                <aside className="w-56 shrink-0 space-y-3 p-3 border rounded-lg bg-muted/30">
                  <h4 className="font-medium text-sm">Filters</h4>
                  <div className="space-y-2">
                    <Input className="h-8 text-sm" placeholder="Search users..." />
                    <Select>
                      <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Department" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="eng">Engineering</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Role" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 h-7 text-xs">Apply</Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs">Reset</Button>
                  </div>
                </aside>

                {/* Main content area */}
                <main className="flex-1 min-w-0">
                  <div className="rounded-lg border">
                    <div className="grid grid-cols-4 gap-3 px-3 py-2 border-b bg-muted/50 text-xs font-medium">
                      <div>Name</div>
                      <div>Email</div>
                      <div>Department</div>
                      <div>Status</div>
                    </div>
                    {largeDataset.slice(0, 10).map((row) => (
                      <div key={row.id} className="grid grid-cols-4 gap-3 px-3 py-1.5 border-b last:border-b-0 text-xs">
                        <div>{row.name}</div>
                        <div className="text-muted-foreground truncate">{row.email}</div>
                        <div>{row.department}</div>
                        <div>
                          <Badge variant={row.status === 'Active' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                            {row.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </main>
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      {/* Section I: Multi-Panel View */}
      <ShowcaseSection
        title="Multi-Panel View"
        description="Three panels visible at once with independent scrolling."
      >
        <CodeExample
          id="density"
          title="Three-Panel Layout"
          code={`<div className="grid grid-cols-3 gap-4 h-[400px]">
  {/* Panel 1: List */}
  <ScrollArea className="border rounded-lg">
    {items.map(item => <ListItem key={item.id} />)}
  </ScrollArea>
  
  {/* Panel 2: Details */}
  <ScrollArea className="border rounded-lg">
    <DetailView />
  </ScrollArea>
  
  {/* Panel 3: Activity */}
  <ScrollArea className="border rounded-lg">
    <ActivityFeed />
  </ScrollArea>
</div>`}
        >
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[350px]">
                {/* Panel 1: User List */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="p-2 border-b bg-muted/50">
                    <h4 className="font-medium text-xs">Users</h4>
                  </div>
                  <ScrollArea className="h-[300px]">
                    <div className="p-2 space-y-1">
                      {largeDataset.slice(0, 15).map((user, i) => (
                        <div 
                          key={user.id} 
                          className={cn(
                            "p-2 rounded text-xs cursor-pointer hover:bg-muted/50",
                            i === 0 && "bg-primary/10"
                          )}
                        >
                          <div className="font-medium">{user.name}</div>
                          <div className="text-muted-foreground text-[10px]">{user.email}</div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Panel 2: User Details */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="p-2 border-b bg-muted/50">
                    <h4 className="font-medium text-xs">Details</h4>
                  </div>
                  <ScrollArea className="h-[300px]">
                    <div className="p-3 space-y-3">
                      <div className="text-center py-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 mx-auto mb-2 flex items-center justify-center text-lg font-bold">
                          U1
                        </div>
                        <h3 className="font-medium text-sm">User 1</h3>
                        <p className="text-xs text-muted-foreground">user1@example.com</p>
                      </div>
                      <Separator />
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Department</span>
                          <span>Engineering</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Location</span>
                          <span>New York</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Role</span>
                          <span>Admin</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status</span>
                          <Badge variant="default" className="text-[10px] px-1.5 py-0">Active</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Projects</span>
                          <span>12</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tasks</span>
                          <span>45</span>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </div>

                {/* Panel 3: Activity */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="p-2 border-b bg-muted/50">
                    <h4 className="font-medium text-xs">Activity</h4>
                  </div>
                  <ScrollArea className="h-[300px]">
                    <div className="p-2 space-y-2">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="p-2 border-b last:border-b-0 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="font-medium">Action {i + 1}</span>
                          </div>
                          <p className="text-muted-foreground text-[10px] ml-3.5">
                            User completed task #{i + 100}
                          </p>
                          <p className="text-muted-foreground text-[10px] ml-3.5">
                            {i + 1}h ago
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default DensityShowcasePage;

