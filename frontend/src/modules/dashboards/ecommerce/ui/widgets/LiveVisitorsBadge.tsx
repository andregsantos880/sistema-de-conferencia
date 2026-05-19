import { Card, CardContent, CardHeader } from '@/shared/ui/shadcn/components/ui/card';
import { WidgetHeader } from '../../../shared/components/WidgetHeader';
import { useLiveVisitors } from '../../application/hooks/useRealtimeData';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shadcn/lib/utils';
import { motion } from 'framer-motion';
import { Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import CountUp from 'react-countup';
import { ConnectionStatus } from '@/shared/ui/components/realtime';
import { LiveSignalChart } from '../../../shared/components/LiveSignalChart';
import { LivePauseButton } from '../../../shared/components/LivePauseButton';

/**
 * Phase 2: Live Visitors Badge
 * 
 * Transforms from static counter to real-time streaming signal:
 * - WebSocket-driven updates (primary)
 * - Rolling 60-second buffer
 * - Live area chart
 * - Slope-based trend indicator
 * - Pause/Resume functionality
 * - REST polling fallback
 */
export function LiveVisitorsBadge() {
  const { t } = useTranslation('dashboards');
  
  // Use the E-commerce Live Visitors hook with shared primitives
  const { 
    count, 
    chartData, 
    trend, 
    isPaused, 
    togglePause, 
    refetch, 
    mode, 
    isConnected 
  } = useLiveVisitors();

  const TrendIcon = trend === 'increasing' ? TrendingUp : trend === 'decreasing' ? TrendingDown : Minus;
  const trendColor =
    trend === 'increasing'
      ? 'text-green-500'
      : trend === 'decreasing'
      ? 'text-red-500'
      : 'text-muted-foreground';

  const trendLabel = trend === 'increasing' ? 'Increasing' : trend === 'decreasing' ? 'Decreasing' : 'Stable';

  const refreshCallback = mode === 'websocket' ? undefined : refetch;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <WidgetHeader
          title={t('ecommerce.widgets.liveVisitors')}
          onRefresh={refreshCallback}
          actions={
            <div className="flex items-center gap-2">
              <LivePauseButton isPaused={isPaused} onToggle={togglePause} />
              
              <ConnectionStatus 
                isConnected={isConnected} 
                mode={mode} 
                showMode={true}
                size="md"
              />
            </div>
          }
        />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Main visitor count with CountUp animation */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'relative flex flex-col items-center justify-center rounded-lg p-6',
              'bg-gradient-to-br from-primary/20 to-primary/5',
              trend === 'increasing' && 'ring-2 ring-green-500/30',
              trend === 'decreasing' && 'ring-2 ring-red-500/30'
            )}
          >
            <Users className="absolute top-2 right-2 h-5 w-5 text-primary/60" />

            <div className="text-center">
              <CountUp
                start={0}
                end={count ?? 0}
                duration={1.5}
                separator=","
                preserveValue
                useEasing
                className="text-5xl font-bold tabular-nums"
              />
              <p className="text-xs text-muted-foreground mt-1">visitors online</p>
            </div>

            {/* Trend indicator */}
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('mt-3 flex items-center gap-1', trendColor)}
            >
              <TrendIcon className="h-4 w-4" />
              <span className="text-xs font-medium">
                {trendLabel}
              </span>
            </motion.div>
          </motion.div>

          {/* Phase 2: Live Chart */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                Last 60 seconds
              </p>
              {isPaused && (
                <span className="text-xs text-amber-500 font-medium">Paused</span>
              )}
            </div>
            
            <LiveSignalChart
              data={chartData}
              className="h-24 w-full"
              chartKey="chart-3"
            />

            <p className="text-[10px] text-muted-foreground text-center">
              {chartData.length} data points {mode === 'websocket' ? '(live stream)' : '(polling)'}
            </p>
          </div>

          {/* Info text */}
          <p className="text-xs text-muted-foreground text-center pt-2 border-t">
            Real-time visitor signal
            {isPaused && ' • Updates paused'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
