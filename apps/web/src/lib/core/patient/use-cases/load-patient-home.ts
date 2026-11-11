import type { BetterUser } from "@helsa/auth";
import { zonedDay, zonedTime } from "@/lib/utils/zoned-time";
import { AppointmentRepository } from "../../appointment/adapters/appointment-repository";
import { PaymentRepository } from "../../payment/adapters/payment-repository";
import { patientBalance } from "../../payment/domain/patient-balance";
import { TaskRepository } from "../../task/adapters/task-repository";
import { portalTaskState, sortPortalTasks } from "../../task/use-cases/load-patient-tasks";
import { TherapistRepository } from "../../therapist/adapters/therapist-repository";
import { EnsurePortalPatient } from "./ensure-portal-patient";

const MAX_UPCOMING = 5;
const MAX_PAYMENTS = 3;

/**
 * The patient's home: their next sessions, what they owe and the tasks their
 * therapist left them. Null when the account isn't linked to a record with
 * portal access.
 */
export class LoadPatientHome {
  private portal = new EnsurePortalPatient();
  private therapists = new TherapistRepository();
  private appointments = new AppointmentRepository();
  private payments = new PaymentRepository();
  private tasks = new TaskRepository();

  async execute(user: BetterUser, now = new Date()) {
    const patient = await this.portal.find(user);
    if (!patient) return null;

    const therapist_id = patient.therapist_id;
    const timezone = patient.timezone;
    const today = zonedDay(now, timezone);

    const [therapist, upcoming, charges, credits, recent, tasks] = await Promise.all([
      this.therapists.getById(therapist_id),
      this.appointments.getUpcomingForPatient(patient.id, now, MAX_UPCOMING),
      this.payments.getCharges(therapist_id, { to: now, patient_id: patient.id }),
      this.payments.getCredits(therapist_id, patient.id),
      this.payments.listPayments(therapist_id, { patient_id: patient.id }),
      this.tasks.listByPatient(patient.id, therapist_id),
    ]);

    const active = tasks.filter((task) => task.status === "assigned");
    const entries = await this.tasks.getEntries(active.map((task) => task.id));

    return {
      nowIso: now.toISOString(),
      timezone,
      today,
      therapist: {
        name: therapist?.display_name ?? "Tu terapeuta",
        title: therapist?.professional_title ?? null,
      },
      appointments: upcoming.map((row) => ({
        id: row.id,
        day: zonedDay(row.starts_at, timezone),
        time: zonedTime(row.starts_at, timezone),
        startsAt: row.starts_at.toISOString(),
        endsAt: row.ends_at.toISOString(),
        minutes: Math.round((row.ends_at.getTime() - row.starts_at.getTime()) / 60_000),
        modality: row.modality,
        status: row.status,
        location: row.location ?? (row.modality === "in_person" ? row.office_address : null),
        recurring: row.series_id !== null,
      })),
      balance: this.balance({
        charges,
        credits,
        recent,
        now,
        timezone,
        defaultPriceUsd: therapist?.default_price_usd ?? null,
      }),
      payWith: {
        methods: therapist?.payment_methods ?? [],
        instructions: therapist?.payment_instructions?.trim() || null,
      },
      tasks: sortPortalTasks(
        active.map((task) => {
          const own = entries
            .filter((entry) => entry.task_id === task.id)
            .map((entry) => ({ entryDate: entry.entry_date }));
          return {
            id: task.id,
            title: task.title,
            instructions: task.instructions,
            frequency: task.frequency,
            startsOn: task.starts_on,
            dueOn: task.due_on,
            asksMood: task.asks_mood,
            lastEntryDay: own[0]?.entryDate ?? null,
            entries: own.length,
            state: portalTaskState(task, own, today),
          };
        }),
      ),
    };
  }

  /** What the patient owes today, the same way the therapist's payments page counts it. */
  private balance(input: {
    charges: Awaited<ReturnType<PaymentRepository["getCharges"]>>;
    credits: Awaited<ReturnType<PaymentRepository["getCredits"]>>;
    recent: Awaited<ReturnType<PaymentRepository["listPayments"]>>;
    now: Date;
    timezone: string;
    defaultPriceUsd: string | null;
  }) {
    return {
      ...patientBalance(input.charges, input.credits, input),
      recent: input.recent.slice(0, MAX_PAYMENTS).map((row) => ({
        id: row.payment.id,
        usd: Number(row.payment.amount_usd),
        method: row.payment.method,
        status: row.payment.status,
        paidAt: row.payment.paid_at.toISOString(),
        day: zonedDay(row.payment.paid_at, input.timezone),
      })),
    };
  }
}

export type PatientHome = NonNullable<Awaited<ReturnType<LoadPatientHome["execute"]>>>;
export type PatientHomeAppointment = PatientHome["appointments"][number];
export type PatientHomeTask = PatientHome["tasks"][number];
