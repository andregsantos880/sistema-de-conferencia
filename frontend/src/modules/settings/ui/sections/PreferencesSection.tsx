import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/ui/shadcn/components/ui/card';
import { Separator } from '@/shared/ui/shadcn/components/ui/separator';
import ThemeToggler from '@/shared/ui/components/ThemeToggler';
import LanguageSelector from '../components/LanguageSelector';
import AccessibilityToggles from '../components/AccessibilityToggles';
import ActionButton from '@/components/forms/buttons/ActionButton';
import { SectionHeader } from '@/shared/ui/components/SectionHeader';
import { LayoutSelector } from '@/shared/ui/layouts/components/LayoutSelector';
import { SidebarAppearanceSelector } from '@/shared/ui/layouts/components/SidebarAppearanceSelector';
import { Loader2 } from 'lucide-react';
import { usePreferences, useUpdatePreferences } from '../../application/hooks/useSettings';
import { useLayout } from '@/shared/ui/layouts/app/useLayout';

const PreferencesSection: React.FC = () => {
  const { t } = useTranslation('settings');
  const { data: preferences, isLoading, error } = usePreferences();
  const updatePreferences = useUpdatePreferences();
  const { layoutMode } = useLayout();

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
        <SectionHeader title={t('preferences.title')} description={t('preferences.subtitle')} />
        <Separator />

        <div className="space-y-4">
          <SectionHeader title={t('preferences.appearance.title')} />
          <ThemeToggler size="lg" />
        </div>

        <Separator />
        <LayoutSelector />

        {layoutMode.startsWith('vertical') && (
          <div className="space-y-4">
            <SectionHeader title={t('sidebarAppearance.title')} description={t('sidebarAppearance.description')} />
            <SidebarAppearanceSelector />
          </div>
        )}

        <Separator />

        <div className="space-y-4">
          <SectionHeader title={t('preferences.language_region.title')} />
          <LanguageSelector
            language={preferences?.language}
            onLanguageChange={(language) => updatePreferences.mutate({ language })}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <SectionHeader title={t('preferences.accessibility.title')} />
          <AccessibilityToggles
            preferences={preferences}
            onUpdate={(updates) => updatePreferences.mutate(updates)}
          />
        </div>

        <div className="flex justify-end gap-3">
          <ActionButton variant="outline">{t('common:actions.reset_to_default')}</ActionButton>
          <ActionButton disabled={updatePreferences.isPending}>
            {updatePreferences.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {t('common:actions.save_preferences')}
          </ActionButton>
        </div>
      </div>
    </Card>
  );
};

export default PreferencesSection;
