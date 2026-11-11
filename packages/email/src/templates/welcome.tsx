import {
	EmailButton,
	EmailHeading,
	EmailLayout,
	EmailNote,
	EmailText,
} from "../components/layout";

export type WelcomeEmailProps = {
	baseUrl: string;
	name: string;
};

export default function WelcomeEmail({ baseUrl, name }: WelcomeEmailProps) {
	return (
		<EmailLayout baseUrl={baseUrl} preview="Te damos la bienvenida a Helsa">
			<EmailHeading>Bienvenido a Helsa, {name}</EmailHeading>
			<EmailText>
				Tu cuenta ya está lista. Desde Helsa puedes gestionar tu agenda, tus
				pacientes y tus sesiones en un solo lugar.
			</EmailText>
			<EmailText>
				Entra a tu panel para completar tu perfil y empezar.
			</EmailText>
			<EmailButton href={`${baseUrl}/sign-in`}>Ir a Helsa</EmailButton>
			<EmailNote>
				Si no creaste esta cuenta, puedes ignorar este correo.
			</EmailNote>
		</EmailLayout>
	);
}

WelcomeEmail.PreviewProps = {
	baseUrl: "http://localhost:3001",
	name: "Ana",
} satisfies WelcomeEmailProps;
