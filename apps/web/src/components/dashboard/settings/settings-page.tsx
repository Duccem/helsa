"use client";

import { m } from "motion/react";
import Link from "next/link";

import { SectionIndex } from "../section-index";
import { itemIn, panelIn, stagger, usd } from "../therapist/parts";
import { BOOKING_HOST, BookingSection } from "./booking-section";
import { NotificationsSection } from "./notifications-section";
import { PreferencesSection } from "./preferences-section";
import { PricingSection } from "./pricing-section";
import { ProfessionalSection } from "./professional-section";
import { ScheduleSection, weeklyTotals } from "./schedule-section";
import type { PreferencesInput, TherapistSettings } from "./schema";
import { TimeOffSection } from "./time-off-section";

const therapistSections = [
	{ id: "profesional", label: "Perfil profesional" },
	{ id: "horario", label: "Horario semanal" },
	{ id: "ausencias", label: "Días libres" },
	{ id: "precios", label: "Precios y pagos" },
	{ id: "reservas", label: "Reservas" },
	{ id: "avisos", label: "Avisos" },
	{ id: "preferencias", label: "Preferencias" },
] as const;

function PageHeader() {
	return (
		<m.header variants={itemIn} className="pt-2 pb-8">
			<h1 className="font-display font-medium text-[clamp(2.25rem,4vw,3.5rem)] leading-[1] tracking-[-0.03em]">
				Configuración
			</h1>
			<p className="mt-3 max-w-[64ch] text-[17px] leading-relaxed">
				Cómo trabajas, cuánto cobras y qué te avisamos. Tu correo, tu contraseña
				y tus sesiones abiertas están en{" "}
				<Link
					href="/dashboard/profile"
					className="rounded-sm font-semibold text-dash-link underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
				>
					Mi perfil
				</Link>
				.
			</p>
		</m.header>
	);
}

/** The practice at a glance: who patients see, the open week, the price, the link. */
function Summary({ settings }: { settings: TherapistSettings }) {
	const { professional, schedule, pricing, booking } = settings;
	const totals = weeklyTotals(schedule);
	const main = pricing.rates.find((rate) => rate.isActive) ?? pricing.rates[0];
	const facts = [
		{
			value: `${Math.round(totals.minutes / 60)} h`,
			label: "abiertas por semana",
			href: "#horario",
		},
		{
			value: main ? usd(main.priceUsd) : "—",
			label: main ? `${main.name.toLowerCase()}` : "sin precio",
			href: "#precios",
		},
		{
			value: booking.enabled ? "Abierto" : "Cerrado",
			label: "enlace de reservas",
			href: "#reservas",
		},
	];

	return (
		<m.section
			variants={panelIn}
			aria-label="Tu consulta"
			className="grid grid-cols-[minmax(0,1fr)] gap-8 rounded-[1.75rem] bg-chapter-lilac p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-10"
		>
			<m.div variants={stagger(0.06, 0.15)} className="min-w-0">
				<m.p
					variants={itemIn}
					className="text-balance break-words font-display font-medium text-[clamp(2rem,3.4vw,3rem)] leading-[1.05] tracking-[-0.025em]"
				>
					{professional.displayName}
				</m.p>
				<m.p variants={itemIn} className="mt-2 text-[17px]">
					{[
						professional.professionalTitle,
						professional.licenseNumber
							? `Licencia ${professional.licenseNumber}`
							: null,
					]
						.filter(Boolean)
						.join(" · ") || "Completa tu título y tu licencia abajo."}
				</m.p>
				<m.p
					variants={itemIn}
					className="mt-1 truncate text-[15px] text-foreground/75"
				>
					{booking.slug
						? `${BOOKING_HOST}${booking.slug}`
						: "Todavía no elegiste tu enlace de reservas."}
				</m.p>
			</m.div>

			<m.dl
				variants={stagger(0.06, 0.25)}
				className="grid grid-cols-3 gap-2 lg:w-[32rem]"
			>
				{facts.map((fact) => (
					<m.div
						key={fact.href}
						variants={itemIn}
						className="flex min-w-0 flex-col rounded-[1.25rem] bg-card p-4 sm:p-5"
					>
						<dt className="order-2 mt-2 text-[14px] sm:text-[15px]">
							<a
								href={fact.href}
								className="rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
							>
								{fact.label}
							</a>
						</dt>
						<dd className="order-1 truncate font-display font-medium text-[clamp(1.5rem,2.4vw,2.5rem)] tabular-nums leading-none tracking-[-0.02em]">
							{fact.value}
						</dd>
					</m.div>
				))}
			</m.dl>
		</m.section>
	);
}

export function TherapistSettingsPage({
	settings,
}: {
	settings: TherapistSettings;
}) {
	const main =
		settings.pricing.rates.find((rate) => rate.isActive) ??
		settings.pricing.rates[0];

	return (
		<m.div
			initial="hidden"
			animate="show"
			variants={stagger(0.08)}
			className="mx-auto max-w-[96rem]"
		>
			<PageHeader />
			<Summary settings={settings} />

			<div className="mt-4 grid gap-4 xl:grid-cols-[15rem_minmax(0,1fr)] xl:gap-8">
				<m.aside variants={itemIn} className="hidden xl:block">
					<SectionIndex
						label="Partes de la configuración"
						sections={therapistSections}
						layoutId="settings-index"
					/>
				</m.aside>

				<div className="grid min-w-0 gap-4">
					<ProfessionalSection
						initial={settings.professional}
						licenseVerified={settings.professional.licenseVerified}
					/>
					<ScheduleSection
						initial={settings.schedule}
						weekStartsOn={settings.preferences.weekStartsOn}
					/>
					<TimeOffSection initial={settings.timeOff} />
					<PricingSection
						initial={settings.pricing}
						vesPerUsd={settings.vesPerUsd}
						sessionMinutes={settings.schedule.sessionMinutes}
					/>
					<BookingSection
						initial={settings.booking}
						schedule={settings.schedule}
						timeOff={settings.timeOff}
						displayName={settings.professional.displayName}
						professionalTitle={settings.professional.professionalTitle ?? ""}
						price={main ? `${usd(main.priceUsd)} la sesión` : null}
					/>
					<NotificationsSection
						initial={settings.notifications}
						email={settings.email}
					/>
					<PreferencesSection initial={settings.preferences} />
				</div>
			</div>
		</m.div>
	);
}

/** Patients only have app preferences for now. */
export function PatientSettingsPage({
	preferences,
}: {
	preferences: PreferencesInput;
}) {
	return (
		<m.div
			initial="hidden"
			animate="show"
			variants={stagger(0.08)}
			className="mx-auto max-w-[72rem]"
		>
			<PageHeader />
			<PreferencesSection initial={preferences} />
		</m.div>
	);
}
