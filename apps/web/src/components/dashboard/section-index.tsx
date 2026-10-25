"use client";

import { cn } from "@helsa/ui/lib/utils";
import { m } from "motion/react";
import { useEffect, useState } from "react";

export type IndexSection = { id: string; label: string };

/** Highlights the section that holds the middle of the screen. */
function useActiveSection(sections: readonly IndexSection[]) {
	const [active, setActive] = useState<string>(sections[0]?.id ?? "");
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) setActive(entry.target.id);
				}
			},
			{ rootMargin: "-45% 0px -50% 0px" },
		);
		for (const { id } of sections) {
			const element = document.getElementById(id);
			if (element) observer.observe(element);
		}
		return () => observer.disconnect();
	}, [sections]);
	return active;
}

/** The sticky list of a long page's parts, with a pill on the one in view. */
export function SectionIndex({
	label,
	sections,
	layoutId,
}: {
	label: string;
	sections: readonly IndexSection[];
	layoutId: string;
}) {
	const active = useActiveSection(sections);
	return (
		<nav aria-label={label} className="sticky top-24">
			<ul className="grid gap-1">
				{sections.map((section) => {
					const current = active === section.id;
					return (
						<li key={section.id}>
							<a
								href={`#${section.id}`}
								aria-current={current ? "location" : undefined}
								className={cn(
									"relative flex h-11 items-center rounded-full px-4 font-medium text-[15px] outline-none transition-colors duration-200 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
									current ? "text-foreground" : "text-foreground/65",
								)}
							>
								{current ? (
									<m.span
										layoutId={layoutId}
										aria-hidden="true"
										className="absolute inset-0 rounded-full bg-card"
										transition={{ type: "spring", stiffness: 420, damping: 34 }}
									/>
								) : null}
								<span className="relative">{section.label}</span>
							</a>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
