import { injectable, inject } from 'inversify';
import { CORE_SYMBOLS } from '@/core/di/symbols';
import type { IHttpClient } from '@/shared/infrastructure/http/HttpClient';
import { BaseRepository } from '@/shared/infrastructure/repositories';
import type {
  ITeamsRepository,
  ListTeamsParams,
  ListMembersParams,
  ListActivityParams,
  InviteMembersResult,
} from '../../domain/ports/ITeamsRepository';
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
} from '../../domain/models';

@injectable()
export class HttpTeamsRepository extends BaseRepository implements ITeamsRepository {
  private readonly baseUrl = '/teams';

  constructor(@inject(CORE_SYMBOLS.IHttpClient) http: IHttpClient) {
    super(http);
  }

  async getTeams(params?: ListTeamsParams): Promise<TeamListItem[]> {
    const queryString = this.buildQueryString({
      search: params?.search ?? '',
      status: params?.status,
      department: params?.department,
      type: params?.type,
    });

    return this.get<TeamListItem[]>(
      this.appendQuery(this.baseUrl, queryString),
      'Failed to fetch teams'
    );
  }

  async getTeamById(id: string): Promise<TeamDetail | null> {
    try {
      return await this.get<TeamDetail>(
        `${this.baseUrl}/${id}`,
        'Failed to fetch team'
      );
    } catch {
      return null;
    }
  }

  async createTeam(data: CreateTeamPayload): Promise<Team> {
    return this.post<Team, CreateTeamPayload>(
      this.baseUrl,
      data,
      'Failed to create team'
    );
  }

  async updateTeam(id: string, data: UpdateTeamPayload): Promise<Team> {
    return this.put<Team, UpdateTeamPayload>(
      `${this.baseUrl}/${id}`,
      data,
      'Failed to update team'
    );
  }

  async deleteTeam(id: string): Promise<void> {
    return this.delete<void>(
      `${this.baseUrl}/${id}`,
      'Failed to delete team'
    );
  }

  async getStats(): Promise<TeamStats> {
    return this.get<TeamStats>(
      `${this.baseUrl}/stats`,
      'Failed to fetch team statistics'
    );
  }

  async archiveTeam(id: string): Promise<Team> {
    return this.post<Team, Record<string, never>>(
      `${this.baseUrl}/${id}/archive`,
      {},
      'Failed to archive team'
    );
  }

  async unarchiveTeam(id: string): Promise<Team> {
    return this.post<Team, Record<string, never>>(
      `${this.baseUrl}/${id}/unarchive`,
      {},
      'Failed to unarchive team'
    );
  }

  async transferOwnership(id: string, data: TransferOwnershipPayload): Promise<Team> {
    return this.post<Team, TransferOwnershipPayload>(
      `${this.baseUrl}/${id}/transfer-ownership`,
      data,
      'Failed to transfer ownership'
    );
  }

  async bulkAction(ids: string[], action: TeamBulkActionType): Promise<{ success: number; failed: number }> {
    return this.post<{ success: number; failed: number }, { ids: string[]; action: TeamBulkActionType }>(
      `${this.baseUrl}/bulk-action`,
      { ids, action },
      'Failed to perform bulk action'
    );
  }

  // Members
  async getMembers(teamId: string, params?: ListMembersParams): Promise<TeamMember[]> {
    const queryString = this.buildQueryString({
      search: params?.search ?? '',
      role: params?.role,
      status: params?.status,
    });

    return this.get<TeamMember[]>(
      this.appendQuery(`${this.baseUrl}/${teamId}/members`, queryString),
      'Failed to fetch team members'
    );
  }

  async addMembers(teamId: string, data: AddMembersPayload): Promise<TeamMember[]> {
    return this.post<TeamMember[], AddMembersPayload>(
      `${this.baseUrl}/${teamId}/members`,
      data,
      'Failed to add members'
    );
  }

  async inviteMembers(teamId: string, data: InviteMembersPayload): Promise<InviteMembersResult> {
    return this.post<InviteMembersResult, InviteMembersPayload>(
      `${this.baseUrl}/${teamId}/members/invite`,
      data,
      'Failed to invite members'
    );
  }

  async updateMember(teamId: string, memberId: string, data: UpdateMemberPayload): Promise<TeamMember> {
    return this.put<TeamMember, UpdateMemberPayload>(
      `${this.baseUrl}/${teamId}/members/${memberId}`,
      data,
      'Failed to update member'
    );
  }

  async removeMember(teamId: string, memberId: string): Promise<void> {
    return this.delete<void>(
      `${this.baseUrl}/${teamId}/members/${memberId}`,
      'Failed to remove member'
    );
  }

  async resendMemberInvite(teamId: string, memberId: string): Promise<{ success: boolean; message: string }> {
    return this.post<{ success: boolean; message: string }, Record<string, never>>(
      `${this.baseUrl}/${teamId}/members/${memberId}/resend-invite`,
      {},
      'Failed to resend invitation'
    );
  }

  // Activity
  async getActivity(teamId: string, params?: ListActivityParams): Promise<TeamActivity[]> {
    const queryString = this.buildQueryString({
      type: params?.type,
      actorId: params?.actorId,
      limit: params?.limit,
      offset: params?.offset,
    });

    return this.get<TeamActivity[]>(
      this.appendQuery(`${this.baseUrl}/${teamId}/activity`, queryString),
      'Failed to fetch team activity'
    );
  }
}
