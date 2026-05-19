import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/ui/shadcn/components/ui/card';
import { Separator } from '@/shared/ui/shadcn/components/ui/separator';
import QuietHours from '../components/QuietHours';
import ActionButton from '@/components/forms/buttons/ActionButton';
import { Bell, Loader2 } from 'lucide-react';
import InfoCard from '@/shared/ui/components/metrics/InfoCard';
import { useNotifications, useUpdateNotifications } from '../../application/hooks/useSettings';
import type { UpdateNotificationsDto } from '../../domain/models/Settings';
import { SkeletonNotificationsSection } from '@/shared/ui/components/Skeleton';
import { SectionHeader } from '@/shared/ui/components/SectionHeader';

const NotificationsSection: React.FC = () => {
  const { t } = useTranslation('settings');
  const { data: notifications, isLoading, error } = useNotifications();
  const updateNotifications = useUpdateNotifications();

  if (isLoading) {
    return <SkeletonNotificationsSection />;
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

  const items = [
    { k: 'email_notifications', field: 'emailNotifications' as const, enabled: notifications?.emailNotifications ?? true },
    { k: 'push_notifications', field: 'pushNotifications' as const, enabled: notifications?.pushNotifications ?? true },
    { k: 'sms_notifications', field: 'smsNotifications' as const, enabled: notifications?.smsNotifications ?? false },
    { k: 'weekly_digest', field: 'weeklyDigest' as const, enabled: notifications?.weeklyDigest ?? true },
    { k: 'product_updates', field: 'productUpdates' as const, enabled: notifications?.productUpdates ?? true },
    { k: 'marketing_emails', field: 'marketingEmails' as const, enabled: notifications?.marketingEmails ?? false },
  ];

  const handleToggle = (field: keyof UpdateNotificationsDto, currentValue: boolean) => {
    updateNotifications.mutate({ [field]: !currentValue });
  };

  return (
    <Card className="p-8">
      <div className="space-y-6">
        <SectionHeader title={t('notifications.title')} description={t('notifications.subtitle')} />

        <Separator />

        <div className="space-y-3">
          {items.map((s) => (
            <InfoCard
              key={s.k}
              icon={<Bell className="w-5 h-5 text-slate-600" />}
              title={t(`notifications.settings.${s.k}.title`)}
              description={t(`notifications.settings.${s.k}.description`)}
              switchProps={{
                defaultChecked: s.enabled,
                onChange: () => handleToggle(s.field, s.enabled),
              }}
            />
          ))}
        </div>

        <Separator />

        <QuietHours
          quietHours={notifications?.quietHours}
          onUpdate={(quietHours) => updateNotifications.mutate({ quietHours })}
        />

        <div className="flex justify-end gap-3">
          <ActionButton variant="outline">{t('common:actions.reset_to_default')}</ActionButton>
          <ActionButton disabled={updateNotifications.isPending}>
            {updateNotifications.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {t('common:actions.save_preferences')}
          </ActionButton>
        </div>
      </div>
    </Card>
  );
};

export default NotificationsSection;
