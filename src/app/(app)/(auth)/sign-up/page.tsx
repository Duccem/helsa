import { requireAnon } from "@/modules/auth/infrastructure/guards/require-anon";
import { SignUpForm } from "@/modules/auth/presentation/components/sign-up-form";
import Link from "next/link";

export default async function SignUpPage() {
  await requireAnon();
  return (
    <div className="flex flex-col gap-6 w-2/3">
      <SignUpForm />
      <div className="text-center text-sm text-muted-foreground">
        Already Have An Account?{" "}
        <Link href="/sign-in" className="text-indigo-500 hover:underline">
          Sign In.
        </Link>
      </div>
    </div>
  );
}

