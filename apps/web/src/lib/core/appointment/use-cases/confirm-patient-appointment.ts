import type { BetterUser } from "@helsa/auth";
import { EnsurePortalPatient } from "../../patient/use-cases/ensure-portal-patient";
import { AppointmentRepository } from "../adapters/appointment-repository";
import { AppointmentNotActive, AppointmentNotFound } from "../domain/errors";

/** The patient tells their therapist they'll be there. */
export class ConfirmPatientAppointment {
  private portal = new EnsurePortalPatient();
  private appointments = new AppointmentRepository();

  async execute(appointmentId: string, user: BetterUser, now = new Date()) {
    const patient = await this.portal.execute(user);
    const appointment = await this.appointments.getForPatient(appointmentId, patient.id);
    if (!appointment) throw new AppointmentNotFound();
    if (appointment.status === "confirmed") return;
    if (appointment.ends_at <= now) throw new AppointmentNotActive();

    const changed = await this.appointments.confirmByPatient(appointment.id, patient.id, now);
    if (!changed) throw new AppointmentNotActive();
  }
}
