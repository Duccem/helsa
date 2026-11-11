import type { ReactNode } from "react";
import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Link,
	Preview,
	Section,
	Text,
} from "react-email";

export const colors = {
	primary: "#7c5cf0",
	text: "#18181b",
	muted: "#71717a",
	border: "#e4e4e7",
	background: "#f4f4f5",
	surface: "#ffffff",
} as const;

const fontFamily =
	'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

type EmailLayoutProps = {
	/** Absolute origin of the app, used for the logo and footer links. */
	baseUrl: string;
	/** Inbox preview line shown next to the subject. */
	preview: string;
	/** Why the person got this email, shown in the footer. */
	reason?: string;
	children: ReactNode;
};

export function EmailLayout({
	baseUrl,
	preview,
	reason = "Recibiste este correo porque tienes una cuenta en Helsa.",
	children,
}: EmailLayoutProps) {
	return (
		<Html lang="es">
			<Head />
			<Preview>{preview}</Preview>
			<Body
				style={{
					backgroundColor: colors.background,
					fontFamily,
					margin: 0,
					padding: "32px 0",
				}}
			>
				<Container
					style={{
						backgroundColor: colors.surface,
						border: `1px solid ${colors.border}`,
						borderRadius: 12,
						maxWidth: 520,
						margin: "0 auto",
						padding: "40px 32px",
					}}
				>
					<Img
						src={`${baseUrl}/images/helsa-black.png`}
						alt="Helsa"
						height={28}
						style={{ height: 28, width: "auto" }}
					/>
					<Section style={{ marginTop: 32 }}>{children}</Section>
					<Hr style={{ borderColor: colors.border, margin: "32px 0 24px" }} />
					<Text
						style={{
							color: colors.muted,
							fontSize: 12,
							lineHeight: "20px",
							margin: 0,
						}}
					>
						{reason}{" "}
						<Link
							href={baseUrl}
							style={{ color: colors.muted, textDecoration: "underline" }}
						>
							helsa
						</Link>
					</Text>
				</Container>
			</Body>
		</Html>
	);
}

export function EmailHeading({ children }: { children: ReactNode }) {
	return (
		<Heading
			as="h1"
			style={{
				color: colors.text,
				fontSize: 22,
				fontWeight: 600,
				lineHeight: "30px",
				margin: "0 0 16px",
			}}
		>
			{children}
		</Heading>
	);
}

export function EmailText({ children }: { children: ReactNode }) {
	return (
		<Text
			style={{
				color: colors.text,
				fontSize: 15,
				lineHeight: "24px",
				margin: "0 0 16px",
			}}
		>
			{children}
		</Text>
	);
}

export function EmailButton({
	href,
	children,
}: {
	href: string;
	children: ReactNode;
}) {
	return (
		<Section style={{ margin: "24px 0" }}>
			<Button
				href={href}
				style={{
					backgroundColor: colors.primary,
					borderRadius: 8,
					color: "#ffffff",
					fontSize: 15,
					fontWeight: 600,
					padding: "12px 20px",
					textDecoration: "none",
				}}
			>
				{children}
			</Button>
		</Section>
	);
}

/** Plain-text fallback for clients that block the button. */
export function EmailFallbackLink({ href }: { href: string }) {
	return (
		<Text
			style={{
				color: colors.muted,
				fontSize: 13,
				lineHeight: "20px",
				margin: "0 0 16px",
			}}
		>
			Si el botón no funciona, copia y pega este enlace en tu navegador:
			<br />
			<Link
				href={href}
				style={{ color: colors.primary, wordBreak: "break-all" }}
			>
				{href}
			</Link>
		</Text>
	);
}

export function EmailNote({ children }: { children: ReactNode }) {
	return (
		<Text
			style={{
				color: colors.muted,
				fontSize: 13,
				lineHeight: "20px",
				margin: 0,
			}}
		>
			{children}
		</Text>
	);
}
