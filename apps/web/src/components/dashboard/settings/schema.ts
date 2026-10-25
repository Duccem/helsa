import type {
	AppPreferences,
	NotificationChannel,
	NotificationEvent,
	NotificationPreferences,
} from "@helsa/db/schema/settings";
import z from "zod";

/*
 * Shapes for every part of the settings page. The forms and the API routes
 * validate against the same schemas, so a message shown in the browser is the
 * one the server would have answered.
 */

export type Modality = "video" | "in_person" | "phone";

export const modalityLabels: Record<Modality, string> = {
	video: "Videollamada",
	in_person: "Presencial",
	phone: "Llamada",
};

export const paymentMethods = [
	"pago_movil",
	"zelle",
	"binance_usdt",
	"transferencia_bs",
	"efectivo_usd",
	"efectivo_bs",
	"tarjeta",
	"otro",
] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

export const paymentMethodLabels: Record<PaymentMethod, string> = {
	pago_movil: "Pago móvil",
	zelle: "Zelle",
	binance_usdt: "Binance (USDT)",
	transferencia_bs: "Transferencia en Bs",
	efectivo_usd: "Efectivo en dólares",
	efectivo_bs: "Efectivo en Bs",
	tarjeta: "Tarjeta",
	otro: "Otro",
};

export const countries = {
	VE: "Venezuela",
	CO: "Colombia",
	MX: "México",
	AR: "Argentina",
	CL: "Chile",
	PE: "Perú",
	EC: "Ecuador",
	PA: "Panamá",
	DO: "República Dominicana",
	ES: "España",
	US: "Estados Unidos",
} as const;
export type CountryCode = keyof typeof countries;

export const languages = {
	es: "Español",
	en: "Inglés",
	pt: "Portugués",
	it: "Italiano",
	fr: "Francés",
} as const;
export type LanguageCode = keyof typeof languages;

/** Zones where Helsa therapists work today, in the order people look for them. */
export const timezones = [
	["America/Caracas", "Caracas"],
	["America/Bogota", "Bogotá, Lima, Quito"],
	["America/Mexico_City", "Ciudad de México"],
	["America/Panama", "Panamá"],
	["America/Santo_Domingo", "Santo Domingo"],
	["America/Santiago", "Santiago de Chile"],
	["America/Argentina/Buenos_Aires", "Buenos Aires"],
	["America/New_York", "Miami, Nueva York"],
	["America/Los_Angeles", "Los Ángeles"],
	["Europe/Madrid", "Madrid"],
] as const;

export const specialtySuggestions = [
	"Ansiedad",
	"Depresión",
	"Duelo",
	"Pareja",
	"Familia",
	"Trauma",
	"Adolescentes",
	"Autoestima",
	"Estrés laboral",
	"TDAH",
	"Trastornos alimentarios",
	"Migración",
];

const trimmed = (max: number, message: string) =>
	z.string().trim().max(max, message);

const optionalText = (max: number) =>
	trimmed(max, `Usa ${max} caracteres o menos.`).transform(
		(value) => value || null,
	);

// ─── Professional profile ────────────────────────────────────────────────────

export const professionalSchema = z.object({
	displayName: z
		.string()
		.trim()
		.min(2, "Escribe el nombre con el que te conocen tus pacientes.")
		.max(80, "Usa 80 caracteres o menos."),
	professionalTitle: optionalText(80),
	licenseNumber: optionalText(40),
	licenseBody: optionalText(120),
	yearsExperience: z
		.number({ error: "Escribe un número de años." })
		.int("Escribe un número entero.")
		.min(0, "Escribe un número de años.")
		.max(70, "Revisa ese número.")
		.nullable(),
	bio: optionalText(1200),
	specialties: z
		.array(z.string().trim().min(2).max(40))
		.max(12, "Elige hasta 12 especialidades."),
	languages: z
		.array(z.enum(Object.keys(languages) as [LanguageCode, ...LanguageCode[]]))
		.min(1, "Elige al menos un idioma."),
	phone: z
		.string()
		.trim()
		.transform((value) => value.replace(/[\s()-]/g, ""))
		.refine(
			(value) => value === "" || /^\+[1-9]\d{6,14}$/.test(value),
			"Escríbelo con el código del país, por ejemplo +58 412 555 0101.",
		)
		.transform((value) => value || null),
	countryCode: z.enum(
		Object.keys(countries) as [CountryCode, ...CountryCode[]],
	),
});
export type ProfessionalInput = z.input<typeof professionalSchema>;

// ─── Weekly hours ────────────────────────────────────────────────────────────

const clock = z
	.string()
	.regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Usa el formato de 24 horas.");

export function minutesOf(time: string) {
	const [hours = 0, minutes = 0] = time.split(":").map(Number);
	return hours * 60 + minutes;
}

export const availabilityRangeSchema = z
	.object({
		/** 0 = Monday … 6 = Sunday (the database counts from Sunday). */
		weekday: z.number().int().min(0).max(6),
		start: clock,
		end: clock,
	})
	.refine((range) => minutesOf(range.start) < minutesOf(range.end), {
		message: "La hora de cierre va después de la de apertura.",
		path: ["end"],
	});
export type AvailabilityRange = z.infer<typeof availabilityRangeSchema>;

export const scheduleSchema = z
	.object({
		timezone: z.string().refine((zone) => {
			try {
				new Intl.DateTimeFormat("en-US", { timeZone: zone });
				return true;
			} catch {
				return false;
			}
		}, "Elige una zona horaria de la lista."),
		sessionMinutes: z
			.number()
			.int()
			.min(15, "Una sesión dura 15 minutos o más.")
			.max(180, "Una sesión dura 3 horas o menos."),
		bufferMinutes: z
			.number()
			.int()
			.min(0, "La pausa no puede ser negativa.")
			.max(60, "Usa una pausa de una hora o menos."),
		ranges: z.array(availabilityRangeSchema).max(40, "Son demasiadas franjas."),
	})
	.superRefine((value, ctx) => {
		for (let day = 0; day < 7; day++) {
			const sorted = value.ranges
				.map((range, index) => ({ ...range, index }))
				.filter((range) => range.weekday === day)
				.sort((a, b) => minutesOf(a.start) - minutesOf(b.start));
			for (let i = 1; i < sorted.length; i++) {
				const previous = sorted[i - 1];
				const current = sorted[i];
				if (
					previous &&
					current &&
					minutesOf(current.start) < minutesOf(previous.end)
				) {
					ctx.addIssue({
						code: "custom",
						message: "Esta franja se cruza con otra del mismo día.",
						path: ["ranges", current.index, "start"],
					});
				}
			}
		}
	});
export type ScheduleInput = z.infer<typeof scheduleSchema>;

/** How many sessions of `session` minutes, with a `buffer` after each, fit in a range. */
export function sessionsThatFit(
	range: { start: string; end: string },
	session: number,
	buffer: number,
) {
	const length = minutesOf(range.end) - minutesOf(range.start);
	if (length < session || session <= 0) return 0;
	return Math.floor((length + buffer) / (session + buffer));
}

// ─── Time off ────────────────────────────────────────────────────────────────

const isoDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Elige una fecha.");

export const timeOffSchema = z
	.object({
		startsOn: isoDay,
		endsOn: isoDay,
		reason: optionalText(120),
	})
	.refine((value) => value.startsOn <= value.endsOn, {
		message: "El último día va después del primero.",
		path: ["endsOn"],
	});
export type TimeOffInput = z.input<typeof timeOffSchema>;

export type TimeOff = {
	id: string;
	startsOn: string;
	endsOn: string;
	reason: string | null;
};

// ─── Prices and payments ─────────────────────────────────────────────────────

const modalityEnum = z.enum(["video", "in_person", "phone"]);

export const rateSchema = z.object({
	id: z.string().optional(),
	name: z
		.string()
		.trim()
		.min(2, "Ponle un nombre, por ejemplo Sesión individual.")
		.max(60, "Usa 60 caracteres o menos."),
	durationMinutes: z
		.number({ error: "Escribe la duración." })
		.int()
		.min(15, "Dura 15 minutos o más.")
		.max(240, "Dura 4 horas o menos."),
	priceUsd: z
		.number({ error: "Escribe el precio." })
		.min(0, "El precio no puede ser negativo.")
		.max(10000, "Revisa ese precio."),
	modality: modalityEnum.nullable(),
	isActive: z.boolean(),
});
export type Rate = z.infer<typeof rateSchema>;

export const pricingSchema = z.object({
	rates: z
		.array(rateSchema)
		.min(1, "Deja al menos un precio.")
		.max(10, "Usa 10 precios o menos."),
	paymentMethods: z
		.array(z.enum(paymentMethods))
		.min(1, "Elige al menos una forma de pago."),
	paymentInstructions: optionalText(600),
});
export type PricingInput = z.input<typeof pricingSchema>;

// ─── Booking ─────────────────────────────────────────────────────────────────

export const bookingSchema = z
	.object({
		enabled: z.boolean(),
		slug: z
			.string()
			.trim()
			.toLowerCase()
			.refine(
				(value) =>
					value === "" || /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/.test(value),
				"Usa de 3 a 40 letras sin acentos, números o guiones.",
			),
		modalities: z.array(modalityEnum).min(1, "Elige al menos una modalidad."),
		officeAddress: optionalText(240),
		noticeHours: z
			.number()
			.int()
			.min(0, "Usa 0 horas o más.")
			.max(336, "Usa dos semanas o menos."),
		cancellationHours: z
			.number()
			.int()
			.min(0, "Usa 0 horas o más.")
			.max(168, "Usa una semana o menos."),
	})
	.superRefine((value, ctx) => {
		if (value.enabled && !value.slug) {
			ctx.addIssue({
				code: "custom",
				message: "Elige tu enlace antes de abrir las reservas.",
				path: ["slug"],
			});
		}
		if (value.modalities.includes("in_person") && !value.officeAddress) {
			ctx.addIssue({
				code: "custom",
				message: "Escribe dónde atiendes en persona.",
				path: ["officeAddress"],
			});
		}
	});
export type BookingInput = z.input<typeof bookingSchema>;

export function toSlug(name: string) {
	return name
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 40)
		.replace(/-$/, "");
}

// ─── Notifications ───────────────────────────────────────────────────────────

export const notificationEvents: Array<{
	id: NotificationEvent;
	label: string;
	detail: string;
}> = [
	{
		id: "booking_new",
		label: "Nueva reserva",
		detail: "Un paciente eligió una hora en tu enlace.",
	},
	{
		id: "booking_cancelled",
		label: "Cancelación",
		detail: "Un paciente canceló o no confirmó su cita.",
	},
	{
		id: "reschedule_request",
		label: "Pedido de cambio de hora",
		detail: "Un paciente quiere mover su sesión.",
	},
	{
		id: "task_completed",
		label: "Tarea respondida",
		detail: "Un paciente completó una tarea entre sesiones.",
	},
	{
		id: "payment_recorded",
		label: "Pago registrado",
		detail: "Se anotó un pago, tuyo o reportado por el paciente.",
	},
	{
		id: "reminder_failed",
		label: "Recordatorio sin entregar",
		detail: "Un WhatsApp o correo para un paciente no llegó.",
	},
	{
		id: "weekly_summary",
		label: "Resumen del domingo",
		detail: "Tu semana siguiente y los cobros pendientes, en un correo.",
	},
];

export const channelLabels: Record<NotificationChannel, string> = {
	app: "En Helsa",
	email: "Correo",
};

const channel = z.enum(["email", "app"]);

export const notificationsSchema = z.object({
	remindersEnabled: z.boolean(),
	events: z.record(
		z.enum([
			"booking_new",
			"booking_cancelled",
			"reschedule_request",
			"task_completed",
			"payment_recorded",
			"reminder_failed",
			"weekly_summary",
		]),
		z.array(channel),
	),
	patientReminders: z.object({
		h24: z.boolean(),
		h2: z.boolean(),
		channel: z.enum(["whatsapp", "email", "both"]),
	}),
	quietHours: z.object({
		enabled: z.boolean(),
		from: clock,
		to: clock,
	}),
});
export type NotificationsInput = z.infer<typeof notificationsSchema>;

export const defaultNotifications: NotificationPreferences = {
	events: {
		booking_new: ["app", "email"],
		booking_cancelled: ["app", "email"],
		reschedule_request: ["app", "email"],
		task_completed: ["app"],
		payment_recorded: ["app"],
		reminder_failed: ["app", "email"],
		weekly_summary: ["email"],
	},
	patientReminders: { h24: true, h2: true, channel: "whatsapp" },
	quietHours: { enabled: true, from: "21:00", to: "07:00" },
};

// ─── App preferences ─────────────────────────────────────────────────────────

export const preferencesSchema = z.object({
	timeFormat: z.enum(["24h", "12h"]),
	weekStartsOn: z.union([z.literal(0), z.literal(6)]),
	currencyDisplay: z.enum(["usd", "ves", "both"]),
	privateMode: z.boolean(),
});
export type PreferencesInput = z.infer<typeof preferencesSchema>;

export const defaultPreferences: AppPreferences = {
	timeFormat: "24h",
	weekStartsOn: 0,
	currencyDisplay: "both",
	privateMode: false,
};

/** Fills what a stored row leaves out, field by field, so old rows keep working. */
export function withDefaults<T extends object>(
	defaults: T,
	stored: Partial<T> | null | undefined,
): T {
	const result = { ...defaults };
	if (!stored) return result;
	for (const key of Object.keys(defaults) as Array<keyof T>) {
		const value = stored[key];
		if (value === undefined || value === null) continue;
		const fallback = defaults[key];
		result[key] =
			fallback &&
			typeof fallback === "object" &&
			!Array.isArray(fallback) &&
			typeof value === "object"
				? ({ ...fallback, ...value } as T[keyof T])
				: (value as T[keyof T]);
	}
	return result;
}

/** The first error for each field, keyed by its dotted path ("rates.0.name"). */
export function fieldErrors(error: z.ZodError) {
	const errors: Record<string, string> = {};
	for (const issue of error.issues) {
		const key = issue.path.join(".");
		if (!(key in errors)) errors[key] = issue.message;
	}
	return errors;
}

// ─── Everything the page loads ───────────────────────────────────────────────

export type TherapistSettings = {
	professional: ProfessionalInput & { licenseVerified: boolean };
	schedule: ScheduleInput;
	timeOff: TimeOff[];
	pricing: PricingInput;
	booking: BookingInput;
	notifications: NotificationsInput;
	preferences: PreferencesInput;
	/** Latest official rate, to show prices in bolívares. */
	vesPerUsd: number | null;
	email: string;
};
