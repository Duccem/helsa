import { AppointmentRepository } from "../adapters/appointment-repository";
import type { AppointmentStatus } from "../domain/types";

/** Statuses of an appointment that is still going to happen. */
export const PENDING_STATUSES: AppointmentStatus[] = ["scheduled", "confirmed"];

/** How far ahead the sidebar badge looks. */
export const PENDING_WINDOW_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Upcoming appointments (scheduled or confirmed) in the next 7 days. */
export class CountPendingAppointments {
  private repository = new AppointmentRepository();

  async execute(user_id: string, now = new Date()) {
    return this.repository.countUpcoming(
      user_id,
      now,
      new Date(now.getTime() + PENDING_WINDOW_DAYS * DAY_MS),
      PENDING_STATUSES,
    );
  }
}
