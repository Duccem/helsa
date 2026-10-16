import { Container } from "./container";
import { venezuelaStats } from "./content";
import { Parallax } from "./motion/parallax";
import { RevealGroup, RevealItem } from "./motion/reveal";
import { SectionHeading } from "./section-heading";

function DecorativeBars() {
	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 md:block"
		>
			<Parallax distance={50}>
				<img
					src="/images/helsa-iso-white.png"
					alt=""
					className="opacity-30 blur-xs"
				/>
			</Parallax>
		</div>
	);
}

export function VenezuelaSection() {
	return (
		<section
			id="venezuela"
			className="relative isolate scroll-mt-16 overflow-hidden bg-night py-20 text-white lg:py-28"
		>
			<DecorativeBars />

			<Container className="relative">
				<SectionHeading
					tone="dark"
					className="max-w-2xl"
					eyebrow="Hecho para Venezuela"
					title="Diseñado para cuando se va la luz, baja la señal y cambia la tasa."
					description="Las herramientas extranjeras asumen fibra óptica y tarjeta de crédito. Helsa parte de la realidad de tu consulta."
				/>

				<RevealGroup
					as="dl"
					className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
				>
					{venezuelaStats.map((stat) => (
						<RevealItem
							key={stat.value}
							className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur-sm"
						>
							<dt className="font-display font-medium text-3xl leading-tight tracking-tight">
								{stat.value}
							</dt>
							<dd className="text-[13px] text-white/60 leading-relaxed">
								{stat.description}
							</dd>
						</RevealItem>
					))}
				</RevealGroup>
			</Container>
		</section>
	);
}
