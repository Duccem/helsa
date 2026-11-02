"use client";

import { cn } from "@helsa/ui/lib/utils";
import { CheckCheck, CircleCheck, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

import {
	type TaskAction,
	useSaveTask,
	useTaskAction,
} from "@/lib/api/mutations";

import {
	ConfirmButton,
	formatDay,
	useRefreshingAction,
} from "../patients/parts";
import {
	type TaskFrequency,
	type TaskInput,
	taskFrequencies,
	taskFrequencyLabels,
	taskSchema,
} from "../patients/schema";
import { ActionButton } from "../profile/parts";
import {
	Field,
	Segmented,
	SelectInput,
	TextArea,
	TextInput,
	ToggleRow,
} from "../settings/fields";
import { fieldErrors } from "../settings/schema";
import { confirmDiscard, useUnsavedWarning } from "../unsaved";

type TaskStatus = "assigned" | "completed" | "cancelled";

// ─── Templates ───────────────────────────────────────────────────────────────

/** Common between-session exercises. They only prefill the form. */
export const taskTemplates: Array<{
	id: string;
	label: string;
	title: string;
	instructions: string;
	frequency: TaskFrequency;
	asksMood: boolean;
}> = [
	{
		id: "thought-record",
		label: "Registro de pensamientos",
		title: "Registro de pensamientos",
		instructions:
			"Cuando notes un cambio fuerte de ánimo, anota la situación, lo que pensaste, lo que sentiste (0 a 10) y qué hiciste. Al final, escribe otra forma de ver la situación.",
		frequency: "daily",
		asksMood: true,
	},
	{
		id: "breathing",
		label: "Respiración",
		title: "Respiración diafragmática",
		instructions:
			"Dos veces al día, 5 minutos: inhala por la nariz en 4 tiempos llevando el aire al abdomen, sostén 2 y exhala por la boca en 6. Anota cómo estabas antes y después.",
		frequency: "daily",
		asksMood: true,
	},
	{
		id: "activation",
		label: "Activación conductual",
		title: "Actividades agradables y de logro",
		instructions:
			"Planifica cada día una actividad agradable y una de logro. Anota si las hiciste y cuánto las disfrutaste (0 a 10).",
		frequency: "daily",
		asksMood: true,
	},
	{
		id: "sleep",
		label: "Registro de sueño",
		title: "Diario de sueño",
		instructions:
			"Cada mañana anota a qué hora te acostaste, cuánto tardaste en dormirte, cuántas veces despertaste y a qué hora te levantaste.",
		frequency: "daily",
		asksMood: false,
	},
	{
		id: "gratitude",
		label: "Gratitud",
		title: "Tres cosas buenas",
		instructions:
			"Antes de dormir, escribe tres cosas concretas que salieron bien hoy y por qué crees que pasaron.",
		frequency: "daily",
		asksMood: true,
	},
	{
		id: "exposure",
		label: "Exposición gradual",
		title: "Práctica de exposición",
		instructions:
			"Practica el paso de la jerarquía que acordamos en sesión. Anota la ansiedad al inicio, en el punto más alto y al final (0 a 10).",
		frequency: "weekly",
		asksMood: true,
	},
];

// ─── Status ──────────────────────────────────────────────────────────────────

export function taskStateLabel(task: {
	status: TaskStatus;
	overdue?: boolean;
	upcoming?: boolean;
}) {
	if (task.status === "completed") return "Completada";
	if (task.status === "cancelled") return "Cancelada";
	if (task.overdue) return "Vencida";
	if (task.upcoming) return "Programada";
	return "Activa";
}

export function TaskStatusPill({
	task,
	className,
}: {
	task: { status: TaskStatus; overdue?: boolean; upcoming?: boolean };
	className?: string;
}) {
	const label = taskStateLabel(task);
	return (
		<span
			className={cn(
				"inline-flex h-7 shrink-0 items-center rounded-full px-3 font-semibold text-[13px]",
				label === "Activa" &&
					"bg-chapter-lilac text-chapter-violet dark:text-foreground",
				label === "Programada" && "bg-chapter-lilac/60",
				label === "Vencida" && "bg-chapter-peach",
				label === "Completada" && "bg-chapter-teal",
				label === "Cancelada" && "bg-dash-ground text-muted-foreground",
				className,
			)}
		>
			{label}
		</span>
	);
}

/** "Cada día · desde 3 nov 2026 hasta 10 nov 2026 · pide ánimo" */
export function taskSchedule(task: {
	frequency: TaskFrequency;
	startsOn: string;
	dueOn: string | null;
	asksMood: boolean;
}) {
	return [
		`${taskFrequencyLabels[task.frequency]} · desde ${formatDay(task.startsOn)}${task.dueOn ? ` hasta ${formatDay(task.dueOn)}` : ""}`,
		task.asksMood ? "pide ánimo" : null,
	]
		.filter(Boolean)
		.join(" · ");
}

// ─── Adherence ───────────────────────────────────────────────────────────────

const periodNames: Record<TaskFrequency, [string, string]> = {
	once: ["vez", "veces"],
	daily: ["día", "días"],
	weekly: ["semana", "semanas"],
};

export function adherenceText(
	frequency: TaskFrequency,
	{ done, expected }: { done: number; expected: number },
) {
	if (expected === 0) return "Aún no empieza";
	if (frequency === "once") return done ? "Respondida" : "Sin respuesta";
	const [one, many] = periodNames[frequency];
	return `${done} de ${expected} ${expected === 1 ? one : many}`;
}

export function AdherenceMeter({
	frequency,
	adherence,
	className,
}: {
	frequency: TaskFrequency;
	adherence: { done: number; expected: number };
	className?: string;
}) {
	const ratio = adherence.expected ? adherence.done / adherence.expected : 0;
	return (
		<div className={cn("flex items-center gap-3", className)}>
			<div
				className="h-2 w-24 shrink-0 overflow-hidden rounded-full bg-dash-ground"
				aria-hidden="true"
			>
				<div
					className={cn(
						"h-full rounded-full",
						ratio >= 0.7
							? "bg-chapter-teal-deep"
							: ratio >= 0.4
								? "bg-chapter-lilac-deep"
								: "bg-chapter-peach-deep",
					)}
					style={{ width: `${Math.round(ratio * 100)}%` }}
				/>
			</div>
			<span className="text-[14px] text-muted-foreground tabular-nums">
				{adherenceText(frequency, adherence)}
			</span>
		</div>
	);
}

// ─── Answers ─────────────────────────────────────────────────────────────────

type Entry = {
	id: string;
	entryDate: string;
	moodScore: number | null;
	content: string | null;
	locked: boolean;
	seen: boolean;
};

export function MoodTrail({ entries }: { entries: Entry[] }) {
	const scores = entries
		.filter((entry) => entry.moodScore !== null)
		.slice(0, 14)
		.reverse();
	if (scores.length === 0) return null;
	const average =
		scores.reduce((sum, entry) => sum + (entry.moodScore ?? 0), 0) /
		scores.length;
	return (
		<div className="flex items-end gap-3">
			<div
				className="flex h-10 items-end gap-1"
				role="img"
				aria-label={`Ánimo en los últimos registros: ${scores.map((entry) => entry.moodScore).join(", ")} de 10`}
			>
				{scores.map((entry) => (
					<span
						key={entry.id}
						className="w-2 rounded-full bg-chapter-violet/70 dark:bg-primary/70"
						style={{ height: `${Math.max(10, (entry.moodScore ?? 0) * 10)}%` }}
					/>
				))}
			</div>
			<p className="text-[14px] text-muted-foreground">
				Ánimo promedio {average.toFixed(1)} de 10
			</p>
		</div>
	);
}

/** The patient's answers, newest first. Unread ones stand out. */
export function EntryList({ entries }: { entries: Entry[] }) {
	return (
		<ul className="flex flex-col gap-2">
			{entries.map((entry) => (
				<li
					key={entry.id}
					className={cn(
						"rounded-2xl px-4 py-3",
						entry.seen ? "bg-dash-ground" : "bg-chapter-lilac",
					)}
				>
					<p className="flex flex-wrap items-center gap-x-3 text-[14px]">
						<span className="font-semibold">{formatDay(entry.entryDate)}</span>
						{entry.moodScore !== null ? (
							<span className="text-muted-foreground">
								Ánimo {entry.moodScore} de 10
							</span>
						) : null}
						{entry.seen ? null : (
							<span className="font-semibold text-[13px] text-chapter-violet dark:text-primary">
								Nueva
							</span>
						)}
					</p>
					{entry.locked ? (
						<p className="mt-1 text-[14px] text-muted-foreground">
							No se pudo descifrar.
						</p>
					) : entry.content ? (
						<p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed">
							{entry.content}
						</p>
					) : null}
				</li>
			))}
		</ul>
	);
}

// ─── Actions ─────────────────────────────────────────────────────────────────

/** Mark answers as read, complete or cancel. Closing a task asks first. */
export function TaskActions({
	patientId,
	task,
}: {
	patientId: string;
	task: { id: string; status: TaskStatus; unseen: number };
}) {
	const action = useTaskAction();
	const run = useRefreshingAction();
	const active = task.status === "assigned";
	const busy = (kind: TaskAction) =>
		action.isPending && action.variables?.action === kind;
	const perform = (kind: TaskAction, success: string) =>
		run(
			() => action.mutateAsync({ patientId, taskId: task.id, action: kind }),
			{ success, error: "No pudimos actualizar la tarea." },
		);

	return (
		<>
			{task.unseen ? (
				<ActionButton
					size="small"
					pending={busy("seen")}
					onClick={() => perform("seen", "Respuestas marcadas como revisadas.")}
				>
					<CheckCheck aria-hidden="true" className="size-4" />
					Marcar como revisadas
				</ActionButton>
			) : null}
			{active ? (
				<ConfirmButton
					label="Completar"
					title="¿Dar la tarea por completada?"
					description="El paciente dejará de verla como pendiente. Sus respuestas se conservan."
					confirmLabel="Completar tarea"
					pending={busy("complete")}
					onConfirm={() => perform("complete", "Tarea completada.")}
				>
					<CircleCheck aria-hidden="true" className="size-4" />
					Completar
				</ConfirmButton>
			) : null}
			{active ? (
				<ConfirmButton
					label="Cancelar tarea"
					title="¿Cancelar esta tarea?"
					description="El paciente dejará de verla. Sus respuestas anteriores se conservan."
					confirmLabel="Cancelar tarea"
					variant="danger"
					pending={busy("cancel")}
					onConfirm={() => perform("cancel", "Tarea cancelada.")}
				>
					<X aria-hidden="true" className="size-4" />
					Cancelar
				</ConfirmButton>
			) : null}
		</>
	);
}

// ─── Form ────────────────────────────────────────────────────────────────────

const frequencyOptions = taskFrequencies.map(
	(frequency) => [frequency, taskFrequencyLabels[frequency]] as const,
);

export function blankTask(today: string): TaskInput {
	return {
		title: "",
		instructions: "",
		frequency: "daily",
		startsOn: today,
		dueOn: "",
		asksMood: true,
	};
}

/** A stored task as form values. */
export function toTaskInput(task: {
	title: string;
	instructions: string | null;
	frequency: TaskFrequency;
	startsOn: string;
	dueOn: string | null;
	asksMood: boolean;
}): TaskInput {
	return {
		title: task.title,
		instructions: task.instructions ?? "",
		frequency: task.frequency,
		startsOn: task.startsOn,
		dueOn: task.dueOn ?? "",
		asksMood: task.asksMood,
	};
}

function sameTask(a: TaskInput, b: TaskInput) {
	return (
		a.title === b.title &&
		a.instructions === b.instructions &&
		a.frequency === b.frequency &&
		a.startsOn === b.startsOn &&
		a.dueOn === b.dueOn &&
		a.asksMood === b.asksMood
	);
}

/**
 * Assigns a task or edits an active one (`taskId`). With `patients` the
 * therapist picks who it's for; otherwise it goes to `patientId`.
 */
export function TaskForm({
	idPrefix,
	today,
	taskId,
	initial,
	patientId: initialPatientId = "",
	patients,
	onSaved,
	onCancel,
	onDirtyChange,
}: {
	idPrefix: string;
	today: string;
	taskId?: string;
	initial?: TaskInput;
	patientId?: string;
	patients?: ReadonlyArray<{ id: string; name: string }>;
	onSaved?: (taskId: string) => void;
	onCancel?: () => void;
	onDirtyChange?: (dirty: boolean) => void;
}) {
	const save = useSaveTask();
	const run = useRefreshingAction();
	const start = initial ?? blankTask(today);
	const [value, setValue] = useState<TaskInput>(start);
	const [patientId, setPatientId] = useState(initialPatientId);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const dirty = !sameTask(value, start);
	useEffect(() => onDirtyChange?.(dirty), [dirty, onDirtyChange]);
	useUnsavedWarning(dirty);

	const editing = Boolean(taskId);
	const choosingPatient = !editing && patients !== undefined;
	const templateOn = (id: string) => {
		const template = taskTemplates.find((item) => item.id === id);
		return (
			template?.title === value.title &&
			template.instructions === value.instructions
		);
	};
	const templatesOpen =
		(value.title === "" && value.instructions === "") ||
		taskTemplates.some((item) => templateOn(item.id));

	function set(patch: Partial<TaskInput>) {
		setValue((current) => ({ ...current, ...patch }));
		setErrors({});
	}

	async function submit(event?: React.FormEvent) {
		event?.preventDefault();
		if (save.isPending) return;
		const parsed = taskSchema.safeParse(value);
		const problems = parsed.success ? {} : fieldErrors(parsed.error);
		if (!patientId) problems.patient = "Elige un paciente.";
		if (!parsed.success || problems.patient) {
			setErrors(problems);
			return;
		}
		let savedId = taskId ?? "";
		const saved = await run(
			async () => {
				const result = await save.mutateAsync({
					...parsed.data,
					patientId,
					taskId,
				});
				if (result.id) savedId = result.id;
			},
			{
				success: editing ? "Tarea actualizada." : "Tarea asignada.",
				error: editing
					? "No pudimos guardar la tarea."
					: "No pudimos asignar la tarea.",
			},
		);
		if (!saved) return;
		onDirtyChange?.(false);
		if (!editing) setValue(blankTask(today));
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
			className="grid gap-5"
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

			{editing ? null : (
				<fieldset className="min-w-0">
					<legend className="px-5 font-medium text-[15px]">
						Ejercicios frecuentes
					</legend>
					<div className="mt-2 flex flex-wrap gap-2">
						{taskTemplates.map((template) => {
							const on = templateOn(template.id);
							return (
								<button
									key={template.id}
									type="button"
									disabled={!templatesOpen}
									aria-pressed={on}
									onClick={() =>
										set({
											title: template.title,
											instructions: template.instructions,
											frequency: template.frequency,
											asksMood: template.asksMood,
										})
									}
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
							? "Rellenan el formulario; puedes ajustar el texto."
							: "Vacía el título y las instrucciones para usar otro ejercicio."}
					</p>
				</fieldset>
			)}

			<Field id={`${idPrefix}-title`} label="Tarea" error={errors.title}>
				<TextInput
					id={`${idPrefix}-title`}
					value={value.title}
					onValueChange={(title) => set({ title })}
					placeholder="Registro de pensamientos"
					maxLength={120}
					invalid={Boolean(errors.title)}
					autoComplete="off"
				/>
			</Field>
			<Field
				id={`${idPrefix}-instructions`}
				label="Instrucciones"
				hint="Opcional. El paciente las verá tal cual."
				error={errors.instructions}
			>
				<TextArea
					id={`${idPrefix}-instructions`}
					value={value.instructions}
					onValueChange={(instructions) => set({ instructions })}
					maxLength={2000}
					className="min-h-32"
					placeholder="Qué hacer, cuándo y qué anotar."
				/>
			</Field>
			<div className="grid gap-2">
				<p className="px-5 font-medium text-[15px]">Frecuencia</p>
				<Segmented<TaskFrequency>
					label="Frecuencia"
					options={frequencyOptions}
					value={value.frequency}
					onChange={(frequency) => set({ frequency })}
				/>
			</div>
			<div className="grid gap-5 sm:grid-cols-2">
				<Field id={`${idPrefix}-start`} label="Empieza" error={errors.startsOn}>
					<TextInput
						id={`${idPrefix}-start`}
						type="date"
						value={value.startsOn}
						onValueChange={(startsOn) => set({ startsOn })}
						invalid={Boolean(errors.startsOn)}
					/>
				</Field>
				<Field
					id={`${idPrefix}-due`}
					label="Termina"
					hint="Opcional."
					error={errors.dueOn}
				>
					<TextInput
						id={`${idPrefix}-due`}
						type="date"
						value={value.dueOn}
						min={value.startsOn}
						onValueChange={(dueOn) => set({ dueOn })}
						invalid={Boolean(errors.dueOn)}
					/>
				</Field>
			</div>
			<ToggleRow
				title="Preguntar cómo se siente"
				detail="Cada registro pide un ánimo del 1 al 10, para ver su evolución."
				checked={value.asksMood}
				onCheckedChange={(asksMood) => set({ asksMood })}
			/>
			<div className="flex flex-wrap items-center gap-3">
				<ActionButton
					type="submit"
					pending={save.isPending}
					pendingLabel={editing ? "Guardando…" : "Asignando…"}
				>
					{editing ? null : <Plus aria-hidden="true" className="size-4" />}
					{editing ? "Guardar cambios" : "Asignar tarea"}
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
			</div>
		</form>
	);
}
