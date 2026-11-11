import {
	EmailButton,
	EmailFallbackLink,
	EmailHeading,
	EmailLayout,
	EmailNote,
	EmailText,
} from "../components/layout";

export type ResetPasswordEmailProps = {
	baseUrl: string;
	name: string;
	url: string;
	/** Minutes until the link stops working. */
	expiresInMinutes: number;
};

export default function ResetPasswordEmail({
	baseUrl,
	name,
	url,
	expiresInMinutes,
}: ResetPasswordEmailProps) {
	return (
		<EmailLayout baseUrl={baseUrl} preview="Restablece tu contraseña de Helsa">
			<EmailHeading>Restablece tu contraseña</EmailHeading>
			<EmailText>Hola {name},</EmailText>
			<EmailText>
				Recibimos una solicitud para restablecer la contraseña de tu cuenta. Usa
				el siguiente botón para elegir una nueva.
			</EmailText>
			<EmailButton href={url}>Restablecer contraseña</EmailButton>
			<EmailFallbackLink href={url} />
			<EmailNote>
				El enlace caduca en {expiresInMinutes} minutos. Si no solicitaste este
				cambio, ignora este correo: tu contraseña seguirá siendo la misma.
			</EmailNote>
		</EmailLayout>
	);
}

ResetPasswordEmail.PreviewProps = {
	baseUrl: "http://localhost:3001",
	name: "Ana",
	url: "http://localhost:3001/api/auth/reset-password/token?callbackURL=/reset-password",
	expiresInMinutes: 10,
} satisfies ResetPasswordEmailProps;
