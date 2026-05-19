import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Mail as MailIcon, ArrowLeft, Search, Plus, Paperclip } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMailList, useMailFolders, useMarkAsRead, useToggleStar, useMoveTo, useSaveDraft, useSendReply, useMailMessage } from '../../application/hooks/useEmail';
import { cn } from '@/shadcn/lib/utils';
import SimpleBar from 'simplebar-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import FieldText from '@/shared/ui/components/forms/composites/field/FieldText';
import { Avatar, AvatarFallback } from '@/shared/ui/shadcn/components/ui/avatar';
import ActionButton from '@/components/forms/buttons/ActionButton';
import { EmailReaderToolbar } from '../components/EmailReaderToolbar';
import { EmailComposer } from '../components/EmailComposer';
import { useDropzone } from 'react-dropzone';
import { useClipboardPaste } from '@/shared/hooks';
import { FileUploadDropOverlay } from '@/shared/ui/components/files';
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

export const EmailLightWidget: React.FC = () => {
  const [selectedMailId, setSelectedMailId] = useState<string | null>(null);
  const [composing, setComposing] = useState<{ to?: string; subject?: string } | null>(null);

  return (
    <TooltipProvider delayDuration={400}>
      <div className="flex flex-col h-full overflow-hidden relative">
        <AnimatePresence mode="wait">
          {composing ? (
            <MailComposeStage 
              key="compose"
              initial={composing}
              onBack={() => setComposing(null)}
            />
          ) : !selectedMailId ? (
            <MailListStage 
              key="list" 
              onSelect={setSelectedMailId} 
              onCompose={() => setComposing({})}
            />
          ) : (
            <MailReaderStage 
              key="reader" 
              mailId={selectedMailId} 
              onBack={() => setSelectedMailId(null)} 
            />
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};



// --- Sub-Stages ---

const MailListStage: React.FC<{ onSelect: (id: string) => void; onCompose: () => void }> = ({ onSelect, onCompose }) => {
  const navigate = useNavigate();
  const { data: folders = [] } = useMailFolders();
  const inboxFolder = folders.find(f => f.id === 'inbox');
  const [search, setSearch] = useState('');
  
  const { data, isLoading } = useMailList('inbox', { limit: 10, q: search || undefined });
  const messages = data?.pages.flatMap(p => p.messages) || [];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      <div className="p-4 border-b border-sidebar-border/50">
         <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Inbox</h3>
              <p className="text-sm font-bold mt-0.5">{inboxFolder?.unreadCount || 0} Unread Messages</p>
            </div>
            <TooltipWrapper label="Open full app">
              <button 
                onClick={() => navigate('/apps/email')}
                className="p-2 hover:bg-sidebar-hover rounded-xl transition-colors text-muted-foreground"
              >
                <MailIcon className="size-4" />
              </button>
            </TooltipWrapper>
         </div>
         <FieldText 
           placeholder="Search emails..."
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           icon={<Search className="size-4" />}
           className="bg-sidebar-surface/50 border-sidebar-border"
         />
      </div>

      <div className="flex-1 min-h-0">
        <SimpleBar className="h-full">
          <div className="p-2 space-y-1">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-3 flex gap-3 animate-pulse">
                    <div className="size-10 rounded-full bg-sidebar-hover shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                        <div className="h-2 bg-sidebar-hover rounded w-1/4" />
                        <div className="h-3 bg-sidebar-hover rounded w-3/4" />
                    </div>
                  </div>
              ))
            ) : messages.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="size-16 rounded-full bg-sidebar-hover flex items-center justify-center mx-auto opacity-20">
                    <MailIcon className="size-8" />
                </div>
                <p className="text-xs text-muted-foreground">No messages in inbox</p>
              </div>
            ) : (
              messages.map((mail) => (
                <button
                  key={mail.id}
                  onClick={() => onSelect(mail.id)}
                  className={cn(
                    "flex gap-3 p-3 w-full rounded-xl hover:bg-sidebar-hover transition-colors text-left group items-start",
                    !mail.read && "bg-sidebar-surface shadow-sm"
                  )}
                >
                  <Avatar className="size-10 rounded-2xl border border-sidebar-border">
                    <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                      {mail.from.name[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className={cn("text-xs truncate", !mail.read ? "font-black" : "font-semibold")}>
                        {mail.from.name}
                      </h4>
                      <span className="text-[9px] text-muted-foreground whitespace-nowrap ml-2">
                        {formatDistanceToNow(new Date(mail.dateISO), { addSuffix: false })}
                      </span>
                    </div>
                    <h5 className={cn("text-xs truncate mb-1", !mail.read ? "text-sidebar-foreground font-bold" : "text-muted-foreground")}>
                      {mail.subject}
                    </h5>
                    <p className="text-[10px] text-muted-foreground truncate line-clamp-1">
                      {mail.snippet}
                    </p>
                  </div>
                  {!mail.read && (
                    <div className="size-2 rounded-full bg-primary mt-2 shrink-0 shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                  )}
                </button>
              ))
            )}
          </div>
        </SimpleBar>
      </div>

      <div className="p-4 border-t border-sidebar-border/50 bg-sidebar-surface/10 mt-auto">
        <ActionButton 
           onClick={onCompose}
           className="w-full rounded-pill shadow-lg"
        >
          <Plus className="size-3" />
          Compose Email
        </ActionButton>
      </div>
    </motion.div>
  );
};

const MailReaderStage: React.FC<{ 
  mailId: string; 
  onBack: () => void;
}> = ({ mailId, onBack }) => {
  const { data: message, isLoading } = useMailMessage(mailId);
  const markAsRead = useMarkAsRead();
  const toggleStar = useToggleStar();
  const moveTo = useMoveTo();
  const sendReply = useSendReply();
  const saveDraftMutation = useSaveDraft();
  
  const [replyText, setReplyText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    if (message && !message.read) {
      markAsRead.mutate({ id: mailId, read: true });
    }
  }, [message, mailId]);

  const handleAddAttachment = (att: Attachment) => {
    setAttachments(prev => [...prev, att]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSendReply = () => {
    if (message) {
      sendReply.mutate({ id: mailId, body: replyText }, {
        onSuccess: () => {
          setReplyText('');
          setAttachments([]);
          onBack();
        }
      });
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
          setReplyText('');
          setAttachments([]);
          onBack();
        }
      });
    }
  };

  const handleDiscard = () => {
    setReplyText('');
    setAttachments([]);
    onBack();
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
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  useClipboardPaste({
    enableFiles: true,
    onFilesPaste: onDrop
  });

  if (isLoading || !message) {
     return <div className="p-8 text-center text-xs text-muted-foreground">Loading message...</div>;
  }

  return (
    <div {...getRootProps()} className="flex flex-col h-full bg-sidebar-background relative overflow-hidden">
      <input {...getInputProps()} />
      <FileUploadDropOverlay isDragActive={isDragActive} compact />
      
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="flex flex-col h-full"
      >
        <div>
          <EmailReaderToolbar 
            onBack={onBack}
            onStar={() => toggleStar.mutate({ id: mailId, starred: !message.starred })}
            onArchive={() => { moveTo.mutate({ id: mailId, tray: 'archive' }); onBack(); }}
            onTrash={() => { moveTo.mutate({ id: mailId, tray: 'trash' }); onBack(); }}
            onMarkRead={() => {
              const newRead = !message.read;
              markAsRead.mutate({ id: mailId, read: newRead });
              if (!newRead) onBack();
            }}
            isStarred={message.starred}
            isRead={message.read}
            className="border-b border-sidebar-border/50 bg-sidebar-surface/30 px-3"
          />
        </div>

        <div className="flex-1 min-h-0">
          <SimpleBar className="h-full">
            <div className="p-4 space-y-6">
              <div className="space-y-4">
                <h2 className="text-sm font-black leading-tight tracking-tight">{message.subject}</h2>
                
                <div className="flex items-center gap-3 py-2 border-y border-sidebar-border/30">
                    <Avatar className="size-10 rounded-2xl border border-sidebar-border">
                      <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                        {message.from.name[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                          <p className="text-xs font-bold truncate">{message.from.name}</p>
                          <p className="text-[9px] text-muted-foreground">{formatDistanceToNow(new Date(message.dateISO), { addSuffix: true })}</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">{message.from.email}</p>
                    </div>
                </div>

                <div className="text-xs leading-relaxed text-sidebar-foreground/90 markdown-content">
                  <ReactMarkdown>{message.body}</ReactMarkdown>
                </div>

                {message.attachments && message.attachments.length > 0 && (
                  <div className="pt-4 border-t border-sidebar-border/30">
                    <div className="flex flex-wrap gap-2">
                      {message.attachments.map((att: Attachment) => (
                        <div key={att.id} className="px-3 py-2 rounded-xl bg-sidebar-surface border border-sidebar-border flex items-center gap-2">
                           <Paperclip className="size-3 text-muted-foreground" />
                           <span className="text-[10px] font-bold truncate max-w-[120px]">{att.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </SimpleBar>
        </div>

        <div className="border-t border-sidebar-border/50 bg-sidebar-surface/10">
           <EmailComposer 
             isReply
             compact
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
             isLoading={sendReply.isPending || saveDraftMutation.isPending}
           />
        </div>
      </motion.div>
    </div>
  );
};

const MailComposeStage: React.FC<{ 
  initial: { to?: string; subject?: string }; 
  onBack: () => void;
}> = ({ initial, onBack }) => {
  const [to, setTo] = useState(initial.to || '');
  const [subject, setSubject] = useState(initial.subject || '');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const saveDraft = useSaveDraft();

  const handleAddAttachment = (att: Attachment) => {
    setAttachments(prev => [...prev, att]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSend = () => {
    saveDraft.mutate({ 
      to: [{ name: to, email: to }], 
      subject, 
      body,
      attachments
    }, {
      onSuccess: () => onBack()
    });
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
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  useClipboardPaste({
    enableFiles: true,
    onFilesPaste: onDrop
  });

  return (
    <div {...getRootProps()} className="flex flex-col h-full bg-sidebar-background relative overflow-hidden">
      <input {...getInputProps()} />
      <FileUploadDropOverlay isDragActive={isDragActive} compact />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="flex flex-col h-full"
      >

      <div className="flex items-center gap-2 p-3 border-b border-sidebar-border/50 bg-sidebar-surface/30">
        <TooltipWrapper label="Back">
          <button onClick={onBack} className="p-1.5 hover:bg-sidebar-hover rounded-lg transition-colors">
            <ArrowLeft className="size-4" />
          </button>
        </TooltipWrapper>
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mr-auto">New Message</span>
      </div>

      <SimpleBar className="flex-1 h-full">
        <EmailComposer
          compact
          to={to}
          onToChange={setTo}
          subject={subject}
          onSubjectChange={setSubject}
          body={body}
          onBodyChange={setBody}
          attachments={attachments}
          onAddAttachment={handleAddAttachment}
          onRemoveAttachment={handleRemoveAttachment}
          onSend={handleSend}
          isLoading={saveDraft.isPending}
        />
      </SimpleBar>
    </motion.div>
  </div>
  );
};
