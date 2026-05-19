import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useDateRange } from '../../../shared/hooks/useDateRange';
import { RangePicker } from '../../../shared/components/RangePicker';
import { Switch } from '@/shared/ui/shadcn/components/ui/switch';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import { useFilterEngine } from '@/shared/hooks/useFilterEngine';
import { useFocus } from '@/shared/hooks/useFocus';
import { 
  salesDashboardFilterDefinitions, 
  type SalesDashboardFocus 
} from '../../application/hooks/useSalesDashboardFilters';
import { InteractionContextBar } from '../../../shared/components/InteractionContextBar';
import { PipelineFunnel } from '../widgets/PipelineFunnel';
import { ForecastVsQuota } from '../widgets/ForecastVsQuota';
import { WinRateTrend } from '../widgets/WinRateTrend';
import { AvgDealSizeTrend } from '../widgets/AvgDealSizeTrend';
import { SalesCycleTrend } from '../widgets/SalesCycleTrend';
import { RepLeaderboard } from '../widgets/RepLeaderboard';
import { ActivitiesHeatmap } from '../widgets/ActivitiesHeatmap';
import { SalesByLocationCard } from '../widgets/SalesByLocationCard';
import { OpportunitiesAtRisk } from '../widgets/OpportunitiesAtRisk';
import { TopAccountsTable } from '../widgets/TopAccountsTable';
import { SalesKpiRail } from '../widgets/SalesKpiRail';
import PageHeader from '@/shared/ui/components/PageHeader';
import { DashboardBackground } from '../../../shared/components/DashboardBackground';

const containerVariants = { 
  hidden: { opacity: 0 }, 
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } } 
} as const;

const itemVariants = { 
  hidden: { opacity: 0, y: 20 }, 
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } 
} as const;

export default function SalesDashboardPage() {
  const { t } = useTranslation('dashboards');
  const { range, compare, setPreset, setRange, setCompare } = useDateRange();
  
  // ─────────────────────────────────────────────────────────────────────────────
  // FILTERS: Define the universe of data (triggers refetches)
  // ─────────────────────────────────────────────────────────────────────────────
  const filters = useFilterEngine(salesDashboardFilterDefinitions);

  // ─────────────────────────────────────────────────────────────────────────────
  // FOCUS: Explore within the dataset (UI-only, no refetches)
  // ─────────────────────────────────────────────────────────────────────────────
  const { focus, setFocus, clearFocus, hasFocus } = useFocus<SalesDashboardFocus>();

  // Build focus entries for InteractionContextBar
  const focusEntries = [
    {
      key: 'stage',
      label: 'Stage',
      value: focus.stage,
      onRemove: () => setFocus({ stage: null }),
    },
    {
      key: 'opportunityId',
      label: 'Opportunity',
      value: focus.opportunityId,
      onRemove: () => setFocus({ opportunityId: null }),
    },
    {
      key: 'accountId',
      label: 'Account',
      value: focus.accountId,
      onRemove: () => setFocus({ accountId: null }),
    },
    {
      key: 'country',
      label: 'Country',
      value: focus.country,
      onRemove: () => setFocus({ country: null }),
    },
  ];

  return (
    <div className="relative flex flex-col gap-6">
      <DashboardBackground variant="sales" />

      {/* Header */}
      <PageHeader
        title={t('sales.title')}
        subtitle="Pipeline health, forecast, rep performance, and activity patterns"
        actions={
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch id="compare-mode" checked={compare} onCheckedChange={setCompare} />
              <Label htmlFor="compare-mode" className="cursor-pointer">{t('common.compare')}</Label>
            </div>
            <RangePicker range={range} onRangeChange={setRange} onPresetChange={setPreset} />
          </div>
        }
      />

      {/* Unified Interaction Context Bar (Filters + Focus) */}
      {(filters.hasActive || hasFocus) && (
        <div className="sticky top-20 z-30 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-auto"
          >
            <InteractionContextBar
              filterEntries={filters.activeEntries}
              focusEntries={focusEntries}
              onClearFilters={filters.resetAll}
              onClearFocus={clearFocus}
            />
          </motion.div>
        </div>
      )}

      {/* KPI Rail - Reacts to FILTERS only, NOT focus */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 gap-4">
        <motion.div variants={itemVariants}>
          <SalesKpiRail range={range} filters={filters.values} compare={compare} />
        </motion.div>
      </motion.div>

      {/* Widgets Grid */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-12">
        {/* Pipeline Funnel - Stage click sets FOCUS (not filter) */}
        <motion.div variants={itemVariants} className="lg:col-span-4">
          <PipelineFunnel 
            range={range} 
            filters={filters.values}
            selectedStage={focus.stage}
            onStageClick={(stage) => setFocus({ stage })}
          />
        </motion.div>
        <motion.div variants={itemVariants} className="lg:col-span-8">
          <ForecastVsQuota range={range} filters={filters.values} />
        </motion.div>

        {/* Opportunities At Risk - Reacts to focus.stage (client-side filtering) */}
        <motion.div variants={itemVariants} className="lg:col-span-12">
          <OpportunitiesAtRisk 
            range={range} 
            filters={filters.values} 
            focusStage={focus.stage}
            // focusOpportunityId={focus.opportunityId}
            // onOpportunityFocus={(id) => setFocus({ opportunityId: id })}
          />
        </motion.div>

        {/* Win Rate + Avg Deal Size - React to FILTERS only */}
        <motion.div variants={itemVariants} className="lg:col-span-6">
          <WinRateTrend range={range} filters={filters.values} compare={compare} />
        </motion.div>
        <motion.div variants={itemVariants} className="lg:col-span-6">
          <AvgDealSizeTrend range={range} filters={filters.values} compare={compare} />
        </motion.div>

        {/* Sales Cycle - Reacts to FILTERS only */}
        <motion.div variants={itemVariants} className="lg:col-span-12">
          <SalesCycleTrend range={range} filters={filters.values} compare={compare} />
        </motion.div>

        {/* Activities Heatmap + Rep Leaderboard */}
        <motion.div variants={itemVariants} className="lg:col-span-7">
          <ActivitiesHeatmap range={range} filters={filters.values} />
        </motion.div>
        {/* Rep Leaderboard - Click FILTERS the dashboard (intentional refetch) */}
        <motion.div variants={itemVariants} className="lg:col-span-5">
          <RepLeaderboard 
            range={range} 
            filters={filters.values}
            selectedRepId={filters.values.owner}
            onRepSelect={(rep) => filters.set('owner', rep)}
          />
        </motion.div>

        {/* Top Accounts - Inspect-only (row focus + expansion, no cross-widget effects) */}
        <motion.div variants={itemVariants} className="lg:col-span-6">
          <TopAccountsTable 
            range={range} 
            filters={filters.values}
          />
        </motion.div>
        {/* Sales by Location - Diagnostic (local focus only, no cross-widget effects) */}
        <motion.div variants={itemVariants} className="lg:col-span-6">
          <SalesByLocationCard 
            range={range} 
            filters={filters.values}
            focusCountry={focus.country}
            onCountryFocus={(country) => setFocus({ country })}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
