import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import type { FeatureArea } from '../../domain/models';
import { cn } from '@/shadcn/lib/utils';

const featureAreaStyles: Record<FeatureArea, string> = {
  Users: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20',
  Auth: 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-500/20',
  Billing: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20',
  Teams: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20',
};

interface FeatureAreaBadgeProps {
  area: FeatureArea;
  className?: string;
}

export function FeatureAreaBadge({ area, className }: FeatureAreaBadgeProps) {
  return (
    <Badge variant="outline" className={cn(featureAreaStyles[area], className)}>
      {area}
    </Badge>
  );
}

export default FeatureAreaBadge;
