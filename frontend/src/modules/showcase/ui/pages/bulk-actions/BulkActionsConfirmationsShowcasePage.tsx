import React, { useState } from 'react';
import { Trash2, AlertTriangle, CheckCircle, X, Undo2 } from 'lucide-react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Checkbox } from '@/shared/ui/shadcn/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/components/ui/dialog';
import { cn } from '@/shadcn/lib/utils';
import { useBulkSelection, useConfirmation } from '@/shared/hooks';

interface Item {
  id: number;
  name: string;
  type: string;
}

const initialItems: Item[] = [
  { id: 1, name: 'Project Alpha', type: 'Project' },
  { id: 2, name: 'Project Beta', type: 'Project' },
  { id: 3, name: 'Project Gamma', type: 'Project' },
  { id: 4, name: 'Project Delta', type: 'Project' },
  { id: 5, name: 'Project Epsilon', type: 'Project' },
];

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'undo';
  undoAction?: () => void;
}

const BulkActionsConfirmationsShowcasePage: React.FC = () => {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [, setDeletedItems] = useState<Item[]>([]);

  const {
    state: confirmationState,
    confirm,
    handleConfirm,
    handleCancel,
  } = useConfirmation();

  const [activeDialog, setActiveDialog] = useState<'delete' | 'permanent' | null>(null);

  const {
    selectedCount,
    isSelected,
    toggle: toggleSelect,
    selectAll,
    clear: clearSelection,
    isAllSelected,
  } = useBulkSelection<number>();

  const itemIds = items.map((i) => i.id);

  const handleSelectAll = () => {
    if (isAllSelected(itemIds)) {
      clearSelection();
    } else {
      selectAll(itemIds);
    }
  };

  const showToast = (message: string, type: 'success' | 'undo', undoAction?: () => void) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, undoAction }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const requestDeleteWithUndo = async () => {
    setActiveDialog('delete');

    const confirmed = await confirm({
      title: `Delete ${selectedCount} items?`,
      description: `Are you sure you want to delete ${selectedCount} selected ${
        selectedCount === 1 ? 'item' : 'items'
      }? This action can be undone.`,
      confirmLabel: `Delete ${selectedCount} ${selectedCount === 1 ? 'item' : 'items'}`,
      cancelLabel: 'Cancel',
      variant: 'destructive',
    });

    setActiveDialog(null);

    if (!confirmed) return;
    const toDelete = items.filter((i) => isSelected(i.id));
    setDeletedItems(toDelete);
    setItems((prev) => prev.filter((i) => !isSelected(i.id)));
    clearSelection();

    showToast(`${toDelete.length} items deleted`, 'undo', () => {
      setItems((prev) => [...prev, ...toDelete].sort((a, b) => a.id - b.id));
      showToast('Deletion undone', 'success');
    });
  };

  const requestPermanentDelete = async () => {
    setActiveDialog('permanent');

    const confirmed = await confirm({
      title: `Permanently delete ${selectedCount} items?`,
      description: 'Warning: This action cannot be undone. All selected items will be permanently removed from the system.',
      confirmLabel: 'Permanently Delete',
      cancelLabel: 'Cancel',
      variant: 'destructive',
    });

    setActiveDialog(null);

    if (!confirmed) return;
    const count = selectedCount;
    setItems((prev) => prev.filter((i) => !isSelected(i.id)));
    clearSelection();
    showToast(`${count} items permanently deleted`, 'success');
  };

  return (
    <ShowcasePage
      title="Confirmation Flows"
      description="Demonstrate safe confirmation patterns for destructive bulk actions with clear warnings and undo options."
    >
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-bottom-2 fade-in-0 duration-300",
              toast.type === 'success' && "bg-green-600 text-white",
              toast.type === 'undo' && "bg-gray-900 text-white"
            )}
          >
            {toast.type === 'success' && <CheckCircle className="h-4 w-4 shrink-0" />}
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            {toast.undoAction && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-white hover:bg-white/20"
                onClick={() => {
                  toast.undoAction?.();
                  removeToast(toast.id);
                }}
              >
                <Undo2 className="h-3 w-3 mr-1" /> Undo
              </Button>
            )}
            <button
              onClick={() => removeToast(toast.id)}
              className="hover:opacity-70 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <Dialog
        open={confirmationState.isOpen}
        onOpenChange={(isOpen) => !isOpen && handleCancel()}
      >
        <DialogContent>
          {activeDialog === 'delete' && (
            <>
              <DialogHeader>
                <DialogTitle>{confirmationState.options?.title}</DialogTitle>
                <DialogDescription>{confirmationState.options?.description}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={handleCancel}>
                  {confirmationState.options?.cancelLabel ?? 'Cancel'}
                </Button>
                <Button variant="destructive" onClick={handleConfirm}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {confirmationState.options?.confirmLabel ?? 'Delete'}
                </Button>
              </DialogFooter>
            </>
          )}

          {activeDialog === 'permanent' && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 text-destructive">
                  <div className="p-2 bg-destructive/10 rounded-full">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <DialogTitle className="text-destructive">{confirmationState.options?.title}</DialogTitle>
                </div>
                <DialogDescription className="pt-2">
                  <span className="font-semibold text-destructive">Warning:</span> This action cannot be undone.
                  All selected items will be permanently removed from the system.
                </DialogDescription>
              </DialogHeader>
              <div className="my-4 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                <p className="text-sm font-medium text-destructive mb-2">
                  The following items will be permanently deleted:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                  {items
                    .filter((i) => isSelected(i.id))
                    .map((item) => (
                      <li key={item.id}>• {item.name}</li>
                    ))}
                </ul>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCancel}>
                  {confirmationState.options?.cancelLabel ?? 'Cancel'}
                </Button>
                <Button variant="destructive" onClick={handleConfirm}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {confirmationState.options?.confirmLabel ?? 'Permanently Delete'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ShowcaseSection
        title="Standard Confirmation Modal"
        description="A simple confirmation dialog that allows undo after deletion."
      >
        <CodeExample
          id="bulk-actions"
          title="Delete with Undo"
          code={`const { state, confirm, handleConfirm, handleCancel } = useConfirmation();
const [activeDialog, setActiveDialog] = useState<'delete' | 'permanent' | null>(null);
const [deletedItems, setDeletedItems] = useState([]);

const requestDelete = async () => {
  setActiveDialog('delete');
  const confirmed = await confirm({
    title: \`Delete \${selectedCount} items?\`,
    description: \`Are you sure you want to delete \${selectedCount} selected items? This action can be undone.\`,
    confirmLabel: \`Delete \${selectedCount} items\`,
    cancelLabel: 'Cancel',
    variant: 'destructive',
  });
  setActiveDialog(null);

  if (!confirmed) return;

  const toDelete = items.filter(i => isSelected(i.id));
  setDeletedItems(toDelete);
  setItems(prev => prev.filter(i => !isSelected(i.id)));
  clearSelection();

  showToast(\`\${toDelete.length} items deleted\`, 'undo', () => {
    setItems(prev => [...prev, ...toDelete]);
    showToast('Deletion undone', 'success');
  });
};

<Dialog open={state.isOpen} onOpenChange={(open) => !open && handleCancel()}>
  <DialogContent>
    {activeDialog === 'delete' && (
      <>
        <DialogHeader>
          <DialogTitle>{state.options?.title}</DialogTitle>
          <DialogDescription>{state.options?.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button variant="destructive" onClick={handleConfirm}>Delete</Button>
        </DialogFooter>
      </>
    )}
  </DialogContent>
</Dialog>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Projects (with Undo)</CardTitle>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isAllSelected(itemIds)}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                  <span className="text-xs text-muted-foreground">Select all</span>
                </div>
              </div>
            </CardHeader>

            {/* Bulk Action Bar */}
            {selectedCount > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 mx-4 bg-primary/10 rounded-lg animate-in slide-in-from-top-1 fade-in-0 duration-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{selectedCount} selected</span>
                  <Button variant="ghost" size="sm" className="h-7" onClick={() => clearSelection()}>
                    <X className="h-3 w-3 mr-1" /> Clear
                  </Button>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8"
                  onClick={requestDeleteWithUndo}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete Selected
                </Button>
              </div>
            )}

            <CardContent className="pt-3">
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleSelect(item.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors",
                      isSelected(item.id) ? "bg-primary/5 border-primary/30" : "hover:bg-muted/50"
                    )}
                  >
                    <Checkbox
                      checked={isSelected(item.id)}
                      onCheckedChange={() => toggleSelect(item.id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${item.name}`}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.type}</p>
                    </div>
                  </div>
                ))}
              </div>

              {items.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No items</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setItems(initialItems);
                      clearSelection();
                    }}
                  >
                    Reset Data
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Destructive Confirmation Modal"
        description="A warning dialog for permanent, irreversible actions with clear danger indicators."
      >
        <CodeExample
          id="bulk-actions"
          title="Permanent Delete Warning"
          code={`const { state, confirm, handleConfirm, handleCancel } = useConfirmation();
const [activeDialog, setActiveDialog] = useState<'delete' | 'permanent' | null>(null);

const requestPermanentDelete = async () => {
  setActiveDialog('permanent');
  const confirmed = await confirm({
    title: \`Permanently delete \${count} items?\`,
    description: 'Warning: This action cannot be undone.',
    confirmLabel: 'Permanently Delete',
    cancelLabel: 'Cancel',
    variant: 'destructive',
  });
  setActiveDialog(null);

  if (!confirmed) return;
  handlePermanentDelete();
};

<Dialog open={state.isOpen} onOpenChange={(open) => !open && handleCancel()}>
  <DialogContent>
    {activeDialog === 'permanent' && (
      <>
        <DialogHeader>
          <DialogTitle>{state.options?.title}</DialogTitle>
          <DialogDescription>{state.options?.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button variant="destructive" onClick={handleConfirm}>Permanently Delete</Button>
        </DialogFooter>
      </>
    )}
  </DialogContent>
</Dialog>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Permanent Deletion Example</CardTitle>
              <p className="text-sm text-muted-foreground">
                Select items and click delete to see the destructive confirmation dialog
              </p>
            </CardHeader>

            {/* Bulk Action Bar */}
            {selectedCount > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 mx-4 bg-destructive/10 rounded-lg animate-in slide-in-from-top-1 fade-in-0 duration-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium">{selectedCount} selected for permanent deletion</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8" onClick={() => clearSelection()}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8"
                    onClick={requestPermanentDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Permanently Delete
                  </Button>
                </div>
              </div>
            )}

            <CardContent className="pt-3">
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleSelect(item.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors",
                      isSelected(item.id) ? "bg-destructive/5 border-destructive/30" : "hover:bg-muted/50"
                    )}
                  >
                    <Checkbox
                      checked={isSelected(item.id)}
                      onCheckedChange={() => toggleSelect(item.id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${item.name}`}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.type}</p>
                    </div>
                  </div>
                ))}
              </div>

              {items.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No items</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setItems(initialItems);
                      clearSelection();
                    }}
                  >
                    Reset Data
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default BulkActionsConfirmationsShowcasePage;
