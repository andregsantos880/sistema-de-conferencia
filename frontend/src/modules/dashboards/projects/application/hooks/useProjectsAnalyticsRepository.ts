import { useRepository } from '@/shared/hooks/useRepository';
import { PROJECTS_SYMBOLS } from '../../di/symbols';
import type { IProjectsAnalyticsRepository } from '../../domain/ports/IProjectsAnalyticsRepository';

/**
 * Module-specific hook for Projects Analytics Repository
 * Provides semantic clarity while using the generic useRepository internally
 */
export const useProjectsAnalyticsRepository = (): IProjectsAnalyticsRepository =>
  useRepository<IProjectsAnalyticsRepository>(PROJECTS_SYMBOLS.IProjectsAnalyticsRepository);
