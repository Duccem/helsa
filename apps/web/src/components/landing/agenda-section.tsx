"use client";

import { cn } from "@helsa/ui/lib/utils";
import { AnimatePresence, m } from "motion/react";
import { useState } from "react";

import { Chapter, ChapterInner } from "./chapter";
import { chapters, statusLabels, week } from "./content";
import { CtaLink } from "./cta-link";
import { EASE_OUT, Reveal, RevealGroup, RevealItem } from "./motion/reveal";

const statusTone = {
	confirmed: "bg-emerald-700 text-white",
	reminded: "bg-background text-foreground",
	moved: "bg-foreground text-background",
} as const;

export function AgendaSection() {
	const chapter = chapters.agenda;
	const [selected, setSelected] = useState(0);
	const day = week[selected];

	return (
		<Chapter
			id="agenda"
			aria-labelledby="agenda-title"
			className={cn("mt-3 py-16 lg:py-24", chapter.field, chapter.ink)}
		>
			<ChapterInner>
				<RevealGroup className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
					<RevealItem>
						<h2
							id="agenda-title"
							className="font-display font-medium text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.98] tracking-[-0.035em]"
						>
							<span className="block text-foreground/55">Tu semana,</span>
							<span className="block">confirmada sola.</span>
						</h2>
					</RevealItem>
					<RevealItem>
						<CtaLink href="#lista" className="w-full sm:w-auto">
							Quiero mi link de reservas
						</CtaLink>
					</RevealItem>
				</RevealGroup>

				<Reveal className="mt-12 grid gap-4 lg:mt-14 lg:grid-cols-[10rem_1fr] lg:gap-10">
					<div
						role="tablist"
						aria-label="Días de la semana"
						className="sticky top-18 z-10 -mx-1 flex gap-1.5 overflow-x-auto bg-chapter-peach px-1 py-1 lg:static lg:flex-col lg:bg-transparent"
					>
						{week.map((entry, index) => (
							<button
								key={entry.day}
								type="button"
								role="tab"
								id={`dia-${index}`}
								aria-selected={selected === index}
								aria-controls="agenda-dia"
								onClick={() => setSelected(index)}
								className={cn(
									"flex min-w-[5.5rem] flex-1 flex-col items-start rounded-2xl px-4 py-3 text-left outline-none transition-[background-color,transform] focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] lg:h-16 lg:flex-none lg:justify-center",
									selected === index
										? "bg-foreground text-background"
										: "bg-chapter-peach-deep hover:bg-background/60",
								)}
							>
								<span className="font-medium text-base">{entry.day}</span>
								<span className="text-[13px]">{entry.date}</span>
							</button>
						))}
					</div>

					<div
						id="agenda-dia"
						role="tabpanel"
						aria-labelledby={`dia-${selected}`}
					>
						<AnimatePresence mode="wait" initial={false}>
							<m.ul
								key={selected}
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.22, ease: EASE_OUT }}
								className="space-y-1"
							>
								{day.sessions.map((session, index) => (
									<li
										key={session.time}
										className={cn(
											"grid grid-cols-[4rem_1fr] items-center gap-x-4 gap-y-3 rounded-2xl px-5 py-4 sm:grid-cols-[5rem_1fr_auto] sm:py-5",
											index % 2 === 0
												? "bg-chapter-peach-deep"
												: "bg-background/55",
										)}
									>
										<span className="font-display font-medium text-xl tabular-nums">
											{session.time}
										</span>
										<span className="flex min-w-0 items-center gap-3">
											<span
												aria-hidden="true"
												className="grid size-10 shrink-0 place-items-center rounded-full bg-background font-semibold text-[13px]"
											>
												{session.initials}
											</span>
											<span className="min-w-0">
												<span className="block font-medium text-lg">
													{session.name}
												</span>
												<span className="block text-[15px] text-foreground/75">
													{session.detail}
												</span>
											</span>
										</span>
										<span
											className={cn(
												"col-start-2 w-fit rounded-full px-3.5 py-1.5 font-medium text-[13px] sm:col-start-3",
												statusTone[session.status],
											)}
										>
											{statusLabels[session.status]}
										</span>
									</li>
								))}
							</m.ul>
						</AnimatePresence>
					</div>
				</Reveal>
			</ChapterInner>
		</Chapter>
	);
}
