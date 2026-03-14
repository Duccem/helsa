"use client";
import { Card } from "@/modules/shared/presentation/components/ui/card";
import { Skeleton } from "@/modules/shared/presentation/components/ui/skeleton";
import { medicalProducts } from "../../infrastructure/polar-products";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/modules/auth/infrastructure/auth-client";

const PLAN_DATA = {
  free: {
    patients: {
      limit: 30,
      disabled: false,
      unlimited: false,
    },
    video_call_hours: {
      limit: 0,
      disabled: true,
      unlimited: false,
    },
    ai_usage: {
      limit: 100_000,
      disabled: true,
      unlimited: false,
    },
  },
  basic: {
    patients: {
      limit: 300,
      disabled: false,
      unlimited: false,
    },
    video_call_hours: {
      limit: 30,
      disabled: false,
      unlimited: false,
    },
    ai_usage: {
      limit: 100_000_000,
      disabled: false,
      unlimited: false,
    },
  },
  complete: {
    patients: {
      limit: 1000,
      disabled: false,
      unlimited: true,
    },
    video_call_hours: {
      limit: 100,
      disabled: false,
      unlimited: true,
    },
    ai_usage: {
      limit: 100_000,
      disabled: false,
      unlimited: true,
    },
  },
} as const;

const PATIENT_PLAN_DATA = {
  free: {
    appointments: {
      limit: 5,
      disabled: false,
      unlimited: false,
    },
    video_call_hours: {
      limit: 0,
      disabled: true,
      unlimited: false,
    },
    ai_usage: {
      limit: 100_000,
      disabled: true,
      unlimited: false,
    },
  },
  basic: {
    appointments: {
      limit: 20,
      disabled: false,
      unlimited: false,
    },
    video_call_hours: {
      limit: 10,
      disabled: false,
      unlimited: false,
    },
    ai_usage: {
      limit: 100_000_000,
      disabled: false,
      unlimited: false,
    },
  },
  complete: {
    appointments: {
      limit: 1000,
      disabled: false,
      unlimited: true,
    },
    video_call_hours: {
      limit: 100,
      disabled: false,
      unlimited: true,
    },
    ai_usage: {
      limit: 100_000,
      disabled: false,
      unlimited: true,
    },
  },
} as const;

interface UsageItemProps {
  label: string;
  current: number;
  max: number;
  unit?: string;
  period?: string;
  percentage?: number;
  unlimited?: boolean;
  disabled?: boolean;
}

function CircularProgress({ value }: { value: number }) {
  return (
    <div className="relative h-6 w-6 flex items-center justify-center">
      <svg className="h-6 w-6" viewBox="0 0 36 36">
        {/* Background circle */}
        <circle className="stroke-muted fill-none" cx="18" cy="18" r="16" strokeWidth="4" />
        {/* Progress circle */}
        <circle
          className="stroke-primary fill-none"
          cx="18"
          cy="18"
          r="16"
          strokeWidth="4"
          strokeDasharray={`${value * 0.01 * 100.53} 100.53`}
          strokeDashoffset="0"
          transform="rotate(-90 18 18)"
        />
      </svg>
    </div>
  );
}

function UsageItem({ label, current, max, unit, period, percentage, unlimited, disabled }: UsageItemProps) {
  // Calculate percentage if not explicitly provided
  const calculatedPercentage = percentage !== undefined ? percentage : Math.min((current / max) * 100, 100);

  // Format values differently based on whether we have a unit or not
  let formattedCurrent: string;
  let formattedMax: string;

  if (unit) {
    // For values with units (like GB), show the decimal value
    formattedCurrent = current.toFixed(1).replace(/\.0$/, "");
    formattedMax = max.toFixed(1).replace(/\.0$/, "");
  } else {
    // For counts without units, use k formatting for large numbers
    formattedCurrent = current >= 1000 ? `${(current / 1000).toFixed(1)}k` : current.toString();

    if (max >= 1000000) {
      // If max is large, format it as well
      formattedMax = `${(max / 1000000).toFixed(0)}M`;
    } else if (max >= 1000) {
      formattedMax = `${(max / 1000).toFixed(0)}k`;
      // If max is very large, format it as millions
    } else {
      formattedMax = max.toString();
    }
  }

  return (
    <div className="flex items-center justify-between py-3 px-4">
      <div className="flex items-center gap-4">
        <CircularProgress value={disabled ? 0 : unlimited ? 0 : calculatedPercentage} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {unlimited && !disabled && <span className="text-sm text-muted-foreground">Ilimitados</span>}
      {!unlimited && !disabled && (
        <div className="text-sm text-muted-foreground">
          {formattedCurrent} / {formattedMax} {unit} {period && <span>per {period}</span>}
        </div>
      )}
      {disabled && (
        <div className="text-sm text-muted-foreground">
          <span className="line-through">
            {formattedCurrent} / {formattedMax} {unit}
          </span>{" "}
          (Upgrade to enable)
        </div>
      )}
    </div>
  );
}

export function Usage() {
  const { data } = authClient.useActiveMemberRole();

  if (data?.role === "doctor") {
    return <UsageDoctor />;
  } else {
    return <UsagePatient />;
  }
}

export function UsageDoctor() {
  const { data, isPending } = useQuery({
    queryKey: ["organization-usage-meters"],
    refetchOnWindowFocus: false,
    initialData: {
      plan: "free",
      meters: {
        patients: 0,
        video_call_hours: 0,
      },
      limits: PLAN_DATA.free,
    },
    queryFn: async () => {
      const response = await fetch("/api/billing");
      const data = await response.json();
      const subscription = data?.state.activeSubscriptions?.[0] || null;

      const plan = medicalProducts.find((p) => p.productId === subscription?.productId) ?? medicalProducts[0];

      const usageResponse = await fetch("/api/billing/usage");
      const usage = await usageResponse.json();

      return {
        plan: plan?.id || "free",
        meters: {
          patients: usage.patients ?? 0,
          video_call_hours: usage.video_call_hours ?? 0,
        },
        limits: PLAN_DATA[plan.id as keyof typeof PLAN_DATA],
      };
    },
  });

  if (isPending) {
    return <UsageSkeleton />;
  }

  if (!data) {
    return null;
  }

  return (
    <div>
      <h2 className="text-lg font-medium leading-none tracking-tight mb-4">Usage</h2>
      <Card className="divide-y ">
        <UsageItem
          label="Active patients"
          current={data.meters?.patients ?? 0}
          max={data.limits.patients.limit}
          disabled={data.limits.patients.disabled}
          unlimited={data.limits.patients.unlimited}
          period=""
        />
        <UsageItem
          label="Video call hours"
          current={data.meters?.video_call_hours ?? 0}
          max={data.limits.video_call_hours.limit}
          disabled={data.limits.video_call_hours.disabled}
          unlimited={data.limits.video_call_hours.unlimited}
          period=""
        />
      </Card>
    </div>
  );
}

export function UsagePatient() {
  const { data, isPending } = useQuery({
    queryKey: ["organization-usage-meters"],
    refetchOnWindowFocus: false,
    initialData: {
      plan: "free",
      meters: {
        appointments: 0,
      },
      limits: PATIENT_PLAN_DATA.free,
    },
    queryFn: async () => {
      const response = await fetch("/api/billing");
      const data = await response.json();
      const subscription = data?.state.activeSubscriptions?.[0] || null;

      const plan = medicalProducts.find((p) => p.productId === subscription?.productId) ?? medicalProducts[0];

      const usageResponse = await fetch("/api/billing/usage");
      const usage = await usageResponse.json();

      return {
        plan: plan?.id || "free",
        meters: {
          appointments: usage.appointments ?? 0,
        },
        limits: PATIENT_PLAN_DATA[plan.id as keyof typeof PLAN_DATA],
      };
    },
  });

  if (isPending) {
    return <UsageSkeleton />;
  }

  if (!data) {
    return null;
  }

  return (
    <div>
      <h2 className="text-lg font-medium leading-none tracking-tight mb-4">Usage</h2>
      <Card className="divide-y ">
        <UsageItem
          label="Appointments"
          current={data.meters?.appointments ?? 0}
          max={data.limits.appointments.limit}
          disabled={data.limits.appointments.disabled}
          unlimited={data.limits.appointments.unlimited}
          period=""
        />
      </Card>
    </div>
  );
}

export function UsageSkeleton() {
  // Define labels to use for keys instead of array indices
  const skeletonItems = ["users", "connections", "inbox"];

  return (
    <div>
      <h2 className="text-lg font-medium leading-none tracking-tight mb-4">Usage</h2>

      <Card className="divide-y">
        {skeletonItems.map((item) => (
          <div key={item} className="flex items-center justify-between py-3 px-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </Card>
    </div>
  );
}

