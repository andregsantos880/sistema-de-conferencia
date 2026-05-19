import React from 'react';
import { TrendingUp, Users, DollarSign, ShoppingCart, Activity, Target, BarChart3, Zap, Building2, Package } from 'lucide-react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { StatCard } from '@/shared/ui/components/metrics/StatCard';
import { MetricCard } from '@/shared/ui/components/metrics/MetricCard';

const StatCardsShowcasePage: React.FC = () => {
  return (
    <ShowcasePage
      title="Metric & Stat Cards"
      description="Versatile cards for displaying key metrics, statistics, and KPIs with multiple layouts and appearances."
    >
      {/* ================================================================== */}
      {/* LAYOUT VARIANTS */}
      {/* ================================================================== */}
      
      <ShowcaseSection
        title="Layout Variants"
        description="MetricCard supports multiple layout structures for different use cases."
      >
        <CodeExample
          id="layout-compact"
          title="Compact Layout"
          code={`<MetricCard
  title="Active Users"
  value="1,234"
  icon={Users}
  layout="compact"
  trend={{ value: 12, direction: 'up' }}
/>`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Active Users"
              value="1,234"
              icon={Users}
              layout="compact"
              variant="primary"
            />
            <MetricCard
              title="Revenue"
              value="$45.2K"
              icon={DollarSign}
              layout="compact"
              variant="success"
              trend={{ value: 8.5, direction: 'up' }}
            />
            <MetricCard
              title="Orders"
              value="892"
              icon={ShoppingCart}
              layout="compact"
              variant="warning"
            />
            <MetricCard
              title="Bounce Rate"
              value="24%"
              icon={Activity}
              layout="compact"
              variant="danger"
              trend={{ value: 3.2, direction: 'down' }}
            />
          </div>
        </CodeExample>

        <CodeExample
          id="layout-standard"
          title="Standard Layout (Default)"
          code={`<MetricCard
  title="Total Revenue"
  value="$559.25K"
  subtitle="View net earnings"
  icon={DollarSign}
  variant="success"
  trend={{ value: 16.24, direction: 'up' }}
/>`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              title="Total Revenue"
              value="$559.25K"
              icon={DollarSign}
              variant="success"
              trend={{ value: 16.24, direction: 'up' }}
              actionLabel="View net earnings"
              onAction={() => {}}
            />
            <MetricCard
              title="Orders"
              value="36,894"
              icon={Package}
              variant="danger"
              trend={{ value: 3.57, direction: 'down' }}
              actionLabel="View all orders"
              onAction={() => {}}
            />
            <MetricCard
              title="Total Companies"
              value="5,468"
              icon={Building2}
              variant="primary"
              trend={{ value: 19.01, direction: 'up' }}
              chart={{ type: 'bar', data: [20, 35, 25, 45, 30, 55, 40] }}
            />
          </div>
        </CodeExample>

        <CodeExample
          id="layout-split"
          title="Split Layout"
          code={`<MetricCard
  title="Weekly Sales"
  value="$23,540"
  layout="split"
  icon={BarChart3}
  trend={{ value: 12.5, direction: 'up', label: 'vs last week' }}
  chart={{ type: 'area', data: [10, 25, 15, 30, 45, 35, 50] }}
/>`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MetricCard
              title="Weekly Sales"
              value="$23,540"
              subtitle="402 Transactions"
              layout="split"
              icon={BarChart3}
              variant="primary"
              trend={{ value: 12.5, direction: 'up', label: 'vs last week' }}
              chart={{ type: 'area', data: [10, 25, 15, 30, 45, 35, 50] }}
            />
            <MetricCard
              title="Portfolio Value"
              value="550.3K"
              subtitle="330 Finished Tasks"
              layout="split"
              icon={TrendingUp}
              variant="info"
              chart={{ type: 'line', data: [30, 45, 35, 60, 55, 70, 65] }}
            />
          </div>
        </CodeExample>

        <CodeExample
          id="layout-centered"
          title="Centered Layout"
          code={`<MetricCard
  title="Goal Progress"
  value="67%"
  layout="centered"
  icon={Target}
  progress={{ value: 67, max: 100, showLabel: true }}
/>`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              title="Total Sales"
              value="$210"
              subtitle="out of $390 projected"
              layout="centered"
              icon={DollarSign}
              variant="primary"
              trend={{ value: 28, direction: 'up', label: 'vs your best Saturday' }}
            />
            <MetricCard
              title="New Clients"
              value="237"
              layout="centered"
              icon={Users}
              variant="success"
              trend={{ value: 34, direction: 'up', label: 'vs last week' }}
              progress={{ value: 75, max: 100 }}
            />
            <MetricCard
              title="Goal Progress"
              value="67.5%"
              layout="centered"
              icon={Target}
              variant="warning"
              progress={{ value: 67.5, max: 100, showLabel: true }}
            />
          </div>
        </CodeExample>

        <CodeExample
          id="layout-inline"
          title="Inline Layout"
          code={`<MetricCard
  title="Active Sessions"
  value="1,234"
  layout="inline"
  icon={Activity}
  trend={{ value: 5.2, direction: 'up' }}
/>`}
        >
          <div className="space-y-2 max-w-md">
            <MetricCard
              title="Actives"
              value="$20,000"
              layout="inline"
              icon={Zap}
              variant="success"
            />
            <MetricCard
              title="Portfolio"
              value="$220,000"
              layout="inline"
              icon={BarChart3}
              variant="primary"
            />
            <MetricCard
              title="Market Price"
              value="$430,000"
              layout="inline"
              icon={TrendingUp}
              variant="info"
            />
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* ================================================================== */}
      {/* APPEARANCE VARIANTS */}
      {/* ================================================================== */}

      <ShowcaseSection
        title="Appearance Variants"
        description="Visual skins that can be applied to any layout."
      >
        <CodeExample
          id="appearance-soft"
          title="Soft Appearance (Default)"
          code={`<MetricCard
  title="Revenue"
  value="$45,678"
  icon={DollarSign}
  appearance="soft"
  variant="success"
/>`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="Default" value="1,234" icon={Users} appearance="soft" variant="default" />
            <MetricCard title="Primary" value="$45K" icon={DollarSign} appearance="soft" variant="primary" />
            <MetricCard title="Success" value="89%" icon={TrendingUp} appearance="soft" variant="success" />
            <MetricCard title="Warning" value="23" icon={Activity} appearance="soft" variant="warning" />
          </div>
        </CodeExample>

        <CodeExample
          id="appearance-solid"
          title="Solid Appearance"
          code={`<MetricCard
  title="Revenue"
  value="$45,678"
  icon={DollarSign}
  appearance="solid"
  variant="primary"
/>`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="Default" value="1,234" icon={Users} appearance="solid" variant="default" />
            <MetricCard title="Primary" value="$45K" icon={DollarSign} appearance="solid" variant="primary" />
            <MetricCard title="Success" value="89%" icon={TrendingUp} appearance="solid" variant="success" />
            <MetricCard title="Info" value="42" icon={Activity} appearance="solid" variant="info" />
          </div>
        </CodeExample>

        <CodeExample
          id="appearance-gradient"
          title="Gradient Appearance"
          code={`<MetricCard
  title="Revenue"
  value="$45,678"
  icon={DollarSign}
  appearance="gradient"
  variant="primary"
/>`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="Default" value="1,234" icon={Users} appearance="gradient" variant="default" />
            <MetricCard title="Primary" value="$45K" icon={DollarSign} appearance="gradient" variant="primary" />
            <MetricCard title="Success" value="89%" icon={TrendingUp} appearance="gradient" variant="success" />
            <MetricCard title="Danger" value="7" icon={Activity} appearance="gradient" variant="danger" />
          </div>
        </CodeExample>

        <CodeExample
          id="appearance-glass"
          title="Glass Appearance"
          code={`<MetricCard
  title="Revenue"
  value="$45,678"
  icon={DollarSign}
  appearance="glass"
  variant="primary"
/>`}
        >
          <div className="p-8 rounded-xl bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard title="Default" value="1,234" icon={Users} appearance="glass" variant="default" />
              <MetricCard title="Primary" value="$45K" icon={DollarSign} appearance="glass" variant="primary" />
              <MetricCard title="Success" value="89%" icon={TrendingUp} appearance="glass" variant="success" />
              <MetricCard title="Info" value="42" icon={Activity} appearance="glass" variant="info" />
            </div>
          </div>
        </CodeExample>

        <CodeExample
          id="appearance-dark"
          title="Dark Appearance"
          code={`<MetricCard
  title="Earned Today"
  value="$960"
  icon={DollarSign}
  appearance="dark"
  variant="primary"
  trend={{ value: 12, direction: 'up' }}
/>`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              title="Earned Today" 
              value="$960" 
              icon={DollarSign} 
              appearance="dark" 
              variant="primary"
              trend={{ value: 12, direction: 'up' }}
            />
            <MetricCard 
              title="Total Sales" 
              value="$210" 
              icon={ShoppingCart} 
              appearance="dark" 
              variant="info"
              subtitle="out of $390 projected"
            />
            <MetricCard 
              title="New Clients" 
              value="237" 
              icon={Users} 
              appearance="dark" 
              variant="success"
              trend={{ value: 34, direction: 'up' }}
            />
            <MetricCard 
              title="Activity" 
              value="-$2,019" 
              icon={Activity} 
              appearance="dark" 
              variant="danger"
              chart={{ type: 'bar', data: [30, 45, 25, 60, 35, 50, 40] }}
            />
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* ================================================================== */}
      {/* DATA ENHANCERS */}
      {/* ================================================================== */}

      <ShowcaseSection
        title="Data Enhancers"
        description="Optional data visualizations: trends, progress bars, and mini charts."
      >
        <CodeExample
          id="enhancer-trend"
          title="Trend Indicators"
          code={`<MetricCard
  title="Revenue"
  value="$45,678"
  icon={DollarSign}
  trend={{ value: 16.24, direction: 'up', label: 'vs last month' }}
/>`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              title="Revenue Growth"
              value="$45,678"
              icon={DollarSign}
              variant="success"
              trend={{ value: 16.24, direction: 'up', label: 'vs last month' }}
            />
            <MetricCard
              title="Churn Rate"
              value="2.4%"
              icon={Users}
              variant="danger"
              trend={{ value: 0.8, direction: 'down', label: 'vs last month' }}
            />
            <MetricCard
              title="Conversion"
              value="12.5%"
              icon={Target}
              variant="primary"
              trend={{ value: 3.2, direction: 'up' }}
            />
          </div>
        </CodeExample>

        <CodeExample
          id="enhancer-progress"
          title="Progress Indicators"
          code={`<MetricCard
  title="Storage Used"
  value="67%"
  layout="centered"
  progress={{ value: 67, max: 100, showLabel: true }}
/>`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              title="Storage Used"
              value="67%"
              icon={Activity}
              variant="warning"
              progress={{ value: 67, max: 100, showLabel: true }}
            />
            <MetricCard
              title="Goal Completion"
              value="$8,500"
              subtitle="of $10,000 target"
              icon={Target}
              variant="success"
              progress={{ value: 8500, max: 10000 }}
            />
            <MetricCard
              title="Tasks Done"
              value="42/50"
              icon={Zap}
              variant="primary"
              progress={{ value: 42, max: 50, showLabel: true }}
            />
          </div>
        </CodeExample>

        <CodeExample
          id="enhancer-charts"
          title="Mini Charts"
          code={`<MetricCard
  title="Weekly Trend"
  value="$23,540"
  chart={{ type: 'area', data: [10, 25, 15, 30, 45, 35, 50] }}
/>`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              title="Bar Chart"
              value="5,468"
              icon={Building2}
              variant="primary"
              trend={{ value: 19.01, direction: 'up' }}
              chart={{ type: 'bar', data: [20, 35, 25, 45, 30, 55, 40] }}
            />
            <MetricCard
              title="Line Chart"
              value="4,598"
              icon={Activity}
              variant="danger"
              trend={{ value: 12, direction: 'down' }}
              chart={{ type: 'line', data: [50, 40, 45, 35, 40, 30, 25] }}
            />
            <MetricCard
              title="Area Chart"
              value="$23,540"
              icon={TrendingUp}
              variant="success"
              trend={{ value: 12.5, direction: 'up' }}
              chart={{ type: 'area', data: [10, 25, 15, 30, 45, 35, 50] }}
            />
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* ================================================================== */}
      {/* COMBINED EXAMPLES */}
      {/* ================================================================== */}

      <ShowcaseSection
        title="Combined Examples"
        description="Real-world combinations of layouts, appearances, and enhancers."
      >
        <CodeExample
          id="combined-dashboard"
          title="Dashboard KPIs"
          code={`// Dark appearance with charts and trends
<MetricCard
  title="Earned Today"
  value="$960"
  subtitle="Projected: $1,290"
  layout="split"
  appearance="dark"
  variant="primary"
  chart={{ type: 'bar', data: [720, 850, 920, 780, 960] }}
/>`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MetricCard
              title="Earned Today"
              value="$960"
              subtitle="Projected: $1,290"
              layout="split"
              appearance="dark"
              variant="primary"
              chart={{ type: 'bar', data: [720, 850, 920, 780, 960] }}
            />
            <MetricCard
              title="Client Acquisition"
              value="237"
              subtitle="New Clients"
              layout="split"
              appearance="dark"
              variant="success"
              trend={{ value: 34, direction: 'up', label: 'vs last week' }}
              progress={{ value: 75, max: 100 }}
            />
          </div>
        </CodeExample>

        <CodeExample
          id="combined-glass"
          title="Glass Cards with Progress"
          code={`<MetricCard
  title="Goal Progress"
  value="67.5%"
  layout="centered"
  appearance="glass"
  variant="primary"
  progress={{ value: 67.5, max: 100, showLabel: true }}
/>`}
        >
          <div className="p-8 rounded-xl bg-gradient-to-br from-blue-600/30 via-purple-600/30 to-pink-600/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard
                title="Goal Progress"
                value="67.5%"
                layout="centered"
                appearance="glass"
                variant="primary"
                icon={Target}
                progress={{ value: 67.5, max: 100, showLabel: true }}
              />
              <MetricCard
                title="Leads"
                value="67.5%"
                layout="centered"
                appearance="glass"
                variant="success"
                icon={Users}
                trend={{ value: 12, direction: 'up' }}
              />
              <MetricCard
                title="Conversion"
                value="$23,540"
                layout="centered"
                appearance="glass"
                variant="info"
                icon={TrendingUp}
                trend={{ value: 12.5, direction: 'up' }}
              />
            </div>
          </div>
        </CodeExample>

        <CodeExample
          id="combined-gradient-split"
          title="Gradient Split with Charts"
          code={`<MetricCard
  title="Portfolio Value"
  value="550.3K"
  layout="split"
  appearance="gradient"
  variant="primary"
  chart={{ type: 'area', data: [30, 45, 35, 60, 55, 70, 65] }}
/>`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MetricCard
              title="Portfolio Value"
              value="550.3K"
              subtitle="330 Finished Tasks, 27 In Review"
              layout="split"
              appearance="gradient"
              variant="primary"
              icon={BarChart3}
              chart={{ type: 'area', data: [30, 45, 35, 60, 55, 70, 65] }}
            />
            <MetricCard
              title="Profit Margin"
              value="58.3%"
              subtitle="Feb Performance"
              layout="split"
              appearance="gradient"
              variant="success"
              icon={TrendingUp}
              trend={{ value: 8.2, direction: 'up', label: 'vs Jan' }}
              chart={{ type: 'line', data: [40, 52, 48, 55, 58] }}
            />
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* ================================================================== */}
      {/* STAT CARDS (COMPACT ALTERNATIVE) */}
      {/* ================================================================== */}

      <ShowcaseSection
        title="StatCard (Compact Alternative)"
        description="Simple, dense stat cards for quick KPI displays."
      >
        <CodeExample
          id="stat-cards"
          title="StatCard Variants"
          code={`<StatCard
  icon={<TrendingUp />}
  value="$12,345"
  label="Total Revenue"
  variant="success"
/>`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<TrendingUp />}
              value="$12,345"
              label="Total Revenue"
              variant="success"
            />
            <StatCard
              icon={<Users />}
              value="1,234"
              label="Active Users"
              variant="info"
            />
            <StatCard
              icon={<ShoppingCart />}
              value="89"
              label="Pending Orders"
              variant="warning"
            />
            <StatCard
              icon={<DollarSign />}
              value="23"
              label="Failed Transactions"
              variant="danger"
            />
          </div>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default StatCardsShowcasePage;

