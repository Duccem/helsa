'use client';

import { createOrder } from '@/src/actions/order/create-order';
import { Primitives } from '@helsa/ddd/types/primitives';
import { Appointment } from '@helsa/engine/appointment/domain/appointment';
import { Button } from '@helsa/ui/components/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@helsa/ui/components/form';
import { RadioGroup, RadioGroupItem } from '@helsa/ui/components/radio-group';
import { Textarea } from '@helsa/ui/components/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { v4 } from 'uuid';
import { z } from 'zod';

const formSchema = z.object({
  type: z.enum(['TEST', 'REMITTANCE']),
  description: z.string(),
});

type FormSchema = z.infer<typeof formSchema>;

type Props = {
  data: Primitives<Appointment>;
  toggle: VoidFunction;
};

const OrdersForm = ({ data, toggle }: Props) => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'TEST',
      description: '',
    },
  });
  const submit = async (values: FormSchema) => {
    try {
      const id = v4();
      await createOrder({
        id,
        type: values.type,
        description: values.description,
        appointmentId: data.id,
        patientId: data.patientId,
      });
      toast.success('Orden agregada correctamente');
      toggle();
    } catch (error) {
      console.log(error);
      toast.error('Error al agregar la orden');
    }
  };
  return (
    <Form {...form}>
      <form
        action=""
        onSubmit={form.handleSubmit(submit, (e) => console.log(e))}
        className="flex flex-col gap-4 justify-between flex-1"
      >
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel className="text-sm">Tipo de orden</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex justify-between items-center"
                  >
                    <FormItem className="flex  items-center p-3 gap-3 border flex-1 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="TEST" />
                      </FormControl>
                      <FormLabel className="font-normal">Prueba</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center p-3 gap-3 border flex-1 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="REMITTANCE" />
                      </FormControl>
                      <FormLabel className="font-normal">Remisión</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel className="text-sm">Descripcion</FormLabel>
                <FormControl>
                  <Textarea {...field} className="rounded-none"></Textarea>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex w-full gap-3">
          <Button onClick={toggle} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting} className="rounded-none flex-1">
            {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar orden'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default OrdersForm;
