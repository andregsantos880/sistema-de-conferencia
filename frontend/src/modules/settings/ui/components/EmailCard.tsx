import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
import InfoCard from '@/shared/ui/components/metrics/InfoCard';

const EmailCard: React.FC<{ email: string }>= ({ email }) => {
  const { t } = useTranslation('settings');
  return (
    <InfoCard
      icon={<Mail className="w-5 h-5 text-slate-600" />}
      title={email}
      description={t('account.email.primary')}
      badgeProps={{ 
        variant: 'outline', 
        className: 'bg-green-50 dark:bg-green-500 text-green-700 dark:text-white border-green-200', 
        children: t('account.email.verified') 
      }}
    />
  );
};

export default EmailCard;
