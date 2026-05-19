import React, { useState, useEffect } from 'react';
import { Home, FileText, Users, Settings, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { cn } from '@/shadcn/lib/utils';

interface NavigationShortcut {
  keys: string[];
  description: string;
  path: string;
  icon: React.ReactNode;
  disabled?: boolean;
  disabledReason?: string;
}

const navigationShortcuts: NavigationShortcut[] = [
  { keys: ['G', 'D'], description: 'Go to Dashboard', path: '/dashboard', icon: <Home className="h-4 w-4" /> },
  { keys: ['G', 'I'], description: 'Go to Invoices', path: '/invoices', icon: <FileText className="h-4 w-4" /> },
  { keys: ['G', 'U'], description: 'Go to Users', path: '/users', icon: <Users className="h-4 w-4" /> },
  { keys: ['G', 'S'], description: 'Go to Settings', path: '/settings', icon: <Settings className="h-4 w-4" /> },
  { keys: ['G', 'A'], description: 'Go to Admin', path: '/admin', icon: <Settings className="h-4 w-4" />, disabled: true, disabledReason: 'Requires admin role' },
];

const ShortcutsNavigationShowcasePage: React.FC = () => {
  const [lastNavigation, setLastNavigation] = useState<string | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toUpperCase();

      if (pendingKey === 'G') {
        e.preventDefault();
        const shortcut = navigationShortcuts.find((s) => s.keys[1] === key);
        if (shortcut && !shortcut.disabled) {
          setActiveShortcut(shortcut.keys.join(' '));
          setLastNavigation(`Would navigate to: ${shortcut.path}`);
          setTimeout(() => {
            setLastNavigation(null);
            setActiveShortcut(null);
          }, 2000);
        }
        setPendingKey(null);
      } else if (key === 'G') {
        e.preventDefault();
        setPendingKey('G');
        setTimeout(() => setPendingKey(null), 1500);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [pendingKey]);

  return (
    <ShowcasePage
      title="Navigation Shortcuts"
      description="Use keyboard shortcuts to quickly navigate between pages."
    >
      {/* Pending Key Indicator */}
      {pendingKey && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in-0 duration-200">
          <div className="flex items-center gap-2 px-4 py-2 bg-muted border rounded-lg shadow-lg">
            <span className="text-sm text-muted-foreground">Waiting for next key...</span>
            <kbd className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-mono">
              {pendingKey}
            </kbd>
          </div>
        </div>
      )}

      {/* Feedback Toast */}
      {lastNavigation && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 fade-in-0 duration-300">
          <div className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg shadow-lg">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{lastNavigation}</span>
          </div>
        </div>
      )}

      <ShowcaseSection
        title="Navigation Shortcuts"
        description="Press G followed by a letter to navigate to different pages."
      >
        <CodeExample
          id="keyboard-shortcuts"
          title="Go-to Navigation Pattern"
          code={`const [pendingKey, setPendingKey] = useState<string | null>(null);

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Skip if user is typing in an input
    if (e.target instanceof HTMLInputElement) return;

    const key = e.key.toUpperCase();

    if (pendingKey === 'G') {
      e.preventDefault();
      const shortcut = navigationShortcuts.find(s => s.keys[1] === key);
      if (shortcut && !shortcut.disabled) {
        navigate(shortcut.path);
      }
      setPendingKey(null);
    } else if (key === 'G') {
      e.preventDefault();
      setPendingKey('G');
      // Auto-clear after timeout
      setTimeout(() => setPendingKey(null), 1500);
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [pendingKey]);`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Try Navigation Shortcuts</CardTitle>
              <p className="text-sm text-muted-foreground">
                Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">G</kbd> then a letter to navigate
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {navigationShortcuts.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center justify-between p-3 border rounded-lg transition-all",
                      shortcut.disabled && "opacity-50",
                      activeShortcut === shortcut.keys.join(' ') && "ring-2 ring-primary bg-primary/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {shortcut.icon}
                      <div>
                        <span className="text-sm font-medium">{shortcut.description}</span>
                        <p className="text-xs text-muted-foreground">{shortcut.path}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {shortcut.disabled && (
                        <Badge variant="secondary" className="text-xs">Disabled</Badge>
                      )}
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, i) => (
                          <kbd key={i} className="px-2 py-1 bg-muted rounded text-xs font-mono">
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Active Shortcut Indicator"
        description="Visual feedback shows which shortcut is being triggered."
      >
        <CodeExample
          id="keyboard-shortcuts"
          title="Visual Feedback"
          code={`// Pending key indicator
{pendingKey && (
  <div className="fixed top-4 right-4 z-50">
    <div className="flex items-center gap-2 px-4 py-2 bg-muted border rounded-lg">
      <span className="text-sm">Waiting for next key...</span>
      <kbd className="px-2 py-1 bg-primary text-primary-foreground rounded">
        {pendingKey}
      </kbd>
    </div>
  </div>
)}

// Active shortcut highlight
<div className={cn(
  "p-3 border rounded-lg transition-all",
  activeShortcut === shortcut.keys.join(' ') && "ring-2 ring-primary bg-primary/5"
)}>
  {/* shortcut content */}
</div>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Feedback States</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Pending Key State</p>
                <div className="flex items-center gap-2 px-4 py-2 bg-muted border rounded-lg w-fit">
                  <span className="text-sm text-muted-foreground">Waiting for next key...</span>
                  <kbd className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-mono">
                    G
                  </kbd>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Active Shortcut Highlight</p>
                <div className="p-3 border rounded-lg ring-2 ring-primary bg-primary/5">
                  <div className="flex items-center gap-3">
                    <Home className="h-4 w-4" />
                    <span className="text-sm">Go to Dashboard</span>
                    <ArrowRight className="h-4 w-4 text-primary ml-auto" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Conflict Handling"
        description="Some shortcuts may be disabled based on permissions or context."
      >
        <CodeExample
          id="keyboard-shortcuts"
          title="Disabled Shortcuts"
          code={`const navigationShortcuts = [
  { keys: ['G', 'D'], description: 'Go to Dashboard', disabled: false },
  { keys: ['G', 'A'], description: 'Go to Admin', disabled: true, disabledReason: 'Requires admin role' },
];

// Skip disabled shortcuts
if (shortcut && !shortcut.disabled) {
  navigate(shortcut.path);
}

// Render with disabled state
<div className={cn(
  "p-3 border rounded-lg",
  shortcut.disabled && "opacity-50"
)}>
  {shortcut.disabled && (
    <Badge variant="secondary">Disabled</Badge>
  )}
</div>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Disabled Shortcut Example</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-lg opacity-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="h-4 w-4" />
                    <div>
                      <span className="text-sm font-medium">Go to Admin</span>
                      <p className="text-xs text-muted-foreground">/admin</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Disabled</Badge>
                    <div className="flex gap-1">
                      <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">G</kbd>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">A</kbd>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                  <AlertCircle className="h-3 w-3" />
                  <span>Requires admin role</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default ShortcutsNavigationShowcasePage;
