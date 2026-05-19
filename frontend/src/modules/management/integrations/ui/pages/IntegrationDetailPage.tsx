import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AppWindow,
  AlertTriangle,
  CheckCircle2,
  Plug,
  PlugZap,
  ExternalLink,
  BookOpen,
  Save,
  Star,
} from 'lucide-react';
import PageLayout from '@/shared/ui/components/PageLayout';
import { Card, CardContent, CardHeader } from '@/shared/ui/shadcn/components/ui/card';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import { cn } from '@/shadcn/lib/utils';
import {
  useIntegration,
  useConnectIntegration,
  useDisconnectIntegration,
  useToggleIntegrationFavorite,
  useUpdateIntegrationConfig,
} from '../../application/hooks';
import type { Integration } from '../../domain/models';

interface IntegrationConfigFormProps {
  integration: Integration;
  isSaving: boolean;
  onSave: (payload: { apiKey?: string; workspaceId?: string; webhookUrl?: string }) => void;
  onCancel: () => void;
}

function IntegrationConfigForm({ integration, isSaving, onSave, onCancel }: IntegrationConfigFormProps) {
  const { t } = useTranslation('integrations');

  const [apiKey, setApiKey] = useState(integration.config.apiKey ?? '');
  const [workspaceId, setWorkspaceId] = useState(integration.config.workspaceId ?? '');
  const [webhookUrl, setWebhookUrl] = useState(integration.config.webhookUrl ?? '');

  return (
    <section className="space-y-4" key={integration.id}>
      <h3 className="text-sm font-semibold">{t('detail.configuration')}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="apiKey">{t('fields.apiKey')}</Label>
          <Input
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={t('fields.apiKey')}
            autoComplete="off"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="workspaceId">{t('fields.workspaceId')}</Label>
          <Input
            id="workspaceId"
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
            placeholder={t('fields.workspaceId')}
            autoComplete="off"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="webhookUrl">{t('fields.webhookUrl')}</Label>
          <Input
            id="webhookUrl"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder={t('fields.webhookUrl')}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          {t('actions.cancel')}
        </Button>
        <Button
          onClick={() =>
            onSave({
              apiKey: apiKey || undefined,
              workspaceId: workspaceId || undefined,
              webhookUrl: webhookUrl || undefined,
            })
          }
          disabled={isSaving}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {t('actions.save')}
        </Button>
      </div>
    </section>
  );
}

export default function IntegrationDetailPage() {
  const { t } = useTranslation('integrations');
  const navigate = useNavigate();
  const { id } = useParams();

  const integrationId = id ?? null;
  const { data, isLoading, error, refetch } = useIntegration(integrationId);

  const connect = useConnectIntegration();
  const disconnect = useDisconnectIntegration();
  const toggleFavorite = useToggleIntegrationFavorite();
  const updateConfig = useUpdateIntegrationConfig();

  const integration = data;

  const statusMeta = useMemo(() => {
    if (integration?.status === 'connected') {
      return { icon: CheckCircle2, badgeClassName: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' };
    }
    if (integration?.status === 'error') {
      return { icon: AlertTriangle, badgeClassName: 'bg-red-500/10 text-red-600 dark:text-red-400' };
    }
    return { icon: Plug, badgeClassName: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' };
  }, [integration?.status]);

  const StatusIcon = statusMeta.icon;

  const handlePrimaryAction = () => {
    if (!integration) return;
    if (integration.status === 'connected') {
      disconnect.mutate(integration.id);
    } else {
      connect.mutate(integration.id);
    }
  };

  const handleSave = (payload: { apiKey?: string; workspaceId?: string; webhookUrl?: string }) => {
    if (!integration) return;
    updateConfig.mutate({ id: integration.id, payload });
  };

  const isSaving = updateConfig.isPending;
  const isConnecting = connect.isPending || disconnect.isPending;

  const headerActions = integration ? (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => toggleFavorite.mutate(integration.id)}
        aria-label={t('actions.toggleFavorite')}
      >
        <Star className={cn('h-4 w-4', integration.isFavorite ? 'fill-amber-500 text-amber-500' : '')} />
        {integration.isFavorite ? t('actions.pinned') : t('actions.pin')}
      </Button>
      <Button
        size="sm"
        className="gap-2"
        onClick={handlePrimaryAction}
        disabled={isConnecting}
      >
        {integration.status === 'connected' ? <PlugZap className="h-4 w-4" /> : <Plug className="h-4 w-4" />}
        {integration.status === 'connected' ? t('actions.disconnect') : t('actions.connect')}
      </Button>
    </div>
  ) : undefined;

  return (
    <PageLayout
      title={t('detail.title')}
      subtitle={t('detail.subtitle')}
      isLoading={isLoading}
      error={error}
      data={integration}
      isEmpty={(d) => !d}
      loadingFallback={
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2"><CardContent className="p-6"><div className="h-24 bg-muted animate-pulse rounded" /></CardContent></Card>
          <Card><CardContent className="p-6"><div className="h-24 bg-muted animate-pulse rounded" /></CardContent></Card>
        </div>
      }
      errorConfig={{
        title: t('errors.loadFailed'),
        description: t('errors.loadFailedDescription'),
        icon: AppWindow,
        onRetry: () => refetch(),
      }}
      emptyConfig={{
        title: t('errors.notFound'),
        description: t('errors.notFoundDescription'),
        icon: AppWindow,
      }}
      backButton={{ to: '/management/integrations' }}
      actions={headerActions}
    >
      {(integrationData) => {
        if (!integrationData) return null;
        const integration = integrationData;

        return (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Main */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <h2 className="text-xl font-semibold truncate">{integration.name}</h2>
                    <div className="flex items-center gap-2">
                      <Badge className={statusMeta.badgeClassName}>
                        <span className="inline-flex items-center gap-1">
                          <StatusIcon className="h-3.5 w-3.5" />
                          {t(`status.${integration.status}` as const)}
                        </span>
                      </Badge>
                      <Badge variant="outline">{t(`categories.${integration.category}` as const)}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{integration.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {integration.websiteUrl && (
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open(integration.websiteUrl, '_blank', 'noopener,noreferrer')}>
                      <ExternalLink className="h-4 w-4" />
                      {t('detail.website')}
                    </Button>
                  )}
                  {integration.docsUrl && (
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open(integration.docsUrl, '_blank', 'noopener,noreferrer')}>
                      <BookOpen className="h-4 w-4" />
                      {t('detail.docs')}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {integration.status === 'error' && integration.errorMessage && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-300">{t('detail.errorMessage')}</p>
                      <p className="text-sm text-red-700/80 dark:text-red-300/80 mt-1">{integration.errorMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Configuration */}
              <IntegrationConfigForm
                key={integration.id}
                integration={integration}
                isSaving={isSaving}
                onSave={handleSave}
                onCancel={() => navigate(-1)}
              />
            </CardContent>
          </Card>

          {/* Side panel */}
          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-sm font-semibold">{t('detail.health')}</h3>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('detail.provider')}</span>
                <span className="font-medium">
                  {integration.providerType === 'third_party'
                    ? t('providers.third_party')
                    : t('providers.internal')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('detail.connectedAt')}</span>
                <span className="font-medium">{integration.connectedAt ? new Date(integration.connectedAt).toLocaleDateString() : '—'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('detail.lastSync')}</span>
                <span className="font-medium">{integration.lastSyncAt ? new Date(integration.lastSyncAt).toLocaleString() : '—'}</span>
              </div>

              <div className="pt-2">
                <Badge className={statusMeta.badgeClassName}>
                  {t(`status.${integration.status}` as const)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
        );
      }}
    </PageLayout>
  );
}
