import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Users } from 'lucide-react';

import PageLayout from '@/shared/ui/components/PageLayout';
import { Button } from '@/shared/ui/shadcn/components/ui/button';

import { TeamsList } from '../components/TeamsList';
import { TeamsListSkeleton } from '../components/TeamsListSkeleton';
import { CreateTeamDialog } from '../components/CreateTeamDialog';

import {
  useTeamsList,
  useCreateTeam,
  useUpdateTeam,
  useDeleteTeam,
  useArchiveTeam,
  useUnarchiveTeam,
  useBulkTeamAction,
} from '../../application/hooks';

import type { TeamListItem, CreateTeamPayload, UpdateTeamPayload, TeamBulkActionType } from '../../domain/models';

export default function TeamsListPage() {
  const { t } = useTranslation('teams');

  // State
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<TeamListItem | null>(null);

  // Queries
  const { data: teams = [], isLoading, error, refetch } = useTeamsList();

  // Mutations
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();
  const archiveTeam = useArchiveTeam();
  const unarchiveTeam = useUnarchiveTeam();
  const bulkAction = useBulkTeamAction();

  // Handlers
  const handleCreateTeam = useCallback(async (data: CreateTeamPayload) => {
    await createTeam.mutateAsync(data);
  }, [createTeam]);

  const handleUpdateTeam = useCallback(async (id: string, data: UpdateTeamPayload) => {
    await updateTeam.mutateAsync({ id, data });
  }, [updateTeam]);

  const handleDeleteTeam = useCallback(async (id: string) => {
    await deleteTeam.mutateAsync(id);
  }, [deleteTeam]);

  const handleArchiveTeam = useCallback(async (id: string) => {
    await archiveTeam.mutateAsync(id);
  }, [archiveTeam]);

  const handleUnarchiveTeam = useCallback(async (id: string) => {
    await unarchiveTeam.mutateAsync(id);
  }, [unarchiveTeam]);

  const handleBulkAction = useCallback(async (ids: string[], action: TeamBulkActionType) => {
    await bulkAction.mutateAsync({ ids, action });
  }, [bulkAction]);

  const handleSelectTeam = useCallback((team: TeamListItem) => {
    setEditTeam(team);
    setCreateDialogOpen(true);
  }, []);

  const handleCloseCreateDialog = useCallback(() => {
    setCreateDialogOpen(false);
    setEditTeam(null);
  }, []);

  return (
    <>
      <PageLayout
        title={t('title')}
        subtitle={t('subtitle')}
        isLoading={isLoading}
        error={error}
        data={teams}
        loadingFallback={<TeamsListSkeleton />}
        errorConfig={{
          title: t('errors.loadFailed'),
          description: t('errors.loadFailedDescription'),
          icon: Users,
          onRetry: () => refetch(),
        }}
        emptyConfig={{
          title: t('empty.title'),
          description: t('empty.description'),
          icon: Users,
          action: {
            label: t('createTeam'),
            onClick: () => setCreateDialogOpen(true),
          },
        }}
        actions={
          <Button onClick={() => setCreateDialogOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            {t('createTeam')}
          </Button>
        }
      >
        {(teamsList) => (
          <TeamsList
            teams={teamsList}
            isLoading={isLoading}
            onCreateTeam={() => setCreateDialogOpen(true)}
            onSelectTeam={handleSelectTeam}
            onArchiveTeam={handleArchiveTeam}
            onUnarchiveTeam={handleUnarchiveTeam}
            onDeleteTeam={handleDeleteTeam}
            onBulkAction={handleBulkAction}
          />
        )}
      </PageLayout>

      {/* Create/Edit Team Dialog */}
      <CreateTeamDialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        onCreate={handleCreateTeam}
        onUpdate={handleUpdateTeam}
        editTeam={editTeam}
        isLoading={createTeam.isPending || updateTeam.isPending}
      />
    </>
  );
}
