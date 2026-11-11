"use client";

import { cn } from "@helsa/ui/lib/utils";
import { m } from "motion/react";
import { useEffect, useState } from "react";

import type { PortalTaskState } from "@/lib/core/task/use-cases/load-patient-tasks";

import { type PaymentMethod, paymentMethodLabels } from "../settings/schema";
import { monthNames } from "../therapist/clinic-time";
import { itemIn } from "../therapist/parts";

/** The video link shows up this long before the session starts. */
export const JOIN_EARLY_MINUTES = 30;

const usdFormat = new Intl.NumberFormat("es-VE", {
	minimumFractionDigits: 0,
	maximumFractionDigits: 2,
});
const vesFormat = new Intl.NumberFormat("es-VE", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

export const usd = (amount: number) => `$${usdFormat.format(amount)}`;
export const ves = (amount: number) => `Bs ${vesFormat.format(amount)}`;

/** Starts from the server's clock, then follows the real one every 30 s. */
export function useNow(initialIso: string) {
	const [now, setNow] = useState(() => Date.parse(initialIso));
	useEffect(() => {
		setNow(Date.now());
		const id = window.setInterval(() => setNow(Date.now()), 30_000);
		return () => window.clearInterval(id);
	}, []);
	return now;
}

/** "2026-11-03" → "3 nov" */
export function shortDay(day: string) {
	const [, month = 1, date = 1] = day.split("-").map(Number);
	return `${date} ${monthNames[month - 1]?.slice(0, 3)}`;
}

export function methodLabel(method: string) {
	return paymentMethodLabels[method as PaymentMethod] ?? method;
}

export const taskBadges: Record<
	PortalTaskState,
	{ label: string; className: string }
> = {
	overdue: { label: "Vencida", className: "bg-destructive/12 text-dash-alert" },
	to_answer: { label: "Por responder", className: "bg-chapter-peach" },
	answered: { label: "Al día", className: "bg-chapter-teal" },
	not_started: { label: "Próximamente", className: "bg-dash-ground" },
	closed: { label: "Terminada", className: "bg-dash-ground" },
};

export const paymentStatusBadges = {
	pending_review: { label: "En revisión", className: "bg-chapter-peach" },
	verified: { label: "Verificado", className: "bg-chapter-teal" },
	rejected: {
		label: "Rechazado",
		className: "bg-destructive/12 text-dash-alert",
	},
} as const;

export function Badge({
	className,
	children,
}: {
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<span
			className={cn(
				"inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 font-semibold text-[13px]",
				className,
			)}
		>
			{children}
		</span>
	);
}

/** Title and one line of context at the top of a portal page. */
export function PageHeader({
	title,
	description,
	children,
}: {
	title: string;
	description?: React.ReactNode;
	children?: React.ReactNode;
}) {
	return (
		<m.header
			variants={itemIn}
			className="flex flex-col gap-6 pt-2 pb-8 lg:flex-row lg:items-end lg:justify-between"
		>
			<div>
				<h1 className="font-display font-medium text-[clamp(2.25rem,4vw,3.5rem)] leading-[1] tracking-[-0.03em]">
					{title}
				</h1>
				{description ? (
					<p className="mt-3 max-w-[60ch] text-[17px] leading-relaxed">
						{description}
					</p>
				) : null}
			</div>
			{children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
		</m.header>
	);
}
