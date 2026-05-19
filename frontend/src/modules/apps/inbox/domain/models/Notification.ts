/**
 * Inbox Notification Domain Models
 *
 * Defines the core types for user-facing notifications in the inbox system.
 * Follows the explicit action model - clicking notifications never navigates,
 * only explicit actions can trigger navigation or other behaviors.
 */

/** Notification type categories */
export type NotificationType = 'system' | 'task' | 'comment' | 'social' | 'security' | 'approval';

/** Notification priority levels */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

/** Filter tab values - matches premium inbox patterns */
export type NotificationTab = 'all' | 'inbox' | 'following' | 'archived';

/** Actor who triggered the notification */
export interface NotificationActor {
  id: string;
  name: string;
  avatar?: string;
}

/** Action behavior types - explicit navigation model */
export type ActionBehavior =
  | { type: 'navigate'; route: string }
  | { type: 'drawer'; drawerId: string; params?: Record<string, string> }
  | { type: 'modal'; modalId: string; params?: Record<string, string> }
  | { type: 'external'; url: string }
  | { type: 'api'; endpoint: string; method?: 'POST' | 'PATCH' | 'DELETE' };

/** Action that can be taken on a notification */
export interface NotificationAction {
  id: string;
  label: string;
  variant?: 'default' | 'primary' | 'destructive' | 'outline';
  icon?: string;
  behavior: ActionBehavior;
  /** Show inline in list view (for approvals, security alerts) */
  inline?: boolean;
}

/** Attachment on a notification */
export interface NotificationAttachment {
  id: string;
  filename: string;
  type: 'image' | 'document' | 'video' | 'audio' | 'link';
  url: string;
  thumbnail?: string;
  size?: number;
  mimeType?: string;
}

/** Context information for the notification */
export interface NotificationContext {
  /** Source of the notification (e.g., "Project Alpha", "Engineering Team") */
  source?: string;
  /** Additional metadata */
  metadata?: Record<string, string>;
}

/** Core notification entity */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  isArchived: boolean;
  isFollowing?: boolean;
  createdAt: string;
  actor?: NotificationActor;
  /** Explicit actions - NO implicit target navigation */
  actions?: NotificationAction[];
  /** Attachments on the notification */
  attachments?: NotificationAttachment[];
  /** Additional context */
  context?: NotificationContext;
}

/** Notification list response with metadata */
export interface NotificationListResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

/** Notification filters for API requests */
export interface NotificationFilters {
  tab?: NotificationTab;
  types?: NotificationType[];
  priorities?: NotificationPriority[];
  dateFrom?: string;
  dateTo?: string;
}

/** Update notification payload */
export interface UpdateNotificationDto {
  isRead?: boolean;
  isArchived?: boolean;
}

/** Bulk update payload */
export interface BulkUpdateNotificationsDto {
  ids: string[];
  isRead?: boolean;
  isArchived?: boolean;
}

/** User notification preferences */
export interface NotificationPreferences {
  categories: {
    system: { inApp: boolean; email: boolean };
    task: { inApp: boolean; email: boolean };
    comment: { inApp: boolean; email: boolean };
    social: { inApp: boolean; email: boolean };
    security: { inApp: boolean; email: boolean };
    approval: { inApp: boolean; email: boolean };
  };
  muteAll: boolean;
  muteUntil?: string;
}

/** Type labels for display */
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  system: 'System',
  task: 'Task',
  comment: 'Comment',
  social: 'Social',
  security: 'Security',
  approval: 'Approval',
};

/** Priority labels for display */
export const NOTIFICATION_PRIORITY_LABELS: Record<NotificationPriority, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  critical: 'Critical',
};

/** Type icon colors */
export const NOTIFICATION_TYPE_COLORS: Record<NotificationType, string> = {
  system: 'text-blue-500',
  task: 'text-purple-500',
  comment: 'text-green-500',
  social: 'text-pink-500',
  security: 'text-orange-500',
  approval: 'text-amber-500',
};

/** Tab labels for display */
export const NOTIFICATION_TAB_LABELS: Record<NotificationTab, string> = {
  all: 'All',
  inbox: 'Inbox',
  following: 'Following',
  archived: 'Archived',
};

/** Priority badge variants */
export const NOTIFICATION_PRIORITY_VARIANTS: Record<NotificationPriority, string> = {
  low: 'bg-muted text-muted-foreground',
  normal: 'bg-secondary text-secondary-foreground',
  high: 'bg-warning/10 text-warning border-warning/20',
  critical: 'bg-destructive/10 text-destructive border-destructive/20',
};
