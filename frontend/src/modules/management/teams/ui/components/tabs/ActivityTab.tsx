import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import {
  Users,
  UserPlus,
  UserMinus,
  Shield,
  Archive,
  ArchiveRestore,
  Settings,
  Mail,
  Crown,
  Clock,
} from 'lucide-react';

import { Timeline } from '@/shared/ui/components/Timeline';
import type { TimelineItemData } from '@/shared/ui/components/Timeline';
import { Avatar, AvatarFallback, AvatarImage } from '@/shadcn/components/ui/avatar';

import type { TeamActivity } from '../../../domain/models';

interface ActivityTabProps {
  activity: TeamActivity[];
  isLoading: boolean;
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'team.created':
      return <Users className="h-4 w-4 text-success" />;
    case 'member.added':
      return <UserPlus className="h-4 w-4 text-primary" />;
    case 'member.removed':
      return <UserMinus className="h-4 w-4 text-destructive" />;
    case 'member.invited':
      return <Mail className="h-4 w-4 text-warning" />;
    case 'role.changed':
      return <Shield className="h-4 w-4 text-chart-2" />;
    case 'team.archived':
      return <Archive className="h-4 w-4 text-muted-foreground" />;
    case 'team.unarchived':
      return <ArchiveRestore className="h-4 w-4 text-success" />;
    case 'team.updated':
      return <Settings className="h-4 w-4 text-primary" />;
    case 'ownership.transferred':
      return <Crown className="h-4 w-4 text-chart-1" />;
    case 'invite.resent':
      return <Mail className="h-4 w-4 text-primary" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

export function ActivityTab({ activity }: ActivityTabProps) {
  const { t } = useTranslation('teams');

  const timelineItems: TimelineItemData[] = useMemo(() => {
    return activity.map((entry) => ({
      id: entry.id,
      icon: getActivityIcon(entry.type),
      title: entry.message,
      subtitle: (
        <span className="flex items-center gap-1">
          <span>{entry.actorName}</span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}</span>
        </span>
      ),
      trailing: (
        <Avatar className="h-6 w-6">
          <AvatarImage src={entry.actorAvatarUrl} />
          <AvatarFallback className="text-[10px]">
            {entry.actorName
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
      ),
    }));
  }, [activity]);

  if (activity.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Clock className="h-12 w-12 mb-4" />
        <p className="font-medium">{t('detail.activity.noActivity')}</p>
        <p className="text-sm">{t('detail.activity.noActivityDescription')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground">{t('detail.activity.title')}</h3>
      <Timeline items={timelineItems} gap="md" />
    </div>
  );
}
