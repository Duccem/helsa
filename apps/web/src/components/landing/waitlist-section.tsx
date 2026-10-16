import { Container } from "./container";
import { earlyAccessPerks } from "./content";
import { LogoMark } from "./logo";
import { fadeIn, Reveal, RevealGroup, RevealItem } from "./motion/reveal";
import { WaitlistForm } from "./waitlist-form";

export function WaitlistSection() {
	return (
		<section id="lista" className="scroll-mt-16 py-10 lg:py-16">
			<Container className="max-w-7xl px-3 sm:px-6">
				<Reveal
					variants={fadeIn}
					className="grid gap-10 rounded-[2rem] bg-primary/[0.08] px-5 py-10 sm:px-10 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-16 lg:py-16"
				>
					<RevealGroup delay={0.2}>
						<RevealItem>
							<LogoMark className="h-12" />
						</RevealItem>
						<RevealItem>
							<h2 className="mt-6 text-balance font-display font-medium text-4xl leading-[1.08] tracking-tight">
								Sé de los primeros en usar Helsa.
							</h2>
						</RevealItem>
						<RevealItem
							as="p"
							className="mt-4 max-w-md text-[15px] text-muted-foreground leading-relaxed"
						>
							Abriremos por grupos pequeños para acompañar a cada psicólogo en
							su arranque. Quienes se anoten ahora tendrán:
						</RevealItem>
						<RevealGroup
							as="ol"
							trigger="inherit"
							stagger={0.1}
							className="mt-6 space-y-3"
						>
							{earlyAccessPerks.map((perk, index) => (
								<RevealItem
									as="li"
									key={perk.title}
									className="flex items-start gap-3 text-sm"
								>
									<span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-[11px] text-white">
										{index + 1}
									</span>
									<span>
										<span className="font-semibold">{perk.title}</span>{" "}
										{perk.detail}
									</span>
								</RevealItem>
							))}
						</RevealGroup>
					</RevealGroup>

					<Reveal
						delay={0.35}
						className="rounded-[1.5rem] border border-border/70 bg-card p-6 shadow-[0_30px_80px_-30px_oklch(0.45_0.15_288/0.35)] sm:p-8"
					>
						<WaitlistForm />
					</Reveal>
				</Reveal>
			</Container>
		</section>
	);
}
