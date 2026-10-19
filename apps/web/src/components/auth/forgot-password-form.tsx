"use client";

import { useForm } from "@tanstack/react-form";
import { MailCheck } from "lucide-react";
import { m } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import {
	EASE_OUT,
	RevealGroup,
	RevealItem,
} from "@/components/landing/motion/reveal";
import { authClient } from "@/lib/auth-client";

import { AuthHeader, AuthSwitch, SubmitButton, TextField } from "./form-parts";

const schema = z.object({
	email: z.email("Escribe un correo válido, como ana@correo.com."),
});

function SentNotice({
	email,
	onRetry,
}: {
	email: string;
	onRetry: () => void;
}) {
	return (
		<RevealGroup trigger="mount" stagger={0.08} className="space-y-8">
			<RevealItem>
				<m.span
					className="grid size-14 place-items-center rounded-full bg-primary text-white"
					initial={{ scale: 0.4, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{
						type: "spring",
						stiffness: 380,
						damping: 18,
						delay: 0.1,
					}}
				>
					<MailCheck aria-hidden="true" className="size-6" />
				</m.span>
			</RevealItem>
			<div role="status">
				<AuthHeader
					title="Revisa tu correo"
					description={
						<>
							Si <span className="font-semibold">{email}</span> tiene una cuenta
							en Helsa, te llegará un enlace para crear una contraseña nueva.
							Vence en 10 minutos.
						</>
					}
				/>
			</div>
			<RevealItem
				as="p"
				className="text-base text-foreground/75 leading-relaxed"
			>
				¿No aparece? Mira en spam o promociones, o{" "}
				<button
					type="button"
					onClick={onRetry}
					className="rounded-sm font-semibold text-(--auth-link) underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
				>
					prueba con otro correo
				</button>
				.
			</RevealItem>
			<AuthSwitch
				prompt="¿Ya la recordaste?"
				href="/sign-in"
				label="Volver a entrar"
			/>
		</RevealGroup>
	);
}

export function ForgotPasswordForm() {
	const [sentTo, setSentTo] = useState<string | null>(null);

	const form = useForm({
		defaultValues: { email: "" },
		validators: { onSubmit: schema },
		onSubmit: async ({ value }) => {
			const { error } = await authClient.requestPasswordReset({
				email: value.email,
				redirectTo: "/reset-password",
			});
			if (error) {
				toast.error(
					error.message || "No pudimos enviar el enlace. Intenta de nuevo.",
				);
				return;
			}
			setSentTo(value.email);
		},
	});

	if (sentTo) {
		return (
			<m.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.4, ease: EASE_OUT }}
			>
				<SentNotice email={sentTo} onRetry={() => setSentTo(null)} />
			</m.div>
		);
	}

	return (
		<RevealGroup trigger="mount" stagger={0.08} className="space-y-8">
			<AuthHeader
				title="¿Olvidaste tu contraseña?"
				description="Escribe el correo con el que entras a Helsa y te enviamos un enlace para crear una nueva."
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
					<form.Field name="email">
						{(field) => (
							<TextField
								id={field.name}
								label="Correo electrónico"
								type="email"
								autoComplete="email"
								inputMode="email"
								placeholder="ana@correo.com"
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
								<SubmitButton pending={isSubmitting} pendingLabel="Enviando…">
									Enviarme el enlace
								</SubmitButton>
							</div>
						)}
					</form.Subscribe>
				</form>
			</RevealItem>

			<AuthSwitch
				prompt="¿Ya la recordaste?"
				href="/sign-in"
				label="Volver a entrar"
			/>
		</RevealGroup>
	);
}
