"use client";

import { m, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

/** Drifts its content vertically as the element crosses the viewport. */
export function Parallax({
	children,
	className,
	distance = 60,
}: {
	children: React.ReactNode;
	className?: string;
	distance?: number;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const reduceMotion = useReducedMotion();
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "end start"],
	});
	const range = reduceMotion ? 0 : distance;
	const y = useTransform(scrollYProgress, [0, 1], [range, -range]);

	return (
		<div ref={ref} className={className}>
			<m.div style={{ y }}>{children}</m.div>
		</div>
	);
}
