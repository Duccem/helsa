"use client";

import { useMutation } from "@tanstack/react-query";

import type {
	NoteInput,
	PatientInput,
	TaskInput,
} from "@/components/dashboard/patients/schema";
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

export function useSaveNote(patientId: string) {
	return useMutation({
		mutationFn: ({ noteId, ...input }: NoteInput & { noteId?: string }) =>
			noteId
				? apiFetch(`/api/patients/${patientId}/notes/${noteId}`, {
						method: "PUT",
						body: input,
					})
				: apiFetch(`/api/patients/${patientId}/notes`, {
						method: "POST",
						body: input,
					}),
	});
}

export function useSignNote(patientId: string) {
	return useMutation({
		mutationFn: (noteId: string) =>
			apiFetch(`/api/patients/${patientId}/notes/${noteId}/sign`, {
				method: "POST",
			}),
	});
}

export function useDeleteNote(patientId: string) {
	return useMutation({
		mutationFn: (noteId: string) =>
			apiFetch(`/api/patients/${patientId}/notes/${noteId}`, {
				method: "DELETE",
			}),
	});
}

export function useAssignTask(patientId: string) {
	return useMutation({
		mutationFn: (input: TaskInput) =>
			apiFetch(`/api/patients/${patientId}/tasks`, {
				method: "POST",
				body: input,
			}),
	});
}

export function useTaskAction(patientId: string) {
	return useMutation({
		mutationFn: ({
			taskId,
			action,
		}: {
			taskId: string;
			action: "cancel" | "seen";
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
