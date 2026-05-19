export const TEAMS_PATHS = {
  HOME: '/management/teams',
  TABLE: '/management/teams/table',
  CARDS: '/management/teams/cards',
  DETAIL: '/management/teams/:teamId',
} as const;

export function getTeamDetailPath(teamId: string): string {
  return `/management/teams/${teamId}`;
}
