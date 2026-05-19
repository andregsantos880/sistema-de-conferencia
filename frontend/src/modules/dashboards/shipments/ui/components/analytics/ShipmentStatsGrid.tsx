import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import type { ShipmentMetrics } from '../../../domain/models';
import { AreaChart, Area, BarChart, Bar } from 'recharts';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig, ChartLegend, ChartLegendContent } from '@/shared/ui/shadcn/components/ui/chart';
import { TrendMetricCard } from '@/shared/ui/components/metrics';

interface ShipmentStatsGridProps {
  metrics: ShipmentMetrics;
}

export function ShipmentStatsGrid({ metrics }: ShipmentStatsGridProps) {
  const { t } = useTranslation('dashboards');

  // Chart configuration with i18n labels
  const chartConfig = {
    value: {
      label: t('shipments.stats.shipments'),
      color: "#10b981",
    },
    onTime: {
      label: t('shipments.stats.onTime'),
      color: "#10b981",
    },
    delayed: {
      label: t('shipments.stats.delayed'),
      color: "#f59e0b",
    },
    exception: {
      label: t('shipments.stats.exception'),
      color: "#ef4444",
    },
  } satisfies ChartConfig;

  // Safe defaults if metrics are missing (during loading/mock transition)
  const onTimeData = metrics.dailyStats?.map(d => ({ value: d.onTime })) || [];
  const delayedData = metrics.dailyStats?.map(d => ({ 
     name: d.date, 
     onTime: d.onTime, 
     delayed: d.delayed, 
     exception: d.exception 
  })) || [];

  const onTimeRate = metrics.onTimeDeliveryRate || { value: 0, trend: 0 };
  const avgTime = metrics.averageDeliveryTime || { value: 0, unit: 'h', trend: 0 };
  const delayedTrend = metrics.delayedTrend || { value: 0, trend: 0 };
  
  // Calculate On Time Count for display
  const onTimeCount = Math.round(metrics.active * (onTimeRate.value / 100));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* 1. On-Time Delivery Rate (TrendMetricCard) */}
      <TrendMetricCard
        className="h-full"
        title={t('shipments.stats.onTimeDeliveryRate')}
        value={onTimeCount}
        icon={CheckCircle2}
        iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        trend={{
          value: Math.abs(onTimeRate.trend),
          direction: onTimeRate.trend >= 0 ? 'up' : 'down',
          label: '%'
        }}
        chartConfig={chartConfig}
      >
        <AreaChart data={onTimeData}>
          <defs>
            <linearGradient id="colorOnTime" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="var(--color-value)" 
            fillOpacity={1} 
            fill="url(#colorOnTime)" 
            strokeWidth={2} 
          />
        </AreaChart>
      </TrendMetricCard>

      {/* 2. Average Delivery Time (Standard Card - Custom Visualization) */}
      <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
           <CardTitle className="text-sm font-medium text-muted-foreground">{t('shipments.stats.avgDeliveryTime')}</CardTitle>
           <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
           <div className="flex items-baseline gap-2">
             <span className="text-2xl font-bold">{avgTime.value}h</span>
             <span className="text-xs text-muted-foreground">{t('shipments.stats.etaDueIn', { hours: 2 })}</span>
           </div>
           
           {/* Custom Timeline Visual */}
           <div className="mt-4 relative h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-blue-500 w-[60%] rounded-full opacity-80" />
              <div className="absolute top-0 left-[60%] h-full bg-emerald-500 w-[15%] opacity-80" />
              <div className="absolute top-0 left-[75%] h-full bg-amber-500 w-[10%] opacity-80" />
           </div>
           <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
              <span>{t('shipments.stats.processing')}</span>
              <span className="text-primary font-medium">{t('shipments.stats.inTransit')}</span>
              <span>{t('shipments.stats.delivered')}</span>
           </div>
        </CardContent>
      </Card>

      {/* 3. Delayed Shipments (TrendMetricCard with Trend Color Override) */}
      <TrendMetricCard
        className="h-full"
        title={t('shipments.stats.delayed')}
        value={delayedTrend.value}
        icon={AlertCircle}
        iconClassName="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        trend={{
          value: Math.abs(delayedTrend.trend),
          direction: delayedTrend.trend > 0 ? 'up' : 'down',
          label: 'm',
          className: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30'
        }}
        chartConfig={chartConfig}
      >
        <BarChart data={delayedData.slice(-7)}>
          <Bar dataKey="delayed" fill="var(--color-delayed)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </TrendMetricCard>

      {/* 4. Recent Activity (Standard Card - Stacked Chart with Legend) */}
      <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
           <CardTitle className="text-sm font-medium text-muted-foreground">{t('shipments.stats.recentActivity')}</CardTitle>
           <div className="text-xs text-muted-foreground">{t('shipments.stats.last14Days')}</div>
        </CardHeader>
        <CardContent>
           <div className="h-[120px] w-full mt-2"> 
            <ChartContainer config={chartConfig} className="aspect-auto h-full w-full">
                <BarChart data={delayedData}>
                   <ChartTooltip content={<ChartTooltipContent />} />
                   <Bar dataKey="onTime" stackId="a" fill="var(--color-onTime)" radius={[0,0,0,0]} barSize={12} />
                   <Bar dataKey="delayed" stackId="a" fill="var(--color-delayed)" radius={[0,0,0,0]} barSize={12} />
                   <Bar dataKey="exception" stackId="a" fill="var(--color-exception)" radius={[4,4,0,0]} barSize={12} />
                   <ChartLegend content={<ChartLegendContent />} />
                </BarChart>
            </ChartContainer>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
