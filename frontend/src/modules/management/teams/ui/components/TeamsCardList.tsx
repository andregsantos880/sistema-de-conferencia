import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useBulkSelection, useConfirmation } from '@/shared/hooks';
import {
  Search,
  Plus,
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
import { EmptyState } from '@/shared/ui/components/states';

import type { TeamListItem, TeamStatus, TeamType, TeamBulkActionType } from '../../domain/models';
import { TEAM_TYPE_LABELS, TEAM_STATUS_LABELS, DEPARTMENTS } from '../../domain/models';
import { TeamsListSkeleton } from './TeamsListSkeleton';
import { TeamCard } from './TeamCard';

interface TeamsCardListProps {
  teams: TeamListItem[];
  isLoading: boolean;
  onCreateTeam: () => void;
  onSelectTeam: (team: TeamListItem) => void;
  onArchiveTeam: (id: string) => void;
  onUnarchiveTeam: (id: string) => void;
  onDeleteTeam: (id: string) => void;
  onBulkAction: (ids: string[], action: TeamBulkActionType) => void;
}

export function TeamsCardList({
  teams,
  isLoading,
  onCreateTeam,
  onSelectTeam,
  onArchiveTeam,
  onUnarchiveTeam,
  onDeleteTeam,
  onBulkAction,
}: TeamsCardListProps) {
  const { t } = useTranslation('teams');

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
    clear: clearSelection,
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

  if (isLoading && teams.length === 0) {
    return <TeamsListSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-3 page-header">
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

      {/* Teams Card Grid */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              isSelected={isSelected(team.id)}
              onSelect={toggleSelect}
              onEdit={onSelectTeam}
              onArchive={onArchiveTeam}
              onUnarchive={onUnarchiveTeam}
              onDelete={handleDeleteTeam}
            />
          ))}
        </div>
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
