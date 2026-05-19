import React, { useMemo, useState } from 'react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { DataTable, type DataTableColumn } from '@/shared/ui/components/table/DataTable';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { Button } from '@/shared/ui/shadcn/components/ui/button';

// Sample data
const allUsers = [
  { id: 1, name: 'Alice Johnson', email: 'alice@company.com', role: 'Admin', status: 'Active', department: 'Engineering', joinDate: '2023-01-15', salary: 95000 },
  { id: 2, name: 'Bob Smith', email: 'bob@company.com', role: 'Manager', status: 'Active', department: 'Sales', joinDate: '2023-02-20', salary: 85000 },
  { id: 3, name: 'Carol Williams', email: 'carol@company.com', role: 'Member', status: 'Inactive', department: 'Marketing', joinDate: '2023-03-10', salary: 65000 },
  { id: 4, name: 'David Brown', email: 'david@company.com', role: 'Member', status: 'Active', department: 'Engineering', joinDate: '2023-04-05', salary: 78000 },
  { id: 5, name: 'Eva Martinez', email: 'eva@company.com', role: 'Admin', status: 'Pending', department: 'HR', joinDate: '2023-05-12', salary: 92000 },
  { id: 6, name: 'Frank Lee', email: 'frank@company.com', role: 'Member', status: 'Active', department: 'Engineering', joinDate: '2023-06-18', salary: 72000 },
  { id: 7, name: 'Grace Kim', email: 'grace@company.com', role: 'Manager', status: 'Active', department: 'Finance', joinDate: '2023-07-22', salary: 88000 },
  { id: 8, name: 'Henry Chen', email: 'henry@company.com', role: 'Member', status: 'Inactive', department: 'Support', joinDate: '2023-08-30', salary: 62000 },
  { id: 9, name: 'Ivy Taylor', email: 'ivy@company.com', role: 'Member', status: 'Active', department: 'Sales', joinDate: '2023-09-14', salary: 68000 },
  { id: 10, name: 'Jack Wilson', email: 'jack@company.com', role: 'Admin', status: 'Active', department: 'Engineering', joinDate: '2023-10-01', salary: 98000 },
  { id: 11, name: 'Karen Davis', email: 'karen@company.com', role: 'Member', status: 'Pending', department: 'Marketing', joinDate: '2023-11-08', salary: 64000 },
  { id: 12, name: 'Leo Garcia', email: 'leo@company.com', role: 'Manager', status: 'Active', department: 'Engineering', joinDate: '2023-12-15', salary: 90000 },
];

type User = typeof allUsers[0];

const DataTableShowcasePage: React.FC = () => {
  const [selectedRows, setSelectedRows] = useState<User[]>([]);

  // Basic columns
  const basicColumns: DataTableColumn<User>[] = useMemo(() => [
    { 
      id: 'name', 
      header: 'Name', 
      cell: (row) => <span className="font-medium">{row.name}</span>, 
      sortable: true 
    },
    { id: 'email', header: 'Email', cell: (row) => row.email, sortable: true },
    { id: 'role', header: 'Role', cell: (row) => row.role, sortable: true },
    { 
      id: 'status', 
      header: 'Status', 
      cell: (row) => (
        <Badge variant={row.status === 'Active' ? 'default' : 'secondary'}>
          {row.status}
        </Badge>
      )
    },
  ], []);

  // Columns with filters
  const filteredColumns: DataTableColumn<User>[] = useMemo(() => [
    { 
      id: 'name', 
      header: 'Name', 
      cell: (row) => <span className="font-medium">{row.name}</span>, 
      sortable: true,
      filter: { type: 'text', placeholder: 'Search name...' }
    },
    { 
      id: 'email', 
      header: 'Email', 
      cell: (row) => row.email, 
      sortable: true,
      filter: { type: 'text', placeholder: 'Search email...' }
    },
    { 
      id: 'role', 
      header: 'Role', 
      cell: (row) => row.role, 
      sortable: true,
      filter: { 
        type: 'select', 
        options: [
          { label: 'Admin', value: 'Admin' },
          { label: 'Manager', value: 'Manager' },
          { label: 'Member', value: 'Member' }
        ]
      }
    },
    { 
      id: 'status', 
      header: 'Status', 
      cell: (row) => (
        <Badge variant={row.status === 'Active' ? 'default' : 'secondary'}>
          {row.status}
        </Badge>
      ),
      filter: { 
        type: 'select', 
        options: [
          { label: 'Active', value: 'Active' },
          { label: 'Inactive', value: 'Inactive' },
          { label: 'Pending', value: 'Pending' }
        ]
      }
    },
    { id: 'department', header: 'Department', cell: (row) => row.department },
  ], []);

  // Full featured columns
  const fullColumns: DataTableColumn<User>[] = useMemo(() => [
    { 
      id: 'name', 
      header: 'Name', 
      cell: (row) => <span className="font-medium">{row.name}</span>, 
      sortable: true,
      filter: { type: 'text', placeholder: 'Search...' },
      width: 180
    },
    { 
      id: 'email', 
      header: 'Email', 
      cell: (row) => row.email, 
      sortable: true,
      width: 220
    },
    { 
      id: 'role', 
      header: 'Role', 
      cell: (row) => row.role, 
      sortable: true,
      filter: { 
        type: 'select', 
        options: [
          { label: 'Admin', value: 'Admin' },
          { label: 'Manager', value: 'Manager' },
          { label: 'Member', value: 'Member' }
        ]
      }
    },
    { 
      id: 'status', 
      header: 'Status', 
      cell: (row) => (
        <Badge variant={row.status === 'Active' ? 'default' : 'secondary'}>
          {row.status}
        </Badge>
      ),
      filter: { 
        type: 'select', 
        options: [
          { label: 'Active', value: 'Active' },
          { label: 'Inactive', value: 'Inactive' },
          { label: 'Pending', value: 'Pending' }
        ]
      }
    },
    { id: 'department', header: 'Department', cell: (row) => row.department, visible: true },
    { id: 'joinDate', header: 'Joined', cell: (row) => row.joinDate, sortable: true, visible: false },
    { id: 'salary', header: 'Salary', cell: (row) => `$${row.salary.toLocaleString()}`, sortable: true, visible: false },
  ], []);

  return (
    <ShowcasePage
      title="DataTable Component"
      description="Enterprise-grade data table with built-in toolbar, filtering, sorting, pagination, column visibility, resizing, and CSV export. Powered by TanStack Table."
    >
      {/* Basic Setup */}
      <ShowcaseSection
        title="Basic Setup"
        description="Minimal configuration gets you a functional table with search, sorting, and pagination. Client-side processing is automatic."
      >
        <CodeExample
          id="datatable-basic"
          title="Getting Started"
          code={`const columns: DataTableColumn<User>[] = [
  { id: 'name', header: 'Name', cell: (row) => row.name, sortable: true },
  { id: 'email', header: 'Email', cell: (row) => row.email, sortable: true },
  { id: 'role', header: 'Role', cell: (row) => row.role },
];

<DataTable 
  columns={columns} 
  data={users}
  pageSizeOptions={[5, 10]}
  defaultPageSize={5}
/>`}
        >
          <DataTable 
            columns={basicColumns} 
            data={allUsers}
            pageSizeOptions={[5, 10]}
            defaultPageSize={5}
          />
        </CodeExample>
      </ShowcaseSection>

      {/* Column Filtering */}
      <ShowcaseSection
        title="Column Filtering"
        description="Add text or select filters to individual columns for granular data exploration. Filters work automatically in client mode."
      >
        <CodeExample
          id="datatable-filtering"
          title="Text & Select Filters"
          code={`const columns: DataTableColumn<User>[] = [
  { 
    id: 'name', 
    header: 'Name', 
    cell: (row) => row.name, 
    sortable: true,
    filter: { type: 'text', placeholder: 'Search name...' }
  },
  { 
    id: 'role', 
    header: 'Role', 
    cell: (row) => row.role,
    filter: { 
      type: 'select', 
      options: [
        { label: 'Admin', value: 'Admin' },
        { label: 'Manager', value: 'Manager' }
      ]
    }
  },
];`}
        >
          <DataTable 
            columns={filteredColumns} 
            data={allUsers}
            pageSizeOptions={[5, 10]}
          />
        </CodeExample>
      </ShowcaseSection>

      {/* Row Selection */}
      <ShowcaseSection
        title="Row Selection & Bulk Actions"
        description="Enable checkboxes for row selection. Perfect for bulk operations."
      >
        <CodeExample
          id="datatable-selection"
          title="Selectable Rows"
          code={`<DataTable 
  columns={columns} 
  data={users}
  enableRowSelection
  onRowSelectionChange={(rows) => setSelectedRows(rows)}
/>

{selectedRows.length > 0 && (
  <div>
    <p>{selectedRows.length} rows selected</p>
    <Button onClick={handleBulkAction}>Process Selected</Button>
  </div>
)}`}
        >
          <div className="space-y-4">
            {selectedRows.length > 0 && (
              <div className="p-3 bg-primary/10 rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedRows.length} row{selectedRows.length === 1 ? '' : 's'} selected
                </span>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setSelectedRows([])}
                >
                  Clear Selection
                </Button>
              </div>
            )}
            <DataTable 
              columns={basicColumns} 
              data={allUsers}
              enableRowSelection
              pageSizeOptions={[5, 10]}
              onRowSelectionChange={setSelectedRows}
              selectedRows={selectedRows}
            />
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Column Visibility & Resizing */}
      <ShowcaseSection
        title="Column Management"
        description="Users can toggle column visibility and resize columns by dragging."
      >
        <CodeExample
          id="datatable-columns"
          title="Hide/Show & Resize Columns"
          code={`const columns: DataTableColumn<User>[] = [
  { id: 'name', header: 'Name', width: 180, visible: true },
  { id: 'joinDate', header: 'Joined', visible: false },
];

<DataTable 
  columns={columns} 
  data={users}
  enableColumnVisibility
  enableColumnResizing
/>`}
        >
          <DataTable 
            columns={fullColumns} 
            data={allUsers}
            pageSizeOptions={[5, 10]}
          />
        </CodeExample>
      </ShowcaseSection>

      {/* State Persistence */}
      <ShowcaseSection
        title="State Persistence"
        description="Use storageKey to persist table state (filters, sorting, visibility, density) across sessions."
      >
        <CodeExample
          id="datatable-persistence"
          title="LocalStorage Integration"
          code={`<DataTable 
  columns={columns} 
  data={users}
  storageKey="users.table"
  // Sorting, filters, column visibility, sizing, and density are now persisted
/>`}
        >
          <div className="space-y-2 mb-4">
            <p className="text-sm text-muted-foreground">
              Try changing filters, sorting, density, or column visibility. Refresh the page—your preferences will be restored.
            </p>
          </div>
          <DataTable 
            columns={fullColumns} 
            data={allUsers}
            storageKey="showcase.users-persistent-v2"
            pageSizeOptions={[5, 10]}
          />
        </CodeExample>
      </ShowcaseSection>

      {/* CSV Export */}
      <ShowcaseSection
        title="CSV Export"
        description="Built-in export button generates CSV from visible columns and current data."
      >
        <CodeExample
          id="datatable-export"
          title="One-Click Data Export"
          code={`<DataTable 
  columns={columns} 
  data={users}
  enableCsvExport
  // CSV export button appears in toolbar automatically
/>`}
        >
          <DataTable 
            columns={basicColumns} 
            data={allUsers}
            pageSizeOptions={[5, 10]}
          />
        </CodeExample>
      </ShowcaseSection>

      {/* Full Featured */}
      <ShowcaseSection
        title="Full Featured Example"
        description="All capabilities combined: filtering, sorting, pagination, selection, visibility, resizing, density, and export."
      >
        <CodeExample
          id="datatable-full"
          title="Everything Enabled"
          code={`<DataTable 
  columns={columns} 
  data={users}
  enableRowSelection
  enableGlobalSearch
  enableColumnVisibility
  enableColumnResizing
  enableDensitySelector
  enableCsvExport
  pageSizeOptions={[5, 10, 20]}
  storageKey="showcase.full-table-v2"
  density="normal"
/>`}
        >
          <DataTable 
            columns={fullColumns} 
            data={allUsers}
            enableRowSelection
            pageSizeOptions={[5, 10, 20]}
            storageKey="showcase.full-featured-table-v2"
            density="normal"
          />
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default DataTableShowcasePage;
