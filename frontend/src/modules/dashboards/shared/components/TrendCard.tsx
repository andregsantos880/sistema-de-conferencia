import { Card, CardContent, CardHeader } from '@/shared/ui/shadcn/components/ui/card';
import { WidgetHeader } from './WidgetHeader';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { format } from 'date-fns';
import type { ComponentType } from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/shared/ui/shadcn/components/ui/chart';
import { CHART_COLOR_ARRAY, CHART_COLORS } from '../utils/chartColors';
import { cleanString } from '../utils/formatters';
import { TooltipValueFormatter, type TooltipItemType } from './TooltipValueFormatter';
import { cn } from '@/shadcn/lib/utils';

export interface SeriesData {
  x: string | Date;
  y: number;
}

export interface ChartSeries {
  name: string;
  data: SeriesData[];
  color?: string;
}

export interface TrendCardProps {
  title: string;
  /** Optional subtitle element or text */
  subtitle?: React.ReactNode;
  series: ChartSeries[];
  compareSeries?: ChartSeries[];
  yFormatter?: (value: number) => string;
  type?: 'line' | 'area';
  annotations?: Array<{ x: string | Date; label: string }>;
  showLegend?: boolean;
  showGrid?: boolean;
  height?: number;
  density?: 'compact' | 'spacious';
  onExport?: () => void;
  onRefresh?: () => void;
  className?: string;
  dashedSeries?: string[];
}

export function TrendCard({
  title,
  subtitle,
  series,
  compareSeries,
  yFormatter = (value) => value.toString(),
  type = 'area',
  // annotations,
  showLegend = true,
  showGrid = true,
  height = 300,
  density = 'spacious',
  onExport,
  onRefresh,
  className,
  dashedSeries = [],
}: TrendCardProps) {
  // Merge all series data into a single dataset for Recharts
  const mergedData = mergeSeries(series, compareSeries);
  console.log('mergedData', mergedData);

   const chartConfig = {
      Revenue: {
        label: "Revenue",
        color: CHART_COLORS.primary,
      },
      Target: {
        label: "Target",
        color: CHART_COLORS.secondary,
      },
    } satisfies ChartConfig;

  const Chart = type === 'area' ? AreaChart : LineChart;
  const DataComponent = (type === 'area' ? Area : Line) as ComponentType<Record<string, unknown>>;

  return (
    <Card className={cn(
      "border-border/50 transition-all duration-300 hover:shadow-lg dark:hover:shadow-primary/5", 
      className
    )}>
      <CardHeader className={density === 'compact' ? 'py-3' : undefined}>
        <WidgetHeader
          title={title}
          onExport={onExport}
          onRefresh={onRefresh}
        />
        {subtitle && (
          <div className="mt-1">
            {typeof subtitle === 'string' ? (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            ) : (
              subtitle
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto w-full" style={{ height }}>
          <Chart data={mergedData}>
            {showGrid && (
              <CartesianGrid
                //strokeDasharray="3 3"
                //stroke={`${tokens.border}`}
                vertical={false}
                strokeOpacity={0.1}
              />
            )}

            <XAxis
              dataKey="x"
              tickFormatter={(value) => {
                try {
                  return format(new Date(value), 'MMM d');
                } catch {
                  return value;
                }
              }}
              //stroke={`${tokens.muted}`}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              tickFormatter={yFormatter}
              //stroke={`${tokens.muted}`}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={60}
            />

            <ChartTooltip
              cursor={{
                strokeWidth: 1,
                strokeDasharray: "3 3"
              }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    try {
                      return format(new Date(value), 'MMM d, yyyy');
                    } catch {
                      return value;
                    }
                  }}
                  formatter={(_, __, item, ___) => TooltipValueFormatter(item as TooltipItemType, (value) => yFormatter(value as number))}
                />
              }
            />

            {showLegend && <Legend />}
            
            {/* Render gradient for area series - Enhanced for light/dark mode */}
            {type === 'area' && series.map((s, idx) => {
              const color = s.color || `${CHART_COLOR_ARRAY[idx % CHART_COLOR_ARRAY.length]}`;

              return <defs key={`trendGradient-${idx}`}>
                <linearGradient id={`trendGradient-${cleanString(s.name)}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.6} />
                  <stop offset="40%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.08} />
                </linearGradient>
              </defs>
            })}

            {/* Render main series */}
            {series.map((s, idx) => (
              <DataComponent
                key={s.name}
                dataKey={s.name}
                stroke={s.color || `${CHART_COLOR_ARRAY[idx % CHART_COLOR_ARRAY.length]}`}
                fill={s.color || `url(#trendGradient-${cleanString(s.name)})`}
                fillOpacity={0.4}
                strokeWidth={3.5}
                strokeDasharray={dashedSeries.includes(s.name) ? '4 4' : undefined}
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-in-out"
                dot={{ r: 0, strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              ))
            }

            {compareSeries && compareSeries.map((s, idx) => (
               <defs key={`compareGradient-${idx}`}>
                <linearGradient id={`compareGradient-${cleanString(s.name)}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.muted} stopOpacity={0.35} />
                  <stop offset="50%" stopColor={CHART_COLORS.muted} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={CHART_COLORS.muted} stopOpacity={0.02} />
                </linearGradient>
              </defs>
            ))}

            {/* Render compare series with muted style */}
            {compareSeries?.map((s) => (
              <DataComponent
                key={s.name}
                dataKey={s.name}
                type="monotone"
                stroke={`${CHART_COLORS.muted}`}
                fill={`url(#compareGradient-${cleanString(s.name)})`}
                fillOpacity={0.2}
                strokeWidth={2}
                strokeDasharray="4 4"
                isAnimationActive={true}
                animationDuration={1500}
                dot={false}
                activeDot={false}
              />
            ))}
          </Chart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function mergeSeries(series: ChartSeries[], compareSeries?: ChartSeries[]): Array<Record<string, unknown>> {
  const dataMap = new Map<string, Record<string, unknown>>();

  // Add main series
  series.forEach(s => {
    s.data.forEach(point => {
      const key = point.x.toString();
      if (!dataMap.has(key)) {
        dataMap.set(key, { x: point.x });
      }
      dataMap.get(key)![s.name] = point.y;
    });
  });

  // Add compare series
  compareSeries?.forEach(s => {
    s.data.forEach(point => {
      const key = point.x.toString();
      if (!dataMap.has(key)) {
        dataMap.set(key, { x: point.x });
      }
      dataMap.get(key)![`${s.name}`] = point.y;
    });
  });

  return Array.from(dataMap.values()).sort((a, b) => 
    new Date(a.x as string | Date).getTime() - new Date(b.x as string | Date).getTime()
  );
}
