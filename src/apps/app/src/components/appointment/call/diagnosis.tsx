'use client';
import { createDiagnosis } from '@/src/actions/diagnostic/create-diagnosis';
import { getPathologies } from '@/src/actions/diagnostic/get-pathologies';
import { Primitives } from '@helsa/ddd/types/primitives';
import { Appointment } from '@helsa/engine/appointment/domain/appointment';
import { DiagnosisStatusValues } from '@helsa/engine/diagnostic/domain/diagnosis-status';
import { DiagnosisTypeValues } from '@helsa/engine/diagnostic/domain/diagnosis-type';
import { Diagnostic } from '@helsa/engine/diagnostic/domain/diagnostic';
import { Pathology } from '@helsa/engine/diagnostic/domain/pathology';
import { Accordion } from '@helsa/ui/components/accordion';
import { Badge } from '@helsa/ui/components/badge';
import { Button } from '@helsa/ui/components/button';
import { Combobox } from '@helsa/ui/components/combobox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@helsa/ui/components/form';
import { RadioGroup, RadioGroupItem } from '@helsa/ui/components/radio-group';
import { Sheet, SheetContent, SheetHeader, SheetOverlay, SheetTitle, SheetTrigger } from '@helsa/ui/components/sheet';
import { Textarea } from '@helsa/ui/components/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@helsa/ui/components/tooltip';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClipboardMinus, ExternalLink, Loader2, TextSearchIcon, Trash2, X } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { v4 } from 'uuid';
import { z } from 'zod';
import Treatment from './treatment';

const formSchema = z.object({
  diagnosis: z.string(),
  symptoms: z.string(),
  notes: z.string(),
  type: z.enum(['ALLERGY', 'DISEASE', 'CHRONIC_DISEASE', 'SYMPTOM']),
});

function transformOption(specialty: { id: string; name: string }) {
  return {
    value: specialty.name,
    label: specialty.name,
  };
}

const Diagnosis = ({ data }: { data: Primitives<Appointment> }) => {
  const [editing, setEditing] = useState<any>(false);
  const [fetching, setFetching] = useState(true);
  const [diagnoses, setDiagnoses] = useState<Primitives<Diagnostic>[]>(data.diagnostics ?? []);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [diagnosesCodes, setDiagnosesCodes] = useState<Primitives<Pathology>[]>([]);
  const [loading, setLoading] = useState(false);
  const action = useAction(getPathologies, {
    onSuccess: ({ data }) => {
      setFetching(false);
      console.log(data);
      if (!data) {
        setDiagnosesCodes([]);
        return;
      }
      setDiagnosesCodes(data);
    },
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      diagnosis: '',
      symptoms: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (editing) {
      action.execute();
    }
  }, [editing]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const id = v4();
      await createDiagnosis({
        id,
        type: values.type,
        description: values.notes,
        patientId: data.patientId,
        doctorId: data.doctorId,
        appointmentId: data.id,
        pathologyId: diagnosesCodes.find((d) => d.name === values.diagnosis)?.id!,
      });
      const newDiagnosis = {
        id,
        description: values.notes,
        type: values.type as DiagnosisTypeValues,
        patientId: data.patientId,
        doctorId: data.doctorId,
        appointmentId: data.id,
        pathologyId: diagnosesCodes.find((d) => d.name === values.diagnosis)?.id!,
        status: 'ACTIVE' as DiagnosisStatusValues,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setDiagnoses((current) => [...current, newDiagnosis]);
      setEditing(false);
    } catch (error) {
      toast.success('Diagnostico agregado correctamente');
    }
  };
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
              <div className="flex justify-between flex-col gap-4 flex-1">
                <Accordion type="single" collapsible className="">
                  {diagnoses?.map((diagnosis, index) => (
                    <div key={`${diagnosis.id}-${index}`} className="flex items-center justify-between py-1 px-6">
                      <div className="flex items-center gap-5">
                        <div className="text-sm font-bold">
                          {diagnosesCodes.find((c) => c.id === diagnosis.pathologyId)?.name!}
                        </div>
                        <Badge className="" variant={'outline'}>
                          {diagnosis.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant={'ghost'} size={'icon'} className="rounded-full">
                                <TextSearchIcon className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-none">
                              <p>Detalles del diagnostico</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Treatment name={diagnosesCodes.find((c) => c.id === diagnosis.pathologyId)?.name!} />
                            </TooltipTrigger>
                            <TooltipContent className="rounded-none">
                              <p>Tratamiento</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant={'ghost'} size={'icon'} className="rounded-full">
                                <Trash2 className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-none">
                              <p>Eliminar</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  ))}
                </Accordion>
                <Button onClick={() => setEditing(true)}>
                  <ClipboardMinus className="size-4" />
                  Agregar diagnostico
                </Button>
              </div>
            </>
          )}
          {editing && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 justify-between flex-1">
                <div className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="text-sm">Tipo de diagnostico</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex justify-between items-center"
                          >
                            <FormItem className="flex  items-center p-3 gap-3 border flex-1 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="ALLERGY" />
                              </FormControl>
                              <FormLabel className="font-normal">Allergy</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center p-3 gap-3 border flex-1 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="DISEASE" />
                              </FormControl>
                              <FormLabel className="font-normal">Disease</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center p-3 gap-3 border flex-1 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="CHRONIC_DISEASE" />
                              </FormControl>
                              <FormLabel className="font-normal">Chronic</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Combobox
                    onChange={(v) => {
                      const value = v as string;
                      const symptom = data.symptoms?.find((s) => s.name == value);
                      if (!symptom) return;
                      setSelectedSymptoms((current) =>
                        current.includes(symptom.name)
                          ? current.filter((s) => s !== symptom.name)
                          : [...current, symptom.name]
                      );
                    }}
                    options={(data.symptoms || []).map(transformOption)}
                    placeholder="Síntomas presentes relacionados"
                  />
                  <div className="flex items-center gap-2 flex-wrap my-3">
                    {selectedSymptoms.map((symptom, index) => (
                      <Button
                        key={index}
                        className="rounded-full h-8 px-3 bg-secondary hover:bg-secondary font-normal text-[#878787] flex justify-start group "
                        onClick={() => setSelectedSymptoms((current) => current.filter((s) => s !== symptom))}
                      >
                        <X className="scale-0 group-hover:scale-100 transition-all w-0 group-hover:w-4" />
                        <span>{symptom}</span>
                      </Button>
                    ))}
                  </div>
                  <FormField
                    control={form.control}
                    name="diagnosis"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="text-sm">Diagnostico</FormLabel>
                        <FormControl>
                          <Combobox
                            onChange={(v) => {
                              field.onChange({ target: { value: v } });
                            }}
                            options={diagnosesCodes.map(transformOption)}
                            placeholder="Diagnostico"
                            value={field.value}
                            loading={fetching}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="text-sm">Notas adicionales</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="rounded-none"></Textarea>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex w-full gap-3">
                  <Button onClick={(e) => setEditing(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting} className="rounded-none flex-1">
                    {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar diagnostico'}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Diagnosis;
