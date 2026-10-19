import { SessionDoorDoodle } from "@/components/doodles/landing-scenes";

import { Chapter, ChapterInner } from "./chapter";
import { privacyPoints } from "./content";
import { fadeIn, Reveal, RevealGroup, RevealItem } from "./motion/reveal";

export function PrivacySection() {
	return (
		<Chapter
			id="privacidad"
			aria-labelledby="privacidad-title"
			className="mt-3 bg-background py-20 lg:py-32"
		>
			<ChapterInner className="grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-8">
				<div className="lg:col-span-7">
					<Reveal>
						<h2
							id="privacidad-title"
							className="max-w-[16ch] font-display font-medium text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.98] tracking-[-0.035em]"
						>
							Lo que se dice en sesión, se queda ahí.
						</h2>
					</Reveal>
					<Reveal
						as="p"
						delay={0.1}
						className="mt-6 max-w-[44ch] text-lg leading-relaxed"
					>
						El secreto profesional es la base de tu trabajo. Helsa está
						construido alrededor de él.
					</Reveal>

					<RevealGroup
						as="ul"
						stagger={0.08}
						className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2"
					>
						{privacyPoints.map((point) => (
							<RevealItem as="li" key={point.title}>
								<h3 className="font-display font-medium text-xl">
									{point.title}
								</h3>
								<p className="mt-2 text-[17px] leading-relaxed">
									{point.description}
								</p>
							</RevealItem>
						))}
					</RevealGroup>
				</div>

				<Reveal
					variants={fadeIn}
					className="mx-auto w-full max-w-[28rem] lg:col-span-5"
				>
					<SessionDoorDoodle />
				</Reveal>
			</ChapterInner>
		</Chapter>
	);
}
