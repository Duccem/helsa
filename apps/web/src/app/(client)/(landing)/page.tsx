import type { Metadata } from "next";

import { doodleTokens } from "@/components/doodles/primitives";
import { AgendaSection } from "@/components/landing/agenda-section";
import { DocumentsSection } from "@/components/landing/documents-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HeroSection, IntroSection } from "@/components/landing/hero-section";
import { PrivacySection } from "@/components/landing/privacy-section";
import { SignalSection } from "@/components/landing/signal-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteNav } from "@/components/landing/site-nav";
import { WaitlistSection } from "@/components/landing/waitlist-section";
import { ENV } from "@/env.server";

export const metadata: Metadata = {
	title: "Helsa · Tu consulta, en orden",
	description:
		"Expedientes, agenda, videoconsulta y cobros en una plataforma para psicólogos y terapeutas en Venezuela, pensada para la conexión que tenemos.",
};

export default function Home() {
	return (
		<div id="top" className={doodleTokens}>
			<SiteNav launched={ENV.LAUNCH_ENABLED ?? false} />
			<main>
				<HeroSection />
				<IntroSection />
				<FeaturesSection />
				<DocumentsSection />
				<SignalSection />
				<AgendaSection />
				<PrivacySection />
				<WaitlistSection />
				<FaqSection />
			</main>
			<SiteFooter />
		</div>
	);
}
