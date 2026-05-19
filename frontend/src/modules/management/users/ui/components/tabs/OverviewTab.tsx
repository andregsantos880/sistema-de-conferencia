import { useTranslation } from 'react-i18next';
import { formatDistanceToNow, format } from 'date-fns';

import type { User } from '../../../domain/models';

interface OverviewTabProps {
  user: User;
}

export function OverviewTab({ user }: OverviewTabProps) {
  const { t } = useTranslation('users');

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-border bg-muted/30">
          <p className="text-sm text-muted-foreground">{t('detail.overview.loginCount')}</p>
          <p className="text-2xl font-semibold mt-1">{user.loginCount}</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-muted/30">
          <p className="text-sm text-muted-foreground">{t('detail.overview.lastLogin')}</p>
          <p className="text-lg font-medium mt-1">
            {user.lastLoginAt
              ? formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })
              : t('columns.never')}
          </p>
        </div>
      </div>

      {/* User Info */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">{t('detail.overview.userInfo')}</h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">{t('detail.overview.email')}</span>
            <span className="font-medium">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">{t('detail.overview.phone')}</span>
              <span className="font-medium">{user.phone}</span>
            </div>
          )}
          {user.jobTitle && (
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">{t('detail.overview.jobTitle')}</span>
              <span className="font-medium">{user.jobTitle}</span>
            </div>
          )}
          {user.department && (
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">{t('detail.overview.department')}</span>
              <span className="font-medium">{user.department}</span>
            </div>
          )}
          {user.team && (
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">{t('detail.overview.team')}</span>
              <span className="font-medium">{user.team}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">{t('detail.overview.created')}</span>
            <span className="font-medium">{format(new Date(user.createdAt), 'MMM d, yyyy')}</span>
          </div>
          {user.invitedBy && (
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">{t('detail.overview.invitedBy')}</span>
              <span className="font-medium">{user.invitedBy}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
