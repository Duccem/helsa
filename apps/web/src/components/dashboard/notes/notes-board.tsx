"use client";

import { cn } from "@helsa/ui/lib/utils";
import {
	ArrowLeft,
	CalendarCheck,
	Copy,
	Lock,
	NotebookPen,
	Pencil,
	Plus,
	Search,
	UserPlus,
} from "lucide-react";
import { m } from "motion/react";
import Link from "next/link";
import { useCallback, useDeferredValue, useRef, useState } from "react";
import { toast } from "sonner";

import type {
	BoardNote,
	NotesBoard,
	SessionWithoutNote,
} from "@/lib/core/note/use-cases/load-notes-board";

import { EmptyState, formatDate, normalize } from "../patients/parts";
import { patientStatusLabels } from "../patients/schema";
import { ActionButton } from "../profile/parts";
import { Segmented, SelectInput } from "../settings/fields";
import {
	itemIn,
	Panel,
	PanelHeading,
	PatientAvatar,
	stagger,
} from "../therapist/parts";
import { confirmDiscard } from "../unsaved";
import {
	type ComposerSession,
	DraftActions,
	EncryptionMissingNotice,
	LockedNoteNotice,
	NoteComposer,
	NoteStatusPill,
	sessionLabel,
} from "./note-parts";

export type NotesView =
	| { kind: "idle" }
	| { kind: "read"; id: string }
	| { kind: "edit"; id: string }
	| { kind: "new"; patientId?: string; sessionId?: string };

type StatusFilter = "all" | "draft" | "signed";

const PAGE_SIZE = 40;

/** Keeps the open note in the URL so a refresh or a shared link lands in the same place. */
function syncUrl(view: NotesView, patientFilter: string) {
	const url = new URL(window.location.href);
	for (const key of ["note", "new", "session", "patient"]) {
		url.searchParams.delete(key);
	}
	if (patientFilter) url.searchParams.set("patient", patientFilter);
	if (view.kind === "read" || view.kind === "edit") {
		url.searchParams.set("note", view.id);
	}
	if (view.kind === "new") {
		url.searchParams.set("new", view.patientId ?? "1");
		if (view.sessionId) url.searchParams.set("session", view.sessionId);
	}
	window.history.replaceState(null, "", url);
}

export function NotesBoardView({
	board,
	initialView,
	initialPatient,
}: {
	board: NotesBoard;
	initialView: NotesView;
	initialPatient: string;
}) {
	const { notes, patients, sessionsWithoutNote, timezone, encryptionReady } =
		board;
	const [view, setView] = useState<NotesView>(initialView);
	const [dirty, setDirty] = useState(false);
	const [query, setQuery] = useState("");
	const [status, setStatus] = useState<StatusFilter>("all");
	const [patientFilter, setPatientFilter] = useState(initialPatient);
	const [shown, setShown] = useState(PAGE_SIZE);
	const deferred = useDeferredValue(query);
	const detailRef = useRef<HTMLDivElement>(null);

	const go = useCallback(
		(next: NotesView, options: { force?: boolean } = {}) => {
			const writing = view.kind === "new" || view.kind === "edit";
			if (writing && !options.force && !confirmDiscard(dirty)) return;
			setDirty(false);
			setView(next);
			syncUrl(next, patientFilter);
			// Below xl the list and the note take turns; bring the note into view.
			if (
				next.kind !== "idle" &&
				window.matchMedia("(max-width: 1279px)").matches
			) {
				requestAnimationFrame(() =>
					detailRef.current?.scrollIntoView({ block: "start" }),
				);
			}
		},
		[view.kind, dirty, patientFilter],
	);

	const drafts = notes.filter((note) => !note.signedAt).length;
	const notesByPatient = new Map<string, number>();
	for (const note of notes) {
		notesByPatient.set(
			note.patientId,
			(notesByPatient.get(note.patientId) ?? 0) + 1,
		);
	}

	const needle = normalize(deferred.trim());
	const visible = notes.filter((note) => {
		if (patientFilter && note.patientId !== patientFilter) return false;
		if (status === "draft" && note.signedAt) return false;
		if (status === "signed" && !note.signedAt) return false;
		if (!needle) return true;
		return normalize(
			[note.patientName, note.title, note.content].filter(Boolean).join(" "),
		).includes(needle);
	});
	const scoped = patientFilter
		? notes.filter((note) => note.patientId === patientFilter)
		: notes;
	const scopedDrafts = scoped.filter((note) => !note.signedAt).length;

	const patientOptions: Array<readonly [string, string]> = [
		["", "Todos los pacientes"],
		...patients
			.filter(
				(patient) =>
					notesByPatient.has(patient.id) || patient.id === patientFilter,
			)
			.map(
				(patient) =>
					[
						patient.id,
						`${patient.name} · ${notesByPatient.get(patient.id) ?? 0}`,
					] as const,
			),
	];

	const composerSessions: ComposerSession[] = sessionsWithoutNote.map(
		(session) => ({
			id: session.id,
			patientId: session.patientId,
			label: sessionLabel(session.startsAt, timezone),
		}),
	);

	const selected =
		view.kind === "read" || view.kind === "edit"
			? notes.find((note) => note.id === view.id)
			: undefined;
	const detailOpen = view.kind !== "idle";

	function changePatientFilter(next: string) {
		setPatientFilter(next);
		setShown(PAGE_SIZE);
		syncUrl(view, next);
	}

	return (
		<m.div
			initial="hidden"
			animate="show"
			variants={stagger(0.08)}
			className="mx-auto max-w-[96rem]"
		>
			<m.header
				variants={itemIn}
				className="flex flex-col gap-6 pt-2 pb-8 lg:flex-row lg:items-end lg:justify-between"
			>
				<div>
					<h1 className="font-display font-medium text-[clamp(2.25rem,4vw,3.5rem)] leading-[1] tracking-[-0.03em]">
						Notas clínicas
					</h1>
					<p className="mt-3 text-[17px] leading-relaxed">
						{notes.length === 0
							? "Aún no has escrito notas."
							: `${notes.length} ${notes.length === 1 ? "nota" : "notas"} en total${drafts ? `, ${drafts} ${drafts === 1 ? "borrador" : "borradores"} por firmar` : ", todas firmadas"}.`}
					</p>
				</div>
				<ActionButton
					onClick={() =>
						go({ kind: "new", patientId: patientFilter || undefined })
					}
					className="self-start lg:self-auto"
				>
					<Plus aria-hidden="true" className="size-4" />
					Nueva nota
				</ActionButton>
			</m.header>

			{sessionsWithoutNote.length > 0 ? (
				<MissingNotes
					sessions={sessionsWithoutNote}
					timezone={timezone}
					activeSessionId={view.kind === "new" ? view.sessionId : undefined}
					onWrite={(session) =>
						go({
							kind: "new",
							patientId: session.patientId,
							sessionId: session.id,
						})
					}
				/>
			) : null}

			<div className="mt-4 grid gap-4 xl:grid-cols-12">
				<Panel
					aria-label="Lista de notas"
					className={cn(
						"xl:col-span-5 xl:self-start",
						detailOpen && "hidden xl:block",
					)}
				>
					{notes.length === 0 ? (
						<EmptyState icon={NotebookPen} title="Escribe tu primera nota">
							Las notas se guardan cifradas como borrador. Puedes editarlas
							hasta que las firmes; una vez firmadas quedan en la historia
							clínica del paciente.
						</EmptyState>
					) : (
						<>
							<div className="flex flex-col gap-3">
								<search className="relative w-full">
									<label htmlFor="note-search" className="sr-only">
										Buscar en las notas
									</label>
									<Search
										aria-hidden="true"
										className="pointer-events-none absolute top-1/2 left-4 size-[1.1rem] -translate-y-1/2 text-muted-foreground"
									/>
									<input
										id="note-search"
										type="search"
										value={query}
										onChange={(event) => {
											setQuery(event.target.value);
											setShown(PAGE_SIZE);
										}}
										placeholder="Paciente, título o contenido"
										className="h-12 w-full rounded-full bg-dash-ground pr-4 pl-11 text-[15px] outline-none transition-[box-shadow] placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
									/>
								</search>
								<label htmlFor="note-patient-filter" className="sr-only">
									Filtrar por paciente
								</label>
								<SelectInput
									id="note-patient-filter"
									value={patientFilter}
									onValueChange={changePatientFilter}
									options={patientOptions}
								/>
								<Segmented
									label="Filtrar por estado"
									options={[
										["all", `Todas · ${scoped.length}`],
										["draft", `Borradores · ${scopedDrafts}`],
										["signed", `Firmadas · ${scoped.length - scopedDrafts}`],
									]}
									value={status}
									onChange={(next) => {
										setStatus(next);
										setShown(PAGE_SIZE);
									}}
								/>
							</div>

							{visible.length === 0 ? (
								<p className="mt-4 rounded-2xl bg-dash-ground px-5 py-8 text-[16px]">
									Ninguna nota coincide con los filtros.
								</p>
							) : (
								<NoteList
									notes={visible.slice(0, shown)}
									timezone={timezone}
									selectedId={selected?.id}
									onSelect={(id) => go({ kind: "read", id })}
								/>
							)}
							{visible.length > shown ? (
								<ActionButton
									variant="quiet"
									size="small"
									className="mt-3"
									onClick={() => setShown((count) => count + PAGE_SIZE)}
								>
									Ver {Math.min(PAGE_SIZE, visible.length - shown)} más
								</ActionButton>
							) : null}
						</>
					)}
				</Panel>

				<Panel
					aria-label="Nota"
					className={cn(
						"scroll-mt-6 xl:sticky xl:top-6 xl:col-span-7 xl:self-start",
						!detailOpen && "hidden xl:block",
					)}
				>
					<div ref={detailRef} className="scroll-mt-6">
						{detailOpen ? (
							<button
								type="button"
								onClick={() => go({ kind: "idle" })}
								className="mb-4 -ml-3 inline-flex h-9 items-center gap-1.5 rounded-full px-3 font-semibold text-[14px] text-dash-link outline-none hover:bg-chapter-lilac focus-visible:ring-2 focus-visible:ring-ring xl:hidden"
							>
								<ArrowLeft aria-hidden="true" className="size-4" />
								Volver a la lista
							</button>
						) : null}

						{view.kind === "idle" ? (
							<IdleDetail
								hasNotes={notes.length > 0}
								onNew={() => go({ kind: "new" })}
							/>
						) : view.kind === "new" ? (
							<>
								<PanelHeading id="compose-title" title="Nueva nota">
									<span className="inline-flex items-center gap-1.5 text-[14px] text-muted-foreground">
										<Lock aria-hidden="true" className="size-3.5" />
										Cifrada
									</span>
								</PanelHeading>
								<div className="mt-4">
									{!encryptionReady ? (
										<EncryptionMissingNotice />
									) : patients.length === 0 ? (
										<EmptyState
											icon={UserPlus}
											title="Primero registra un paciente"
										>
											Cada nota pertenece a un paciente.{" "}
											<Link
												href="/dashboard/patients/new"
												className="font-semibold text-dash-link underline-offset-4 hover:underline"
											>
												Registrar paciente
											</Link>
										</EmptyState>
									) : (
										<NoteComposer
											key={`${view.patientId ?? ""}-${view.sessionId ?? ""}`}
											idPrefix="board-new"
											patients={patients.map((patient) => ({
												id: patient.id,
												name:
													patient.status === "active"
														? patient.name
														: `${patient.name} (${patientStatusLabels[patient.status].toLowerCase()})`,
											}))}
											patientId={view.patientId}
											sessions={composerSessions}
											initialSessionId={view.sessionId}
											onDirtyChange={setDirty}
											onSaved={(id) =>
												go(id ? { kind: "read", id } : { kind: "idle" }, {
													force: true,
												})
											}
											onCancel={() => go({ kind: "idle" }, { force: true })}
										/>
									)}
								</div>
							</>
						) : !selected ? (
							<p className="py-8 text-[16px] text-muted-foreground">
								Abriendo la nota…
							</p>
						) : view.kind === "edit" ? (
							<>
								<NoteHeader note={selected} timezone={timezone} />
								<div className="mt-5">
									<NoteComposer
										key={selected.id}
										idPrefix={`board-${selected.id}`}
										note={selected}
										onDirtyChange={setDirty}
										onSaved={() =>
											go({ kind: "read", id: selected.id }, { force: true })
										}
										onCancel={() =>
											go({ kind: "read", id: selected.id }, { force: true })
										}
									/>
								</div>
							</>
						) : (
							<NoteDetail
								note={selected}
								timezone={timezone}
								onEdit={() => go({ kind: "edit", id: selected.id })}
								onDeleted={() => go({ kind: "idle" }, { force: true })}
							/>
						)}
					</div>
				</Panel>
			</div>
		</m.div>
	);
}

function MissingNotes({
	sessions,
	timezone,
	activeSessionId,
	onWrite,
}: {
	sessions: SessionWithoutNote[];
	timezone: string;
	activeSessionId?: string;
	onWrite: (session: SessionWithoutNote) => void;
}) {
	return (
		<Panel aria-labelledby="missing-notes-title">
			<PanelHeading id="missing-notes-title" title="Sesiones sin nota">
				<p className="text-[15px] text-muted-foreground">
					Últimos 30 días · {sessions.length}
					{sessions.length === 1 ? " sesión" : " sesiones"}
				</p>
			</PanelHeading>
			<ul className="mt-4 flex snap-x gap-3 overflow-x-auto pb-1">
				{sessions.map((session) => {
					const active = session.id === activeSessionId;
					return (
						<li
							key={session.id}
							className={cn(
								"flex w-[16.5rem] shrink-0 snap-start flex-col gap-3 rounded-[1.5rem] p-4 transition-colors",
								active ? "bg-chapter-lilac" : "bg-dash-ground",
							)}
						>
							<div className="flex min-w-0 items-center gap-3">
								<PatientAvatar name={session.patientName} />
								<div className="min-w-0">
									<p className="truncate font-semibold text-[15px]">
										{session.patientName}
									</p>
									<p className="truncate text-[14px] text-muted-foreground">
										{sessionLabel(session.startsAt, timezone)} ·{" "}
										{session.minutes} min
									</p>
								</div>
							</div>
							<ActionButton
								size="small"
								variant="quiet"
								disabled={active}
								onClick={() => onWrite(session)}
								className="self-start bg-card"
							>
								<Pencil aria-hidden="true" className="size-4" />
								{active ? "Escribiendo…" : "Escribir nota"}
							</ActionButton>
						</li>
					);
				})}
			</ul>
		</Panel>
	);
}

function NoteList({
	notes,
	timezone,
	selectedId,
	onSelect,
}: {
	notes: BoardNote[];
	timezone: string;
	selectedId?: string;
	onSelect: (id: string) => void;
}) {
	const groups: Array<{ label: string; notes: BoardNote[] }> = [];
	for (const note of notes) {
		const label = formatDate(note.createdAt, timezone, {
			month: "long",
			year: "numeric",
		});
		const last = groups.at(-1);
		if (last?.label === label) last.notes.push(note);
		else groups.push({ label, notes: [note] });
	}

	return (
		<div className="mt-4 flex flex-col gap-4" aria-live="polite">
			{groups.map((group) => (
				<section key={group.label} aria-label={group.label}>
					<h3 className="px-3 pb-1 font-semibold text-[13px] text-muted-foreground uppercase tracking-[0.06em] first-letter:uppercase">
						{group.label}
					</h3>
					<ul className="flex flex-col gap-1">
						{group.notes.map((note) => {
							const on = note.id === selectedId;
							return (
								<li key={note.id}>
									<button
										type="button"
										onClick={() => onSelect(note.id)}
										aria-current={on || undefined}
										className={cn(
											"grid w-full grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-2xl px-3 py-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
											on ? "bg-chapter-lilac/70" : "hover:bg-dash-ground",
										)}
									>
										<PatientAvatar name={note.patientName} />
										<div className="min-w-0">
											<div className="flex items-baseline justify-between gap-3">
												<p className="truncate font-semibold text-[15px]">
													{note.patientName}
												</p>
												<span className="shrink-0 text-[13px] text-muted-foreground tabular-nums">
													{formatDate(note.createdAt, timezone, {
														day: "numeric",
														month: "short",
													})}
												</span>
											</div>
											<p className="flex items-center gap-2 text-[14px]">
												<span className="truncate">
													{note.title || "Nota sin título"}
												</span>
												{note.signedAt ? null : (
													<span className="shrink-0 rounded-full bg-chapter-peach px-2 font-semibold text-[12px] leading-5">
														Borrador
													</span>
												)}
											</p>
											<p className="mt-0.5 line-clamp-2 text-[14px] text-muted-foreground leading-snug">
												{note.locked
													? "No se pudo descifrar."
													: (note.content ?? "").replace(/\s+/g, " ").trim()}
											</p>
										</div>
									</button>
								</li>
							);
						})}
					</ul>
				</section>
			))}
		</div>
	);
}

function IdleDetail({
	hasNotes,
	onNew,
}: {
	hasNotes: boolean;
	onNew: () => void;
}) {
	return (
		<div className="flex min-h-80 flex-col items-start justify-center gap-4 px-2 py-8">
			<NotebookPen
				aria-hidden="true"
				className="size-7 text-chapter-violet dark:text-primary"
			/>
			<p className="font-display font-medium text-[1.5rem] leading-tight">
				{hasNotes ? "Elige una nota para leerla" : "Aquí aparecerán tus notas"}
			</p>
			<p className="max-w-[48ch] text-[15px] text-foreground/80 leading-relaxed">
				Los borradores se pueden editar o eliminar. Al firmar una nota queda
				cerrada como parte de la historia clínica.
			</p>
			<ActionButton variant="quiet" onClick={onNew}>
				<Plus aria-hidden="true" className="size-4" />
				Nueva nota
			</ActionButton>
		</div>
	);
}

function NoteHeader({ note, timezone }: { note: BoardNote; timezone: string }) {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<Link
					href={`/dashboard/patients/${note.patientId}?tab=notas`}
					className="group -m-1 flex min-w-0 items-center gap-3 rounded-full p-1 pr-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					<PatientAvatar name={note.patientName} />
					<span className="min-w-0">
						<span className="block truncate font-semibold text-[15px] group-hover:underline group-hover:underline-offset-4">
							{note.patientName}
						</span>
						<span className="block text-[13px] text-muted-foreground">
							Ver ficha del paciente
						</span>
					</span>
				</Link>
				<NoteStatusPill signed={Boolean(note.signedAt)} />
			</div>
			<div>
				<h2 className="font-display font-medium text-[clamp(1.5rem,2.4vw,2rem)] leading-tight tracking-[-0.02em]">
					{note.title || "Nota sin título"}
				</h2>
				<p className="mt-1.5 text-[14px] text-muted-foreground">
					Escrita el{" "}
					{formatDate(note.createdAt, timezone, {
						weekday: "long",
						day: "numeric",
						month: "long",
						year: "numeric",
					})}
					{note.signedAt
						? ` · firmada el ${formatDate(note.signedAt, timezone)}`
						: note.updatedAt !== note.createdAt
							? ` · editada el ${formatDate(note.updatedAt, timezone)}`
							: ""}
				</p>
				{note.sessionAt ? (
					<p className="mt-1 inline-flex items-center gap-1.5 text-[14px] text-muted-foreground">
						<CalendarCheck aria-hidden="true" className="size-3.5" />
						Sesión del {sessionLabel(note.sessionAt, timezone)}
					</p>
				) : null}
			</div>
		</div>
	);
}

function NoteDetail({
	note,
	timezone,
	onEdit,
	onDeleted,
}: {
	note: BoardNote;
	timezone: string;
	onEdit: () => void;
	onDeleted: () => void;
}) {
	async function copy() {
		try {
			await navigator.clipboard.writeText(
				[note.title, note.content].filter(Boolean).join("\n\n"),
			);
			toast.success("Nota copiada.");
		} catch {
			toast.error("No pudimos copiar la nota.");
		}
	}

	return (
		<article aria-label={note.title || "Nota sin título"}>
			<NoteHeader note={note} timezone={timezone} />

			<div className="mt-5 border-border/60 border-t pt-5">
				{note.locked ? (
					<LockedNoteNotice />
				) : (
					<p className="max-w-[72ch] whitespace-pre-wrap text-[16px] leading-relaxed">
						{note.content}
					</p>
				)}
			</div>

			<div className="mt-6 flex flex-wrap gap-2">
				{!note.signedAt && !note.locked ? (
					<>
						<ActionButton size="small" variant="quiet" onClick={onEdit}>
							<Pencil aria-hidden="true" className="size-4" />
							Editar
						</ActionButton>
						<DraftActions
							patientId={note.patientId}
							noteId={note.id}
							onDeleted={onDeleted}
						/>
					</>
				) : null}
				{note.locked ? null : (
					<ActionButton size="small" variant="quiet" onClick={copy}>
						<Copy aria-hidden="true" className="size-4" />
						Copiar texto
					</ActionButton>
				)}
			</div>
		</article>
	);
}
