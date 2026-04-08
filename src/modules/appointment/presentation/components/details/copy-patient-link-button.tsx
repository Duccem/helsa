"use client";

import { Check, Link2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import { useVideoCallToken } from "@/modules/video-call/presentation/hooks/use-video-call-token";

type CopyPatientLinkButtonProps = {
  appointmentId: string;
};

export function CopyPatientLinkButton({ appointmentId }: CopyPatientLinkButtonProps) {
  const { token, isFetchingToken } = useVideoCallToken(appointmentId, "patient");
  const [copied, setCopied] = useState(false);

  const disabled = isFetchingToken || !token;

  const handleCopy = async () => {
    if (!token) return;
    try {
      const url = `${window.location.origin}/call?token=${token}&appointmentId=${appointmentId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Enlace copiado al portapapeles");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  };

  return (
    <Button variant="outline" disabled={disabled} onClick={handleCopy}>
      {isFetchingToken ? (
        <Loader2 className="animate-spin" />
      ) : copied ? (
        <Check />
      ) : (
        <Link2 />
      )}
      {copied ? "Enlace copiado" : "Enlace para paciente"}
    </Button>
  );
}
