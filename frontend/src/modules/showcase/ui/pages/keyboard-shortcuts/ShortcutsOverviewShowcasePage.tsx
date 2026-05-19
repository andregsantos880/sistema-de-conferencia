import React, { useState } from 'react';
import { Command, Keyboard, HelpCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { useKeyboardShortcut, useToggle } from '@/shared/hooks';

interface Shortcut {
  keys: string[];
  description: string;
  scope: 'global' | 'page' | 'component';
}

const globalShortcuts: Shortcut[] = [
  { keys: ['⌘', 'K'], description: 'Open Command Palette', scope: 'global' },
  { keys: ['?'], description: 'Open Shortcuts Help', scope: 'global' },
  { keys: ['Esc'], description: 'Close Modal / Cancel', scope: 'global' },
  { keys: ['⌘', 'S'], description: 'Save Current Form', scope: 'global' },
];

const ShortcutsOverviewShowcasePage: React.FC = () => {
  const [lastTriggered, setLastTriggered] = useState<string | null>(null);
  const { value: showHelp, toggle: toggleHelp, off: closeHelp } = useToggle(false);

  useKeyboardShortcut(
    { key: '?' },
    () => {
      toggleHelp();
      setLastTriggered('Shortcuts Help toggled');
      setTimeout(() => setLastTriggered(null), 2000);
    },
    { ignoreInputs: true }
  );

  return (
    <ShowcasePage
      title="Keyboard Shortcuts Overview"
      description="Learn how Katalyst supports keyboard-driven workflows for power users."
    >
      {/* Feedback Toast */}
      {lastTriggered && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 fade-in-0 duration-300">
          <div className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg shadow-lg">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{lastTriggered}</span>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => closeHelp()}
        >
          <div className="fixed inset-0 bg-black/50 animate-in fade-in-0 duration-150" />
          <div
            className="relative w-full max-w-md bg-background border rounded-lg shadow-2xl p-6 animate-in fade-in-0 zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-4">
              <Keyboard className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
            </div>
            <div className="space-y-2">
              {globalShortcuts.map((shortcut, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <span className="text-sm">{shortcut.description}</span>
                  <div className="flex gap-1">
                    {shortcut.keys.map((key, i) => (
                      <kbd key={i} className="px-2 py-1 bg-muted rounded text-xs font-mono">
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" onClick={() => closeHelp()}>
              Close
            </Button>
          </div>
        </div>
      )}

      <ShowcaseSection
        title="Why Keyboard Shortcuts?"
        description="Keyboard shortcuts enable power users to work faster and more efficiently."
      >
        <CodeExample
          id="keyboard-shortcuts"
          title="Benefits of Keyboard Shortcuts"
          code={`// Keyboard shortcuts provide:
// 1. Speed - No mouse movement required
// 2. Efficiency - Common actions at your fingertips
// 3. Accessibility - Alternative input method
// 4. Power user experience - Professional workflow

// Example: Global shortcut listener
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openCommandPalette();
    }
    if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      toggleShortcutsHelp();
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Power User Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Speed</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Execute actions instantly without reaching for the mouse
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Efficiency</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Common actions available at your fingertips
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Accessibility</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Alternative input method for all users
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Professional</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Matches expectations of power users
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Global Shortcuts"
        description="These shortcuts work anywhere in the application."
      >
        <CodeExample
          id="keyboard-shortcuts"
          title="Global Shortcut Registry"
          code={`const globalShortcuts: Shortcut[] = [
  { keys: ['⌘', 'K'], description: 'Open Command Palette', scope: 'global' },
  { keys: ['?'], description: 'Open Shortcuts Help', scope: 'global' },
  { keys: ['Esc'], description: 'Close Modal / Cancel', scope: 'global' },
  { keys: ['⌘', 'S'], description: 'Save Current Form', scope: 'global' },
];

// Render shortcut hints
<div className="flex gap-1">
  {shortcut.keys.map((key, i) => (
    <kbd key={i} className="px-2 py-1 bg-muted rounded text-xs font-mono">
      {key}
    </kbd>
  ))}
</div>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Common Global Shortcuts</CardTitle>
              <p className="text-sm text-muted-foreground">
                Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">?</kbd> to toggle the shortcuts help modal
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {globalShortcuts.map((shortcut, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">{shortcut.scope}</Badge>
                      <span className="text-sm">{shortcut.description}</span>
                    </div>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, i) => (
                        <kbd key={i} className="px-2 py-1 bg-muted rounded text-xs font-mono">
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Visual Hints"
        description="Shortcuts are discoverable through visual hints in the UI."
      >
        <CodeExample
          id="keyboard-shortcuts"
          title="Shortcut Hints in UI"
          code={`// Button with shortcut hint
<Button>
  <Command className="h-4 w-4 mr-2" />
  Command Palette
  <kbd className="ml-2 px-1.5 py-0.5 bg-primary-foreground/20 rounded text-xs">
    ⌘K
  </kbd>
</Button>

// Tooltip with shortcut
<Tooltip content="Save (⌘S)">
  <Button>Save</Button>
</Tooltip>

// Menu item with shortcut
<DropdownMenuItem>
  <span>New File</span>
  <kbd className="ml-auto text-xs">⌘N</kbd>
</DropdownMenuItem>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Shortcut Hints Examples</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Button with Shortcut</p>
                <Button className="gap-2">
                  <Command className="h-4 w-4" />
                  Command Palette
                  <kbd className="ml-2 px-1.5 py-0.5 bg-primary-foreground/20 rounded text-xs">⌘K</kbd>
                </Button>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Help Button</p>
                <Button variant="outline" className="gap-2" onClick={() => toggleHelp()}>
                  <HelpCircle className="h-4 w-4" />
                  Shortcuts Help
                  <kbd className="ml-2 px-1.5 py-0.5 bg-muted rounded text-xs">?</kbd>
                </Button>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Menu-style Items</p>
                <div className="border rounded-lg divide-y">
                  <div className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer">
                    <span className="text-sm">New File</span>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘N</kbd>
                  </div>
                  <div className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer">
                    <span className="text-sm">Save</span>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘S</kbd>
                  </div>
                  <div className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer">
                    <span className="text-sm">Close</span>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘W</kbd>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default ShortcutsOverviewShowcasePage;
