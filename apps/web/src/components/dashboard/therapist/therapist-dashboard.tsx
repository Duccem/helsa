"use client";

import { CalendarPlus, Wallet } from "lucide-react";
import { m } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AttentionList } from "./attention-list";
import {
	clinicNow,
	dayNames,
	formatTime,
	greeting,
	monthNames,
	toMinutes,
} from "./clinic-time";
import {
	findUpcoming,
	monthByMethod,
	pendingPayments,
	practiceStats,
	weekStats,
	weekTemplate,
} from "./mock-data";
import { MoodBoard } from "./mood-board";
import { NextSession } from "./next-session";
import { itemIn, Panel, stagger, usd } from "./parts";
import { PaymentsPanel } from "./payments-panel";
import { WeekAgenda } from "./week-agenda";

/** Starts from the server's clock, then follows the real one every 30 s. */
function useNow(initialIso: string) {
	const [now, setNow] = useState(() => new Date(initialIso));
	useEffect(() => {
		setNow(new Date());
		const id = window.setInterval(() => setNow(new Date()), 30_000);
		return () => window.clearInterval(id);
	}, []);
	return now;
}

function todaySummary(weekday: number, minutes: number) {
	const sessions = weekTemplate[weekday] ?? [];
	if (sessions.length === 0) return "Hoy no tienes sesiones.";
	const left = sessions.filter(
		(session) => toMinutes(session.time) + session.minutes > minutes,
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
	nowIso,
}: {
	name: string;
	nowIso: string;
}) {
	const date = useNow(nowIso);
	const now = clinicNow(date);
	const firstName = name.split(" ")[0] ?? name;
	const upcoming = findUpcoming(now);
	const week = weekStats(now);
	const collected = monthByMethod.reduce((sum, entry) => sum + entry.usd, 0);
	const owed = pendingPayments.reduce((sum, entry) => sum + entry.usd, 0);

	const overview = [
		{
			value: String(week.total),
			label: "sesiones esta semana",
			note: week.unconfirmed
				? `${week.unconfirmed} sin confirmar`
				: "Todas confirmadas",
		},
		{
			value: String(practiceStats.activePatients),
			label: "pacientes activos",
			note: `${practiceStats.newThisMonth} nuevos este mes`,
		},
		{
			value: usd(collected),
			label: `cobrados en ${monthNames[now.month - 1]}`,
			note: `${usd(owed)} por cobrar`,
		},
		{
			value: `${practiceStats.tasksAnswered} de ${practiceStats.tasksAssigned}`,
			label: "tareas respondidas",
			note: "3 respuestas sin revisar",
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
						{greeting(now.minutes)}, {firstName}
					</h1>
					<p className="mt-3 text-[17px] leading-relaxed">
						{dayNames[now.weekday]} {now.day} de {monthNames[now.month - 1]}.{" "}
						{todaySummary(now.weekday, now.minutes)}
					</p>
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
						href="/dashboard/payments"
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

				<WeekAgenda now={now} />
				<NextSession upcoming={upcoming} />
				<AttentionList />
				<MoodBoard now={now} />
				<PaymentsPanel now={now} />
			</div>

			<p className="mt-6 px-1 text-[14px] text-foreground/75">
				Datos de ejemplo. Aún no están conectados a tu consulta.
			</p>
		</m.div>
	);
}
