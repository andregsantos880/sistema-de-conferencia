import React from 'react';
import { useTranslation } from 'react-i18next';
import { Phone } from 'lucide-react';
import InfoCard from '@/shared/ui/components/metrics/InfoCard';

const PhoneCard: React.FC<{ phone: string }>= ({ phone }) => {
  const { t } = useTranslation('settings');
  return (
    <InfoCard
      icon={<Phone className="w-5 h-5 text-slate-600" />}
      title={phone}
      description={t('account.phone.label')}
      buttonProps={{ label: t('common:actions.update'), variant: 'ghost', size: 'sm', className: 'border' }}
    />
  );
};

export default PhoneCard;
