import { useRepository } from '@/shared/hooks/useRepository';
import { INBOX_SYMBOLS } from '../../di/symbols';
import type { IInboxRepository } from '../../infrastructure/repositories/InboxRepository';

export const useInboxRepository = (): IInboxRepository =>
  useRepository<IInboxRepository>(INBOX_SYMBOLS.IInboxRepository);
