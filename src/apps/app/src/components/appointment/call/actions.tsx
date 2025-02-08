import Diagnosis from '@/src/components/appointment/call/diagnosis';
import Treatment from '@/src/components/appointment/call/treatment';
import { Primitives } from '@helsa/ddd/types/primitives';
import { Appointment } from '@helsa/engine/appointment/domain/appointment';
import { Pathology } from '@helsa/engine/diagnostic/domain/pathology';
import { Button } from '@helsa/ui/components/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@helsa/ui/components/dropdown-menu';
import { PlusCircle } from 'lucide-react';

const Actions = ({ data, pathologies }: { data: Primitives<Appointment>; pathologies: Primitives<Pathology>[] }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={'outline'} className="gap-2">
          Actions
          <PlusCircle />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="rounded-none flex flex-col gap-1" align="end">
        <Diagnosis data={data} pathologies={pathologies} />
        <Treatment data={data} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Actions;
