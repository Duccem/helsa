import { CallLayout } from "@/modules/video-call/presentation/components/call-layout";
import { TestJitsi } from "../test.client";

export default function VideoCallPage() {
  return (
    <div className="flex w-full h-screen items-center justify-center bg-red-500">
      <CallLayout />
    </div>
  );
}

