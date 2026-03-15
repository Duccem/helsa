"use client";

import { Button } from "@/modules/shared/presentation/components/ui/button";
import { cn } from "@/modules/shared/presentation/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { Building2, Loader2, Stethoscope, UserRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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

export const SelectRole = () => {
  const [role, setRole] = useState<"doctor" | "patient" | "admin" | undefined>(undefined);
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackURL = searchParams.get("callbackURL");
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      await fetch("/api/user/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
    },
    onSuccess: () => {
      const redirectUrl = role === "admin" ? "/new-organization" : "/home";
      router.push(callbackURL ? callbackURL : redirectUrl);
    },
    onError: (error) => {
      console.error("Error setting role:", error);
      toast.error("An error occurred while setting your role. Please try again.");
    },
  });
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
              className={cn(
                "group relative overflow-hidden rounded-xl border border-border/60  p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300/70 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 cursor-pointer",
                role === option.value && "border-indigo-500",
              )}
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
      <Button type="submit" className="w-full" disabled={isPending || !role} onClick={() => mutate()}>
        {isPending ? <Loader2 className="animate-spin" /> : "Select Role and Continue"}
      </Button>
    </div>
  );
};

