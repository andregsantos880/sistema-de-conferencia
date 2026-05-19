import { useState, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { isToday, isYesterday, parseISO } from 'date-fns';
import { Search } from 'lucide-react';
import SimpleBar from 'simplebar-react';
import InputFieldText from '@/components/forms/inputs/InputFieldText';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/shadcn/components/ui/tabs';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import type { Notification, NotificationTab } from '../../domain/models/Notification';
import { NOTIFICATION_TAB_LABELS } from '../../domain/models/Notification';
import { InboxListItem } from './InboxListItem';

interface InboxMasterListProps {
  notifications: Notification[];
  selectedId: string | null;
  unreadCount: number;
  activeTab: NotificationTab;
  isLoading?: boolean;
  onSelectNotification: (notification: Notification) => void;
  onTabChange: (tab: NotificationTab) => void;
  onInlineAction?: (notificationId: string, actionId: string) => void;
  onAvatarClick?: (actorId: string) => void;
}

interface GroupedNotifications {
  today: Notification[];
  yesterday: Notification[];
  earlier: Notification[];
}

const TABS: NotificationTab[] = ['all', 'inbox', 'following', 'archived'];

export function InboxMasterList({
  notifications,
  selectedId,
  unreadCount,
  activeTab,
  isLoading,
  onSelectNotification,
  onTabChange,
  onInlineAction,
  onAvatarClick,
}: InboxMasterListProps) {
  const { t } = useTranslation('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  // Client-side search filtering
  const filteredNotifications = useMemo(() => {
    if (!searchQuery.trim()) return notifications;
    const query = searchQuery.toLowerCase().trim();
    return notifications.filter(
      (n) =>
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query) ||
        n.actor?.name.toLowerCase().includes(query)
    );
  }, [notifications, searchQuery]);

  // Group notifications by date
  const grouped = useMemo<GroupedNotifications>(() => {
    const result: GroupedNotifications = {
      today: [],
      yesterday: [],
      earlier: [],
    };

    filteredNotifications.forEach((notification) => {
      const date = parseISO(notification.createdAt);
      if (isToday(date)) {
        result.today.push(notification);
      } else if (isYesterday(date)) {
        result.yesterday.push(notification);
      } else {
        result.earlier.push(notification);
      }
    });

    return result;
  }, [filteredNotifications]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!filteredNotifications.length) return;

      const currentIndex = selectedId
        ? filteredNotifications.findIndex((n) => n.id === selectedId)
        : -1;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = currentIndex < filteredNotifications.length - 1 ? currentIndex + 1 : 0;
        onSelectNotification(filteredNotifications[nextIndex]);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredNotifications.length - 1;
        onSelectNotification(filteredNotifications[prevIndex]);
      }
    },
    [filteredNotifications, selectedId, onSelectNotification]
  );

  const renderGroup = (title: string, items: Notification[]) => {
    if (items.length === 0) return null;

    return (
      <div key={title}>
        <div className="sticky top-0 z-10 px-4 py-2 bg-muted/80 backdrop-blur-sm border-b">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </h3>
        </div>
        <div className="divide-y divide-border">
          {items.map((notification) => (
            <InboxListItem
              key={notification.id}
              notification={notification}
              isSelected={notification.id === selectedId}
              onSelect={onSelectNotification}
              onInlineAction={onInlineAction}
              onAvatarClick={onAvatarClick}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full" onKeyDown={handleKeyDown}>
      {/* Tabs */}
      <div className="shrink-0 px-4 pt-4 pb-2">
        <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as NotificationTab)}>
          <TabsList className="w-full grid grid-cols-4">
            {TABS.map((tab) => (
              <TabsTrigger key={tab} value={tab} className="text-xs">
                {NOTIFICATION_TAB_LABELS[tab]}
                {tab === 'inbox' && unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Search */}
      <div className="shrink-0 px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <InputFieldText
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search', 'Search notifications...')}
            className="pl-9 bg-muted/50 border-transparent focus:border-input"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 min-h-0 overflow-hidden" ref={listRef}>
        <SimpleBar className="h-full">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="text-4xl mb-4">📭</div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                {searchQuery
                  ? t('empty.noResults', 'No results found')
                  : activeTab === 'inbox'
                    ? t('empty.noUnread', 'All caught up!')
                    : activeTab === 'following'
                      ? t('empty.noFollowing', 'Not following anything')
                      : activeTab === 'archived'
                        ? t('empty.noArchived', 'No archived items')
                        : t('empty.noNotifications', 'No notifications')}
              </h3>
              <p className="text-xs text-muted-foreground/70">
                {searchQuery
                  ? t('empty.tryDifferentSearch', 'Try a different search term')
                  : t('empty.checkBackLater', 'Check back later for updates')}
              </p>
            </div>
          ) : (
            <div>
              {renderGroup(t('groups.today', 'Today'), grouped.today)}
              {renderGroup(t('groups.yesterday', 'Yesterday'), grouped.yesterday)}
              {renderGroup(t('groups.earlier', 'Earlier'), grouped.earlier)}
            </div>
          )}
        </SimpleBar>
      </div>
    </div>
  );
}
