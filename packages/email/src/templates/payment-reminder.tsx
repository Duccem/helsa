import {
	EmailButton,
	EmailHeading,
	EmailLayout,
	EmailNote,
	EmailText,
} from "../components/layout";

export type PaymentReminderEmailProps = {
	baseUrl: string;
	therapistName: string;
	/** Written (or edited) by the therapist. Blank lines split paragraphs. */
	message: string;
	/** Where the patient can see and report payments, when they have portal access. */
	portalUrl?: string | null;
};

export default function PaymentReminderEmail({
	baseUrl,
	therapistName,
	message,
	portalUrl,
}: PaymentReminderEmailProps) {
	const paragraphs = message
		.split(/\n\s*\n/)
		.map((paragraph) => paragraph.trim())
		.filter(Boolean);

	return (
		<EmailLayout
			baseUrl={baseUrl}
			preview={`Recordatorio de pago de ${therapistName}`}
			reason={`Recibiste este correo porque ${therapistName} gestiona tus sesiones con Helsa.`}
		>
			<EmailHeading>Recordatorio de pago</EmailHeading>
			{paragraphs.map((paragraph) => (
				<EmailText key={paragraph}>
					{paragraph.split("\n").map((line, index) => (
						<span key={`${index}-${line}`}>
							{index > 0 ? <br /> : null}
							{line}
						</span>
					))}
				</EmailText>
			))}
			{portalUrl ? (
				<EmailButton href={portalUrl}>Ver mis pagos</EmailButton>
			) : null}
			<EmailNote>
				Si ya hiciste el pago, responde a este correo con el comprobante.
			</EmailNote>
		</EmailLayout>
	);
}

PaymentReminderEmail.PreviewProps = {
	baseUrl: "http://localhost:3001",
	therapistName: "Dra. Laura Méndez",
	message: [
		"Hola, Ana. Espero que estés bien.",
		"",
		"Te escribo para recordarte que tienes 2 sesiones pendientes de pago (lun 3, lun 10) por un total de $80.",
		"",
		"Pago móvil: 0412-5550101 · V-12.345.678 · Banco de Venezuela",
		"",
		"Cuando hagas el pago, por favor envíame el comprobante. ¡Gracias!",
		"Dra. Laura Méndez",
	].join("\n"),
	portalUrl: "http://localhost:3001/dashboard/payments",
} satisfies PaymentReminderEmailProps;
