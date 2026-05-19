import { useTranslation } from 'react-i18next';
import { Switch } from '@/shared/ui/shadcn/components/ui/switch';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import { motion } from 'framer-motion';
import { useDateRange } from '../../../shared/hooks/useDateRange';
import { RangePicker } from '../../../shared/components/RangePicker';
import { MrrCard } from '../widgets/MrrCard';
import { ActiveCustomersCard } from '../widgets/ActiveCustomersCard';
import { ChurnCard } from '../widgets/ChurnCard';
import { NpsCard } from '../widgets/NpsCard';
import { RevenueVsTargetCard } from '../widgets/RevenueVsTargetCard';
import { TopProductsTable } from '../widgets/TopProductsTable';
import { MrrMovementsCard } from '../widgets/MrrMovementsCard';
import { CustomerRetentionCard } from '../widgets/CustomerRetentionCard';
import { ExecutiveSummaryCard } from '../widgets/ExecutiveSummaryCard';
import { RisksAndOpportunitiesCard } from '../widgets/RisksAndOpportunitiesCard';
import PageHeader from '@/shared/ui/components/PageHeader';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  },
};

import { DashboardBackground } from '../../../shared/components/DashboardBackground';

export function ExecutiveDashboardPage() {
  const { t } = useTranslation('dashboards');
  const { range, compare, setPreset, setRange, setCompare } = useDateRange();

  return (
    <div className="relative flex flex-col gap-6">
      <DashboardBackground variant="executive" />

      {/* Header */}
      <PageHeader
        title={t('executive.title')}
        subtitle={t('executive.subtitle')}
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

      {/* Executive Summary - NEW */}
      <ExecutiveSummaryCard range={range} compare={compare} />

      {/* Dashboard Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4 lg:grid-cols-12"
      >
        {/* Row 1: KPI Rail (4 cards) */}
        <motion.div variants={itemVariants} className="lg:col-span-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="h-full">
              <MrrCard range={range} compare={compare} />
            </div>
            <div className="h-full">
              <ActiveCustomersCard range={range} compare={compare} />
            </div>
            <div className="h-full">
              <ChurnCard range={range} compare={compare} />
            </div>
            <div className="h-full">
              <NpsCard range={range} />
            </div>
          </div>
        </motion.div>

        {/* Row 2: MRR Movements (cols 1-4) + Revenue vs Target (cols 5-12) */}
        <motion.div variants={itemVariants} className="lg:col-span-6 xl:col-span-4">
          <MrrMovementsCard range={range} compare={compare} />
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-6 xl:col-span-8">
          <RevenueVsTargetCard range={range} compare={compare} />
        </motion.div>

        {/* Row 3: Top Products (cols 1-8) + Customer Retention (cols 9-12) */}
        <motion.div variants={itemVariants} className="lg:col-span-6 xl:col-span-8">
          <TopProductsTable range={range} />
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-6 xl:col-span-4">
          <CustomerRetentionCard range={range} compare={compare} />
        </motion.div>

        {/* Row 4: Risks & Opportunities Panel - NEW */}
        <motion.div variants={itemVariants} className="lg:col-span-12">
          <RisksAndOpportunitiesCard range={range} compare={compare} />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default ExecutiveDashboardPage;

