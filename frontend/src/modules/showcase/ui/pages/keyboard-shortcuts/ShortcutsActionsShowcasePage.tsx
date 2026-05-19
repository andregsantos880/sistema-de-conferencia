import React, { useState } from 'react';
import { Plus, Save, X, CheckCircle, Trash2, Copy } from 'lucide-react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { cn } from '@/shadcn/lib/utils';
import { useKeyboardShortcut, useToggle } from '@/shared/hooks';

interface ActionShortcut {
  keys: string[];
  description: string;
  action: string;
  icon: React.ReactNode;
}

const actionShortcuts: ActionShortcut[] = [
  { keys: ['⌘', 'N'], description: 'Create New Item', action: 'create', icon: <Plus className="h-4 w-4" /> },
  { keys: ['⌘', 'S'], description: 'Save Form', action: 'save', icon: <Save className="h-4 w-4" /> },
  { keys: ['Esc'], description: 'Cancel / Close Modal', action: 'cancel', icon: <X className="h-4 w-4" /> },
  { keys: ['⌘', 'C'], description: 'Copy Selected', action: 'copy', icon: <Copy className="h-4 w-4" /> },
  { keys: ['⌘', 'Backspace'], description: 'Delete Selected', action: 'delete', icon: <Trash2 className="h-4 w-4" /> },
];

const ShortcutsActionsShowcasePage: React.FC = () => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [formValue, setFormValue] = useState('Sample form data');
  const { value: showModal, on: openModal, off: closeModal } = useToggle(false);
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null);

  const showFeedback = (message: string, shortcutKeys?: string[]) => {
    setFeedback(message);
    if (shortcutKeys) {
      setActiveShortcut(shortcutKeys.join(' '));
    }
    setTimeout(() => {
      setFeedback(null);
      setActiveShortcut(null);
    }, 2000);
  };

  useKeyboardShortcut(
    { key: 'n', ctrl: true },
    () => showFeedback('New item created!', ['⌘', 'N'])
  );

  useKeyboardShortcut(
    { key: 's', ctrl: true },
    () => showFeedback(`Form saved: "${formValue}"`, ['⌘', 'S'])
  );

  useKeyboardShortcut(
    { key: 'Escape' },
    () => {
      if (showModal) {
        closeModal();
        showFeedback('Modal closed', ['Esc']);
      }
    },
    { enabled: showModal }
  );

  return (
    <ShowcasePage
      title="Action Shortcuts"
      description="Use keyboard shortcuts to quickly execute common actions."
    >
      {/* Feedback Toast */}
      {feedback && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 fade-in-0 duration-300">
          <div className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg shadow-lg">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{feedback}</span>
          </div>
        </div>
      )}

      {/* Demo Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => closeModal()}
        >
          <div className="fixed inset-0 bg-black/50 animate-in fade-in-0 duration-150" />
          <div
            className="relative w-full max-w-md bg-background border rounded-lg shadow-2xl p-6 animate-in fade-in-0 zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Demo Modal</h2>
              <button
                onClick={() => closeModal()}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Esc</kbd> to close this modal
            </p>
            <Button onClick={() => closeModal()}>Close</Button>
          </div>
        </div>
      )}

      <ShowcaseSection
        title="Action Shortcuts"
        description="Common actions can be triggered via keyboard shortcuts."
      >
        <CodeExample
          id="keyboard-shortcuts"
          title="Action Shortcut Handlers"
          code={`useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
      e.preventDefault();
      createNewItem();
      showFeedback('New item created!');
    } else if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      saveForm();
      showFeedback('Form saved!');
    } else if (e.key === 'Escape') {
      if (showModal) {
        setShowModal(false);
        showFeedback('Modal closed');
      }
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [showModal]);`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Available Action Shortcuts</CardTitle>
              <p className="text-sm text-muted-foreground">
                Try pressing these shortcuts to see feedback
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {actionShortcuts.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center justify-between p-3 border rounded-lg transition-all",
                      activeShortcut === shortcut.keys.join(' ') && "ring-2 ring-primary bg-primary/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {shortcut.icon}
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
        title="Save Form Shortcut"
        description="Press ⌘S to save the form data."
      >
        <CodeExample
          id="keyboard-shortcuts"
          title="Form Save Shortcut"
          code={`// Save form with ⌘S
if ((e.metaKey || e.ctrlKey) && e.key === 's') {
  e.preventDefault(); // Prevent browser save dialog
  saveForm();
  showFeedback(\`Form saved: "\${formValue}"\`);
}

// Form with save shortcut hint
<div className="relative">
  <Input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
  <div className="absolute right-2 top-1/2 -translate-y-1/2">
    <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘S</kbd>
  </div>
</div>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Try Save Shortcut</CardTitle>
              <p className="text-sm text-muted-foreground">
                Edit the input and press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘S</kbd> to save
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  placeholder="Enter some text..."
                  className="pr-12"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘S</kbd>
                </div>
              </div>
              <Button
                onClick={() => showFeedback(`Form saved: "${formValue}"`, ['⌘', 'S'])}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save
                <Badge variant="secondary" className="ml-1 text-xs">⌘S</Badge>
              </Button>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Cancel / Close Modal"
        description="Press Escape to close modals and cancel actions."
      >
        <CodeExample
          id="keyboard-shortcuts"
          title="Escape to Close"
          code={`// Close modal with Escape
if (e.key === 'Escape') {
  if (showModal) {
    setShowModal(false);
    showFeedback('Modal closed');
  }
}

// Modal with escape hint
<Dialog open={showModal} onOpenChange={setShowModal}>
  <DialogContent>
    <p>Press <kbd>Esc</kbd> to close</p>
    <Button onClick={() => closeModal()}>Close</Button>
  </DialogContent>
</Dialog>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Try Escape Shortcut</CardTitle>
              <p className="text-sm text-muted-foreground">
                Open the modal and press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Esc</kbd> to close
              </p>
            </CardHeader>
            <CardContent>
              <Button onClick={() => openModal()} className="gap-2">
                Open Modal
              </Button>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Feedback Patterns"
        description="Provide clear feedback when shortcuts are triggered."
      >
        <CodeExample
          id="keyboard-shortcuts"
          title="Shortcut Feedback"
          code={`const showFeedback = (message: string) => {
  setFeedback(message);
  setTimeout(() => setFeedback(null), 2000);
};

// Toast notification
{feedback && (
  <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2">
    <div className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg">
      <CheckCircle className="h-4 w-4" />
      <span>{feedback}</span>
    </div>
  </div>
)}

// Inline feedback
<div className="flex items-center gap-2 text-green-600">
  <CheckCircle className="h-4 w-4" />
  <span>Saved!</span>
</div>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Feedback Examples</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Toast Notification</p>
                <Button
                  variant="outline"
                  onClick={() => showFeedback('Action completed successfully!')}
                >
                  Trigger Toast Feedback
                </Button>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Inline Feedback</p>
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-green-50 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Form saved successfully!</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Button State Feedback</p>
                <div className="flex gap-2">
                  <Button variant="outline" disabled className="gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Saved
                  </Button>
                  <Button className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default ShortcutsActionsShowcasePage;
