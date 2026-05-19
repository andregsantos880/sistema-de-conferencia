/**
 * Invoice Repository Hook
 * 
 * Provides access to the Invoice repository via DI.
 */

import { useRepository } from '@/shared/hooks/useRepository';
import { INVOICING_SYMBOLS } from '../../di/symbols';
import type { IInvoiceRepository } from '../../infrastructure/repositories/InvoiceRepository';

export const useInvoiceRepository = (): IInvoiceRepository =>
  useRepository<IInvoiceRepository>(INVOICING_SYMBOLS.IInvoiceRepository);
