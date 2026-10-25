"use client";

import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
} from "@helsa/ui/components/alert-dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { PasswordField, TextField } from "@/components/auth/form-parts";
import { authClient } from "@/lib/auth-client";

import type { DashboardRole } from "../navigation";
import { ActionButton, ProfileSection } from "./parts";

const whatGoes: Record<DashboardRole, string[]> = {
	therapist: [
		"Tus pacientes y sus expedientes",
		"Las notas clínicas y los consentimientos",
		"Tu agenda, tus tareas y el registro de cobros",
	],
	patient: [
		"Tus citas pasadas y próximas",
		"Tus tareas y lo que respondiste en ellas",
		"El registro de tus pagos",
	],
};

export function DeleteAccount({
	email,
	role,
	hasPassword,
}: {
	email: string;
	role: DashboardRole;
	hasPassword: boolean;
}) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [typed, setTyped] = useState("");
	const [password, setPassword] = useState("");
	const [passwordError, setPasswordError] = useState<string>();
	const [pending, setPending] = useState(false);

	const confirmed = typed.trim().toLowerCase() === email.toLowerCase();
	const ready = confirmed && (!hasPassword || password.length > 0);

	function reset(next: boolean) {
		setOpen(next);
		if (!next) {
			setTyped("");
			setPassword("");
			setPasswordError(undefined);
		}
	}

	async function confirm(event: React.FormEvent) {
		event.preventDefault();
		if (!ready) return;
		setPending(true);
		setPasswordError(undefined);
		const { error } = await authClient.deleteUser(
			hasPassword ? { password, callbackURL: "/" } : { callbackURL: "/" },
		);
		if (error) {
			setPending(false);
			if (error.code === "INVALID_PASSWORD") {
				setPasswordError("Esa no es tu contraseña.");
				return;
			}
			if (error.code === "SESSION_EXPIRED") {
				toast.error(
					"Por seguridad, cierra sesión, vuelve a entrar y repite este paso.",
				);
				return;
			}
			toast.error(error.message || "No pudimos eliminar tu cuenta.");
			return;
		}
		toast.success("Eliminamos tu cuenta. Gracias por haber usado Helsa.");
		router.replace("/");
		router.refresh();
	}

	return (
		<ProfileSection
			id="eliminar"
			title="Eliminar cuenta"
			description="Se borra para siempre. No podemos recuperarla después."
			className="bg-[color-mix(in_oklch,var(--destructive)_7%,var(--card))]"
		>
			<p className="text-[16px] leading-relaxed">Con tu cuenta se borran:</p>
			<ul className="mt-3 grid gap-2 text-[16px]">
				{whatGoes[role].map((item) => (
					<li key={item} className="flex items-baseline gap-3">
						<span
							aria-hidden="true"
							className="size-1.5 shrink-0 translate-y-[-0.15em] rounded-full bg-dash-alert"
						/>
						{item}
					</li>
				))}
			</ul>
			<ActionButton
				variant="danger"
				className="mt-6"
				onClick={() => setOpen(true)}
			>
				Eliminar mi cuenta
			</ActionButton>

			<AlertDialog open={open} onOpenChange={reset}>
				<AlertDialogContent className="max-w-[calc(100%-2rem)] gap-0 rounded-[1.75rem] p-6 shadow-[0_24px_60px_-20px_oklch(0.2_0.06_287/0.45)] ring-0 data-[size=default]:max-w-md sm:p-8 data-[size=default]:sm:max-w-md">
					<AlertDialogTitle className="font-display font-medium text-[1.75rem] leading-tight tracking-[-0.02em]">
						¿Eliminar tu cuenta?
					</AlertDialogTitle>
					<AlertDialogDescription className="mt-3 text-[15px] text-foreground/80 leading-relaxed">
						Borraremos todo lo que guardaste en Helsa. Para confirmar, escribe
						tu correo{hasPassword ? " y tu contraseña" : ""}.
					</AlertDialogDescription>

					<form onSubmit={confirm} noValidate className="mt-6 grid gap-4">
						<TextField
							id="delete-confirm-email"
							label={`Escribe ${email}`}
							type="email"
							autoComplete="off"
							value={typed}
							onValueChange={setTyped}
							errors={[]}
						/>
						{hasPassword ? (
							<PasswordField
								id="delete-password"
								label="Tu contraseña"
								autoComplete="current-password"
								value={password}
								onValueChange={(value) => {
									setPasswordError(undefined);
									setPassword(value);
								}}
								errors={passwordError ? [passwordError] : []}
							/>
						) : null}
						<div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
							<ActionButton
								variant="quiet"
								onClick={() => reset(false)}
								disabled={pending}
							>
								Cancelar
							</ActionButton>
							<ActionButton
								type="submit"
								variant="danger"
								pending={pending}
								pendingLabel="Eliminando…"
								disabled={!ready}
							>
								Eliminar para siempre
							</ActionButton>
						</div>
					</form>
				</AlertDialogContent>
			</AlertDialog>
		</ProfileSection>
	);
}
