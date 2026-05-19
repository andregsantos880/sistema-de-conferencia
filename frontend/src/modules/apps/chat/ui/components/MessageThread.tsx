import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Video, MoreVertical, Search } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import SimpleBar from 'simplebar-react';
import { format, isToday, isYesterday } from 'date-fns';
import { useMessages, useSendMessage, useMarkAsRead, useConversations } from '../../application/hooks/useChat';
import type { Attachment, ChatMessage } from '../../domain/models/Chat';
import ActionButton from '@/components/forms/buttons/ActionButton';
import { TypingIndicator, PresenceStatus, MessageBubble, ChatComposer } from './index';
import { useClipboardPaste } from '@/shared/hooks';
import { FileUploadDropOverlay } from '@/shared/ui/components/files';

interface MessageThreadProps {
  onAvatarClick?: () => void;
  isMobile?: boolean;
}

export function MessageThread({ onAvatarClick, isMobile }: MessageThreadProps) {
  const { t } = useTranslation('chat');
  const navigate = useNavigate();
  const { convId } = useParams();
  const [messageText, setMessageText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [] } = useConversations();
  const conversation = conversations.find((c) => c.id === convId);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = useMessages(convId || '');

  const sendMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();

  // Flatten all messages from pages
  const allMessages = data?.pages.flatMap((page) => page.messages) || [];

  // Group messages by day
  const groupedMessages = groupMessagesByDay(allMessages);

  // Mark as read when conversation opens
  useEffect(() => {
    if (convId && conversation?.unread && conversation.unread > 0) {
      markAsReadMutation.mutate(convId);
    }
  }, [convId, conversation?.unread, markAsReadMutation]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current && allMessages.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allMessages.length]);

  // removeAttachment handler

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newAttachments: Attachment[] = acceptedFiles.map(file => ({
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : '#',
      name: file.name,
      size: file.size,
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    accept: {
      'image/*': [],
      'application/pdf': [],
      'text/plain': [],
    }
  });

  useClipboardPaste({
    enableFiles: true,
    onFilesPaste: onDrop
  });

  const handleSend = () => {
    if ((!messageText.trim() && attachments.length === 0) || !convId) return;

    sendMutation.mutate({
      convId,
      text: messageText.trim(),
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    setMessageText('');
    setAttachments([]);
  };

  const handleBack = () => {
    navigate('/apps/chat');
  };

  if (!convId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-lg font-semibold mb-2">{t('selectConversation', 'Select a conversation')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('selectConversationDesc', 'Choose a conversation from the list to start chatting')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden relative" {...getRootProps()}>
      <input {...getInputProps()} />

      <FileUploadDropOverlay isDragActive={isDragActive} />

      {/* Header */}
      <div className="flex-shrink-0 justify-between flex items-center gap-3 px-4 py-3 bg-background border-b">
        {isMobile && (
          <button
            type="button"
            onClick={handleBack}
            className="p-2 -ml-2 hover:bg-accent rounded-lg transition-colors"
            aria-label={t('back', 'Back')}
          >
            <ArrowLeft className="size-5" />
          </button>
        )}

        <button
          type="button"
          onClick={onAvatarClick}
          className="flex items-center gap-3 flex-1 min-w-0 hover:bg-accent/50 rounded-lg p-2 -ml-2 transition-colors cursor-pointer"
        >
          <div className="relative flex-shrink-0">
            <div className="size-10 rounded-full bg-muted overflow-hidden">
              {conversation?.avatar ? (
                <img
                  src={conversation.avatar}
                  alt={conversation.title}
                  className="size-full object-cover"
                />
              ) : (
                <div className="size-full flex items-center justify-center font-semibold">
                  {conversation?.title.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {conversation?.online && (
              <div className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full border-2 border-background" />
            )}
          </div>

          <div className="flex-1 min-w-0 text-left">
            <div className="font-medium truncate">{conversation?.title}</div>
            <div className="text-xs">
              <PresenceStatus 
                online={conversation?.online} 
                typing={conversation?.typing} 
              />
            </div>
          </div>
        </button>

        <div className="flex items-center gap-1">
          <ActionButton variant="ghost" size="sm" className="size-9 p-0">
            <Search className="size-5 text-muted-foreground" />
          </ActionButton>
          <ActionButton variant="ghost" size="sm" className="size-9 p-0">
            <Phone className="size-5 text-muted-foreground" />
          </ActionButton>
          <ActionButton variant="ghost" size="sm" className="size-9 p-0">
            <Video className="size-5 text-muted-foreground" />
          </ActionButton>
          <ActionButton variant="ghost" size="sm" className="size-9 p-0" onClick={onAvatarClick}>
            <MoreVertical className="size-5 text-muted-foreground" />
          </ActionButton>
        </div>
      </div>

      {/* Messages with SimpleBar - min-h-0 is critical for flex overflow */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <SimpleBar className="h-full" scrollableNodeProps={{ ref: scrollRef }}>
          <div className="p-6 space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-sm text-muted-foreground">Loading messages...</div>
              </div>
            ) : allMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-2xl mb-2">👋</div>
                  <p className="text-sm text-muted-foreground">
                    {t('noMessages', 'No messages yet. Start the conversation!')}
                  </p>
                </div>
              </div>
            ) : (
            <>
              {hasNextPage && (
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  className="w-full py-2 text-sm text-primary hover:underline"
                >
                  {t('loadOlder', 'Load older messages')}
                </button>
              )}

              {groupedMessages.map((group) => (
                <div key={group.date} className="space-y-3">
                  <div className="flex items-center justify-center">
                    <div className="px-3 py-1 text-xs font-medium bg-muted rounded-full">
                      {group.label}
                    </div>
                  </div>

                  {group.messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      showAvatar={!message.fromMe}
                      avatar={conversation?.avatar}
                    />
                  ))}
                </div>
              ))}

              {conversation?.typing && (
                <div className="flex gap-2 justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="size-8 rounded-full bg-muted overflow-hidden flex-shrink-0">
                    {conversation.avatar ? (
                      <img src={conversation.avatar} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="size-full flex items-center justify-center text-xs font-semibold">
                        ?
                      </div>
                    )}
                  </div>
                  <TypingIndicator />
                </div>
              )}
            </>

            )}
          </div>
        </SimpleBar>
      </div>

      <ChatComposer 
        value={messageText}
        onValueChange={setMessageText}
        onSend={handleSend}
        attachments={attachments}
        onAddAttachment={(att) => setAttachments(prev => [...prev, att])}
        onRemoveAttachment={removeAttachment}
        isLoading={sendMutation.isPending}
        placeholder={t('typeMessage', 'Type a message')}
      />
    </div>
  );
}



function groupMessagesByDay(messages: ChatMessage[]) {
  const groups: Array<{ date: string; label: string; messages: ChatMessage[] }> = [];
  
  messages.forEach((message) => {
    const messageDate = new Date(message.at);
    const dateKey = format(messageDate, 'yyyy-MM-dd');

    let label: string;
    if (isToday(messageDate)) {
      label = 'Today';
    } else if (isYesterday(messageDate)) {
      label = 'Yesterday';
    } else {
      label = format(messageDate, 'MMMM d, yyyy');
    }

    const existingGroup = groups.find((g) => g.date === dateKey);
    if (existingGroup) {
      existingGroup.messages.push(message);
    } else {
      groups.push({ date: dateKey, label, messages: [message] });
    }
  });

  return groups;
}
