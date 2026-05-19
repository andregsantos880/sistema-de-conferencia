import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shadcn/lib/utils';

interface PresenceStatusProps {
  online?: boolean;
  typing?: boolean;
  className?: string;
}

/**
 * PresenceStatus - Renders the user status (Online, Offline, or Typing).
 * Used in headers and lists.
 */
export const PresenceStatus: React.FC<PresenceStatusProps> = ({ online, typing, className }) => {
  const { t } = useTranslation('chat');

  if (typing) {
    return (
      <span className={cn("text-primary animate-pulse font-medium", className)}>
        {t('typing', 'Typing...')}
      </span>
    );
  }

  return (
    <span className={cn(online ? "text-emerald-500" : "text-muted-foreground", className)}>
      {online ? t('online', 'Online') : t('offline', 'Offline')}
    </span>
  );
};
