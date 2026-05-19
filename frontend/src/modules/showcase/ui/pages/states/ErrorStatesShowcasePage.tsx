import React from 'react';
import { AlertCircle, RefreshCw, ShieldX, ArrowLeft, Lock } from 'lucide-react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { ErrorState } from '@/shared/ui/components/states/ErrorState';
import { Alert, AlertTitle, AlertDescription } from '@/shared/ui/components/Alert';
import { Card } from '@/shared/ui/shadcn/components/ui/card';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Label } from '@/shared/ui/shadcn/components/ui/label';

const formErrors = {
  email: 'Please enter a valid email address',
  password: 'Password must be at least 8 characters',
};

const ErrorStatesShowcasePage: React.FC = () => {

  return (
    <ShowcasePage
      title="Error States"
      description="Show error handling without breaking UX. Errors should be visually calm, not alarming."
    >
      <ShowcaseSection
        title="Page-Level Error"
        description="Full-width error block with retry button for failed data fetching."
      >
        <CodeExample
          id="states"
          title="Full Page Error"
          code={`<Card className="p-6">
  <ErrorState
    title="Unable to load data"
    description="We couldn't fetch your dashboard data. Please check your connection and try again."
    onRetry={() => refetch()}
    retryText="Try Again"
  />
</Card>`}
        >
          <Card className="p-6">
            <ErrorState
              title="Unable to load data"
              description="We couldn't fetch your dashboard data. Please check your connection and try again."
              onRetry={() => {}}
              retryText="Try Again"
              size="md"
            />
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Inline Error"
        description="Error inside table or card that preserves layout structure."
      >
        <CodeExample
          id="states"
          title="Inline Error in Card"
          code={`<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* Normal card */}
  <Card className="p-6">
    <p className="text-sm text-muted-foreground">Revenue</p>
    <p className="text-2xl font-bold">$12,450</p>
  </Card>
  
  {/* Card with error */}
  <Card className="p-6 border-destructive/50">
    <p className="text-sm text-muted-foreground">Orders</p>
    <div className="flex items-center gap-2 text-destructive mt-2">
      <AlertCircle className="h-4 w-4" />
      <span className="text-sm">Failed to load</span>
    </div>
    <Button variant="ghost" size="sm" className="mt-2 h-7 px-2">
      <RefreshCw className="h-3 w-3 mr-1" /> Retry
    </Button>
  </Card>
</div>`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Normal card */}
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Revenue</p>
              <p className="text-2xl font-bold">$12,450</p>
              <p className="text-xs text-success mt-1">+12% from last month</p>
            </Card>
            
            {/* Card with error */}
            <Card className="p-6 border-destructive/50">
              <p className="text-sm text-muted-foreground mb-1">Orders</p>
              <div className="flex items-center gap-2 text-destructive mt-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Failed to load</span>
              </div>
              <Button variant="ghost" size="sm" className="mt-2 h-7 px-2 text-xs">
                <RefreshCw className="h-3 w-3 mr-1" /> Retry
              </Button>
            </Card>
            
            {/* Normal card */}
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Customers</p>
              <p className="text-2xl font-bold">1,234</p>
              <p className="text-xs text-success mt-1">+5% from last month</p>
            </Card>
          </div>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Form Errors"
        description="Field-level validation errors and general submit error."
      >
        <CodeExample
          id="states"
          title="Form Validation Errors"
          code={`<form className="space-y-4">
  {/* General form error */}
  <Alert variant="destructive">
    <AlertTitle>Unable to save changes</AlertTitle>
    <AlertDescription>Please fix the errors below and try again.</AlertDescription>
  </Alert>
  
  {/* Field with error */}
  <div className="space-y-2">
    <Label htmlFor="email" className="text-destructive">Email</Label>
    <Input id="email" className="border-destructive" />
    <p className="text-sm text-destructive">Please enter a valid email address</p>
  </div>
</form>`}
        >
          <Card className="p-6">
            <form className="space-y-4 max-w-md">
              {/* General form error */}
              <Alert variant="destructive">
                <AlertTitle>Unable to save changes</AlertTitle>
                <AlertDescription>Please fix the errors below and try again.</AlertDescription>
              </Alert>
              
              {/* Field with error */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-destructive">Email *</Label>
                <Input 
                  id="email" 
                  type="email"
                  defaultValue="invalid-email"
                  className="border-destructive focus-visible:ring-destructive" 
                />
                <p className="text-sm text-destructive">{formErrors.email}</p>
              </div>
              
              {/* Another field with error */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-destructive">Password *</Label>
                <Input 
                  id="password" 
                  type="password"
                  defaultValue="123"
                  className="border-destructive focus-visible:ring-destructive" 
                />
                <p className="text-sm text-destructive">{formErrors.password}</p>
              </div>
              
              {/* Valid field */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="John Doe" />
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button type="button" disabled>Save Changes</Button>
                <Button type="button" variant="outline">Cancel</Button>
              </div>
            </form>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Permission / Forbidden State"
        description="Example 403-style message with CTA to go back or request access."
      >
        <CodeExample
          id="states"
          title="Access Denied"
          code={`<div className="flex flex-col items-center text-center space-y-4">
  <ErrorState
    icon={ShieldX}
    title="Access Denied"
    description="You don't have permission to view this page. Contact your administrator for access."
    size="md"
    variant="error"
  />
  <div className="flex gap-3">
    <Button variant="outline">
      <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
    </Button>
    <Button>
      <Lock className="h-4 w-4 mr-2" /> Request Access
    </Button>
  </div>
</div>`}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <ErrorState
              icon={ShieldX}
              title="Access Denied"
              description="You don't have permission to view this page. Contact your administrator if you believe this is an error."
              size="md"
              variant="error"
            />
            <div className="flex gap-3">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
              </Button>
              <Button>
                <Lock className="h-4 w-4 mr-2" /> Request Access
              </Button>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default ErrorStatesShowcasePage;
