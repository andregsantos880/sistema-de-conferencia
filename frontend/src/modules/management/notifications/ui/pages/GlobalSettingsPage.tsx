import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Save, TestTube, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import PageHeader from '@/shared/ui/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
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
import { Skeleton } from '@/shared/ui/components/Skeleton';
import {
  useGlobalEmailSettings,
  useUpdateGlobalSettings,
  useTestProviderConfig,
} from '../../application/hooks';
import { NOTIFICATIONS_PATHS } from '../routes/paths';
import type { EmailProviderType } from '../../domain/models';
import { toast } from 'sonner';

const GlobalSettingsPage: React.FC = () => {
  const { t } = useTranslation('notifications');
  const navigate = useNavigate();
  // Toast notifications - using console for now until toast system is set up
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const { data: settings, isLoading } = useGlobalEmailSettings();
  const updateSettings = useUpdateGlobalSettings();
  const testProvider = useTestProviderConfig();

  const [formData, setFormData] = useState({
    fromName: '',
    fromEmail: '',
    replyToEmail: '',
    defaultFooter: '',
    providerName: '' as EmailProviderType,
    apiKey: '',
    region: '',
  });

  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize form when settings load
  if (settings && !isInitialized) {
    setFormData({
      fromName: settings.fromName,
      fromEmail: settings.fromEmail,
      replyToEmail: settings.replyToEmail,
      defaultFooter: settings.defaultFooter,
      providerName: settings.provider.name,
      apiKey: settings.provider.apiKey,
      region: settings.provider.region,
    });
    setIsInitialized(true);
  }

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        fromName: formData.fromName,
        fromEmail: formData.fromEmail,
        replyToEmail: formData.replyToEmail,
        defaultFooter: formData.defaultFooter,
        provider: {
          name: formData.providerName,
          apiKey: formData.apiKey,
          region: formData.region,
          isConfigured: !!formData.providerName && !!formData.apiKey,
        },
      });
      showToast(t('settings.toasts.saved'));
    } catch {
      showToast(t('settings.toasts.error'), 'error');
    }
  };

  const handleTestConfig = async () => {
    setTestResult(null);
    try {
      const result = await testProvider.mutateAsync();
      setTestResult(result.success ? 'success' : 'error');
      showToast(result.success ? t('settings.toasts.testSuccess') : t('settings.toasts.testFailed'), result.success ? 'success' : 'error');
    } catch {
      setTestResult('error');
      showToast(t('settings.toasts.testFailed'), 'error');
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64 mt-1" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-48 lg:col-span-2" />
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
        backButton={{
          label: t('common:back'),
          onClick: () => navigate(NOTIFICATIONS_PATHS.HOME),
        }}
      />

      {/* Provider Warning */}
      {(!formData.providerName || !formData.apiKey) && (
        <div className="flex items-center gap-3 p-4 bg-warning/10 border border-warning/30 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
          <p className="text-sm text-warning">{t('warnings.providerNotConfigured')}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sender Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.sender.title')}</CardTitle>
            <CardDescription>{t('settings.sender.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fromName">{t('settings.sender.fromName')}</Label>
              <Input
                id="fromName"
                value={formData.fromName}
                onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                placeholder={t('settings.sender.fromNamePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromEmail">{t('settings.sender.fromEmail')}</Label>
              <Input
                id="fromEmail"
                type="email"
                value={formData.fromEmail}
                onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                placeholder={t('settings.sender.fromEmailPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="replyTo">{t('settings.sender.replyTo')}</Label>
              <Input
                id="replyTo"
                type="email"
                value={formData.replyToEmail}
                onChange={(e) => setFormData({ ...formData, replyToEmail: e.target.value })}
                placeholder={t('settings.sender.replyToPlaceholder')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Provider */}
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.provider.title')}</CardTitle>
            <CardDescription>{t('settings.provider.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider">{t('settings.provider.provider')}</Label>
              <Select
                value={formData.providerName}
                onValueChange={(value) =>
                  setFormData({ ...formData, providerName: value as EmailProviderType })
                }
              >
                <SelectTrigger id="provider">
                  <SelectValue placeholder={t('settings.provider.selectProvider')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sendgrid">SendGrid</SelectItem>
                  <SelectItem value="Mailgun">Mailgun</SelectItem>
                  <SelectItem value="SES">Amazon SES</SelectItem>
                  <SelectItem value="Custom">Custom SMTP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">{t('settings.provider.apiKey')}</Label>
              <Input
                id="apiKey"
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder={t('settings.provider.apiKeyPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">{t('settings.provider.region')}</Label>
              <Select
                value={formData.region}
                onValueChange={(value) => setFormData({ ...formData, region: value })}
              >
                <SelectTrigger id="region">
                  <SelectValue placeholder={t('settings.provider.selectRegion')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                  <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                  <SelectItem value="eu-west-1">Europe (Ireland)</SelectItem>
                  <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={handleTestConfig}
              disabled={!formData.providerName || !formData.apiKey || testProvider.isPending}
            >
              {testProvider.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('settings.provider.testing')}
                </>
              ) : testResult === 'success' ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4 text-success" />
                  {t('settings.provider.verified')}
                </>
              ) : testResult === 'error' ? (
                <>
                  <AlertTriangle className="mr-2 h-4 w-4 text-destructive" />
                  {t('settings.provider.retry')}
                </>
              ) : (
                <>
                  <TestTube className="mr-2 h-4 w-4" />
                  {t('settings.provider.test')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Default Footer */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('settings.footer.title')}</CardTitle>
            <CardDescription>{t('settings.footer.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={formData.defaultFooter}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, defaultFooter: e.target.value })}
              rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
              placeholder={t('settings.footer.placeholder')}
            />
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">{t('settings.footer.preview')}:</p>
              <div
                className="text-sm"
                dangerouslySetInnerHTML={{ __html: formData.defaultFooter }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateSettings.isPending} className="min-w-32">
          {updateSettings.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {t('settings.save')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default GlobalSettingsPage;
