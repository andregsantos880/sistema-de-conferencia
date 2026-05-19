import { Card, CardContent, CardHeader } from '@/shared/ui/shadcn/components/ui/card';
import { WidgetHeader } from '../../../shared/components/WidgetHeader';
import { useRealtimeOrders } from '../../application/hooks/useRealtimeData';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../../shared/utils/formatters';
import { cn } from '@/shadcn/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Activity, Globe, ShoppingCart, Wifi, Radio } from 'lucide-react';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import SimpleBar from 'simplebar-react';

// Country flag emoji helper
function getCountryFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Channel badge colors
const CHANNEL_COLORS: Record<string, string> = {
  Web: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Mobile: 'bg-green-500/10 text-green-600 dark:text-green-400',
  Marketplace: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  POS: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
};

import { LivePauseButton } from '../../../shared/components/LivePauseButton';

import { useState } from 'react';
import type { RealtimeOrder } from '../../domain/models/EcommerceAnalytics';
import { LiveOrderDetailsPanel } from './LiveOrderDetailsPanel';

export function RealtimeOrdersCard() {
  const { t } = useTranslation('dashboards');
  
  // Use the E-commerce Realtime Orders hook with shared primitives
  const { orders, refetch, mode, isConnected, isPaused, togglePause } = useRealtimeOrders();
  const prefersReducedMotion = useReducedMotion();
  const [selectedOrder, setSelectedOrder] = useState<RealtimeOrder | null>(null);

  const ModeIcon = mode === 'websocket' ? Wifi : Radio;

  //console.log(" -- ORDERS", orders);
  return (
    <>
    <Card className="h-full">
      <CardHeader className="pb-2">
        <WidgetHeader
          title={t('ecommerce.widgets.realtimeOrders')}
          onRefresh={mode === 'websocket' ? undefined : refetch}
          actions={
            <div className="flex items-center gap-3">
              <LivePauseButton isPaused={isPaused} onToggle={togglePause} />
              
              {/* Mode indicator */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ModeIcon className="h-3 w-3" />
                <span className="hidden sm:inline">{mode === 'websocket' ? 'WS' : 'Poll'}</span>
              </div>
              {/* Connection status */}
              <div className="flex items-center gap-1">
                <span className={cn(
                  'relative flex h-2 w-2',
                  !isConnected && 'opacity-50'
                )}>
                  <span className={cn(
                    'absolute inline-flex h-full w-full rounded-full opacity-75',
                    isConnected ? 'animate-ping bg-green-400' : 'bg-yellow-400'
                  )} />
                  <span className={cn(
                    'relative inline-flex h-2 w-2 rounded-full',
                    isConnected ? 'bg-green-500' : 'bg-yellow-500'
                  )} />
                </span>
                <span className="text-xs text-muted-foreground">
                  {isConnected ? 'Live' : 'Connecting...'}
                </span>
              </div>
            </div>
          }
        />
      </CardHeader>
      <CardContent>
        <SimpleBar className="max-h-[350px]">
          <div className="space-y-2 pr-1">
          <AnimatePresence mode="popLayout" initial={false}>
            {orders.map((order) => {
              return (
                <motion.div
                  key={order.id}
                  layout={!prefersReducedMotion}
                  initial={prefersReducedMotion ? false : { opacity: 0, x: -20, scale: 0.95, backgroundColor: "rgba(59, 130, 246, 0.15)" }}
                  animate={{ opacity: 1, x: 0, scale: 1, backgroundColor: "rgba(0,0,0,0)" }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, x: 20, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  onClick={() => setSelectedOrder(order)}
                  className={cn(
                    'flex flex--col flex-wrap items-center justify-between rounded-lg border p-3 transition-colors',
                    'cursor-pointer hover:bg-muted/50 hover:border-primary/20'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <div>
                      <div className="flex flex-col md:flex-row items-start md:items-center md:gap-2">
                        <span className="font-mono text-sm font-medium">{order.id}</span>
                        <Badge
                          variant="secondary"
                          className={cn('text-xs', CHANNEL_COLORS[order.channel])}
                        >
                          {order.channel}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="text-lg leading-none">
                          {getCountryFlag(order.countryCode)}
                        </span>
                        <span className="hidden md:inline">{order.country}</span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(order.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right ml-auto">
                    <span className="font-mono text-lg font-bold">
                      {formatCurrency(order.amount, 'USD')}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          </div>

          {orders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mb-2" />
              <span className="text-sm">Waiting for orders...</span>
            </div>
          )}
        </SimpleBar>

        {/* Summary footer */}
        <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span>Showing last {orders.length} orders</span>
          </div>
          <span className="text-sm font-medium">
            Total: {formatCurrency(orders.reduce((sum, o) => sum + o.amount, 0), 'USD', true)}
          </span>
        </div>
      </CardContent>
    </Card>

    <LiveOrderDetailsPanel
      order={selectedOrder}
      isOpen={selectedOrder !== null}
      onClose={() => setSelectedOrder(null)}
    />
    </>
  );
}
