"use client";

import { cn } from "@helsa/ui/lib/utils";
import { m } from "motion/react";

/*
 * The shared language of Helsa's doodles. Strokes use `currentColor` (the
 * foreground ink) and fills read the `--doodle-*` tokens from `doodleTokens`,
 * so every scene follows the theme and dark mode on its own.
 */

export const paper = "var(--doodle-paper)";
export const soft = "var(--doodle-soft)";
export const accent = "var(--doodle-accent)";
export const warm = "var(--doodle-warm)";
export const leaf = "var(--doodle-leaf)";
export const dark = "var(--doodle-dark)";

/** Put this on any ancestor of a doodle. */
export const doodleTokens = cn(
	"[--doodle-paper:oklch(0.99_0.004_288)]",
	"[--doodle-accent:var(--primary)]",
	"[--doodle-soft:color-mix(in_oklch,var(--primary)_24%,var(--background))]",
	"[--doodle-warm:color-mix(in_oklch,var(--chart-3)_55%,white)]",
	"[--doodle-leaf:color-mix(in_oklch,var(--chart-2)_60%,white)]",
	"[--doodle-dark:var(--foreground)] dark:[--doodle-dark:oklch(0.17_0.02_288)]",
	"dark:[--doodle-soft:color-mix(in_oklch,var(--primary)_32%,var(--background))]",
);

export const ink = {
	stroke: "currentColor",
	strokeWidth: 3,
	strokeLinecap: "round",
	strokeLinejoin: "round",
} as const;

/** A loose line that draws itself in once the doodle is on screen. */
export function Squiggle({
	d,
	delay = 0.35,
	dashed = false,
	color = accent,
}: {
	d: string;
	delay?: number;
	dashed?: boolean;
	color?: string;
}) {
	return (
		<m.path
			d={d}
			fill="none"
			stroke={color}
			strokeWidth={3}
			strokeLinecap="round"
			strokeDasharray={dashed ? "2 12" : undefined}
			initial={{ pathLength: 0, opacity: 0 }}
			whileInView={{ pathLength: 1, opacity: 1 }}
			viewport={{ once: true, amount: 0.3 }}
			transition={{
				pathLength: { duration: 1.6, ease: "easeInOut", delay },
				opacity: { duration: 0.2, delay },
			}}
		/>
	);
}

export function Plant({
	x,
	y,
	scale = 1,
}: {
	x: number;
	y: number;
	scale?: number;
}) {
	return (
		<g transform={`translate(${x} ${y}) scale(${scale})`} {...ink}>
			<path d="M26 0 Q4 -40 14 -76 Q34 -46 26 0 Z" fill={leaf} />
			<path d="M28 0 Q48 -42 64 -54 Q58 -18 28 0 Z" fill={leaf} />
			<path d="M24 0 Q-8 -24 -16 -46 Q14 -38 24 0 Z" fill={leaf} />
			<path d="M0 0 H52 L46 46 H6 Z" fill={warm} />
		</g>
	);
}

/** A small heart, the one motif every scene can share. */
export function Heart({
	x,
	y,
	scale = 1,
}: {
	x: number;
	y: number;
	scale?: number;
}) {
	return (
		<path
			transform={`translate(${x} ${y}) scale(${scale})`}
			d="M0 -6 c-4 -6 -14 -2 -10 5 l10 10 l10 -10 c4 -7 -6 -11 -10 -5 Z"
			fill={accent}
			{...ink}
			strokeWidth={2.5}
		/>
	);
}

export function Svg({
	label,
	children,
	viewBox = "0 0 480 400",
	className,
}: {
	label: string;
	children: React.ReactNode;
	viewBox?: string;
	className?: string;
}) {
	return (
		<svg
			viewBox={viewBox}
			role="img"
			aria-label={label}
			className={cn(
				"h-auto w-full overflow-visible text-foreground",
				className,
			)}
		>
			{children}
		</svg>
	);
}
