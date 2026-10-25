/*
 * Sample data for the therapist dashboard. Nothing here is real: it mirrors
 * the shapes in @helsa/db (appointment, patient_task, payment) so the screens
 * can be built before the endpoints exist. Replace module by module.
 */

import { type ClinicNow, calendarDay, toMinutes } from "./clinic-time";

export type Modality = "video" | "in_person" | "phone";
export type Reminder = "confirmed" | "reminded" | "moved" | "failed";
export type SessionState = Reminder | "completed" | "live";

export type Session = {
	id: string;
	/** "HH:MM" in the clinic's time zone. */
	time: string;
	minutes: number;
	patient: string;
	kind: string;
	modality: Modality;
	reminder: Reminder;
	/** Where the patient connects from, when abroad. */
	from?: string;
};

export const modalityLabels: Record<Modality, string> = {
	video: "Videoconsulta",
	in_person: "Presencial",
	phone: "Llamada",
};

export const stateLabels: Record<SessionState, string> = {
	confirmed: "Confirmó por WhatsApp",
	reminded: "Recordatorio enviado",
	moved: "Pidió otra hora",
	failed: "Recordatorio no entregado",
	completed: "Atendida",
	live: "En curso",
};

function s(
	id: string,
	time: string,
	patient: string,
	kind: string,
	modality: Modality,
	reminder: Reminder,
	extra: Partial<Pick<Session, "minutes" | "from">> = {},
): Session {
	return { id, time, patient, kind, modality, reminder, minutes: 50, ...extra };
}

/** A typical week, Monday (0) to Sunday (6). It repeats every week. */
export const weekTemplate: Session[][] = [
	[
		s("mo1", "08:00", "Carlos P.", "Seguimiento", "video", "confirmed"),
		s(
			"mo2",
			"10:00",
			"Valentina M.",
			"Primera consulta",
			"in_person",
			"reminded",
			{ minutes: 60 },
		),
		s("mo3", "15:30", "Andrea L.", "Seguimiento", "video", "moved", {
			from: "Madrid",
		}),
		s("mo4", "17:00", "Gabriela T.", "Seguimiento", "video", "confirmed"),
	],
	[
		s("tu1", "09:00", "María R.", "Seguimiento", "video", "confirmed"),
		s("tu2", "11:00", "José G.", "Seguimiento", "in_person", "confirmed"),
		s("tu3", "14:00", "Luis y Carla S.", "Pareja", "in_person", "reminded", {
			minutes: 80,
		}),
		s("tu4", "18:00", "Rafael D.", "Seguimiento", "video", "failed", {
			from: "Bogotá",
		}),
	],
	[
		s("we1", "08:00", "Carlos P.", "Seguimiento", "video", "confirmed"),
		s("we2", "10:30", "Daniela F.", "Seguimiento", "phone", "reminded"),
		s("we3", "16:00", "Gabriela T.", "Seguimiento", "video", "confirmed"),
	],
	[
		s("th1", "09:00", "María R.", "Seguimiento", "video", "reminded"),
		s("th2", "11:00", "José G.", "Seguimiento", "in_person", "confirmed"),
		s("th3", "15:00", "Valentina M.", "Seguimiento", "in_person", "reminded"),
		s("th4", "17:30", "Sofía H.", "Seguimiento", "video", "confirmed", {
			from: "Miami",
		}),
	],
	[
		s("fr1", "09:30", "Andrea L.", "Seguimiento", "video", "reminded", {
			from: "Madrid",
		}),
		s("fr2", "12:00", "Luis y Carla S.", "Pareja", "in_person", "confirmed", {
			minutes: 80,
		}),
		s("fr3", "16:00", "Daniela F.", "Seguimiento", "phone", "confirmed"),
	],
	[
		s("sa1", "09:00", "Miguel A.", "Seguimiento", "video", "confirmed"),
		s(
			"sa2",
			"10:30",
			"Isabel C.",
			"Primera consulta",
			"in_person",
			"reminded",
			{ minutes: 60 },
		),
		s("sa3", "12:00", "Rafael D.", "Seguimiento", "video", "confirmed", {
			from: "Bogotá",
		}),
	],
	[],
];

/** What a session looks like right now, given the day it falls on. */
export function sessionState(
	session: Session,
	dayOffset: number,
	now: ClinicNow,
): SessionState {
	if (dayOffset < 0) return "completed";
	if (dayOffset > 0) return session.reminder;
	const start = toMinutes(session.time);
	const end = start + session.minutes;
	if (now.minutes >= end) return "completed";
	if (now.minutes >= start) return "live";
	return session.reminder;
}

export type Upcoming = {
	session: Session;
	offset: number;
	weekday: number;
	live: boolean;
	/** Minutes until it starts (0 when live). */
	startsIn: number;
};

/** The session in progress, or the next one within a week. */
export function findUpcoming(now: ClinicNow): Upcoming | null {
	for (let offset = 0; offset <= 7; offset++) {
		const { weekday } = calendarDay(now, offset);
		for (const session of weekTemplate[weekday] ?? []) {
			const state = sessionState(session, offset, now);
			if (state === "completed") continue;
			const startsIn = offset * 24 * 60 + toMinutes(session.time) - now.minutes;
			return {
				session,
				offset,
				weekday,
				live: state === "live",
				startsIn: Math.max(0, startsIn),
			};
		}
	}
	return null;
}

export function weekStats(now: ClinicNow) {
	let total = 0;
	let unconfirmed = 0;
	weekTemplate.forEach((sessions, weekday) => {
		const offset = weekday - now.weekday;
		for (const session of sessions) {
			total++;
			const state = sessionState(session, offset, now);
			if (state === "reminded" || state === "moved" || state === "failed") {
				unconfirmed++;
			}
		}
	});
	return { total, unconfirmed };
}

/** What the therapist should glance at before each session. */
export const patientContext: Record<
	string,
	{ focus: string; lastNote: string; task: string }
> = {
	"Carlos P.": {
		focus: "Duelo por la migración de su hermano",
		lastNote: "Nota del miércoles: dormir mejor, menos rumiación.",
		task: "Registro de pensamientos · ánimo 3 de 10 ayer",
	},
	"Andrea L.": {
		focus: "Ansiedad por la mudanza a Madrid",
		lastNote: "Nota del viernes: practicar respiración antes de las llamadas.",
		task: "Respiración 4-7-8 · ánimo 7 de 10 ayer",
	},
	"María R.": {
		focus: "Autoestima y límites en el trabajo",
		lastNote: "Nota del jueves: logró decir que no a una guardia extra.",
		task: "Diario de gratitud · ánimo 8 de 10 hoy",
	},
};

const defaultContext = {
	focus: "Plan de tratamiento al día",
	lastNote: "Revisa la última nota antes de empezar.",
	task: "Sin tareas pendientes",
};

export function contextFor(patient: string) {
	return patientContext[patient] ?? defaultContext;
}

export type MoodTrack = {
	patient: string;
	task: string;
	/** Last seven days, 1–10; null when the patient did not answer. */
	scores: Array<number | null>;
	unseen: boolean;
};

export const moodTracks: MoodTrack[] = [
	{
		patient: "Carlos P.",
		task: "Registro de pensamientos",
		scores: [5, 5, 4, 4, 3, 4, 3],
		unseen: true,
	},
	{
		patient: "María R.",
		task: "Diario de gratitud",
		scores: [5, 6, 6, 7, 6, 7, 8],
		unseen: false,
	},
	{
		patient: "Valentina M.",
		task: "Exposición gradual",
		scores: [3, 4, null, 5, 5, 6, 6],
		unseen: true,
	},
	{
		patient: "Andrea L.",
		task: "Respiración 4-7-8",
		scores: [6, 6, 5, 6, 7, 7, 7],
		unseen: false,
	},
	{
		patient: "Gabriela T.",
		task: "Registro de sueño",
		scores: [4, 5, 5, null, 6, 6, 7],
		unseen: true,
	},
];

export type AttentionKind = "moved" | "mood" | "consent" | "reminder";

export type AttentionItem = {
	id: string;
	kind: AttentionKind;
	title: string;
	detail: string;
	action: string;
	done: string;
};

export const attentionItems: AttentionItem[] = [
	{
		id: "a1",
		kind: "moved",
		title: "Andrea L. pidió otra hora",
		detail: "Quiere pasar la sesión del lunes de las 15:30 a las 17:00.",
		action: "Aceptar cambio",
		done: "Cita movida. Le avisamos a Andrea por WhatsApp.",
	},
	{
		id: "a2",
		kind: "mood",
		title: "Carlos P. marcó ánimo 3 de 10",
		detail: "Lleva tres días bajando en su registro de pensamientos.",
		action: "Ver respuesta",
		done: "Respuesta marcada como revisada.",
	},
	{
		id: "a3",
		kind: "consent",
		title: "Falta el consentimiento de Valentina M.",
		detail: "Su primera consulta es el lunes a las 10:00.",
		action: "Reenviar enlace",
		done: "Enlace de consentimiento reenviado.",
	},
	{
		id: "a4",
		kind: "reminder",
		title: "El recordatorio a Rafael D. no llegó",
		detail: "WhatsApp falló para la sesión del martes a las 18:00.",
		action: "Enviar por correo",
		done: "Recordatorio enviado por correo.",
	},
];

export type PaymentMethod =
	| "pago_movil"
	| "zelle"
	| "binance_usdt"
	| "efectivo_usd";

export const paymentMethodLabels: Record<PaymentMethod, string> = {
	pago_movil: "Pago móvil",
	zelle: "Zelle",
	binance_usdt: "Binance USDT",
	efectivo_usd: "Efectivo USD",
};

/** Sample rate, not today's BCV rate. */
export const sampleRate = { vesPerUsd: 218.4, source: "BCV" };

export const monthByMethod: Array<{ method: PaymentMethod; usd: number }> = [
	{ method: "pago_movil", usd: 520 },
	{ method: "zelle", usd: 380 },
	{ method: "binance_usdt", usd: 220 },
	{ method: "efectivo_usd", usd: 120 },
];

export const recentPayments: Array<{
	id: string;
	patient: string;
	usd: number;
	method: PaymentMethod;
	when: string;
}> = [
	{
		id: "p1",
		patient: "José G.",
		usd: 40,
		method: "pago_movil",
		when: "Hoy, 11:52",
	},
	{
		id: "p2",
		patient: "Sofía H.",
		usd: 45,
		method: "zelle",
		when: "Ayer, 18:40",
	},
	{
		id: "p3",
		patient: "María R.",
		usd: 40,
		method: "zelle",
		when: "Ayer, 9:58",
	},
	{
		id: "p4",
		patient: "Miguel A.",
		usd: 40,
		method: "binance_usdt",
		when: "Jueves, 20:15",
	},
];

export const pendingPayments: Array<{
	id: string;
	patient: string;
	usd: number;
	detail: string;
}> = [
	{
		id: "d1",
		patient: "Luis y Carla S.",
		usd: 60,
		detail: "Sesión de pareja del viernes",
	},
	{ id: "d2", patient: "Rafael D.", usd: 35, detail: "Sesión del martes" },
];

export const practiceStats = {
	activePatients: 27,
	newThisMonth: 2,
	tasksAnswered: 9,
	tasksAssigned: 12,
};
