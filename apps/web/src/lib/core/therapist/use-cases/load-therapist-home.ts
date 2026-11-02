import type { BetterUser } from "@helsa/auth";
import { addDays, startOfZonedDay, zonedDay, zonedTime } from "@/lib/utils/zoned-time";
import { AppointmentRepository } from "../../appointment/adapters/appointment-repository";
import { PENDING_STATUSES } from "../../appointment/use-cases/count-pending-appointments";
import { NoteRepository } from "../../note/adapters/note-repository";
import { PatientRepository } from "../../patient/adapters/patient-repository";
import { PaymentRepository } from "../../payment/adapters/payment-repository";
import { round2 } from "../../payment/domain/billing";
import { LoadPatientBalances } from "../../payment/use-cases/load-patient-balances";
import { LoadPreferences } from "../../settings/use-cases/load-preferences";
import { TaskRepository } from "../../task/adapters/task-repository";
import { TherapistRepository } from "../adapters/therapist-repository";
import { assertTherapistRole } from "../domain/guards";

const DEFAULT_TIMEZONE = "America/Caracas";
const HOUR = 3_600_000;
const MOOD_DAYS = 7;
const LOW_MOOD = 3;
const MAX_ATTENTION = 6;
const MAX_MOODS = 6;

const usdFormat = new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 });
const money = (amount: number) => `$${usdFormat.format(amount)}`;

type Person = { first_name: string; last_name: string; preferred_name: string | null };

/** "Carlos Pérez" → "C. P." when the therapist keeps names private on this screen. */
function displayName(person: Person, privateMode: boolean) {
  const first = person.preferred_name?.trim() || person.first_name;
  if (privateMode) {
    return [first, person.last_name]
      .filter(Boolean)
      .map((part) => `${part.trim().charAt(0).toUpperCase()}.`)
      .join(" ");
  }
  const initial = person.last_name.trim().charAt(0);
  return initial ? `${first} ${initial}.` : first;
}

export type AttentionKind = "payment" | "mood" | "unconfirmed" | "note" | "overdue" | "draft";

/** What the therapist's home screen shows: their week, who's next and what needs them. */
export class LoadTherapistHome {
  private therapists = new TherapistRepository();
  private preferences = new LoadPreferences();
  private appointments = new AppointmentRepository();
  private patients = new PatientRepository();
  private tasks = new TaskRepository();
  private notes = new NoteRepository();
  private payments = new PaymentRepository();
  private balances = new LoadPatientBalances();

  async execute(user: BetterUser, now = new Date()) {
    assertTherapistRole(user);

    const [therapist, preferences] = await Promise.all([
      this.therapists.getById(user.id),
      this.preferences.execute(user.id),
    ]);
    const timezone = therapist?.timezone ?? DEFAULT_TIMEZONE;
    const privateMode = preferences.privateMode === true;
    const name = (person: Person) => displayName(person, privateMode);

    const today = zonedDay(now, timezone);
    const weekday = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7; // 0 = Monday
    const monday = addDays(today, -weekday);
    const monthStart = `${today.slice(0, 7)}-01`;
    const nextMonth = `${addDays(monthStart, 32).slice(0, 7)}-01`;
    const moodFrom = addDays(today, -(MOOD_DAYS - 1));

    const [week, upcoming, patients, entries, tasks, ended, drafts, unseen, monthPayments, review, balances, rate] =
      await Promise.all([
        this.appointments.getStartingBetween(
          user.id,
          startOfZonedDay(monday, timezone),
          startOfZonedDay(addDays(monday, 7), timezone),
        ),
        this.appointments.getUpcoming(user.id, now, PENDING_STATUSES, 20),
        this.patients.list(user.id),
        this.tasks.getEntriesSince(user.id, moodFrom),
        this.tasks.listByTherapist(user.id),
        this.appointments.getEndedWithoutNote(user.id, new Date(now.getTime() - 7 * 24 * HOUR), now, 20),
        this.notes.countDrafts(user.id),
        // Same count as the sidebar badge: every answer not read yet.
        this.tasks.countUnseenEntries(user.id),
        this.payments.listPayments(user.id, {
          from: startOfZonedDay(monthStart, timezone),
          to: startOfZonedDay(nextMonth, timezone),
          statuses: ["verified"],
        }),
        this.payments.listPayments(user.id, { statuses: ["pending_review"] }),
        this.balances.execute({ now }, user),
        this.payments.getReferenceRate(user.id),
      ]);

    const people = new Map(patients.map((item) => [item.id, item]));
    const toEntry = (row: (typeof week)[number]) => ({
      id: row.id,
      patientId: row.patient_id,
      patient: name(row),
      day: zonedDay(row.starts_at, timezone),
      time: zonedTime(row.starts_at, timezone),
      startsAt: row.starts_at.toISOString(),
      endsAt: row.ends_at.toISOString(),
      minutes: Math.round((row.ends_at.getTime() - row.starts_at.getTime()) / 60_000),
      modality: row.modality,
      status: row.status,
      location: row.location,
      recurring: row.series_id !== null,
      // Only worth saying when the patient connects from another time zone.
      from: row.patient_timezone !== timezone ? row.patient_city : null,
    });

    const weekEntries = week.map(toEntry);
    const upcomingEntries = upcoming.map(toEntry);
    const next = upcomingEntries[0] ?? null;

    const activeTasks = tasks.filter(({ task }) => task.status === "assigned");
    const answered = new Set(entries.map((entry) => entry.task_id));
    const collectedUsd = round2(monthPayments.reduce((sum, row) => sum + Number(row.payment.amount_usd), 0));

    return {
      nowIso: now.toISOString(),
      timezone,
      today,
      privateMode,
      week: {
        days: Array.from({ length: 7 }, (_, index) => addDays(monday, index)),
        appointments: weekEntries,
      },
      next: next ? { ...next, context: await this.nextContext(next.patientId, user.id, balances, tasks) } : null,
      stats: {
        weekSessions: weekEntries.filter((item) => item.status !== "cancelled").length,
        weekUnconfirmed: weekEntries.filter(
          (item) => item.status === "scheduled" && Date.parse(item.endsAt) > now.getTime(),
        ).length,
        activePatients: patients.filter((item) => item.status === "active").length,
        newPatientsThisMonth: patients.filter((item) => zonedDay(item.created_at, timezone) >= monthStart).length,
        collectedMonthUsd: collectedUsd,
        owedUsd: balances.owedUsd,
        activeTasks: activeTasks.length,
        answeredTasks: activeTasks.filter(({ task }) => answered.has(task.id)).length,
        unseenEntries: unseen,
      },
      attention: this.attention({
        now,
        timezone,
        today,
        name,
        review,
        entries,
        upcoming: upcomingEntries,
        ended: ended.map(toEntry),
        drafts,
        balances,
      }),
      moods: this.moods(entries, moodFrom, name),
      payments: {
        collectedUsd,
        collectedVes: round2(
          monthPayments.reduce(
            (sum, row) =>
              sum +
              (row.payment.amount_ves !== null
                ? Number(row.payment.amount_ves)
                : Number(row.payment.amount_usd) * (rate?.vesPerUsd ?? 0)),
            0,
          ),
        ),
        rate,
        byMethod: this.byMethod(monthPayments),
        recent: monthPayments.slice(0, 4).map((row) => ({
          id: row.payment.id,
          patient: name(row),
          usd: Number(row.payment.amount_usd),
          method: row.payment.method,
          paidAt: row.payment.paid_at.toISOString(),
        })),
        pending: balances.patients
          .filter((item) => item.balanceUsd > 0)
          .slice(0, 3)
          .map((item) => ({
            patientId: item.id,
            patient: people.has(item.id) ? name(people.get(item.id) as Person) : item.name,
            usd: item.balanceUsd,
            sessions: item.sessions.length,
            oldestDay: item.oldestDay,
            oldestDaysAgo: item.oldestDaysAgo,
            canRemind: Boolean(item.phone || item.email),
          })),
        reviewCount: review.length,
      },
    };
  }

  /** What to glance at before the next session. */
  private async nextContext(
    patient_id: string,
    therapist_id: string,
    balances: Awaited<ReturnType<LoadPatientBalances["execute"]>>,
    tasks: Awaited<ReturnType<TaskRepository["listByTherapist"]>>,
  ) {
    const notes = await this.notes.listByPatient(patient_id, therapist_id);
    const lastNote = notes[0];
    const task = tasks.find(({ task }) => task.patient_id === patient_id && task.status === "assigned")?.task;
    const lastEntry = task ? (await this.tasks.getEntries([task.id]))[0] : undefined;
    const balance = balances.patients.find((item) => item.id === patient_id);

    return {
      lastNote: lastNote
        ? {
            title: lastNote.title,
            createdAt: lastNote.created_at.toISOString(),
            signed: lastNote.signed_at !== null,
          }
        : null,
      task: task
        ? {
            title: task.title,
            lastMood: lastEntry?.mood_score ?? null,
            lastEntryDay: lastEntry?.entry_date ?? null,
          }
        : null,
      owedUsd: balance?.balanceUsd ?? 0,
    };
  }

  private attention(input: {
    now: Date;
    timezone: string;
    today: string;
    name: (person: Person) => string;
    review: Awaited<ReturnType<PaymentRepository["listPayments"]>>;
    entries: Awaited<ReturnType<TaskRepository["getEntriesSince"]>>;
    upcoming: Array<{ id: string; patient: string; day: string; time: string; status: string; startsAt: string }>;
    ended: Array<{ id: string; patient: string }>;
    drafts: number;
    balances: Awaited<ReturnType<LoadPatientBalances["execute"]>>;
  }) {
    const items: Array<{ id: string; kind: AttentionKind; title: string; detail: string; href: string; action: string }> = [];

    // Low moods the therapist hasn't read come first: they may need a call.
    for (const entry of input.entries) {
      if (entry.seen || entry.mood_score === null || entry.mood_score > LOW_MOOD) continue;
      if (items.some((item) => item.id === `mood-${entry.task_id}`)) continue;
      items.push({
        id: `mood-${entry.task_id}`,
        kind: "mood",
        title: `${input.name(entry)} marcó ánimo ${entry.mood_score} de 10`,
        detail: `En "${entry.task_title}", ${entry.entry_date === input.today ? "hoy" : `el ${entry.entry_date.slice(8)}/${entry.entry_date.slice(5, 7)}`}.`,
        href: `/dashboard/tasks?task=${entry.task_id}`,
        action: "Ver respuesta",
      });
    }

    const soon = input.now.getTime() + 48 * HOUR;
    for (const item of input.upcoming) {
      if (item.status !== "scheduled" || Date.parse(item.startsAt) > soon) continue;
      items.push({
        id: `unconfirmed-${item.id}`,
        kind: "unconfirmed",
        title: `${item.patient} no ha confirmado`,
        detail: `Sesión ${item.day === input.today ? "de hoy" : item.day === addDays(input.today, 1) ? "de mañana" : `del ${item.day.slice(8)}/${item.day.slice(5, 7)}`} a las ${item.time.replace(/^0/, "")}.`,
        href: `/dashboard/schedule?month=${item.day.slice(0, 7)}`,
        action: "Abrir agenda",
      });
    }

    if (input.review.length > 0) {
      const total = round2(input.review.reduce((sum, row) => sum + Number(row.payment.amount_usd), 0));
      items.push({
        id: "payments-review",
        kind: "payment",
        title: input.review.length === 1 ? "1 pago por verificar" : `${input.review.length} pagos por verificar`,
        detail: `Revisa los comprobantes (${money(total)}) contra tu banco o billetera.`,
        href: "/dashboard/payments",
        action: "Revisar pagos",
      });
    }

    if (input.ended.length > 0) {
      const names = [...new Set(input.ended.map((item) => item.patient))];
      items.push({
        id: "notes-missing",
        kind: "note",
        title: input.ended.length === 1 ? "1 sesión sin nota" : `${input.ended.length} sesiones sin nota`,
        detail: `De los últimos 7 días: ${names.slice(0, 3).join(", ")}${names.length > 3 ? " y más" : ""}.`,
        href: "/dashboard/notes",
        action: "Escribir notas",
      });
    }

    const overdue = input.balances.patients.filter((item) => item.sessions.some((s) => s.charge === "overdue"));
    if (overdue.length > 0) {
      const total = round2(
        overdue.flatMap((item) => item.sessions).filter((s) => s.charge === "overdue").reduce((sum, s) => sum + s.dueUsd, 0),
      );
      items.push({
        id: "payments-overdue",
        kind: "overdue",
        title: overdue.length === 1 ? "1 paciente con pagos vencidos" : `${overdue.length} pacientes con pagos vencidos`,
        detail: `${money(total)} de sesiones con más de 7 días sin pagar.`,
        href: "/dashboard/payments",
        action: "Enviar recordatorios",
      });
    }

    if (input.drafts > 0) {
      items.push({
        id: "notes-draft",
        kind: "draft",
        title: input.drafts === 1 ? "1 nota sin firmar" : `${input.drafts} notas sin firmar`,
        detail: "Firma tus notas para cerrarlas y protegerlas de cambios.",
        href: "/dashboard/notes",
        action: "Ver notas",
      });
    }

    return { items: items.slice(0, MAX_ATTENTION), total: items.length };
  }

  /** Mood (1–10) per task over the last seven days; the latest answer of each day wins. */
  private moods(
    entries: Awaited<ReturnType<TaskRepository["getEntriesSince"]>>,
    from: string,
    name: (person: Person) => string,
  ) {
    const days = Array.from({ length: MOOD_DAYS }, (_, index) => addDays(from, index));
    const tracks = new Map<
      string,
      { taskId: string; patientId: string; patient: string; task: string; scores: Array<number | null>; unseen: boolean; last: string }
    >();

    // Entries come newest first, so the first one seen for a day is the latest.
    for (const entry of entries) {
      if (entry.mood_score === null) continue;
      const track = tracks.get(entry.task_id) ?? {
        taskId: entry.task_id,
        patientId: entry.patient_id,
        patient: name(entry),
        task: entry.task_title,
        scores: days.map(() => null),
        unseen: false,
        last: entry.entry_date,
      };
      const index = days.indexOf(entry.entry_date);
      if (index >= 0 && track.scores[index] === null) track.scores[index] = entry.mood_score;
      if (!entry.seen) track.unseen = true;
      tracks.set(entry.task_id, track);
    }

    return [...tracks.values()]
      .sort((a, b) => Number(b.unseen) - Number(a.unseen) || b.last.localeCompare(a.last))
      .slice(0, MAX_MOODS)
      .map(({ last: _last, ...track }) => track);
  }

  private byMethod(rows: Awaited<ReturnType<PaymentRepository["listPayments"]>>) {
    const totals = new Map<string, number>();
    for (const row of rows) {
      totals.set(row.payment.method, round2((totals.get(row.payment.method) ?? 0) + Number(row.payment.amount_usd)));
    }
    return [...totals.entries()]
      .map(([method, usd]) => ({ method: method as (typeof rows)[number]["payment"]["method"], usd }))
      .sort((a, b) => b.usd - a.usd);
  }
}

export type TherapistHome = Awaited<ReturnType<LoadTherapistHome["execute"]>>;
export type HomeAppointment = TherapistHome["week"]["appointments"][number];
export type HomeNext = NonNullable<TherapistHome["next"]>;
export type HomeAttention = TherapistHome["attention"]["items"][number];
export type HomeMood = TherapistHome["moods"][number];
