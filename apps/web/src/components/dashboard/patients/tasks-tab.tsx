"use client";

import { cn } from "@helsa/ui/lib/utils";
import { CheckCheck, ListChecks, Plus } from "lucide-react";
import { useState } from "react";

import { useAssignTask, useTaskAction } from "@/lib/api/mutations";
import type { PatientProfile } from "@/lib/core/patient/use-cases/load-patient-profile";

import { ActionButton } from "../profile/parts";
import {
	Field,
	Segmented,
	TextArea,
	TextInput,
	ToggleRow,
} from "../settings/fields";
import { fieldErrors } from "../settings/schema";
import { Panel, PanelHeading } from "../therapist/parts";
import {
	ConfirmButton,
	EmptyState,
	formatDate,
	formatDay,
	useRefreshingAction,
} from "./parts";
import {
	type TaskFrequency,
	type TaskInput,
	taskFrequencies,
	taskFrequencyLabels,
	taskSchema,
	taskStatusLabels,
} from "./schema";

type Task = PatientProfile["tasks"][number];

const frequencyOptions = taskFrequencies.map(
	(frequency) => [frequency, taskFrequencyLabels[frequency]] as const,
);

function TaskForm({ patientId, today }: { patientId: string; today: string }) {
	const assign = useAssignTask(patientId);
	const run = useRefreshingAction();
	const blank: TaskInput = {
		title: "",
		instructions: "",
		frequency: "daily",
		startsOn: today,
		dueOn: "",
		asksMood: true,
	};
	const [value, setValue] = useState<TaskInput>(blank);
	const [errors, setErrors] = useState<Record<string, string>>({});

	function set(patch: Partial<TaskInput>) {
		setValue((current) => ({ ...current, ...patch }));
		setErrors({});
	}

	async function submit(event: React.FormEvent) {
		event.preventDefault();
		const parsed = taskSchema.safeParse(value);
		if (!parsed.success) {
			setErrors(fieldErrors(parsed.error));
			return;
		}
		const saved = await run(() => assign.mutateAsync(parsed.data), {
			success: "Tarea asignada.",
			error: "No pudimos asignar la tarea.",
		});
		if (saved) setValue(blank);
	}

	return (
		<form noValidate onSubmit={submit} className="grid gap-5">
			<Field id="task-title" label="Tarea" error={errors.title}>
				<TextInput
					id="task-title"
					value={value.title}
					onValueChange={(title) => set({ title })}
					placeholder="Registro de pensamientos"
					maxLength={120}
					invalid={Boolean(errors.title)}
					autoComplete="off"
				/>
			</Field>
			<Field
				id="task-instructions"
				label="Instrucciones"
				hint="Opcional."
				error={errors.instructions}
			>
				<TextArea
					id="task-instructions"
					value={value.instructions}
					onValueChange={(instructions) => set({ instructions })}
					maxLength={2000}
					className="min-h-28"
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
				<Field id="task-start" label="Empieza" error={errors.startsOn}>
					<TextInput
						id="task-start"
						type="date"
						value={value.startsOn}
						onValueChange={(startsOn) => set({ startsOn })}
						invalid={Boolean(errors.startsOn)}
					/>
				</Field>
				<Field
					id="task-due"
					label="Termina"
					hint="Opcional."
					error={errors.dueOn}
				>
					<TextInput
						id="task-due"
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
			<div>
				<ActionButton
					type="submit"
					pending={assign.isPending}
					pendingLabel="Asignando…"
				>
					<Plus aria-hidden="true" className="size-4" />
					Asignar tarea
				</ActionButton>
			</div>
		</form>
	);
}

function MoodTrail({ entries }: { entries: Task["entries"] }) {
	const scores = entries
		.filter((entry) => entry.moodScore !== null)
		.slice(0, 14)
		.reverse();
	if (scores.length === 0) return null;
	const average =
		scores.reduce((sum, entry) => sum + (entry.moodScore ?? 0), 0) /
		scores.length;
	return (
		<div className="mt-3 flex items-end gap-3">
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

function TaskCard({
	task,
	patientId,
	timezone,
}: {
	task: Task;
	patientId: string;
	timezone: string;
}) {
	const action = useTaskAction(patientId);
	const run = useRefreshingAction();
	const [showEntries, setShowEntries] = useState(false);
	const unseen = task.entries.filter((entry) => !entry.seen).length;
	const active = task.status === "assigned";

	return (
		<li
			className={cn(
				"rounded-[1.5rem] border border-border/60 p-4 sm:p-5",
				!active && "opacity-75",
			)}
		>
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="min-w-0">
					<h3 className="font-semibold text-[16px]">{task.title}</h3>
					<p className="mt-0.5 text-[14px] text-muted-foreground">
						{taskFrequencyLabels[task.frequency]} · desde{" "}
						{formatDay(task.startsOn)}
						{task.dueOn ? ` hasta ${formatDay(task.dueOn)}` : ""}
						{task.asksMood ? " · pide ánimo" : ""}
						{` · asignada el ${formatDate(task.createdAt, timezone)}`}
					</p>
				</div>
				<span
					className={cn(
						"inline-flex h-7 items-center rounded-full px-3 font-semibold text-[13px]",
						task.status === "assigned" &&
							"bg-chapter-lilac text-chapter-violet dark:text-foreground",
						task.status === "completed" && "bg-chapter-teal",
						task.status === "cancelled" &&
							"bg-dash-ground text-muted-foreground",
					)}
				>
					{taskStatusLabels[task.status]}
				</span>
			</div>

			{task.instructions ? (
				<p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed">
					{task.instructions}
				</p>
			) : null}

			<MoodTrail entries={task.entries} />

			{task.entries.length > 0 ? (
				<div className="mt-3">
					<button
						type="button"
						onClick={() => setShowEntries((open) => !open)}
						aria-expanded={showEntries}
						className="-ml-3 inline-flex h-9 items-center gap-2 rounded-full px-3 font-semibold text-[14px] text-dash-link outline-none hover:bg-chapter-lilac focus-visible:ring-2 focus-visible:ring-ring"
					>
						{showEntries
							? "Ocultar respuestas"
							: `Ver ${task.entries.length} ${task.entries.length === 1 ? "respuesta" : "respuestas"}`}
						{unseen ? (
							<span className="rounded-full bg-chapter-peach px-2 py-0.5 text-[12px] text-foreground">
								{unseen} {unseen === 1 ? "nueva" : "nuevas"}
							</span>
						) : null}
					</button>
					{showEntries ? (
						<ul className="mt-2 flex flex-col gap-2">
							{task.entries.map((entry) => (
								<li
									key={entry.id}
									className={cn(
										"rounded-2xl px-4 py-3",
										entry.seen ? "bg-dash-ground" : "bg-chapter-lilac",
									)}
								>
									<p className="flex flex-wrap items-center gap-x-3 text-[14px]">
										<span className="font-semibold">
											{formatDay(entry.entryDate)}
										</span>
										{entry.moodScore !== null ? (
											<span className="text-muted-foreground">
												Ánimo {entry.moodScore} de 10
											</span>
										) : null}
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
					) : null}
				</div>
			) : active ? (
				<p className="mt-3 text-[14px] text-muted-foreground">
					Aún no hay respuestas.
				</p>
			) : null}

			{active || unseen ? (
				<div className="mt-4 flex flex-wrap gap-2">
					{unseen ? (
						<ActionButton
							size="small"
							variant="quiet"
							pending={action.isPending && action.variables?.action === "seen"}
							onClick={() =>
								run(
									() => action.mutateAsync({ taskId: task.id, action: "seen" }),
									{
										success: "Respuestas marcadas como vistas.",
										error: "No pudimos actualizar la tarea.",
									},
								)
							}
						>
							<CheckCheck aria-hidden="true" className="size-4" />
							Marcar como vistas
						</ActionButton>
					) : null}
					{active ? (
						<ConfirmButton
							label="Cancelar tarea"
							title="¿Cancelar esta tarea?"
							description="El paciente dejará de verla. Sus respuestas anteriores se conservan."
							confirmLabel="Cancelar tarea"
							variant="danger"
							pending={
								action.isPending && action.variables?.action === "cancel"
							}
							onConfirm={() =>
								run(
									() =>
										action.mutateAsync({ taskId: task.id, action: "cancel" }),
									{
										success: "Tarea cancelada.",
										error: "No pudimos cancelar la tarea.",
									},
								)
							}
						/>
					) : null}
				</div>
			) : null}
		</li>
	);
}

export function TasksTab({ profile }: { profile: PatientProfile }) {
	const { patient, tasks, today, timezone } = profile;
	const active = tasks.filter((task) => task.status === "assigned");
	const past = tasks.filter((task) => task.status !== "assigned");

	return (
		<div className="grid gap-4 xl:grid-cols-12">
			<Panel aria-labelledby="tasks-title" className="xl:col-span-7">
				<PanelHeading id="tasks-title" title="Tareas activas" />
				<div className="mt-4">
					{active.length === 0 ? (
						<EmptyState icon={ListChecks} title="Sin tareas activas">
							Asigna ejercicios entre sesiones: registros, respiración,
							exposición. Las respuestas del paciente aparecerán aquí.
						</EmptyState>
					) : (
						<ul className="flex flex-col gap-3">
							{active.map((task) => (
								<TaskCard
									key={task.id}
									task={task}
									patientId={patient.id}
									timezone={timezone}
								/>
							))}
						</ul>
					)}
				</div>

				{past.length > 0 ? (
					<>
						<h3 className="mt-8 font-semibold text-[16px]">Anteriores</h3>
						<ul className="mt-3 flex flex-col gap-3">
							{past.map((task) => (
								<TaskCard
									key={task.id}
									task={task}
									patientId={patient.id}
									timezone={timezone}
								/>
							))}
						</ul>
					</>
				) : null}
			</Panel>

			<Panel
				aria-labelledby="assign-title"
				className="xl:col-span-5 xl:self-start"
			>
				<PanelHeading id="assign-title" title="Nueva tarea" />
				<p className="mt-1 text-[15px] text-muted-foreground">
					Un ejercicio para {patient.preferredName || patient.firstName} entre
					sesiones.
				</p>
				<div className="mt-4">
					<TaskForm patientId={patient.id} today={today} />
				</div>
			</Panel>
		</div>
	);
}
