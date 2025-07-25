'use client';
import * as successAnimation from '@/public/animations/success_animation.json';
import { createHospital } from '@helsa/engine/hospital/infrastructure/http-hospital-api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@helsa/ui/components/alert-dialog';
import { Button } from '@helsa/ui/components/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@helsa/ui/components/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@helsa/ui/components/form';
import { Input } from '@helsa/ui/components/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Lottie from 'react-lottie';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres' }),
  street: z.string(),
  city: z.string(),
  country: z.string(),
  zipCode: z.string(),
});

const HospitalForm = ({ userId }: { userId: string }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      street: '',
      city: '',
      country: '',
      zipCode: '',
    },
    mode: 'all',
  });
  const { isSubmitting } = form.formState;
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: { name: string; street: string; city: string; country: string; zipCode: string }) =>
      createHospital({
        hospital: {
          adminId: userId,
          name: data.name,
          address: {
            street: data.street || '',
            city: data.city || '',
            country: data.country || '',
            zipCode: data.zipCode || '',
            coordinates: {
              latitude: 0,
              longitude: 0,
            },
          },
        },
      }),
    onError: (error: any) => {
      console.error(JSON.stringify(error, null, 2));
      toast.error('An error occurred. Please try again later.');
    },
    onSuccess: () => {
      setShowSuccessModal(true);
    },
  });

  return (
    <div className="grid w-full h-full grow items-center px-20">
      <Form {...form}>
        <form action="" className="w-full" onSubmit={form.handleSubmit((data) => mutate(data))}>
          <Card className="border-none shadow-none w-full">
            <CardHeader>
              <CardTitle>Bienvenido</CardTitle>
              <CardDescription>
                Por favor, completa los siguientes campos para continuar con el proceso de registro
              </CardDescription>
            </CardHeader>
            <CardContent className="k">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="my-2">
                    <FormLabel className="text-sm">Dirección</FormLabel>
                    <FormControl>
                      <Input {...field} className="rounded-none"></Input>
                    </FormControl>
                    <FormMessage></FormMessage>
                  </FormItem>
                )}
              />
              <div className="flex items-center w-full gap-3">
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem className="my-2 flex-1">
                      <FormLabel className="text-sm">Dirección</FormLabel>
                      <FormControl>
                        <Input {...field} className="rounded-none"></Input>
                      </FormControl>
                      <FormMessage></FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="my-2 flex-1">
                      <FormLabel className="text-sm">Ciudad</FormLabel>
                      <FormControl>
                        <Input {...field} className="rounded-none"></Input>
                      </FormControl>
                      <FormMessage></FormMessage>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex items-center w-full gap-3">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem className="my-2 flex-1">
                      <FormLabel className="text-sm">País</FormLabel>
                      <FormControl>
                        <Input {...field} className="rounded-none"></Input>
                      </FormControl>
                      <FormMessage></FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem className="my-2 flex-1">
                      <FormLabel className="text-sm">Código postal</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" className="rounded-none"></Input>
                      </FormControl>
                      <FormMessage></FormMessage>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter>
              <div className="grid w-full gap-y-4">
                <Button type="submit" className="rounded-none">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Continuar'}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </form>
      </Form>
      <AlertDialog open={showSuccessModal}>
        <AlertDialogContent className="rounded-none">
          <Lottie
            options={{
              autoplay: true,
              loop: false,
              animationData: successAnimation,
              rendererSettings: {
                preserveAspectRatio: 'xMidYMid slice',
              },
            }}
            style={{ width: 300, height: 300 }}
          ></Lottie>
          <AlertDialogHeader className="my-0">
            <AlertDialogTitle className="text-center text-2xl">Verificado!</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-lg">
              Has completado el proceso de registro exitosamente
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex w-full sm:justify-center items-center">
            <AlertDialogAction asChild>
              <Button
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push('/dashboard');
                }}
                size="lg"
                className="rounded-none"
              >
                Ir al inicio
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HospitalForm;
