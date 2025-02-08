'use client';
import { Primitives } from '@helsa/ddd/types/primitives';
import { Treatment } from '@helsa/engine/treatment/domain/treatment';
import { TreatmentStatusValues } from '@helsa/engine/treatment/domain/treatment-status';
import { Button } from '@helsa/ui/components/button';
import { cn } from '@helsa/ui/lib/utils';
import { Ellipsis, Pill } from 'lucide-react';
type Props = {
  toggle: VoidFunction;
  treatments: Primitives<Treatment>[];
};

const types = {
  MEDICATION: 'Medicamento',
  THERAPY: 'Terapia',
  PROCEDURE: 'Procedimiento',
};
const TreatmentList = ({ toggle, treatments }: Props) => {
  return (
    <div className="flex justify-between flex-col gap-4 flex-1">
      <div className="flex flex-col gap-3">
        {treatments?.map((treatment, index) => (
          <div
            key={`${treatment.id}-${index}`}
            className="flex flex-col items-start justify-between p-3 gap-2 border rounded-none"
          >
            <div className="flex justify-between items-center w-full">
              <div className="flex justify-start items-center gap-2">
                <div className="px-2 py-1 bg-color-brand-primary rounded-sm w-fit text-xs">{types[treatment.type]}</div>
                <div
                  className={cn('text-xs py-1 px-2 rounded-sm', {
                    'bg-green-600': treatment.status === TreatmentStatusValues.IN_PROGRESS,
                    'bg-blue-600': treatment.status === TreatmentStatusValues.COMPLETED,
                  })}
                >
                  {treatment.type === 'MEDICATION' && treatment.medication?.name}
                  {treatment.type === 'THERAPY' && treatment.therapy?.description}
                  {treatment.type === 'PROCEDURE' && treatment.procedure?.description}
                </div>
                <div>
                  <span className="text-sm font-bold">
                    {new Date(treatment.endDate).toLocaleDateString()}
                    {treatment.type !== 'PROCEDURE' && ' - ' + new Date(treatment.startDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Ellipsis className="size-4" />
            </div>
          </div>
        ))}
      </div>
      <Button onClick={toggle}>
        <Pill className="size-4" />
        Agregar tratamiento
      </Button>
    </div>
  );
};

export default TreatmentList;
