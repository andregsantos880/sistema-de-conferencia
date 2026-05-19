import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Paperclip, Reply, Forward } from 'lucide-react';


import Linkify from 'linkify-react';
import { format } from 'date-fns';
import SimpleBar from 'simplebar-react';
import { useMailMessage, useToggleStar, useMoveTo } from '../../application/hooks/useEmail';
import ActionButton from '@/components/forms/buttons/ActionButton';
import { cn } from '@/shadcn/lib/utils';
import { EmailReaderToolbar } from './EmailReaderToolbar';

interface MessageReaderProps {
  messageId?: string;
  isMobile?: boolean;
  onClose?: () => void;
}

export function MessageReader({ messageId: messageIdProp, isMobile, onClose }: MessageReaderProps) {
  const { t } = useTranslation('email');
  const navigate = useNavigate();
  const { id: messageIdFromRoute, tray } = useParams();
  
  const messageId = messageIdProp || messageIdFromRoute;
  const { data: message, isLoading } = useMailMessage(messageId || '');
  const toggleStarMutation = useToggleStar();
  const moveToMutation = useMoveTo();

  const handleBack = () => {
    if (isMobile && tray) {
      navigate(`/apps/email/${tray}`);
    } else {
      onClose?.();
    }
  };

  const handleStar = () => {
    if (message) {
      toggleStarMutation.mutate({ id: message.id, starred: !message.starred });
    }
  };

  const handleTrash = () => {
    if (message) {
      moveToMutation.mutate({ id: message.id, tray: 'trash' });
      handleBack();
    }
  };

  if (!messageId) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/20">
        <div className="text-center">
          <div className="text-4xl mb-4">📧</div>
          <h3 className="text-lg font-semibold mb-2">{t('selectMessage', 'Select a message')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('selectMessageDesc', 'Choose a message from the list to read')}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-muted-foreground">Message not found</div>
      </div>
    );
  }

  const cc = message.cc ?? [];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with navigation and actions */}
      <EmailReaderToolbar 
        onBack={isMobile ? handleBack : undefined}
        onStar={handleStar}
        onArchive={() => { moveToMutation.mutate({ id: message.id, tray: 'archive' }); handleBack(); }}
        onTrash={handleTrash}
        onMarkRead={() => { /* Implement toggle read */ }}
        onSnooze={() => {}}
        onTag={() => {}}
        onPrev={!isMobile ? () => {} : undefined}
        onNext={!isMobile ? () => {} : undefined}
        navLabel={!isMobile ? "1 of 250" : undefined}
        isStarred={message.starred}
        isRead={message.read}
        showBack={isMobile}
        className="px-4 py-2 border-b"
      />

      <div className="flex-shrink-0 p-6 border-b">
        {/* From info */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-lg font-semibold">
              {message.from.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                {message.from.name} to {message.to[0]?.name || 'recipient'}
              </div>
              <h2 className="font-medium">{message.subject}</h2>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            {format(new Date(message.dateISO), 'PPp')}
          </span>
        </div>
      </div>

      {/* Message Content with SimpleBar */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <SimpleBar className="h-full">
          <div className="p-6">
            {/* To/Cc details */}
            <div className="text-sm space-y-1 mb-6">
              <div>
                <span className="text-muted-foreground">To: </span>
                {message.to.map((addr, i) => (
                  <span key={i}>
                    {addr.name} &lt;{addr.email}&gt;
                    {i < message.to.length - 1 && ', '}
                  </span>
                ))}
              </div>
              {cc.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Cc: </span>
                  {cc.map((addr, i) => (
                    <span key={i}>
                      {addr.name} &lt;{addr.email}&gt;
                      {i < cc.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Body */}
            <div className="prose prose-sm dark:prose-invert max-w-3xl">
              <Linkify
                options={{
                  className: 'text-primary underline hover:no-underline',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                }}
              >
                <div className="whitespace-pre-wrap">{message.body}</div>
              </Linkify>
            </div>

            {/* Attachments - styled like the reference */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="flex gap-3 pt-6 mt-6">
                {message.attachments.map((att, index) => {
                  const colors = [
                    { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', icon: 'text-blue-500' },
                    { bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-800', icon: 'text-orange-500' },
                    { bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-800', icon: 'text-green-500' },
                  ];
                  const color = colors[index % colors.length];
                  return (
                    <div
                      key={att.id}
                      className={cn(
                        'flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity',
                        color.bg,
                        color.border
                      )}
                    >
                      <Paperclip className={cn('size-4', color.icon)} />
                      <div>
                        <div className="text-sm font-medium">{att.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {(att.sizeBytes / 1024 / 1024).toFixed(2)}MB
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </SimpleBar>
      </div>

      {/* Footer actions */}
      <div className="flex-shrink-0 p-4 border-t flex items-center gap-2">
        <ActionButton variant="ghost" size="sm" className="size-9 p-0" onClick={handleStar}>
          <Star className={cn('size-4', message.starred ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground')} />
        </ActionButton>
        <ActionButton variant="ghost" size="sm" className="size-9 p-0">
          <Reply className="size-4 text-muted-foreground" />
        </ActionButton>
        <ActionButton variant="ghost" size="sm" className="size-9 p-0">
          <Forward className="size-4 text-muted-foreground" />
        </ActionButton>
      </div>
    </div>
  );
}
