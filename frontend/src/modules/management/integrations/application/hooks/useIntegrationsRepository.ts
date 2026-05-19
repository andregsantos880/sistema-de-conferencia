import { useRepository } from '@/shared/hooks/useRepository';
import { INTEGRATIONS_SYMBOLS } from '../../di/symbols';
import type { IIntegrationsRepository } from '../../domain/ports/IIntegrationsRepository';

export const useIntegrationsRepository = (): IIntegrationsRepository =>
  useRepository<IIntegrationsRepository>(INTEGRATIONS_SYMBOLS.IIntegrationsRepository);
