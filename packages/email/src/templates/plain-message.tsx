import { EmailLayout, EmailText } from "../components/layout";

export type PlainMessageEmailProps = {
	baseUrl: string;
	preview: string;
	/** Plain text; blank lines split paragraphs. */
	text: string;
};

/** Any free-text message, wrapped in the Helsa layout. */
export default function PlainMessageEmail({
	baseUrl,
	preview,
	text,
}: PlainMessageEmailProps) {
	const paragraphs = text
		.split(/\n\s*\n/)
		.map((paragraph) => paragraph.trim())
		.filter(Boolean);

	return (
		<EmailLayout baseUrl={baseUrl} preview={preview}>
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
		</EmailLayout>
	);
}

PlainMessageEmail.PreviewProps = {
	baseUrl: "http://localhost:3001",
	preview: "Mensaje de Helsa",
	text: "Hola, Ana.\n\nEste es un mensaje de prueba.\nCon dos líneas.",
} satisfies PlainMessageEmailProps;
