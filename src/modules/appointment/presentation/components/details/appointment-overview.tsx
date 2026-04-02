"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/modules/shared/presentation/components/ui/card";
import { cn } from "@/modules/shared/presentation/lib/utils";
import {
  Activity,
  AlertTriangle,
  Droplets,
  Heart,
  Thermometer,
  Wind,
} from "lucide-react";

// -- Reason for Visit --

interface ReasonForVisitProps {
  title: string;
  description: string;
}

export function ReasonForVisit({ title, description }: ReasonForVisitProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reason for Visit</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

// -- Vitals --

interface Vital {
  label: string;
  value: string;
  icon: "heart" | "activity" | "thermometer" | "droplets" | "wind";
  color: string;
}

const vitalIcons = {
  heart: Heart,
  activity: Activity,
  thermometer: Thermometer,
  droplets: Droplets,
  wind: Wind,
} as const;

function VitalCard({ vital }: { vital: Vital }) {
  const Icon = vitalIcons[vital.icon];
  return (
    <Card className="flex flex-col items-center justify-center py-6">
      <CardContent className="flex flex-col items-center gap-2 p-0">
        <Icon className={cn("size-5", vital.color)} />
        <p className="text-xl font-bold">{vital.value}</p>
        <p className="text-xs text-muted-foreground">{vital.label}</p>
      </CardContent>
    </Card>
  );
}

interface VitalsGridProps {
  vitals: Vital[];
}

export function VitalsGrid({ vitals }: VitalsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {vitals.map((vital) => (
        <VitalCard key={vital.label} vital={vital} />
      ))}
    </div>
  );
}

// -- Allergies --

interface AllergiesAlertProps {
  allergies: string[];
}

export function AllergiesAlert({ allergies }: AllergiesAlertProps) {
  if (allergies.length === 0) return null;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950/20">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-500" />
      <div>
        <p className="text-sm font-medium text-red-600 dark:text-red-400">
          Allergies
        </p>
        <p className="text-sm text-red-600/80 dark:text-red-400/80">
          {allergies.join(", ")}
        </p>
      </div>
    </div>
  );
}
