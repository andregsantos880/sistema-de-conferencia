/**
 * LineItemsEditor Component
 * 
 * Editable table for managing invoice line items with add/remove functionality.
 */

import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/shared/ui/shadcn/components/ui/table';
import type { CreateLineItemDto } from '../../domain/models/Invoice';
import { calculateLineItemTotal, formatCurrency } from '../../domain/models/Invoice';

interface LineItemsEditorProps {
  items: CreateLineItemDto[];
  currency: string;
  onChange: (items: CreateLineItemDto[]) => void;
  errors?: Record<number, Record<string, string>>;
}

export function LineItemsEditor({ items, currency, onChange, errors }: LineItemsEditorProps) {
  const { t } = useTranslation('invoices');
  const handleAddItem = () => {
    onChange([
      ...items,
      {
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  const handleItemChange = (
    index: number,
    field: keyof CreateLineItemDto,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'description' ? value : Number(value) || 0,
    };
    onChange(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + calculateLineItemTotal(item), 0);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">{t('lineItems.description')}</TableHead>
              <TableHead className="w-[12%]">{t('lineItems.quantity')}</TableHead>
              <TableHead className="w-[18%]">{t('lineItems.unitPrice')}</TableHead>
              <TableHead className="w-[12%]">{t('lineItems.discount')}</TableHead>
              <TableHead className="w-[14%] text-right">{t('lineItems.total')}</TableHead>
              <TableHead className="w-[4%]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  {t('lineItems.noItems')}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, index) => {
                const itemErrors = errors?.[index];
                const lineTotal = calculateLineItemTotal(item);

                return (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder={t('lineItems.description')}
                        className={itemErrors?.description ? 'border-destructive' : ''}
                      />
                      {itemErrors?.description && (
                        <p className="text-xs text-destructive mt-1">{itemErrors.description}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className={itemErrors?.quantity ? 'border-destructive' : ''}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        className={itemErrors?.unitPrice ? 'border-destructive' : ''}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={item.discount ?? 0}
                        onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(lineTotal, currency)}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">{t('lineItems.removeItem')}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
          {items.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} className="text-right font-medium">
                  {t('lineItems.subtotal')}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(subtotal, currency)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>

      <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
        <Plus className="h-4 w-4 mr-2" />
        {t('lineItems.addItem')}
      </Button>
    </div>
  );
}

export default LineItemsEditor;
