"use client";

import { cn } from "@helsa/ui/lib/utils";
import {
	Check,
	CheckCircle2,
	Clock,
	Info,
	MapPin,
	Phone,
	Video,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ApiError, apiFetch } from "@/lib/api/client";
import type { BookingConfirmation } from "@/lib/core/booking/use-cases/book-appointment";
import type { BookingPage } from "@/lib/core/booking/use-cases/load-booking-page";

import { ActionButton } from "../dashboard/profile/parts";
import { formatDuration } from "../dashboard/schedule/format";
import {
	type Modality,
	modalityLabels,
	type PaymentMethod,
	paymentMethodLabels,
} from "../dashboard/settings/schema";
import { dayShort, monthNames } from "../dashboard/therapist/clinic-time";
import type { BookingRequest } from "./schema";

export type Viewer = "anonymous" | "patient" | "owner" | "therapist";

export type BookingSelection = {
	rate?: string;
	modality?: string;
	start?: string;
	pay?: string;
};

const modalityIcons: Record<Modality, typeof Video> = {
	video: Video,
	in_person: MapPin,
	phone: Phone,
};

const usd = (amount: number) =>
	`$${new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 }).format(amount)}`;

/** "09:30" → "9:30 a. m." */
function clock(time: string) {
	const [hours = 0, minutes = 0] = time.split(":").map(Number);
	return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours < 12 ? "a. m." : "p. m."}`;
}

function parseDay(day: string) {
	const date = new Date(`${day}T00:00:00Z`);
	return {
		date: date.getUTCDate(),
		month: date.getUTCMonth(),
		/** 0 = Monday … 6 = Sunday */
		weekday: (date.getUTCDay() + 6) % 7,
	};
}

const longDays = [
	"lunes",
	"martes",
	"miércoles",
	"jueves",
	"viernes",
	"sábado",
	"domingo",
];

function longDay(day: string) {
	const { date, month, weekday } = parseDay(day);
	return `${longDays[weekday]} ${date} de ${monthNames[month]}`;
}

function shiftDay(day: string, amount: number) {
	const date = new Date(`${day}T00:00:00Z`);
	date.setUTCDate(date.getUTCDate() + amount);
	return date.toISOString().slice(0, 10);
}

/** The visitor's own clock, once we know it (it differs from the server's). */
function useLocalZone() {
	const [zone, setZone] = useState<string | null>(null);
	useEffect(() => {
		setZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
	}, []);
	return zone;
}

function localClock(iso: string, zone: string) {
	return new Intl.DateTimeFormat("es", {
		timeZone: zone,
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	}).format(new Date(iso));
}

function Step({
	number,
	title,
	hint,
	disabled,
	id,
	children,
}: {
	number: number;
	title: string;
	hint?: React.ReactNode;
	disabled?: boolean;
	id?: string;
	children: React.ReactNode;
}) {
	return (
		<section
			id={id}
			aria-labelledby={`step-${number}`}
			aria-disabled={disabled || undefined}
			className={cn(
				"scroll-mt-6 border-border/60 border-t pt-6 transition-opacity first:border-t-0 first:pt-0",
				disabled && "pointer-events-none opacity-45",
			)}
		>
			<h2
				id={`step-${number}`}
				className="flex items-center gap-3 font-semibold text-[17px]"
			>
				<span
					aria-hidden="true"
					className="inline-flex size-7 items-center justify-center rounded-full bg-chapter-lilac font-semibold text-[14px] text-chapter-violet dark:text-foreground"
				>
					{number}
				</span>
				{title}
			</h2>
			{hint ? (
				<p className="mt-1 pl-10 text-[14px] text-muted-foreground">{hint}</p>
			) : null}
			<div className="mt-4">{children}</div>
		</section>
	);
}

function Choice({
	selected,
	onSelect,
	className,
	children,
	label,
}: {
	selected: boolean;
	onSelect: () => void;
	className?: string;
	children: React.ReactNode;
	label?: string;
}) {
	return (
		<button
			type="button"
			aria-pressed={selected}
			aria-label={label}
			onClick={onSelect}
			className={cn(
				"relative rounded-2xl text-left outline-none transition-[background-color,box-shadow,transform] duration-200 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]",
				selected
					? "bg-chapter-lilac ring-2 ring-chapter-violet dark:ring-primary"
					: "bg-dash-ground hover:bg-chapter-lilac/60",
				className,
			)}
		>
			{children}
		</button>
	);
}

export function BookingFlow({
	page,
	viewer,
	initial,
}: {
	page: BookingPage;
	viewer: Viewer;
	initial: BookingSelection;
}) {
	const router = useRouter();
	const { therapist, rates, availability, today, timezone } = page;
	const localZone = useLocalZone();
	const showLocal = localZone !== null && localZone !== timezone;

	// ─── Selection ──────────────────────────────────────────────────────────
	const [rateId, setRateId] = useState(
		() =>
			rates.find((rate) => rate.id === initial.rate)?.id ??
			(rates.length === 1 ? rates[0]?.id : undefined),
	);
	const rate = rates.find((item) => item.id === rateId);
	const [modalityChoice, setModality] = useState<string | undefined>(
		initial.modality,
	);
	const modality =
		rate && rate.modalities.length === 1
			? rate.modalities[0]
			: rate?.modalities.find((item) => item === modalityChoice);

	const days = useMemo(
		() =>
			rate && modality
				? (availability[`${rate.minutes}:${modality}`] ?? [])
				: [],
		[availability, rate, modality],
	);
	const [startsAt, setStartsAt] = useState<string | undefined>(initial.start);
	const [dayChoice, setDay] = useState<string | undefined>(
		() =>
			days.find((day) =>
				day.slots.some((slot) => slot.startsAt === initial.start),
			)?.day,
	);
	const day = days.find((item) => item.day === dayChoice) ?? days[0];
	const slot = day?.slots.find((item) => item.startsAt === startsAt);

	const methods = therapist.paymentMethods as PaymentMethod[];
	const [payChoice, setPay] = useState<string | undefined>(initial.pay);
	const pay =
		methods.length === 1
			? methods[0]
			: methods.find((method) => method === payChoice);
	const needsPay = methods.length > 0;

	const [accepted, setAccepted] = useState(false);
	const [pending, setPending] = useState(false);
	const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(
		null,
	);

	const ready = Boolean(rate && modality && slot && (!needsPay || pay));

	// Coming back from sign-up with everything chosen: jump to the summary.
	useEffect(() => {
		if (window.location.hash === "#confirmar") {
			document.getElementById("confirmar")?.scrollIntoView({ block: "start" });
		}
	}, []);

	// ─── Calendar grid: whole weeks from this Monday, four weeks ahead ───────
	const bookable = new Map(days.map((item) => [item.day, item.slots.length]));
	const firstMonday = shiftDay(today, -parseDay(today).weekday);
	const grid = Array.from(
		{ length: 28 + parseDay(today).weekday },
		(_, index) => shiftDay(firstMonday, index),
	);
	while (grid.length % 7) grid.push(shiftDay(grid.at(-1) ?? today, 1));

	function selection() {
		const query = new URLSearchParams();
		if (rate) query.set("rate", rate.id);
		if (modality) query.set("modality", modality);
		if (slot) query.set("start", slot.startsAt);
		if (pay) query.set("pay", pay);
		return `/r/${therapist.slug}?${query.toString()}#confirmar`;
	}

	function goToSignUp() {
		const back = selection();
		router.push(
			`/sign-up/patient?therapist=${encodeURIComponent(therapist.slug)}&redirect=${encodeURIComponent(back)}` as Route,
		);
	}

	async function confirm() {
		if (!rate || !modality || !slot) return;
		if (viewer === "anonymous") {
			goToSignUp();
			return;
		}
		setPending(true);
		try {
			const body: BookingRequest = {
				rateId: rate.id,
				modality,
				startsAt: slot.startsAt,
				paymentMethod: needsPay ? (pay ?? null) : null,
			};
			const { booking } = await apiFetch<{ booking: BookingConfirmation }>(
				`/api/booking/${therapist.slug}`,
				{ method: "POST", body },
			);
			setConfirmation(booking);
			window.scrollTo({ top: 0, behavior: "smooth" });
		} catch (error) {
			if (error instanceof ApiError && error.status === 401) {
				goToSignUp();
				return;
			}
			toast.error(
				error instanceof ApiError
					? error.message
					: "No pudimos agendar. Intenta de nuevo.",
			);
			if (error instanceof ApiError && error.status === 409) {
				setStartsAt(undefined);
				router.refresh();
			}
		} finally {
			setPending(false);
		}
	}

	if (confirmation) {
		return <Confirmation booking={confirmation} />;
	}

	const noAvailability = Object.values(availability).every(
		(list) => list.length === 0,
	);

	return (
		<section
			aria-label="Agendar una cita"
			className="rounded-[1.75rem] bg-card p-6 sm:p-8"
		>
			{viewer === "owner" ? (
				<p className="mb-6 flex gap-2 rounded-2xl bg-chapter-peach px-4 py-3 text-[15px] leading-relaxed">
					<Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
					Así ven tus pacientes tu página. Para probar una reserva, ábrela con
					otra cuenta.
				</p>
			) : null}

			{noAvailability ? (
				<div className="rounded-2xl bg-dash-ground px-5 py-8">
					<p className="font-semibold text-[17px]">
						Por ahora no hay horarios disponibles
					</p>
					<p className="mt-2 text-[15px] text-foreground/80">
						{therapist.name} no tiene horas libres en las próximas cuatro
						semanas. Vuelve a intentarlo más adelante.
					</p>
				</div>
			) : (
				<div className="flex flex-col gap-8">
					<Step number={1} title="Elige la sesión">
						<div className="grid gap-2 sm:grid-cols-2">
							{rates.map((item) => (
								<Choice
									key={item.id}
									selected={item.id === rateId}
									onSelect={() => {
										setRateId(item.id);
										setStartsAt(undefined);
									}}
									className="p-4"
								>
									<span className="block font-semibold text-[16px]">
										{item.name}
									</span>
									<span className="mt-1 flex items-center gap-1.5 text-[14px] text-foreground/75">
										<Clock aria-hidden="true" className="size-3.5" />
										{formatDuration(item.minutes)}
										{item.priceUsd !== null ? ` · ${usd(item.priceUsd)}` : ""}
									</span>
								</Choice>
							))}
						</div>
					</Step>

					<Step number={2} title="¿Cómo prefieres la sesión?" disabled={!rate}>
						<div className="flex flex-wrap gap-2">
							{(rate?.modalities ?? []).map((item) => {
								const Icon = modalityIcons[item];
								return (
									<Choice
										key={item}
										selected={item === modality}
										onSelect={() => {
											setModality(item);
											setStartsAt(undefined);
										}}
										className="inline-flex h-12 items-center gap-2 px-5 font-semibold text-[15px]"
									>
										<Icon aria-hidden="true" className="size-4" />
										{modalityLabels[item]}
									</Choice>
								);
							})}
						</div>
						{modality === "in_person" && therapist.officeAddress ? (
							<p className="mt-3 flex items-start gap-1.5 text-[14px] text-muted-foreground">
								<MapPin
									aria-hidden="true"
									className="mt-0.5 size-3.5 shrink-0"
								/>
								{therapist.officeAddress}
							</p>
						) : null}
					</Step>

					<Step
						number={3}
						title="Elige el día y la hora"
						disabled={!modality}
						hint={
							<>
								Horas de {timezone.split("/").pop()?.replace(/_/g, " ")}
								{showLocal ? ". Debajo ves la hora donde estás." : "."}
							</>
						}
					>
						{modality && days.length === 0 ? (
							<p className="rounded-2xl bg-dash-ground px-5 py-6 text-[15px]">
								No hay horas libres para esta modalidad en las próximas semanas.
								Prueba con otra.
							</p>
						) : (
							<>
								<div className="grid grid-cols-7 gap-1 text-center">
									{dayShort.map((name) => (
										<span
											key={name}
											aria-hidden="true"
											className="pb-1 text-[13px] text-muted-foreground"
										>
											{name}
										</span>
									))}
									{grid.map((item) => {
										const count = bookable.get(item) ?? 0;
										const selected = item === day?.day;
										const { date } = parseDay(item);
										return (
											<button
												key={item}
												type="button"
												disabled={count === 0}
												aria-pressed={selected}
												aria-label={`${longDay(item)}${item === today ? ", hoy" : ""}, ${count ? `${count} ${count === 1 ? "hora libre" : "horas libres"}` : "sin horas libres"}`}
												onClick={() => {
													setDay(item);
													setStartsAt(undefined);
												}}
												className={cn(
													"flex h-12 flex-col items-center justify-center rounded-xl font-display font-medium text-[16px] tabular-nums outline-none transition-[background-color,transform] focus-visible:ring-2 focus-visible:ring-ring active:scale-95 disabled:cursor-default disabled:text-foreground/30 sm:h-14",
													selected
														? "bg-chapter-violet text-white"
														: count
															? "bg-dash-ground hover:bg-chapter-lilac"
															: "",
												)}
											>
												{date}
												{count && !selected ? (
													<span
														aria-hidden="true"
														className="mt-0.5 size-1 rounded-full bg-chapter-violet dark:bg-primary"
													/>
												) : null}
											</button>
										);
									})}
								</div>

								{day ? (
									<div className="mt-6" aria-live="polite">
										<p className="font-semibold text-[15px] first-letter:uppercase">
											{longDay(day.day)}
										</p>
										<div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
											{day.slots.map((item) => (
												<Choice
													key={item.startsAt}
													selected={item.startsAt === slot?.startsAt}
													onSelect={() => setStartsAt(item.startsAt)}
													className="flex flex-col items-center px-2 py-3"
												>
													<span className="font-semibold text-[15px] tabular-nums">
														{clock(item.time)}
													</span>
													{showLocal && localZone ? (
														<span className="text-[12px] text-muted-foreground">
															{localClock(item.startsAt, localZone)} tu hora
														</span>
													) : null}
												</Choice>
											))}
										</div>
									</div>
								) : null}
							</>
						)}
					</Step>

					{needsPay ? (
						<Step
							number={4}
							title="¿Cómo vas a pagar?"
							disabled={!slot}
							hint="El pago se coordina directamente con tu terapeuta."
						>
							<div className="flex flex-wrap gap-2">
								{methods.map((method) => (
									<Choice
										key={method}
										selected={method === pay}
										onSelect={() => setPay(method)}
										className="inline-flex h-11 items-center px-4 font-semibold text-[14px]"
									>
										{paymentMethodLabels[method] ?? method}
									</Choice>
								))}
							</div>
						</Step>
					) : null}

					<Step
						id="confirmar"
						number={needsPay ? 5 : 4}
						title="Confirma tu cita"
						disabled={!ready}
					>
						{ready && rate && modality && slot ? (
							<dl className="grid gap-3 rounded-2xl bg-dash-ground p-5 text-[15px] sm:grid-cols-2">
								<div>
									<dt className="text-[13px] text-muted-foreground">Sesión</dt>
									<dd className="font-semibold">
										{rate.name} · {formatDuration(rate.minutes)}
									</dd>
								</div>
								<div>
									<dt className="text-[13px] text-muted-foreground">Cuándo</dt>
									<dd className="font-semibold first-letter:uppercase">
										{day ? longDay(day.day) : ""}, {clock(slot.time)}
									</dd>
								</div>
								<div>
									<dt className="text-[13px] text-muted-foreground">
										Modalidad
									</dt>
									<dd className="font-semibold">{modalityLabels[modality]}</dd>
								</div>
								<div>
									<dt className="text-[13px] text-muted-foreground">Tarifa</dt>
									<dd className="font-semibold">
										{rate.priceUsd !== null ? usd(rate.priceUsd) : "A convenir"}
										{pay ? ` · ${paymentMethodLabels[pay] ?? pay}` : ""}
									</dd>
								</div>
							</dl>
						) : (
							<p className="text-[15px] text-muted-foreground">
								Completa los pasos de arriba para ver el resumen.
							</p>
						)}

						<label className="mt-4 flex cursor-pointer items-start gap-3 text-[15px] leading-relaxed">
							<input
								type="checkbox"
								checked={accepted}
								onChange={(event) => setAccepted(event.target.checked)}
								className="mt-1 size-4 shrink-0 accent-[var(--color-chapter-violet)]"
							/>
							<span>
								Entiendo que puedo cancelar o cambiar la cita hasta{" "}
								{therapist.cancellationHours} horas antes, y que mis datos los
								ve solo mi terapeuta.
							</span>
						</label>

						<div className="mt-5 flex flex-col gap-3">
							<ActionButton
								onClick={confirm}
								pending={pending}
								pendingLabel="Agendando…"
								disabled={
									!ready ||
									!accepted ||
									viewer === "owner" ||
									viewer === "therapist"
								}
								className="w-full sm:w-auto sm:self-start"
							>
								{viewer === "anonymous" ? "Continuar" : "Agendar cita"}
							</ActionButton>
							{viewer === "anonymous" ? (
								<p className="text-[14px] text-muted-foreground">
									Te pediremos crear una cuenta de paciente para guardar tu
									cita.{" "}
									<Link
										href={
											`/sign-in?redirect=${encodeURIComponent(selection())}` as Route
										}
										className="font-semibold text-dash-link underline-offset-4 hover:underline"
									>
										¿Ya tienes cuenta? Entra
									</Link>
								</p>
							) : null}
							{viewer === "therapist" ? (
								<p className="text-[14px] text-muted-foreground">
									Para agendar, entra con una cuenta de paciente.
								</p>
							) : null}
						</div>
					</Step>
				</div>
			)}
		</section>
	);
}

function Confirmation({ booking }: { booking: BookingConfirmation }) {
	const method = booking.paymentMethod as PaymentMethod | null;
	return (
		<section
			aria-labelledby="done-title"
			className="rounded-[1.75rem] bg-card p-6 sm:p-8"
		>
			<CheckCircle2 aria-hidden="true" className="size-10 text-dash-good" />
			<h2
				id="done-title"
				className="mt-4 font-display font-medium text-[clamp(1.75rem,3vw,2.25rem)] leading-tight tracking-[-0.02em]"
			>
				¡Listo! Tu cita quedó agendada
			</h2>
			<p className="mt-2 text-[16px] text-foreground/80">
				{booking.therapistName} ya la ve en su agenda.
			</p>

			<ul className="mt-6 flex flex-col gap-3 text-[16px]">
				<li className="flex gap-3">
					<Check
						aria-hidden="true"
						className="mt-1 size-4 shrink-0 text-dash-good"
					/>
					<span className="first-letter:uppercase">
						{longDay(booking.day)}, {clock(booking.time)} ·{" "}
						{formatDuration(booking.minutes)}
					</span>
				</li>
				<li className="flex gap-3">
					<Check
						aria-hidden="true"
						className="mt-1 size-4 shrink-0 text-dash-good"
					/>
					<span>
						{booking.rateName} · {modalityLabels[booking.modality as Modality]}
						{booking.location ? ` en ${booking.location}` : ""}
					</span>
				</li>
				<li className="flex gap-3">
					<Check
						aria-hidden="true"
						className="mt-1 size-4 shrink-0 text-dash-good"
					/>
					<span>
						{booking.priceUsd !== null
							? usd(booking.priceUsd)
							: "Tarifa a convenir"}
						{method ? ` · ${paymentMethodLabels[method] ?? method}` : ""}
					</span>
				</li>
			</ul>

			{booking.paymentInstructions ? (
				<div className="mt-6 rounded-2xl bg-dash-ground p-5">
					<p className="font-semibold text-[15px]">Cómo pagar</p>
					<p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed">
						{booking.paymentInstructions}
					</p>
				</div>
			) : null}

			<p className="mt-6 text-[14px] text-muted-foreground">
				Si necesitas cancelar o cambiarla, avisa al menos{" "}
				{booking.cancellationHours} horas antes.
			</p>

			<Link
				href="/dashboard"
				className="mt-6 inline-flex h-12 items-center rounded-full bg-chapter-violet px-6 font-semibold text-[15px] text-white outline-none transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			>
				Ir a mi panel
			</Link>
		</section>
	);
}
