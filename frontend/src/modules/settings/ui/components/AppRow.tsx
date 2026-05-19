import React from 'react';
import { useTranslation } from 'react-i18next';
import ActionButton from '@/components/forms/buttons/ActionButton';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import InfoCard from '@/shared/ui/components/metrics/InfoCard';

interface AppRowProps {
  icon: string;
  name: string;
  description: string;
  connected: boolean;
  onToggle?: () => void;
}

const AppRow: React.FC<AppRowProps> = ({ icon, name, description, connected, onToggle }) => {
  const { t } = useTranslation('settings');
  return (
    <InfoCard
      icon={<div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-2xl">{icon}</div>}
      title={<h5>{name}</h5>}
      description={<p className="text-sm text-foreground-muted">{description}</p>}
      rightSlot={connected ? (
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-600 dark:text-white">{t('apps.connected_badge')}</Badge>
          <ActionButton variant="outline" size="sm" onClick={onToggle}>{t('apps.disconnect')}</ActionButton>
        </div>
      ) : (
        <ActionButton size="sm" onClick={onToggle}>{t('apps.connect')}</ActionButton>
      )}
    />
  );
};

export default AppRow;
