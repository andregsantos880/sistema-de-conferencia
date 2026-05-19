import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Users, ArrowRight } from 'lucide-react';

import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';

import type { TeamDetail, TeamMember } from '../../../domain/models';
import { TEAM_TYPE_LABELS, TEAM_ROLE_LABELS, type TeamRole } from '../../../domain/models';

interface OverviewTabProps {
  team: TeamDetail;
  members?: TeamMember[];
  onGoToMembers: () => void;
  onAddMembers: () => void;
}

// Role distribution colors
const ROLE_COLORS: Record<TeamRole, string> = {
  owner: 'bg-chart-1',
  admin: 'bg-chart-2',
  member: 'bg-primary',
  viewer: 'bg-muted-foreground',
};

interface RoleDistributionProps {
  members: TeamMember[];
}

function RoleDistribution({ members }: RoleDistributionProps) {
  const { t } = useTranslation('teams');

  // Calculate role counts
  const roleCounts = members.reduce(
    (acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    },
    {} as Record<TeamRole, number>
  );

  // Get roles that have members, sorted by count
  const roles = (Object.entries(roleCounts) as [TeamRole, number][])
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  const total = members.length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-primary">
          {t('detail.overview.roleDistribution')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {roles.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('detail.members.noMembers')}</p>
        ) : (
          roles.map(([role, count]) => {
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={role} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{TEAM_ROLE_LABELS[role]}</span>
                  <span className="font-medium">{count}</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${ROLE_COLORS[role]} rounded-full transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

export function OverviewTab({ team, members = [], onGoToMembers, onAddMembers }: OverviewTabProps) {
  const { t } = useTranslation('teams');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Left Column - Team Information */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <CardTitle className="text-base font-semibold text-primary">
              {t('detail.overview.teamInfo')}
            </CardTitle>
            {/* Buttons: icon-only on <lg, full text on lg+ */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onAddMembers}
                aria-label={t('addMembers')}
              >
                <Users className="h-4 w-4 lg:mr-2" />
                <span className="hidden lg:inline">{t('addMembers')}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onGoToMembers}
                aria-label={t('detail.overview.goToMembers')}
              >
                <span className="hidden lg:inline">{t('detail.overview.goToMembers')}</span>
                <ArrowRight className="h-4 w-4 lg:ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Description */}
            {team.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('detail.overview.description')}</p>
                <p className="text-foreground">{team.description}</p>
              </div>
            )}

            {/* Two-column grid for metadata - single column on very small screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 pt-2">
              {team.department && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('detail.overview.department')}</p>
                  <p className="font-medium">{team.department}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('detail.overview.visibility')}</p>
                <Badge variant="secondary" className="font-normal">
                  {TEAM_TYPE_LABELS[team.type]}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('detail.overview.status')}</p>
                <Badge
                  variant="outline"
                  className={
                    team.status === 'active'
                      ? 'bg-success/10 text-success border-success/20'
                      : 'bg-muted text-muted-foreground'
                  }
                >
                  {t(`status.${team.status}`)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('detail.overview.created')}</p>
                <p className="font-medium">{format(new Date(team.createdAt), 'MMMM d, yyyy')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Role Distribution */}
      <div className="space-y-6">
        <RoleDistribution members={members} />
      </div>
    </div>
  );
}
