import { KpiCard } from '../../../shared/components/KpiCard';
import { useLtvCacData } from '../../application/hooks/useExecutiveAnalytics';
import { formatRatio } from '../../../shared/utils/formatters';
import { CHART_COLORS } from '../../../shared/utils/chartColors';
import { useTranslation } from 'react-i18next';

export interface LtvCacCardProps {
  compare: boolean;
}

export function LtvCacCard({ compare }: LtvCacCardProps) {
  const { t } = useTranslation('dashboards');
  const { data, isLoading } = useLtvCacData(compare);

  if (isLoading || !data) {
    return (
      <KpiCard
        label={t('kpi.ltvCac')}
        value="..."
        density="spacious"
      />
    );
  }

  const currentRatio = formatRatio(data.ltv, data.cac);
  const previousRatio = data.previous ? formatRatio(data.previous.ltv, data.previous.cac) : null;
  const delta = data.previous ? ((data.ratio - data.previous.ratio) / data.previous.ratio) * 100 : 0;

  return (
    <KpiCard
      label={t('kpi.ltvCac')}
      value={currentRatio}
      delta={compare ? delta : undefined}
      deltaFormat="percent"
      trend={delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'}
      colorToken={CHART_COLORS.success}
      tooltip={compare && previousRatio ? `${t('kpi.deltaVsPrevious', 'vs previous period')}: ${previousRatio}` : undefined}
      density="spacious"
      className="h-full"
    />
  );
}
