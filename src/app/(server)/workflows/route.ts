import { serve } from "inngest/next";
import { inngest } from "@/modules/shared/infrastructure/event-bus/inngest-client";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [],
});

