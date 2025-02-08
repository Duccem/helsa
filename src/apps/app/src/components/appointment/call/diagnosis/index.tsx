'use client';
import { Primitives } from '@helsa/ddd/types/primitives';
import { Appointment } from '@helsa/engine/appointment/domain/appointment';
import { Pathology } from '@helsa/engine/diagnostic/domain/pathology';
import { Button } from '@helsa/ui/components/button';
import { Sheet, SheetContent, SheetHeader, SheetOverlay, SheetTitle, SheetTrigger } from '@helsa/ui/components/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@helsa/ui/components/tooltip';
import { ClipboardMinus, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import DiagnosisForm from './form';
import DiagnosesList from './list';

const Diagnosis = ({ data, pathologies }: { data: Primitives<Appointment>; pathologies: Primitives<Pathology>[] }) => {
  const [editing, setEditing] = useState<any>(false);
  return (
    <Sheet>
      <SheetOverlay />
      <SheetTrigger asChild>
        <Button className="gap-2" variant={'outline'}>
          <ClipboardMinus className="size-4" />
          Diagnostico
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:w-1/3 sm:max-w-full p-4 bg-transparent border-none focus-visible:outline-none ">
        <div className="bg-background p-6 border border-sidebar h-full overflow-y-auto no-scroll space-y-3 flex flex-col">
          <SheetHeader className="flex flex-row justify-between items-center gap-4 border-b mb-3">
            <div className="flex flex-row justify-between w-full items-center gap-4">
              <div className="flex flex-col gap-2 py-2">
                <SheetTitle className="text-xl">Agregar diagnostico</SheetTitle>
                <p className="text-muted-foreground text-xs">
                  Agrega un diagnostico para el paciente{' '}
                  <span className="font-bold capitalize">{data.patient?.user?.name}</span>
                </p>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button className="rounded-full" variant={'ghost'} size={'icon'}>
                      <ExternalLink />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="rounded-none">
                    <p>Ir al historial de diagnósticos</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </SheetHeader>
          {!editing && (
            <>
              <DiagnosesList
                diagnoses={data.diagnostics ?? []}
                pathologies={pathologies}
                toggle={() => setEditing((current: boolean) => !current)}
              />
            </>
          )}
          {editing && (
            <DiagnosisForm
              diagnoses={data.diagnostics ?? []}
              pathologies={pathologies}
              symptoms={data.symptoms ?? []}
              appointment={data}
              toggle={() => setEditing((current: boolean) => !current)}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Diagnosis;
