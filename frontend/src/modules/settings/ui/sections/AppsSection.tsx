import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/ui/shadcn/components/ui/card';
import { Separator } from '@/shared/ui/shadcn/components/ui/separator';
import AppRow from '../components/AppRow';
import { Loader2 } from 'lucide-react';
import { useApps, useConnectApp, useDisconnectApp } from '../../application/hooks/useSettings';
import { SectionHeader } from '@/shared/ui/components/SectionHeader';

const AppsSection: React.FC = () => {
  const { t } = useTranslation('settings');
  const { data: apps, isLoading, error } = useApps();
  const connectApp = useConnectApp();
  const disconnectApp = useDisconnectApp();

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

  const handleToggle = (appId: string, currentlyConnected: boolean) => {
    if (currentlyConnected) {
      disconnectApp.mutate(appId);
    } else {
      connectApp.mutate(appId);
    }
  };

  return (
    <Card className="p-8">
      <div className="space-y-6">
        <SectionHeader title={t('apps.title')} description={t('apps.subtitle')} />

        <Separator />

        <div className="grid gap-4">
          {apps?.map((app) => (
            <AppRow
              key={app.id}
              icon={app.icon}
              name={app.name}
              description={app.description}
              connected={app.connected}
              onToggle={() => handleToggle(app.id, app.connected)}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};

export default AppsSection;
