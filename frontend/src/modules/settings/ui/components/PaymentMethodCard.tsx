import React from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard } from 'lucide-react';
import ActionButton from '@/components/forms/buttons/ActionButton';
import InfoCard from '@/shared/ui/components/metrics/InfoCard';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import type { PaymentMethod } from '../../domain/models/Settings';

interface PaymentMethodCardProps {
  paymentMethod?: PaymentMethod;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({ paymentMethod }) => {
  const { t } = useTranslation('settings');

  const last4 = paymentMethod?.last4 ?? '4242';
  const expiryMonth = paymentMethod?.expiryMonth ?? 12;
  const expiryYear = paymentMethod?.expiryYear ?? 2026;
  const isDefault = paymentMethod?.isDefault ?? true;

  return (
    <div className="space-y-3">
      <InfoCard
        icon={<CreditCard className="w-5 h-5 text-slate-600" />}
        title={`•••• •••• •••• ${last4}`}
        description={t('billing.payment_methods.expires', { date: `${expiryMonth}/${expiryYear}` })}
        rightSlot={isDefault ? <Badge>{t('billing.payment_methods.default')}</Badge> : undefined}
      />

      <ActionButton variant="outline" className="w-full">{t('billing.payment_methods.add')}</ActionButton>
    </div>
  );
};

export default PaymentMethodCard;
