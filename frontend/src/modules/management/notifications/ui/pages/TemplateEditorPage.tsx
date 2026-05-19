import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Save,
  Send,
  Code,
  FileText,
  Loader2,
  Eye,
  EyeOff,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/shadcn/components/ui/tooltip';
import { Skeleton } from '@/shared/ui/components/Skeleton';
import { Alert } from '@/shared/ui/components/Alert';
import PageHeader from '@/shared/ui/components/PageHeader';
import {
  useEmailTemplate,
  useUpdateTemplate,
  useSendTestEmail,
  useRestoreTemplateVersion,
} from '../../application/hooks';
import { FeatureAreaBadge } from '../components/FeatureAreaBadge';
import { StatusBadge } from '../components/StatusBadge';
import type { TemplateStatus } from '../../domain/models';
import { sampleVariableValues } from '../../infrastructure/mocks/notificationsData';
import { Card, CardContent } from '@/shared/ui/shadcn/components/ui/card';
import PreviewPanel from '../components/PreviewPanel';
import EditorSidePanel from '../components/EditorSidePanel';
import { Drawer, DrawerContent } from '@/shared/ui/shadcn/components/ui/drawer';
import { FieldLabel } from '@/shared/ui/shadcn/components/ui/field';
import { NOTIFICATIONS_PATHS } from '../routes';


const TemplateEditorPage: React.FC = () => {
  const { t } = useTranslation('notifications');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: template, isLoading } = useEmailTemplate(id ?? '');
  const updateTemplate = useUpdateTemplate();
  const sendTestEmail = useSendTestEmail();
  const restoreVersion = useRestoreTemplateVersion();

  const [formData, setFormData] = useState({
    subject: '',
    htmlBody: '',
    plainTextBody: '',
    locale: 'en',
    useCustom: false,
    status: 'Active' as TemplateStatus,
  });

  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(true);
  const [showSidePanel, setShowSidePanel] = useState(true);
  const [showPlainText, setShowPlainText] = useState(false);
  const [testEmailDialog, setTestEmailDialog] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [lastTemplateId, setLastTemplateId] = useState<string | null>(null);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  const subjectRef = useRef<HTMLInputElement>(null);
  const htmlRef = useRef<HTMLTextAreaElement>(null);

  // Initialize form when template loads or changes
  if (template && template.id !== lastTemplateId) {
    setFormData({
      subject: template.subject,
      htmlBody: template.htmlBody,
      plainTextBody: template.plainTextBody,
      locale: template.locale,
      useCustom: template.isCustom,
      status: template.status,
    });
    setLastTemplateId(template.id);
  }

  // Replace variables with sample values for preview
  const renderPreview = (content: string) => {
    let rendered = content;
    Object.entries(sampleVariableValues).forEach(([key, value]) => {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return rendered;
  };

  // Check for missing variables
  const getMissingVariables = () => {
    if (!template) return [];
    const usedVars = formData.htmlBody.match(/{{(\w+)}}/g)?.map((v) => v.replace(/[{}]/g, '')) || [];
    const definedVars = template.variables.map((v) => v.name);
    return usedVars.filter((v) => !definedVars.includes(v));
  };

  const insertVariable = (varName: string) => {
    const text = `{{${varName}}}`;
    if (htmlRef.current) {
      const textarea = htmlRef.current;
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const newValue = formData.htmlBody.slice(0, start) + text + formData.htmlBody.slice(end);
      setFormData({ ...formData, htmlBody: newValue });
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    }
  };

  const handleSave = async () => {
    if (!id) return;
    await updateTemplate.mutateAsync({
      id,
      data: {
        subject: formData.subject,
        htmlBody: formData.htmlBody,
        plainTextBody: formData.plainTextBody,
        locale: formData.locale,
        status: formData.status,
        isCustom: formData.useCustom,
      },
    });
  };

  const handleSendTest = async () => {
    if (!id) return;
    await sendTestEmail.mutateAsync({
      templateId: id,
      recipientEmail: testEmail,
    });
    setTestEmailDialog(false);
    setTestEmail('');
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!id) return;
    await restoreVersion.mutateAsync({
      templateId: id,
      versionId,
    });
    setLastTemplateId(null); // Re-initialize form with restored data
  };

  const missingVars = getMissingVariables();

  if (isLoading || !template) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32 mt-1" />
          </div>
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
        <div className="flex gap-6">
          <div className="flex-1 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-[600px] w-full" />
          </div>
          <Skeleton className="w-[400px] h-[600px]" />
        </div>
      </div>
    );
  }

  // Header actions with view toggles
  const headerActions = (
    <div className="flex items-center gap-2">
      {/* Mobile View Toggles - shown only on smaller screens */}
      <div className="flex lg:hidden items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobilePreviewOpen(true)}
              className="h-8 px-2"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('editor.preview.title')}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobilePanelOpen(true)}
              className="h-8 px-2"
            >
              <PanelRightOpen className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('editor.panel')}</TooltipContent>
        </Tooltip>
      </div>

      {/* Desktop View Toggles - hidden on smaller screens */}
      <div className="hidden lg:flex items-center gap-1 bg-muted rounded-lg p-1 mr-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={showPreview ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="h-7 px-2"
            >
              {showPreview ? <Eye className="h-3.5 w-3.5 mr-1" /> : <EyeOff className="h-3.5 w-3.5 mr-1" />}
              <span className="text-xs">{t('editor.preview.title')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('editor.togglePreview')}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={showSidePanel ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setShowSidePanel(!showSidePanel)}
              className="h-7 px-2"
            >
              {showSidePanel ? <PanelRightClose className="h-3.5 w-3.5 mr-1" /> : <PanelRightOpen className="h-3.5 w-3.5 mr-1" />}
              <span className="text-xs">{t('editor.panel')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('editor.togglePanel')}</TooltipContent>
        </Tooltip>
      </div>

      {/* Action Buttons */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="secondary" size="sm" onClick={() => setTestEmailDialog(true)}>
            <Send className="h-3.5 w-3.5 sm:mr-2" />
            <span className="hidden sm:inline">{t('editor.sendTest')}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('editor.testDialog.title')}</TooltipContent>
      </Tooltip>

      <Button size="sm" onClick={handleSave} disabled={updateTemplate.isPending}>
        {updateTemplate.isPending ? (
          <Loader2 className="h-3.5 w-3.5 sm:mr-2 animate-spin" />
        ) : (
          <Save className="h-3.5 w-3.5 sm:mr-2" />
        )}
        <span className="hidden sm:inline">{t('editor.save')}</span>
      </Button>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <PageHeader
          title={
            <div className="flex flex-col lg:flex-row justify-start items-start lg:items-center gap-2">
              <h1 className="text-2xl font-semibold text-foreground truncate">{template.name}</h1>
              <div className="flex items-center gap-2">
                <FeatureAreaBadge area={template.featureArea} />
                <StatusBadge status={formData.status} />
              </div>
            </div>
          }
          backButton={{
            label: t('common:back'),
            onClick: () => navigate(NOTIFICATIONS_PATHS.TEMPLATES),
          }}
          subtitle={<span className="font-mono">{template.eventId}</span>}
          actions={headerActions}
        />

        {/* Missing Variables Warning */}
        {missingVars.length > 0 && (
          <Alert variant="warning">
            {t('editor.warnings.undefinedVariables')}: {missingVars.map((v) => `{{${v}}}`).join(', ')}
          </Alert>
        )}

        {/* Main Content Area */}
        <Card>
          <CardContent className="space-y-4 flex flex-col xl:flex-row gap-6">
            {/* Editor Column */}
            <div className="flex-1 flex flex-col min-w-0 space-y-4 mb-0">
              {/* Subject Line */}
              <div className="space-y-2">
                <FieldLabel>
                  {t('editor.subject.title')}
                </FieldLabel>
                <Input
                  ref={subjectRef}
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder={t('editor.subject.placeholder')}
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground">
                  {t('editor.subject.preview')}: <span className="text-foreground">{renderPreview(formData.subject)}</span>
                </p>
              </div>

              {/* Body Editor */}
              <div className="flex-1 flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <FieldLabel>
                    {showPlainText ? t('editor.plainText.title') : t('editor.htmlBody.title')}
                  </FieldLabel>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPlainText(!showPlainText)}
                    className="h-7 text-xs"
                  >
                    {showPlainText ? (
                      <Code className="h-3.5 w-3.5 mr-1" />
                    ) : (
                      <FileText className="h-3.5 w-3.5 mr-1" />
                    )}
                    {showPlainText ? t('editor.switchToHtml') : t('editor.editPlainText')}
                  </Button>
                </div>

                {showPlainText ? (
                  <textarea
                    value={formData.plainTextBody}
                    onChange={(e) => setFormData({ ...formData, plainTextBody: e.target.value })}
                    className="flex-1 min-h-[500px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-none"
                    placeholder={t('editor.plainText.placeholder')}
                  />
                ) : (
                  <textarea
                    ref={htmlRef}
                    value={formData.htmlBody}
                    onChange={(e) => setFormData({ ...formData, htmlBody: e.target.value })}
                    className="flex-1 min-h-[500px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-none"
                    placeholder="<html>...</html>"
                  />
                )}
              </div>
            </div>

            {/* Desktop Panels */}
            <div className="hidden lg:flex gap-6">
              {/* Live Preview Column - Desktop only */}
              {showPreview && (
                <Card className="flex flex-col w-[400px] rounded-lg overflow-hidden mb-0">
                  <CardContent>
                    <PreviewPanel
                      title={t('editor.preview.title')}
                      previewMode={previewMode}
                      onPreviewModeChange={setPreviewMode}
                      htmlContent={formData.htmlBody}
                      plainTextContent={formData.plainTextBody}
                      showPlainText={showPlainText}
                      height="600px"
                    />
                  </CardContent>
                </Card>
              )}

              {/* Side Panel Column - Desktop only */}
              {showSidePanel && (
                <Card className="flex flex-col w-[320px] rounded-lg overflow-hidden">
                  <CardContent>
                    <EditorSidePanel
                      title={t('editor.panel')}
                      variables={template.variables}
                      versions={template.versions}
                      formData={{
                        status: formData.status,
                        locale: formData.locale,
                        useCustom: formData.useCustom,
                      }}
                      onFormDataChange={(data) => setFormData({ ...formData, ...data })}
                      onInsertVariable={insertVariable}
                      onRestoreVersion={handleRestoreVersion}
                      isRestoring={restoreVersion.isPending}
                      lastModified={template.lastModified}
                      modifiedBy={template.modifiedBy}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Email Dialog */}
        <Dialog open={testEmailDialog} onOpenChange={setTestEmailDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('editor.testDialog.title')}</DialogTitle>
              <DialogDescription>{t('editor.testDialog.description')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="testEmail">{t('editor.testDialog.recipient')}</Label>
                <Input
                  id="testEmail"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder={t('editor.testDialog.placeholder')}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTestEmailDialog(false)}>
                {t('common:cancel')}
              </Button>
              <Button onClick={handleSendTest} disabled={!testEmail || sendTestEmail.isPending}>
                {sendTestEmail.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {t('editor.testDialog.send')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Mobile Preview Drawer */}
        <Drawer open={mobilePreviewOpen} onOpenChange={setMobilePreviewOpen} direction="right">
          <DrawerContent className="w-full p-6">
            <PreviewPanel
              title={t('editor.preview.title')}
              previewMode={previewMode}
              onPreviewModeChange={setPreviewMode}
              htmlContent={formData.htmlBody}
              plainTextContent={formData.plainTextBody}
              showPlainText={showPlainText}
              height="calc(100vh - 140px)"
            />
          </DrawerContent>
        </Drawer>

        {/* Mobile Panel Drawer */}
        <Drawer open={mobilePanelOpen} onOpenChange={setMobilePanelOpen} direction="right">
          <DrawerContent className="w-full sm:max-w-md p-6">
            <EditorSidePanel
              title={t('editor.panel')}
              variables={template.variables}
              versions={template.versions}
              formData={{
                status: formData.status,
                locale: formData.locale,
                useCustom: formData.useCustom,
              }}
              onFormDataChange={(data) => setFormData({ ...formData, ...data })}
              onInsertVariable={insertVariable}
              onRestoreVersion={handleRestoreVersion}
              isRestoring={restoreVersion.isPending}
              lastModified={template.lastModified}
              modifiedBy={template.modifiedBy}
              onVariableInserted={() => setMobilePanelOpen(false)}
            />
          </DrawerContent>
        </Drawer>
      </div>
    </TooltipProvider>
  );
};

export default TemplateEditorPage;
