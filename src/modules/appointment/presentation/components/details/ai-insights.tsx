"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/modules/shared/presentation/components/ui/card";
import { cn } from "@/modules/shared/presentation/lib/utils";
import { AlertTriangle, Sparkles, TrendingUp } from "lucide-react";

type InsightType = "warning" | "info" | "recommendation";

interface Insight {
  type: InsightType;
  message: string;
}

const insightStyles: Record<
  InsightType,
  { icon: typeof AlertTriangle; bg: string; border: string; iconColor: string }
> = {
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-800",
    iconColor: "text-amber-500",
  },
  info: {
    icon: TrendingUp,
    bg: "bg-violet-50 dark:bg-violet-950/20",
    border: "border-violet-200 dark:border-violet-800",
    iconColor: "text-violet-500",
  },
  recommendation: {
    icon: Sparkles,
    bg: "bg-purple-50 dark:bg-purple-950/20",
    border: "border-purple-200 dark:border-purple-800",
    iconColor: "text-purple-500",
  },
};

interface AiInsightsProps {
  insights: Insight[];
}

export function AiInsights({ insights }: AiInsightsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-4 text-purple-500" />
          AI Insights for this Appointment
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {insights.map((insight, index) => {
          const style = insightStyles[insight.type];
          const Icon = style.icon;
          return (
            <div
              key={index}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-4 py-3",
                style.bg,
                style.border,
              )}
            >
              <Icon className={cn("size-4 shrink-0", style.iconColor)} />
              <p className="text-sm">{insight.message}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
