import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTeamsRepository } from './useTeamsRepository';
import type { ListTeamsParams, ListMembersParams, ListActivityParams } from '../../domain/ports';
import type {
  CreateTeamPayload,
  UpdateTeamPayload,
  AddMembersPayload,
  InviteMembersPayload,
  UpdateMemberPayload,
  TransferOwnershipPayload,
  TeamBulkActionType,
} from '../../domain/models';

// Query Keys
export const teamsKeys = {
  all: ['teams'] as const,
  lists: () => [...teamsKeys.all, 'list'] as const,
  list: (params?: ListTeamsParams) => [...teamsKeys.lists(), params] as const,
  details: () => [...teamsKeys.all, 'detail'] as const,
  detail: (id: string) => [...teamsKeys.details(), id] as const,
  stats: () => [...teamsKeys.all, 'stats'] as const,
  members: (teamId: string) => [...teamsKeys.all, teamId, 'members'] as const,
  membersList: (teamId: string, params?: ListMembersParams) => [...teamsKeys.members(teamId), params] as const,
  activity: (teamId: string) => [...teamsKeys.all, teamId, 'activity'] as const,
  activityList: (teamId: string, params?: ListActivityParams) => [...teamsKeys.activity(teamId), params] as const,
};

// ============================================================================
// Team Queries
// ============================================================================

export function useTeamsList(params?: ListTeamsParams) {
  const repository = useTeamsRepository();

  return useQuery({
    queryKey: teamsKeys.list(params),
    queryFn: () => repository.getTeams(params),
  });
}

export function useTeam(id: string) {
  const repository = useTeamsRepository();

  return useQuery({
    queryKey: teamsKeys.detail(id),
    queryFn: () => repository.getTeamById(id),
    enabled: !!id,
  });
}

export function useTeamStats() {
  const repository = useTeamsRepository();

  return useQuery({
    queryKey: teamsKeys.stats(),
    queryFn: () => repository.getStats(),
  });
}

// ============================================================================
// Team Mutations
// ============================================================================

export function useCreateTeam() {
  const repository = useTeamsRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTeamPayload) => repository.createTeam(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teamsKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: teamsKeys.stats() });
    },
  });
}

export function useUpdateTeam() {
  const repository = useTeamsRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamPayload }) =>
      repository.updateTeam(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: teamsKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: teamsKeys.detail(id) });
    },
  });
}

export function useDeleteTeam() {
  const repository = useTeamsRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repository.deleteTeam(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teamsKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: teamsKeys.stats() });
    },
  });
}

export function useArchiveTeam() {
  const repository = useTeamsRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repository.archiveTeam(id),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: teamsKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: teamsKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: teamsKeys.stats() });
      void queryClient.invalidateQueries({ queryKey: teamsKeys.activity(id) });
    },
  });
}

export function useUnarchiveTeam() {
  const repository = useTeamsRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repository.unarchiveTeam(id),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: teamsKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: teamsKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: teamsKeys.stats() });
      void queryClient.invalidateQueries({ queryKey: teamsKeys.activity(id) });
    },
  });
}

export function useTransferOwnership() {
  const repository = useTeamsRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransferOwnershipPayload }) =>
      repository.transferOwnership(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: teamsKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: teamsKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: teamsKeys.members(id) });
      void queryClient.invalidateQueries({ queryKey: teamsKeys.activity(id) });
    },
  });
}

export function useBulkTeamAction() {
  const repository = useTeamsRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, action }: { ids: string[]; action: TeamBulkActionType }) =>
      repository.bulkAction(ids, action),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teamsKeys.all });
    },
  });
}

// ============================================================================
// Members Queries & Mutations
// ============================================================================

export function useTeamMembers(teamId: string, params?: ListMembersParams) {
  const repository = useTeamsRepository();

  return useQuery({
    queryKey: teamsKeys.membersList(teamId, params),
    queryFn: () => repository.getMembers(teamId, params),
    enabled: !!teamId,
  });
}

export function useAddMembers() {
  const repository = useTeamsRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: AddMembersPayload }) =>
      repository.addMembers(teamId, data),
    onSuccess: (_, { teamId }) => {
      void queryClient.invalidateQueries({ queryKey: teamsKeys.members(teamId) });
      void queryClient.invalidateQueries({ queryKey: teamsKeys.detail(teamId) });
      void queryClient.invalidateQueries({ queryKey: teamsKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: teamsKeys.activity(teamId) });
    },
  });
}

export function useInviteMembers() {
  const repository = useTeamsRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: InviteMembersPayload }) =>
      repository.inviteMembers(teamId, data),
    onSuccess: (_, { teamId }) => {
      void queryClient.invalidateQueries({ queryKey: teamsKeys.members(teamId) });
      void queryClient.invalidateQueries({ queryKey: teamsKeys.detail(teamId) });
      void queryClient.invalidateQueries({ queryKey: teamsKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: teamsKeys.activity(teamId) });
    },
  });
}

export function useUpdateMember() {
  const repository = useTeamsRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      teamId,
      memberId,
      data,
    }: {
      teamId: string;
      memberId: string;
      data: UpdateMemberPayload;
    }) => repository.updateMember(teamId, memberId, data),
    onSuccess: (_, { teamId }) => {
      void queryClient.invalidateQueries({ queryKey: teamsKeys.members(teamId) });
      void queryClient.invalidateQueries({ queryKey: teamsKeys.activity(teamId) });
    },
  });
}

export function useRemoveMember() {
  const repository = useTeamsRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, memberId }: { teamId: string; memberId: string }) =>
      repository.removeMember(teamId, memberId),
    onSuccess: (_, { teamId }) => {
      void queryClient.invalidateQueries({ queryKey: teamsKeys.members(teamId) });
      void queryClient.invalidateQueries({ queryKey: teamsKeys.detail(teamId) });
      void queryClient.invalidateQueries({ queryKey: teamsKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: teamsKeys.activity(teamId) });
    },
  });
}

export function useResendMemberInvite() {
  const repository = useTeamsRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, memberId }: { teamId: string; memberId: string }) =>
      repository.resendMemberInvite(teamId, memberId),
    onSuccess: (_, { teamId }) => {
      void queryClient.invalidateQueries({ queryKey: teamsKeys.activity(teamId) });
    },
  });
}

// ============================================================================
// Activity Queries
// ============================================================================

export function useTeamActivity(teamId: string, params?: ListActivityParams) {
  const repository = useTeamsRepository();

  return useQuery({
    queryKey: teamsKeys.activityList(teamId, params),
    queryFn: () => repository.getActivity(teamId, params),
    enabled: !!teamId,
  });
}
