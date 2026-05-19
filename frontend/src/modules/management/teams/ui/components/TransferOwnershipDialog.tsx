import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';

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
import { Avatar, AvatarFallback, AvatarImage } from '@/shadcn/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/components/ui/select';

import type { TeamMember } from '../../domain/models';

interface TransferOwnershipDialogProps {
  open: boolean;
  onClose: () => void;
  teamName: string;
  members: TeamMember[];
  currentOwnerId: string;
  onTransfer: (newOwnerId: string) => Promise<void>;
  isLoading: boolean;
}

export function TransferOwnershipDialog({
  open,
  onClose,
  teamName,
  members,
  currentOwnerId,
  onTransfer,
  isLoading,
}: TransferOwnershipDialogProps) {
  const { t } = useTranslation('teams');
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // Filter out current owner and only show active members
  const eligibleMembers = members.filter(
    (m) => m.userId !== currentOwnerId && m.status === 'active'
  );

  const handleTransfer = async () => {
    if (!selectedUserId) return;
    await onTransfer(selectedUserId);
    setSelectedUserId('');
  };

  const handleClose = () => {
    setSelectedUserId('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('dialogs.transferOwnership.title')}</DialogTitle>
          <DialogDescription>
            {t('dialogs.transferOwnership.description', { name: teamName })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('dialogs.transferOwnership.selectOwner')}</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder={t('dialogs.transferOwnership.selectOwner')} />
              </SelectTrigger>
              <SelectContent>
                {eligibleMembers.map((member) => (
                  <SelectItem key={member.userId} value={member.userId}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.userAvatarUrl} />
                        <AvatarFallback className="text-xs">
                          {member.userName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span>{member.userName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <p className="text-sm text-warning">
              {t('dialogs.transferOwnership.warning')}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t('form.cancel')}
          </Button>
          <Button onClick={handleTransfer} disabled={!selectedUserId || isLoading}>
            {t('actions.transferOwnership')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
