import { CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui/shadcn/components/ui/dropdown-menu';
import { Download, MoreVertical, RefreshCw } from 'lucide-react';

export interface WidgetHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onExport?: () => void;
  onRefresh?: () => void;
  className?: string;
}

export function WidgetHeader({
  title,
  subtitle,
  actions,
  onExport,
  onRefresh,
  className,
}: WidgetHeaderProps) {
  const hasMenu = onExport || onRefresh;

  return (
    <div className={`flex items-center justify-between ${className || ''}`}>
      <div>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {hasMenu && (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onRefresh && (
                <DropdownMenuItem onClick={onRefresh}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </DropdownMenuItem>
              )}
              {onExport && (
                <DropdownMenuItem onClick={onExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
