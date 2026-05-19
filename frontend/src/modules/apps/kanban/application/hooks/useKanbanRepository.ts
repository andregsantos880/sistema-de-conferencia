/**
 * Kanban Repository Hook
 * 
 * Provides access to the Kanban repository via DI.
 */

import { useRepository } from '@/shared/hooks/useRepository';
import { KANBAN_SYMBOLS } from '../../di/symbols';
import type { IKanbanRepository } from '../../infrastructure/repositories/KanbanRepository';

export const useKanbanRepository = (): IKanbanRepository =>
  useRepository<IKanbanRepository>(KANBAN_SYMBOLS.IKanbanRepository);
