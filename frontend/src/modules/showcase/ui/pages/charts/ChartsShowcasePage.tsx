import React from 'react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/shared/ui/shadcn/components/ui/chart';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadialBarChart,
  RadialBar,
  Legend,
} from 'recharts';

const lineChartData = [
  { month: 'Jan', users: 186 },
  { month: 'Feb', users: 305 },
  { month: 'Mar', users: 237 },
  { month: 'Apr', users: 473 },
  { month: 'May', users: 509 },
  { month: 'Jun', users: 614 },
];

const barChartData = [
  { product: 'Electronics', sales: 4000 },
  { product: 'Clothing', sales: 3000 },
  { product: 'Home', sales: 2000 },
  { product: 'Sports', sales: 2780 },
  { product: 'Books', sales: 1890 },
];

const areaChartData = [
  { month: 'Jan', revenue: 4000, expenses: 2400 },
  { month: 'Feb', revenue: 3000, expenses: 1398 },
  { month: 'Mar', revenue: 2000, expenses: 9800 },
  { month: 'Apr', revenue: 2780, expenses: 3908 },
  { month: 'May', revenue: 1890, expenses: 4800 },
  { month: 'Jun', revenue: 2390, expenses: 3800 },
];

const pieChartData = [
  { name: 'Direct', value: 400, fill: 'var(--chart-1)' },
  { name: 'Organic', value: 300, fill: 'var(--chart-2)' },
  { name: 'Referral', value: 200, fill: 'var(--chart-3)' },
  { name: 'Social', value: 100, fill: 'var(--chart-4)' },
];

// Combined chart data (bar + line)
const combinedChartData = [
  { month: 'Jan', revenue: 4000, growth: 12 },
  { month: 'Feb', revenue: 3500, growth: 8 },
  { month: 'Mar', revenue: 5200, growth: 18 },
  { month: 'Apr', revenue: 4800, growth: 15 },
  { month: 'May', revenue: 6100, growth: 22 },
  { month: 'Jun', revenue: 5800, growth: 20 },
];

// Radar chart data
const radarChartData = [
  { metric: 'Performance', current: 85, previous: 70 },
  { metric: 'Reliability', current: 90, previous: 85 },
  { metric: 'Usability', current: 78, previous: 65 },
  { metric: 'Security', current: 95, previous: 88 },
  { metric: 'Scalability', current: 72, previous: 60 },
  { metric: 'Maintainability', current: 80, previous: 75 },
];

// Radial progress data
const radialProgressData = [
  { name: 'Progress', value: 75, fill: 'var(--chart-1)' },
];

// Donut chart with center label data
const donutCenterData = [
  { name: 'Completed', value: 68, fill: 'var(--chart-1)' },
  { name: 'In Progress', value: 22, fill: 'var(--chart-2)' },
  { name: 'Pending', value: 10, fill: 'var(--chart-3)' },
];

const lineChartConfig: ChartConfig = {
  users: {
    label: 'Users',
    color: 'var(--chart-1)',
  },
};

const barChartConfig: ChartConfig = {
  sales: {
    label: 'Sales',
    color: 'var(--chart-2)',
  },
};

const areaChartConfig: ChartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'var(--chart-1)',
  },
  expenses: {
    label: 'Expenses',
    color: 'var(--chart-2)',
  },
};

const pieChartConfig: ChartConfig = {
  direct: { label: 'Direct', color: 'var(--chart-1)' },
  organic: { label: 'Organic', color: 'var(--chart-2)' },
  referral: { label: 'Referral', color: 'var(--chart-3)' },
  social: { label: 'Social', color: 'var(--chart-4)' },
};

const combinedChartConfig: ChartConfig = {
  revenue: { label: 'Revenue', color: 'var(--chart-1)' },
  growth: { label: 'Growth %', color: 'var(--chart-2)' },
};

const radarChartConfig: ChartConfig = {
  current: { label: 'Current', color: 'var(--chart-1)' },
  previous: { label: 'Previous', color: 'var(--chart-2)' },
};

const radialChartConfig: ChartConfig = {
  progress: { label: 'Progress', color: 'var(--chart-1)' },
};

const donutChartConfig: ChartConfig = {
  completed: { label: 'Completed', color: 'var(--chart-1)' },
  inProgress: { label: 'In Progress', color: 'var(--chart-2)' },
  pending: { label: 'Pending', color: 'var(--chart-3)' },
};

const ChartsShowcasePage: React.FC = () => {
  return (
    <ShowcasePage
      title="Charts"
      description="Data visualization components using Recharts with the design system's chart primitives."
    >
      {/* Line Chart */}
      <ShowcaseSection
        title="Line Chart"
        description="Display trends over time with line charts."
      >
        <CodeExample
          id="charts"
          title="Users Over Time"
          code={`const data = [
  { month: 'Jan', users: 186 },
  { month: 'Feb', users: 305 },
  { month: 'Mar', users: 237 },
  ...
];

const config: ChartConfig = {
  users: { label: 'Users', color: 'var(--chart-1)' },
};

<ChartContainer config={config} className="h-[300px]">
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="month" />
    <YAxis />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Line type="monotone" dataKey="users" stroke="var(--color-users)" strokeWidth={2} />
  </LineChart>
</ChartContainer>`}
        >
          <ChartContainer config={lineChartConfig} className="h-[300px] w-full">
            <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="users"
                stroke="var(--color-users)"
                strokeWidth={2}
                dot={{ fill: 'var(--color-users)' }}
              />
            </LineChart>
          </ChartContainer>
        </CodeExample>
      </ShowcaseSection>

      {/* Bar Chart */}
      <ShowcaseSection
        title="Bar Chart"
        description="Compare categorical data with bar charts."
      >
        <CodeExample
          id="charts"
          title="Sales by Product"
          code={`const data = [
  { product: 'Electronics', sales: 4000 },
  { product: 'Clothing', sales: 3000 },
  ...
];

<ChartContainer config={config} className="h-[300px]">
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="product" />
    <YAxis />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} />
  </BarChart>
</ChartContainer>`}
        >
          <ChartContainer config={barChartConfig} className="h-[300px] w-full">
            <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="product" className="text-xs" />
              <YAxis className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CodeExample>
      </ShowcaseSection>

      {/* Area Chart */}
      <ShowcaseSection
        title="Area Chart"
        description="Show trends with filled areas for better visual impact."
      >
        <CodeExample
          id="charts"
          title="Revenue vs Expenses"
          code={`const data = [
  { month: 'Jan', revenue: 4000, expenses: 2400 },
  { month: 'Feb', revenue: 3000, expenses: 1398 },
  ...
];

const config: ChartConfig = {
  revenue: { label: 'Revenue', color: 'var(--chart-1)' },
  expenses: { label: 'Expenses', color: 'var(--chart-2)' },
};

<ChartContainer config={config} className="h-[300px]">
  <AreaChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="month" />
    <YAxis />
    <ChartTooltip content={<ChartTooltipContent />} />
    <ChartLegend content={<ChartLegendContent />} />
    <Area type="monotone" dataKey="revenue" fill="var(--color-revenue)" stroke="var(--color-revenue)" fillOpacity={0.3} />
    <Area type="monotone" dataKey="expenses" fill="var(--color-expenses)" stroke="var(--color-expenses)" fillOpacity={0.3} />
  </AreaChart>
</ChartContainer>`}
        >
          <ChartContainer config={areaChartConfig} className="h-[350px] w-full">
            <AreaChart data={areaChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                type="monotone"
                dataKey="revenue"
                fill="var(--color-revenue)"
                stroke="var(--color-revenue)"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                fill="var(--color-expenses)"
                stroke="var(--color-expenses)"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ChartContainer>
        </CodeExample>
      </ShowcaseSection>

      {/* Pie/Donut Chart */}
      <ShowcaseSection
        title="Pie & Donut Charts"
        description="Show proportional data with pie and donut charts."
      >
        <CodeExample
          id="charts"
          title="Traffic Sources"
          code={`const data = [
  { name: 'Direct', value: 400, fill: 'var(--chart-1)' },
  { name: 'Organic', value: 300, fill: 'var(--chart-2)' },
  { name: 'Referral', value: 200, fill: 'var(--chart-3)' },
  { name: 'Social', value: 100, fill: 'var(--chart-4)' },
];

const config: ChartConfig = {
  direct: { label: 'Direct', color: 'var(--chart-1)' },
  organic: { label: 'Organic', color: 'var(--chart-2)' },
  referral: { label: 'Referral', color: 'var(--chart-3)' },
  social: { label: 'Social', color: 'var(--chart-4)' },
};

<ChartContainer config={config} className="h-[300px]">
  <PieChart>
    <ChartTooltip content={<ChartTooltipContent />} />
    <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100}>
      {data.map((entry, index) => (
        <Cell key={index} fill={entry.fill} />
      ))}
    </Pie>
  </PieChart>
</ChartContainer>`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-medium mb-4 text-center">Pie Chart</h4>
              <ChartContainer config={pieChartConfig} className="h-[250px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-4 text-center">Donut Chart</h4>
              <ChartContainer config={pieChartConfig} className="h-[250px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Combined Chart (Bar + Line) */}
      <ShowcaseSection
        title="Combined Chart"
        description="Bar and line chart combined to show value and trend together."
      >
        <CodeExample
          id="charts-combined"
          title="Revenue (Bar) + Growth Rate (Line)"
          code={`<ComposedChart data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="month" />
  <YAxis yAxisId="left" />
  <YAxis yAxisId="right" orientation="right" />
  <Bar yAxisId="left" dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
  <Line yAxisId="right" type="monotone" dataKey="growth" stroke="var(--color-growth)" strokeWidth={2} />
</ComposedChart>`}
        >
          <ChartContainer config={combinedChartConfig} className="h-[350px] w-full">
            <ComposedChart data={combinedChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis yAxisId="left" className="text-xs" tickFormatter={(v) => `$${v / 1000}k`} />
              <YAxis yAxisId="right" orientation="right" className="text-xs" tickFormatter={(v) => `${v}%`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar yAxisId="left" dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="growth" stroke="var(--color-growth)" strokeWidth={2} dot={{ fill: 'var(--color-growth)' }} />
            </ComposedChart>
          </ChartContainer>
        </CodeExample>
      </ShowcaseSection>

      {/* Enhanced Donut Chart with Center Label */}
      <ShowcaseSection
        title="Donut Chart with Center Label"
        description="Donut chart with a center label showing the primary metric."
      >
        <CodeExample
          id="charts-donut-center"
          title="Task Completion with Legend"
          code={`<PieChart>
  <Pie data={data} innerRadius={60} outerRadius={90} paddingAngle={2}>
    {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
  </Pie>
  {/* Center label positioned absolutely */}
  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
    68%
  </text>
</PieChart>`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <ChartContainer config={donutChartConfig} className="h-[280px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={donutCenterData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {donutCenterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-3xl font-bold">
                  68%
                </text>
                <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-sm">
                  Complete
                </text>
              </PieChart>
            </ChartContainer>
            <div className="space-y-3">
              {donutCenterData.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Radar Chart */}
      <ShowcaseSection
        title="Radar Chart"
        description="Multi-metric comparison using radar/spider charts."
      >
        <CodeExample
          id="charts-radar"
          title="System Metrics Comparison"
          code={`<RadarChart data={data}>
  <PolarGrid />
  <PolarAngleAxis dataKey="metric" />
  <PolarRadiusAxis angle={30} domain={[0, 100]} />
  <Radar name="Current" dataKey="current" stroke="var(--color-current)" fill="var(--color-current)" fillOpacity={0.3} />
  <Radar name="Previous" dataKey="previous" stroke="var(--color-previous)" fill="var(--color-previous)" fillOpacity={0.3} />
</RadarChart>`}
        >
          <ChartContainer config={radarChartConfig} className="h-[350px] w-full">
            <RadarChart data={radarChartData} cx="50%" cy="50%" outerRadius="80%">
              <PolarGrid className="stroke-muted" />
              <PolarAngleAxis dataKey="metric" className="text-xs" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Radar
                name="Current"
                dataKey="current"
                stroke="var(--color-current)"
                fill="var(--color-current)"
                fillOpacity={0.4}
                strokeWidth={2}
              />
              <Radar
                name="Previous"
                dataKey="previous"
                stroke="var(--color-previous)"
                fill="var(--color-previous)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Legend />
            </RadarChart>
          </ChartContainer>
        </CodeExample>
      </ShowcaseSection>

      {/* Radial Progress Chart */}
      <ShowcaseSection
        title="Radial Progress Chart"
        description="Circular progress indicator for completion or goal tracking."
      >
        <CodeExample
          id="charts-radial"
          title="Progress Indicators"
          code={`<RadialBarChart innerRadius="60%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
  <RadialBar background dataKey="value" cornerRadius={10} />
</RadialBarChart>`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col items-center">
              <ChartContainer config={radialChartConfig} className="h-[180px] w-[180px]">
                <RadialBarChart
                  innerRadius="70%"
                  outerRadius="100%"
                  data={radialProgressData}
                  startAngle={90}
                  endAngle={-270 * 0.75 + 90}
                >
                  <RadialBar background dataKey="value" cornerRadius={10} fill="var(--chart-1)" />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-2xl font-bold">
                    75%
                  </text>
                </RadialBarChart>
              </ChartContainer>
              <p className="text-sm text-muted-foreground mt-2">Storage Used</p>
            </div>
            <div className="flex flex-col items-center">
              <ChartContainer config={radialChartConfig} className="h-[180px] w-[180px]">
                <RadialBarChart
                  innerRadius="70%"
                  outerRadius="100%"
                  data={[{ name: 'Tasks', value: 42, fill: 'var(--chart-2)' }]}
                  startAngle={90}
                  endAngle={-270 * 0.42 + 90}
                >
                  <RadialBar background dataKey="value" cornerRadius={10} fill="var(--chart-2)" />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-2xl font-bold">
                    42%
                  </text>
                </RadialBarChart>
              </ChartContainer>
              <p className="text-sm text-muted-foreground mt-2">Tasks Complete</p>
            </div>
            <div className="flex flex-col items-center">
              <ChartContainer config={radialChartConfig} className="h-[180px] w-[180px]">
                <RadialBarChart
                  innerRadius="70%"
                  outerRadius="100%"
                  data={[{ name: 'Goal', value: 92, fill: 'var(--chart-3)' }]}
                  startAngle={90}
                  endAngle={-270 * 0.92 + 90}
                >
                  <RadialBar background dataKey="value" cornerRadius={10} fill="var(--chart-3)" />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-2xl font-bold">
                    92%
                  </text>
                </RadialBarChart>
              </ChartContainer>
              <p className="text-sm text-muted-foreground mt-2">Monthly Goal</p>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Sparkline */}
      <ShowcaseSection
        title="Sparklines"
        description="Minimal inline charts for embedding in cards or tables."
      >
        <CodeExample
          id="charts"
          title="Mini Charts"
          code={`<ChartContainer config={config} className="h-[50px] w-[150px]">
  <LineChart data={data}>
    <Line type="monotone" dataKey="users" stroke="var(--color-users)" strokeWidth={2} dot={false} />
  </LineChart>
</ChartContainer>`}
        >
          <div className="flex flex-wrap gap-8 items-center">
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Users</p>
                <p className="text-2xl font-bold">614</p>
              </div>
              <ChartContainer config={lineChartConfig} className="h-[50px] w-[100px]">
                <LineChart data={lineChartData}>
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="var(--color-users)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </div>
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Sales</p>
                <p className="text-2xl font-bold">$13.6k</p>
              </div>
              <ChartContainer config={barChartConfig} className="h-[50px] w-[100px]">
                <BarChart data={barChartData}>
                  <Bar dataKey="sales" fill="var(--color-sales)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default ChartsShowcasePage;

