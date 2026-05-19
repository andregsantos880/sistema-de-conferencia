import { KpiCard, type KpiStatusLabel } from '../../../shared/components/KpiCard';
import { useChurnData } from '../../application/hooks/useExecutiveAnalytics';
import { CHART_COLORS } from '../../../shared/utils/chartColors';
import type { DateRange } from '../../../shared/utils/dateRange';
import { useTranslation } from 'react-i18next';
import { formatPercent } from '@/modules/dashboards/shared/utils';
import { SkeletonKpiCard } from '@/shared/ui/components/Skeleton';
import { computeChurnStatus } from '../../application/selectors/executiveInsights';

export interface ChurnCardProps {
  range: DateRange;
  compare: boolean;
}

export function ChurnCard({ range, compare }: ChurnCardProps) {
  const { t } = useTranslation('dashboards');
  const { data, isLoading } = useChurnData(range, compare);

  if (isLoading || !data) {
    return <SkeletonKpiCard showSparkline />;
  }

  const sparkData = data.series.map(d => d.y);
  
  // Compute churn status for KPI awareness
  const churnStatus = computeChurnStatus(data);
  const statusLabel: KpiStatusLabel = churnStatus.label;

  return (
    <KpiCard
      label={t('kpi.churn')}
      value={formatPercent(data.current)}
      className="h-full"
      delta={data.delta}
      deltaFormat="percent"
      trend={data.delta > 0 ? 'up' : data.delta < 0 ? 'down' : 'flat'}
      inverseTrend={true} // Lower churn is better
      sparkData={sparkData}
      colorToken={CHART_COLORS.destructive}
      tooltip={compare && data.previous ? `${t('kpi.deltaVsPrevious', 'vs previous period')}: ${data.previous.value.toFixed(1)}%` : undefined}
      density="spacious"
      status={statusLabel}
      target="< 3.0%"
    />
  );
}

