import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import ActionButton from '@/components/forms/buttons/ActionButton';
import type { Plan } from '../../domain/models/Settings';

interface PlanCardProps {
  plan?: Plan;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan }) => {
  const { t } = useTranslation('settings');

  const planName = plan?.name ?? t('billing.plan.name');
  const priceLabel = plan ? `$${plan.price}/${plan.interval}` : t('billing.plan.price_label');
  const nextPayment = plan?.nextPayment ?? 'Nov 24, 2025';
  const projects = plan?.features?.projects ?? t('billing.plan.features.projects_value');
  const storage = plan?.features?.storage ?? t('billing.plan.features.storage_value');
  const teamMembers = plan?.features?.teamMembers ?? t('billing.plan.features.team_members_value');

  return (
    <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900 dark:to-blue-900 rounded-lg border-2 border-purple-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <Badge className="bg-purple-600 dark:bg-purple-500 mb-2 text-white">{planName}</Badge>
          <h3 className="">{priceLabel}</h3>
          <p className="text-sm text-muted-foreground">{t('billing.plan.billed_next', { date: nextPayment })}</p>
        </div>
        <ActionButton variant="outline" size="sm">{t('billing.plan.upgrade')}</ActionButton>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div>
          <p className="text-xs">{t('billing.plan.features.projects')}</p>
          <p className="text-muted-foreground">{projects}</p>
        </div>
        <div>
          <p className="text-xs">{t('billing.plan.features.storage')}</p>
          <p className="text-muted-foreground">{storage}</p>
        </div>
        <div>
          <p className="text-xs">{t('billing.plan.features.team_members')}</p>
          <p className="text-muted-foreground">{teamMembers}</p>
        </div>
      </div>
    </div>
  );
};

export default PlanCard;
