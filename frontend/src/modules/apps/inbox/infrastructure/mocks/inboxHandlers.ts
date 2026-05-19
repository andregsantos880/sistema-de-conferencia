import { http, delay } from 'msw';
import { ok } from '@/mocks/utils/apiResponse';
import { api } from '@/mocks/utils/apiPath';
import { daysAgo, hoursAgo, minutesAgo } from '@/mocks/utils/demoDate';
import type {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationPreferences,
  UpdateNotificationDto,
  BulkUpdateNotificationsDto,
} from '../../domain/models/Notification';

// ============================================================================
// Mock Data - Premium Inbox with explicit action model
// ============================================================================

const notifications: Notification[] = [
  // Approval notification with inline actions
  {
    id: 'notif-0',
    title: 'Expense report requires approval',
    message: 'Sarah Johnson submitted an expense report for $1,250.00 - Q4 Marketing Campaign expenses.',
    type: 'approval',
    priority: 'high',
    isRead: false,
    isArchived: false,
    isFollowing: true,
    createdAt: minutesAgo(5),
    actor: { id: 'u3', name: 'Sarah Johnson', avatar: 'https://i.pravatar.cc/150?u=sarah' },
    context: { source: 'Finance', metadata: { amount: '$1,250.00', category: 'Marketing' } },
    actions: [
      { id: 'approve', label: 'Approve', variant: 'primary', inline: true, behavior: { type: 'api', endpoint: '/approvals/exp-123/approve', method: 'POST' } },
      { id: 'deny', label: 'Deny', variant: 'destructive', inline: true, behavior: { type: 'api', endpoint: '/approvals/exp-123/deny', method: 'POST' } },
      { id: 'view', label: 'View Details', behavior: { type: 'drawer', drawerId: 'expense-detail', params: { id: 'exp-123' } } },
    ],
    attachments: [
      { id: 'att-1', filename: 'expense_report_q4.pdf', type: 'document', url: '/files/expense_report_q4.pdf', size: 245000 },
      { id: 'att-2', filename: 'receipt_hotel.jpg', type: 'image', url: '/files/receipt_hotel.jpg', thumbnail: 'https://picsum.photos/seed/receipt1/100/100', size: 89000 },
    ],
  },
  {
    id: 'notif-1',
    title: 'New comment on your task',
    message: 'Sarah Johnson commented on "Dashboard redesign": Great progress on the new layout! The color scheme looks much better now.',
    type: 'comment',
    priority: 'normal',
    isRead: false,
    isArchived: false,
    isFollowing: true,
    createdAt: minutesAgo(15),
    actor: { id: 'u3', name: 'Sarah Johnson', avatar: 'https://i.pravatar.cc/150?u=sarah' },
    context: { source: 'Project Alpha' },
    actions: [
      { id: 'view', label: 'View Comment', variant: 'primary', behavior: { type: 'navigate', route: '/apps/kanban/board/board-1' } },
      { id: 'reply', label: 'Reply', behavior: { type: 'modal', modalId: 'reply-comment', params: { commentId: 'c-123' } } },
    ],
  },
  {
    id: 'notif-2',
    title: 'Task assigned to you',
    message: 'Michael Chen assigned you to "Implement user authentication" with high priority. Due date: January 20, 2026.',
    type: 'task',
    priority: 'high',
    isRead: false,
    isArchived: false,
    isFollowing: false,
    createdAt: hoursAgo(2),
    actor: { id: 'u2', name: 'Michael Chen', avatar: 'https://i.pravatar.cc/150?u=michael' },
    context: { source: 'Engineering Sprint 24', metadata: { dueDate: '2026-01-20', priority: 'High' } },
    actions: [
      { id: 'view', label: 'View Task', variant: 'primary', behavior: { type: 'navigate', route: '/apps/kanban/board/board-1' } },
      { id: 'follow', label: 'Follow', behavior: { type: 'api', endpoint: '/tasks/t-456/follow', method: 'POST' } },
    ],
  },
  // Security alert with inline actions
  {
    id: 'notif-3',
    title: 'Security alert: New login detected',
    message: 'New login detected from Chrome on Windows in San Francisco, CA. If this wasn\'t you, please secure your account immediately.',
    type: 'security',
    priority: 'critical',
    isRead: false,
    isArchived: false,
    createdAt: hoursAgo(4),
    context: { source: 'Security', metadata: { device: 'Chrome on Windows', location: 'San Francisco, CA', ip: '192.168.1.xxx' } },
    actions: [
      { id: 'secure', label: 'Secure Account', variant: 'destructive', inline: true, behavior: { type: 'navigate', route: '/settings/security' } },
      { id: 'review', label: 'Review Activity', variant: 'outline', inline: true, behavior: { type: 'drawer', drawerId: 'security-activity' } },
      { id: 'dismiss', label: 'This was me', behavior: { type: 'api', endpoint: '/security/alerts/sa-789/dismiss', method: 'POST' } },
    ],
  },
  {
    id: 'notif-4',
    title: 'Emily Rodriguez started following you',
    message: 'You have a new follower! Emily Rodriguez is now following your activity and will see your updates.',
    type: 'social',
    priority: 'low',
    isRead: false,
    isArchived: false,
    isFollowing: false,
    createdAt: hoursAgo(6),
    actor: { id: 'u1', name: 'Emily Rodriguez', avatar: 'https://i.pravatar.cc/150?u=emily' },
    actions: [
      { id: 'view-profile', label: 'View Profile', behavior: { type: 'drawer', drawerId: 'user-profile', params: { userId: 'u1' } } },
      { id: 'follow-back', label: 'Follow Back', behavior: { type: 'api', endpoint: '/users/u1/follow', method: 'POST' } },
    ],
  },
  {
    id: 'notif-5',
    title: 'System maintenance scheduled',
    message: 'Scheduled maintenance on January 15, 2026 from 2:00 AM to 4:00 AM UTC. Some features may be temporarily unavailable during this window.',
    type: 'system',
    priority: 'normal',
    isRead: true,
    isArchived: false,
    createdAt: daysAgo(1),
    context: { source: 'System', metadata: { startTime: '2026-01-15T02:00:00Z', endTime: '2026-01-15T04:00:00Z' } },
    actions: [
      { id: 'calendar', label: 'Add to Calendar', behavior: { type: 'external', url: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=System+Maintenance' } },
    ],
  },
  {
    id: 'notif-6',
    title: 'Task completed',
    message: 'David Kim marked "Setup CI/CD pipeline" as complete. The deployment workflow is now automated.',
    type: 'task',
    priority: 'normal',
    isRead: true,
    isArchived: false,
    isFollowing: true,
    createdAt: daysAgo(1),
    actor: { id: 'u4', name: 'David Kim', avatar: 'https://i.pravatar.cc/150?u=david' },
    context: { source: 'Engineering Sprint 23' },
    actions: [
      { id: 'view', label: 'View Task', behavior: { type: 'navigate', route: '/apps/kanban/board/board-1' } },
    ],
  },
  {
    id: 'notif-7',
    title: 'New team member joined',
    message: 'Lisa Wang joined the Engineering team. Say hello and help them get started!',
    type: 'social',
    priority: 'low',
    isRead: true,
    isArchived: false,
    isFollowing: false,
    createdAt: daysAgo(2),
    actor: { id: 'u5', name: 'Lisa Wang', avatar: 'https://i.pravatar.cc/150?u=lisa' },
    context: { source: 'Engineering Team' },
    actions: [
      { id: 'view-profile', label: 'View Profile', behavior: { type: 'drawer', drawerId: 'user-profile', params: { userId: 'u5' } } },
      { id: 'send-message', label: 'Send Welcome', behavior: { type: 'navigate', route: '/apps/chat' } },
    ],
  },
  {
    id: 'notif-8',
    title: 'Weekly report ready',
    message: 'Your weekly activity report for the past 7 days is now available. View your productivity metrics and team performance.',
    type: 'system',
    priority: 'low',
    isRead: true,
    isArchived: false,
    createdAt: daysAgo(3),
    context: { source: 'Analytics' },
    actions: [
      { id: 'view', label: 'View Report', behavior: { type: 'navigate', route: '/dashboards/executive' } },
      { id: 'download', label: 'Download PDF', behavior: { type: 'external', url: '/reports/weekly-2026-01-05.pdf' } },
    ],
    attachments: [
      { id: 'att-3', filename: 'weekly_report_jan5.pdf', type: 'document', url: '/reports/weekly-2026-01-05.pdf', size: 156000 },
    ],
  },
  // Approval - already processed (archived)
  {
    id: 'notif-9',
    title: 'Time off request approved',
    message: 'Your time off request for January 20-22, 2026 has been approved by your manager.',
    type: 'approval',
    priority: 'normal',
    isRead: true,
    isArchived: true,
    createdAt: daysAgo(5),
    context: { source: 'HR', metadata: { dates: 'Jan 20-22, 2026', status: 'Approved' } },
    actions: [
      { id: 'calendar', label: 'Add to Calendar', behavior: { type: 'external', url: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Time+Off' } },
    ],
  },
  {
    id: 'notif-10',
    title: 'Comment mention',
    message: 'You were mentioned in a comment by Michael Chen: "@you Can you review this PR? The authentication flow needs your input."',
    type: 'comment',
    priority: 'normal',
    isRead: true,
    isArchived: true,
    isFollowing: true,
    createdAt: daysAgo(7),
    actor: { id: 'u2', name: 'Michael Chen', avatar: 'https://i.pravatar.cc/150?u=michael' },
    context: { source: 'Code Review' },
    actions: [
      { id: 'view', label: 'View PR', behavior: { type: 'external', url: 'https://github.com/org/repo/pull/123' } },
    ],
  },
  // More notifications for pagination testing
  {
    id: 'notif-11',
    title: 'Document shared with you',
    message: 'Alex Thompson shared "Q4 Marketing Strategy.docx" with you.',
    type: 'social',
    priority: 'normal',
    isRead: false,
    isArchived: false,
    isFollowing: false,
    createdAt: hoursAgo(8),
    actor: { id: 'u6', name: 'Alex Thompson', avatar: 'https://i.pravatar.cc/150?u=alex' },
    context: { source: 'Documents' },
    actions: [
      { id: 'view', label: 'Open Document', behavior: { type: 'external', url: '/documents/q4-marketing-strategy' } },
    ],
    attachments: [
      { id: 'att-4', filename: 'Q4_Marketing_Strategy.docx', type: 'document', url: '/documents/q4-marketing-strategy.docx', size: 2450000 },
    ],
  },
  {
    id: 'notif-12',
    title: 'Meeting reminder',
    message: 'Team standup meeting starts in 15 minutes. Join the call to discuss sprint progress.',
    type: 'system',
    priority: 'normal',
    isRead: true,
    isArchived: false,
    createdAt: daysAgo(1),
    context: { source: 'Calendar', metadata: { meetingId: 'meet-456' } },
    actions: [
      { id: 'join', label: 'Join Meeting', variant: 'primary', behavior: { type: 'external', url: 'https://meet.google.com/abc-defg-hij' } },
    ],
  },
];

let preferences: NotificationPreferences = {
  categories: {
    system: { inApp: true, email: true },
    task: { inApp: true, email: true },
    comment: { inApp: true, email: false },
    social: { inApp: true, email: false },
    security: { inApp: true, email: true },
    approval: { inApp: true, email: true },
  },
  muteAll: false,
  muteUntil: undefined,
};

// ============================================================================
// Helper Functions
// ============================================================================

function filterNotifications(
  items: Notification[],
  tab?: string,
  types?: string,
  priorities?: string
): Notification[] {
  let filtered = [...items];

  // Tab filter - matches premium inbox tabs
  switch (tab) {
    case 'inbox':
      // Inbox = unread, non-archived
      filtered = filtered.filter((n) => !n.isRead && !n.isArchived);
      break;
    case 'following':
      // Following = items user is following, non-archived
      filtered = filtered.filter((n) => n.isFollowing && !n.isArchived);
      break;
    case 'archived':
      // Archived items only
      filtered = filtered.filter((n) => n.isArchived);
      break;
    case 'all':
    default:
      // All = everything except archived
      filtered = filtered.filter((n) => !n.isArchived);
      break;
  }

  // Type filter
  if (types) {
    const typeList = types.split(',') as NotificationType[];
    filtered = filtered.filter((n) => typeList.includes(n.type));
  }

  // Priority filter
  if (priorities) {
    const priorityList = priorities.split(',') as NotificationPriority[];
    filtered = filtered.filter((n) => priorityList.includes(n.priority));
  }

  // Sort by createdAt descending
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return filtered;
}

// ============================================================================
// MSW Handlers
// ============================================================================

export const inboxHandlers = [
  // GET /inbox/notifications - List notifications with filters
  http.get(api('/inbox/notifications'), async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const tab = url.searchParams.get('tab') ?? 'all';
    const types = url.searchParams.get('types') ?? undefined;
    const priorities = url.searchParams.get('priorities') ?? undefined;

    const filtered = filterNotifications(notifications, tab, types, priorities);
    const unreadCount = notifications.filter((n) => !n.isRead && !n.isArchived).length;

    return ok({
      notifications: filtered,
      unreadCount,
      total: filtered.length,
    });
  }),

  // GET /inbox/notifications/unread-count - Get unread count
  http.get(api('/inbox/notifications/unread-count'), async () => {
    await delay(100);
    const count = notifications.filter((n) => !n.isRead && !n.isArchived).length;
    return ok({ count });
  }),

  // PATCH /inbox/notifications/:id - Update single notification
  http.patch(api('/inbox/notifications/:id'), async ({ params, request }) => {
    await delay(200);
    const { id } = params;
    const dto = (await request.json()) as UpdateNotificationDto;

    const index = notifications.findIndex((n) => n.id === id);
    if (index === -1) {
      return ok(null, 404);
    }

    notifications[index] = {
      ...notifications[index],
      ...dto,
    };

    return ok(notifications[index]);
  }),

  // PATCH /inbox/notifications/bulk - Bulk update notifications
  http.patch(api('/inbox/notifications/bulk'), async ({ request }) => {
    await delay(300);
    const dto = (await request.json()) as BulkUpdateNotificationsDto;

    let updated = 0;
    dto.ids.forEach((id) => {
      const index = notifications.findIndex((n) => n.id === id);
      if (index !== -1) {
        if (dto.isRead !== undefined) {
          notifications[index].isRead = dto.isRead;
        }
        if (dto.isArchived !== undefined) {
          notifications[index].isArchived = dto.isArchived;
        }
        updated++;
      }
    });

    return ok({ updated });
  }),

  // PATCH /inbox/notifications/mark-all-read - Mark all as read
  http.patch(api('/inbox/notifications/mark-all-read'), async () => {
    await delay(300);

    let updated = 0;
    notifications.forEach((n) => {
      if (!n.isRead && !n.isArchived) {
        n.isRead = true;
        updated++;
      }
    });

    return ok({ updated });
  }),

  // GET /inbox/preferences - Get notification preferences
  http.get(api('/inbox/preferences'), async () => {
    await delay(200);
    return ok(preferences);
  }),

  // PATCH /inbox/preferences - Update notification preferences
  http.patch(api('/inbox/preferences'), async ({ request }) => {
    await delay(300);
    const updates = (await request.json()) as Partial<NotificationPreferences>;

    preferences = {
      ...preferences,
      ...updates,
      categories: {
        ...preferences.categories,
        ...(updates.categories ?? {}),
      },
    };

    return ok(preferences);
  }),
];
