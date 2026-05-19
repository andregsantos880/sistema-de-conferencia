export const USERS_SYMBOLS = {
  IUsersRepository: Symbol.for('IUsersRepository'),
} as const;

export type UsersSymbols = typeof USERS_SYMBOLS;
