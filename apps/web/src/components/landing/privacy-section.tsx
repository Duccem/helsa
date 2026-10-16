import { Container } from "./container";
import { privacyPoints } from "./content";
import { RevealGroup, RevealItem } from "./motion/reveal";
import { SectionHeading } from "./section-heading";

export function PrivacySection() {
	return (
		<section id="privacidad" className="scroll-mt-16 py-20 lg:py-28">
			<Container className="grid gap-12 lg:grid-cols-2 lg:gap-16">
				<SectionHeading
					eyebrow="Privacidad y ética"
					title="Lo que se dice en sesión, se queda en sesión."
					description="El secreto profesional es la base de tu trabajo. Helsa está construido alrededor de él."
				/>

				<RevealGroup
					as="ul"
					stagger={0.1}
					className="grid gap-x-10 gap-y-8 sm:grid-cols-2"
				>
					{privacyPoints.map((point) => (
						<RevealItem
							as="li"
							key={point.title}
							className="border-border border-t pt-4"
						>
							<h3 className="font-semibold text-sm">{point.title}</h3>
							<p className="mt-2 text-[13px] text-muted-foreground leading-relaxed">
								{point.description}
							</p>
						</RevealItem>
					))}
				</RevealGroup>
			</Container>
		</section>
	);
}
