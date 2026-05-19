import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useBulkSelection, useConfirmation } from '@/shared/hooks';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { type ColumnDef } from '@tanstack/react-table';
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Archive,
  ArchiveRestore,
  Trash2,
  Users,
  X,
  Filter,
  AlertCircle,
} from 'lucide-react';

import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { Checkbox } from '@/shared/ui/shadcn/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/shadcn/components/ui/avatar';
import { Card, CardContent } from '@/shared/ui/shadcn/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/components/ui/dropdown-menu';
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
import { EmptyState } from '@/shared/ui/components/states';

import type { TeamListItem, TeamStatus, TeamType, TeamBulkActionType } from '../../domain/models';
import { TEAM_TYPE_LABELS, TEAM_STATUS_LABELS, DEPARTMENTS } from '../../domain/models';
import { TeamsListSkeleton } from './TeamsListSkeleton';
import { getTeamDetailPath } from '../routes';

interface TeamsListProps {
  teams: TeamListItem[];
  isLoading: boolean;
  onCreateTeam: () => void;
  onSelectTeam: (team: TeamListItem) => void;
  onArchiveTeam: (id: string) => void;
  onUnarchiveTeam: (id: string) => void;
  onDeleteTeam: (id: string) => void;
  onBulkAction: (ids: string[], action: TeamBulkActionType) => void;
}

export function TeamsList({
  teams,
  isLoading,
  onCreateTeam,
  onSelectTeam,
  onArchiveTeam,
  onUnarchiveTeam,
  onDeleteTeam,
  onBulkAction,
}: TeamsListProps) {
  const { t } = useTranslation('teams');
  const navigate = useNavigate();

  const {
    state: confirmationState,
    confirm,
    handleConfirm,
    handleCancel,
  } = useConfirmation();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TeamStatus | 'all'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<TeamType | 'all'>('all');
  const {
    selectedIds,
    isSelected,
    toggle: toggleSelect,
    selectAll,
    clear: clearSelection,
    isAllSelected,
  } = useBulkSelection<string>();

  // Filtered teams
  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const matchesSearch =
        searchQuery === '' ||
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || team.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || team.department === departmentFilter;
      const matchesType = typeFilter === 'all' || team.type === typeFilter;

      return matchesSearch && matchesStatus && matchesDepartment && matchesType;
    });
  }, [teams, searchQuery, statusFilter, departmentFilter, typeFilter]);

  const hasActiveFilters = statusFilter !== 'all' || departmentFilter !== 'all' || typeFilter !== 'all';

  const clearFilters = () => {
    setStatusFilter('all');
    setDepartmentFilter('all');
    setTypeFilter('all');
    setSearchQuery('');
  };

  const teamIds = filteredTeams.map((t) => t.id);
  const allSelected = isAllSelected(teamIds);

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAll(teamIds);
    }
  }, [allSelected, clearSelection, selectAll, teamIds]);

  const handleBulkAction = useCallback(
    async (action: TeamBulkActionType) => {
      if (action === 'delete') {
        const confirmed = await confirm({
          title: t('dialogs.deleteTeam.title'),
          description: `${t('bulkActions.selected', { count: selectedIds.size })} - This action cannot be undone.`,
          confirmLabel: t('actions.delete'),
          cancelLabel: t('form.cancel'),
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

  const handleDeleteTeam = useCallback(
    async (team: TeamListItem) => {
      const confirmed = await confirm({
        title: t('dialogs.deleteTeam.title'),
        description: t('dialogs.deleteTeam.description', { name: team.name }),
        confirmLabel: t('actions.delete'),
        cancelLabel: t('form.cancel'),
        variant: 'destructive',
      });

      if (!confirmed) return;
      onDeleteTeam(team.id);
    },
    [confirm, onDeleteTeam, t]
  );

  const getStatusColor = useCallback((status: TeamStatus) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'archived':
        return 'bg-muted text-muted-foreground border-muted';
      default:
        return '';
    }
  }, []);

  const getTypeColor = useCallback((type: TeamType) => {
    switch (type) {
      case 'functional':
        return 'bg-chart-1/10 text-chart-1 border-chart-1/20';
      case 'project':
        return 'bg-chart-2/10 text-chart-2 border-chart-2/20';
      case 'cross-functional':
        return 'bg-chart-3/10 text-chart-3 border-chart-3/20';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  }, []);

  // Column definitions for SimpleSortableTable
  const columns: ColumnDef<TeamListItem>[] = useMemo(
    () => [
      {
        id: 'select',
        header: () => (
          <Checkbox
            checked={allSelected && filteredTeams.length > 0}
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
        accessorKey: 'name',
        header: t('columns.name'),
        cell: ({ row }) => {
          const team = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{team.name}</p>
                {team.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
                    {team.description}
                  </p>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'department',
        header: t('columns.department'),
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.department || '—'}</span>
        ),
      },
      {
        accessorKey: 'type',
        header: t('columns.type'),
        cell: ({ row }) => (
          <Badge variant="outline" className={getTypeColor(row.original.type)}>
            {TEAM_TYPE_LABELS[row.original.type]}
          </Badge>
        ),
      },
      {
        accessorKey: 'membersCount',
        header: t('columns.members'),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.membersCount}</span>
        ),
      },
      {
        accessorKey: 'ownerName',
        header: t('columns.owner'),
        cell: ({ row }) => {
          const team = row.original;
          return (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={team.ownerAvatarUrl} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {team.ownerName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{team.ownerName}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: t('columns.status'),
        cell: ({ row }) => (
          <Badge variant="outline" className={getStatusColor(row.original.status)}>
            {TEAM_STATUS_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: 'updatedAt',
        header: t('columns.lastUpdated'),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(row.original.updatedAt), { addSuffix: true })}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const team = row.original;
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate(getTeamDetailPath(team.id))}>
                    <Eye className="h-4 w-4 mr-2" />
                    {t('actions.view')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSelectTeam(team)}>
                    <Edit className="h-4 w-4 mr-2" />
                    {t('actions.edit')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {team.status === 'active' ? (
                    <DropdownMenuItem onClick={() => onArchiveTeam(team.id)}>
                      <Archive className="h-4 w-4 mr-2" />
                      {t('actions.archive')}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => onUnarchiveTeam(team.id)}>
                      <ArchiveRestore className="h-4 w-4 mr-2" />
                      {t('actions.unarchive')}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDeleteTeam(team)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('actions.delete')}
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
    [allSelected, isSelected, filteredTeams, t, toggleSelectAll, toggleSelect, navigate, onSelectTeam, onArchiveTeam, onUnarchiveTeam, handleDeleteTeam, getStatusColor, getTypeColor]
  );

  if (isLoading && teams.length === 0) {
    return <TeamsListSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col page-header">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('filters.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TeamStatus | 'all')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t('filters.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
                <SelectItem value="active">{t('status.active')}</SelectItem>
                <SelectItem value="archived">{t('status.archived')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t('filters.department')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allDepartments')}</SelectItem>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TeamType | 'all')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t('filters.type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allTypes')}</SelectItem>
                <SelectItem value="functional">{t('type.functional')}</SelectItem>
                <SelectItem value="project">{t('type.project')}</SelectItem>
                <SelectItem value="cross-functional">{t('type.cross-functional')}</SelectItem>
                <SelectItem value="other">{t('type.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {statusFilter !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {t('filters.status')}: {TEAM_STATUS_LABELS[statusFilter]}
                <button onClick={() => setStatusFilter('all')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {departmentFilter !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {t('filters.department')}: {departmentFilter}
                <button onClick={() => setDepartmentFilter('all')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {typeFilter !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {t('filters.type')}: {TEAM_TYPE_LABELS[typeFilter]}
                <button onClick={() => setTypeFilter('all')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              {t('filters.clearAll')}
            </Button>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20">
          <span className="text-sm font-medium">{t('bulkActions.selected', { count: selectedIds.size })}</span>
          <div className="flex items-center gap-2 ml-auto">
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('archive')}>
              <Archive className="h-4 w-4 mr-1" />
              {t('bulkActions.archive')}
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('unarchive')}>
              <ArchiveRestore className="h-4 w-4 mr-1" />
              {t('bulkActions.unarchive')}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleBulkAction('delete')}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {t('bulkActions.delete')}
            </Button>
          </div>
        </div>
      )}

      {/* Teams Table */}
      {filteredTeams.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          {teams.length === 0 ? (
            <EmptyState
              action={{
                label: t('createTeam'),
                onClick: onCreateTeam,
                icon: Plus,
              }}
              icon={Users}
              title={t('empty.title')}
              description={t('empty.description')}
            />
          ) : (
            <EmptyState
              icon={Search}
              title={t('noResults.title')}
              description={t('noResults.description')}
              action={{
                label: t('filters.clearAll'),
                onClick: clearFilters,
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
              data={filteredTeams}
              onRowClick={(team) => navigate(getTeamDetailPath(team.id))}
              initialSort={[{ id: 'updatedAt', desc: true }]}
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
              {confirmationState.options?.cancelLabel ?? t('form.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {confirmationState.options?.confirmLabel ?? t('actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
