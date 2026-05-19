import React, { useState } from 'react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Textarea } from '@/shared/ui/shadcn/components/ui/textarea';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/components/ui/select';
import { cn } from '@/shadcn/lib/utils';
import { InlineEditableField } from '@/components/editable/InlineEditableField';
import { InlineEditable } from '@/components/editable/InlineEditable';

// Sample data
const initialItems = [
  { id: 1, name: 'Project Alpha', status: 'Active' },
  { id: 2, name: 'Project Beta', status: 'Paused' },
  { id: 3, name: 'Project Gamma', status: 'Completed' },
];

const initialNotes = [
  { id: 1, title: 'Meeting Notes', content: 'Discussed Q1 roadmap and priorities.' },
  { id: 2, title: 'Ideas', content: 'New feature suggestions from customer feedback.' },
];

const InlineFormsShowcasePage: React.FC = () => {
  const [items, setItems] = useState(initialItems);
  const [notes, setNotes] = useState(initialNotes);

  const handleRename = (id: number, newName: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, name: newName } : item)));
  };

  const handleStatusChange = (id: number, status: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  const handleNoteContentChange = (id: number, content: string) => {
    setNotes((prev) => prev.map((note) => (note.id === id ? { ...note, content } : note)));
  };

  const handleNoteTitleChange = (id: number, title: string) => {
    setNotes((prev) => prev.map((note) => (note.id === id ? { ...note, title } : note)));
  };

  return (
    <ShowcasePage
      title="Inline Forms"
      description="Demonstrate compact inline form patterns - rename items, update status, and edit notes without modal dialogs."
    >
      <ShowcaseSection
        title="Quick Rename Pattern"
        description="Click on an item name to rename it inline. Press Enter to save or Escape to cancel."
      >
        <CodeExample
          id="inline-editing"
          title="Inline Rename"
          code={`import { InlineEditableField } from '@/shared/ui/components/InlineEditableField';

<InlineEditableField
  value={item.name}
  onSave={(next) => updateItem(item.id, { name: next })}
  saveOnBlur
  hideActions
  className="font-medium"
/>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Projects</CardTitle>
              <p className="text-sm text-muted-foreground">Click on a project name to rename it</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                      {item.name.charAt(8)}
                    </div>
                    <InlineEditableField
                      id={`project-name-${item.id}`}
                      value={item.name}
                      onSave={(newName) => handleRename(item.id, newName)}
                      saveOnBlur
                      hideActions
                      className="font-medium"
                    />
                  </div>
                  <Badge
                    variant={
                      item.status === 'Active'
                        ? 'default'
                        : item.status === 'Completed'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {item.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Inline Status Update"
        description="Change status directly from a dropdown without entering edit mode."
      >
        <CodeExample
          id="inline-editing"
          title="Inline Status Select"
          code={`<div className="flex items-center justify-between">
  <span>{item.name}</span>
  <Select value={item.status} onValueChange={(v) => handleStatusChange(item.id, v)}>
    <SelectTrigger className="w-[120px]">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="Active">Active</SelectItem>
      <SelectItem value="Paused">Paused</SelectItem>
      <SelectItem value="Completed">Completed</SelectItem>
    </SelectContent>
  </Select>
</div>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Project Status</CardTitle>
              <p className="text-sm text-muted-foreground">Update status directly from the dropdown</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <span className="font-medium text-sm">{item.name}</span>
                  <Select
                    value={item.status}
                    onValueChange={(v) => handleStatusChange(item.id, v)}
                  >
                    <SelectTrigger className="w-[130px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Paused">Paused</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Expandable Quick Notes"
        description="Click to expand and edit notes inline. Changes save on blur."
      >
        <CodeExample
          id="inline-editing"
          title="Expand-on-Focus Notes"
          code={`<div className="flex items-center justify-between">
  <InlineEditableField
    id={\`note-title-\${note.id}\`}
    value={note.title}
    onSave={(title) => handleNoteTitleChange(note.id, title)}
    className="font-medium"
  />
</div>

{/* Custom InlineEditable */}
<InlineEditableField
  value={note.content}
  onSave={(content) => handleNoteContentChange(note.id, content)}
  renderDisplay={({ value, onStartEdit }) => (
    <div className="cursor-pointer" onClick={onStartEdit}>
      <p className="px-3 text-sm text-muted-foreground line-clamp-2">{value}</p>
    </div>
  )}
  renderEditor={({ value, onChange, onSave, inputProps }) => (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onSave}
      onKeyDown={inputProps.onKeyDown}
      onClick={(e) => e.stopPropagation()}
      rows={4}
      className="mt-2"
      autoFocus
    />
  )}
/>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Notes</CardTitle>
              <p className="text-sm text-muted-foreground">Click a note to expand and edit</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={cn('p-4 border rounded-lg')}
                >
                  <div className="flex items-center justify-between">
                    <InlineEditableField
                      id={`note-title-${note.id}`}
                      value={note.title}
                      onSave={(title) => handleNoteTitleChange(note.id, title)}
                      className="font-medium"
                    />
                  </div>

                  <InlineEditable
                    value={note.content}
                    onSave={(content) => handleNoteContentChange(note.id, content)}
                    renderDisplay={({ value, onStartEdit }) => (
                      <div className="cursor-pointer" onClick={onStartEdit}>
                        <p className="px-3 text-sm text-muted-foreground line-clamp-2">{value}</p>
                      </div>
                    )}
                    renderEditor={({ value, onChange, onSave, inputProps }) => (
                      <Textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onSave}
                        onKeyDown={inputProps.onKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        rows={4}
                        className="mt-2"
                        autoFocus
                      />
                    )}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default InlineFormsShowcasePage;
