import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import type { TemplateStatus } from '../../domain/models';
import { cn } from '@/shadcn/lib/utils';

const statusStyles: Record<TemplateStatus, string> = {
  Active: 'bg-success/10 text-success border-success/20',
  Draft: 'bg-warning/10 text-warning border-warning/20',
  Default: 'bg-muted text-muted-foreground',
};

interface StatusBadgeProps {
  status: TemplateStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(statusStyles[status], className)}>
      {status}
    </Badge>
  );
}

export default StatusBadge;
