import { GenerateAvailability } from "@/modules/schedule/application/generate-availability";
import { SearchSchedule } from "@/modules/schedule/application/search-schedule";
import { DrizzleScheduleRepository } from "@/modules/schedule/infrastructure/persistence/drizzle-schedule-repository";
import { inngest } from "@/modules/shared/infrastructure/event-bus/inngest-client";
import { addDays } from "date-fns";

export const generateAvailability = inngest.createFunction(
  { id: "generate-availability", name: "Generate Availability" },
  { cron: "TZ=America/Caracas 0 3 * * 1" },
  async ({ step }) => {
    const schedules = await step.run("get-schedules-that-need-availability", async () => {
      const service = new SearchSchedule(new DrizzleScheduleRepository());
      const data = await service.execute({
        page: 1,
        pageSize: 1000,
        next_availability_generation: addDays(new Date(), 1),
      });

      return data.data;
    });

    if (schedules.length === 0) {
      return { message: "No schedules need availability generation" };
    }

    await step.run("generate-availability-for-schedules", async () => {
      const service = new GenerateAvailability(new DrizzleScheduleRepository());

      await Promise.all(schedules.map((schedule) => service.execute(schedule.doctor_id)));
    });
  },
);

