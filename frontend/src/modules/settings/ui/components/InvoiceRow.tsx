import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { Clock } from 'lucide-react';
import InfoCard from '@/shared/ui/components/metrics/InfoCard';

const InvoiceRow: React.FC<{ index: number; date: string; amount: string; status: string }>= ({ index, date, amount, status }) => {
  const { t } = useTranslation('settings');
  return (
    <InfoCard
      icon={<Clock className="w-4 h-4" />}
      title={date}
      description={t('billing.invoices.number', { index })}
      rightSlot={
        <div className="flex items-center gap-3">
          <span>{amount}</span>
          <Badge variant="outline" className="bg-green-50 dark:bg-green-500 text-green-700 dark:text-white border-green-200">{status}</Badge>
        </div>
      }
      className="py-3"
    />
  );
};

export default InvoiceRow;
