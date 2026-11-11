import {
	EmailButton,
	EmailHeading,
	EmailLayout,
	EmailNote,
	EmailText,
} from "../components/layout";

export type PasswordChangedEmailProps = {
	baseUrl: string;
	name: string;
	/** When the password was changed. */
	changedAt: Date;
};

const dateFormat = new Intl.DateTimeFormat("es", {
	dateStyle: "long",
	timeStyle: "short",
	timeZone: "UTC",
});

export default function PasswordChangedEmail({
	baseUrl,
	name,
	changedAt,
}: PasswordChangedEmailProps) {
	return (
		<EmailLayout baseUrl={baseUrl} preview="Tu contraseña de Helsa se cambió">
			<EmailHeading>Tu contraseña se cambió</EmailHeading>
			<EmailText>Hola {name},</EmailText>
			<EmailText>
				Te confirmamos que la contraseña de tu cuenta se cambió el{" "}
				{dateFormat.format(changedAt)} (UTC). Por seguridad, cerramos todas tus
				sesiones abiertas.
			</EmailText>
			<EmailText>
				Si fuiste tú, no necesitas hacer nada más. Si no reconoces este cambio,
				restablece tu contraseña de inmediato.
			</EmailText>
			<EmailButton href={`${baseUrl}/forgot-password`}>
				Restablecer contraseña
			</EmailButton>
			<EmailNote>
				Este aviso se envía siempre que cambia la contraseña de tu cuenta.
			</EmailNote>
		</EmailLayout>
	);
}

PasswordChangedEmail.PreviewProps = {
	baseUrl: "http://localhost:3001",
	name: "Ana",
	changedAt: new Date("2026-11-11T18:30:00Z"),
} satisfies PasswordChangedEmailProps;
