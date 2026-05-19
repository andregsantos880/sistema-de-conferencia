import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/ui/shadcn/components/ui/card';
import { Separator } from '@/shared/ui/shadcn/components/ui/separator';
import { Shield, Loader2 } from 'lucide-react';
import { Switch } from '@/shared/ui/shadcn/components/ui/switch';
import SessionRow from '../components/SessionRow';
import ApiKeyRow from '../components/ApiKeyRow';
import { SectionHeader } from '@/shared/ui/components/SectionHeader';
import { useSecurity, useRevokeSession, useDeleteApiKey, useAccount } from '../../application/hooks/useSettings';

const SecuritySection: React.FC = () => {
  const { t } = useTranslation('settings');
  const { data: security, isLoading: securityLoading } = useSecurity();
  const { data: account, isLoading: accountLoading } = useAccount();
  const revokeSession = useRevokeSession();
  const deleteApiKey = useDeleteApiKey();

  const isLoading = securityLoading || accountLoading;

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  const twoFactorEnabled = account?.twoFactorEnabled ?? false;

  return (
    <Card className="p-8">
      <div className="space-y-6">
        <SectionHeader title={t('security.title')} description={t('security.subtitle')} />

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className={`w-5 h-5 ${twoFactorEnabled ? 'text-green-600' : 'text-muted-foreground'}`} />
              <div>
                <h4>{t('security.2fa.title')}</h4>
                <p className="text-sm text-muted-foreground">{t('security.2fa.description')}</p>
              </div>
            </div>
            <Switch checked={twoFactorEnabled} />
          </div>

          {twoFactorEnabled && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 dark:bg-green-500 dark:border-green-600">
              <p className="text-sm text-green-900 dark:text-white">{t('security.2fa.enabled_message')}</p>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-4">
          <SectionHeader title={t('security.sessions.title')} />
          <div className="space-y-3">
            {security?.sessions?.map((session) => (
              <SessionRow
                key={session.id}
                title={session.device}
                subtitle={session.isActive ? t('security.sessions.current_active') : session.lastActive}
                active={session.isActive}
                onRevoke={!session.isActive ? () => revokeSession.mutate(session.id) : undefined}
              />
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <SectionHeader title={t('security.api_keys.title')} />
          <div className="space-y-3">
            {security?.apiKeys?.map((apiKey) => (
              <ApiKeyRow
                key={apiKey.id}
                name={apiKey.name}
                keyMasked={apiKey.keyMasked}
                onDelete={() => deleteApiKey.mutate(apiKey.id)}
              />
            ))}
            <button className="w-full border rounded-md py-2 text-sm">{t('security.api_keys.create_new')}</button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SecuritySection;
