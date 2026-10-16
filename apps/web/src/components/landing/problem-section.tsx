import { ArrowDown } from "lucide-react";

import { Container } from "./container";
import { scatteredTools } from "./content";
import { LogoMark } from "./logo";
import { RevealGroup, RevealItem } from "./motion/reveal";
import { SectionHeading } from "./section-heading";

export function ProblemSection() {
	return (
		<section className="border-border/60 border-y py-20 lg:py-28">
			<Container className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
				<SectionHeading
					eyebrow="El día a día de hoy"
					title="Tu consulta vive repartida en cinco apps. Y en tu memoria."
					description="Agendas por WhatsApp, atiendes por Meet, escribes notas en Word o en papel y llevas los pagos en una libreta. Cada sesión deja trabajo invisible después de colgar."
				/>

				<RevealGroup
					stagger={0.25}
					className="flex flex-col items-center gap-5"
				>
					<RevealGroup
						as="ul"
						trigger="inherit"
						stagger={0.06}
						className="flex flex-wrap justify-center gap-2 lg:justify-start"
						aria-label="Herramientas que usas hoy"
					>
						{scatteredTools.map((tool) => (
							<RevealItem
								as="li"
								key={tool}
								className="rounded-lg border border-border/70 bg-muted px-3 py-1.5 text-muted-foreground text-xs line-through decoration-muted-foreground/50"
							>
								{tool}
							</RevealItem>
						))}
					</RevealGroup>

					<RevealItem>
						<ArrowDown aria-hidden="true" className="size-4 text-primary" />
					</RevealItem>

					<RevealItem className="flex w-full items-center gap-4 rounded-2xl border border-primary/20 bg-primary/[0.08] p-5">
						<LogoMark className="h-8 shrink-0" />
						<div>
							<p className="font-display font-medium text-base">
								Un solo lugar, ordenado por paciente
							</p>
							<p className="mt-0.5 text-muted-foreground text-sm">
								Cita, sesión, nota y pago quedan conectados.
							</p>
						</div>
					</RevealItem>
				</RevealGroup>
			</Container>
		</section>
	);
}
