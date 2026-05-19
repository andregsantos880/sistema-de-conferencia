import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, UserPlus, Mail, Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/shadcn/components/ui/dialog';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import { Switch } from '@/shared/ui/shadcn/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/components/ui/select';

import type { UserRole, InviteUserPayload } from '../../domain/models';
import { ROLE_LABELS } from '../../domain/models';

interface InviteUserDialogProps {
  open: boolean;
  onClose: () => void;
  onInvite: (data: InviteUserPayload) => Promise<void>;
  isLoading: boolean;
}

export function InviteUserDialog({ open, onClose, onInvite, isLoading }: InviteUserDialogProps) {
  const { t } = useTranslation('users');

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<UserRole>('member');
  const [team, setTeam] = useState('');
  const [sendInvite, setSendInvite] = useState(true);
  const [success, setSuccess] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState('');

  const resetForm = () => {
    setEmail('');
    setFirstName('');
    setLastName('');
    setRole('member');
    setTeam('');
    setSendInvite(true);
    setSuccess(false);
    setInvitedEmail('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    await onInvite({
      email,
      firstName,
      lastName,
      role,
      team,
      sendInvite,
    });

    setInvitedEmail(email);
    setSuccess(true);
  };

  const handleInviteAnother = () => {
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" showCloseButton={!success}>
        {success ? (
          <div className="py-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <DialogHeader className="text-center">
              <DialogTitle className="text-center">{t('invite.success.title')}</DialogTitle>
              <DialogDescription className="text-center">
                {t('invite.success.description', { email: invitedEmail })}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center gap-3 mt-6">
              <Button variant="outline" onClick={handleInviteAnother}>
                <UserPlus className="h-4 w-4 mr-2" />
                {t('invite.success.inviteAnother')}
              </Button>
              <Button onClick={handleClose}>{t('common:done')}</Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                {t('invite.title')}
              </DialogTitle>
              <DialogDescription>{t('invite.description')}</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  {t('invite.form.email')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('invite.form.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('invite.form.firstName')}</Label>
                  <Input
                    id="firstName"
                    placeholder={t('invite.form.firstNamePlaceholder')}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('invite.form.lastName')}</Label>
                  <Input
                    id="lastName"
                    placeholder={t('invite.form.lastNamePlaceholder')}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">{t('invite.form.role')}</Label>
                <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder={t('invite.form.rolePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="team">{t('invite.form.team')}</Label>
                <Input
                  id="team"
                  placeholder={t('invite.form.teamPlaceholder')}
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between py-3 px-4 rounded-lg border border-border bg-muted/30">
                <div>
                  <p className="font-medium text-sm">{t('invite.form.sendInvite')}</p>
                  <p className="text-xs text-muted-foreground">{t('invite.form.sendInviteDescription')}</p>
                </div>
                <Switch checked={sendInvite} onCheckedChange={setSendInvite} />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  {t('common:cancel')}
                </Button>
                <Button type="submit" disabled={!email || isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('invite.form.sending')}
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      {t('invite.form.submit')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
