import { Check } from "lucide-react";

import { Container } from "./container";
import { heroHighlights } from "./content";
import { CtaLink } from "./cta-link";
import { Float } from "./motion/float";
import { fadeIn, Reveal, RevealGroup, RevealItem } from "./motion/reveal";
import { ScheduleCard } from "./schedule-card";
import { VideoCallCard } from "./video-call-card";

export function HeroSection() {
	return (
		<section className="relative isolate overflow-hidden">
			<div
				aria-hidden="true"
				className="absolute inset-0 -z-10 bg-[radial-gradient(60%_70%_at_85%_0%,color-mix(in_oklch,var(--color-primary)_14%,transparent),transparent_70%)]"
			/>

			<Container className="grid gap-16 pt-14 pb-20 sm:pt-20 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-12 lg:pt-24 lg:pb-32">
				<RevealGroup trigger="mount" stagger={0.09}>
					<RevealItem
						as="p"
						className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/70 py-1 pr-3 pl-1 text-muted-foreground text-xs"
					>
						<span className="rounded-full bg-primary/12 px-2 py-0.5 font-medium text-primary">
							Pronto
						</span>
						Para psicólogos y terapeutas en Venezuela
					</RevealItem>

					<RevealItem>
						<h1 className="mt-6 text-balance font-display font-medium text-[2.6rem] leading-[1.04] tracking-tight sm:text-5xl lg:text-[3.6rem]">
							Tu consulta completa, en un solo lugar. Tu atención,{" "}
							<span className="text-primary">en tus pacientes.</span>
						</h1>
					</RevealItem>

					<RevealItem
						as="p"
						className="mt-6 max-w-lg text-base text-muted-foreground leading-relaxed"
					>
						Expedientes, agenda, videoconsulta y cobros en una plataforma
						pensada para la conexión que tenemos. Menos tiempo persiguiendo
						citas y pagos por WhatsApp; más tiempo para lo que importa.
					</RevealItem>

					<RevealItem className="mt-8 flex flex-wrap gap-3">
						<CtaLink href="#lista">Quiero acceso anticipado</CtaLink>
						<CtaLink href="#incluye" variant="outline">
							Ver qué incluye
						</CtaLink>
					</RevealItem>

					<RevealItem
						as="ul"
						className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground text-xs"
					>
						{heroHighlights.map((item) => (
							<li key={item} className="flex items-center gap-1.5">
								<Check aria-hidden="true" className="size-3.5 text-primary" />
								{item}
							</li>
						))}
					</RevealItem>
				</RevealGroup>

				<div className="relative mx-auto w-full max-w-md pb-28 lg:mr-0 lg:pb-20">
					<Reveal onMount variants={fadeIn} delay={0.25}>
						<ScheduleCard />
					</Reveal>
					<Reveal
						onMount
						variants={fadeIn}
						delay={0.8}
						className="absolute right-0 bottom-0 w-[68%] max-w-[260px] sm:-right-6 lg:-right-10"
					>
						<Float>
							<VideoCallCard />
						</Float>
					</Reveal>
				</div>
			</Container>
		</section>
	);
}
