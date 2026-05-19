import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { Mail, Key, Shield, UserX, CheckCircle2, Clock } from 'lucide-react';

import { Timeline } from '@/shared/ui/components/Timeline';
import type { TimelineItemData } from '@/shared/ui/components/Timeline';
import type { ActivityLogEntry } from '../../../domain/models';

interface ActivityTabProps {
  activityLog: ActivityLogEntry[];
}

function getActivityIcon(action: string) {
  switch (action) {
    case 'user.login':
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    case 'user.created':
      return <CheckCircle2 className="h-4 w-4 text-info" />;
    case 'user.invitation_sent':
    case 'user.invitation_resent':
      return <Mail className="h-4 w-4 text-info" />;
    case 'user.password_reset_sent':
      return <Key className="h-4 w-4 text-warning" />;
    case 'user.verification_email_sent':
      return <Mail className="h-4 w-4 text-primary" />;
    case 'user.activated':
    case 'user.restored':
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    case 'user.suspended':
      return <Shield className="h-4 w-4 text-warning" />;
    case 'user.deactivated':
      return <UserX className="h-4 w-4 text-muted-foreground" />;
    case 'user.role_changed':
      return <Shield className="h-4 w-4 text-primary" />;
    case 'user.mfa_enabled':
      return <Shield className="h-4 w-4 text-success" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

export function ActivityTab({ activityLog }: ActivityTabProps) {
  const { t } = useTranslation('users');

  const timelineItems: TimelineItemData[] = useMemo(
    () =>
      activityLog.map((entry) => ({
        id: entry.id,
        icon: getActivityIcon(entry.action),
        title: entry.description,
        subtitle: (
          <span className="text-xs text-muted-foreground">
            {t('detail.activity.by')} {entry.performedBy} •{' '}
            {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
          </span>
        ),
      })),
    [activityLog, t]
  );

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-foreground">{t('detail.activity.title')}</h3>
      <Timeline items={timelineItems} gap="md" />
    </div>
  );
}
