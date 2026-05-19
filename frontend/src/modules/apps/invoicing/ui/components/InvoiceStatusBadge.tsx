/**
 * InvoiceStatusBadge Component
 * 
 * Displays a colored badge for invoice status.
 */

import { useTranslation } from 'react-i18next';
import { cn } from '@/shadcn/lib/utils';
import type { InvoiceStatus } from '../../domain/models/Invoice';
import { INVOICE_STATUS_CONFIG } from '../../domain/models/Invoice';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
  const { t } = useTranslation('invoices');
  const config = INVOICE_STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.bgColor,
        config.textColor,
        className
      )}
    >
      <span
        className={cn('mr-1.5 h-1.5 w-1.5 rounded-full', config.color)}
        aria-hidden="true"
      />
      {t(`status.${status}`)}
    </span>
  );
}

export default InvoiceStatusBadge;
