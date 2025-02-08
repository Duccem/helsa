import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

type Props = {
  selected?: Date;
  onSelect: (date?: Date) => void;
  placeholder?: string;
};

export function DatePicker({ onSelect, selected, placeholder = 'Pick a date' }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn('gap-3 w-full justify-center text-left font-normal', !selected && 'text-muted-foreground')}
        >
          <CalendarIcon className="size-4" />
          {selected ? format(selected, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 rounded-none" align="start">
        <Calendar mode="single" selected={selected} onSelect={onSelect} initialFocus className="w-full" />
      </PopoverContent>
    </Popover>
  );
}
