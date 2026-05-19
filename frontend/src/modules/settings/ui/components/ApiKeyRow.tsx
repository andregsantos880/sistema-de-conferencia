import React from 'react';
import { useTranslation } from 'react-i18next';
import { Key } from 'lucide-react';
import ActionButton from '@/components/forms/buttons/ActionButton';
import InfoCard from '@/shared/ui/components/metrics/InfoCard';

interface ApiKeyRowProps {
  name: string;
  keyMasked: string;
  onDelete?: () => void;
}

const ApiKeyRow: React.FC<ApiKeyRowProps> = ({ name, keyMasked, onDelete }) => {
  const { t } = useTranslation('settings');
  return (
    <InfoCard 
      title={name}
      description={keyMasked}
      icon={<Key className="w-5 h-5 text-slate-600" />}
      rightSlot={
        <div className="flex gap-2">
          <ActionButton variant="ghost" size="sm">{t('security.api_keys.regenerate')}</ActionButton>
          <ActionButton variant="ghost" size="sm" onClick={onDelete}>{t('security.api_keys.delete')}</ActionButton>
        </div>
      }
    />
  );
};

export default ApiKeyRow;
