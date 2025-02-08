import { Primitives } from '@helsa/ddd/types/primitives';
import { Diagnostic } from '@helsa/engine/diagnostic/domain/diagnostic';
import { Pathology } from '@helsa/engine/diagnostic/domain/pathology';
import { Badge } from '@helsa/ui/components/badge';
import { Button } from '@helsa/ui/components/button';
import { ClipboardMinus, Ellipsis } from 'lucide-react';

type Props = {
  pathologies: Primitives<Pathology>[];
  diagnoses: Primitives<Diagnostic>[];
  toggle: VoidFunction;
};

const typesDiagnosis = {
  ALLERGY: 'Alergia',
  DISEASE: 'Enfermedad',
  CHRONIC_DISEASE: 'Enfermedad crónica',
  SYMPTOM: 'Síntomas',
};

const DiagnosesList = ({ diagnoses, pathologies, toggle }: Props) => {
  return (
    <div className="flex justify-between flex-col gap-4 flex-1">
      <div className="flex flex-col gap-3">
        {diagnoses?.map((diagnosis, index) => (
          <div
            key={`${diagnosis.id}-${index}`}
            className="flex flex-col items-start justify-between p-3 gap-2 border rounded-none"
          >
            <div className="flex justify-between items-center w-full">
              <div className="px-2 py-1 bg-color-brand-primary rounded-sm w-fit text-xs">I70.173</div>
              <Ellipsis className="size-4" />
            </div>
            <div className="flex justify-between items-center w-full">
              <p className="text-sm">{pathologies.find((c) => c.id === diagnosis.pathologyId)?.name!}</p>
              <Badge className="" variant={'default'}>
                {typesDiagnosis[diagnosis.type]}
              </Badge>
            </div>
          </div>
        ))}
      </div>
      <Button onClick={toggle}>
        <ClipboardMinus className="size-4" />
        Agregar diagnostico
      </Button>
    </div>
  );
};

export default DiagnosesList;
