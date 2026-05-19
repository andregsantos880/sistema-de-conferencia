import { useTranslation } from 'react-i18next';
import { Bell, Mail, Moon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Switch } from '@/shared/ui/shadcn/components/ui/switch';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import { Separator } from '@/shared/ui/shadcn/components/ui/separator';
import { PageHeader } from '@/shared/ui/components/PageHeader';
import { useNotificationPreferences, useUpdatePreferences } from '../../application/hooks/useInbox';
import { INBOX_PATHS } from '../routes';
import type { NotificationType } from '../../domain/models/Notification';
import { NOTIFICATION_TYPE_LABELS } from '../../domain/models/Notification';

const CATEGORY_ORDER: NotificationType[] = ['system', 'task', 'comment', 'social', 'security', 'approval'];

export function PreferencesPage() {
  const { t } = useTranslation('inbox');
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updatePreferences = useUpdatePreferences();

  const handleToggleCategory = (
    category: NotificationType,
    channel: 'inApp' | 'email',
    value: boolean
  ) => {
    if (!preferences) return;

    updatePreferences.mutate({
      categories: {
        ...preferences.categories,
        [category]: {
          ...preferences.categories[category],
          [channel]: value,
        },
      },
    });
  };

  const handleToggleMuteAll = (value: boolean) => {
    updatePreferences.mutate({ muteAll: value });
  };

  return (
    <div className="container max-w-2xl mx-auto py-6 px-4 space-y-6">
      <PageHeader
        title={t('preferences.title')}
        subtitle={t('preferences.description')}
        backButton={{ to: INBOX_PATHS.ROOT }}
      />

      {/* Mute All */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            {t('preferences.muteAll.title')}
          </CardTitle>
          <CardDescription>{t('preferences.muteAll.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="mute-all" className="text-sm">
              {t('preferences.muteAll.label')}
            </Label>
            <Switch
              id="mute-all"
              checked={preferences?.muteAll ?? false}
              onCheckedChange={handleToggleMuteAll}
              disabled={isLoading || updatePreferences.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Category Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t('preferences.categories.title')}
          </CardTitle>
          <CardDescription>{t('preferences.categories.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Header */}
          <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground">
            <div>{t('preferences.categories.category')}</div>
            <div className="flex items-center justify-center gap-1">
              <Bell className="h-4 w-4" />
              {t('preferences.categories.inApp')}
            </div>
            <div className="flex items-center justify-center gap-1">
              <Mail className="h-4 w-4" />
              {t('preferences.categories.email')}
            </div>
          </div>

          <Separator />

          {/* Category rows */}
          {CATEGORY_ORDER.map((category) => (
            <div key={category} className="grid grid-cols-3 gap-4 items-center">
              <Label className="text-sm font-medium">
                {NOTIFICATION_TYPE_LABELS[category]}
              </Label>
              <div className="flex justify-center">
                <Switch
                  checked={preferences?.categories[category]?.inApp ?? true}
                  onCheckedChange={(value) => handleToggleCategory(category, 'inApp', value)}
                  disabled={isLoading || updatePreferences.isPending || preferences?.muteAll}
                />
              </div>
              <div className="flex justify-center">
                <Switch
                  checked={preferences?.categories[category]?.email ?? false}
                  onCheckedChange={(value) => handleToggleCategory(category, 'email', value)}
                  disabled={isLoading || updatePreferences.isPending || preferences?.muteAll}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Note about demo */}
      <p className="text-xs text-muted-foreground text-center">
        {t('preferences.demoNote')}
      </p>
    </div>
  );
}
