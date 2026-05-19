import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  CheckSquare,
  MessageSquare,
  Users,
  Shield,
  ClipboardCheck,
  Paperclip,
} from 'lucide-react';
import { cn } from '@/shadcn/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/shadcn/components/ui/avatar';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import type { Notification, NotificationType } from '../../domain/models/Notification';
import { NOTIFICATION_TYPE_COLORS } from '../../domain/models/Notification';

const TYPE_ICONS: Record<NotificationType, typeof Bell> = {
  system: Bell,
  task: CheckSquare,
  comment: MessageSquare,
  social: Users,
  security: Shield,
  approval: ClipboardCheck,
};

interface InboxListItemProps {
  notification: Notification;
  isSelected: boolean;
  onSelect: (notification: Notification) => void;
  onInlineAction?: (notificationId: string, actionId: string) => void;
  onAvatarClick?: (actorId: string) => void;
}

export function InboxListItem({
  notification,
  isSelected,
  onSelect,
  onInlineAction,
  onAvatarClick,
}: InboxListItemProps) {
  const Icon = TYPE_ICONS[notification.type];
  const iconColor = NOTIFICATION_TYPE_COLORS[notification.type];

  const timeAgo = useMemo(() => {
    try {
      return formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });
    } catch {
      return '';
    }
  }, [notification.createdAt]);

  // Get inline actions (for approvals, security alerts)
  const inlineActions = notification.actions?.filter((a) => a.inline) ?? [];
  const hasAttachments = notification.attachments && notification.attachments.length > 0;

  const handleClick = () => {
    onSelect(notification);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(notification);
    }
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notification.actor && onAvatarClick) {
      onAvatarClick(notification.actor.id);
    }
  };

  const handleInlineAction = (e: React.MouseEvent, actionId: string) => {
    e.stopPropagation();
    onInlineAction?.(notification.id, actionId);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'relative flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors',
        'hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
        isSelected && 'bg-muted shadow-[inset_3px_0_0_0_var(--color-primary)]',
        !notification.isRead && 'bg-primary/5'
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-selected={isSelected}
    >
      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
      )}

      {/* Avatar or Icon */}
      <div className="shrink-0 mt-0.5">
        {notification.actor ? (
          <button
            type="button"
            onClick={handleAvatarClick}
            className="block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={notification.actor.avatar} alt={notification.actor.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {notification.actor.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
          </button>
        ) : (
          <div
            className={cn(
              'h-10 w-10 rounded-full flex items-center justify-center',
              'bg-muted'
            )}
          >
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm leading-tight line-clamp-1',
              !notification.isRead ? 'font-semibold text-foreground' : 'text-foreground'
            )}
          >
            {notification.title}
          </p>
          <span className="shrink-0 text-[11px] text-muted-foreground whitespace-nowrap">
            {timeAgo}
          </span>
        </div>

        {/* Message preview */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {notification.message}
        </p>

        {/* Context source */}
        {notification.context?.source && (
          <p className="text-[11px] text-muted-foreground/70">
            {notification.context.source}
          </p>
        )}

        {/* Inline actions for approvals/security */}
        {inlineActions.length > 0 && (
          <div className="flex items-center gap-2 pt-1">
            {inlineActions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant === 'destructive' ? 'destructive' : action.variant === 'primary' ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs"
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
            <span className="text-[11px] text-muted-foreground">
              {notification.attachments!.length} attachment{notification.attachments!.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
