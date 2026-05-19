import { KpiCard } from '../../../shared/components/KpiCard';
import { useActiveCustomersData } from '../../application/hooks/useExecutiveAnalytics';
import { formatCompact } from '../../../shared/utils/formatters';
import { CHART_COLORS } from '../../../shared/utils/chartColors';
import type { DateRange } from '../../../shared/utils/dateRange';
import { useTranslation } from 'react-i18next';
import { SkeletonKpiCard } from '@/shared/ui/components/Skeleton';

export interface ActiveCustomersCardProps {
  range: DateRange;
  compare: boolean;
}

export function ActiveCustomersCard({ range, compare }: ActiveCustomersCardProps) {
  const { t } = useTranslation('dashboards');
  const { data, isLoading } = useActiveCustomersData(range, compare);

  if (isLoading || !data) {
    return <SkeletonKpiCard showSparkline />;
  }

  const sparkData = data.series.map(d => d.y);

  return (
    <KpiCard
      label={t('kpi.activeCustomers')}
      value={formatCompact(data.current)}
      delta={data.delta}
      deltaFormat="percent"
      trend={data.delta > 0 ? 'up' : data.delta < 0 ? 'down' : 'flat'}
      sparkData={sparkData}
      colorToken={CHART_COLORS.tertiary}
      tooltip={compare && data.previous ? `${t('kpi.deltaVsPrevious', 'vs previous period')}: ${formatCompact(data.previous.value)}` : undefined}
      density="spacious"
    />
  );
}
