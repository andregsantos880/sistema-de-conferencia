import { useTranslation } from 'react-i18next';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Bell,
  CheckSquare,
  MessageSquare,
  Users,
  Shield,
  ClipboardCheck,
  ArrowLeft,
  Archive,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react';
import SimpleBar from 'simplebar-react';
import { cn } from '@/shadcn/lib/utils';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import ActionButton from '@/shared/ui/components/forms/buttons/ActionButton';

import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { Separator } from '@/shared/ui/shadcn/components/ui/separator';
import type {
  Notification,
  NotificationType,
  NotificationAction,
} from '../../domain/models/Notification';
import {
  NOTIFICATION_TYPE_COLORS,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_PRIORITY_VARIANTS,
} from '../../domain/models/Notification';
import { NotificationActorInfo } from './NotificationActorInfo';
import { AttachmentPreview } from '@/shared/ui/components/files/AttachmentPreview';
import type { Attachment } from '@/shared/types/attachment.types';


const TYPE_ICONS: Record<NotificationType, typeof Bell> = {
  system: Bell,
  task: CheckSquare,
  comment: MessageSquare,
  social: Users,
  security: Shield,
  approval: ClipboardCheck,
};


interface InboxDetailPanelProps {
  notification: Notification | null;
  onClose?: () => void;
  onMarkAsRead?: (id: string) => void;
  onMarkAsUnread?: (id: string) => void;
  onArchive?: (id: string) => void;
  onAction?: (notificationId: string, action: NotificationAction) => void;
  onAvatarClick?: (actorId: string) => void;
  actionLoadingId?: string | null;
  isMobile?: boolean;
}

export function InboxDetailPanel({
  notification,
  onClose,
  onMarkAsRead,
  onMarkAsUnread,
  onArchive,
  onAction,
  onAvatarClick,
  actionLoadingId,
  isMobile,
}: InboxDetailPanelProps) {
  const { t } = useTranslation('inbox');

  if (!notification) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          {t('detail.selectNotification', 'Select a notification')}
        </h3>
        <p className="text-sm text-muted-foreground/70 max-w-xs">
          {t('detail.selectNotificationDesc', 'Choose a notification from the list to view its details')}
        </p>
      </div>
    );
  }

  const Icon = TYPE_ICONS[notification.type];
  const iconColor = NOTIFICATION_TYPE_COLORS[notification.type];
  const typeLabel = NOTIFICATION_TYPE_LABELS[notification.type];
  const priorityVariant = NOTIFICATION_PRIORITY_VARIANTS[notification.priority];

  const handleAction = (action: NotificationAction) => {
    onAction?.(notification.id, action);
  };



  // Separate inline and regular actions
  const inlineActions = notification.actions?.filter((a) => a.inline) ?? [];
  const regularActions = notification.actions?.filter((a) => !a.inline) ?? [];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        {isMobile && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 -ml-2 hover:bg-accent rounded-lg transition-colors"
            aria-label={t('back', 'Back')}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {notification.isRead ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkAsUnread?.(notification.id)}
            >
              <EyeOff className="h-4 w-4 mr-1.5" />
              {t('actions.markAsUnread', 'Mark unread')}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkAsRead?.(notification.id)}
            >
              <Eye className="h-4 w-4 mr-1.5" />
              {t('actions.markAsRead', 'Mark read')}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onArchive?.(notification.id)}
          >
            <Archive className="h-4 w-4 mr-1.5" />
            {t('actions.archive', 'Archive')}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <SimpleBar className="h-full">
          <div className="p-6 space-y-6">
            {/* Type and Priority badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="gap-1.5">
                <Icon className={cn('h-3 w-3', iconColor)} />
                {typeLabel}
              </Badge>
              {notification.priority !== 'normal' && (
                <Badge className={cn('capitalize', priorityVariant)}>
                  {notification.priority}
                </Badge>
              )}
              {notification.context?.source && (
                <Badge variant="secondary">{notification.context.source}</Badge>
              )}
            </div>

            {/* Title */}
            <div>
              <h2 className="text-xl font-semibold leading-tight mb-2">
                {notification.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {format(new Date(notification.createdAt), 'PPpp')} ·{' '}
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </p>
            </div>

            {/* Actor */}
            <NotificationActorInfo 
              actor={notification.actor}
              t={t}
              onAvatarClick={onAvatarClick}
            />

            <Separator />

            {/* Message */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {notification.message}
              </p>
            </div>

            {/* Context metadata */}
            {notification.context?.metadata && Object.keys(notification.context.metadata).length > 0 && (
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('detail.details', 'Details')}
                </h4>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(notification.context.metadata).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</dt>
                      <dd className="font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Attachments */}
            {notification.attachments && notification.attachments.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">
                  {t('detail.attachments', 'Attachments')} ({notification.attachments.length})
                </h4>
                <AttachmentPreview 
                  variant="list"
                  attachments={notification.attachments.map(att => ({
                    id: att.id,
                    name: att.filename,
                    type: att.type,
                    url: att.url,
                    thumbnail: att.thumbnail,
                    size: att.size
                  }) as Attachment)}
                  onDownload={(att) => {
                    // Domain specific download logic could go here
                    window.open(att.url, '_blank');
                  }}
                  onView={(att) => {
                    // Logic to open a previewer/lightbox
                    window.open(att.url, '_blank');
                  }}
                />
              </div>
            )}

            {/* Inline Actions (Approve/Deny for approvals) */}
            {inlineActions.length > 0 && (
              <div className="flex items-center gap-3 pt-2">
                {inlineActions.map((action) => (
                  <ActionButton
                    key={action.id}
                    variant={action.variant === 'destructive' ? 'destructive' : action.variant === 'primary' ? 'default' : 'outline'}
                    status={actionLoadingId === action.id ? 'loading' : 'idle'}
                    onClick={() => handleAction(action)}
                  >
                    {action.label}
                  </ActionButton>
                ))}
              </div>
            )}

            {/* Regular Actions */}
            {regularActions.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-medium">
                  {t('detail.actions', 'Actions')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {regularActions.map((action) => (
                    <ActionButton
                      key={action.id}
                      variant={action.variant === 'primary' ? 'default' : 'outline'}
                      size="sm"
                      status={actionLoadingId === action.id ? 'loading' : 'idle'}
                      onClick={() => handleAction(action)}
                    >
                      {action.behavior.type === 'external' && (
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      {action.label}
                    </ActionButton>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SimpleBar>
      </div>
    </div>
  );
}
