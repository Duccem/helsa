'use client';

import { Button } from '@helsa/ui/components/button';
import { Card, CardFooter, CardHeader, CardTitle } from '@helsa/ui/components/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@helsa/ui/components/form';
import { Input } from '@helsa/ui/components/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useUpdateDoctor } from '../../hooks/use-doctor';

const formSchema = z.object({
  experience: z.string().optional(),
});

type ExperienceValue = z.infer<typeof formSchema>;

export const ExperienceSection = ({ experience, id }: ExperienceValue & { id: string }) => {
  const [isEditing, setIsEditing] = useState(false);
  const toggleEdit = () => setIsEditing((current) => !current);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { experience },
  });
  const { isSubmitting, isValid } = form.formState;
  const router = useRouter();
  const { updateDoctor } = useUpdateDoctor(id);

  const onSubmit = async (data: ExperienceValue) => {
    try {
      await updateDoctor({
        experience: Number(data.experience),
      });
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error('An error occurred. Please try again.');
    }
  };

  return (
    <Card className="rounded-none bg-transparent">
      <Form {...form}>
        <form action="" onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader className="">
            <div>
              <CardTitle>Tiempo de experiencia</CardTitle>
              <p className="text-muted-foreground text-sm mt-5">
                Este es el tiempo que llevas trabajando en tu profesión.
              </p>
              {!isEditing ? (
                <p className="text-primary font-bold mt-3">{form.getValues('experience')}</p>
              ) : (
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem className="flex-1 mt-5">
                      <FormControl>
                        <Input {...field} className="rounded-none"></Input>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </CardHeader>
          <CardFooter className="border-t pt-4 flex justify-between items-start gap-2 md:items-center flex-col md:flex-row">
            <p className="text-muted-foreground text-xs">La medida en años de tu experiencia.</p>
            {isEditing ? (
              <div className="flex justify-end items-center gap-3">
                <Button
                  onClick={() => {
                    form.reset();
                    toggleEdit();
                  }}
                  className="rounded-none"
                >
                  Cancelar
                </Button>
                <Button disabled={!isValid || isSubmitting} type="submit" className="rounded-none">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
            ) : (
              <Button onClick={toggleEdit} className="rounded-none">
                Editar
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
