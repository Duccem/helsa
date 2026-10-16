import { cn } from "@helsa/ui/lib/utils";

import { type Appointment, todayAppointments } from "./content";
import { fadeIn, Reveal, RevealGroup, RevealItem } from "./motion/reveal";

const avatarTones: Record<Appointment["tone"], string> = {
	violet: "bg-primary/15 text-primary",
	amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
	sky: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
};

export function ScheduleCard() {
	return (
		<div className="rounded-[1.25rem] border border-border/70 bg-card p-5 shadow-[0_30px_80px_-30px_oklch(0.45_0.15_288/0.35)] sm:p-6">
			<div className="flex items-baseline justify-between">
				<p className="font-medium text-[11px] text-muted-foreground uppercase tracking-[0.14em]">
					Hoy
				</p>
				<p className="text-[11px] text-muted-foreground">4 sesiones</p>
			</div>
			<p className="mt-1 font-display font-medium text-lg">
				Jueves, 15 de octubre
			</p>

			<RevealGroup
				as="ul"
				trigger="mount"
				delay={0.55}
				stagger={0.1}
				className="mt-5 space-y-2"
			>
				{todayAppointments.map((appointment, index) => (
					<RevealItem
						as="li"
						key={appointment.time}
						className={cn(
							"flex items-center gap-3 rounded-xl px-3 py-3 sm:gap-4",
							index === 0 && "bg-primary/[0.07]",
						)}
					>
						<span className="w-11 shrink-0 font-medium text-sm tabular-nums">
							{appointment.time}
						</span>
						<span
							className={cn(
								"flex size-8 shrink-0 items-center justify-center rounded-full font-semibold text-[11px]",
								avatarTones[appointment.tone],
							)}
						>
							{appointment.initials}
						</span>
						<span className="min-w-0 flex-1">
							<span className="block truncate font-medium text-sm">
								{appointment.name}
							</span>
							<span className="block truncate text-muted-foreground text-xs">
								{appointment.detail}
							</span>
						</span>
						{appointment.confirmed && (
							<Reveal
								as="span"
								onMount
								variants={fadeIn}
								delay={1.3}
								className="hidden shrink-0 rounded-full bg-emerald-500/12 px-2.5 py-1 font-medium text-[11px] text-emerald-700 sm:inline dark:text-emerald-300"
							>
								Confirmó por WhatsApp
							</Reveal>
						)}
					</RevealItem>
				))}
			</RevealGroup>
		</div>
	);
}
