import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Archive,
  ArchiveRestore,
  Trash2,
  Users,
  Calendar,
} from 'lucide-react';

import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { Checkbox } from '@/shared/ui/shadcn/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/shadcn/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader } from '@/shared/ui/shadcn/components/ui/card';
import { Separator } from '@/shared/ui/shadcn/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/shadcn/components/ui/tooltip';

import type { TeamListItem, TeamStatus, TeamType } from '../../domain/models';
import { TEAM_TYPE_LABELS } from '../../domain/models';
import { getTeamDetailPath } from '../routes';

interface TeamCardProps {
  team: TeamListItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (team: TeamListItem) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDelete: (team: TeamListItem) => void;
}

export function TeamCard({
  team,
  isSelected,
  onSelect,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
}: TeamCardProps) {
  const { t } = useTranslation('teams');
  const navigate = useNavigate();

  const getStatusColor = (status: TeamStatus) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'archived':
        return 'bg-muted text-muted-foreground border-muted';
      default:
        return '';
    }
  };

  const getTypeColor = (type: TeamType) => {
    switch (type) {
      case 'functional':
        return 'bg-chart-1/10 text-chart-1 border-chart-1/20';
      case 'project':
        return 'bg-chart-2/10 text-chart-2 border-chart-2/20';
      case 'cross-functional':
        return 'bg-chart-3/10 text-chart-3 border-chart-3/20';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const handleCardClick = () => {
    navigate(getTeamDetailPath(team.id));
  };

  return (
    <Card
      className="group relative overflow-hidden transition-all hover:shadow-md hover:border-primary/20 cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="flex justify-between">
        {/* Selection checkbox */}
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(team.id)}
          />
        </div>

        {/* Actions menu */}
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(getTeamDetailPath(team.id))}>
                <Eye className="h-4 w-4 mr-2" />
                {t('actions.view')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(team)}>
                <Edit className="h-4 w-4 mr-2" />
                {t('actions.edit')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {team.status === 'active' ? (
                <DropdownMenuItem onClick={() => onArchive(team.id)}>
                  <Archive className="h-4 w-4 mr-2" />
                  {t('actions.archive')}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onUnarchive(team.id)}>
                  <ArchiveRestore className="h-4 w-4 mr-2" />
                  {t('actions.unarchive')}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(team)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('actions.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardHeader>
        {/* Badges row */}
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className={getTypeColor(team.type)}>
            {TEAM_TYPE_LABELS[team.type]}
          </Badge>
          <Badge variant="outline" className={getStatusColor(team.status)}>
            {t(`status.${team.status}`)}
          </Badge>
        </div>

        {/* Members avatars */}
        <div className="flex items-center -space-x-2 mb-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-8 w-8">
                <AvatarImage src={team.ownerAvatarUrl} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {team.ownerName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{team.ownerName} ({t('role.owner')})</p>
            </TooltipContent>
          </Tooltip>
          {team.membersCount > 1 && (
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">
                +{team.membersCount - 1}
              </span>
            </div>
          )}
        </div>

        {/* Team name and description */}
        <div className="space-y-1">
          <h3 className="font-semibold text-lg leading-tight line-clamp-1">
            {team.name}
          </h3>
          {team.department && (
            <p className="text-sm text-muted-foreground">{team.department}</p>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {team.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {team.description}
          </p>
        )}
      </CardContent>

      <Separator />

      <CardFooter className="flex flex-wrap items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          <span>{team.membersCount} {t('members')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDistanceToNow(new Date(team.updatedAt), { addSuffix: true })}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
