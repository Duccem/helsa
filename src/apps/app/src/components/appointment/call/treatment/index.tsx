'use client';
import { Primitives } from '@helsa/ddd/types/primitives';
import { Appointment } from '@helsa/engine/appointment/domain/appointment';
import { Button } from '@helsa/ui/components/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@helsa/ui/components/sheet';
import { Pill } from 'lucide-react';
import { useState } from 'react';
import TreatmentForm from './form';
import TreatmentList from './list';

type Props = {
  data: Primitives<Appointment>;
};

const Treatment = ({ data }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="gap-2" variant={'outline'}>
          <Pill className="size-4" />
          Tratamiento
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:w-1/3 sm:max-w-full p-4 bg-transparent border-none focus-visible:outline-none ">
        <div className="bg-background p-6 border border-sidebar h-full overflow-y-auto no-scroll space-y-3 flex flex-col">
          <SheetHeader className="flex flex-row justify-between items-center gap-4 border-b mb-3">
            <div className="flex flex-row justify-start items-center gap-4">
              <div className="flex flex-col gap-2 py-2">
                <SheetTitle className="text-xl">Agregar tratamiento</SheetTitle>
                <p className="text-muted-foreground text-xs">Agrega un tratamiento para el paciente</p>
              </div>
            </div>
          </SheetHeader>

          {!isEditing && (
            <TreatmentList treatments={data.treatments ?? []} toggle={() => setIsEditing((current) => !current)} />
          )}
          {isEditing && (
            <TreatmentForm
              appointment={data}
              toggle={() => {
                setIsEditing(false);
              }}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Treatment;
