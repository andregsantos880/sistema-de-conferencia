import { useRepository } from '@/shared/hooks/useRepository';
import { USERS_SYMBOLS } from '../../di/symbols';
import type { IUsersRepository } from '../../domain/ports/IUsersRepository';

/**
 * Hook to access the Users Repository via DI
 */
export const useUsersRepository = (): IUsersRepository =>
  useRepository<IUsersRepository>(USERS_SYMBOLS.IUsersRepository);
