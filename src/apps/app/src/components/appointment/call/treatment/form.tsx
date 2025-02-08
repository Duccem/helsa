'use client';

import { createTreatment } from '@/src/actions/treatment/create-treatment';
import { Primitives } from '@helsa/ddd/types/primitives';
import { Appointment } from '@helsa/engine/appointment/domain/appointment';
import { Button } from '@helsa/ui/components/button';
import { DatePicker } from '@helsa/ui/components/date-picker';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@helsa/ui/components/form';
import { Input } from '@helsa/ui/components/input';
import { InputSelect } from '@helsa/ui/components/internal/input-select';
import { RadioGroup, RadioGroupItem } from '@helsa/ui/components/radio-group';
import { Textarea } from '@helsa/ui/components/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { v4 } from 'uuid';
import { z } from 'zod';

const formSchema = z.object({
  description: z.string(),
  type: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  medication: z
    .object({
      name: z.string(),
      dose: z.string(),
      frequency: z.string(),
      presentation: z.string(),
    })
    .optional(),
  therapy: z
    .object({
      description: z.string(),
    })
    .optional(),
  procedure: z
    .object({
      description: z.string(),
    })
    .optional(),
});

type Props = {
  appointment: Primitives<Appointment>;
  toggle: VoidFunction;
};

const TreatmentForm = ({ appointment, toggle }: Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      type: 'MEDICATION',
      startDate: new Date(),
      endDate: new Date(),
      medication: {
        name: '',
        dose: '',
        frequency: '',
        presentation: '',
      },
      therapy: {
        description: '',
      },
      procedure: {
        description: '',
      },
    },
  });
  const submit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createTreatment({
        appointmentId: appointment.id,
        description: values.description,
        startDate: values.startDate,
        endDate: values.endDate,
        type: values.type,
        medication: values.medication,
        therapy: values.therapy,
        procedure: values.procedure,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
        status: 'IN_PROGRESS',
        id: v4(),
      });
      toast.success('Tratamiento guardado');
      toggle();
    } catch (error) {
      toast.error('Error al guardar el tratamiento');
    }
  };
  return (
    <Form {...form}>
      <form
        action=""
        onSubmit={form.handleSubmit(submit, (errors) => console.log(errors))}
        className="flex flex-col gap-4 justify-between flex-1"
      >
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel className="text-sm">Tipo de tratamiento</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex justify-between items-center"
                  >
                    <FormItem className="flex  items-center p-3 gap-3 border flex-1 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="MEDICATION" />
                      </FormControl>
                      <FormLabel className="font-normal">Medicina</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center p-3 gap-3 border flex-1 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="THERAPY" />
                      </FormControl>
                      <FormLabel className="font-normal">Terapia</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center p-3 gap-3 border flex-1 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="PROCEDURE" />
                      </FormControl>
                      <FormLabel className="font-normal">Procedimiento</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch('type') === 'MEDICATION' && (
            <>
              <FormField
                control={form.control}
                name="medication.name"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel className="text-sm">Nombre de la medicina</FormLabel>
                    <FormControl>
                      <Input {...field} className="rounded-none"></Input>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="medication.dose"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel className="text-sm">Dosis</FormLabel>
                    <FormControl>
                      <InputSelect onChange={field.onChange} options={['mg', 'ml']} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="medication.presentation"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel className="text-sm">Via</FormLabel>
                    <FormControl>
                      <InputSelect onChange={field.onChange} options={['Oral', 'Inyección', 'Crema']} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="medication.frequency"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel className="text-sm">Frecuencia</FormLabel>
                    <FormControl>
                      <InputSelect onChange={field.onChange} options={['H', 'D', 'S', 'M']} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {form.watch('type') === 'THERAPY' && (
            <>
              <FormField
                control={form.control}
                name="therapy.description"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel className="text-sm">Descripción de la terapia</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="rounded-none resize-none"></Textarea>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          {form.watch('type') === 'PROCEDURE' && (
            <>
              <FormField
                control={form.control}
                name="procedure.description"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel className="text-sm">Descripción del procedimiento</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="rounded-none resize-none"></Textarea>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel className="text-sm">Instrucciones</FormLabel>
                <FormControl>
                  <Textarea {...field} className="rounded-none resize-none"></Textarea>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-3 justify-between items-center">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-sm">Fecha de inicio</FormLabel>
                  <FormControl>
                    <DatePicker selected={field.value} onSelect={field.onChange} placeholder="Selecciona una fecha" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-sm">Fecha de finalización</FormLabel>
                  <FormControl>
                    <DatePicker selected={field.value} onSelect={field.onChange} placeholder="Selecciona una fecha" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex w-full gap-3">
          <Button onClick={() => toggle()} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting} className="rounded-none flex-1">
            {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar diagnostico'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TreatmentForm;
