"use client";

import { Button } from "@/modules/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/modules/shared/presentation/components/ui/card";
import { Sparkles } from "lucide-react";

export const AppointmentSummary = () => {
  return (
    <Card className="bg-primary/30">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/50">
          <Sparkles className="h-5 w-5 " />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">AI Schedule Summary</p>
          <p className="text-sm">
            You have {24} upcoming appointments. 3 patients have AI-generated insights ready. Consider rescheduling the
            2:45 PM slot for Robert Wilson — his labs suggest an extended consultation.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1">
          <Sparkles className="h-3 w-3" /> View Details
        </Button>
      </CardContent>
    </Card>
  );
};

