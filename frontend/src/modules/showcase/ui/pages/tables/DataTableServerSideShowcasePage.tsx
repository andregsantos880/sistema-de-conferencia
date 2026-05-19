import React, { useState, useMemo, useCallback } from 'react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { DataTable, type DataTableColumn } from '@/shared/ui/components/table/DataTable';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import type { ServerUser } from '@/modules/showcase/infrastructure/mocks/dataTableHandlers';
import type { SortingState, ColumnFiltersState, PaginationState } from '@tanstack/react-table';

interface ServerResponse {
  data: ServerUser[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

// Fetch function for server-side data 
const fetchUsers = async (params: {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDesc?: boolean;
  filters?: Record<string, string>;
}): Promise<ServerResponse> => {
  const searchParams = new URLSearchParams();
  searchParams.set('page', String(params.page));
  searchParams.set('pageSize', String(params.pageSize));
  
  if (params.sortBy) {
    searchParams.set('sortBy', params.sortBy);
    searchParams.set('sortDesc', String(params.sortDesc || false));
  }
  
  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value) searchParams.set(key, value);
    });
  }

  const response = await fetch(`/api/showcase/users?${searchParams.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

const DataTableServerSideShowcasePage: React.FC = () => {
  // Server-side state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Query for server data
  const { data, isLoading, isError } = useQuery({
    queryKey: ['showcase-users-v2', pageIndex, pageSize, sorting, filters],
    queryFn: () => fetchUsers({
      page: pageIndex,
      pageSize,
      sortBy: sorting[0]?.id,
      sortDesc: sorting[0]?.desc,
      filters,
    }),
    placeholderData: (prev) => prev,
  });

  const handlePaginationChange = useCallback((update: PaginationState) => {
    setPageIndex(update.pageIndex);
    setPageSize(update.pageSize);
  }, []);

  const handleSortingChange = useCallback((newSorting: SortingState) => {
    setSorting(newSorting);
    setPageIndex(0); // Reset to first page on sort
  }, []);

  const handleFiltersChange = useCallback((newFilters: ColumnFiltersState) => {
    // Convert ColumnFiltersState to Record<string, string>
    const filterRecord: Record<string, string> = {};
    newFilters.forEach((f) => {
      if (f.value) filterRecord[f.id] = String(f.value);
    });
    setFilters(filterRecord);
    setPageIndex(0); // Reset to first page on filter
  }, []);

  // Columns definition
  const columns: DataTableColumn<ServerUser>[] = useMemo(() => [
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
    { 
      id: 'department', 
      header: 'Department', 
      cell: (row) => row.department,
      filter: { 
        type: 'select', 
        options: [
          { label: 'Engineering', value: 'Engineering' },
          { label: 'Sales', value: 'Sales' },
          { label: 'Marketing', value: 'Marketing' },
          { label: 'HR', value: 'HR' },
          { label: 'Finance', value: 'Finance' },
          { label: 'Support', value: 'Support' }
        ]
      }
    },
    { id: 'joinDate', header: 'Joined', cell: (row) => row.joinDate, sortable: true },
  ], []);

  // Simple columns without filters (for pagination demo)
  const simpleColumns: DataTableColumn<ServerUser>[] = useMemo(() => [
    { id: 'name', header: 'Name', cell: (row) => <span className="font-medium">{row.name}</span>, sortable: true },
    { id: 'email', header: 'Email', cell: (row) => row.email, sortable: true },
    { id: 'role', header: 'Role', cell: (row) => row.role, sortable: true },
    { id: 'status', header: 'Status', cell: (row) => (
      <Badge variant={row.status === 'Active' ? 'default' : 'secondary'}>{row.status}</Badge>
    )},
    { id: 'department', header: 'Department', cell: (row) => row.department },
  ], []);

  return (
    <ShowcasePage
      title="DataTable - Server-Side Mode"
      description="Demonstrate server-side pagination, sorting, and filtering with API integration. Perfect for large datasets. Powered by TanStack Table."
    >
      {/* Server-Side Pagination */}
      <ShowcaseSection
        title="Server-Side Pagination"
        description="The table requests only the data needed for the current page from the server."
      >
        <CodeExample
          id="datatable-server-pagination"
          title="Paginated API Requests"
          code={`const { data, isLoading } = useQuery({
  queryKey: ['users', pageIndex, pageSize],
  queryFn: () => fetchUsers({ page: pageIndex, pageSize }),
});

<DataTable 
  columns={columns}
  data={data?.data || []}
  isLoading={isLoading}
  mode="server"
  totalCount={data?.pagination.totalCount}
  onPaginationChange={(state) => {
    setPageIndex(state.pageIndex);
    setPageSize(state.pageSize);
  }}
/>`}
        >
          <div className="space-y-2 mb-4">
            <p className="text-sm text-muted-foreground">
              Total Records: <strong>{data?.pagination.totalCount || 0}</strong> | 
              Current Page: <strong>{(data?.pagination.page || 0) + 1}</strong> of <strong>{data?.pagination.totalPages || 1}</strong>
            </p>
          </div>
          <DataTable 
            columns={simpleColumns}
            data={data?.data || []}
            isLoading={isLoading}
            isError={isError}
            mode="server"
            totalCount={data?.pagination.totalCount}
            pageSizeOptions={[5, 10, 20, 50]}
            onPaginationChange={handlePaginationChange}
            enableGlobalSearch={false}
          />
        </CodeExample>
      </ShowcaseSection>

      {/* Server-Side Sorting */}
      <ShowcaseSection
        title="Server-Side Sorting"
        description="Sorting is handled by the server, allowing efficient sorting of large datasets."
      >
        <CodeExample
          id="datatable-server-sorting"
          title="API-Driven Sorting"
          code={`const [sorting, setSorting] = useState<SortingState>([]);

const { data } = useQuery({
  queryKey: ['users', pageIndex, pageSize, sorting],
  queryFn: () => fetchUsers({
    page: pageIndex,
    pageSize,
    sortBy: sorting[0]?.id,
    sortDesc: sorting[0]?.desc,
  }),
});

<DataTable 
  columns={columns}
  data={data?.data || []}
  mode="server"
  onSortingChange={(newSorting) => {
    setSorting(newSorting);
    setPageIndex(0); // Reset to first page
  }}
/>`}
        >
          <div className="space-y-2 mb-4">
            <p className="text-sm text-muted-foreground">
              Current Sort: {sorting.length > 0 ? (
                <strong>{sorting[0].id} ({sorting[0].desc ? 'desc' : 'asc'})</strong>
              ) : (
                <span>None</span>
              )}
            </p>
          </div>
          <DataTable 
            columns={simpleColumns}
            data={data?.data || []}
            isLoading={isLoading}
            mode="server"
            totalCount={data?.pagination.totalCount}
            pageSizeOptions={[5, 10, 20]}
            onPaginationChange={handlePaginationChange}
            onSortingChange={handleSortingChange}
            enableGlobalSearch={false}
          />
        </CodeExample>
      </ShowcaseSection>

      {/* Server-Side Filtering */}
      <ShowcaseSection
        title="Server-Side Filtering"
        description="Filters are sent to the server, enabling efficient querying of large datasets."
      >
        <CodeExample
          id="datatable-server-filtering"
          title="API-Driven Filters"
          code={`const [filters, setFilters] = useState<Record<string, string>>({});

const { data } = useQuery({
  queryKey: ['users', pageIndex, pageSize, sorting, filters],
  queryFn: () => fetchUsers({
    page: pageIndex,
    pageSize,
    sortBy: sorting[0]?.id,
    sortDesc: sorting[0]?.desc,
    filters,
  }),
});

<DataTable 
  columns={columns}
  data={data?.data || []}
  mode="server"
  onColumnFiltersChange={(newFilters) => {
    setFilters(convertToRecord(newFilters));
    setPageIndex(0); // Reset to first page
  }}
/>`}
        >
          <div className="space-y-2 mb-4">
            <p className="text-sm text-muted-foreground">
              Active Filters: {Object.keys(filters).filter(k => filters[k]).length > 0 ? (
                <strong>{Object.keys(filters).filter(k => filters[k]).join(', ')}</strong>
              ) : (
                <span>None</span>
              )}
            </p>
          </div>
          <DataTable 
            columns={columns}
            data={data?.data || []}
            isLoading={isLoading}
            mode="server"
            totalCount={data?.pagination.totalCount}
            pageSizeOptions={[5, 10, 20]}
            onPaginationChange={handlePaginationChange}
            onColumnFiltersChange={handleFiltersChange}
            enableGlobalSearch={false}
          />
        </CodeExample>
      </ShowcaseSection>

      {/* Full Server-Side */}
      <ShowcaseSection
        title="Complete Server-Side Integration"
        description="All table operations delegated to the server: pagination, sorting, and filtering work together seamlessly."
      >
        <CodeExample
          id="datatable-server-full"
          title="Production-Ready Server Mode"
          code={`<DataTable 
  columns={columns}
  data={data?.data || []}
  isLoading={isLoading}
  isError={isError}
  mode="server"
  totalCount={data?.pagination.totalCount}
  pageSizeOptions={[5, 10, 20, 50]}
  onPaginationChange={handlePaginationChange}
  onSortingChange={handleSortingChange}
  onColumnFiltersChange={handleFiltersChange}
/>`}
        >
          <div className="space-y-2 mb-4">
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>Total: <strong>{data?.pagination.totalCount || 0}</strong></span>
              <span>Page: <strong>{(pageIndex + 1)} / {data?.pagination.totalPages || 1}</strong></span>
              <span>Sort: {sorting.length > 0 ? <strong>{sorting[0].id}</strong> : 'None'}</span>
              <span>Filters: <strong>{Object.keys(filters).filter(k => filters[k]).length}</strong></span>
            </div>
          </div>
          <DataTable 
            columns={columns}
            data={data?.data || []}
            isLoading={isLoading}
            isError={isError}
            mode="server"
            totalCount={data?.pagination.totalCount}
            pageSizeOptions={[5, 10, 20, 50]}
            onPaginationChange={handlePaginationChange}
            onSortingChange={handleSortingChange}
            onColumnFiltersChange={handleFiltersChange}
          />
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default DataTableServerSideShowcasePage;
