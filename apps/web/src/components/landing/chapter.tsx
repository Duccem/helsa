"use client";

import { cn } from "@helsa/ui/lib/utils";
import {
	type HTMLMotionProps,
	m,
	useReducedMotion,
	useScroll,
	useTransform,
} from "motion/react";
import { useCallback, useRef } from "react";

type ChapterProps = HTMLMotionProps<"section"> & {
	/** Skip the scroll-in, for a chapter that is already on the first screen. */
	still?: boolean;
	ref?: React.Ref<HTMLElement>;
};

/**
 * One chapter of the page: a flat colour field, inset from the window edge
 * with the same 12px gutter and corner as the auth panel. As it scrolls in,
 * it grows from a card into the full field.
 */
export function Chapter({
	className,
	still = false,
	ref,
	style,
	...props
}: ChapterProps) {
	const local = useRef<HTMLElement>(null);
	const reduce = useReducedMotion();
	const { scrollYProgress } = useScroll({
		target: local,
		offset: ["start end", "start 0.55"],
	});
	const flat = still || reduce;
	const scale = useTransform(
		scrollYProgress,
		[0, 1],
		flat ? [1, 1] : [0.94, 1],
	);
	const y = useTransform(scrollYProgress, [0, 1], flat ? [0, 0] : [72, 0]);

	const setRefs = useCallback(
		(node: HTMLElement | null) => {
			local.current = node;
			if (typeof ref === "function") ref(node);
			else if (ref) ref.current = node;
		},
		[ref],
	);

	return (
		<m.section
			ref={setRefs}
			style={{ scale, y, transformOrigin: "50% 0%", ...style }}
			className={cn(
				"relative mx-2 scroll-mt-20 overflow-hidden rounded-[2rem] sm:mx-3",
				className,
			)}
			{...props}
		/>
	);
}

/** The content column every chapter shares, so headings start on one edge. */
export function ChapterInner({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"mx-auto w-full max-w-7xl px-5 sm:px-10 lg:px-16",
				className,
			)}
			{...props}
		/>
	);
}
