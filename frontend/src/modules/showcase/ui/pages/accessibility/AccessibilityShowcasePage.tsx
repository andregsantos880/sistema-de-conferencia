import React, { useState, useRef } from 'react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/shadcn/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Checkbox } from '@/shared/ui/shadcn/components/ui/checkbox';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const AccessibilityShowcasePage: React.FC = () => {
  const [liveMessage, setLiveMessage] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const mainContentRef = useRef<HTMLDivElement>(null);

  const handleSkipToContent = () => {
    mainContentRef.current?.focus();
    mainContentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const validateForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('a11y-email') as HTMLInputElement)?.value;
    const password = (form.elements.namedItem('a11y-password') as HTMLInputElement)?.value;
    
    const errors: Record<string, string> = {};
    if (!email) errors.email = 'Email is required';
    else if (!email.includes('@')) errors.email = 'Please enter a valid email address';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 8) errors.password = 'Password must be at least 8 characters';
    
    setFormErrors(errors);
    if (Object.keys(errors).length === 0) {
      setLiveMessage('Form submitted successfully!');
    }
  };

  return (
    <ShowcasePage
      title="Accessibility"
      description="Accessibility patterns and best practices for building inclusive user interfaces."
    >
      {/* Keyboard Navigation */}
      <ShowcaseSection
        title="Keyboard Navigation"
        description="Interactive elements must be accessible via keyboard."
      >
        <CodeExample
          id="accessibility"
          title="Tab Navigation"
          code={`// All interactive elements should be focusable
<Button>Focusable</Button>
<Input placeholder="Tab to focus" />

// Use tabIndex for custom elements
<div tabIndex={0} role="button" onKeyDown={handleKeyDown}>
  Custom focusable element
</div>

// Skip non-interactive elements
<div tabIndex={-1}>Not in tab order</div>`}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Press <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Tab</kbd> to navigate through the elements below:
            </p>
            <div className="flex flex-wrap gap-4">
              <Button>Button 1</Button>
              <Button variant="outline">Button 2</Button>
              <Input className="w-40" placeholder="Input field" />
              <Button variant="secondary">Button 3</Button>
            </div>
          </div>
        </CodeExample>

        <CodeExample
          id="accessibility"
          title="Tabs Component"
          code={`<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>

// Arrow keys navigate between tabs
// Enter/Space activates a tab`}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">←</kbd> <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">→</kbd> arrow keys to navigate tabs:
            </p>
            <Tabs defaultValue="first" className="w-full max-w-md">
              <TabsList>
                <TabsTrigger value="first">First</TabsTrigger>
                <TabsTrigger value="second">Second</TabsTrigger>
                <TabsTrigger value="third">Third</TabsTrigger>
              </TabsList>
              <TabsContent value="first" className="p-4 border rounded-b-lg">
                First tab content - accessible via keyboard
              </TabsContent>
              <TabsContent value="second" className="p-4 border rounded-b-lg">
                Second tab content
              </TabsContent>
              <TabsContent value="third" className="p-4 border rounded-b-lg">
                Third tab content
              </TabsContent>
            </Tabs>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Focus States */}
      <ShowcaseSection
        title="Focus States"
        description="Visible focus indicators for keyboard users."
      >
        <CodeExample
          id="accessibility"
          title="Focus Ring Styles"
          code={`// Default focus ring (Tailwind)
<Button className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
  Focused Button
</Button>

// Custom focus styles
<input className="focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" />

// Card focus for clickable cards
<div 
  tabIndex={0}
  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
>
  Focusable Card
</div>`}
        >
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-3">Buttons with focus rings:</p>
              <div className="flex flex-wrap gap-4">
                <Button>Default Focus</Button>
                <Button variant="outline">Outline Focus</Button>
                <Button variant="ghost">Ghost Focus</Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-3">Input focus states:</p>
              <div className="flex flex-wrap gap-4">
                <Input className="w-48" placeholder="Focus me" />
                <Input className="w-48" placeholder="And me" />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-3">Card focus (tab to focus):</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card
                    key={i}
                    tabIndex={0}
                    className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <CardHeader>
                      <CardTitle className="text-base">Card {i}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Focusable card content</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* ARIA Labels & Roles */}
      <ShowcaseSection
        title="ARIA Labels & Roles"
        description="ARIA attributes for screen reader accessibility."
      >
        <CodeExample
          id="accessibility"
          title="ARIA Attributes"
          code={`// aria-label for icon buttons
<Button aria-label="Close dialog" size="icon">
  <X className="h-4 w-4" />
</Button>

// aria-hidden for decorative elements
<span aria-hidden="true">🎉</span>

// aria-describedby for additional context
<Input 
  aria-describedby="email-hint"
  aria-invalid={hasError}
/>
<p id="email-hint">We'll never share your email.</p>

// role for custom elements
<div role="alert">Error message</div>
<div role="status">Loading...</div>`}
        >
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium mb-2">Icon buttons with aria-label:</p>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" aria-label="Show information">
                  <Info className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" aria-label="Mark as complete">
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" aria-label="Show error details">
                  <AlertCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Decorative vs meaningful icons:</p>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                  <span>Success (icon is decorative)</span>
                </span>
                <span className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
                  <span>Error (icon is decorative)</span>
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Alert roles:</p>
              <div className="space-y-2">
                <div role="alert" className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                  This is an alert - screen readers announce this immediately
                </div>
                <div role="status" className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                  This is a status - politely announced by screen readers
                </div>
              </div>
            </div>
          </div>
        </CodeExample>

        <CodeExample
          id="accessibility"
          title="aria-live Regions"
          code={`// Polite announcements (waits for pause)
<div aria-live="polite" aria-atomic="true">
  {message}
</div>

// Assertive announcements (interrupts)
<div aria-live="assertive">
  {urgentMessage}
</div>`}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the button to update the live region (screen readers will announce):
            </p>
            <div className="flex gap-4 items-start">
              <Button
                onClick={() => setLiveMessage(`Message updated at ${new Date().toLocaleTimeString()}`)}
              >
                Update Live Region
              </Button>
              <div
                aria-live="polite"
                aria-atomic="true"
                className="p-3 bg-muted rounded-lg text-sm min-w-[200px]"
              >
                {liveMessage || 'Live region content will appear here'}
              </div>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Accessible Form */}
      <ShowcaseSection
        title="Accessible Form Example"
        description="Forms with proper labels, error handling, and ARIA attributes."
      >
        <CodeExample
          id="accessibility"
          title="Form with Error Handling"
          code={`<form onSubmit={handleSubmit}>
  <div>
    <Label htmlFor="email">Email</Label>
    <Input
      id="email"
      type="email"
      aria-describedby={errors.email ? "email-error" : undefined}
      aria-invalid={!!errors.email}
    />
    {errors.email && (
      <p id="email-error" role="alert" className="text-destructive">
        {errors.email}
      </p>
    )}
  </div>
</form>`}
        >
          <form onSubmit={validateForm} className="max-w-md space-y-4">
            <div className="space-y-2">
              <Label htmlFor="a11y-email">Email address</Label>
              <Input
                id="a11y-email"
                name="a11y-email"
                type="email"
                placeholder="you@example.com"
                aria-describedby={formErrors.email ? 'email-error' : 'email-hint'}
                aria-invalid={!!formErrors.email}
                className={formErrors.email ? 'border-destructive' : ''}
              />
              {formErrors.email ? (
                <p id="email-error" role="alert" className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {formErrors.email}
                </p>
              ) : (
                <p id="email-hint" className="text-sm text-muted-foreground">
                  We'll never share your email with anyone.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="a11y-password">Password</Label>
              <Input
                id="a11y-password"
                name="a11y-password"
                type="password"
                placeholder="••••••••"
                aria-describedby={formErrors.password ? 'password-error' : 'password-hint'}
                aria-invalid={!!formErrors.password}
                className={formErrors.password ? 'border-destructive' : ''}
              />
              {formErrors.password ? (
                <p id="password-error" role="alert" className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {formErrors.password}
                </p>
              ) : (
                <p id="password-hint" className="text-sm text-muted-foreground">
                  Must be at least 8 characters.
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="a11y-terms" />
              <Label htmlFor="a11y-terms" className="text-sm font-normal">
                I agree to the terms and conditions
              </Label>
            </div>
            <Button type="submit">Submit Form</Button>
          </form>
        </CodeExample>
      </ShowcaseSection>

      {/* Skip to Content */}
      <ShowcaseSection
        title="Skip to Content"
        description="Allow keyboard users to skip navigation and jump to main content."
      >
        <CodeExample
          id="accessibility"
          title="Skip Link"
          code={`// Usually placed at the very top of the page
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
             focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:border 
             focus:rounded-md focus:shadow-lg"
>
  Skip to main content
</a>

// Main content target
<main id="main-content" tabIndex={-1}>
  ...
</main>`}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The skip link below is only visible when focused. Press Tab to see it:
            </p>
            <div className="relative border rounded-lg p-4 min-h-[150px]">
              <button
                onClick={handleSkipToContent}
                className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:border focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                Skip to main content
              </button>
              <nav className="flex gap-4 mb-4 pb-4 border-b">
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Home</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">About</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
              </nav>
              <div
                ref={mainContentRef}
                tabIndex={-1}
                className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              >
                <h3 className="font-medium mb-2">Main Content</h3>
                <p className="text-sm text-muted-foreground">
                  This is the main content area. The skip link allows keyboard users to bypass navigation.
                </p>
              </div>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Screen Reader Only Text */}
      <ShowcaseSection
        title="Screen Reader Only Text"
        description="Visually hidden text that provides context for screen reader users."
      >
        <CodeExample
          id="accessibility"
          title="sr-only Class"
          code={`// Tailwind's sr-only class
<span className="sr-only">Open menu</span>

// Custom implementation
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

// Usage examples
<Button>
  <Menu className="h-4 w-4" />
  <span className="sr-only">Open navigation menu</span>
</Button>

<a href="/cart">
  <ShoppingCart />
  <span className="sr-only">Shopping cart, 3 items</span>
</a>`}
        >
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium mb-3">Icon-only buttons with sr-only text:</p>
              <div className="flex gap-2">
                <Button size="icon" variant="outline">
                  <Info className="h-4 w-4" />
                  <span className="sr-only">View information</span>
                </Button>
                <Button size="icon" variant="outline">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="sr-only">Mark as complete</span>
                </Button>
                <Button size="icon" variant="outline">
                  <AlertCircle className="h-4 w-4" />
                  <span className="sr-only">View warnings</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Screen readers will announce the hidden text for each button.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-3">Additional context for visual elements:</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-success" />
                  <span>Online</span>
                  <span className="sr-only">(user is currently online)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-destructive" />
                  <span>Offline</span>
                  <span className="sr-only">(user is currently offline)</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Tip:</strong> Use browser developer tools or a screen reader to verify that sr-only content is properly announced.
              </p>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default AccessibilityShowcasePage;

