// Users Management Module Route Path Constants
export const USERS_PATHS = {
  HOME: '/management/users',
  LIST: '/management/users',
  USER: (id: string) => `/management/users/${id}`,
} as const;

export type UsersPaths = typeof USERS_PATHS;
