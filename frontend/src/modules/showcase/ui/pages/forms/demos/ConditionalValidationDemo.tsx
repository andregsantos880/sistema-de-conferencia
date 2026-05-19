import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Zap, Layout, Smartphone } from 'lucide-react';
import ActionButton from '@/components/forms/buttons/ActionButton';
import { Alert, AlertTitle, AlertDescription } from '@/shared/ui/components/Alert';
import FieldSelect from '@/components/forms/composites/field/FieldSelect';
import FieldTextarea from '@/components/forms/composites/field/FieldTextarea';
import { SelectItem } from '@/shared/ui/shadcn/components/ui/select';

// Conditional Schema
const projectSchema = z.object({
  type: z.enum(['website', 'mobile', 'consulting'] as const, {
    message: 'Please select a project type',
  }),
  platform: z.enum(['ios', 'android', 'both'] as const).optional(),
  urgency: z.enum(['low', 'medium', 'high'] as const, {
    message: 'Please select urgency level',
  }),
  reason: z.string().optional(),
}).superRefine((data, ctx) => {
  // Conditional validation: Platform required if type is mobile
  if (data.type === 'mobile' && !data.platform) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Platform is required for mobile apps',
      path: ['platform'],
    });
  }

  // Conditional validation: Reason required if urgency is high
  if (data.urgency === 'high' && (!data.reason || data.reason.length < 10)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please provide a reason for high urgency (min 10 chars)',
      path: ['reason'],
    });
  }
});
type ProjectFormValues = z.infer<typeof projectSchema>;

export const ConditionalValidationDemo: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);

  const { control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      urgency: 'medium',
    },
  });

  const projectType = watch('type');
  const urgency = watch('urgency');

  const onSubmit = async (data: ProjectFormValues) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Project request:', data);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {isSuccess && (
        <Alert variant="success" dismissible onDismiss={() => setIsSuccess(false)}>
          <AlertTitle>Request Sent</AlertTitle>
          <AlertDescription>We received your project request.</AlertDescription>
        </Alert>
      )}

      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <FieldSelect
            label="Project Type"
            placeholder="Select a type..."
            onValueChange={field.onChange}
            value={field.value}
            status={errors.type ? 'error' : undefined}
            statusMessage={errors.type?.message}
          >
            <SelectItem value="website">
              <div className="flex items-center gap-2">
                <Layout className="h-4 w-4" />
                <span>Website / Web App</span>
              </div>
            </SelectItem>
            <SelectItem value="mobile">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <span>Mobile Application</span>
              </div>
            </SelectItem>
            <SelectItem value="consulting">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>Consulting / Audit</span>
              </div>
            </SelectItem>
          </FieldSelect>
        )}
      />

      {projectType === 'mobile' && (
        <div className="pl-4 border-l-2 border-muted animate-in fade-in slide-in-from-top-2 duration-300">
          <Controller
            name="platform"
            control={control}
            render={({ field }) => (
              <FieldSelect
                label="Target Platform"
                placeholder="Select platform..."
                onValueChange={field.onChange}
                value={field.value}
                status={errors.platform ? 'error' : undefined}
                statusMessage={errors.platform?.message}
              >
                <SelectItem value="ios">iOS Only</SelectItem>
                <SelectItem value="android">Android Only</SelectItem>
                <SelectItem value="both">Both (Cross-platform)</SelectItem>
              </FieldSelect>
            )}
          />
        </div>
      )}

      <Controller
        name="urgency"
        control={control}
        render={({ field }) => (
          <FieldSelect
            label="Urgency"
            placeholder="Select urgency..."
            onValueChange={field.onChange}
            value={field.value}
            status={errors.urgency ? 'error' : undefined}
            statusMessage={errors.urgency?.message}
          >
            <SelectItem value="low">Low - No rush</SelectItem>
            <SelectItem value="medium">Medium - Standard timeline</SelectItem>
            <SelectItem value="high">
              <span className="font-semibold text-destructive">High - Urgent attention needed</span>
            </SelectItem>
          </FieldSelect>
        )}
      />

      {urgency === 'high' && (
        <div className="pl-4 border-l-2 border-destructive/50 animate-in fade-in slide-in-from-top-2 duration-300">
          <Controller
            name="reason"
            control={control}
            render={({ field }) => (
              <FieldTextarea
                label="Reason for Urgency"
                description="Please explain why this is critical (min 10 chars)"
                placeholder="We have a launch deadline next week..."
                {...field}
                status={errors.reason ? 'error' : undefined}
                statusMessage={errors.reason?.message}

              />
            )}
          />
        </div>
      )}

      <ActionButton type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {isSubmitting ? 'Sending Request...' : 'Send Request'}
      </ActionButton>
    </form>
  );
};
