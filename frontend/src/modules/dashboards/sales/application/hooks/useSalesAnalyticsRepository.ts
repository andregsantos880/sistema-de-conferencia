import { useRepository } from '@/shared/hooks/useRepository';
import { SALES_SYMBOLS } from '../../di/symbols';
import type { ISalesAnalyticsRepository } from '../../domain/repositories/ISalesAnalyticsRepository';

/**
 * Module-specific hook for Sales Analytics Repository
 * Provides semantic clarity while using the generic useRepository internally
 */
export const useSalesAnalyticsRepository = (): ISalesAnalyticsRepository =>
  useRepository<ISalesAnalyticsRepository>(SALES_SYMBOLS.ISalesAnalyticsRepository);
