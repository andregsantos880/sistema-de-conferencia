/**
 * Team Status Types
 */
export type TeamStatus = 'active' | 'archived';

/**
 * Team Type Categories
 */
export type TeamType = 'functional' | 'project' | 'cross-functional' | 'other';

/**
 * Team Member Role
 */
export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';

/**
 * Team Member Status
 */
export type TeamMemberStatus = 'active' | 'invited' | 'pending';

/**
 * Bulk Action Types for Teams
 */
export type TeamBulkActionType = 'archive' | 'unarchive' | 'delete';

/**
 * Team Entity - Core team model
 */
export interface Team {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: TeamStatus;
  department?: string;
  type: TeamType;
  ownerId: string;
  membersCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Team list item - lighter version for list views
 */
export interface TeamListItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: TeamStatus;
  department?: string;
  type: TeamType;
  ownerId: string;
  ownerName: string;
  ownerAvatarUrl?: string;
  membersCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Team with full details including owner info
 */
export interface TeamDetail extends Team {
  ownerName: string;
  ownerEmail: string;
  ownerAvatarUrl?: string;
}

/**
 * Team Member - represents a user's membership in a team
 */
export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatarUrl?: string;
  role: TeamRole;
  status: TeamMemberStatus;
  joinedAt: string;
}

/**
 * Team Activity Entry - tracks team-related events
 */
export interface TeamActivity {
  id: string;
  teamId: string;
  type: string;
  message: string;
  actorUserId: string;
  actorName: string;
  actorAvatarUrl?: string;
  targetUserId?: string;
  targetUserName?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

/**
 * Create Team Payload
 */
export interface CreateTeamPayload {
  name: string;
  slug?: string;
  description?: string;
  department?: string;
  type: TeamType;
  ownerId?: string;
}

/**
 * Update Team Payload
 */
export interface UpdateTeamPayload {
  name?: string;
  slug?: string;
  description?: string;
  department?: string;
  type?: TeamType;
}

/**
 * Add Members Payload
 */
export interface AddMembersPayload {
  userIds: string[];
  role: TeamRole;
}

/**
 * Invite Members by Email Payload
 */
export interface InviteMembersPayload {
  emails: string[];
  role: TeamRole;
  sendInvitations: boolean;
}

/**
 * Update Member Payload
 */
export interface UpdateMemberPayload {
  role?: TeamRole;
  status?: TeamMemberStatus;
}

/**
 * Transfer Ownership Payload
 */
export interface TransferOwnershipPayload {
  newOwnerId: string;
}

/**
 * Team Statistics
 */
export interface TeamStats {
  total: number;
  active: number;
  archived: number;
  byType: Record<TeamType, number>;
  byDepartment: Record<string, number>;
}

/**
 * Role Labels
 */
export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
  viewer: 'Viewer',
};

/**
 * Status Labels
 */
export const TEAM_STATUS_LABELS: Record<TeamStatus, string> = {
  active: 'Active',
  archived: 'Archived',
};

/**
 * Member Status Labels
 */
export const MEMBER_STATUS_LABELS: Record<TeamMemberStatus, string> = {
  active: 'Active',
  invited: 'Invited',
  pending: 'Pending',
};

/**
 * Team Type Labels
 */
export const TEAM_TYPE_LABELS: Record<TeamType, string> = {
  functional: 'Functional',
  project: 'Project',
  'cross-functional': 'Cross-functional',
  other: 'Other',
};

/**
 * Available Departments (shared with Users module)
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
