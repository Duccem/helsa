"use client";

import type { NotificationChannel } from "@helsa/db/schema/settings";
import { m } from "motion/react";

import { ProfileSection } from "../profile/parts";
import { EASE_OUT } from "../therapist/parts";
import {
	ChipGroup,
	SaveBar,
	Segmented,
	ToggleRow,
	useSectionForm,
} from "./fields";
import {
	channelLabels,
	type NotificationsInput,
	notificationEvents,
	notificationsSchema,
} from "./schema";

const channelOptions = Object.entries(channelLabels) as Array<
	[NotificationChannel, string]
>;

const timeInput =
	"h-11 w-[7.5rem] rounded-full bg-card px-4 text-[15px] text-foreground tabular-nums outline-none transition-[box-shadow] focus-visible:ring-2 focus-visible:ring-ring";

export function NotificationsSection({
	initial,
	email,
}: {
	initial: NotificationsInput;
	email: string;
}) {
	const form = useSectionForm({
		section: "notifications",
		schema: notificationsSchema,
		initial,
		success: "Guardamos tus avisos.",
	});
	const { value, update } = form;
	const reminders = value.patientReminders;

	return (
		<ProfileSection
			id="avisos"
			title="Avisos"
			description={
				<>
					Qué te contamos y por dónde. Los correos llegan a{" "}
					<span className="font-semibold text-foreground">{email}</span>.
				</>
			}
		>
			<form noValidate onSubmit={form.submit} className="grid gap-6">
				<div className="grid gap-3">
					<h3 className="font-display font-medium text-[1.25rem] leading-tight">
						Recordatorios a tus pacientes
					</h3>
					<ToggleRow
						title="Enviar recordatorios antes de cada cita"
						detail="Con un enlace para confirmar o cancelar. Es lo que más reduce las ausencias."
						checked={value.remindersEnabled}
						onCheckedChange={(remindersEnabled) => update({ remindersEnabled })}
					>
						{value.remindersEnabled ? (
							<m.div
								initial={{ opacity: 0, y: -6 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, ease: EASE_OUT }}
								className="mt-4 grid gap-4 sm:grid-cols-2"
							>
								<div className="grid content-start gap-2">
									<p className="font-medium text-[14px]">Cuándo</p>
									<ChipGroup
										label="Cuándo enviar el recordatorio"
										tone="card"
										options={[
											["h24", "24 horas antes"],
											["h2", "2 horas antes"],
										]}
										selected={(["h24", "h2"] as const).filter(
											(key) => reminders[key],
										)}
										onChange={(next) =>
											update({
												patientReminders: {
													...reminders,
													h24: next.includes("h24"),
													h2: next.includes("h2"),
												},
											})
										}
									/>
								</div>
								<div className="grid content-start gap-2">
									<p className="font-medium text-[14px]">Por dónde</p>
									<Segmented
										label="Canal del recordatorio"
										tone="card"
										options={[
											["whatsapp", "WhatsApp"],
											["email", "Correo"],
											["both", "Los dos"],
										]}
										value={reminders.channel}
										onChange={(channel) =>
											update({ patientReminders: { ...reminders, channel } })
										}
									/>
								</div>
								{!reminders.h24 && !reminders.h2 ? (
									<p className="text-[14px] text-dash-alert sm:col-span-2">
										Elige al menos un momento, o apaga los recordatorios.
									</p>
								) : null}
							</m.div>
						) : null}
					</ToggleRow>
				</div>

				<div className="grid gap-3">
					<h3 className="font-display font-medium text-[1.25rem] leading-tight">
						Avisos para ti
					</h3>
					<ul className="grid gap-2">
						{notificationEvents.map((event) => {
							const selected = value.events[event.id] ?? [];
							return (
								<li
									key={event.id}
									className="grid gap-3 rounded-[1.25rem] bg-dash-ground p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5"
								>
									<div className="min-w-0">
										<p className="font-semibold text-[15px]">{event.label}</p>
										<p className="mt-0.5 text-[14px] text-foreground/75 leading-snug">
											{selected.length === 0 ? "Apagado. " : null}
											{event.detail}
										</p>
									</div>
									<ChipGroup
										label={`Canales para ${event.label.toLowerCase()}`}
										tone="card"
										options={
											event.id === "weekly_summary"
												? channelOptions.filter(
														([channel]) => channel === "email",
													)
												: channelOptions
										}
										selected={selected}
										onChange={(next) =>
											update({ events: { ...value.events, [event.id]: next } })
										}
									/>
								</li>
							);
						})}
					</ul>
				</div>

				<ToggleRow
					title="Horas de silencio"
					detail="Sin avisos en Helsa en esas horas. Lo urgente te espera por la mañana."
					checked={value.quietHours.enabled}
					onCheckedChange={(enabled) =>
						update({ quietHours: { ...value.quietHours, enabled } })
					}
				>
					{value.quietHours.enabled ? (
						<div className="mt-4 flex flex-wrap items-center gap-2">
							<span className="text-[15px]">De</span>
							<input
								type="time"
								step={900}
								value={value.quietHours.from}
								aria-label="Silencio desde"
								onChange={(event) =>
									update({
										quietHours: {
											...value.quietHours,
											from: event.target.value,
										},
									})
								}
								className={timeInput}
							/>
							<span className="text-[15px]">a</span>
							<input
								type="time"
								step={900}
								value={value.quietHours.to}
								aria-label="Silencio hasta"
								onChange={(event) =>
									update({
										quietHours: { ...value.quietHours, to: event.target.value },
									})
								}
								className={timeInput}
							/>
						</div>
					) : null}
				</ToggleRow>

				<SaveBar
					dirty={form.dirty}
					pending={form.pending}
					onReset={form.reset}
				/>
			</form>
		</ProfileSection>
	);
}
