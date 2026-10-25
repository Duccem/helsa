"use client";

import { cn } from "@helsa/ui/lib/utils";
import { type HTMLMotionProps, m, type Variants } from "motion/react";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Panels rise into place one after another when the page opens. */
export const panelIn: Variants = {
	hidden: { opacity: 0, y: 24 },
	show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

export const itemIn: Variants = {
	hidden: { opacity: 0, y: 16 },
	show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

export const stagger = (gap = 0.07, delay = 0): Variants => ({
	hidden: {},
	show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

export function Panel({
	className,
	...props
}: Omit<HTMLMotionProps<"section">, "ref">) {
	return (
		<m.section
			variants={panelIn}
			className={cn("min-w-0 rounded-[1.75rem] bg-card p-5 sm:p-6", className)}
			{...props}
		/>
	);
}

export function PanelHeading({
	id,
	title,
	children,
	className,
}: {
	id: string;
	title: string;
	children?: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex flex-wrap items-center justify-between gap-3",
				className,
			)}
		>
			<h2
				id={id}
				className="font-display font-medium text-[1.375rem] leading-tight tracking-[-0.01em]"
			>
				{title}
			</h2>
			{children}
		</div>
	);
}

/** Quiet text action in a panel header. */
export function PanelLink({ className, ...props }: React.ComponentProps<"a">) {
	return (
		<a
			className={cn(
				"inline-flex h-9 items-center rounded-full px-3 font-semibold text-[14px] text-dash-link outline-none transition-colors hover:bg-chapter-lilac focus-visible:ring-2 focus-visible:ring-ring",
				className,
			)}
			{...props}
		/>
	);
}

const avatarFields = [
	"bg-chapter-lilac-deep",
	"bg-chapter-teal-deep",
	"bg-chapter-peach-deep",
] as const;

function hash(text: string) {
	let value = 0;
	for (const char of text) value = (value * 31 + char.charCodeAt(0)) >>> 0;
	return value;
}

export function PatientAvatar({
	name,
	className,
}: {
	name: string;
	className?: string;
}) {
	const letters = name
		.replace(/ y /g, " ")
		.split(/\s+/)
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
	return (
		<span
			aria-hidden="true"
			className={cn(
				"inline-flex size-10 shrink-0 items-center justify-center rounded-full font-semibold text-[14px] text-foreground",
				avatarFields[hash(name) % avatarFields.length],
				className,
			)}
		>
			{letters}
		</span>
	);
}

const usdFormat = new Intl.NumberFormat("es-VE", { maximumFractionDigits: 0 });
const vesFormat = new Intl.NumberFormat("es-VE", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

export function usd(amount: number) {
	return `$${usdFormat.format(amount)}`;
}

export function ves(amount: number) {
	return `Bs ${vesFormat.format(amount)}`;
}
