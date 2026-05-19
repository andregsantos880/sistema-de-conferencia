import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Edit,
  Users,
  MoreHorizontal,
  Archive,
  ArchiveRestore,
  Trash2,
  UserCog,
  Calendar,
  Building2,
  ChevronRight,
  UserPlus,
} from 'lucide-react';

import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { Card, CardContent } from '@/shared/ui/shadcn/components/ui/card';
import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from '@/shadcn/components/animate-ui/components/animate/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/shadcn/components/ui/avatar';
import { Separator } from '@/shared/ui/shadcn/components/ui/separator';
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
import { Skeleton } from '@/shared/ui/components/Skeleton';
import { useConfirmation } from '@/shared/hooks';

import { OverviewTab, MembersTab, ActivityTab, SettingsTab } from '../components/tabs';
import { CreateTeamDialog } from '../components/CreateTeamDialog';
import { AddMembersDialog } from '../components/AddMembersDialog';
import { TransferOwnershipDialog } from '../components/TransferOwnershipDialog';
import { ChangeRoleDialog } from '../components/ChangeRoleDialog';

import {
  useTeam,
  useTeamMembers,
  useTeamActivity,
  useUpdateTeam,
  useDeleteTeam,
  useArchiveTeam,
  useUnarchiveTeam,
  useTransferOwnership,
  useAddMembers,
  useInviteMembers,
  useUpdateMember,
  useRemoveMember,
  useResendMemberInvite,
} from '../../application/hooks';

import type {
  UpdateTeamPayload,
  AddMembersPayload,
  InviteMembersPayload,
  TeamMember,
  TeamRole,
  TeamListItem,
} from '../../domain/models';
import { TEAM_TYPE_LABELS } from '../../domain/models';
import { TEAMS_PATHS } from '../routes';

export default function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('teams');

  const {
    state: confirmationState,
    confirm,
    handleConfirm,
    handleCancel,
  } = useConfirmation();

  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addMembersDialogOpen, setAddMembersDialogOpen] = useState(false);
  const [transferOwnershipDialogOpen, setTransferOwnershipDialogOpen] = useState(false);
  const [memberToChangeRole, setMemberToChangeRole] = useState<TeamMember | null>(null);

  // Queries
  const { data: team, isLoading: teamLoading } = useTeam(teamId || '');
  const { data: members = [], isLoading: membersLoading } = useTeamMembers(teamId || '');
  const { data: activity = [], isLoading: activityLoading } = useTeamActivity(teamId || '');

  // Mutations
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();
  const archiveTeam = useArchiveTeam();
  const unarchiveTeam = useUnarchiveTeam();
  const transferOwnership = useTransferOwnership();
  const addMembers = useAddMembers();
  const inviteMembers = useInviteMembers();
  const updateMember = useUpdateMember();
  const removeMember = useRemoveMember();
  const resendInvite = useResendMemberInvite();

  // Handlers
  const handleUpdateTeam = useCallback(
    async (_id: string, data: UpdateTeamPayload) => {
      if (!teamId) return;
      await updateTeam.mutateAsync({ id: teamId, data });
    },
    [teamId, updateTeam]
  );

  const handleDeleteTeam = useCallback(async () => {
    if (!teamId) return;
    await deleteTeam.mutateAsync(teamId);
    navigate(TEAMS_PATHS.HOME);
  }, [teamId, deleteTeam, navigate]);

  const handleRequestDeleteTeam = useCallback(async () => {
    if (!team) return;

    const confirmed = await confirm({
      title: t('dialogs.deleteTeam.title'),
      description: t('dialogs.deleteTeam.description', { name: team.name }),
      confirmLabel: t('actions.delete'),
      cancelLabel: t('form.cancel'),
      variant: 'destructive',
    });

    if (!confirmed) return;
    await handleDeleteTeam();
  }, [confirm, handleDeleteTeam, t, team]);

  const handleArchiveTeam = useCallback(async () => {
    if (!teamId) return;
    await archiveTeam.mutateAsync(teamId);
  }, [teamId, archiveTeam]);

  const handleRequestArchiveTeam = useCallback(async () => {
    if (!team) return;

    const confirmed = await confirm({
      title: t('dialogs.archiveTeam.title'),
      description: t('dialogs.archiveTeam.description', { name: team.name }),
      confirmLabel: t('actions.archive'),
      cancelLabel: t('form.cancel'),
      variant: 'default',
    });

    if (!confirmed) return;
    await handleArchiveTeam();
  }, [confirm, handleArchiveTeam, t, team]);

  const handleUnarchiveTeam = useCallback(async () => {
    if (!teamId) return;
    await unarchiveTeam.mutateAsync(teamId);
  }, [teamId, unarchiveTeam]);

  const handleTransferOwnership = useCallback(
    async (newOwnerId: string) => {
      if (!teamId) return;
      await transferOwnership.mutateAsync({ id: teamId, data: { newOwnerId } });
      setTransferOwnershipDialogOpen(false);
    },
    [teamId, transferOwnership]
  );

  const handleAddMembers = useCallback(
    async (data: AddMembersPayload) => {
      if (!teamId) return;
      await addMembers.mutateAsync({ teamId, data });
    },
    [teamId, addMembers]
  );

  const handleInviteMembers = useCallback(
    async (data: InviteMembersPayload) => {
      if (!teamId) return;
      await inviteMembers.mutateAsync({ teamId, data });
    },
    [teamId, inviteMembers]
  );

  const handleChangeRole = useCallback(
    async (member: TeamMember, _newRole: TeamRole) => {
      if (!teamId) return;
      setMemberToChangeRole(member);
    },
    [teamId]
  );

  const handleConfirmChangeRole = useCallback(
    async (newRole: TeamRole) => {
      if (!teamId || !memberToChangeRole) return;
      await updateMember.mutateAsync({
        teamId,
        memberId: memberToChangeRole.id,
        data: { role: newRole },
      });
      setMemberToChangeRole(null);
    },
    [teamId, memberToChangeRole, updateMember]
  );

  const handleRequestRemoveMember = useCallback(
    async (member: TeamMember) => {
      if (!teamId) return;

      const confirmed = await confirm({
        title: t('dialogs.removeMember.title'),
        description: t('dialogs.removeMember.description', { name: member.userName }),
        confirmLabel: t('actions.removeFromTeam'),
        cancelLabel: t('form.cancel'),
        variant: 'destructive',
      });

      if (!confirmed) return;
      await removeMember.mutateAsync({ teamId, memberId: member.id });
    },
    [confirm, removeMember, t, teamId]
  );

  const handleResendInvite = useCallback(
    async (member: TeamMember) => {
      if (!teamId) return;
      await resendInvite.mutateAsync({ teamId, memberId: member.id });
    },
    [teamId, resendInvite]
  );

  // Loading state
  if (teamLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Not found state
  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">Team not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(TEAMS_PATHS.HOME)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('detail.backToList')}
        </Button>
      </div>
    );
  }

  // Convert TeamDetail to TeamListItem for edit dialog
  const teamAsListItem: TeamListItem = {
    id: team.id,
    name: team.name,
    slug: team.slug,
    description: team.description,
    status: team.status,
    department: team.department,
    type: team.type,
    ownerId: team.ownerId,
    ownerName: team.ownerName,
    ownerAvatarUrl: team.ownerAvatarUrl,
    membersCount: team.membersCount,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header with Breadcrumb */}
        <div className="flex flex-col gap-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm page-header">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0"
              onClick={() => navigate(TEAMS_PATHS.HOME)}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t('title')}
            </Button>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-muted-foreground">{team.name}</span>
          </div>

          {/* Team Header Card */}
          <Card className="shadow-sm bg-gradient-to-r from-card to-muted">
            <CardContent>
              {/* Main header: stacks on <xl, side-by-side on xl+ */}
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                {/* Left: Avatar + Info */}
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    {/* Title + Badge: wrap on small screens */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{team.name}</h1>
                      <Badge
                        variant="outline"
                        className={
                          team.status === 'active'
                            ? 'bg-success/10 text-success border-success/20'
                            : 'bg-muted text-muted-foreground'
                        }
                      >
                        {t(`status.${team.status}`)}
                      </Badge>
                    </div>
                    {team.description && (
                      <p className="text-muted-foreground max-w-xl text-sm sm:text-base">{team.description}</p>
                    )}
                    {/* Metadata: wrap on small screens */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-sm text-muted-foreground">
                      {team.department && (
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-4 w-4" />
                          <span>{team.department}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="font-normal">
                          {TEAM_TYPE_LABELS[team.type]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('detail.overview.created')}: </span>
                        <span>{format(new Date(team.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Action buttons - icon-only on <xl, full text on xl+ */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddMembersDialogOpen(true)}
                    aria-label={t('addMembers')}
                  >
                    <UserPlus className="h-4 w-4 xl:mr-2" />
                    <span className="hidden xl:inline">{t('addMembers')}</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setEditDialogOpen(true)}
                    aria-label={t('editTeam')}
                  >
                    <Edit className="h-4 w-4 xl:mr-2" />
                    <span className="hidden xl:inline">{t('editTeam')}</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setTransferOwnershipDialogOpen(true)}>
                        <UserCog className="h-4 w-4 mr-2" />
                        {t('actions.transferOwnership')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {team.status === 'active' ? (
                        <DropdownMenuItem onClick={handleRequestArchiveTeam}>
                          <Archive className="h-4 w-4 mr-2" />
                          {t('actions.archive')}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={handleUnarchiveTeam}>
                          <ArchiveRestore className="h-4 w-4 mr-2" />
                          {t('actions.unarchive')}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={handleRequestDeleteTeam}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('actions.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Quick Stats */}
              <Separator className="my-4" />
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:gap-x-8">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={team.ownerAvatarUrl} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {team.ownerName.split(' ').map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('detail.overview.owner')}</p>
                    <p className="text-sm font-medium">{team.ownerName}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('detail.overview.membersCount')}</p>
                  <p className="text-sm font-medium">{team.membersCount} {t('members')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4 sm:p-6">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
              {/* TabsList: horizontally scrollable on small screens */}
              {/* <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0"></div> */}
              <TabsList>
                <TabsTrigger value="overview">
                  {t('detail.tabs.overview')}
                </TabsTrigger>
                <TabsTrigger value="members">
                  {t('detail.tabs.members')}
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                    {team.membersCount}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="activity">
                  {t('detail.tabs.activity')}
                </TabsTrigger>
                <TabsTrigger value="settings">
                  {t('detail.tabs.settings')}
                </TabsTrigger>
              </TabsList>

              <TabsContents>
                <TabsContent value="overview">
                  <OverviewTab
                    team={team}
                    members={members}
                    onGoToMembers={() => setActiveTab('members')}
                    onAddMembers={() => setAddMembersDialogOpen(true)}
                  />
                </TabsContent>

                <TabsContent value="members">
                  <MembersTab
                    members={members}
                    isLoading={membersLoading}
                    onAddMembers={() => setAddMembersDialogOpen(true)}
                    onChangeRole={handleChangeRole}
                    onRemoveMember={handleRequestRemoveMember}
                    onResendInvite={handleResendInvite}
                  />
                </TabsContent>

                <TabsContent value="activity">
                  <ActivityTab activity={activity} isLoading={activityLoading} />
                </TabsContent>

                <TabsContent value="settings">
                  <SettingsTab
                    team={team}
                    onArchive={handleRequestArchiveTeam}
                    onUnarchive={handleUnarchiveTeam}
                    onDelete={handleRequestDeleteTeam}
                    onTransferOwnership={() => setTransferOwnershipDialogOpen(true)}
                  />
                </TabsContent>
              </TabsContents>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Edit Team Dialog */}
      <CreateTeamDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onCreate={async () => {}}
        onUpdate={handleUpdateTeam}
        editTeam={teamAsListItem}
        isLoading={updateTeam.isPending}
      />

      {/* Add Members Dialog */}
      <AddMembersDialog
        open={addMembersDialogOpen}
        onClose={() => setAddMembersDialogOpen(false)}
        existingMembers={members}
        onAddMembers={handleAddMembers}
        onInviteMembers={handleInviteMembers}
        isLoading={addMembers.isPending || inviteMembers.isPending}
      />

      {/* Transfer Ownership Dialog */}
      <TransferOwnershipDialog
        open={transferOwnershipDialogOpen}
        onClose={() => setTransferOwnershipDialogOpen(false)}
        teamName={team.name}
        members={members}
        currentOwnerId={team.ownerId}
        onTransfer={handleTransferOwnership}
        isLoading={transferOwnership.isPending}
      />

      {/* Change Role Dialog */}
      <ChangeRoleDialog
        open={!!memberToChangeRole}
        onClose={() => setMemberToChangeRole(null)}
        member={memberToChangeRole}
        onChangeRole={handleConfirmChangeRole}
        isLoading={updateMember.isPending}
      />

      <AlertDialog
        open={confirmationState.isOpen}
        onOpenChange={(isOpen) => !isOpen && handleCancel()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmationState.options?.title}</AlertDialogTitle>
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
              className={
                confirmationState.options?.variant === 'destructive'
                  ? 'bg-destructive hover:bg-destructive/90'
                  : undefined
              }
            >
              {confirmationState.options?.confirmLabel ?? t('actions.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
