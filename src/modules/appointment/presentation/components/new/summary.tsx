"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/presentation/components/ui/card";
import { useNewAppointment } from "./provider";
import { format } from "date-fns";
import { MapPin, Video } from "lucide-react";
import { es } from "date-fns/locale";

const mapPaymentModeToLabel: Record<string, string> = {
  PREPAID: "Prepago",
  POSTPAID: "Pospago",
  CREDIT: "Crédito",
};

export const NewAppointmentSummary = () => {
  const { data } = useNewAppointment();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Resumen de la cita</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Paciente</span>
          <span className="font-medium">{data.patient.name || "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Fecha</span>
          <span className="font-medium">{data.date ? format(data.date, "PPP", { locale: es }) : "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Hora</span>
          <span className="font-medium">{data.time || "—"}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Tarifa</span>
          <span className="font-medium">{data.amount > 0 ? `$${data.amount.toFixed(2)}` : "—"}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Modalidad de pago</span>
          <span className="font-medium">{data.payment_mode ? mapPaymentModeToLabel[data.payment_mode] : "—"}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Tipo de consulta</span>
          <span className="font-medium capitalize">{data.type || "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Modalidad</span>
          <span className="font-medium flex items-center gap-1">
            {data.mode === "ONLINE" ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
            {data.mode === "Online" ? "Online" : "Presencial"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

