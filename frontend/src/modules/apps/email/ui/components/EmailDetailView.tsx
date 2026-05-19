import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleBar from 'simplebar-react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { 
  Reply, 
  Forward, 
  Printer, 
  Trash2, 
  Paperclip,
  Smile
} from 'lucide-react';

import { 
  useMailMessage, 
  useMoveTo, 
  useSendReply, 
  useToggleStar, 
  useSaveDraft,
  useMarkAsRead
} from '../../application/hooks/useEmail';
import { EmailReaderToolbar } from './EmailReaderToolbar';
import { EmailComposer } from './EmailComposer';
import { FileUploadDropOverlay, AttachmentPreview } from '@/shared/ui/components/files';
import { useClipboardPaste } from '@/shared/hooks';
import ActionButton from '@/components/forms/buttons/ActionButton';
import type { Attachment } from '../../domain/models/Email';

import { 
  Tooltip as TooltipRoot, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/shared/ui/shadcn/components/ui/tooltip';

const TooltipWrapper: React.FC<{ children: React.ReactNode; label: string }> = ({ children, label }) => (
  <TooltipRoot>
    <TooltipTrigger asChild>
      {children}
    </TooltipTrigger>
    <TooltipContent side="bottom" className="text-[10px] font-bold py-1 px-2">
      {label}
    </TooltipContent>
  </TooltipRoot>
);

interface EmailDetailViewProps {
  messageId: string;
  onBack: () => void;
}

export function EmailDetailView({ messageId, onBack }: EmailDetailViewProps) {
  const { t } = useTranslation('email');
  const [isReplyExpanded, setIsReplyExpanded] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  const { data: message, isLoading } = useMailMessage(messageId);
  const moveToMutation = useMoveTo();
  const sendReplyMutation = useSendReply();
  const toggleStarMutation = useToggleStar();
  const saveDraftMutation = useSaveDraft();
  const markAsReadMutation = useMarkAsRead();

  const handleAddAttachment = (att: Attachment) => {
    setAttachments(prev => [...prev, att]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSendReply = () => {
    if (message && (replyText.trim() || attachments.length > 0)) {
      sendReplyMutation.mutate(
        { id: message.id, body: replyText },
        {
          onSuccess: () => {
            setReplyText('');
            setAttachments([]);
            setIsReplyExpanded(false);
          },
        }
      );
    }
  };

  const handleSaveDraft = () => {
    if (message) {
      saveDraftMutation.mutate({
        to: [message.from],
        subject: `Re: ${message.subject}`,
        body: replyText,
        attachments: attachments,
      }, {
        onSuccess: () => {
          setIsReplyExpanded(false);
          setReplyText('');
          setAttachments([]);
        }
      });
    }
  };

  const handleDiscard = () => {
    setReplyText('');
    setAttachments([]);
    setIsReplyExpanded(false);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const newAtt: Attachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: file.type,
        url: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        name: file.name,
        sizeBytes: file.size,
      };
      handleAddAttachment(newAtt);
    });
    setIsReplyExpanded(true);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  useClipboardPaste({
    enableFiles: true,
    onFilesPaste: onDrop
  });

  const handleArchive = () => {
    if (message) {
      moveToMutation.mutate({ id: message.id, tray: 'archive' });
      onBack();
    }
  };

  const handleTrash = () => {
    if (message) {
      moveToMutation.mutate({ id: message.id, tray: 'trash' });
      onBack();
    }
  };

  const handleStar = () => {
    if (message) {
      toggleStarMutation.mutate({ id: message.id, starred: !message.starred });
    }
  };

  const handleMarkRead = () => {
    if (message) {
      markAsReadMutation.mutate({ id: message.id, read: !message.read });
      if (message.read) {
        // If we are marking as UNREAD, we should go back to list
        onBack();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-sm text-muted-foreground font-medium">Loading conversation...</div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="size-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
             <Trash2 className="size-8 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-lg">Message not found</h3>
          <p className="text-sm text-muted-foreground mb-6">It might have been permanently deleted.</p>
          <ActionButton onClick={onBack} variant="outline">Back to Inbox</ActionButton>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={400}>
      <div className="flex flex-col h-full bg-background relative overflow-hidden" {...getRootProps()}>
        <input {...getInputProps()} />
        <FileUploadDropOverlay isDragActive={isDragActive} />

        {/* Header toolbar */}
        <EmailReaderToolbar
          onBack={onBack}
          onStar={handleStar}
          onArchive={handleArchive}
          onTrash={handleTrash}
          onMarkRead={handleMarkRead}
          onSnooze={() => {}}
          onTag={() => {}}
          isStarred={message.starred}
          isRead={message.read}
          className="px-4 py-2 border-b bg-background/80 backdrop-blur-md sticky top-0 z-10"
        />


        {/* Content area with scroll */}
        <div className="flex-1 min-h-0 overflow-hidden bg-muted/5 relative">
          <SimpleBar className="h-full">
            <div className="max-w-4xl mx-auto p-8 pb-32"> {/* Added padding bottom to account for sticky footer */}
              {/* Subject and actions */}
              <div className="flex items-start justify-between gap-4 mb-8">
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">{message.subject}</h1>
                  <div className="flex gap-2">
                    {message.labels.map((label) => (
                      <span
                        key={label}
                        className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider rounded-md bg-primary/10 text-primary border border-primary/20"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <TooltipWrapper label="Print">
                    <ActionButton variant="ghost" size="icon" className="size-8"><Printer className="size-4" /></ActionButton>
                  </TooltipWrapper>
                </div>
              </div>

            {/* Sender info */}
            <div className="flex items-center gap-4 mb-8">
              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-lg font-bold text-primary border border-primary/20 shadow-sm">
                {message.from.name.charAt(0).toUpperCase()}
                {message.from.name.split(' ')[1]?.charAt(0).toUpperCase() || ''}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-foreground">{message.from.name}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">Jan 29, 2026, 11:06 AM</span>
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  &lt;{message.from.email}&gt;
                </div>
              </div>
            </div>

            {/* Email body (Markdown rendered) */}
            <div className="prose prose-sm dark:prose-invert max-w-none mb-12">
              <div className="text-[15px] leading-relaxed text-foreground/90 font-normal markdown-content">
                <ReactMarkdown>{message.body}</ReactMarkdown>
              </div>
            </div>

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mb-12 pt-8 border-t border-border/50">
                <div className="flex items-center gap-2 mb-4">
                  <Paperclip className="size-4 text-muted-foreground" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {t('attachments', 'Attachments')} ({message.attachments.length})
                  </h3>
                </div>
                <AttachmentPreview 
                  variant="list"
                  attachments={message.attachments.map(att => ({
                    id: att.id,
                    name: att.name,
                    type: att.type,
                    url: att.url,
                    size: att.sizeBytes
                  }))}
                  onDownload={(att) => window.open(att.url, '_blank')}
                  onView={(att) => window.open(att.url, '_blank')}
                />
              </div>
            )}

            {/* Placeholder for expansion space */}
            {isReplyExpanded && <div className="h-64" />}
          </div>
        </SimpleBar>

        {!isReplyExpanded && (
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-background border-t border-border z-10 pointer-events-none">
            <div className="max-w-4xl mx-auto flex items-center gap-2 pointer-events-auto">
              <button 
                onClick={() => setIsReplyExpanded(true)}
                className="flex items-center gap-2.5 py-2.5 px-6 rounded-full border border-border bg-background hover:bg-muted transition-all font-medium text-sm text-foreground/80 group"
              >
                <Reply className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span>Reply</span>
              </button>
              
              <button 
                className="flex items-center gap-2.5 py-2.5 px-6 rounded-full border border-border bg-background hover:bg-muted transition-all font-medium text-sm text-foreground/80 group"
              >
                <Forward className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span>Forward</span>
              </button>

              <button 
                className="size-10 flex items-center justify-center rounded-full border border-border bg-background hover:bg-muted transition-all text-muted-foreground hover:text-foreground"
              >
                <Smile className="size-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reply composer - Sliding Panel */}
      <AnimatePresence>
        {isReplyExpanded && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 z-20 shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.15)] bg-background border-t border-border"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/20">
              <div className="flex items-center gap-2">
                 <div className="size-6 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Reply className="size-3 text-primary" />
                 </div>
                 <span className="text-xs font-bold tracking-widest text-muted-foreground">Draft Reply</span>
              </div>
              <ActionButton variant="ghost" size="icon" className="size-8" onClick={handleDiscard}>
                <Trash2 className="size-4 text-muted-foreground hover:text-red-500" />
              </ActionButton>
            </div>
            
            <EmailComposer
              isReply
              to={message.from.email}
              onToChange={() => {}}
              subject={`Re: ${message.subject}`}
              onSubjectChange={() => {}}
              body={replyText}
              onBodyChange={setReplyText}
              attachments={attachments}
              onAddAttachment={handleAddAttachment}
              onRemoveAttachment={handleRemoveAttachment}
              onSend={handleSendReply}
              onSaveDraft={handleSaveDraft}
              onDiscard={handleDiscard}
              isLoading={sendReplyMutation.isPending || saveDraftMutation.isPending}
              className="max-h-[500px]"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </TooltipProvider>
  );
}
