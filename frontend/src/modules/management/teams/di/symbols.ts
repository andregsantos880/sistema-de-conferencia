export const TEAMS_SYMBOLS = {
  ITeamsRepository: Symbol.for('ITeamsRepository'),
} as const;

export type TeamsSymbols = typeof TEAMS_SYMBOLS;
