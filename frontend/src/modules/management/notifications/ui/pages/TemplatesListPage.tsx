import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, MoreHorizontal, Pencil, RotateCcw, Ban, FileText, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { type ColumnDef } from '@tanstack/react-table';
import PageHeader from '@/shared/ui/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
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
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/components/ui/dropdown-menu';
import { Skeleton } from '@/shared/ui/components/Skeleton';
import { SimpleSortableTable } from '@/shared/ui/components/table/SimpleSortableTable';
import { useEmailTemplates, useRestoreTemplateDefault } from '../../application/hooks';
import { FeatureAreaBadge } from '../components/FeatureAreaBadge';
import { StatusBadge } from '../components/StatusBadge';
import { NOTIFICATIONS_PATHS } from '../routes/paths';
import type { EmailTemplate } from '../../domain/models';
import { EmptyState } from '@/shared/ui/components/states';

const TemplatesListPage: React.FC = () => {
  const { t } = useTranslation('notifications');
  const navigate = useNavigate();

  const { data: templates = [], isLoading } = useEmailTemplates();
  const restoreDefault = useRestoreTemplateDefault();

  const [search, setSearch] = useState('');
  const [featureFilter, setFeatureFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.eventId.toLowerCase().includes(search.toLowerCase());
      const matchesFeature = featureFilter === 'all' || t.featureArea === featureFilter;
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchesSearch && matchesFeature && matchesStatus;
    });
  }, [templates, search, featureFilter, statusFilter]);

  const handleEditTemplate = useCallback((template: EmailTemplate) => {
    navigate(NOTIFICATIONS_PATHS.TEMPLATE(template.id));
  }, [navigate]);

  const handleRestoreDefault = useCallback(async (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await restoreDefault.mutateAsync(templateId);
  }, [restoreDefault]);

  // Define table columns
  const columns: ColumnDef<EmailTemplate>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: t('templates.columns.name'),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: 'eventId',
        header: t('templates.columns.eventId'),
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.eventId}
          </span>
        ),
      },
      {
        accessorKey: 'featureArea',
        header: t('templates.columns.featureArea'),
        cell: ({ row }) => <FeatureAreaBadge area={row.original.featureArea} />,
      },
      {
        accessorKey: 'status',
        header: t('templates.columns.status'),
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'lastModified',
        header: t('templates.columns.lastModified'),
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {formatDistanceToNow(new Date(row.original.lastModified), { addSuffix: true })}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditTemplate(row.original);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                {t('templates.actions.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => handleRestoreDefault(row.original.id, e)}
                disabled={!row.original.isCustom}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {t('templates.actions.restoreDefault')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => e.stopPropagation()}
                className="text-destructive focus:text-destructive"
              >
                <Ban className="mr-2 h-4 w-4" />
                {t('templates.actions.disable')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, handleEditTemplate, handleRestoreDefault]
  );

  if (isLoading) {
    return (
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64 mt-1" />
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader
        title={t('templates.title')}
        subtitle={t('templates.subtitle')}
        backButton={{
          label: t('common:back'),
          onClick: () => navigate(NOTIFICATIONS_PATHS.HOME),
        }}
      />

      {/* Filters */}
      <div className='flex flex-col gap-3 page-header'>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('templates.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={featureFilter} onValueChange={setFeatureFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={t('templates.filters.featureArea')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('templates.filters.allAreas')}</SelectItem>
              <SelectItem value="Users">{t('templates.filters.users')}</SelectItem>
              <SelectItem value="Auth">{t('templates.filters.auth')}</SelectItem>
              <SelectItem value="Billing">{t('templates.filters.billing')}</SelectItem>
              <SelectItem value="Teams">{t('templates.filters.teams')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={t('templates.filters.status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('templates.filters.allStatus')}</SelectItem>
              <SelectItem value="Active">{t('templates.filters.active')}</SelectItem>
              <SelectItem value="Draft">{t('templates.filters.draft')}</SelectItem>
              <SelectItem value="Default">{t('templates.filters.default')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('templates.tableTitle', { count: filteredTemplates.length })}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {filteredTemplates.length === 0 ? (
            <EmptyState 
              icon={AlertCircle}
              title={search || featureFilter !== 'all' || statusFilter !== 'all'
                   ? t('templates.empty.noResults')
                   : t('templates.empty.noTemplates')}
              description={search || featureFilter !== 'all' || statusFilter !== 'all'
                   ? t('templates.empty.adjustFilters')
                   : t('templates.empty.willAppear')}
            />
          ) : (
            <SimpleSortableTable
              columns={columns}
              data={filteredTemplates}
              initialSort={[{ id: 'lastModified', desc: true }]}
              density="spacious"
              onRowClick={handleEditTemplate}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplatesListPage;
