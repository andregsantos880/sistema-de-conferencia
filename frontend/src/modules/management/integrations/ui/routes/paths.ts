export const INTEGRATIONS_PATHS = {
  HOME: '/management/integrations',
  DETAIL: '/management/integrations/:id',
} as const;

export function getIntegrationDetailPath(id: string) {
  return `/management/integrations/${id}`;
}
