import {
	EmailButton,
	EmailFallbackLink,
	EmailHeading,
	EmailLayout,
	EmailNote,
	EmailText,
} from "../components/layout";

export type VerifyEmailProps = {
	baseUrl: string;
	name: string;
	url: string;
};

export default function VerifyEmail({ baseUrl, name, url }: VerifyEmailProps) {
	return (
		<EmailLayout
			baseUrl={baseUrl}
			preview="Confirma tu correo electrónico en Helsa"
		>
			<EmailHeading>Confirma tu correo</EmailHeading>
			<EmailText>Hola {name},</EmailText>
			<EmailText>
				Para terminar de configurar tu cuenta, confirma que esta dirección de
				correo te pertenece.
			</EmailText>
			<EmailButton href={url}>Verificar correo</EmailButton>
			<EmailFallbackLink href={url} />
			<EmailNote>
				Si no creaste una cuenta en Helsa ni pediste este cambio, puedes ignorar
				este correo.
			</EmailNote>
		</EmailLayout>
	);
}

VerifyEmail.PreviewProps = {
	baseUrl: "http://localhost:3001",
	name: "Ana",
	url: "http://localhost:3001/api/auth/verify-email?token=token&callbackURL=/",
} satisfies VerifyEmailProps;
