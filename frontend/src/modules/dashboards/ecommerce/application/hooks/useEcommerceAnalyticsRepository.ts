import { useRepository } from '@/shared/hooks/useRepository';
import { ECOMMERCE_SYMBOLS } from '../../di/symbols';
import type { IEcommerceAnalyticsRepository } from '../../domain/repositories/IEcommerceAnalyticsRepository';

/**
 * Module-specific hook for E-commerce Analytics Repository
 * Provides semantic clarity while using the generic useRepository internally
 */
export const useEcommerceAnalyticsRepository = (): IEcommerceAnalyticsRepository =>
  useRepository<IEcommerceAnalyticsRepository>(ECOMMERCE_SYMBOLS.IEcommerceAnalyticsRepository);
