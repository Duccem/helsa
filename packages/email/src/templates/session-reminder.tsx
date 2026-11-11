import { Section, Text } from "react-email";
import {
	colors,
	EmailButton,
	EmailHeading,
	EmailLayout,
	EmailNote,
	EmailText,
} from "../components/layout";

export type SessionReminderEmailProps = {
	baseUrl: string;
	patientName: string;
	therapistName: string;
	/** "h24": the day before; "h2": shortly before it starts. */
	kind: "h24" | "h2";
	/** Already formatted in the patient's timezone, e.g. "martes 12 de noviembre". */
	date: string;
	/** e.g. "15:00 (hora de Caracas)". */
	time: string;
	/** "Videollamada", "Presencial" or "Llamada telefónica". */
	modality: string;
	/** In-person sessions only. */
	location?: string | null;
	/** Video sessions: the room link. */
	joinUrl?: string | null;
	/** Patient portal, to confirm or cancel. Null when the patient has no access. */
	manageUrl?: string | null;
	/** Still waiting for the patient to confirm. */
	needsConfirmation: boolean;
};

function Detail({ label, value }: { label: string; value: string }) {
	return (
		<Text
			style={{
				color: colors.text,
				fontSize: 15,
				lineHeight: "22px",
				margin: "0 0 6px",
			}}
		>
			<span style={{ color: colors.muted }}>{label}: </span>
			{value}
		</Text>
	);
}

export default function SessionReminderEmail({
	baseUrl,
	patientName,
	therapistName,
	kind,
	date,
	time,
	modality,
	location,
	joinUrl,
	manageUrl,
	needsConfirmation,
}: SessionReminderEmailProps) {
	const soon = kind === "h2";

	return (
		<EmailLayout
			baseUrl={baseUrl}
			preview={
				soon
					? `Tu sesión con ${therapistName} empieza a las ${time}`
					: `Recordatorio: sesión con ${therapistName} el ${date}`
			}
			reason={`Recibiste este correo porque ${therapistName} gestiona tus sesiones con Helsa.`}
		>
			<EmailHeading>
				{soon ? "Tu sesión empieza pronto" : "Recordatorio de tu sesión"}
			</EmailHeading>
			<EmailText>Hola {patientName},</EmailText>
			<EmailText>
				{soon
					? `Te recordamos que hoy tienes sesión con ${therapistName}.`
					: `Te recordamos tu próxima sesión con ${therapistName}.`}
			</EmailText>
			<Section
				style={{
					border: `1px solid ${colors.border}`,
					borderRadius: 8,
					margin: "0 0 16px",
					padding: "16px 20px 10px",
				}}
			>
				<Detail label="Fecha" value={date} />
				<Detail label="Hora" value={time} />
				<Detail label="Modalidad" value={modality} />
				{location ? <Detail label="Lugar" value={location} /> : null}
			</Section>
			{soon && joinUrl ? (
				<EmailButton href={joinUrl}>Entrar a la sesión</EmailButton>
			) : needsConfirmation && manageUrl ? (
				<EmailButton href={manageUrl}>Confirmar asistencia</EmailButton>
			) : null}
			<EmailNote>
				{manageUrl
					? "Si no puedes asistir, cancela o reprograma desde tu portal lo antes posible."
					: `Si no puedes asistir, avísale a ${therapistName} lo antes posible.`}
			</EmailNote>
		</EmailLayout>
	);
}

SessionReminderEmail.PreviewProps = {
	baseUrl: "http://localhost:3001",
	patientName: "Ana",
	therapistName: "Dra. Laura Méndez",
	kind: "h24",
	date: "martes, 12 de noviembre",
	time: "15:00 (hora de Caracas)",
	modality: "Videollamada",
	location: null,
	joinUrl: "http://localhost:3001/s/0193f1d2-0000-7000-8000-000000000000",
	manageUrl: "http://localhost:3001/dashboard",
	needsConfirmation: true,
} satisfies SessionReminderEmailProps;
