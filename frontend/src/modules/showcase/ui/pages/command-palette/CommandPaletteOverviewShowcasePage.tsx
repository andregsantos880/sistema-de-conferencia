import React, { useState, useMemo } from 'react';
import { ArrowRight, Command as CommandIcon } from 'lucide-react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { useCommandPalette, type Command } from '@/shared/hooks';
import { CommandPalette } from '@/shared/ui/components/CommandPalette';

const CommandPaletteOverviewShowcasePage: React.FC = () => {
  const [lastCommand, setLastCommand] = useState<string | null>(null);

  // Define commands for the showcase
  const commands: Command[] = useMemo(() => [
    { id: 'dashboard', label: 'Go to Dashboard', group: 'Navigation', shortcut: 'G D', icon: <ArrowRight className="h-4 w-4" />, action: () => {} },
    { id: 'invoices', label: 'Go to Invoices', group: 'Navigation', shortcut: 'G I', icon: <ArrowRight className="h-4 w-4" />, action: () => {} },
    { id: 'users', label: 'Go to Users', group: 'Navigation', shortcut: 'G U', icon: <ArrowRight className="h-4 w-4" />, action: () => {} },
    { id: 'settings', label: 'Go to Settings', group: 'Navigation', shortcut: 'G S', icon: <ArrowRight className="h-4 w-4" />, action: () => {} },
    { id: 'create-invoice', label: 'Create Invoice', group: 'Actions', shortcut: 'C I', icon: <CommandIcon className="h-4 w-4" />, action: () => {} },
    { id: 'toggle-theme', label: 'Toggle Theme', group: 'Actions', shortcut: 'T T', icon: <CommandIcon className="h-4 w-4" />, action: () => {} },
    { id: 'open-help', label: 'Open Help', group: 'Actions', shortcut: '?', icon: <CommandIcon className="h-4 w-4" />, action: () => {} },
  ], []);

  const palette = useCommandPalette({
    initialCommands: commands,
    onExecute: (cmd) => {
      setLastCommand(cmd.label);
      setTimeout(() => setLastCommand(null), 3000);
    },
  });

  return (
    <ShowcasePage
      title="Command Palette Overview"
      description="A keyboard-driven command palette for fast navigation and actions, similar to modern SaaS apps."
    >
      <CommandPalette
        open={palette.isOpen}
        onOpenChange={(open) => open ? palette.open() : palette.close()}
        commands={palette.commands}
        groupedCommands={palette.groupedCommands}
        onSelect={(cmd) => palette.execute(cmd.id)}
      />

      {/* Feedback Toast */}
      {lastCommand && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 fade-in-0 duration-300">
          <div className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg shadow-lg">
            <CommandIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Executed: {lastCommand}</span>
          </div>
        </div>
      )}

      <ShowcaseSection
        title="Opening the Command Palette"
        description="The command palette can be opened via keyboard shortcut or button."
      >
        <CodeExample
          id="command-palette"
          title="Keyboard Trigger"
          code={`import { useCommandPalette, type Command } from '@/shared/hooks';
import { CommandPalette } from '@/shared/ui/components/CommandPalette';

// Define commands
const commands: Command[] = [
  { id: 'dashboard', label: 'Go to Dashboard', group: 'Navigation', action: () => navigate('/dashboard') },
  { id: 'settings', label: 'Go to Settings', group: 'Navigation', action: () => navigate('/settings') },
  { id: 'create', label: 'Create Invoice', group: 'Actions', action: () => openCreateModal() },
];

// Hook handles Cmd/Ctrl+K automatically
const palette = useCommandPalette({
  initialCommands: commands,
  onExecute: (cmd) => console.log('Executed:', cmd.label),
});

// Render
<CommandPalette
  open={palette.isOpen}
  onOpenChange={(open) => open ? palette.open() : palette.close()}
  commands={palette.commands}
  groupedCommands={palette.groupedCommands}
  onSelect={(cmd) => palette.execute(cmd.id)}
/>

<Button onClick={() => palette.open()}>
  <Command className="h-4 w-4 mr-2" />
  Open Command Palette
  <kbd className="ml-2 text-xs">⌘K</kbd>
</Button>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Try It</CardTitle>
              <p className="text-sm text-muted-foreground">
                Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">⌘K</kbd> (Mac) or{' '}
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Ctrl+K</kbd> (Windows/Linux) to open
              </p>
            </CardHeader>
            <CardContent>
              <Button onClick={() => palette.open()} className="gap-2">
                <CommandIcon className="h-4 w-4" />
                Open Command Palette
                <Badge variant="secondary" className="ml-2 text-xs">⌘K</Badge>
              </Button>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Keyboard Navigation"
        description="Navigate through commands using keyboard only."
      >
        <CodeExample
          id="command-palette"
          title="Keyboard Controls"
          code={`const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    setActiveIndex(prev => Math.min(prev + 1, commands.length - 1));
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    setActiveIndex(prev => Math.max(prev - 1, 0));
  } else if (e.key === 'Enter') {
    e.preventDefault();
    onSelect?.(commands[activeIndex]);
    onClose();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    onClose();
  }
};`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Keyboard Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex gap-1">
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">↑</kbd>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">↓</kbd>
                  </div>
                  <span className="text-sm">Navigate commands</span>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd>
                  <span className="text-sm">Execute command</span>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd>
                  <span className="text-sm">Close palette</span>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <span className="text-sm text-muted-foreground">Type to filter</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Grouped Commands"
        description="Commands are organized into logical groups for easier discovery."
      >
        <CodeExample
          id="command-palette"
          title="Command Groups"
          code={`const commands: CommandItem[] = [
  // Navigation group
  { id: 'dashboard', label: 'Go to Dashboard', group: 'navigation', shortcut: 'G D' },
  { id: 'invoices', label: 'Go to Invoices', group: 'navigation', shortcut: 'G I' },
  { id: 'users', label: 'Go to Users', group: 'navigation', shortcut: 'G U' },
  
  // Actions group
  { id: 'create-invoice', label: 'Create Invoice', group: 'actions', shortcut: 'C I' },
  { id: 'toggle-theme', label: 'Toggle Theme', group: 'actions', shortcut: 'T T' },
];

// Render groups separately
const navigationCommands = commands.filter(c => c.group === 'navigation');
const actionCommands = commands.filter(c => c.group === 'actions');

<div>
  <div className="text-xs font-medium text-muted-foreground">Navigation</div>
  {navigationCommands.map(cmd => <CommandItem key={cmd.id} {...cmd} />)}
  
  <div className="text-xs font-medium text-muted-foreground">Actions</div>
  {actionCommands.map(cmd => <CommandItem key={cmd.id} {...cmd} />)}
</div>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Available Command Groups</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Navigation</h4>
                <div className="space-y-1">
                  {commands.filter(c => c.group === 'Navigation').map(cmd => (
                    <div key={cmd.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm">{cmd.label}</span>
                      {cmd.shortcut && (
                        <kbd className="text-xs px-1.5 py-0.5 bg-background rounded">{cmd.shortcut}</kbd>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Actions</h4>
                <div className="space-y-1">
                  {commands.filter(c => c.group === 'Actions').map(cmd => (
                    <div key={cmd.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm">{cmd.label}</span>
                      {cmd.shortcut && (
                        <kbd className="text-xs px-1.5 py-0.5 bg-background rounded">{cmd.shortcut}</kbd>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default CommandPaletteOverviewShowcasePage;
