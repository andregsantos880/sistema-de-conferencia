import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUsersRepository } from './useUsersRepository';
import type { ListUsersParams } from '../../domain/ports/IUsersRepository';
import type {
  InviteUserPayload,
  UpdateUserPayload,
  BulkActionType,
  ImportUserItem,
} from '../../domain/models';

// Query Keys
export const USERS_QUERY_KEYS = {
  all: ['users'] as const,
  lists: () => [...USERS_QUERY_KEYS.all, 'list'] as const,
  list: (params?: ListUsersParams) => [...USERS_QUERY_KEYS.lists(), params] as const,
  details: () => [...USERS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...USERS_QUERY_KEYS.details(), id] as const,
  stats: () => [...USERS_QUERY_KEYS.all, 'stats'] as const,
  sessions: (userId: string) => [...USERS_QUERY_KEYS.all, 'sessions', userId] as const,
  activityLog: (userId: string) => [...USERS_QUERY_KEYS.all, 'activity-log', userId] as const,
};

/**
 * Hook to fetch users list
 */
export function useUsersList(params?: ListUsersParams) {
  const repository = useUsersRepository();

  return useQuery({
    queryKey: USERS_QUERY_KEYS.list(params),
    queryFn: () => repository.getUsers(params),
  });
}

/**
 * Hook to fetch user statistics
 */
export function useUsersStats() {
  const repository = useUsersRepository();

  return useQuery({
    queryKey: USERS_QUERY_KEYS.stats(),
    queryFn: () => repository.getStats(),
  });
}

/**
 * Hook to fetch single user details
 */
export function useUser(id: string) {
  const repository = useUsersRepository();

  return useQuery({
    queryKey: USERS_QUERY_KEYS.detail(id),
    queryFn: () => repository.getUserById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch user sessions
 */
export function useUserSessions(userId: string) {
  const repository = useUsersRepository();

  return useQuery({
    queryKey: USERS_QUERY_KEYS.sessions(userId),
    queryFn: () => repository.getSessions(userId),
    enabled: !!userId,
  });
}

/**
 * Hook to fetch user activity log
 */
export function useUserActivityLog(userId: string) {
  const repository = useUsersRepository();

  return useQuery({
    queryKey: USERS_QUERY_KEYS.activityLog(userId),
    queryFn: () => repository.getActivityLog(userId),
    enabled: !!userId,
  });
}

/**
 * Hook to invite/create a new user
 */
export function useInviteUser() {
  const repository = useUsersRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteUserPayload) => repository.createUser(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.stats() });
    },
  });
}

/**
 * Hook to update a user
 */
export function useUpdateUser() {
  const repository = useUsersRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserPayload }) =>
      repository.updateUser(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.detail(id) });
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
    },
  });
}

/**
 * Hook to delete a user
 */
export function useDeleteUser() {
  const repository = useUsersRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repository.deleteUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.stats() });
    },
  });
}

/**
 * Hook to activate a user
 */
export function useActivateUser() {
  const repository = useUsersRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repository.activateUser(id),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.detail(id) });
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.stats() });
    },
  });
}

/**
 * Hook to deactivate a user
 */
export function useDeactivateUser() {
  const repository = useUsersRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repository.deactivateUser(id),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.detail(id) });
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.stats() });
    },
  });
}

/**
 * Hook to suspend a user
 */
export function useSuspendUser() {
  const repository = useUsersRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      repository.suspendUser(id, reason),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.detail(id) });
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.stats() });
    },
  });
}

/**
 * Hook to restore a user
 */
export function useRestoreUser() {
  const repository = useUsersRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repository.restoreUser(id),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.detail(id) });
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.stats() });
    },
  });
}

/**
 * Hook for bulk actions
 */
export function useBulkAction() {
  const repository = useUsersRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, action }: { ids: string[]; action: BulkActionType }) =>
      repository.bulkAction(ids, action),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.stats() });
    },
  });
}

/**
 * Hook to resend invitation
 */
export function useResendInvitation() {
  const repository = useUsersRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repository.resendInvitation(id),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.detail(id) });
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.activityLog(id) });
    },
  });
}

/**
 * Hook to send password reset email
 */
export function useSendPasswordReset() {
  const repository = useUsersRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repository.sendPasswordReset(id),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.activityLog(id) });
    },
  });
}

/**
 * Hook to send verification email
 */
export function useSendVerificationEmail() {
  const repository = useUsersRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repository.sendVerificationEmail(id),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.activityLog(id) });
    },
  });
}

/**
 * Hook to terminate a session
 */
export function useTerminateSession() {
  const repository = useUsersRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, sessionId }: { userId: string; sessionId: string }) =>
      repository.terminateSession(userId, sessionId),
    onSuccess: (_, { userId }) => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.sessions(userId) });
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.detail(userId) });
    },
  });
}

/**
 * Hook to terminate all sessions
 */
export function useTerminateAllSessions() {
  const repository = useUsersRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => repository.terminateAllSessions(userId),
    onSuccess: (_, userId) => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.sessions(userId) });
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.detail(userId) });
    },
  });
}

/**
 * Hook to import users
 */
export function useImportUsers() {
  const repository = useUsersRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ users, sendInvites }: { users: ImportUserItem[]; sendInvites: boolean }) =>
      repository.importUsers(users, sendInvites),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.stats() });
    },
  });
}

/**
 * Hook to export users
 */
export function useExportUsers() {
  const repository = useUsersRepository();

  return useMutation({
    mutationFn: (params?: ListUsersParams) => repository.exportUsers(params),
  });
}
