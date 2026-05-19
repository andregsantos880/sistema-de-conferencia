import React, { useState } from 'react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/shared/ui/shadcn/components/ui/chart';

// Chart configs for Shadcn ChartContainer
const revenueChartConfig = {
  revenue: {
    label: 'Revenue ($)',
    color: '#8884d8',
  },
  orders: {
    label: 'Orders',
    color: '#82ca9d',
  },
  customers: {
    label: 'Customers',
    color: '#ffc658',
  },
} satisfies ChartConfig;

const trafficChartConfig = {
  visitors: {
    label: 'Visitors',
    color: '#8884d8',
  },
  pageViews: {
    label: 'Page Views',
    color: '#82ca9d',
  },
  bounceRate: {
    label: 'Bounce Rate (%)',
    color: '#ff7300',
  },
} satisfies ChartConfig;

// Sample chart data
const revenueData = [
  { month: 'Jan', revenue: 4000, orders: 240, customers: 180 },
  { month: 'Feb', revenue: 3000, orders: 198, customers: 150 },
  { month: 'Mar', revenue: 5000, orders: 300, customers: 220 },
  { month: 'Apr', revenue: 4500, orders: 278, customers: 200 },
  { month: 'May', revenue: 6000, orders: 350, customers: 280 },
  { month: 'Jun', revenue: 5500, orders: 320, customers: 250 },
  { month: 'Jul', revenue: 7000, orders: 400, customers: 320 },
  { month: 'Aug', revenue: 6500, orders: 380, customers: 300 },
];

const trafficData = [
  { month: 'Jan', visitors: 12000, pageViews: 45000, bounceRate: 42 },
  { month: 'Feb', visitors: 15000, pageViews: 52000, bounceRate: 38 },
  { month: 'Mar', visitors: 18000, pageViews: 68000, bounceRate: 35 },
  { month: 'Apr', visitors: 16000, pageViews: 58000, bounceRate: 40 },
  { month: 'May', visitors: 21000, pageViews: 78000, bounceRate: 32 },
  { month: 'Jun', visitors: 24000, pageViews: 92000, bounceRate: 30 },
];

const CardsChartsShowcasePage: React.FC = () => {
  const [revenueMetric, setRevenueMetric] = useState<'revenue' | 'orders' | 'customers'>('revenue');
  const [trafficMetric, setTrafficMetric] = useState<'visitors' | 'pageViews' | 'bounceRate'>('visitors');
  const [dateRange, setDateRange] = useState('6m');

  const metricLabels = {
    revenue: 'Revenue ($)',
    orders: 'Orders',
    customers: 'Customers',
    visitors: 'Visitors',
    pageViews: 'Page Views',
    bounceRate: 'Bounce Rate (%)',
  };

  return (
    <ShowcasePage
      title="Cards + Charts"
      description="Demonstrate how cards, charts, and controls combine into interactive data visualizations."
    >
      <ShowcaseSection
        title="Revenue Analytics Card"
        description="Card with embedded line chart and metric selector controls."
      >
        <CodeExample
          id="compositions"
          title="Card + Line Chart + Controls"
          code={`const chartConfig = {
  revenue: { label: 'Revenue ($)', color: '#8884d8' },
  orders: { label: 'Orders', color: '#82ca9d' },
  customers: { label: 'Customers', color: '#ffc658' },
} satisfies ChartConfig;

<Card>
  <CardHeader className="flex flex-row items-center justify-between">
    <CardTitle>Revenue Analytics</CardTitle>
    <Select value={metric} onValueChange={setMetric}>...</Select>
  </CardHeader>
  <CardContent>
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <LineChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={10} />
        <YAxis axisLine={false} tickLine={false} tickMargin={10} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          type="monotone"
          dataKey={metric}
          stroke={\`var(--color-\${metric})\`}
          strokeWidth={2}
        />
      </LineChart>
    </ChartContainer>
  </CardContent>
</Card>`}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">Revenue Analytics</CardTitle>
              <div className="flex gap-2">
                <Select value={revenueMetric} onValueChange={(v) => setRevenueMetric(v as typeof revenueMetric)}>
                  <SelectTrigger className="w-[140px] h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="orders">Orders</SelectItem>
                    <SelectItem value="customers">Customers</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-[100px] h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3m">3 months</SelectItem>
                    <SelectItem value="6m">6 months</SelectItem>
                    <SelectItem value="1y">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-4">
                {revenueMetric === 'revenue' && '$32,500'}
                {revenueMetric === 'orders' && '2,466'}
                {revenueMetric === 'customers' && '1,900'}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  total {metricLabels[revenueMetric].toLowerCase()}
                </span>
              </div>
              <ChartContainer config={revenueChartConfig} className="h-[280px] w-full">
                <LineChart accessibilityLayer data={revenueData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={10} />
                  <YAxis axisLine={false} tickLine={false} tickMargin={10} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey={revenueMetric}
                    stroke={`var(--color-${revenueMetric})`}
                    strokeWidth={2}
                    dot={{ fill: `var(--color-${revenueMetric})`, strokeWidth: 2 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Traffic Overview Card"
        description="Card with area chart showing website traffic metrics."
      >
        <CodeExample
          id="compositions"
          title="Card + Area Chart + Controls"
          code={`const chartConfig = {
  visitors: { label: 'Visitors', color: '#8884d8' },
  pageViews: { label: 'Page Views', color: '#82ca9d' },
  bounceRate: { label: 'Bounce Rate (%)', color: '#ff7300' },
} satisfies ChartConfig;

<Card>
  <CardHeader>
    <CardTitle>Traffic Overview</CardTitle>
    <Select value={metric} onValueChange={setMetric}>...</Select>
  </CardHeader>
  <CardContent>
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <AreaChart accessibilityLayer data={trafficData}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={10} />
        <YAxis axisLine={false} tickLine={false} tickMargin={10} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          type="monotone"
          dataKey={metric}
          stroke={\`var(--color-\${metric})\`}
          fill={\`var(--color-\${metric})\`}
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  </CardContent>
</Card>`}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">Traffic Overview</CardTitle>
              <Select value={trafficMetric} onValueChange={(v) => setTrafficMetric(v as typeof trafficMetric)}>
                <SelectTrigger className="w-[140px] h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visitors">Visitors</SelectItem>
                  <SelectItem value="pageViews">Page Views</SelectItem>
                  <SelectItem value="bounceRate">Bounce Rate</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-4">
                {trafficMetric === 'visitors' && '106,000'}
                {trafficMetric === 'pageViews' && '393,000'}
                {trafficMetric === 'bounceRate' && '36.2%'}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  {trafficMetric === 'bounceRate' ? 'average' : 'total'} {metricLabels[trafficMetric].toLowerCase()}
                </span>
              </div>
              <ChartContainer config={trafficChartConfig} className="h-[280px] w-full">
                <AreaChart accessibilityLayer data={trafficData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={10} />
                  <YAxis axisLine={false} tickLine={false} tickMargin={10} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey={trafficMetric}
                    stroke={`var(--color-${trafficMetric})`}
                    fill={`var(--color-${trafficMetric})`}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Comparison Chart Card"
        description="Card with bar chart comparing multiple metrics side by side."
      >
        <CodeExample
          id="compositions"
          title="Card + Bar Chart + Legend"
          code={`const chartConfig = {
  revenue: { label: 'Revenue ($)', color: '#8884d8' },
  orders: { label: 'Orders', color: '#82ca9d' },
} satisfies ChartConfig;

<Card>
  <CardHeader>
    <CardTitle>Monthly Comparison</CardTitle>
  </CardHeader>
  <CardContent>
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={10} />
        <YAxis axisLine={false} tickLine={false} tickMargin={10} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="orders" fill="var(--color-orders)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  </CardContent>
</Card>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Monthly Comparison</CardTitle>
              <p className="text-sm text-muted-foreground">Revenue vs Orders over time</p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={revenueChartConfig} className="h-[300px] w-full">
                <BarChart accessibilityLayer data={revenueData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tickMargin={10} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tickMargin={10} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar yAxisId="left" dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="orders" fill="var(--color-orders)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default CardsChartsShowcasePage;
