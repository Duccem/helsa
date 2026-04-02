"use client";

import { AppointmentDetailProvider } from "@/modules/appointment/presentation/components/details/provider";
import { AppointmentDetailContent } from "@/modules/appointment/presentation/components/details/appointment-detail-content";

export default function AppointmentDetailsPage() {
  return (
    <AppointmentDetailProvider>
      <AppointmentDetailContent />
    </AppointmentDetailProvider>
  );
}

