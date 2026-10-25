"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { PasswordField, PasswordStrength } from "@/components/auth/form-parts";
import { useSetAccountPassword } from "@/lib/api/mutations";
import { authClient } from "@/lib/auth-client";

import { ActionButton, ProfileSection } from "./parts";

const newPassword = z
	.string()
	.min(8, "Usa al menos 8 caracteres.")
	.max(128, "Usa 128 caracteres o menos.");

const changeSchema = z
	.object({
		current: z.string().min(1, "Escribe tu contraseña actual."),
		password: newPassword,
		confirm: z.string(),
		signOutOthers: z.boolean(),
	})
	.refine((value) => value.password === value.confirm, {
		message: "Las contraseñas no coinciden.",
		path: ["confirm"],
	})
	.refine((value) => value.password !== value.current, {
		message: "Elige una distinta a la actual.",
		path: ["password"],
	});

const createSchema = z
	.object({
		current: z.string(),
		password: newPassword,
		confirm: z.string(),
		signOutOthers: z.boolean(),
	})
	.refine((value) => value.password === value.confirm, {
		message: "Las contraseñas no coinciden.",
		path: ["confirm"],
	});

const empty = { current: "", password: "", confirm: "", signOutOthers: true };

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
	const router = useRouter();
	const [currentError, setCurrentError] = useState<string>();
	const setPassword = useSetAccountPassword();

	const form = useForm({
		defaultValues: empty,
		validators: { onSubmit: hasPassword ? changeSchema : createSchema },
		onSubmit: async ({ value, formApi }) => {
			setCurrentError(undefined);

			if (!hasPassword) {
				try {
					await setPassword.mutateAsync(value.password);
				} catch (error) {
					toast.error((error as Error).message);
					return;
				}
				formApi.reset(empty);
				toast.success("Listo. Ya puedes entrar también con tu correo.");
				router.refresh();
				return;
			}

			const { error } = await authClient.changePassword({
				currentPassword: value.current,
				newPassword: value.password,
				revokeOtherSessions: value.signOutOthers,
			});
			if (error) {
				if (error.code === "INVALID_PASSWORD") {
					setCurrentError("Esa no es tu contraseña actual.");
					return;
				}
				toast.error(
					error.message ||
						"No pudimos cambiar tu contraseña. Intenta de nuevo.",
				);
				return;
			}
			formApi.reset(empty);
			toast.success(
				value.signOutOthers
					? "Cambiamos tu contraseña y cerramos tus otras sesiones."
					: "Cambiamos tu contraseña.",
			);
			router.refresh();
		},
	});

	return (
		<ProfileSection
			id="contrasena"
			title={hasPassword ? "Contraseña" : "Crea una contraseña"}
			description={
				hasPassword
					? "Cámbiala si crees que alguien más la conoce. Una frase corta es fácil de recordar y difícil de adivinar."
					: "Hoy entras con Google. Con una contraseña también podrás entrar con tu correo."
			}
		>
			<form
				noValidate
				onSubmit={(event) => {
					event.preventDefault();
					event.stopPropagation();
					form.handleSubmit();
				}}
				className="grid gap-5"
			>
				{hasPassword ? (
					<form.Field name="current">
						{(field) => (
							<PasswordField
								id="profile-current-password"
								label="Contraseña actual"
								autoComplete="current-password"
								value={field.state.value}
								onBlur={field.handleBlur}
								onValueChange={(next) => {
									setCurrentError(undefined);
									field.handleChange(next);
								}}
								errors={[...field.state.meta.errors, currentError].filter(
									Boolean,
								)}
								aside={
									<Link
										href="/forgot-password"
										className="rounded-sm font-medium text-[14px] text-dash-link underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
									>
										¿La olvidaste?
									</Link>
								}
							/>
						)}
					</form.Field>
				) : null}

				<div className="grid gap-5 xl:grid-cols-2">
					<form.Field name="password">
						{(field) => (
							<div className="space-y-3">
								<PasswordField
									id="profile-new-password"
									label={hasPassword ? "Contraseña nueva" : "Contraseña"}
									autoComplete="new-password"
									value={field.state.value}
									onBlur={field.handleBlur}
									onValueChange={field.handleChange}
									errors={field.state.meta.errors}
								/>
								{field.state.meta.errors.length === 0 ? (
									<PasswordStrength password={field.state.value} />
								) : null}
							</div>
						)}
					</form.Field>

					<form.Field name="confirm">
						{(field) => (
							<PasswordField
								id="profile-confirm-password"
								label="Repítela"
								autoComplete="new-password"
								value={field.state.value}
								onBlur={field.handleBlur}
								onValueChange={field.handleChange}
								errors={field.state.meta.errors}
							/>
						)}
					</form.Field>
				</div>

				{hasPassword ? (
					<form.Field name="signOutOthers">
						{(field) => (
							<label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-dash-ground px-5 py-4 text-[15px] leading-snug transition-colors hover:bg-chapter-lilac">
								<input
									type="checkbox"
									checked={field.state.value}
									onChange={(event) => field.handleChange(event.target.checked)}
									className="mt-0.5 size-5 shrink-0 cursor-pointer accent-chapter-violet"
								/>
								<span>
									Cerrar sesión en mis otros equipos
									<span className="mt-0.5 block text-[14px] text-foreground/70">
										Este equipo sigue abierto. En los demás tendrás que entrar
										con la nueva.
									</span>
								</span>
							</label>
						)}
					</form.Field>
				) : null}

				<form.Subscribe selector={(state) => state.isSubmitting}>
					{(isSubmitting) => (
						<div className="pt-1">
							<ActionButton
								type="submit"
								pending={isSubmitting}
								pendingLabel="Guardando…"
							>
								{hasPassword ? "Cambiar contraseña" : "Crear contraseña"}
							</ActionButton>
						</div>
					)}
				</form.Subscribe>
			</form>
		</ProfileSection>
	);
}
