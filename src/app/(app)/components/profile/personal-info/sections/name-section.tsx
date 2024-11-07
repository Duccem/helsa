'use client';

import { Button } from '@/libs/shadcn-ui/components/button';
import { Card, CardFooter, CardHeader, CardTitle } from '@/libs/shadcn-ui/components/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/libs/shadcn-ui/components/form';
import { Input } from '@/libs/shadcn-ui/components/input';
import { useUser } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: 'First name must be at least 2 characters.',
  }),
  lastName: z.string().min(2, {
    message: 'Last name must be at least 2 characters.',
  }),
});

type NameFormValues = z.infer<typeof formSchema>;

export const NameSection = ({ firstName, lastName }: NameFormValues) => {
  const [isEditing, setIsEditing] = useState(false);
  const toggleEdit = () => setIsEditing((current) => !current);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { firstName, lastName },
  });
  const { isSubmitting, isValid } = form.formState;
  const { user } = useUser();
  const router = useRouter();

  const onSubmit = async (data: NameFormValues) => {
    try {
      await user.update({ firstName: data.firstName, lastName: data.lastName });
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
              <CardTitle>Nombres</CardTitle>
              <p className="text-muted-foreground text-sm mt-5">
                Este es el nombre que se mostrara en tu perfil. Puedes cambiarlo
              </p>
              {!isEditing ? (
                <p className="text-primary font-bold mt-3">
                  {form.getValues('firstName')} {form.getValues('lastName')}
                </p>
              ) : (
                <div className="flex justify-between items-center gap-3 mt-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input {...field} className='rounded-none'></Input>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Apellido</FormLabel>
                        <FormControl>
                          <Input {...field} className='rounded-none'></Input>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          </CardHeader>
          <CardFooter className="border-t pt-4 flex justify-between items-start gap-2 md:items-center flex-col md:flex-row">
            <p className="text-muted-foreground text-xs">
              Por favor ingresa tu nombre completo, o un nombre para mostrar con el que te sientas cómodo.
            </p>
            {isEditing ? (
              <div className="flex justify-end items-center gap-3">
                <Button onClick={toggleEdit} className="rounded-none">
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
