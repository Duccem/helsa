"use client";

import { cn } from "@helsa/ui/lib/utils";
import { FileSignature, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { useDeleteNote, useSaveNote, useSignNote } from "@/lib/api/mutations";

import {
	ConfirmButton,
	formatDate,
	SetupNotice,
	useRefreshingAction,
} from "../patients/parts";
import { type NoteInput, noteSchema } from "../patients/schema";
import { ActionButton } from "../profile/parts";
import { Field, SelectInput, TextArea, TextInput } from "../settings/fields";
import { fieldErrors } from "../settings/schema";
import { confirmDiscard, useUnsavedWarning } from "../unsaved";

// ─── Templates ───────────────────────────────────────────────────────────────

/** Starting structures for a note. They only fill the text; nothing is stored about them. */
export const noteTemplates = [
	{ id: "free", label: "Libre", body: "" },
	{
		id: "soap",
		label: "SOAP",
		body: "Subjetivo:\n\n\nObjetivo:\n\n\nAnálisis:\n\n\nPlan:\n",
	},
	{
		id: "follow_up",
		label: "Seguimiento",
		body: "Cómo llegó:\n\n\nTemas trabajados:\n\n\nIntervenciones:\n\n\nTareas y acuerdos:\n\n\nPara la próxima sesión:\n",
	},
	{
		id: "intake",
		label: "Primera entrevista",
		body: "Motivo de consulta:\n\n\nAntecedentes relevantes:\n\n\nObservaciones:\n\n\nValoración de riesgo:\n\n\nObjetivos terapéuticos:\n\n\nPlan:\n",
	},
] as const;

const templateBodies = new Set<string>(noteTemplates.map((item) => item.body));

/** A template can replace the text only while nothing has been written. */
function canApplyTemplate(content: string) {
	return content.trim() === "" || templateBodies.has(content);
}

/** "mar, 3 nov, 10:00": when a session happened, in the therapist's time zone. */
export function sessionLabel(startsAt: string, timeZone: string) {
	return formatDate(startsAt, timeZone, {
		weekday: "short",
		day: "numeric",
		month: "short",
		hour: "numeric",
		minute: "2-digit",
	});
}

// ─── Status ──────────────────────────────────────────────────────────────────

export function NoteStatusPill({
	signed,
	className,
}: {
	signed: boolean;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-3 font-semibold text-[13px]",
				signed ? "bg-chapter-teal" : "bg-chapter-peach",
				className,
			)}
		>
			{signed ? (
				<FileSignature aria-hidden="true" className="size-3.5" />
			) : null}
			{signed ? "Firmada" : "Borrador"}
		</span>
	);
}

export function LockedNoteNotice() {
	return (
		<SetupNotice>
			No pudimos descifrar esta nota. Revisa que CLINICAL_ENCRYPTION_KEY sea la
			misma con la que se guardó.
		</SetupNotice>
	);
}

export function EncryptionMissingNotice() {
	return (
		<SetupNotice>
			Para escribir notas clínicas falta configurar CLINICAL_ENCRYPTION_KEY en
			el servidor. Las notas se guardan cifradas.
		</SetupNotice>
	);
}

// ─── Composer ────────────────────────────────────────────────────────────────

export type ComposerSession = { id: string; patientId: string; label: string };

type EditableNote = {
	id: string;
	patientId: string;
	title: string | null;
	content: string | null;
};

/**
 * Writes a new note or edits a draft. With `patients` the therapist picks who
 * the note is for; otherwise it belongs to `patientId`.
 */
export function NoteComposer({
	idPrefix,
	note,
	patientId: initialPatientId = "",
	patients,
	sessions = [],
	initialSessionId = "",
	onSaved,
	onCancel,
	onDirtyChange,
}: {
	idPrefix: string;
	note?: EditableNote;
	patientId?: string;
	patients?: ReadonlyArray<{ id: string; name: string }>;
	sessions?: ReadonlyArray<ComposerSession>;
	initialSessionId?: string;
	onSaved?: (noteId: string) => void;
	onCancel?: () => void;
	onDirtyChange?: (dirty: boolean) => void;
}) {
	const save = useSaveNote();
	const run = useRefreshingAction();
	const initial: NoteInput = {
		title: note?.title ?? "",
		content: note?.content ?? "",
	};
	const [value, setValue] = useState<NoteInput>(initial);
	const [patientId, setPatientId] = useState(
		note?.patientId ?? initialPatientId,
	);
	const [sessionId, setSessionId] = useState(initialSessionId);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const dirty =
		value.title !== initial.title || value.content !== initial.content;
	useEffect(() => onDirtyChange?.(dirty), [dirty, onDirtyChange]);
	useUnsavedWarning(dirty);

	const choosingPatient = !note && patients !== undefined;
	const patientSessions = note
		? []
		: sessions.filter((session) => session.patientId === patientId);
	const templatesOpen = canApplyTemplate(value.content);

	function update(patch: Partial<NoteInput>) {
		setValue((current) => ({ ...current, ...patch }));
		setErrors({});
	}

	async function submit(event?: React.FormEvent) {
		event?.preventDefault();
		if (save.isPending) return;
		const parsed = noteSchema.safeParse({
			...value,
			appointmentId: note ? undefined : sessionId || null,
		});
		const problems = parsed.success ? {} : fieldErrors(parsed.error);
		if (!patientId) problems.patient = "Elige un paciente.";
		if (!parsed.success || problems.patient) {
			setErrors(problems);
			return;
		}
		let savedId = note?.id ?? "";
		const saved = await run(
			async () => {
				const result = await save.mutateAsync({
					...parsed.data,
					patientId,
					noteId: note?.id,
				});
				if (result.id) savedId = result.id;
			},
			{
				success: note ? "Nota actualizada." : "Nota guardada como borrador.",
				error: "No pudimos guardar la nota.",
			},
		);
		if (!saved) return;
		onDirtyChange?.(false);
		if (!note) {
			setValue({ title: "", content: "" });
			setSessionId("");
		}
		onSaved?.(savedId);
	}

	return (
		<form
			noValidate
			onSubmit={submit}
			onKeyDown={(event) => {
				if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
					event.preventDefault();
					void submit();
				}
			}}
			className="grid gap-4"
		>
			{choosingPatient ? (
				<Field
					id={`${idPrefix}-patient`}
					label="Paciente"
					error={errors.patient}
				>
					<SelectInput
						id={`${idPrefix}-patient`}
						value={patientId}
						invalid={Boolean(errors.patient)}
						onValueChange={(next) => {
							setPatientId(next);
							setSessionId("");
							setErrors({});
						}}
						options={[
							["", "Elige un paciente"],
							...(patients ?? []).map(
								(patient) => [patient.id, patient.name] as const,
							),
						]}
					/>
				</Field>
			) : null}

			{patientSessions.length > 0 ? (
				<Field
					id={`${idPrefix}-session`}
					label="Sesión"
					hint="Sesiones recientes que aún no tienen nota."
					error={errors.appointmentId}
				>
					<SelectInput
						id={`${idPrefix}-session`}
						value={sessionId}
						onValueChange={setSessionId}
						options={[
							["", "Sin vincular a una sesión"],
							...patientSessions.map(
								(session) => [session.id, session.label] as const,
							),
						]}
					/>
				</Field>
			) : null}

			{note ? null : (
				<fieldset className="min-w-0">
					<legend className="px-5 font-medium text-[15px]">Plantilla</legend>
					<div className="mt-2 flex flex-wrap gap-2">
						{noteTemplates.map((template) => {
							const on = value.content === template.body;
							return (
								<button
									key={template.id}
									type="button"
									disabled={!templatesOpen}
									aria-pressed={on}
									onClick={() => update({ content: template.body })}
									className={cn(
										"inline-flex h-9 items-center rounded-full px-4 font-medium text-[14px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
										on
											? "bg-chapter-lilac text-chapter-violet dark:text-foreground"
											: "bg-dash-ground hover:bg-chapter-lilac/60",
									)}
								>
									{template.label}
								</button>
							);
						})}
					</div>
					<p className="mt-2 px-5 text-[14px] text-foreground/70 leading-snug">
						{templatesOpen
							? "Rellena la nota con una estructura que puedes cambiar."
							: "Las plantillas se aplican sobre una nota vacía."}
					</p>
				</fieldset>
			)}

			<Field
				id={`${idPrefix}-title`}
				label="Título"
				hint="Opcional."
				error={errors.title}
			>
				<TextInput
					id={`${idPrefix}-title`}
					value={value.title}
					onValueChange={(title) => update({ title })}
					placeholder="Sesión 12 · seguimiento"
					maxLength={120}
					autoComplete="off"
				/>
			</Field>
			<Field id={`${idPrefix}-content`} label="Nota" error={errors.content}>
				<TextArea
					id={`${idPrefix}-content`}
					value={value.content}
					onValueChange={(content) => update({ content })}
					invalid={Boolean(errors.content)}
					maxLength={20000}
					className="min-h-64"
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
				{onCancel ? (
					<ActionButton
						variant="quiet"
						onClick={() => {
							if (confirmDiscard(dirty)) onCancel();
						}}
					>
						Cancelar
					</ActionButton>
				) : null}
				<span className="hidden text-[13px] text-muted-foreground sm:inline">
					Ctrl + Enter para guardar
				</span>
			</div>
		</form>
	);
}

// ─── Actions on a draft ──────────────────────────────────────────────────────

/** Sign and delete buttons. Both ask first: signing closes the note for good. */
export function DraftActions({
	patientId,
	noteId,
	onDeleted,
}: {
	patientId: string;
	noteId: string;
	onDeleted?: () => void;
}) {
	const sign = useSignNote();
	const remove = useDeleteNote();
	const run = useRefreshingAction();
	const ref = { patientId, noteId };

	return (
		<>
			<ConfirmButton
				label="Firmar"
				title="¿Firmar esta nota?"
				description="Una nota firmada queda cerrada: ya no podrás editarla ni borrarla. Así queda como parte de la historia clínica."
				confirmLabel="Firmar nota"
				pending={sign.isPending}
				onConfirm={() =>
					run(() => sign.mutateAsync(ref), {
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
				onConfirm={async () => {
					const done = await run(() => remove.mutateAsync(ref), {
						success: "Borrador eliminado.",
						error: "No pudimos eliminar la nota.",
					});
					if (done) onDeleted?.();
				}}
			>
				<Trash2 aria-hidden="true" className="size-4" />
				Eliminar
			</ConfirmButton>
		</>
	);
}
