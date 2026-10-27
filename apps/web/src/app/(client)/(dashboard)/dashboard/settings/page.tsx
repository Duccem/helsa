import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { toDashboardRole } from "@/components/dashboard/navigation";
import type {
	PreferencesInput,
	TherapistSettings,
} from "@/components/dashboard/settings/schema";
import {
	PatientSettingsPage,
	TherapistSettingsPage,
} from "@/components/dashboard/settings/settings-page";
import { LoadPreferences } from "@/lib/core/settings/use-cases/load-preferences";
import { LoadTherapistSettings } from "@/lib/core/settings/use-cases/load-therapist-settings";
import { auth } from "@/services";

export const metadata: Metadata = { title: "Configuración" };
const loadPreferences = new LoadPreferences();
const loadTherapistSettings = new LoadTherapistSettings();

export default async function Page() {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session?.user) {
		redirect("/sign-in");
	}

	const { user } = session;

	if (toDashboardRole(user.role) === "patient") {
		return (
			<PatientSettingsPage
				preferences={
					(await loadPreferences.execute(user.id)) as PreferencesInput
				}
			/>
		);
	}

	const settings = await loadTherapistSettings.execute(user);
	return <TherapistSettingsPage settings={settings as TherapistSettings} />;
}
