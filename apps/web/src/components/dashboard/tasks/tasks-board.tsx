"use client";

import { cn } from "@helsa/ui/lib/utils";
import {
	ArrowLeft,
	Copy,
	ListChecks,
	MessageSquareText,
	Pencil,
	Plus,
	Search,
	UserPlus,
} from "lucide-react";
import { m } from "motion/react";
import Link from "next/link";
import { useCallback, useDeferredValue, useRef, useState } from "react";

import type {
	BoardTask,
	TasksBoard,
} from "@/lib/core/task/use-cases/load-tasks-board";

import {
	EmptyState,
	formatDate,
	formatDay,
	normalize,
} from "../patients/parts";
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
	AdherenceMeter,
	adherenceText,
	EntryList,
	MoodTrail,
	TaskActions,
	TaskForm,
	TaskStatusPill,
	taskSchedule,
	toTaskInput,
} from "./task-parts";

export type TasksView =
	| { kind: "idle" }
	| { kind: "read"; id: string }
	| { kind: "edit"; id: string }
	| { kind: "new"; patientId?: string; fromTaskId?: string };

export type TaskFilter = "active" | "review" | "overdue" | "finished" | "all";

const PAGE_SIZE = 40;
const INBOX_SIZE = 12;

/** Keeps the open task in the URL so a refresh or a shared link lands in the same place. */
function syncUrl(view: TasksView, patientFilter: string) {
	const url = new URL(window.location.href);
	for (const key of ["task", "new", "from", "patient"]) {
		url.searchParams.delete(key);
	}
	if (patientFilter) url.searchParams.set("patient", patientFilter);
	if (view.kind === "read" || view.kind === "edit") {
		url.searchParams.set("task", view.id);
	}
	if (view.kind === "new") {
		url.searchParams.set("new", view.patientId ?? "1");
		if (view.fromTaskId) url.searchParams.set("from", view.fromTaskId);
	}
	window.history.replaceState(null, "", url);
}

function matches(task: BoardTask, filter: TaskFilter) {
	switch (filter) {
		case "active":
			return task.status === "assigned";
		case "review":
			return task.unseen > 0;
		case "overdue":
			return task.overdue;
		case "finished":
			return task.status !== "assigned";
		default:
			return true;
	}
}

export function TasksBoardView({
	board,
	initialView,
	initialPatient,
}: {
	board: TasksBoard;
	initialView: TasksView;
	initialPatient: string;
}) {
	const { tasks, patients, today, timezone } = board;
	const [view, setView] = useState<TasksView>(initialView);
	const [dirty, setDirty] = useState(false);
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState<TaskFilter>("active");
	const [patientFilter, setPatientFilter] = useState(initialPatient);
	const [shown, setShown] = useState(PAGE_SIZE);
	const deferred = useDeferredValue(query);
	const detailRef = useRef<HTMLDivElement>(null);

	const go = useCallback(
		(next: TasksView, options: { force?: boolean } = {}) => {
			const writing = view.kind === "new" || view.kind === "edit";
			if (writing && !options.force && !confirmDiscard(dirty)) return;
			setDirty(false);
			setView(next);
			syncUrl(next, patientFilter);
			// Below xl the list and the task take turns; bring the task into view.
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

	const scoped = patientFilter
		? tasks.filter((task) => task.patientId === patientFilter)
		: tasks;
	const count = (kind: TaskFilter) =>
		scoped.filter((task) => matches(task, kind)).length;
	const activeCount = tasks.filter((task) => task.status === "assigned").length;
	const unseenTotal = tasks.reduce((sum, task) => sum + task.unseen, 0);
	const overdueCount = tasks.filter((task) => task.overdue).length;

	const needle = normalize(deferred.trim());
	const visible = scoped
		.filter((task) => matches(task, filter))
		.filter(
			(task) =>
				!needle ||
				normalize(
					[task.patientName, task.title, task.instructions]
						.filter(Boolean)
						.join(" "),
				).includes(needle),
		);
	if (filter === "review") {
		visible.sort((a, b) =>
			(b.lastEntryDate ?? "").localeCompare(a.lastEntryDate ?? ""),
		);
	}

	const inbox = tasks
		.filter((task) => task.unseen > 0)
		.sort((a, b) =>
			(b.lastEntryDate ?? "").localeCompare(a.lastEntryDate ?? ""),
		)
		.slice(0, INBOX_SIZE);

	const tasksByPatient = new Map<string, number>();
	for (const task of tasks) {
		tasksByPatient.set(
			task.patientId,
			(tasksByPatient.get(task.patientId) ?? 0) + 1,
		);
	}
	const patientOptions: Array<readonly [string, string]> = [
		["", "Todos los pacientes"],
		...patients
			.filter(
				(patient) =>
					tasksByPatient.has(patient.id) || patient.id === patientFilter,
			)
			.map(
				(patient) =>
					[
						patient.id,
						`${patient.name} · ${tasksByPatient.get(patient.id) ?? 0}`,
					] as const,
			),
	];

	const filterOptions: Array<readonly [TaskFilter, string]> = [
		["active", `Activas · ${count("active")}`],
		["review", `Por revisar · ${count("review")}`],
		...(count("overdue")
			? ([["overdue", `Vencidas · ${count("overdue")}`]] as const)
			: []),
		["finished", `Terminadas · ${count("finished")}`],
		["all", `Todas · ${scoped.length}`],
	];

	const selected =
		view.kind === "read" || view.kind === "edit"
			? tasks.find((task) => task.id === view.id)
			: undefined;
	const source =
		view.kind === "new" && view.fromTaskId
			? tasks.find((task) => task.id === view.fromTaskId)
			: undefined;
	const detailOpen = view.kind !== "idle";

	function changePatientFilter(next: string) {
		setPatientFilter(next);
		setShown(PAGE_SIZE);
		syncUrl(view, next);
	}

	const summary =
		tasks.length === 0
			? "Aún no has asignado tareas."
			: [
					`${activeCount} ${activeCount === 1 ? "tarea activa" : "tareas activas"}`,
					unseenTotal
						? `${unseenTotal} ${unseenTotal === 1 ? "respuesta" : "respuestas"} por revisar`
						: "todo revisado",
					overdueCount
						? `${overdueCount} ${overdueCount === 1 ? "vencida" : "vencidas"}`
						: null,
				]
					.filter(Boolean)
					.join(" · ");

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
						Tareas
					</h1>
					<p className="mt-3 text-[17px] leading-relaxed">{summary}.</p>
				</div>
				<ActionButton
					onClick={() =>
						go({ kind: "new", patientId: patientFilter || undefined })
					}
					className="self-start lg:self-auto"
				>
					<Plus aria-hidden="true" className="size-4" />
					Asignar tarea
				</ActionButton>
			</m.header>

			{inbox.length > 0 ? (
				<ReviewInbox
					tasks={inbox}
					total={tasks.filter((task) => task.unseen > 0).length}
					selectedId={selected?.id}
					onOpen={(id) => go({ kind: "read", id })}
					onSeeAll={() => {
						setFilter("review");
						changePatientFilter("");
					}}
				/>
			) : null}

			<div className="mt-4 grid gap-4 xl:grid-cols-12">
				<Panel
					aria-label="Lista de tareas"
					className={cn(
						"xl:col-span-5 xl:self-start",
						detailOpen && "hidden xl:block",
					)}
				>
					{tasks.length === 0 ? (
						<EmptyState icon={ListChecks} title="Asigna tu primera tarea">
							Ejercicios entre sesiones: registros, respiración, exposición. El
							paciente las responde desde su portal y aquí ves sus respuestas,
							su ánimo y cuánto las cumple.
						</EmptyState>
					) : (
						<>
							<div className="flex flex-col gap-3">
								<search className="relative w-full">
									<label htmlFor="task-search" className="sr-only">
										Buscar tareas
									</label>
									<Search
										aria-hidden="true"
										className="pointer-events-none absolute top-1/2 left-4 size-[1.1rem] -translate-y-1/2 text-muted-foreground"
									/>
									<input
										id="task-search"
										type="search"
										value={query}
										onChange={(event) => {
											setQuery(event.target.value);
											setShown(PAGE_SIZE);
										}}
										placeholder="Paciente o tarea"
										className="h-12 w-full rounded-full bg-dash-ground pr-4 pl-11 text-[15px] outline-none transition-[box-shadow] placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
									/>
								</search>
								<label htmlFor="task-patient-filter" className="sr-only">
									Filtrar por paciente
								</label>
								<SelectInput
									id="task-patient-filter"
									value={patientFilter}
									onValueChange={changePatientFilter}
									options={patientOptions}
								/>
								<Segmented
									label="Filtrar por estado"
									options={filterOptions}
									value={filter}
									onChange={(next) => {
										setFilter(next);
										setShown(PAGE_SIZE);
									}}
								/>
							</div>

							{visible.length === 0 ? (
								<p className="mt-4 rounded-2xl bg-dash-ground px-5 py-8 text-[16px]">
									{filter === "review" && !needle
										? "No hay respuestas por revisar."
										: "Ninguna tarea coincide con los filtros."}
								</p>
							) : (
								<TaskList
									tasks={visible.slice(0, shown)}
									selectedId={selected?.id}
									onSelect={(id) => go({ kind: "read", id })}
								/>
							)}
							{visible.length > shown ? (
								<ActionButton
									variant="quiet"
									size="small"
									className="mt-3"
									onClick={() => setShown((value) => value + PAGE_SIZE)}
								>
									Ver {Math.min(PAGE_SIZE, visible.length - shown)} más
								</ActionButton>
							) : null}
						</>
					)}
				</Panel>

				<Panel
					aria-label="Tarea"
					className={cn(
						"xl:sticky xl:top-6 xl:col-span-7 xl:self-start",
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
								hasTasks={tasks.length > 0}
								onNew={() => go({ kind: "new" })}
							/>
						) : view.kind === "new" ? (
							<>
								<PanelHeading
									id="assign-title"
									title={source ? "Reutilizar tarea" : "Nueva tarea"}
								/>
								<p className="mt-1 text-[15px] text-muted-foreground">
									{source
										? "Asígnala de nuevo o a otro paciente. Empieza hoy."
										: "Un ejercicio para trabajar entre sesiones."}
								</p>
								<div className="mt-4">
									{patients.length === 0 ? (
										<EmptyState
											icon={UserPlus}
											title="Primero registra un paciente"
										>
											Cada tarea se asigna a un paciente.{" "}
											<Link
												href="/dashboard/patients/new"
												className="font-semibold text-dash-link underline-offset-4 hover:underline"
											>
												Registrar paciente
											</Link>
										</EmptyState>
									) : (
										<TaskForm
											key={`${view.patientId ?? ""}-${view.fromTaskId ?? ""}`}
											idPrefix="board-task"
											today={today}
											patients={patients.map((patient) => ({
												id: patient.id,
												name:
													patient.status === "active"
														? patient.name
														: `${patient.name} (${patientStatusLabels[patient.status].toLowerCase()})`,
											}))}
											patientId={view.patientId}
											initial={
												source
													? {
															...toTaskInput(source),
															startsOn: today,
															dueOn: "",
														}
													: undefined
											}
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
								Abriendo la tarea…
							</p>
						) : view.kind === "edit" ? (
							<>
								<TaskHeader task={selected} />
								<div className="mt-5">
									<TaskForm
										key={selected.id}
										idPrefix={`board-${selected.id}`}
										today={today}
										taskId={selected.id}
										patientId={selected.patientId}
										initial={toTaskInput(selected)}
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
							<TaskDetail
								task={selected}
								timezone={timezone}
								onEdit={() => go({ kind: "edit", id: selected.id })}
								onReuse={() =>
									go({
										kind: "new",
										patientId: selected.patientId,
										fromTaskId: selected.id,
									})
								}
							/>
						)}
					</div>
				</Panel>
			</div>
		</m.div>
	);
}

function ReviewInbox({
	tasks,
	total,
	selectedId,
	onOpen,
	onSeeAll,
}: {
	tasks: BoardTask[];
	total: number;
	selectedId?: string;
	onOpen: (id: string) => void;
	onSeeAll: () => void;
}) {
	return (
		<Panel aria-labelledby="inbox-title">
			<PanelHeading id="inbox-title" title="Respuestas por revisar">
				{total > tasks.length ? (
					<button
						type="button"
						onClick={onSeeAll}
						className="inline-flex h-9 items-center rounded-full px-3 font-semibold text-[14px] text-dash-link outline-none transition-colors hover:bg-chapter-lilac focus-visible:ring-2 focus-visible:ring-ring"
					>
						Ver las {total}
					</button>
				) : (
					<p className="text-[15px] text-muted-foreground">
						{total} {total === 1 ? "tarea" : "tareas"} con respuestas nuevas
					</p>
				)}
			</PanelHeading>
			<ul className="mt-4 flex snap-x gap-3 overflow-x-auto pb-1">
				{tasks.map((task) => {
					const latest = task.entries.find((entry) => !entry.seen);
					const on = task.id === selectedId;
					return (
						<li key={task.id} className="w-[18rem] shrink-0 snap-start">
							<button
								type="button"
								onClick={() => onOpen(task.id)}
								aria-current={on || undefined}
								className={cn(
									"flex h-full w-full flex-col gap-3 rounded-[1.5rem] p-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
									on
										? "bg-chapter-lilac"
										: "bg-dash-ground hover:bg-chapter-lilac/60",
								)}
							>
								<span className="flex min-w-0 items-center gap-3">
									<PatientAvatar name={task.patientName} />
									<span className="min-w-0">
										<span className="block truncate font-semibold text-[15px]">
											{task.patientName}
										</span>
										<span className="block truncate text-[14px] text-muted-foreground">
											{task.title}
										</span>
									</span>
								</span>
								{latest ? (
									<span className="line-clamp-2 text-[14px] leading-snug">
										{latest.locked
											? "No se pudo descifrar."
											: latest.content?.replace(/\s+/g, " ").trim() ||
												(latest.moodScore !== null
													? `Ánimo ${latest.moodScore} de 10`
													: "Registro sin texto")}
									</span>
								) : null}
								<span className="mt-auto flex items-center gap-2 text-[13px]">
									<span className="rounded-full bg-card px-2 font-semibold leading-6">
										{task.unseen} {task.unseen === 1 ? "nueva" : "nuevas"}
									</span>
									{task.lastEntryDate ? (
										<span className="text-muted-foreground">
											última {formatDay(task.lastEntryDate)}
										</span>
									) : null}
								</span>
							</button>
						</li>
					);
				})}
			</ul>
		</Panel>
	);
}

function TaskList({
	tasks,
	selectedId,
	onSelect,
}: {
	tasks: BoardTask[];
	selectedId?: string;
	onSelect: (id: string) => void;
}) {
	return (
		<ul className="mt-4 flex flex-col gap-1" aria-live="polite">
			{tasks.map((task) => {
				const on = task.id === selectedId;
				return (
					<li key={task.id}>
						<button
							type="button"
							onClick={() => onSelect(task.id)}
							aria-current={on || undefined}
							className={cn(
								"grid w-full grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-2xl px-3 py-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
								on ? "bg-chapter-lilac/70" : "hover:bg-dash-ground",
								task.status !== "assigned" && !on && "opacity-75",
							)}
						>
							<PatientAvatar name={task.patientName} />
							<span className="min-w-0">
								<span className="flex items-baseline justify-between gap-3">
									<span className="truncate font-semibold text-[15px]">
										{task.patientName}
									</span>
									{task.unseen ? (
										<span className="shrink-0 rounded-full bg-chapter-peach px-2 font-semibold text-[12px] leading-5">
											{task.unseen} {task.unseen === 1 ? "nueva" : "nuevas"}
										</span>
									) : null}
								</span>
								<span className="block truncate text-[14px]">{task.title}</span>
								<span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[13px] text-muted-foreground">
									<TaskStatusPill
										task={task}
										className="h-5 px-2 text-[12px]"
									/>
									<span>{adherenceText(task.frequency, task.adherence)}</span>
									{task.lastEntryDate ? (
										<span>· última {formatDay(task.lastEntryDate)}</span>
									) : null}
								</span>
							</span>
						</button>
					</li>
				);
			})}
		</ul>
	);
}

function IdleDetail({
	hasTasks,
	onNew,
}: {
	hasTasks: boolean;
	onNew: () => void;
}) {
	return (
		<div className="flex min-h-80 flex-col items-start justify-center gap-4 px-2 py-8">
			<ListChecks
				aria-hidden="true"
				className="size-7 text-chapter-violet dark:text-primary"
			/>
			<p className="font-display font-medium text-[1.5rem] leading-tight">
				{hasTasks ? "Elige una tarea para revisarla" : "Aquí verás las tareas"}
			</p>
			<p className="max-w-[48ch] text-[15px] text-foreground/80 leading-relaxed">
				En cada tarea ves las respuestas del paciente, su ánimo y cuánto la
				cumple. Puedes editarla mientras esté activa, completarla o cancelarla.
			</p>
			<ActionButton variant="quiet" onClick={onNew}>
				<Plus aria-hidden="true" className="size-4" />
				Asignar tarea
			</ActionButton>
		</div>
	);
}

function TaskHeader({ task }: { task: BoardTask }) {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<Link
					href={`/dashboard/patients/${task.patientId}?tab=tareas`}
					className="group -m-1 flex min-w-0 items-center gap-3 rounded-full p-1 pr-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					<PatientAvatar name={task.patientName} />
					<span className="min-w-0">
						<span className="block truncate font-semibold text-[15px] group-hover:underline group-hover:underline-offset-4">
							{task.patientName}
						</span>
						<span className="block text-[13px] text-muted-foreground">
							Ver ficha del paciente
						</span>
					</span>
				</Link>
				<TaskStatusPill task={task} />
			</div>
			<div>
				<h2 className="font-display font-medium text-[clamp(1.5rem,2.4vw,2rem)] leading-tight tracking-[-0.02em]">
					{task.title}
				</h2>
				<p className="mt-1.5 text-[14px] text-muted-foreground">
					{taskSchedule(task)}
				</p>
			</div>
		</div>
	);
}

function TaskDetail({
	task,
	timezone,
	onEdit,
	onReuse,
}: {
	task: BoardTask;
	timezone: string;
	onEdit: () => void;
	onReuse: () => void;
}) {
	const active = task.status === "assigned";
	const closedOn =
		task.endedAt && !active ? formatDate(task.endedAt, timezone) : null;

	return (
		<article aria-label={task.title}>
			<TaskHeader task={task} />

			{task.instructions ? (
				<p className="mt-4 max-w-[72ch] whitespace-pre-wrap text-[16px] leading-relaxed">
					{task.instructions}
				</p>
			) : null}

			<dl className="mt-5 grid gap-4 rounded-[1.5rem] bg-dash-ground/60 p-4 sm:grid-cols-3">
				<div>
					<dt className="text-[13px] text-muted-foreground">Cumplimiento</dt>
					<dd className="mt-1">
						<AdherenceMeter
							frequency={task.frequency}
							adherence={task.adherence}
						/>
					</dd>
				</div>
				<div>
					<dt className="text-[13px] text-muted-foreground">
						Última respuesta
					</dt>
					<dd className="mt-1 text-[15px]">
						{task.lastEntryDate ? formatDay(task.lastEntryDate) : "Ninguna"}
					</dd>
				</div>
				<div>
					<dt className="text-[13px] text-muted-foreground">
						{closedOn
							? task.status === "completed"
								? "Completada"
								: "Cancelada"
							: "Asignada"}
					</dt>
					<dd className="mt-1 text-[15px]">
						{closedOn ?? formatDate(task.createdAt, timezone)}
					</dd>
				</div>
			</dl>

			<div className="mt-4">
				<MoodTrail entries={task.entries} />
			</div>

			<div className="mt-6 flex flex-wrap gap-2">
				<TaskActions patientId={task.patientId} task={task} />
				{active ? (
					<ActionButton size="small" variant="quiet" onClick={onEdit}>
						<Pencil aria-hidden="true" className="size-4" />
						Editar
					</ActionButton>
				) : null}
				<ActionButton size="small" variant="quiet" onClick={onReuse}>
					<Copy aria-hidden="true" className="size-4" />
					Reutilizar
				</ActionButton>
			</div>

			<section aria-labelledby="entries-title" className="mt-8">
				<h3
					id="entries-title"
					className="flex items-center gap-2 font-semibold text-[16px]"
				>
					<MessageSquareText aria-hidden="true" className="size-4" />
					Respuestas
					<span className="font-normal text-muted-foreground">
						{task.entries.length}
					</span>
				</h3>
				<div className="mt-3">
					{task.entries.length === 0 ? (
						<p className="rounded-2xl bg-dash-ground px-5 py-6 text-[15px] text-muted-foreground">
							{active
								? `${task.patientShortName} aún no ha respondido.`
								: "No hubo respuestas."}
						</p>
					) : (
						<EntryList entries={task.entries} />
					)}
				</div>
			</section>
		</article>
	);
}
