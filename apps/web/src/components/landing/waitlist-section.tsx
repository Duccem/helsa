import { cn } from "@helsa/ui/lib/utils";

import { Chapter, ChapterInner } from "./chapter";
import { chapters } from "./content";
import { fadeIn, Reveal, RevealGroup, RevealItem } from "./motion/reveal";
import { WaitlistForm } from "./waitlist-form";

// The form is shown as the product's open dialog, so it casts the dialog's shadow.
const dialogShadow = "shadow-[0_40px_80px_-40px_oklch(0.15_0.08_288/0.6)]"; // taste-skill-ignore

export function WaitlistSection() {
	const chapter = chapters.dia;
	return (
		<Chapter
			id="lista"
			aria-labelledby="lista-title"
			className={cn(
				"mt-3 py-16 lg:min-h-[90svh] lg:py-20",
				chapter.field,
				chapter.ink,
			)}
		>
			<ChapterInner className="grid gap-12 lg:min-h-[calc(90svh-10rem)] lg:grid-cols-12 lg:gap-8">
				<RevealGroup className="flex flex-col justify-end lg:col-span-5">
					<RevealItem>
						<h2
							id="lista-title"
							className="font-display font-medium text-[clamp(3.5rem,7vw,7rem)] leading-[0.92] tracking-[-0.04em]"
						>
							Reserva tu lugar.
						</h2>
					</RevealItem>
					<RevealItem
						as="p"
						className="mt-6 max-w-[38ch] text-[17px] leading-relaxed"
					>
						Abrimos por grupos pequeños para acompañar a cada psicólogo en su
						arranque. Quienes se anoten ahora entran primero, con precio de
						fundador y voz en lo que construimos.
					</RevealItem>
				</RevealGroup>

				<Reveal
					variants={fadeIn}
					delay={0.15}
					className="self-center lg:col-span-5 lg:col-start-8"
				>
					<div
						data-ui
						className={cn(
							"rounded-[1.75rem] bg-background p-6 text-foreground sm:p-8",
							dialogShadow,
						)}
					>
						<WaitlistForm />
					</div>
				</Reveal>
			</ChapterInner>
		</Chapter>
	);
}
