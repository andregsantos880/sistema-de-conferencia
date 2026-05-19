import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/ui/shadcn/components/ui/card';
import { Separator } from '@/shared/ui/shadcn/components/ui/separator';
import ActionButton from '@/components/forms/buttons/ActionButton';
import PasswordFields from '../components/PasswordFields';
import EmailCard from '../components/EmailCard';
import PhoneCard from '../components/PhoneCard';
import { SectionHeader } from '@/shared/ui/components/SectionHeader';
import { Loader2 } from 'lucide-react';
import { useProfile } from '../../application/hooks/useSettings';

const AccountSection: React.FC = () => {
  const { t } = useTranslation('settings');
  const { data: profile, isLoading, error } = useProfile();

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center py-12 text-destructive">
          {t('common:errors.failed_to_load')}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <div className="space-y-6">
        <SectionHeader title={t('account.title')} description={t('account.subtitle')} />

        <Separator />

        <div className="space-y-4">
          <EmailCard email={profile?.email ?? ''} />
          <PhoneCard phone={profile?.phone ?? ''} />
        </div>

        <Separator />

        <div className="space-y-4">
          <SectionHeader title={t('account.password.title')} />
          <PasswordFields />
        </div>

        <Separator />

        <div className="space-y-4 p-4 border-2 border-red-200 rounded-lg bg-red-50/50 dark:bg-red-500/50">
          <div>
            <h3 className="text-destructive dark:text-red-100">{t('account.danger_zone.title')}</h3>
            <p className="text-sm text-destructive dark:text-red-50">{t('account.danger_zone.description')}</p>
          </div>

          <div className="flex justify-between flex-wrap gap-2 items-center">
            <div>
              <h3>{t('account.danger_zone.delete_account_title')}</h3>
              <p className="text-xs text-foreground/50">{t('account.danger_zone.delete_account_desc')}</p>
            </div>
            <ActionButton variant="destructive" size="sm">{t('common:actions.delete')}</ActionButton>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <ActionButton variant="outline">{t('common:actions.cancel')}</ActionButton>
          <ActionButton>{t('common:actions.update_account')}</ActionButton>
        </div>
      </div>
    </Card>
  );
};

export default AccountSection;
