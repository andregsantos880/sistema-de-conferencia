/**
 * Phase 4 – Advanced & Real-World Form Scenarios
 * 
 * Demonstrates that Katalyst forms can handle real business workflows,
 * not just static data entry. Shows complexity, variability, and real user behavior.
 * 
 * All demos include:
 * - React Hook Form integration
 * - Zod schema validation
 * - Simulated API submission
 * - JSON payload preview
 */

import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';

// Import demos
import {
  ConditionalFieldsDemo,
  SimpleRepeatableDemo,
  RepeatablePluginsDemo,
} from './demos';
import { RepeatableSectionsDemo } from './demos/RepeatableSectionsDemo';
import { RepeatableSectionsDemoManual } from './demos/RepeatableSectionsDemoManual';

const FormAdvancedShowcasePage: React.FC = () => {
  return (
    <ShowcasePage
      title="Advanced Form Scenarios"
      description={<p className="text-sm text-muted-foreground">Real-world form patterns for production applications powered by <b>React Hook Form</b>, <b>Zod</b>, and <b>@dnd-kit</b>. All demos include proper validation, API submission, and JSON preview.</p>}
      
    >
      {/* Conditional Fields */}
      <ShowcaseSection
        title="Conditional Fields"
        description="Account setup form with fields that appear based on user input. Includes comprehensive Zod validation and smooth transitions."
      >
        <CodeExample
          id="conditional-fields-demo"
          title="Account Setup Form"
          description="Dynamic form with conditional validation, toggle-based settings, and progressive disclosure."
          code={`const schema = z.object({
  accountType: z.enum(['personal', 'business']),
  fullName: z.string().min(2).optional(),
  companyName: z.string().min(2).optional(),
  enableNotifications: z.boolean(),
  notificationPreference: z.enum(['all', 'important', 'none']).optional(),
}).refine((data) => {
  if (data.accountType === 'personal') {
    return data.fullName && data.fullName.length >= 2;
  }
  return true;
});

const { register, handleSubmit, watch } = useForm({
  resolver: zodResolver(schema),
});

const accountType = watch('accountType');

<form onSubmit={handleSubmit(onSubmit)}>
  {accountType === 'business' && (
    <FieldText {...register('companyName')} />
  )}
</form>`}
        >
          <ConditionalFieldsDemo />
        </CodeExample>
      </ShowcaseSection>

      {/* Repeatable Sections - Progressive Enhancement Journey */}
      <ShowcaseSection
        title="Repeatable Patterns: From Manual to Katalyst"
        description="Learn how Katalyst's repeatable system saves you time and code. See the progression from traditional React Hook Form patterns to our powerful, reusable abstractions."
      >
        {/* useRepeatable Hook */}
        <CodeExample
          id="repeatable-step-2-hook"
          title="Katalyst useRepeatable Hook"
          description="Better: Our useRepeatable hook handles state, validation, and constraints. Integrates seamlessly with React Hook Form via onChange."
          code={`/** Katalyst's useRepeatable hook
 *
 * Clean API: addItem, removeItem, updateItem, moveItem
 * Built-in: canAdd, canRemove, isDirty, errors, hasErrors
 **/
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
  onChange: (items) => {
    setValue('members', items, { shouldValidate: true });
  },
});

// Still need to implement drag and drop manually
<DndContext 
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
  <SortableContext 
    items={teamMembers.items.map((item) => item.id)}
    strategy={verticalListSortingStrategy}
  >
    {teamMembers.items.map((member, index) => (
      <DraggableItem key={member.id} id={member.id}>
        {/* Your form fields */}
      </DraggableItem>
    ))}
  </SortableContext>
</DndContext>
`}
        >
          <RepeatableSectionsDemo />
        </CodeExample>

        {/* Repeatable Component */}
        <CodeExample
          id="repeatable-step-3-component"
          title="Repeatable Component (No Forms)"
          description="Even simpler: The Repeatable component handles rendering logic with render props. Perfect for lists that don't need form integration."
          code={`/** Katalyst's Repeatable component
 * 
 * Clean API: addItem, removeItem, updateItem, moveItem
 * Built-in: canAdd, canRemove, isDirty, errors, hasErrors
 */
const todos = useRepeatable<TodoItem>({
  initialItems: [],
  minItems: 0,
  maxItems: 20,
  createItem: () => ({}),
  validateItem: (item: TodoItem) => {},
});

// Repeatable component with render props
<Repeatable
  items={todos.items}
  onRemove={todos.removeItem}
  onUpdate={todos.updateItem}
  onMove={todos.moveItem}
  canRemove={todos.canRemove}
  emptyState={<EmptyState />}
>
  {(item, index, { update, remove, moveUp, moveDown }) => (
    <YourCustomUI 
      item={item} 
      onUpdate={update} 
      onRemove={remove} 
    />
  )}
</Repeatable>`}
        >
          <SimpleRepeatableDemo />
        </CodeExample>

        {/* RepeatableSortable Plugin */}
        <CodeExample
          id="repeatable-step-4-plugins"
          title="RepeatableSortable Plugin (Drag & Drop Built-in)"
          description="Most powerful: RepeatableSortable adds robust drag & drop (via **@dnd-kit**) with zero boilerplate. Supports vertical, horizontal, and grid layouts. Optional Zod validation adapters included."
          code={`/** Katalyst's RepeatableSortable component
 * 
 * Clean API: addItem, removeItem, updateItem, moveItem
 * Built-in: canAdd, canRemove, isDirty, errors, hasErrors
 */
const invoice = useRepeatable<LineItem>({
  initialItems: [
    { id: generateId(), description: 'Web Design', quantity: 1, price: 500 },
    { id: generateId(), description: 'Hosting', quantity: 12, price: 20 },
  ],
  createItem: () => ({ id: generateId(), description: '', quantity: 1, price: 0 }),
  validateItem: createZodItemValidator(lineItemSchema),
});

// RepeatableSortable with built-in DND
<RepeatableSortable
  items={invoice.items}
  onMove={invoice.moveItem}
  getItemId={(item) => item.id}
  strategy="vertical" // or "horizontal" | "grid"
>
  {(item, index) => (
    <div>
      <SortableHandle>
        <GripVertical />
      </SortableHandle>
      {/* Your content */}
    </div>
  )}
</RepeatableSortable>

// Optional: Zod validation adapters
validateItem: createZodItemValidator(schema),
validateAll: createZodArrayValidator(arraySchema)`}
        >
          <RepeatablePluginsDemo />
        </CodeExample>

        {/* useRepeatable Hook */}
        <CodeExample
          id="wire-up-manually"
          title="Wire up everything manually"
          description="You still can wire up everything manually, if you want to. But why would you?"
          code={`// Wire up everything manually
const { fields, append, remove } = useFieldArray({
  control,
  name: 'members',
});

// Add a new member
const addMember = () => {
  append({
    id: generateId(),
    name: '',
    email: '',
    role: 'member',
  });
};

// Remove a member
const removeMember = (index: number) => {
  remove(index);
};

// Implement drag and drop manually
<DndContext 
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
  <SortableContext 
    items={teamMembers.items.map((item) => item.id)}
    strategy={verticalListSortingStrategy}
  >
    {teamMembers.items.map((member, index) => (
      <DraggableItem key={member.id} id={member.id}>
        {/* Your form fields */}
      </DraggableItem>
    ))}
  </SortableContext>
</DndContext>
`}
        >
          <RepeatableSectionsDemoManual />
        </CodeExample>
        {/* Summary Card */}
        <div className="mt-8 p-6 bg-primary/5 border-2 border-primary/20 rounded-lg">
          <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-primary">💡</span>
            Key Takeaway
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            Katalyst's repeatable system lets you choose your level of abstraction:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">1.</span>
              <span><strong>useRepeatable hook</strong> - Drop-in replacement for useFieldArray with better DX</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">2.</span>
              <span><strong>Repeatable component</strong> - Render props for maximum flexibility</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">3.</span>
              <span><strong>RepeatableSortable</strong> - Drag & drop with zero configuration</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">4.</span>
              <span><strong>Zod adapters</strong> - Optional schema validation without tight coupling</span>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground mt-4 italic">
            All components are tree-shakeable and opt-in. Use what you need, nothing more.
          </p>
        </div>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default FormAdvancedShowcasePage;
