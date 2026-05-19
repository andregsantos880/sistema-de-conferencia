import React, { useState } from 'react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Card, CardContent } from '@/shared/ui/shadcn/components/ui/card';
import { Switch } from '@/shared/ui/shadcn/components/ui/switch';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Edit2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/shadcn/components/ui/table';
import { EditableTableCell } from '@/shared/ui/components/table/EditableTableCell';
import { ExpandablePanel } from '@/shared/ui/components/ExpandablePanel';
import { useInlineEdit } from '@/shared/hooks/useInlineEdit';
import { EditableActions } from '@/components/editable';

// --- Types ---

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  status: 'Active' | 'Draft' | 'Archived';
  inStock: boolean;
}

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  supplier: string;
  price: number;
  stock: number;
}

// --- Data ---

const initialProducts: Product[] = [
  { id: 1, name: 'Wireless Headphones', sku: 'WH-001', price: 79.99, status: 'Active', inStock: true },
  { id: 2, name: 'USB-C Hub', sku: 'USB-002', price: 49.99, status: 'Active', inStock: true },
  { id: 3, name: 'Mechanical Keyboard', sku: 'KB-003', price: 149.99, status: 'Draft', inStock: false },
];

const initialInventory: InventoryItem[] = [
  { id: 1, name: 'Ergonomic Chair', category: 'Furniture', supplier: 'OfficeDepot', price: 299.99, stock: 15 },
  { id: 2, name: 'Standing Desk', category: 'Furniture', supplier: 'IKEA', price: 450.00, stock: 8 },
  { id: 3, name: 'Monitor Arm', category: 'Accessories', supplier: 'Amazon', price: 45.99, stock: 30 },
];

// --- Components ---

const JsonPreview = ({ data, title }: { data: any; title: string }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <ExpandablePanel
      id={`json-${title.toLowerCase().replace(/\s/g, '-')}`}
      isExpanded={expanded}
      onToggle={() => setExpanded(!expanded)}
      header={<span className="font-mono text-sm font-semibold">{title} Data Preview</span>}
      className="bg---muted/30 mb-4"
    >
      <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </ExpandablePanel>
  );
};

const FullRowEditableRow = ({ 
  item, 
  onSave 
}: { 
  item: InventoryItem; 
  onSave: (newItem: InventoryItem) => void; 
}) => {
  const { 
    isEditing, 
    draft, 
    setDraft, 
    startEdit, 
    saveEdit, 
    cancelEdit, 
    isSaving,
    inputProps 
  } = useInlineEdit({
    initialValue: item,
    onSave: async (newItem) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      onSave(newItem);
    }
  });

  if (isEditing) {
    return (
      <TableRow className="bg-muted/30">
        <TableCell>
          <Input 
            value={draft.name} 
            onChange={(e) => setDraft(prev => ({ ...prev, name: e.target.value }))}
            {...inputProps}
            autoFocus 
          />
        </TableCell>
        <TableCell>
          <Input 
            value={draft.category} 
            onChange={(e) => setDraft(prev => ({ ...prev, category: e.target.value }))}
            {...inputProps}
          />
        </TableCell>
        <TableCell>
          <Input 
            value={draft.supplier} 
            onChange={(e) => setDraft(prev => ({ ...prev, supplier: e.target.value }))}
            {...inputProps}
          />
        </TableCell>
        <TableCell>
          <Input 
            type="number"
            value={draft.price} 
            onChange={(e) => setDraft(prev => ({ ...prev, price: Number(e.target.value) }))}
            {...inputProps}
          />
        </TableCell>
        <TableCell>
          <Input 
            type="number"
            value={draft.stock} 
            onChange={(e) => setDraft(prev => ({ ...prev, stock: Number(e.target.value) }))}
            {...inputProps}
          />
        </TableCell>
        <TableCell>
          <EditableActions
            onSave={saveEdit}
            onCancel={cancelEdit}
            isSaving={isSaving}
          />
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{item.name}</TableCell>
      <TableCell>{item.category}</TableCell>
      <TableCell>{item.supplier}</TableCell>
      <TableCell>${item.price.toFixed(2)}</TableCell>
      <TableCell>{item.stock}</TableCell>
      <TableCell>
        <Button variant="ghost" size="sm" onClick={startEdit}>
          <Edit2 className="h-4 w-4 mr-1" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

// --- Page ---

const EditableTablesShowcasePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);

  const handleUpdateProduct = (id: number, field: keyof Product, value: any) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleUpdateInventory = (updatedItem: InventoryItem) => {
    setInventory(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  return (
    <ShowcasePage
      title="Editable Tables"
      description="Demonstrate inline editing patterns using the `EditableTableCell` primitive and direct `useInlineEdit` usage for full rows."
    >
      {/* Section 1: Cell Editing */}
      <ShowcaseSection
        title="Inline Cell Editing"
        description="Uses the reusable `EditableTableCell` component. Best for quick updates to single fields."
      >
        <CodeExample
          id="inline-editing-shared"
          title="Using EditableTableCell"
          code={`// Example: EditableTableCell usage
<EditableTableCell 
  value={product.price} 
  type="number" 
  onSave={(val) => update(product.id, 'price', val)} 
/>`}
        >
          <JsonPreview data={products} title="Product" />

          <Card className="py-0 overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[20%]">Product Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="w-[20%]">Price</TableHead>
                    <TableHead className="w-[20%]">Status</TableHead>
                    <TableHead className="text-center w-[20%]">In Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <EditableTableCell 
                          value={product.name} 
                          onSave={(val) => handleUpdateProduct(product.id, 'name', val)} 
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                      <TableCell>
                        <EditableTableCell 
                          value={product.price} 
                          type="number"
                          prefix="$"
                          onSave={(val) => handleUpdateProduct(product.id, 'price', val)} 
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={product.status}
                          onValueChange={(v) => handleUpdateProduct(product.id, 'status', v)}
                        >
                          <SelectTrigger className="h-8 w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={product.inStock}
                          onCheckedChange={(v) => handleUpdateProduct(product.id, 'inStock', v)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      {/* Section 2: Row Editing */}
      <ShowcaseSection
        title="Full Row Editing"
        description="Demonstrates using `useInlineEdit` to manage the state of an entire object/row. Best for dense data or when fields are dependent."
      >
        <CodeExample
          id="full-row-editing"
          title="Row-Level Editing"
          code={`const RowEditor = ({ item, onSave }) => {
  // Pass the entire object as initialValue
  const { isEditing, draft, setDraft, saveEdit, inputProps } = useInlineEdit({
    initialValue: item,
    onSave
  });

  if (isEditing) {
    return (
      <TableRow>
        <TableCell>
          <Input 
            value={draft.name} 
            onChange={e => setDraft({...draft, name: e.target.value})}
            {...inputProps} 
          />
        </TableCell>
        {/* ... other inputs ... */}
        <TableCell><Button onClick={saveEdit}>Save</Button></TableCell>
      </TableRow>
    );
  }
  // ... render display mode
}`}
        >
          <JsonPreview data={inventory} title="Inventory" />

          <Card className="py-0 overflow-hidden">
            <CardContent className="p-0">

              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item) => (
                    <FullRowEditableRow 
                      key={item.id} 
                      item={item} 
                      onSave={handleUpdateInventory} 
                    />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default EditableTablesShowcasePage;
