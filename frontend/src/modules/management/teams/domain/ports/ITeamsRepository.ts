import type {
  Team,
  TeamListItem,
  TeamDetail,
  TeamMember,
  TeamActivity,
  CreateTeamPayload,
  UpdateTeamPayload,
  AddMembersPayload,
  InviteMembersPayload,
  UpdateMemberPayload,
  TransferOwnershipPayload,
  TeamStats,
  TeamBulkActionType,
} from '../models';

/**
 * List Teams Parameters
 */
export interface ListTeamsParams {
  search?: string;
  status?: string;
  department?: string;
  type?: string;
}

/**
 * List Members Parameters
 */
export interface ListMembersParams {
  search?: string;
  role?: string;
  status?: string;
}

/**
 * List Activity Parameters
 */
export interface ListActivityParams {
  type?: string;
  actorId?: string;
  limit?: number;
  offset?: number;
}

/**
 * Invite Members Result
 */
export interface InviteMembersResult {
  added: number;
  invited: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}

/**
 * Teams Repository Interface
 *
 * Defines the contract for team management data access
 */
export interface ITeamsRepository {
  // Team CRUD
  getTeams(params?: ListTeamsParams): Promise<TeamListItem[]>;
  getTeamById(id: string): Promise<TeamDetail | null>;
  createTeam(data: CreateTeamPayload): Promise<Team>;
  updateTeam(id: string, data: UpdateTeamPayload): Promise<Team>;
  deleteTeam(id: string): Promise<void>;

  // Team Statistics
  getStats(): Promise<TeamStats>;

  // Lifecycle Actions
  archiveTeam(id: string): Promise<Team>;
  unarchiveTeam(id: string): Promise<Team>;
  transferOwnership(id: string, data: TransferOwnershipPayload): Promise<Team>;

  // Bulk Actions
  bulkAction(ids: string[], action: TeamBulkActionType): Promise<{ success: number; failed: number }>;

  // Members
  getMembers(teamId: string, params?: ListMembersParams): Promise<TeamMember[]>;
  addMembers(teamId: string, data: AddMembersPayload): Promise<TeamMember[]>;
  inviteMembers(teamId: string, data: InviteMembersPayload): Promise<InviteMembersResult>;
  updateMember(teamId: string, memberId: string, data: UpdateMemberPayload): Promise<TeamMember>;
  removeMember(teamId: string, memberId: string): Promise<void>;
  resendMemberInvite(teamId: string, memberId: string): Promise<{ success: boolean; message: string }>;

  // Activity
  getActivity(teamId: string, params?: ListActivityParams): Promise<TeamActivity[]>;
}
