import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { SessionNotice } from "@/components/video/session-notice";
import { SessionScreen } from "@/components/video/session-screen";
import {
	VideoAccessDenied,
	VideoSessionNotFound,
} from "@/lib/core/video/domain/errors";
import { LoadVideoSession } from "@/lib/core/video/use-cases/load-video-session";
import { VideoNotConfigured } from "@/lib/infra/jitsi";
import { auth } from "@/services";

const loadVideoSession = new LoadVideoSession();

export const metadata: Metadata = {
	title: "Sesión · Helsa",
	robots: { index: false, follow: false },
	// The link carries the patient's key: don't hand it to other sites.
	referrer: "no-referrer",
};

type Props = {
	params: Promise<{ id: string }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Public video session. The therapist and a signed-in patient enter with their
 * account; anyone else needs the patient link (`?k=`) and joins as a guest.
 */
export default async function Page({ params, searchParams }: Props) {
	const [{ id }, query, auth_session] = await Promise.all([
		params,
		searchParams,
		headers().then((all) => auth.api.getSession({ headers: all })),
	]);
	const key = typeof query.k === "string" ? query.k : undefined;

	try {
		const session = await loadVideoSession.execute(
			{ appointmentId: id, key },
			auth_session?.user ?? null,
		);
		return <SessionScreen session={session} />;
	} catch (error) {
		if (error instanceof VideoSessionNotFound) notFound();
		if (error instanceof VideoNotConfigured) {
			return (
				<SessionNotice
					title="Las videollamadas no están disponibles"
					body="El servidor de video no está configurado. Avísale a tu terapeuta."
				/>
			);
		}
		if (error instanceof VideoAccessDenied) {
			const back = `/s/${id}`;
			return auth_session ? (
				<SessionNotice
					title="Esta sesión no es tuya"
					body="Entraste con una cuenta que no participa en esta sesión. Usa el enlace que te envió tu terapeuta o cambia de cuenta."
				/>
			) : (
				<SessionNotice
					title="Este enlace no es válido"
					body="Pídele a tu terapeuta el enlace de la sesión. Si tienes cuenta en Helsa, entra con ella."
					action={{
						href: `/sign-in?redirect=${encodeURIComponent(back)}`,
						label: "Entrar a mi cuenta",
					}}
				/>
			);
		}
		throw error;
	}
}
