# Dashboards Kit + Executive Overview

A comprehensive, reusable dashboard system for React 19 + Vite + TypeScript + Tailwind + shadcn + TanStack Query + MSW + i18n.

## 📦 Features

- **Reusable Widget Components**: KpiCard, TrendCard, Sparkline, LeaderboardTable, RangePicker, WidgetHeader
- **Shared Hooks**: `useDateRange`, `useThemeTokens`, `useLiveQuery`
- **Utilities**: Formatters (currency, percent, compact), chart colors, date range helpers
- **MSW Integration**: Realistic mock data with date-aware seed generation
- **Theme Support**: Dark/light mode with CSS variable-based chart colors
- **i18n Ready**: English and Spanish translations
- **Responsive Grid**: 12/8/1 column breakpoints for desktop/tablet/mobile
- **Animations**: Framer Motion staggered reveals respecting `prefers-reduced-motion`
- **Compare Mode**: Overlay previous period data with ghost series and delta badges

## 🏗️ Architecture

```
src/modules/dashboards/
├── shared/
│   ├── components/      # Reusable widgets
│   ├── hooks/           # Date range, theme tokens, live queries
│   └── utils/           # Formatters, chart colors, date helpers
├── executive/
│   ├── pages/           # ExecutiveDashboardPage
│   ├── widgets/         # MRR, Revenue, Churn, NPS, etc.
│   ├── application/hooks/  # Data fetching hooks
│   ├── infrastructure/mocks/  # MSW handlers
│   └── ui/routes.ts
└── di/container.ts      # Module registration
```

## 🎯 Executive Overview Dashboard

### KPI Rail
- **MRR**: Monthly Recurring Revenue with sparkline
- **Active Customers**: Customer count with trend
- **Churn**: Churn percentage (inverse trend semantics)
- **LTV:CAC**: Lifetime Value to Customer Acquisition Cost ratio
- **NPS**: Net Promoter Score with distribution bar

### Widgets
- **Revenue vs Target**: Area chart comparing actual vs goal
- **Top Products**: Sortable table with revenue, orders, GM%, and sparklines
- **NPS Card**: Current score with promoters/passives/detractors distribution

### Features
- Global date range picker with presets (7d, 30d, 90d, YTD, 12M, custom)
- Compare mode to overlay previous period data
- URL persistence (`?range=30d&compare=true`)
- localStorage persistence for user preferences
- Export functionality (CSV for tables, PNG for charts)
- Refresh actions for live data updates

## 🚀 Usage

### Basic Widget

```tsx
import { KpiCard } from '@/modules/dashboards/shared/components';
import { CHART_COLORS } from '@/modules/dashboards/shared/utils';

<KpiCard
  label="MRR"
  value="$125K"
  delta={12.5}
  deltaFormat="percent"
  trend="up"
  sparkData={[100, 105, 110, 115, 120, 125]}
  colorToken={CHART_COLORS.primary}
/>
```

### Date Range Hook

```tsx
import { useDateRange } from '@/modules/dashboards/shared/hooks';

function MyDashboard() {
  const { range, compare, setPreset, setCompare } = useDateRange();
  
  // range.from, range.to, range.preset
  // compare: boolean
}
```

### Data Fetching

```tsx
import { useMrrData } from '@/modules/dashboards/executive/application/hooks/useExecutiveAnalytics';

function MrrWidget() {
  const { range, compare } = useDateRange();
  const { data, isLoading } = useMrrData(range, compare);
  
  // data.current, data.delta, data.series, data.previous
}
```

## 🎨 Theming

Chart colors are defined via CSS variables:

```css
:root {
  --chart-1: 220 70% 50%;  /* Primary */
  --chart-2: 160 60% 45%;  /* Secondary */
  --chart-3: 30 80% 55%;   /* Tertiary */
  --chart-4: 280 65% 60%;  /* Quaternary */
  --chart-5: 340 75% 55%;  /* Quinary */
  --chart-6: 200 70% 50%;  /* Senary */
  --chart-7: 120 60% 50%;  /* Septenary */
  --chart-8: 60 70% 50%;   /* Octonary */
  --success: 142 71% 45%;
  --warning: 38 92% 50%;
  --destructive: 0 84% 60%;
}
```

Access via `useThemeTokens()` hook or `CHART_COLORS` constants.

## 📊 MSW Handlers

All analytics endpoints return consistent mock data:

```typescript
GET /api/analytics/executive/mrr?from=&to=&compare=
GET /api/analytics/executive/revenue-vs-target?from=&to=&compare=
GET /api/analytics/executive/churn?from=&to=&compare=
GET /api/analytics/executive/active-customers?from=&to=&compare=
GET /api/analytics/executive/ltv-cac?compare=
GET /api/analytics/executive/nps?from=&to=
GET /api/analytics/executive/top-products?from=&to=&limit=
GET /api/analytics/executive/regions?from=&to=
GET /api/analytics/executive/pipeline-funnel?from=&to=
GET /api/analytics/executive/cohort-retention?from=&to=
```

Data is generated with date-aware seeds for consistency across requests.

## 🌐 i18n

Translations are namespaced under `dashboards`:

```tsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
t('executive.title'); // "Executive Overview"
t('kpi.mrr'); // "MRR"
t('common.compare'); // "Compare to previous period"
```

## 📱 Responsive Behavior

- **Desktop (≥1280px)**: 12-column grid, hero KPIs span 3, large charts span 6-8
- **Tablet (768-1279px)**: 8-column grid, adjusted spans
- **Mobile (<768px)**: Single column, cards stack

## ♿ Accessibility

- Semantic HTML with proper ARIA labels
- Keyboard navigation support
- `prefers-reduced-motion` respected for animations
- Color contrast meets WCAG AA standards
- Screen reader friendly chart descriptions

## 🔄 Next Dashboards

Use the same kit to build:

- **Sales & CRM**: Funnel, forecast vs quota, rep leaderboard
- **E-commerce**: Revenue/AOV, orders, cart funnel
- **Marketing**: Sessions, signups, ROAS, channel mix
- **Projects**: Sprint burndown, velocity, workload
- **Support**: FRT, resolution time, CSAT, backlog

Simply create new widgets, endpoints, and pages following the established patterns.

## 📝 Notes

- All components use TypeScript with strict typing (no `any`)
- Charts use Recharts for simplicity and great DX
- Apache ECharts can be added for advanced visualizations (funnels, heatmaps)
- Framer Motion animations are optional and respect user preferences
- MSW handlers are registered in `src/mocks/browser.ts`
- Module is registered in `src/core/di/module-loader.ts`

## 🎯 Route

Access the Executive Dashboard at: `/dashboards/executive`
