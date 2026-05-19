import { Card, CardContent, CardHeader } from '@/shared/ui/shadcn/components/ui/card';
import { WidgetHeader } from '../../../shared/components/WidgetHeader';
import { ComposedChart, Area, Bar, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui/shadcn/components/ui/chart';
import { useForecast } from '../../application/hooks/useSalesAnalytics';
import type { DateRange } from '../../../shared/utils/dateRange';
import type { SalesDashboardFilters } from '../../application/hooks/useSalesDashboardFilters';
import { format } from 'date-fns';
import { formatCurrency } from '../../../shared/utils/formatters';
import { useTranslation } from 'react-i18next';

export interface ForecastVsQuotaProps { range: DateRange; filters?: Partial<SalesDashboardFilters> }

export function ForecastVsQuota({ range, filters }: ForecastVsQuotaProps) {
  const { t } = useTranslation('dashboards');
  const { data, isLoading, refetch } = useForecast(range, filters);

  return (
    <Card className="h-full transition-all duration-300 hover:shadow-lg dark:hover:shadow-primary/5">
      <CardHeader>
        <WidgetHeader title={t('sales.widgets.forecast')} onRefresh={() => refetch()} />
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <div className="h-[340px] flex items-center justify-center text-muted-foreground">Loading...</div>
        ) : (
          <ChartContainer config={{}} className="h-[340px] w-full">
            <ComposedChart data={data.series}>
              <defs>
                 <linearGradient id="chart2Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="chart3Gradient" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.3} />
                   <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeOpacity={0.1} />
              <XAxis 
                dataKey="x" 
                tickFormatter={(v) => format(new Date(v), 'MMM yyyy')} 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tickFormatter={(v) => formatCurrency(v as number, 'USD', true)} 
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              
              <Bar 
                dataKey="closedWon" 
                name="Closed Won" 
                fill="var(--success)" 
                radius={[4,4,0,0]} 
                isAnimationActive={true}
                animationDuration={1500}
              />
              
              <Area 
                type="monotone"
                dataKey="bestCase" 
                name="Best Case" 
                fill="url(#chart2Gradient)" 
                stroke="var(--chart-2)" 
                fillOpacity={1} 
                isAnimationActive={true}
                animationDuration={1500}
              />
              
              <Area 
                type="monotone"
                dataKey="commit" 
                name="Commit" 
                fill="url(#chart3Gradient)" 
                stroke="var(--chart-3)" 
                fillOpacity={1} 
                isAnimationActive={true}
                animationDuration={1500}
              />
              
              <Line 
                type="monotone" 
                dataKey="target" 
                name="Quota" 
                stroke="var(--destructive)" 
                strokeDasharray="5 5" 
                dot={false} 
                strokeWidth={2}
                isAnimationActive={true}
                animationDuration={2000}
              />
            </ComposedChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
