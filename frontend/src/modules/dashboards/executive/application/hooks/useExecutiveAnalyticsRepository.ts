import { useRepository } from '@/shared/hooks/useRepository';
import { EXECUTIVE_SYMBOLS } from '../../di/symbols';
import type { IExecutiveAnalyticsRepository } from '../../domain/repositories/IExecutiveAnalyticsRepository';

/**
 * Module-specific hook for Executive Analytics Repository
 * Provides semantic clarity while using the generic useRepository internally
 */
export const useExecutiveAnalyticsRepository = (): IExecutiveAnalyticsRepository =>
  useRepository<IExecutiveAnalyticsRepository>(EXECUTIVE_SYMBOLS.IExecutiveAnalyticsRepository);
