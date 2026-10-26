"use client";

import { useForm } from "@tanstack/react-form";
import { CircleCheck, Hourglass } from "lucide-react";
import { m } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { RevealGroup, RevealItem } from "@/components/landing/motion/reveal";
import { authClient } from "@/lib/auth/auth-client";

import {
	AuthHeader,
	AuthSwitch,
	PasswordField,
	PasswordStrength,
	SubmitButton,
} from "./form-parts";

const schema = z
	.object({
		password: z.string().min(8, "Usa al menos 8 caracteres."),
		confirm: z.string(),
	})
	.refine((value) => value.password === value.confirm, {
		message: "Las contraseñas no coinciden.",
		path: ["confirm"],
	});

const primaryLinkClassName =
	"inline-flex h-12 w-full items-center justify-center rounded-full bg-(--auth-action) font-semibold text-[15px] text-white outline-none transition-[background-color,transform] hover:bg-(--auth-action-hover) focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]";

function StatusIcon({ children }: { children: React.ReactNode }) {
	return (
		<RevealItem>
			<m.span
				className="grid size-14 place-items-center rounded-full bg-primary text-white"
				initial={{ scale: 0.4, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ type: "spring", stiffness: 380, damping: 18, delay: 0.1 }}
			>
				{children}
			</m.span>
		</RevealItem>
	);
}

function ExpiredLink() {
	return (
		<RevealGroup trigger="mount" stagger={0.08} className="space-y-8">
			<StatusIcon>
				<Hourglass aria-hidden="true" className="size-6" />
			</StatusIcon>
			<AuthHeader
				title="Este enlace ya venció"
				description="Por seguridad, cada enlace sirve una sola vez y dura 10 minutos. Pide otro y úsalo desde el mismo correo."
			/>
			<RevealItem>
				<Link href="/forgot-password" className={primaryLinkClassName}>
					Pedir un enlace nuevo
				</Link>
			</RevealItem>
			<AuthSwitch
				prompt="¿Ya la recordaste?"
				href="/sign-in"
				label="Volver a entrar"
			/>
		</RevealGroup>
	);
}

function PasswordChanged() {
	return (
		<RevealGroup
			trigger="mount"
			stagger={0.08}
			className="space-y-8"
			role="status"
		>
			<StatusIcon>
				<CircleCheck aria-hidden="true" className="size-6" />
			</StatusIcon>
			<AuthHeader
				title="Listo, ya la cambiaste"
				description="Cerramos tus sesiones en otros equipos. Entra con tu contraseña nueva para seguir."
			/>
			<RevealItem>
				<Link href="/sign-in" className={primaryLinkClassName}>
					Entrar a mi consulta
				</Link>
			</RevealItem>
		</RevealGroup>
	);
}

export function ResetPasswordForm({ token }: { token: string | null }) {
	const [done, setDone] = useState(false);
	const [expired, setExpired] = useState(!token);

	const form = useForm({
		defaultValues: { password: "", confirm: "" },
		validators: { onSubmit: schema },
		onSubmit: async ({ value }) => {
			if (!token) return;
			const { error } = await authClient.resetPassword({
				newPassword: value.password,
				token,
			});
			if (error) {
				if (error.code === "INVALID_TOKEN") {
					setExpired(true);
					return;
				}
				toast.error(
					error.message ||
						"No pudimos cambiar tu contraseña. Intenta de nuevo.",
				);
				return;
			}
			setDone(true);
		},
	});

	if (expired) return <ExpiredLink />;
	if (done) return <PasswordChanged />;

	return (
		<RevealGroup trigger="mount" stagger={0.08} className="space-y-8">
			<AuthHeader
				title="Crea una contraseña nueva"
				description="Elige una que no uses en otros sitios. Te pediremos esta la próxima vez que entres."
			/>

			<RevealItem>
				<form
					noValidate
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-5"
				>
					<form.Field name="password">
						{(field) => (
							<div className="space-y-3">
								<PasswordField
									id={field.name}
									label="Contraseña nueva"
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
								id={field.name}
								label="Repítela"
								autoComplete="new-password"
								value={field.state.value}
								onBlur={field.handleBlur}
								onValueChange={field.handleChange}
								errors={field.state.meta.errors}
							/>
						)}
					</form.Field>

					<form.Subscribe selector={(state) => state.isSubmitting}>
						{(isSubmitting) => (
							<div className="pt-1">
								<SubmitButton pending={isSubmitting} pendingLabel="Guardando…">
									Guardar contraseña
								</SubmitButton>
							</div>
						)}
					</form.Subscribe>
				</form>
			</RevealItem>
		</RevealGroup>
	);
}
