import { Card, CardContent, CardHeader } from '@/shared/ui/shadcn/components/ui/card';
import { WidgetHeader } from './WidgetHeader';
import { FunnelChart, Funnel, Cell, LabelList } from 'recharts';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/shared/ui/shadcn/components/ui/chart';
import { CustomTooltipContent } from './CustomTooltip';
import { CHART_COLOR_ARRAY } from '../utils/chartColors';
import type { ReactNode } from 'react';

export interface FunnelDataItem {
  name: string;
  value: number;
  /** Optional color override */
  color?: string;
  /** Optional additional data for display */
  [key: string]: unknown;
}

export interface FunnelChartCardProps {
  title: string;
  data: FunnelDataItem[];
  /** Formatter for values in tooltips and labels */
  valueFormatter?: (value: number) => string;
  /** Show labels on the funnel segments */
  showLabels?: boolean;
  /** Label position: 'right', 'left', 'inside', 'outside' */
  labelPosition?: 'right' | 'left' | 'inside' | 'outside';
  /** Chart height */
  height?: number;
  /** Density */
  density?: 'compact' | 'spacious';
  /** Additional content below the chart */
  children?: ReactNode;
  /** Click handler for funnel segments */
  onSegmentClick?: (item: FunnelDataItem | null) => void;
  onExport?: () => void;
  onRefresh?: () => void;
  className?: string;
  /** Phase 3: Currently selected stage name */
  selectedStage?: string | null;
}

export function FunnelChartCard({
  title,
  data,
  valueFormatter = (v) => v.toLocaleString(),
  showLabels = true,
  labelPosition = 'right',
  height = 300,
  density = 'spacious',
  children,
  onSegmentClick,
  onExport,
  onRefresh,
  className,
  selectedStage,
}: FunnelChartCardProps) {
  // Build chart config from data
  const chartConfig = data.reduce((acc, item, index) => {
    acc[item.name] = {
      label: item.name,
      color: item.color || CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length],
    };
    return acc;
  }, {} as ChartConfig);

  // Prepare data with fill colors
  const chartData = data.map((item, index) => ({
    ...item,
    fill: item.color || CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length],
  }));

  const handleClick = (data: FunnelDataItem | null) => {
    onSegmentClick?.(data);
  };

  return (
    <Card className={className}>
      <CardHeader className={density === 'compact' ? 'py-3' : undefined}>
        <WidgetHeader title={title} onExport={onExport} onRefresh={onRefresh} />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
          <FunnelChart>
            <ChartTooltip
              content={
                <CustomTooltipContent
                  formatter={(value, name, _item, _index, payload) => {
                     // Check payload safely through the TooltipItem type
                    const p = payload && payload.length > 0 ? payload[_index] : null;
                    const stepName = p && p.payload && typeof p.payload.name === 'string' 
                            ? p.payload.name as string
                            : name;

                    if (typeof value !== 'number') return [value, stepName];
                    return [valueFormatter(value), stepName];
                  }}
                  hideIndicator
                  hideLabel
                />
              }
            />
            <Funnel
              dataKey="value"
              data={chartData}
              isAnimationActive
              onClick={(data) => handleClick(data as FunnelDataItem)}
            >
              {showLabels && (
                <LabelList
                  position={labelPosition}
                  dataKey="name"
                  fill="currentColor"
                  className="fill-foreground text-sm"
                />
              )}
              {chartData.map((entry, index) => {
                // Phase 3: Visual emphasis for selected stage
                const isSelected = selectedStage === entry.name;
                const hasSelection = selectedStage !== null && selectedStage !== undefined;
                const opacity = !hasSelection ? 1 : isSelected ? 1 : 0.4;
                
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    className="stroke-background cursor-pointer transition-all duration-200"
                    strokeWidth={isSelected ? 3 : 2}
                    opacity={opacity}
                  />
                );
              })}
            </Funnel>
          </FunnelChart>
        </ChartContainer>

        {children}
      </CardContent>
    </Card>
  );
}
