"use client";

import { Monitor, Smartphone } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth/auth-client";

import { EASE_OUT } from "../therapist/parts";
import { ActionButton, ProfileSection, timeAgo } from "./parts";
import type { ProfileSession } from "./types";

const browsers: Array<[RegExp, string]> = [
	[/Edg\//, "Edge"],
	[/OPR\/|Opera/, "Opera"],
	[/Firefox\//, "Firefox"],
	[/SamsungBrowser\//, "Samsung Internet"],
	[/Chrome\//, "Chrome"],
	[/Safari\//, "Safari"],
];

const systems: Array<[RegExp, string]> = [
	[/Windows/, "Windows"],
	[/Android/, "Android"],
	[/iPhone/, "iPhone"],
	[/iPad/, "iPad"],
	[/Mac OS X|Macintosh/, "Mac"],
	[/CrOS/, "ChromeOS"],
	[/Linux/, "Linux"],
];

/** "Chrome en Windows" from a user agent, without a parser dependency. */
export function describeDevice(userAgent: string | null) {
	if (!userAgent) return { label: "Equipo desconocido", mobile: false };
	const browser = browsers.find(([pattern]) => pattern.test(userAgent))?.[1];
	const system = systems.find(([pattern]) => pattern.test(userAgent))?.[1];
	const mobile = /Mobi|Android|iPhone|iPad/.test(userAgent);
	const label =
		browser && system
			? `${browser} en ${system}`
			: (browser ?? system ?? "Equipo desconocido");
	return { label, mobile };
}

export function SessionsList({ sessions }: { sessions: ProfileSession[] }) {
	const router = useRouter();
	const [revoking, setRevoking] = useState<string | null>(null);
	const others = sessions.filter((session) => !session.current);

	async function revoke(token: string) {
		setRevoking(token);
		const { error } = await authClient.revokeSession({ token });
		setRevoking(null);
		if (error) {
			toast.error("No pudimos cerrar esa sesión. Intenta de nuevo.");
			return;
		}
		toast.success("Cerramos esa sesión.");
		router.refresh();
	}

	async function revokeOthers() {
		setRevoking("others");
		const { error } = await authClient.revokeOtherSessions();
		setRevoking(null);
		if (error) {
			toast.error("No pudimos cerrar tus otras sesiones. Intenta de nuevo.");
			return;
		}
		toast.success("Cerramos tus otras sesiones.");
		router.refresh();
	}

	return (
		<ProfileSection
			id="sesiones"
			title="Sesiones abiertas"
			description="Los equipos donde tu cuenta sigue abierta. Si no reconoces uno, ciérralo y cambia tu contraseña."
		>
			<ul className="flex flex-col gap-2">
				<AnimatePresence initial={false}>
					{sessions.map((session) => {
						const device = describeDevice(session.userAgent);
						const Icon = device.mobile ? Smartphone : Monitor;
						return (
							<m.li
								key={session.token}
								layout
								exit={{ opacity: 0, x: 24 }}
								transition={{ duration: 0.3, ease: EASE_OUT }}
								className="flex items-center gap-4 rounded-[1.25rem] bg-dash-ground p-3 pr-4 sm:p-4"
							>
								<span
									aria-hidden="true"
									className={
										session.current
											? "grid size-11 shrink-0 place-items-center rounded-full bg-chapter-violet text-white"
											: "grid size-11 shrink-0 place-items-center rounded-full bg-card"
									}
								>
									<Icon className="size-5" />
								</span>
								<div className="min-w-0 flex-1">
									<p className="truncate font-semibold text-[15px]">
										{device.label}
									</p>
									<p className="truncate text-[14px] text-foreground/70">
										{session.current ? (
											<span className="font-medium text-dash-good">
												Este equipo
											</span>
										) : (
											<span suppressHydrationWarning>
												Activa {timeAgo(session.lastActiveAt)}
											</span>
										)}
										{session.ipAddress ? ` · IP ${session.ipAddress}` : null}
									</p>
								</div>
								{session.current ? null : (
									<ActionButton
										size="small"
										variant="quiet"
										className="bg-card"
										onClick={() => revoke(session.token)}
										pending={revoking === session.token}
										pendingLabel="Cerrando…"
										disabled={revoking !== null}
										aria-label={`Cerrar sesión en ${device.label}`}
									>
										Cerrar
									</ActionButton>
								)}
							</m.li>
						);
					})}
				</AnimatePresence>
			</ul>

			{others.length > 0 ? (
				<ActionButton
					variant="quiet"
					className="mt-5"
					onClick={revokeOthers}
					pending={revoking === "others"}
					pendingLabel="Cerrando…"
					disabled={revoking !== null}
				>
					{others.length === 1
						? "Cerrar la otra sesión"
						: `Cerrar las otras ${others.length} sesiones`}
				</ActionButton>
			) : (
				<p className="mt-5 px-1 text-[15px] text-foreground/75">
					Solo tienes abierta esta sesión.
				</p>
			)}
		</ProfileSection>
	);
}
