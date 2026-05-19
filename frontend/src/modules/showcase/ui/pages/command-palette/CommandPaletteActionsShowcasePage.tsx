import React, { useState, useMemo } from 'react';
import { Command as CommandIcon, Plus, Moon, Sun, HelpCircle, CheckCircle, Ban } from 'lucide-react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { cn } from '@/shadcn/lib/utils';
import { useCommandPalette, type Command } from '@/shared/hooks';
import { CommandPalette } from '@/shared/ui/components/CommandPalette';


const CommandPaletteActionsShowcasePage: React.FC = () => {
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Define action commands for the showcase
  const actionCommands: Command[] = useMemo(() => [
    { id: 'create-invoice', label: 'Create Invoice', keywords: ['Create a new invoice'], group: 'Actions', shortcut: 'C I', icon: <Plus className="h-4 w-4" />, action: () => {} },
    { id: 'create-user', label: 'Create User', keywords: ['Add a new user'], group: 'Actions', shortcut: 'C U', icon: <Plus className="h-4 w-4" />, action: () => {} },
    { id: 'toggle-theme', label: 'Toggle Theme', keywords: ['Switch between light and dark mode'], group: 'Actions', shortcut: 'T T', icon: <Moon className="h-4 w-4" />, action: () => setIsDarkMode((prev) => !prev) },
    { id: 'open-help', label: 'Open Help', keywords: ['View documentation'], group: 'Actions', shortcut: '?', icon: <HelpCircle className="h-4 w-4" />, action: () => {} },
    { id: 'disabled-action', label: 'Disabled Action', keywords: ['This action is not available'], group: 'Actions', icon: <Ban className="h-4 w-4" />, disabled: true, action: () => {} },
  ], []);

  const palette = useCommandPalette({
    initialCommands: actionCommands,
    onExecute: (cmd) => {
      if (cmd.id === 'toggle-theme') {
        setLastAction(`Theme toggled to ${isDarkMode ? 'light' : 'dark'} mode`);
      } else {
        setLastAction(`Executed: ${cmd.label}`);
      }
      setTimeout(() => setLastAction(null), 3000);
    },
  });

  return (
    <ShowcasePage
      title="Action Commands"
      description="Use the command palette to quickly execute actions like creating items, toggling settings, or opening modals."
    >
      <CommandPalette
        open={palette.isOpen}
        onOpenChange={(open) => open ? palette.open() : palette.close()}
        commands={palette.commands}
        groupedCommands={palette.groupedCommands}
        onSelect={(cmd) => palette.execute(cmd.id)}
        placeholder="Search actions..."
      />

      {/* Feedback Toast */}
      {lastAction && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 fade-in-0 duration-300">
          <div className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg shadow-lg">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{lastAction}</span>
          </div>
        </div>
      )}

      <ShowcaseSection
        title="Action Palette"
        description="Execute actions directly from the command palette."
      >
        <CodeExample
          id="command-palette"
          title="Action Commands"
          code={`const actionCommands = [
  { id: 'create-invoice', label: 'Create Invoice', shortcut: 'C I' },
  { id: 'toggle-theme', label: 'Toggle Theme', shortcut: 'T T' },
  { id: 'open-help', label: 'Open Help', shortcut: '?' },
  { id: 'disabled-action', label: 'Disabled Action', disabled: true },
];

const handleAction = (action: ActionCommand) => {
  switch (action.id) {
    case 'create-invoice':
      openCreateInvoiceModal();
      break;
    case 'toggle-theme':
      setIsDarkMode(prev => !prev);
      break;
    case 'open-help':
      window.open('/help', '_blank');
      break;
  }
  showToast(\`Executed: \${action.label}\`);
};`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Try Actions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Open the palette and execute an action
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => palette.open()} className="gap-2">
                <CommandIcon className="h-4 w-4" />
                Open Action Palette
                <kbd className="ml-2 px-1.5 py-0.5 bg-primary-foreground/20 rounded text-xs">⌘K</kbd>
              </Button>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Available Actions</h4>
                <div className="space-y-2">
                  {actionCommands.map((cmd) => (
                    <div
                      key={cmd.id}
                      className={cn(
                        "flex items-center justify-between p-2 bg-background rounded border",
                        cmd.disabled && "opacity-50"
                      )}
                    >
                      <div className="flex items-center gap-2 text-sm">
                        {cmd.icon}
                        <div>
                          <span>{cmd.label}</span>
                          {cmd.keywords && cmd.keywords.length > 0 && (
                            <p className="text-xs text-muted-foreground">{cmd.keywords[0]}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {cmd.disabled && <Badge variant="secondary">Disabled</Badge>}
                        {cmd.shortcut && !cmd.disabled && (
                          <kbd className="text-xs px-1.5 py-0.5 bg-muted rounded">{cmd.shortcut}</kbd>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Confirmation Feedback"
        description="Actions provide immediate feedback via toast notifications."
      >
        <CodeExample
          id="command-palette"
          title="Action Feedback"
          code={`const handleAction = (action: ActionCommand) => {
  // Execute the action
  executeAction(action);
  
  // Show confirmation toast
  showToast({
    message: \`Executed: \${action.label}\`,
    type: 'success',
    duration: 3000,
  });
};

// Toast component
{lastAction && (
  <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2">
    <div className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg">
      <CheckCircle className="h-4 w-4" />
      <span>{lastAction}</span>
    </div>
  </div>
)}`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Feedback Examples</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                onClick={() => {
                  setLastAction('Invoice created successfully');
                  setTimeout(() => setLastAction(null), 3000);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Simulate Create Invoice
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setIsDarkMode((prev) => !prev);
                  setLastAction(`Theme toggled to ${isDarkMode ? 'light' : 'dark'} mode`);
                  setTimeout(() => setLastAction(null), 3000);
                }}
              >
                {isDarkMode ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                Toggle Theme (Demo)
              </Button>

              <div className="p-3 bg-muted/50 rounded-lg text-sm">
                <p>Current theme mode: <strong>{isDarkMode ? 'Dark' : 'Light'}</strong></p>
                <p className="text-xs text-muted-foreground mt-1">
                  (This is a demo toggle, not affecting the actual theme)
                </p>
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Disabled Commands"
        description="Some commands can be disabled based on permissions or context."
      >
        <CodeExample
          id="command-palette"
          title="Disabled State"
          code={`const actionCommands = [
  { id: 'normal', label: 'Normal Action', disabled: false },
  { id: 'disabled', label: 'Disabled Action', disabled: true },
];

// Render with disabled state
<button
  disabled={cmd.disabled}
  className={cn(
    'w-full flex items-center px-2 py-2 rounded-md',
    cmd.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted'
  )}
>
  {cmd.label}
  {cmd.disabled && <Badge variant="secondary">Disabled</Badge>}
</button>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Disabled Commands</CardTitle>
              <p className="text-sm text-muted-foreground">
                Disabled commands are visible but not selectable
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">Create Invoice</span>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
                  <div className="flex items-center gap-2">
                    <Ban className="h-4 w-4" />
                    <span className="text-sm">Delete All Data</span>
                  </div>
                  <Badge variant="secondary">Disabled</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Disabled commands show why they're unavailable (e.g., permissions, context)
              </p>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default CommandPaletteActionsShowcasePage;
