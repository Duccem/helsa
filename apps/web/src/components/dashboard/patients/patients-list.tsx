"use client";

import { cn } from "@helsa/ui/lib/utils";
import { ChevronRight, Search, UserPlus, Users } from "lucide-react";
import { m } from "motion/react";
import Link from "next/link";
import { useDeferredValue, useState } from "react";

import type { PatientList } from "@/lib/core/patient/use-cases/list-patients";

import { Segmented } from "../settings/fields";
import { itemIn, Panel, PatientAvatar, stagger } from "../therapist/parts";
import { EmptyState, formatDate, normalize, StatusBadge } from "./parts";
import { type PatientStatus, patientStatuses } from "./schema";

type Filter = "all" | PatientStatus;

const plural: Record<PatientStatus, string> = {
	active: "Activos",
	prospect: "Prospectos",
	inactive: "Inactivos",
	discharged: "De alta",
};

function tasksLabel(open: number, unseen: number) {
	if (unseen > 0)
		return unseen === 1 ? "1 respuesta nueva" : `${unseen} respuestas nuevas`;
	if (open === 0) return "Sin tareas";
	return open === 1 ? "1 tarea activa" : `${open} tareas activas`;
}

export function PatientsList({ data }: { data: PatientList }) {
	const { patients, timezone } = data;
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState<Filter>("all");
	const deferred = useDeferredValue(query);

	const counts = Object.fromEntries(
		patientStatuses.map((status) => [
			status,
			patients.filter((patient) => patient.status === status).length,
		]),
	) as Record<PatientStatus, number>;

	const needle = normalize(deferred.trim());
	const visible = patients.filter((patient) => {
		if (filter !== "all" && patient.status !== filter) return false;
		if (!needle) return true;
		return normalize(
			[
				patient.name,
				patient.preferredName,
				patient.email,
				patient.phone,
				patient.city,
			]
				.filter(Boolean)
				.join(" "),
		).includes(needle);
	});

	const options: Array<readonly [Filter, string]> = [
		["all", `Todos · ${patients.length}`],
		...patientStatuses
			.filter((status) => counts[status] > 0)
			.map(
				(status) => [status, `${plural[status]} · ${counts[status]}`] as const,
			),
	];

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
						Pacientes
					</h1>
					<p className="mt-3 text-[17px] leading-relaxed">
						{patients.length === 0
							? "Aún no tienes pacientes registrados."
							: `${counts.active} ${counts.active === 1 ? "paciente activo" : "pacientes activos"}${counts.prospect ? ` y ${counts.prospect} por empezar` : ""}.`}
					</p>
				</div>
				<Link
					href="/dashboard/patients/new"
					className="inline-flex h-12 items-center gap-2 self-start rounded-full bg-chapter-violet px-6 font-semibold text-[15px] text-white outline-none transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-0 active:scale-[0.97] lg:self-auto"
				>
					<UserPlus aria-hidden="true" className="size-4" />
					Nuevo paciente
				</Link>
			</m.header>

			<Panel aria-label="Lista de pacientes">
				{patients.length === 0 ? (
					<EmptyState icon={Users} title="Registra tu primer paciente">
						Guarda sus datos de contacto y el motivo de consulta. Desde su ficha
						podrás escribir notas, asignar tareas y adjuntar archivos.
					</EmptyState>
				) : (
					<>
						<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
							<search className="relative w-full lg:max-w-sm">
								<label htmlFor="patient-search" className="sr-only">
									Buscar pacientes
								</label>
								<Search
									aria-hidden="true"
									className="pointer-events-none absolute top-1/2 left-4 size-[1.1rem] -translate-y-1/2 text-muted-foreground"
								/>
								<input
									id="patient-search"
									type="search"
									value={query}
									onChange={(event) => setQuery(event.target.value)}
									placeholder="Nombre, correo o teléfono"
									className="h-12 w-full rounded-full bg-dash-ground pr-4 pl-11 text-[15px] outline-none transition-[box-shadow] placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
								/>
							</search>
							<Segmented
								label="Filtrar por estado"
								options={options}
								value={filter}
								onChange={setFilter}
							/>
						</div>

						{visible.length === 0 ? (
							<p className="mt-4 rounded-2xl bg-dash-ground px-5 py-8 text-[16px]">
								Ningún paciente coincide con la búsqueda.
							</p>
						) : (
							<ul className="mt-4 flex flex-col gap-1" aria-live="polite">
								{visible.map((patient) => (
									<li key={patient.id}>
										<Link
											href={`/dashboard/patients/${patient.id}`}
											className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 rounded-2xl px-3 py-3 outline-none transition-colors hover:bg-dash-ground focus-visible:ring-2 focus-visible:ring-ring sm:px-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
										>
											<div className="flex min-w-0 items-center gap-3">
												<PatientAvatar name={patient.name} />
												<div className="min-w-0">
													<p className="truncate font-semibold text-[15px]">
														{patient.name}
														{patient.preferredName ? (
															<span className="font-normal text-muted-foreground">
																{" "}
																· {patient.preferredName}
															</span>
														) : null}
													</p>
													<p className="truncate text-[14px] text-muted-foreground">
														{[patient.phone, patient.email]
															.filter(Boolean)
															.join(" · ") || "Sin datos de contacto"}
													</p>
												</div>
											</div>
											<Meta
												label="Próxima cita"
												value={
													patient.nextAppointmentAt
														? formatDate(patient.nextAppointmentAt, timezone, {
																weekday: "short",
																day: "numeric",
																month: "short",
																hour: "numeric",
																minute: "2-digit",
															})
														: "Sin agendar"
												}
											/>
											<Meta
												label="Última sesión"
												value={
													patient.lastSessionAt
														? `${formatDate(patient.lastSessionAt, timezone)} · ${patient.sessions} en total`
														: "Ninguna aún"
												}
											/>
											<Meta
												label="Tareas"
												value={tasksLabel(
													patient.openTasks,
													patient.unseenEntries,
												)}
												highlight={patient.unseenEntries > 0}
											/>
											<div className="col-start-2 row-start-1 flex items-center gap-2 lg:col-start-auto lg:row-start-auto">
												<StatusBadge status={patient.status} />
												<ChevronRight
													aria-hidden="true"
													className="hidden size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 sm:block"
												/>
											</div>
										</Link>
									</li>
								))}
							</ul>
						)}
					</>
				)}
			</Panel>
		</m.div>
	);
}

function Meta({
	label,
	value,
	highlight,
}: {
	label: string;
	value: string;
	highlight?: boolean;
}) {
	return (
		<p className="col-span-2 hidden min-w-0 lg:col-span-1 lg:block">
			<span className="block text-[13px] text-muted-foreground">{label}</span>
			<span
				className={cn(
					"block truncate text-[14px]",
					highlight && "font-semibold text-chapter-violet dark:text-primary",
				)}
			>
				{value}
			</span>
		</p>
	);
}
