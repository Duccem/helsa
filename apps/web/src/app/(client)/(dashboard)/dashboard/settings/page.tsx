import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { toDashboardRole } from "@/components/dashboard/navigation";
import type { PreferencesInput } from "@/components/dashboard/settings/schema";
import {
	PatientSettingsPage,
	TherapistSettingsPage,
} from "@/components/dashboard/settings/settings-page";
import { LoadPreferences } from "@/lib/core/settings/use-cases/load-preferences";
import { loadTherapistSettings } from "@/lib/settings";
import { auth } from "@/services";

export const metadata: Metadata = { title: "Configuración" };
const loadPreferences = new LoadPreferences();

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

	const settings = await loadTherapistSettings({
		id: user.id,
		name: user.name,
		email: user.email,
	});
	return <TherapistSettingsPage settings={settings} />;
}
