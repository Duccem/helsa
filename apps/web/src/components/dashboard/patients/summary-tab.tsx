"use client";

import { Lock, NotebookPen } from "lucide-react";

import type { PatientProfile } from "@/lib/core/patient/use-cases/load-patient-profile";

import { countries } from "../settings/schema";
import { Panel, PanelHeading } from "../therapist/parts";
import { formatDate, formatDay, formatUsd, SetupNotice } from "./parts";
import type { ProfileTab } from "./patient-profile";
import { genderLabels } from "./schema";

function Facts({ items }: { items: Array<[string, React.ReactNode]> }) {
	return (
		<dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
			{items.map(([label, value]) => (
				<div key={label} className="min-w-0">
					<dt className="text-[13px] text-muted-foreground">{label}</dt>
					<dd className="mt-0.5 break-words text-[15px]">
						{value || <span className="text-muted-foreground">—</span>}
					</dd>
				</div>
			))}
		</dl>
	);
}

export function SummaryTab({
	profile,
	onOpen,
}: {
	profile: PatientProfile;
	onOpen: (tab: ProfileTab) => void;
}) {
	const { patient, stats, timezone } = profile;
	const latestNote = profile.notes.find((note) => note.content);
	const when = (iso: string | null, empty: string) =>
		iso
			? formatDate(iso, timezone, {
					weekday: "short",
					day: "numeric",
					month: "short",
					hour: "numeric",
					minute: "2-digit",
				})
			: empty;

	const overview = [
		{ value: String(stats.sessions), label: "sesiones atendidas" },
		{
			value: when(stats.nextAppointmentAt, "Sin agendar"),
			label: "próxima cita",
		},
		{ value: when(stats.lastSessionAt, "Ninguna aún"), label: "última sesión" },
		{ value: formatUsd(stats.paidUsd), label: "pagado en total" },
	];

	return (
		<div className="grid gap-4 xl:grid-cols-12">
			<Panel aria-label="Resumen" className="xl:col-span-12">
				<dl className="grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4">
					{overview.map((item) => (
						<div key={item.label} className="flex min-w-0 flex-col">
							<dt className="order-2 mt-1 text-[15px]">{item.label}</dt>
							<dd className="order-1 truncate font-display font-medium text-[clamp(1.5rem,2.4vw,2.25rem)] tabular-nums leading-none tracking-[-0.02em]">
								{item.value}
							</dd>
						</div>
					))}
				</dl>
				{stats.noShows || stats.cancelled ? (
					<p className="mt-4 text-[14px] text-muted-foreground">
						{stats.noShows ? `${stats.noShows} inasistencias` : ""}
						{stats.noShows && stats.cancelled ? " · " : ""}
						{stats.cancelled ? `${stats.cancelled} canceladas` : ""}
					</p>
				) : null}
			</Panel>

			<Panel aria-labelledby="intake-title" className="xl:col-span-7">
				<PanelHeading id="intake-title" title="Motivo de consulta">
					<span className="inline-flex items-center gap-1.5 text-[14px] text-muted-foreground">
						<Lock aria-hidden="true" className="size-3.5" />
						Cifrado
					</span>
				</PanelHeading>
				<div className="mt-4">
					{patient.intakeLocked ? (
						<SetupNotice>
							No pudimos descifrar este texto. Revisa que
							CLINICAL_ENCRYPTION_KEY sea la misma con la que se guardó.
						</SetupNotice>
					) : patient.intakeReason ? (
						<p className="whitespace-pre-wrap text-[16px] leading-relaxed">
							{patient.intakeReason}
						</p>
					) : (
						<p className="text-[15px] text-muted-foreground">
							Aún no lo registras. Puedes agregarlo desde «Editar datos».
						</p>
					)}
				</div>

				<div className="mt-8 border-border/60 border-t pt-6">
					<div className="flex items-center justify-between gap-3">
						<h3 className="font-semibold text-[16px]">Última nota</h3>
						<button
							type="button"
							onClick={() => onOpen("notas")}
							className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 font-semibold text-[14px] text-dash-link outline-none transition-colors hover:bg-chapter-lilac focus-visible:ring-2 focus-visible:ring-ring"
						>
							<NotebookPen aria-hidden="true" className="size-4" />
							{profile.notes.length ? "Ver notas" : "Escribir nota"}
						</button>
					</div>
					{latestNote ? (
						<div className="mt-2">
							<p className="text-[14px] text-muted-foreground">
								{latestNote.title ? `${latestNote.title} · ` : ""}
								{formatDate(latestNote.createdAt, timezone)}
							</p>
							<p className="mt-1 line-clamp-4 whitespace-pre-wrap text-[15px] leading-relaxed">
								{latestNote.content}
							</p>
						</div>
					) : (
						<p className="mt-2 text-[15px] text-muted-foreground">
							Sin notas todavía.
						</p>
					)}
				</div>
			</Panel>

			<Panel aria-labelledby="data-title" className="xl:col-span-5">
				<PanelHeading id="data-title" title="Datos" />
				<Facts
					items={[
						["Nombre completo", patient.name],
						["Prefiere que le llamen", patient.preferredName],
						["Documento", patient.nationalId],
						[
							"Nacimiento",
							patient.birthDate
								? `${formatDay(patient.birthDate)}${patient.age !== null ? ` · ${patient.age} años` : ""}`
								: null,
						],
						[
							"Género",
							patient.gender
								? (genderLabels[patient.gender] ?? patient.gender)
								: null,
						],
						[
							"Residencia",
							[
								patient.city,
								countries[patient.countryCode as keyof typeof countries] ??
									patient.countryCode,
							]
								.filter(Boolean)
								.join(", "),
						],
						["Teléfono", patient.phone],
						["Correo", patient.email],
						[
							"WhatsApp",
							patient.whatsappOptIn ? "Acepta recordatorios" : "No autorizado",
						],
						["Zona horaria", patient.timezone],
						[
							"Precio por sesión",
							patient.sessionPriceUsd !== null
								? formatUsd(patient.sessionPriceUsd)
								: "Tarifa habitual",
						],
						["Paciente desde", formatDate(patient.createdAt, timezone)],
					]}
				/>

				<h3 className="mt-8 border-border/60 border-t pt-6 font-semibold text-[16px]">
					Contacto de emergencia
				</h3>
				{patient.emergencyName || patient.emergencyPhone ? (
					<Facts
						items={[
							["Nombre", patient.emergencyName],
							["Parentesco", patient.emergencyRelation],
							["Teléfono", patient.emergencyPhone],
						]}
					/>
				) : (
					<p className="mt-2 text-[15px] text-muted-foreground">
						No registrado.
					</p>
				)}
			</Panel>
		</div>
	);
}
