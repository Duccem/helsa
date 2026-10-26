"use client";

import { useForm } from "@tanstack/react-form";
import { CircleCheck, MailWarning } from "lucide-react";
import { m } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { TextField } from "@/components/auth/form-parts";
import { authClient } from "@/lib/auth/auth-client";

import { EASE_OUT } from "../therapist/parts";
import { ActionButton, ProfileSection } from "./parts";
import type { ProfileUser } from "./types";

const schema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "Escribe tu nombre completo.")
		.max(80, "Usa 80 caracteres o menos."),
	email: z.email("Revisa el correo; parece incompleto."),
});

const CALLBACK = "/dashboard/profile";

function EmailStatus({
	email,
	verified,
}: {
	email: string;
	verified: boolean;
}) {
	const [sending, setSending] = useState(false);

	if (verified) {
		return (
			<span className="inline-flex items-center gap-1.5 font-medium text-[14px] text-dash-good">
				<CircleCheck aria-hidden="true" className="size-4" />
				Verificado
			</span>
		);
	}

	return (
		<button
			type="button"
			disabled={sending}
			onClick={async () => {
				setSending(true);
				const { error } = await authClient.sendVerificationEmail({
					email,
					callbackURL: CALLBACK,
				});
				setSending(false);
				if (error) {
					toast.error("No pudimos enviar el enlace. Intenta en un momento.");
					return;
				}
				toast.success(`Te enviamos un enlace a ${email}.`);
			}}
			className="inline-flex items-center gap-1.5 rounded-full font-semibold text-[14px] text-dash-link underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
		>
			<MailWarning aria-hidden="true" className="size-4" />
			{sending ? "Enviando…" : "Sin verificar · Enviar enlace"}
		</button>
	);
}

export function DetailsForm({ user }: { user: ProfileUser }) {
	const router = useRouter();
	const [pendingEmail, setPendingEmail] = useState<string | null>(null);

	const form = useForm({
		defaultValues: { name: user.name, email: user.email },
		validators: { onSubmit: schema },
		onSubmit: async ({ value, formApi }) => {
			const name = value.name.trim();
			const email = value.email.trim().toLowerCase();
			const nameChanged = name !== user.name;
			const emailChanged = email !== user.email.toLowerCase();

			if (nameChanged) {
				const { error } = await authClient.updateUser({ name });
				if (error) {
					toast.error("No pudimos guardar tu nombre. Intenta de nuevo.");
					return;
				}
			}

			if (emailChanged) {
				const { error } = await authClient.changeEmail({
					newEmail: email,
					callbackURL: CALLBACK,
				});
				if (error) {
					toast.error(
						error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
							? "Ese correo ya pertenece a otra cuenta."
							: error.message || "No pudimos cambiar tu correo.",
					);
					return;
				}
				setPendingEmail(email);
			}

			// The new email only counts once it is confirmed, so the field goes back.
			formApi.reset({ name, email: user.email });
			toast.success(
				emailChanged
					? `Te enviamos un enlace a ${email}. Tu correo cambia cuando lo abras.`
					: "Guardamos tus datos.",
			);
			router.refresh();
		},
	});

	return (
		<ProfileSection
			id="datos"
			title="Datos personales"
			description="Así te ven tus pacientes en las citas y en los recordatorios."
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
				<form.Field name="name">
					{(field) => (
						<TextField
							id="profile-name"
							label="Nombre completo"
							autoComplete="name"
							value={field.state.value}
							onBlur={field.handleBlur}
							onValueChange={field.handleChange}
							errors={field.state.meta.errors}
						/>
					)}
				</form.Field>

				<form.Field name="email">
					{(field) => (
						<div className="space-y-2">
							<TextField
								id="profile-email"
								label="Correo"
								type="email"
								autoComplete="email"
								inputMode="email"
								value={field.state.value}
								onBlur={field.handleBlur}
								onValueChange={field.handleChange}
								errors={field.state.meta.errors}
								aside={
									<EmailStatus
										email={user.email}
										verified={user.emailVerified}
									/>
								}
							/>
							{pendingEmail ? (
								<m.p
									initial={{ opacity: 0, y: -4 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, ease: EASE_OUT }}
									className="px-5 text-[14px] leading-relaxed"
									role="status"
								>
									Esperamos que confirmes{" "}
									<span className="font-semibold">{pendingEmail}</span>. Hasta
									entonces seguimos usando {user.email}.
								</m.p>
							) : null}
						</div>
					)}
				</form.Field>

				<form.Subscribe
					selector={(state) => [state.isSubmitting, state.isDefaultValue]}
				>
					{([isSubmitting, isDefault]) => (
						<div className="flex flex-wrap items-center gap-3 pt-1">
							<ActionButton
								type="submit"
								pending={isSubmitting}
								pendingLabel="Guardando…"
								disabled={isDefault}
							>
								Guardar cambios
							</ActionButton>
							{!isDefault && !isSubmitting ? (
								<ActionButton variant="quiet" onClick={() => form.reset()}>
									Descartar
								</ActionButton>
							) : null}
						</div>
					)}
				</form.Subscribe>
			</form>
		</ProfileSection>
	);
}
