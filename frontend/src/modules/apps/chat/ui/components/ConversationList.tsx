import { useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search, Star, MoreVertical } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import SimpleBar from 'simplebar-react';
import InputFieldText from '@/components/forms/inputs/InputFieldText';
import ActionButton from '@/components/forms/buttons/ActionButton';
import { useConversations } from '../../application/hooks/useChat';
import type { Conversation } from '../../domain/models/Chat';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/shadcn/lib/utils';
import { HighlightedText } from '@/shared/ui/components/HighlightedText';

interface ConversationListProps {
  onSelectConversation?: (convId: string) => void;
  activeConvId?: string; // For desktop layout where component is outside Routes
}

export function ConversationList({ onSelectConversation, activeConvId: activeConvIdProp }: ConversationListProps) {
  const { t } = useTranslation('chat');
  const navigate = useNavigate();
  const { convId: activeConvIdFromRoute } = useParams();
  
  // Use prop if provided (desktop), otherwise use route param (mobile)
  const activeConvId = activeConvIdProp || activeConvIdFromRoute;
  
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all conversations (no server-side filtering for instant search)
  const { data: allConversations = [], isLoading } = useConversations();

  // Client-side filtering for instant search with highlighting
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return allConversations;
    
    const query = searchQuery.toLowerCase().trim();
    return allConversations.filter((conv) => 
      conv.title.toLowerCase().includes(query)
    );
  }, [allConversations, searchQuery]);

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: filteredConversations.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 5,
  });

  const handleSelectConversation = (convId: string) => {
    navigate(`/apps/chat/${convId}`);
    onSelectConversation?.(convId);
  };

  const handleKeyDown = (e: React.KeyboardEvent, convId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelectConversation(convId);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* User Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <div className="size-12 rounded-full bg-primary/10 overflow-hidden flex-shrink-0">
          <div className="size-full flex items-center justify-center text-lg font-semibold text-primary">
            U
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium">{t('currentUser', 'Current User')}</div>
          <div className="text-xs text-green-500">{t('online', 'Online')}</div>
        </div>
        <ActionButton variant="ghost" size="sm" className="size-9 p-0">
          <MoreVertical className="size-4" />
        </ActionButton>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <InputFieldText
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchContact', 'Search contact')}
            className="pl-9 bg-muted/50 border-transparent focus:border-input"
          />
        </div>
      </div>

      {/* Conversation List with SimpleBar - min-h-0 is critical for flex overflow */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <SimpleBar className="h-full">
          <div ref={parentRef}>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-32 px-4 text-center">
            <div className="text-sm text-muted-foreground">
              {searchQuery ? t('noResults', 'No conversations found') : t('noConversations', 'No conversations yet')}
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
              const conversation = filteredConversations[virtualItem.index];
              return (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={conversation.id === activeConvId}
                  searchQuery={searchQuery}
                  onClick={() => handleSelectConversation(conversation.id)}
                  onKeyDown={(e) => handleKeyDown(e, conversation.id)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 4,
                    width: 'calc(100% - 8px)',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                />
              );
            })}
          </div>
          )}
          </div>
        </SimpleBar>
      </div>
    </div>
  );
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  searchQuery: string;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  style: React.CSSProperties;
}

/**
 * Highlights matching text in a string
 */
function ConversationItem({ conversation, isActive, searchQuery, onClick, onKeyDown, style }: ConversationItemProps) {
  const timeAgo = useMemo(() => {
    try {
      return formatDistanceToNow(new Date(conversation.lastAt), { addSuffix: true });
    } catch {
      return '';
    }
  }, [conversation.lastAt]);

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors rounded-lg',
        isActive
          ? 'bg-muted'
          : 'hover:bg-muted/50'
      )}
      onClick={onClick}
      onKeyDown={onKeyDown}
      style={style}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="size-11 rounded-full bg-muted overflow-hidden">
          {conversation.avatar ? (
            <img
              src={conversation.avatar}
              alt={conversation.title}
              className="size-full object-cover"
            />
          ) : (
            <div className="size-full flex items-center justify-center text-base font-semibold">
              {conversation.title.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        {conversation.online && (
          <div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-background" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium truncate">
              <HighlightedText text={conversation.title} query={searchQuery} />
            </p>
            {conversation.favorite && (
              <Star className="size-3 fill-yellow-400 text-yellow-400" />
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {conversation.typing ? (
            <span className="italic text-primary">typing...</span>
          ) : (
            conversation.lastMessage
          )}
        </p>
      </div>

      {/* Right side: time and unread */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-[10px] text-muted-foreground">
          {timeAgo}
        </span>
        {conversation.unread > 0 && (
          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary text-primary-foreground rounded-full min-w-[18px] text-center">
            {conversation.unread}
          </span>
        )}
      </div>
    </div>
  );
}
