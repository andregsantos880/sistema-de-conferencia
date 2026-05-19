/**
 * InvoiceDetailPage
 * 
 * Displays a detailed view of a single invoice with actions.
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Pencil,
  Copy,
  Send,
  CheckCircle,
  Download,
  Trash2,
  FileText,
  Building2,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { toast } from 'sonner';
import PageLayout from '@/shared/ui/components/PageLayout';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Separator } from '@/shared/ui/shadcn/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/shared/ui/shadcn/components/ui/table';
import { Skeleton } from '@/shared/ui/components/Skeleton';
import { InvoiceStatusBadge } from '../components/InvoiceStatusBadge';
import { INVOICING_PATHS } from '../routes';
import {
  useInvoice,
  useMarkInvoiceAsPaid,
  useMarkInvoiceAsSent,
  useDuplicateInvoice,
  useDeleteInvoice,
} from '../../application/hooks';
import { formatCurrency } from '../../domain/models/Invoice';

// ============================================================================
// Loading Skeleton
// ============================================================================

function InvoiceDetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function InvoiceDetailPage() {
  const { t } = useTranslation('invoices');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Queries
  const { data: invoice, isLoading, error, refetch } = useInvoice(id ?? null);

  // Mutations
  const markAsPaid = useMarkInvoiceAsPaid();
  const markAsSent = useMarkInvoiceAsSent();
  const duplicateInvoice = useDuplicateInvoice();
  const deleteInvoice = useDeleteInvoice();

  // Handlers
  const handleMarkAsPaid = async () => {
    if (!id) return;
    try {
      await markAsPaid.mutateAsync(id);
      toast.success(t('success.markedAsPaid'));
    } catch {
      toast.error(t('errors.markAsPaidFailed'));
    }
  };

  const handleMarkAsSent = async () => {
    if (!id) return;
    try {
      await markAsSent.mutateAsync(id);
      toast.success(t('success.markedAsSent'));
    } catch {
      toast.error(t('errors.markAsSentFailed'));
    }
  };

  const handleDuplicate = async () => {
    if (!id) return;
    try {
      const newInvoice = await duplicateInvoice.mutateAsync(id);
      toast.success(t('success.duplicated'));
      navigate(INVOICING_PATHS.EDIT(newInvoice.id));
    } catch {
      toast.error(t('errors.duplicateFailed'));
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteInvoice.mutateAsync(id);
      toast.success(t('success.deleted'));
      navigate(INVOICING_PATHS.ROOT);
    } catch {
      toast.error(t('errors.deleteFailed'));
    }
  };

  const handleDownloadPdf = () => {
    toast.info('PDF generation not implemented yet');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <PageLayout
      title={invoice?.number ?? t('routes.detail')}
      subtitle={invoice ? t('detail.createdOn', { date: formatDate(invoice.createdAt) }) : undefined}
      backButton={{
        label: t('actions.backToInvoices'),
        onClick: () => navigate(INVOICING_PATHS.ROOT),
      }}
      isLoading={isLoading}
      error={error}
      data={invoice!}
      isEmpty={!invoice}
      loadingFallback={<InvoiceDetailSkeleton />}
      errorConfig={{
        title: t('errors.notFound'),
        description: t('errors.notFoundDescription'),
        icon: FileText,
        onRetry: () => refetch(),
      }}
      actions={
        invoice && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(INVOICING_PATHS.EDIT(invoice.id))}
            >
              <Pencil className="h-4 w-4 mr-2" />
              {t('actions.edit')}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              {t('actions.duplicate')}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
              <Download className="h-4 w-4 mr-2" />
              {t('actions.downloadPdf')}
            </Button>
          </div>
        )
      }
    >
      {(inv: NonNullable<typeof invoice>) => (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Header */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                  <CardTitle className="text-2xl">{inv.number}</CardTitle>
                  <InvoiceStatusBadge status={inv.status} />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {formatCurrency(inv.total, inv.currency)}
                  </div>
                  <div className="text-sm text-muted-foreground">{t('detail.totalAmount')}</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('columns.issueDate')}:</span>
                    <span className="font-medium">{formatDate(inv.issueDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('columns.dueDate')}:</span>
                    <span
                      className={
                        inv.status === 'overdue' ? 'font-medium text-red-600' : 'font-medium'
                      }
                    >
                      {formatDate(inv.dueDate)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('detail.billedTo')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">{inv.customer.name}</div>
                      {inv.customer.company && (
                        <div className="text-sm text-muted-foreground">
                          {inv.customer.company}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${inv.customer.email}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {inv.customer.email}
                    </a>
                  </div>
                  {(inv.customer.addressLine1 || inv.customer.city) && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="text-sm">
                        {inv.customer.addressLine1 && <div>{inv.customer.addressLine1}</div>}
                        {inv.customer.addressLine2 && <div>{inv.customer.addressLine2}</div>}
                        {(inv.customer.city || inv.customer.country) && (
                          <div>
                            {[inv.customer.city, inv.customer.country]
                              .filter(Boolean)
                              .join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {inv.customer.taxId && (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Tax ID: {inv.customer.taxId}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('lineItems.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50%]">{t('lineItems.description')}</TableHead>
                      <TableHead className="text-right">{t('lineItems.quantity')}</TableHead>
                      <TableHead className="text-right">{t('lineItems.unitPrice')}</TableHead>
                      <TableHead className="text-right">{t('lineItems.discount')}</TableHead>
                      <TableHead className="text-right">{t('lineItems.total')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inv.lineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unitPrice, inv.currency)}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.discount ? `${item.discount}%` : '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.total, inv.currency)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={4} className="text-right">
                        {t('detail.subtotal')}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(inv.subtotal, inv.currency)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} className="text-right">
                        {t('detail.tax', { rate: inv.taxRate })}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(inv.taxAmount, inv.currency)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-bold">
                        {t('detail.total')}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(inv.total, inv.currency)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
                
              </CardContent>
            </Card>

            {/* Notes & Terms */}
            {(inv.notes || inv.terms) && (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  {inv.notes && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">{t('detail.notes')}</h4>
                      <p className="text-sm text-muted-foreground">{inv.notes}</p>
                    </div>
                  )}
                  {inv.notes && inv.terms && <Separator />}
                  {inv.terms && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">{t('detail.terms')}</h4>
                      <p className="text-sm text-muted-foreground">{inv.terms}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('detail.summary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('detail.subtotal')}</span>
                  <span>{formatCurrency(inv.subtotal, inv.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('detail.tax', { rate: inv.taxRate })}</span>
                  <span>{formatCurrency(inv.taxAmount, inv.currency)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>{t('detail.total')}</span>
                  <span className="text-lg">{formatCurrency(inv.total, inv.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('detail.currency')}</span>
                  <span>{inv.currency}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('columns.actions')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate(INVOICING_PATHS.EDIT(inv.id))}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  {t('actions.edit')}
                </Button>

                {inv.status === 'draft' && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleMarkAsSent}
                    disabled={markAsSent.isPending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {t('actions.markAsSent')}
                  </Button>
                )}

                {(inv.status === 'sent' || inv.status === 'overdue') && (
                  <Button
                    variant="default"
                    className="w-full justify-start"
                    onClick={handleMarkAsPaid}
                    disabled={markAsPaid.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t('actions.markAsPaid')}
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleDuplicate}
                  disabled={duplicateInvoice.isPending}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {t('actions.duplicate')}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleDownloadPdf}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('actions.downloadPdf')}
                </Button>

                {(inv.status === 'draft' || inv.status === 'cancelled') && (
                  <>
                    <Separator className="my-2" />
                    <Button
                      variant="destructive"
                      className="w-full justify-start"
                      onClick={handleDelete}
                      disabled={deleteInvoice.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('actions.delete')}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

export default InvoiceDetailPage;
