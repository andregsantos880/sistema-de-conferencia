import { DonutCard, type DonutDataItem } from '../../../shared/components/DonutCard';
import { useChannelBreakdown } from '../../application/hooks/useEcommerceAnalytics';
import type { DateRange } from '../../../shared/utils/dateRange';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../../shared/utils/formatters';
import { CHART_COLOR_ARRAY } from '../../../shared/utils/chartColors';
import { useMemo } from 'react';
import type { DashboardFilters } from '../../application/hooks/useDashboardFilters';

import { ChannelBreakdownSkeleton } from './ChannelBreakdownSkeleton';

export interface ChannelBreakdownCardProps {
  range: DateRange;
  /** Phase 3: Selected channel for filtering */
  selectedChannel?: string | null;
  /** Phase 3: Handler for channel selection */
  onChannelSelect?: (channel: string | null) => void;
  filters?: Partial<DashboardFilters>;
}

export function ChannelBreakdownCard({ range, selectedChannel, onChannelSelect, filters }: ChannelBreakdownCardProps) {
  const { t } = useTranslation('dashboards');
  
  // Channel breakdown should NOT filter by channel (it shows all channels)
  // Only pass other filters like productId
  const breakdownFilters = useMemo(() => {
    if (!filters) return undefined;
    const { channel, ...rest } = filters;
    return rest;
  }, [filters]);
  
  const { data, isLoading, refetch } = useChannelBreakdown(range, breakdownFilters);

  if (isLoading || !data) {
    return <ChannelBreakdownSkeleton />;
  }

  // Extract current data from comparative response
  const channels = data.data.current.channels;

  // Transform data to DonutCard format
  const chartData: DonutDataItem[] = channels.map((channel) => ({
    name: channel.channel,
    value: channel.revenue,
  }));

  return (
    <DonutCard
      title={t('ecommerce.widgets.channels')}
      data={chartData}
      valueFormatter={(v) => formatCurrency(v, 'USD', true)}
      height={340}
      onRefresh={() => refetch()}
      onSegmentClick={(segment) => {
        // Toggle: if clicking selected channel, clear filter; otherwise set new filter
        if (onChannelSelect) {
          onChannelSelect(selectedChannel === segment.name ? null : segment.name);
        }
      }}
      selectedSegment={selectedChannel}
      // showLegend={false}
      className="h-full"
    >
      {/* Channel details list */}
      <div className="mt-4 space-y-2">
        {channels.map((channel, index) => (
          <div
            key={channel.channel}
            className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length] }}
              />
              <span className="text-sm font-medium">{channel.channel}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">
                {formatCurrency(channel.revenue, 'USD', true)}
              </div>
              <div className="text-xs text-muted-foreground">
                {channel.orders.toLocaleString()} orders
              </div>
            </div>
          </div>
        ))}
      </div>
    </DonutCard>
  );
}
