import { RegisterDoctor } from "@/modules/doctor/application/register-doctor";
import { container } from "@/modules/shared/infrastructure/dependency-injection/diod.config";
import { inngest } from "@/modules/shared/infrastructure/event-bus/inngest-client";

export const createDoctor = inngest.createFunction(
  { name: "Create Doctor Workflow", id: "create-doctor" },
  { event: "user.role.set_as_doctor" },
  async ({ event, step }) => {
    const { userId } = event.data.attributes;

    await step.run("create_doctor_profile", async () => {
      const creator = container.get(RegisterDoctor);

      await creator.execute({
        user_id: userId,
        specialty_id: "019d1782-5d3d-760b-b293-95cac0f5cd77", // Placeholder, replace with actual specialty ID if available
        license_number: "000", // Placeholder, replace with actual license number if available
        experience: 1, // Placeholder, replace with actual experience if available
      });
    });
  },
);
