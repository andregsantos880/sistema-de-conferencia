import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Plus, Upload, Users as UsersIcon } from 'lucide-react';

import PageLayout from '@/shared/ui/components/PageLayout';
import { UsersList } from '../components/UsersList';
import { UserDetailDrawer } from '../components/UserDetailDrawer';
import { InviteUserDialog } from '../components/InviteUserDialog';
import { ImportUsersWizard } from '../components/ImportUsersWizard';
import { UsersListSkeleton } from '../components/UsersListSkeleton';

import {
  useUsersList,
  useUser,
  useInviteUser,
  useUpdateUser,
  useDeleteUser,
  useActivateUser,
  useDeactivateUser,
  useSuspendUser,
  useBulkAction,
  useResendInvitation,
  useSendPasswordReset,
  useSendVerificationEmail,
  useTerminateSession,
  useImportUsers,
  useExportUsers,
} from '../../application/hooks';

import type { UserListItem, UserStatus, InviteUserPayload, UpdateUserPayload, ImportUserItem } from '../../domain/models';
import { Button } from '@/shared/ui/shadcn/components/ui/button';

export default function UsersPage() {
  const { t } = useTranslation('users');

  // State
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [importWizardOpen, setImportWizardOpen] = useState(false);

  // Queries
  const { data: users = [], isLoading, error, refetch } = useUsersList();
  const { data: selectedUser } = useUser(selectedUserId || '');

  // Mutations
  const inviteUser = useInviteUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const activateUser = useActivateUser();
  const deactivateUser = useDeactivateUser();
  const suspendUser = useSuspendUser();
  const bulkAction = useBulkAction();
  const resendInvitation = useResendInvitation();
  const sendPasswordReset = useSendPasswordReset();
  const sendVerificationEmail = useSendVerificationEmail();
  const terminateSession = useTerminateSession();
  const importUsers = useImportUsers();
  const exportUsers = useExportUsers();

  // Handlers
  const handleSelectUser = useCallback((user: UserListItem) => {
    setSelectedUserId(user.id);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedUserId(null);
  }, []);

  const handleInviteUser = useCallback(async (data: InviteUserPayload) => {
    await inviteUser.mutateAsync(data);
  }, [inviteUser]);

  const handleUpdateUser = useCallback(async (id: string, data: UpdateUserPayload) => {
    await updateUser.mutateAsync({ id, data });
  }, [updateUser]);

  const handleDeleteUser = useCallback(async (id: string) => {
    await deleteUser.mutateAsync(id);
    setSelectedUserId(null);
  }, [deleteUser]);

  const handleChangeStatus = useCallback(async (id: string, status: UserStatus) => {
    switch (status) {
      case 'active':
        await activateUser.mutateAsync(id);
        break;
      case 'deactivated':
        await deactivateUser.mutateAsync(id);
        break;
      case 'suspended':
        await suspendUser.mutateAsync({ id });
        break;
    }
  }, [activateUser, deactivateUser, suspendUser]);

  const handleBulkAction = useCallback(async (ids: string[], action: 'activate' | 'deactivate' | 'resend_invitation' | 'delete') => {
    await bulkAction.mutateAsync({ ids, action });
  }, [bulkAction]);

  const handleResendInvitation = useCallback(async (id: string) => {
    await resendInvitation.mutateAsync(id);
  }, [resendInvitation]);

  const handleSendPasswordReset = useCallback(async (id: string) => {
    await sendPasswordReset.mutateAsync(id);
  }, [sendPasswordReset]);

  const handleSendVerificationEmail = useCallback(async (id: string) => {
    await sendVerificationEmail.mutateAsync(id);
  }, [sendVerificationEmail]);

  const handleTerminateSession = useCallback(async (userId: string, sessionId: string) => {
    await terminateSession.mutateAsync({ userId, sessionId });
  }, [terminateSession]);

  const handleImportUsers = useCallback(async (usersToImport: ImportUserItem[], sendInvites: boolean) => {
    await importUsers.mutateAsync({ users: usersToImport, sendInvites });
  }, [importUsers]);

  const handleExport = useCallback(async () => {
    const blob = await exportUsers.mutateAsync(undefined);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users-export.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [exportUsers]);

  return (
    <>
      <PageLayout
        title={t('title')}
        subtitle={t('subtitle')}
        isLoading={isLoading}
        error={error}
        data={users}
        loadingFallback={<UsersListSkeleton />}
        errorConfig={{
          title: t('errors.loadFailed'),
          description: t('errors.loadFailedDescription'),
          icon: UsersIcon,
          onRetry: () => refetch(),
        }}
        emptyConfig={{
          title: t('empty.title'),
          description: t('empty.description'),
          icon: UsersIcon,
          action: {
            label: t('actions.inviteUser'),
            onClick: () => setInviteDialogOpen(true),
          },
        }}
        actions={[
          <Button variant="secondary" onClick={() => setImportWizardOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            {t('actions.import')}
          </Button>,
          <Button variant="secondary" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            {t('actions.export')}
          </Button>,
          <Button onClick={() => setInviteDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('actions.inviteUser')}
          </Button>
        ]}
      >
        {(usersList) => (
          <UsersList
            users={usersList}
            isLoading={isLoading}
            onInviteUser={() => setInviteDialogOpen(true)}
            onSelectUser={handleSelectUser}
            onChangeStatus={handleChangeStatus}
            onDeleteUser={handleDeleteUser}
            onBulkAction={handleBulkAction}
            onResendInvitation={handleResendInvitation}
            onSendPasswordReset={handleSendPasswordReset}
          />
        )}
      </PageLayout>

      <UserDetailDrawer
        user={selectedUser || null}
        open={!!selectedUserId}
        onClose={handleCloseDetail}
        onUpdate={handleUpdateUser}
        onChangeStatus={handleChangeStatus}
        onDelete={handleDeleteUser}
        onResendInvitation={handleResendInvitation}
        onSendPasswordReset={handleSendPasswordReset}
        onSendVerificationEmail={handleSendVerificationEmail}
        onTerminateSession={handleTerminateSession}
        isLoading={updateUser.isPending}
      />

      <InviteUserDialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        onInvite={handleInviteUser}
        isLoading={inviteUser.isPending}
      />

      <ImportUsersWizard
        open={importWizardOpen}
        onClose={() => setImportWizardOpen(false)}
        onImport={handleImportUsers}
        isLoading={importUsers.isPending}
      />
    </>
  );
}
