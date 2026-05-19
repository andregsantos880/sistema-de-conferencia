import type {
  Team,
  TeamListItem,
  TeamDetail,
  TeamMember,
  TeamActivity,
  TeamType,
  TeamRole,
  TeamMemberStatus,
} from '../../domain/models';
import { usersDb } from '@/modules/management/users/infrastructure/mocks/usersData';

// Helper to generate random date in the past
function randomPastDate(maxDaysAgo: number): string {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * maxDaysAgo);
  now.setDate(now.getDate() - daysAgo);
  return now.toISOString();
}

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Mock Teams Database
export const teamsDb: Team[] = [
  {
    id: 'team-1',
    name: 'Platform Engineering',
    slug: 'platform-engineering',
    description: 'Core platform development and infrastructure team responsible for building scalable systems.',
    status: 'active',
    department: 'Engineering',
    type: 'functional',
    ownerId: 'user-1', // John Smith
    membersCount: 5,
    createdAt: '2023-01-10T10:00:00Z',
    updatedAt: randomPastDate(7),
  },
  {
    id: 'team-2',
    name: 'Growth Squad',
    slug: 'growth-squad',
    description: 'Cross-functional team focused on user acquisition and retention strategies.',
    status: 'active',
    department: 'Product',
    type: 'cross-functional',
    ownerId: 'user-2', // Sarah Johnson
    membersCount: 4,
    createdAt: '2023-02-15T14:30:00Z',
    updatedAt: randomPastDate(14),
  },
  {
    id: 'team-3',
    name: 'Mobile App Project',
    slug: 'mobile-app-project',
    description: 'Temporary project team for the new mobile application development.',
    status: 'active',
    department: 'Engineering',
    type: 'project',
    ownerId: 'user-7', // James Brown
    membersCount: 6,
    createdAt: '2023-06-01T09:00:00Z',
    updatedAt: randomPastDate(5),
  },
  {
    id: 'team-4',
    name: 'Customer Success',
    slug: 'customer-success',
    description: 'Team dedicated to ensuring customer satisfaction and success with our products.',
    status: 'active',
    department: 'Customer Success',
    type: 'functional',
    ownerId: 'user-9', // Robert Taylor
    membersCount: 3,
    createdAt: '2023-03-20T11:00:00Z',
    updatedAt: randomPastDate(10),
  },
  {
    id: 'team-5',
    name: 'Brand & Marketing',
    slug: 'brand-marketing',
    description: 'Marketing team responsible for brand strategy and campaigns.',
    status: 'archived',
    department: 'Marketing',
    type: 'functional',
    ownerId: 'user-9', // Robert Taylor
    membersCount: 2,
    createdAt: '2022-11-05T08:00:00Z',
    updatedAt: randomPastDate(60),
  },
  {
    id: 'team-6',
    name: 'Data Analytics',
    slug: 'data-analytics',
    description: 'Team focused on data analysis, reporting, and business intelligence.',
    status: 'active',
    department: 'Operations',
    type: 'functional',
    ownerId: 'user-10', // Amanda Garcia
    membersCount: 3,
    createdAt: '2023-04-10T13:00:00Z',
    updatedAt: randomPastDate(3),
  },
];

// Mock Team Members Database
export const teamMembersDb: TeamMember[] = [
  // Platform Engineering (team-1)
  { id: 'member-1', teamId: 'team-1', userId: 'user-1', userName: 'John Smith', userEmail: 'john.smith@example.com', userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john', role: 'owner', status: 'active', joinedAt: '2023-01-10T10:00:00Z' },
  { id: 'member-2', teamId: 'team-1', userId: 'user-3', userName: 'Michael Chen', userEmail: 'michael.chen@example.com', userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', role: 'admin', status: 'active', joinedAt: '2023-01-15T09:00:00Z' },
  { id: 'member-3', teamId: 'team-1', userId: 'user-7', userName: 'James Brown', userEmail: 'james.brown@example.com', userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james', role: 'member', status: 'active', joinedAt: '2023-02-01T11:00:00Z' },
  { id: 'member-4', teamId: 'team-1', userId: 'user-4', userName: 'Emily Davis', userEmail: 'emily.davis@example.com', userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily', role: 'member', status: 'invited', joinedAt: randomPastDate(7) },
  { id: 'member-5', teamId: 'team-1', userId: 'user-8', userName: 'Jennifer Martinez', userEmail: 'jennifer.martinez@example.com', userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jennifer', role: 'viewer', status: 'pending', joinedAt: randomPastDate(3) },

  // Growth Squad (team-2)
  { id: 'member-6', teamId: 'team-2', userId: 'user-2', userName: 'Sarah Johnson', userEmail: 'sarah.johnson@example.com', userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', role: 'owner', status: 'active', joinedAt: '2023-02-15T14:30:00Z' },
  { id: 'member-7', teamId: 'team-2', userId: 'user-3', userName: 'Michael Chen', userEmail: 'michael.chen@example.com', userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', role: 'member', status: 'active', joinedAt: '2023-02-20T10:00:00Z' },
  { id: 'member-8', teamId: 'team-2', userId: 'user-10', userName: 'Amanda Garcia', userEmail: 'amanda.garcia@example.com', userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amanda', role: 'member', status: 'active', joinedAt: '2023-03-01T09:00:00Z' },
  { id: 'member-9', teamId: 'team-2', userId: 'user-9', userName: 'Robert Taylor', userEmail: 'robert.taylor@example.com', userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=robert', role: 'admin', status: 'active', joinedAt: '2023-02-18T11:00:00Z' },

  // Mobile App Project (team-3)
  { id: 'member-10', teamId: 'team-3', userId: 'user-7', userName: 'James Brown', userEmail: 'james.brown@example.com', userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james', role: 'owner', status: 'active', joinedAt: '2023-06-01T09:00:00Z' },
  { id: 'member-11', teamId: 'team-3', userId: 'user-1', userName: 'John Smith', userEmail: 'john.smith@example.com', userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john', role: 'admin', status: 'active', joinedAt: '2023-06-01T09:00:00Z' },
  { id: 'member-12', teamId: 'team-3', userId: 'user-3', userName: 'Michael Chen', userEmail: 'michael.chen@example.com', userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', role: 'member', status: 'active', joinedAt: '2023-06-05T10:00:00Z' },
  { id: 'member-13', teamId: 'team-3', userId: 'user-2', userName: 'Sarah Johnson', userEmail: 'sarah.johnson@example.com', userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', role: 'member', status: 'active', joinedAt: '2023-06-10T11:00:00Z' },
  { id: 'member-14', teamId: 'team-3', userId: 'user-10', userName: 'Amanda Garcia', userEmail: 'amanda.garcia@example.com', userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amanda', role: 'viewer', status: 'active', joinedAt: '2023-06-15T14:00:00Z' },
  { id: 'member-15', teamId: 'team-3', userId: 'user-4', userName: 'Emily Davis', userEmail: 'emily.davis@example.com', userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily', role: 'member', status: 'invited', joinedAt: randomPastDate(5) },

  // Customer Success (team-4)
  { id: 'member-16', teamId: 'team-4', userId: 'user-9', userName: 'Robert Taylor', userEmail: 'robert.taylor@example.com', userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=robert', role: 'owner', status: 'active', joinedAt: '2023-03-20T11:00:00Z' },
  { id: 'member-17', teamId: 'team-4', userId: 'user-8', userName: 'Jennifer Martinez', userEmail: 'jennifer.martinez@example.com', userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jennifer', role: 'member', status: 'invited', joinedAt: randomPastDate(10) },
  { id: 'member-18', teamId: 'team-4', userId: 'user-2', userName: 'Sarah Johnson', userEmail: 'sarah.johnson@example.com', userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', role: 'admin', status: 'active', joinedAt: '2023-03-25T09:00:00Z' },

  // Brand & Marketing (team-5 - archived)
  { id: 'member-19', teamId: 'team-5', userId: 'user-9', userName: 'Robert Taylor', userEmail: 'robert.taylor@example.com', userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=robert', role: 'owner', status: 'active', joinedAt: '2022-11-05T08:00:00Z' },
  { id: 'member-20', teamId: 'team-5', userId: 'user-6', userName: 'Lisa Anderson', userEmail: 'lisa.anderson@example.com', userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa', role: 'member', status: 'active', joinedAt: '2022-11-10T10:00:00Z' },

  // Data Analytics (team-6)
  { id: 'member-21', teamId: 'team-6', userId: 'user-10', userName: 'Amanda Garcia', userEmail: 'amanda.garcia@example.com', userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amanda', role: 'owner', status: 'active', joinedAt: '2023-04-10T13:00:00Z' },
  { id: 'member-22', teamId: 'team-6', userId: 'user-3', userName: 'Michael Chen', userEmail: 'michael.chen@example.com', userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', role: 'admin', status: 'active', joinedAt: '2023-04-15T09:00:00Z' },
  { id: 'member-23', teamId: 'team-6', userId: 'user-9', userName: 'Robert Taylor', userEmail: 'robert.taylor@example.com', userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=robert', role: 'viewer', status: 'active', joinedAt: '2023-04-20T11:00:00Z' },
];

// Mock Team Activity Database
export const teamActivityDb: TeamActivity[] = [
  // Platform Engineering activities
  { id: 'activity-1', teamId: 'team-1', type: 'team.created', message: 'Team created', actorUserId: 'user-1', actorName: 'John Smith', actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john', createdAt: '2023-01-10T10:00:00Z' },
  { id: 'activity-2', teamId: 'team-1', type: 'member.added', message: 'Michael Chen was added to the team', actorUserId: 'user-1', actorName: 'John Smith', actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john', targetUserId: 'user-3', targetUserName: 'Michael Chen', createdAt: '2023-01-15T09:00:00Z' },
  { id: 'activity-3', teamId: 'team-1', type: 'role.changed', message: 'Michael Chen role changed from Member to Admin', actorUserId: 'user-1', actorName: 'John Smith', actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john', targetUserId: 'user-3', targetUserName: 'Michael Chen', metadata: { oldRole: 'member', newRole: 'admin' }, createdAt: '2023-01-20T14:00:00Z' },
  { id: 'activity-4', teamId: 'team-1', type: 'member.added', message: 'James Brown was added to the team', actorUserId: 'user-1', actorName: 'John Smith', actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john', targetUserId: 'user-7', targetUserName: 'James Brown', createdAt: '2023-02-01T11:00:00Z' },
  { id: 'activity-5', teamId: 'team-1', type: 'member.invited', message: 'Emily Davis was invited to the team', actorUserId: 'user-3', actorName: 'Michael Chen', actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', targetUserId: 'user-4', targetUserName: 'Emily Davis', createdAt: randomPastDate(7) },
  { id: 'activity-6', teamId: 'team-1', type: 'team.updated', message: 'Team description updated', actorUserId: 'user-1', actorName: 'John Smith', actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john', createdAt: randomPastDate(5) },

  // Growth Squad activities
  { id: 'activity-7', teamId: 'team-2', type: 'team.created', message: 'Team created', actorUserId: 'user-2', actorName: 'Sarah Johnson', actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', createdAt: '2023-02-15T14:30:00Z' },
  { id: 'activity-8', teamId: 'team-2', type: 'member.added', message: 'Robert Taylor was added to the team', actorUserId: 'user-2', actorName: 'Sarah Johnson', actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', targetUserId: 'user-9', targetUserName: 'Robert Taylor', createdAt: '2023-02-18T11:00:00Z' },
  { id: 'activity-9', teamId: 'team-2', type: 'member.added', message: 'Michael Chen was added to the team', actorUserId: 'user-2', actorName: 'Sarah Johnson', actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', targetUserId: 'user-3', targetUserName: 'Michael Chen', createdAt: '2023-02-20T10:00:00Z' },

  // Mobile App Project activities
  { id: 'activity-10', teamId: 'team-3', type: 'team.created', message: 'Team created', actorUserId: 'user-7', actorName: 'James Brown', actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james', createdAt: '2023-06-01T09:00:00Z' },
  { id: 'activity-11', teamId: 'team-3', type: 'member.added', message: 'John Smith was added to the team as Admin', actorUserId: 'user-7', actorName: 'James Brown', actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james', targetUserId: 'user-1', targetUserName: 'John Smith', createdAt: '2023-06-01T09:00:00Z' },

  // Customer Success activities
  { id: 'activity-12', teamId: 'team-4', type: 'team.created', message: 'Team created', actorUserId: 'user-9', actorName: 'Robert Taylor', actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=robert', createdAt: '2023-03-20T11:00:00Z' },

  // Brand & Marketing activities (archived team)
  { id: 'activity-13', teamId: 'team-5', type: 'team.created', message: 'Team created', actorUserId: 'user-9', actorName: 'Robert Taylor', actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=robert', createdAt: '2022-11-05T08:00:00Z' },
  { id: 'activity-14', teamId: 'team-5', type: 'team.archived', message: 'Team archived', actorUserId: 'user-9', actorName: 'Robert Taylor', actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=robert', createdAt: randomPastDate(60) },

  // Data Analytics activities
  { id: 'activity-15', teamId: 'team-6', type: 'team.created', message: 'Team created', actorUserId: 'user-10', actorName: 'Amanda Garcia', actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amanda', createdAt: '2023-04-10T13:00:00Z' },
  { id: 'activity-16', teamId: 'team-6', type: 'member.added', message: 'Michael Chen was added to the team', actorUserId: 'user-10', actorName: 'Amanda Garcia', actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amanda', targetUserId: 'user-3', targetUserName: 'Michael Chen', createdAt: '2023-04-15T09:00:00Z' },
];

// Helper functions
export function getTeamById(id: string): Team | undefined {
  return teamsDb.find((t) => t.id === id);
}

export function getTeamDetailById(id: string): TeamDetail | undefined {
  const team = teamsDb.find((t) => t.id === id);
  if (!team) return undefined;

  const owner = usersDb.find((u) => u.id === team.ownerId);
  return {
    ...team,
    ownerName: owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown',
    ownerEmail: owner?.email || '',
    ownerAvatarUrl: owner?.avatarUrl,
  };
}

export function getTeamListItem(team: Team): TeamListItem {
  const owner = usersDb.find((u) => u.id === team.ownerId);
  return {
    ...team,
    ownerName: owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown',
    ownerAvatarUrl: owner?.avatarUrl,
  };
}

export function getTeamMembers(teamId: string): TeamMember[] {
  return teamMembersDb.filter((m) => m.teamId === teamId);
}

export function getTeamActivity(teamId: string): TeamActivity[] {
  return teamActivityDb
    .filter((a) => a.teamId === teamId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function updateTeamInDb(id: string, updates: Partial<Team>): Team | undefined {
  const idx = teamsDb.findIndex((t) => t.id === id);
  if (idx === -1) return undefined;

  teamsDb[idx] = {
    ...teamsDb[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return teamsDb[idx];
}

export function deleteTeamFromDb(id: string): boolean {
  const idx = teamsDb.findIndex((t) => t.id === id);
  if (idx === -1) return false;

  // Remove team
  teamsDb.splice(idx, 1);

  // Remove all members
  const memberIndicesToRemove = teamMembersDb
    .map((m, i) => (m.teamId === id ? i : -1))
    .filter((i) => i !== -1)
    .reverse();
  memberIndicesToRemove.forEach((i) => teamMembersDb.splice(i, 1));

  // Remove all activity
  const activityIndicesToRemove = teamActivityDb
    .map((a, i) => (a.teamId === id ? i : -1))
    .filter((i) => i !== -1)
    .reverse();
  activityIndicesToRemove.forEach((i) => teamActivityDb.splice(i, 1));

  return true;
}

export function createTeamInDb(data: {
  name: string;
  slug?: string;
  description?: string;
  department?: string;
  type: TeamType;
  ownerId: string;
}): Team {
  const now = new Date().toISOString();
  const slug = data.slug || generateSlug(data.name);

  const newTeam: Team = {
    id: `team-${Date.now()}`,
    name: data.name,
    slug,
    description: data.description,
    department: data.department,
    type: data.type,
    status: 'active',
    ownerId: data.ownerId,
    membersCount: 1,
    createdAt: now,
    updatedAt: now,
  };

  teamsDb.unshift(newTeam);

  // Add owner as first member
  const owner = usersDb.find((u) => u.id === data.ownerId);
  if (owner) {
    teamMembersDb.push({
      id: `member-${Date.now()}`,
      teamId: newTeam.id,
      userId: owner.id,
      userName: `${owner.firstName} ${owner.lastName}`,
      userEmail: owner.email,
      userAvatarUrl: owner.avatarUrl,
      role: 'owner',
      status: 'active',
      joinedAt: now,
    });
  }

  // Add creation activity
  teamActivityDb.unshift({
    id: `activity-${Date.now()}`,
    teamId: newTeam.id,
    type: 'team.created',
    message: 'Team created',
    actorUserId: data.ownerId,
    actorName: owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown',
    actorAvatarUrl: owner?.avatarUrl,
    createdAt: now,
  });

  return newTeam;
}

export function addTeamActivity(
  teamId: string,
  activity: Omit<TeamActivity, 'id' | 'teamId' | 'createdAt'>
): TeamActivity {
  const newActivity: TeamActivity = {
    ...activity,
    id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    teamId,
    createdAt: new Date().toISOString(),
  };

  teamActivityDb.unshift(newActivity);
  return newActivity;
}

export function addTeamMember(
  teamId: string,
  userId: string,
  role: TeamRole,
  status: TeamMemberStatus = 'active'
): TeamMember | null {
  const user = usersDb.find((u) => u.id === userId);
  if (!user) return null;

  // Check if already a member
  const existing = teamMembersDb.find((m) => m.teamId === teamId && m.userId === userId);
  if (existing) return existing;

  const newMember: TeamMember = {
    id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    teamId,
    userId,
    userName: `${user.firstName} ${user.lastName}`,
    userEmail: user.email,
    userAvatarUrl: user.avatarUrl,
    role,
    status,
    joinedAt: new Date().toISOString(),
  };

  teamMembersDb.push(newMember);

  // Update team members count
  const team = teamsDb.find((t) => t.id === teamId);
  if (team) {
    team.membersCount = teamMembersDb.filter((m) => m.teamId === teamId).length;
    team.updatedAt = new Date().toISOString();
  }

  return newMember;
}

export function updateTeamMember(
  teamId: string,
  memberId: string,
  updates: { role?: TeamRole; status?: TeamMemberStatus }
): TeamMember | undefined {
  const idx = teamMembersDb.findIndex((m) => m.id === memberId && m.teamId === teamId);
  if (idx === -1) return undefined;

  teamMembersDb[idx] = {
    ...teamMembersDb[idx],
    ...updates,
  };

  return teamMembersDb[idx];
}

export function removeTeamMember(teamId: string, memberId: string): boolean {
  const idx = teamMembersDb.findIndex((m) => m.id === memberId && m.teamId === teamId);
  if (idx === -1) return false;

  teamMembersDb.splice(idx, 1);

  // Update team members count
  const team = teamsDb.find((t) => t.id === teamId);
  if (team) {
    team.membersCount = teamMembersDb.filter((m) => m.teamId === teamId).length;
    team.updatedAt = new Date().toISOString();
  }

  return true;
}

export function getTeamMemberById(teamId: string, memberId: string): TeamMember | undefined {
  return teamMembersDb.find((m) => m.id === memberId && m.teamId === teamId);
}

export function getTeamOwners(teamId: string): TeamMember[] {
  return teamMembersDb.filter((m) => m.teamId === teamId && m.role === 'owner');
}
