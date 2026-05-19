import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MoreHorizontal,
  Mail,
  Key,
  Shield,
  UserX,
  Trash2,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Edit,
} from 'lucide-react';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/ui/shadcn/components/ui/drawer';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shadcn/components/ui/avatar';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/shadcn/components/ui/tabs';
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

import { useConfirmation, useMediaQuery } from '@/shared/hooks';

import type { User, UserStatus, UpdateUserPayload } from '../../domain/models';
import { ROLE_LABELS, STATUS_LABELS } from '../../domain/models';
import { OverviewTab, ProfileTab, SecurityTab, ActivityTab, RolesTab } from './tabs';
import { Tabs, TabsContent, TabsList, TabsTrigger, TabsContents } from '@/shadcn/components/animate-ui/components/animate/tabs';

interface UserDetailDrawerProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: UpdateUserPayload) => Promise<void>;
  onChangeStatus: (id: string, status: UserStatus) => void;
  onDelete: (id: string) => void;
  onResendInvitation: (id: string) => void;
  onSendPasswordReset: (id: string) => void;
  onSendVerificationEmail: (id: string) => void;
  onTerminateSession: (userId: string, sessionId: string) => void;
  isLoading: boolean;
}

export function UserDetailDrawer({
  user,
  open,
  onClose,
  onUpdate,
  onChangeStatus,
  onDelete,
  onResendInvitation,
  onSendPasswordReset,
  onSendVerificationEmail,
  onTerminateSession,
  isLoading,
}: UserDetailDrawerProps) {
  const { t } = useTranslation('users');

  const {
    state: confirmationState,
    confirm,
    handleConfirm,
    handleCancel,
  } = useConfirmation();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'invited':
        return 'bg-info/10 text-info border-info/20';
      case 'suspended':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'deactivated':
        return 'bg-muted text-muted-foreground border-muted';
      default:
        return '';
    }
  };

  const startEditing = () => {
    if (!user) return;
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      jobTitle: user.jobTitle,
      department: user.department,
      timezone: user.timezone,
      locale: user.locale,
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditForm({});
    setIsEditing(false);
  };

  const saveChanges = async () => {
    if (!user) return;
    await onUpdate(user.id, editForm);
    setIsEditing(false);
  };

  const handleDelete = useCallback(async () => {
    if (!user) return;

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

    onDelete(user.id);
    onClose();
  }, [confirm, onClose, onDelete, t, user]);

  if (!user) return null;

  return (
    <>
      <Drawer open={open} onOpenChange={onClose} direction={isMobile ? 'bottom' : 'right'}>
        <DrawerContent className="w-full p-0 overflow-hidden">
          <div className="flex flex-col max-h-[90vh] md:max-h-screen overflow-hidden">
            {/* Header */}
            <DrawerHeader className="p-6 pb-4 border-b border-border sticky top-0 bg-background z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-start sm:items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col items-start">
                    <DrawerTitle className="text-xl">
                      {user.firstName} {user.lastName}
                    </DrawerTitle>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className={getStatusColor(user.status)}>
                        {STATUS_LABELS[user.status]}
                      </Badge>
                      <Badge variant="secondary">{ROLE_LABELS[user.role]}</Badge>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={startEditing}>
                      <Edit className="h-4 w-4 mr-2" />
                      {t('detail.actions.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {user.status === 'invited' && (
                      <DropdownMenuItem onClick={() => onResendInvitation(user.id)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {t('actions.resendInvitation')}
                      </DropdownMenuItem>
                    )}
                    {!user.isEmailVerified && user.status !== 'invited' && (
                      <DropdownMenuItem onClick={() => onSendVerificationEmail(user.id)}>
                        <Mail className="h-4 w-4 mr-2" />
                        {t('actions.resendVerification')}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onSendPasswordReset(user.id)}>
                      <Key className="h-4 w-4 mr-2" />
                      {t('actions.sendPasswordReset')}
                    </DropdownMenuItem>
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
                    {user.status === 'suspended' && (
                      <DropdownMenuItem onClick={() => onChangeStatus(user.id, 'active')}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {t('actions.restore')}
                      </DropdownMenuItem>
                    )}
                    {user.status === 'deactivated' && (
                      <DropdownMenuItem onClick={() => onChangeStatus(user.id, 'active')}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {t('actions.activate')}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={handleDelete}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('actions.deleteUser')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </DrawerHeader>

            {/* Tabs */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 gap-6">
                  <TabsList>
                    <TabsTrigger value="overview">{t('detail.tabs.overview')}</TabsTrigger>
                    <TabsTrigger value="profile">{t('detail.tabs.profile')}</TabsTrigger>
                    <TabsTrigger value="security">{t('detail.tabs.security')}</TabsTrigger>
                    <TabsTrigger value="activity">{t('detail.tabs.activity')}</TabsTrigger>
                    <TabsTrigger value="roles">{t('detail.tabs.roles')}</TabsTrigger>
                  </TabsList>

                   <TabsContents>
                    {/* Overview Tab */}
                    <TabsContent value="overview">
                      <OverviewTab user={user} />
                    </TabsContent>

                    {/* Profile Tab */}
                    <TabsContent value="profile">
                      <ProfileTab
                        user={user}
                        isEditing={isEditing}
                        editForm={editForm}
                        isLoading={isLoading}
                        onEditFormChange={setEditForm}
                        onStartEditing={startEditing}
                        onCancelEditing={cancelEditing}
                        onSaveChanges={saveChanges}
                      />
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security">
                      <SecurityTab
                        user={user}
                        onSendVerificationEmail={onSendVerificationEmail}
                        onSendPasswordReset={onSendPasswordReset}
                        onTerminateSession={onTerminateSession}
                      />
                    </TabsContent>

                    {/* Activity Tab */}
                    <TabsContent value="activity">
                      <ActivityTab activityLog={user.activityLog} />
                    </TabsContent>

                    {/* Roles Tab */}
                    <TabsContent value="roles">
                      <RolesTab role={user.role} />
                    </TabsContent>
                  </TabsContents>
                </Tabs>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Delete Dialog */}
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
    </>
  );
}
