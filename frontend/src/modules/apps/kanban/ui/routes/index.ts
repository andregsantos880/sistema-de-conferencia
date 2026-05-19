/**
 * Kanban Module Routes
 */

export const KANBAN_PATHS = {
  ROOT: '/apps/kanban',
  BOARD: (boardId: string) => `/apps/kanban/board/${boardId}`,
} as const;
