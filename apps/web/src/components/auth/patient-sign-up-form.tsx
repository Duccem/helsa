"use client";

import { useForm } from "@tanstack/react-form";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { signUpPatient } from "@/app/(client)/(auth)/sign-up/patient/actions";
import { RevealGroup, RevealItem } from "@/components/landing/motion/reveal";

import {
	AuthHeader,
	AuthSwitch,
	GoogleButton,
	PasswordField,
	PasswordStrength,
	SubmitButton,
	TextField,
} from "./form-parts";
import { signUpSchema } from "./sign-up-schema";

export function PatientSignUpForm({
	redirectTo,
	therapistName,
}: {
	/** An internal path, already checked on the server. */
	redirectTo?: string;
	therapistName?: string;
}) {
	const router = useRouter();
	const destination = redirectTo ?? "/dashboard";
	const query = redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : "";

	const form = useForm({
		defaultValues: { name: "", email: "", password: "" },
		validators: { onSubmit: signUpSchema },
		onSubmit: async ({ value }) => {
			const result = await signUpPatient({
				name: value.name.trim(),
				email: value.email,
				password: value.password,
			});
			if (!result.ok) {
				toast.error(result.error);
				return;
			}
			router.push(destination as Route);
			router.refresh();
		},
	});

	return (
		<RevealGroup trigger="mount" stagger={0.08} className="space-y-8">
			<AuthHeader
				title={
					therapistName
						? `Agenda con ${therapistName}`
						: "Agenda tu primera sesión"
				}
				description="Crea tu cuenta para elegir horario, recibir recordatorios y pagar tus sesiones en un solo lugar."
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
					<form.Field name="name">
						{(field) => (
							<TextField
								id={field.name}
								label="Nombre y apellido"
								autoComplete="name"
								placeholder="Luis Martínez"
								value={field.state.value}
								onBlur={field.handleBlur}
								onValueChange={field.handleChange}
								errors={field.state.meta.errors}
							/>
						)}
					</form.Field>

					<form.Field name="email">
						{(field) => (
							<TextField
								id={field.name}
								label="Correo electrónico"
								type="email"
								autoComplete="email"
								inputMode="email"
								placeholder="luis@correo.com"
								value={field.state.value}
								onBlur={field.handleBlur}
								onValueChange={field.handleChange}
								errors={field.state.meta.errors}
							/>
						)}
					</form.Field>

					<form.Field name="password">
						{(field) => (
							<div className="space-y-3">
								<PasswordField
									id={field.name}
									label="Contraseña"
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

					<form.Subscribe selector={(state) => state.isSubmitting}>
						{(isSubmitting) => (
							<div className="pt-1">
								<SubmitButton
									pending={isSubmitting}
									pendingLabel="Creando tu cuenta…"
								>
									Crear mi cuenta
								</SubmitButton>
							</div>
						)}
					</form.Subscribe>
				</form>
			</RevealItem>

			<RevealItem className="space-y-4">
				<GoogleButton
					label="Continuar con Google"
					callbackURL={destination}
					newUserCallbackURL={`/sign-up/patient/complete${query}`}
				/>
			</RevealItem>

			<div className="space-y-2">
				<AuthSwitch
					prompt="¿Ya tienes cuenta?"
					href={`/sign-in${query}` as Route}
					label="Entra aquí"
				/>
				<AuthSwitch
					prompt="¿Eres terapeuta?"
					href="/sign-up"
					label="Crea tu consulta"
				/>
			</div>
		</RevealGroup>
	);
}
