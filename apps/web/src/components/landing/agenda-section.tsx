"use client";

import { cn } from "@helsa/ui/lib/utils";
import { AnimatePresence, m, type Variants } from "motion/react";
import { useEffect, useRef } from "react";

import { Chapter, ChapterInner } from "./chapter";
import { chapters, statusLabels, week } from "./content";
import { CtaLink } from "./cta-link";
import {
	AutoProgress,
	AutoplayToggle,
	useAutoAdvance,
} from "./motion/auto-advance";
import { EASE_OUT, Reveal, RevealGroup, RevealItem } from "./motion/reveal";
import { SplitWords } from "./motion/scroll";

const statusTone = {
	confirmed: "bg-emerald-700 text-white",
	reminded: "bg-background text-foreground",
	moved: "bg-foreground text-background",
} as const;

/* A day's sessions arrive one after another, then each status lands. */
const dayList: Variants = {
	hidden: {},
	show: { transition: { staggerChildren: 0.08 } },
	exit: { opacity: 0, x: -24, transition: { duration: 0.2, ease: EASE_OUT } },
};

const sessionRow: Variants = {
	hidden: { opacity: 0, x: 40 },
	show: {
		opacity: 1,
		x: 0,
		transition: { type: "spring", stiffness: 160, damping: 22 },
	},
};

const statusPop: Variants = {
	hidden: { opacity: 0, scale: 0.6 },
	show: {
		opacity: 1,
		scale: 1,
		transition: { type: "spring", stiffness: 380, damping: 18, delay: 0.25 },
	},
};

export function AgendaSection() {
	const chapter = chapters.agenda;
	const auto = useAutoAdvance(week.length, 4000);
	const selected = auto.index;
	const day = week[selected];
	const tabsRef = useRef<HTMLDivElement>(null);

	// On phones the days scroll sideways: keep the current one in view.
	useEffect(() => {
		const list = tabsRef.current;
		const tab = list?.querySelector<HTMLElement>(`#dia-${selected}`);
		if (!list || !tab || list.scrollWidth <= list.clientWidth) return;
		const offset =
			tab.getBoundingClientRect().left - list.getBoundingClientRect().left;
		list.scrollTo({ left: list.scrollLeft + offset - 4, behavior: "smooth" });
	}, [selected]);

	return (
		<Chapter
			id="agenda"
			aria-labelledby="agenda-title"
			className={cn("mt-3 py-16 lg:py-24", chapter.field, chapter.ink)}
			{...auto.holdProps}
		>
			<ChapterInner>
				<RevealGroup className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
					<RevealItem>
						<h2
							id="agenda-title"
							className="font-display font-medium text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.98] tracking-[-0.035em]"
						>
							<span className="block text-foreground/55">
								<SplitWords text="Tu semana," />
							</span>
							<span className="block">
								<SplitWords text="confirmada sola." startIndex={2} />
							</span>
						</h2>
					</RevealItem>
					<RevealItem className="flex flex-col gap-3 sm:items-end">
						<CtaLink href="#lista" className="w-full sm:w-auto">
							Quiero mi link de reservas
						</CtaLink>
						{auto.canAutoplay ? (
							<AutoplayToggle
								paused={auto.paused}
								onToggle={auto.togglePaused}
								label="la semana"
								className="self-start sm:self-end"
							/>
						) : null}
					</RevealItem>
				</RevealGroup>

				<Reveal className="mt-12 grid gap-4 lg:mt-14 lg:grid-cols-[10rem_1fr] lg:gap-10">
					<div
						ref={tabsRef}
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
								onClick={() => auto.select(index)}
								className={cn(
									"flex min-w-[5.5rem] flex-1 flex-col items-start rounded-2xl px-4 py-3 text-left outline-none transition-[background-color,color,transform] duration-300 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] lg:h-[4.5rem] lg:flex-none lg:justify-center",
									selected === index
										? "bg-foreground text-background"
										: "bg-chapter-peach-deep hover:bg-background/60",
								)}
							>
								<span className="font-medium text-base">{entry.day}</span>
								<span className="text-[13px]">{entry.date}</span>
								<AutoProgress
									running={selected === index && auto.running}
									interval={auto.interval}
									stepKey={auto.stepKey}
									className={cn(
										"mt-1.5 w-full transition-opacity",
										selected === index && auto.canAutoplay
											? "opacity-100"
											: "opacity-0",
									)}
								/>
							</button>
						))}
					</div>

					<div
						id="agenda-dia"
						role="tabpanel"
						className="min-h-[38rem] sm:min-h-[27rem] lg:min-h-[24rem]"
						aria-labelledby={`dia-${selected}`}
					>
						<AnimatePresence mode="wait" initial={false}>
							<m.ul
								key={selected}
								variants={dayList}
								initial="hidden"
								animate="show"
								exit="exit"
								className="space-y-1"
							>
								{day.sessions.map((session, index) => (
									<m.li
										variants={sessionRow}
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
										<m.span
											variants={statusPop}
											className={cn(
												"col-start-2 w-fit rounded-full px-3.5 py-1.5 font-medium text-[13px] sm:col-start-3",
												statusTone[session.status],
											)}
										>
											{statusLabels[session.status]}
										</m.span>
									</m.li>
								))}
							</m.ul>
						</AnimatePresence>
					</div>
				</Reveal>
			</ChapterInner>
		</Chapter>
	);
}
