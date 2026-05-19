import React, { useState, useMemo } from 'react';
import { Search, ArrowRight, Home, FileText, Users, Settings } from 'lucide-react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { useCommandPalette, type Command } from '@/shared/hooks';
import { CommandPalette } from '@/shared/ui/components/CommandPalette';


// Navigation command data for display in the showcase
const navigationCommandsData = [
  { id: 'dashboard', label: 'Go to Dashboard', path: '/dashboard', shortcut: 'G D' },
  { id: 'invoices', label: 'Go to Invoices', path: '/invoices', shortcut: 'G I' },
  { id: 'users', label: 'Go to Users', path: '/users', shortcut: 'G U' },
  { id: 'settings', label: 'Go to Settings', path: '/settings', shortcut: 'G S' },
];

const CommandPaletteNavigationShowcasePage: React.FC = () => {
  const [lastNavigation, setLastNavigation] = useState<string | null>(null);

  // Define navigation commands for the showcase
  const navigationCommands: Command[] = useMemo(() => [
    { id: 'dashboard', label: 'Go to Dashboard', group: 'Navigation', shortcut: 'G D', icon: <Home className="h-4 w-4" />, action: () => setLastNavigation('/dashboard') },
    { id: 'invoices', label: 'Go to Invoices', group: 'Navigation', shortcut: 'G I', icon: <FileText className="h-4 w-4" />, action: () => setLastNavigation('/invoices') },
    { id: 'users', label: 'Go to Users', group: 'Navigation', shortcut: 'G U', icon: <Users className="h-4 w-4" />, action: () => setLastNavigation('/users') },
    { id: 'settings', label: 'Go to Settings', group: 'Navigation', shortcut: 'G S', icon: <Settings className="h-4 w-4" />, action: () => setLastNavigation('/settings') },
    { id: 'showcase', label: 'Go to Showcase', group: 'Navigation', icon: <ArrowRight className="h-4 w-4" />, action: () => setLastNavigation('/showcase') },
    { id: 'colors', label: 'Go to Colors', group: 'Navigation', icon: <ArrowRight className="h-4 w-4" />, action: () => setLastNavigation('/showcase/colors') },
    { id: 'buttons', label: 'Go to Buttons', group: 'Navigation', icon: <ArrowRight className="h-4 w-4" />, action: () => setLastNavigation('/showcase/buttons') },
    { id: 'forms', label: 'Go to Forms', group: 'Navigation', icon: <ArrowRight className="h-4 w-4" />, action: () => setLastNavigation('/showcase/forms') },
  ], []);

  const palette = useCommandPalette({
    initialCommands: navigationCommands,
    onExecute: () => {
      setTimeout(() => setLastNavigation(null), 3000);
    },
  });

  return (
    <ShowcasePage
      title="Navigation Commands"
      description="Use the command palette to quickly navigate to any page in the application."
    >
      <CommandPalette
        open={palette.isOpen}
        onOpenChange={(open) => open ? palette.open() : palette.close()}
        commands={palette.commands}
        groupedCommands={palette.groupedCommands}
        onSelect={(cmd) => palette.execute(cmd.id)}
        placeholder="Search pages to navigate..."
      />

      {/* Feedback Toast */}
      {lastNavigation && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 fade-in-0 duration-300">
          <div className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg shadow-lg">
            <ArrowRight className="h-4 w-4" />
            <span className="text-sm font-medium">Would navigate to: {lastNavigation}</span>
          </div>
        </div>
      )}

      <ShowcaseSection
        title="Navigation Palette"
        description="Open the palette and type to filter available pages."
      >
        <CodeExample
          id="command-palette"
          title="Navigation Commands"
          code={`const palette = useCommandPalette({ initialCommands: navigationCommands });

<CommandPalette
  open={palette.isOpen}
  onOpenChange={(open) => open ? palette.open() : palette.close()}
  commands={palette.commands}
  groupedCommands={palette.groupedCommands}
  onSelect={(cmd) => palette.execute(cmd.id)}
  placeholder="Search pages to navigate..."
/>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Try Navigation</CardTitle>
              <p className="text-sm text-muted-foreground">
                Open the palette and type to filter pages
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => palette.open()} className="gap-2">
                <Search className="h-4 w-4" />
                Open Navigation Palette
                <kbd className="ml-2 px-1.5 py-0.5 bg-primary-foreground/20 rounded text-xs">⌘K</kbd>
              </Button>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Available Pages</h4>
                <div className="grid grid-cols-2 gap-2">
                  {navigationCommandsData.map((cmd) => (
                    <div key={cmd.id} className="flex items-center justify-between p-2 bg-background rounded border">
                      <div className="flex items-center gap-2 text-sm">
                        <ArrowRight className="h-4 w-4" />
                        {cmd.label.replace('Go to ', '')}
                      </div>
                      {cmd.shortcut && (
                        <kbd className="text-xs px-1.5 py-0.5 bg-muted rounded">{cmd.shortcut}</kbd>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Text Highlighting"
        description="Matched text is highlighted as you type to help identify results."
      >
        <CodeExample
          id="command-palette"
          title="Match Highlighting"
          code={`import { HighlightedText } from '@/shared/ui/components/HighlightedText';

<HighlightedText
  text={command.label}
  query={searchQuery}
  markClassName="bg-yellow-200 text-yellow-900 rounded px-0.5"
/>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Highlight Example</CardTitle>
              <p className="text-sm text-muted-foreground">
                Type "dash" in the palette to see highlighting
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-3 border rounded-lg">
                  <p className="text-sm">
                    Search: <span className="font-mono bg-muted px-1 rounded">dash</span>
                  </p>
                  <p className="text-sm mt-2">
                    Result: Go to <mark className="bg-yellow-200 text-yellow-900 rounded px-0.5">Dash</mark>board
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-sm">
                    Search: <span className="font-mono bg-muted px-1 rounded">set</span>
                  </p>
                  <p className="text-sm mt-2">
                    Result: Go to <mark className="bg-yellow-200 text-yellow-900 rounded px-0.5">Set</mark>tings
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default CommandPaletteNavigationShowcasePage;
