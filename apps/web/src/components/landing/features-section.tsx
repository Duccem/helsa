import { Container } from "./container";
import { features } from "./content";
import { FeatureCard } from "./feature-card";
import { Reveal, RevealGroup, RevealItem } from "./motion/reveal";
import { PatientPortalCard } from "./patient-portal-card";
import { SectionHeading } from "./section-heading";

export function FeaturesSection() {
	return (
		<section id="incluye" className="scroll-mt-16 bg-muted/50 py-20 lg:py-28">
			<Container>
				<SectionHeading
					eyebrow="Qué incluye"
					title="Todo lo que necesita tu consulta privada, sin lo que no."
				/>

				<RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{features.map((feature) => (
						<RevealItem
							key={feature.title}
							whileHover={{ y: -4 }}
							transition={{ type: "spring", stiffness: 320, damping: 24 }}
						>
							<FeatureCard {...feature} />
						</RevealItem>
					))}
				</RevealGroup>

				<Reveal className="mt-6">
					<PatientPortalCard />
				</Reveal>
			</Container>
		</section>
	);
}
