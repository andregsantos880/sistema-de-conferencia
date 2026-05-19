import React, { useState, useMemo } from 'react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/shadcn/components/ui/table';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { ScrollArea } from '@/shared/ui/shadcn/components/ui/scroll-area';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/shadcn/lib/utils';

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
};

const sampleUsers: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active', createdAt: '2024-01-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'active', createdAt: '2024-02-20' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Viewer', status: 'inactive', createdAt: '2024-03-10' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Editor', status: 'active', createdAt: '2024-01-25' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Viewer', status: 'pending', createdAt: '2024-04-05' },
];

const extendedUsers: User[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: ['Admin', 'Editor', 'Viewer'][i % 3],
  status: (['active', 'inactive', 'pending'] as const)[i % 3],
  createdAt: `2024-0${(i % 9) + 1}-${String((i % 28) + 1).padStart(2, '0')}`,
}));

const StatusBadge = ({ status }: { status: User['status'] }) => {
  const variants = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  };
  return <Badge className={variants[status]}>{status}</Badge>;
};

type SortableHeaderProps = {
  column: keyof User;
  label: string;
  sortConfig: { key: keyof User; direction: 'asc' | 'desc' } | null;
  onSort: (key: keyof User) => void;
};

const SortableHeader = ({ column, label, sortConfig, onSort }: SortableHeaderProps) => {
  const isSorted = sortConfig?.key === column;
  return (
    <button
      className="flex items-center gap-1 hover:text-foreground translation-colors"
      onClick={() => onSort(column)}
    >
      {label}
      {isSorted ? (
        sortConfig.direction === 'asc' ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="h-4 w-4 opacity-50" />
      )}
    </button>
  );
};

// Density Options Demo
const DensityOptionsDemo = () => {
  const [density, setDensity] = useState<'compact' | 'normal' | 'spacious'>('normal');

  const densityClasses = {
    compact: 'py-1.5',
    normal: 'py-3',
    spacious: 'py-5',
  };

  return (
    <ShowcaseSection
      title="Density Options"
      description="Control the visual density of the table to accommodate different content requirements."
    >
      <CodeExample
        id="tables-density"
        title="Live Density Switching"
        code={`const [density, setDensity] = useState<'compact' | 'normal' | 'spacious'>('normal');

const densityClasses = {
  compact: 'py-1.5',
  normal: 'py-3',
  spacious: 'py-5',
};

<TableCell className={densityClasses[density]}>...</TableCell>`}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Density:</span>
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <Button
                variant={density === 'compact' ? 'default' : 'outline'}
                size="sm"
                className="rounded-r-none h-8"
                onClick={() => setDensity('compact')}
              >
                Compact
              </Button>
              <Button
                variant={density === 'normal' ? 'default' : 'outline'}
                size="sm"
                className={cn('rounded-none h-8', density !== 'normal' && 'border-l-0')}
                onClick={() => setDensity('normal')}
              >
                Normal
              </Button>
              <Button
                variant={density === 'spacious' ? 'default' : 'outline'}
                size="sm"
                className={cn('rounded-l-none h-8', density !== 'spacious' && 'border-l-0')}
                onClick={() => setDensity('spacious')}
              >
                Spacious
              </Button>
            </div>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={densityClasses[density]}>Name</TableHead>
                  <TableHead className={densityClasses[density]}>Email</TableHead>
                  <TableHead className={densityClasses[density]}>Role</TableHead>
                  <TableHead className={densityClasses[density]}>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleUsers.slice(0, 4).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className={cn('font-medium', densityClasses[density])}>{row.name}</TableCell>
                    <TableCell className={densityClasses[density]}>{row.email}</TableCell>
                    <TableCell className={densityClasses[density]}>{row.role}</TableCell>
                    <TableCell className={densityClasses[density]}><StatusBadge status={row.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CodeExample>
    </ShowcaseSection>
  );
};

const TablesShowcasePage: React.FC = () => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 5;

  const sortedData = useMemo(() => {
    if (!sortConfig) return sampleUsers;
    return [...sampleUsers].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sortConfig]);

  const paginatedData = useMemo(() => {
    const start = currentPage * pageSize;
    return extendedUsers.slice(start, start + pageSize);
  }, [currentPage]);

  const totalPages = Math.ceil(extendedUsers.length / pageSize);

  const handleSort = (key: keyof User) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        return null;
      }
      return { key, direction: 'asc' };
    });
  };

  return (
    <ShowcasePage
      title="Basic Tables"
      description="Foundational table components for displaying structured data. These examples demonstrate the core UI primitives without external dependencies."
    >
      {/* Simple Table */}
      <ShowcaseSection
        title="Simple Table"
        description="Standard table layout with headers and rows."
      >
        <CodeExample
          id="tables-basic"
          title="Basic Table Construction"
          code={`<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Role</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((row) => (
      <TableRow key={row.id}>
        <TableCell>{row.name}</TableCell>
        <TableCell>{row.email}</TableCell>
        <TableCell>{row.role}</TableCell>
        <TableCell><StatusBadge status={row.status} /></TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>`}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleUsers.slice(0, 5).map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.role}</TableCell>
                  <TableCell><StatusBadge status={row.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CodeExample>

        <CodeExample
          id="tables-striped"
          title="Striped Rows"
          code={`<Table>
  <TableBody>
    {data.map((row, i) => (
      <TableRow key={row.id} className={i % 2 === 0 ? 'bg-muted/50' : ''}>
        ...
      </TableRow>
    ))}
  </TableBody>
</Table>`}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleUsers.slice(0, 5).map((row, i) => (
                <TableRow key={row.id} className={i % 2 === 0 ? 'bg-muted/50' : ''}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CodeExample>
      </ShowcaseSection>

      {/* Sortable Table */}
      <ShowcaseSection
        title="Sortable Table (Manual)"
        description="Implementing sorting logic using standard interactivity."
      >
        <CodeExample
          id="tables-sorting"
          title="Sortable Columns"
          code={`const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

const handleSort = (key: string) => {
  setSortConfig((prev) => {
    if (prev?.key === key) {
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return null;
    }
    return { key, direction: 'asc' };
  });
};

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>
        <button onClick={() => handleSort('name')}>
          Name {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
        </button>
      </TableHead>
      ...
    </TableRow>
  </TableHeader>
</Table>`}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><SortableHeader column="name" label="Name" sortConfig={sortConfig} onSort={handleSort} /></TableHead>
                <TableHead><SortableHeader column="email" label="Email" sortConfig={sortConfig} onSort={handleSort} /></TableHead>
                <TableHead><SortableHeader column="role" label="Role" sortConfig={sortConfig} onSort={handleSort} /></TableHead>
                <TableHead><SortableHeader column="createdAt" label="Created" sortConfig={sortConfig} onSort={handleSort} /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.role}</TableCell>
                  <TableCell>{row.createdAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CodeExample>
      </ShowcaseSection>

      {/* Paginated Table */}
      <ShowcaseSection
        title="Paginated Table (Manual)"
        description="Handling pagination state manually for granular control."
      >
        <CodeExample
          id="tables-pagination"
          title="Client-Side Pagination"
          code={`const [currentPage, setCurrentPage] = useState(0);
const pageSize = 5;

const paginatedData = useMemo(() => {
  const start = currentPage * pageSize;
  return data.slice(start, start + pageSize);
}, [currentPage]);`}
        >
          <div className="space-y-4">
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.role}</TableCell>
                      <TableCell><StatusBadge status={row.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, extendedUsers.length)} of {extendedUsers.length} entries
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Scrollable Table */}
      <ShowcaseSection
        title="Scrollable Table"
        description="Container with overflow handling and sticky headers."
      >
        <CodeExample
          id="tables-scrollable"
          title="Sticky Header"
          code={`<ScrollArea className="h-[300px]">
  <Table>
    <TableHeader className="sticky top-0 bg-background z-10">
      ...
    </TableHeader>
    <TableBody>
      {/* Many rows */}
    </TableBody>
  </Table>
</ScrollArea>`}
        >
          <ScrollArea className="h-[300px] rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extendedUsers.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.role}</TableCell>
                    <TableCell><StatusBadge status={row.status} /></TableCell>
                    <TableCell>{row.createdAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CodeExample>
      </ShowcaseSection>

      <DensityOptionsDemo />
    </ShowcasePage>
  );
};

export default TablesShowcasePage;
