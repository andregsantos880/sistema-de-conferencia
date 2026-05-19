import React, { useCallback, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import AnimatedDropdown from '@/shared/ui/components/animated-dropdown/AnimatedDropdown';
import AnimatedDropdownTrigger from '@/shared/ui/components/animated-dropdown/AnimatedDropdownTrigger';
import AnimatedDropdownContent from '@/shared/ui/components/animated-dropdown/AnimatedDropdownContent';
import {
  Bell,
  CheckSquare,
  MessageSquare,
  Users,
  Shield,
  CheckCheck,
  Loader2,
  ClipboardCheck,
  Paperclip,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FloatingHover } from '@/shared/ui/components/FloatingHover';
import { useHoverBackground } from '@/shared/hooks/useHoverBackground';
import { Button } from '@/shadcn/components/ui/button';
import { ScrollArea } from '@/shadcn/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/shadcn/components/ui/avatar';
import { Skeleton } from '@/shared/ui/components/Skeleton';
import { cn } from '@/shadcn/lib/utils';
import {
  useNotifications,
  useUpdateNotification,
  useMarkAllAsRead,
  useUnreadCount,
} from '@/modules/apps/inbox/application/hooks/useInbox';
import type { Notification, NotificationType } from '@/modules/apps/inbox/domain/models/Notification';
import { NOTIFICATION_TYPE_COLORS } from '@/modules/apps/inbox/domain/models/Notification';
import { INBOX_PATHS } from '@/modules/apps/inbox/ui/routes';
import { EmptyState } from '@/components/states';
import { ScrollFadeContainer } from '@/components/scroll';

const TYPE_ICONS: Record<NotificationType, typeof Bell> = {
  system: Bell,
  task: CheckSquare,
  comment: MessageSquare,
  social: Users,
  security: Shield,
  approval: ClipboardCheck,
};

interface NotificationDropdownItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onInlineAction?: (notificationId: string, actionId: string) => void;
  onClick: () => void;
}

function NotificationDropdownItem({
  notification,
  onMarkAsRead,
  onInlineAction,
  onClick,
  ...props
}: NotificationDropdownItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);

  const Icon = TYPE_ICONS[notification.type];
  const iconColor = NOTIFICATION_TYPE_COLORS[notification.type];

  // Get inline actions (for approvals, security alerts)
  const inlineActions = notification.actions?.filter((a) => a.inline) ?? [];
  const hasAttachments = notification.attachments && notification.attachments.length > 0;

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    onClick();
  };

  const handleInlineAction = (e: React.MouseEvent, actionId: string) => {
    e.stopPropagation();
    onInlineAction?.(notification.id, actionId);
  };

  return (
    <div
      ref={itemRef}
      className={cn(
        'relative p-3 flex items-start gap-3 cursor-pointer transition-colors rounded-md',
        // 'hover:bg-muted/50',
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      {...props}
    >
      {/* Avatar or Icon */}
      <div className="shrink-0">
        {notification.actor ? (
          <Avatar className="h-9 w-9">
            <AvatarImage src={notification.actor.avatar} alt={notification.actor.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {notification.actor.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-9 w-9 rounded-full flex items-center justify-center bg-muted">
            <Icon className={cn('h-4 w-4', iconColor)} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm leading-tight line-clamp-1',
              !notification.isRead ? 'font-semibold text-foreground' : 'text-foreground'
            )}
          >
            {notification.title}
          </p>
          <span className="shrink-0 text-[10px] text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </span>
        </div>

        {/* Message preview */}
        <p className="text-xs text-muted-foreground line-clamp-1">
          {notification.message}
        </p>

        {/* Inline actions for approvals/security */}
        {inlineActions.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1">
            {inlineActions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant === 'destructive' ? 'destructive' : action.variant === 'primary' ? 'default' : 'outline'}
                size="sm"
                className="h-6 text-[11px] px-2"
                onClick={(e) => handleInlineAction(e, action.id)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {/* Attachment indicator */}
        {hasAttachments && (
          <div className="flex items-center gap-1 pt-0.5">
            <Paperclip className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">
              {notification.attachments!.length} file{notification.attachments!.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const NotificationsMenu: React.FC = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const { rect, bind, clear } = useHoverBackground<HTMLDivElement>(containerRef);

  // Fetch notifications (only unread for dropdown)
  const { data, isLoading } = useNotifications({ tab: 'all' });
  const { data: unreadCount = 0 } = useUnreadCount();
  const updateNotification = useUpdateNotification();
  const markAllAsRead = useMarkAllAsRead();

  const notifications = useMemo(() => data?.notifications?.slice(0, 8) ?? [], [data?.notifications]);

  const handleMarkAsRead = useCallback(
    (id: string) => {
      updateNotification.mutate({ id, dto: { isRead: true } });
    },
    [updateNotification]
  );

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead.mutate();
  }, [markAllAsRead]);

  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      // With explicit action model, clicking notification just selects it
      // Navigation only happens via explicit actions
      // Navigate to inbox with the notification ID so it gets selected
      navigate(INBOX_PATHS.ROOT, { state: { selectedNotificationId: notification.id } });
    },
    [navigate]
  );

  const handleInlineAction = useCallback(
    (notificationId: string, actionId: string) => {
      // Find the notification and action
      const notification = notifications.find((n) => n.id === notificationId);
      const action = notification?.actions?.find((a) => a.id === actionId);

      if (action) {
        // Handle different action behaviors
        switch (action.behavior.type) {
          case 'navigate':
            navigate(action.behavior.route);
            break;
          case 'external':
            window.open(action.behavior.url, '_blank', 'noopener,noreferrer');
            break;
          case 'api':
            // For approval actions, mark as read and archive
            if (actionId === 'approve' || actionId === 'deny') {
              updateNotification.mutate({ id: notificationId, dto: { isRead: true, isArchived: true } });
            }
            break;
          default:
            // For drawer/modal, navigate to inbox for now
            navigate(INBOX_PATHS.ROOT);
        }
      }
    },
    [notifications, navigate, updateNotification]
  );

  return (
    <AnimatedDropdown placement="bottom-end" openOn="hover">
      <AnimatedDropdownTrigger asChild>
        <button
          className="relative inline-flex size-9 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 border border-gray-200/70 dark:border-neutral-800"
          aria-label={t('topbar.notifications', { defaultValue: 'Notifications' })}
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-medium text-white bg-red-500 rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </AnimatedDropdownTrigger>

      <AnimatedDropdownContent className="z-[60] w-[380px] max-w-[calc(100vw-2rem)]">
        {/* Header */}
        <div className="flex items-center justify-between px-3 pt-3 pb-2">
          <h3 className="text-base font-semibold">
            {t('topbar.notificationsTitle', { defaultValue: 'Notifications' })}
          </h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
            >
              {markAllAsRead.isPending ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <CheckCheck className="h-3 w-3 mr-1" />
              )}
              {t('topbar.markAllRead', { defaultValue: 'Mark all read' })}
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollFadeContainer 
          className="h-[340px]" 
          fadeSize='lg'
          fadeClassName="from-white dark:from-neutral-800 via-white/80 dark:via-neutral-800/80"
        >
          <ScrollArea
            ref={containerRef}
            className="relative h-[340px] p-2"
            onMouseLeave={clear}
          >
            <FloatingHover rect={rect} />

            {isLoading ? (
              <div className="space-y-3 p-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <EmptyState
                icon={Bell}
                title={t('topbar.noNotifications', { defaultValue: 'No notifications' })}
                description={t('topbar.noNotificationsDescription', {
                  defaultValue: "You're all caught up!",
                })}
              />
            ) : (
              <>
                {notifications.map((notification) => (
                  <NotificationDropdownItem
                    {...bind}
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onInlineAction={handleInlineAction}
                    onClick={() => handleNotificationClick(notification)}
                  />
                ))}
              </>
            )}
          </ScrollArea>
        </ScrollFadeContainer>

        {/* Footer */}
        <div className="flex items-center justify-center p-2 border-t">
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link to={INBOX_PATHS.ROOT}>
              {t('topbar.viewAll', { defaultValue: 'View all notifications' })}
            </Link>
          </Button>
        </div>
      </AnimatedDropdownContent>
    </AnimatedDropdown>
  );
};

export default NotificationsMenu;
