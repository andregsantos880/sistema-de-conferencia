import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Phone, Mail, ArrowLeft, Image as ImageIcon, Link as LinkIcon, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SimpleBar from 'simplebar-react';
import { useContact } from '../../application/hooks/useChat';
import { Switch } from '@/shared/ui/shadcn/components/ui/switch';
import { Label } from '@/shared/ui/shadcn/components/ui/label';

interface ContactInfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
  convId?: string; // For desktop layout where component is outside Routes
}

export function ContactInfoPanel({ isOpen, onClose, isMobile, convId: convIdProp }: ContactInfoPanelProps) {
  const { t } = useTranslation('chat');
  const navigate = useNavigate();
  const { convId: convIdFromRoute } = useParams();
  
  // Use prop if provided (desktop), otherwise use route param (mobile)
  const convId = convIdProp || convIdFromRoute;

  // Only fetch contact when panel is open (or always on mobile)
  const shouldFetch = isMobile || isOpen;
  const { data: contact, isLoading } = useContact(shouldFetch ? (convId || '') : '');

  const handleBack = () => {
    if (isMobile) {
      navigate(`/apps/chat/${convId}`);
    } else {
      onClose();
    }
  };

  if (!isOpen && !isMobile) return null;

  const content = (
    <div className="flex flex-col h-full bg-muted/30">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-6 border-b">
        {isMobile ? (
          <button
            type="button"
            onClick={handleBack}
            className="p-2 -ml-2 hover:bg-accent rounded-lg transition-colors"
            aria-label={t('back', 'Back')}
          >
            <ArrowLeft className="size-5" />
          </button>
        ) : (
          <h3 className="font-medium">{t('contactInfo', 'Contact Info')}</h3>
        )}
        
        {!isMobile && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Content with SimpleBar - min-h-0 is critical for flex overflow */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <SimpleBar className="h-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        ) : !contact ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-muted-foreground">Contact not found</div>
          </div>
        ) : (
          <div className="space-y-6 p-6">
            {/* Profile */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative">
                <div className="size-24 rounded-full bg-muted overflow-hidden">
                  {contact.avatar ? (
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center text-3xl font-semibold">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                {contact.online && (
                  <div className="absolute bottom-1 right-1 size-5 bg-green-500 rounded-full border-4 border-background" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{contact.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {contact.online ? t('online', 'Online') : t('offline', 'Offline')}
                </p>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-3">
              {contact.phone && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Phone className="size-5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-0.5">Phone</div>
                    <div className="text-sm truncate">{contact.phone}</div>
                  </div>
                </div>
              )}

              {contact.email && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Mail className="size-5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-0.5">Email</div>
                    <div className="text-sm truncate">{contact.email}</div>
                  </div>
                </div>
              )}
            </div>

            {/* About */}
            {contact.about && (
              <div>
                <h3 className="text-sm font-medium mb-2">{t('about', 'About')}</h3>
                <p className="text-sm text-muted-foreground">{contact.about}</p>
              </div>
            )}

            {/* Media, Links & Docs */}
            {contact.media && contact.media.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium">
                    {t('mediaLinksDocs', 'Media, links and docs')}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {contact.media.length}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {contact.media.slice(0, 6).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="aspect-square rounded-lg overflow-hidden bg-muted hover:opacity-80 transition-opacity"
                    >
                      {item.type === 'image' && item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title || ''}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center">
                          {item.type === 'link' && <LinkIcon className="size-6 text-muted-foreground" />}
                          {item.type === 'doc' && <FileText className="size-6 text-muted-foreground" />}
                          {item.type === 'video' && <ImageIcon className="size-6 text-muted-foreground" />}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {contact.media.length > 6 && (
                  <button
                    type="button"
                    className="w-full mt-2 py-2 text-sm text-primary hover:underline"
                  >
                    {t('viewAll', 'View all')} ({contact.media.length})
                  </button>
                )}
              </div>
            )}

            {/* Starred Messages */}
            <div>
              <h3 className="text-sm font-medium mb-2">
                {t('starredMessages', 'Starred messages')}
              </h3>
              <div className="text-sm text-muted-foreground">
                {t('noStarredMessages', 'No starred messages')}
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label htmlFor="mute-notifications" className="cursor-pointer text-sm">
                  {t('muteNotifications', 'Notification')}
                </Label>
                <Switch id="mute-notifications" />
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button type="button" className="text-sm hover:underline">
                  {t('blockUser', 'Block user')}
                </button>
                <button type="button" className="text-sm text-destructive hover:underline block">
                  {t('deleteConversation', 'Delete conversation')}
                </button>
              </div>
            </div>
          </div>
        )}
        </SimpleBar>
      </div>
    </div>
  );

  // Mobile: full screen
  if (isMobile) {
    return content;
  }

  // Desktop: inline panel (no overlay, just slides in within the card)
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="border-l overflow-hidden flex-shrink-0"
        >
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
