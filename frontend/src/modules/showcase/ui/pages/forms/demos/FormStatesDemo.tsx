import React from 'react';
import ActionButton from '@/components/forms/buttons/ActionButton';
import { Alert, AlertTitle, AlertDescription } from '@/shared/ui/components/Alert';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import FieldText from '@/components/forms/composites/field/FieldText';
import { Field, FieldLabel, FieldDescription } from '@/shared/ui/shadcn/components/ui/field';

export const FormStatesDemo: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Error State Alert */}
      <div className="space-y-2">
        <Label className="text-muted-foreground text-xs uppercase tracking-wide">Error State</Label>
        <Alert variant="destructive">
          <AlertTitle>Submission Failed</AlertTitle>
          <AlertDescription>
            Please correct the following errors:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Email address is invalid</li>
              <li>Password is too short</li>
              <li>Terms must be accepted</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>

      {/* Warning State Alert */}
      <div className="space-y-2">
        <Label className="text-muted-foreground text-xs uppercase tracking-wide">Warning State</Label>
        <Alert variant="warning">
          <AlertTitle>Session Expiring</AlertTitle>
          <AlertDescription>
            Your session will expire in 5 minutes. Please save your changes.
          </AlertDescription>
        </Alert>
      </div>

      {/* Success State Alert */}
      <div className="space-y-2">
        <Label className="text-muted-foreground text-xs uppercase tracking-wide">Success State</Label>
        <Alert variant="success">
          <AlertTitle>Changes Saved</AlertTitle>
          <AlertDescription>
            Your changes have been saved successfully.
          </AlertDescription>
        </Alert>
      </div>

      {/* Info State Alert */}
      <div className="space-y-2">
        <Label className="text-muted-foreground text-xs uppercase tracking-wide">Info State</Label>
        <Alert variant="info">
          <AlertTitle>Tip</AlertTitle>
          <AlertDescription>
            You can use keyboard shortcuts to save faster. Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs">Ctrl+S</kbd> to save.
          </AlertDescription>
        </Alert>
      </div>

      {/* Button States */}
      <div className="space-y-2 pt-4">
        <Label className="text-muted-foreground text-xs uppercase tracking-wide">Button States</Label>
        <div className="flex flex-wrap gap-3">
          <ActionButton>Default</ActionButton>
          <ActionButton status="loading" loadingText="Saving...">Save</ActionButton>
          <ActionButton status="success">Saved!</ActionButton>
          <ActionButton status="error">Failed</ActionButton>
          <ActionButton disabled>Disabled</ActionButton>
          <ActionButton variant="outline">Cancel</ActionButton>
        </div>
      </div>

      {/* Field States */}
      <div className="space-y-4 pt-4">
        <Label className="text-muted-foreground text-xs uppercase tracking-wide">Field States</Label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldText 
            label="Default State" 
            placeholder="Enter value..." 
          />
          
          {/* Manually verify focus state styling capability - using generic Field since FieldText limits input custom classes */}
          <Field className="gap-2">
            <FieldLabel>Focus State</FieldLabel>
            <Input placeholder="Focused input" className="border-ring ring-ring/50 ring-[3px]" />
            <FieldDescription>Simulated focus ring</FieldDescription>
          </Field>
          
          <FieldText 
            label="Error State" 
            placeholder="Invalid value"
            status="error"
            statusMessage="This field is required"
            defaultValue="Invalid Input"
          />
          
          <FieldText 
            label="Disabled State"
            placeholder="Cannot edit"
            disabled
            defaultValue="Read-only value"
          />
        </div>
      </div>
    </div>
  );
};
