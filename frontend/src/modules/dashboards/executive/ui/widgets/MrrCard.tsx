import { KpiCard } from '../../../shared/components/KpiCard';
import { useMrrData } from '../../application/hooks/useExecutiveAnalytics';
import { formatCurrency } from '../../../shared/utils/formatters';
import { CHART_COLORS } from '../../../shared/utils/chartColors';
import type { DateRange } from '../../../shared/utils/dateRange';
import { useTranslation } from 'react-i18next';
import type { JSX } from 'react';
import { SkeletonKpiCard } from '@/shared/ui/components/Skeleton';

export interface MrrCardProps {
  range: DateRange;
  compare: boolean;
}

/**
 * MRR Card
 * The MrrCard component is a KPI (Key Performance Indicator) card that displays the Monthly Recurring Revenue (MRR) of the company. 
 * It fetches the MRR data from the useMrrData hook and displays the current value, delta (change from the previous period), trend indicator, and a sparkline chart of the MRR over time. 
 * It also supports comparing the current period with the previous period.
 * 
 * @param {MrrCardProps} props - The props for the MrrCard component.
 * @returns {JSX.Element} The MrrCard component.
 */
export function MrrCard({ range, compare }: MrrCardProps): JSX.Element {
  const { t } = useTranslation('dashboards');
  const { data, isLoading } = useMrrData(range, compare);

  if (isLoading || !data) {
    return <SkeletonKpiCard showSparkline />;
  }

  const sparkData = data.series.map(d => d.y);

  console.log("Spark Data", sparkData);

  return (
    <KpiCard
      label={t('kpi.mrr')}
      value={formatCurrency(data.current, 'USD', true)}
      delta={data.delta}
      deltaFormat="percent"
      trend={data.delta > 0 ? 'up' : data.delta < 0 ? 'down' : 'flat'}
      sparkData={sparkData}
      colorToken={CHART_COLORS.primary}
      tooltip={compare && data.previous ? `${t('kpi.deltaVsPrevious', 'vs previous period')}: ${formatCurrency(data.previous.value, 'USD', true)}` : undefined}
      density="spacious"
    />
  );
}
