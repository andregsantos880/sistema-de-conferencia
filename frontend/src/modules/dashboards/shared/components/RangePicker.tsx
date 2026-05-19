import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Calendar } from '@/shared/ui/shadcn/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/shadcn/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/shadcn/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/shadcn/lib/utils';
import type { DateRange, DateRangePreset } from '../utils/dateRange';
import { formatDateRange, getPresetLabel } from '../utils/dateRange';
import { useState } from 'react';

export interface RangePickerProps {
  range: DateRange;
  onRangeChange: (range: DateRange) => void;
  onPresetChange: (preset: DateRangePreset) => void;
  className?: string;
}

const PRESETS: DateRangePreset[] = ['7d', '30d', '90d', 'ytd', '12m'];

export function RangePicker({
  range,
  onRangeChange,
  onPresetChange,
  className,
}: RangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState<Date | undefined>(range.from);
  const [customTo, setCustomTo] = useState<Date | undefined>(range.to);

  const handlePresetChange = (preset: string) => {
    onPresetChange(preset as DateRangePreset);
    console.log("PRESET", preset)
    if (preset === 'custom') {
      setIsOpen(true);
    }
  };

  const handleCustomApply = () => {
    if (customFrom && customTo) {
      onRangeChange({ from: customFrom, to: customTo, preset: 'custom' });
      setIsOpen(false);
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Select value={range.preset || 'custom'} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map((preset) => (
            <SelectItem key={preset} value={preset}>
              {getPresetLabel(preset)}
            </SelectItem>
          ))}
          <SelectItem value="custom">Custom range</SelectItem>
        </SelectContent>
      </Select>

      {range.preset === 'custom' && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn('justify-start text-left font-normal')}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDateRange(range)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 space-y-3">
              <div>
                <p className="text-sm font-medium mb-2">From</p>
                <Calendar
                  mode="single"
                  selected={customFrom}
                  onSelect={setCustomFrom}
                  autoFocus
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-2">To</p>
                <Calendar
                  mode="single"
                  selected={customTo}
                  onSelect={setCustomTo}
                />
              </div>
              <Button onClick={handleCustomApply} className="w-full">
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
