import { useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search, Star, Paperclip, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SimpleBar from 'simplebar-react';
import InputFieldText from '@/components/forms/inputs/InputFieldText';
import { useMailList, useToggleStar, useMarkAsRead } from '../../application/hooks/useEmail';
import type { Mail, MailTray } from '../../domain/models/Email';
import { format } from 'date-fns';
import { cn } from '@/shadcn/lib/utils';

interface MessageListProps {
  tray: MailTray;
  activeMessageId?: string;
  onSelectMessage?: (id: string) => void;
}

export function MessageList({ tray, activeMessageId, onSelectMessage }: MessageListProps) {
  const { t } = useTranslation('email');
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'unread' | 'starred' | 'attachments' | null>(null);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = useMailList(tray, {
    q: searchQuery || undefined,
    filter: activeFilter || undefined,
  });

  const allMessages = data?.pages.flatMap((page) => page.messages) || [];

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: allMessages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 88,
    overscan: 5,
  });

  const handleSelectMessage = (id: string) => {
    navigate(`/apps/email/${tray}/${id}`);
    onSelectMessage?.(id);
  };

  const filterChips = [
    { id: 'unread' as const, label: t('filters.unread', 'Unread') },
    { id: 'starred' as const, label: t('filters.starred', 'Starred') },
    { id: 'attachments' as const, label: t('filters.attachments', 'Has attachments') },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <InputFieldText
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search', 'Search mail…')}
            className="pl-9 bg-background border-transparent focus:border-input"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 flex-wrap">
          {filterChips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setActiveFilter(activeFilter === chip.id ? null : chip.id)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-full transition-colors',
                activeFilter === chip.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:bg-muted'
              )}
            >
              {chip.label}
              {activeFilter === chip.id && (
                <X className="inline-block ml-1 size-3" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Message List with SimpleBar */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <SimpleBar className="h-full">
          <div ref={parentRef}>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-sm text-muted-foreground">Loading...</div>
              </div>
            ) : allMessages.length === 0 ? (
              <div className="flex items-center justify-center h-32 px-4 text-center">
                <div className="text-sm text-muted-foreground">
                  {searchQuery
                    ? t('noResults', 'No messages found')
                    : t('noMessages', 'No messages in this folder')}
                </div>
              </div>
            ) : (
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {virtualizer.getVirtualItems().map((virtualItem) => {
                  const message = allMessages[virtualItem.index];
                  return (
                    <MessageItem
                      key={message.id}
                      message={message}
                      isActive={message.id === activeMessageId}
                      onClick={() => handleSelectMessage(message.id)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                    />
                  );
                })}
              </div>
            )}

            {hasNextPage && (
              <div className="p-4">
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  className="w-full py-2 text-sm text-primary hover:underline"
                >
                  {t('loadMore', 'Load more')}
                </button>
              </div>
            )}
          </div>
        </SimpleBar>
      </div>
    </div>
  );
}

interface MessageItemProps {
  message: Mail;
  isActive: boolean;
  onClick: () => void;
  style: React.CSSProperties;
}

function MessageItem({ message, isActive, onClick, style }: MessageItemProps) {
  const toggleStarMutation = useToggleStar();
  const markAsReadMutation = useMarkAsRead();

  const timeAgo = useMemo(() => {
    try {
      const date = new Date(message.dateISO);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return format(date, 'HH:mm');
      } else if (diffDays < 7) {
        return format(date, 'EEE');
      } else {
        return format(date, 'MMM d');
      }
    } catch {
      return '';
    }
  }, [message.dateISO]);

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStarMutation.mutate({ id: message.id, starred: !message.starred });
  };

  const handleClick = () => {
    if (!message.read) {
      markAsReadMutation.mutate({ id: message.id, read: true });
    }
    onClick();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'flex items-start gap-3 p-4 cursor-pointer transition-colors border-b',
        isActive ? 'bg-accent' : 'hover:bg-accent/50',
        !message.read && 'bg-muted/30'
      )}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      style={style}
    >
      {/* Avatar */}
      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-semibold">
        {message.from.name.charAt(0).toUpperCase()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <span className={cn('text-sm truncate', !message.read && 'font-semibold')}>
            {message.from.name}
          </span>
          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
            {timeAgo}
          </span>
        </div>
        
        <div className="flex items-center gap-2 mb-1">
          <p className={cn('text-sm truncate flex-1', !message.read && 'font-semibold')}>
            {message.subject}
          </p>
          {message.attachments && message.attachments.length > 0 && (
            <Paperclip className="size-3 text-muted-foreground flex-shrink-0" />
          )}
        </div>
        
        <p className="text-xs text-muted-foreground truncate">
          {message.snippet}
        </p>
      </div>

      {/* Right side: indicators and star */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          {!message.read && (
            <div className="size-2 rounded-full bg-primary" />
          )}
          <button
            type="button"
            onClick={handleStarClick}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <Star
              className={cn(
                'size-4',
                message.starred
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground'
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}