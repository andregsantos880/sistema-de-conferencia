/**
 * InvoiceFormPage
 * 
 * Create and edit invoice form with customer info, line items, and live summary.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileText, Save, Send } from 'lucide-react';
import { toast } from 'sonner';
import PageLayout from '@/shared/ui/components/PageLayout';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import { Textarea } from '@/shared/ui/shadcn/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Separator } from '@/shared/ui/shadcn/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/components/ui/select';
import { Skeleton } from '@/shared/ui/components/Skeleton';
import { LineItemsEditor } from '../components/LineItemsEditor';
import { INVOICING_PATHS } from '../routes';
import {
  useInvoice,
  useCreateInvoice,
  useUpdateInvoice,
  useMarkInvoiceAsSent,
} from '../../application/hooks';
import type { CreateInvoiceDto, CreateLineItemDto } from '../../domain/models/Invoice';
import {
  SUPPORTED_CURRENCIES,
  calculateInvoiceTotals,
  formatCurrency,
} from '../../domain/models/Invoice';

// ============================================================================
// Form Schema
// ============================================================================

const invoiceFormSchema = z.object({
  customer: z.object({
    name: z.string().min(1, 'Customer name is required'),
    email: z.string().email('Invalid email address'),
    company: z.string().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    taxId: z.string().optional(),
  }),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  currency: z.string().min(1, 'Currency is required'),
  taxRate: z.number().min(0).max(100),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

// ============================================================================
// Loading Skeleton
// ============================================================================

function InvoiceFormSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
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
      <div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent className="space-y-3">
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

export function InvoiceFormPage() {
  const { t } = useTranslation('invoices');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Queries
  const { data: existingInvoice, isLoading, error } = useInvoice(id ?? null);

  // Mutations
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const markAsSent = useMarkInvoiceAsSent();

  // Line items state (managed separately for better UX)
  const [lineItems, setLineItems] = useState<CreateLineItemDto[]>([
    { description: '', quantity: 1, unitPrice: 0, discount: 0 },
  ]);

  // Form setup
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      customer: {
        name: '',
        email: '',
        company: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        country: '',
        taxId: '',
      },
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currency: 'USD',
      taxRate: 10,
      notes: '',
      terms: 'Payment due within 30 days.',
    },
  });

  // Watch values for live summary
  // React Hook Form's watch() intentionally returns unstable references for reactivity
  // eslint-disable-next-line react-hooks/incompatible-library -- React Hook Form watch() is designed with unstable references for reactive form updates
  const watchedCurrency = watch('currency');
  const watchedTaxRate = watch('taxRate');

  // Calculate totals
  const totals = useMemo(() => {
    return calculateInvoiceTotals(lineItems, watchedTaxRate || 0);
  }, [lineItems, watchedTaxRate]);

  // Populate form when editing
  useEffect(() => {
    if (existingInvoice && isEditMode) {
      reset({
        customer: {
          name: existingInvoice.customer.name,
          email: existingInvoice.customer.email,
          company: existingInvoice.customer.company || '',
          addressLine1: existingInvoice.customer.addressLine1 || '',
          addressLine2: existingInvoice.customer.addressLine2 || '',
          city: existingInvoice.customer.city || '',
          country: existingInvoice.customer.country || '',
          taxId: existingInvoice.customer.taxId || '',
        },
        issueDate: existingInvoice.issueDate.split('T')[0],
        dueDate: existingInvoice.dueDate.split('T')[0],
        currency: existingInvoice.currency,
        taxRate: existingInvoice.taxRate,
        notes: existingInvoice.notes || '',
        terms: existingInvoice.terms || '',
      });
      setLineItems(
        existingInvoice.lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
        }))
      );
    }
  }, [existingInvoice, isEditMode, reset]);

  // Validate line items
  const validateLineItems = useCallback((): boolean => {
    if (lineItems.length === 0) {
      toast.error(t('validation.lineItemRequired'));
      return false;
    }

    for (let i = 0; i < lineItems.length; i++) {
      const item = lineItems[i];
      if (!item.description.trim()) {
        toast.error(t('validation.descriptionRequired', { index: i + 1 }));
        return false;
      }
      if (item.quantity <= 0) {
        toast.error(t('validation.quantityRequired', { index: i + 1 }));
        return false;
      }
      if (item.unitPrice < 0) {
        toast.error(t('validation.unitPriceRequired', { index: i + 1 }));
        return false;
      }
    }

    return true;
  }, [lineItems, t]);

  // Submit handler
  const onSubmit = useCallback(
    async (data: InvoiceFormData, shouldSend: boolean = false) => {
      if (!validateLineItems()) return;

      const dto: CreateInvoiceDto = {
        customer: data.customer,
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        currency: data.currency,
        taxRate: data.taxRate,
        lineItems,
        notes: data.notes,
        terms: data.terms,
      };

      try {
        let invoiceId: string;

        if (isEditMode && id) {
          const updated = await updateInvoice.mutateAsync({ id, dto });
          invoiceId = updated.id;
          toast.success(t('success.updated'));
        } else {
          const created = await createInvoice.mutateAsync(dto);
          invoiceId = created.id;
          toast.success(t('success.created'));
        }

        if (shouldSend) {
          await markAsSent.mutateAsync(invoiceId);
          toast.success(t('success.markedAsSent'));
        }

        navigate(INVOICING_PATHS.DETAIL(invoiceId));
      } catch {
        toast.error(isEditMode ? t('errors.updateFailed') : t('errors.createFailed'));
      }
    },
    [
      validateLineItems,
      lineItems,
      isEditMode,
      id,
      updateInvoice,
      createInvoice,
      markAsSent,
      navigate,
      t,
    ]
  );

  const handleSaveDraft = handleSubmit((data) => onSubmit(data, false));
  const handleSaveAndSend = handleSubmit((data) => onSubmit(data, true));

  // Show loading state for edit mode
  if (isEditMode && isLoading) {
    return (
      <PageLayout
        title={t('common:loading')}
        isLoading={true}
        error={null}
        data={null}
        loadingFallback={<InvoiceFormSkeleton />}
      >
        {() => null}
      </PageLayout>
    );
  }

  // Show error state for edit mode
  if (isEditMode && error) {
    return (
      <PageLayout
        title={t('common:error')}
        isLoading={false}
        error={error}
        data={null}
        loadingFallback={<InvoiceFormSkeleton />}
        errorConfig={{
          title: t('errors.notFound'),
          description: t('errors.notFoundDescription'),
          icon: FileText,
        }}
      >
        {() => null}
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={isEditMode ? t('routes.edit') : t('routes.new')}
      subtitle={isEditMode ? t('subtitle') : t('subtitle')}
      backButton={{
        label: t('actions.backToInvoices'),
        onClick: () => navigate(INVOICING_PATHS.ROOT),
      }}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSubmitting || createInvoice.isPending || updateInvoice.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {t('actions.saveDraft')}
          </Button>
          {(!isEditMode || existingInvoice?.status === 'draft') && (
            <Button
              onClick={handleSaveAndSend}
              disabled={isSubmitting || createInvoice.isPending || updateInvoice.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              {t('actions.saveAndSend')}
            </Button>
          )}
        </div>
      }
    >
      <form className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('form.customerInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customer.name">
                    {t('form.customerName')} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customer.name"
                    {...register('customer.name')}
                    placeholder={t('form.customerNamePlaceholder')}
                    className={errors.customer?.name ? 'border-destructive' : ''}
                  />
                  {errors.customer?.name && (
                    <p className="text-xs text-destructive">{errors.customer.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer.email">
                    {t('form.email')} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customer.email"
                    type="email"
                    {...register('customer.email')}
                    placeholder={t('form.emailPlaceholder')}
                    className={errors.customer?.email ? 'border-destructive' : ''}
                  />
                  {errors.customer?.email && (
                    <p className="text-xs text-destructive">{errors.customer.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customer.company">{t('form.company')}</Label>
                  <Input
                    id="customer.company"
                    {...register('customer.company')}
                    placeholder={t('form.companyPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer.taxId">{t('form.taxId')}</Label>
                  <Input
                    id="customer.taxId"
                    {...register('customer.taxId')}
                    placeholder={t('form.taxIdPlaceholder')}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="customer.addressLine1">{t('form.addressLine1')}</Label>
                <Input
                  id="customer.addressLine1"
                  {...register('customer.addressLine1')}
                  placeholder={t('form.addressLine1Placeholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer.addressLine2">{t('form.addressLine2')}</Label>
                <Input
                  id="customer.addressLine2"
                  {...register('customer.addressLine2')}
                  placeholder={t('form.addressLine2Placeholder')}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customer.city">{t('form.city')}</Label>
                  <Input
                    id="customer.city"
                    {...register('customer.city')}
                    placeholder={t('form.cityPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer.country">{t('form.country')}</Label>
                  <Input
                    id="customer.country"
                    {...register('customer.country')}
                    placeholder={t('form.countryPlaceholder')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('form.invoiceDetails')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">
                    {t('form.issueDate')} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="issueDate"
                    type="date"
                    {...register('issueDate')}
                    className={errors.issueDate ? 'border-destructive' : ''}
                  />
                  {errors.issueDate && (
                    <p className="text-xs text-destructive">{errors.issueDate.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">
                    {t('form.dueDate')} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    {...register('dueDate')}
                    className={errors.dueDate ? 'border-destructive' : ''}
                  />
                  {errors.dueDate && (
                    <p className="text-xs text-destructive">{errors.dueDate.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">
                    {t('form.currency')} <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="currency"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('form.currencyPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {SUPPORTED_CURRENCIES.map((curr) => (
                            <SelectItem key={curr.code} value={curr.code}>
                              {curr.code} - {curr.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxRate">{t('form.taxRate')}</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  {...register('taxRate', { valueAsNumber: true })}
                  className="w-32"
                />
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('lineItems.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <LineItemsEditor
                items={lineItems}
                currency={watchedCurrency}
                onChange={setLineItems}
              />
            </CardContent>
          </Card>

          {/* Notes & Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('form.notesTerms')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">{t('form.notes')}</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder={t('form.notesPlaceholder')}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="terms">{t('form.terms')}</Label>
                <Textarea
                  id="terms"
                  {...register('terms')}
                  placeholder={t('form.termsPlaceholder')}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Live Summary */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">{t('detail.summary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('detail.items')}</span>
                <span>{lineItems.length}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('detail.subtotal')}</span>
                <span>{formatCurrency(totals.subtotal, watchedCurrency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('detail.tax', { rate: watchedTaxRate })}</span>
                <span>{formatCurrency(totals.taxAmount, watchedCurrency)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>{t('detail.total')}</span>
                <span className="text-lg">{formatCurrency(totals.total, watchedCurrency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('detail.currency')}</span>
                <span>{watchedCurrency}</span>
              </div>

              <Separator />

              <div className="space-y-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting || createInvoice.isPending || updateInvoice.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {t('actions.saveDraft')}
                </Button>
                {(!isEditMode || existingInvoice?.status === 'draft') && (
                  <Button
                    type="button"
                    className="w-full"
                    onClick={handleSaveAndSend}
                    disabled={isSubmitting || createInvoice.isPending || updateInvoice.isPending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {t('actions.saveAndSend')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </PageLayout>
  );
}

export default InvoiceFormPage;
