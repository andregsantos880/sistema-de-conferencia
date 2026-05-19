import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { Card } from '@/shared/ui/shadcn/components/ui/card';
import {
  useNotifications,
  useUpdateNotification,
  useUnreadCount,
} from '../../application/hooks/useInbox';
import type { Notification, NotificationTab, NotificationAction } from '../../domain/models/Notification';
import { InboxMasterList } from '../components/InboxMasterList';
import { InboxDetailPanel } from '../components/InboxDetailPanel';

export function InboxPage() {
  const location = useLocation();
  const isMobile = !useMediaQuery('(min-width: 992px)');
  const { t } = useTranslation('inbox');

  // State
  const [activeTab, setActiveTab] = useState<NotificationTab>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Data fetching
  const { data, isLoading } = useNotifications({ tab: activeTab });
  const { data: unreadCount = 0 } = useUnreadCount();
  const notifications = useMemo(() => data?.notifications ?? [], [data?.notifications]);

  // Mutations
  const updateNotification = useUpdateNotification();

  // Handle navigation state to select a specific notification
  // This effect syncs component state with React Router navigation state
  useEffect(() => {
    const state = location.state as { selectedNotificationId?: string } | null;
    if (state?.selectedNotificationId) {
      const notification = notifications.find((n) => n.id === state.selectedNotificationId);
      if (notification) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Sync selection with navigation state passed from other pages
        setSelectedNotification(notification);
        if (isMobile) {
           
          setShowDetail(true);
        }
      }
      // Clear the state to prevent re-selection on back navigation
      window.history.replaceState({}, document.title);
    }
  }, [location.state, notifications, isMobile]);

  // Auto-select first notification on desktop when list changes
  // This provides a better UX by always showing content in the detail panel
  useEffect(() => {
    if (!isMobile && notifications.length > 0 && !selectedNotification) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Auto-select first item for desktop master-detail UX
      setSelectedNotification(notifications[0]);
    }
  }, [isMobile, notifications, selectedNotification]);

  // Clear selection when tab changes to reset the view
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Clear selection when switching tabs to show fresh content
    setSelectedNotification(null);
     
    setShowDetail(false);
  }, [activeTab]);

  // Handlers
  const handleSelectNotification = useCallback(
    (notification: Notification) => {
      setSelectedNotification(notification);

      // Mark as read when selected
      if (!notification.isRead) {
        updateNotification.mutate({ id: notification.id, dto: { isRead: true } });
      }

      // On mobile, show detail view
      if (isMobile) {
        setShowDetail(true);
      }
    },
    [isMobile, updateNotification]
  );

  const handleCloseDetail = useCallback(() => {
    setShowDetail(false);
  }, []);

  const handleMarkAsRead = useCallback(
    (id: string) => {
      updateNotification.mutate({ id, dto: { isRead: true } });
      toast.success(t('detail.markedAsRead', 'Marked as read'));
    },
    [updateNotification, t]
  );

  const handleMarkAsUnread = useCallback(
    (id: string) => {
      updateNotification.mutate({ id, dto: { isRead: false } });
      toast.success(t('detail.markedAsUnread', 'Marked as unread'));
    },
    [updateNotification, t]
  );

  const handleArchive = useCallback(
    (id: string) => {
      updateNotification.mutate({ id, dto: { isArchived: true } });
      toast.success(t('detail.archived', 'Notification archived'));
      
      // Removed setSelectedNotification(null) to fix flickering issue.
      // The master-detail layout will maintain the content while the list updates.
      if (isMobile && selectedNotification?.id === id) {
        setShowDetail(false);
      }
    },
    [updateNotification, selectedNotification, t, isMobile]
  );

  const handleAction = useCallback(
    async (notificationId: string, action: NotificationAction) => {
      setActionLoadingId(action.id);
      
      // Simulate real backend work with a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setActionLoadingId(null);

      // Handle different action behaviors
      switch (action.behavior.type) {
        case 'navigate':
          toast.info(t('detail.executingAction', 'Executing: {{label}}', { label: action.label }));
          // Navigation can be implemented here
          // navigate(action.behavior.route); 
          console.log('Navigation suppressed:', action.behavior.route);
          break;
        case 'external':
          toast.info(t('detail.openingExternal', 'Opening external link...'));
          // window.open(action.behavior.url, '_blank', 'noopener,noreferrer');
          console.log('External link suppressed:', action.behavior.url);
          break;
        case 'drawer':
          toast(`${action.label} triggered`, {
            description: `Opening drawer: ${action.behavior.drawerId}`
          });
          break;
        case 'modal':
          toast(`${action.label} triggered`, {
            description: `Opening modal: ${action.behavior.modalId}`
          });
          break;
        case 'api':
          // Simulation of API call success
          if (action.id === 'approve') {
             toast.success(t('detail.approved', 'Request successfully approved'));
          } else if (action.id === 'deny') {
             toast.error(t('detail.denied', 'Request denied'));
          } else {
             toast.success(t('detail.actionSuccess', 'Action "{{label}}" completed', { label: action.label }));
          }

          // For approval actions, we archive the notification to clear it from the active view
          if (action.id === 'approve' || action.id === 'deny') {
            handleArchive(notificationId);
          }
          break;
      }
    },
    [handleArchive, t]
  );

  const handleInlineAction = useCallback(
    (notificationId: string, actionId: string) => {
      // Find the notification and action
      const notification = notifications.find((n) => n.id === notificationId);
      const action = notification?.actions?.find((a) => a.id === actionId);

      if (action) {
        handleAction(notificationId, action);
      }
    },
    [notifications, handleAction]
  );

  const handleAvatarClick = useCallback(
    (actorId: string) => {
      // TODO: Open user profile drawer
      console.log('Open user profile drawer:', actorId);
    },
    []
  );

  // Desktop layout - two-column master-detail
  if (!isMobile) {
    return (
      <div className="h-full">
        <Card className="flex h-full py-0 gap-0 flex-row overflow-hidden">
          {/* Left: Master List */}
          <div className="w-96 flex-shrink-0 border-r h-full overflow-hidden bg-muted/30">
            <InboxMasterList
              notifications={notifications}
              selectedId={selectedNotification?.id ?? null}
              unreadCount={unreadCount}
              activeTab={activeTab}
              isLoading={isLoading}
              onSelectNotification={handleSelectNotification}
              onTabChange={setActiveTab}
              onInlineAction={handleInlineAction}
              onAvatarClick={handleAvatarClick}
            />
          </div>

          {/* Right: Detail Panel */}
          <div className="flex-1 min-w-0 h-full overflow-hidden">
            <InboxDetailPanel
              notification={selectedNotification}
              onMarkAsRead={handleMarkAsRead}
              onMarkAsUnread={handleMarkAsUnread}
              onArchive={handleArchive}
              onAction={handleAction}
              onAvatarClick={handleAvatarClick}
              actionLoadingId={actionLoadingId}
            />
          </div>
        </Card>
      </div>
    );
  }

  // Mobile layout with slide-in detail view
  return (
    <Card className="h-full relative overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        {!showDetail ? (
          <MobileScreen key="list" direction="left">
            <InboxMasterList
              notifications={notifications}
              selectedId={selectedNotification?.id ?? null}
              unreadCount={unreadCount}
              activeTab={activeTab}
              isLoading={isLoading}
              onSelectNotification={handleSelectNotification}
              onTabChange={setActiveTab}
              onInlineAction={handleInlineAction}
              onAvatarClick={handleAvatarClick}
            />
          </MobileScreen>
        ) : (
          <MobileScreen key="detail" direction="left">
            <InboxDetailPanel
              notification={selectedNotification}
              onClose={handleCloseDetail}
              onMarkAsRead={handleMarkAsRead}
              onMarkAsUnread={handleMarkAsUnread}
              onArchive={handleArchive}
              onAction={handleAction}
              onAvatarClick={handleAvatarClick}
              actionLoadingId={actionLoadingId}
              isMobile
            />
          </MobileScreen>
        )}
      </AnimatePresence>
    </Card>
  );
}

interface MobileScreenProps {
  children: React.ReactNode;
  direction: 'left' | 'right';
}

function MobileScreen({ children, direction }: MobileScreenProps) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return <div className="h-full">{children}</div>;
  }

  return (
    <motion.div
      initial={{ x: direction === 'left' ? '100%' : '-100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: direction === 'left' ? '-100%' : '100%', opacity: 0 }}
      transition={{ type: 'tween', duration: 0.3 }}
      className="absolute inset-0"
    >
      {children}
    </motion.div>
  );
}
