export const dynamic = 'force-dynamic';
import SignUpForm from '@/src/components/auth/sign-up-form';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}

export const metadata = {
  title: 'Registrarse',
  description: 'Crea una cuenta en Helsa para acceder a todas las funcionalidades.',
};
