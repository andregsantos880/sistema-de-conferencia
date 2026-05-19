import React, { useState, useEffect, useRef } from 'react';
import { Search, Keyboard, X, Command, ArrowRight, Plus, FileText, HelpCircle } from 'lucide-react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';

interface Shortcut {
  keys: string[];
  description: string;
  category: 'global' | 'navigation' | 'actions' | 'editing';
}

const allShortcuts: Shortcut[] = [
  // Global
  { keys: ['⌘', 'K'], description: 'Open Command Palette', category: 'global' },
  { keys: ['?'], description: 'Open Shortcuts Help', category: 'global' },
  { keys: ['Esc'], description: 'Close Modal / Cancel', category: 'global' },
  // Navigation
  { keys: ['G', 'D'], description: 'Go to Dashboard', category: 'navigation' },
  { keys: ['G', 'I'], description: 'Go to Invoices', category: 'navigation' },
  { keys: ['G', 'U'], description: 'Go to Users', category: 'navigation' },
  { keys: ['G', 'S'], description: 'Go to Settings', category: 'navigation' },
  // Actions
  { keys: ['⌘', 'N'], description: 'Create New Item', category: 'actions' },
  { keys: ['⌘', 'S'], description: 'Save Form', category: 'actions' },
  { keys: ['⌘', 'C'], description: 'Copy Selected', category: 'actions' },
  { keys: ['⌘', 'V'], description: 'Paste', category: 'actions' },
  { keys: ['⌘', 'Z'], description: 'Undo', category: 'actions' },
  // Editing
  { keys: ['⌘', 'B'], description: 'Bold Text', category: 'editing' },
  { keys: ['⌘', 'I'], description: 'Italic Text', category: 'editing' },
  { keys: ['⌘', 'U'], description: 'Underline Text', category: 'editing' },
];

const categoryLabels: Record<string, string> = {
  global: 'Global',
  navigation: 'Navigation',
  actions: 'Actions',
  editing: 'Editing',
};

const categoryIcons: Record<string, React.ReactNode> = {
  global: <Command className="h-4 w-4" />,
  navigation: <ArrowRight className="h-4 w-4" />,
  actions: <Plus className="h-4 w-4" />,
  editing: <FileText className="h-4 w-4" />,
};

interface CheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CheatSheetModal: React.FC<CheatSheetModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredShortcuts = allShortcuts.filter((shortcut) => {
    const matchesQuery = shortcut.description.toLowerCase().includes(query.toLowerCase()) ||
      shortcut.keys.join(' ').toLowerCase().includes(query.toLowerCase());
    const matchesCategory = !activeCategory || shortcut.category === activeCategory;
    return matchesQuery && matchesCategory;
  });

  const groupedShortcuts = filteredShortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/50 animate-in fade-in-0 duration-150" />
      <div
        className="relative w-full max-w-2xl max-h-[80vh] bg-background border rounded-lg shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search shortcuts..."
              className="pl-9"
            />
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 mt-3">
            <Button
              variant={activeCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(null)}
            >
              All
            </Button>
            {Object.keys(categoryLabels).map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className="gap-1"
              >
                {categoryIcons[cat]}
                {categoryLabels[cat]}
              </Button>
            ))}
          </div>
        </div>

        {/* Shortcuts List */}
        <div className="flex-1 overflow-y-auto p-4">
          {Object.keys(groupedShortcuts).length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No shortcuts found matching "{query}"
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-2">
                    {categoryIcons[category]}
                    <h3 className="text-sm font-medium">{categoryLabels[category]}</h3>
                    <Badge variant="secondary" className="text-xs">{shortcuts.length}</Badge>
                  </div>
                  <div className="space-y-1">
                    {shortcuts.map((shortcut, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors"
                      >
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-muted/30 text-xs text-muted-foreground text-center">
          Press <kbd className="px-1.5 py-0.5 bg-muted rounded">Esc</kbd> to close
        </div>
      </div>
    </div>
  );
};

const ShortcutsCheatSheetShowcasePage: React.FC = () => {
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        setShowCheatSheet(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ShowcasePage
      title="Shortcuts Cheat Sheet"
      description="A searchable reference of all keyboard shortcuts in the application."
    >
      <CheatSheetModal isOpen={showCheatSheet} onClose={() => setShowCheatSheet(false)} />

      <ShowcaseSection
        title="Cheat Sheet Modal"
        description="Open the cheat sheet to see all available shortcuts."
      >
        <CodeExample
          id="keyboard-shortcuts"
          title="Cheat Sheet Implementation"
          code={`// Open cheat sheet with ? key
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      setShowCheatSheet(true);
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);

// Cheat sheet modal with search and filtering
<CheatSheetModal isOpen={showCheatSheet} onClose={() => setShowCheatSheet(false)}>
  <Input placeholder="Search shortcuts..." />
  
  <div className="flex gap-2">
    <Button variant={activeCategory === null ? 'default' : 'outline'}>All</Button>
    <Button variant={activeCategory === 'global' ? 'default' : 'outline'}>Global</Button>
    <Button variant={activeCategory === 'navigation' ? 'default' : 'outline'}>Navigation</Button>
  </div>
  
  {groupedShortcuts.map(category => (
    <div key={category}>
      <h3>{categoryLabels[category]}</h3>
      {shortcuts.map(shortcut => (
        <div className="flex justify-between">
          <span>{shortcut.description}</span>
          <kbd>{shortcut.keys.join(' ')}</kbd>
        </div>
      ))}
    </div>
  ))}
</CheatSheetModal>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Open Cheat Sheet</CardTitle>
              <p className="text-sm text-muted-foreground">
                Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">?</kbd> or click the button below
              </p>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowCheatSheet(true)} className="gap-2">
                <HelpCircle className="h-4 w-4" />
                Open Shortcuts Cheat Sheet
                <kbd className="ml-2 px-1.5 py-0.5 bg-primary-foreground/20 rounded text-xs">?</kbd>
              </Button>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Grouped Shortcuts"
        description="Shortcuts are organized by category for easy discovery."
      >
        <CodeExample
          id="keyboard-shortcuts"
          title="Shortcut Categories"
          code={`const allShortcuts: Shortcut[] = [
  // Global
  { keys: ['⌘', 'K'], description: 'Open Command Palette', category: 'global' },
  { keys: ['?'], description: 'Open Shortcuts Help', category: 'global' },
  
  // Navigation
  { keys: ['G', 'D'], description: 'Go to Dashboard', category: 'navigation' },
  { keys: ['G', 'I'], description: 'Go to Invoices', category: 'navigation' },
  
  // Actions
  { keys: ['⌘', 'N'], description: 'Create New Item', category: 'actions' },
  { keys: ['⌘', 'S'], description: 'Save Form', category: 'actions' },
];

// Group shortcuts by category
const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
  if (!acc[shortcut.category]) {
    acc[shortcut.category] = [];
  }
  acc[shortcut.category].push(shortcut);
  return acc;
}, {});`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Shortcut Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Command className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Global</span>
                    <Badge variant="secondary" className="text-xs">3</Badge>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Command Palette</span>
                      <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘K</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Shortcuts Help</span>
                      <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">?</kbd>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Navigation</span>
                    <Badge variant="secondary" className="text-xs">4</Badge>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Dashboard</span>
                      <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">G D</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Invoices</span>
                      <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">G I</kbd>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Plus className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Actions</span>
                    <Badge variant="secondary" className="text-xs">5</Badge>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>New Item</span>
                      <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘N</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Save</span>
                      <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘S</kbd>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Editing</span>
                    <Badge variant="secondary" className="text-xs">3</Badge>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Bold</span>
                      <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘B</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Italic</span>
                      <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘I</kbd>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Search & Filter"
        description="Quickly find shortcuts by searching or filtering by category."
      >
        <CodeExample
          id="keyboard-shortcuts"
          title="Search Implementation"
          code={`const [query, setQuery] = useState('');
const [activeCategory, setActiveCategory] = useState<string | null>(null);

const filteredShortcuts = allShortcuts.filter(shortcut => {
  const matchesQuery = shortcut.description.toLowerCase().includes(query.toLowerCase()) ||
    shortcut.keys.join(' ').toLowerCase().includes(query.toLowerCase());
  const matchesCategory = !activeCategory || shortcut.category === activeCategory;
  return matchesQuery && matchesCategory;
});

<Input
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  placeholder="Search shortcuts..."
/>

<div className="flex gap-2">
  {categories.map(cat => (
    <Button
      key={cat}
      variant={activeCategory === cat ? 'default' : 'outline'}
      onClick={() => setActiveCategory(cat)}
    >
      {cat}
    </Button>
  ))}
</div>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Search Example</CardTitle>
              <p className="text-sm text-muted-foreground">
                Open the cheat sheet to try searching and filtering
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search shortcuts..."
                    className="pl-9"
                    disabled
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="default">All</Badge>
                  <Badge variant="outline">Global</Badge>
                  <Badge variant="outline">Navigation</Badge>
                  <Badge variant="outline">Actions</Badge>
                  <Badge variant="outline">Editing</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Click "Open Shortcuts Cheat Sheet" above to try the interactive search
                </p>
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default ShortcutsCheatSheetShowcasePage;
