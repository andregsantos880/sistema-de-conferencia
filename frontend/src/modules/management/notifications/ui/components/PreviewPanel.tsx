import { useTranslation } from 'react-i18next';
import { Monitor, Smartphone } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/shadcn/components/ui/toggle-group';
import { cn } from '@/shadcn/lib/utils';

export interface PreviewPanelProps {
  title: string;
  previewMode: 'desktop' | 'mobile';
  onPreviewModeChange: (mode: 'desktop' | 'mobile') => void;
  htmlContent: string;
  plainTextContent: string;
  showPlainText: boolean;
  /** Height of the preview iframe. Defaults to 600px for desktop, calc(100vh-140px) for mobile */
  height?: string;
  className?: string;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  title,
  previewMode,
  onPreviewModeChange,
  htmlContent,
  plainTextContent,
  showPlainText,
  height = '600px',
  className,
}) => {
  const { t } = useTranslation('notifications');

  const renderPreview = (content: string) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `;
  };

  const previewContent = showPlainText
    ? `<pre style="font-family: monospace; white-space: pre-wrap; padding: 16px;">${plainTextContent}</pre>`
    : htmlContent;

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <h3 className="font-semibold">{title}</h3>
        <ToggleGroup
          type="single"
          variant="outline"
          value={previewMode}
          onValueChange={(value) => value && onPreviewModeChange(value as 'desktop' | 'mobile')}
          size="sm"
        >
          <ToggleGroupItem value="desktop" aria-label={t('editor.preview.desktop')}>
            <Monitor className="h-3.5 w-3.5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="mobile" aria-label={t('editor.preview.mobile')}>
            <Smartphone className="h-3.5 w-3.5" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Preview Content */}
      <div className="flex-1">
        <div
          className={cn(
            'border rounded-lg shadow-sm overflow-hidden transition-all mx-auto',
            previewMode === 'mobile' ? 'max-w-[320px]' : 'w-full'
          )}
          style={{ height }}
        >
          <iframe
            srcDoc={renderPreview(previewContent)}
            className="w-full h-full"
            title="Email preview"
          />
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
