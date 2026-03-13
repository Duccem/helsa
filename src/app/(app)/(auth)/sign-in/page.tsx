import { requireAnon } from "@/modules/auth/infrastructure/guards/require-anon";
import { SignInForm } from "@/modules/auth/presentation/components/sign-in-form";

export default async function SignInPage() {
  await requireAnon();
  return (
    <div className="flex flex-col gap-6 w-2/3">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl text-foreground">Welcome back</h2>
        <p className="text-muted-foreground">Enter your email and password to access your account.</p>
      </div>
      <SignInForm />
    </div>
  );
}

