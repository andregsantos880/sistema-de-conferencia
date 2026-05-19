/**
 * Scheduled Report Configuration Demo
 * 
 * Advanced form combining conditional fields, repeatable sections, and complex validation.
 * Common in analytics dashboards, BI tools, and SaaS platforms.
 */

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Card, CardContent } from '@/shared/ui/shadcn/components/ui/card';
import { Switch } from '@/shared/ui/shadcn/components/ui/switch';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/shadcn/components/ui/radio-group';
import { SelectItem } from '@/shared/ui/shadcn/components/ui/select';
import { Collapsible, CollapsibleContent } from '@/shared/ui/shadcn/components/ui/collapsible';
import { cn } from '@/shadcn/lib/utils';

import FieldText from '@/components/forms/composites/field/FieldText';
import FieldEmail from '@/components/forms/composites/field/FieldEmail';
import FieldSelect from '@/components/forms/composites/field/FieldSelect';
import FieldTextarea from '@/components/forms/composites/field/FieldTextarea';
import { FormSection } from '@/components/forms/layout/FormSection';
import { getFieldStatus } from './formUtils';

import { 
  FileText, Calendar, Settings, Plus, Trash2, 
  Code, Loader2, CheckCircle2, Filter, Mail 
} from 'lucide-react';

// Zod Schema
const recipientSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name is required'),
});

const scheduledReportSchema = z.object({
  // Basic Info
  reportName: z.string().min(3, 'Report name must be at least 3 characters'),
  reportType: z.enum(['sales', 'analytics', 'financial', 'custom']),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  
  // Schedule
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  dayOfWeek: z.string().optional(),
  dayOfMonth: z.string().optional(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  
  // Recipients
  recipients: z.array(recipientSchema).min(1, 'At least one recipient is required').max(20, 'Maximum 20 recipients'),
  
  // Filters (conditional based on report type)
  dateRange: z.enum(['last7days', 'last30days', 'lastQuarter', 'custom']).optional(),
  customStartDate: z.string().optional(),
  customEndDate: z.string().optional(),
  includeCharts: z.boolean(),
  includeRawData: z.boolean(),
  
  // Advanced
  enableAutoArchive: z.boolean(),
  archiveAfterDays: z.number().min(1).max(365).optional(),
}).refine((data) => {
  // Weekly reports need day of week
  if (data.frequency === 'weekly') {
    return !!data.dayOfWeek;
  }
  return true;
}, {
  message: 'Day of week is required for weekly reports',
  path: ['dayOfWeek'],
}).refine((data) => {
  // Monthly reports need day of month
  if (data.frequency === 'monthly') {
    return !!data.dayOfMonth;
  }
  return true;
}, {
  message: 'Day of month is required for monthly reports',
  path: ['dayOfMonth'],
}).refine((data) => {
  // Custom date range needs both dates
  if (data.dateRange === 'custom') {
    return !!data.customStartDate && !!data.customEndDate;
  }
  return true;
}, {
  message: 'Both start and end dates are required for custom range',
  path: ['customStartDate'],
}).refine((data) => {
  // Auto-archive needs days specified
  if (data.enableAutoArchive) {
    return !!data.archiveAfterDays && data.archiveAfterDays > 0;
  }
  return true;
}, {
  message: 'Archive days is required when auto-archive is enabled',
  path: ['archiveAfterDays'],
});

type ScheduledReportFormData = z.infer<typeof scheduledReportSchema>;

export const ScheduledReportDemo: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [jsonPreviewOpen, setJsonPreviewOpen] = useState(false);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ScheduledReportFormData>({
    resolver: zodResolver(scheduledReportSchema),
    defaultValues: {
      reportName: '',
      reportType: 'analytics',
      description: '',
      frequency: 'weekly',
      dayOfWeek: 'monday',
      time: '09:00',
      recipients: [
        { email: 'manager@company.com', name: 'Sarah Manager' },
      ],
      dateRange: 'last30days',
      includeCharts: true,
      includeRawData: false,
      enableAutoArchive: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'recipients',
  });

  const frequency = watch('frequency');
  // reportType unused variable removed
  const dateRange = watch('dateRange');
  const enableAutoArchive = watch('enableAutoArchive');
  const formData = watch();

  const onSubmit = async (data: ScheduledReportFormData) => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Scheduled report created:', data);
    setIsSubmitting(false);
    setSubmitSuccess(true);
    
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information */}
      <FormSection
        title="Report Configuration"
        description="Define the basic settings for your scheduled report"
        icon={<FileText className="w-5 h-5 text-primary" />}
        variant="card"
      >
        <div className="space-y-4">
          <FieldText
            label="Report Name"
            placeholder="e.g., Weekly Sales Summary"
            {...register('reportName')}
            {...getFieldStatus(errors.reportName)}
          />
          
          <FieldSelect
            label="Report Type"
            value={watch('reportType')}
            onValueChange={(v) => setValue('reportType', v as any)}
            {...getFieldStatus(errors.reportType)}
          >
            <SelectItem value="sales">Sales Report</SelectItem>
            <SelectItem value="analytics">Analytics Dashboard</SelectItem>
            <SelectItem value="financial">Financial Summary</SelectItem>
            <SelectItem value="custom">Custom Report</SelectItem>
          </FieldSelect>
          
          <FieldTextarea
            label="Description (Optional)"
            placeholder="Brief description of what this report includes..."
            rows={3}
            {...register('description')}
            {...getFieldStatus(errors.description)}
          />
        </div>
      </FormSection>

      {/* Schedule Configuration */}
      <FormSection
        title="Schedule"
        description="When should this report be generated and sent?"
        icon={<Calendar className="w-5 h-5 text-primary" />}
        variant="card"
      >
        <div className="space-y-4">
          <div>
            <Label className="mb-3 block">Frequency</Label>
            <RadioGroup
              value={frequency}
              onValueChange={(v) => setValue('frequency', v as any)}
              className="grid gap-3 md:grid-cols-3"
            >
              <Label
                htmlFor="daily"
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all',
                  frequency === 'daily'
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/50'
                )}
              >
                <RadioGroupItem value="daily" id="daily" />
                <span className="font-medium">Daily</span>
              </Label>
              <Label
                htmlFor="weekly"
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all',
                  frequency === 'weekly'
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/50'
                )}
              >
                <RadioGroupItem value="weekly" id="weekly" />
                <span className="font-medium">Weekly</span>
              </Label>
              <Label
                htmlFor="monthly"
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all',
                  frequency === 'monthly'
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/50'
                )}
              >
                <RadioGroupItem value="monthly" id="monthly" />
                <span className="font-medium">Monthly</span>
              </Label>
            </RadioGroup>
            {errors.frequency && (
              <p className="text-sm text-destructive mt-2">{errors.frequency.message}</p>
            )}
          </div>

          {/* Conditional: Day of Week (for weekly) */}
          <div
            className={cn(
              'overflow-hidden transition-all duration-300',
              frequency === 'weekly'
                ? 'max-h-[200px] opacity-100'
                : 'max-h-0 opacity-0'
            )}
          >
            <FieldSelect
              label="Day of Week"
              value={watch('dayOfWeek')}
              onValueChange={(v) => setValue('dayOfWeek', v)}
              {...getFieldStatus(errors.dayOfWeek)}
            >
              <SelectItem value="monday">Monday</SelectItem>
              <SelectItem value="tuesday">Tuesday</SelectItem>
              <SelectItem value="wednesday">Wednesday</SelectItem>
              <SelectItem value="thursday">Thursday</SelectItem>
              <SelectItem value="friday">Friday</SelectItem>
              <SelectItem value="saturday">Saturday</SelectItem>
              <SelectItem value="sunday">Sunday</SelectItem>
            </FieldSelect>
          </div>

          {/* Conditional: Day of Month (for monthly) */}
          <div
            className={cn(
              'overflow-hidden transition-all duration-300',
              frequency === 'monthly'
                ? 'max-h-[200px] opacity-100'
                : 'max-h-0 opacity-0'
            )}
          >
            <FieldSelect
              label="Day of Month"
              value={watch('dayOfMonth')}
              onValueChange={(v) => setValue('dayOfMonth', v)}
              {...getFieldStatus(errors.dayOfMonth)}
            >
              {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
              ))}
              <SelectItem value="last">Last day of month</SelectItem>
            </FieldSelect>
          </div>

          <FieldText
            label="Time (24-hour format)"
            placeholder="09:00"
            {...register('time')}
            {...getFieldStatus(errors.time)}
            description="Report will be generated and sent at this time"
          />
        </div>
      </FormSection>

      {/* Recipients */}
      <FormSection
        title="Recipients"
        description="Who should receive this report?"
        icon={<Mail className="w-5 h-5 text-primary" />}
        variant="card"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Add email addresses of people who should receive this report
            </p>
            <Button
              type="button"
              onClick={() => append({ email: '', name: '' })}
              variant="outline"
              size="sm"
              disabled={fields.length >= 20}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Recipient
            </Button>
          </div>

          {errors.recipients?.root && (
            <p className="text-sm text-destructive">{errors.recipients.root.message}</p>
          )}

          <div className="space-y-3">
            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="pt-4">
                  <div className="grid gap-3 md:grid-cols-[1fr,1fr,auto]">
                    <FieldText
                      label="Name"
                      placeholder="John Doe"
                      {...register(`recipients.${index}.name`)}
                      {...getFieldStatus(errors.recipients?.[index]?.name)}
                    />
                    <FieldEmail
                      label="Email"
                      placeholder="john@company.com"
                      {...register(`recipients.${index}.email`)}
                      {...getFieldStatus(errors.recipients?.[index]?.email)}
                    />
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </FormSection>

      {/* Filters & Options */}
      <FormSection
        title="Report Options"
        description="Customize the content and format of your report"
        icon={<Filter className="w-5 h-5 text-primary" />}
        variant="card"
      >
        <div className="space-y-4">
          <FieldSelect
            label="Date Range"
            value={watch('dateRange')}
            onValueChange={(v) => setValue('dateRange', v as any)}
          >
            <SelectItem value="last7days">Last 7 Days</SelectItem>
            <SelectItem value="last30days">Last 30 Days</SelectItem>
            <SelectItem value="lastQuarter">Last Quarter</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </FieldSelect>

          {/* Conditional: Custom Date Range */}
          <div
            className={cn(
              'grid gap-4 md:grid-cols-2 overflow-hidden transition-all duration-300',
              dateRange === 'custom'
                ? 'max-h-[200px] opacity-100'
                : 'max-h-0 opacity-0'
            )}
          >
            <FieldText
              label="Start Date"
              type="date"
              {...register('customStartDate')}
              {...getFieldStatus(errors.customStartDate)}
            />
            <FieldText
              label="End Date"
              type="date"
              {...register('customEndDate')}
              {...getFieldStatus(errors.customEndDate)}
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="includeCharts">Include Charts & Visualizations</Label>
                <p className="text-sm text-muted-foreground">Add graphs and charts to the report</p>
              </div>
              <Switch
                id="includeCharts"
                checked={watch('includeCharts')}
                onCheckedChange={(checked) => setValue('includeCharts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="includeRawData">Include Raw Data</Label>
                <p className="text-sm text-muted-foreground">Attach CSV file with detailed data</p>
              </div>
              <Switch
                id="includeRawData"
                checked={watch('includeRawData')}
                onCheckedChange={(checked) => setValue('includeRawData', checked)}
              />
            </div>
          </div>
        </div>
      </FormSection>

      {/* Advanced Settings */}
      <FormSection
        title="Advanced Settings"
        description="Additional configuration options"
        icon={<Settings className="w-5 h-5 text-primary" />}
        variant="card"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoArchive">Auto-Archive Old Reports</Label>
              <p className="text-sm text-muted-foreground">
                Automatically archive reports after a specified number of days
              </p>
            </div>
            <Switch
              id="autoArchive"
              checked={enableAutoArchive}
              onCheckedChange={(checked) => setValue('enableAutoArchive', checked)}
            />
          </div>

          <div
            className={cn(
              'overflow-hidden transition-all duration-300',
              enableAutoArchive
                ? 'max-h-[200px] opacity-100'
                : 'max-h-0 opacity-0'
            )}
          >
            <FieldText
              label="Archive After (Days)"
              type="number"
              placeholder="90"
              {...register('archiveAfterDays', { valueAsNumber: true })}
              {...getFieldStatus(errors.archiveAfterDays)}
              description="Reports older than this will be moved to archive"
            />
          </div>
        </div>
      </FormSection>

      {/* Submit Actions */}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Schedule...
            </>
          ) : submitSuccess ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Schedule Created!
            </>
          ) : (
            'Create Scheduled Report'
          )}
        </Button>
        
        <Button type="button" variant="outline" onClick={() => setJsonPreviewOpen(!jsonPreviewOpen)}>
          <Code className="mr-2 h-4 w-4" />
          {jsonPreviewOpen ? 'Hide' : 'Show'} JSON
        </Button>
      </div>

      {/* JSON Preview */}
      <Collapsible open={jsonPreviewOpen} onOpenChange={setJsonPreviewOpen}>
        <CollapsibleContent>
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">API Payload Preview</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText(JSON.stringify(formData, null, 2))}
              >
                Copy
              </Button>
            </div>
            <pre className="text-xs overflow-x-auto">
              <code>{JSON.stringify(formData, null, 2)}</code>
            </pre>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </form>
  );
};
