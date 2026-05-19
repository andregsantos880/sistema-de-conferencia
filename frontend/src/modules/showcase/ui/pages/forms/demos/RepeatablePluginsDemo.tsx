/**
 * Repeatable System - Plugins Demo
 * 
 * Demonstrates the optional plugins for the Repeatable System:
 * 1. RepeatableSortable (Drag & Drop)
 * 2. Zod Adapters (Schema Validation)
 */
import { useState } from 'react';
import { z } from 'zod';
import { 
  useRepeatable, 
  Repeatable, 
  RepeatableSortable,
  SortableHandle,
  createZodItemValidator,
  createZodArrayValidator
} from '@/shared/ui/components/repeatable';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/shared/ui/shadcn/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/shadcn/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/shadcn/components/ui/tabs';
import { Plus, Trash2, GripVertical, Check, Loader2, CheckCircle2 } from 'lucide-react';
import { RequestPreview } from '../../../components/RequestPreview';

// --- Shared Utils ---
const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Example 1: Invoice Line Items (Sortable + Item Validation) ---

const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(3, "Description too short"),
  quantity: z.number().min(1, "Qty must be >= 1"),
  price: z.number().min(0, "Price must be >= 0"),
});
type LineItem = z.infer<typeof lineItemSchema>;

export const InvoiceExample = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const invoice = useRepeatable<LineItem>({
    initialItems: [
      { id: generateId(), description: 'Web Design & Brand Identity', quantity: 1, price: 2500 },
      { id: generateId(), description: 'Frontend Development (React)', quantity: 40, price: 85 },
      { id: generateId(), description: 'Cloud Infrastructure Setup', quantity: 1, price: 1200 },
      { id: generateId(), description: 'Monthly Retainer (Security)', quantity: 1, price: 450 },
      { id: generateId(), description: 'API Documentation', quantity: 10, price: 60 },
    ],
    createItem: () => ({ id: generateId(), description: '', quantity: 1, price: 0 }),
    validateItem: createZodItemValidator(lineItemSchema),
  });

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Invoice saved:', invoice.items);
    setIsSaving(false);
    setSaveSuccess(true);
    
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const total = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <h4 className="font-semibold">Line Items</h4>
          <p className="text-sm text-muted-foreground">Drag to reorder. Descriptions must be 3+ chars.</p>
        </div>
        <Button onClick={() => invoice.addItem()} size="sm" variant="outline"><Plus className="w-4 h-4 mr-2"/> Add Item</Button>
      </div>

      <RepeatableSortable
        items={invoice.items}
        onMove={invoice.moveItem}
        getItemId={(item) => item.id}
        className="space-y-2"
      >
        {(item, index) => (
          <div className="flex items-start gap-3 p-3 border rounded-md bg-card">
            <SortableHandle className="mt-2.5 text-muted-foreground hover:text-foreground">
              <GripVertical className="w-5 h-5" />
            </SortableHandle>
            
            <div className="grid grid-cols-[2fr_100px_100px_40px] gap-2 flex-1">
               <div className="space-y-1">
                 <Input 
                   value={item.description} 
                   onChange={(e) => invoice.updateItem(index, { description: e.target.value })}
                   placeholder="Description"
                   className={invoice.errors[index] ? "border-destructive" : ""}
                 />
                 {invoice.errors[index] && <p className="text-xs text-destructive">{invoice.errors[index]}</p>}
               </div>
               
               <Input 
                 type="number" 
                 value={item.quantity} 
                 onChange={(e) => invoice.updateItem(index, { quantity: Number(e.target.value) })}
                 placeholder="Qty"
               />
               
               <Input 
                 type="number" 
                 value={item.price} 
                 onChange={(e) => invoice.updateItem(index, { price: Number(e.target.value) })}
                 placeholder="Price"
               />

               <Button variant="ghost" size="icon" onClick={() => invoice.removeItem(index)}>
                 <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
               </Button>
            </div>
          </div>
        )}
      </RepeatableSortable>

      {/* Footer with Total and Save */}
      <div className="flex items-center justify-between pt-4 border-t mt-4">
        <div className="text-sm font-bold">
          Total: ${total.toFixed(2)}
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving || invoice.items.length === 0}
          size="sm"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : saveSuccess ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Saved!
            </>
          ) : (
            'Save Invoice'
          )}
        </Button>
      </div>

      <RequestPreview data={invoice.items} title="Request Payload" />
    </div>
  );
};

// --- Example 2: Team Members (Sortable Optional, Array Validation) ---

const teamMemberSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'user']),
});
// Array validator ensures unique emails
const teamArraySchema = z.array(teamMemberSchema).refine((items) => {
  const emails = items.map(i => i.email);
  return new Set(emails).size === emails.length;
}, "Emails must be unique across the team");

type TeamMember = z.infer<typeof teamMemberSchema>;

export const TeamExample = () => {
  const team = useRepeatable<TeamMember>({
    initialItems: [
      { id: generateId(), email: 'sarah.connor@cyberdyne.com', role: 'admin' },
      { id: generateId(), email: 'john.doe@techcorp.io', role: 'user' },
      { id: generateId(), email: 'jane.smith@designstudio.co', role: 'user' },
      { id: generateId(), email: 'mike.ross@pearson.law', role: 'user' },
      { id: generateId(), email: 'rachel.zane@pearson.law', role: 'user' },
    ],
    createItem: () => ({ id: generateId(), email: '', role: 'user' }),
    // Use validateAll for collection-level rules
    validateAll: createZodArrayValidator(teamArraySchema), 
    validateItem: createZodItemValidator(teamMemberSchema), // Also validate individual items
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
           <h4 className="font-semibold">Team Members</h4>
           <p className="text-sm text-muted-foreground">Emails must be unique. One admin required.</p>
        </div>
        <Button onClick={() => team.addItem()} size="sm"><Plus className="w-4 h-4 mr-2"/> Add Member</Button>
      </div>

      {team.hasErrors && <div className="text-sm text-destructive p-2 bg-destructive/10 rounded">Fix errors to save</div>}

      {/* We use standard Repeatable here, opting OUT of sortable for this example */}
      <Repeatable
        items={team.items}
        onRemove={team.removeItem}
      >
        {(item, index, { remove }) => (
          <div className="flex items-center gap-3 py-2 border-b last:border-0">
            <div className="w-8 flex justify-center text-xs text-muted-foreground">{index + 1}</div>
            
            <div className="flex-1 space-y-1">
              <Input 
                 value={item.email} 
                 onChange={(e) => team.updateItem(index, { email: e.target.value })}
                 placeholder="name@company.com"
                 className={team.errors[index] ? "border-destructive" : ""}
              />
              {team.errors[index] && <p className="text-xs text-destructive">{team.errors[index]}</p>}
            </div>

            <div className="w-[120px]">
               <Select
                 value={item.role}
                 onValueChange={(value) => team.updateItem(index, { role: value as any })}
               >
                 <SelectTrigger className="h-9">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="admin">Admin</SelectItem>
                   <SelectItem value="user">User</SelectItem>
                 </SelectContent>
               </Select>
            </div>

            <Button variant="ghost" size="icon" onClick={remove}>
               <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </Repeatable>

      <RequestPreview data={team.items} title="Team State" />
    </div>
  );
};

// --- Example 3: Todo List (Sortable, No Validation) ---

interface Todo {
  id: string;
  text: string;
  done: boolean;
}

export const TodoExample = () => {
  const [newTodo, setNewTodo] = useState('');
  
  const todos = useRepeatable<Todo>({
    initialItems: [
      { id: generateId(), text: 'Review pull requests for v1.2.0', done: true },
      { id: generateId(), text: 'Update typography system documentation', done: false },
      { id: generateId(), text: 'Optimize asset loading for landing page', done: false },
      { id: generateId(), text: 'Prepare weekly sprint report', done: true },
      { id: generateId(), text: 'Fix navigation z-index issue on mobile', done: false },
    ],
    createItem: () => ({ id: generateId(), text: '', done: false }),
  });

  const handleAdd = () => {
    if (!newTodo.trim()) return;
    todos.addItem({ text: newTodo });
    setNewTodo('');
  };

  return (
    <div className="space-y-4">
      <RepeatableSortable
        items={todos.items}
        onMove={todos.moveItem}
        getItemId={(item) => item.id}
        className="space-y-2"
      >
        {(item, index) => (
          <div className={`
             flex items-center gap-2 p-2 rounded-md border bg-card transition-all
             ${item.done ? 'opacity-60 bg-muted/40' : ''}
          `}>
            <SortableHandle className="cursor-grab text-muted-foreground/50 hover:text-foreground">
               <GripVertical className="w-4 h-4" />
            </SortableHandle>
            
            <div 
              className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer ${item.done ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'}`}
              onClick={() => todos.updateItem(index, { done: !item.done })}
            >
              {item.done && <Check className="w-3 h-3" />}
            </div>

            <input 
              className="flex-1 bg-transparent border-none outline-none todo-input"
              value={item.text}
              onChange={(e) => todos.updateItem(index, { text: e.target.value })}
              placeholder="Todo text..."
            />

            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => todos.removeItem(index)}>
               <Trash2 className="w-3 h-3 text-muted-foreground/50 hover:text-destructive" />
            </Button>
          </div>
        )}
      </RepeatableSortable>

      <div className="flex gap-2">
        <Input 
          placeholder="New todo..." 
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAdd();
            }
          }}
        />
        <Button onClick={handleAdd} disabled={!newTodo.trim()}><Plus className="w-4 h-4"/></Button>
      </div>

      <RequestPreview data={todos.items} title="Todos State" />
    </div>
  );
};

// --- Example 4: Notes Blocks (Grid, Minimal) ---

interface NoteBlock {
  id: string;
  color: string;
  content: string;
}

export const NotesExample = () => {
  const notes = useRepeatable<NoteBlock>({
    initialItems: [
      { id: generateId(), color: 'bg-yellow-100 dark:bg-yellow-900/20', content: 'Research CSS Container Queries for the new dashboard widgets.' },
      { id: generateId(), color: 'bg-blue-100 dark:bg-blue-900/20', content: 'Client call at 3 PM - discuss API integration strategy.' },
      { id: generateId(), color: 'bg-green-100 dark:bg-green-900/20', content: 'Approved: The new brand colors match the vision.' },
      { id: generateId(), color: 'bg-purple-100 dark:bg-purple-900/20', content: 'Deployment scheduled for Friday night (00:00 UTC).' },
      { id: generateId(), color: 'bg-rose-100 dark:bg-rose-900/20', content: 'Critical: Update dependencies to patch CVE-2024-XXXX.' },
    ],
    createItem: () => ({ id: generateId(), color: 'bg-slate-100 dark:bg-slate-800', content: '' }),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
         <h4 className="font-semibold">Grid Notes</h4>
         <Button variant="secondary" size="sm" onClick={() => notes.addItem()}>New Note</Button>
      </div>

      <RepeatableSortable
        items={notes.items}
        onMove={notes.moveItem}
        getItemId={(item) => item.id}
        // Grid strategy for 2D layout
        strategy="grid"
        className="grid grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {(item, index) => (
          <div className={`p-4 rounded-lg border h-32 flex flex-col relative group ${item.color}`}>
            <SortableHandle className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab bg-background/50 rounded p-1">
              <GripVertical className="w-4 h-4" />
            </SortableHandle>
            
            <textarea
              className="w-full h-full bg-transparent resize-none outline-none text-sm font-medium"
              value={item.content}
              onChange={(e) => notes.updateItem(index, { content: e.target.value })}
              placeholder="Write something..."
            />
            
            <button 
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground hover:text-destructive"
              onClick={() => notes.removeItem(index)}
            >
              Remove
            </button>
          </div>
        )}
      </RepeatableSortable>

      <RequestPreview data={notes.items} title="Notes State" />
    </div>
  );
};

// --- Main Demo Page Component ---

export const RepeatablePluginsDemo = () => {
  return (
    <div className="space-y-8 p-6 mx-auto">
      <Tabs defaultValue="invoice">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="invoice">Invoice</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="todo">Todos</TabsTrigger>
          <TabsTrigger value="notes">Grid Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="invoice">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Editor</CardTitle>
              <CardDescription>
                Demonstrates <strong>RepeatableSortable</strong> + <strong>Zod Item Validation</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceExample />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                Demonstrates <strong>Array-Level Validation</strong> (Unique Emails) + standard Repeatable list.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeamExample />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="todo">
          <Card>
            <CardHeader>
              <CardTitle>Todo List</CardTitle>
              <CardDescription>
                Demonstrates <strong>RepeatableSortable</strong> without validation. Clean DND interactions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TodoExample />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Sticky Notes</CardTitle>
              <CardDescription>
                 Demonstrates <strong>Grid Layout Sorting</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotesExample />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
