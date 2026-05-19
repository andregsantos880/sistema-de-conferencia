import React, { useState } from 'react';
import { Bell, ArrowLeft, CheckCircle2, Inbox } from 'lucide-react';

import { useTranslation } from 'react-i18next';

import { useNavigate } from 'react-router-dom';
import { 
  useNotifications, 
  useUpdateNotification, 
  useMarkAllAsRead, 
  useUnreadCount 
} from '../../application/hooks/useInbox';
import { cn } from '@/shadcn/lib/utils';
import SimpleBar from 'simplebar-react';
import { formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import ActionButton from '@/components/forms/buttons/ActionButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/shadcn/components/ui/avatar';
import { NotificationActorInfo } from '../components/NotificationActorInfo';



export const InboxLightWidget: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      <AnimatePresence mode="wait">
        {!selectedId ? (
          <NotificationListStage key="list" onSelect={setSelectedId} />
        ) : (
          <NotificationDetailStage key="detail" id={selectedId} onBack={() => setSelectedId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Sub-Stages ---

const NotificationListStage: React.FC<{ onSelect: (id: string) => void }> = ({ onSelect }) => {
  const navigate = useNavigate();
  const { data, isLoading } = useNotifications();
  const notifications = data?.notifications || [];
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAllRead = useMarkAllAsRead();


  const grouped = React.useMemo(() => {
    const result: { today: any[]; yesterday: any[]; earlier: any[] } = {
      today: [],
      yesterday: [],
      earlier: [],
    };

    notifications.forEach((notif) => {
      const date = parseISO(notif.createdAt);
      if (isToday(date)) result.today.push(notif);
      else if (isYesterday(date)) result.yesterday.push(notif);
      else result.earlier.push(notif);
    });

    return result;
  }, [notifications]);

  const renderGroup = (title: string, items: any[]) => {
    if (items.length === 0) return null;
    return (
      <div key={title} className="space-y-1">
        <div className="sticky top-0 z-10 px-4 py-2 bg-sidebar-background/80 backdrop-blur-sm border-b border-sidebar-border/50">
           <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">{title}</h4>
        </div>
        <div className="p-2 space-y-1">
          {items.map((notif) => (
            <button
              key={notif.id}
              onClick={() => onSelect(notif.id)}
              className={cn(
                "flex gap-3 p-3 w-full rounded-xl hover:bg-sidebar-hover transition-all text-left group items-start relative",
                !notif.isRead && "bg-sidebar-surface shadow-sm"
              )}
            >
              <div className="relative shrink-0">
                <Avatar className="size-10 rounded-2xl border border-sidebar-border shadow-sm">
                   <AvatarImage src={notif.actor?.avatar} />
                   <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                      {notif.actor?.name[0] || '?'}
                   </AvatarFallback>
                </Avatar>
                {/* Red dot for unread */}
                {!notif.isRead && (
                  <div className="absolute -top-1 -right-1 size-2.5 bg-primary rounded-full border-2 border-sidebar-background shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h4 className={cn("text-xs truncate", !notif.isRead ? "font-black" : "font-bold")}>
                    {notif.title}
                  </h4>
                  <span className="text-[9px] text-muted-foreground whitespace-nowrap ml-2">
                     {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: false })}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                  {notif.message}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      <div className="p-4 border-b border-sidebar-border/50">
         <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Inbox</h3>
              <p className="text-sm font-bold mt-0.5">{unreadCount} New Notifications</p>
            </div>
            <button 
              onClick={() => markAllRead.mutate()}
              className="p-2 hover:bg-sidebar-hover rounded-xl transition-colors text-primary"
              title="Mark all as read"
            >
              <CheckCircle2 className="size-4" />
            </button>
         </div>
      </div>

      <div className="flex-1 min-h-0">
        <SimpleBar className="h-full">
          {isLoading ? (
            <div className="p-4 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-4 animate-pulse">
                      <div className="size-10 rounded-2xl bg-sidebar-hover shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-2 bg-sidebar-hover rounded w-3/4" />
                        <div className="h-2 bg-sidebar-hover rounded w-1/2" />
                      </div>
                  </div>
                ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-24 text-center space-y-3">
              <div className="size-16 rounded-full bg-sidebar-hover flex items-center justify-center mx-auto opacity-20">
                  <Bell className="size-8" />
              </div>
              <p className="text-xs text-muted-foreground">Your inbox is clear</p>
            </div>
          ) : (
            <div className="pb-4">
              {renderGroup('Today', grouped.today)}
              {renderGroup('Yesterday', grouped.yesterday)}
              {renderGroup('Earlier', grouped.earlier)}
            </div>
          )}
        </SimpleBar>
      </div>

      <div className="p-4 border-t border-sidebar-border/50 bg-sidebar-surface/10 mt-auto">
        <ActionButton 
           onClick={() => navigate('/apps/inbox')}
           className="w-full rounded-pill shadow-lg"
        >
          View All Notifications
        </ActionButton>
      </div>
    </motion.div>
  );
};


const NotificationDetailStage: React.FC<{ id: string; onBack: () => void }> = ({ id, onBack }) => {
  const { data } = useNotifications();
  const notifications = data?.notifications || [];
  const notification = notifications.find(n => n.id === id);
  const { t } = useTranslation('inbox');
  const updateNotif = useUpdateNotification();
  const navigate = useNavigate();


  React.useEffect(() => {
    if (notification && !notification.isRead) {
      updateNotif.mutate({ id, dto: { isRead: true } });
    }
  }, [notification, id]);

  if (!notification) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col h-full bg-sidebar-background"
    >
      <div className="flex items-center justify-between p-3 border-b border-sidebar-border/50 bg-sidebar-surface/30">
        <div className="flex items-center gap-3 overflow-hidden">
          <button onClick={onBack} className="p-1.5 hover:bg-sidebar-hover rounded-lg transition-colors shrink-0">
            <ArrowLeft className="size-4" />
          </button>
          <NotificationActorInfo 
            actor={notification.actor}
            t={t}
            size="sm"
            className="overflow-hidden"
          />
        </div>
      </div>


      <SimpleBar className="flex-1 h-full">
        <div className="p-6 space-y-6">
           <div className="text-center space-y-2">
              <h2 className="text-base font-black tracking-tight">{notification.title}</h2>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </p>
           </div>


           <div className="p-4 rounded-2xl bg-sidebar-surface border border-sidebar-border text-xs leading-relaxed text-sidebar-foreground/80">
              {notification.message}
           </div>

           <ActionButton
              onClick={() => navigate('/apps/inbox', { state: { selectedNotificationId: notification.id } })}
              className="w-full shadow-lg"
           >
              <Inbox className="size-3 mr-2" />
              View Notification
           </ActionButton>

        </div>
      </SimpleBar>

      <div className="p-4 border-t border-sidebar-border/50 bg-sidebar-surface/10">
         <ActionButton
           variant="outline"
           onClick={() => { updateNotif.mutate({ id, dto: { isRead: false } }); onBack(); }}
           className="w-full"
         >
            Keep as Unread
         </ActionButton>
      </div>
    </motion.div>
  );
};
