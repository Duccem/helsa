import { cn } from "@helsa/ui/lib/utils";

import { Chapter, ChapterInner } from "./chapter";
import { faqs } from "./content";
import { Reveal, RevealGroup, RevealItem } from "./motion/reveal";
import { SplitWords } from "./motion/scroll";

export function FaqSection() {
	return (
		<Chapter id="preguntas" aria-labelledby="preguntas-title" className="mt-3">
			<div className="flex min-h-[30svh] items-end bg-chapter-lilac-deep pt-24 pb-10 lg:min-h-[40svh] lg:pb-14">
				<ChapterInner>
					<Reveal>
						<h2
							id="preguntas-title"
							className="font-display font-medium text-[clamp(2.75rem,7vw,7rem)] leading-[0.92] tracking-[-0.04em]"
						>
							<SplitWords text="Lo que nos preguntan" />
						</h2>
					</Reveal>
				</ChapterInner>
			</div>

			{faqs.map((faq, index) => (
				<div
					key={faq.question}
					className={cn(index % 2 === 0 ? "bg-chapter-lilac" : "bg-background")}
				>
					<RevealGroup className="mx-auto grid w-full max-w-7xl gap-4 px-5 py-8 sm:px-10 lg:grid-cols-12 lg:gap-8 lg:px-16 lg:py-14">
						<RevealItem className="lg:col-span-5">
							<h3 className="font-display font-medium text-[1.375rem] leading-snug tracking-[-0.015em] lg:text-[1.875rem]">
								{faq.question}
							</h3>
						</RevealItem>
						<RevealItem
							as="p"
							className="text-[17px] leading-relaxed lg:col-span-6 lg:col-start-7 lg:text-lg"
						>
							{faq.answer}
						</RevealItem>
					</RevealGroup>
				</div>
			))}
		</Chapter>
	);
}
