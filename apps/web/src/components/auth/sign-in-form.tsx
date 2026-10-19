"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

import { RevealGroup, RevealItem } from "@/components/landing/motion/reveal";
import { authClient } from "@/lib/auth-client";

import {
	AuthHeader,
	AuthSwitch,
	authLinkClassName,
	GoogleButton,
	PasswordField,
	SubmitButton,
	TextField,
} from "./form-parts";

const schema = z.object({
	email: z.email("Escribe un correo válido, como ana@correo.com."),
	password: z.string().min(1, "Escribe tu contraseña."),
});

export function SignInForm() {
	const router = useRouter();

	const form = useForm({
		defaultValues: { email: "", password: "" },
		validators: { onSubmit: schema },
		onSubmit: async ({ value }) => {
			const { error } = await authClient.signIn.email({
				email: value.email,
				password: value.password,
			});
			if (error) {
				toast.error(
					error.status === 401
						? "El correo o la contraseña no coinciden."
						: error.message ||
								"No pudimos iniciar tu sesión. Intenta de nuevo.",
				);
				return;
			}
			router.push("/dashboard");
		},
	});

	return (
		<RevealGroup trigger="mount" stagger={0.08} className="space-y-8">
			<AuthHeader
				title="Qué bueno verte de nuevo"
				description="Entra para ver tu agenda de hoy, tus pacientes y lo que tienes por cobrar."
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

					<form.Field name="password">
						{(field) => (
							<PasswordField
								id={field.name}
								label="Contraseña"
								autoComplete="current-password"
								value={field.state.value}
								onBlur={field.handleBlur}
								onValueChange={field.handleChange}
								errors={field.state.meta.errors}
								aside={
									<Link href="/forgot-password" className={authLinkClassName}>
										¿La olvidaste?
									</Link>
								}
							/>
						)}
					</form.Field>

					<form.Subscribe selector={(state) => state.isSubmitting}>
						{(isSubmitting) => (
							<div className="pt-1">
								<SubmitButton pending={isSubmitting} pendingLabel="Entrando…">
									Entrar a mi consulta
								</SubmitButton>
							</div>
						)}
					</form.Subscribe>
				</form>
			</RevealItem>

			<RevealItem className="space-y-4">
				<GoogleButton label="Entrar con Google" />
			</RevealItem>

			<AuthSwitch
				prompt="¿Aún no tienes cuenta?"
				href="/sign-up"
				label="Crea la tuya"
			/>
		</RevealGroup>
	);
}
