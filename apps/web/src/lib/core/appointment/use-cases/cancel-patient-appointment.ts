import type { BetterUser } from "@helsa/auth";
import { EnsurePortalPatient } from "../../patient/use-cases/ensure-portal-patient";
import { TherapistRepository } from "../../therapist/adapters/therapist-repository";
import { AppointmentRepository } from "../adapters/appointment-repository";
import { canPatientCancel } from "../domain/cancellation";
import { AppointmentNotActive, AppointmentNotFound, CancellationTooLate } from "../domain/errors";

/**
 * The patient cancels one appointment (only that one, even in a series),
 * as long as it's further away than the therapist's cancellation notice.
 */
export class CancelPatientAppointment {
  private portal = new EnsurePortalPatient();
  private therapists = new TherapistRepository();
  private appointments = new AppointmentRepository();

  async execute(data: { appointmentId: string; reason: string | null }, user: BetterUser, now = new Date()) {
    const patient = await this.portal.execute(user);
    const appointment = await this.appointments.getForPatient(data.appointmentId, patient.id);
    if (!appointment) throw new AppointmentNotFound();
    if (appointment.status !== "scheduled" && appointment.status !== "confirmed") {
      throw new AppointmentNotActive();
    }

    const therapist = await this.therapists.getById(patient.therapist_id);
    const noticeHours = therapist?.cancellation_notice_hours ?? 24;
    if (!canPatientCancel(appointment.starts_at, noticeHours, now)) {
      throw new CancellationTooLate(noticeHours);
    }

    const changed = await this.appointments.cancelByPatient(appointment.id, patient.id, now, data.reason);
    if (!changed) throw new AppointmentNotActive();
  }
}
