import React, { useState } from 'react';
import { Trash2, Download, CheckCircle, X, MoreHorizontal } from 'lucide-react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Card, CardContent } from '@/shared/ui/shadcn/components/ui/card';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Checkbox } from '@/shared/ui/shadcn/components/ui/checkbox';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/components/ui/select';
import { cn } from '@/shadcn/lib/utils';
import { useBulkSelection } from '@/shared/hooks';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Pending';
}

const initialUsers: User[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@company.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Bob Smith', email: 'bob@company.com', role: 'Editor', status: 'Active' },
  { id: 3, name: 'Carol Williams', email: 'carol@company.com', role: 'Viewer', status: 'Inactive' },
  { id: 4, name: 'David Brown', email: 'david@company.com', role: 'Editor', status: 'Pending' },
  { id: 5, name: 'Eva Martinez', email: 'eva@company.com', role: 'Admin', status: 'Active' },
  { id: 6, name: 'Frank Lee', email: 'frank@company.com', role: 'Viewer', status: 'Inactive' },
  { id: 7, name: 'Grace Kim', email: 'grace@company.com', role: 'Editor', status: 'Active' },
  { id: 8, name: 'Henry Chen', email: 'henry@company.com', role: 'Viewer', status: 'Pending' },
];

const BulkActionsTablesShowcasePage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [showActionFeedback, setShowActionFeedback] = useState<string | null>(null);

  const {
    selectedCount,
    isSelected,
    toggle: toggleSelect,
    selectAll,
    clear: clearSelection,
    isAllSelected,
    isSomeSelected,
  } = useBulkSelection<number>();

  const userIds = users.map((u) => u.id);
  const allSelected = isAllSelected(userIds);
  const someSelected = isSomeSelected(userIds);

  const toggleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAll(userIds);
    }
  };

  const handleBulkDelete = () => {
    setUsers((prev) => prev.filter((u) => !isSelected(u.id)));
    setShowActionFeedback(`${selectedCount} users deleted`);
    clearSelection();
    setTimeout(() => setShowActionFeedback(null), 3000);
  };

  const handleBulkStatusChange = (status: User['status']) => {
    setUsers((prev) =>
      prev.map((u) => (isSelected(u.id) ? { ...u, status } : u))
    );
    setShowActionFeedback(`${selectedCount} users updated to ${status}`);
    clearSelection();
    setTimeout(() => setShowActionFeedback(null), 3000);
  };

  const handleBulkExport = () => {
    const count = selectedCount;
    setShowActionFeedback(`Exporting ${count} users...`);
    setTimeout(() => {
      setShowActionFeedback(`${count} users exported`);
      setTimeout(() => setShowActionFeedback(null), 3000);
    }, 1000);
  };

  return (
    <ShowcasePage
      title="Table Bulk Actions"
      description="Demonstrate multi-selection in tables with a bulk action bar that appears when items are selected."
    >
      {/* Feedback Toast */}
      {showActionFeedback && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 fade-in-0 duration-300">
          <div className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg shadow-lg">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{showActionFeedback}</span>
          </div>
        </div>
      )}

      <ShowcaseSection
        title="User Management Table"
        description="Select rows to reveal the bulk action bar. Actions include delete, status change, and export."
      >
        <CodeExample
          id="bulk-actions"
          title="Table with Bulk Actions"
          code={`import { useBulkSelection } from '@/shared/hooks';

const {
  selectedCount,
  isSelected,
  toggle: toggleSelect,
  selectAll,
  clear: clearSelection,
  isAllSelected,
  isSomeSelected,
} = useBulkSelection<number>();

const userIds = users.map((u) => u.id);
const allSelected = isAllSelected(userIds);
const someSelected = isSomeSelected(userIds);

const toggleSelectAll = () => {
  allSelected ? clearSelection() : selectAll(userIds);
};

<Card>
  {/* Bulk Action Bar - appears when items selected */}
  {selectedCount > 0 && (
    <div className="flex items-center justify-between p-3 bg-primary/10 border-b">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{selectedCount} selected</span>
        <Button variant="ghost" size="sm" onClick={clearSelection}>
          <X className="h-4 w-4" /> Clear
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleBulkExport}>
          <Download className="h-4 w-4 mr-1" /> Export
        </Button>
        <Select onValueChange={handleBulkStatusChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Change status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">Set Active</SelectItem>
            <SelectItem value="Inactive">Set Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </div>
    </div>
  )}
  
  <table>
    <thead>
      <tr>
        <th>
          <Checkbox
            checked={allSelected}
            data-state={someSelected ? "indeterminate" : undefined}
            onCheckedChange={toggleSelectAll}
            aria-label="Select all"
          />
        </th>
        <th>Name</th>
        <th>Email</th>
        <th>Role</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      {users.map(user => (
        <tr key={user.id} className={cn(selectedIds.has(user.id) && "bg-primary/5")}>
          <td>
            <Checkbox
              checked={selectedIds.has(user.id)}
              onCheckedChange={() => toggleSelect(user.id)}
              aria-label={\`Select \${user.name}\`}
            />
          </td>
          <td>{user.name}</td>
          <td>{user.email}</td>
          <td>{user.role}</td>
          <td><Badge>{user.status}</Badge></td>
        </tr>
      ))}
    </tbody>
  </table>
</Card>`}
        >
          <Card className='py-0'>
            {/* Bulk Action Bar */}
            {selectedCount > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-primary/10 border-b animate-in slide-in-from-top-1 fade-in-0 duration-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {selectedCount} {selectedCount === 1 ? 'user' : 'users'} selected
                  </span>
                  <Button variant="ghost" size="sm" className="h-7" onClick={clearSelection}>
                    <X className="h-3 w-3 mr-1" /> Clear
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8" onClick={handleBulkExport}>
                    <Download className="h-4 w-4 mr-1" /> Export
                  </Button>
                  <Select onValueChange={(v) => handleBulkStatusChange(v as User['status'])}>
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue placeholder="Change status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Set Active</SelectItem>
                      <SelectItem value="Inactive">Set Inactive</SelectItem>
                      <SelectItem value="Pending">Set Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="destructive" size="sm" className="h-8" onClick={handleBulkDelete}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            )}

            {/* Table */}
            <CardContent className="px-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="w-12 p-3">
                        <Checkbox
                          checked={allSelected}
                          ref={(el) => {
                            if (el) {
                              (el as HTMLButtonElement).dataset.state = someSelected ? 'indeterminate' : allSelected ? 'checked' : 'unchecked';
                            }
                          }}
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all users"
                        />
                      </th>
                      <th className="p-3 text-left text-xs font-medium">Name</th>
                      <th className="p-3 text-left text-xs font-medium">Email</th>
                      <th className="p-3 text-left text-xs font-medium">Role</th>
                      <th className="p-3 text-left text-xs font-medium">Status</th>
                      <th className="w-12 p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className={cn(
                          "border-b last:border-b-0 transition-colors",
                          isSelected(user.id) ? "bg-primary/5" : "hover:bg-muted/30"
                        )}
                      >
                        <td className="p-3">
                          <Checkbox
                            checked={isSelected(user.id)}
                            onCheckedChange={() => toggleSelect(user.id)}
                            aria-label={`Select ${user.name}`}
                          />
                        </td>
                        <td className="p-3">
                          <span className="font-medium text-sm">{user.name}</span>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{user.email}</td>
                        <td className="p-3 text-sm">{user.role}</td>
                        <td className="p-3">
                          <Badge
                            variant={
                              user.status === 'Active'
                                ? 'default'
                                : user.status === 'Pending'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {user.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {users.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No users found</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setUsers(initialUsers)}
                  >
                    Reset Data
                  </Button>
                </div>
              )}
            </CardContent>

            {/* Footer with selection count */}
            <div className="p-3 border-t bg-muted/30 text-sm text-muted-foreground">
              {users.length} total users
              {selectedCount > 0 && ` • ${selectedCount} selected`}
            </div>
          </Card>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default BulkActionsTablesShowcasePage;
