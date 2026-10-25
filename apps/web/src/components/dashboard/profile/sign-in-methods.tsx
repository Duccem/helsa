"use client";

import { KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { GoogleMark } from "@/components/auth/form-parts";
import { authClient } from "@/lib/auth-client";

import { ActionButton, formatShortDate, ProfileSection } from "./parts";
import type { ProfileAccount } from "./types";

function MethodRow({
	icon,
	title,
	detail,
	action,
}: {
	icon: React.ReactNode;
	title: string;
	detail: React.ReactNode;
	action?: React.ReactNode;
}) {
	return (
		<li className="flex flex-wrap items-center gap-4 rounded-[1.25rem] bg-dash-ground p-3 pr-4 sm:p-4">
			<span
				aria-hidden="true"
				className="grid size-11 shrink-0 place-items-center rounded-full bg-card"
			>
				{icon}
			</span>
			<div className="min-w-[10rem] flex-1">
				<p className="font-semibold text-[15px]">{title}</p>
				<p className="text-[14px] text-foreground/70">{detail}</p>
			</div>
			{action}
		</li>
	);
}

export function SignInMethods({
	email,
	accounts,
}: {
	email: string;
	accounts: ProfileAccount[];
}) {
	const router = useRouter();
	const [pending, setPending] = useState<"link" | "unlink" | null>(null);
	const credential = accounts.find(
		(account) => account.providerId === "credential",
	);
	const google = accounts.find((account) => account.providerId === "google");
	const onlyOne = accounts.length <= 1;

	async function linkGoogle() {
		setPending("link");
		const { error } = await authClient.linkSocial({
			provider: "google",
			callbackURL: "/dashboard/profile#acceso",
		});
		// On success the browser is already on its way to Google.
		if (error) {
			setPending(null);
			toast.error(error.message || "No pudimos conectar con Google.");
		}
	}

	async function unlinkGoogle() {
		if (!google) return;
		setPending("unlink");
		const { error } = await authClient.unlinkAccount({ accountId: google.id });
		setPending(null);
		if (error) {
			toast.error(error.message || "No pudimos desconectar Google.");
			return;
		}
		toast.success("Desconectamos tu cuenta de Google.");
		router.refresh();
	}

	return (
		<ProfileSection
			id="acceso"
			title="Formas de entrar"
			description="Puedes usar más de una. Si pierdes el acceso a una, la otra te sigue dejando entrar."
		>
			<ul className="flex flex-col gap-2">
				<MethodRow
					icon={<KeyRound className="size-5" />}
					title="Correo y contraseña"
					detail={
						credential ? (
							<>Entras con {email}</>
						) : (
							<>
								Aún no tienes contraseña.{" "}
								<a
									href="#contrasena"
									className="rounded-sm font-semibold text-dash-link underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
								>
									Créala aquí
								</a>
							</>
						)
					}
				/>
				<MethodRow
					icon={<GoogleMark />}
					title="Google"
					detail={
						google
							? `Conectada el ${formatShortDate(google.createdAt)}`
							: "Entra con un clic usando tu cuenta de Google."
					}
					action={
						google ? (
							<ActionButton
								size="small"
								variant="quiet"
								className="bg-card"
								onClick={unlinkGoogle}
								pending={pending === "unlink"}
								pendingLabel="Desconectando…"
								disabled={onlyOne || pending !== null}
								title={
									onlyOne
										? "Crea una contraseña antes de desconectar Google"
										: undefined
								}
							>
								Desconectar
							</ActionButton>
						) : (
							<ActionButton
								size="small"
								onClick={linkGoogle}
								pending={pending === "link"}
								pendingLabel="Abriendo Google…"
								disabled={pending !== null}
							>
								Conectar
							</ActionButton>
						)
					}
				/>
			</ul>
			{google && onlyOne ? (
				<p className="mt-4 px-1 text-[14px] text-foreground/75">
					Para desconectar Google, primero crea una contraseña. Así no te quedas
					sin forma de entrar.
				</p>
			) : null}
		</ProfileSection>
	);
}
