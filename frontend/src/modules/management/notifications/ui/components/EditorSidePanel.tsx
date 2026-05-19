import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Variable,
  Settings2,
  History,
  Copy,
  CheckCircle2,
  Clock,
  User,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import { Switch } from '@/shared/ui/shadcn/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/shadcn/components/ui/tooltip';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/shadcn/components/ui/tabs';
import { cn } from '@/shadcn/lib/utils';
import type { TemplateStatus, TemplateVariable, TemplateVersion } from '../../domain/models';

export interface EditorSidePanelProps {
  title: string;
  variables: TemplateVariable[];
  versions: TemplateVersion[];
  formData: {
    status: TemplateStatus;
    locale: string;
    useCustom: boolean;
  };
  onFormDataChange: (data: Partial<{ status: TemplateStatus; locale: string; useCustom: boolean }>) => void;
  onInsertVariable: (name: string) => void;
  onRestoreVersion: (versionId: string) => void;
  isRestoring?: boolean;
  lastModified: string;
  modifiedBy: string;
  /** Called after inserting a variable (useful for closing mobile sheet) */
  onVariableInserted?: () => void;
  className?: string;
}

const EditorSidePanel: React.FC<EditorSidePanelProps> = ({
  title,
  variables,
  versions,
  formData,
  onFormDataChange,
  onInsertVariable,
  onRestoreVersion,
  isRestoring = false,
  lastModified,
  modifiedBy,
  onVariableInserted,
  className,
}) => {
  const { t } = useTranslation('notifications');
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  const copyVariable = (name: string) => {
    navigator.clipboard.writeText(`{{${name}}}`);
    setCopiedVar(name);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  const handleInsertVariable = (name: string) => {
    onInsertVariable(name);
    onVariableInserted?.();
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="pb-4">
        <h3 className="font-semibold">{title}</h3>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="variables" className="flex flex-col flex-1">
        <TabsList>
          <TabsTrigger value="variables" className="text-xs">
            <Variable className="h-3.5 w-3.5 mr-1.5" />
            {t('editor.variables.title')}
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs">
            <Settings2 className="h-3.5 w-3.5 mr-1.5" />
            {t('editor.settingsTab')}
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs">
            <History className="h-3.5 w-3.5 mr-1.5" />
            {t('editor.history')}
          </TabsTrigger>
        </TabsList>

        {/* Variables Tab */}
        <TabsContent value="variables" className="flex-1 overflow-auto m-0">
          <div className="py-3 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-3">
              {t('editor.variables.clickToInsert')}
            </p>
            {variables.map((v) => (
              <div
                key={v.name}
                className="group flex items-start gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleInsertVariable(v.name)}
              >
                <div className="flex-1 min-w-0">
                  <code className="text-xs font-mono text-primary block truncate">{`{{${v.name}}}`}</code>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{v.description}</p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyVariable(v.name);
                      }}
                    >
                      {copiedVar === v.name ? (
                        <CheckCircle2 className="h-3 w-3 text-success" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('editor.variables.copy')}</TooltipContent>
                </Tooltip>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="flex-1 overflow-auto m-0">
          <div className="py-4 space-y-5">
            <div className="space-y-2">
              <Label className="text-xs">{t('editor.status')}</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => onFormDataChange({ status: v as TemplateStatus })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-success" />
                      {t('editor.statuses.active')}
                    </span>
                  </SelectItem>
                  <SelectItem value="Draft">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-warning" />
                      {t('editor.statuses.draft')}
                    </span>
                  </SelectItem>
                  <SelectItem value="Default">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                      {t('editor.statuses.default')}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">{t('editor.locale')}</Label>
              <Select
                value={formData.locale}
                onValueChange={(v) => onFormDataChange({ locale: v })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t('editor.locales.en')}</SelectItem>
                  <SelectItem value="es">{t('editor.locales.es')}</SelectItem>
                  <SelectItem value="fr">{t('editor.locales.fr')}</SelectItem>
                  <SelectItem value="de">{t('editor.locales.de')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="space-y-0.5">
                <Label className="text-xs cursor-pointer" htmlFor="useCustomPanel">
                  {t('editor.useCustom')}
                </Label>
                <p className="text-[10px] text-muted-foreground">{t('editor.useCustomDesc')}</p>
              </div>
              <Switch
                id="useCustomPanel"
                checked={formData.useCustom}
                onCheckedChange={(v) => onFormDataChange({ useCustom: v })}
              />
            </div>

            <div className="pt-3 border-t">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{t('editor.lastUpdated', { time: formatDistanceToNow(new Date(lastModified), { addSuffix: true }) })}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <User className="h-3 w-3 inline mr-1" />
                <span className="font-medium text-foreground">{modifiedBy}</span>
              </p>
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="flex-1 overflow-auto m-0">
          <div className="py-3">
            {versions.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">{t('editor.historyDialog.noVersions')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">
                          {format(new Date(version.savedAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          <User className="h-3 w-3 inline mr-1" />
                          {version.savedBy}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs shrink-0"
                        onClick={() => onRestoreVersion(version.id)}
                        disabled={isRestoring}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        {t('editor.historyDialog.restore')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditorSidePanel;
