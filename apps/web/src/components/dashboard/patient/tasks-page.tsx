"use client";

import { cn } from "@helsa/ui/lib/utils";
import { Check, CheckCheck, ListChecks, Lock, PenLine } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useId, useState } from "react";

import { useAnswerTask } from "@/lib/api/mutations";
import type {
	PatientTasks,
	PortalTask,
} from "@/lib/core/task/use-cases/load-patient-tasks";

import { EmptyState, formatDay, useRefreshingAction } from "../patients/parts";
import { taskFrequencyLabels } from "../patients/schema";
import { ActionButton } from "../profile/parts";
import { relativeDay } from "../schedule/format";
import { Field, FieldError, TextArea } from "../settings/fields";
import { EASE_OUT, Panel, PanelHeading, stagger } from "../therapist/parts";
import { Badge, PageHeader, taskBadges } from "./parts";
import { ENTRY_MAX, MOOD_MAX, MOOD_MIN, taskEntrySchema } from "./schema";

const ENTRIES_SHOWN = 3;

const periodWords = {
	once: ["vez", "veces"],
	daily: ["día", "días"],
	weekly: ["semana", "semanas"],
} as const;

function adherenceText(task: PortalTask) {
	const { done, expected } = task.adherence;
	if (expected === 0) return null;
	if (task.frequency === "once") return done ? "Respondida" : "Sin responder";
	const [one, many] = periodWords[task.frequency];
	return `Respondiste ${done} de ${expected} ${expected === 1 ? one : many}`;
}

function taskDetail(task: PortalTask, today: string) {
	if (task.state === "not_started")
		return `Empieza el ${formatDay(task.startsOn)}`;
	const parts: string[] = [taskFrequencyLabels[task.frequency]];
	if (task.dueOn) {
		parts.push(
			task.dueOn < today
				? `venció el ${formatDay(task.dueOn)}`
				: task.dueOn === today
					? "vence hoy"
					: `hasta el ${formatDay(task.dueOn)}`,
		);
	}
	return parts.join(" · ");
}

export function PatientTasksPage({ data }: { data: PatientTasks }) {
	const active = data.tasks.filter((task) => task.state !== "closed");
	const closed = data.tasks.filter((task) => task.state === "closed");
	const toDo = active.filter(
		(task) => task.state === "to_answer" || task.state === "overdue",
	).length;

	return (
		<m.div
			initial="hidden"
			animate="show"
			variants={stagger(0.08)}
			className="mx-auto max-w-[72rem]"
		>
			<PageHeader
				title="Mis tareas"
				description={
					toDo === 0
						? "Estás al día. Tus respuestas solo las ve tu terapeuta."
						: `Tienes ${toDo === 1 ? "1 tarea" : `${toDo} tareas`} por responder. Tus respuestas solo las ve tu terapeuta.`
				}
			/>

			<div className="grid gap-4">
				{active.length === 0 ? (
					<Panel aria-label="Tareas">
						<EmptyState icon={ListChecks} title="No tienes tareas activas">
							Cuando tu terapeuta te asigne una tarea, la verás aquí y podrás
							responderla.
						</EmptyState>
					</Panel>
				) : (
					active.map((task) => (
						<TaskCard key={task.id} task={task} today={data.today} />
					))
				)}

				{closed.length > 0 ? (
					<ClosedTasks tasks={closed} today={data.today} />
				) : null}
			</div>
		</m.div>
	);
}

function TaskCard({ task, today }: { task: PortalTask; today: string }) {
	const canAnswer = task.state !== "not_started";
	const [open, setOpen] = useState(
		task.state === "to_answer" || task.state === "overdue",
	);
	const badge = taskBadges[task.state];
	const titleId = `task-${task.id}`;
	const progress = adherenceText(task);

	return (
		<Panel aria-labelledby={titleId}>
			<PanelHeading id={titleId} title={task.title}>
				<Badge className={badge.className}>
					{task.state === "answered" ? (
						<Check aria-hidden="true" className="size-3.5" />
					) : null}
					{badge.label}
				</Badge>
			</PanelHeading>
			<p className="mt-1 text-[14px] text-muted-foreground">
				{taskDetail(task, today)}
				{progress ? ` · ${progress}` : ""}
			</p>

			{task.instructions ? (
				<p className="mt-4 max-w-[70ch] whitespace-pre-line text-[16px] leading-relaxed">
					{task.instructions}
				</p>
			) : null}

			{canAnswer ? (
				<div className="mt-5">
					<AnimatePresence initial={false} mode="wait">
						{open ? (
							<m.div
								key="form"
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -4 }}
								transition={{ duration: 0.3, ease: EASE_OUT }}
							>
								<AnswerForm task={task} onDone={() => setOpen(false)} />
							</m.div>
						) : (
							<m.div
								key="button"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
							>
								<ActionButton
									variant={task.answeredToday ? "quiet" : "primary"}
									onClick={() => setOpen(true)}
								>
									<PenLine aria-hidden="true" className="size-4" />
									{task.answeredToday ? "Agregar otra respuesta" : "Responder"}
								</ActionButton>
							</m.div>
						)}
					</AnimatePresence>
				</div>
			) : null}

			<EntryList entries={task.entries} today={today} />
		</Panel>
	);
}

function MoodPicker({
	value,
	onChange,
	labelledBy,
	invalid,
}: {
	value: number | null;
	onChange: (value: number) => void;
	labelledBy: string;
	invalid?: boolean;
}) {
	const scores = Array.from(
		{ length: MOOD_MAX - MOOD_MIN + 1 },
		(_, index) => MOOD_MIN + index,
	);
	return (
		<div
			role="radiogroup"
			aria-labelledby={labelledBy}
			aria-invalid={invalid || undefined}
			className="flex flex-wrap gap-1.5 px-1"
		>
			{scores.map((score) => {
				const on = value === score;
				return (
					// biome-ignore lint/a11y/useSemanticElements: styled pills; native radios can't take this shape.
					<button
						key={score}
						type="button"
						role="radio"
						aria-checked={on}
						onClick={() => onChange(score)}
						className={cn(
							"inline-flex size-11 items-center justify-center rounded-full font-semibold text-[15px] tabular-nums outline-none transition-[background-color,color,transform] duration-150 focus-visible:ring-2 focus-visible:ring-ring active:scale-95",
							on
								? "bg-chapter-violet text-white"
								: "bg-dash-ground hover:bg-chapter-lilac",
						)}
					>
						{score}
					</button>
				);
			})}
		</div>
	);
}

function AnswerForm({
	task,
	onDone,
}: {
	task: PortalTask;
	onDone: () => void;
}) {
	const id = useId();
	const answer = useAnswerTask();
	const run = useRefreshingAction();
	const [mood, setMood] = useState<number | null>(null);
	const [content, setContent] = useState("");
	const [errors, setErrors] = useState<{ mood?: string; content?: string }>({});

	async function submit(event: React.FormEvent) {
		event.preventDefault();
		const parsed = taskEntrySchema.safeParse({ mood, content });
		const next: typeof errors = {};
		if (task.asksMood && mood === null) {
			next.mood = "Marca cómo te sientes del 1 al 10.";
		}
		if (!parsed.success) {
			for (const issue of parsed.error.issues) {
				const key = issue.path[0] as keyof typeof errors;
				if (key === "content" && next.mood) continue;
				next[key] ??= issue.message;
			}
		}
		setErrors(next);
		if (Object.keys(next).length > 0 || !parsed.success) return;

		const saved = await run(
			() =>
				answer.mutateAsync({
					taskId: task.id,
					mood: task.asksMood ? mood : null,
					content,
				}),
			{
				success: "Respuesta enviada a tu terapeuta.",
				error: "No pudimos enviar tu respuesta.",
			},
		);
		if (saved) {
			setMood(null);
			setContent("");
			onDone();
		}
	}

	return (
		<form
			onSubmit={submit}
			className="space-y-5 rounded-[1.5rem] bg-dash-ground/60 p-4 sm:p-5"
		>
			{task.asksMood ? (
				<div className="space-y-2">
					<p id={`${id}-mood`} className="px-5 font-medium text-[15px]">
						¿Cómo te sientes hoy?{" "}
						<span className="font-normal text-muted-foreground">
							1 es muy mal, 10 es muy bien
						</span>
					</p>
					<MoodPicker
						value={mood}
						onChange={(value) => {
							setMood(value);
							setErrors((current) => ({ ...current, mood: undefined }));
						}}
						labelledBy={`${id}-mood`}
						invalid={Boolean(errors.mood)}
					/>
					<FieldError message={errors.mood} />
				</div>
			) : null}

			<Field
				id={`${id}-content`}
				label={
					task.asksMood
						? "¿Algo que quieras contar? (opcional)"
						: "Tu respuesta"
				}
				error={errors.content}
			>
				<TextArea
					id={`${id}-content`}
					value={content}
					onValueChange={(value) => {
						setContent(value);
						setErrors((current) => ({ ...current, content: undefined }));
					}}
					maxLength={ENTRY_MAX}
					invalid={Boolean(errors.content)}
					className="bg-card dark:bg-card"
					placeholder="Escribe con tus palabras. No hay respuestas correctas."
				/>
			</Field>

			<div className="flex flex-wrap gap-2">
				<ActionButton
					type="submit"
					pending={answer.isPending}
					pendingLabel="Enviando…"
				>
					Enviar respuesta
				</ActionButton>
				<ActionButton variant="quiet" onClick={onDone}>
					Cancelar
				</ActionButton>
			</div>
		</form>
	);
}

function EntryList({
	entries,
	today,
}: {
	entries: PortalTask["entries"];
	today: string;
}) {
	const [all, setAll] = useState(false);
	if (entries.length === 0) return null;
	const shown = all ? entries : entries.slice(0, ENTRIES_SHOWN);

	return (
		<div className="mt-6">
			<h3 className="font-semibold text-[15px]">Tus respuestas</h3>
			<ul className="mt-2 divide-y divide-border">
				{shown.map((entry) => (
					<li key={entry.id} className="py-3">
						<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px]">
							<span className="font-semibold">
								{relativeDay(entry.entryDate, today)}
							</span>
							{entry.moodScore !== null ? (
								<span className="text-muted-foreground">
									Ánimo {entry.moodScore} de 10
								</span>
							) : null}
							{entry.seen ? (
								<span className="inline-flex items-center gap-1 text-muted-foreground">
									<CheckCheck aria-hidden="true" className="size-3.5" />
									Leída por tu terapeuta
								</span>
							) : null}
						</div>
						{entry.locked ? (
							<p className="mt-1 inline-flex items-center gap-1.5 text-[14px] text-muted-foreground">
								<Lock aria-hidden="true" className="size-3.5" />
								No pudimos mostrar este texto.
							</p>
						) : entry.content ? (
							<p className="mt-1 line-clamp-4 whitespace-pre-line text-[15px] leading-relaxed">
								{entry.content}
							</p>
						) : null}
					</li>
				))}
			</ul>
			{entries.length > ENTRIES_SHOWN ? (
				<button
					type="button"
					onClick={() => setAll((value) => !value)}
					className="mt-1 inline-flex h-9 items-center rounded-full px-3 font-semibold text-[14px] text-dash-link outline-none transition-colors hover:bg-chapter-lilac focus-visible:ring-2 focus-visible:ring-ring"
				>
					{all ? "Ver menos" : `Ver las ${entries.length} respuestas`}
				</button>
			) : null}
		</div>
	);
}

function ClosedTasks({ tasks, today }: { tasks: PortalTask[]; today: string }) {
	const [open, setOpen] = useState(false);
	return (
		<Panel aria-labelledby="closed-title">
			<PanelHeading id="closed-title" title="Tareas terminadas">
				<button
					type="button"
					aria-expanded={open}
					onClick={() => setOpen((value) => !value)}
					className="inline-flex h-9 items-center rounded-full px-3 font-semibold text-[14px] text-dash-link outline-none transition-colors hover:bg-chapter-lilac focus-visible:ring-2 focus-visible:ring-ring"
				>
					{open ? "Ocultar" : `Mostrar ${tasks.length}`}
				</button>
			</PanelHeading>
			{open ? (
				<ul className="mt-4 flex flex-col gap-2">
					{tasks.map((task) => (
						<li key={task.id} className="rounded-2xl bg-dash-ground p-4">
							<p className="font-semibold text-[15px]">{task.title}</p>
							<p className="mt-0.5 text-[14px] text-muted-foreground">
								{task.status === "cancelled" ? "Cancelada" : "Completada"} ·{" "}
								{task.entries.length === 1
									? "1 respuesta"
									: `${task.entries.length} respuestas`}
								{task.entries[0]
									? ` · última ${relativeDay(task.entries[0].entryDate, today).toLowerCase()}`
									: ""}
							</p>
						</li>
					))}
				</ul>
			) : null}
		</Panel>
	);
}
