"use client";

import { cn } from "@helsa/ui/lib/utils";
import { ListChecks, Pencil } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { PatientProfile } from "@/lib/core/patient/use-cases/load-patient-profile";

import { ActionButton } from "../profile/parts";
import {
	AdherenceMeter,
	EntryList,
	MoodTrail,
	TaskActions,
	TaskForm,
	TaskStatusPill,
	taskSchedule,
	toTaskInput,
} from "../tasks/task-parts";
import { Panel, PanelHeading } from "../therapist/parts";
import { EmptyState, formatDate } from "./parts";

type Task = PatientProfile["tasks"][number];

function TaskCard({
	task,
	patientId,
	timezone,
	today,
}: {
	task: Task;
	patientId: string;
	timezone: string;
	today: string;
}) {
	const [editing, setEditing] = useState(false);
	const [showEntries, setShowEntries] = useState(false);
	const active = task.status === "assigned";

	if (editing) {
		return (
			<li className="rounded-[1.5rem] bg-dash-ground/60 p-4 sm:p-5">
				<TaskForm
					idPrefix={`task-${task.id}`}
					today={today}
					taskId={task.id}
					patientId={patientId}
					initial={toTaskInput(task)}
					onSaved={() => setEditing(false)}
					onCancel={() => setEditing(false)}
				/>
			</li>
		);
	}

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
						{taskSchedule(task)} · asignada el{" "}
						{formatDate(task.createdAt, timezone)}
					</p>
				</div>
				<TaskStatusPill task={task} />
			</div>

			{task.instructions ? (
				<p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed">
					{task.instructions}
				</p>
			) : null}

			<div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-3">
				<AdherenceMeter frequency={task.frequency} adherence={task.adherence} />
				<MoodTrail entries={task.entries} />
			</div>

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
						{task.unseen ? (
							<span className="rounded-full bg-chapter-peach px-2 py-0.5 text-[12px] text-foreground">
								{task.unseen} {task.unseen === 1 ? "nueva" : "nuevas"}
							</span>
						) : null}
					</button>
					{showEntries ? (
						<div className="mt-2">
							<EntryList entries={task.entries} />
						</div>
					) : null}
				</div>
			) : active ? (
				<p className="mt-3 text-[14px] text-muted-foreground">
					Aún no hay respuestas.
				</p>
			) : null}

			{active || task.unseen ? (
				<div className="mt-4 flex flex-wrap gap-2">
					<TaskActions patientId={patientId} task={task} />
					{active ? (
						<ActionButton
							size="small"
							variant="quiet"
							onClick={() => setEditing(true)}
						>
							<Pencil aria-hidden="true" className="size-4" />
							Editar
						</ActionButton>
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
	const card = (task: Task) => (
		<TaskCard
			key={task.id}
			task={task}
			patientId={patient.id}
			timezone={timezone}
			today={today}
		/>
	);

	return (
		<div className="grid gap-4 xl:grid-cols-12">
			<Panel aria-labelledby="tasks-title" className="xl:col-span-7">
				<PanelHeading id="tasks-title" title="Tareas activas">
					{tasks.length > 0 ? (
						<Link
							href={`/dashboard/tasks?patient=${patient.id}`}
							className="inline-flex h-9 items-center rounded-full px-3 font-semibold text-[14px] text-dash-link outline-none transition-colors hover:bg-chapter-lilac focus-visible:ring-2 focus-visible:ring-ring"
						>
							Ver en Tareas
						</Link>
					) : null}
				</PanelHeading>
				<div className="mt-4">
					{active.length === 0 ? (
						<EmptyState icon={ListChecks} title="Sin tareas activas">
							Asigna ejercicios entre sesiones: registros, respiración,
							exposición. Las respuestas del paciente aparecerán aquí.
						</EmptyState>
					) : (
						<ul className="flex flex-col gap-3">{active.map(card)}</ul>
					)}
				</div>

				{past.length > 0 ? (
					<>
						<h3 className="mt-8 font-semibold text-[16px]">Anteriores</h3>
						<ul className="mt-3 flex flex-col gap-3">{past.map(card)}</ul>
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
					<TaskForm idPrefix="task-new" today={today} patientId={patient.id} />
				</div>
			</Panel>
		</div>
	);
}
