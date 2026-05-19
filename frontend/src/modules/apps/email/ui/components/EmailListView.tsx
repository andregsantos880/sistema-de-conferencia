import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Star, Trash2, Mail, MoreHorizontal, ChevronLeft, ChevronRight, RefreshCw, MoreVertical, Paperclip } from 'lucide-react';
import SimpleBar from 'simplebar-react';
import InputFieldText from '@/components/forms/inputs/InputFieldText';
import { useMailList, useToggleStar, useMarkAsRead, useMoveTo } from '../../application/hooks/useEmail';
import type { Mail as MailType, MailTray } from '../../domain/models/Email';
import { format } from 'date-fns';
import { cn } from '@/shadcn/lib/utils';
import ActionButton from '@/components/forms/buttons/ActionButton';
import { Checkbox } from '@/shared/ui/shadcn/components/ui/checkbox';
import { useBulkSelection } from '@/shared/hooks';

interface EmailListViewProps {
  tray: MailTray;
  onSelectMessage: (id: string) => void;
}

export function EmailListView({ tray, onSelectMessage }: EmailListViewProps) {
  const { t } = useTranslation('email');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    isSelected,
    toggle,
    selectAll,
    clear,
    isAllSelected,
  } = useBulkSelection<string>();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useMailList(tray, {
    q: searchQuery || undefined,
  });

  const allMessages = data?.pages.flatMap((page) => page.messages) || [];
  const messageIds = allMessages.map((m) => m.id);
  const allSelected = isAllSelected(messageIds);

  const toggleSelectAll = () => {
    if (allSelected) {
      clear();
    } else {
      selectAll(messageIds);
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggle(id);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allSelected && allMessages.length > 0}
            onCheckedChange={toggleSelectAll}
            className="size-4"
          />
          <ActionButton variant="ghost" size="sm" className="size-8 p-0" onClick={() => refetch()}>
            <RefreshCw className="size-4 text-muted-foreground" />
          </ActionButton>
          <ActionButton variant="ghost" size="sm" className="size-8 p-0">
            <MoreHorizontal className="size-4 text-muted-foreground" />
          </ActionButton>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <InputFieldText
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search', 'Search here...')}
              className="pl-9 h-9 bg-muted/50 border-transparent focus:border-input"
            />
          </div>
        </div>

        {/* Pagination info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>1 - {allMessages.length} of {allMessages.length}</span>
          <ActionButton variant="ghost" size="sm" className="size-8 p-0">
            <ChevronLeft className="size-4" />
          </ActionButton>
          <ActionButton variant="ghost" size="sm" className="size-8 p-0">
            <ChevronRight className="size-4" />
          </ActionButton>
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <SimpleBar className="h-full">
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
            <div>
              {allMessages.map((message) => (
                <EmailRow
                  key={message.id}
                  message={message}
                  isSelected={isSelected(message.id)}
                  onToggleSelect={(e) => toggleSelect(message.id, e)}
                  onClick={() => onSelectMessage(message.id)}
                />
              ))}
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
        </SimpleBar>
      </div>
    </div>
  );
}

interface EmailRowProps {
  message: MailType;
  isSelected: boolean;
  onToggleSelect: (e: React.MouseEvent) => void;
  onClick: () => void;
}

function EmailRow({ message, isSelected, onToggleSelect, onClick }: EmailRowProps) {
  const [isHovered, setIsHovered] = useState(false);
  const toggleStarMutation = useToggleStar();
  const markAsReadMutation = useMarkAsRead();
  const moveToMutation = useMoveTo();

  const timeDisplay = useMemo(() => {
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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    moveToMutation.mutate({ id: message.id, tray: 'trash' });
  };

  const handleMarkRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsReadMutation.mutate({ id: message.id, read: !message.read });
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
        'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b hover:bg-accent/50 h-[49px]',
        !message.read && 'bg-muted/30'
      )}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Checkbox */}
      <div onClick={onToggleSelect} className="flex-shrink-0">
        <Checkbox checked={isSelected} className="size-4" />
      </div>

      {/* Star */}
      <button
        type="button"
        onClick={handleStarClick}
        className="flex-shrink-0 p-1 hover:bg-accent rounded transition-colors"
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

      {/* Unread indicator */}
      <div className="flex-shrink-0 w-2">
        {!message.read && (
          <div className="size-2 rounded-full bg-primary" />
        )}
      </div>

      {/* Sender */}
      <div className={cn('w-40 flex-shrink-0 truncate text-sm', !message.read && 'font-semibold')}>
        {message.from.name}
      </div>

      {/* Subject and preview */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className={cn('text-sm truncate', !message.read && 'font-semibold')}>
          {message.subject}
        </span>
        <span className="text-sm text-muted-foreground truncate hidden lg:inline">
          {message.snippet}
        </span>
      </div>

      {/* Attachment Icon */}
      {message.attachments && message.attachments.length > 0 && !isHovered && (
        <Paperclip className="size-3.5 text-muted-foreground flex-shrink-0 ml-auto" />
      )}

      {/* Labels */}
      {message.labels.length > 0 && !isHovered && (
        <div className="flex gap-1 flex-shrink-0">
          {message.labels.slice(0, 2).map((label) => (
            <span
              key={label}
              className="px-2 py-2 text-xs rounded-full bg-primary/10 text-primary"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Hover actions */}
      {isHovered ? (
        <div className="flex items-center gap-1 flex-shrink-0">
          <ActionButton
            variant="ghost"
            size="sm"
            className="size-8 p-0"
            onClick={handleDelete}
          >
            <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
          </ActionButton>
          <ActionButton
            variant="ghost"
            size="sm"
            className="size-8 p-0"
            onClick={handleMarkRead}
          >
            <Mail className="size-4 text-muted-foreground" />
          </ActionButton>
          <ActionButton
            variant="ghost"
            size="sm"
            className="size-8 p-0"
          >
            <MoreVertical className="size-4 text-muted-foreground" />
          </ActionButton>
        </div>
      ) : (
        /* Date */
        <div className="text-xs text-muted-foreground flex-shrink-0 w-16 text-right">
          {timeDisplay}
        </div>
      )}
    </div>
  );
}
