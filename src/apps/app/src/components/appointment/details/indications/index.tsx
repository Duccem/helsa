'use client';
import { Primitives } from '@helsa/ddd/types/primitives';
import { Appointment } from '@helsa/engine/appointment/domain/appointment';
import {
  appointmentInitialData,
  getAppointment,
} from '@helsa/engine/appointment/infrastructure/api/http-appointment-api';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@helsa/ui/components/accordion';
import { Badge } from '@helsa/ui/components/badge';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Paperclip, Pill, Stethoscope } from 'lucide-react';

const typesDiagnosis = {
  ALLERGY: 'Alergia',
  DISEASE: 'Enfermedad',
  CHRONIC_DISEASE: 'Enfermedad crónica',
  SYMPTOM: 'Síntomas',
};

const typesTreatments = {
  MEDICATION: 'Medicamento',
  THERAPY: 'Terapia',
  PROCEDURE: 'Procedimiento',
};

const typesOrders = {
  TEST: 'Exámenes',
  REMITTANCE: 'Remisión',
};

const Indications = ({ data }: { data: Primitives<Appointment> }) => {
  const { data: appointment, isLoading } = useQuery({
    queryKey: ['appointment', data.id],
    initialData: appointmentInitialData,
    queryFn: async () => getAppointment(data.id),
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <Loader2 className="size-10 animate-spin" />
      </div>
    );
  }
  return (
    <Accordion type="multiple" defaultValue={[]} className="w-full px-1">
      <AccordionItem value="diagnoses">
        <AccordionTrigger>
          <div className="flex justify-start items-center gap-2">
            Diagnósticos <Stethoscope className="size-4" />
          </div>
        </AccordionTrigger>

        <AccordionContent className="space-y-3">
          {appointment?.diagnostics?.map((diagnosis, index) => (
            <div
              key={`${diagnosis.id}-${index}`}
              className="flex flex-col items-start justify-between p-3 gap-2 border rounded-lg"
            >
              <div className="flex justify-between items-center w-full">
                {/* <p className="text-sm">{pathologies?.find((c) => c.id === diagnosis.pathologyId)?.name ?? ''}</p> */}
                <Badge className="" variant={'default'}>
                  {typesDiagnosis[diagnosis.type]}
                </Badge>
              </div>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="treatments">
        <AccordionTrigger>
          <div className="flex justify-start items-center gap-2">
            Tratamientos <Pill className="size-4" />
          </div>
        </AccordionTrigger>

        <AccordionContent className="space-y-3">
          {appointment?.treatments?.map((treatment, index) => (
            <div
              key={`${treatment.id}-${index}`}
              className="flex flex-col items-start justify-between p-3 gap-2 border rounded-lg"
            >
              <div className="flex justify-between items-center w-full">
                <p className="text-sm">
                  {treatment.medication?.name} / {treatment.medication?.dose} cada {treatment.medication?.frequency}
                </p>
                <Badge variant={'default'}>{typesTreatments[treatment.type]}</Badge>
              </div>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="orders">
        <AccordionTrigger>
          <div className="flex justify-start items-center gap-2">
            Ordenes <Paperclip className="size-4" />
          </div>
        </AccordionTrigger>

        <AccordionContent className="space-y-3">
          {appointment?.orders?.map((order, index) => (
            <div
              key={`${order.id}-${index}`}
              className="flex flex-col items-start justify-between p-3 gap-2 border rounded-lg"
            >
              <div className="flex justify-between items-center w-full">
                <p className="text-sm">{order.description}</p>
                <Badge variant={'default'}>{typesOrders[order.type]}</Badge>
              </div>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default Indications;
