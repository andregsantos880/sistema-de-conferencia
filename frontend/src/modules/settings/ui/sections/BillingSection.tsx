import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/ui/shadcn/components/ui/card';
import { Separator } from '@/shared/ui/shadcn/components/ui/separator';
import PlanCard from '../components/PlanCard';
import PaymentMethodCard from '../components/PaymentMethodCard';
import InvoiceRow from '../components/InvoiceRow';
import { SectionHeader } from '@/shared/ui/components/SectionHeader';
import { useBilling } from '../../application/hooks/useSettings';
import { SkeletonBillingSection } from '@/shared/ui/components/Skeleton';

const BillingSection: React.FC = () => {
  const { t } = useTranslation('settings');
  const { data: billing, isLoading, error } = useBilling();

  if (isLoading) {
    return <SkeletonBillingSection />;
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
        <SectionHeader title={t('billing.title')} description={t('billing.subtitle')} />

        <Separator />

        <PlanCard plan={billing?.plan} />

        <Separator />

        <div className="space-y-4">
          <SectionHeader title={t('billing.payment_methods.title')} />
          <PaymentMethodCard paymentMethod={billing?.paymentMethods?.[0]} />
        </div>

        <Separator />

        <div className="space-y-4">
          <SectionHeader title={t('billing.invoices.title')} />
          <div className="space-y-2">
            {billing?.invoices?.map((inv) => (
              <InvoiceRow
                key={inv.id}
                index={inv.id}
                date={inv.date}
                amount={inv.amount}
                status={inv.status === 'Paid' ? t('billing.invoices.status.paid') : inv.status}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BillingSection;
