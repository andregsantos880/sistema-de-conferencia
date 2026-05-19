/**
 * Repeatable Sections Demo - Real-life Implementation
 * 
 * Team member management with Zod validation and API submission.
 */

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Alert, AlertDescription } from '@/shared/ui/components/Alert';
import { SelectItem } from '@/shared/ui/shadcn/components/ui/select';
import { Collapsible, CollapsibleContent } from '@/shared/ui/shadcn/components/ui/collapsible';
import { Label } from '@/shared/ui/shadcn/components/ui/label';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import FieldText from '@/components/forms/composites/field/FieldText';
import FieldEmail from '@/components/forms/composites/field/FieldEmail';
import FieldSelect from '@/components/forms/composites/field/FieldSelect';
import { SortableItemBase as DraggableItem, SortableHandle as DragHandle } from '@/shared/ui/components/dnd';
import { getFieldStatus } from './formUtils';

import { Plus, Trash2, GripVertical, Code, Loader2, CheckCircle2 } from 'lucide-react';

// Zod Schema
const teamMemberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'member', 'viewer']),
});

const teamSetupSchema = z.object({
  workspaceName: z.string().min(2, 'Workspace name is required'),
  members: z.array(teamMemberSchema).min(1, 'At least one team member is required').max(10, 'Maximum 10 members allowed'),
});

type TeamSetupFormData = z.infer<typeof teamSetupSchema>;

export const RepeatableSectionsDemoManual: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [jsonPreviewOpen, setJsonPreviewOpen] = useState(false);

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<TeamSetupFormData>({
    resolver: zodResolver(teamSetupSchema),
    defaultValues: {
      workspaceName: 'My Workspace',
      members: [
        { name: 'Jane Smith', email: 'jane@company.com', role: 'admin' },
        { name: 'John Doe', email: 'john@company.com', role: 'member' },
      ],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'members',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over?.id);
      move(oldIndex, newIndex);
    }
  };

  const formData = watch();

  const onSubmit = async (data: TeamSetupFormData) => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Team setup submitted:', data);
    setIsSubmitting(false);
    setSubmitSuccess(true);
    
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const addMember = () => {
    append({ name: '', email: '', role: 'member' });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Workspace Name */}
      <div>
        <FieldText
          label="Workspace Name"
          placeholder="Enter workspace name"
          {...register('workspaceName')}
          {...getFieldStatus(errors.workspaceName)}
        />
      </div>

      {/* Team Members Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Team Members</h3>
          <p className="text-sm text-muted-foreground">
            Manage your team members and their roles.
          </p>
        </div>
        <Button type="button" onClick={addMember} variant="outline" size="sm" disabled={fields.length >= 10}>
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Error for members array */}
      {errors.members?.root && (
        <Alert variant="destructive">
          <AlertDescription>{errors.members.root.message}</AlertDescription>
        </Alert>
      )}

      {/* Team Members List */}
      <div className="border rounded-lg overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-[40px_1fr_1fr_140px_50px] gap-4 p-4 bg-muted/50 border-b text-sm font-medium text-muted-foreground">
          <div className="flex justify-center">#</div>
          <div>Name</div>
          <div>Email</div>
          <div>Role</div>
          <div className="text-right">Action</div>
        </div>

        {/* Sortable Context */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map((field) => field.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="divide-y">
              {fields.map((field, index) => (
                <DraggableItem
                  key={field.id}
                  id={field.id}
                  useDragHandle
                >
                  <div className="grid grid-cols-[40px_1fr_1fr_140px_50px] gap-4 p-4 items-start group">
                    {/* Drag Handle */}
                    <div className="flex justify-center pt-2.5">
                      <DragHandle className="text-muted-foreground/50 hover:text-foreground">
                        <GripVertical className="h-5 w-5" />
                      </DragHandle>
                    </div>

                    {/* Name */}
                    <div>
                      <FieldText
                        placeholder="Full name"
                        className="h-9"
                        {...register(`members.${index}.name`)}
                        {...getFieldStatus(errors.members?.[index]?.name)}
                        // Hide label inside list for cleaner look
                        label=""
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <FieldEmail
                        placeholder="email@company.com"
                        className="h-9"
                        {...register(`members.${index}.email`)}
                        {...getFieldStatus(errors.members?.[index]?.email)}
                        label=""
                      />
                    </div>

                    {/* Role */}
                    <div>
                      <FieldSelect
                        placeholder="Select role"
                        value={watch(`members.${index}.role`)}
                        onValueChange={(v) => {
                          const event = { target: { name: `members.${index}.role`, value: v } };
                          register(`members.${index}.role`).onChange(event);
                        }}
                        {...getFieldStatus(errors.members?.[index]?.role)}
                        label=""
                      >
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </FieldSelect>
                    </div>

                    {/* Delete Action */}
                    <div className="flex justify-end pt-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive h-9 w-9"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </DraggableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      
        {fields.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No team members added.
          </div>
        )}
      </div>

      {/* Info Alert */}
      {fields.length >= 5 && (
        <Alert>
          <AlertDescription>
            You've added {fields.length} team members. You can add up to 10 on this plan.
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Actions */}
      <div className="flex items-center gap-4 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Workspace...
            </>
          ) : submitSuccess ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Workspace Created!
            </>
          ) : (
            'Create Workspace'
          )}
        </Button>
        
        <Button type="button" variant="outline" onClick={() => setJsonPreviewOpen(!jsonPreviewOpen)}>
          <Code className="mr-2 h-4 w-4" />
          {jsonPreviewOpen ? 'Hide' : 'Show'} JSON
        </Button>
      </div>

      {/* JSON Preview */}
      <Collapsible open={jsonPreviewOpen} onOpenChange={setJsonPreviewOpen}>
        <CollapsibleContent>
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">API Payload Preview</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText(JSON.stringify(formData, null, 2))}
              >
                Copy
              </Button>
            </div>
            <pre className="text-xs overflow-x-auto">
              <code>{JSON.stringify(formData, null, 2)}</code>
            </pre>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </form>
  );
};
