import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/components/ui/dialog';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/components/ui/select';

import type { TeamMember, TeamRole } from '../../domain/models';

interface ChangeRoleDialogProps {
  open: boolean;
  onClose: () => void;
  member: TeamMember | null;
  onChangeRole: (newRole: TeamRole) => Promise<void>;
  isLoading: boolean;
}

export function ChangeRoleDialog({
  open,
  onClose,
  member,
  onChangeRole,
  isLoading,
}: ChangeRoleDialogProps) {
  const { t } = useTranslation('teams');
  // Initialize with member's current role or default to 'member'
  const [selectedRole, setSelectedRole] = useState<TeamRole>(member?.role || 'member');


  const handleChangeRole = async () => {
    await onChangeRole(selectedRole);
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (isOpen && member) {
        setSelectedRole(member.role);
      }
      if (!isOpen) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('dialogs.changeRole.title')}</DialogTitle>
          <DialogDescription>
            {t('dialogs.changeRole.description', { name: member.userName })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('dialogs.changeRole.selectRole')}</Label>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as TeamRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">{t('role.admin')}</SelectItem>
                <SelectItem value="member">{t('role.member')}</SelectItem>
                <SelectItem value="viewer">{t('role.viewer')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('form.cancel')}
          </Button>
          <Button
            onClick={handleChangeRole}
            disabled={selectedRole === member.role || isLoading}
          >
            {t('actions.changeRole')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
