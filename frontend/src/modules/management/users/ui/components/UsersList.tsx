import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useBulkSelection, useConfirmation, useFilterEngine, defineFilters } from '@/shared/hooks';
import { formatDistanceToNow } from 'date-fns';
import { type ColumnDef } from '@tanstack/react-table';
import {
  Search,
  Plus,
  MoreHorizontal,
  UserPlus,
  Mail,
  Key,
  Shield,
  UserX,
  Trash2,
  X,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Checkbox } from '@/shared/ui/shadcn/components/ui/checkbox';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shadcn/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/shadcn/components/ui/alert-dialog';
import { SimpleSortableTable } from '@/shared/ui/components/table/SimpleSortableTable';

import type { UserListItem, UserStatus, UserRole, ActivityFilter } from '../../domain/models';
import { ROLE_LABELS, STATUS_LABELS } from '../../domain/models';
import { UsersListSkeleton } from './UsersListSkeleton';
import { EmptyState } from '@/shared/ui/components/states';
import { Card, CardContent } from '@/shared/ui/shadcn/components/ui/card';

interface UsersListProps {
  users: UserListItem[];
  isLoading: boolean;
  onInviteUser: () => void;
  onSelectUser: (user: UserListItem) => void;
  onChangeStatus: (id: string, status: UserStatus) => void;
  onDeleteUser: (id: string) => void;
  onBulkAction: (ids: string[], action: 'activate' | 'deactivate' | 'resend_invitation' | 'delete') => void;
  onResendInvitation: (id: string) => void;
  onSendPasswordReset: (id: string) => void;
}

export function UsersList({
  users,
  isLoading,
  onInviteUser,
  onSelectUser,
  onChangeStatus,
  onDeleteUser,
  onBulkAction,
  onResendInvitation,
  onSendPasswordReset,
}: UsersListProps) {
  const { t } = useTranslation('users');

  const {
    state: confirmationState,
    confirm,
    handleConfirm,
    handleCancel,
  } = useConfirmation();

  // =========================================================================
  // Filter Engine - Centralized filter state management
  // =========================================================================
  const filters = useFilterEngine(
    defineFilters({
      search: {
        defaultValue: '',
        isActive: (v) => v.trim().length > 0,
        label: t('filters.search'),
      },
      status: {
        defaultValue: 'all' as UserStatus | 'all',
        isActive: (v) => v !== 'all',
        label: t('filters.status'),
      },
      role: {
        defaultValue: 'all' as UserRole | 'all',
        isActive: (v) => v !== 'all',
        label: t('filters.role'),
      },
      activity: {
        defaultValue: 'all' as ActivityFilter,
        isActive: (v) => v !== 'all',
        label: t('filters.lastActive'),
      },
    })
  );

  const {
    selectedIds,
    isSelected,
    toggle: toggleSelect,
    selectAll,
    clear: clearSelection,
    isAllSelected,
  } = useBulkSelection<string>();

  // =========================================================================
  // Filtering Logic - Domain-specific, stays in the component
  // =========================================================================
  const filteredUsers = useMemo(() => {
    const { search, status, role, activity } = filters.values;

    return users.filter((user) => {
      // Search filter
      const matchesSearch =
        search === '' ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;

      // Status filter
      if (status !== 'all' && user.status !== status) return false;

      // Role filter
      if (role !== 'all' && user.role !== role) return false;

      // Activity filter
      if (activity !== 'all' && user.lastLoginAt) {
        const lastLogin = new Date(user.lastLoginAt);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

        switch (activity) {
          case '7':
            if (daysDiff > 7) return false;
            break;
          case '30':
            if (daysDiff > 30) return false;
            break;
          case '90':
            if (daysDiff > 90) return false;
            break;
        }
      }

      return true;
    });
  }, [users, filters.values]);

  const userIds = filteredUsers.map((u) => u.id);
  const allSelected = isAllSelected(userIds);

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAll(userIds);
    }
  }, [allSelected, clearSelection, selectAll, userIds]);

  const handleBulkAction = useCallback(
    async (action: 'activate' | 'deactivate' | 'resend_invitation' | 'delete') => {
      if (action === 'delete') {
        const confirmed = await confirm({
          title: t('dialogs.bulkDelete.title', { count: selectedIds.size }),
          description: t('dialogs.bulkDelete.description', { count: selectedIds.size }),
          confirmLabel: t('dialogs.bulkDelete.confirm'),
          cancelLabel: t('common:cancel'),
          variant: 'destructive',
        });

        if (!confirmed) return;

        onBulkAction(Array.from(selectedIds), 'delete');
        clearSelection();
        return;
      }

      onBulkAction(Array.from(selectedIds), action);
      clearSelection();
    },
    [clearSelection, confirm, onBulkAction, selectedIds, t]
  );

  const handleDeleteUser = useCallback(
    async (user: UserListItem) => {
      const confirmed = await confirm({
        title: t('dialogs.deleteUser.title'),
        description: t('dialogs.deleteUser.description', {
          name: `${user.firstName} ${user.lastName}`,
        }),
        confirmLabel: t('delete'),
        cancelLabel: t('common:cancel'),
        variant: 'destructive',
      });

      if (!confirmed) return;
      onDeleteUser(user.id);
    },
    [confirm, onDeleteUser, t]
  );

  const getStatusColor = useCallback((status: UserStatus) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'invited':
        return 'bg-info/10 text-info border-info/20';
      case 'suspended':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'deactivated':
        return 'bg-muted text-muted-foreground border-muted';
      case 'pending':
        return 'bg-info/10 text-info border-info/20';
    }
  }, []);

  const getRoleColor = useCallback((role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'manager':
        return 'bg-accent text-accent-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  }, []);

  // Column definitions for SimpleSortableTable
  const columns: ColumnDef<UserListItem>[] = useMemo(
    () => [
      {
        id: 'select',
        header: () => (
          <Checkbox
            checked={allSelected && filteredUsers.length > 0}
            onCheckedChange={toggleSelectAll}
          />
        ),
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={isSelected(row.original.id)}
              onCheckedChange={() => toggleSelect(row.original.id)}
            />
          </div>
        ),
        enableSorting: false,
        size: 40,
      },
      {
        accessorKey: 'firstName',
        header: t('columns.user'),
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'role',
        header: t('columns.role'),
        cell: ({ row }) => (
          <Badge variant="outline" className={getRoleColor(row.original.role)}>
            {ROLE_LABELS[row.original.role]}
          </Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: t('columns.status'),
        cell: ({ row }) => (
          <Badge variant="outline" className={getStatusColor(row.original.status)}>
            {STATUS_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: 'lastLoginAt',
        header: t('columns.lastLogin'),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.lastLoginAt
              ? formatDistanceToNow(new Date(row.original.lastLoginAt), { addSuffix: true })
              : t('columns.never')}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: t('columns.created'),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true })}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onSelectUser(user)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {t('actions.viewDetails')}
                  </DropdownMenuItem>
                  {user.status === 'invited' && (
                    <DropdownMenuItem onClick={() => onResendInvitation(user.id)}>
                      <Mail className="h-4 w-4 mr-2" />
                      {t('actions.resendInvitation')}
                    </DropdownMenuItem>
                  )}
                  {user.status !== 'invited' && (
                    <DropdownMenuItem onClick={() => onSendPasswordReset(user.id)}>
                      <Key className="h-4 w-4 mr-2" />
                      {t('actions.sendPasswordReset')}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {user.status === 'active' && (
                    <>
                      <DropdownMenuItem onClick={() => onChangeStatus(user.id, 'suspended')}>
                        <Shield className="h-4 w-4 mr-2" />
                        {t('actions.suspend')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onChangeStatus(user.id, 'deactivated')}>
                        <UserX className="h-4 w-4 mr-2" />
                        {t('actions.deactivate')}
                      </DropdownMenuItem>
                    </>
                  )}
                  {(user.status === 'suspended' || user.status === 'deactivated') && (
                    <DropdownMenuItem onClick={() => onChangeStatus(user.id, 'active')}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {t('actions.activate')}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDeleteUser(user)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('actions.deleteUser')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        enableSorting: false,
        size: 50,
      },
    ],
    [allSelected, isSelected, filteredUsers, t, toggleSelectAll, toggleSelect, onSelectUser, onResendInvitation, onSendPasswordReset, onChangeStatus, handleDeleteUser, getStatusColor, getRoleColor]
  );

  if (isLoading && users.length === 0) {
    return <UsersListSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col page-header">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('filters.searchPlaceholder')}
              value={filters.values.search}
              onChange={(e) => filters.set('search', e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={filters.values.status}
              onValueChange={(v) => filters.set('status', v as UserStatus | 'all')}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t('filters.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allStatus')}</SelectItem>
                <SelectItem value="active">{t('status.active')}</SelectItem>
                <SelectItem value="invited">{t('status.invited')}</SelectItem>
                <SelectItem value="suspended">{t('status.suspended')}</SelectItem>
                <SelectItem value="deactivated">{t('status.deactivated')}</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.values.role}
              onValueChange={(v) => filters.set('role', v as UserRole | 'all')}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder={t('filters.role')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allRoles')}</SelectItem>
                <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                <SelectItem value="manager">{t('roles.manager')}</SelectItem>
                <SelectItem value="member">{t('roles.member')}</SelectItem>
                <SelectItem value="viewer">{t('roles.viewer')}</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.values.activity}
              onValueChange={(v) => filters.set('activity', v as ActivityFilter)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t('filters.lastActive')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.anyTime')}</SelectItem>
                <SelectItem value="7">{t('filters.last7Days')}</SelectItem>
                <SelectItem value="30">{t('filters.last30Days')}</SelectItem>
                <SelectItem value="90">{t('filters.last90Days')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filter Chips - Using filters.activeEntries */}
        {filters.hasActive && (
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {filters.activeEntries
              .filter((entry) => entry.key !== 'search') // Don't show search as a chip
              .map((entry) => (
                <Badge key={String(entry.key)} variant="secondary" className="gap-1">
                  {entry.key === 'status' && (
                    <>
                      {t('filters.status')}: {STATUS_LABELS[entry.value as UserStatus]}
                    </>
                  )}
                  {entry.key === 'role' && (
                    <>
                      {t('filters.role')}: {ROLE_LABELS[entry.value as UserRole]}
                    </>
                  )}
                  {entry.key === 'activity' && t('filters.lastDays', { days: entry.value })}
                  <button onClick={entry.reset}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={filters.resetAll}
              className="text-muted-foreground"
            >
              {t('filters.clearAll')}
            </Button>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/8 border border-warning/20">
          <span className="text-sm font-medium">{t('bulk.selected', { count: selectedIds.size })}</span>
          <div className="flex items-center gap-2 ml-auto">
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')}>
              {t('bulk.activate')}
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('deactivate')}>
              {t('bulk.deactivate')}
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('resend_invitation')}>
              <RefreshCw className="h-4 w-4 mr-1" />
              {t('bulk.resendInvite')}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleBulkAction('delete')}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {t('bulk.delete')}
            </Button>
          </div>
        </div>
      )}

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          {users.length === 0 ? (
            <EmptyState 
              action={{
                label: t('actions.inviteUser'),
                onClick: onInviteUser,
                icon: Plus,
              }}
              icon={UserPlus}
              title={t('empty.title')}
              description={t('empty.description')}
            />
          ) : (
            <EmptyState 
              icon={Search}
              title={t('empty.noResults')}
              description={t('empty.noResultsDescription')}
              action={{
                label: t('filters.clearAll'),
                onClick: filters.resetAll,
                icon: X,
              }}
            />
          )}
        </div>
      ) : (
        <Card>
          <CardContent>
            <SimpleSortableTable
              columns={columns}
              data={filteredUsers}
              onRowClick={onSelectUser}
              initialSort={[{ id: 'createdAt', desc: true }]}
            />
          </CardContent>
        </Card>
      )}

      <AlertDialog
        open={confirmationState.isOpen}
        onOpenChange={(isOpen) => !isOpen && handleCancel()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              {confirmationState.options?.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationState.options?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {confirmationState.options?.cancelLabel ?? t('common:cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {confirmationState.options?.confirmLabel ?? t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
