"use client";

import { CalendarOff } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/client";
import { useAddTimeOff, useRemoveTimeOff } from "@/lib/api/mutations";

import { ActionButton, ProfileSection } from "../profile/parts";
import { EASE_OUT } from "../therapist/parts";
import { Field, TextInput } from "./fields";
import { fieldErrors, type TimeOff, timeOffSchema } from "./schema";

const dayFormat = new Intl.DateTimeFormat("es", {
	day: "numeric",
	month: "short",
	timeZone: "UTC",
});
const dayYearFormat = new Intl.DateTimeFormat("es", {
	day: "numeric",
	month: "short",
	year: "numeric",
	timeZone: "UTC",
});

const asDate = (day: string) => new Date(`${day}T00:00:00Z`);

function daysBetween(from: string, to: string) {
	return (
		Math.round((asDate(to).getTime() - asDate(from).getTime()) / 86_400_000) + 1
	);
}

export function describeTimeOff(item: Pick<TimeOff, "startsOn" | "endsOn">) {
	if (item.startsOn === item.endsOn)
		return dayYearFormat.format(asDate(item.startsOn));
	return `${dayFormat.format(asDate(item.startsOn))} al ${dayYearFormat.format(asDate(item.endsOn))}`;
}

function today() {
	const now = new Date();
	return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
		.toISOString()
		.slice(0, 10);
}

const dateInput =
	"h-12 w-full rounded-full bg-dash-ground px-5 text-[15px] text-foreground tabular-nums outline-none transition-[box-shadow] focus-visible:ring-2 focus-visible:ring-ring aria-invalid:ring-2 aria-invalid:ring-destructive/50 dark:bg-input/30";

export function TimeOffSection({ initial }: { initial: TimeOff[] }) {
	const [items, setItems] = useState(initial);
	const [draft, setDraft] = useState({ startsOn: "", endsOn: "", reason: "" });
	const [errors, setErrors] = useState<Record<string, string>>({});
	const add = useAddTimeOff();
	const remove = useRemoveTimeOff();
	const min = today();

	async function submit(event: React.FormEvent) {
		event.preventDefault();
		const input = { ...draft, endsOn: draft.endsOn || draft.startsOn };
		const parsed = timeOffSchema.safeParse(input);
		if (!parsed.success) {
			setErrors(fieldErrors(parsed.error));
			return;
		}
		setErrors({});
		try {
			const { id, affected } = await add.mutateAsync(input);
			setItems((current) =>
				[
					...current,
					{
						id,
						startsOn: input.startsOn,
						endsOn: input.endsOn,
						reason: parsed.data.reason,
					},
				].sort((a, b) => a.startsOn.localeCompare(b.startsOn)),
			);
			setDraft({ startsOn: "", endsOn: "", reason: "" });
			toast.success(
				affected > 0
					? `Bloqueamos esos días. Tienes ${affected} ${affected === 1 ? "cita" : "citas"} en esas fechas; muévelas desde la agenda.`
					: "Bloqueamos esos días. Nadie podrá reservar en ellos.",
				{ duration: affected > 0 ? 8000 : 4000 },
			);
		} catch (error) {
			toast.error(
				error instanceof ApiError
					? error.message
					: "No pudimos bloquear esos días.",
			);
		}
	}

	async function unblock(id: string) {
		try {
			await remove.mutateAsync(id);
			setItems((current) => current.filter((item) => item.id !== id));
			toast.success("Esos días vuelven a estar disponibles.");
		} catch (error) {
			toast.error(
				error instanceof ApiError
					? error.message
					: "No pudimos quitar ese bloqueo.",
			);
		}
	}

	return (
		<ProfileSection
			id="ausencias"
			title="Vacaciones y días libres"
			description="Días enteros en que no atiendes, aunque estén en tu horario. Feriados, congresos, vacaciones."
		>
			<div className="grid gap-6">
				{items.length > 0 ? (
					<ul className="grid gap-2" aria-label="Días bloqueados">
						<AnimatePresence initial={false}>
							{items.map((item) => {
								const days = daysBetween(item.startsOn, item.endsOn);
								return (
									<m.li
										key={item.id}
										layout
										initial={{ opacity: 0, y: -6 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, x: 24 }}
										transition={{ duration: 0.3, ease: EASE_OUT }}
										className="flex items-center gap-4 rounded-[1.25rem] bg-chapter-peach p-3 pr-4 sm:p-4"
									>
										<span
											aria-hidden="true"
											className="grid size-11 shrink-0 place-items-center rounded-full bg-card"
										>
											<CalendarOff className="size-5" />
										</span>
										<div className="min-w-0 flex-1">
											<p className="font-semibold text-[15px]">
												{describeTimeOff(item)}
											</p>
											<p className="truncate text-[14px] text-foreground/75">
												{days} {days === 1 ? "día" : "días"}
												{item.reason ? ` · ${item.reason}` : null}
											</p>
										</div>
										<ActionButton
											size="small"
											variant="quiet"
											className="bg-card"
											onClick={() => unblock(item.id)}
											pending={remove.isPending && remove.variables === item.id}
											pendingLabel="Quitando…"
											aria-label={`Quitar el bloqueo del ${describeTimeOff(item)}`}
										>
											Quitar
										</ActionButton>
									</m.li>
								);
							})}
						</AnimatePresence>
					</ul>
				) : (
					<p className="text-[15px] text-foreground/75">
						No tienes días bloqueados por delante.
					</p>
				)}

				<form noValidate onSubmit={submit} className="grid gap-5">
					<div className="grid gap-5 sm:grid-cols-2">
						<Field
							id="off-from"
							label="Primer día libre"
							error={errors.startsOn}
						>
							<input
								id="off-from"
								type="date"
								min={min}
								value={draft.startsOn}
								onChange={(event) => {
									const startsOn = event.target.value;
									setDraft((current) => ({
										...current,
										startsOn,
										endsOn:
											current.endsOn && current.endsOn < startsOn
												? startsOn
												: current.endsOn,
									}));
								}}
								aria-invalid={Boolean(errors.startsOn) || undefined}
								className={dateInput}
							/>
						</Field>
						<Field
							id="off-to"
							label="Último día libre"
							error={errors.endsOn}
							hint="Déjalo vacío si es un solo día."
						>
							<input
								id="off-to"
								type="date"
								min={draft.startsOn || min}
								value={draft.endsOn}
								onChange={(event) =>
									setDraft((current) => ({
										...current,
										endsOn: event.target.value,
									}))
								}
								aria-invalid={Boolean(errors.endsOn) || undefined}
								className={dateInput}
							/>
						</Field>
					</div>
					<Field
						id="off-reason"
						label="Motivo (solo lo ves tú)"
						error={errors.reason}
					>
						<TextInput
							id="off-reason"
							value={draft.reason}
							onValueChange={(reason) =>
								setDraft((current) => ({ ...current, reason }))
							}
							maxLength={120}
							placeholder="Vacaciones de diciembre"
						/>
					</Field>
					<div>
						<ActionButton
							type="submit"
							pending={add.isPending}
							pendingLabel="Bloqueando…"
							disabled={!draft.startsOn}
						>
							Bloquear estos días
						</ActionButton>
					</div>
				</form>
			</div>
		</ProfileSection>
	);
}
