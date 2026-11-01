"use client";

import { cn } from "@helsa/ui/lib/utils";
import { FileSignature, Lock, NotebookPen, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { useDeleteNote, useSaveNote, useSignNote } from "@/lib/api/mutations";
import type { PatientProfile } from "@/lib/core/patient/use-cases/load-patient-profile";

import { ActionButton } from "../profile/parts";
import { Field, TextArea, TextInput } from "../settings/fields";
import { fieldErrors } from "../settings/schema";
import { Panel, PanelHeading } from "../therapist/parts";
import {
	ConfirmButton,
	EmptyState,
	formatDate,
	SetupNotice,
	useRefreshingAction,
} from "./parts";
import { type NoteInput, noteSchema } from "./schema";

type Note = PatientProfile["notes"][number];

function NoteEditor({
	patientId,
	note,
	onDone,
}: {
	patientId: string;
	note?: Note;
	onDone?: () => void;
}) {
	const save = useSaveNote(patientId);
	const run = useRefreshingAction();
	const empty: NoteInput = { title: "", content: "" };
	const [value, setValue] = useState<NoteInput>(
		note ? { title: note.title ?? "", content: note.content ?? "" } : empty,
	);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const prefix = note ? `note-${note.id}` : "note-new";

	async function submit(event: React.FormEvent) {
		event.preventDefault();
		const parsed = noteSchema.safeParse(value);
		if (!parsed.success) {
			setErrors(fieldErrors(parsed.error));
			return;
		}
		const saved = await run(
			() => save.mutateAsync({ ...parsed.data, noteId: note?.id }),
			{
				success: note ? "Nota actualizada." : "Nota guardada como borrador.",
				error: "No pudimos guardar la nota.",
			},
		);
		if (saved) {
			if (!note) setValue(empty);
			onDone?.();
		}
	}

	return (
		<form noValidate onSubmit={submit} className="grid gap-4">
			<Field
				id={`${prefix}-title`}
				label="Título"
				hint="Opcional."
				error={errors.title}
			>
				<TextInput
					id={`${prefix}-title`}
					value={value.title}
					onValueChange={(title) =>
						setValue((current) => ({ ...current, title }))
					}
					placeholder="Sesión 12 · seguimiento"
					maxLength={120}
					autoComplete="off"
				/>
			</Field>
			<Field id={`${prefix}-content`} label="Nota" error={errors.content}>
				<TextArea
					id={`${prefix}-content`}
					value={value.content}
					onValueChange={(content) => {
						setValue((current) => ({ ...current, content }));
						setErrors({});
					}}
					maxLength={20000}
					className="min-h-52"
					placeholder="Qué trabajaron, cómo llegó, qué observaste y qué sigue."
				/>
			</Field>
			<div className="flex flex-wrap items-center gap-3">
				<ActionButton
					type="submit"
					pending={save.isPending}
					pendingLabel="Guardando…"
				>
					{note ? "Guardar cambios" : "Guardar borrador"}
				</ActionButton>
				{onDone ? (
					<ActionButton variant="quiet" onClick={onDone}>
						Cancelar
					</ActionButton>
				) : null}
			</div>
		</form>
	);
}

function NoteCard({
	note,
	patientId,
	timezone,
}: {
	note: Note;
	patientId: string;
	timezone: string;
}) {
	const [editing, setEditing] = useState(false);
	const [expanded, setExpanded] = useState(false);
	const sign = useSignNote(patientId);
	const remove = useDeleteNote(patientId);
	const run = useRefreshingAction();
	const long =
		(note.content?.length ?? 0) > 600 ||
		(note.content?.split("\n").length ?? 0) > 8;

	if (editing) {
		return (
			<li className="rounded-[1.5rem] bg-dash-ground/60 p-4 sm:p-5">
				<NoteEditor
					patientId={patientId}
					note={note}
					onDone={() => setEditing(false)}
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
					</p>
				</div>
				{note.signedAt ? (
					<span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-chapter-teal px-3 font-semibold text-[13px]">
						<FileSignature aria-hidden="true" className="size-3.5" />
						Firmada el {formatDate(note.signedAt, timezone)}
					</span>
				) : (
					<span className="inline-flex h-7 items-center rounded-full bg-chapter-peach px-3 font-semibold text-[13px]">
						Borrador
					</span>
				)}
			</div>

			{note.locked ? (
				<div className="mt-3">
					<SetupNotice>
						No pudimos descifrar esta nota. Revisa que CLINICAL_ENCRYPTION_KEY
						sea la misma con la que se guardó.
					</SetupNotice>
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
					<ConfirmButton
						label="Firmar"
						title="¿Firmar esta nota?"
						description="Una nota firmada queda cerrada: ya no podrás editarla ni borrarla. Así queda como parte de la historia clínica."
						confirmLabel="Firmar nota"
						pending={sign.isPending}
						onConfirm={() =>
							run(() => sign.mutateAsync(note.id), {
								success: "Nota firmada.",
								error: "No pudimos firmar la nota.",
							})
						}
					>
						<FileSignature aria-hidden="true" className="size-4" />
						Firmar
					</ConfirmButton>
					<ConfirmButton
						label="Eliminar borrador"
						title="¿Eliminar este borrador?"
						description="La nota dejará de aparecer en la ficha del paciente."
						confirmLabel="Eliminar"
						variant="danger"
						pending={remove.isPending}
						onConfirm={() =>
							run(() => remove.mutateAsync(note.id), {
								success: "Borrador eliminado.",
								error: "No pudimos eliminar la nota.",
							})
						}
					>
						<Trash2 aria-hidden="true" className="size-4" />
						Eliminar
					</ConfirmButton>
				</div>
			) : null}
		</li>
	);
}

export function NotesTab({ profile }: { profile: PatientProfile }) {
	const { patient, notes, timezone, encryptionReady } = profile;
	const drafts = notes.filter((note) => !note.signedAt).length;

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
						<NoteEditor patientId={patient.id} />
					) : (
						<SetupNotice>
							Para escribir notas clínicas falta configurar
							CLINICAL_ENCRYPTION_KEY en el servidor. Las notas se guardan
							cifradas.
						</SetupNotice>
					)}
				</div>
			</Panel>

			<Panel aria-labelledby="notes-title" className="xl:col-span-7">
				<PanelHeading id="notes-title" title="Historia clínica">
					<p className="text-[15px] text-muted-foreground">
						{notes.length === 0
							? "Sin notas"
							: `${notes.length} ${notes.length === 1 ? "nota" : "notas"}${drafts ? ` · ${drafts} sin firmar` : ""}`}
					</p>
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
								/>
							))}
						</ul>
					)}
				</div>
			</Panel>
		</div>
	);
}
