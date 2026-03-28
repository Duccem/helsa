"use client";

import { Button } from "@/modules/shared/presentation/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/presentation/components/ui/card";
import { Sparkles } from "lucide-react";

export const QuickActions = () => {
  return (
    <Card className="border border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          AI Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {[
          "Auto-fill next week's slots",
          "Send reminders to pending patients",
          "Optimize schedule gaps",
          "Generate daily summary",
        ].map((action) => (
          <Button
            key={action}
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs gap-2 border-primary/20 text-muted-foreground hover:text-indigo-500 hover:border-indigo-500"
          >
            <Sparkles className="h-3 w-3" />
            {action}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

