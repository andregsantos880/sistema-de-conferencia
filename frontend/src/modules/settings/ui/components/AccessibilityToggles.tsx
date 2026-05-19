import React from 'react';
import { useTranslation } from 'react-i18next';
import InfoCard from '@/shared/ui/components/metrics/InfoCard';
import { MoveRightIcon, ContrastIcon, TargetIcon } from 'lucide-react';
import type { UserPreferences, UpdatePreferencesDto } from '../../domain/models/Settings';

interface AccessibilityTogglesProps {
  preferences?: UserPreferences;
  onUpdate?: (updates: UpdatePreferencesDto) => void;
}

const AccessibilityToggles: React.FC<AccessibilityTogglesProps> = ({ preferences, onUpdate }) => {
  const { t } = useTranslation('settings');

  return (
    <div className="space-y-3">
      <InfoCard
        icon={<MoveRightIcon className="size-4" />}
        title={t('preferences.accessibility.reduced_motion.title')}
        description={t('preferences.accessibility.reduced_motion.description')}
        switchProps={{
          defaultChecked: preferences?.reducedMotion ?? false,
          onChange: (checked) => onUpdate?.({ reducedMotion: checked }),
        }}
      />
      <InfoCard
        icon={<ContrastIcon className="size-4" />}
        title={t('preferences.accessibility.high_contrast.title')}
        description={t('preferences.accessibility.high_contrast.description')}
        switchProps={{
          defaultChecked: preferences?.highContrast ?? false,
          onChange: (checked) => onUpdate?.({ highContrast: checked }),
        }}
      />
      <InfoCard
        icon={<TargetIcon className="size-4" />}
        title={t('preferences.accessibility.large_text.title')}
        description={t('preferences.accessibility.large_text.description')}
        switchProps={{
          defaultChecked: preferences?.largeText ?? false,
          onChange: (checked) => onUpdate?.({ largeText: checked }),
        }}
      />
    </div>
  );
};

export default AccessibilityToggles;
