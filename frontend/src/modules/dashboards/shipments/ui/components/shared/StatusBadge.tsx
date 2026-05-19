import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { ShipmentStatus } from '../../../domain/models';
import { getStatusConfig } from '../../../shared/utils/shipmentHelpers';
import { useTranslation } from 'react-i18next';

interface StatusBadgeProps {
  status: ShipmentStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string; // Add className prop
}

/**
 * Status badge component for shipments
 */
export function StatusBadge({ status, size = 'md', className = '' }: StatusBadgeProps) {
  const { t } = useTranslation('dashboards');
  const config = getStatusConfig(status);

  // Map custom variants to shadcn Badge variants
  const badgeVariant = config.variant === 'success' || config.variant === 'warning' 
    ? 'default' 
    : config.variant;

  return (
    <Badge
      variant={badgeVariant}
      className={`shadow-none ${config.color} ${
        size === 'sm' ? 'text-xs px-2 py-0.5' :
        size === 'lg' ? 'text-sm px-3 py-1.5' :
        'text-xs px-2.5 py-1'
      } ${className}`} // Append className
    >
      {t(`shipments.status.${status}`)}
    </Badge>
  );
}
