"use client";

import { useMutation } from "@tanstack/react-query";

import type {
	NoteInput,
	PatientInput,
	TaskInput,
} from "@/components/dashboard/patients/schema";
import type {
	RecordPaymentInput,
	ReviewPaymentInput,
	SendReminderInput,
} from "@/components/dashboard/payments/schema";
import type { TimeOffInput } from "@/components/dashboard/settings/schema";
import type { WaitlistInput } from "@/components/landing/waitlist-schema";

import { ApiError, apiFetch } from "./client";

export function useJoinWaitlist() {
	return useMutation({
		mutationFn: (input: WaitlistInput) =>
			apiFetch("/api/waitlist", { method: "POST", body: input }),
	});
}

export type SettingsSection =
	| "professional"
	| "schedule"
	| "pricing"
	| "booking"
	| "notifications"
	| "preferences";

/** Saves one part of the settings page; each part replaces what was stored. */
export function useSaveSettings(section: SettingsSection) {
	return useMutation({
		mutationFn: (input: unknown) =>
			apiFetch(`/api/settings/${section}`, { method: "PUT", body: input }),
	});
}

export function useAddTimeOff() {
	return useMutation({
		mutationFn: (input: TimeOffInput) =>
			apiFetch<{ id: string; affected: number }>("/api/settings/time-off", {
				method: "POST",
				body: input,
			}),
	});
}

export function useRemoveTimeOff() {
	return useMutation({
		mutationFn: (id: string) =>
			apiFetch(`/api/settings/time-off/${id}`, { method: "DELETE" }),
	});
}

// ─── Patients ────────────────────────────────────────────────────────────────

export function useCreatePatient() {
	return useMutation({
		mutationFn: (input: PatientInput) =>
			apiFetch<{ id: string }>("/api/patients", {
				method: "POST",
				body: input,
			}),
	});
}

export function useUpdatePatient(patientId: string) {
	return useMutation({
		mutationFn: (input: PatientInput) =>
			apiFetch(`/api/patients/${patientId}`, { method: "PUT", body: input }),
	});
}

type NoteRef = { patientId: string; noteId: string };

/** Creates a note (no `noteId`) or replaces a draft. */
export function useSaveNote() {
	return useMutation({
		mutationFn: ({
			patientId,
			noteId,
			...input
		}: NoteInput & { patientId: string; noteId?: string }) =>
			apiFetch<{ id?: string }>(
				noteId
					? `/api/patients/${patientId}/notes/${noteId}`
					: `/api/patients/${patientId}/notes`,
				{ method: noteId ? "PUT" : "POST", body: input },
			),
	});
}

export function useSignNote() {
	return useMutation({
		mutationFn: ({ patientId, noteId }: NoteRef) =>
			apiFetch(`/api/patients/${patientId}/notes/${noteId}/sign`, {
				method: "POST",
			}),
	});
}

export function useDeleteNote() {
	return useMutation({
		mutationFn: ({ patientId, noteId }: NoteRef) =>
			apiFetch(`/api/patients/${patientId}/notes/${noteId}`, {
				method: "DELETE",
			}),
	});
}

/** Assigns a new task (no `taskId`) or changes an active one. */
export function useSaveTask() {
	return useMutation({
		mutationFn: ({
			patientId,
			taskId,
			...input
		}: TaskInput & { patientId: string; taskId?: string }) =>
			apiFetch<{ id?: string }>(
				taskId
					? `/api/patients/${patientId}/tasks/${taskId}`
					: `/api/patients/${patientId}/tasks`,
				{ method: taskId ? "PUT" : "POST", body: input },
			),
	});
}

export type TaskAction = "cancel" | "complete" | "seen";

export function useTaskAction() {
	return useMutation({
		mutationFn: ({
			patientId,
			taskId,
			action,
		}: {
			patientId: string;
			taskId: string;
			action: TaskAction;
		}) =>
			apiFetch(`/api/patients/${patientId}/tasks/${taskId}/${action}`, {
				method: "POST",
			}),
	});
}

export function useUploadFile(patientId: string) {
	return useMutation({
		mutationFn: async (file: File) => {
			const form = new FormData();
			form.append("file", file);
			let response: Response;
			try {
				response = await fetch(`/api/patients/${patientId}/files`, {
					method: "POST",
					body: form,
				});
			} catch {
				throw new ApiError("Revisa tu conexión e intenta de nuevo.", 0);
			}
			const data = await response.json().catch(() => null);
			if (!response.ok) {
				throw new ApiError(
					data?.error ?? data?.message ?? "No pudimos subir el archivo.",
					response.status,
				);
			}
			return data as { id: string };
		},
	});
}

export function useDeleteFile(patientId: string) {
	return useMutation({
		mutationFn: (fileId: string) =>
			apiFetch(`/api/patients/${patientId}/files/${fileId}`, {
				method: "DELETE",
			}),
	});
}

// ─── Payments ────────────────────────────────────────────────────────────────

export function useRecordPayment() {
	return useMutation({
		mutationFn: (input: RecordPaymentInput) =>
			apiFetch<{ count: number }>("/api/payments", {
				method: "POST",
				body: input,
			}),
	});
}

export function useReviewPayment() {
	return useMutation({
		mutationFn: ({
			paymentId,
			...input
		}: ReviewPaymentInput & { paymentId: string }) =>
			apiFetch(`/api/payments/${paymentId}/review`, {
				method: "POST",
				body: input,
			}),
	});
}

export function useDeletePayment() {
	return useMutation({
		mutationFn: (paymentId: string) =>
			apiFetch(`/api/payments/${paymentId}`, { method: "DELETE" }),
	});
}

export type ReminderDelivery =
	| { status: "sent"; provider: string }
	| { status: "handoff"; provider: string; url: string };

export function useSendReminder() {
	return useMutation({
		mutationFn: (input: SendReminderInput) =>
			apiFetch<ReminderDelivery>("/api/payments/reminders", {
				method: "POST",
				body: input,
			}),
	});
}
