"use client";

import { useMutation } from "@tanstack/react-query";

import type { SignUpInput } from "@/components/auth/sign-up-schema";
import type { TimeOffInput } from "@/components/dashboard/settings/schema";
import type { WaitlistInput } from "@/components/landing/waitlist-schema";

import { apiFetch } from "./client";

export function useJoinWaitlist() {
	return useMutation({
		mutationFn: (input: WaitlistInput) =>
			apiFetch("/api/waitlist", { method: "POST", body: input }),
	});
}

export function useSignUpPatient() {
	return useMutation({
		mutationFn: (input: SignUpInput) =>
			apiFetch("/api/sign-up/patient", { method: "POST", body: input }),
	});
}

export function useSetAccountPassword() {
	return useMutation({
		mutationFn: (newPassword: string) =>
			apiFetch("/api/account/password", {
				method: "POST",
				body: { newPassword },
			}),
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
