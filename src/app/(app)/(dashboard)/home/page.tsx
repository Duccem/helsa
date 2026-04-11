import { requireAuth } from "@/modules/auth/infrastructure/guards/require-auth";
import { HomeChat } from "@/modules/chat-agent/presentation/components/home-chat";
import { DoctorMetrics } from "@/modules/home/presentation/components/doctor-metrics";

export default async function HomePage() {
  await requireAuth();
  return (
    <div className="flex flex-col gap-6 w-full">
      <DoctorMetrics />
      <HomeChat />
    </div>
  );
}

