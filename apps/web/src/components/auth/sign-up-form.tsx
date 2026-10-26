"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { RevealGroup, RevealItem } from "@/components/landing/motion/reveal";
import { authClient } from "@/lib/auth/auth-client";

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

export function SignUpForm() {
	const router = useRouter();

	const form = useForm({
		defaultValues: { name: "", email: "", password: "" },
		validators: { onSubmit: signUpSchema },
		onSubmit: async ({ value }) => {
			const { error } = await authClient.signUp.email({
				name: value.name.trim(),
				email: value.email,
				password: value.password,
			});
			if (error) {
				toast.error(
					error.code === "USER_ALREADY_EXISTS" ||
						error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
						? "Ya existe una cuenta con ese correo. Prueba a entrar."
						: error.message || "No pudimos crear tu cuenta. Intenta de nuevo.",
				);
				return;
			}
			router.push("/dashboard");
		},
	});

	return (
		<RevealGroup trigger="mount" stagger={0.08} className="space-y-8">
			<AuthHeader
				title="Abre tu consulta en Helsa"
				description="Crea tu cuenta en un minuto. Después configuras tu agenda y tus tarifas a tu ritmo."
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
								placeholder="Ana Pérez"
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
								placeholder="ana@correo.com"
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
				<GoogleButton label="Registrarme con Google" />
			</RevealItem>

			<div className="space-y-2">
				<AuthSwitch
					prompt="¿Ya tienes cuenta?"
					href="/sign-in"
					label="Entra aquí"
				/>
				<AuthSwitch
					prompt="¿Buscas terapia?"
					href="/sign-up/patient"
					label="Crea tu cuenta de paciente"
				/>
			</div>
		</RevealGroup>
	);
}
