"use client";

import { Button } from "@/modules/shared/presentation/components/ui/button";
import { useVideoCallToken } from "@/modules/video-call/presentation/hooks/use-video-call-token";
import { Loader2, Play } from "lucide-react";
import Link from "next/link";

type StartAppointmentButtonProps = {
  appointmentId: string;
};

export function StartAppointmentButton({ appointmentId }: StartAppointmentButtonProps) {
  const { token, isFetchingToken } = useVideoCallToken(appointmentId, "doctor");

  const disabled = isFetchingToken || !token;

  return (
    <Button
      disabled={disabled}
      render={token ? <Link href={`/call?token=${token}&appointmentId=${appointmentId}`} target="_blank" /> : undefined}
    >
      {isFetchingToken ? <Loader2 className="animate-spin" /> : <Play />}
      Iniciar Consulta
    </Button>
  );
}

