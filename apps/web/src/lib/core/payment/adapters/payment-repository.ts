import { and, desc, eq, gte, inArray, isNull, lt, ne, sql } from "@helsa/db/operators";
import { appointment } from "@helsa/db/schema/appointment";
import { file, patient } from "@helsa/db/schema/patient";
import {
  exchange_rate,
  payment_reminder,
  session_payment,
} from "@helsa/db/schema/payment";
import { db } from "@/services";
import type {
  NewPaymentReminder,
  NewSessionPayment,
  PaymentStatus,
  SessionPayment,
} from "../domain/types";

// Explicit alias: inside sql`` drizzle drops the table from column names.
const linked = (status: PaymentStatus) => sql`(
  select coalesce(sum(p.amount_usd), 0) from session_payment p
  where p.appointment_id = "appointment"."id"
    and p.deleted_at is null
    and p.status = ${status}
)`;

const charge = {
  id: appointment.id,
  starts_at: appointment.starts_at,
  ends_at: appointment.ends_at,
  status: appointment.status,
  price_usd: appointment.price_usd,
  declared_method: appointment.payment_method,
  patient_id: patient.id,
  first_name: patient.first_name,
  last_name: patient.last_name,
  preferred_name: patient.preferred_name,
  patient_price_usd: patient.session_price_usd,
  phone: patient.phone_e164,
  email: patient.email,
  whatsapp_opt_in: patient.whatsapp_opt_in,
  paid_usd: sql<string>`${linked("verified")}`,
  review_usd: sql<string>`${linked("pending_review")}`,
  // Seconds since epoch: raw timestamps come back as driver-specific strings.
  last_paid_at: sql<number | null>`(
    select extract(epoch from max(p.paid_at))::float8 from session_payment p
    where p.appointment_id = "appointment"."id"
      and p.deleted_at is null
      and p.status = 'verified'
  )`,
};

export type ChargeFilter = {
  /** Sessions that start inside [from, to). */
  from?: Date;
  to?: Date;
  patient_id?: string;
};

export type PaymentFilter = {
  /** Payments made inside [from, to). */
  from?: Date;
  to?: Date;
  statuses?: PaymentStatus[];
  patient_id?: string;
};

export class PaymentRepository {
  async listByPatient(patient_id: string, therapist_id: string) {
    return db
      .select()
      .from(session_payment)
      .where(
        and(
          eq(session_payment.patient_id, patient_id),
          eq(session_payment.therapist_id, therapist_id),
          isNull(session_payment.deleted_at),
        ),
      )
      .orderBy(desc(session_payment.paid_at));
  }

  /** Non-cancelled sessions with what has been paid for each, oldest first. */
  async getCharges(therapist_id: string, filter: ChargeFilter = {}) {
    return db
      .select(charge)
      .from(appointment)
      .innerJoin(patient, eq(patient.id, appointment.patient_id))
      .where(
        and(
          eq(appointment.therapist_id, therapist_id),
          ne(appointment.status, "cancelled"),
          isNull(patient.deleted_at),
          filter.from ? gte(appointment.starts_at, filter.from) : undefined,
          filter.to ? lt(appointment.starts_at, filter.to) : undefined,
          filter.patient_id ? eq(appointment.patient_id, filter.patient_id) : undefined,
        ),
      )
      .orderBy(appointment.starts_at);
  }

  /** Payments with their patient, session and receipt, newest first. */
  async listPayments(therapist_id: string, filter: PaymentFilter = {}) {
    return db
      .select({
        payment: session_payment,
        first_name: patient.first_name,
        last_name: patient.last_name,
        preferred_name: patient.preferred_name,
        session_starts_at: appointment.starts_at,
        session_status: appointment.status,
        proof_name: file.original_name,
        proof_mime: file.mime_type,
      })
      .from(session_payment)
      .innerJoin(patient, eq(patient.id, session_payment.patient_id))
      .leftJoin(appointment, eq(appointment.id, session_payment.appointment_id))
      .leftJoin(
        file,
        and(eq(file.id, session_payment.proof_file_id), isNull(file.deleted_at)),
      )
      .where(
        and(
          eq(session_payment.therapist_id, therapist_id),
          isNull(session_payment.deleted_at),
          filter.from ? gte(session_payment.paid_at, filter.from) : undefined,
          filter.to ? lt(session_payment.paid_at, filter.to) : undefined,
          filter.statuses ? inArray(session_payment.status, filter.statuses) : undefined,
          filter.patient_id ? eq(session_payment.patient_id, filter.patient_id) : undefined,
        ),
      )
      .orderBy(desc(session_payment.paid_at));
  }

  /**
   * Money that isn't tied to a session that can owe: deposits with no session
   * and payments for sessions that were later cancelled. Grouped by patient.
   */
  async getCredits(therapist_id: string, patient_id?: string) {
    return db
      .select({
        patient_id: session_payment.patient_id,
        status: session_payment.status,
        amount_usd: sql<string>`sum(${session_payment.amount_usd})`,
      })
      .from(session_payment)
      .leftJoin(appointment, eq(appointment.id, session_payment.appointment_id))
      .where(
        and(
          eq(session_payment.therapist_id, therapist_id),
          isNull(session_payment.deleted_at),
          inArray(session_payment.status, ["verified", "pending_review"]),
          // Explicit aliases: both tables have a "status" column.
          sql`("session_payment"."appointment_id" is null or "appointment"."status" = 'cancelled')`,
          patient_id ? eq(session_payment.patient_id, patient_id) : undefined,
        ),
      )
      .groupBy(session_payment.patient_id, session_payment.status);
  }

  async getById(id: string, therapist_id: string) {
    const [response] = await db
      .select()
      .from(session_payment)
      .where(
        and(
          eq(session_payment.id, id),
          eq(session_payment.therapist_id, therapist_id),
          isNull(session_payment.deleted_at),
        ),
      )
      .limit(1);

    return response;
  }

  async createMany(data: NewSessionPayment[]) {
    if (data.length === 0) return;
    await db.insert(session_payment).values(data);
  }

  async update(data: SessionPayment) {
    await db
      .update(session_payment)
      .set(data)
      .where(
        and(
          eq(session_payment.id, data.id),
          eq(session_payment.therapist_id, data.therapist_id),
        ),
      );
  }

  /** Latest official rate, or the last one this therapist used on a payment. */
  async getReferenceRate(therapist_id: string) {
    const [official] = await db
      .select()
      .from(exchange_rate)
      .orderBy(desc(exchange_rate.rate_date))
      .limit(1);

    if (official) {
      return { vesPerUsd: Number(official.ves_per_usd), date: official.rate_date, source: official.source };
    }

    const [used] = await db
      .select({ ves_per_usd: session_payment.ves_per_usd, rate_date: session_payment.rate_date })
      .from(session_payment)
      .where(
        and(
          eq(session_payment.therapist_id, therapist_id),
          isNull(session_payment.deleted_at),
          sql`${session_payment.ves_per_usd} is not null`,
        ),
      )
      .orderBy(desc(session_payment.paid_at))
      .limit(1);

    if (!used?.ves_per_usd) return null;
    return { vesPerUsd: Number(used.ves_per_usd), date: used.rate_date, source: "Último pago" };
  }

  /** The latest reminder and how many were sent, per patient. */
  async getReminderStats(therapist_id: string) {
    return db
      .select({
        patient_id: payment_reminder.patient_id,
        count: sql<number>`count(*)::int`,
        last_sent_at: sql<number>`extract(epoch from max(${payment_reminder.sent_at}))::float8`,
        last_channel: sql<string>`(array_agg(${payment_reminder.channel} order by ${payment_reminder.sent_at} desc))[1]`,
      })
      .from(payment_reminder)
      .where(
        and(
          eq(payment_reminder.therapist_id, therapist_id),
          ne(payment_reminder.status, "failed"),
        ),
      )
      .groupBy(payment_reminder.patient_id);
  }

  async createReminder(data: NewPaymentReminder) {
    await db.insert(payment_reminder).values(data);
  }
}
