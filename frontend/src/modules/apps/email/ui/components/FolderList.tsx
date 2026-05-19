import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Inbox,
  Star,
  FileText,
  Send,
  Trash2,
  Archive,
  ChevronDown,
  ChevronRight,
  Circle,
  Plus,
} from 'lucide-react';
import SimpleBar from 'simplebar-react';
import { useMailFolders, useMailLabels } from '../../application/hooks/useEmail';
import type { MailTray } from '../../domain/models/Email';
import ActionButton from '@/components/forms/buttons/ActionButton';
import { cn } from '@/shadcn/lib/utils';

interface FolderListProps {
  activeTray?: MailTray;
  onNewMessage?: () => void;
  onClose?: () => void; // For mobile drawer
}

const TRAY_ICONS: Record<MailTray, React.ComponentType<{ className?: string }>> = {
  inbox: Inbox,
  starred: Star,
  drafts: FileText,
  sent: Send,
  trash: Trash2,
  archive: Archive,
};

export function FolderList({ activeTray, onNewMessage, onClose }: FolderListProps) {
  const { t } = useTranslation('email');
  const navigate = useNavigate();
  const [labelsExpanded, setLabelsExpanded] = useState(true);

  const { data: folders = [], isLoading: foldersLoading } = useMailFolders();
  const { data: labels = [], isLoading: labelsLoading } = useMailLabels();

  const handleSelectTray = (tray: MailTray) => {
    navigate(`/apps/email/${tray}`);
    onClose?.();
  };

  const handleNewMessage = () => {
    onNewMessage?.();
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* New Message Button */}
      <div className="flex-shrink-0 p-4">
        <ActionButton
          onClick={handleNewMessage}
          className="w-full"
          size="default"
        >
          <Plus className="size-4 mr-2" />
          {t('newMessage', 'New Message')}
        </ActionButton>
      </div>

      {/* Folders with SimpleBar */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <SimpleBar className="h-full">
          <div className="px-2 pb-4">
            {foldersLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading...</div>
              </div>
            ) : (
              <nav className="space-y-1">
                {folders.map((folder) => {
                  const Icon = TRAY_ICONS[folder.id];
                  const isActive = activeTray === folder.id;

                  return (
                    <button
                      key={folder.id}
                      type="button"
                      onClick={() => handleSelectTray(folder.id)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-sm',
                        isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="size-4" />
                        <span>{t(`trays.${folder.id}`, folder.name)}</span>
                      </div>
                      {folder.unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                          {folder.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            )}

            {/* Labels Section */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setLabelsExpanded(!labelsExpanded)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                {labelsExpanded ? (
                  <ChevronDown className="size-3" />
                ) : (
                  <ChevronRight className="size-3" />
                )}
                <span>{t('labels', 'Labels')}</span>
              </button>

              {labelsExpanded && !labelsLoading && (
                <div className="space-y-1 mt-1">
                  {labels.map((label) => (
                    <button
                      key={label.id}
                      type="button"
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm hover:bg-muted text-muted-foreground hover:text-foreground"
                    >
                      <Circle 
                        className="size-3 fill-current" 
                        style={{ color: label.color }} 
                      />
                      <span>{label.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SimpleBar>
      </div>
    </div>
  );
}
