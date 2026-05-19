import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/shadcn/components/ui/dialog';
import { useSaveDraft, useSendEmail } from '../../application/hooks/useEmail';
import type { EmailAddress, Attachment } from '../../domain/models/Email';
import { EmailComposer } from './EmailComposer';
import { FileUploadDropOverlay } from '@/shared/ui/components/files';
import { useClipboardPaste } from '@/shared/hooks';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ComposeModal({ isOpen, onClose }: ComposeModalProps) {
  const { t } = useTranslation('email');
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  const saveDraftMutation = useSaveDraft();
  const sendEmailMutation = useSendEmail();

  const handleAddAttachment = (att: Attachment) => {
    setAttachments(prev => [...prev, att]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const resetState = () => {
    setTo('');
    setSubject('');
    setBody('');
    setAttachments([]);
  };

  const handleSend = () => {
    const toAddresses: EmailAddress[] = to.split(',').map((email) => ({
      name: email.trim(),
      email: email.trim(),
    }));

    sendEmailMutation.mutate({
      to: toAddresses,
      subject,
      body,
      attachments
    }, {
      onSuccess: () => {
        onClose();
        resetState();
      }
    });
  };

  const handleSaveDraft = () => {
    const toAddresses: EmailAddress[] = to.split(',').map((email) => ({
      name: email.trim(),
      email: email.trim(),
    }));

    saveDraftMutation.mutate({
      to: toAddresses,
      subject,
      body,
      attachments
    }, {
      onSuccess: () => {
        onClose();
        resetState();
      }
    });
  };

  const handleDiscard = () => {
    onClose();
    resetState();
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
    accept: {
      'image/*': [],
      'application/pdf': [],
      'application/msword': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
      'text/plain': [],
    }
  });

  useClipboardPaste({
    enableFiles: true,
    onFilesPaste: onDrop
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-3xl p-0 overflow-hidden"
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <FileUploadDropOverlay isDragActive={isDragActive} />

        <DialogHeader className="px-6 py-4 border-b bg-muted/30">
          <DialogTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            {t('compose.newMessage', 'New Message')}
          </DialogTitle>
        </DialogHeader>

        <EmailComposer
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
          onSaveDraft={handleSaveDraft}
          onDiscard={handleDiscard}
          onCancel={onClose}
          isLoading={saveDraftMutation.isPending || sendEmailMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
