"use client";

import { Facebook } from "@/modules/shared/presentation/components/icons/facebook";
import { Google } from "@/modules/shared/presentation/components/icons/google";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/modules/shared/presentation/components/ui/field";
import { Input } from "@/modules/shared/presentation/components/ui/input";
import { Separator } from "@/modules/shared/presentation/components/ui/separator";
import { authClient } from "@/modules/auth/infrastructure/auth-client";
import { useForm } from "@tanstack/react-form";
import { Activity, ArrowLeft, Building2, Loader2, ShieldCheck, Stethoscope, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import z from "zod";
import { useState } from "react";

const roleOptions = [
  {
    value: "doctor",
    title: "Doctor",
    description: "For healthcare professionals who provide consultations, diagnoses, and treatment plans.",
    highlights: ["Manage appointments", "Issue prescriptions", "Follow up with patients"],
    icon: Stethoscope,
  },
  {
    value: "patient",
    title: "Patient",
    description: "For people seeking care, booking consultations, and tracking their health journey.",
    highlights: ["Book appointments", "Chat with doctors", "Review prescriptions"],
    icon: UserRound,
  },
  {
    value: "admin",
    title: "Clinic",
    description: "For organization owners or staff managing teams, billing, and operational settings.",
    highlights: ["Manage organization", "Control user access", "Track billing and operations"],
    icon: Building2,
  },
] as const;

const formSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.email().min(1, "Email is required"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const SignUpForm = () => {
  const [role, setRole] = useState<"doctor" | "patient" | "admin" | undefined>(undefined);
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackURL = searchParams.get("callbackURL");
  const selectedRole = roleOptions.find((option) => option.value === role);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          name: value.name,
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            router.push((callbackURL as any) || "/new-organization");
          },
          onError: (error) => {
            console.error("Sign-up error:", error);
            toast.error(error instanceof Error ? error.message : "An error occurred during sign-up. Please try again.");
          },
        },
      );
    },
  });

  const oauthSignIn = async (provider: "google" | "facebook") => {
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: callbackURL || `${window.location.origin}/new-organization`,
      });
    } catch (error) {
      console.error("OAuth sign-up error:", error);
    }
  };

  if (!role) {
    return (
      <div className="flex flex-col gap-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">What are your needs?</h2>
          <p className="text-sm text-muted-foreground">
            This helps personalize your onboarding experience. You can update this later in settings.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {roleOptions.map((option) => {
            const Icon = option.icon;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setRole(option.value)}
                className="group relative overflow-hidden rounded-xl border border-border/60  p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300/70 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 cursor-pointer"
                aria-label={`Continue as ${option.title}`}
              >
                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-200/70 bg-indigo-50 text-indigo-700 transition-colors group-hover:bg-indigo-100">
                    <Icon size={18} aria-hidden="true" />
                  </div>
                </div>

                <div className="relative mt-4 space-y-2">
                  <h3 className="text-base font-semibold text-foreground">{option.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{option.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-4"
      id="sign-up-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        {selectedRole ? (
          <div className="flex items-start justify-between gap-4 rounded-lg border  p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{selectedRole.title}</p>
              <p className="text-xs text-muted-foreground">{selectedRole.description}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              onClick={() => setRole(undefined)}
              aria-label="Volver a la seleccion de rol"
            >
              <ArrowLeft />
            </Button>
          </div>
        ) : null}

        <form.Field name="name">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Enter your full name"
                />
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="email">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Enter your email"
                />
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="password">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Create a password"
                  type="password"
                />
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="confirmPassword">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Confirm your password"
                  type="password"
                />
              </Field>
            );
          }}
        </form.Field>

        <form.Subscribe>
          {(state) => (
            <Button type="submit" className="w-full" disabled={!state.canSubmit || state.isSubmitting}>
              {state.isSubmitting ? <Loader2 className="animate-spin" /> : "Create Account"}
            </Button>
          )}
        </form.Subscribe>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or Register With</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="cursor-pointer gap-4 items-center" onClick={() => oauthSignIn("google")}>
            <Google />
            Google
          </Button>
          <Button
            variant="outline"
            className="cursor-pointer gap-4 items-center"
            onClick={() => oauthSignIn("facebook")}
          >
            <Facebook />
            Facebook
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Already Have An Account?{" "}
          <Link href="/sign-in" className="text-indigo-500 hover:underline">
            Sign In.
          </Link>
        </div>
      </FieldGroup>
    </form>
  );
};

