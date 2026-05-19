import type { ModuleRoute } from "@/core/router/types";
import { SALES_DASHBOARD_PATHS } from "./paths";
//import { lazy } from "react";

//const SalesDashboardPage = lazy(() => import('@/modules/dashboards/sales/ui/pages/SalesDashboardPage'));
import SalesDashboardPage from '@/modules/dashboards/sales/ui/pages/SalesDashboardPage';

export const SALES_DASHBOARD_ROUTES: ModuleRoute[] = [
  {
    path: SALES_DASHBOARD_PATHS.ROOT,
    component: SalesDashboardPage,
    layout: 'app',
    module: 'dashboards',
  },
];
