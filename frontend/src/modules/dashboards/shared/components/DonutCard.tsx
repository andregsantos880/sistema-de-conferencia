import { Card, CardContent, CardHeader } from '@/shared/ui/shadcn/components/ui/card';
import { WidgetHeader } from './WidgetHeader';
import { PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartLegend, ChartLegendContent, type ChartConfig } from '@/shared/ui/shadcn/components/ui/chart';
import { CustomTooltipContent } from './CustomTooltip';
import { CHART_COLOR_ARRAY } from '../utils/chartColors';
import type { ReactNode } from 'react';

export interface DonutDataItem {
  name: string;
  value: number;
  /** Optional color override */
  color?: string;
}

export interface DonutCardProps {
  title: string;
  data: DonutDataItem[];
  /** Field name for the value (used in tooltips) */
  valueLabel?: string;
  /** Formatter for values in tooltips and labels */
  valueFormatter?: (value: number) => string;
  /** Show labels on the chart */
  showLabels?: boolean;
  /** Show legend */
  showLegend?: boolean;
  /** Inner radius for donut (0 for pie) */
  innerRadius?: number;
  /** Outer radius */
  outerRadius?: number;
  /** Chart height */
  height?: number;
  /** Density */
  density?: 'compact' | 'spacious';
  /** Additional content below the chart */
  children?: ReactNode;
  onExport?: () => void;
  onRefresh?: () => void;
  className?: string;
  /** Phase 3: Click handler for segments */
  onSegmentClick?: (segment: DonutDataItem) => void;
  /** Phase 3: Currently selected segment name */
  selectedSegment?: string | null;
}

export function DonutCard({
  title,
  data,
  // valueLabel = 'Value',
  valueFormatter = (v) => v.toLocaleString(),
  showLabels = true,
  showLegend = true,
  innerRadius = 60,
  outerRadius = 100,
  height = 300,
  density = 'spacious',
  children,
  onExport,
  onRefresh,
  className,
  onSegmentClick,
  selectedSegment,
}: DonutCardProps) {
  // Build chart config from data
  const chartConfig = data.reduce((acc, item, index) => {
    acc[item.name] = {
      label: item.name,
      color: item.color || CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length],
    };
    return acc;
  }, {} as ChartConfig);

  return (
    <Card className={className}>
      <CardHeader className={density === 'compact' ? 'py-3' : undefined}>
        <WidgetHeader title={title} onExport={onExport} onRefresh={onRefresh} />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              label={
                showLabels
                  ? ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`
                  : false
              }
              labelLine={showLabels ? { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 } : false}
            >
              {data.map((entry, index) => {
                const isSelected = selectedSegment === entry.name;
                const hasSelection = selectedSegment !== null && selectedSegment !== undefined;
                const opacity = !hasSelection ? 1 : isSelected ? 1 : 0.3;
                
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length]}
                    className="stroke-background transition-opacity duration-200"
                    strokeWidth={isSelected ? 3 : 2}
                    opacity={opacity}
                    cursor={onSegmentClick ? 'pointer' : 'default'}
                    onClick={() => onSegmentClick?.(entry)}
                  />
                );
              })}
            </Pie>
            <ChartTooltip
              content={
                <CustomTooltipContent
                  formatter={(value, name) => {
                    if (typeof value !== 'number') return [value, name];
                    return [valueFormatter(value), name];
                  }}
                  hideLabel
                />
              }
            />
            {showLegend && (
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            )}
          </PieChart>
        </ChartContainer>

        {children}
      </CardContent>
    </Card>
  );
}
