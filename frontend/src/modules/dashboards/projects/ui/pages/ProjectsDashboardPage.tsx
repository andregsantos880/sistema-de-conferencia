import { useTranslation } from 'react-i18next';
import { Switch } from '@/shared/ui/shadcn/components/ui/switch';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import { motion } from 'framer-motion';
import { useDateRange } from '../../../shared/hooks/useDateRange';
import { RangePicker } from '../../../shared/components/RangePicker';
import { useProjectsFilters } from '../../application/hooks/useProjectsFilters';
import PageHeader from '@/shared/ui/components/PageHeader';

// Widgets
import { ProjectsKpiRail } from '../widgets/ProjectsKpiRail';
import { ProjectHealthOverview } from '../widgets/ProjectHealthOverview';
import { BurnChart } from '../widgets/BurnChart';
import { TeamUtilization } from '../widgets/TeamUtilization';
import { MemberWorkload } from '../widgets/MemberWorkload';
import { UpcomingMilestones } from '../widgets/UpcomingMilestones';
import { ProjectRisksTable } from '../widgets/ProjectRisksTable';
import { VelocityTrend } from '../widgets/VelocityTrend';
import { BudgetOverview } from '../widgets/BudgetOverview';

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

export function ProjectsDashboardPage() {
  const { t } = useTranslation('dashboards');
  const { range, compare, setPreset, setRange, setCompare } = useDateRange();
  const { filters } = useProjectsFilters();

  return (
    <div className="relative flex flex-col gap-6">
      <DashboardBackground variant="projects" />

      {/* Header */}
      <PageHeader
        title={t('projects.title')}
        subtitle={t('projects.subtitle')}
        actions={
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="compare-mode"
                checked={compare}
                onCheckedChange={setCompare}
              />
              <Label htmlFor="compare-mode" className="cursor-pointer">
                {t('common.compare')}
              </Label>
            </div>
            <RangePicker
              range={range}
              onRangeChange={setRange}
              onPresetChange={setPreset}
            />
          </div>
        }
      />

      {/* Dashboard Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6 lg:grid-cols-12"
      >
        {/* Row 1: KPI Rail (12 cols) */}
        <motion.div variants={itemVariants} className="lg:col-span-12">
          <ProjectsKpiRail range={range} compare={compare} filters={filters} />
        </motion.div>

        {/* Row 2: Burn Chart (8 cols) + Project Health (4 cols) */}
        <motion.div variants={itemVariants} className="lg:col-span-8">
          <BurnChart range={range} compare={compare} />
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-4">
          <ProjectHealthOverview range={range} filters={filters} />
        </motion.div>

        {/* Row 3: Team Utilization (4 cols) + Velocity (4 cols) + Budget (4 cols) */}
        <motion.div variants={itemVariants} className="lg:col-span-4">
          <TeamUtilization range={range} filters={filters} />
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-4">
          <VelocityTrend range={range} />
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-4">
          <BudgetOverview range={range} />
        </motion.div>

        {/* Row 4: Risks (6 cols) + Milestones (6 cols) */}
        <motion.div variants={itemVariants} className="lg:col-span-6">
          <ProjectRisksTable range={range} filters={filters} />
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-6">
          <UpcomingMilestones range={range} filters={filters} />
        </motion.div>

        {/* Row 5: Member Workload (full width on smaller screens, or as needed) */}
        <motion.div variants={itemVariants} className="lg:col-span-12">
          <MemberWorkload range={range} filters={filters} />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default ProjectsDashboardPage;
