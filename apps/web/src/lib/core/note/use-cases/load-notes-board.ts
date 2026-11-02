import type { BetterUser } from "@helsa/auth";
import { isEncryptionConfigured, openText } from "@/lib/infra/clinical-cipher";
import { AppointmentRepository } from "../../appointment/adapters/appointment-repository";
import { PatientRepository } from "../../patient/adapters/patient-repository";
import { TherapistRepository } from "../../therapist/adapters/therapist-repository";
import { assertTherapistRole } from "../../therapist/domain/guards";
import { NoteRepository } from "../adapters/note-repository";

const DEFAULT_TIMEZONE = "America/Caracas";

/** How far back the "sessions without a note" reminder looks. */
export const MISSING_NOTES_WINDOW_DAYS = 30;
const MISSING_NOTES_LIMIT = 12;
const DAY_MS = 24 * 60 * 60 * 1000;

const fullName = (row: { first_name: string; last_name: string }) =>
  `${row.first_name} ${row.last_name}`.trim();

/** Every note of the therapist, decrypted, plus what the notes page needs to write new ones. */
export class LoadNotesBoard {
  private notes = new NoteRepository();
  private patients = new PatientRepository();
  private appointments = new AppointmentRepository();
  private therapists = new TherapistRepository();

  async execute(user: BetterUser, now = new Date()) {
    assertTherapistRole(user);

    const [notes, patients, missing, therapist] = await Promise.all([
      this.notes.listByTherapist(user.id),
      this.patients.list(user.id),
      this.appointments.getEndedWithoutNote(
        user.id,
        new Date(now.getTime() - MISSING_NOTES_WINDOW_DAYS * DAY_MS),
        now,
        MISSING_NOTES_LIMIT,
      ),
      this.therapists.getById(user.id),
    ]);

    return {
      timezone: therapist?.timezone ?? DEFAULT_TIMEZONE,
      encryptionReady: isEncryptionConfigured(),
      patients: patients.map((row) => ({
        id: row.id,
        name: fullName(row),
        status: row.status,
      })),
      notes: notes.map(({ note, ...row }) => {
        const body = openText(note.content_enc, user.id, note.enc_key_version);
        return {
          id: note.id,
          patientId: note.patient_id,
          patientName: fullName(row),
          patientStatus: row.patient_status,
          title: note.title,
          content: body.text,
          locked: body.locked,
          appointmentId: note.appointment_id,
          sessionAt: row.session_starts_at?.toISOString() ?? null,
          signedAt: note.signed_at?.toISOString() ?? null,
          createdAt: note.created_at.toISOString(),
          updatedAt: note.updated_at.toISOString(),
        };
      }),
      sessionsWithoutNote: missing.map((item) => ({
        id: item.id,
        patientId: item.patient_id,
        patientName: fullName(item),
        startsAt: item.starts_at.toISOString(),
        minutes: Math.round((item.ends_at.getTime() - item.starts_at.getTime()) / 60_000),
        modality: item.modality,
      })),
    };
  }
}

export type NotesBoard = Awaited<ReturnType<LoadNotesBoard["execute"]>>;
export type BoardNote = NotesBoard["notes"][number];
export type SessionWithoutNote = NotesBoard["sessionsWithoutNote"][number];
