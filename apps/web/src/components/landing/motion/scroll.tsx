"use client";

import { cn } from "@helsa/ui/lib/utils";
import {
	m,
	useReducedMotion,
	useScroll,
	useTransform,
	type Variants,
} from "motion/react";
import { useRef } from "react";

import { EASE_OUT } from "./reveal";

/** Drifts its content against the scroll; positive `speed` lags, negative leads. */
export function Parallax({
	children,
	className,
	speed = 40,
}: {
	children: React.ReactNode;
	className?: string;
	speed?: number;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const reduce = useReducedMotion();
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "end start"],
	});
	const range = reduce ? 0 : speed;
	const y = useTransform(scrollYProgress, [0, 1], [range, -range]);

	return (
		<m.div ref={ref} style={{ y }} className={className}>
			{children}
		</m.div>
	);
}

const word: Variants = {
	hidden: { y: "105%", opacity: 0 },
	show: (index: number) => ({
		y: 0,
		opacity: 1,
		transition: { duration: 0.75, ease: EASE_OUT, delay: index * 0.07 },
	}),
};

/**
 * Raises a line word by word, each word from behind its own mask.
 * Spaces stay as text, so it still reads as one sentence to assistive tech.
 */
export function SplitWords({
	text,
	className,
	onMount = false,
	startIndex = 0,
}: {
	text: string;
	className?: string;
	onMount?: boolean;
	startIndex?: number;
}) {
	const words = text.split(" ");
	return (
		<m.span
			className={cn("inline", className)}
			initial="hidden"
			{...(onMount
				? { animate: "show" }
				: { whileInView: "show", viewport: { once: true, amount: 0.6 } })}
		>
			{words.map((item, index) => (
				<span key={`${item}-${index}`}>
					<span className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom">
						<m.span
							className="inline-block"
							variants={word}
							custom={startIndex + index}
						>
							{item}
						</m.span>
					</span>
					{index < words.length - 1 ? " " : null}
				</span>
			))}
		</m.span>
	);
}
