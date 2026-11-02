import z from "zod";

import type { PatientProfile } from "@/lib/core/patient/use-cases/load-patient-profile";

/*
 * Shapes for the patient pages. Forms and API routes validate with the same
 * schemas, so the browser shows the message the server would have answered.
 */

export const patientStatuses = [
	"active",
	"prospect",
	"inactive",
	"discharged",
] as const;
export type PatientStatus = (typeof patientStatuses)[number];

export const patientStatusLabels: Record<PatientStatus, string> = {
	active: "Activo",
	prospect: "Prospecto",
	inactive: "Inactivo",
	discharged: "De alta",
};

export const patientStatusStyles: Record<PatientStatus, string> = {
	active: "bg-chapter-teal text-foreground",
	prospect: "bg-chapter-lilac text-chapter-violet dark:text-foreground",
	inactive: "bg-dash-ground text-muted-foreground",
	discharged: "bg-chapter-peach text-foreground",
};

export const genderOptions = [
	["", "Sin indicar"],
	["female", "Femenino"],
	["male", "Masculino"],
	["non_binary", "No binario"],
	["other", "Otro"],
] as const;

export const genderLabels: Record<string, string> = Object.fromEntries(
	genderOptions.filter(([value]) => value),
);

const optionalText = (max: number) =>
	z.string().trim().max(max, `Máximo ${max} caracteres.`);

const isoDate = z
	.string()
	.trim()
	.refine(
		(value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
		"Usa una fecha válida.",
	);

export const patientSchema = z.object({
	firstName: z
		.string()
		.trim()
		.min(1, "Escribe el nombre.")
		.max(60, "Máximo 60 caracteres."),
	lastName: z
		.string()
		.trim()
		.min(1, "Escribe el apellido.")
		.max(60, "Máximo 60 caracteres."),
	preferredName: optionalText(60),
	nationalId: optionalText(30),
	birthDate: isoDate.refine(
		(value) => value === "" || value <= new Date().toISOString().slice(0, 10),
		"La fecha no puede ser futura.",
	),
	gender: optionalText(30),
	email: z
		.string()
		.trim()
		.refine(
			(value) => value === "" || z.email().safeParse(value).success,
			"Escribe un correo válido.",
		),
	phone: z
		.string()
		.trim()
		.refine(
			(value) =>
				value === "" || /^\+[1-9]\d{6,14}$/.test(value.replace(/[\s()-]/g, "")),
			"Usa el formato internacional, por ejemplo +58 412 1234567.",
		),
	whatsappOptIn: z.boolean(),
	countryCode: z.string().length(2),
	city: optionalText(80),
	timezone: z.string().min(1),
	emergencyName: optionalText(80),
	emergencyPhone: optionalText(30),
	emergencyRelation: optionalText(40),
	/** Missing = leave the stored (encrypted) value untouched. */
	intakeReason: optionalText(4000).optional(),
	status: z.enum(patientStatuses),
	sessionPriceUsd: z
		.number("Escribe un monto válido.")
		.min(0, "El monto no puede ser negativo.")
		.max(10000, "Revisa el monto.")
		.nullable(),
});
export type PatientInput = z.infer<typeof patientSchema>;

export const emptyPatient: PatientInput = {
	firstName: "",
	lastName: "",
	preferredName: "",
	nationalId: "",
	birthDate: "",
	gender: "",
	email: "",
	phone: "",
	whatsappOptIn: false,
	countryCode: "VE",
	city: "",
	timezone: "America/Caracas",
	emergencyName: "",
	emergencyPhone: "",
	emergencyRelation: "",
	intakeReason: "",
	status: "active",
	sessionPriceUsd: null,
};

/** The stored patient as form values, for the edit page. */
export function toPatientInput(
	patient: PatientProfile["patient"],
): PatientInput {
	return {
		firstName: patient.firstName,
		lastName: patient.lastName,
		preferredName: patient.preferredName ?? "",
		nationalId: patient.nationalId ?? "",
		birthDate: patient.birthDate ?? "",
		gender: patient.gender ?? "",
		email: patient.email ?? "",
		phone: patient.phone ?? "",
		whatsappOptIn: patient.whatsappOptIn,
		countryCode: patient.countryCode,
		city: patient.city ?? "",
		timezone: patient.timezone,
		emergencyName: patient.emergencyName ?? "",
		emergencyPhone: patient.emergencyPhone ?? "",
		emergencyRelation: patient.emergencyRelation ?? "",
		// A value we could not decrypt is left out so saving never erases it.
		intakeReason: patient.intakeLocked
			? undefined
			: (patient.intakeReason ?? ""),
		status: patient.status,
		sessionPriceUsd: patient.sessionPriceUsd,
	};
}

// ─── Notes ───────────────────────────────────────────────────────────────────

export const noteSchema = z.object({
	title: optionalText(120),
	content: z
		.string()
		.trim()
		.min(1, "La nota está vacía.")
		.max(20000, "Máximo 20 000 caracteres."),
	/** The session the note is about. Only read when the note is created. */
	appointmentId: z.uuid().nullish(),
});
export type NoteInput = z.infer<typeof noteSchema>;

// ─── Tasks ───────────────────────────────────────────────────────────────────

export const taskFrequencies = ["once", "daily", "weekly"] as const;
export type TaskFrequency = (typeof taskFrequencies)[number];

export const taskFrequencyLabels: Record<TaskFrequency, string> = {
	once: "Una vez",
	daily: "Cada día",
	weekly: "Cada semana",
};

export const taskStatusLabels = {
	assigned: "Asignada",
	completed: "Completada",
	cancelled: "Cancelada",
} as const;

export const taskSchema = z
	.object({
		title: z
			.string()
			.trim()
			.min(2, "Escribe un título.")
			.max(120, "Máximo 120 caracteres."),
		instructions: optionalText(2000),
		frequency: z.enum(taskFrequencies),
		startsOn: isoDate.refine((value) => value !== "", "Elige una fecha."),
		dueOn: isoDate,
		asksMood: z.boolean(),
	})
	.refine((task) => task.dueOn === "" || task.dueOn >= task.startsOn, {
		message: "La fecha límite debe ser posterior al inicio.",
		path: ["dueOn"],
	});
export type TaskInput = z.infer<typeof taskSchema>;

// ─── Files ───────────────────────────────────────────────────────────────────

/** Vercel functions accept bodies up to 4.5 MB. */
export const FILE_MAX_BYTES = 4 * 1024 * 1024;

export const FILE_TYPES: Record<string, string> = {
	"application/pdf": "PDF",
	"image/jpeg": "Imagen",
	"image/png": "Imagen",
	"image/webp": "Imagen",
	"image/heic": "Imagen",
	"text/plain": "Texto",
	"application/msword": "Word",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document":
		"Word",
	"application/vnd.ms-excel": "Excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
	"audio/mpeg": "Audio",
	"audio/mp4": "Audio",
	"audio/ogg": "Audio",
};

/** Why a file can't be attached, or null if it can. */
export function validateFile(file: { type: string; size: number }) {
	if (!(file.type in FILE_TYPES)) {
		return "Formato no admitido. Usa PDF, imagen, Word, Excel, texto o audio.";
	}
	if (file.size === 0) return "El archivo está vacío.";
	if (file.size > FILE_MAX_BYTES) return "El archivo pesa más de 4 MB.";
	return null;
}

export function formatBytes(bytes: number) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
