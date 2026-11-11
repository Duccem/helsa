import SessionReminderEmail from "@helsa/email/templates/session-reminder";
import { createElement } from "react";
import {
	getAutomatedSender,
	type MessageSender,
	whatsappTemplates,
} from "@/lib/infra/messaging";
import { mailer } from "@/services";
import { ReminderRepository } from "../adapters/reminder-repository";
import {
	defaultPatientReminders,
	dueReminder,
	formatSessionTime,
	modalityLabel,
	preferredChannels,
	REMINDER_LEAD,
	type ReminderChannel,
	type ReminderKind,
} from "../domain/reminders";

type Due = Awaited<ReturnType<ReminderRepository["getStartingSoon"]>>[number];

export type ReminderRunSummary = {
	checked: number;
	sent: number;
	failed: number;
	skipped: number;
};

/**
 * Sends the session reminders that are due (a day and two hours before), on
 * the channels each therapist chose. Meant to run every few minutes from a
 * cron job: every reminder is claimed in the database before it's sent, so
 * overlapping or repeated runs never send one twice.
 */
export class SendDueSessionReminders {
	private reminders = new ReminderRepository();

	async execute(now = new Date()): Promise<ReminderRunSummary> {
		const due = await this.reminders.getStartingSoon(
			now,
			new Date(now.getTime() + REMINDER_LEAD.h24),
		);
		const summary: ReminderRunSummary = {
			checked: due.length,
			sent: 0,
			failed: 0,
			skipped: 0,
		};

		for (const session of due) {
			const kind = dueReminder(session.starts_at, now);
			if (!kind) continue;

			const preferences = {
				...defaultPatientReminders,
				...session.notifications?.patientReminders,
			};
			if (!preferences[kind]) continue;

			for (const plan of this.plan(session, preferences.channel)) {
				const outcome = await this.deliver(session, kind, plan, now);
				summary[outcome] += 1;
			}
		}

		return summary;
	}

	/**
	 * Which channels to use and, for the ones that can't be used, why. When
	 * WhatsApp isn't possible and the therapist didn't also pick email, email
	 * stands in so the patient still gets reminded.
	 */
	private plan(session: Due, choice: "whatsapp" | "email" | "both") {
		const wanted = preferredChannels(choice);
		const plans: Array<
			| { channel: ReminderChannel; sender: MessageSender }
			| { channel: ReminderChannel; skip: string }
		> = [];

		for (const channel of wanted) {
			const reason = this.unavailable(session, channel);
			const sender = getAutomatedSender(channel);
			if (reason || !sender) {
				plans.push({
					channel,
					skip: reason ?? `${channel} no está configurado`,
				});
				if (channel === "whatsapp" && !wanted.includes("email")) {
					const email = getAutomatedSender("email");
					if (email && !this.unavailable(session, "email")) {
						plans.push({ channel: "email", sender: email });
					}
				}
				continue;
			}
			plans.push({ channel, sender });
		}

		return plans;
	}

	private unavailable(session: Due, channel: ReminderChannel): string | null {
		if (channel === "email") {
			return session.patient_email ? null : "el paciente no tiene correo";
		}
		if (!session.patient_phone) return "el paciente no tiene teléfono";
		if (!session.patient_whatsapp_opt_in)
			return "el paciente no aceptó recibir WhatsApp";
		return null;
	}

	private async deliver(
		session: Due,
		kind: ReminderKind,
		plan: ReturnType<SendDueSessionReminders["plan"]>[number],
		now: Date,
	): Promise<"sent" | "failed" | "skipped"> {
		const claim = {
			appointment_id: session.id,
			kind,
			channel: plan.channel,
			scheduled_for: new Date(
				session.starts_at.getTime() - REMINDER_LEAD[kind],
			),
		};

		if ("skip" in plan) {
			// Recorded once, so the next runs don't keep evaluating it.
			await this.reminders.claim({
				...claim,
				status: "skipped",
				error: plan.skip,
			});
			return "skipped";
		}

		const id = await this.reminders.claim({ ...claim, status: "pending" });
		if (!id) return "skipped"; // Already handled by an earlier run.

		try {
			const delivery = await plan.sender.send(
				this.message(session, kind, plan.channel, id),
			);
			await this.reminders.markSent(
				id,
				delivery.status === "sent" ? delivery.providerMessageId : null,
				now,
			);
			return "sent";
		} catch (error) {
			await this.reminders.markFailed(
				id,
				error instanceof Error ? error.message : String(error),
			);
			return "failed";
		}
	}

	private message(
		session: Due,
		kind: ReminderKind,
		channel: ReminderChannel,
		reminderId: string,
	) {
		const patientName =
			session.patient_preferred_name || session.patient_first_name;
		const { date, time, zone } = formatSessionTime(
			session.starts_at,
			session.patient_timezone,
		);
		const modality = modalityLabel(session.modality);
		const location =
			session.modality === "in_person"
				? (session.location ?? session.office_address)
				: null;
		// Only a signed-in patient can open these without a guest key.
		const hasPortal = Boolean(session.patient_user_id);
		const subject =
			kind === "h2"
				? `Tu sesión con ${session.therapist_name} empieza a las ${time}`
				: `Recordatorio: sesión con ${session.therapist_name} el ${date}`;

		return {
			channel,
			to: {
				name: `${session.patient_first_name} ${session.patient_last_name}`.trim(),
				phone: session.patient_phone,
				email: session.patient_email,
			},
			subject,
			text: `${subject}. ${modality}, ${time} (${zone}).`,
			replyTo: session.therapist_email,
			idempotencyKey: `session-reminder/${reminderId}`,
			emailTemplate: createElement(SessionReminderEmail, {
				baseUrl: mailer.baseUrl,
				patientName,
				therapistName: session.therapist_name,
				kind,
				date,
				time: `${time} (${zone})`,
				modality,
				location,
				joinUrl:
					hasPortal && session.modality === "video"
						? `${mailer.baseUrl}/s/${session.id}`
						: null,
				manageUrl: hasPortal ? `${mailer.baseUrl}/dashboard` : null,
				needsConfirmation: session.status === "scheduled",
			}),
			whatsappTemplate: whatsappTemplates.sessionReminder({
				patient_name: patientName,
				therapist_name: session.therapist_name,
				date,
				time: `${time}, ${zone}`,
				modality: modality.toLowerCase(),
			}),
		};
	}
}
