/**
 * User Status Types
 */
export type UserStatus = 'active' | 'invited' | 'suspended' | 'deactivated' | 'pending';

/**
 * User Role Types
 */
export type UserRole = 'admin' | 'manager' | 'member' | 'viewer';

/**
 * Activity Filter Types - for filtering by last login time
 */
export type ActivityFilter = 'all' | '7' | '30' | '90';

/**
 * User Session - represents an active login session
 */
export interface UserSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastUsed: string;
  current: boolean;
}

/**
 * Activity Log Entry - tracks user-related events
 */
export interface ActivityLogEntry {
  id: string;
  action: string;
  description: string;
  performedBy: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * User Entity - Core user model
 */
export interface User {
  id: string;
  avatarUrl?: string;
  firstName: string;
  lastName: string;
  email: string;
  secondaryEmails?: string[];
  phone?: string;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  isMfaEnabled: boolean;
  lastLoginAt?: string;
  loginCount: number;
  createdAt: string;
  updatedAt: string;
  invitedAt?: string;
  invitedBy?: string;
  department?: string;
  jobTitle?: string;
  team?: string;
  timezone: string;
  locale: string;
  sessions: UserSession[];
  activityLog: ActivityLogEntry[];
}

/**
 * User list item - lighter version for list views
 */
export interface UserListItem {
  id: string;
  avatarUrl?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: string;
  createdAt: string;
}

/**
 * Invite User Payload
 */
export interface InviteUserPayload {
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  team?: string;
  sendInvite: boolean;
}

/**
 * Update User Payload
 */
export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  timezone?: string;
  locale?: string;
  role?: UserRole;
}

/**
 * Bulk Action Types
 */
export type BulkActionType = 'activate' | 'deactivate' | 'resend_invitation' | 'delete';

/**
 * Import User Item
 */
export interface ImportUserItem {
  email: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

/**
 * Import Users Result
 */
export interface ImportUsersResult {
  imported: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}

/**
 * Send Email Action Result
 */
export interface SendEmailResult {
  success: boolean;
  message: string;
  sentAt?: string;
}

/**
 * User Statistics
 */
export interface UserStats {
  total: number;
  active: number;
  invited: number;
  suspended: number;
  deactivated: number;
}

/**
 * Role Labels
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  member: 'Member',
  viewer: 'Viewer',
};

/**
 * Status Labels
 */
export const STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Active',
  invited: 'Invited',
  suspended: 'Suspended',
  deactivated: 'Deactivated',
  pending: 'Pending',
};

/**
 * Available Departments
 */
export const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Customer Success',
  'Operations',
  'Finance',
  'Human Resources',
  'Legal',
] as const;

/**
 * Available Timezones
 */
export const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Australia/Sydney',
] as const;

/**
 * Available Locales
 */
export const LOCALES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'es-ES', label: 'Spanish (Spain)' },
  { code: 'es-MX', label: 'Spanish (Mexico)' },
  { code: 'fr-FR', label: 'French' },
  { code: 'de-DE', label: 'German' },
  { code: 'pt-BR', label: 'Portuguese (Brazil)' },
  { code: 'ja-JP', label: 'Japanese' },
  { code: 'zh-CN', label: 'Chinese (Simplified)' },
] as const;
