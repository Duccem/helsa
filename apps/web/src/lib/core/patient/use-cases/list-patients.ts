import type { BetterUser } from "@helsa/auth";
import { TherapistRepository } from "../../therapist/adapters/therapist-repository";
import { assertTherapistRole } from "../../therapist/domain/guards";
import { PatientRepository } from "../adapters/patient-repository";

const DEFAULT_TIMEZONE = "America/Caracas";

export class ListPatients {
  private repository = new PatientRepository();
  private therapists = new TherapistRepository();

  async execute(user: BetterUser) {
    assertTherapistRole(user);

    const [rows, therapist] = await Promise.all([
      this.repository.list(user.id),
      this.therapists.getById(user.id),
    ]);

    return {
      timezone: therapist?.timezone ?? DEFAULT_TIMEZONE,
      patients: rows.map((row) => ({
        id: row.id,
        name: `${row.first_name} ${row.last_name}`.trim(),
        preferredName: row.preferred_name,
        email: row.email,
        phone: row.phone_e164,
        city: row.city,
        status: row.status,
        createdAt: row.created_at.toISOString(),
        nextAppointmentAt: row.next_appointment_at?.toISOString() ?? null,
        lastSessionAt: row.last_session_at?.toISOString() ?? null,
        sessions: row.sessions,
        openTasks: row.open_tasks,
        unseenEntries: row.unseen_entries,
      })),
    };
  }
}

export type PatientList = Awaited<ReturnType<ListPatients["execute"]>>;
export type PatientListItem = PatientList["patients"][number];
