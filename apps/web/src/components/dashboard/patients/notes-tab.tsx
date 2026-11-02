"use client";

import { cn } from "@helsa/ui/lib/utils";
import { CalendarCheck, Lock, NotebookPen, Pencil } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { PatientProfile } from "@/lib/core/patient/use-cases/load-patient-profile";

import {
	type ComposerSession,
	DraftActions,
	EncryptionMissingNotice,
	LockedNoteNotice,
	NoteComposer,
	NoteStatusPill,
	sessionLabel,
} from "../notes/note-parts";
import { ActionButton } from "../profile/parts";
import { Panel, PanelHeading } from "../therapist/parts";
import { EmptyState, formatDate } from "./parts";

type Note = PatientProfile["notes"][number];

/** How far back a session without a note is offered when writing one. */
const SESSION_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

function NoteCard({
	note,
	patientId,
	timezone,
	sessionAt,
}: {
	note: Note;
	patientId: string;
	timezone: string;
	sessionAt: string | null;
}) {
	const [editing, setEditing] = useState(false);
	const [expanded, setExpanded] = useState(false);
	const long =
		(note.content?.length ?? 0) > 600 ||
		(note.content?.split("\n").length ?? 0) > 8;

	if (editing) {
		return (
			<li className="rounded-[1.5rem] bg-dash-ground/60 p-4 sm:p-5">
				<NoteComposer
					idPrefix={`note-${note.id}`}
					note={{ ...note, patientId }}
					onSaved={() => setEditing(false)}
					onCancel={() => setEditing(false)}
				/>
			</li>
		);
	}

	return (
		<li className="rounded-[1.5rem] border border-border/60 p-4 sm:p-5">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="min-w-0">
					<h3 className="font-semibold text-[16px]">
						{note.title || "Nota sin título"}
					</h3>
					<p className="mt-0.5 text-[14px] text-muted-foreground">
						{formatDate(note.createdAt, timezone, {
							weekday: "long",
							day: "numeric",
							month: "long",
							year: "numeric",
						})}
						{note.updatedAt !== note.createdAt && !note.signedAt
							? ` · editada ${formatDate(note.updatedAt, timezone)}`
							: ""}
						{note.signedAt
							? ` · firmada ${formatDate(note.signedAt, timezone)}`
							: ""}
					</p>
					{sessionAt ? (
						<p className="mt-1 inline-flex items-center gap-1.5 text-[14px] text-muted-foreground">
							<CalendarCheck aria-hidden="true" className="size-3.5" />
							Sesión del {sessionLabel(sessionAt, timezone)}
						</p>
					) : null}
				</div>
				<NoteStatusPill signed={Boolean(note.signedAt)} />
			</div>

			{note.locked ? (
				<div className="mt-3">
					<LockedNoteNotice />
				</div>
			) : (
				<>
					<p
						className={cn(
							"mt-3 whitespace-pre-wrap text-[15px] leading-relaxed",
							long && !expanded && "line-clamp-6",
						)}
					>
						{note.content}
					</p>
					{long ? (
						<button
							type="button"
							onClick={() => setExpanded((open) => !open)}
							aria-expanded={expanded}
							className="mt-1 -ml-3 inline-flex h-9 items-center rounded-full px-3 font-semibold text-[14px] text-dash-link outline-none hover:bg-chapter-lilac focus-visible:ring-2 focus-visible:ring-ring"
						>
							{expanded ? "Ver menos" : "Ver completa"}
						</button>
					) : null}
				</>
			)}

			{!note.signedAt && !note.locked ? (
				<div className="mt-4 flex flex-wrap gap-2">
					<ActionButton
						size="small"
						variant="quiet"
						onClick={() => setEditing(true)}
					>
						<Pencil aria-hidden="true" className="size-4" />
						Editar
					</ActionButton>
					<DraftActions patientId={patientId} noteId={note.id} />
				</div>
			) : null}
		</li>
	);
}

export function NotesTab({ profile }: { profile: PatientProfile }) {
	const { patient, notes, timezone, encryptionReady, appointments, nowIso } =
		profile;
	const drafts = notes.filter((note) => !note.signedAt).length;

	const sessionStarts = new Map(
		appointments.map((item) => [item.id, item.startsAt]),
	);
	const noted = new Set(notes.map((note) => note.appointmentId));
	const now = new Date(nowIso).getTime();
	const sessions: ComposerSession[] = appointments
		.filter(
			(item) =>
				new Date(item.endsAt).getTime() <= now &&
				new Date(item.startsAt).getTime() >= now - SESSION_WINDOW_MS &&
				item.status !== "cancelled" &&
				item.status !== "no_show" &&
				!noted.has(item.id),
		)
		.map((item) => ({
			id: item.id,
			patientId: patient.id,
			label: sessionLabel(item.startsAt, timezone),
		}));

	return (
		<div className="grid gap-4 xl:grid-cols-12">
			<Panel
				aria-labelledby="new-note-title"
				className="xl:col-span-5 xl:self-start"
			>
				<PanelHeading id="new-note-title" title="Nueva nota">
					<span className="inline-flex items-center gap-1.5 text-[14px] text-muted-foreground">
						<Lock aria-hidden="true" className="size-3.5" />
						Cifrada
					</span>
				</PanelHeading>
				<div className="mt-4">
					{encryptionReady ? (
						<NoteComposer
							idPrefix="note-new"
							patientId={patient.id}
							sessions={sessions}
						/>
					) : (
						<EncryptionMissingNotice />
					)}
				</div>
			</Panel>

			<Panel aria-labelledby="notes-title" className="xl:col-span-7">
				<PanelHeading id="notes-title" title="Historia clínica">
					<div className="flex flex-wrap items-center gap-3">
						<p className="text-[15px] text-muted-foreground">
							{notes.length === 0
								? "Sin notas"
								: `${notes.length} ${notes.length === 1 ? "nota" : "notas"}${drafts ? ` · ${drafts} sin firmar` : ""}`}
						</p>
						{notes.length > 0 ? (
							<Link
								href={`/dashboard/notes?patient=${patient.id}`}
								className="inline-flex h-9 items-center rounded-full px-3 font-semibold text-[14px] text-dash-link outline-none transition-colors hover:bg-chapter-lilac focus-visible:ring-2 focus-visible:ring-ring"
							>
								Ver en Notas clínicas
							</Link>
						) : null}
					</div>
				</PanelHeading>
				<div className="mt-4">
					{notes.length === 0 ? (
						<EmptyState icon={NotebookPen} title="Aún no hay notas">
							Escribe una nota después de cada sesión. Puedes editarla mientras
							sea borrador y firmarla cuando esté lista.
						</EmptyState>
					) : (
						<ul className="flex flex-col gap-3">
							{notes.map((note) => (
								<NoteCard
									key={note.id}
									note={note}
									patientId={patient.id}
									timezone={timezone}
									sessionAt={
										note.appointmentId
											? (sessionStarts.get(note.appointmentId) ?? null)
											: null
									}
								/>
							))}
						</ul>
					)}
				</div>
			</Panel>
		</div>
	);
}
