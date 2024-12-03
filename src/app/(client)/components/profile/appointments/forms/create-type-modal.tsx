'use client';
import { createAppointmentType } from '@/app/(server)/actions/doctor/create-appointment-type';
import { InputColor } from '@/libs/ducen-ui/components/input-color';
import { Button } from '@/libs/shadcn-ui/components/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/libs/shadcn-ui/components/dialog';
import { Form, FormControl, FormField, FormItem } from '@/libs/shadcn-ui/components/form';
import { Input } from '@/libs/shadcn-ui/components/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

type Props = {
  onOpenChange: (isOpen: boolean) => void;
  isOpen: boolean;
};

const formSchema = z.object({
  name: z.string(),
  duration: z.string(),
  color: z.string(),
});

const CreateTypeModal = ({ isOpen, onOpenChange }: Props) => {
  const router = useRouter();
  const createType = useAction(createAppointmentType, {
    onSuccess: () => {
      onOpenChange(false);
      toast.success('Successfully created categories.');
      router.refresh();
    },
    onError: () => {
      toast.error('Something went wrong please try again.');
    },
  });
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      duration: '',
      color: '#000000',
    },
  });

  useEffect(() => {
    form.reset({
      color: undefined,
      duration: undefined,
      name: undefined,
    });
  }, [isOpen]);

  function onSubmit(data: z.infer<typeof formSchema>) {
    createType.execute({
      name: data.name,
      duration: Number(data.duration),
      color: data.color,
    });
  }
  return (
    <DialogContent className="max-w-[455px] sm:rounded-none">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="p-4">
            <DialogHeader className="mb-4">
              <DialogTitle>Crear categoría</DialogTitle>
              <DialogDescription>Crea tus propios tipos de citas aqui</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col space-y-6 max-h-[400px] overflow-auto">
              <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                  <FormField
                    control={form.control}
                    name={`name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <InputColor
                            autoFocus
                            placeholder="Name"
                            onChange={({ name, color }) => {
                              field.onChange(name);
                              form.setValue(`color`, color);
                            }}
                            defaultValue={field.value}
                            defaultColor={form.watch(`color`)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex-1 relative">
                    <FormField
                      control={form.control}
                      name={`duration`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Duración"
                              name={form.watch(`name`)}
                              className="rounded-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t-[1px] pt-4 mt-8 items-center !justify-between">
              <div>
                {Object.values(form.formState.errors).length > 0 && (
                  <span className="text-sm text-destructive">Please complete the fields above.</span>
                )}
              </div>
              <Button type="submit" disabled={createType.status === 'executing'}>
                {createType.status === 'executing' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
};

export default CreateTypeModal;
