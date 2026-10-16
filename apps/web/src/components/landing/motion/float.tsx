"use client";

import { m } from "motion/react";

/** Slow, barely-there vertical drift to keep a static mockup feeling alive. */
export function Float({
	children,
	className,
	distance = 6,
	duration = 6,
}: {
	children: React.ReactNode;
	className?: string;
	distance?: number;
	duration?: number;
}) {
	return (
		<m.div
			className={className}
			animate={{ y: [0, -distance, 0] }}
			transition={{
				duration,
				ease: "easeInOut",
				repeat: Number.POSITIVE_INFINITY,
			}}
		>
			{children}
		</m.div>
	);
}
