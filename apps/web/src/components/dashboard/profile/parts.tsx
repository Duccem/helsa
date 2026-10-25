"use client";

import { cn } from "@helsa/ui/lib/utils";
import { Loader2 } from "lucide-react";

import { Panel } from "../therapist/parts";

/**
 * One part of the profile: what it is on the left, the controls on the right.
 * Stacks on narrow screens.
 */
export function ProfileSection({
	id,
	title,
	description,
	className,
	children,
}: {
	id: string;
	title: string;
	description: React.ReactNode;
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<Panel
			id={id}
			aria-labelledby={`${id}-title`}
			className={cn(
				"grid scroll-mt-24 grid-cols-[minmax(0,1fr)] gap-6 sm:p-8 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-12",
				className,
			)}
		>
			<div>
				<h2
					id={`${id}-title`}
					className="font-display font-medium text-[1.5rem] leading-tight tracking-[-0.01em]"
				>
					{title}
				</h2>
				<p className="mt-2 text-[15px] text-foreground/75 leading-relaxed">
					{description}
				</p>
			</div>
			<div className="min-w-0">{children}</div>
		</Panel>
	);
}

const variants = {
	primary:
		"bg-chapter-violet text-white hover:-translate-y-0.5 active:translate-y-0",
	quiet: "bg-dash-ground text-foreground hover:bg-chapter-lilac",
	danger:
		"bg-[color-mix(in_oklch,var(--destructive),black_22%)] text-white hover:-translate-y-0.5 active:translate-y-0",
} as const;

const sizes = {
	default: "h-12 px-6 text-[15px]",
	small: "h-10 px-4 text-[14px]",
} as const;

export function ActionButton({
	variant = "primary",
	size = "default",
	pending = false,
	pendingLabel,
	className,
	children,
	disabled,
	...props
}: React.ComponentProps<"button"> & {
	variant?: keyof typeof variants;
	size?: keyof typeof sizes;
	pending?: boolean;
	pendingLabel?: string;
}) {
	return (
		<button
			type="button"
			disabled={pending || disabled}
			aria-busy={pending || undefined}
			className={cn(
				"inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold outline-none transition-[background-color,transform,opacity] duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-[0.97] disabled:pointer-events-none disabled:opacity-55",
				variants[variant],
				sizes[size],
				className,
			)}
			{...props}
		>
			{pending ? (
				<>
					<Loader2 aria-hidden="true" className="size-4 animate-spin" />
					{pendingLabel ?? children}
				</>
			) : (
				children
			)}
		</button>
	);
}

const relative = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
const steps: Array<[Intl.RelativeTimeFormatUnit, number]> = [
	["year", 60 * 60 * 24 * 365],
	["month", 60 * 60 * 24 * 30],
	["week", 60 * 60 * 24 * 7],
	["day", 60 * 60 * 24],
	["hour", 60 * 60],
	["minute", 60],
];

export function timeAgo(iso: string, now = Date.now()) {
	const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
	for (const [unit, size] of steps) {
		if (Math.abs(seconds) >= size) {
			return relative.format(Math.round(seconds / size), unit);
		}
	}
	return "ahora mismo";
}

const shortDate = new Intl.DateTimeFormat("es", {
	day: "numeric",
	month: "short",
	year: "numeric",
});

export function formatShortDate(iso: string) {
	return shortDate.format(new Date(iso));
}
