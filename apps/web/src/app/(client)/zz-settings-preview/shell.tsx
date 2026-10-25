"use client";
// TEMPORARY visual check. Delete before committing.
import { domMax, LazyMotion, MotionConfig } from "motion/react";

import { TherapistSettingsPage } from "@/components/dashboard/settings/settings-page";
import type { TherapistSettings } from "@/components/dashboard/settings/schema";
import { defaultNotifications, defaultPreferences } from "@/components/dashboard/settings/schema";

const sample: TherapistSettings = {
	email: "ana.morales@correo.com",
	vesPerUsd: 41.2,
	professional: {
		displayName: "Ana Morales",
		professionalTitle: "Psicóloga clínica",
		licenseNumber: "FPV 12.345",
		licenseBody: "Federación de Psicólogos de Venezuela",
		licenseVerified: true,
		yearsExperience: 9,
		bio: "Acompaño a adultos con ansiedad y duelo desde la terapia cognitivo-conductual.",
		specialties: ["Ansiedad", "Duelo", "Migración"],
		languages: ["es", "en"],
		phone: "+584125550101",
		countryCode: "VE",
	},
	schedule: {
		timezone: "America/Caracas",
		sessionMinutes: 50,
		bufferMinutes: 10,
		ranges: [
			{ weekday: 0, start: "09:00", end: "13:00" },
			{ weekday: 0, start: "15:00", end: "19:00" },
			{ weekday: 1, start: "09:00", end: "13:00" },
			{ weekday: 2, start: "14:00", end: "20:00" },
			{ weekday: 3, start: "09:00", end: "13:00" },
			{ weekday: 3, start: "15:00", end: "18:00" },
			{ weekday: 4, start: "09:00", end: "12:00" },
		],
	},
	timeOff: [{ id: "a", startsOn: "2026-12-24", endsOn: "2027-01-02", reason: "Vacaciones de diciembre" }],
	pricing: {
		rates: [
			{ id: "1", name: "Sesión individual", durationMinutes: 50, priceUsd: 40, modality: null, isActive: true },
			{ id: "2", name: "Terapia de pareja", durationMinutes: 80, priceUsd: 60, modality: "video", isActive: true },
		],
		paymentMethods: ["pago_movil", "zelle"],
		paymentInstructions: "",
	},
	booking: { enabled: true, slug: "ana-morales", modalities: ["video", "in_person"], officeAddress: "Torre Lumen, piso 4, Chacao", noticeHours: 12, cancellationHours: 24 },
	notifications: { remindersEnabled: true, ...defaultNotifications } as TherapistSettings["notifications"],
	preferences: defaultPreferences,
};

export function PreviewShell() {
	return (
		<LazyMotion features={domMax} strict>
			<MotionConfig reducedMotion="user">
				<div className="font-landing min-h-dvh bg-dash-ground px-4 py-8 sm:px-8">
					<TherapistSettingsPage settings={sample} />
				</div>
			</MotionConfig>
		</LazyMotion>
	);
}
