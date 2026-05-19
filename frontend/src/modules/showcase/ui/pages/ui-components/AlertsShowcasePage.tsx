import React, { useState } from 'react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Alert, AlertTitle, AlertDescription } from '@/shared/ui/components/Alert';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import { RefreshCw } from 'lucide-react';

// Dismissible Alerts Demo with reset
const DismissibleAlertsDemo = () => {
  const [key, setKey] = useState(0);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setKey((k) => k + 1)}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset Alerts
        </Button>
      </div>
      <div key={key} className="space-y-4">
        <Alert
          variant="success"
          dismissible
          onDismiss={() => console.log('Alert dismissed')}
        >
          <AlertTitle>Manual Dismiss</AlertTitle>
          <AlertDescription>Click the X button to dismiss this alert.</AlertDescription>
        </Alert>
        <Alert
          variant="info"
          dismissible
          autoDismiss
          autoDismissDelay={5000}
          onDismiss={() => console.log('Auto-dismissed')}
        >
          <AlertTitle>Auto-Dismiss (5 seconds)</AlertTitle>
          <AlertDescription>This alert will automatically disappear after 5 seconds.</AlertDescription>
        </Alert>
        <Alert
          variant="warning"
          dismissible
          autoDismiss
          autoDismissDelay={8000}
          onDismiss={() => console.log('Auto-dismissed')}
        >
          <AlertTitle>Auto-Dismiss (8 seconds)</AlertTitle>
          <AlertDescription>This alert has a longer auto-dismiss delay of 8 seconds.</AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

const AlertsShowcasePage: React.FC = () => {
  return (
    <ShowcasePage
      title="Alerts"
      description="Alert components for displaying important messages and notifications."
    >
      {/* Alert Variants */}
      <ShowcaseSection
        title="Alert Variants"
        description="Different alert styles for various message types."
      >
        <CodeExample
          id="alerts"
          title="Alert Types"
          code={`<Alert variant="info">
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>This is an informational message.</AlertDescription>
</Alert>

<Alert variant="success">
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>Operation completed successfully.</AlertDescription>
</Alert>

<Alert variant="warning">
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>Please review before proceeding.</AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong.</AlertDescription>
</Alert>`}
        >
          <div className="space-y-4">
            <Alert variant="info">
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>This is an informational message for the user.</AlertDescription>
            </Alert>
            <Alert variant="success">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Your changes have been saved successfully.</AlertDescription>
            </Alert>
            <Alert variant="warning">
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>Please review your input before proceeding.</AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Something went wrong. Please try again.</AlertDescription>
            </Alert>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Error Summary Alert */}
      <ShowcaseSection
        title="Error Summary Alert"
        description="Alert with title, description, list of issues, and optional action button."
      >
        <CodeExample
          id="alerts-error-summary"
          title="Form Validation Errors"
          code={`<Alert variant="destructive" dismissible onDismiss={() => {}}>
  <AlertTitle>There were 3 errors with your submission</AlertTitle>
  <AlertDescription>
    <ul className="list-disc list-inside mt-2 space-y-1">
      <li>Email address is required</li>
      <li>Password must be at least 8 characters</li>
      <li>Please accept the terms and conditions</li>
    </ul>
  </AlertDescription>
  <Button variant="outline" size="sm" className="mt-3">
    Review Form
  </Button>
</Alert>`}
        >
          <div className="space-y-4">
            <Alert variant="destructive" dismissible>
              <div className="w-full">
                <AlertTitle>There were 3 errors with your submission</AlertTitle>
                <AlertDescription>
                  <p className="mt-1">Please fix the following issues before continuing:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>Email address is required</li>
                    <li>Password must be at least 8 characters</li>
                    <li>Please accept the terms and conditions</li>
                  </ul>
                </AlertDescription>
                <Button variant="outline" size="sm" className="mt-3 border-destructive/50 hover:bg-destructive/10">
                  Review Form
                </Button>
              </div>
            </Alert>

            <Alert variant="warning" dismissible>
              <div className="w-full">
                <AlertTitle>Your session is about to expire</AlertTitle>
                <AlertDescription>
                  <p className="mt-1">You will be logged out in 5 minutes due to inactivity.</p>
                </AlertDescription>
                <div className="flex gap-2 mt-3">
                  <Button size="sm">Stay Logged In</Button>
                  <Button variant="outline" size="sm">Log Out Now</Button>
                </div>
              </div>
            </Alert>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Inline Alerts */}
      <ShowcaseSection
        title="Inline Alerts"
        description="Alerts embedded inside forms or cards for contextual feedback."
      >
        <CodeExample
          id="alerts-inline"
          title="Form with Inline Alerts"
          code={`<div className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" className="border-destructive" />
    <Alert variant="destructive" className="py-2">
      <AlertDescription>Please enter a valid email address.</AlertDescription>
    </Alert>
  </div>
</div>`}
        >
          <div className="max-w-md space-y-6">
            <div className="p-4 border rounded-lg space-y-4">
              <h4 className="font-medium">Account Settings</h4>
              
              <div className="space-y-2">
                <Label htmlFor="email-inline">Email Address</Label>
                <Input
                  id="email-inline"
                  type="email"
                  defaultValue="invalid-email"
                  className="border-destructive focus-visible:ring-destructive"
                />
                <Alert variant="destructive" className="py-2 px-3" hideIcon>
                  <AlertDescription className="text-xs">
                    Please enter a valid email address.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username-inline">Username</Label>
                <Input
                  id="username-inline"
                  defaultValue="john_doe"
                  className="border-green-500 focus-visible:ring-green-500"
                />
                <Alert variant="success" className="py-2 px-3" hideIcon>
                  <AlertDescription className="text-xs">
                    Username is available!
                  </AlertDescription>
                </Alert>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-key-inline">API Key</Label>
                <Input
                  id="api-key-inline"
                  defaultValue="sk_live_..."
                  type="password"
                />
                <Alert variant="warning" className="py-2 px-3" hideIcon>
                  <AlertDescription className="text-xs">
                    Keep your API key secret. Do not share it publicly.
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <Alert variant="info" className="mb-4">
                <AlertTitle>Pro Tip</AlertTitle>
                <AlertDescription>
                  You can use inline alerts to provide immediate feedback as users fill out forms.
                </AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground">
                This card demonstrates how alerts can be embedded within other UI components.
              </p>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Dismissible Alerts */}
      <ShowcaseSection
        title="Dismissible Alerts"
        description="Alerts that can be manually dismissed or auto-dismiss after a delay."
      >
        <CodeExample
          id="alerts-dismissible"
          title="Manual & Auto-Dismiss"
          code={`<Alert variant="success" dismissible onDismiss={() => console.log('dismissed')}>
  <AlertTitle>Manual Dismiss</AlertTitle>
  <AlertDescription>Click the X button to dismiss this alert.</AlertDescription>
</Alert>

<Alert 
  variant="info" 
  dismissible 
  autoDismiss 
  autoDismissDelay={5000}
  onDismiss={() => console.log('auto-dismissed')}
>
  <AlertTitle>Auto-Dismiss (5 seconds)</AlertTitle>
  <AlertDescription>This alert will automatically disappear after 5 seconds with a progress bar.</AlertDescription>
</Alert>`}
        >
          <DismissibleAlertsDemo />
        </CodeExample>
      </ShowcaseSection>

      {/* Compact Alerts */}
      <ShowcaseSection
        title="Compact Alerts"
        description="Smaller alerts for tight spaces or less prominent messages."
      >
        <CodeExample
          id="alerts-compact"
          title="Compact Variations"
          code={`<Alert variant="info" className="py-2 px-3">
  <AlertDescription className="text-xs">Compact info message</AlertDescription>
</Alert>`}
        >
          <div className="space-y-3 max-w-md">
            <Alert variant="info" className="py-2 px-3">
              <AlertDescription className="text-xs">
                Your account was last accessed from a new device.
              </AlertDescription>
            </Alert>
            <Alert variant="success" className="py-2 px-3">
              <AlertDescription className="text-xs">
                All systems operational.
              </AlertDescription>
            </Alert>
            <Alert variant="warning" className="py-2 px-3">
              <AlertDescription className="text-xs">
                Scheduled maintenance tonight at 2:00 AM UTC.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive" className="py-2 px-3">
              <AlertDescription className="text-xs">
                Payment failed. Please update your billing information.
              </AlertDescription>
            </Alert>
          </div>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default AlertsShowcasePage;

