import React from 'react';
import { useTranslation } from 'react-i18next';
import { Smartphone } from 'lucide-react';
import ActionButton from '@/components/forms/buttons/ActionButton';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import InfoCard from '@/shared/ui/components/metrics/InfoCard';

interface SessionRowProps {
  title: string;
  subtitle: string;
  active?: boolean;
  onRevoke?: () => void;
}

const SessionRow: React.FC<SessionRowProps>= ({ title, subtitle, active, onRevoke }) => {
  const { t } = useTranslation('settings');
  return (
    <InfoCard
      title={title}
      description={subtitle}
      icon={<Smartphone className="w-5 h-5 text-slate-600" />}
      rightSlot={
        active ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-500 dark:text-white">{t('security.sessions.active_badge')}</Badge>
        ) : (
          <ActionButton variant="ghost" size="sm" onClick={onRevoke}>{t('security.sessions.revoke')}</ActionButton>
        )
      }
    />
  );
};

export default SessionRow;
