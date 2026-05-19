import React, { useState } from 'react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import type { ColumnDef } from '@tanstack/react-table';
import { SimpleSortableTable } from '@/shared/ui/components/table/SimpleSortableTable';
import { Mail, Phone, MapPin, Rows2, Rows3, Rows4 } from 'lucide-react';
import NavRail from '@/shared/ui/components/navigation/NavRail';

// Sample data
const employees = [
  {
    id: 1,
    name: 'Alice Johnson',
    role: 'Senior Engineer',
    department: 'Engineering',
    status: 'Active',
    email: 'alice@company.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    startDate: 'Jan 15, 2021',
    projects: ['Project Alpha', 'Project Beta'],
  },
  {
    id: 2,
    name: 'Bob Smith',
    role: 'Engineering Manager',
    department: 'Engineering',
    status: 'Active',
    email: 'bob@company.com',
    phone: '+1 (555) 234-5678',
    location: 'New York, NY',
    startDate: 'Mar 10, 2019',
    projects: ['Project Gamma'],
  },
  {
    id: 3,
    name: 'Carol Williams',
    role: 'VP of Engineering',
    department: 'Engineering',
    status: 'Active',
    email: 'carol@company.com',
    phone: '+1 (555) 345-6789',
    location: 'Seattle, WA',
    startDate: 'Jun 5, 2018',
    projects: ['Strategic Planning'],
  },
  {
    id: 4,
    name: 'David Brown',
    role: 'Product Designer',
    department: 'Design',
    status: 'On Leave',
    email: 'david@company.com',
    phone: '+1 (555) 456-7890',
    location: 'Austin, TX',
    startDate: 'Sep 20, 2022',
    projects: ['Design System', 'Mobile App'],
  },
  {
    id: 5,
    name: 'Eva Martinez',
    role: 'Design Lead',
    department: 'Design',
    status: 'Active',
    email: 'eva@company.com',
    phone: '+1 (555) 567-8901',
    location: 'Los Angeles, CA',
    startDate: 'Feb 14, 2020',
    projects: ['Brand Refresh', 'Design System'],
  },
  {
    id: 6,
    name: 'Frank Wilson',
    role: 'Frontend Developer',
    department: 'Engineering',
    status: 'Active',
    email: 'frank@company.com',
    phone: '+1 (555) 678-9012',
    location: 'Remote',
    startDate: 'May 01, 2023',
    projects: ['Dashboard V2'],
  },
  {
    id: 7,
    name: 'Grace Lee',
    role: 'Product Manager',
    department: 'Product',
    status: 'Active',
    email: 'grace@company.com',
    phone: '+1 (555) 789-0123',
    location: 'New York, NY',
    startDate: 'Aug 12, 2021',
    projects: ['Roadmap Q4', 'User Research'],
  },
  {
    id: 8,
    name: 'Henry Taylor',
    role: 'DevOps Engineer',
    department: 'Engineering',
    status: 'Probation',
    email: 'henry@company.com',
    phone: '+1 (555) 890-1234',
    location: 'San Francisco, CA',
    startDate: 'Nov 05, 2023',
    projects: ['Cloud Migration'],
  },
  {
    id: 9,
    name: 'Ivy Chen',
    role: 'Marketing Specialist',
    department: 'Marketing',
    status: 'Active',
    email: 'ivy@company.com',
    phone: '+1 (555) 901-2345',
    location: 'Austin, TX',
    startDate: 'Apr 22, 2022',
    projects: ['Social Media Campaign', 'Q3 Launch'],
  },
  {
    id: 10,
    name: 'Jack Robinson',
    role: 'Data Scientist',
    department: 'Data',
    status: 'Active',
    email: 'jack@company.com',
    phone: '+1 (555) 012-3456',
    location: 'Boston, MA',
    startDate: 'Oct 15, 2020',
    projects: ['Churn Prediction', 'Revenue Model'],
  },
  {
    id: 11,
    name: 'Kelly White',
    role: 'HR Manager',
    department: 'HR',
    status: 'Active',
    email: 'kelly@company.com',
    phone: '+1 (555) 123-5678',
    location: 'Miami, FL',
    startDate: 'Jul 01, 2019',
    projects: ['Recruitment Drive', 'Benefits Refresh'],
  },
  {
    id: 12,
    name: 'Leo Garcia',
    role: 'QA Engineer',
    department: 'Engineering',
    status: 'Contractor',
    email: 'leo@company.com',
    phone: '+1 (555) 234-6789',
    location: 'Remote',
    startDate: 'Jan 10, 2023',
    projects: ['Automated Testing'],
  },
  {
    id: 13,
    name: 'Mia Davis',
    role: 'UX Researcher',
    department: 'Design',
    status: 'Active',
    email: 'mia@company.com',
    phone: '+1 (555) 345-7890',
    location: 'Seattle, WA',
    startDate: 'Mar 15, 2021',
    projects: ['Accessibility Audit', 'User Interviews'],
  },
  {
    id: 14,
    name: 'Noah Wilson',
    role: 'Sales Representative',
    department: 'Sales',
    status: 'Active',
    email: 'noah@company.com',
    phone: '+1 (555) 456-8901',
    location: 'Chicago, IL',
    startDate: 'Jun 20, 2022',
    projects: ['Enterprise Deals', 'Q4 Targets'],
  },
  {
    id: 15,
    name: 'Olivia Martin',
    role: 'Content Writer',
    department: 'Marketing',
    status: 'Active',
    email: 'olivia@company.com',
    phone: '+1 (555) 567-9012',
    location: 'New York, NY',
    startDate: 'Sep 05, 2021',
    projects: ['Blog Strategy', 'Newsletter'],
  },
];

const SimpleSortableTableShowcasePage: React.FC = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [density, setDensity] = useState<'compact' | 'normal' | 'spacious'>('normal');

  // Basic columns
  const basicColumns: ColumnDef<typeof employees[0]>[] = [
    { 
      accessorKey: 'name', 
      header: 'Name',
      cell: info => <span className="font-medium">{info.getValue() as string}</span>
    },
    { accessorKey: 'role', header: 'Role' },
    { accessorKey: 'department', header: 'Department' },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: info => (
        <Badge variant={info.getValue() === 'Active' ? 'default' : 'secondary'}>
          {info.getValue() as string}
        </Badge>
      )
    },
  ];

  return (
    <ShowcasePage
      title="SimpleSortableTable"
      description="A lightweight, interactive table component with built-in sorting, pagination, expansion, selection, and density controls."
    >
      {/* Basic Sorting */}
      <ShowcaseSection
        title="Basic Sorting"
        description="Click column headers to sort. Powered by TanStack Table with sensible defaults."
      >
        <CodeExample
          id="simple-sortable-basic"
          title="Out-of-the-Box Sorting"
          code={`<SimpleSortableTable 
  data={employees} 
  columns={columns}
  initialSort={[{ id: 'name', desc: false }]}
/>`}
        >
          <SimpleSortableTable 
            data={employees.slice(0, 5)} 
            columns={basicColumns}
            initialSort={[{ id: 'name', desc: false }]}
          />
        </CodeExample>
      </ShowcaseSection>

      {/* Pagination */}
      <ShowcaseSection
        title="Client-Side Pagination"
        description="Paginate large datasets with customizable page sizes. Powered by TanStack Table."
      >
        <CodeExample
          id="simple-sortable-pagination"
          title="Paginated Table"
          code={`<SimpleSortableTable 
  data={employees} 
  columns={columns}
  enablePagination
  defaultPageSize={5}
  pageSizeOptions={[5, 10, 20]}
/>`}
        >
          <SimpleSortableTable 
            data={employees} 
            columns={basicColumns}
            enablePagination
            defaultPageSize={5}
            pageSizeOptions={[5, 10, 20]}
          />
        </CodeExample>
      </ShowcaseSection>

      {/* Expandable Rows - Single */}
      <ShowcaseSection
        title="Expandable Rows (Single)"
        description="Click rows to reveal additional details. Only one row can be expanded at a time."
      >
        <CodeExample
          id="simple-sortable-expand-single"
          title="Single Expansion Mode"
          code={`<SimpleSortableTable 
  data={employees}
  columns={columns}
  expandable
  multiExpand={false}
  renderExpandedRow={(row) => (
    <div className="p-4 grid grid-cols-2 gap-4">
      <div><strong>Email:</strong> {row.email}</div>
      <div><strong>Phone:</strong> {row.phone}</div>
    </div>
  )}
/>`}
        >
          <SimpleSortableTable 
            data={employees.slice(0, 5)}
            columns={basicColumns}
            expandable
            multiExpand={false}
            renderExpandedRow={(row) => (
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p>{row.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p>{row.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p>{row.location}</p>
                  </div>
                </div>
              </div>
            )}
          />
        </CodeExample>
      </ShowcaseSection>

      {/* Expandable Rows - Multi */}
      <ShowcaseSection
        title="Expandable Rows (Multi)"
        description="Multiple rows can be expanded simultaneously for comparison."
      >
        <CodeExample
          id="simple-sortable-expand-multi"
          title="Multi Expansion Mode"
          code={`<SimpleSortableTable 
  data={employees}
  columns={columns}
  expandable
  multiExpand={true}
  defaultExpandedRowIds={['1', '3']}
  renderExpandedRow={(row) => (
    <div className="p-4">
      <p><strong>Projects:</strong></p>
      <div className="flex gap-2 mt-2">
        {row.projects.map(p => <Badge key={p}>{p}</Badge>)}
      </div>
    </div>
  )}
/>`}
        >
          <SimpleSortableTable 
            data={employees.slice(0, 5)}
            columns={basicColumns}
            expandable
            multiExpand={true}
            getRowId={(row) => String(row.id)}
            defaultExpandedRowIds={['1', '3']}
            renderExpandedRow={(row) => (
              <div className="p-4">
                <div>
                  <p className="text-sm font-medium mb-2">Projects</p>
                  <div className="flex flex-wrap gap-2">
                    {row.projects.map(p => (
                      <Badge key={p} variant="outline" className="text-xs">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">Start Date: {row.startDate}</p>
                </div>
              </div>
            )}
          />
        </CodeExample>
      </ShowcaseSection>

      {/* Row Selection */}
      <ShowcaseSection
        title="Row Selection & Highlighting"
        description="Use selectedRowId to visually emphasize a specific row. Great for master-detail views."
      >
        <CodeExample
          id="simple-sortable-selection"
          title="Selected Row Highlighting"
          code={`const [selectedId, setSelectedId] = useState<string | null>(null);

<SimpleSortableTable 
  data={employees}
  columns={columns}
  selectedRowId={selectedId}
  getRowId={(row) => String(row.id)}
  onRowClick={(row) => setSelectedId(String(row.id))}
/>`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Selected Employee:</span>
              <Badge variant="outline">
                {selectedEmployee ? employees.find(e => String(e.id) === selectedEmployee)?.name : 'None'}
              </Badge>
              {selectedEmployee && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedEmployee(null)}
                >
                  Clear Selection
                </Button>
              )}
            </div>
            <SimpleSortableTable 
              data={employees.slice(0, 5)}
              columns={basicColumns}
              selectedRowId={selectedEmployee}
              getRowId={(row) => String(row.id)}
              onRowClick={(row) => setSelectedEmployee(String(row.id))}
            />
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Density */}
      <ShowcaseSection
        title="Density Control"
        description="Adjust row padding to fit more data or improve readability."
      >
        <CodeExample
          id="simple-sortable-density"
          title="Compact, Normal & Spacious Modes"
          code={`<SimpleSortableTable 
  data={employees}
  columns={columns}
  density="compact" // or "normal" or "spacious"
/>`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-card">
              <span className="text-sm font-medium">Select Density:</span>
              <NavRail
                items={[
                  { id: 'compact', label: 'Compact', icon: <Rows4 className="size-4" /> },
                  { id: 'normal', label: 'Normal', icon: <Rows3 className="size-4" /> },
                  { id: 'spacious', label: 'Spacious', icon: <Rows2 className="size-4" /> },
                ]}
                value={density}
                onChange={(id) => setDensity(id as any)}
                variant="horizontal"
                size="sm"
                className="rounded-full p-1"
              />
            </div>
            
              <SimpleSortableTable 
                data={employees.slice(0, 5)}
                columns={basicColumns}
                density={density}
              />
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Combined Features */}
      <ShowcaseSection
        title="Combined Features"
        description="All features working together: sorting, expansion, selection, and density in one table."
      >
        <CodeExample
          id="simple-sortable-combined"
          title="Full Feature Set"
          code={`<SimpleSortableTable 
  data={employees}
  columns={columns}
  initialSort={[{ id: 'name', desc: false }]}
  expandable
  multiExpand
  selectedRowId={selectedId}
  getRowId={(row) => String(row.id)}
  onRowClick={(row) => setSelectedId(String(row.id))}
  density="compact"
  renderExpandedRow={(row) => (
    <div>
      {/* Expanded content */}
    </div>
  )}
/>`}
        >
          <SimpleSortableTable 
            data={employees.slice(0, 5)}
            columns={basicColumns}
            initialSort={[{ id: 'department', desc: false }]}
            expandable
            multiExpand
            selectedRowId={selectedEmployee}
            getRowId={(row) => String(row.id)}
            onRowClick={(row) => setSelectedEmployee(String(row.id))}
            density="compact"
            renderExpandedRow={(row) => (
              <div className="p-4 bg-gradient-to-br from-muted/30 via-muted/20 to-muted/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Contact</p>
                    <p className="text-sm">{row.email}</p>
                    <p className="text-sm text-muted-foreground">{row.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Location</p>
                    <p className="text-sm">{row.location}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Active Projects</p>
                  <div className="flex flex-wrap gap-1">
                    {row.projects.map(p => (
                      <Badge key={p} variant="secondary" className="text-[10px]">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          />
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default SimpleSortableTableShowcasePage;
