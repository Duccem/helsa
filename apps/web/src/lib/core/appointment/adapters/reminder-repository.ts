import { and, eq, gt, inArray, isNull, lte } from "@helsa/db/operators";
import {
	appointment,
	appointment_reminder,
} from "@helsa/db/schema/appointment";
import { user } from "@helsa/db/schema/auth";
import { patient } from "@helsa/db/schema/patient";
import { user_settings } from "@helsa/db/schema/settings";
import { therapist } from "@helsa/db/schema/therapist";
import { db } from "@/services";
import type {
	ReminderChannel,
	ReminderKind,
	ReminderStatus,
} from "../domain/reminders";

export class ReminderRepository {
	/**
	 * Active appointments starting in (from, to] whose therapist sends
	 * reminders, with everything a reminder needs about both sides.
	 */
	async getStartingSoon(from: Date, to: Date) {
		return db
			.select({
				id: appointment.id,
				starts_at: appointment.starts_at,
				status: appointment.status,
				modality: appointment.modality,
				location: appointment.location,
				patient_first_name: patient.first_name,
				patient_preferred_name: patient.preferred_name,
				patient_last_name: patient.last_name,
				patient_email: patient.email,
				patient_phone: patient.phone_e164,
				patient_whatsapp_opt_in: patient.whatsapp_opt_in,
				patient_timezone: patient.timezone,
				patient_user_id: patient.user_id,
				therapist_name: therapist.display_name,
				therapist_email: user.email,
				office_address: therapist.office_address,
				notifications: user_settings.notifications,
			})
			.from(appointment)
			.innerJoin(patient, eq(patient.id, appointment.patient_id))
			.innerJoin(therapist, eq(therapist.user_id, appointment.therapist_id))
			.innerJoin(user, eq(user.id, therapist.user_id))
			.leftJoin(user_settings, eq(user_settings.user_id, therapist.user_id))
			.where(
				and(
					gt(appointment.starts_at, from),
					lte(appointment.starts_at, to),
					inArray(appointment.status, ["scheduled", "confirmed"]),
					eq(therapist.reminders_enabled, true),
					isNull(patient.deleted_at),
				),
			);
	}

	/**
	 * Claims one reminder before sending it. Returns null when another run
	 * already claimed it (unique on appointment, kind and channel).
	 */
	async claim(data: {
		appointment_id: string;
		kind: ReminderKind;
		channel: ReminderChannel;
		scheduled_for: Date;
		status: ReminderStatus;
		error?: string | null;
	}) {
		const [row] = await db
			.insert(appointment_reminder)
			.values({ ...data, attempts: data.status === "pending" ? 1 : 0 })
			.onConflictDoNothing()
			.returning({ id: appointment_reminder.id });

		return row?.id ?? null;
	}

	async markSent(id: string, provider_message_id: string | null, at: Date) {
		await db
			.update(appointment_reminder)
			.set({ status: "sent", provider_message_id, sent_at: at, error: null })
			.where(eq(appointment_reminder.id, id));
	}

	async markFailed(id: string, error: string) {
		await db
			.update(appointment_reminder)
			.set({ status: "failed", error })
			.where(eq(appointment_reminder.id, id));
	}
}
