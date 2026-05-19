import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { UserPlus, UsersRound, Mail, Settings } from 'lucide-react';

// Import dialogs and hooks from their respective modules
import { InviteUserDialog } from '@/modules/management/users/ui/components/InviteUserDialog';
import { CreateTeamDialog } from '@/modules/management/teams/ui/components/CreateTeamDialog';
import { useInviteUser } from '@/modules/management/users/application/hooks/useUsers';
import { useCreateTeam } from '@/modules/management/teams/application/hooks/useTeams';

export function QuickStartShortcuts() {
  const { t } = useTranslation('guidedSetup');
  const navigate = useNavigate();
  
  // Dialog states
  const [inviteUserOpen, setInviteUserOpen] = useState(false);
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  
  // Mutations
  const inviteUser = useInviteUser();
  const createTeam = useCreateTeam();

  const shortcuts = [
    {
      id: 'invite-user',
      label: t('shortcuts.inviteUser'),
      icon: UserPlus,
      action: () => setInviteUserOpen(true),
    },
    {
      id: 'create-team',
      label: t('shortcuts.createTeam'),
      icon: UsersRound,
      action: () => setCreateTeamOpen(true),
    },
    {
      id: 'email-templates',
      label: t('shortcuts.emailTemplates'),
      icon: Mail,
      action: () => navigate('/apps/email/templates'),
    },
    {
      id: 'settings',
      label: t('shortcuts.settings'),
      icon: Settings,
      action: () => navigate('/settings'),
    },
  ];

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('shortcuts.title')}</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {t('shortcuts.description', 'Common actions to get you started quickly')}
          </p>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="grid grid-cols-2 gap-2 flex-1">
            {shortcuts.map((shortcut) => {
              const Icon = shortcut.icon;
              return (
                <Button
                  key={shortcut.id}
                  variant="outline"
                  className="h-auto py-4 px-4 justify-center flex flex-col items-center gap-3 hover:bg-primary/5 hover:border-primary/30 transition-all"
                  onClick={shortcut.action}
                >
                  <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon className="size-8 text-muted-foreground" />
                  </div>
                  <span className="font-medium">{shortcut.label}</span>
                </Button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-8 pt-3 border-t">
            {t('shortcuts.hint', 'These shortcuts open dialogs without leaving this page')}
          </p>
        </CardContent>
      </Card>

      {/* Invite User Dialog */}
      <InviteUserDialog
        open={inviteUserOpen}
        onClose={() => setInviteUserOpen(false)}
        onInvite={async (data) => {
          await inviteUser.mutateAsync(data);
        }}
        isLoading={inviteUser.isPending}
      />

      {/* Create Team Dialog */}
      <CreateTeamDialog
        open={createTeamOpen}
        onClose={() => setCreateTeamOpen(false)}
        onCreate={async (data) => {
          await createTeam.mutateAsync(data);
        }}
        isLoading={createTeam.isPending}
      />
    </>
  );
}
