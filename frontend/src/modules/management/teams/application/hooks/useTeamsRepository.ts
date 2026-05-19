import { useRepository } from '@/shared/hooks/useRepository';
import { TEAMS_SYMBOLS } from '../../di/symbols';
import type { ITeamsRepository } from '../../domain/ports/ITeamsRepository';

export const useTeamsRepository = (): ITeamsRepository =>
  useRepository<ITeamsRepository>(TEAMS_SYMBOLS.ITeamsRepository);
