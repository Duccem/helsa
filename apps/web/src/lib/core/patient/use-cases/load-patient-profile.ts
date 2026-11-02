import type { BetterUser } from "@helsa/auth";
import { isEncryptionConfigured, openText } from "@/lib/infra/clinical-cipher";
import { isStorageConfigured } from "@/lib/infra/file-storage";
import { zonedDay, zonedTime } from "@/lib/utils/zoned-time";
import { AppointmentRepository } from "../../appointment/adapters/appointment-repository";
import { FileRepository } from "../../file/adapters/file-repository";
import { NoteRepository } from "../../note/adapters/note-repository";
import { PaymentRepository } from "../../payment/adapters/payment-repository";
import { LoadPreferences } from "../../settings/use-cases/load-preferences";
import { TaskRepository } from "../../task/adapters/task-repository";
import { adherence } from "../../task/domain/adherence";
import { TherapistRepository } from "../../therapist/adapters/therapist-repository";
import type { Patient } from "../domain/types";
import { EnsurePatientAccess } from "./ensure-patient-access";

const DEFAULT_TIMEZONE = "America/Caracas";

function age(birthDate: string | null, today: string) {
  if (!birthDate) return null;
  const [by = 0, bm = 0, bd = 0] = birthDate.split("-").map(Number);
  const [ty = 0, tm = 0, td = 0] = today.split("-").map(Number);
  return ty - by - (tm < bm || (tm === bm && td < bd) ? 1 : 0);
}

/** Everything the patient page shows, decrypted and ready for the UI. */
export class LoadPatientProfile {
  private access = new EnsurePatientAccess();
  private appointments = new AppointmentRepository();
  private notes = new NoteRepository();
  private tasks = new TaskRepository();
  private files = new FileRepository();
  private payments = new PaymentRepository();
  private therapists = new TherapistRepository();
  private preferences = new LoadPreferences();

  async execute(patient_id: string, user: BetterUser) {
    const patient = await this.access.execute(patient_id, user);

    const [appointments, notes, tasks, files, payments, therapist, preferences] =
      await Promise.all([
        this.appointments.getByPatient(patient.id, user.id),
        this.notes.listByPatient(patient.id, user.id),
        this.tasks.listByPatient(patient.id, user.id),
        this.files.listByPatient(patient.id, user.id),
        this.payments.listByPatient(patient.id, user.id),
        this.therapists.getById(user.id),
        this.preferences.execute(user.id),
      ]);
    const entries = await this.tasks.getEntries(tasks.map((task) => task.id));

    const timezone = therapist?.timezone ?? DEFAULT_TIMEZONE;
    const now = new Date();
    const today = zonedDay(now, timezone);
    const active = (status: string) => status === "scheduled" || status === "confirmed";
    const past = appointments.filter((item) => item.ends_at <= now);
    const upcoming = appointments
      .filter((item) => item.ends_at > now && active(item.status))
      .reverse();
    const attended = past.filter((item) => item.status !== "cancelled" && item.status !== "no_show");

    return {
      today,
      nowIso: now.toISOString(),
      timezone,
      timeFormat: preferences.timeFormat === "12h" ? ("12h" as const) : ("24h" as const),
      encryptionReady: isEncryptionConfigured(),
      storageReady: isStorageConfigured(),
      patient: this.toPatient(patient, user.id, today),
      stats: {
        sessions: attended.length,
        noShows: appointments.filter((item) => item.status === "no_show").length,
        cancelled: appointments.filter((item) => item.status === "cancelled").length,
        nextAppointmentAt: upcoming[0]?.starts_at.toISOString() ?? null,
        lastSessionAt: attended[0]?.starts_at.toISOString() ?? null,
        paidUsd: payments.reduce((sum, item) => sum + Number(item.amount_usd), 0),
        openTasks: tasks.filter((task) => task.status === "assigned").length,
      },
      appointments: appointments.map((item) => ({
        id: item.id,
        startsAt: item.starts_at.toISOString(),
        endsAt: item.ends_at.toISOString(),
        day: zonedDay(item.starts_at, timezone),
        time: zonedTime(item.starts_at, timezone),
        minutes: Math.round((item.ends_at.getTime() - item.starts_at.getTime()) / 60_000),
        modality: item.modality,
        status: item.status,
        location: item.location,
      })),
      notes: notes.map((note) => {
        const body = openText(note.content_enc, user.id, note.enc_key_version);
        return {
          id: note.id,
          title: note.title,
          content: body.text,
          locked: body.locked,
          appointmentId: note.appointment_id,
          signedAt: note.signed_at?.toISOString() ?? null,
          createdAt: note.created_at.toISOString(),
          updatedAt: note.updated_at.toISOString(),
        };
      }),
      tasks: tasks.map((task) => {
        const own = entries
          .filter((entry) => entry.task_id === task.id)
          .map((entry) => {
            const body = openText(entry.content_enc, user.id, entry.enc_key_version);
            return {
              id: entry.id,
              entryDate: entry.entry_date,
              moodScore: entry.mood_score,
              content: body.text,
              locked: body.locked,
              seen: entry.seen_by_therapist_at !== null,
            };
          });
        const endedAt =
          task.status === "completed"
            ? (task.completed_at ?? task.updated_at)
            : task.status === "cancelled"
              ? task.updated_at
              : null;
        return {
          id: task.id,
          title: task.title,
          instructions: task.instructions,
          frequency: task.frequency,
          startsOn: task.starts_on,
          dueOn: task.due_on,
          asksMood: task.asks_mood,
          status: task.status,
          completedAt: task.completed_at?.toISOString() ?? null,
          createdAt: task.created_at.toISOString(),
          overdue: task.status === "assigned" && task.due_on !== null && task.due_on < today,
          upcoming: task.status === "assigned" && task.starts_on > today,
          unseen: own.filter((entry) => !entry.seen).length,
          adherence: adherence(
            { ...task, ended_on: endedAt ? zonedDay(endedAt, timezone) : null },
            own.map((entry) => entry.entryDate),
            today,
          ),
          entries: own,
        };
      }),
      files: files.map((file) => ({
        id: file.id,
        name: file.original_name,
        mimeType: file.mime_type,
        size: file.size_bytes,
        createdAt: file.created_at.toISOString(),
      })),
      payments: payments.map((payment) => ({
        id: payment.id,
        paidAt: payment.paid_at.toISOString(),
        method: payment.method,
        amountUsd: Number(payment.amount_usd),
        reference: payment.reference,
      })),
    };
  }

  private toPatient(patient: Patient, therapist_id: string, today: string) {
    const intake = openText(patient.intake_reason_enc, therapist_id, patient.enc_key_version);
    return {
      id: patient.id,
      firstName: patient.first_name,
      lastName: patient.last_name,
      name: `${patient.first_name} ${patient.last_name}`.trim(),
      preferredName: patient.preferred_name,
      nationalId: patient.national_id,
      birthDate: patient.birth_date,
      age: age(patient.birth_date, today),
      gender: patient.gender,
      email: patient.email,
      phone: patient.phone_e164,
      whatsappOptIn: patient.whatsapp_opt_in,
      countryCode: patient.country_code,
      city: patient.city,
      timezone: patient.timezone,
      emergencyName: patient.emergency_contact_name,
      emergencyPhone: patient.emergency_contact_phone,
      emergencyRelation: patient.emergency_contact_relation,
      intakeReason: intake.text,
      intakeLocked: intake.locked,
      status: patient.status,
      sessionPriceUsd: patient.session_price_usd === null ? null : Number(patient.session_price_usd),
      portalEnabled: patient.portal_enabled,
      dischargedAt: patient.discharged_at?.toISOString() ?? null,
      createdAt: patient.created_at.toISOString(),
    };
  }
}

export type PatientProfile = Awaited<ReturnType<LoadPatientProfile["execute"]>>;
