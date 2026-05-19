import type { User, UserStatus, UserRole, ActivityLogEntry, UserSession } from '../../domain/models';

// Helper to generate random date in the past
function randomPastDate(maxDaysAgo: number): string {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * maxDaysAgo);
  now.setDate(now.getDate() - daysAgo);
  return now.toISOString();
}

// Helper to generate activity log
function generateActivityLog(userId: string, status: UserStatus): ActivityLogEntry[] {
  const logs: ActivityLogEntry[] = [];
  
  // User created
  logs.push({
    id: `${userId}-log-1`,
    action: 'user.created',
    description: 'User account created',
    performedBy: 'System',
    timestamp: randomPastDate(90),
  });

  if (status === 'invited') {
    logs.push({
      id: `${userId}-log-2`,
      action: 'user.invitation_sent',
      description: 'Invitation email sent',
      performedBy: 'Admin User',
      timestamp: randomPastDate(30),
    });
  } else if (status === 'active') {
    logs.push({
      id: `${userId}-log-2`,
      action: 'user.activated',
      description: 'Account activated',
      performedBy: 'System',
      timestamp: randomPastDate(60),
    });
    logs.push({
      id: `${userId}-log-3`,
      action: 'user.login',
      description: 'User logged in',
      performedBy: 'User',
      timestamp: randomPastDate(7),
    });
  } else if (status === 'suspended') {
    logs.push({
      id: `${userId}-log-2`,
      action: 'user.suspended',
      description: 'Account suspended due to policy violation',
      performedBy: 'Admin User',
      timestamp: randomPastDate(14),
    });
  } else if (status === 'deactivated') {
    logs.push({
      id: `${userId}-log-2`,
      action: 'user.deactivated',
      description: 'Account deactivated',
      performedBy: 'Admin User',
      timestamp: randomPastDate(30),
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// Helper to generate sessions
function generateSessions(isActive: boolean): UserSession[] {
  if (!isActive) return [];
  
  const sessions: UserSession[] = [];
  const numSessions = Math.floor(Math.random() * 3) + 1;
  
  const devices = ['MacBook Pro', 'Windows PC', 'iPhone 15', 'iPad Pro', 'Android Phone'];
  const browsers = ['Chrome 120', 'Safari 17', 'Firefox 121', 'Edge 120'];
  const locations = ['New York, US', 'San Francisco, US', 'London, UK', 'Tokyo, JP', 'Berlin, DE'];
  
  for (let i = 0; i < numSessions; i++) {
    sessions.push({
      id: `session-${Date.now()}-${i}`,
      device: devices[Math.floor(Math.random() * devices.length)],
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      location: locations[Math.floor(Math.random() * locations.length)],
      lastUsed: randomPastDate(7),
      current: i === 0,
    });
  }
  
  return sessions;
}

// Mock Users Database
export const usersDb: User[] = [
  {
    id: 'user-1',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    secondaryEmails: ['john.personal@gmail.com'],
    phone: '+1 (555) 123-4567',
    role: 'admin',
    status: 'active',
    isEmailVerified: true,
    isMfaEnabled: true,
    lastLoginAt: randomPastDate(1),
    loginCount: 156,
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: randomPastDate(7),
    department: 'Engineering',
    jobTitle: 'CTO',
    team: 'Platform',
    timezone: 'America/New_York',
    locale: 'en-US',
    sessions: generateSessions(true),
    activityLog: generateActivityLog('user-1', 'active'),
  },
  {
    id: 'user-2',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1 (555) 234-5678',
    role: 'manager',
    status: 'active',
    isEmailVerified: true,
    isMfaEnabled: false,
    lastLoginAt: randomPastDate(2),
    loginCount: 89,
    createdAt: '2023-03-20T14:30:00Z',
    updatedAt: randomPastDate(14),
    department: 'Product',
    jobTitle: 'Product Manager',
    team: 'Growth',
    timezone: 'America/Los_Angeles',
    locale: 'en-US',
    sessions: generateSessions(true),
    activityLog: generateActivityLog('user-2', 'active'),
  },
  {
    id: 'user-3',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@example.com',
    phone: '+1 (555) 345-6789',
    role: 'member',
    status: 'active',
    isEmailVerified: true,
    isMfaEnabled: true,
    lastLoginAt: randomPastDate(3),
    loginCount: 234,
    createdAt: '2023-02-10T09:15:00Z',
    updatedAt: randomPastDate(5),
    department: 'Engineering',
    jobTitle: 'Senior Developer',
    team: 'Platform',
    timezone: 'America/Chicago',
    locale: 'en-US',
    sessions: generateSessions(true),
    activityLog: generateActivityLog('user-3', 'active'),
  },
  {
    id: 'user-4',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@example.com',
    role: 'member',
    status: 'invited',
    isEmailVerified: false,
    isMfaEnabled: false,
    loginCount: 0,
    createdAt: randomPastDate(7),
    updatedAt: randomPastDate(7),
    invitedAt: randomPastDate(7),
    invitedBy: 'John Smith',
    department: 'Design',
    jobTitle: 'UI Designer',
    team: 'Product',
    timezone: 'America/New_York',
    locale: 'en-US',
    sessions: [],
    activityLog: generateActivityLog('user-4', 'invited'),
  },
  {
    id: 'user-5',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@example.com',
    phone: '+1 (555) 456-7890',
    role: 'viewer',
    status: 'suspended',
    isEmailVerified: true,
    isMfaEnabled: false,
    lastLoginAt: randomPastDate(30),
    loginCount: 45,
    createdAt: '2023-04-05T11:45:00Z',
    updatedAt: randomPastDate(14),
    department: 'Sales',
    jobTitle: 'Sales Rep',
    team: 'Enterprise',
    timezone: 'America/Denver',
    locale: 'en-US',
    sessions: [],
    activityLog: generateActivityLog('user-5', 'suspended'),
  },
  {
    id: 'user-6',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
    firstName: 'Lisa',
    lastName: 'Anderson',
    email: 'lisa.anderson@example.com',
    phone: '+1 (555) 567-8901',
    role: 'member',
    status: 'deactivated',
    isEmailVerified: true,
    isMfaEnabled: false,
    lastLoginAt: randomPastDate(60),
    loginCount: 78,
    createdAt: '2023-01-25T16:20:00Z',
    updatedAt: randomPastDate(30),
    department: 'Marketing',
    jobTitle: 'Marketing Specialist',
    team: 'Brand',
    timezone: 'America/New_York',
    locale: 'en-US',
    sessions: [],
    activityLog: generateActivityLog('user-6', 'deactivated'),
  },
  {
    id: 'user-7',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
    firstName: 'James',
    lastName: 'Brown',
    email: 'james.brown@example.com',
    phone: '+1 (555) 678-9012',
    role: 'manager',
    status: 'active',
    isEmailVerified: true,
    isMfaEnabled: true,
    lastLoginAt: randomPastDate(1),
    loginCount: 312,
    createdAt: '2022-11-10T08:00:00Z',
    updatedAt: randomPastDate(3),
    department: 'Engineering',
    jobTitle: 'Engineering Manager',
    team: 'Infrastructure',
    timezone: 'Europe/London',
    locale: 'en-GB',
    sessions: generateSessions(true),
    activityLog: generateActivityLog('user-7', 'active'),
  },
  {
    id: 'user-8',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jennifer',
    firstName: 'Jennifer',
    lastName: 'Martinez',
    email: 'jennifer.martinez@example.com',
    role: 'member',
    status: 'invited',
    isEmailVerified: false,
    isMfaEnabled: false,
    loginCount: 0,
    createdAt: randomPastDate(3),
    updatedAt: randomPastDate(3),
    invitedAt: randomPastDate(3),
    invitedBy: 'Sarah Johnson',
    department: 'Customer Success',
    jobTitle: 'Customer Success Manager',
    team: 'Support',
    timezone: 'America/Los_Angeles',
    locale: 'es-MX',
    sessions: [],
    activityLog: generateActivityLog('user-8', 'invited'),
  },
  {
    id: 'user-9',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=robert',
    firstName: 'Robert',
    lastName: 'Taylor',
    email: 'robert.taylor@example.com',
    phone: '+1 (555) 789-0123',
    role: 'admin',
    status: 'active',
    isEmailVerified: true,
    isMfaEnabled: true,
    lastLoginAt: randomPastDate(1),
    loginCount: 567,
    createdAt: '2022-06-15T12:00:00Z',
    updatedAt: randomPastDate(2),
    department: 'Operations',
    jobTitle: 'COO',
    team: 'Executive',
    timezone: 'America/New_York',
    locale: 'en-US',
    sessions: generateSessions(true),
    activityLog: generateActivityLog('user-9', 'active'),
  },
  {
    id: 'user-10',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amanda',
    firstName: 'Amanda',
    lastName: 'Garcia',
    email: 'amanda.garcia@example.com',
    phone: '+1 (555) 890-1234',
    role: 'member',
    status: 'active',
    isEmailVerified: true,
    isMfaEnabled: false,
    lastLoginAt: randomPastDate(5),
    loginCount: 123,
    createdAt: '2023-05-20T10:30:00Z',
    updatedAt: randomPastDate(10),
    department: 'Finance',
    jobTitle: 'Financial Analyst',
    team: 'Accounting',
    timezone: 'America/Chicago',
    locale: 'en-US',
    sessions: generateSessions(true),
    activityLog: generateActivityLog('user-10', 'active'),
  },
];

// Helper to add activity log entry
export function addActivityLog(userId: string, entry: Omit<ActivityLogEntry, 'id'>): void {
  const user = usersDb.find(u => u.id === userId);
  if (user) {
    user.activityLog.unshift({
      ...entry,
      id: `${userId}-log-${Date.now()}`,
    });
  }
}

// Helper to get user by ID
export function getUserById(id: string): User | undefined {
  return usersDb.find(u => u.id === id);
}

// Helper to update user
export function updateUserInDb(id: string, updates: Partial<User>): User | undefined {
  const idx = usersDb.findIndex(u => u.id === id);
  if (idx === -1) return undefined;
  
  usersDb[idx] = {
    ...usersDb[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  return usersDb[idx];
}

// Helper to delete user
export function deleteUserFromDb(id: string): boolean {
  const idx = usersDb.findIndex(u => u.id === id);
  if (idx === -1) return false;
  usersDb.splice(idx, 1);
  return true;
}

// Helper to create user
export function createUserInDb(data: {
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  team?: string;
  sendInvite: boolean;
}): User {
  const now = new Date().toISOString();
  const newUser: User = {
    id: `user-${Date.now()}`,
    email: data.email,
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    role: data.role,
    status: 'invited',
    isEmailVerified: false,
    isMfaEnabled: false,
    loginCount: 0,
    createdAt: now,
    updatedAt: now,
    invitedAt: data.sendInvite ? now : undefined,
    invitedBy: data.sendInvite ? 'Current User' : undefined,
    team: data.team,
    timezone: 'America/New_York',
    locale: 'en-US',
    sessions: [],
    activityLog: [
      {
        id: `${Date.now()}-log-1`,
        action: data.sendInvite ? 'user.invitation_sent' : 'user.created',
        description: data.sendInvite ? 'Invitation email sent' : 'User account created',
        performedBy: 'Current User',
        timestamp: now,
      },
    ],
  };
  
  usersDb.unshift(newUser);
  return newUser;
}
