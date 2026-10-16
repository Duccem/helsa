import type { Metadata } from "next";

import { FaqSection } from "@/components/landing/faq-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HeroSection } from "@/components/landing/hero-section";
import { PrivacySection } from "@/components/landing/privacy-section";
import { ProblemSection } from "@/components/landing/problem-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteNav } from "@/components/landing/site-nav";
import { VenezuelaSection } from "@/components/landing/venezuela-section";
import { WaitlistSection } from "@/components/landing/waitlist-section";

export const metadata: Metadata = {
	title: "Helsa · Tu consulta completa, en un solo lugar",
	description:
		"Expedientes, agenda, videoconsulta y cobros en una plataforma para psicólogos y terapeutas en Venezuela, pensada para la conexión que tenemos.",
};

export default function Home() {
	return (
		<>
			<SiteNav />
			<main>
				<HeroSection />
				<ProblemSection />
				<FeaturesSection />
				<VenezuelaSection />
				<PrivacySection />
				<WaitlistSection />
				<FaqSection />
			</main>
			<SiteFooter />
		</>
	);
}
