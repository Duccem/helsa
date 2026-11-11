import { PatientNotFound } from "@/lib/core/patient/domain/errors";

import { SectionPending } from "../section-pending";

/** What a patient account sees before a therapist links it to their record. */
export function NotLinked({ title }: { title: string }) {
	return (
		<SectionPending
			title={title}
			description="Tu cuenta aún no está vinculada a un terapeuta. Cuando te dé acceso, aquí verás tus citas, tus tareas y tus pagos."
		/>
	);
}

/** Runs a portal loader; null when the account has no linked record. */
export async function loadPortal<T>(load: () => Promise<T>) {
	try {
		return await load();
	} catch (error) {
		if (error instanceof PatientNotFound) return null;
		throw error;
	}
}
