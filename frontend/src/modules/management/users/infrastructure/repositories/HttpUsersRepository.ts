import { injectable, inject } from 'inversify';
import { CORE_SYMBOLS } from '@/core/di/symbols';
import type { IHttpClient } from '@/shared/infrastructure/http/HttpClient';
import { BaseRepository } from '@/shared/infrastructure/repositories';
import type { IUsersRepository, ListUsersParams } from '../../domain/ports/IUsersRepository';
import type {
  User,
  UserListItem,
  InviteUserPayload,
  UpdateUserPayload,
  BulkActionType,
  ImportUserItem,
  ImportUsersResult,
  SendEmailResult,
  UserStats,
  ActivityLogEntry,
  UserSession,
} from '../../domain/models';

@injectable()
export class HttpUsersRepository extends BaseRepository implements IUsersRepository {
  private readonly baseUrl = '/users';

  constructor(@inject(CORE_SYMBOLS.IHttpClient) http: IHttpClient) {
    super(http);
  }

  async getUsers(params?: ListUsersParams): Promise<UserListItem[]> {
    const queryString = this.buildQueryString({
      search: params?.search ?? '',
      status: params?.status,
      role: params?.role,
      activityDays: params?.activityDays,
    });

    return this.get<UserListItem[]>(
      this.appendQuery(this.baseUrl, queryString),
      'Failed to fetch users'
    );
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      return await this.get<User>(
        `${this.baseUrl}/${id}`,
        'Failed to fetch user'
      );
    } catch {
      return null;
    }
  }

  async createUser(data: InviteUserPayload): Promise<User> {
    return this.post<User, InviteUserPayload>(
      this.baseUrl,
      data,
      'Failed to create user'
    );
  }

  async updateUser(id: string, data: UpdateUserPayload): Promise<User> {
    return this.put<User, UpdateUserPayload>(
      `${this.baseUrl}/${id}`,
      data,
      'Failed to update user'
    );
  }

  async deleteUser(id: string): Promise<void> {
    return this.delete<void>(
      `${this.baseUrl}/${id}`,
      'Failed to delete user'
    );
  }

  async getStats(): Promise<UserStats> {
    return this.get<UserStats>(
      `${this.baseUrl}/stats`,
      'Failed to fetch user statistics'
    );
  }

  async activateUser(id: string): Promise<User> {
    return this.post<User, Record<string, never>>(
      `${this.baseUrl}/${id}/actions/activate`,
      {},
      'Failed to activate user'
    );
  }

  async deactivateUser(id: string): Promise<User> {
    return this.post<User, Record<string, never>>(
      `${this.baseUrl}/${id}/actions/deactivate`,
      {},
      'Failed to deactivate user'
    );
  }

  async suspendUser(id: string, reason?: string): Promise<User> {
    return this.post<User, { reason?: string }>(
      `${this.baseUrl}/${id}/actions/suspend`,
      { reason },
      'Failed to suspend user'
    );
  }

  async restoreUser(id: string): Promise<User> {
    return this.post<User, Record<string, never>>(
      `${this.baseUrl}/${id}/actions/restore`,
      {},
      'Failed to restore user'
    );
  }

  async bulkAction(ids: string[], action: BulkActionType): Promise<{ success: number; failed: number }> {
    return this.post<{ success: number; failed: number }, { ids: string[]; action: BulkActionType }>(
      `${this.baseUrl}/bulk-action`,
      { ids, action },
      'Failed to perform bulk action'
    );
  }

  async resendInvitation(id: string): Promise<SendEmailResult> {
    return this.post<SendEmailResult, Record<string, never>>(
      `${this.baseUrl}/${id}/actions/resend-invite`,
      {},
      'Failed to resend invitation'
    );
  }

  async sendPasswordReset(id: string): Promise<SendEmailResult> {
    return this.post<SendEmailResult, Record<string, never>>(
      `${this.baseUrl}/${id}/actions/send-password-reset`,
      {},
      'Failed to send password reset email'
    );
  }

  async sendVerificationEmail(id: string): Promise<SendEmailResult> {
    return this.post<SendEmailResult, Record<string, never>>(
      `${this.baseUrl}/${id}/actions/resend-verification`,
      {},
      'Failed to send verification email'
    );
  }

  async getSessions(userId: string): Promise<UserSession[]> {
    return this.get<UserSession[]>(
      `${this.baseUrl}/${userId}/sessions`,
      'Failed to fetch user sessions'
    );
  }

  async terminateSession(userId: string, sessionId: string): Promise<void> {
    return this.delete<void>(
      `${this.baseUrl}/${userId}/sessions/${sessionId}`,
      'Failed to terminate session'
    );
  }

  async terminateAllSessions(userId: string): Promise<void> {
    return this.delete<void>(
      `${this.baseUrl}/${userId}/sessions`,
      'Failed to terminate all sessions'
    );
  }

  async getActivityLog(userId: string): Promise<ActivityLogEntry[]> {
    return this.get<ActivityLogEntry[]>(
      `${this.baseUrl}/${userId}/activity-log`,
      'Failed to fetch activity log'
    );
  }

  async importUsers(users: ImportUserItem[], sendInvites: boolean): Promise<ImportUsersResult> {
    return this.post<ImportUsersResult, { users: ImportUserItem[]; sendInvites: boolean }>(
      `${this.baseUrl}/import`,
      { users, sendInvites },
      'Failed to import users'
    );
  }

  async exportUsers(params?: ListUsersParams): Promise<Blob> {
    const queryString = this.buildQueryString({
      search: params?.search ?? '',
      status: params?.status,
      role: params?.role,
      activityDays: params?.activityDays,
    });

    // For export, we'll get JSON and convert to Blob client-side
    const users = await this.get<UserListItem[]>(
      this.appendQuery(`${this.baseUrl}/export`, queryString),
      'Failed to export users'
    );

    return new Blob([JSON.stringify(users, null, 2)], { type: 'application/json' });
  }
}
