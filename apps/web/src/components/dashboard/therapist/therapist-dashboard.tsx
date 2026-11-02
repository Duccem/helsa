"use client";

import { CalendarPlus, EyeOff, Wallet } from "lucide-react";
import { m } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { TherapistHome } from "@/lib/core/therapist/use-cases/load-therapist-home";

import { AttentionList } from "./attention-list";
import {
	clinicNow,
	dayNames,
	formatTime,
	greeting,
	monthNames,
} from "./clinic-time";
import { MoodBoard } from "./mood-board";
import { NextSession } from "./next-session";
import { itemIn, Panel, stagger, usd } from "./parts";
import { PaymentsPanel } from "./payments-panel";
import { WeekAgenda } from "./week-agenda";

/** Starts from the server's clock, then follows the real one every 30 s. */
function useNow(initialIso: string) {
	const [now, setNow] = useState(() => Date.parse(initialIso));
	useEffect(() => {
		setNow(Date.now());
		const id = window.setInterval(() => setNow(Date.now()), 30_000);
		return () => window.clearInterval(id);
	}, []);
	return now;
}

function todaySummary(home: TherapistHome, now: number) {
	const sessions = home.week.appointments.filter(
		(item) => item.day === home.today && item.status !== "cancelled",
	);
	if (sessions.length === 0) return "Hoy no tienes sesiones.";
	const left = sessions.filter(
		(item) =>
			Date.parse(item.endsAt) > now &&
			(item.status === "scheduled" || item.status === "confirmed"),
	);
	if (left.length === 0) return "Ya terminaste las sesiones de hoy.";
	const count =
		left.length === 1
			? "te queda 1 sesión"
			: `te quedan ${left.length} sesiones`;
	return `Hoy ${count}; la próxima a las ${formatTime(left[0]?.time ?? "")}.`;
}

export function TherapistDashboard({
	name,
	home,
}: {
	name: string;
	home: TherapistHome;
}) {
	const now = useNow(home.nowIso);
	const clock = clinicNow(new Date(now), home.timezone);
	const firstName = name.split(" ")[0] ?? name;
	const { stats } = home;

	const overview = [
		{
			value: String(stats.weekSessions),
			label: "sesiones esta semana",
			note: stats.weekUnconfirmed
				? `${stats.weekUnconfirmed} sin confirmar`
				: "Todas confirmadas",
		},
		{
			value: String(stats.activePatients),
			label: "pacientes activos",
			note:
				stats.newPatientsThisMonth === 1
					? "1 nuevo este mes"
					: `${stats.newPatientsThisMonth} nuevos este mes`,
		},
		{
			value: usd(stats.collectedMonthUsd),
			label: `cobrados en ${monthNames[clock.month - 1]}`,
			note: `${usd(stats.owedUsd)} por cobrar`,
		},
		{
			value: `${stats.answeredTasks} de ${stats.activeTasks}`,
			label: "tareas con respuesta esta semana",
			note:
				stats.unseenEntries === 0
					? "Todas las respuestas revisadas"
					: stats.unseenEntries === 1
						? "1 respuesta sin revisar"
						: `${stats.unseenEntries} respuestas sin revisar`,
		},
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
						{greeting(clock.minutes)}, {firstName}
					</h1>
					<p className="mt-3 text-[17px] leading-relaxed">
						{dayNames[clock.weekday]} {clock.day} de{" "}
						{monthNames[clock.month - 1]}. {todaySummary(home, now)}
					</p>
					{home.privateMode ? (
						<p className="mt-2 inline-flex items-center gap-2 text-[14px] text-muted-foreground">
							<EyeOff aria-hidden="true" className="size-4" />
							Modo privado: solo se muestran iniciales.
						</p>
					) : null}
				</div>
				<div className="flex flex-wrap gap-2">
					<Link
						href="/dashboard/schedule"
						className="inline-flex h-12 items-center gap-2 rounded-full bg-chapter-violet px-6 font-semibold text-[15px] text-white outline-none transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-0 active:scale-[0.97]"
					>
						<CalendarPlus aria-hidden="true" className="size-4" />
						Nueva cita
					</Link>
					<Link
						href="/dashboard/payments?record=1"
						className="inline-flex h-12 items-center gap-2 rounded-full bg-card px-6 font-semibold text-[15px] outline-none transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-chapter-lilac focus-visible:ring-2 focus-visible:ring-ring active:translate-y-0 active:scale-[0.97]"
					>
						<Wallet aria-hidden="true" className="size-4" />
						Registrar pago
					</Link>
				</div>
			</m.header>

			<div className="grid gap-4 xl:grid-cols-12">
				<Panel aria-label="Resumen" className="xl:col-span-12">
					<m.dl
						variants={stagger(0.06)}
						className="grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4"
					>
						{overview.map((item) => (
							<m.div
								key={item.label}
								variants={itemIn}
								className="flex flex-col"
							>
								<dt className="order-2 mt-1 text-[15px]">{item.label}</dt>
								<dd className="order-1 font-display font-medium text-[clamp(2rem,3vw,2.75rem)] tabular-nums leading-none tracking-[-0.02em]">
									{item.value}
								</dd>
								<dd className="order-3 mt-0.5 text-[14px] text-muted-foreground">
									{item.note}
								</dd>
							</m.div>
						))}
					</m.dl>
				</Panel>

				<WeekAgenda week={home.week} today={home.today} now={now} />
				<NextSession
					next={home.next}
					today={home.today}
					timezone={home.timezone}
					now={now}
				/>
				<AttentionList attention={home.attention} />
				<MoodBoard moods={home.moods} today={home.today} />
				<PaymentsPanel
					payments={home.payments}
					today={home.today}
					timezone={home.timezone}
				/>
			</div>
		</m.div>
	);
}
