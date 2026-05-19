import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Settings2, FileText, CheckCircle2, AlertTriangle, Clock, Sparkles, Mail } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import PageHeader from '@/shared/ui/components/PageHeader';
import { Card } from '@/shared/ui/shadcn/components/ui/card';
import { useGlobalEmailSettings, useNotificationMetrics, useEmailTemplates } from '../../application/hooks';
import { MetricCard } from '@/shared/ui/components/metrics';
import { NavigationCard } from '../components/NavigationCard';
import { ProviderWarningBanner } from '../components/ProviderWarningBanner';
import { NOTIFICATIONS_PATHS } from '../routes/paths';
import { Skeleton } from '@/shared/ui/components/Skeleton';

const NotificationsHomePage: React.FC = () => {
  const { t } = useTranslation('notifications');
  const navigate = useNavigate();

  const { data: settings, isLoading: settingsLoading } = useGlobalEmailSettings();
  const { data: metrics, isLoading: metricsLoading } = useNotificationMetrics();
  const { data: templates = [], isLoading: templatesLoading } = useEmailTemplates();

  const isLoading = settingsLoading || metricsLoading || templatesLoading;

  // Calculate template counts by feature area
  const templateCounts = {
    Users: templates.filter((t) => t.featureArea === 'Users').length,
    Auth: templates.filter((t) => t.featureArea === 'Auth').length,
    Billing: templates.filter((t) => t.featureArea === 'Billing').length,
    Teams: templates.filter((t) => t.featureArea === 'Teams').length,
  };

  const activeCount = templates.filter((t) => t.status === 'Active').length;
  const draftCount = templates.filter((t) => t.status === 'Draft').length;

  if (isLoading) {
    return (
      <Card className="p-6 space-y-6">
        <PageHeader title={t('title')} subtitle={t('subtitle')} />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      {/* Provider Warning Banner */}
      {settings && !settings.provider.isConfigured && (
        <ProviderWarningBanner onConfigure={() => navigate(NOTIFICATIONS_PATHS.SETTINGS)} />
      )}

      {/* Metrics Summary */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title={t('metrics.providerStatus')}
          value={settings?.provider.isConfigured ? t('metrics.connected') : t('metrics.notSet')}
          subtitle={settings?.provider.isConfigured ? settings.provider.name : undefined}
          icon={settings?.provider.isConfigured ? CheckCircle2 : AlertTriangle}
          variant={settings?.provider.isConfigured ? 'success' : 'warning'}
          appearance="glass"
        />

        <MetricCard
          title={t('metrics.customized')}
          value={metrics?.customizedTemplates ?? 0}
          subtitle={t('metrics.usingDefaults', { count: metrics?.defaultTemplates ?? 0 })}
          icon={Sparkles}
          iconClassName="bg-primary/10 text-primary"
        />

        <MetricCard
          title={t('metrics.activeTemplates')}
          value={activeCount}
          subtitle={t('metrics.drafts', { count: draftCount })}
          icon={Mail}
          iconClassName="bg-success/10 text-success"
        />

        <MetricCard
          title={t('metrics.lastTestSent')}
          value={
            settings?.lastTestEmailSent
              ? formatDistanceToNow(new Date(settings.lastTestEmailSent), { addSuffix: true })
              : t('metrics.never')
          }
          icon={Clock}
        />
      </div>

      {/* Navigation Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <NavigationCard
          title={t('nav.settings.title')}
          description={t('nav.settings.description')}
          icon={Settings2}
          iconGradient="from-primary to-primary/70 shadow-primary/25"
          badges={[
            { label: `${t('nav.settings.from')}: ${settings?.fromEmail ?? ''}` },
            ...(settings?.provider.name ? [{ label: settings.provider.name }] : []),
          ]}
          onClick={() => navigate(NOTIFICATIONS_PATHS.SETTINGS)}
        />

        <NavigationCard
          title={t('nav.templates.title')}
          description={t('nav.templates.description')}
          icon={FileText}
          iconGradient="from-emerald-500 to-emerald-500/70 shadow-emerald-500/25"
          badges={[
            {
              label: `${t('nav.templates.users')} (${templateCounts.Users})`,
              className: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20',
            },
            {
              label: `${t('nav.templates.auth')} (${templateCounts.Auth})`,
              className: 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-500/20',
            },
            {
              label: `${t('nav.templates.billing')} (${templateCounts.Billing})`,
              className: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20',
            },
            {
              label: `${t('nav.templates.teams')} (${templateCounts.Teams})`,
              className: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20',
            },
          ]}
          onClick={() => navigate(NOTIFICATIONS_PATHS.TEMPLATES)}
        />
      </div>
    </div>
  );
};

export default NotificationsHomePage;
