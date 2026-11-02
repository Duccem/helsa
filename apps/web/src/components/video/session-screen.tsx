"use client";

import { cn } from "@helsa/ui/lib/utils";
import { CalendarClock, Mic, MicOff, Video, VideoOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Logo } from "@/components/landing/logo";
import type { VideoSession } from "@/lib/core/video/use-cases/load-video-session";

import { clock, longDate, PillButton } from "./parts";
import { noteMemoryFrom } from "./session-notes";
import { type CallOutcome, VideoCall } from "./video-call";

type Phase =
	| { kind: "prejoin" }
	| { kind: "call" }
	| { kind: "outcome"; outcome: CallOutcome; error?: string | null };

const NAME_KEY = "helsa:video-guest-name";

function readStoredName() {
	try {
		return window.localStorage.getItem(NAME_KEY);
	} catch {
		return null;
	}
}

function storeName(name: string) {
	try {
		window.localStorage.setItem(NAME_KEY, name);
	} catch {
		// Private mode: the name is just asked again next time.
	}
}

/** Dark full-screen card used by every state except the call itself. */
function Stage({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-svh flex-col bg-night text-white">
			<header className="flex h-16 items-center px-4 sm:px-6">
				<Logo tone="light" className="h-6" eager />
			</header>
			<main className="flex flex-1 items-center justify-center px-4 pb-16">
				<div className="w-full max-w-md">{children}</div>
			</main>
		</div>
	);
}

function When({ session }: { session: VideoSession }) {
	return (
		<p className="flex items-center gap-2 text-[15px] text-white/80">
			<CalendarClock aria-hidden="true" className="size-4 shrink-0" />
			<span className="first-letter:uppercase">
				{longDate(session.startsAt, session.timezone)},{" "}
				{clock(session.startsAt, session.timezone)} –{" "}
				{clock(session.endsAt, session.timezone)}
			</span>
		</p>
	);
}

function Heading({ children }: { children: React.ReactNode }) {
	return (
		<h1 className="font-display font-medium text-[2rem] leading-[1.1] tracking-[-0.02em]">
			{children}
		</h1>
	);
}

const dashboardLink =
	"inline-flex h-11 items-center justify-center rounded-full bg-white/12 px-5 font-semibold text-[15px] text-white outline-none hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white";

export function SessionScreen({ session }: { session: VideoSession }) {
	const router = useRouter();
	const therapist = session.role === "therapist";
	const [phase, setPhase] = useState<Phase>({ kind: "prejoin" });
	const [audioOn, setAudioOn] = useState(true);
	const [videoOn, setVideoOn] = useState(true);
	const [name, setName] = useState(session.join?.displayName ?? "");
	const noteMemory = useRef(noteMemoryFrom(session.notes?.draft));

	// A guest may not be the patient's own device: keep the name they typed last time.
	useEffect(() => {
		if (session.role === "guest") {
			const stored = readStoredName();
			if (stored) setName(stored);
		}
	}, [session.role]);

	// Waiting for the room to open: reload the page when it does.
	useEffect(() => {
		if (session.state !== "early") return;
		const wait = Date.parse(session.opensAt) - Date.now();
		const timer = window.setTimeout(
			() => router.refresh(),
			Math.max(1000, wait + 1000),
		);
		return () => window.clearTimeout(timer);
	}, [session.state, session.opensAt, router]);

	const onExit = useCallback((outcome: CallOutcome, error?: string | null) => {
		setPhase({ kind: "outcome", outcome, error });
	}, []);

	const other = therapist ? session.patient.name : session.therapist.name;

	if (session.state !== "open" || !session.join) {
		const copy = {
			early: {
				title: "La sala aún no abre",
				body: `Puedes entrar desde las ${clock(session.opensAt, session.timezone)}. Deja esta página abierta: se abre sola.`,
			},
			closed: {
				title: "Esta sala ya cerró",
				body: therapist
					? "La hora de la sesión pasó. Puedes marcar la cita desde tu agenda."
					: `Si necesitas otra sesión, escríbele a ${session.therapist.name}.`,
			},
			ended: {
				title: "La sesión terminó",
				body: therapist
					? "La cita quedó como atendida. Revisa y firma la nota de la sesión."
					: "Gracias por conectarte. Puedes cerrar esta página.",
			},
			cancelled: {
				title: "Esta sesión se canceló",
				body: therapist
					? "La cita está cancelada en tu agenda."
					: `Si crees que es un error, escríbele a ${session.therapist.name}.`,
			},
			open: { title: "", body: "" },
		}[session.state];

		return (
			<Stage>
				<p className="mb-3 text-[15px] text-white/70">Sesión con {other}</p>
				<Heading>{copy.title}</Heading>
				<p className="mt-3 text-[16px] text-white/85 leading-relaxed">
					{copy.body}
				</p>
				<div className="mt-6">
					<When session={session} />
				</div>
				{therapist ? (
					<div className="mt-8 flex flex-wrap gap-2">
						<Link href="/dashboard/schedule" className={dashboardLink}>
							Ir a la agenda
						</Link>
						{session.state === "ended" ? (
							<Link href="/dashboard/notes" className={dashboardLink}>
								Ver notas
							</Link>
						) : null}
					</div>
				) : null}
			</Stage>
		);
	}

	if (phase.kind === "call") {
		return (
			<VideoCall
				session={session}
				join={session.join}
				displayName={name.trim() || session.join.displayName}
				startAudioMuted={!audioOn}
				startVideoMuted={!videoOn}
				noteMemory={therapist ? noteMemory : undefined}
				onExit={onExit}
			/>
		);
	}

	if (phase.kind === "outcome") {
		const rejoin = (
			<PillButton onClick={() => setPhase({ kind: "call" })}>
				Volver a entrar
			</PillButton>
		);
		const copy: Record<CallOutcome, { title: string; body: string }> = {
			ended: {
				title: "Sesión terminada",
				body: "La cita quedó como atendida y tu nota está guardada como borrador. Fírmala cuando la revises.",
			},
			left: therapist
				? {
						title: "Saliste de la llamada",
						body: `La sesión sigue abierta. ${session.patient.name} puede seguir esperando.`,
					}
				: {
						title: "Saliste de la sesión",
						body: "Si fue sin querer, vuelve a entrar. Si la sesión terminó, puedes cerrar esta página.",
					},
			kicked: {
				title: "Saliste de la sesión",
				body: `${session.therapist.name} te sacó de la llamada.`,
			},
			error: {
				title: "No pudimos conectar la llamada",
				body: "Revisa tu conexión y vuelve a intentarlo.",
			},
		};
		const { title, body } = copy[phase.outcome];

		return (
			<Stage>
				<Heading>{title}</Heading>
				<p className="mt-3 text-[16px] text-white/85 leading-relaxed">{body}</p>
				{phase.outcome === "error" && process.env.NODE_ENV === "development" ? (
					<p className="mt-4 rounded-2xl bg-white/8 p-4 font-mono text-[13px] text-white/80 leading-relaxed">
						{phase.error ?? "Error desconocido"}. En local, abre{" "}
						{session.join.scriptUrl.replace("/external_api.js", "")} y acepta el
						certificado.
					</p>
				) : null}
				<div className="mt-8 flex flex-wrap gap-2">
					{phase.outcome === "ended" ? (
						<>
							<Link
								href="/dashboard/notes"
								className={cn(
									dashboardLink,
									"bg-white text-night hover:bg-white/85",
								)}
							>
								Firmar la nota
							</Link>
							<Link href="/dashboard/schedule" className={dashboardLink}>
								Ir a la agenda
							</Link>
						</>
					) : (
						<>
							{phase.outcome === "kicked" ? null : rejoin}
							{therapist ? (
								<Link href="/dashboard/schedule" className={dashboardLink}>
									Ir a la agenda
								</Link>
							) : null}
						</>
					)}
				</div>
			</Stage>
		);
	}

	const guest = session.role === "guest";
	const canJoin = name.trim().length > 0;

	return (
		<Stage>
			<p className="mb-3 text-[15px] text-white/70">
				{therapist
					? "Tu sesión con"
					: `Hola${guest ? "" : `, ${name.split(" ")[0]}`}. Tu sesión con`}
			</p>
			<Heading>{other}</Heading>
			{!therapist && session.therapist.title ? (
				<p className="mt-1 text-[16px] text-white/80">
					{session.therapist.title}
				</p>
			) : null}
			<div className="mt-5">
				<When session={session} />
			</div>

			<form
				className="mt-8 flex flex-col gap-5 rounded-[1.75rem] bg-white/8 p-5"
				onSubmit={(event) => {
					event.preventDefault();
					if (!canJoin) return;
					if (guest) storeName(name.trim());
					setPhase({ kind: "call" });
				}}
			>
				{guest ? (
					<label className="flex flex-col gap-1.5">
						<span className="font-semibold text-[15px]">Tu nombre</span>
						<input
							value={name}
							onChange={(event) => setName(event.target.value)}
							maxLength={60}
							required
							autoComplete="name"
							className="h-12 rounded-xl border border-white/20 bg-white/8 px-3 text-[16px] text-white outline-none placeholder:text-white/50 focus-visible:ring-2 focus-visible:ring-white"
							placeholder="Cómo quieres que te vea tu terapeuta"
						/>
					</label>
				) : null}

				<fieldset>
					<legend className="mb-2 font-semibold text-[15px]">Al entrar</legend>
					<div className="grid grid-cols-2 gap-2">
						<button
							type="button"
							aria-pressed={audioOn}
							onClick={() => setAudioOn((on) => !on)}
							className={cn(
								"flex h-12 items-center justify-center gap-2 rounded-xl font-semibold text-[15px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white",
								audioOn ? "bg-white text-night" : "bg-white/12 text-white",
							)}
						>
							{audioOn ? (
								<Mic aria-hidden="true" className="size-4" />
							) : (
								<MicOff aria-hidden="true" className="size-4" />
							)}
							{audioOn ? "Micrófono" : "Sin micrófono"}
						</button>
						<button
							type="button"
							aria-pressed={videoOn}
							onClick={() => setVideoOn((on) => !on)}
							className={cn(
								"flex h-12 items-center justify-center gap-2 rounded-xl font-semibold text-[15px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white",
								videoOn ? "bg-white text-night" : "bg-white/12 text-white",
							)}
						>
							{videoOn ? (
								<Video aria-hidden="true" className="size-4" />
							) : (
								<VideoOff aria-hidden="true" className="size-4" />
							)}
							{videoOn ? "Cámara" : "Sin cámara"}
						</button>
					</div>
				</fieldset>

				<PillButton type="submit" disabled={!canJoin} className="h-12 w-full">
					{therapist ? "Abrir la sesión" : "Entrar a la sesión"}
				</PillButton>
				<p className="text-[14px] text-white/70 leading-snug">
					{therapist
						? "Al entrar se activa la sala de espera: admites a tu paciente cuando llegue."
						: `Tu navegador te pedirá permiso para usar la cámara y el micrófono. ${session.therapist.name} te dará acceso al entrar.`}
				</p>
			</form>
		</Stage>
	);
}
