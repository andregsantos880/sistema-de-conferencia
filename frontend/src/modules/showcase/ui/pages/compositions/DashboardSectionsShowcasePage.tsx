import React from 'react';
import { Users, DollarSign, ShoppingCart, Activity, ArrowRight, CheckCircle2, Clock3, Package, RefreshCcw } from 'lucide-react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/ui/shadcn/components/ui/chart';
import { MetricCard } from '@/shared/ui/components/metrics/MetricCard';
import { Timeline, type TimelineItemData } from '@/shared/ui/components/Timeline';

const chartConfig = {
  value: {
    label: 'Revenue',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

// Sample data
const chartData = [
  { name: 'Mon', value: 2400 },
  { name: 'Tue', value: 1398 },
  { name: 'Wed', value: 9800 },
  { name: 'Thu', value: 3908 },
  { name: 'Fri', value: 4800 },
  { name: 'Sat', value: 3800 },
  { name: 'Sun', value: 4300 },
];

const stats = [
  { label: 'Total Revenue', value: '$45,231', change: '+12.5%', positive: true, icon: DollarSign, subtitle: 'vs last month' },
  { label: 'Active Users', value: '2,350', change: '+8.2%', positive: true, icon: Users, subtitle: '7d active' },
  { label: 'Orders', value: '1,247', change: '-3.1%', positive: false, icon: ShoppingCart, subtitle: 'completed' },
  { label: 'Conversion', value: '3.24%', change: '+0.8%', positive: true, icon: Activity, subtitle: 'storefront' },
];

const timelineItems: TimelineItemData[] = [
  {
    id: '1',
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    title: 'Payment received',
    subtitle: 'Jane Smith • $89.50',
    trailing: <span className="text-xs text-muted-foreground">2m ago</span>,
    iconContainerClassName: 'bg-emerald-50 text-emerald-600',
    lineClassName: 'bg-emerald-100',
  },
  {
    id: '2',
    icon: <Package className="h-4 w-4 text-blue-500" />,
    title: 'Order shipped',
    subtitle: 'Order #8421 • Alice Brown',
    trailing: <span className="text-xs text-muted-foreground">45m ago</span>,
    iconContainerClassName: 'bg-blue-50 text-blue-600',
    lineClassName: 'bg-blue-100',
  },
  {
    id: '3',
    icon: <RefreshCcw className="h-4 w-4 text-amber-500" />,
    title: 'Refund processed',
    subtitle: 'Charlie Lee • -$45.00',
    trailing: <span className="text-xs text-muted-foreground">1h ago</span>,
    iconContainerClassName: 'bg-amber-50 text-amber-600',
    lineClassName: 'bg-amber-100',
  },
  {
    id: '4',
    icon: <Clock3 className="h-4 w-4 text-purple-500" />,
    title: 'New customer registered',
    subtitle: 'Bob Wilson',
    trailing: <span className="text-xs text-muted-foreground">2h ago</span>,
    iconContainerClassName: 'bg-purple-50 text-purple-600',
    lineClassName: 'bg-purple-100',
  },
];

const DashboardSectionsShowcasePage: React.FC = () => {
  return (
    <ShowcasePage
      title="Dashboard Sections"
      description="Demonstrate how stat cards, charts, and activity lists combine into dashboard slices."
    >
      <ShowcaseSection
        title="Complete Dashboard Slice"
        description="A realistic dashboard section with KPI cards, chart, and activity feed."
      >
        <CodeExample
          id="compositions"
          title="Stats + Chart + Activity"
          code={`const chartConfig = {
  value: { label: 'Revenue', color: 'var(--chart-1)' },
} satisfies ChartConfig;

{/* Stat Cards Row */}
<div className="grid grid-cols-4 gap-4">
  {stats.map((stat) => (
    <MetricCard
      key={stat.label}
      title={stat.label}
      value={stat.value}
      subtitle={stat.subtitle}
      icon={stat.icon}
      variant={stat.positive ? 'success' : 'danger'}
      appearance="soft"
      trend={{ value: Number(stat.change.replace('%', '')), direction: stat.positive ? 'up' : 'down', label: 'vs last month' }}
    />
  ))}
</div>

{/* Chart + Activity Row */}
<div className="grid grid-cols-3 gap-4 mt-4">
  {/* Chart Card */}
  <Card className="col-span-2">
    <CardHeader>
      <CardTitle>Weekly Overview</CardTitle>
    </CardHeader>
    <CardContent>
      <ChartContainer config={chartConfig} className="h-[280px] w-full">
        <AreaChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={10} />
          <YAxis axisLine={false} tickLine={false} tickMargin={10} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area type="monotone" dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.2} />
        </AreaChart>
      </ChartContainer>
    </CardContent>
  </Card>
  
  {/* Activity Card */}
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>Recent Activity</CardTitle>
      <Button variant="ghost" size="sm">View all</Button>
    </CardHeader>
    <CardContent className="pt-0">
      <Timeline items={timelineItems} />
    </CardContent>
  </Card>
</div>`}
        >
          <div className="space-y-4">
            {/* Stat Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <MetricCard
                  key={stat.label}
                  title={stat.label}
                  value={stat.value}
                  subtitle={stat.subtitle}
                  icon={stat.icon}
                  variant={stat.positive ? 'success' : 'danger'}
                  appearance="soft"
                  trend={{
                    value: Number(stat.change.replace('%', '')),
                    direction: stat.positive ? 'up' : 'down',
                    label: 'vs last month',
                  }}
                />
              ))}
            </div>

            {/* Chart + Activity Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Chart Card */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Weekly Overview</CardTitle>
                  <p className="text-sm text-muted-foreground">Revenue performance this week</p>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[280px] w-full">
                    <AreaChart accessibilityLayer data={chartData}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={10} />
                      <YAxis axisLine={false} tickLine={false} tickMargin={10} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="var(--color-value)"
                        fill="var(--color-value)"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Activity Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base">Recent Activity</CardTitle>
                  <Button variant="ghost" size="sm" className="h-8 text-xs">
                    View all <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Timeline items={timelineItems} className="px-4 py-2" gap="md" />
                </CardContent>
              </Card>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Compact Stats Section"
        description="A more compact stats layout for secondary dashboard areas."
      >
        <CodeExample
          id="compositions"
          title="Compact Stats Row"
          code={`<Card>
  <CardContent className="p-4">
    <div className="grid grid-cols-4 divide-x">
      {stats.map((stat) => (
        <div key={stat.label} className="px-4 first:pl-0 last:pr-0">
          <p className="text-xs text-muted-foreground">{stat.label}</p>
          <p className="text-lg font-bold">{stat.value}</p>
          <Badge variant={stat.positive ? 'default' : 'destructive'}>{stat.change}</Badge>
        </div>
      ))}
    </div>
  </CardContent>
</Card>`}
        >
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 md:divide-x">
                {stats.map((stat) => (
                  <div key={stat.label} className="md:px-4 md:first:pl-0 md:last:pr-0">
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-lg font-bold">{stat.value}</p>
                      <Badge 
                        variant={stat.positive ? 'default' : 'secondary'}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {stat.change}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default DashboardSectionsShowcasePage;
