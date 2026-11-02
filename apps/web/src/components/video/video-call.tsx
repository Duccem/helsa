"use client";

import { cn } from "@helsa/ui/lib/utils";
import {
	LoaderCircle,
	Mic,
	MicOff,
	MonitorUp,
	NotebookPen,
	PhoneOff,
	Users,
	Video,
	VideoOff,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/landing/logo";
import { useEndVideoSession, useStartVideoSession } from "@/lib/api/mutations";
import type { VideoSession } from "@/lib/core/video/use-cases/load-video-session";
import { ParticipantsPanel } from "./participants-panel";
import {
	ConfirmDialog,
	ControlButton,
	clock,
	DeviceMenu,
	elapsed,
	PillButton,
} from "./parts";
import {
	type FlushNotes,
	type NoteMemory,
	SessionNotes,
} from "./session-notes";
import { type CallJoin, type CallStatus, useJitsiCall } from "./use-jitsi-call";

export type CallOutcome =
	| Exclude<CallStatus, "connecting" | "joined">
	| "ended";

type Panel = "notes" | "people";

export function VideoCall({
	session,
	join,
	displayName,
	startAudioMuted,
	startVideoMuted,
	noteMemory,
	onExit,
}: {
	session: VideoSession;
	join: CallJoin;
	displayName: string;
	startAudioMuted: boolean;
	startVideoMuted: boolean;
	/** Therapist only: the draft, kept by the page so leaving and rejoining continues it. */
	noteMemory?: NoteMemory;
	onExit: (outcome: CallOutcome, error?: string | null) => void;
}) {
	const therapist = session.role === "therapist";
	const started = useRef(Boolean(session.startedAt));
	const ending = useRef(false);
	const flushNotes = useRef<FlushNotes | null>(null);
	const startSession = useStartVideoSession();
	const endSession = useEndVideoSession();

	const call = useJitsiCall({
		join,
		displayName,
		startAudioMuted,
		startVideoMuted,
		onRemoteJoined: () => {
			if (!therapist || started.current) return;
			started.current = true;
			startSession.mutate(session.appointmentId);
		},
	});

	const [panel, setPanel] = useState<Panel | null>(null);
	const [confirmEnd, setConfirmEnd] = useState(false);
	const [now, setNow] = useState(() => Date.now());

	// Notes open next to the call on wide screens; on phones they cover it, so start closed.
	useEffect(() => {
		if (therapist && window.matchMedia("(min-width: 1024px)").matches) {
			setPanel("notes");
		}
	}, [therapist]);

	useEffect(() => {
		const timer = window.setInterval(() => setNow(Date.now()), 1000);
		return () => window.clearInterval(timer);
	}, []);

	const { status, error } = call;
	useEffect(() => {
		if (status === "connecting" || status === "joined") return;
		const outcome = ending.current && status === "left" ? "ended" : status;
		void (flushNotes.current?.() ?? Promise.resolve()).finally(() =>
			onExit(outcome, error),
		);
	}, [status, error, onExit]);

	async function endForAll() {
		ending.current = true;
		await flushNotes.current?.().catch(() => undefined);
		try {
			await endSession.mutateAsync(session.appointmentId);
		} catch (reason) {
			toast.error((reason as Error).message);
		}
		call.endForAll();
	}

	const other = therapist ? session.patient.name : session.therapist.name;
	const waiting = call.knocking.length;
	const togglePanel = (next: Panel) =>
		setPanel((current) => (current === next ? null : next));

	return (
		<div className="flex h-svh flex-col bg-night text-white">
			<header className="flex h-16 shrink-0 items-center gap-4 px-4 sm:px-6">
				<Logo tone="light" className="h-6" eager />
				<div className="min-w-0 flex-1 text-center">
					<h1 className="truncate font-display font-medium text-[17px] leading-tight">
						Sesión con {other}
					</h1>
					<p className="text-[13px] text-white/70 tabular-nums" aria-live="off">
						{call.joinedAt
							? `${elapsed(call.joinedAt, now)} · termina ${clock(session.endsAt, session.timezone)}`
							: `${clock(session.startsAt, session.timezone)} – ${clock(session.endsAt, session.timezone)}`}
					</p>
				</div>
				<span className="w-[4.5rem]" aria-hidden="true" />
			</header>

			<div className="relative flex min-h-0 flex-1 gap-3 px-2 pb-2 sm:px-3">
				<div className="relative min-w-0 flex-1 overflow-hidden rounded-3xl bg-black/40">
					<div ref={call.container} className="size-full" />

					{status === "connecting" ? (
						<div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
							<p className="inline-flex items-center gap-2 rounded-full bg-night/85 px-4 py-2 text-[14px]">
								<LoaderCircle
									aria-hidden="true"
									className="size-4 animate-spin"
								/>
								{therapist
									? "Conectando…"
									: `Conectando. Si ${session.therapist.name} aún no entra, espera aquí.`}
							</p>
						</div>
					) : null}

					{therapist && waiting > 0 && panel !== "people" ? (
						<div className="absolute inset-x-3 top-3 flex justify-center">
							<div
								role="status"
								className="flex max-w-full items-center gap-3 rounded-full bg-white py-1.5 pr-1.5 pl-4 text-[14px] text-night shadow-lg"
							>
								<span className="truncate font-semibold">
									{waiting === 1
										? `${call.knocking[0]?.name} quiere entrar`
										: `${waiting} personas quieren entrar`}
								</span>
								{waiting === 1 && call.knocking[0] ? (
									<button
										type="button"
										onClick={() => {
											const person = call.knocking[0];
											if (person) call.answerKnock(person.id, true);
										}}
										className="h-9 shrink-0 rounded-full bg-chapter-violet px-4 font-semibold text-white outline-none hover:bg-chapter-violet/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
									>
										Admitir
									</button>
								) : null}
								<button
									type="button"
									onClick={() => setPanel("people")}
									className="h-9 shrink-0 rounded-full px-3 font-semibold outline-none hover:bg-night/8 focus-visible:ring-2 focus-visible:ring-ring"
								>
									Ver
								</button>
							</div>
						</div>
					) : null}
				</div>

				{/* Always mounted for the therapist, so the draft keeps autosaving while hidden. */}
				{therapist ? (
					<aside
						aria-label={
							panel === "notes" ? "Notas de la sesión" : "Participantes"
						}
						className={cn(
							"absolute inset-x-2 top-0 bottom-2 z-20 flex-col rounded-3xl bg-card p-4 text-foreground shadow-2xl sm:inset-x-3 lg:static lg:w-[24rem] lg:shrink-0 lg:shadow-none",
							panel ? "flex" : "hidden",
						)}
					>
						<div className="mb-4 flex items-center gap-1">
							<div
								role="tablist"
								aria-label="Panel"
								className="flex flex-1 gap-1"
							>
								{(
									[
										["notes", "Notas"],
										[
											"people",
											waiting
												? `Participantes · ${waiting} esperando`
												: "Participantes",
										],
									] as const
								).map(([key, label]) => (
									<button
										key={key}
										type="button"
										role="tab"
										aria-selected={panel === key}
										onClick={() => setPanel(key)}
										className={cn(
											"h-9 rounded-full px-3 font-semibold text-[14px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
											panel === key
												? "bg-chapter-lilac text-foreground"
												: "text-muted-foreground hover:bg-dash-ground",
										)}
									>
										{label}
									</button>
								))}
							</div>
							<button
								type="button"
								onClick={() => setPanel(null)}
								aria-label="Cerrar panel"
								className="inline-flex size-9 items-center justify-center rounded-full outline-none hover:bg-dash-ground focus-visible:ring-2 focus-visible:ring-ring"
							>
								<X aria-hidden="true" className="size-4" />
							</button>
						</div>
						<div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
							<div
								className={cn(
									"min-h-0 flex-1 flex-col",
									panel === "people" ? "hidden" : "flex",
								)}
							>
								{session.notes && session.patient.id && noteMemory ? (
									<SessionNotes
										appointmentId={session.appointmentId}
										patientId={session.patient.id}
										available={session.notes.available}
										memory={noteMemory}
										startsAt={session.startsAt}
										timezone={session.timezone}
										flushRef={flushNotes}
									/>
								) : null}
							</div>
							{panel === "people" ? (
								<ParticipantsPanel call={call} selfName={displayName} />
							) : null}
						</div>
					</aside>
				) : null}
			</div>

			<footer className="flex shrink-0 flex-wrap items-center justify-center gap-2 px-3 pt-1 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:gap-3">
				<ControlButton
					label={call.audioMuted ? "Activar micrófono" : "Silenciar micrófono"}
					aria-pressed={call.audioMuted}
					off={call.audioMuted}
					onClick={call.toggleAudio}
					disabled={status !== "joined"}
				>
					{call.audioMuted ? (
						<MicOff aria-hidden="true" />
					) : (
						<Mic aria-hidden="true" />
					)}
				</ControlButton>
				<ControlButton
					label={call.videoMuted ? "Encender cámara" : "Apagar cámara"}
					aria-pressed={call.videoMuted}
					off={call.videoMuted}
					onClick={call.toggleVideo}
					disabled={status !== "joined"}
				>
					{call.videoMuted ? (
						<VideoOff aria-hidden="true" />
					) : (
						<Video aria-hidden="true" />
					)}
				</ControlButton>
				<ControlButton
					label={
						call.sharing ? "Dejar de compartir pantalla" : "Compartir pantalla"
					}
					aria-pressed={call.sharing}
					active={call.sharing}
					onClick={call.toggleShare}
					disabled={status !== "joined"}
					className="hidden sm:inline-flex"
				>
					<MonitorUp aria-hidden="true" />
				</ControlButton>
				<DeviceMenu api={call.api} />

				{therapist ? (
					<>
						<span
							className="mx-1 hidden h-8 w-px bg-white/15 sm:block"
							aria-hidden="true"
						/>
						<ControlButton
							label="Notas de la sesión"
							aria-pressed={panel === "notes"}
							active={panel === "notes"}
							onClick={() => togglePanel("notes")}
						>
							<NotebookPen aria-hidden="true" />
						</ControlButton>
						<ControlButton
							label={
								waiting
									? `Participantes, ${waiting} esperando`
									: "Participantes"
							}
							aria-pressed={panel === "people"}
							active={panel === "people"}
							onClick={() => togglePanel("people")}
							className="relative"
						>
							<Users aria-hidden="true" />
							{waiting ? (
								<span className="absolute -top-0.5 -right-0.5 inline-flex size-5 items-center justify-center rounded-full bg-destructive font-semibold text-[11px] text-white">
									{waiting}
								</span>
							) : null}
						</ControlButton>
					</>
				) : null}

				<span
					className="mx-1 hidden h-8 w-px bg-white/15 sm:block"
					aria-hidden="true"
				/>
				<ControlButton label="Salir de la llamada" off onClick={call.hangup}>
					<PhoneOff aria-hidden="true" />
				</ControlButton>
				{therapist ? (
					<PillButton
						variant="danger"
						onClick={() => setConfirmEnd(true)}
						disabled={status !== "joined" || endSession.isPending}
					>
						Terminar sesión
					</PillButton>
				) : null}
			</footer>

			{therapist ? (
				<ConfirmDialog
					open={confirmEnd}
					onOpenChange={setConfirmEnd}
					title="¿Terminar la sesión?"
					description={`La llamada se cierra para ${session.patient.name} y para ti, y la cita queda como atendida. La nota se guarda como borrador para que la firmes.`}
					confirmLabel="Terminar para todos"
					onConfirm={endForAll}
				/>
			) : null}
		</div>
	);
}
