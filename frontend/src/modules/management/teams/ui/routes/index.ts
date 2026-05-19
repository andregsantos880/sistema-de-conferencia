import type { ModuleRoute } from '@/core/router/types';
import { TEAMS_PATHS } from './paths';
import { lazy } from 'react';

const TeamsListPage = lazy(() => import('../pages/TeamsListPage'));
const TeamsCardListPage = lazy(() => import('../pages/TeamsCardListPage'));
const TeamDetailPage = lazy(() => import('../pages/TeamDetailPage'));

export const TEAMS_ROUTES: ModuleRoute[] = [
  {
    path: TEAMS_PATHS.HOME,
    module: 'management-teams',
    layout: 'app',
    titleKey: 'teams:title',
    title: 'Teams',
    description: 'Organize users into groups for collaboration and access control',
    component: TeamsListPage,
  },
  {
    path: TEAMS_PATHS.TABLE,
    module: 'management-teams',
    layout: 'app',
    titleKey: 'teams:views.tableList',
    title: 'Teams - Table View',
    description: 'View teams in a table layout',
    component: TeamsListPage,
  },
  {
    path: TEAMS_PATHS.CARDS,
    module: 'management-teams',
    layout: 'app',
    titleKey: 'teams:views.cardList',
    title: 'Teams - Card View',
    description: 'View teams in a card layout',
    component: TeamsCardListPage,
  },
  {
    path: TEAMS_PATHS.DETAIL,
    module: 'management-teams',
    layout: 'app',
    titleKey: 'teams:detail.title',
    title: 'Team Details',
    description: 'View and manage team details',
    component: TeamDetailPage,
  },
];

export { TEAMS_PATHS, getTeamDetailPath } from './paths';
