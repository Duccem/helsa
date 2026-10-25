"use client";

import { cn } from "@helsa/ui/lib/utils";
import { Check, Copy, MapPin, Phone, Video } from "lucide-react";
import { m } from "motion/react";
import { useEffect, useState } from "react";

import { ProfileSection } from "../profile/parts";
import { dayNames, monthNames } from "../therapist/clinic-time";
import { EASE_OUT } from "../therapist/parts";
import {
	ChipGroup,
	Field,
	SaveBar,
	Segmented,
	TextInput,
	ToggleRow,
	useSectionForm,
} from "./fields";
import {
	type BookingInput,
	bookingSchema,
	type Modality,
	minutesOf,
	modalityLabels,
	type ScheduleInput,
	type TimeOff,
	toSlug,
} from "./schema";

export const BOOKING_HOST = "helsa.app/r/";

const modalityOptions = Object.entries(modalityLabels) as Array<
	[Modality, string]
>;
const modalityIcons = {
	video: Video,
	in_person: MapPin,
	phone: Phone,
} as const;

function hourOptions(choices: number[], current: number) {
	const values = choices.includes(current)
		? choices
		: [...choices, current].sort((a, b) => a - b);
	return values.map(
		(hours) =>
			[
				hours,
				hours === 0
					? "Sin mínimo"
					: hours % 24 === 0
						? `${hours / 24} ${hours === 24 ? "día" : "días"}`
						: `${hours} h`,
			] as const,
	);
}

type ZonedNow = { iso: string; weekday: number; minutes: number };

function zonedNow(timeZone: string): ZonedNow {
	const parts = Object.fromEntries(
		new Intl.DateTimeFormat("en-US", {
			timeZone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			weekday: "short",
			hour: "2-digit",
			minute: "2-digit",
			hourCycle: "h23",
		})
			.formatToParts(new Date())
			.map((part) => [part.type, part.value]),
	);
	const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
	return {
		iso: `${parts.year}-${parts.month}-${parts.day}`,
		weekday: Math.max(0, weekdays.indexOf(parts.weekday ?? "Mon")),
		minutes: Number(parts.hour) * 60 + Number(parts.minute),
	};
}

function shiftDay(iso: string, amount: number) {
	const [year = 0, month = 1, day = 1] = iso.split("-").map(Number);
	return new Date(Date.UTC(year, month - 1, day + amount))
		.toISOString()
		.slice(0, 10);
}

const clock = (minutes: number) =>
	`${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;

/** The next days with free hours, as a patient opening the link right now would see them. */
export function upcomingSlots({
	schedule,
	timeOff,
	noticeHours,
	now,
	days = 3,
	perDay = 4,
}: {
	schedule: ScheduleInput;
	timeOff: TimeOff[];
	noticeHours: number;
	now: ZonedNow;
	days?: number;
	perDay?: number;
}) {
	const step = schedule.sessionMinutes + schedule.bufferMinutes;
	const earliest = now.minutes + noticeHours * 60;
	const result: Array<{
		iso: string;
		weekday: number;
		slots: string[];
		more: number;
	}> = [];
	for (let offset = 0; offset < 28 && result.length < days; offset++) {
		const iso = shiftDay(now.iso, offset);
		if (timeOff.some((item) => item.startsOn <= iso && iso <= item.endsOn))
			continue;
		const weekday = (now.weekday + offset) % 7;
		const starts: number[] = [];
		for (const range of schedule.ranges.filter(
			(item) => item.weekday === weekday,
		)) {
			for (
				let start = minutesOf(range.start);
				start + schedule.sessionMinutes <= minutesOf(range.end);
				start += step
			) {
				if (offset * 1440 + start >= earliest) starts.push(start);
			}
		}
		if (starts.length === 0) continue;
		starts.sort((a, b) => a - b);
		result.push({
			iso,
			weekday,
			slots: starts.slice(0, perDay).map(clock),
			more: Math.max(0, starts.length - perDay),
		});
	}
	return result;
}

function BookingPreview({
	booking,
	schedule,
	timeOff,
	displayName,
	professionalTitle,
	price,
}: {
	booking: BookingInput;
	schedule: ScheduleInput;
	timeOff: TimeOff[];
	displayName: string;
	professionalTitle: string;
	price: string | null;
}) {
	// Depends on the clock, so it only renders in the browser.
	const [now, setNow] = useState<ZonedNow | null>(null);
	useEffect(() => {
		setNow(zonedNow(schedule.timezone));
		const timer = setInterval(
			() => setNow(zonedNow(schedule.timezone)),
			60_000,
		);
		return () => clearInterval(timer);
	}, [schedule.timezone]);

	const days = now
		? upcomingSlots({
				schedule,
				timeOff,
				noticeHours: booking.noticeHours,
				now,
			})
		: [];

	return (
		<figure
			aria-label="Vista previa de tu página de reservas"
			className={cn(
				"rounded-[1.5rem] bg-chapter-teal p-5 transition-opacity duration-300 sm:p-6",
				booking.enabled ? "" : "opacity-80",
			)}
		>
			<figcaption className="font-semibold text-[14px]">
				{booking.enabled
					? "Así lo ve tu paciente ahora"
					: "Así lo verá tu paciente cuando abras las reservas"}
			</figcaption>
			<div className="mt-4 rounded-[1.25rem] bg-card p-5">
				<p className="font-display font-medium text-[1.5rem] leading-tight tracking-[-0.01em]">
					{displayName}
				</p>
				<p className="mt-1 text-[15px] text-foreground/75">
					{[professionalTitle, price].filter(Boolean).join(" · ") ||
						"Tu título y tu precio van aquí"}
				</p>
				<ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
					{booking.modalities.map((modality) => {
						const Icon = modalityIcons[modality];
						return (
							<li
								key={modality}
								className="inline-flex items-center gap-1.5 text-[14px]"
							>
								<Icon aria-hidden="true" className="size-4" />
								{modalityLabels[modality]}
							</li>
						);
					})}
				</ul>

				<div className="mt-5 grid gap-4" aria-live="polite">
					{now === null ? (
						<p className="text-[14px] text-foreground/70">
							Calculando horas libres…
						</p>
					) : days.length === 0 ? (
						<p className="text-[15px]">
							No hay horas libres en las próximas cuatro semanas. Abre franjas
							en tu horario.
						</p>
					) : (
						days.map((day, index) => {
							const [, month = 1, date = 1] = day.iso.split("-").map(Number);
							return (
								<m.div
									key={day.iso}
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										duration: 0.35,
										delay: index * 0.06,
										ease: EASE_OUT,
									}}
								>
									<p className="font-semibold text-[15px]">
										{day.iso === now.iso ? "Hoy" : dayNames[day.weekday]} {date}{" "}
										de {monthNames[month - 1]}
									</p>
									<ul className="mt-2 flex flex-wrap gap-1.5">
										{day.slots.map((slot) => (
											<li
												key={slot}
												className="inline-flex h-9 items-center rounded-full bg-chapter-lilac px-3.5 font-medium text-[14px] tabular-nums"
											>
												{slot}
											</li>
										))}
										{day.more > 0 ? (
											<li className="inline-flex h-9 items-center px-2 text-[14px] text-foreground/75">
												y {day.more} más
											</li>
										) : null}
									</ul>
								</m.div>
							);
						})
					)}
				</div>
			</div>
		</figure>
	);
}

export function BookingSection({
	initial,
	schedule,
	timeOff,
	displayName,
	professionalTitle,
	price,
}: {
	initial: BookingInput;
	schedule: ScheduleInput;
	timeOff: TimeOff[];
	displayName: string;
	professionalTitle: string;
	price: string | null;
}) {
	const form = useSectionForm({
		section: "booking",
		schema: bookingSchema,
		initial,
		success: "Guardamos tus reservas.",
	});
	const { value, update, errors } = form;
	const [copied, setCopied] = useState(false);
	const suggestion = toSlug(displayName);
	const savedSlug = initial.slug;

	async function copy() {
		try {
			await navigator.clipboard.writeText(
				`https://${BOOKING_HOST}${savedSlug}`,
			);
			setCopied(true);
			setTimeout(() => setCopied(false), 1800);
		} catch {
			setCopied(false);
		}
	}

	return (
		<ProfileSection
			id="reservas"
			title="Reservas"
			description="Tu enlace para que los pacientes elijan hora solos, y las reglas para reservar y cancelar."
		>
			<form noValidate onSubmit={form.submit} className="grid gap-6">
				<ToggleRow
					title="Recibir reservas por mi enlace"
					detail={
						value.enabled
							? "Tus pacientes pueden elegir una hora libre de tu horario."
							: "Tu enlace muestra que por ahora no hay reservas abiertas."
					}
					checked={value.enabled}
					onCheckedChange={(enabled) =>
						update({
							enabled,
							slug: enabled && !value.slug ? suggestion : value.slug,
						})
					}
				/>

				<Field
					id="booking-slug"
					label="Tu enlace"
					error={errors.slug}
					hint={
						!value.slug && suggestion ? (
							<button
								type="button"
								onClick={() => update({ slug: suggestion })}
								className="rounded-sm font-semibold text-dash-link underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
							>
								Usar {BOOKING_HOST}
								{suggestion}
							</button>
						) : (
							"Letras sin acentos, números y guiones. Si lo cambias, el enlace anterior deja de funcionar."
						)
					}
					aside={
						savedSlug ? (
							<button
								type="button"
								onClick={copy}
								className="inline-flex items-center gap-1.5 rounded-full font-semibold text-[14px] text-dash-link outline-none focus-visible:ring-2 focus-visible:ring-ring"
							>
								{copied ? (
									<Check aria-hidden="true" className="size-4" />
								) : (
									<Copy aria-hidden="true" className="size-4" />
								)}
								<span aria-live="polite">{copied ? "Copiado" : "Copiar"}</span>
							</button>
						) : undefined
					}
				>
					<div className="relative">
						<span
							aria-hidden="true"
							className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-[15px] text-foreground/70"
						>
							{BOOKING_HOST}
						</span>
						<TextInput
							id="booking-slug"
							value={value.slug}
							onValueChange={(slug) =>
								update({ slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "") })
							}
							maxLength={40}
							autoCapitalize="off"
							autoCorrect="off"
							spellCheck={false}
							invalid={Boolean(errors.slug)}
							className="pl-[6.9rem]"
						/>
					</div>
				</Field>

				<div className="grid gap-2">
					<p className="px-5 font-medium text-[15px]">Cómo atiendes</p>
					<ChipGroup
						label="Cómo atiendes"
						options={modalityOptions}
						selected={value.modalities}
						onChange={(modalities) => update({ modalities })}
					/>
					{errors.modalities ? (
						<p className="px-5 text-[14px] text-dash-alert">
							{errors.modalities}
						</p>
					) : null}
				</div>

				{value.modalities.includes("in_person") ? (
					<m.div
						initial={{ opacity: 0, y: -6 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, ease: EASE_OUT }}
					>
						<Field
							id="booking-address"
							label="Dirección del consultorio"
							error={errors.officeAddress}
							hint="Se la enviamos al paciente con la confirmación de una cita presencial."
						>
							<TextInput
								id="booking-address"
								value={value.officeAddress ?? ""}
								onValueChange={(officeAddress) => update({ officeAddress })}
								autoComplete="street-address"
								invalid={Boolean(errors.officeAddress)}
								placeholder="Torre Lumen, piso 4, consultorio 4-B, Chacao"
							/>
						</Field>
					</m.div>
				) : null}

				<div className="grid gap-5 lg:grid-cols-2">
					<div className="grid content-start gap-2">
						<p className="px-5 font-medium text-[15px]">
							Reservar con al menos
						</p>
						<Segmented
							label="Reservar con al menos"
							options={hourOptions([0, 2, 12, 24, 48], value.noticeHours)}
							value={value.noticeHours}
							onChange={(noticeHours) => update({ noticeHours })}
						/>
						<p className="px-5 text-[14px] text-foreground/70">
							de anticipación, para que nadie te agende para dentro de una hora.
						</p>
					</div>
					<div className="grid content-start gap-2">
						<p className="px-5 font-medium text-[15px]">
							Cancelar sin cargo hasta
						</p>
						<Segmented
							label="Cancelar sin cargo hasta"
							options={hourOptions([0, 12, 24, 48], value.cancellationHours)}
							value={value.cancellationHours}
							onChange={(cancellationHours) => update({ cancellationHours })}
						/>
						<p className="px-5 text-[14px] text-foreground/70">
							antes de la sesión. Después, la cita queda como cancelada tarde.
						</p>
					</div>
				</div>

				<BookingPreview
					booking={value}
					schedule={schedule}
					timeOff={timeOff}
					displayName={displayName}
					professionalTitle={professionalTitle}
					price={price}
				/>

				<SaveBar
					dirty={form.dirty}
					pending={form.pending}
					onReset={form.reset}
				/>
			</form>
		</ProfileSection>
	);
}
