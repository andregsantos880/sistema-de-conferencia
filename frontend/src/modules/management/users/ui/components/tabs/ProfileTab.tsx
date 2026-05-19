import { useTranslation } from 'react-i18next';
import { Globe, Edit, Save, X } from 'lucide-react';

import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/components/ui/select';

import type { User } from '../../../domain/models';
import { DEPARTMENTS, TIMEZONES, LOCALES } from '../../../domain/models';

interface ProfileTabProps {
  user: User;
  isEditing: boolean;
  editForm: Partial<User>;
  isLoading: boolean;
  onEditFormChange: (form: Partial<User>) => void;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSaveChanges: () => void;
}

export function ProfileTab({
  user,
  isEditing,
  editForm,
  isLoading,
  onEditFormChange,
  onStartEditing,
  onCancelEditing,
  onSaveChanges,
}: ProfileTabProps) {
  const { t } = useTranslation('users');

  if (isEditing) {
    return (
      <div className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('detail.profile.firstName')}</Label>
            <Input
              value={editForm.firstName || ''}
              onChange={(e) => onEditFormChange({ ...editForm, firstName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('detail.profile.lastName')}</Label>
            <Input
              value={editForm.lastName || ''}
              onChange={(e) => onEditFormChange({ ...editForm, lastName: e.target.value })}
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label>{t('detail.profile.phone')}</Label>
          <Input
            value={editForm.phone || ''}
            onChange={(e) => onEditFormChange({ ...editForm, phone: e.target.value })}
          />
        </div>

        {/* Job Title */}
        <div className="space-y-2">
          <Label>{t('detail.profile.jobTitle')}</Label>
          <Input
            value={editForm.jobTitle || ''}
            onChange={(e) => onEditFormChange({ ...editForm, jobTitle: e.target.value })}
          />
        </div>

        {/* Department */}
        <div className="space-y-2">
          <Label>{t('detail.profile.department')}</Label>
          <Select
            value={editForm.department || ''}
            onValueChange={(v) => onEditFormChange({ ...editForm, department: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('detail.profile.selectDepartment')} />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Timezone */}
        <div className="space-y-2">
          <Label>{t('detail.profile.timezone')}</Label>
          <Select
            value={editForm.timezone || ''}
            onValueChange={(v) => onEditFormChange({ ...editForm, timezone: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('detail.profile.selectTimezone')} />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Locale */}
        <div className="space-y-2">
          <Label>{t('detail.profile.locale')}</Label>
          <Select
            value={editForm.locale || ''}
            onValueChange={(v) => onEditFormChange({ ...editForm, locale: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('detail.profile.selectLocale')} />
            </SelectTrigger>
            <SelectContent>
              {LOCALES.map((l) => (
                <SelectItem key={l.code} value={l.code}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button onClick={onSaveChanges} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {t('common:save')}
          </Button>
          <Button variant="outline" onClick={onCancelEditing}>
            <X className="h-4 w-4 mr-2" />
            {t('common:cancel')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Personal Info Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-foreground">{t('detail.profile.personalInfo')}</h3>
          <Button variant="outline" size="sm" onClick={onStartEditing}>
            <Edit className="h-4 w-4 mr-2" />
            {t('edit')}
          </Button>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">{t('detail.profile.firstName')}</span>
            <span className="font-medium">{user.firstName || '—'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">{t('detail.profile.lastName')}</span>
            <span className="font-medium">{user.lastName || '—'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">{t('detail.profile.phone')}</span>
            <span className="font-medium">{user.phone || '—'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">{t('detail.profile.jobTitle')}</span>
            <span className="font-medium">{user.jobTitle || '—'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">{t('detail.profile.department')}</span>
            <span className="font-medium">{user.department || '—'}</span>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">{t('detail.profile.preferences')}</h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground flex items-center gap-2">
              <Globe className="h-4 w-4" /> {t('detail.profile.timezone')}
            </span>
            <span className="font-medium">{user.timezone}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground flex items-center gap-2">
              <Globe className="h-4 w-4" /> {t('detail.profile.locale')}
            </span>
            <span className="font-medium">
              {LOCALES.find((l) => l.code === user.locale)?.label || user.locale}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
