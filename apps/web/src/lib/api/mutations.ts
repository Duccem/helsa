"use client";

import { useMutation } from "@tanstack/react-query";

import type { SignUpInput } from "@/components/auth/sign-up-schema";
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
