import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, UserPlus, Mail, Check } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/components/ui/dialog';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import { Checkbox } from '@/shared/ui/shadcn/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/shadcn/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/shadcn/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/components/ui/select';
import { ScrollArea } from '@/shared/ui/shadcn/components/ui/scroll-area';

import type { TeamRole, AddMembersPayload, InviteMembersPayload, TeamMember } from '../../domain/models';
import { useUsersList } from '@/modules/management/users/application/hooks';

interface AddMembersDialogProps {
  open: boolean;
  onClose: () => void;
  existingMembers: TeamMember[];
  onAddMembers: (data: AddMembersPayload) => Promise<void>;
  onInviteMembers: (data: InviteMembersPayload) => Promise<void>;
  isLoading: boolean;
}

export function AddMembersDialog({
  open,
  onClose,
  existingMembers,
  onAddMembers,
  onInviteMembers,
  isLoading,
}: AddMembersDialogProps) {
  const { t } = useTranslation('teams');

  // State for existing users tab
  const [search, setSearch] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [role, setRole] = useState<TeamRole>('member');

  // State for invite by email tab
  const [emails, setEmails] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('member');
  const [sendInvitations, setSendInvitations] = useState(true);

  // Fetch users
  const { data: users = [] } = useUsersList();

  // Filter out existing members and search
  const availableUsers = useMemo(() => {
    const existingUserIds = new Set(existingMembers.map((m) => m.userId));
    return users.filter((user) => {
      if (existingUserIds.has(user.id)) return false;
      if (!search) return true;
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      return (
        fullName.includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [users, existingMembers, search]);

  const toggleUser = (userId: string) => {
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUserIds(newSelected);
  };

  const handleAddMembers = async () => {
    if (selectedUserIds.size === 0) return;
    await onAddMembers({
      userIds: Array.from(selectedUserIds),
      role,
    });
    setSelectedUserIds(new Set());
    setSearch('');
    onClose();
  };

  const handleInviteMembers = async () => {
    const emailList = emails
      .split(/[,\n]/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0 && e.includes('@'));

    if (emailList.length === 0) return;

    await onInviteMembers({
      emails: emailList,
      role: inviteRole,
      sendInvitations,
    });
    setEmails('');
    onClose();
  };

  const handleClose = () => {
    setSelectedUserIds(new Set());
    setSearch('');
    setEmails('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('dialogs.addMembers.title')}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="existing" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">
              <UserPlus className="h-4 w-4 mr-2" />
              {t('dialogs.addMembers.existingUsers')}
            </TabsTrigger>
            <TabsTrigger value="invite">
              <Mail className="h-4 w-4 mr-2" />
              {t('dialogs.addMembers.inviteByEmail')}
            </TabsTrigger>
          </TabsList>

          {/* Existing Users Tab */}
          <TabsContent value="existing" className="space-y-4 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('dialogs.addMembers.searchUsers')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <ScrollArea className="h-64 rounded-md border">
              {availableUsers.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>{t('dialogs.addMembers.noUsersFound')}</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {availableUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleUser(user.id)}
                    >
                      <Checkbox
                        checked={selectedUserIds.has(user.id)}
                        onCheckedChange={() => toggleUser(user.id)}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback className="text-xs">
                          {user.firstName?.[0]}
                          {user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      {selectedUserIds.has(user.id) && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>{t('dialogs.addMembers.selectRole')}</Label>
                <Select value={role} onValueChange={(v) => setRole(v as TeamRole)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{t('role.admin')}</SelectItem>
                    <SelectItem value="member">{t('role.member')}</SelectItem>
                    <SelectItem value="viewer">{t('role.viewer')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedUserIds.size > 0 && (
                <p className="text-sm text-muted-foreground">
                  {t('dialogs.addMembers.selectedUsers', { count: selectedUserIds.size })}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                {t('form.cancel')}
              </Button>
              <Button
                onClick={handleAddMembers}
                disabled={selectedUserIds.size === 0 || isLoading}
              >
                {t('dialogs.addMembers.addToTeam')}
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* Invite by Email Tab */}
          <TabsContent value="invite" className="space-y-4 mt-4">
            <DialogDescription>{t('dialogs.inviteMembers.description')}</DialogDescription>

            <div className="space-y-2">
              <Label>{t('dialogs.inviteMembers.emailsPlaceholder')}</Label>
              <Input
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                placeholder="email@example.com, another@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('dialogs.addMembers.selectRole')}</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as TeamRole)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t('role.admin')}</SelectItem>
                  <SelectItem value="member">{t('role.member')}</SelectItem>
                  <SelectItem value="viewer">{t('role.viewer')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="sendInvitations"
                checked={sendInvitations}
                onCheckedChange={(checked) => setSendInvitations(checked === true)}
              />
              <Label htmlFor="sendInvitations" className="cursor-pointer">
                {t('dialogs.inviteMembers.sendInvitations')}
              </Label>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                {t('form.cancel')}
              </Button>
              <Button
                onClick={handleInviteMembers}
                disabled={!emails.trim() || isLoading}
              >
                <Mail className="h-4 w-4 mr-2" />
                {t('dialogs.inviteMembers.invite')}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
