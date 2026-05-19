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
} from '../models';

/**
 * List Users Parameters
 */
export interface ListUsersParams {
  search?: string;
  status?: string;
  role?: string;
  activityDays?: number;
}

/**
 * Users Repository Interface
 * 
 * Defines the contract for user management data access
 */
export interface IUsersRepository {
  // User CRUD
  getUsers(params?: ListUsersParams): Promise<UserListItem[]>;
  getUserById(id: string): Promise<User | null>;
  createUser(data: InviteUserPayload): Promise<User>;
  updateUser(id: string, data: UpdateUserPayload): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  // User Statistics
  getStats(): Promise<UserStats>;
  
  // Lifecycle Actions
  activateUser(id: string): Promise<User>;
  deactivateUser(id: string): Promise<User>;
  suspendUser(id: string, reason?: string): Promise<User>;
  restoreUser(id: string): Promise<User>;
  
  // Bulk Actions
  bulkAction(ids: string[], action: BulkActionType): Promise<{ success: number; failed: number }>;
  
  // Email Actions (integrates with Notifications module)
  resendInvitation(id: string): Promise<SendEmailResult>;
  sendPasswordReset(id: string): Promise<SendEmailResult>;
  sendVerificationEmail(id: string): Promise<SendEmailResult>;
  
  // Sessions
  getSessions(userId: string): Promise<UserSession[]>;
  terminateSession(userId: string, sessionId: string): Promise<void>;
  terminateAllSessions(userId: string): Promise<void>;
  
  // Activity Log
  getActivityLog(userId: string): Promise<ActivityLogEntry[]>;
  
  // Import/Export
  importUsers(users: ImportUserItem[], sendInvites: boolean): Promise<ImportUsersResult>;
  exportUsers(params?: ListUsersParams): Promise<Blob>;
}
