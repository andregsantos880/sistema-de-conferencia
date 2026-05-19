import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { type ColumnDef } from '@tanstack/react-table';
import {
  Search,
  Plus,
  MoreHorizontal,
  UserMinus,
  RefreshCw,
  Users,
  Shield,
} from 'lucide-react';

import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shadcn/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/components/ui/dropdown-menu';
import { Card, CardContent } from '@/shared/ui/shadcn/components/ui/card';
import { SimpleSortableTable } from '@/shared/ui/components/table/SimpleSortableTable';
import { EmptyState } from '@/shared/ui/components/states/EmptyState';

import type { TeamMember, TeamRole } from '../../../domain/models';
import { TEAM_ROLE_LABELS } from '../../../domain/models';

interface MembersTabProps {
  members: TeamMember[];
  isLoading: boolean;
  onAddMembers: () => void;
  onChangeRole: (member: TeamMember, newRole: TeamRole) => void;
  onRemoveMember: (member: TeamMember) => void;
  onResendInvite: (member: TeamMember) => void;
}

export function MembersTab({
  members,
  onAddMembers,
  onChangeRole,
  onRemoveMember,
  onResendInvite,
}: MembersTabProps) {
  const { t } = useTranslation('teams');

  // Local state for filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Filter members based on search and role
  const filteredItems = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        !search ||
        member.userName.toLowerCase().includes(search.toLowerCase()) ||
        member.userEmail.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'all' || member.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [members, search, roleFilter]);

  const getRoleColor = (role: TeamRole) => {
    switch (role) {
      case 'owner':
        return 'bg-chart-1/10 text-chart-1 border-chart-1/20';
      case 'admin':
        return 'bg-chart-2/10 text-chart-2 border-chart-2/20';
      case 'member':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'viewer':
        return 'bg-muted text-muted-foreground border-muted';
      default:
        return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'invited':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'pending':
        return 'bg-muted text-muted-foreground border-muted';
      default:
        return '';
    }
  };

  // Column definitions for SimpleSortableTable
  const columns: ColumnDef<TeamMember>[] = useMemo(
    () => [
      {
        accessorKey: 'userName',
        header: t('detail.members.name'),
        cell: ({ row }) => {
          const member = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.userAvatarUrl} />
                <AvatarFallback className="text-xs">
                  {member.userName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{member.userName}</p>
                <p className="text-sm text-muted-foreground">{member.userEmail}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'role',
        header: t('detail.members.role'),
        cell: ({ row }) => (
          <Badge variant="outline" className={getRoleColor(row.original.role)}>
            {TEAM_ROLE_LABELS[row.original.role]}
          </Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: t('detail.members.status'),
        cell: ({ row }) => (
          <Badge variant="outline" className={getStatusColor(row.original.status)}>
            {t(`memberStatus.${row.original.status}`)}
          </Badge>
        ),
      },
      {
        accessorKey: 'joinedAt',
        header: t('detail.members.joinedAt'),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(row.original.joinedAt), { addSuffix: true })}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => {
          const member = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onChangeRole(member, 'admin')}
                  disabled={member.role === 'admin' || member.role === 'owner'}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {t('actions.changeRole')}
                </DropdownMenuItem>
                {(member.status === 'invited' || member.status === 'pending') && (
                  <DropdownMenuItem onClick={() => onResendInvite(member)}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t('actions.resendInvitation')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onRemoveMember(member)}
                  disabled={member.role === 'owner'}
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  {t('actions.removeFromTeam')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t, onChangeRole, onRemoveMember, onResendInvite]
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-foreground">{t('detail.members.title')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('detail.members.count', { count: members.length })}
          </p>
        </div>
        <Button onClick={onAddMembers} aria-label={t('addMembers')}>
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">{t('addMembers')}</span>
        </Button>
      </div>

      {/* Filters - stack on mobile */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('detail.members.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={t('detail.members.filterByRole')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('detail.members.allRoles')}</SelectItem>
            <SelectItem value="owner">{t('role.owner')}</SelectItem>
            <SelectItem value="admin">{t('role.admin')}</SelectItem>
            <SelectItem value="member">{t('role.member')}</SelectItem>
            <SelectItem value="viewer">{t('role.viewer')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={Users}
              title={members.length === 0 ? t('detail.members.noMembers') : t('detail.members.noResults')}
              description={
                members.length === 0
                  ? t('detail.members.noMembersDescription')
                  : t('detail.members.noResultsDescription')
              }
              action={
                members.length === 0
                  ? { label: t('addMembers'), onClick: onAddMembers }
                  : undefined
              }
            />
          </CardContent>
        </Card>
      ) : (
        <SimpleSortableTable
          columns={columns}
          data={filteredItems}
          initialSort={[{ id: 'userName', desc: false }]}
        />
      )}
    </div>
  );
}
