"use client";

import { cn } from "@helsa/ui/lib/utils";
import { ArrowLeft, Pencil } from "lucide-react";
import { m } from "motion/react";
import Link from "next/link";
import { useState } from "react";

import type { PatientProfile } from "@/lib/core/patient/use-cases/load-patient-profile";

import { itemIn, PatientAvatar, stagger } from "../therapist/parts";
import { FilesTab } from "./files-tab";
import { HistoryTab } from "./history-tab";
import { NotesTab } from "./notes-tab";
import { StatusBadge } from "./parts";
import { genderLabels } from "./schema";
import { SummaryTab } from "./summary-tab";
import { TasksTab } from "./tasks-tab";

export const profileTabs = [
	"resumen",
	"notas",
	"tareas",
	"archivos",
	"historial",
] as const;
export type ProfileTab = (typeof profileTabs)[number];

export function PatientProfileView({
	profile,
	initialTab,
}: {
	profile: PatientProfile;
	initialTab: ProfileTab;
}) {
	const { patient } = profile;
	const [tab, setTab] = useState<ProfileTab>(initialTab);

	const unseen = profile.tasks.reduce(
		(sum, task) => sum + task.entries.filter((entry) => !entry.seen).length,
		0,
	);
	const tabs: Array<{
		id: ProfileTab;
		label: string;
		count?: number;
		dot?: boolean;
	}> = [
		{ id: "resumen", label: "Resumen" },
		{ id: "notas", label: "Notas", count: profile.notes.length },
		{
			id: "tareas",
			label: "Tareas",
			count: profile.stats.openTasks,
			dot: unseen > 0,
		},
		{ id: "archivos", label: "Archivos", count: profile.files.length },
		{ id: "historial", label: "Citas y pagos" },
	];

	function select(next: ProfileTab) {
		setTab(next);
		// Keeps the tab in the URL so a refresh or a shared link opens the same place.
		const url = new URL(window.location.href);
		url.searchParams.set("tab", next);
		window.history.replaceState(null, "", url);
	}

	const facts = [
		patient.age !== null ? `${patient.age} años` : null,
		patient.gender ? (genderLabels[patient.gender] ?? patient.gender) : null,
		patient.city,
		patient.phone,
		patient.email,
	].filter(Boolean);

	return (
		<m.div
			initial="hidden"
			animate="show"
			variants={stagger(0.08)}
			className="mx-auto max-w-[96rem]"
		>
			<m.header variants={itemIn} className="pt-2 pb-6">
				<Link
					href="/dashboard/patients"
					className="-ml-3 inline-flex h-9 items-center gap-1.5 rounded-full px-3 font-semibold text-[14px] text-dash-link outline-none transition-colors hover:bg-chapter-lilac focus-visible:ring-2 focus-visible:ring-ring"
				>
					<ArrowLeft aria-hidden="true" className="size-4" />
					Pacientes
				</Link>
				<div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
					<div className="flex min-w-0 items-center gap-4">
						<PatientAvatar
							name={patient.name}
							className="size-16 text-[20px]"
						/>
						<div className="min-w-0">
							<div className="flex flex-wrap items-center gap-3">
								<h1 className="font-display font-medium text-[clamp(2rem,3.5vw,3rem)] leading-[1.05] tracking-[-0.03em]">
									{patient.name}
								</h1>
								<StatusBadge status={patient.status} />
							</div>
							<p className="mt-2 text-[15px] text-muted-foreground">
								{patient.preferredName
									? `Prefiere «${patient.preferredName}» · `
									: ""}
								{facts.join(" · ") || "Sin datos de contacto"}
							</p>
						</div>
					</div>
					<Link
						href={`/dashboard/patients/${patient.id}/edit`}
						className="inline-flex h-12 items-center gap-2 self-start rounded-full bg-card px-6 font-semibold text-[15px] outline-none transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-chapter-lilac focus-visible:ring-2 focus-visible:ring-ring active:translate-y-0 active:scale-[0.97] lg:self-auto"
					>
						<Pencil aria-hidden="true" className="size-4" />
						Editar datos
					</Link>
				</div>
			</m.header>

			<m.div
				variants={itemIn}
				role="tablist"
				aria-label="Secciones del paciente"
				className="-mx-4 mb-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
			>
				{tabs.map((item) => {
					const active = item.id === tab;
					return (
						<button
							key={item.id}
							type="button"
							role="tab"
							id={`tab-${item.id}`}
							aria-selected={active}
							aria-controls={`panel-${item.id}`}
							onClick={() => select(item.id)}
							className={cn(
								"relative inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-5 font-semibold text-[15px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
								active
									? "text-white"
									: "text-foreground/75 hover:bg-card hover:text-foreground",
							)}
						>
							{active ? (
								<m.span
									layoutId="patient-tab"
									aria-hidden="true"
									transition={{ type: "spring", stiffness: 420, damping: 34 }}
									className="absolute inset-0 rounded-full bg-chapter-violet"
								/>
							) : null}
							<span className="relative">{item.label}</span>
							{item.count ? (
								<span
									className={cn(
										"relative text-[13px] tabular-nums",
										active ? "text-white/80" : "text-muted-foreground",
									)}
								>
									{item.count}
								</span>
							) : null}
							{item.dot ? (
								<span
									className="relative size-2 rounded-full bg-chapter-peach-deep"
									title="Respuestas nuevas"
								>
									<span className="sr-only">, respuestas nuevas</span>
								</span>
							) : null}
						</button>
					);
				})}
			</m.div>

			<div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
				{tab === "resumen" ? (
					<SummaryTab profile={profile} onOpen={select} />
				) : null}
				{tab === "notas" ? <NotesTab profile={profile} /> : null}
				{tab === "tareas" ? <TasksTab profile={profile} /> : null}
				{tab === "archivos" ? <FilesTab profile={profile} /> : null}
				{tab === "historial" ? <HistoryTab profile={profile} /> : null}
			</div>
		</m.div>
	);
}
