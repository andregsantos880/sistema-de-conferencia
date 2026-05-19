import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useDateRange } from '../../../shared/hooks/useDateRange';
import { RangePicker } from '../../../shared/components/RangePicker';
import { DashboardBackground } from '../../../shared/components/DashboardBackground';
import { Switch } from '@/shared/ui/shadcn/components/ui/switch';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import { InteractionContextBar } from '../../../shared/components/InteractionContextBar';
import { useFilterEngine } from '@/shared/hooks/useFilterEngine';
import { dashboardFilterDefinitions } from '../../application/hooks/useDashboardFilters';

import PageHeader from '@/shared/ui/components/PageHeader';
import { EcomKpiRail } from '../widgets/EcomKpiRail';
import { RevenueOverviewCard } from '../widgets/RevenueOverviewCard';
import { ChannelBreakdownCard } from '../widgets/ChannelBreakdownCard';
import { TopProductsCard } from '../widgets/TopProductsCard';
import { FunnelCard } from '../widgets/FunnelCard';
import { RealtimeOrdersCard } from '../widgets/RealtimeOrdersCard';
import { LiveVisitorsBadge } from '../widgets/LiveVisitorsBadge';
import { RealtimeDevSettings } from '@/shared/ui/components/realtime';


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
} as const;

export default function EcommerceDashboardPage() {
  const { t } = useTranslation('dashboards');
  const { range, compare, setPreset, setRange, setCompare } = useDateRange();
  
  // Global filter state
  const filters = useFilterEngine(dashboardFilterDefinitions);

  return (
    <div className="relative flex flex-col gap-6">
      <DashboardBackground variant="ecommerce" />

      {/* Header */}
      <PageHeader
        title={t('ecommerce.title')}
        subtitle={t('ecommerce.subtitle')}
        actions={[
          <RealtimeDevSettings />,
          <div className="flex items-center gap-2">
            <Switch id="compare-mode" checked={compare} onCheckedChange={setCompare} />
            <Label htmlFor="compare-mode" className="cursor-pointer">
              {t('common.compare')}
            </Label>
          </div>,
          <RangePicker range={range} onRangeChange={setRange} onPresetChange={setPreset} />
        ]}
      />

      {/* Unified Interaction Context Bar (Filters only for E-commerce, no focus states yet) */}
      {filters.hasActive && (
        <div className="sticky top-20 z-30 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-auto"
          >
            <InteractionContextBar
              filterEntries={filters.activeEntries}
              onClearFilters={filters.resetAll}
            />
          </motion.div>
        </div>
      )}

      {/* KPI Rail */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants}>
          <EcomKpiRail range={range} compare={compare} filters={filters.values} />
        </motion.div>
      </motion.div>

      {/* Main Widgets Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-12"
      >
        {/* Row 1: Funnel (4 cols) | Revenue (8 cols) */}
        <motion.div variants={itemVariants} className="lg:col-span-4">
          <FunnelCard 
            range={range}
            selectedStage={filters.values.funnelStage}
            onStageSelect={(stage) => {
              filters.set('funnelStage', stage);
            }}
            filters={filters.values}
          />
        </motion.div>
        <motion.div variants={itemVariants} className="lg:col-span-8">
          <RevenueOverviewCard range={range} compare={compare} filters={filters.values} />
        </motion.div>

        {/* Row 2: Live Data - HIGHLIGHTED */}
        <motion.div 
          variants={itemVariants} 
          className="lg:col-span-12 relative rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-primary/5 px-1.5 py-2 ring-1 ring-primary/10"
        >
          <div className="absolute inset-0 bg-dotted-pattern opacity-5 pointer-events-none" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 relative">
            <div className="lg:col-span-8 h-full">
              <RealtimeOrdersCard />
            </div>
            <div className="lg:col-span-4 h-full">
              <LiveVisitorsBadge />
            </div>
          </div>
        </motion.div>

        {/* Row 3: Top Products (8 cols) | Channels (4 cols) */}
        <motion.div variants={itemVariants} className="lg:col-span-8">
          <TopProductsCard 
            range={range}
            selectedProductId={filters.values.productId}
            onProductSelect={(productId) => {
              filters.set('productId', productId);
            }}
            filters={filters.values}
          />
        </motion.div>
        <motion.div variants={itemVariants} className="lg:col-span-4">
          <ChannelBreakdownCard 
            range={range}
            selectedChannel={filters.values.channel === 'all' ? null : filters.values.channel}
            onChannelSelect={(channel) => {
              filters.set('channel', channel || 'all');
            }}
            filters={filters.values}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
