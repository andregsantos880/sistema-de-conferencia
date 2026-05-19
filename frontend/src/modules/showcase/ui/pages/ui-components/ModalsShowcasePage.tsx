import React, { useState } from 'react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/shared/ui/shadcn/components/ui/dialog';
import { AlertTriangle, Trash2, Loader2, Check } from 'lucide-react';

// Delete Confirmation Dialog Component
const DeleteConfirmationDemo = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsDeleting(false);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Delete Project</DialogTitle>
              <DialogDescription className="mt-1">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong>"Marketing Campaign Q4"</strong>? 
            All associated data, including tasks, files, and comments will be permanently removed.
          </p>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" disabled={isDeleting}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Project
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Edit Value Dialog Component
const EditValueDemo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [value, setValue] = useState('Marketing Campaign Q4');
  const [error, setError] = useState('');

  const handleSave = async () => {
    // Validation
    if (!value.trim()) {
      setError('Project name is required');
      return;
    }
    if (value.length < 3) {
      setError('Project name must be at least 3 characters');
      return;
    }

    setError('');
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setIsSuccess(true);
    
    // Show success briefly then close
    setTimeout(() => {
      setIsSuccess(false);
      setIsOpen(false);
    }, 1000);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setError('');
      setIsSuccess(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Project Name</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Project Name</DialogTitle>
          <DialogDescription>
            Update the name of your project. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter project name"
              className={error ? 'border-destructive' : ''}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" disabled={isSaving}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isSaving || isSuccess}>
            {isSuccess ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Saved!
              </>
            ) : isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ModalsShowcasePage: React.FC = () => {
  return (
    <ShowcasePage
      title="Modals"
      description="Dialog and modal components for overlays and confirmations."
    >
      {/* Basic Dialog */}
      <ShowcaseSection
        title="Basic Dialog"
        description="A simple dialog with title, description, and actions."
      >
        <CodeExample
          id="dialogs"
          title="Dialog Example"
          code={`<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        This is a description of the dialog content.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`}
        >
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Action</DialogTitle>
                <DialogDescription>
                  Are you sure you want to proceed with this action? This cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CodeExample>
      </ShowcaseSection>

      {/* Delete Confirmation Dialog */}
      <ShowcaseSection
        title="Delete Confirmation Dialog"
        description="Destructive dialog with clear warning messaging and loading state."
      >
        <CodeExample
          id="dialogs-delete"
          title="Destructive Confirmation"
          code={`const [isDeleting, setIsDeleting] = useState(false);

const handleDelete = async () => {
  setIsDeleting(true);
  await deleteProject();
  setIsDeleting(false);
  setIsOpen(false);
};

<Dialog>
  <DialogContent>
    <DialogHeader>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <DialogTitle>Delete Project</DialogTitle>
      </div>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
        {isDeleting ? <Loader2 className="animate-spin" /> : 'Delete'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`}
        >
          <DeleteConfirmationDemo />
        </CodeExample>
      </ShowcaseSection>

      {/* Edit Value Dialog */}
      <ShowcaseSection
        title="Edit Value Dialog"
        description="Form dialog with input validation, loading state, and success feedback."
      >
        <CodeExample
          id="dialogs-edit"
          title="Edit with Validation"
          code={`const [value, setValue] = useState('');
const [error, setError] = useState('');
const [isSaving, setIsSaving] = useState(false);
const [isSuccess, setIsSuccess] = useState(false);

const handleSave = async () => {
  if (!value.trim()) {
    setError('Field is required');
    return;
  }
  setIsSaving(true);
  await saveValue(value);
  setIsSaving(false);
  setIsSuccess(true);
  setTimeout(() => setIsOpen(false), 1000);
};

<Dialog>
  <DialogContent>
    <div className="space-y-2">
      <Label htmlFor="name">Name</Label>
      <Input
        id="name"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={error ? 'border-destructive' : ''}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
    <DialogFooter>
      <Button onClick={handleSave} disabled={isSaving}>
        {isSuccess ? <Check /> : isSaving ? <Loader2 className="animate-spin" /> : 'Save'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`}
        >
          <EditValueDemo />
        </CodeExample>
      </ShowcaseSection>

      {/* Dialog Sizes */}
      <ShowcaseSection
        title="Dialog Sizes"
        description="Dialogs can be sized appropriately for their content."
      >
        <CodeExample
          id="dialogs-sizes"
          title="Size Variations"
          code={`<DialogContent className="sm:max-w-[425px]">...</DialogContent>
<DialogContent className="sm:max-w-[600px]">...</DialogContent>
<DialogContent className="sm:max-w-[800px]">...</DialogContent>`}
        >
          <div className="flex flex-wrap gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Small (425px)</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Small Dialog</DialogTitle>
                  <DialogDescription>
                    This is a small dialog, ideal for simple confirmations or short forms.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button>Close</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Medium (600px)</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Medium Dialog</DialogTitle>
                  <DialogDescription>
                    This is a medium-sized dialog, suitable for forms with multiple fields or moderate content.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground">
                    Medium dialogs provide more space for content while still maintaining focus. 
                    They're commonly used for settings panels, multi-step forms, or detailed confirmations.
                  </p>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button>Close</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Large (800px)</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                  <DialogTitle>Large Dialog</DialogTitle>
                  <DialogDescription>
                    This is a large dialog for complex content like data tables or detailed views.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Section 1</h4>
                      <p className="text-sm text-muted-foreground">
                        Large dialogs can contain multiple sections of content arranged in columns.
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Section 2</h4>
                      <p className="text-sm text-muted-foreground">
                        This layout is useful for comparison views or side-by-side information.
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button>Close</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default ModalsShowcasePage;

