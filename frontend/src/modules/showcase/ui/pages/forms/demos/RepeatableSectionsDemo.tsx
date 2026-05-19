/**
 * Repeatable Sections Demo - Refactored with useRepeatable
 * 
 * Team member management demonstrating the new generic repeatable system.
 * Shows how to integrate useRepeatable with React Hook Form and Zod validation.
 */

import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Alert, AlertDescription } from '@/shared/ui/components/Alert';
import { SelectItem } from '@/shared/ui/shadcn/components/ui/select';
import { RequestPreview } from '../../../components/RequestPreview';

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
import { useRepeatable } from '@/shared/hooks/useRepeatable';
import { getFieldStatus } from './formUtils';

import { Plus, Trash2, GripVertical, Loader2, CheckCircle2 } from 'lucide-react';

// Types
interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
}

// Zod Schema
const teamMemberSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'member', 'viewer']),
});

const teamSetupSchema = z.object({
  workspaceName: z.string().min(2, 'Workspace name is required'),
  members: z.array(teamMemberSchema).min(1, 'At least one team member is required').max(10, 'Maximum 10 members allowed'),
});

type TeamSetupFormData = z.infer<typeof teamSetupSchema>;

// Helper to generate unique IDs
let idCounter = 0;
const generateId = () => `member-${Date.now()}-${idCounter++}`;

export const RepeatableSectionsDemo: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form setup
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<TeamSetupFormData>({
    resolver: zodResolver(teamSetupSchema),
    defaultValues: {
      workspaceName: 'My Workspace',
      members: [
        { id: generateId(), name: 'Jane Smith', email: 'jane@company.com', role: 'admin' },
        { id: generateId(), name: 'John Doe', email: 'john@company.com', role: 'member' },
      ],
    },
  });

  const currentMembers = watch('members') || [];

  // Repeatable system for team members
  const handleMembersChange = useCallback((items: TeamMember[]) => {
    setValue('members', items, { shouldValidate: true });
  }, [setValue]);

  const teamMembers = useRepeatable<TeamMember>({
    initialItems: currentMembers,
    minItems: 1,
    maxItems: 10,
    createItem: () => ({
      id: generateId(),
      name: '',
      email: '',
      role: 'member',
    }),
    onChange: handleMembersChange,
  });

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = teamMembers.items.findIndex((item) => item.id === active.id);
      const newIndex = teamMembers.items.findIndex((item) => item.id === over?.id);
      teamMembers.moveItem(oldIndex, newIndex);
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
        <Button 
          type="button" 
          onClick={() => teamMembers.addItem()} 
          variant="outline" 
          size="sm" 
          disabled={!teamMembers.canAdd}
        >
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
            items={teamMembers.items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="divide-y">
              {teamMembers.items.map((member, index) => (
                <DraggableItem
                  key={member.id}
                  id={member.id}
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
                      <Controller
                        name={`members.${index}.name`}
                        control={control}
                        render={({ field }) => (
                          <FieldText
                            placeholder="Full name"
                            className="h-9"
                            {...field}
                            {...getFieldStatus(errors.members?.[index]?.name)}
                            label=""
                          />
                        )}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <Controller
                        name={`members.${index}.email`}
                        control={control}
                        render={({ field }) => (
                          <FieldEmail
                            placeholder="email@company.com"
                            className="h-9"
                            {...field}
                            {...getFieldStatus(errors.members?.[index]?.email)}
                            label=""
                          />
                        )}
                      />
                    </div>

                    {/* Role */}
                    <div>
                      <Controller
                        name={`members.${index}.role`}
                        control={control}
                        render={({ field }) => (
                          <FieldSelect
                            placeholder="Select role"
                            value={field.value}
                            onValueChange={field.onChange}
                            {...getFieldStatus(errors.members?.[index]?.role)}
                            label=""
                          >
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </FieldSelect>
                        )}
                      />
                    </div>

                    {/* Delete Action */}
                    <div className="flex justify-end pt-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive h-9 w-9"
                        onClick={() => teamMembers.removeItem(index)}
                        disabled={!teamMembers.canRemove}
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
      
        {teamMembers.items.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No team members added.
          </div>
        )}
      </div>

      {/* Info Alert */}
      {teamMembers.items.length >= 5 && (
        <Alert>
          <AlertDescription>
            You've added {teamMembers.items.length} team members. You can add up to 10 on this plan.
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
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
      </div>

      <RequestPreview data={formData} title="Request Payload" />
    </form>
  );
};
