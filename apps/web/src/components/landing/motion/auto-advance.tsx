"use client";

import { cn } from "@helsa/ui/lib/utils";
import { Pause, Play } from "lucide-react";
import { m, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/**
 * Steps through `count` items on its own, whether or not the section is on
 * screen. It holds still while keyboard focus is inside the section, when the
 * visitor pauses it, and for anyone who prefers reduced motion. Choosing an
 * item by hand gives it a full interval before the cycle moves on.
 */
export function useAutoAdvance(count: number, interval = 4500) {
	const reduce = useReducedMotion();
	const [index, setIndex] = useState(0);
	const [paused, setPaused] = useState(false);
	const [holding, setHolding] = useState(false);
	// Bumped on every manual choice, so the interval starts over from it.
	const [restart, setRestart] = useState(0);

	const running = !paused && !holding && !reduce;

	// biome-ignore lint/correctness/useExhaustiveDependencies: `restart` is the trigger that starts the interval over after a manual choice.
	useEffect(() => {
		if (!running) return;
		const id = window.setInterval(
			() => setIndex((value) => (value + 1) % count),
			interval,
		);
		return () => window.clearInterval(id);
	}, [running, count, interval, restart]);

	/** Spread on the section root: keyboard focus inside holds the cycle. */
	const holdProps = {
		onFocus: () => setHolding(true),
		onBlur: (event: React.FocusEvent) => {
			if (!event.currentTarget.contains(event.relatedTarget)) setHolding(false);
		},
	};

	return {
		index,
		select: (next: number) => {
			setIndex(next);
			setRestart((value) => value + 1);
		},
		/** Changes on every step, automatic or manual; key progress bars on it. */
		stepKey: `${index}-${restart}`,
		running,
		paused,
		togglePaused: () => setPaused((value) => !value),
		canAutoplay: !reduce,
		holdProps,
		interval,
	};
}

/** A filled bar that runs for one interval; it restarts on each step. */
export function AutoProgress({
	running,
	interval,
	stepKey,
	className,
}: {
	running: boolean;
	interval: number;
	stepKey: string;
	className?: string;
}) {
	return (
		<span
			aria-hidden="true"
			className={cn(
				"block h-1 overflow-hidden rounded-full bg-current/15",
				className,
			)}
		>
			<m.span
				key={`${stepKey}-${running}`}
				className="block h-full origin-left rounded-full bg-current"
				initial={{ scaleX: 0 }}
				animate={{ scaleX: running ? 1 : 0 }}
				transition={{
					duration: running ? interval / 1000 : 0.2,
					ease: "linear",
				}}
			/>
		</span>
	);
}

export function AutoplayToggle({
	paused,
	onToggle,
	label,
	className,
}: {
	paused: boolean;
	onToggle: () => void;
	label: string;
	className?: string;
}) {
	const Icon = paused ? Play : Pause;
	return (
		<button
			type="button"
			onClick={onToggle}
			aria-pressed={paused}
			className={cn(
				"inline-flex h-10 items-center gap-2 rounded-full bg-foreground/8 px-4 font-medium text-[15px] outline-none transition-[background-color,transform] hover:bg-foreground/15 focus-visible:ring-2 focus-visible:ring-ring active:scale-95",
				className,
			)}
		>
			<Icon aria-hidden="true" className="size-4" />
			{paused ? `Reanudar ${label}` : `Pausar ${label}`}
		</button>
	);
}
