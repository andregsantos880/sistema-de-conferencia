import { KpiCard } from '../../../shared/components/KpiCard';
import { useNpsData } from '../../application/hooks/useExecutiveAnalytics';
import { CHART_COLORS } from '../../../shared/utils/chartColors';
import type { DateRange } from '../../../shared/utils/dateRange';
import { useTranslation } from 'react-i18next';
import { SkeletonKpiCard } from '@/shared/ui/components/Skeleton';

export interface NpsCardProps {
  range: DateRange;
}

export function NpsCard({ range }: NpsCardProps) {
  const { t } = useTranslation('dashboards');
  const { data, isLoading } = useNpsData(range);

  if (isLoading || !data) {
    return <SkeletonKpiCard showSparkline />;
  }

  const sparkData = data.series.map((point) => point.y);
  const trend: 'up' | 'down' | 'flat' =
    data.delta > 0 ? 'up' : data.delta < 0 ? 'down' : 'flat';

  return (
    <>
      <KpiCard
        label={t('kpi.nps')}
        value={data.current}
        delta={data.delta}
        deltaFormat="number"
        trend={trend}
        sparkData={sparkData}
        colorToken={CHART_COLORS.primary}
        density="spacious"
      />
    </>
  );
}
